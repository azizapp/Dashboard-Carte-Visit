import React, { useMemo, useState } from 'react';
import { Store, Customer } from '../types.ts';
import UsersIcon from './icons/UsersIcon.tsx';
import UserCircleIcon from './icons/UserCircleIcon.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import ChartBarIcon from './icons/ChartBarIcon.tsx';
import ArrowTrendingUpIcon from './icons/ArrowTrendingUpIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import PhoneCallIcon from './icons/PhoneCallIcon.tsx';
import EnvelopeIcon from './icons/EnvelopeIcon.tsx';
import CameraIcon from './icons/CameraIcon.tsx';
import LocationMarkerIcon from './icons/LocationMarkerIcon.tsx';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentListIcon.tsx';
import TagIcon from './icons/TagIcon.tsx';
import WhatsAppIcon from './icons/WhatsAppIcon.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import CubeIcon from './icons/CubeIcon.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';
import ClockIcon from './icons/ClockIcon.tsx';
import StoreIcon from './icons/StoreIcon.tsx';
import { GoogleGenAI } from "@google/genai";

interface HomePageProps {
    stores: Store[];
    authenticatedUser: string;
}

const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const FunnelIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
);

const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
    </svg>
);

const TopClientsChart = ({ data }: { data: { name: string; value: number }[] }) => {
    if (!data || data.length === 0) return (
        <div className="h-64 flex items-center justify-center text-slate-300 italic text-sm">
            Aucune donnée de vente pour cette période
        </div>
    );
    const maxValue = Math.max(...data.map(d => d.value)) || 1;
    return (
        <div className="w-full overflow-x-auto custom-scrollbar">
            <div className="h-64 min-w-[1200px] flex items-end gap-3 pt-12 pb-4 px-2">
                {data.map((item, index) => {
                    const heightPercent = (item.value / maxValue) * 100;
                    return (
                        <div key={index} className="flex-1 flex flex-col justify-end group relative h-full">
                            <div 
                                className="w-full bg-blue-600 rounded-t-sm transition-all duration-300 group-hover:bg-blue-500 shadow-sm" 
                                style={{ height: `${heightPercent}%` }}
                            >
                                <div className="absolute -top-9 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 font-medium">
                                    {item.value.toLocaleString()} DH
                                </div>
                            </div>
                            <div className="mt-3 text-[8px] text-slate-400 font-medium truncate text-center uppercase tracking-tight w-full px-0.5 group-hover:text-slate-600 transition-colors" title={item.name}>
                                {item.name}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const ProgressBar = ({ label, count, total, colorClass, showPercent = true }: { label: string, count: number, total: number, colorClass: string, showPercent?: boolean }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="mb-3">
            <div className="flex justify-between items-center mb-1.5">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{label}</span>
                <span className="text-[11px] font-bold text-slate-700 dark:text-white">{showPercent ? `${percentage}%` : ''} ({count})</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-700 ease-out ${colorClass}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

const QualityStat = ({ icon: Icon, label, value, color }: any) => (
    <div className="flex flex-col items-center justify-center p-3 bg-slate-50/50 dark:bg-slate-900/20 rounded-xl border border-slate-50 dark:border-slate-700 hover:border-slate-200 transition-all group shadow-sm">
        <Icon className={`w-4 h-4 ${color} mb-1.5 opacity-60 group-hover:opacity-100 transition-opacity`} />
        <p className="text-[9px] font-black text-slate-400 uppercase text-center mb-1 tracking-tighter leading-tight h-5 flex items-center">{label}</p>
        <h4 className="text-[13px] font-black text-slate-800 dark:text-white">{value}</h4>
    </div>
);

const AnalysisModal: React.FC<any> = ({ isOpen, onClose, content, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-600 text-white">
                    <div className="flex items-center gap-3">
                        <SparklesIcon className="w-6 h-6 text-yellow-300" />
                        <h3 className="text-xl font-bold tracking-tight">Audit Stratégique IA</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>
                <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <SpinnerIcon className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
                            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">L'IA analyse vos performances commerciales...</p>
                        </div>
                    ) : (
                        <div className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: String(content || "") }} />
                    )}
                </div>
                <footer className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Fermer</button>
                </footer>
            </div>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = ({ stores, authenticatedUser }) => {
    const [showFilters, setShowFilters] = useState(false);
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    
    // States for filtering
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedUser, setSelectedUser] = useState('all');
    const [selectedCity, setSelectedCity] = useState('all');
    const [selectedPeriod, setSelectedPeriod] = useState('all');

    // Get unique values for dropdowns
    const uniqueUsers = useMemo(() => Array.from(new Set(stores.map(s => s.USER))).filter(Boolean).sort(), [stores]);
    const uniqueCities = useMemo(() => Array.from(new Set(stores.map(s => s.Ville))).filter(Boolean).sort(), [stores]);

    const stats = useMemo(() => {
        let finalStart: Date | null = startDate ? new Date(startDate) : null;
        let finalEnd: Date | null = endDate ? new Date(endDate) : null;

        if (selectedPeriod !== 'all' && selectedPeriod !== 'custom') {
            const now = new Date();
            const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            
            switch(selectedPeriod) {
                case 'today':
                    finalStart = todayStart;
                    finalEnd = new Date(todayStart.getTime() + 86400000);
                    break;
                case 'this_week':
                    const day = now.getDay();
                    finalStart = new Date(todayStart.getTime() - day * 86400000);
                    finalEnd = now;
                    break;
                case 'this_month':
                    finalStart = new Date(now.getFullYear(), now.getMonth(), 1);
                    finalEnd = now;
                    break;
                case 'last_month':
                    finalStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                    finalEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                    break;
                case 'this_quarter':
                    const qMonth = Math.floor(now.getMonth() / 3) * 3;
                    finalStart = new Date(now.getFullYear(), qMonth, 1);
                    finalEnd = now;
                    break;
                case 'last_quarter':
                    const pqMonth = (Math.floor(now.getMonth() / 3) * 3) - 3;
                    finalStart = new Date(now.getFullYear(), pqMonth, 1);
                    finalEnd = new Date(now.getFullYear(), pqMonth + 3, 0);
                    break;
                case 'this_year':
                    finalStart = new Date(now.getFullYear(), 0, 1);
                    finalEnd = now;
                    break;
                case 'last_year':
                    finalStart = new Date(now.getFullYear() - 1, 0, 1);
                    finalEnd = new Date(now.getFullYear() - 1, 11, 31);
                    break;
            }
        }

        const filteredStores = stores.filter(store => {
            if (selectedUser !== 'all' && store.USER !== selectedUser) return false;
            if (selectedCity !== 'all' && store.Ville !== selectedCity) return false;
            const storeDate = new Date(store['Date Heure'] || store.Date);
            if (isNaN(storeDate.getTime())) return true;
            if (finalStart) {
                finalStart.setHours(0, 0, 0, 0);
                if (storeDate < finalStart) return false;
            }
            if (finalEnd) {
                finalEnd.setHours(23, 59, 59, 999);
                if (storeDate > finalEnd) return false;
            }
            return true;
        });

        const totalVisits = filteredStores.length;
        const uniqueMagazinsCount = new Set(filteredStores.map(s => s.Magazin.trim().toLowerCase())).size;
        
        let revenue = 0, totalQty = 0, buyActions = 0, revisitActions = 0, visitActionsCount = 0;
        let hasGsm = 0, hasEmail = 0, hasGps = 0, hasImage = 0, hasNote = 0, hasRendezVous = 0;
        
        // جودة البيانات الجديدة
        let hasName = 0, hasManager = 0, hasCity = 0, hasRegion = 0, hasAddress = 0, hasGsm1 = 0, hasGsm2 = 0, hasGamme = 0, hasPhone = 0;

        const cityCounts: Record<string, number> = {};
        const clientSales: Record<string, number> = {};
        const userStats: Record<string, { visits: number, revenue: number }> = {};
        const appointments: any[] = [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const uniqueStoreGammeMap = new Map<string, string>();
        const processedUniqueMagazins = new Set<string>();

        filteredStores.forEach(store => {
            const magKey = store.Magazin.trim().toLowerCase();
            const action = (store['Action Client'] || '').trim().toLowerCase();
            const user = store.USER ? store.USER.split('@')[0] : 'Inconnu';
            
            if (!uniqueStoreGammeMap.has(magKey)) uniqueStoreGammeMap.set(magKey, store.Gamme || 'Moyenne');
            if (!userStats[user]) userStats[user] = { visits: 0, revenue: 0 };
            userStats[user].visits++;

            // حساب الأفعال
            if (action === 'acheter') {
                const p = Number(store.Prix) || 0;
                revenue += p;
                totalQty += Number(store.Quantité) || 0;
                buyActions++;
                clientSales[store.Magazin] = (clientSales[store.Magazin] || 0) + p;
                userStats[user].revenue += p;
            } else if (action === 'revisiter') {
                revisitActions++;
            } else if (action === 'visiter') {
                visitActionsCount++;
            }

            // إكمال بيانات الزبائن (نحسبها للزيارات الفريدة لكل متجر لضمان دقة نسبة جودة "القاعدة")
            if (!processedUniqueMagazins.has(magKey)) {
                if (store.Magazin) hasName++;
                if (store['Le Gérant']) hasManager++;
                if (store.Ville) hasCity++;
                if (store.Région) hasRegion++;
                if (store.Adresse) hasAddress++;
                if (store.GSM1) hasGsm1++;
                if (store.GSM2) hasGsm2++;
                if (store.Phone) hasPhone++;
                if (store.Gamme) hasGamme++;
                if (store.Email) hasEmail++;
                if (store.Localisation) hasGps++;
                processedUniqueMagazins.add(magKey);
            }

            if (store.Image) hasImage++;
            if (store.Note) hasNote++;
            if (store['Rendez-Vous']) {
                hasRendezVous++;
                const rdvDate = new Date(store['Rendez-Vous']);
                if (!isNaN(rdvDate.getTime()) && rdvDate >= today) {
                    appointments.push({ 
                        store, 
                        date: rdvDate, 
                        user,
                        days: Math.ceil((rdvDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)) 
                    });
                }
            }

            if (store.Ville) cityCounts[store.Ville] = (cityCounts[store.Ville] || 0) + 1;
        });

        const gCounts = { haute: 0, hauteMoyenne: 0, moyenne: 0, economie: 0 };
        uniqueStoreGammeMap.forEach(g => {
            if (g === 'Haute') gCounts.haute++;
            else if (g === 'Haute et Moyenne') gCounts.hauteMoyenne++;
            else if (g === 'Moyenne') gCounts.moyenne++;
            else gCounts.economie++;
        });

        return {
            totalVisits, uniqueMagazinsCount, revenue, totalQty, buyActions, revisitActions, visitActionsCount,
            quality: { 
                gsm: hasGsm1, 
                email: hasEmail, 
                gps: hasGps, 
                image: hasImage, 
                note: hasNote, 
                rdv: hasRendezVous,
                name: hasName,
                manager: hasManager,
                city: hasCity,
                region: hasRegion,
                address: hasAddress,
                gsm2: hasGsm2,
                phone: hasPhone,
                gamme: hasGamme
            },
            gamme: { ...gCounts, total: uniqueStoreGammeMap.size },
            topRegions: Object.entries(cityCounts).sort((a,b) => b[1] - a[1]),
            topClients: Object.entries(clientSales).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 20),
            userPerformance: Object.entries(userStats).map(([name, s]) => ({ name, ...s, percent: totalVisits > 0 ? (s.visits / totalVisits * 100) : 0 })).sort((a,b) => b.revenue - a.revenue),
            appointments: appointments.sort((a,b) => a.date.getTime() - b.date.getTime()).slice(0, 10)
        };
    }, [stores, startDate, endDate, selectedUser, selectedCity, selectedPeriod]);

    const generateAnalysis = async () => {
        setIsAnalyzing(true);
        setShowAnalysisModal(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Génère un audit de performance pour Apollo Eyewear. Données: CA=${stats.revenue}DH, Leads=${stats.totalVisits}, Conversion=${(stats.buyActions/stats.totalVisits*100).toFixed(1)}%. Format HTML Tailwind avec plans d'action.`,
            });
            setAnalysisResult(response.text || "Erreur de génération.");
        } catch (e) { setAnalysisResult("Erreur lors de l'analyse."); }
        finally { setIsAnalyzing(false); }
    };

    const resetFilters = () => {
        setStartDate('');
        setEndDate('');
        setSelectedUser('all');
        setSelectedCity('all');
        setSelectedPeriod('all');
    };

    const isFilterActive = startDate || endDate || selectedUser !== 'all' || selectedCity !== 'all' || selectedPeriod !== 'all';

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-20 bg-[#F7F8FA] dark:bg-slate-900 min-h-screen font-sans">
            <AnalysisModal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} content={analysisResult} isLoading={isAnalyzing} />

            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-800 dark:text-white tracking-tight">Tableau de Bord Global</h1>
                    <p className="text-xs text-slate-500 font-bold uppercase tracking-[0.2em] mt-1.5">Vue d'ensemble analytique de toutes les données collectées</p>
                </div>
                <button onClick={generateAnalysis} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all font-bold text-xs uppercase tracking-wider">
                    <SparklesIcon className="w-5 h-5 text-yellow-300" /> Analyser avec IA
                </button>
            </div>

            {/* Filter Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all">
                <button 
                    onClick={() => setShowFilters(!showFilters)} 
                    className={`w-full flex items-center justify-between p-4 hover:bg-slate-50 transition-colors ${showFilters ? 'bg-slate-50 dark:bg-slate-700/50' : ''}`}
                >
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-sm">
                        <FunnelIcon className="w-5 h-5" /> 
                        Filtres { isFilterActive && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full ml-2">Actif</span> }
                    </div>
                    <div className="flex items-center gap-3">
                        {isFilterActive && (
                            <button 
                                onClick={(e) => { e.stopPropagation(); resetFilters(); }} 
                                className="text-[10px] font-black text-slate-400 uppercase hover:text-red-500 transition-colors"
                            >
                                Réinitialiser
                            </button>
                        )}
                        <ChevronDownIcon className={`w-5 h-5 text-slate-300 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
                    </div>
                </button>
                
                {showFilters && (
                    <div className="p-6 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 animate-in slide-in-from-top-1 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-end">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <UserCircleIcon className="w-3.5 h-3.5" /> Utilisateur
                                </label>
                                <select 
                                    value={selectedUser} 
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm"
                                >
                                    <option value="all">Tous les vendeurs</option>
                                    {uniqueUsers.map(u => <option key={u} value={u}>{u.split('@')[0]}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <MapIcon className="w-3.5 h-3.5" /> Ville
                                </label>
                                <select 
                                    value={selectedCity} 
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm"
                                >
                                    <option value="all">Toutes les villes</option>
                                    {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1.5">
                                    <ClockIcon className="w-3.5 h-3.5" /> Période
                                </label>
                                <select 
                                    value={selectedPeriod} 
                                    onChange={(e) => {
                                        setSelectedPeriod(e.target.value);
                                        if (e.target.value !== 'custom' && e.target.value !== 'all') {
                                            setStartDate('');
                                            setEndDate('');
                                        }
                                    }}
                                    className="w-full bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 rounded-xl px-3 py-2.5 text-xs font-bold dark:text-white outline-none focus:ring-2 focus:ring-indigo-500 appearance-none shadow-sm"
                                >
                                    <option value="all">Historique Complet</option>
                                    <option value="today">Aujourd'hui</option>
                                    <option value="this_week">Cette semaine</option>
                                    <option value="this_month">Ce mois-ci</option>
                                    <option value="last_month">Mois dernier</option>
                                    <option value="this_quarter">Ce trimestre (3m)</option>
                                    <option value="last_quarter">Trimestre dernier (3m)</option>
                                    <option value="this_year">Cette année</option>
                                    <option value="last_year">Année dernière</option>
                                    <option value="custom">Plage personnalisée...</option>
                                </select>
                            </div>

                            {selectedPeriod === 'custom' && (
                                <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-4 animate-in slide-in-from-top-2 pt-2 border-t border-slate-50 dark:border-slate-700">
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 ml-1 uppercase">Du (Date de début)</label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-2.5 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold text-slate-500 mb-1.5 ml-1 uppercase">Au (Date de fin)</label>
                                        <div className="relative">
                                            <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            <input 
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="block w-full pl-10 pr-3 py-2.5 text-xs font-bold rounded-xl border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* PERFORMANCE Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative overflow-hidden group">
                    <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg w-fit mb-5"><CurrencyDollarIcon className="w-6 h-6" /></div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{stats.revenue.toLocaleString()} DH</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">Chiffre d'Affaires</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm relative">
                    <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg w-fit mb-5"><UsersIcon className="w-6 h-6" /></div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{stats.totalVisits}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">Total Interactions</p>
                    <p className="text-[9px] text-slate-400 font-medium italic mt-0.5">{stats.uniqueMagazinsCount} Magazins Visités</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="p-2.5 bg-purple-50 text-purple-600 rounded-lg w-fit mb-5"><CubeIcon className="w-6 h-6" /></div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{stats.totalQty} Pièces</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">Volume de Ventes</p>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg w-fit mb-5"><CalendarDaysIcon className="w-6 h-6" /></div>
                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{stats.quality.rdv}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase mt-1 tracking-wider">RDV Planifiés</p>
                </div>
            </div>

            {/* Analysis Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                
                {/* Left side stats */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Quality Card Enhanced */}
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-[#4407EB]">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                                <ClipboardDocumentCheckIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm uppercase tracking-tight">Qualité de la Base & Actions</h3>
                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Complétude des données (Base Clients: {stats.uniqueMagazinsCount})</p>
                            </div>
                        </div>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                            {/* Actions Group */}
                            <QualityStat icon={CurrencyDollarIcon} label="Acheter" value={`${Math.round(stats.buyActions / (stats.totalVisits || 1) * 100)}%`} color="text-emerald-500" />
                            <QualityStat icon={ArrowTrendingUpIcon} label="Revisiter" value={`${Math.round(stats.revisitActions / (stats.totalVisits || 1) * 100)}%`} color="text-amber-500" />
                            <QualityStat icon={UsersIcon} label="Visiter" value={`${Math.round(stats.visitActionsCount / (stats.totalVisits || 1) * 100)}%`} color="text-blue-500" />
                            
                            {/* Data Completeness Group (Based on Unique Customers) */}
                            <QualityStat icon={StoreIcon} label="Name" value={`${Math.round(stats.quality.name / (stats.uniqueMagazinsCount || 1) * 100)}%`} color="text-indigo-500" />
                            <QualityStat icon={UserCircleIcon} label="Manager" value={`${Math.round(stats.quality.manager / (stats.uniqueMagazinsCount || 1) * 100)}%`} color="text-indigo-400" />
                            <QualityStat icon={MapIcon} label="City" value={`${Math.round(stats.quality.city / (stats.uniqueMagazinsCount || 1) * 100)}%`} color="text-sky-500" />
                            <QualityStat icon={LocationMarkerIcon} label="Region" value={`${Math.round(stats.quality.region / (stats.uniqueMagazinsCount || 1) * 100)}%`} color="text-sky-400" />
                            <QualityStat icon={LocationMarkerIcon} label="Address" value={`${Math.round(stats.quality.address / (stats.uniqueMagazinsCount || 1) * 100)}%`} color="text-sky-600" />
                            <QualityStat icon={PhoneCallIcon} label="GSM 1" value={`${Math.round(stats.quality.gsm / (stats.uniqueMagazinsCount || 1) * 100)}%`} color="text-emerald-500" />
                            <QualityStat icon={PhoneCallIcon} label="GSM 2" value={`${Math.round(stats.quality.gsm2 / (stats.uniqueMagazinsCount || 1) * 100)}%`} color="text-emerald-400" />
                            <QualityStat icon={PhoneCallIcon} label="Phone" value={`${Math.round(stats.quality.phone / (stats.uniqueMagazinsCount || 1) * 100)}%`} color="text-blue-400" />
                            <QualityStat icon={TagIcon} label="Gamme" value={`${Math.round(stats.quality.gamme / (stats.uniqueMagazinsCount || 1) * 100)}%`} color="text-purple-500" />
                            <QualityStat icon={EnvelopeIcon} label="Email" value={`${Math.round(stats.quality.email / (stats.uniqueMagazinsCount || 1) * 100)}%`} color="text-indigo-500" />
                            
                            {/* Interaction Details Group */}
                            <QualityStat icon={LocationMarkerIcon} label="GPS" value={`${Math.round(stats.quality.gps / (stats.uniqueMagazinsCount || 1) * 100)}%`} color="text-rose-500" />
                            <QualityStat icon={CameraIcon} label="Photos" value={`${Math.round(stats.quality.image / (stats.totalVisits || 1) * 100)}%`} color="text-pink-500" />
                            <QualityStat icon={ClipboardDocumentCheckIcon} label="Notes" value={`${Math.round(stats.quality.note / (stats.totalVisits || 1) * 100)}%`} color="text-emerald-500" />
                            <QualityStat icon={CalendarDaysIcon} label="RDV" value={`${Math.round(stats.quality.rdv / (stats.totalVisits || 1) * 100)}%`} color="text-rose-500" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Géographie */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-[400px]">
                            <div className="flex items-center gap-2 mb-6 text-indigo-500">
                                <MapIcon className="w-5 h-5" />
                                <h3 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-tight">Villes les plus Actives</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                                {stats.topRegions.map(([city, count], idx) => (
                                    <div key={city} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-6 h-6 rounded-full bg-slate-50 dark:bg-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">{idx + 1}</div>
                                            <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{city}</span>
                                        </div>
                                        <span className="text-xs font-bold text-slate-900 dark:text-white">{count} Visites</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Staff Performance */}
                        <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex flex-col h-[400px]">
                            <div className="flex items-center gap-2 mb-6 text-blue-500">
                                <UsersIcon className="w-5 h-5" />
                                <h3 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-tight">Performance Commerciale</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
                                {stats.userPerformance.map(u => (
                                    <div key={u.name} className="group">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 truncate max-w-[120px]">{u.name}</span>
                                            <div className="text-right">
                                                <p className="text-[11px] font-bold text-emerald-600">{u.revenue.toLocaleString()} DH</p>
                                                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">{u.visits} Visites</p>
                                            </div>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1 overflow-hidden">
                                            <div className="bg-blue-600 h-full rounded-full transition-all duration-1000" style={{ width: `${u.percent}%` }}></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right side charts/segments */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-rose-500">
                            <TagIcon className="w-5 h-5" />
                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-tight">Segmentation Client</h3>
                        </div>
                        <div className="space-y-4">
                            <ProgressBar label="Haute Gamme" count={stats.gamme.haute} total={stats.gamme.total} colorClass="bg-emerald-500" />
                            <ProgressBar label="Haute et Moyenne" count={stats.gamme.hauteMoyenne} total={stats.gamme.total} colorClass="bg-[#4407EB]" />
                            <ProgressBar label="Moyenne gamme" count={stats.gamme.moyenne} total={stats.gamme.total} colorClass="bg-blue-300" />
                            <ProgressBar label="Economie" count={stats.gamme.economie} total={stats.gamme.total} colorClass="bg-slate-400" />
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-amber-500">
                            <CalendarDaysIcon className="w-5 h-5" />
                            <h3 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-tight">Prochains RDV</h3>
                        </div>
                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
                            {stats.appointments.map((appt, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-slate-50 dark:border-slate-700 group hover:border-amber-200 transition-colors">
                                    <div className="flex-1 min-w-0 mr-4">
                                        <p className="text-[11px] font-bold text-slate-800 dark:text-white truncate uppercase tracking-tight">{appt.store.Magazin}</p>
                                        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold mt-1">
                                            <span>{appt.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                                            <span>•</span>
                                            <span className="truncate">{appt.user}</span>
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-lg ${appt.days <= 3 ? 'bg-red-50 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                                        J-{appt.days}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Top 20 Clients Section */}
            <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 mb-8 text-blue-600">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <ChartBarIcon className="w-6 h-6" />
                    </div>
                    <div>
                        <h3 className="font-semibold text-slate-800 dark:text-white text-sm uppercase tracking-tight">Top 20 Magazins (Ventes Filtrées)</h3>
                        <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Classement par Volume d'Affaires sur la période</p>
                    </div>
                </div>
                <TopClientsChart data={stats.topClients} />
            </div>
        </div>
    );
};

export default HomePage;