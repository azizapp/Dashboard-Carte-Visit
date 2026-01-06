
import React, { useState, useMemo } from 'react';
import { Store } from '../types.ts';
import ChartBarIcon from './icons/ChartBarIcon.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';
import CubeIcon from './icons/CubeIcon.tsx';
import TargetIcon from './icons/TargetIcon.tsx';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import ArrowTrendingUpIcon from './icons/ArrowTrendingUpIcon.tsx';

const LockIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
  </svg>
);

const ArrowRightIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
);

interface CommissionsPageProps {
    stores: Store[];
}

const KPICard = ({ title, value, subtext, icon, trend, iconBg, iconColor }: any) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md">
        <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-lg ${iconBg} ${iconColor}`}>
                {icon}
            </div>
            {trend && (
                <div className="flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                    <ArrowTrendingUpIcon className="w-3 h-3" />
                    {trend}
                </div>
            )}
        </div>
        <div>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wide">{title}</p>
            <p className="text-xs text-slate-400 mt-1">{subtext}</p>
        </div>
    </div>
);

// المكوّن الجديد لشريط التقدم المقسم
const CommissionProgressBar = ({ current, max = 2100 }: { current: number, max?: number }) => {
    const thresholds = [0, 700, 1000, 1400, 2100];
    
    // حساب موقع النقطة البيضاء بالنسبة المئوية
    const markerPosition = Math.min((current / max) * 100, 100);

    return (
        <div className="relative mt-8 mb-6">
            {/* أرقام العتبات في الأعلى */}
            <div className="flex justify-between mb-4 px-0">
                {thresholds.map((val, i) => (
                    <div key={i} className="flex flex-col items-center">
                        <span className={`text-[10px] font-bold ${i === thresholds.length - 1 ? 'text-slate-400' : 'text-slate-500'}`}>
                           {i === 0 ? 'Level 1' : i === 1 ? 'Lvl 2' : i === 2 ? 'Lvl 3' : 'Level 4'}
                        </span>
                    </div>
                ))}
            </div>

            {/* خلفية الشريط المقسم */}
            <div className="h-2 w-full bg-slate-200 dark:bg-slate-700/50 rounded-full flex overflow-hidden">
                <div style={{ width: '33.33%' }} className="h-full border-r border-white/10 dark:border-slate-900/30"></div>
                <div style={{ width: '14.28%' }} className="h-full border-r border-white/10 dark:border-slate-900/30"></div>
                <div style={{ width: '19.04%' }} className="h-full border-r border-white/10 dark:border-slate-900/30"></div>
                <div style={{ width: '33.33%' }} className="h-full"></div>
            </div>

            {/* شريط التقدم الفعلي المتوهج */}
            <div 
                className="absolute top-[28px] left-0 h-2 bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.6)] transition-all duration-1000"
                style={{ width: `${markerPosition}%` }}
            >
                {/* النقطة البيضاء في نهاية التقدم */}
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md border-2 border-blue-500 z-10"></div>
            </div>

            {/* الأرقام تحت الشريط */}
            <div className="flex justify-between mt-2">
                {thresholds.map((val, i) => (
                    <span key={i} className="text-[10px] font-bold text-slate-400">{val}</span>
                ))}
            </div>
        </div>
    );
};

const CommissionsPage: React.FC<CommissionsPageProps> = ({ stores = [] }) => {
    const [selectedUser, setSelectedUser] = useState<string>('Tous les vendeurs');
    const [period, setPeriod] = useState<string>('Ce mois-ci');
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    const uniqueUsers = useMemo(() => {
        const users = new Set<string>();
        stores.forEach(s => { if (s.USER) users.add(s.USER); });
        return Array.from(users).sort();
    }, [stores]);

    const totalDistributorsCount = useMemo(() => Math.max(uniqueUsers.length, 1), [uniqueUsers]);

    const parseWritingDate = (s: Store) => {
        const dStr = s['Date Heure'] || s.Date;
        if (!dStr) return null;
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) return d;
        return null;
    };

    const statsCalculation = useMemo(() => {
        const now = new Date();
        let start = new Date(now.getFullYear(), now.getMonth(), 1);
        let end = now;
        let prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        let prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        const getMetrics = (data: Store[], s: Date, e: Date) => {
            let sold = 0;
            let comm = 0;
            const cities = new Set<string>();
            data.forEach(store => {
                const writingDate = parseWritingDate(store);
                if (writingDate && writingDate >= s && writingDate <= e) {
                    if (selectedUser !== 'Tous les vendeurs' && store.USER !== selectedUser) return;
                    if (store['Action Client']?.trim().toLowerCase() === 'acheter') {
                        sold += Number(store.Quantité) || 0;
                        comm += Number(store.Prix) || 0;
                    }
                    if (store.Ville) cities.add(store.Ville.trim());
                }
            });
            return { sold, comm, citiesCount: cities.size };
        };

        const currentMetrics = getMetrics(stores, start, end);
        const prevMetrics = getMetrics(stores, prevStart, prevEnd);

        const calculateTrend = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? '+100%' : '0%';
            return `${((curr - prev) / prev * 100) > 0 ? '+' : ''}${((curr - prev) / prev * 100).toFixed(0)}%`;
        };

        return { current: currentMetrics, trends: { sold: calculateTrend(currentMetrics.sold, prevMetrics.sold), comm: calculateTrend(currentMetrics.comm, prevMetrics.comm) } };
    }, [stores, period, selectedUser]);

    const userPerformanceData = useMemo(() => {
        const statsMap: Record<string, { visits: number, salesCount: number, revenue: number }> = {};
        stores.forEach(store => {
             const user = store.USER || 'Inconnu';
             if (!statsMap[user]) statsMap[user] = { visits: 0, salesCount: 0, revenue: 0 };
             statsMap[user].visits += 1;
             if (store['Action Client']?.trim().toLowerCase() === 'acheter') {
                 statsMap[user].salesCount += Number(store.Quantité) || 0;
                 statsMap[user].revenue += Number(store.Prix) || 0;
             }
        });
        return Object.entries(statsMap).map(([email, data]) => ({
            email,
            name: email.split('@')[0],
            salesCount: data.salesCount,
            revenue: data.revenue
        })).sort((a, b) => b.salesCount - a.salesCount);
    }, [stores]);

    return (
        <div className="p-6 space-y-8 max-w-[1600px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Suivi Commercial & Commissions</h1>
                    <p className="text-sm text-slate-500 font-medium">Analyse de performance en temps réel</p>
                </div>
                <button 
                    onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                    className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 shadow-sm"
                >
                    Filtres d'affichage
                    <ChevronDownIcon className={`w-4 h-4 transition-transform ${isFiltersExpanded ? 'rotate-180' : ''}`} />
                </button>
            </div>

            {isFiltersExpanded && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Vendeur</label>
                        <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full text-sm font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-lg py-2 px-3 dark:text-white outline-none">
                            <option>Tous les vendeurs</option>
                            {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Période</label>
                        <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full text-sm font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-lg py-2 px-3 dark:text-white outline-none">
                            <option>Ce mois-ci</option>
                            <option>Le mois dernier</option>
                        </select>
                    </div>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Pièces Vendues" value={statsCalculation.current.sold} trend={statsCalculation.trends.sold} subtext="Ce mois-ci" icon={<CubeIcon className="w-6 h-6" />} iconBg="bg-blue-50 dark:bg-blue-900/20" iconColor="text-blue-600 dark:text-blue-400" />
                <KPICard title="CA Réalisé" value={`${statsCalculation.current.comm.toLocaleString()} DH`} trend={statsCalculation.trends.comm} subtext="Ce mois-ci" icon={<CurrencyDollarIcon className="w-6 h-6" />} iconBg="bg-emerald-50 dark:bg-emerald-900/20" iconColor="text-emerald-600 dark:text-emerald-400" />
                <KPICard title="Villes Couvertes" value={statsCalculation.current.citiesCount} subtext="Zones actives" icon={<MapIcon className="w-6 h-6" />} iconBg="bg-purple-50 dark:bg-purple-900/20" iconColor="text-purple-600 dark:text-purple-400" />
                <KPICard title="Performance Équipe" value={`${totalDistributorsCount} Pers.`} subtext="Membres actifs" icon={<UsersIcon className="w-6 h-6" />} iconBg="bg-amber-50 dark:bg-amber-900/20" iconColor="text-amber-600 dark:text-amber-400" />
            </div>

            {/* بطاقة عتبات المستويات - الأسطورة */}
            <div className="bg-slate-50 dark:bg-[#0f172a] p-3 rounded-lg flex flex-wrap items-center gap-6 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Level Thresholds:</span>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Lvl 1 (1-700)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Lvl 2 (701-1000)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Lvl 3 (1001-1400)</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                    <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400">Lvl 4 (1401-2100)</span>
                </div>
            </div>

            {/* قائمة الموزعين مع أشرطة التقدم المماثلة للصورة */}
            <div className="space-y-6">
                {userPerformanceData.map((user, idx) => {
                    const sales = user.salesCount;
                    let currentLevel = 1;
                    if (sales > 1400) currentLevel = 4;
                    else if (sales > 1000) currentLevel = 3;
                    else if (sales > 700) currentLevel = 2;

                    const levelLabel = currentLevel === 4 ? 'Level 4 Expert' : currentLevel === 3 ? 'Level 3 Advanced' : currentLevel === 2 ? 'Level 2 Senior' : 'Level 1 Junior';
                    const isTopPerformer = idx === 0;
                    
                    const nextThreshold = currentLevel === 1 ? 700 : currentLevel === 2 ? 1000 : currentLevel === 3 ? 1400 : 2100;
                    const remainingToNext = nextThreshold - sales;

                    return (
                        <div key={user.email} className="bg-white dark:bg-[#1e293b] rounded-2xl p-8 border border-slate-100 dark:border-slate-800 shadow-sm relative overflow-hidden group">
                            {/* Blue left accent for active level 4 */}
                            {currentLevel === 4 && <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>}
                            
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-5">
                                    <div className="relative">
                                        <img 
                                            src={`https://ui-avatars.com/api/?name=${user.name}&background=random&color=fff&size=128`} 
                                            className="w-16 h-16 rounded-full border-2 border-slate-200 dark:border-slate-700" 
                                            alt={user.name} 
                                        />
                                        <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white dark:border-[#1e293b]">
                                            #{idx + 1}
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-slate-900 dark:text-white leading-tight">{user.name}</h3>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="px-2 py-0.5 bg-blue-600/10 text-blue-600 dark:text-blue-400 rounded-md text-[10px] font-black uppercase">
                                                {levelLabel}
                                            </span>
                                            {isTopPerformer && (
                                                <span className="text-[11px] text-slate-400 font-bold">• Top Performer</span>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="text-left md:text-right">
                                    <div className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                                        {user.salesCount.toLocaleString()}
                                    </div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Sales YTD</p>
                                </div>
                            </div>

                            {/* شريط التقدم المقسم */}
                            <CommissionProgressBar current={sales} />

                            {/* النص السفلي التوضيحي */}
                            <div className="flex justify-end mt-4">
                                {currentLevel < 4 ? (
                                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-xs font-bold">
                                        <span>{remainingToNext} sales to unlock Level {currentLevel + 1}</span>
                                        <LockIcon className="w-3 h-3" />
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold hover:underline cursor-pointer">
                                        <span>{Math.max(0, 2100 - sales)} sales to max out Level 4</span>
                                        <ArrowRightIcon className="w-4 h-4" />
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CommissionsPage;
