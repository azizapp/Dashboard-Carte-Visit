
import React, { useMemo, useState } from 'react';
import { Store, Mode, Customer } from '../types.ts';
import XMarkIcon from './icons/XMarkIcon.tsx';
import PhoneCallIcon from './icons/PhoneCallIcon.tsx';
import WhatsAppIcon from './icons/WhatsAppIcon.tsx';
import LocationMarkerIcon from './icons/LocationMarkerIcon.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import UserCircleIcon from './icons/UserCircleIcon.tsx';
import ClockIcon from './icons/ClockIcon.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';
import TagIcon from './icons/TagIcon.tsx';
import EnvelopeIcon from './icons/EnvelopeIcon.tsx';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import CubeIcon from './icons/CubeIcon.tsx';
import NewAppointmentModal from './NewAppointmentModal.tsx';
import QuickLogModal from './QuickLogModal.tsx';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentListIcon.tsx';
import storeService from '../services/storeService.ts';

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

interface AdminProspectDetailPageProps {
    store: Store;
    history: Store[];
    onClose: () => void;
    onEdit: (store: Store) => void;
    onOptimisticUpdate: (newStore: Store) => void;
    authenticatedUser: string;
}

const AdminProspectDetailPage: React.FC<AdminProspectDetailPageProps> = ({ store, history, onClose, onEdit, onOptimisticUpdate, authenticatedUser }) => {
    const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
    const [isQuickLogModalOpen, setIsQuickLogModalOpen] = useState(false);
    const [historyFilter, setHistoryFilter] = useState<'all' | 'rdv' | 'contacts'>('all');

    // States for collapsible sections
    const [isPurchasesOpen, setIsPurchasesOpen] = useState(false);
    const [isPerformanceOpen, setIsPerformanceOpen] = useState(true);
    const [isVisitDatesOpen, setIsVisitDatesOpen] = useState(false);

    const stats = useMemo(() => {
        const totalVisits = history.length;
        const buyActions = history.filter(h => h['Action Client']?.toLowerCase().includes('acheter')).length;
        const revisitActions = history.filter(h => h['Action Client']?.toLowerCase().includes('revisiter')).length;
        const totalValue = history.reduce((sum, h) => sum + (Number(h.Prix) || 0), 0);
        const totalQuantity = history.reduce((sum, h) => sum + (Number(h.Quantité) || 0), 0);
        
        const whatsappContacts = history.filter(h => h['Contacté']?.toLowerCase().includes('whatsapp')).length;
        const phoneContacts = history.filter(h => h['Contacté']?.toLowerCase().includes('téléphone')).length;
        const emailContacts = history.filter(h => h['Contacté']?.toLowerCase().includes('email')).length;

        const now = new Date();
        const nextAppt = history
            .filter(h => h['Rendez-Vous'])
            .map(h => new Date(h['Rendez-Vous']!))
            .filter(d => d >= now)
            .sort((a, b) => a.getTime() - b.getTime())[0];

        return { 
            totalVisits, 
            buyActions, 
            revisitActions, 
            totalValue, 
            totalQuantity,
            whatsappContacts,
            phoneContacts,
            emailContacts,
            nextAppt: nextAppt ? nextAppt.toLocaleDateString('fr-CA') : 'Aucun'
        };
    }, [history]);

    const purchases = useMemo(() => {
        return history
            .filter(h => h['Action Client']?.toLowerCase().includes('acheter'))
            .sort((a, b) => {
                const dateA = new Date(a['Date Heure'] || a.Date).getTime();
                const dateB = new Date(b['Date Heure'] || b.Date).getTime();
                return dateB - dateA;
            });
    }, [history]);

    const filteredHistory = useMemo(() => {
        if (historyFilter === 'all') return history;
        if (historyFilter === 'rdv') {
            return history.filter(h => !!h['Rendez-Vous'] || h['Action Client'] === 'Revisiter');
        }
        if (historyFilter === 'contacts') {
            return history.filter(h => !!h['Contacté'] || h['Action Client'] === 'Contact' || h['Action Client'] === 'Acheter');
        }
        return history;
    }, [history, historyFilter]);

    const handleSaveAppointment = (customer: Customer, date: string, note: string, userEmail: string, action: string) => {
        const newStore: Store = {
          ...customer,
          id: customer.id,
          ID: Date.now().toString(),
          Magazin: customer.name,
          Ville: customer.city,
          'Le Gérant': customer.manager,
          GSM1: customer.gsm1,
          'Action Client': action,
          'Rendez-Vous': date,
          Note: note,
          Prix: 0,
          Quantité: 0,
          USER: userEmail || authenticatedUser,
          Date: new Date().toLocaleDateString('fr-FR')
        } as Store;

        onOptimisticUpdate(newStore);
        setIsNewAppointmentModalOpen(false);
        storeService.addStore(Mode.Production, newStore, undefined, userEmail || authenticatedUser)
          .catch(err => console.error("Background Save Error:", err));
    };

    const handleSaveQuickLog = (customer: Customer, contacted: string, discussed: string, note: string) => {
        const newStore: Store = {
          ...customer,
          id: customer.id,
          ID: Date.now().toString(),
          Magazin: customer.name,
          Ville: customer.city,
          'Le Gérant': customer.manager,
          GSM1: customer.gsm1,
          'Action Client': 'Contact',
          'Contacté': contacted,
          'Discuté': discussed,
          Note: note,
          Prix: 0,
          Quantité: 0,
          USER: authenticatedUser,
          Date: new Date().toLocaleDateString('fr-FR')
        } as Store;

        onOptimisticUpdate(newStore);
        setIsQuickLogModalOpen(false);
        storeService.addStore(Mode.Production, newStore, undefined, authenticatedUser)
          .catch(err => console.error("Background Save Error:", err));
    };

    const displayId = `LEAD-${store.id.toString().substring(0, 4).toUpperCase()}`;
    const createdDate = store.created_at ? new Date(store.created_at).toLocaleDateString('fr-FR') : 'Inconnue';

    const currentCustomerObj: Customer = {
        id: store.id,
        name: store.Magazin,
        manager: store['Le Gérant'],
        city: store.Ville,
        gsm1: store.gsm1,
        gsm2: store.gsm2,
        phone: store.phone,
        email: store.email,
        gamme: store.gamme,
        user_email: store.user_email,
        location: store.location,
        address: store.address,
        region: store.region
    };

    const isWhatsAppSupported = (val: string | undefined) => {
        if (!val) return false;
        const cleanVal = val.replace(/\s/g, '');
        return !cleanVal.startsWith('05') && !cleanVal.startsWith('+2125');
    };

    const leadEmail = store.Email || store.email;

    return (
        <div className="flex flex-col h-full bg-[#F7F8FA] dark:bg-slate-900 font-sans overflow-hidden">
            {/* Page Header */}
            <header className="px-8 py-6 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 flex-shrink-0 sticky top-0 z-20">
                <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sub uppercase tracking-widest mb-1">
                            <button onClick={onClose} className="hover:text-blue-600 transition-colors">Gestion des Leads</button>
                            <span>/</span>
                            <span className="text-blue-600 font-black">DÉTAILS DU LEAD</span>
                        </div>
                        <h1 className="text-heading text-3xl leading-none">Détails du Lead</h1>
                        <div className="flex items-center gap-4 text-sub uppercase tracking-wider mt-3">
                            <span>ID: {displayId}</span>
                            <span>•</span>
                            <span>CRÉÉ LE {createdDate}</span>
                            <span>•</span>
                            <span>VALEUR ESTIMÉE: {stats.totalValue.toLocaleString()} DH</span>
                        </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-100 dark:shadow-none hover:bg-indigo-600 transition-all text-emph">
                            <SparklesIcon className="w-4 h-4" /> Stratégie IA
                        </button>
                        <button 
                            onClick={() => setIsNewAppointmentModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 rounded-xl hover:bg-slate-50 transition-all text-emph"
                        >
                            <CalendarDaysIcon className="w-4 h-4 text-slate-400" /> Nouveau RDV
                        </button>
                        <button 
                            onClick={() => setIsQuickLogModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-100 dark:shadow-none hover:bg-blue-700 transition-all text-emph"
                        >
                            <ClipboardDocumentCheckIcon className="w-4 h-4" /> Rapport Rapide
                        </button>
                        <button onClick={onClose} className="p-2.5 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-slate-600 rounded-xl transition-colors">
                            <XMarkIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <div className="flex-1 p-8 bg-[#F7F8FA] dark:bg-slate-900/50 overflow-y-auto">
                <div className="max-w-[1600px] mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
                        
                        {/* Column 1: Contact Information */}
                        <div className="lg:col-span-1">
                            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden h-full flex flex-col">
                                <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center gap-4 flex-shrink-0">
                                    <div className="p-2.5 bg-blue-50 dark:bg-blue-900/30 rounded-xl text-blue-600">
                                        <UserCircleIcon className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <h3 className="text-heading text-sm">Informations de Contact</h3>
                                        <p className="text-sub tracking-tight">Profil de l'entreprise et coordonnées</p>
                                    </div>
                                </div>
                                
                                <div className="p-8 space-y-6 flex-1">
                                    <div>
                                        <label className="text-sub uppercase tracking-widest block mb-2">Nom de l'entreprise *</label>
                                        <div className="w-full bg-blue-50/30 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100/30 dark:border-blue-800/30 text-heading text-base">
                                            {store.Magazin}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sub uppercase tracking-widest block mb-2">Le Gérant *</label>
                                            <div className="w-full bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-emph">
                                                {store['Le Gérant'] || 'N/A'}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="text-sub uppercase tracking-widest block mb-2">Gamme Client</label>
                                            <div className="w-full bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-emph">
                                                {store.Gamme || 'Non définie'}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4 pt-2 border-t border-slate-50 dark:border-slate-700">
                                        <h4 className="text-sub uppercase tracking-[0.2em] mb-4">Moyens de Communication</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {[
                                                { label: 'GSM 1 (Principal)', value: store.GSM1, icon: PhoneCallIcon, type: 'tel', wa: true },
                                                { label: 'GSM 2', value: store.GSM2, icon: PhoneCallIcon, type: 'tel', wa: true },
                                                { label: 'Ligne Fixe', value: store.Phone, icon: PhoneCallIcon, type: 'tel', wa: false },
                                                { label: 'Email', value: leadEmail, icon: EnvelopeIcon, type: 'mailto', wa: false },
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-3.5 bg-slate-50/50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                                                    <div>
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase">{item.label}</p>
                                                        <p className="text-emph truncate max-w-[180px]">{item.value || 'N/A'}</p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        {item.value && (
                                                            <>
                                                                {item.wa && isWhatsAppSupported(item.value) && (
                                                                    <a href={`https://wa.me/${item.value.replace(/\s/g, '')}`} target="_blank" className="p-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:scale-110 transition-transform">
                                                                        <WhatsAppIcon className="w-4 h-4 fill-current" />
                                                                    </a>
                                                                )}
                                                                <a href={`${item.type}:${item.value}`} className="p-2 bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-200 rounded-lg hover:scale-110 transition-transform">
                                                                    <item.icon className="w-4 h-4" />
                                                                </a>
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                    
                                    <div className="pt-4 border-t border-slate-50 dark:border-slate-700">
                                        <h4 className="text-sub text-blue-600 uppercase tracking-[0.2em] mb-4">Géolocalisation</h4>
                                        <div className="space-y-6">
                                            <div>
                                                <label className="text-sub uppercase tracking-widest block mb-2">Adresse</label>
                                                <div className="w-full bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-emph">
                                                    {store.Adresse || 'N/A'}
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sub uppercase tracking-widest block mb-2">Ville *</label>
                                                    <div className="w-full bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-emph">
                                                        {store.Ville}
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sub uppercase tracking-widest block mb-2">Région</label>
                                                    <div className="w-full bg-slate-50/50 dark:bg-slate-900/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 text-emph">
                                                        {store.Région || 'N/A'}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-4 gap-2 pt-4 flex-shrink-0">
                                        <a href={`tel:${store.GSM1}`} className="flex flex-col items-center justify-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-2xl hover:bg-blue-100 transition-colors">
                                            <PhoneCallIcon className="w-5 h-5" />
                                            <span className="text-[8px] uppercase tracking-widest font-black">Appeler</span>
                                        </a>
                                        <a href={`https://wa.me/${store.GSM1}`} target="_blank" className="flex flex-col items-center justify-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 rounded-2xl hover:bg-emerald-100 transition-colors">
                                            <WhatsAppIcon className="w-5 h-5" />
                                            <span className="text-[8px] uppercase tracking-widest font-black">WhatsApp</span>
                                        </a>
                                        {leadEmail && (
                                            <a href={`mailto:${leadEmail}`} className="flex flex-col items-center justify-center gap-2 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-2xl hover:bg-amber-100 transition-colors">
                                                <EnvelopeIcon className="w-5 h-5" />
                                                <span className="text-[8px] uppercase tracking-widest font-black">Email</span>
                                            </a>
                                        )}
                                        <a href={`https://www.google.com/maps?q=${store.Localisation || store.Ville}`} target="_blank" className="flex flex-col items-center justify-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 text-purple-600 rounded-2xl hover:bg-purple-100 transition-colors">
                                            <LocationMarkerIcon className="w-5 h-5" />
                                            <span className="text-[8px] uppercase tracking-widest font-black">Maps</span>
                                        </a>
                                    </div>
                                </div>
                            </section>
                        </div>

                        {/* Column 2: Interaction History */}
                        <div className="lg:col-span-1 relative">
                            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden lg:absolute lg:inset-0 flex flex-col h-full">
                                <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex flex-col gap-4 flex-shrink-0">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="p-2.5 bg-purple-50 dark:bg-purple-900/30 rounded-xl text-purple-600">
                                                <ClockIcon className="w-6 h-6" />
                                            </div>
                                            <div>
                                                <h3 className="text-heading text-sm">Historique des Interactions</h3>
                                                <p className="text-sub tracking-tight">Suivi chronologique des activités</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-lg border border-slate-100 dark:border-slate-700">
                                            {['all', 'rdv', 'contacts'].map(filter => (
                                                <button 
                                                    key={filter}
                                                    onClick={() => setHistoryFilter(filter as any)}
                                                    className={`px-3 py-1.5 text-[9px] font-black uppercase rounded transition-all ${historyFilter === filter ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
                                                >
                                                    {filter === 'all' ? 'Tout' : filter.toUpperCase()}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex-1 p-8 space-y-10 relative overflow-y-auto custom-scrollbar">
                                    <div className="absolute left-[39px] top-10 bottom-10 w-0.5 bg-slate-100 dark:bg-slate-700"></div>

                                    {filteredHistory.length === 0 ? (
                                        <div className="text-center py-20 text-std italic">Aucun enregistrement trouvé</div>
                                    ) : filteredHistory.map((h, i) => (
                                        <div key={i} className="relative pl-14 animate-in fade-in slide-in-from-left-4 duration-300">
                                            <div className={`absolute left-[-4px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-800 z-10 shadow-sm ${h['Rendez-Vous'] ? 'bg-indigo-500' : h['Action Client'] === 'Acheter' ? 'bg-emerald-500' : 'bg-blue-600'}`}></div>
                                            
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="text-heading text-sm uppercase tracking-tight">{h['Action Client'] || 'Visite'}</h4>
                                                        {h['Rendez-Vous'] && (
                                                            <span className="bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase">RDV Fixé</span>
                                                        )}
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-300 uppercase">#{history.length - i}</span>
                                                </div>
                                                <div className="text-sub uppercase tracking-tight">
                                                    PAR {h.USER?.split('@')[0].toUpperCase()} • {h.created_at ? new Date(h.created_at).toLocaleString('fr-FR') : h.Date}
                                                </div>

                                                <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mt-3 space-y-3 shadow-sm">
                                                    {h.Note && <p className="text-std italic text-slate-600 dark:text-slate-300">"{h.Note}"</p>}
                                                    
                                                    <div className="grid grid-cols-1 gap-2 border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                                                        {(h['Contacté'] || h['Action Client'] === 'Contact') && (
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sub text-blue-500 uppercase">Contact via:</span>
                                                                <span className="text-emph">{h['Contacté'] || 'Direct'}</span>
                                                            </div>
                                                        )}
                                                        {h['Discuté'] && (
                                                            <div className="flex flex-col gap-1">
                                                                <span className="text-sub text-emerald-500 uppercase tracking-tighter">Sujet abordé:</span>
                                                                <span className="text-std bg-white dark:bg-slate-800 p-2 rounded-lg border border-slate-100 dark:border-slate-700">{h['Discuté']}</span>
                                                            </div>
                                                        )}
                                                        {h['Rendez-Vous'] && (
                                                            <div className="flex items-center gap-2 bg-indigo-50/50 dark:bg-indigo-900/20 p-2 rounded-lg border border-indigo-100 dark:border-indigo-900/30 mt-1">
                                                                <CalendarDaysIcon className="w-3.5 h-3.5 text-indigo-500" />
                                                                <span className="text-sub text-indigo-500 uppercase tracking-tighter">Prochain RDV:</span>
                                                                <span className="text-emph text-indigo-700 dark:text-indigo-300">{h['Rendez-Vous']}</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        </div>

                        {/* Column 3: Stats & Visual Overviews */}
                        <div className="lg:col-span-1 space-y-6">
                            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="p-2.5 bg-orange-50 dark:bg-orange-900/30 rounded-xl text-orange-600">
                                        <TagIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h3 className="text-heading text-sm">Classification du Lead</h3>
                                        <p className="text-sub tracking-tight">Segmentation stratégique</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sub uppercase tracking-widest mb-1.5">NIVEAU CLIENT ACTUEL</p>
                                    <p className="text-emph">{store.Gamme || 'Non spécifié'}</p>
                                </div>
                            </section>

                            {/* Historique des Achats (Collapsible) */}
                            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <button 
                                    onClick={() => setIsPurchasesOpen(!isPurchasesOpen)}
                                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="p-2.5 bg-emerald-50 dark:bg-emerald-900/30 rounded-xl text-emerald-600">
                                            <CurrencyDollarIcon className="w-5 h-5" />
                                        </div>
                                        <div className="text-left">
                                            <h3 className="text-heading text-sm uppercase tracking-tight">Historique des Achats</h3>
                                            <p className="text-sub tracking-tight">Transactions enregistrées</p>
                                        </div>
                                    </div>
                                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isPurchasesOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isPurchasesOpen && (
                                    <div className="p-6 pt-0 space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-300">
                                        {purchases.length === 0 ? (
                                            <div className="text-center py-6 text-sub italic text-[11px] border-2 border-dashed border-slate-50 dark:border-slate-700 rounded-xl">
                                                Aucune transaction d'achat
                                            </div>
                                        ) : purchases.map((p, idx) => (
                                            <div key={idx} className="p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-emerald-200 transition-colors">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className="text-emph font-black text-emerald-600 text-sm">{p.Prix.toLocaleString()} DH</span>
                                                    <span className="text-[9px] font-black text-slate-400 uppercase bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-100 dark:border-slate-700">{p.Date}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px]">
                                                    <div className="flex items-center gap-1.5 text-slate-500 font-bold">
                                                        <CubeIcon className="w-3 h-3" />
                                                        <span>QTÉ: {p.Quantité}</span>
                                                    </div>
                                                    <span className="text-slate-400 font-black uppercase tracking-tighter">PAR {p.USER?.split('@')[0]}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </section>

                            {/* Aperçu de Performance (Collapsible) */}
                            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <button 
                                    onClick={() => setIsPerformanceOpen(!isPerformanceOpen)}
                                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                                >
                                    <h3 className="text-heading text-sm uppercase tracking-wider">Aperçu de Performance</h3>
                                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isPerformanceOpen ? 'rotate-180' : ''}`} />
                                </button>
                                
                                {isPerformanceOpen && (
                                    <div className="p-6 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-300">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sub uppercase tracking-tight">Visites Totales</span>
                                            <span className="text-emph font-bold">{stats.totalVisits}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sub uppercase tracking-tight">Actions "Acheter"</span>
                                            <span className="text-emph font-bold text-emerald-600">{stats.buyActions}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sub uppercase tracking-tight">Actions "Revisiter"</span>
                                            <span className="text-emph font-bold text-orange-500">{stats.revisitActions}</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sub uppercase tracking-tight">Nb. Transactions</span>
                                            <span className="text-emph font-bold">{stats.buyActions}</span>
                                        </div>
                                        
                                        <div className="pt-2 space-y-3">
                                            <div className="flex justify-between items-center">
                                                <span className="text-sub uppercase tracking-tight text-[10px]">Contacté Téléphone</span>
                                                <span className="text-emph font-bold text-xs">{stats.phoneContacts}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sub uppercase tracking-tight text-[10px]">Contacté WhatsApp</span>
                                                <span className="text-emph font-bold text-xs">{stats.whatsappContacts}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-sub uppercase tracking-tight text-[10px]">Contacté Email</span>
                                                <span className="text-emph font-bold text-xs">{stats.emailContacts}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-700 pt-4">
                                            <span className="text-sub uppercase tracking-tight font-black text-blue-600">TOTALE BRUTE</span>
                                            <span className="text-emph font-black text-blue-600">{stats.totalValue.toLocaleString()} DH</span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-sub uppercase tracking-tight font-black">QUANTITÉ TOTALE</span>
                                            <span className="text-emph font-black">{stats.totalQuantity}</span>
                                        </div>
                                    </div>
                                )}
                            </section>

                            {/* Dates des Visites & Contacts (Collapsible) */}
                            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                                <button 
                                    onClick={() => setIsVisitDatesOpen(!isVisitDatesOpen)}
                                    className="w-full p-6 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group"
                                >
                                    <h3 className="text-heading text-sm uppercase tracking-wider">Dates des Visites & Contacts</h3>
                                    <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isVisitDatesOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isVisitDatesOpen && (
                                    <div className="p-6 pt-0 space-y-2 max-h-[400px] overflow-y-auto custom-scrollbar animate-in slide-in-from-top-2 duration-300">
                                        {history.length > 0 ? history.map((h, idx) => {
                                            const action = h['Action Client']?.toLowerCase();
                                            const method = h['Contacté']?.toLowerCase();
                                            const isCall = method?.includes('téléphone') || method?.includes('whatsapp');
                                            const isVisit = action?.includes('visite') || method?.includes('physique') || action?.includes('acheter') || action?.includes('revisiter');

                                            return (
                                                <div key={idx} className="flex items-center gap-4 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-blue-200 transition-colors">
                                                    <div className={`p-2 rounded-lg shadow-sm ${isCall ? 'bg-blue-50 text-blue-500' : isVisit ? 'bg-emerald-50 text-emerald-500' : 'bg-white dark:bg-slate-800 text-slate-400'}`}>
                                                        {isCall ? <PhoneCallIcon className="w-4 h-4" /> : isVisit ? <LocationMarkerIcon className="w-4 h-4" /> : <ClockIcon className="w-4 h-4" />}
                                                    </div>
                                                    <div className="overflow-hidden flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <p className="text-emph font-bold text-xs">
                                                                {h.created_at ? new Date(h.created_at).toLocaleDateString('fr-FR') : h.Date}
                                                            </p>
                                                            <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase ${isCall ? 'bg-blue-100 text-blue-700' : isVisit ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                                                                {isCall ? 'Appel' : isVisit ? 'Visite' : 'Autre'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between items-center mt-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase truncate">
                                                                Par {h.USER?.split('@')[0] || 'Inconnu'}
                                                            </p>
                                                            <p className="text-[9px] font-bold text-slate-500 italic">
                                                                {h['Contacté'] || h['Action Client'] || 'N/A'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        }) : (
                                            <div className="text-center py-4 text-sub italic">Aucune interaction</div>
                                        )}
                                    </div>
                                )}
                            </section>

                            {/* Coordonnées & Actions (Static Container) */}
                            <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                                <h3 className="text-heading text-sm uppercase tracking-wider mb-6">Coordonnées & Actions</h3>
                                <div className="space-y-4">
                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-700">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400">
                                            <CalendarDaysIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Prochain RDV</p>
                                            <p className="text-emph text-xs">{stats.nextAppt}</p>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-700">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400">
                                            <PhoneCallIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Téléphone / Mobile</p>
                                            <a href={`tel:${store.GSM1}`} className="text-emph text-xs hover:text-blue-600 hover:underline">{store.GSM1 || 'N/A'}</a>
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-700">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400">
                                            <EnvelopeIcon className="w-5 h-5" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Email</p>
                                            {leadEmail ? (
                                                <a href={`mailto:${leadEmail}`} className="text-emph text-xs truncate block hover:text-blue-600 hover:underline">
                                                    {leadEmail}
                                                </a>
                                            ) : (
                                                <p className="text-emph text-xs">Non renseigné</p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 flex items-center gap-4 border border-slate-100 dark:border-slate-700">
                                        <div className="p-2 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-slate-400">
                                            <LocationMarkerIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Localisation</p>
                                            <a href={`https://www.google.com/maps?q=${store.Localisation || store.Ville}`} target="_blank" className="text-emph text-xs hover:text-blue-600 hover:underline">{store.Ville}</a>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>
                </div>
            </div>

            <NewAppointmentModal 
                isOpen={isNewAppointmentModalOpen} 
                onClose={() => setIsNewAppointmentModalOpen(false)} 
                onSave={handleSaveAppointment}
                initialCustomer={currentCustomerObj}
            />
            <QuickLogModal 
                isOpen={isQuickLogModalOpen} 
                onClose={() => setIsQuickLogModalOpen(false)} 
                onSave={handleSaveQuickLog}
                initialCustomer={currentCustomerObj}
            />
        </div>
    );
};

export default AdminProspectDetailPage;
