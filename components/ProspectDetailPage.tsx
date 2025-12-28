
import React, { useState, useMemo } from 'react';
import { Store } from '../types.ts';
import PhoneCallIcon from './icons/PhoneCallIcon.tsx';
import EnvelopeIcon from './icons/EnvelopeIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import UserCircleIcon from './icons/UserCircleIcon.tsx';
import ClockIcon from './icons/ClockIcon.tsx';
import TagIcon from './icons/TagIcon.tsx';
import WhatsAppIcon from './icons/WhatsAppIcon.tsx';
import LocationMarkerIcon from './icons/LocationMarkerIcon.tsx';
import PlusIcon from './icons/PlusIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import AppointmentModal from './distributor/AppointmentModal.tsx';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon.tsx';

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

interface ProspectDetailPageProps {
    store: Store;
    history: Store[];
    onClose: () => void;
}

const ProspectDetailPage: React.FC<ProspectDetailPageProps> = ({ store, history, onClose }) => {
    const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
    const [isHistoryOpen, setIsHistoryOpen] = useState(false);

    const stats = useMemo(() => {
        const totalVisits = history.length;
        const totalValue = history.reduce((sum, h) => sum + (Number(h.Prix) || 0), 0);
        return { totalVisits, totalValue };
    }, [history]);

    const leadEmail = store.Email || store.email;

    return (
        <div className="flex flex-col h-full bg-[#F7F8FA] dark:bg-slate-900 overflow-hidden font-sans max-w-xl mx-auto border-x border-slate-100 dark:border-slate-800">
            {/* Header Bar */}
            <header className="bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 px-4 py-4 flex justify-between items-center flex-shrink-0 h-[64px]">
                <button onClick={onClose} className="p-2 -ml-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <ArrowLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300" />
                </button>
                <h1 className="text-[17px] font-bold text-slate-800 dark:text-white leading-none truncate max-w-[200px]">{store.Magazin}</h1>
                <button className="p-2 -mr-2 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors">
                    <EditIcon className="w-5 h-5 text-slate-500" />
                </button>
            </header>

            <main className="flex-1 overflow-y-auto p-4 space-y-4 pb-32">
                {/* Store Main Card */}
                <section className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative">
                    <div className="absolute top-6 right-6 w-3 h-3 rounded-full bg-slate-400 border-2 border-white dark:border-slate-800"></div>
                    <h2 className="text-[22px] font-black text-slate-900 dark:text-white mb-4 pr-10">{store.Magazin}</h2>
                    <div className="flex gap-2">
                        <span className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                            <TagIcon className="w-3.5 h-3.5" /> {store.Gamme || 'Haute et Moyenne'}
                        </span>
                        <span className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-300 px-3 py-1.5 rounded-lg text-[11px] font-medium border border-slate-100 dark:border-slate-700 flex items-center gap-1.5">
                            <ClipboardDocumentListIcon className="w-3.5 h-3.5" /> {stats.totalVisits} visites
                        </span>
                    </div>
                </section>

                {/* Section: Informations de Contact */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-5 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-blue-600">
                            <UserCircleIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-[15px] text-slate-800 dark:text-white">Informations de Contact</h3>
                    </div>
                    <div className="p-5 space-y-5">
                        <div className="flex items-start gap-4">
                            <PhoneCallIcon className="w-4 h-4 text-slate-300 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">GSM</p>
                                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{store.GSM1 || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <PhoneCallIcon className="w-4 h-4 text-slate-300 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Téléphone (Fixe)</p>
                                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{store.Phone || 'N/A'}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <EnvelopeIcon className="w-4 h-4 text-slate-300 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Email</p>
                                {leadEmail ? (
                                    <a href={`mailto:${leadEmail}`} className="text-[13px] font-medium text-blue-600 dark:text-blue-400 truncate hover:underline block max-w-[200px]">
                                        {leadEmail}
                                    </a>
                                ) : (
                                    <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200 truncate">Non renseigné</p>
                                )}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Adresse & Localisation */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-5 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-[#8b5cf6]/10 rounded-xl text-[#8b5cf6]">
                            <MapIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-[15px] text-slate-800 dark:text-white">Adresse & Localisation</h3>
                    </div>
                    <div className="p-5 space-y-5">
                        <div className="flex items-start gap-4">
                            <ClipboardDocumentListIcon className="w-4 h-4 text-slate-300 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Ville</p>
                                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{store.Ville}</p>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <LocationMarkerIcon className="w-4 h-4 text-slate-300 mt-0.5" />
                            <div>
                                <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Région</p>
                                <p className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{store.Région || 'N/A'}</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section: Historique (Collapsible) */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <button 
                        onClick={() => setIsHistoryOpen(!isHistoryOpen)}
                        className="w-full p-5 flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-600">
                                <ClockIcon className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-[15px] text-slate-800 dark:text-white">Historique des visites</h3>
                        </div>
                        <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isHistoryOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {isHistoryOpen && (
                        <div className="p-5 pt-0 border-t border-slate-50 dark:border-slate-700 animate-in fade-in slide-in-from-top-2">
                            <div className="space-y-6 mt-6 ml-3 border-l-2 border-slate-50 dark:border-slate-700">
                                {history.map((visit, idx) => (
                                    <div key={idx} className="relative pl-6">
                                        <div className="absolute left-[-6px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#4407EB] border-2 border-white dark:border-slate-800"></div>
                                        <div className="space-y-1">
                                            <p className="text-[13px] font-medium text-slate-800 dark:text-white">{visit['Action Client'] || 'Visite'}</p>
                                            <p className="text-[11px] text-slate-400 font-medium uppercase">{visit.Date}</p>
                                            {visit.Note && <p className="text-[12px] text-slate-500 font-normal italic mt-2 bg-slate-50 dark:bg-slate-700/30 p-2 rounded-lg">"{visit.Note}"</p>}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                {/* Section: Galerie Photos */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden pb-5">
                    <div className="p-5 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3">
                        <div className="p-2 bg-pink-50 dark:bg-pink-900/20 rounded-xl text-pink-600">
                            <PhotoPlaceholderIcon className="w-5 h-5" />
                        </div>
                        <h3 className="font-bold text-[15px] text-slate-800 dark:text-white">Galerie Photos</h3>
                    </div>
                    <div className="p-5 grid grid-cols-2 gap-3">
                        <div className="aspect-square bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-600 flex-col gap-2">
                           <PhotoPlaceholderIcon className="w-8 h-8 text-slate-200" />
                           <p className="text-[10px] font-medium text-slate-300">Photo de visite 1</p>
                        </div>
                        <div className="aspect-square bg-slate-50 dark:bg-slate-700 rounded-xl flex items-center justify-center border border-slate-100 dark:border-slate-600 flex-col gap-2">
                           <PhotoPlaceholderIcon className="w-8 h-8 text-slate-200" />
                           <p className="text-[10px] font-medium text-slate-300">Photo de visite 2</p>
                        </div>
                    </div>
                </section>
            </main>

            {/* Bottom Sticky Action Bar */}
            <footer className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-[32px] shadow-2xl border border-slate-100 dark:border-slate-700 p-2.5 flex items-center gap-2.5">
                <button className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-500">
                    <PlusIcon className="w-5 h-5 stroke-[2.5px]" />
                </button>
                <button onClick={() => setIsAppointmentModalOpen(true)} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-500">
                    <CalendarDaysIcon className="w-5 h-5" />
                </button>
                <a href={`tel:${store.GSM1}`} className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-500">
                    <PhoneCallIcon className="w-5 h-5" />
                </a>
                <a href={`https://wa.me/${store.GSM1}`} target="_blank" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-500">
                    <WhatsAppIcon className="w-5 h-5" />
                </a>
                <a href={`https://maps.google.com/?q=${store.Localisation || store.Ville}`} target="_blank" className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-500">
                    <LocationMarkerIcon className="w-5 h-5" />
                </a>
            </footer>

            <AppointmentModal 
                isOpen={isAppointmentModalOpen}
                onClose={() => setIsAppointmentModalOpen(false)}
                appointments={store['Rendez-Vous']}
            />
        </div>
    );
};

export default ProspectDetailPage;
