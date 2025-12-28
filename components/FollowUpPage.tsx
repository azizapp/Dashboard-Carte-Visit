
import React, { useState, useRef } from 'react';
import { Store, StoreFormData } from '../types.ts';
import CameraIcon from './icons/CameraIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';

// --- START OF IN-COMPONENT ICONS ---
const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);
const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);
const PhotoIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm1.5-1.5a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75H3.75Z" />
    </svg>
);
const CalendarDaysIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
    </svg>
);
const ClipboardDocumentCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.125 2.25h-4.5c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125v-9M10.125 2.25h.375a9 9 0 0 1 9 9v.375M10.125 2.25A3.375 3.375 0 0 1 13.5 5.625v1.5c0 .621.504 1.125 1.125 1.125h1.5a3.375 3.375 0 0 1 3.375 3.375M9 15l2.25 2.25L15 12" />
    </svg>
);
const CurrencyDollarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);
const CubeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m21 7.5-9-5.25L3 7.5m18 0-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
    </svg>
);
const TagIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
);

// --- Reusable Components & Utilities ---

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  React.useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then(stream => {
          streamRef.current = stream;
          if (videoRef.current) videoRef.current.srcObject = stream;
        })
        .catch(err => {
          console.error("Camera error:", err);
          alert("Could not access camera.");
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
    <div className="fixed inset-0 bg-black z-[60] flex flex-col">
      <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover"></video>
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-black/50 flex justify-center items-center gap-4">
        <button type="button" onClick={handleCapture} className="p-4 bg-white rounded-full"><CameraIcon className="w-8 h-8 text-black" /></button>
        <button type="button" onClick={onClose} className="text-white bg-black/50 rounded-full py-2 px-6">Cancel</button>
      </div>
    </div>
  );
};


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
            canvas.getContext('2d')?.drawImage(img, 0, 0, width, height);
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

// FIX: Updated initialFormData to use correct property names (GSM1) and types (0 for numbers).
const initialFormData: StoreFormData = {
  Magazin: '', Ville: '', GSM1: '', 'Action Client': '', 'Rendez-Vous': '', Image: '', Note: '', Prix: 0, Quantité: 0,
};

interface FollowUpPageProps {
    prospect: Store;
    history: Store[];
    onClose: () => void;
    onSubmit: (followUpData: StoreFormData) => void;
}

const FollowUpPage: React.FC<FollowUpPageProps> = ({ prospect, history, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<StoreFormData>(initialFormData);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [meetingDate, setMeetingDate] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
     if (name === 'Action Client') {
        const updatedState: StoreFormData = { ...formData, 'Action Client': value };
        if (value === 'Acheter') {
            updatedState['Rendez-Vous'] = ''; setMeetingDate('');
        } else if (value === 'Revisiter') {
            // FIX: Use 0 instead of '' for number fields to satisfy TypeScript.
            updatedState.Prix = 0; updatedState.Quantité = 0;
        } else {
            updatedState['Rendez-Vous'] = ''; setMeetingDate('');
            // FIX: Use 0 instead of '' for number fields to satisfy TypeScript.
            updatedState.Prix = 0; updatedState.Quantité = 0;
        }
        setFormData(updatedState);
    } else {
        // FIX: Ensure numeric values are correctly parsed to satisfy the Store type.
        const val = (name === 'Prix' || name === 'Quantité') ? (Number(value) || 0) : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    }
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, 'Rendez-Vous': meetingDate });
  };
  
  const FormSection: React.FC<{title: string, Icon: React.FC<any>, children: React.ReactNode}> = ({ title, Icon, children }) => (
    <section className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm">
        <div className="flex items-center mb-4">
            <Icon className="w-6 h-6 text-[var(--accent-color)]" />
            <h3 className="text-md font-semibold ml-3 text-slate-800 dark:text-white">{title}</h3>
        </div>
        <div className="space-y-4">{children}</div>
    </section>
  );

  return (
    <>
      <CameraModal isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} onCapture={handleCapture} />
      <div className="bg-slate-100 dark:bg-slate-900 min-h-screen font-sans">
        <header className="fixed top-[35px] left-0 right-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-700">
            <div className="container mx-auto flex items-center justify-center relative">
                <button type="button" onClick={onClose} className="absolute left-4 top-0 bottom-0 flex items-center">
                    <ArrowLeftIcon className="w-6 h-6 text-slate-700 dark:text-slate-200" />
                </button>
                <h1 className="text-lg font-semibold text-slate-900 dark:text-white truncate px-16">Suivi: {prospect.Magazin}</h1>
            </div>
        </header>

        <main className="pt-20 pb-28 px-4 max-w-3xl mx-auto">
          <form id="followup-form" onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Nouvelle Action" Icon={ClipboardDocumentCheckIcon}>
               <div>
                    <label htmlFor="Action Client" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Action à entreprendre</label>
                    <div className="relative">
                        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><ClipboardDocumentCheckIcon className="h-5 w-5 text-slate-400" /></div>
                        <select name="Action Client" id="Action Client" value={formData['Action Client'] || ''} onChange={handleChange} required className="block w-full appearance-none rounded-md border-slate-300 bg-white py-2.5 pl-10 pr-10 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white">
                            <option value="" disabled>Sélectionnez une action</option>
                            <option value="Acheter">Acheter</option>
                            <option value="Revisiter">Revisiter</option>
                        </select>
                        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3"><ChevronDownIcon className="h-5 w-5 text-slate-400" /></div>
                    </div>
                </div>
                {formData['Action Client'] === 'Revisiter' && (
                    <div>
                        <label htmlFor="Rendez-Vous" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Date de Rendez-vous</label>
                        <div className="relative">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><CalendarDaysIcon className="h-5 w-5 text-slate-400" /></div>
                            <input type="date" name="Rendez-Vous" id="Rendez-Vous" value={meetingDate} onChange={(e) => setMeetingDate(e.target.value)} required className="block w-full rounded-md border-slate-300 bg-white py-2.5 pl-10 pr-3 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" />
                        </div>
                    </div>
                )}
                {formData['Action Client'] === 'Acheter' && (
                    <>
                      <div>
                          <label htmlFor="Prix" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Prix</label>
                          <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><CurrencyDollarIcon className="h-5 w-5 text-slate-400" /></div><input type="number" name="Prix" id="Prix" value={formData.Prix || ''} onChange={handleChange} placeholder="0.00 DH" className="block w-full rounded-md border-slate-300 bg-white py-2.5 pl-10 pr-3 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" /></div>
                      </div>
                      <div>
                          <label htmlFor="Quantité" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Quantité</label>
                          <div className="relative"><div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><CubeIcon className="h-5 w-5 text-slate-400" /></div><input type="number" name="Quantité" id="Quantité" value={formData.Quantité || ''} onChange={handleChange} placeholder="0" className="block w-full rounded-md border-slate-300 bg-white py-2.5 pl-10 pr-3 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white" /></div>
                      </div>
                    </>
                )}
                <div>
                  <label htmlFor="Note" className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                  <textarea name="Note" id="Note" rows={4} value={formData.Note || ''} onChange={handleChange} placeholder="Ajoutez des notes sur cette visite..." className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-600 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] sm:text-sm bg-white dark:bg-slate-700" />
                </div>
            </FormSection>
             <FormSection title="Photo (Optionnel)" Icon={PhotoIcon}>
                  {formData.Image ? (
                      <div className="relative group">
                          <img src={formData.Image} alt="Aperçu" className="w-full h-48 object-cover rounded-lg"/>
                          <button type="button" onClick={() => setFormData(p => ({...p, Image: ''}))} className="absolute top-2 right-2 p-1.5 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">&times;</button>
                      </div>
                  ) : (
                      <div className="p-6 text-center border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg">
                         <CameraIcon className="mx-auto h-12 w-12 text-slate-400" />
                         <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Aucune photo</p>
                      </div>
                  )}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                      <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                      <button type="button" onClick={() => setIsCameraOpen(true)} className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><CameraIcon className="w-5 h-5"/>Capturer</button>
                      <button type="button" onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 py-2.5 px-4 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"><PhotoIcon className="w-5 h-5"/>Galerie</button>
                  </div>
              </FormSection>
          </form>
        </main>
        <footer className="fixed bottom-[35px] left-0 right-0 z-50 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm border-t border-slate-200 dark:border-slate-700">
            <div className="container mx-auto p-4 max-w-3xl">
                <button type="submit" form="followup-form" className="w-full py-3 px-4 text-base font-semibold text-white bg-[var(--accent-color)] rounded-xl shadow-md hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--accent-color)]">
                    Enregistrer le Suivi
                </button>
            </div>
        </footer>
      </div>
    </>
  );
};

export default FollowUpPage;