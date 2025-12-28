
import React, { useState, useMemo } from 'react';
import CubeIcon from './icons/CubeIcon.tsx';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import TargetIcon from './icons/TargetIcon.tsx';
import ChartBarIcon from './icons/ChartBarIcon.tsx';
import ChevronDownIcon from './icons/ChevronDownIcon.tsx';
import BellIcon from './icons/BellIcon.tsx';
import CheckCircleIcon from './icons/CheckCircleIcon.tsx';
import ArrowTrendingUpIcon from './icons/ArrowTrendingUpIcon.tsx';
import ArrowTrendingDownIcon from './icons/ArrowTrendingDownIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import ClockIcon from './icons/ClockIcon.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';
import { Store } from '../types.ts';

const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
);

const TrophyIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172v-1.38c0-.57.26-1.131.726-1.549 1.279-1.137 2.758-1.923 4.365-2.312a.75.75 0 0 0 .584-.713V4.5a.75.75 0 0 0-.75-.75h-2.126c-.34 0-.665.17-.85.439l-1.002 1.424a5.25 5.25 0 0 1-5.068 2.219 5.25 5.25 0 0 1-5.068-2.219L3.876 4.189A.75.75 0 0 0 3.026 3.75H.9a.75.75 0 0 0-.75.75v1.656a.75.75 0 0 0 .584.713c1.607.389 3.086 1.175 4.365 2.312.466.418.726.98.726 1.55v1.38c0 1.115-.345 2.16-.982 3.172" />
    </svg>
);

const KPICard = ({ title, value, subtext, icon, trendValue, iconBg, iconColor }: any) => {
    const isNegative = typeof trendValue === 'string' && trendValue.startsWith('-');
    const isZero = trendValue === '0%' || trendValue === '0.0%' || trendValue === '0';
    const trendDirection = isZero ? 'none' : (isNegative ? 'down' : 'up');

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${iconBg} ${iconColor}`}>
                    {icon}
                </div>
                {trendValue && trendDirection !== 'none' && (
                    <div className={`flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full ${trendDirection === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                        {trendDirection === 'up' ? <ArrowTrendingUpIcon className="w-3 h-3" /> : <ArrowTrendingDownIcon className="w-3 h-3" />}
                        {trendValue}
                    </div>
                )}
            </div>
            <div>
                <h3 className="text-heading text-2xl mb-1">{value}</h3>
                <p className="text-emph font-bold uppercase tracking-wider text-[11px]">{title}</p>
                <p className="text-sub mt-2">{subtext}</p>
            </div>
        </div>
    );
};

interface CommissionsPageProps {
    stores: Store[];
}

const CommissionsPage: React.FC<CommissionsPageProps> = ({ stores = [] }) => {
    const [selectedUser, setSelectedUser] = useState<string>('Tous les vendeurs');
    const [period, setPeriod] = useState<string>('Ce mois-ci');
    const [customStartDate, setCustomStartDate] = useState<string>('');
    const [customEndDate, setCustomEndDate] = useState<string>('');

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
            case 'Cette semaine':
                const day = now.getDay();
                start = new Date(startOfToday); start.setDate(start.getDate() - day);
                end = now;
                prevStart = new Date(start); prevStart.setDate(prevStart.getDate() - 7);
                prevEnd = start;
                break;
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
            case '3 derniers mois':
                start = new Date(); start.setDate(now.getDate() - 90);
                end = now;
                prevStart = new Date(); prevStart.setDate(now.getDate() - 180);
                prevEnd = new Date(); prevEnd.setDate(now.getDate() - 90);
                break;
            case '6 derniers mois':
                start = new Date(); start.setDate(now.getDate() - 180);
                end = now;
                prevStart = new Date(); prevStart.setDate(now.getDate() - 360);
                prevEnd = new Date(); prevEnd.setDate(now.getDate() - 180);
                break;
            case 'Cette année':
                start = new Date(now.getFullYear(), 0, 1);
                end = now;
                prevStart = new Date(now.getFullYear() - 1, 0, 1);
                prevEnd = new Date(now.getFullYear() - 1, 11, 31);
                break;
            case 'L\'année dernière':
                start = new Date(now.getFullYear() - 1, 0, 1);
                end = new Date(now.getFullYear() - 1, 11, 31);
                prevStart = new Date(now.getFullYear() - 2, 0, 1);
                prevEnd = new Date(now.getFullYear() - 2, 11, 31);
                break;
            case 'Plage personnalisée':
                start = customStartDate ? new Date(customStartDate) : new Date(0);
                end = customEndDate ? new Date(customEndDate) : now;
                const diff = end.getTime() - start.getTime();
                prevStart = new Date(start.getTime() - diff);
                prevEnd = start;
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
            return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
        };

        return {
            current: currentMetrics,
            trends: {
                sold: calculateTrend(currentMetrics.sold, prevMetrics.sold),
                comm: calculateTrend(currentMetrics.comm, prevMetrics.comm),
                cities: calculateTrend(currentMetrics.citiesCount, prevMetrics.citiesCount)
            }
        };
    }, [stores, period, customStartDate, customEndDate, selectedUser]);

    const currentMonthSold = statsCalculation.current.sold;
    const currentMonthCommission = statsCalculation.current.comm;
    const currentMonthCities = statsCalculation.current.citiesCount;
    const activeUserCount = statsCalculation.current.userCount;

    const levels = useMemo(() => [
        { id: 1, min: 1, max: 1000, rewardVal: 1000 },
        { id: 2, min: 1001, max: 1500, rewardVal: 1000 },
        { id: 3, min: 1501, max: 2000, rewardVal: 1000 },
        { id: 4, min: 2001, max: 3000, rewardVal: 1000 },
    ].map(l => ({
        ...l,
        label: `Niveau ${l.id}`,
        min: l.min * activeUserCount,
        max: l.max * activeUserCount,
        reward: `${(l.rewardVal * activeUserCount).toLocaleString('fr-FR')}`
    })), [activeUserCount]);

    const remainingGoal = useMemo(() => {
        const activeLevel = levels.find(l => currentMonthSold < l.max);
        return activeLevel ? activeLevel.max - currentMonthSold : 0;
    }, [levels, currentMonthSold]);

    const userPerformanceData = useMemo(() => {
        const statsMap: Record<string, { visits: number, salesCount: number, unitsSold: number, revenue: number }> = {};
        stores.forEach(store => {
             if (selectedUser !== 'Tous les vendeurs' && store.USER !== selectedUser) return;
             const user = store.USER ? store.USER.split('@')[0] : 'Inconnu';
             if (!statsMap[user]) statsMap[user] = { visits: 0, salesCount: 0, unitsSold: 0, revenue: 0 };
             statsMap[user].visits += 1;
             if (store['Action Client']?.trim().toLowerCase() === 'acheter') {
                 statsMap[user].salesCount += 1;
                 statsMap[user].unitsSold += Number(store.Quantité) || 0;
                 statsMap[user].revenue += Number(store.Prix) || 0;
             }
        });
        return Object.entries(statsMap).map(([name, data]) => ({
            name,
            unitsSold: data.unitsSold,
            salesCount: data.salesCount,
            visits: data.visits, 
            progress: data.visits > 0 ? (data.salesCount / data.visits) * 100 : 0,
            comm: data.revenue
        })).sort((a, b) => b.comm - a.comm);
    }, [stores, selectedUser]);

    const alerts = useMemo(() => {
        const genAlerts = [];
        const now = new Date();
        const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const hourAgo = new Date(now.getTime() - 60 * 60 * 1000);
        const allSales = stores
            .filter(s => s['Action Client']?.trim().toLowerCase() === 'acheter')
            .filter(s => selectedUser === 'Tous les vendeurs' || s.USER === selectedUser)
            .map(s => ({ ...s, _parsedDate: parseWritingDate(s) }))
            .filter(s => s._parsedDate !== null)
            .sort((a, b) => (b._parsedDate as Date).getTime() - (a._parsedDate as Date).getTime());
        if (allSales.filter(s => (s._parsedDate as Date) >= hourAgo).length > 0) {
            const lastHour = allSales.filter(s => (s._parsedDate as Date) >= hourAgo);
            const qty = lastHour.reduce((sum, s) => sum + (Number(s.Quantité) || 0), 0);
            const rev = lastHour.reduce((sum, s) => sum + (Number(s.Prix) || 0), 0);
            genAlerts.push({ title: 'Dernière Heure', message: `Activité intense : ${qty} pièces vendues (${rev.toLocaleString()} DH) récemment.`, time: "Récemment", icon: ClockIcon, iconColor: 'text-orange-500', bgColor: 'bg-orange-50' });
        }
        if (allSales.filter(s => (s._parsedDate as Date) >= startOfToday).length > 0) {
            const today = allSales.filter(s => (s._parsedDate as Date) >= startOfToday);
            const qty = today.reduce((sum, s) => sum + (Number(s.Quantité) || 0), 0);
            const rev = today.reduce((sum, s) => sum + (Number(s.Prix) || 0), 0);
            genAlerts.push({ title: 'Performance du Jour', message: `Cumul aujourd'hui : ${qty} unités (${rev.toLocaleString()} DH) enregistrées.`, time: "Aujourd'hui", icon: TrophyIcon, iconColor: 'text-blue-500', bgColor: 'bg-blue-50' });
        }
        if (allSales.length > 0) {
            const last = allSales[0];
            genAlerts.push({ title: 'Dernière Vente', message: `Succès : ${last.Magazin} a validé ${last.Quantité} pièces (${last.Prix.toLocaleString()} DH).`, time: last.Date, icon: CheckCircleIcon, iconColor: 'text-emerald-500', bgColor: 'bg-emerald-50' });
        }
        return genAlerts;
    }, [stores, selectedUser]);

    return (
        <div className="p-6 space-y-6 max-w-[1600px] mx-auto pb-20">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-sub mb-1">
                        <ChartBarIcon className="w-4 h-4" /> <span>Suivi Commercial</span>
                    </div>
                    <h1 className="text-heading text-3xl">Performance des Ventes</h1>
                    <p className="text-std mt-1">Données basées sur la date d'écriture réelle des opérations</p>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="space-y-2">
                        <label className="text-sub uppercase tracking-widest ml-1">Période d'écriture</label>
                        <div className="relative">
                            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="w-full text-sm font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none cursor-pointer">
                                <option>Cette semaine</option>
                                <option>Ce mois-ci</option>
                                <option>Le mois dernier</option>
                                <option>3 derniers mois</option>
                                <option>6 derniers mois</option>
                                <option>Cette année</option>
                                <option>L'année dernière</option>
                                <option>Plage personnalisée</option>
                            </select>
                            <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    {period === 'Plage personnalisée' && (
                        <>
                            <div className="space-y-2"><label className="text-sub uppercase tracking-widest ml-1">Début</label><input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="w-full text-sm font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-xl py-2.5 px-4 dark:text-white" /></div>
                            <div className="space-y-2"><label className="text-sub uppercase tracking-widest ml-1">Fin</label><input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="w-full text-sm font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-xl py-2.5 px-4 dark:text-white" /></div>
                        </>
                    )}
                    <div className="space-y-2">
                        <label className="text-sub uppercase tracking-widest ml-1">Collaborateur</label>
                        <div className="relative">
                            <select value={selectedUser} onChange={(e) => setSelectedUser(e.target.value)} className="w-full text-sm font-bold border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700 rounded-xl py-3 px-4 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none cursor-pointer">
                                <option value="Tous les vendeurs">Tous les vendeurs</option>
                                {uniqueUsers.map(user => <option key={user} value={user}>{user.split('@')[0]}</option>)}
                            </select>
                            <ChevronDownIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Unités Facturées" value={Math.floor(currentMonthSold)} trendValue={statsCalculation.trends.sold} subtext="Comparé à la période précédente" icon={<CubeIcon className="w-6 h-6" />} iconBg="bg-blue-50" iconColor="text-blue-600" />
                <KPICard title="Objectif Prochain" value={Math.max(0, remainingGoal).toLocaleString()} subtext="Unités manquantes pour le palier" icon={<TargetIcon className="w-6 h-6" />} iconBg="bg-amber-50" iconColor="text-amber-600" />
                <KPICard title="Volume des Ventes" value={`${currentMonthCommission.toLocaleString()} DH`} trendValue={statsCalculation.trends.comm} subtext="Chiffre d'affaires encaissé" icon={<CurrencyDollarIcon className="w-6 h-6" />} iconBg="bg-emerald-50" iconColor="text-emerald-600" />
                <KPICard title="Portefeuille Villes" value={`${currentMonthCities} Villes`} trendValue={statsCalculation.trends.cities} subtext="Zones géographiques actives" icon={<MapIcon className="w-6 h-6" />} iconBg="bg-indigo-50" iconColor="text-indigo-600" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {levels.map((level) => {
                            const isCompleted = currentMonthSold >= level.max;
                            const isActive = currentMonthSold >= level.min && currentMonthSold < level.max;
                            const progressPercent = Math.min(100, Math.max(0, ((currentMonthSold - level.min) / (level.max - level.min)) * 100));
                            return (
                                <div key={level.id} className={`p-6 rounded-2xl border transition-all ${isCompleted ? 'bg-white dark:bg-slate-800 border-emerald-200 ring-4 ring-emerald-500/5' : isActive ? 'bg-white dark:bg-slate-800 border-slate-200' : 'bg-slate-50 dark:bg-slate-800/50 border-slate-100 opacity-60'}`}>
                                    <div className="flex items-center justify-between mb-6">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${isCompleted ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                                {isCompleted ? <CheckCircleIcon className="w-5 h-5" /> : <TargetIcon className="w-5 h-5" />}
                                            </div>
                                            <h3 className="text-heading text-sm uppercase tracking-widest">{level.label}</h3>
                                        </div>
                                        <div className="text-right"><p className="text-emph font-black">{level.max}</p><p className="text-[9px] text-slate-400 font-bold uppercase">Pièces</p></div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex justify-between text-sub uppercase"><span>Avancement</span><span className={isCompleted ? 'text-emerald-500 font-black' : ''}>{isCompleted ? 'TERMINÉ' : `${progressPercent.toFixed(0)}%`}</span></div>
                                        <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden"><div className={`${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'} h-full transition-all duration-700`} style={{ width: `${isCompleted ? 100 : progressPercent}%` }}></div></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <h3 className="text-heading text-lg mb-8">Performance par Vendeur</h3>
                        <div className="space-y-6">
                            {userPerformanceData.length > 0 ? userPerformanceData.map((user, idx) => (
                                <div key={user.name} className="flex items-center justify-between group">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] ${idx === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 text-slate-500'}`}>{idx + 1}</div>
                                        <div><p className="text-emph text-sm group-hover:text-blue-600 transition-colors">{user.name}</p><p className="text-sub text-[10px]">{user.salesCount} ventes • {user.unitsSold} pièces</p></div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-emph text-sm">{user.comm.toLocaleString()} DH</p>
                                        <div className="w-24 bg-slate-100 dark:bg-slate-700 h-1 rounded-full mt-1.5 overflow-hidden"><div className="bg-blue-500 h-full" style={{ width: `${Math.min(100, (user.comm / (currentMonthCommission || 1)) * 100)}%` }}></div></div>
                                    </div>
                                </div>
                            )) : <p className="text-center text-slate-400 italic py-10 text-std">Aucune vente enregistrée.</p>}
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-500"><BellIcon className="w-5 h-5" /></div>
                            <h3 className="text-heading text-sm uppercase tracking-widest">Activité & Alertes</h3>
                        </div>
                        <div className="space-y-5">
                            {alerts.length > 0 ? alerts.map((alert, idx) => (
                                <div key={idx} className={`flex gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-700 ${alert.bgColor || 'bg-slate-50 dark:bg-slate-700/30'}`}>
                                    <div className={`p-2.5 rounded-full h-fit bg-white dark:bg-slate-800 shadow-sm ${alert.iconColor}`}><alert.icon className="w-5 h-5" /></div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1"><h4 className="text-emph text-[11px] uppercase tracking-tighter">{alert.title}</h4><span className="text-[9px] text-slate-400 font-bold uppercase">{alert.time}</span></div>
                                        <p className="text-[12px] text-slate-600 dark:text-slate-300 font-medium leading-snug">{alert.message}</p>
                                    </div>
                                </div>
                            )) : <p className="text-center text-slate-400 italic text-[11px] py-10 text-std">Aucune activité récente.</p>}
                        </div>
                    </div>
                    <div className="bg-indigo-600 p-8 rounded-2xl shadow-xl text-white overflow-hidden relative group">
                        <div className="relative z-10">
                            <h4 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-80">Résumé Performance</h4>
                            <p className="text-3xl font-black mb-2">{currentMonthCommission.toLocaleString()} <span className="text-lg opacity-60">DH</span></p>
                            <p className="text-xs font-bold opacity-70">Total net facturé sur la période</p>
                        </div>
                        <div className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700"><CurrencyDollarIcon className="w-48 h-48" /></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CommissionsPage;
