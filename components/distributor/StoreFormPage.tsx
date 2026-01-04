
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Store, StoreFormData, Customer } from '../../types.ts';
import LocationMarkerIcon from '../icons/LocationMarkerIcon.tsx';
import UserCircleIcon from '../icons/UserCircleIcon.tsx';
import StoreIcon from '../icons/StoreIcon.tsx';
import CameraIcon from '../icons/CameraIcon.tsx';
import MapIcon from '../icons/MapIcon.tsx';
import ClipboardDocumentListIcon from '../icons/ClipboardDocumentListIcon.tsx';
import CalendarDaysIcon from '../icons/CalendarDaysIcon.tsx';
import CurrencyDollarIcon from '../icons/CurrencyDollarIcon.tsx';
import CubeIcon from '../icons/CubeIcon.tsx';
import SpinnerIcon from '../icons/SpinnerIcon.tsx';
import EnvelopeIcon from '../icons/EnvelopeIcon.tsx';
import PhoneCallIcon from '../icons/PhoneCallIcon.tsx';
import ArrowPathIcon from '../icons/ArrowPathIcon.tsx';
import ChevronDownIcon from '../icons/ChevronDownIcon.tsx';
import TagIcon from '../icons/TagIcon.tsx';
import XMarkIcon from '../icons/XMarkIcon.tsx';
import { supabase } from '../../services/supabase.ts';
import locationService, { LocationEntry } from '../../services/locationService.ts';

// --- مساعدات الصور ---
const compressImage = (fileOrDataUrl: File | string, quality = 0.7, maxWidth = 1024): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            let { width, height } = img;
            if (width > height) {
                if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
            } else {
                if (height > maxWidth) { width *= maxWidth / height; height = maxWidth; }
            }
            canvas.width = width; canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = reject;
        if (typeof fileOrDataUrl === 'string') {
            img.src = fileOrDataUrl;
        } else {
            const reader = new FileReader();
            reader.onload = e => { img.src = e.target?.result as string; };
            reader.onerror = reject;
            reader.readAsDataURL(fileOrDataUrl);
        }
    });
};

// --- مكون الكاميرا ---
interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error("Camera error:", err);
          alert("Impossible d'accéder à la caméra.");
          onClose();
        });
    }
    return () => {
      streamRef.current?.getTracks().forEach(track => track.stop());
    };
  }, [isOpen, onClose]);

  const handleCapture = () => {
    if (videoRef.current) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext('2d')?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      onCapture(canvas.toDataURL('image/jpeg'));
    }
  };

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black z-[100] flex flex-col items-center justify-center">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover max-w-lg"></video>
      <div className="absolute bottom-10 flex gap-6 items-center">
        <button onClick={onClose} className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white">
          <XMarkIcon className="w-6 h-6" />
        </button>
        <button onClick={handleCapture} className="w-20 h-20 bg-white rounded-full border-4 border-slate-300 flex items-center justify-center shadow-2xl active:scale-95 transition-transform">
          <div className="w-16 h-16 bg-white rounded-full border-2 border-slate-900"></div>
        </button>
        <div className="w-14"></div>
      </div>
    </div>
  );
};

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const DocumentIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
  </svg>
);

interface StoreFormPageProps {
    onClose: () => void;
    onSubmit: (storeData: StoreFormData) => void;
    stores: Store[];
}

const StoreFormPage: React.FC<StoreFormPageProps> = ({ onClose, onSubmit, stores }) => {
  const [formData, setFormData] = useState<StoreFormData>({
      Magazin: '', Ville: '', GSM1: '', GSM2: '', 'Le Gérant': '', Gamme: 'Haute', 'Action Client': '', Note: '', Image: '', Région: '', Adresse: '', Phone: '', Email: '', Prix: 0, Quantité: 0, 'Rendez-Vous': ''
  });
  const [existingCustomers, setExistingCustomers] = useState<Customer[]>([]);
  const [dynamicLocations, setDynamicLocations] = useState<LocationEntry[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
      const fetchData = async () => {
          const { data: cust } = await supabase.from('customers').select('*').order('name');
          if (cust) setExistingCustomers(cust);

          const locs = await locationService.getAllLocations();
          setDynamicLocations(locs);
      };
      fetchData();
  }, []);

  const uniqueCities = useMemo(() => {
      const cities = new Set<string>();
      dynamicLocations.forEach(loc => cities.add(loc.ville));
      return Array.from(cities).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [dynamicLocations]);

  const filteredRegions = useMemo(() => {
      if (!formData.Ville) return [];
      return dynamicLocations
          .filter(loc => loc.ville.toLowerCase() === formData.Ville.toLowerCase())
          .map(loc => loc.region)
          .sort((a, b) => a.localeCompare(b, 'fr'));
  }, [formData.Ville, dynamicLocations]);

  const handleSelectCustomer = (c: Customer) => {
      setFormData({
          ...formData,
          id: c.id,
          Magazin: c.name,
          'Le Gérant': c.manager,
          Ville: c.city,
          GSM1: c.gsm1,
          GSM2: c.gsm2 || '',
          Gamme: c.gamme,
          Localisation: c.location,
          Région: c.region || '',
          Adresse: c.address || '',
          Phone: c.phone || '',
          Email: c.email || ''
      });
      setShowSuggestions(false);
      setSearchQuery(c.name);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const compressed = await compressImage(e.target.files[0]);
          setFormData(prev => ({ ...prev, Image: compressed }));
      }
  };

  const handleCapture = async (imageDataUrl: string) => {
      setIsCameraOpen(false);
      const compressed = await compressImage(imageDataUrl);
      setFormData(prev => ({ ...prev, Image: compressed }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const updateLocation = () => {
      setIsLocating(true);
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((pos) => {
              setFormData(p => ({ ...p, Localisation: `${pos.coords.latitude}, ${pos.coords.longitude}` }));
              setIsLocating(false);
          }, () => {
              alert("Impossible d'obtenir la position");
              setIsLocating(false);
          });
      }
  };

  const handleFormSubmit = async () => {
      if (!formData.Magazin || !formData.Ville) {
          alert("Le nom de l'opticien et la ville sont obligatoires.");
          return;
      }

      // --- التحقق الصارم من وجود المدينة في قاعدة البيانات (moroccan_locations) ---
      const cityExists = uniqueCities.some(c => c.toLowerCase() === formData.Ville.trim().toLowerCase());
      if (!cityExists) {
          alert("ERREUR : La ville saisie n'existe pas dans notre base de données autorisée. Veuillez sélectionner une ville dans la liste suggérée.");
          return;
      }

      // --- التحقق الصارم من وجود المنطقة/الحي (في حال إدخالها) ---
      if (formData.Région) {
          const regionExists = filteredRegions.some(r => r.toLowerCase() === formData.Région?.trim().toLowerCase());
          if (!regionExists) {
              alert("ERREUR : La région saisie n'est pas reconnue pour cette ville dans notre base de données. Veuillez choisir une option dans la liste.");
              return;
          }
      }

      setIsSubmitting(true);
      try {
          await onSubmit(formData);
      } finally {
          setIsSubmitting(false);
      }
  };

  const SectionHeader = ({ icon: Icon, title }: { icon: any, title: string }) => (
      <div className="flex items-center gap-2.5 text-[#4407EB] font-bold text-[13px] uppercase tracking-wider mb-6">
          <Icon className="w-5 h-5" />
          <span>{title}</span>
      </div>
  );

  return (
    <div className="bg-[#F7F8FA] dark:bg-slate-900 min-h-screen pb-10 font-sans">
        <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
        
        <header className="sticky top-0 z-50 bg-[#F7F8FA] dark:bg-slate-900 px-4 py-4 flex items-center justify-between">
            <button onClick={onClose} className="p-1 text-slate-600 dark:text-slate-300">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-[15px] font-bold text-slate-800 dark:text-white">Nouveau Lead</h1>
            <div className="w-8"></div>
        </header>

        <main className="p-4 max-w-xl mx-auto space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500 overflow-x-hidden">
            <div className="text-center py-4 space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800 mb-2">
                    <UserCircleIcon className="w-7 h-7 text-[#4407EB]" />
                </div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white">Détails du Prospect</h2>
                <p className="text-[13px] text-slate-400">Capturez les informations de votre nouveau prospect optique</p>
            </div>

            <section className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <SectionHeader icon={UserCircleIcon} title="Informations Prospect" />
                <div className="space-y-5">
                    <div className="relative">
                        <label className="text-[12px] font-bold text-slate-500 mb-2 block ml-1">Nom de l'opticien *</label>
                        <div className="relative">
                            <StoreIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input 
                                type="text" 
                                placeholder="Nom du magasin d'optique"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white font-medium placeholder:text-slate-300"
                                value={searchQuery}
                                onFocus={() => setShowSuggestions(true)}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                    setFormData(p => ({...p, Magazin: e.target.value, id: undefined}));
                                }}
                            />
                        </div>
                        {showSuggestions && searchQuery.length > 1 && (
                            <div className="absolute z-20 w-full mt-2 bg-white dark:bg-slate-800 border rounded-2xl shadow-2xl max-h-60 overflow-y-auto border-slate-100 dark:border-slate-700">
                                {existingCustomers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                                    <button key={c.id} onClick={() => handleSelectCustomer(c)} className="w-full p-4 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b last:border-0 border-slate-50 dark:border-slate-700">
                                        <div className="font-bold text-[14px] text-slate-900 dark:text-white">{c.name}</div>
                                        <div className="text-[11px] text-slate-500">{c.city} • {c.manager}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <div>
                        <label className="text-[12px] font-bold text-slate-500 mb-2 block ml-1">Nom du gérant (Optionnel)</label>
                        <div className="relative">
                            <UserCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input 
                                type="text" 
                                name="Le Gérant"
                                value={formData['Le Gérant'] || ''}
                                onChange={handleChange}
                                placeholder="Entrez le nom complet"
                                className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white font-medium placeholder:text-slate-300"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <SectionHeader icon={MapIcon} title="Localisation GPS" />
                <div className="space-y-4">
                    <div className={`p-4 rounded-xl border flex items-center gap-3 transition-colors ${formData.Localisation ? 'bg-green-50 border-green-100 dark:bg-green-900/10 dark:border-green-800/30' : 'bg-slate-50 border-slate-100 dark:bg-slate-700/30 dark:border-slate-700'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-sm ${formData.Localisation ? 'bg-white text-green-500' : 'bg-white text-slate-300'}`}>
                            <LocationMarkerIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className={`text-[13px] font-bold ${formData.Localisation ? 'text-green-700 dark:text-green-400' : 'text-slate-500'}`}>Position enregistrée</p>
                            <p className="text-[11px] text-slate-400">{formData.Localisation || 'Aucune localisation enregistrée'}</p>
                        </div>
                    </div>
                    <button 
                        onClick={updateLocation}
                        className="w-full py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-[13px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-sm active:bg-slate-50"
                    >
                        {isLocating ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <ArrowPathIcon className="w-4 h-4" />}
                        Actualiser la position
                    </button>
                </div>
            </section>

            <section className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <SectionHeader icon={CameraIcon} title="Photos (Optionnel)" />
                <div className="space-y-4">
                    <div className="w-full aspect-[2/1] border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 bg-slate-50/30 overflow-hidden">
                        {formData.Image ? (
                            <div className="relative w-full h-full">
                                <img src={formData.Image} className="w-full h-full object-cover rounded-2xl" />
                                <button 
                                    onClick={() => setFormData(p => ({...p, Image: ''}))}
                                    className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full"
                                >
                                    <XMarkIcon className="w-4 h-4" />
                                </button>
                            </div>
                        ) : (
                            <>
                                <CameraIcon className="w-8 h-8 text-slate-300" />
                                <span className="text-[11px] font-bold text-slate-300">Aucune photo</span>
                            </>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <button onClick={() => setIsCameraOpen(true)} className="py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-[13px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-sm active:bg-slate-50 transition-all">
                            <CameraIcon className="w-4 h-4" /> Capturer
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-[13px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-sm active:bg-slate-50 transition-all">
                            <MapIcon className="w-4 h-4" /> Galerie
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </div>
                </div>
            </section>

            <section className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <SectionHeader icon={ClipboardDocumentListIcon} title="Adresse & Contact" />
                <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                        <div className="relative">
                            <label className="text-[12px] font-bold text-slate-500 mb-2 block ml-1">Ville *</label>
                            <div className="relative">
                                <StoreIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input 
                                    type="text" 
                                    name="Ville" 
                                    value={formData.Ville} 
                                    onFocus={() => setShowCitySuggestions(true)}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setShowCitySuggestions(true);
                                    }} 
                                    placeholder="Sélectionnez une ville" 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white" 
                                />
                            </div>
                            {showCitySuggestions && (
                                <div className="absolute z-30 w-full mt-2 bg-white dark:bg-slate-800 border rounded-2xl shadow-2xl max-h-48 overflow-y-auto border-slate-100 dark:border-slate-700">
                                    {uniqueCities
                                        .filter(city => city.toLowerCase().includes(formData.Ville.toLowerCase()))
                                        .map(city => (
                                            <button 
                                                key={city} 
                                                type="button"
                                                onClick={() => {
                                                    setFormData(p => ({...p, Ville: city, Région: ''}));
                                                    setShowCitySuggestions(false);
                                                }} 
                                                className="w-full p-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b last:border-0 border-slate-50 dark:border-slate-700"
                                            >
                                                <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{city}</span>
                                            </button>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        
                        <div className="relative">
                            <label className="text-[12px] font-bold text-slate-500 mb-2 block ml-1">Région / Quartier</label>
                            <div className="relative">
                                <DocumentIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input 
                                    type="text" 
                                    name="Région" 
                                    value={formData.Région} 
                                    onFocus={() => setShowRegionSuggestions(true)}
                                    onChange={(e) => {
                                        handleChange(e);
                                        setShowRegionSuggestions(true);
                                    }}
                                    placeholder="Sélectionnez une région" 
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white" 
                                />
                            </div>
                            {showRegionSuggestions && filteredRegions.length > 0 && (
                                <div className="absolute z-30 w-full mt-2 bg-white dark:bg-slate-800 border rounded-2xl shadow-2xl max-h-48 overflow-y-auto border-slate-100 dark:border-slate-700">
                                    {filteredRegions
                                        .filter(reg => reg.toLowerCase().includes(formData.Région?.toLowerCase() || ''))
                                        .map(reg => (
                                            <button 
                                                key={reg} 
                                                type="button"
                                                onClick={() => {
                                                    setFormData(p => ({...p, Région: reg}));
                                                    setShowRegionSuggestions(false);
                                                }} 
                                                className="w-full p-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b last:border-0 border-slate-50 dark:border-slate-700"
                                            >
                                                <span className="text-sm text-slate-700 dark:text-slate-200 font-medium">{reg}</span>
                                            </button>
                                        ))
                                    }
                                </div>
                            )}
                        </div>
                        
                        <div>
                            <label className="text-[12px] font-bold text-slate-500 mb-2 block ml-1">Adresse</label>
                            <div className="relative">
                                <LocationMarkerIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input type="text" name="Adresse" value={formData.Adresse} onChange={handleChange} placeholder="Entrez l'adresse complète" className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white" />
                            </div>
                        </div>
                    </div>
                    <div>
                        <label className="text-[12px] font-bold text-slate-500 mb-2 block ml-1">GSM 1 (Optionnel)</label>
                        <div className="relative">
                            <PhoneCallIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input type="text" name="GSM1" value={formData.GSM1} onChange={handleChange} placeholder="06 XX XX XX XX" className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white font-bold" />
                        </div>
                    </div>
                </div>
            </section>

            <section className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <SectionHeader icon={TagIcon} title="Catégorisation du Lead" />
                <div className="space-y-3">
                    {[
                        { id: 'Haute', sub: 'Clients premium' },
                        { id: 'Haute et Moyenne', sub: 'Clients mixtes' },
                        { id: 'Moyenne', sub: 'Clients de gamme standard' },
                        { id: 'Économie', sub: 'Clients économiques' }
                    ].map((level) => (
                        <label key={level.id} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${formData.Gamme === level.id ? 'border-[#4407EB] bg-blue-50/30' : 'border-slate-100 dark:border-slate-700'}`}>
                            <div className="relative flex items-center justify-center">
                                <input 
                                    type="radio" 
                                    name="Gamme" 
                                    checked={formData.Gamme === level.id} 
                                    onChange={() => setFormData(p => ({...p, Gamme: level.id}))} 
                                    className="w-5 h-5 border-2 border-slate-300 rounded-full checked:border-[#4407EB] appearance-none"
                                />
                                {formData.Gamme === level.id && <div className="absolute w-2.5 h-2.5 bg-[#4407EB] rounded-full"></div>}
                            </div>
                            <div>
                                <p className="text-[14px] font-bold text-slate-800 dark:text-white leading-tight">{level.id}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">{level.sub}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </section>

            <section className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <SectionHeader icon={ClipboardDocumentListIcon} title="Détails Commerciaux" />
                <div className="space-y-4">
                    <div>
                        <label className="text-[12px] font-bold text-slate-500 mb-2 block ml-1">Action à entreprendre</label>
                        <div className="relative">
                            <ClipboardDocumentListIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <select 
                                name="Action Client" 
                                value={formData['Action Client']} 
                                onChange={handleChange}
                                className="w-full pl-12 pr-10 py-3.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white appearance-none"
                            >
                                <option value="">Sélectionnez une action</option>
                                <option value="Visiter">Visiter</option>
                                <option value="Revisiter">Revisiter</option>
                                <option value="Acheter">Acheter</option>
                            </select>
                            <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300 pointer-events-none" />
                        </div>
                    </div>

                    {formData['Action Client'] === 'Revisiter' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="text-[12px] font-bold text-slate-500 mb-2 block ml-1">Date de Rendez-vous</label>
                            <div className="relative">
                                <CalendarDaysIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input 
                                    type="date" 
                                    name="Rendez-Vous"
                                    value={formData['Rendez-Vous'] || ''}
                                    onChange={handleChange}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white"
                                />
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <button 
                onClick={handleFormSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#4407EB] text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-200 dark:shadow-none hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
                {isSubmitting ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Enregistrer le Lead'}
            </button>
        </main>

        {/* Click outside detection to close suggestions */}
        {(showCitySuggestions || showRegionSuggestions || showSuggestions) && (
            <div 
                className="fixed inset-0 z-10" 
                onClick={() => {
                    setShowCitySuggestions(false);
                    setShowRegionSuggestions(false);
                    setShowSuggestions(false);
                }}
            />
        )}
    </div>
  );
};

export default StoreFormPage;
