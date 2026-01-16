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
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import NewAppointmentModal from './NewAppointmentModal.tsx';
import QuickLogModal from './QuickLogModal.tsx';
import storeService from '../services/storeService.ts';

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const ChatBubbleLeftRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
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
    
    const [isApercuOpen, setIsApercuOpen] = useState(false);
    const [isContactsOpen, setIsContactsOpen] = useState(false);
    const [isPurchaseHistoryOpen, setIsPurchaseHistoryOpen] = useState(false);
    const [isCoordonneesOpen, setIsCoordonneesOpen] = useState(false);

    const stats = useMemo(() => {
        const now = new Date();
        const hundredEightyDaysAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
        const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));

        const totalVisits = history.length;
        const buyActions = history.filter(h => h['Action Client']?.toLowerCase().includes('acheter'));
        const buyCount = buyActions.length;
        const revisitActions = history.filter(h => h['Action Client']?.toLowerCase().includes('revisiter')).length;
        const totalValue = history.reduce((sum, h) => sum + (Number(h.Prix) || 0), 0);
        const totalQuantity = history.reduce((sum, h) => sum + (Number(h.Quantité) || 0), 0);
        
        let emailCount = 0;
        let whatsappCount = 0;
        let phoneCount = 0;
        let physicsCount = 0;

        const contactHistory = history.filter(h => h['Contacté']).map(h => ({
            method: h['Contacté'],
            date: h.Date,
            user: h.USER?.split('@')[0] || 'N/A'
        }));

        history.forEach(h => {
            const method = (h['Contacté'] || '').toLowerCase().trim();
            if (method === 'email') emailCount++;
            else if (method.includes('whatsapp')) whatsappCount++;
            else if (method.includes('phone') || method.includes('téléphone') || method.includes('telephone')) phoneCount++;
            else if (method.includes('physique')) physicsCount++;
        });

        // حساب تواريخ الشراء بناءً على created_at (Date Heure)
        const orders = history.filter(i => i['Action Client']?.toLowerCase() === 'acheter');
        const sortedOrders = [...orders].sort((a, b) => {
            const dateA = new Date(a['Date Heure'] || a.created_at || a.Date).getTime();
            const dateB = new Date(b['Date Heure'] || b.created_at || b.Date).getTime();
            return dateA - dateB;
        });
        
        const firstOrder = sortedOrders[0];
        const latestOrder = sortedOrders[sortedOrders.length - 1];
        
        const firstOrderDate = firstOrder ? new Date(firstOrder['Date Heure'] || firstOrder.created_at || firstOrder.Date) : null;
        const latestOrderDate = latestOrder ? new Date(latestOrder['Date Heure'] || latestOrder.created_at || latestOrder.Date) : null;
        
        const ordersLast180Days = orders.filter(i => {
            const d = new Date(i['Date Heure'] || i.created_at || i.Date);
            return d >= hundredEightyDaysAgo;
        });
        const totalRevenueYear = orders
            .filter(i => {
                const d = new Date(i['Date Heure'] || i.created_at || i.Date);
                return d >= oneYearAgo;
            })
            .reduce((sum, i) => sum + (Number(i.Prix) || 0), 0);

        let type = 'Lead';
        if (store.is_blocked) {
            type = 'Client Bloqué';
        } else if (totalRevenueYear >= 40000) {
            type = 'Compte Stratégique';
        } else if (ordersLast180Days.length >= 2) {
            type = 'Client Actif';
        } else if (latestOrderDate && latestOrderDate < hundredEightyDaysAgo) {
            type = 'Client Inactif';
        } else if (orders.length === 1) {
            type = 'Nouveau Client';
        }

        const nextAppt = history
            .filter(h => h['Rendez-Vous'])
            .map(h => new Date(h['Rendez-Vous']!))
            .filter(d => d >= now)
            .sort((a, b) => a.getTime() - b.getTime())[0];

        return { 
            totalVisits, 
            buyCount, 
            buyActions,
            revisitActions, 
            totalValue, 
            totalQuantity,
            emailCount,
            whatsappCount,
            phoneCount,
            physicsCount,
            contactHistory,
            clientType: type,
            firstOrderDate,
            latestOrderDate,
            nextAppt: apptDateString(nextAppt)
        };
    }, [history, store.is_blocked]);

    function apptDateString(date?: Date) {
        if (!date) return 'Aucun';
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    const formatVisitDate = (h: Store) => {
        const timestamp = h['Date Heure'] || h.created_at;
        if (!timestamp) return h.Date;
        
        const dateObj = new Date(timestamp);
        if (isNaN(dateObj.getTime())) return h.Date;

        return dateObj.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).replace(':', 'h').replace(' ', ' à ');
    };

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
    const createdDate = store.created_at ? new Date(store.created_at).toLocaleString('fr-FR') : 'Inconnue';

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

    const leadEmail = store.Email || store.email;

    return (
        <div className="flex flex-col h-full bg-[#F7F8FA] dark:bg-slate-900 font-sans overflow-hidden">
            <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4 sticky top-0 z-20">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                            <button onClick={onClose} className="hover:text-blue-600 flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5"></path>
                                </svg> 
                                Gestion des Leads
                            </button>
                            <span>/</span>
                            <span>Détails du Lead</span>
                        </div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{store.Magazin}</h1>
                        <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <span>ID: {displayId}</span>
                            <span>•</span>
                            <span>Créé le {createdDate}</span>
                            <span>•</span>
                            <span>Valeur estimée: {stats.totalValue.toLocaleString()} DH</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => onEdit(store)}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-all shadow-sm"
                        >
                            <EditIcon className="w-4 h-4 text-amber-500" />
                            Modifier
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg font-medium hover:shadow-md transition-all">
                            <SparklesIcon className="w-5 h-5 text-yellow-300" />
                            Stratégie IA
                        </button>
                    </div>
                </div>
            </header>

            <main className="p-6 overflow-y-auto">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <UserCircleIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-white">Informations de Contact</h2>
                                    <p className="text-xs text-slate-500">Détails du prospect et de l'entreprise</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Nom de l'Entreprise <span className="text-red-500">*</span></label>
                                    <input readOnly className="w-full text-sm border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 dark:text-white px-3 py-2 font-bold" type="text" value={store.Magazin} name="Magazin" />
                                </div>
                                
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Le Gérant <span className="text-red-500">*</span></label>
                                    <input readOnly className="w-full text-sm border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 dark:text-white px-3 py-2" type="text" value={store['Le Gérant'] || ''} name="Gérant" />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">GSM 1 <span className="text-red-500">*</span></label>
                                        <input readOnly className="w-full text-sm border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 dark:text-white px-3 py-2 font-bold" type="text" value={store.GSM1 || ''} name="GSM1" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">GSM 2</label>
                                        <input readOnly className="w-full text-sm border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 dark:text-white px-3 py-2 font-bold" type="text" value={store.GSM2 || ''} name="GSM2" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Phone (Fixe)</label>
                                        <input readOnly className="w-full text-sm border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 dark:text-white px-3 py-2" type="text" value={store.Phone || ''} name="Phone" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Email</label>
                                        <input readOnly className="w-full text-sm border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 dark:text-white px-3 py-2" type="email" value={leadEmail || ''} name="Email" />
                                    </div>
                                </div>

                                <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-4 mb-3 border-b border-slate-50 dark:border-slate-700 pb-1">Localisation & Adresse</p>
                                </div>

                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Adresse</label>
                                    <input readOnly className="w-full text-sm border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 dark:text-white px-3 py-2" type="text" value={store.Adresse || ''} name="Adresse" />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Ville <span className="text-red-500">*</span></label>
                                        <input readOnly className="w-full text-sm border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 dark:text-white px-3 py-2" type="text" value={store.Ville} name="Ville" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Région</label>
                                        <input readOnly className="w-full text-sm border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700 dark:text-white px-3 py-2" type="text" value={store.Région || ''} name="Région" />
                                    </div>
                                </div>

                                <div className="pt-6 mt-6 border-t border-slate-100 dark:border-slate-700 space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <button 
                                            onClick={() => setIsQuickLogModalOpen(true)}
                                            style={{ backgroundColor: 'rgb(220, 252, 231)' }}
                                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-green-800 font-bold text-sm shadow-sm transition-all active:scale-95"
                                        >
                                            <ClipboardDocumentListIcon className="w-5 h-5 text-green-600" />
                                            Contact
                                        </button>
                                        <button 
                                            onClick={() => setIsNewAppointmentModalOpen(true)}
                                            style={{ backgroundColor: 'rgb(74, 222, 128)' }}
                                            className="flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-white font-bold text-sm shadow-lg shadow-green-200 dark:shadow-none transition-all active:scale-95"
                                        >
                                            <CalendarDaysIcon className="w-5 h-5" />
                                            RDV
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2">
                                        <a href={`tel:${store.GSM1}`} className="flex flex-col items-center justify-center p-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
                                            <PhoneCallIcon className="w-5 h-5 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">Appeler</span>
                                        </a>
                                        <a href={`https://wa.me/${store.GSM1?.replace(/\s/g, '')}`} target="_blank" className="flex flex-col items-center justify-center p-2 bg-green-50 dark:bg-blue-900/20 text-green-600 dark:text-blue-400 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors">
                                            <WhatsAppIcon className="w-5 h-5 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">WhatsApp</span>
                                        </a>
                                        <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.Magazin + ' ' + store.Ville)}`} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center justify-center p-2 bg-purple-50 dark:bg-blue-900/20 text-purple-600 dark:text-blue-400 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors">
                                            <LocationMarkerIcon className="w-5 h-5 mb-1" />
                                            <span className="text-[10px] font-bold uppercase">GPS</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 h-full">
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                                        <ClockIcon className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div>
                                        <h2 className="font-bold text-slate-900 dark:text-white">Historique des Interactions</h2>
                                        <p className="text-xs text-slate-500">Chronologie des échanges (created_at)</p>
                                    </div>
                                </div>
                            </div>
                            <div className="relative border-l-2 border-slate-100 dark:border-slate-700 ml-3 space-y-8 overflow-y-auto max-h-[600px] hide-scrollbar">
                                {history.map((h, i) => (
                                    <div key={i} className="relative pl-8">
                                        <div className={`absolute -left-[9px] top-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-800 ${h['Action Client'] === 'Acheter' ? 'bg-emerald-500' : h['Action Client'] === 'Revisiter' ? 'bg-amber-500' : 'bg-blue-500'}`}></div>
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h4 className="text-sm font-semibold text-slate-800 dark:text-white">{h['Action Client'] || 'Visite'}</h4>
                                                <p className="text-xs text-slate-500 mt-0.5">Par {h.USER?.split('@')[0]} • {formatVisitDate(h)}</p>
                                            </div>
                                        </div>
                                        
                                        {(h['Contacté'] || h['Discuté']) && (
                                            <div className="mt-3 flex flex-col gap-2">
                                                {h['Contacté'] && (
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-tight">Contacté via:</span>
                                                        <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">{h['Contacté']}</span>
                                                    </div>
                                                )}
                                                {h['Discuté'] && (
                                                    <div className="bg-slate-50/50 dark:bg-slate-900/40 p-3 rounded-lg border-l-2 border-indigo-400">
                                                        <span className="text-[10px] font-black text-indigo-500 uppercase block mb-1">Discuté:</span>
                                                        <p className="text-sm text-slate-700 dark:text-slate-200">{h['Discuté']}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        {h.Note && (
                                            <div className="mt-2">
                                                <span className="text-[10px] font-black text-slate-400 uppercase block mb-1">Note:</span>
                                                <p className="text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg italic">"{h.Note}"</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                {history.length === 0 && (
                                    <div className="pl-8 text-slate-400 italic text-sm">Aucune interaction enregistrée</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                    <TagIcon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                </div>
                                <div>
                                    <h2 className="font-bold text-slate-900 dark:text-white">Classification du Lead</h2>
                                    <p className="text-xs text-slate-500">Catégorisation و تتبع المشتريات</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Niveau Client</label>
                                    <input readOnly className="w-full text-sm border-slate-200 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 dark:text-white px-3 py-2 font-medium" type="text" value={store.Gamme || 'Non défini'} name="Gamme" />
                                </div>
                                <div>
                                    <label className="block text-xs font-semibold text-slate-500 mb-1">Statut Client</label>
                                    <div className={`w-full text-sm border border-slate-200 dark:border-slate-600 rounded-md px-3 py-2 font-bold ${
                                        stats.clientType === 'Client Bloqué' ? 'bg-red-50 text-red-600 border-red-100' :
                                        stats.clientType === 'Compte Stratégique' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                        stats.clientType === 'Client Actif' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        stats.clientType === 'Client Inactif' ? 'bg-orange-50 text-orange-600 border-orange-100' :
                                        stats.clientType === 'Nouveau Client' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                        'bg-slate-50 text-slate-600'
                                    }`}>
                                        {stats.clientType}
                                    </div>
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Premier Achat</label>
                                        <div className="w-full text-xs border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700/50 px-3 py-2 font-bold text-slate-700 dark:text-slate-200">
                                            {stats.firstOrderDate ? stats.firstOrderDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Aucun'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-500 mb-1">Dernier Achat</label>
                                        <div className="w-full text-xs border border-slate-200 dark:border-slate-600 rounded-md bg-slate-50 dark:bg-slate-700/50 px-3 py-2 font-bold text-slate-700 dark:text-slate-200">
                                            {stats.latestOrderDate ? stats.latestOrderDate.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : 'Aucun'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={() => setIsApercuOpen(!isApercuOpen)}
                                className="w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                                        <SparklesIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Aperçu Rapide</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">Performances clés</p>
                                    </div>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isApercuOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isApercuOpen && (
                                <div className="p-5 space-y-3 text-sm animate-in slide-in-from-top-2">
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Priorité (Calc.)</span>
                                        <span className={`font-medium px-2 py-0.5 rounded text-xs ${stats.buyCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-green-100 text-green-700'}`}>
                                            {stats.buyCount > 0 ? 'Élevée' : 'Normale'}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Niveau Client</span>
                                        <span className="font-medium text-slate-800 dark:text-white">{store.Gamme || 'N/A'}</span>
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-slate-700 my-2"></div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Email</span>
                                        <span className="font-medium text-slate-800 dark:text-white">{stats.emailCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">WhatsApp</span>
                                        <span className="font-medium text-slate-800 dark:text-white">{stats.whatsappCount}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Téléphone</span>
                                        <span className="font-medium text-slate-800 dark:text-white">{stats.phoneCount}</span>
                                    </div>
                                    <div className="border-t border-slate-100 dark:border-slate-700 my-2"></div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Visites Totales</span>
                                        <span className="font-medium text-slate-800 dark:text-white">{stats.totalVisits}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-slate-500">Actions "Acheter"</span>
                                        <span className="font-medium text-green-600">{stats.buyCount}</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={() => setIsContactsOpen(!isContactsOpen)}
                                className="w-full flex items-center justify-between p-5 bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <ChatBubbleLeftRightIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Journal des Contacts</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">Sujets et types d'appels</p>
                                    </div>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isContactsOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isContactsOpen && (
                                <div className="p-4 bg-white dark:bg-slate-800 animate-in slide-in-from-top-2">
                                    {stats.contactHistory.length > 0 ? (
                                        <div className="space-y-3">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs text-left">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-tighter">
                                                            <th className="pb-2 font-black">Type</th>
                                                            <th className="pb-2 text-right font-black">Date</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                                        {stats.contactHistory.map((item, idx) => (
                                                            <tr key={idx} className="text-slate-700 dark:text-slate-300">
                                                                <td className="py-2.5">
                                                                    <span className="font-bold text-blue-600 dark:text-blue-400">{item.method}</span>
                                                                    <p className="text-[9px] text-slate-400 font-medium">Par {item.user}</p>
                                                                </td>
                                                                <td className="py-2.5 text-right font-medium text-slate-500">{item.date}</td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center text-slate-400 italic text-xs">Aucun contact enregistré</div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700">
                            <button 
                                onClick={() => setIsPurchaseHistoryOpen(!isPurchaseHistoryOpen)}
                                className="w-full flex items-center justify-between p-5 bg-emerald-50/50 dark:bg-emerald-900/10 hover:bg-emerald-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                        <CurrencyDollarIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Historique des Achats</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">Détails des commandes</p>
                                    </div>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isPurchaseHistoryOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isPurchaseHistoryOpen && (
                                <div className="p-4 bg-white dark:bg-slate-800 animate-in slide-in-from-top-2 duration-300">
                                    {stats.buyActions.length > 0 ? (
                                        <div className="space-y-4">
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-xs text-left">
                                                    <thead>
                                                        <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-400 font-bold uppercase tracking-tighter">
                                                            <th className="pb-2 font-black">Date</th>
                                                            <th className="pb-2 text-right font-black">Montant</th>
                                                            <th className="pb-2 text-right font-black">Qté</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                                                        {stats.buyActions.map((item, idx) => (
                                                            <tr key={idx} className="text-slate-700 dark:text-slate-300">
                                                                <td className="py-2.5 font-medium">{item.Date}</td>
                                                                <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">{Number(item.Prix).toLocaleString()} DH</td>
                                                                <td className="py-2.5 text-right"><span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-bold">{item.Quantité}</span></td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                            
                                            <div className="pt-3 border-t-2 border-dashed border-slate-100 dark:border-slate-700 space-y-2">
                                                <div className="flex justify-between items-center text-sm font-black">
                                                    <span className="text-slate-500 uppercase tracking-tighter text-xs">Total Montant</span>
                                                    <span className="text-emerald-600 dark:text-emerald-400">{stats.totalValue.toLocaleString()} DH</span>
                                                </div>
                                                <div className="flex justify-between items-center text-sm font-black">
                                                    <span className="text-slate-500 uppercase tracking-tighter text-xs">Total Quantité</span>
                                                    <span className="text-blue-600 dark:text-blue-400">{stats.totalQuantity} Pièces</span>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-8 text-center">
                                            <CurrencyDollarIcon className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                                            <p className="text-xs text-slate-400 font-medium italic">Aucun achat enregistré</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden border border-slate-100 dark:border-slate-700 transition-all duration-300">
                            <button 
                                onClick={() => setIsCoordonneesOpen(!isCoordonneesOpen)}
                                className="w-full flex items-center justify-between p-5 bg-slate-50/50 dark:bg-slate-900/10 hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-slate-100 dark:bg-slate-900/30 rounded-lg text-slate-600 dark:text-slate-400">
                                        <LocationMarkerIcon className="w-5 h-5" />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-slate-900 dark:text-white text-sm">Coordonnées & Actions</h3>
                                        <p className="text-[10px] text-slate-500 uppercase font-black tracking-tight">Contact et planning</p>
                                    </div>
                                </div>
                                <ChevronDownIcon className={`w-5 h-5 text-slate-400 transition-transform duration-300 ${isCoordonneesOpen ? 'rotate-180' : ''}`} />
                            </button>

                            {isCoordonneesOpen && (
                                <div className="p-5 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                    <div className="w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-start gap-3 justify-between group">
                                        <div className="flex items-start gap-3">
                                            <CalendarDaysIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                                            <div>
                                                <span className="block font-medium text-slate-700 dark:text-slate-200">Prochain RDV</span>
                                                <span className="text-xs text-slate-500">{stats.nextAppt}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => setIsNewAppointmentModalOpen(true)} className="text-blue-600 hover:text-blue-800 opacity-0 group-hover:opacity-100 transition-opacity" title="Voir les rendez-vous">
                                            <CalendarDaysIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                    <div className="w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-start gap-3">
                                        <PhoneCallIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <span className="block font-medium text-slate-700 dark:text-slate-200">Téléphone / Mobile</span>
                                            <span className="text-xs text-slate-500 block">{store.GSM1 || 'N/A'}</span>
                                        </div>
                                    </div>
                                    <div className="w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-start gap-3">
                                        <EnvelopeIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <span className="block font-medium text-slate-700 dark:text-slate-200">Email</span>
                                            <span className="text-xs text-slate-500">{leadEmail || 'Non renseigné'}</span>
                                        </div>
                                    </div>
                                    <div className="w-full px-3 py-2 text-sm text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 rounded-lg flex items-start gap-3">
                                        <LocationMarkerIcon className="w-4 h-4 text-slate-400 mt-0.5" />
                                        <div>
                                            <span className="block font-medium text-slate-700 dark:text-slate-200">Localisation</span>
                                            <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.Magazin + ' ' + store.Ville)}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-500 hover:underline truncate block max-w-[180px]">
                                                {store.Ville}
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </main>

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