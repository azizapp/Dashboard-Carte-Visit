import React, { useState, useRef, useEffect } from 'react';
import { Store, StoreFormData } from '../../types.ts';
import LocationMarkerIcon from '../icons/LocationMarkerIcon.tsx';
import UserCircleIcon from '../icons/UserCircleIcon.tsx';
import CameraIcon from '../icons/CameraIcon.tsx';
import MapIcon from '../icons/MapIcon.tsx';
import ClipboardDocumentListIcon from '../icons/ClipboardDocumentListIcon.tsx';
import CalendarDaysIcon from '../icons/CalendarDaysIcon.tsx';
import CurrencyDollarIcon from '../icons/CurrencyDollarIcon.tsx';
import CubeIcon from '../icons/CubeIcon.tsx';
import SpinnerIcon from '../icons/SpinnerIcon.tsx';
import XMarkIcon from '../icons/XMarkIcon.tsx';

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

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

interface FollowUpPageProps {
    prospect: Store;
    onClose: () => void;
    onSubmit: (data: StoreFormData) => void;
}

const FollowUpPage: React.FC<FollowUpPageProps> = ({ prospect, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<StoreFormData>({
      id: prospect.id,
      Magazin: prospect.Magazin,
      Ville: prospect.Ville,
      'Le Gérant': prospect['Le Gérant'],
      'Action Client': 'Revisiter',
      Note: '',
      Image: '',
      Prix: 0,
      Quantité: 0,
      'Rendez-Vous': ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCapture = async (imageDataUrl: string) => {
      setIsCameraOpen(false);
      const compressed = await compressImage(imageDataUrl);
      setFormData(prev => ({ ...prev, Image: compressed }));
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const compressed = await compressImage(e.target.files[0]);
          setFormData(prev => ({ ...prev, Image: compressed }));
      }
  };

  const handleFormSubmit = async () => {
      if (!formData['Action Client']) {
          alert("Veuillez sélectionner une action");
          return;
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
    <div className="bg-[#F7F8FA] dark:bg-slate-900 min-h-screen pb-10 font-sans max-w-xl mx-auto border-x border-slate-100 dark:border-slate-800">
        <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
        
        <header className="sticky top-0 z-50 bg-[#F7F8FA] dark:bg-slate-900 px-4 py-4 flex items-center justify-between">
            <button onClick={onClose} className="p-1 text-slate-600 dark:text-slate-300">
                <ArrowLeftIcon className="w-6 h-6" />
            </button>
            <h1 className="text-[15px] font-bold text-slate-800 dark:text-white">Nouveau Suivi</h1>
            <div className="w-8"></div>
        </header>

        <main className="p-4 space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-full flex items-center justify-center text-[#4407EB]">
                        <UserCircleIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <h2 className="text-[16px] font-black text-slate-900 dark:text-white">{prospect.Magazin}</h2>
                        <p className="text-[12px] text-slate-400 font-medium">{prospect.Ville} • {prospect['Le Gérant']}</p>
                    </div>
                </div>
            </div>

            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <SectionHeader icon={ClipboardDocumentListIcon} title="Détails de l'Action" />
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
                                <option value="Visiter">Visiter</option>
                                <option value="Revisiter">Revisiter (Moad)</option>
                                <option value="Acheter">Acheter (Commande)</option>
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
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white font-bold"
                                />
                            </div>
                        </div>
                    )}

                    {formData['Action Client'] === 'Acheter' && (
                        <div className="grid grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                            <div>
                                <label className="text-[12px] font-bold text-slate-500 mb-2 block ml-1">Prix (DH)</label>
                                <div className="relative">
                                    <CurrencyDollarIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input 
                                        type="number" 
                                        name="Prix"
                                        placeholder="0.00"
                                        value={formData.Prix || ''}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white font-bold"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[12px] font-bold text-slate-500 mb-2 block ml-1">Quantité</label>
                                <div className="relative">
                                    <CubeIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                    <input 
                                        type="number" 
                                        name="Quantité"
                                        placeholder="0"
                                        value={formData.Quantité || ''}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white font-bold"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <SectionHeader icon={CameraIcon} title="Preuve Photo (Optionnel)" />
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
                        <button onClick={() => setIsCameraOpen(true)} className="py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-[13px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-sm">
                            <CameraIcon className="w-4 h-4" /> Capturer
                        </button>
                        <button onClick={() => fileInputRef.current?.click()} className="py-2.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-[13px] font-bold text-slate-700 dark:text-slate-200 flex items-center justify-center gap-2 shadow-sm">
                            <MapIcon className="w-4 h-4" /> Galerie
                        </button>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileSelect} />
                    </div>
                </div>
            </section>

            <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <SectionHeader icon={CalendarDaysIcon} title="Suivi" />
                <div>
                    <label className="text-[12px] font-bold text-slate-500 mb-2 block ml-1">Notes de visite</label>
                    <textarea 
                        name="Note"
                        value={formData.Note}
                        onChange={handleChange}
                        placeholder="Racontez le déroulement de la visite..."
                        className="w-full p-4 bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] text-sm dark:text-white h-32 resize-none"
                    />
                </div>
            </section>

            <button 
                onClick={handleFormSubmit}
                disabled={isSubmitting}
                className="w-full bg-[#4407EB] text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-200 dark:shadow-none hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            >
                {isSubmitting ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : 'Enregistrer le Suivi'}
            </button>
        </main>
    </div>
  );
};

export default FollowUpPage;