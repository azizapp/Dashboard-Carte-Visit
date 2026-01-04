
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
                        <a href={formatWhatsAppLink(appt.store.GSM1)} target="_blank" rel="noopener noreferrer" className="flex-1 py-2 flex items-center justify-center gap-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-lg text-xs font-bold hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors">
                            <WhatsAppIcon className="w-4 h-4" /> WhatsApp
                        </a>
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
                        const heightPx = Math.max((item.value / maxValue) * 224, 25);
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
                                    style={{ height: `${heightPx}px`, minHeight: '25px' }}
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
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white">{language === 'fr' ? 'Analyse Intelligente' : 'تحليل ذكي'}</h3>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{language === 'fr' ? 'Généré par Gemini AI' : 'تم الإنشاء بواسطة Gemini AI'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex bg-slate-100 dark:bg-slate-700 rounded-lg p-1">
                            <button onClick={() => onLanguageChange('fr')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'fr' ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>FR</button>
                            <button onClick={() => onLanguageChange('ar')} className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${language === 'ar' ? 'bg-white dark:bg-slate-600 shadow text-slate-900 dark:text-white' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}>AR</button>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors"><XMarkIcon className="w-6 h-6 text-slate-500" /></button>
                    </div>
                </div>
                <div className="p-6 overflow-y-auto flex-1">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <SpinnerIcon className="w-10 h-10 text-indigo-600 animate-spin mb-4" />
                            <p className="text-sm font-medium text-slate-600 dark:text-slate-300">{language === 'fr' ? 'Analyse de vos données en cours...' : 'جاري تحليل البيانات...'}</p>
                        </div>
                    ) : (
                        <div className="prose dark:prose-invert max-w-none text-sm leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'} dangerouslySetInnerHTML={{ __html: content }} />
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors text-sm">{language === 'fr' ? 'Terminé' : 'إنهاء'}</button>
                </div>
            </div>
        </div>
    );
};

const HomePage: React.FC<HomePageProps> = ({ stores, authenticatedUser }) => {
    const [showFilters, setShowFilters] = useState<boolean>(false);
    const [selectedCity, setSelectedCity] = useState<string>('all');
    const [selectedAction, setSelectedAction] = useState<string>('all');
    const [selectedPeriod, setSelectedPeriod] = useState<string>('all');
    const [selectedUser, setSelectedUser] = useState<string>('all');
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [analysisLanguage, setAnalysisLanguage] = useState<'fr' | 'ar'>('fr');

    const filteredStores = useMemo(() => {
        return stores.filter(store => {
            if (selectedCity !== 'all' && store.Ville !== selectedCity) return false;
            if (selectedAction !== 'all') {
                const action = (store['Action Client'] || '').trim().toLowerCase();
                if (selectedAction === 'acheter' && action !== 'acheter') return false;
                if (selectedAction === 'revisiter' && action !== 'revisiter') return false;
            }
            if (selectedPeriod !== 'all') {
                const storeDate = new Date(store.Date);
                const now = new Date();
                const daysDiff = Math.floor((now.getTime() - storeDate.getTime()) / (1000 * 60 * 60 * 24));
                if (selectedPeriod === '7days' && daysDiff > 7) return false;
                if (selectedPeriod === '30days' && daysDiff > 30) return false;
            }
            if (selectedUser !== 'all' && store.USER !== selectedUser) return false;
            return true;
        });
    }, [stores, selectedCity, selectedAction, selectedPeriod, selectedUser]);

    const stats = useMemo(() => {
        const totalLeads = filteredStores.length;
        const uniqueClients = new Set(stores.map(s => s.Magazin)).size;
        const uniqueCities = new Set(stores.map(s => s.Ville)).size;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        let futureAppointmentsCount = 0;
        const upcomingAppointments: any[] = [];
        const processedAppointments = new Set<string>();

        let actionBuy = 0, actionRevisit = 0, actionNone = 0;
        let gammeHaute = 0, gammeMoyenne = 0, gammeHauteEtMoyenne = 0, gammeEco = 0, totalActionsForGamme = 0;
        let hasGsm = 0, hasEmail = 0, hasGps = 0, hasImage = 0, hasNote = 0, hasRendezVous = 0;
        const cityCounts: Record<string, number> = {};
        const clientSales: Record<string, number> = {};
        const userStats: Record<string, { visits: number, sales: number, revenue: number }> = {};

        const parsePrice = (val: any) => {
            if (val === undefined || val === null || val === '') return 0;
            if (typeof val === 'number') return val;
            let str = String(val).replace(/[\s\u00A0]/g, '').replace(/DH|MAD/i, '').replace(/[^\d.,-]/g, '');
            return parseFloat(str) || 0;
        };

        filteredStores.forEach(store => {
            const action = (store['Action Client'] || '').trim().toLowerCase();
            const user = store.USER ? store.USER.split('@')[0] : 'Inconnu';
            if (!userStats[user]) userStats[user] = { visits: 0, sales: 0, revenue: 0 };
            userStats[user].visits++;

            if (store['Rendez-Vous']) {
                hasRendezVous++;
                const dateStrings = store['Rendez-Vous'].split(/[\n,]/).map(s => s.trim()).filter(Boolean);
                dateStrings.forEach(dateStr => {
                    const key = `${store.ID}-${dateStr}`;
                    const apptDate = new Date(dateStr);
                    if (!isNaN(apptDate.getTime()) && apptDate >= today && !processedAppointments.has(key)) {
                        futureAppointmentsCount++;
                        processedAppointments.add(key);
                        upcomingAppointments.push({ id: key, store, date: apptDate, days: Math.ceil((apptDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)), user: store.USER || 'N/A' });
                    }
                });
            }

            const price = parsePrice(store.Prix);
            if (action === 'acheter') {
                clientSales[store.Magazin] = (clientSales[store.Magazin] || 0) + price;
                userStats[user].sales++;
                userStats[user].revenue += price;
                actionBuy++;
            } else if (action === 'revisiter') actionRevisit++;
            else actionNone++;

            if (action === 'acheter' || action === 'revisiter') {
                totalActionsForGamme++;
                const g = store.Gamme || '';
                if (g === 'Haute') gammeHaute++;
                else if (g === 'Moyenne') gammeMoyenne++;
                else if (g === 'Haute et Moyenne') gammeHauteEtMoyenne++;
                else if (g === 'Économie') gammeEco++;
            }

            if (store.GSM1) hasGsm++;
            if (store.Email) hasEmail++;
            if (store.Localisation) hasGps++;
            if (store.Image) hasImage++;
            if (store.Note) hasNote++;
            cityCounts[store.Ville || 'Autre'] = (cityCounts[store.Ville || 'Autre'] || 0) + 1;
        });

        const revenue = filteredStores.reduce((acc, s) => (s['Action Client']?.trim().toLowerCase() === 'acheter' ? acc + parsePrice(s.Prix) : acc), 0);
        const topClients = Object.entries(clientSales).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 20);
        return { totalLeads, uniqueClients, uniqueCities, revenue, revenueDisplay: revenue.toLocaleString() + ' DH', futureAppointmentsCount, upcomingAppointments: upcomingAppointments.sort((a, b) => a.date.getTime() - b.date.getTime()), actions: { buy: actionBuy, revisit: actionRevisit, none: actionNone }, gamme: { haute: gammeHaute, moyenne: gammeMoyenne, hauteEtMoyenne: gammeHauteEtMoyenne, economie: gammeEco, total: totalActionsForGamme }, quality: { gsm: hasGsm, email: hasEmail, gps: hasGps, image: hasImage, note: hasNote, rendezVous: hasRendezVous }, topRegions: Object.entries(cityCounts).sort((a, b) => b[1] - a[1]), topClients, userStats: Object.entries(userStats).map(([name, stat]) => ({ name, ...stat, conversion: stat.visits > 0 ? Math.round((stat.sales / stat.visits) * 100) : 0 })).sort((a, b) => b.revenue - a.revenue) };
    }, [filteredStores]);

    const generateAnalysis = async (lang: 'fr' | 'ar') => {
        setIsAnalyzing(true);
        setAnalysisResult('');
        try {
            const summary = { metrics: { totalLeads: stats.totalLeads, revenue: stats.revenue, uniqueCities: stats.uniqueCities }, distribution: stats.gamme, performers: stats.userStats.slice(0, 3) };
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: `Expert analysis in ${lang === 'fr' ? 'French' : 'Arabic'}. Data: ${JSON.stringify(summary)}. Format as Tailwind HTML: Points Forts, Points Faibles, Plan d'Action.`,
            });
            setAnalysisResult(response.text);
        } catch (error) {
            setAnalysisResult(`<div class="text-red-500 p-4">Error generating analysis.</div>`);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-20">
            <AnalysisModal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} content={analysisResult} isLoading={isAnalyzing} language={analysisLanguage} onLanguageChange={(l) => { setAnalysisLanguage(l); generateAnalysis(l); }} />
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div><h1 className="text-3xl font-bold text-slate-900 dark:text-white">Tableau de Bord Global</h1><p className="text-slate-500 dark:text-slate-400 mt-1">Vue d'ensemble analytique du réseau Apollo</p></div>
                <button onClick={() => { setShowAnalysisModal(true); generateAnalysis(analysisLanguage); }} className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all font-medium"><SparklesIcon className="w-5 h-5 text-yellow-300" /> Analyser avec IA</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<CurrencyDollarIcon className="w-6 h-6" />} title="Chiffre d'Affaires" value={stats.revenueDisplay} color="green" />
                <StatCard icon={<UsersIcon className="w-6 h-6" />} title="Total Leads" value={stats.totalLeads} color="blue" />
                <StatCard icon={<ChartBarIcon className="w-6 h-6" />} title="Ventes" value={stats.actions.buy} color="purple" />
                <StatCard icon={<CalendarDaysIcon className="w-6 h-6" />} title="Rendez-vous" value={stats.futureAppointmentsCount} color="amber" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"><h3 className="font-bold text-slate-900 dark:text-white mb-6">Segmentation</h3><ProgressBar label="Haute Gamme" count={stats.gamme.haute} total={stats.gamme.total} colorClass="bg-emerald-500" /><ProgressBar label="Moyenne" count={stats.gamme.moyenne} total={stats.gamme.total} colorClass="bg-blue-500" /><ProgressBar label="Economie" count={stats.gamme.economie} total={stats.gamme.total} colorClass="bg-slate-400" /></div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"><h3 className="font-bold text-slate-900 dark:text-white mb-6">Géographie</h3><div className="space-y-3">{stats.topRegions.slice(0, 8).map(([city, count], idx) => (<div key={city} className="flex items-center justify-between p-2 hover:bg-slate-50 dark:hover:bg-slate-700/50 rounded-lg transition-colors"><span className="text-sm font-medium text-slate-700 dark:text-slate-200">{city}</span><span className="text-sm font-bold text-slate-900 dark:text-white">{count}</span></div>))}</div></div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"><h3 className="font-bold text-slate-900 dark:text-white mb-6">Pipeline</h3><ProgressBar label="Acheter" count={stats.actions.buy} total={stats.totalLeads} colorClass="bg-purple-500" /><ProgressBar label="Revisiter" count={stats.actions.revisit} total={stats.totalLeads} colorClass="bg-amber-500" /></div>
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"><h3 className="font-bold text-slate-900 dark:text-white mb-6">Vendeurs</h3><div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">{stats.userStats.map(user => (<div key={user.name} className="mb-4"><div className="flex justify-between items-center mb-1"><span className="text-sm font-medium text-slate-700 dark:text-slate-300">{user.name}</span><span className="text-xs font-bold text-emerald-600">{user.revenue.toLocaleString()} DH</span></div><div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-1.5"><div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${user.conversion}%` }}></div></div></div>))}</div></div>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 p-6"><h3 className="font-bold text-slate-900 dark:text-white mb-6">Top 20 Clients (Ventes)</h3><TopClientsChart data={stats.topClients} /></div>
        </div>
    );
};

export default HomePage;
