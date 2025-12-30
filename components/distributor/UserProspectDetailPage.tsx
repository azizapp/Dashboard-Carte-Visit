import React, { useState, useMemo } from 'react';
import { Store } from '../../types.ts';
import PhoneCallIcon from '../icons/PhoneCallIcon.tsx';
import WhatsAppIcon from '../icons/WhatsAppIcon.tsx';
import LocationMarkerIcon from '../icons/LocationMarkerIcon.tsx';
import CalendarDaysIcon from '../icons/CalendarDaysIcon.tsx';
import ClipboardDocumentListIcon from '../icons/ClipboardDocumentListIcon.tsx';
import TagIcon from '../icons/TagIcon.tsx';
import UserCircleIcon from '../icons/UserCircleIcon.tsx';
import EditIcon from '../icons/EditIcon.tsx';
import PlusIcon from '../icons/PlusIcon.tsx';
import ClockIcon from '../icons/ClockIcon.tsx';
import XMarkIcon from '../icons/XMarkIcon.tsx';
import EnvelopeIcon from '../icons/EnvelopeIcon.tsx';
import AppointmentModal from './AppointmentModal.tsx';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const ChevronDownIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const PhotoPlaceholderIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm1.5-1.5a.75.75 0 0 0-.75.75v.008c0 .414.336.75.75.75h.008a.75.75 0 0 0 .75-.75v-.008a.75.75 0 0 0-.75-.75H3.75Z" />
  </svg>
);

interface UserProspectDetailPageProps {
    store: Store;
    history: Store[];
    onClose: () => void;
    onAddVisit?: (store: Store) => void;
    onEdit?: (store: Store) => void;
}

const UserProspectDetailPage: React.FC<UserProspectDetailPageProps> = ({ store, history, onClose, onAddVisit, onEdit }) => {
    const [isApptModalOpen, setIsApptModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);
    const [selectedPreviewImage, setSelectedPreviewImage] = useState<string | null>(null);

    const stats = useMemo(() => ({
        totalVisits: history.length,
    }), [history]);

    const galleryImages = useMemo(() => {
        return history
            .map(h => h.Image)
            .filter((img): img is string => !!img && img !== '');
    }, [history]);

    const isWhatsAppSupported = (val: string | undefined) => {
        if (!val) return false;
        const cleanVal = val.replace(/\s/g, '');
        return !cleanVal.startsWith('05') && !cleanVal.startsWith('+2125');
    };

    const leadEmail = store.Email || store.email;

    return (
        <div className="flex flex-col h-full bg-[#F7F8FA] dark:bg-slate-900 font-sans max-w-xl mx-auto border-x border-slate-100 dark:border-slate-800 overflow-hidden relative">
            
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 py-4 flex justify-between items-center h-[64px] flex-shrink-0">
                <button onClick={onClose} className="p-2 -ml-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <ArrowLeftIcon className="w-6 h-6" />
                </button>
                <h1 className="text-[17px] font-bold text-slate-800 dark:text-white leading-none truncate max-w-[200px]">{store.Magazin}</h1>
                <button 
                    onClick={() => onEdit?.(store)}
                    className="p-2 -mr-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                    <EditIcon className="w-5 h-5" />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
                
                <section className="bg-white dark:bg-slate-800 p-8 rounded-md shadow-sm border border-slate-100 dark:border-slate-700 relative">
                    <div className="absolute top-8 right-8 w-3 h-3 rounded-full bg-slate-400 border-2 border-white dark:border-slate-800"></div>
                    <h2 className="text-[24px] font-black text-slate-900 dark:text-white mb-4 pr-10 leading-tight">{store.Magazin}</h2>
                    <div className="flex flex-wrap gap-2">
                        <span className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 px-3 py-1.5 rounded text-[11px] font-bold border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                            <TagIcon className="w-3.5 h-3.5" /> {store.Gamme || 'Haute et Moyenne'}
                        </span>
                        <span className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 px-3 py-1.5 rounded text-[11px] font-bold border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                            <ClipboardDocumentListIcon className="w-3.5 h-3.5" /> {stats.totalVisits} visites
                        </span>
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded text-blue-600">
                            <UserCircleIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-[15px] text-slate-800 dark:text-white">Informations de Contact</h3>
                    </div>
                    <div className="px-8 pb-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <PhoneCallIcon className="w-4 h-4 text-slate-300 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">GSM</p>
                                    <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{store.GSM1 || '-'}</p>
                                </div>
                            </div>
                            {isWhatsAppSupported(store.GSM1) && store.GSM1 && (
                                <a href={`https://wa.me/${store.GSM1.replace(/\s/g, '')}`} target="_blank" className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shadow-sm">
                                    <WhatsAppIcon className="w-5 h-5 fill-current" />
                                </a>
                            )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-start gap-4">
                                <PhoneCallIcon className="w-4 h-4 text-slate-300 mt-0.5" />
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">GSM 2</p>
                                    <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{store.GSM2 || '-'}</p>
                                </div>
                            </div>
                            {isWhatsAppSupported(store.GSM2) && store.GSM2 && (
                                <a href={`https://wa.me/${store.GSM2.replace(/\s/g, '')}`} target="_blank" className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg shadow-sm">
                                    <WhatsAppIcon className="w-5 h-5 fill-current" />
                                </a>
                            )}
                        </div>

                        <div className="flex items-start gap-4">
                            <PhoneCallIcon className="w-4 h-4 text-slate-300 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Téléphone (Fixe)</p>
                                <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{store.Phone || '-'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <EnvelopeIcon className="w-4 h-4 text-slate-300 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Email</p>
                                {leadEmail ? (
                                    <a href={`mailto:${leadEmail}`} className="text-[14px] font-bold text-blue-600 dark:text-blue-400 truncate max-w-[200px] hover:underline block">
                                        {leadEmail}
                                    </a>
                                ) : (
                                    <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">-</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 flex items-center gap-3">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/30 rounded text-purple-600">
                            <LocationMarkerIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-[15px] text-slate-800 dark:text-white">Adresse & Localisation</h3>
                    </div>
                    <div className="px-8 pb-8 space-y-6">
                        <div className="flex items-start gap-4">
                            <ClipboardDocumentListIcon className="w-4 h-4 text-slate-300 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Ville</p>
                                <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{store.Ville}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <LocationMarkerIcon className="w-4 h-4 text-slate-300 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Région</p>
                                <p className="text-[14px] font-bold text-slate-700 dark:text-slate-200">{store.Région || '-'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <button 
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        className="w-full p-6 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded text-indigo-600">
                                <ClockIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-[15px] text-slate-800 dark:text-white">Historique des visites</h3>
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isHistoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isHistoryOpen && (
                        <div className="p-8 pt-0 animate-in fade-in slide-in-from-top-2">
                             <div className="relative pl-6 space-y-8 before:absolute before:left-[7px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100 dark:before:bg-slate-700">
                                {history.map((visit, idx) => (
                                    <div key={idx} className="relative">
                                        <div className="absolute -left-[23.5px] top-1.5 w-2 h-2 rounded-full bg-blue-500 border-2 border-white dark:border-slate-800"></div>
                                        <div className="space-y-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="text-[13px] font-bold text-slate-800 dark:text-white">
                                                    {visit['Action Client'] === 'Contact' && visit['Contacté'] 
                                                        ? visit['Contacté'] 
                                                        : (visit['Action Client'] || 'Visite')}
                                                </p>
                                                {visit['Action Client'] === 'Contact' && visit['Discuté'] && (
                                                    <span className="text-[11px] text-indigo-500 font-bold px-1.5 py-0.5 bg-indigo-50 dark:bg-indigo-900/40 rounded border border-indigo-100 dark:border-indigo-800">
                                                        {visit['Discuté']}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase">{visit.Date}</p>
                                            {visit.Note && (
                                                <div className="mt-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded border-l-2 border-slate-200 dark:border-slate-600">
                                                    <p className="text-[12px] text-slate-500 dark:text-slate-300 font-normal italic">"{visit.Note}"</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section className="bg-white dark:bg-slate-800 rounded-md shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden pb-8">
                    <div className="p-6 flex items-center gap-3">
                        <div className="p-2 bg-pink-50 dark:bg-pink-900/30 rounded text-pink-600">
                            <PhotoPlaceholderIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-[15px] text-slate-800 dark:text-white">Galerie Photos</h3>
                    </div>
                    <div className="px-6 grid grid-cols-2 gap-4">
                        {galleryImages.length > 0 ? (
                            galleryImages.map((img, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => setSelectedPreviewImage(img)}
                                    className="aspect-square bg-[#F1F3F9] dark:bg-slate-700 rounded-md overflow-hidden border border-slate-50 dark:border-slate-600 shadow-sm active:scale-95 transition-transform cursor-pointer"
                                >
                                    <img src={img} alt={`Visit ${idx}`} className="w-full h-full object-cover" />
                                </div>
                            ))
                        ) : (
                            <div className="col-span-2 py-12 text-center bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                <PhotoPlaceholderIcon className="w-10 h-10 text-slate-200 dark:text-slate-700 mx-auto mb-3" />
                                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Aucune photo enregistrée</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {selectedPreviewImage && (
                <div 
                    className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 animate-in fade-in duration-300"
                    onClick={() => setSelectedPreviewImage(null)}
                >
                    <button className="absolute top-6 right-6 p-3 bg-white/10 text-white rounded-full">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                    <img 
                        src={selectedPreviewImage} 
                        alt="Full preview" 
                        className="max-w-full max-h-full object-contain rounded-lg" 
                    />
                </div>
            )}

            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-full shadow-2xl border border-slate-100 dark:border-slate-700 p-2 flex items-center justify-around z-50">
                <button 
                    onClick={() => onAddVisit?.(store)}
                    className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-400"
                    title="Ajouter visite"
                >
                    <PlusIcon className="w-5 h-5 stroke-[2.5px]" />
                </button>
                <button onClick={() => setIsApptModalOpen(true)} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-400" title="Rendez-vous">
                    <CalendarDaysIcon className="w-5 h-5" />
                </button>
                <a href={`tel:${store.GSM1}`} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-400" title="Appeler">
                    <PhoneCallIcon className="w-5 h-5" />
                </a>
                <a href={`https://wa.me/${store.GSM1?.replace(/\s/g, '')}`} target="_blank" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-400" title="WhatsApp">
                    <WhatsAppIcon className="w-5 h-5 fill-current" />
                </a>
                {leadEmail && (
                    <a href={`mailto:${leadEmail}`} className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-400" title="Email">
                        <EnvelopeIcon className="w-5 h-5" />
                    </a>
                )}
                <a href={`https://maps.google.com/?q=${store.Localisation || store.Ville}`} target="_blank" className="w-12 h-12 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-400" title="Localisation">
                    <LocationMarkerIcon className="w-5 h-5" />
                </a>
            </div>

            <AppointmentModal 
                isOpen={isApptModalOpen}
                onClose={() => setIsApptModalOpen(false)}
                appointments={store['Rendez-Vous']}
            />
        </div>
    );
};

export default UserProspectDetailPage;