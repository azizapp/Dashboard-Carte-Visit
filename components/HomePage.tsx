
import React, { useMemo, useState } from 'react';
import { Store } from '../types.ts';
import UsersIcon from './icons/UsersIcon.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import ChartBarIcon from './icons/ChartBarIcon.tsx';
import ArrowTrendingUpIcon from './icons/ArrowTrendingUpIcon.tsx';
import ArrowTrendingDownIcon from './icons/ArrowTrendingDownIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import PhoneCallIcon from './icons/PhoneCallIcon.tsx';
import EnvelopeIcon from './icons/EnvelopeIcon.tsx';
import CameraIcon from './icons/CameraIcon.tsx';
import LocationMarkerIcon from './icons/LocationMarkerIcon.tsx';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentListIcon.tsx';
import DocumentChartBarIcon from './icons/DocumentChartBarIcon.tsx';
import TagIcon from './icons/TagIcon.tsx';
import WhatsAppIcon from './icons/WhatsAppIcon.tsx';
import ArrowPathIcon from './icons/ArrowPathIcon.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import { GoogleGenAI } from "@google/genai";

interface HomePageProps {
    stores: Store[];
    authenticatedUser: string;
}

const ChevronDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
    </svg>
);

const ChevronUpIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
    </svg>
);

const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const formatWhatsAppLink = (gsm?: string | number): string => {
    if (!gsm) return '#';
    const gsmString = String(gsm);
    let cleanedGsm = gsmString.replace(/[\s+()-]/g, '');
    if (cleanedGsm.startsWith('0')) {
        cleanedGsm = '212' + cleanedGsm.substring(1);
    }
    return `https://wa.me/${cleanedGsm}`;
};

const getMapLink = (store: Store): string => {
    if (store.Localisation && /^-?\d+\.\d+,\s*-?\d+\.\d+$/.test(store.Localisation)) {
        return `https://www.google.com/maps?q=${store.Localisation}`;
    }
    const address = [store.Adresse, store.Ville, store.Région].filter(Boolean).join(', ');
    if (address) {
        return `https://www.google.com/maps?q=${encodeURIComponent(address)}`;
    }
    return '#';
};

const AppointmentRow: React.FC<{ appt: any }> = ({ appt }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden transition-all duration-200">
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/30 cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
            >
                <div className="flex flex-col gap-1 w-full mr-2">
                    <div className="flex justify-between items-center">
                        <span className="font-bold text-sm text-slate-900 dark:text-white truncate">{appt.store.Magazin}</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${appt.days <= 7 ? 'bg-red-100 text-red-600' : 'bg-slate-200 text-slate-600'}`}>
                            J-{appt.days}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>{appt.date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' })}</span>
                        <span>•</span>
                        <span className="truncate max-w-[100px]">{appt.user}</span>
                    </div>
                </div>
                {isOpen ? <ChevronUpIcon className="w-5 h-5 text-slate-400 flex-shrink-0" /> : <ChevronDownIcon className="w-5 h-5 text-slate-400 flex-shrink-0" />}
            </div>

            {isOpen && (
                <div className="p-3 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 space-y-3">
                    {appt.store.Note ? (
                        <div className="text-xs italic text-slate-600 dark:text-slate-300 bg-yellow-50 dark:bg-yellow-900/10 p-2 rounded border border-yellow-100 dark:border-yellow-900/20">
                            "{appt.store.Note}"
                        </div>
                    ) : (
                        <div className="text-xs text-slate-400 italic">Aucune note.</div>
                    )}
                    <div className="flex gap-2">
                        {/* FIX: Replaced invalid 'GSM' property with 'GSM1' as defined in the Store interface. */}
                        <a href={formatWhatsAppLink(appt.store.GSM1)} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 flex items-center justify-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                            <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                        </a>
                        {/* FIX: Replaced invalid 'GSM' property with 'GSM1' as defined in the Store interface. */}
                        <a href={`tel:${appt.store.GSM1}`} className="flex-1 py-2 flex items-center justify-center gap-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-xs font-bold hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors">
                            <PhoneCallIcon className="w-4 h-4" /> Appel
                        </a>
                        <a href={getMapLink(appt.store)} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 flex items-center justify-center gap-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-lg text-xs font-bold hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                            <LocationMarkerIcon className="w-4 h-4" /> Carte
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
};

const TopClientsChart = ({ data }: { data: { name: string; value: number }[] }) => {
    if (!data || data.length === 0) {
        return (
            <div className="h-64 flex flex-col items-center justify-center text-slate-400 text-sm">
                <svg className="w-16 h-16 mb-4 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="font-medium text-slate-600 dark:text-slate-400">Aucune donnée de vente disponible</p>
                <p className="text-xs text-slate-400 mt-1">Les ventes apparaîtront ici une fois que des prix seront enregistrés</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map(d => d.value)) || 1;

    return (
        <div className="w-full overflow-x-auto">
            <div className="h-80 min-w-[1200px] w-full pt-16 pb-4 px-2">
                <div className="flex items-end justify-between h-56 gap-2 border-b-2 border-slate-200 dark:border-slate-700">
                    {data.map((item, index) => {
                        // Calculate height with minimum of 10% to ensure visibility
                        const heightPx = Math.max((item.value / maxValue) * 224, 25); // 224px = h-56, min 25px

                        return (
                            <div key={index} className="flex-1 flex flex-col justify-end group relative min-w-[40px]">
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max">
                                    <div className="bg-slate-900 text-white text-xs rounded py-1 px-2 shadow-lg">
                                        <div className="font-bold">{item.name}</div>
                                        <div>{item.value.toLocaleString()} MAD</div>
                                    </div>
                                    <div className="w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[4px] border-t-slate-900 mx-auto"></div>
                                </div>

                                <div
                                    className="w-full bg-blue-600 dark:bg-blue-500 rounded-t hover:bg-blue-700 dark:hover:bg-blue-400 transition-all duration-200 cursor-pointer"
                                    style={{
                                        height: `${heightPx}px`,
                                        minHeight: '25px'
                                    }}
                                ></div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex justify-between mt-2 px-1">
                    {data.map((item, index) => (
                        <div key={index} className="flex-1 text-center min-w-[40px]">
                            <p className="text-[9px] text-slate-500 dark:text-slate-400 truncate px-0.5" title={item.name}>
                                {item.name.length > 8 ? item.name.substring(0, 6) + '..' : item.name}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const StatCard: React.FC<{
    icon: React.ReactNode,
    title: string,
    value: string | number,
    subtext?: string,
    color: string,
    trend?: string,
    trendDirection?: 'up' | 'down'
}> = ({ icon, title, value, subtext, color, trend, trendDirection = 'up' }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400',
        green: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400',
        amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400',
        purple: 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400',
        rose: 'bg-rose-100 dark:bg-rose-900/40 text-rose-600 dark:text-rose-400',
        slate: 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400',
    };

    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-5 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color] || colorClasses.slate}`}>
                    {icon}
                </div>
                {trend && (
                    <span className={`text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1 ${trendDirection === 'up' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400' : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'}`}>
                        {trendDirection === 'up' ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />} {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mt-1">{title}</p>
                {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
            </div>
        </div>
    );
};

const ProgressBar = ({ label, count, total, colorClass }: { label: string, count: number, total: number, colorClass: string }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{percentage}% ({count})</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

interface AnalysisModalProps {
    isOpen: boolean;
    onClose: () => void;
    content: string;
    isLoading: boolean;
    language: 'fr' | 'ar';
    onLanguageChange: (lang: 'fr' | 'ar') => void;
}

const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, content, isLoading, language, onLanguageChange }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" aria-modal="true" role="dialog" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[85vh]" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
                            <SparklesIcon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                                {language === 'fr' ? 'Analyse Intelligente' : 'تحليل ذكي'}
                            </h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {language === 'fr' ? 'Généré par Gemini AI' : 'تم الإنشاء بواسطة Gemini AI'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button 
                                onClick={() => onLanguageChange('fr')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'fr' ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                            >
                                FR
                            </button>
                            <button 
                                onClick={() => onLanguageChange('ar')}
                                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'ar' ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                            >
                                AR
                            </button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                            <XMarkIcon className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>
                </div>
                
                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <SpinnerIcon className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                                {language === 'fr' ? 'Analyse de vos données en cours...' : 'جاري تحليل البيانات...'}
                            </p>
                            <p className="text-xs text-slate-400 mt-2">
                                {language === 'fr' ? 'Identification des points forts et des opportunités' : 'تحديد نقاط القوة والفرص'}
                            </p>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'} dangerouslySetInnerHTML={{ __html: content }} />
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end">
                    <button 
                        onClick={onClose}
                        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm"
                    >
                        {language === 'fr' ? 'Terminé' : 'إنهاء'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const HomePage: React.FC<HomePageProps> = ({ stores, authenticatedUser }) => {
    // Filters visibility state
    const [showFilters, setShowFilters] = useState<boolean>(false);

    // Filters state
    const [selectedCity, setSelectedCity] = useState<string>('all');
    const [selectedAction, setSelectedAction] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<string>('all');

    // AI Analysis State
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [analysisLanguage, setAnalysisLanguage] = useState<'fr' | 'ar'>('fr');

    // Filter stores based on selected filters
    const filteredStores = useMemo(() => {
        return stores.filter(store => {
            // City filter
            if (selectedCity !== 'all' && store.Ville !== selectedCity) {
                return false;
            }

            // Action filter
            if (selectedAction !== 'all') {
                const action = (store['Action Client'] || '').trim().toLowerCase();
                if (selectedAction === 'acheter' && action !== 'acheter') return false;
                if (selectedAction === 'revisiter' && action !== 'revisiter') return false;
                if (selectedAction === 'none' && action !== '') return false;
            }

            // Period filter
            if (selectedPeriod !== 'all') {
                const storeDate = new Date(store.Date);
                const now = new Date();
                const daysDiff = Math.floor((now.getTime() - storeDate.getTime()) / (1000 * 60 * 60 * 24));

                if (selectedPeriod === '7days' && daysDiff > 7) return false;
                if (selectedPeriod === '30days' && daysDiff > 30) return false;
                if (selectedPeriod === '90days' && daysDiff > 90) return false;
            }

            // User filter
            if (selectedUser !== 'all' && store.USER !== selectedUser) {
                return false;
            }

            return true;
        });
    }, [stores, selectedCity, selectedAction, selectedPeriod, selectedUser]);

    const stats = useMemo(() => {
        const totalLeads = filteredStores.length;
        const uniqueClients = new Set(stores.map(s => s.Magazin)).size;
        const uniqueCities = new Set(stores.map(s => s.Ville)).size;
        const uniqueRegions = new Set(stores.map(s => s.Région).filter(Boolean)).size;

        // Helper to parse price reliably
        const parsePrice = (val: string | number | undefined) => {
            if (val === undefined || val === null || val === '') return 0;
            if (typeof val === 'number') return val;

            // Convert to string and clean spaces, non-breaking spaces, and currency text
            let str = String(val).replace(/[\s\u00A0]/g, '').replace(/DH|MAD/i, '').replace(/[^\d.,-]/g, '');

            if (!str) return 0;

            // Normalize: Replace comma with dot if it seems to be a decimal separator
            if (str.indexOf('.') !== -1 && str.indexOf(',') !== -1) {
                if (str.lastIndexOf(',') > str.lastIndexOf('.')) {
                    // 1.234,56 -> 1234.56
                    str = str.replace(/\./g, '').replace(',', '.');
                } else {
                    // 1,234.56 -> 1234.56
                    str = str.replace(/,/g, '');
                }
            } else {
                str = str.replace(/,/g, '.');
            }

            // Handle multiple dots (e.g. 1.000.000.00) -> keep only the last one
            const parts = str.split('.');
            if (parts.length > 2) {
                str = parts.slice(0, -1).join('') + '.' + parts.pop();
            }

            return parseFloat(str) || 0;
        };

        // Financials (Total Prix)
        const revenue = filteredStores.reduce((acc, s) => {
            const action = (s['Action Client'] || '').trim().toLowerCase();
            if (action === 'acheter') {
                return acc + parsePrice(s.Prix);
            }
            return acc;
        }, 0);

        const totalQuantity = filteredStores.reduce((acc, s) => {
            const action = (s['Action Client'] || '').trim().toLowerCase();
            if (action === 'acheter') {
                return acc + parsePrice(s.Quantité);
            }
            return acc;
        }, 0);

        // Dates & Appointments
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let futureAppointmentsCount = 0;
        const upcomingAppointments: any[] = [];
        const processedAppointments = new Set<string>();

        // Actions Breakdown
        let actionBuy = 0;
        let actionRevisit = 0;
        let actionNone = 0;

        // Gamme Breakdown
        let gammeHaute = 0;
        let gammeMoyenne = 0;
        let gammeHauteEtMoyenne = 0;
        let gammeEco = 0;
        let totalActionsForGamme = 0;

        // Data Quality
        let hasGsm = 0;
        let hasEmail = 0;
        let hasGps = 0;
        let hasImage = 0;
        let hasNote = 0;
        let hasRendezVous = 0;

        // Cities Map (using Ville instead of Région for the Geography section)
        const cityCounts: Record<string, number> = {};

        // Top Clients Logic (Accumulate Sales)
        const clientSales: Record<string, number> = {};
        
        // User Performance Stats
        const userStats: Record<string, { visits: number, sales: number, revenue: number }> = {};

        filteredStores.forEach(store => {
            const action = (store['Action Client'] || '').trim().toLowerCase();
            const magazinName = (store.Magazin || '').trim() || 'Client Inconnu';
            const user = store.USER ? store.USER.split('@')[0] : 'Inconnu';

            // User Stats Accumulation
            if (!userStats[user]) userStats[user] = { visits: 0, sales: 0, revenue: 0 };
            userStats[user].visits++;

            // Appointments
            if (store['Rendez-Vous']) {
                hasRendezVous++; // Count records with any appointment date set
                const dateStrings = store['Rendez-Vous'].split(/[\n,]/).map(s => s.trim()).filter(Boolean);
                dateStrings.forEach(dateStr => {
                    const key = `${store.ID}-${dateStr}`;
                    if (!processedAppointments.has(key)) {
                        const apptDate = new Date(dateStr);
                        if (!isNaN(apptDate.getTime()) && apptDate >= today) {
                            futureAppointmentsCount++;
                            processedAppointments.add(key);

                            const diffTime = apptDate.getTime() - today.getTime();
                            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                            upcomingAppointments.push({
                                id: key,
                                store: store,
                                date: apptDate,
                                days: diffDays,
                                user: store.USER || 'N/A'
                            });
                        }
                    }
                });
            }

            // Sales accumulation for Top Clients & User Stats
            const price = parsePrice(store.Prix);

            if (action === 'acheter') {
                if (price > 0) clientSales[magazinName] = (clientSales[magazinName] || 0) + price;
                userStats[user].sales++;
                userStats[user].revenue += price;
            }

            // Actions
            if (action === 'acheter') actionBuy++;
            else if (action === 'revisiter') actionRevisit++;
            else actionNone++;

            // Gamme Logic
            if (action === 'acheter' || action === 'revisiter') {
                totalActionsForGamme++;
                const gamme = store.Gamme || '';
                if (gamme === 'Haute' || gamme === 'Haute Gamme') {
                    gammeHaute++;
                } else if (gamme === 'Moyenne' || gamme === 'Moyenne gamme') {
                    gammeMoyenne++;
                } else if (gamme === 'Haute et Moyenne') {
                    gammeHauteEtMoyenne++;
                } else if (gamme === 'Économie' || gamme === 'Economie') {
                    gammeEco++;
                }
            }

            // Data Quality
            // FIX: Replaced invalid 'GSM' property with 'GSM1' to correctly count leads with GSM information.
            if (store.GSM1 || store.Phone) hasGsm++;
            if (store.Email) hasEmail++;
            if (store.Localisation) hasGps++;
            if (store.Image) hasImage++;
            if (store.Note) hasNote++;

            // Cities
            const city = store.Ville || 'Autre';
            cityCounts[city] = (cityCounts[city] || 0) + 1;
        });

        // Top 20 Clients
        const topClients = Object.entries(clientSales)
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)
            .slice(0, 20);

        // Sort upcoming appointments by date
        upcomingAppointments.sort((a, b) => a.date.getTime() - b.date.getTime());

        // Sort cities by count descending
        const topRegions = Object.entries(cityCounts)
            .sort((a, b) => b[1] - a[1]);
            
        // Process User Stats for display
        const processedUserStats = Object.entries(userStats)
            .map(([name, stat]) => ({
                name,
                ...stat,
                conversion: stat.visits > 0 ? Math.round((stat.sales / stat.visits) * 100) : 0
            }))
            .sort((a, b) => b.revenue - a.revenue);

        return {
            totalLeads,
            uniqueClients,
            uniqueCities,
            uniqueRegions,
            revenue,
            revenueDisplay: revenue.toLocaleString('fr-FR') + ' DH',
            totalQuantity,
            futureAppointmentsCount,
            upcomingAppointments,
            actions: { buy: actionBuy, revisit: actionRevisit, none: actionNone },
            gamme: {
                haute: gammeHaute,
                moyenne: gammeMoyenne,
                hauteEtMoyenne: gammeHauteEtMoyenne,
                economie: gammeEco,
                total: totalActionsForGamme
            },
            quality: { gsm: hasGsm, email: hasEmail, gps: hasGps, image: hasImage, note: hasNote, rendezVous: hasRendezVous },
            topRegions,
            topClients,
            userStats: processedUserStats
        };
    }, [filteredStores]);

    const generateAnalysis = async (lang: 'fr' | 'ar') => {
        setIsAnalyzing(true);
        setAnalysisResult('');

        try {
            // Prepare summary data to minimize tokens
            const summary = {
                metrics: {
                    totalLeads: stats.totalLeads,
                    revenue: stats.revenue,
                    totalQuantity: stats.totalQuantity,
                    uniqueCities: stats.uniqueCities,
                },
                conversion: {
                    buy: stats.actions.buy,
                    revisit: stats.actions.revisit,
                    total: stats.totalLeads,
                    rate: stats.totalLeads > 0 ? (stats.actions.buy / stats.totalLeads).toFixed(2) : 0
                },
                gammeDistribution: stats.gamme,
                topPerformers: stats.userStats.slice(0, 3),
                lowPerformers: stats.userStats.slice(-3),
                topCities: stats.topRegions.slice(0, 5),
                dataQuality: stats.quality
            };

            let prompt = '';
            if (lang === 'fr') {
                 prompt = `
                Tu es un expert analyste commercial. Analyse les données de ce tableau de bord pour une entreprise de vente.
                
                Données résumées (JSON):
                ${JSON.stringify(summary)}
                
                Tâche:
                Génère un rapport concis en Français.
                Structure la réponse en HTML (utilisant des classes Tailwind CSS pour le style) avec les sections suivantes:
                
                1. <div class="mb-4"><h3 class="text-lg font-bold text-emerald-600 mb-2">Points Forts 💪</h3> ...liste à puces... </div>
                2. <div class="mb-4"><h3 class="text-lg font-bold text-red-600 mb-2">Points Faibles & Risques ⚠️</h3> ...liste à puces... </div>
                3. <div class="mb-4"><h3 class="text-lg font-bold text-blue-600 mb-2">Plan d'Action Recommandé 🚀</h3> ...liste numérotée avec actions concrètes... </div>
                
                Sois direct, professionnel et orienté vers l'action. Ne mentionne pas le JSON brut.
                `;
            } else {
                prompt = `
                أنت خبير في تحليل المبيعات. قم بتحليل بيانات لوحة المعلومات لشركة مبيعات.
                
                ملخص البيانات (JSON):
                ${JSON.stringify(summary)}
                
                المهمة:
                قم بإنشاء تقرير موجز باللغة العربية.
                قم بتنسيق الإجابة بتنسيق HTML (باستخدام فئات Tailwind CSS للتصميم) مع الأقسام التالية (تأكد من أن اتجاه النص من اليمين إلى اليسار):
                
                1. <div class="mb-4" dir="rtl"><h3 class="text-lg font-bold text-emerald-600 mb-2">نقاط القوة 💪</h3> ...قائمة نقطية... </div>
                2. <div class="mb-4" dir="rtl"><h3 class="text-lg font-bold text-red-600 mb-2">نقاط الضعف والمخاطر ⚠️</h3> ...قائمة نقطية... </div>
                3. <div class="mb-4" dir="rtl"><h3 class="text-lg font-bold text-blue-600 mb-2">خطة العمل المقترحة 🚀</h3> ...قائمة مرقمة بإجراءات ملموسة... </div>
                
                كن مباشرًا ومهنيًا وموجهًا نحو العمل. لا تذكر JSON الخام.
                `;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt,
            });

            setAnalysisResult(response.text);

        } catch (error) {
            console.error("Gemini Error:", error);
            const errorMsg = lang === 'fr' 
                ? `<div class="text-red-500 p-4 bg-red-50 rounded-lg">Une erreur est survenue lors de l'analyse. Veuillez réessayer.</div>`
                : `<div class="text-red-500 p-4 bg-red-50 rounded-lg" dir="rtl">حدث خطأ أثناء التحليل. يرجى المحاولة مرة أخرى.</div>`;
            setAnalysisResult(errorMsg);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleOpenAnalysis = () => {
        setShowAnalysisModal(true);
        generateAnalysis(analysisLanguage);
    };

    const handleLanguageChange = (lang: 'fr' | 'ar') => {
        setAnalysisLanguage(lang);
        generateAnalysis(lang);
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-20">
            <AnalysisModal 
                isOpen={showAnalysisModal} 
                onClose={() => setShowAnalysisModal(false)} 
                content={analysisResult} 
                isLoading={isAnalyzing}
                language={analysisLanguage}
                onLanguageChange={handleLanguageChange}
            />

            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tableau de Bord Global</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Vue d'ensemble analytique de toutes les données collectées</p>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleOpenAnalysis}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium"
                    >
                        <SparklesIcon className="w-5 h-5 text-yellow-300" />
                        Analyser avec IA
                    </button>
                </div>
            </div>

            {/* Filters Section */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Filters Header - Always Visible */}
                <button
                    onClick={() => setShowFilters(!showFilters)}
                    className="w-full flex items-center justify-between p-6 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                        </svg>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filtres</h2>
                        {(selectedCity !== 'all' || selectedAction !== 'all' || selectedPeriod !== 'all' || selectedUser !== 'all') && (
                            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                                Actifs
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        {(selectedCity !== 'all' || selectedAction !== 'all' || selectedPeriod !== 'all' || selectedUser !== 'all') && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedCity('all');
                                    setSelectedAction('all');
                                    setSelectedPeriod('all');
                                    setSelectedUser('all');
                                }}
                                className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                            >
                                Réinitialiser
                            </button>
                        )}
                        <svg
                            className={`w-5 h-5 text-slate-600 dark:text-slate-400 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`}
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                    </div>
                </button>

                {/* Filters Content - Collapsible */}
                {showFilters && (
                    <div className="px-6 pb-6 border-t border-slate-200 dark:border-slate-700 pt-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* City Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Ville
                                </label>
                                <select
                                    value={selectedCity}
                                    onChange={(e) => setSelectedCity(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="all">Toutes les villes</option>
                                    {Array.from(new Set(stores.map(s => s.Ville).filter(Boolean))).sort().map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Action Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Action Client
                                </label>
                                <select
                                    value={selectedAction}
                                    onChange={(e) => setSelectedAction(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="all">Toutes les actions</option>
                                    <option value="acheter">Acheter</option>
                                    <option value="revisiter">Revisiter</option>
                                    <option value="none">Sans action</option>
                                </select>
                            </div>

                            {/* Period Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Période
                                </label>
                                <select
                                    value={selectedPeriod}
                                    onChange={(e) => setSelectedPeriod(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="all">Toute la période</option>
                                    <option value="7days">7 derniers jours</option>
                                    <option value="30days">30 derniers jours</option>
                                    <option value="90days">90 derniers jours</option>
                                </select>
                            </div>

                            {/* User Filter */}
                            <div>
                                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                                    Utilisateur
                                </label>
                                <select
                                    value={selectedUser}
                                    onChange={(e) => setSelectedUser(e.target.value)}
                                    className="w-full px-3 py-2 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                >
                                    <option value="all">Tous les utilisateurs</option>
                                    {Array.from(new Set(stores.map(s => s.USER).filter(Boolean))).sort().map(user => (
                                        <option key={user} value={user}>{user}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Results count */}
                        <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                                <span className="font-bold text-slate-900 dark:text-white">{filteredStores.length}</span> résultat(s) sur <span className="font-bold text-slate-900 dark:text-white">{stores.length}</span> total
                            </p>
                        </div>
                    </div>
                )}
            </div>

            {/* Section 1: Financials & Volume (Prix, Quantité, ID) */}
            <div>
                <h2 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-4 tracking-wider">Performance Commerciale</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <StatCard
                        icon={<CurrencyDollarIcon className="w-6 h-6" />}
                        title="Chiffre d'Affaires (Total)"
                        value={stats.revenueDisplay}
                        color="green"
                        trend="+12%"
                        trendDirection="up"
                        subtext="Basé sur Total Prix"
                    />
                    <StatCard
                        icon={<UsersIcon className="w-6 h-6" />}
                        title="Total Leads & Clients"
                        value={stats.totalLeads}
                        color="blue"
                        subtext={`${stats.uniqueClients} Magasins Uniques`}
                    />
                    <StatCard
                        icon={<ChartBarIcon className="w-6 h-6" />}
                        title="Volume de Ventes"
                        value={`${stats.totalQuantity} Pièces`}
                        color="purple"
                        subtext="Unités vendues (Action: Acheter)"
                    />
                    <StatCard
                        icon={<CalendarDaysIcon className="w-6 h-6" />}
                        title="Rendez-vous à venir"
                        value={stats.futureAppointmentsCount}
                        color="amber"
                        subtext="Planning futur"
                    />
                </div>
            </div>

            {/* Section 2: Segmentation, Geography, Pipeline, User Performance */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

                {/* Gamme & Action Distribution */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                            <TagIcon className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Segmentation</h3>
                    </div>

                    <div className="mb-6">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Par Gamme (Sur Actions)</h4>
                        <div className="space-y-1">
                            <ProgressBar label="Moyenne gamme" count={stats.gamme.moyenne} total={stats.gamme.total} colorClass="bg-blue-500" />
                            <ProgressBar label="Haute Gamme" count={stats.gamme.haute} total={stats.gamme.total} colorClass="bg-emerald-500" />
                            <ProgressBar label="Haute et Moyenne" count={stats.gamme.hauteEtMoyenne} total={stats.gamme.total} colorClass="bg-purple-500" />
                            <ProgressBar label="Economie" count={stats.gamme.economie} total={stats.gamme.total} colorClass="bg-slate-400" />
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100 dark:border-slate-700">
                        <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">Par Action Client</h4>
                        <div className="space-y-1">
                            <ProgressBar label="Acheter" count={stats.actions.buy} total={stats.totalLeads} colorClass="bg-purple-500" />
                            <ProgressBar label="Revisiter" count={stats.actions.revisit} total={stats.totalLeads} colorClass="bg-amber-500" />
                        </div>
                    </div>
                </div>

                {/* Geographic Breakdown */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <MapIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Géographie</h3>
                            <p className="text-xs text-slate-500">{stats.uniqueCities} Villes, {stats.uniqueRegions} Régions</p>
                        </div>
                    </div>
                    <div className="space-y-3 max-h-[260px] overflow-y-auto pr-2">
                        {stats.topRegions.map(([city, count], idx) => (
                            <div key={city} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'}`}>
                                        {idx + 1}
                                    </span>
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{city}</span>
                                </div>
                                <span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Funnel / Action Status */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                            <DocumentChartBarIcon className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Pipeline (Actions)</h3>
                    </div>

                    <div className="relative space-y-6 pl-4 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100 dark:before:bg-slate-700">
                        <div className="relative flex items-center justify-between">
                            <span className="absolute -left-[23px] w-3 h-3 rounded-full bg-slate-300 border-2 border-white dark:border-slate-800"></span>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">Total Leads</p>
                                <p className="text-xs text-slate-500">Prospects identifiés</p>
                            </div>
                            <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{stats.totalLeads}</span>
                        </div>

                        <div className="relative flex items-center justify-between">
                            <span className="absolute -left-[23px] w-3 h-3 rounded-full bg-blue-400 border-2 border-white dark:border-slate-800"></span>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">À Revisiter</p>
                                <p className="text-xs text-slate-500">Négociation en cours</p>
                            </div>
                            <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.actions.revisit}</span>
                        </div>

                        <div className="relative flex items-center justify-between">
                            <span className="absolute -left-[23px] w-3 h-3 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-800"></span>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 dark:text-white">Clients Gagnés</p>
                                <p className="text-xs text-slate-500">Action: Acheter</p>
                            </div>
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{stats.actions.buy}</span>
                        </div>
                    </div>

                    <div className="mt-6 bg-slate-50 dark:bg-slate-700/50 p-3 rounded-lg text-center">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Taux de conversion global</span>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">
                            {stats.totalLeads > 0 ? ((stats.actions.buy / stats.totalLeads) * 100).toFixed(1) : 0}%
                        </p>
                    </div>
                </div>

                {/* User Performance Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                            <UsersIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Performance Utilisateur</h3>
                    </div>

                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                        {stats.userStats.map((user) => (
                            <div key={user.name} className="mb-4 last:mb-0">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]" title={user.name}>{user.name}</span>
                                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{user.revenue.toLocaleString()} DH</span>
                                </div>
                                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    <span>{user.visits} Visites</span>
                                    <span>{user.sales} Ventes ({user.conversion}%)</span>
                                </div>
                                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                                    <div className="bg-indigo-500 h-2 rounded-full" style={{ width: `${user.conversion}%` }}></div>
                                </div>
                            </div>
                        ))}
                         {stats.userStats.length === 0 && (
                            <div className="text-center py-8 text-slate-400 text-sm">Aucune donnée disponible</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Section 3: Data Quality & Appointments List */}
            <div>
                <h2 className="text-sm font-bold uppercase text-slate-500 dark:text-slate-400 mb-4 tracking-wider">Qualité des Données & Suivi</h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Data Completeness */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                                <ClipboardDocumentCheckIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Qualité de la Base de Données</h3>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                                <PhoneCallIcon className="w-5 h-5 mx-auto text-slate-400 mb-2" />
                                <p className="text-xs text-slate-500">Téléphones</p>
                                <p className="font-bold text-slate-900 dark:text-white">{Math.round((stats.quality.gsm / (stats.totalLeads || 1)) * 100)}%</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                                <EnvelopeIcon className="w-5 h-5 mx-auto text-slate-400 mb-2" />
                                <p className="text-xs text-slate-500">Emails</p>
                                <p className="font-bold text-slate-900 dark:text-white">{Math.round((stats.quality.email / (stats.totalLeads || 1)) * 100)}%</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                                <LocationMarkerIcon className="w-5 h-5 mx-auto text-slate-400 mb-2" />
                                <p className="text-xs text-slate-500">GPS</p>
                                <p className="font-bold text-slate-900 dark:text-white">{Math.round((stats.quality.gps / (stats.totalLeads || 1)) * 100)}%</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                                <CameraIcon className="w-5 h-5 mx-auto text-slate-400 mb-2" />
                                <p className="text-xs text-slate-500">Photos</p>
                                <p className="font-bold text-slate-900 dark:text-white">{Math.round((stats.quality.image / (stats.totalLeads || 1)) * 100)}%</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                                <svg className="w-5 h-5 mx-auto text-slate-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                <p className="text-xs text-slate-500">Avec Notes</p>
                                <p className="font-bold text-slate-900 dark:text-white">{Math.round((stats.quality.note / (stats.totalLeads || 1)) * 100)}%</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                                <CurrencyDollarIcon className="w-5 h-5 mx-auto text-emerald-500 mb-2" />
                                <p className="text-xs text-slate-500">Acheté</p>
                                <p className="font-bold text-slate-900 dark:text-white">{Math.round((stats.actions.buy / (stats.totalLeads || 1)) * 100)}%</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                                <ArrowPathIcon className="w-5 h-5 mx-auto text-blue-500 mb-2" />
                                <p className="text-xs text-slate-500">Revisiter</p>
                                <p className="font-bold text-slate-900 dark:text-white">{Math.round((stats.actions.revisit / (stats.totalLeads || 1)) * 100)}%</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                                <TagIcon className="w-5 h-5 mx-auto text-slate-400 mb-2" />
                                <p className="text-xs text-slate-500">Sans Action</p>
                                <p className="font-bold text-slate-900 dark:text-white">{Math.round((stats.actions.none / (stats.totalLeads || 1)) * 100)}%</p>
                            </div>
                            <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-center">
                                <CalendarDaysIcon className="w-5 h-5 mx-auto text-amber-500 mb-2" />
                                <p className="text-xs text-slate-500">Avec RDV</p>
                                <p className="font-bold text-slate-900 dark:text-white">{Math.round((stats.quality.rendezVous / (stats.totalLeads || 1)) * 100)}%</p>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Appointments (Replaces Urgency Analysis) */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6 flex flex-col h-[380px]">
                        <div className="flex items-center gap-3 mb-4 flex-shrink-0">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                                <CalendarDaysIcon className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                            </div>
                            <div>
                                <h3 className="font-bold text-slate-900 dark:text-white">Suivi des Rendez-vous</h3>
                                <p className="text-xs text-slate-500">Prochains rendez-vous</p>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto pr-1 space-y-2">
                            {stats.upcomingAppointments.length > 0 ? (
                                stats.upcomingAppointments.map(appt => (
                                    <AppointmentRow key={appt.id} appt={appt} />
                                ))
                            ) : (
                                <div className="text-center py-10 text-slate-400 text-sm">
                                    Aucun rendez-vous à venir
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Section 4: Top Clients Chart (Moved here) */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <SparklesIcon className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Top 20 Clients</h3>
                        <p className="text-xs text-slate-500">Classement par Chiffre d'Affaires (Action: Acheter)</p>
                    </div>
                </div>
                <TopClientsChart data={stats.topClients} />
            </div>
        </div>
    );
};

export default HomePage;
