
import React, { useState, useMemo } from 'react';
import { Store } from '../types.ts';
import ChartBarIcon from './icons/ChartBarIcon.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';
import CubeIcon from './icons/CubeIcon.tsx';
import TargetIcon from './icons/TargetIcon.tsx';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import BellIcon from './icons/BellIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import ArrowTrendingUpIcon from './icons/ArrowTrendingUpIcon.tsx';

interface CommissionsPageProps {
    stores: Store[];
}

const KPICard = ({ title, value, subtext, icon, trend, iconBg, iconColor }: any) => (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
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
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 uppercase tracking-wide">{title}</p>
            <p className="text-xs text-slate-400 mt-1">{subtext}</p>
        </div>
    </div>
);

const CommissionsPage: React.FC<CommissionsPageProps> = ({ stores = [] }) => {
    const [selectedUser, setSelectedUser] = useState<string>('Tous les vendeurs');
    const [period, setPeriod] = useState<string>('Ce mois-ci');
    const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);

    const uniqueUsers = useMemo(() => {
        const users = new Set<string>();
        stores.forEach(s => { if (s.USER) users.add(s.USER); });
        return Array.from(users).sort();
    }, [stores]);

    const parseWritingDate = (s: Store) => {
        const dStr = s['Date Heure'] || s.Date;
        if (!dStr) return null;
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) return d;
        const parts = dStr.split('/');
        if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return null;
    };

    const statsCalculation = useMemo(() => {
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        
        let start: Date, end: Date, prevStart: Date, prevEnd: Date;

        switch (period) {
            case 'Ce mois-ci':
                start = new Date(now.getFullYear(), now.getMonth(), 1);
                end = now;
                prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
                break;
            case 'Le mois dernier':
                start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
                end = new Date(now.getFullYear(), now.getMonth(), 0);
                prevStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);
                prevEnd = new Date(now.getFullYear(), now.getMonth() - 1, 0);
                break;
            default:
                start = new Date(0); end = now; prevStart = new Date(0); prevEnd = new Date(0);
        }

        const getMetrics = (data: Store[], s: Date, e: Date) => {
            let sold = 0;
            let comm = 0;
            const cities = new Set<string>();
            const userSet = new Set<string>();
            data.forEach(store => {
                const writingDate = parseWritingDate(store);
                if (writingDate && writingDate >= s && writingDate <= e) {
                    if (selectedUser !== 'Tous les vendeurs' && store.USER !== selectedUser) return;
                    if (store.USER) userSet.add(store.USER);
                    if (store['Action Client']?.trim().toLowerCase() === 'acheter') {
                        sold += Number(store.Quantité) || 0;
                        comm += Number(store.Prix) || 0;
                    }
                    if (store.Ville) cities.add(store.Ville.trim());
                }
            });
            return { sold, comm, citiesCount: cities.size, userCount: userSet.size || 1 };
        };

        const currentMetrics = getMetrics(stores, start, end);
        const prevMetrics = getMetrics(stores, prevStart, prevEnd);

        const calculateTrend = (curr: number, prev: number) => {
            if (prev === 0) return curr > 0 ? '+100%' : '0%';
            const diff = ((curr - prev) / prev) * 100;
            return `${diff > 0 ? '+' : ''}${diff.toFixed(0)}%`;
        };

        return {
            current: currentMetrics,
            trends: {
                sold: calculateTrend(currentMetrics.sold, prevMetrics.sold),
                comm: calculateTrend(currentMetrics.comm, prevMetrics.comm)
            }
        };
    }, [stores, period, selectedUser]);

    const activeUserCount = statsCalculation.current.userCount;
    const currentMonthSold = statsCalculation.current.sold;

    const levels = useMemo(() => [
        { id: 1, max: 2000, color: 'bg-orange-500', iconBg: 'bg-orange-50', iconColor: 'text-orange-500' },
        { id: 2, max: 3000, color: 'bg-blue-500', iconBg: 'bg-blue-50', iconColor: 'text-blue-500' },
        { id: 3, max: 4000, color: 'bg-purple-500', iconBg: 'bg-purple-50', iconColor: 'text-purple-500' },
        { id: 4, max: 6000, color: 'bg-rose-500', iconBg: 'bg-rose-50', iconColor: 'text-rose-500' },
    ].map(l => ({
        ...l,
        label: `Niveau ${l.id}`,
        max: l.max * activeUserCount,
    })), [activeUserCount]);

    const remainingGoal = useMemo(() => {
        const activeLevel = levels.find(l => currentMonthSold < l.max);
        return activeLevel ? activeLevel.max - currentMonthSold : 0;
    }, [levels, currentMonthSold]);

    const userPerformanceData = useMemo(() => {
        const statsMap: Record<string, { visits: number, salesCount: number, revenue: number }> = {};
        stores.forEach(store => {
             const user = store.USER || 'Inconnu';
             if (!statsMap[user]) statsMap[user] = { visits: 0, salesCount: 0, revenue: 0 };
             statsMap[user].visits += 1;
             if (store['Action Client']?.trim().toLowerCase() === 'acheter') {
                 statsMap[user].salesCount += 1;
                 statsMap[user].revenue += Number(store.Prix) || 0;
             }
        });
        const totalRevenue = Object.values(statsMap).reduce((acc, s) => acc + s.revenue, 0) || 1;
        return Object.entries(statsMap).map(([name, data]) => ({
            name: name.split('@')[0],
            salesCount: data.salesCount,
            revenue: data.revenue,
            contribution: Math.round((data.revenue / totalRevenue) * 100)
        })).sort((a, b) => b.revenue - a.revenue);
    }, [stores]);

    const chartData = useMemo(() => {
        return "30,120 79.09,115 128.18,110 177.27,105 226.36,79 275.45,55 324.54,35 373.63,30 422.72,18 471.81,64 520.90,41 570,100";
    }, []);

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
            <div>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                    <button className="hover:text-blue-600 flex items-center gap-1">
                        <ChartBarIcon className="w-4 h-4" /> Suivi Commercial
                    </button>
                </div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Suivi Commercial & Commissions</h1>
                <p className="text-slate-500 dark:text-slate-400 mt-1">Suivez votre progression vers les objectifs de commission et analysez vos performances de vente</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all duration-300">
                <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-semibold text-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
                        </svg> 
                        Filtres et Contrôles
                    </div>
                    <button 
                        onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
                        className="text-xs font-medium text-slate-500 flex items-center gap-1 hover:text-slate-700 transition-colors"
                    >
                        {isFiltersExpanded ? 'Réduire' : 'Étendre'} 
                        <ChevronDownIcon className={`w-3 h-3 transition-transform duration-300 ${isFiltersExpanded ? 'rotate-180' : ''}`} />
                    </button>
                </div>
                
                {isFiltersExpanded && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 animate-in slide-in-from-top-2 duration-300">
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Période</label>
                            <select 
                                value={period}
                                onChange={(e) => setPeriod(e.target.value)}
                                className="w-full text-sm border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-[var(--accent-color)] dark:text-white"
                            >
                                <option>Tous los mois</option>
                                <option>Ce mois-ci</option>
                                <option>Le mois dernier</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5">Vendeur</label>
                            <select 
                                value={selectedUser}
                                onChange={(e) => setSelectedUser(e.target.value)}
                                className="w-full text-sm border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-lg py-2 px-3 outline-none focus:ring-2 focus:ring-[var(--accent-color)] dark:text-white"
                            >
                                <option value="Tous les vendeurs">Tous les vendeurs</option>
                                {uniqueUsers.map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard 
                    title="Pièces Vendues" 
                    value={statsCalculation.current.sold} 
                    trend={statsCalculation.trends.sold} 
                    subtext={period} 
                    icon={<CubeIcon className="w-6 h-6" />} 
                    iconBg="bg-blue-50" 
                    iconColor="text-blue-600" 
                />
                <KPICard 
                    title="Objectif Restant" 
                    value={remainingGoal.toLocaleString()} 
                    subtext="Pour niveau suivant" 
                    icon={<TargetIcon className="w-6 h-6" />} 
                    iconBg="bg-amber-50" 
                    iconColor="text-amber-600" 
                />
                <KPICard 
                    title="Gains Projetés" 
                    value={`${statsCalculation.current.comm.toLocaleString()} MAD`} 
                    trend={statsCalculation.trends.comm} 
                    subtext={period} 
                    icon={<CurrencyDollarIcon className="w-6 h-6" />} 
                    iconBg="bg-emerald-50" 
                    iconColor="text-emerald-600" 
                />
                <KPICard 
                    title="Villes Visitées" 
                    value={`${statsCalculation.current.citiesCount} Villes`} 
                    subtext={period} 
                    icon={<MapIcon className="w-6 h-6" />} 
                    iconBg="bg-indigo-50" 
                    iconColor="text-indigo-600" 
                />
            </div>

            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Niveaux de Commission</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {levels.map(level => {
                            const isCompleted = currentMonthSold >= level.max;
                            const isActive = !isCompleted && (currentMonthSold >= (level.id > 1 ? levels[level.id-2].max : 0));
                            const progress = isCompleted ? 100 : isActive ? Math.round((currentMonthSold / level.max) * 100) : 0;
                            
                            return (
                                <div key={level.id} className={`p-6 rounded-xl border shadow-sm transition-all ${isCompleted ? 'bg-white dark:bg-slate-800 border-emerald-200' : isActive ? 'bg-white dark:bg-slate-800 border-slate-100' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 opacity-75'}`}>
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-100 text-emerald-600' : isActive ? 'bg-orange-50 text-orange-500' : 'bg-slate-200 text-slate-400'}`}>
                                            {isCompleted ? <ArrowTrendingUpIcon className="w-6 h-6" /> : isActive ? <TargetIcon className="w-6 h-6" /> : <div className="w-6 h-6 rounded-full border-2 border-slate-400"></div>}
                                        </div>
                                        <h3 className={`font-bold ${!isActive && !isCompleted ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>{level.label}</h3>
                                        <span className={`ml-auto text-sm font-semibold ${!isActive && !isCompleted ? 'text-slate-600 dark:text-slate-300' : 'text-slate-900 dark:text-white'}`}>
                                            {level.max} <span className="text-xs font-normal text-slate-500">Pièces</span>
                                        </span>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>{currentMonthSold} / {level.max} pièces</span>
                                            <span className={`font-semibold ${!isActive && !isCompleted ? 'text-slate-600' : 'text-slate-900 dark:text-white'}`}>{progress}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden">
                                            <div className={`${isCompleted ? 'bg-emerald-500' : isActive ? 'bg-orange-500' : 'bg-slate-400'} h-2.5 rounded-full`} style={{ width: `${progress}%` }}></div>
                                        </div>
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{isCompleted ? 'Terminé' : isActive ? 'En Cours' : 'À Venir'}</span>
                                            {!isCompleted && isActive && <span className="text-xs text-slate-500">{level.max - currentMonthSold} restantes</span>}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="font-bold text-slate-900 dark:text-white mb-1">Progression Mensuelle des Ventes</h3>
                        <p className="text-xs text-slate-500 mb-6">Évolution des ventes sur 12 mois</p>
                        <div className="w-full overflow-hidden">
                            <svg viewBox="0 0 600 170" className="w-full h-auto text-xs">
                                <g>
                                    <line x1="30" y1="90" x2="570" y2="90" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4"></line>
                                    <text x="5" y="93" fill="#94A3B8" fontSize="10">188</text>
                                </g>
                                <g>
                                    <line x1="30" y1="60" x2="570" y2="60" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4"></line>
                                    <text x="5" y="63" fill="#94A3B8" fontSize="10">375</text>
                                </g>
                                <g>
                                    <line x1="30" y1="30" x2="570" y2="30" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4"></line>
                                    <text x="5" y="33" fill="#94A3B8" fontSize="10">563</text>
                                </g>
                                <g>
                                    <line x1="30" y1="0" x2="570" y2="0" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="4 4"></line>
                                    <text x="5" y="3" fill="#94A3B8" fontSize="10">750</text>
                                </g>
                                <polyline points={chartData} fill="none" stroke="#3B82F6" strokeWidth="2"></polyline>
                                {chartData.split(' ').map((point, i) => {
                                    const [x, y] = point.split(',');
                                    return <circle key={i} cx={x} cy={y} r="4" fill="#3B82F6"></circle>
                                })}
                                {['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'].map((m, i) => (
                                    <text key={m} x={30 + (i * 49.09)} y="165" textAnchor="middle" fill="#94A3B8" fontSize="10">{m}</text>
                                ))}
                            </svg>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg">
                                <BellIcon className="w-6 h-6 text-rose-500" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Alertes & Activité</h3>
                        </div>
                        <div className="space-y-4">
                            <div className="text-center py-8 text-slate-400 text-sm">Aucune alerte récente</div>
                        </div>
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <UsersIcon className="w-6 h-6 text-blue-500" />
                            </div>
                            <h3 className="font-bold text-slate-900 dark:text-white">Classement Vendeurs</h3>
                        </div>
                        <div className="space-y-4">
                            {userPerformanceData.map((user, idx) => (
                                <div key={user.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : idx === 1 ? 'bg-slate-200 text-slate-700' : idx === 2 ? 'bg-orange-100 text-orange-800' : 'bg-slate-100 text-slate-600'}`}>
                                            {idx + 1}
                                        </span>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800 dark:text-white">{user.name}</p>
                                            <p className="text-xs text-slate-500">{user.salesCount} ventes ({user.contribution}%)</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-slate-900 dark:text-white">{user.revenue.toLocaleString()} MAD</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionsPage;
