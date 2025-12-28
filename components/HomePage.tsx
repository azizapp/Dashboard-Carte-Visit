
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

const XMarkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const StatCard: React.FC<{ icon: React.ReactNode, title: string, value: string | number, subtext?: string, color: string, trend?: string, trendDirection?: 'up' | 'down' | 'none' }> = ({ icon, title, value, subtext, color, trend, trendDirection = 'up' }) => {
    const colorClasses: Record<string, string> = {
        blue: 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400',
        green: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-400',
        amber: 'bg-amber-100 text-amber-600 dark:bg-amber-900/40 dark:text-amber-400',
        purple: 'bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400',
    };
    return (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 p-5 flex flex-col justify-between h-full hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${colorClasses[color]}`}>{icon}</div>
                {trend && trendDirection !== 'none' && (
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full flex items-center gap-1 ${trendDirection === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {trendDirection === 'up' ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />} {trend}
                    </span>
                )}
            </div>
            <div><h3 className="text-heading text-2xl">{value}</h3><p className="text-emph font-medium mt-1">{title}</p>{subtext && <p className="text-sub mt-2">{subtext}</p>}</div>
        </div>
    );
};

const ProgressBar = ({ label, count, total, colorClass }: { label: string, count: number, total: number, colorClass: string }) => {
    const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
    return (
        <div className="mb-4">
            <div className="flex justify-between items-center mb-1"><span className="text-emph font-medium">{label}</span><span className="text-heading text-sm font-bold">{percentage}% ({count})</span></div>
            <div className="w-full bg-slate-100 rounded-full h-2"><div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div></div>
        </div>
    );
};

const TopClientsChart = ({ data }: { data: { name: string; value: number }[] }) => {
    if (!data || data.length === 0) return <div className="h-64 flex flex-col items-center justify-center text-sub text-sm"><p>Aucune donnée de vente</p></div>;
    const maxValue = Math.max(...data.map(d => d.value)) || 1;
    return (
        <div className="w-full overflow-x-auto">
            <div className="h-80 min-w-[1200px] w-full pt-16 pb-4 px-2">
                <div className="flex items-end justify-between h-56 gap-2 border-b-2 border-slate-200 dark:border-slate-700">
                    {data.map((item, index) => {
                        const heightPx = Math.max((item.value / maxValue) * 224, 25);
                        return (
                            <div key={index} className="flex-1 flex flex-col justify-end group relative min-w-[40px]">
                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max bg-slate-900 text-white text-xs rounded py-1 px-2 shadow-lg"><b>{item.name}</b>: {item.value.toLocaleString()} MAD</div>
                                <div className="w-full bg-blue-600 dark:bg-blue-500 rounded-t hover:bg-blue-700 transition-all duration-200 cursor-pointer" style={{ height: `${heightPx}px` }}></div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

interface AnalysisModalProps { isOpen: boolean; onClose: () => void; content: string; isLoading: boolean; language: 'fr' | 'ar'; onLanguageChange: (lang: 'fr' | 'ar') => void; }
const AnalysisModal: React.FC<AnalysisModalProps> = ({ isOpen, onClose, content, isLoading, language, onLanguageChange }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl w-full max-w-2xl m-4 flex flex-col max-h-[85vh]" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3"><div className="p-2 bg-indigo-100 rounded-lg"><SparklesIcon className="w-6 h-6 text-indigo-600" /></div><div><h3 className="text-heading">Analyse Intelligente</h3></div></div>
                    <div className="flex gap-2"><button onClick={() => onLanguageChange('fr')} className={`px-3 py-1 text-xs rounded ${language === 'fr' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>FR</button><button onClick={() => onLanguageChange('ar')} className={`px-3 py-1 text-xs rounded ${language === 'ar' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>AR</button><button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full"><XMarkIcon className="w-6 h-6 text-slate-400" /></button></div>
                </div>
                <div className="p-6 overflow-y-auto flex-1">{isLoading ? <div className="flex flex-col items-center justify-center py-12"><SpinnerIcon className="w-10 h-10 text-indigo-600 animate-spin mb-4" /><p>Analyse en cours...</p></div> : <div className="prose dark:prose-invert max-w-none text-std leading-relaxed" dir={language === 'ar' ? 'rtl' : 'ltr'} dangerouslySetInnerHTML={{ __html: content }} />}</div>
                <div className="p-4 border-t border-slate-100 flex justify-end"><button onClick={onClose} className="px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg">Fermer</button></div>
            </div>
        </div>
    );
};

const parseWritingDate = (s: Store) => {
    const dStr = s['Date Heure'] || s.Date;
    if (!dStr) return null;
    const d = new Date(dStr);
    if (!isNaN(d.getTime())) return d;
    const parts = dStr.split('/');
    if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
    return null;
};

const calculateTrend = (curr: number, prev: number) => {
    if (prev === 0) return curr > 0 ? { val: '+100%', dir: 'up' as const } : { val: '0%', dir: 'none' as const };
    const diff = ((curr - prev) / prev) * 100;
    return { val: `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`, dir: diff > 0 ? 'up' as const : 'down' as const };
};

const HomePage: React.FC<HomePageProps> = ({ stores, authenticatedUser }) => {
    const [selectedPeriod, setSelectedPeriod] = useState('Ce mois');
    const [showAnalysisModal, setShowAnalysisModal] = useState(false);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [analysisLanguage, setAnalysisLanguage] = useState<'fr' | 'ar'>('fr');

    const stats = useMemo(() => {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        // حساب تاريخ أول تسجيل لكل عميل
        const firstRegistrationDates = new Map<string, number>();
        stores.forEach(s => {
            const name = s.Magazin.trim().toLowerCase();
            const date = parseWritingDate(s)?.getTime() || 0;
            if (date > 0) {
                if (!firstRegistrationDates.has(name) || date < firstRegistrationDates.get(name)!) {
                    firstRegistrationDates.set(name, date);
                }
            }
        });

        let start: Date, end: Date, prevStart: Date, prevEnd: Date;

        if (selectedPeriod === 'Aujourd\'hui') {
            start = startOfToday; end = now;
            prevStart = new Date(start); prevStart.setDate(start.getDate() - 1);
            prevEnd = start;
        } else if (selectedPeriod === 'Cette semaine') {
            const day = now.getDay();
            start = new Date(startOfToday); start.setDate(start.getDate() - day);
            end = now;
            prevStart = new Date(start); prevStart.setDate(start.getDate() - 7);
            prevEnd = start;
        } else if (selectedPeriod === 'Ce mois') {
            start = new Date(now.getFullYear(), now.getMonth(), 1);
            end = now;
            prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (selectedPeriod === 'Tout') {
            start = new Date(0); end = now;
            prevStart = new Date(0); prevEnd = new Date(0);
        } else {
            start = new Date(now.getFullYear(), now.getMonth(), 1); end = now;
            prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1); prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        }

        const getMetrics = (data: Store[], s: Date, e: Date) => {
            let rev = 0, qty = 0, buys = 0, revisits = 0, count = 0;
            const newClientsInPeriod = new Set<string>();

            // حساب العملاء الجدد في الفترة المختارة
            firstRegistrationDates.forEach((regDate, name) => {
                if (regDate >= s.getTime() && regDate <= e.getTime() && regDate >= thirtyDaysAgo.getTime()) {
                    newClientsInPeriod.add(name);
                }
            });

            data.forEach(store => {
                const writingDate = parseWritingDate(store);
                if (writingDate && writingDate >= s && writingDate <= e) {
                    count++;
                    const action = (store['Action Client'] || '').trim().toLowerCase();
                    if (action === 'acheter') {
                        rev += Number(store.Prix) || 0;
                        qty += Number(store.Quantité) || 0;
                        buys++;
                    } else if (action === 'revisiter') revisits++;
                }
            });
            return { revenue: rev, quantity: qty, buyActions: buys, revisitActions: revisits, count, newClients: newClientsInPeriod.size };
        };

        const currentMetrics = getMetrics(stores, start, end);
        const prevMetrics = getMetrics(stores, prevStart, prevEnd);

        const clientSales: Record<string, number> = {};
        const userStats: Record<string, { visits: number, sales: number, revenue: number }> = {};
        const cityCounts: Record<string, number> = {};
        let gHaute = 0, gMoyenne = 0, gMixte = 0, gEco = 0;

        stores.forEach(s => {
            const writingDate = parseWritingDate(s);
            if (writingDate && writingDate >= start && writingDate <= end) {
                const user = s.USER?.split('@')[0] || 'Inconnu';
                if (!userStats[user]) userStats[user] = { visits: 0, sales: 0, revenue: 0 };
                userStats[user].visits++;
                
                if (s['Action Client']?.trim().toLowerCase() === 'acheter') {
                    const p = Number(s.Prix) || 0;
                    clientSales[s.Magazin] = (clientSales[s.Magazin] || 0) + p;
                    userStats[user].sales++;
                    userStats[user].revenue += p;
                }
                
                const g = s.Gamme || '';
                if (g.includes('Haute') && !g.includes('Moyenne')) gHaute++;
                else if (g.includes('Haute') && g.includes('Moyenne')) gMixte++;
                else if (g.includes('Moyenne')) gMoyenne++;
                else gEco++;

                const city = s.Ville || 'Autre';
                cityCounts[city] = (cityCounts[city] || 0) + 1;
            }
        });

        const todayZero = new Date(); todayZero.setHours(0,0,0,0);

        return {
            revenue: currentMetrics.revenue,
            totalLeads: currentMetrics.count,
            totalQuantity: currentMetrics.quantity,
            newClientsCount: currentMetrics.newClients,
            revenueTrend: calculateTrend(currentMetrics.revenue, prevMetrics.revenue),
            leadsTrend: calculateTrend(currentMetrics.count, prevMetrics.count),
            quantityTrend: calculateTrend(currentMetrics.quantity, prevMetrics.quantity),
            actions: { buy: currentMetrics.buyActions, revisit: currentMetrics.revisitActions },
            gamme: { haute: gHaute, moyenne: gMoyenne, mixte: gMixte, eco: gEco, total: currentMetrics.count },
            topRegions: Object.entries(cityCounts).sort((a,b) => b[1]-a[1]),
            topClients: Object.entries(clientSales).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value).slice(0, 20),
            userStats: Object.entries(userStats).map(([name, s]) => ({ name, ...s, conversion: s.visits > 0 ? Math.round((s.sales / s.visits) * 100) : 0 })).sort((a,b) => b.revenue - a.revenue),
            upcomingAppointmentsCount: stores.filter(s => {
                if (!s['Rendez-Vous']) return false;
                const rdv = new Date(s['Rendez-Vous']);
                return !isNaN(rdv.getTime()) && rdv >= todayZero;
            }).length
        };
    }, [stores, selectedPeriod]);

    const generateAnalysis = async (lang: 'fr' | 'ar') => {
        setIsAnalyzing(true); setAnalysisResult('');
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-3-flash-preview', contents: `Analyste commercial expert. Analyse HTML/Tailwind basée sur: ${JSON.stringify(stats.userStats)}. Langue: ${lang}` });
            setAnalysisResult(response.text);
        } catch (e) { setAnalysisResult('<p class="text-red-500">Erreur AI</p>'); }
        finally { setIsAnalyzing(false); }
    };

    return (
        <div className="p-6 max-w-[1600px] mx-auto space-y-8 pb-20">
            <AnalysisModal isOpen={showAnalysisModal} onClose={() => setShowAnalysisModal(false)} content={analysisResult} isLoading={isAnalyzing} language={analysisLanguage} onLanguageChange={(l) => { setAnalysisLanguage(l); generateAnalysis(l); }} />
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-heading text-3xl">Tableau de Bord Global</h1>
                    <p className="text-std mt-1">Données consolidées ({selectedPeriod})</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <div className="bg-white dark:bg-slate-800 px-1 py-1 rounded-xl border border-slate-200 dark:border-slate-700 flex shadow-sm">
                        {['Aujourd\'hui', 'Cette semaine', 'Ce mois', 'Tout'].map(p => (
                            <button 
                                key={p}
                                onClick={() => setSelectedPeriod(p)}
                                className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider ${selectedPeriod === p ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                    <button onClick={() => { setShowAnalysisModal(true); generateAnalysis(analysisLanguage); }} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-700 transition-all font-bold text-sm">
                        <SparklesIcon className="w-5 h-5 text-yellow-300" /> 
                        Analyser
                    </button>
                </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<CurrencyDollarIcon className="w-6 h-6" />} title="Ventes (DH)" value={`${stats.revenue.toLocaleString()} DH`} color="green" trend={stats.revenueTrend.val} trendDirection={stats.revenueTrend.dir} subtext={`Volume sur ${selectedPeriod}`} />
                <StatCard icon={<UsersIcon className="w-6 h-6" />} title="Nouveaux Clients" value={stats.newClientsCount} color="blue" subtext="Enregistrés (< 30j)" />
                <StatCard icon={<ChartBarIcon className="w-6 h-6" />} title="Articles" value={stats.totalQuantity} color="purple" trend={stats.quantityTrend.val} trendDirection={stats.quantityTrend.dir} subtext={`Pièces sur ${selectedPeriod}`} />
                <StatCard icon={<CalendarDaysIcon className="w-6 h-6" />} title="Planning" value={stats.upcomingAppointmentsCount} color="amber" subtext="Rendez-vous futurs" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-heading mb-6 flex items-center gap-2 text-xs uppercase tracking-widest"><TagIcon className="w-4 h-4 text-rose-500" /> Segmentation</h3>
                    <div className="space-y-4">
                        <ProgressBar label="Haute Gamme" count={stats.gamme.haute} total={stats.gamme.total} colorClass="bg-emerald-500" />
                        <ProgressBar label="Haute/Moyenne" count={stats.gamme.mixte} total={stats.gamme.total} colorClass="bg-blue-500" />
                        <ProgressBar label="Moyenne" count={stats.gamme.moyenne} total={stats.gamme.total} colorClass="bg-amber-500" />
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-heading mb-6 flex items-center gap-2 text-xs uppercase tracking-widest"><MapIcon className="w-4 h-4 text-blue-500" /> Géographie</h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {stats.topRegions.map(([city, count], idx) => (
                            <div key={city} className="flex justify-between items-center text-sm font-medium"><span>{idx+1}. {city}</span><span className="font-bold">{count}</span></div>
                        ))}
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-heading mb-6 flex items-center gap-2 text-xs uppercase tracking-widest"><DocumentChartBarIcon className="w-4 h-4 text-purple-500" /> Conversion</h3>
                    <div className="space-y-6 text-sm font-medium">
                        <div className="flex justify-between"><span>Ventes</span><span className="font-bold text-emerald-600">{stats.actions.buy}</span></div>
                        <div className="flex justify-between"><span>En attente</span><span className="font-bold text-amber-500">{stats.actions.revisit}</span></div>
                        <div className="pt-6 border-t text-center"><p className="text-sub uppercase text-[10px]">Taux de succès</p><p className="text-3xl font-black">{((stats.actions.buy / (stats.totalLeads || 1)) * 100).toFixed(1)}%</p></div>
                    </div>
                </div>
                <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 p-6">
                    <h3 className="text-heading mb-6 flex items-center gap-2 text-xs uppercase tracking-widest"><UsersIcon className="w-4 h-4 text-indigo-500" /> Vendeurs</h3>
                    <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                        {stats.userStats.map(u => (
                            <div key={u.name} className="text-xs">
                                <div className="flex justify-between font-bold mb-1"><span>{u.name}</span><span>{u.revenue.toLocaleString()} DH</span></div>
                                <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden"><div className="bg-indigo-500 h-full" style={{ width: `${u.conversion}%` }}></div></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 p-8">
                <h3 className="text-heading mb-8 flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-yellow-500" /> Ventes par Client ({selectedPeriod})</h3>
                <TopClientsChart data={stats.topClients} />
            </div>
        </div>
    );
};

export default HomePage;
