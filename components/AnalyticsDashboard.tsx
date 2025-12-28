
import React, { useMemo, useState } from 'react';
import { Store, FilterState } from '../types.ts';
import UsersIcon from './icons/UsersIcon.tsx';
import PresentationChartLineIcon from './icons/PresentationChartLineIcon.tsx';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import ChartBarIcon from './icons/ChartBarIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import FilterModal from './FilterModal.tsx';

const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
);

const DownloadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3" />
  </svg>
);

const KpiCard = ({ title, value, change, subtext, icon }: any) => {
    const isNegative = change.startsWith('-');
    const isZero = change === '0%' || change === '0.0%' || change === '+0%' || change === '0';
    const tagColor = isZero ? 'bg-slate-50 text-slate-500' : (isNegative ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500');
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 relative">
            <div className="flex justify-between items-start mb-4">
                <div className="p-2.5 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-600 dark:text-slate-300">
                    {icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagColor}`}>
                    {change}
                </span>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white leading-none mb-1">
                    {value}
                </h3>
                <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                    {title}
                </p>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {subtext}
                </p>
                <p className="text-[10px] text-slate-400 mt-2">
                    Vs période précédente
                </p>
            </div>
        </div>
    );
};

interface AnalyticsDashboardProps {
  stores: Store[];
}

const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({ stores }) => {
  const [period, setPeriod] = useState('Ce mois');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    city: '',
    gammes: [],
    priorities: []
  });

  const stats = useMemo(() => {
    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - (30 * 24 * 60 * 60 * 1000));
    
    const parseWritingDate = (s: Store) => {
        const dStr = s['Date Heure'] || s.Date;
        if (!dStr) return null;
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) return d;
        const parts = dStr.split('/');
        if (parts.length === 3) return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        return null;
    };

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

    let currentStart: Date, currentEnd: Date;
    let prevStart: Date, prevEnd: Date;

    if (period === 'Ce mois') {
        currentStart = new Date(today.getFullYear(), today.getMonth(), 1);
        currentEnd = today;
        prevStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        prevEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    } else if (period === 'Mois passé') {
        currentStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        currentEnd = new Date(today.getFullYear(), today.getMonth(), 0);
        prevStart = new Date(today.getFullYear(), today.getMonth() - 2, 1);
        prevEnd = new Date(today.getFullYear(), today.getMonth() - 1, 0);
    } else if (period === 'Dernier trimestre') {
        currentStart = new Date(); currentStart.setDate(today.getDate() - 90);
        currentEnd = today;
        prevStart = new Date(); prevStart.setDate(today.getDate() - 180);
        prevEnd = new Date(); prevEnd.setDate(today.getDate() - 90);
    } else {
        currentStart = new Date(today.getFullYear(), 0, 1);
        currentEnd = today;
        prevStart = new Date(today.getFullYear() - 1, 0, 1);
        prevEnd = new Date(today.getFullYear() - 1, 11, 31);
    }

    const calculateMetrics = (data: Store[], sDate: Date, eDate: Date) => {
        let rev = 0;
        const periodFirstRegistrations = new Set<string>();
        firstRegistrationDates.forEach((regDate, name) => {
            if (regDate >= sDate.getTime() && regDate <= eDate.getTime()) {
                if (regDate >= thirtyDaysAgo.getTime()) {
                    periodFirstRegistrations.add(name);
                }
            }
        });
        data.forEach(s => {
            if (s['Action Client']?.trim().toLowerCase() === 'acheter') {
                rev += Number(s.Prix) || 0;
            }
        });
        return { 
            leads: data.length, 
            revenue: rev, 
            newClientsCount: periodFirstRegistrations.size, 
            convRate: data.length > 0 ? (periodFirstRegistrations.size / data.length) * 100 : 0 
        };
    };

    const getTrend = (curr: number, prev: number) => {
        if (prev === 0) return curr > 0 ? '+100%' : '0%';
        const diff = ((curr - prev) / prev) * 100;
        return `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    const getFilteredData = (start: Date, end: Date) => {
        return stores.filter(s => {
            const d = parseWritingDate(s);
            if (!d || d < start || d > end) return false;
            if (filters.city && s.Ville !== filters.city) return false;
            if (filters.gammes.length > 0 && !filters.gammes.includes(s.Gamme || '')) return false;
            return true;
        });
    };

    const currentData = getFilteredData(currentStart, currentEnd);
    const prevData = getFilteredData(prevStart, prevEnd);
    const currentMetrics = calculateMetrics(currentData, currentStart, currentEnd);
    const prevMetrics = calculateMetrics(prevData, prevStart, prevEnd);

    const trends = {
        leads: getTrend(currentMetrics.leads, prevMetrics.leads),
        revenue: getTrend(currentMetrics.revenue, prevMetrics.revenue),
        newClients: getTrend(currentMetrics.newClientsCount, prevMetrics.newClientsCount),
        convRate: getTrend(currentMetrics.convRate, prevMetrics.convRate)
    };

    const cityCounts: Record<string, number> = {};
    currentData.forEach(s => {
        cityCounts[s.Ville] = (cityCounts[s.Ville] || 0) + 1;
    });
    const sortedCities = Object.entries(cityCounts).sort((a,b) => b[1]-a[1]);

    const priorityStats = { haute: 0, hauteMoyenne: 0, moyenne: 0, economie: 0 };
    currentData.forEach(s => {
        const g = s.Gamme || '';
        if (g.includes('Haute') && !g.includes('Moyenne')) priorityStats.haute++;
        else if (g.includes('Haute') && g.includes('Moyenne')) priorityStats.hauteMoyenne++;
        else if (g.includes('Moyenne')) priorityStats.moyenne++;
        else priorityStats.economie++;
    });

    const coverageMap = currentData.reduce((acc: any, curr) => {
        const city = curr.Ville;
        if (!acc[city]) acc[city] = { visits: 0, sales: 0, revenue: 0 };
        acc[city].visits++;
        if (curr['Action Client']?.trim().toLowerCase() === 'acheter') {
            acc[city].sales++;
            acc[city].revenue += Number(curr.Prix) || 0;
        }
        return acc;
    }, {});

    const coverageData = Object.entries(coverageMap).map(([name, data]: any) => ({
        name,
        status: data.sales > 0 ? 'Actif' : 'Prospect',
        conv: Math.round((data.sales / data.visits) * 100),
        visits: data.visits,
        sales: data.sales,
        revenue: data.revenue
    })).sort((a,b) => b.visits - a.visits).slice(0, 10);

    return {
        totalLeads: currentMetrics.leads,
        newClients: currentMetrics.newClientsCount,
        conversionRate: currentMetrics.convRate,
        revenue: currentMetrics.revenue,
        trends,
        sortedCities,
        coverage: coverageData,
        priority: priorityStats
    };
  }, [stores, period, filters]);

  const totalLeadsCount = stats.totalLeads || 1;
  const circumference = 251; 
  const p1 = (stats.priority.haute / totalLeadsCount) * circumference;
  const p2 = (stats.priority.hauteMoyenne / totalLeadsCount) * circumference;
  const p3 = (stats.priority.moyenne / totalLeadsCount) * circumference;
  const p4 = circumference - p1 - p2 - p3;

  return (
    <div className="space-y-8 bg-[#F7F8FA] dark:bg-slate-900 p-8 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <div className="flex items-center gap-2 text-sub mb-1">
                <span>Gestion des leads</span>
                <span>/</span>
                <span className="text-blue-600">Analyses</span>
           </div>
           <h1 className="text-heading text-3xl leading-none">Analyses & rapports</h1>
        </div>
        
        <div className="flex items-center gap-3">
            <div className="bg-white dark:bg-slate-800 px-1 py-1 rounded-xl border border-slate-200 dark:border-slate-700 flex shadow-sm">
                {['Ce mois', 'Mois passé', 'Dernier trimestre', 'Cette année'].map(p => (
                    <button 
                        key={p}
                        onClick={() => setPeriod(p)}
                        className={`px-4 py-2 text-[10px] font-black rounded-lg transition-all uppercase tracking-wider ${period === p ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:text-slate-800'}`}
                    >
                        {p}
                    </button>
                ))}
            </div>
            <button 
                onClick={() => setIsFilterModalOpen(true)}
                className={`p-2.5 rounded-xl shadow-sm border transition-all ${Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : !!v) ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-500'}`}
            >
                <FilterIcon className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200/50">
                <DownloadIcon className="w-5 h-5" />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <KpiCard title="Total des leads" value={stats.totalLeads} change={stats.trends.leads} subtext="Prospects enregistrés" icon={<MapIcon className="w-6 h-6" />} />
          <KpiCard title="Nouveaux clients" value={stats.newClients} change={stats.trends.newClients} subtext="Enregistrés (< 30j)" icon={<UsersIcon className="w-6 h-6" />} />
          <KpiCard title="Objectifs conversion" value={`${stats.conversionRate.toFixed(1)}%`} change={stats.trends.convRate} subtext="Nouveaux / Total" icon={<ChartBarIcon className="w-6 h-6" />} />
          <KpiCard title="Volume chiffre" value={`${stats.revenue.toLocaleString()} Dh`} change={stats.trends.revenue} subtext="Chiffre d'affaires enregistré" icon={<CurrencyDollarIcon className="w-6 h-6" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
         <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
             <div className="mb-10">
                <h3 className="text-heading text-lg leading-none">Répartition par ville</h3>
                <p className="text-sub mt-1.5">Performance géographique par écriture ({period})</p>
             </div>
             
             <div className="flex items-end justify-between h-64 w-full px-4 border-b border-slate-100 overflow-x-auto min-w-full pb-8 scrollbar-hide">
                 {stats.sortedCities.length > 0 ? stats.sortedCities.slice(0, 10).map(([city, count], idx) => {
                     const maxCount = Math.max(...stats.sortedCities.map(c => c[1]));
                     const h = (count / maxCount) * 100;
                     return (
                         <div key={city} className="flex flex-col items-center justify-end w-12 h-full gap-4 flex-shrink-0 group">
                             <div 
                                style={{ height: `${h}%` }} 
                                className="w-6 bg-[#3b82f6] rounded-t-md hover:bg-blue-600 transition-all cursor-pointer shadow-sm shadow-blue-100 relative"
                             >
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[9px] font-black text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity">{count}</span>
                             </div>
                             <span className="text-sub text-center whitespace-nowrap mb-[-24px] rotate-[-20deg] origin-top">{city}</span>
                         </div>
                     );
                 }) : (
                    <div className="w-full flex items-center justify-center text-slate-300 font-bold italic">Aucune donnée</div>
                 )}
             </div>
         </div>

         <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col items-center">
             <div className="w-full mb-8">
                 <h3 className="text-heading text-lg leading-none">Leads par gamme</h3>
                 <p className="text-sub mt-1.5">Qualification des prospects ({period})</p>
             </div>
             
             <div className="relative w-48 h-48 mb-10">
                 <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="12" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" strokeDasharray={`${p1} ${circumference}`} strokeDashoffset="0" />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3b82f6" strokeWidth="12" strokeDasharray={`${p2} ${circumference}`} strokeDashoffset={`-${p1}`} />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f59e0b" strokeWidth="12" strokeDasharray={`${p3} ${circumference}`} strokeDashoffset={`-${p1+p2}`} />
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#ef4444" strokeWidth="12" strokeDasharray={`${p4} ${circumference}`} strokeDashoffset={`-${p1+p2+p3}`} />
                 </svg>
                 <div className="absolute inset-0 flex flex-col items-center justify-center">
                     <span className="text-heading text-3xl leading-none">{stats.totalLeads}</span>
                     <span className="text-sub">Total</span>
                 </div>
             </div>

             <div className="w-full space-y-4">
                 {[
                   { label: 'Haute gamme', color: 'bg-emerald-500', val: stats.priority.haute },
                   { label: 'Haute et moyenne', color: 'bg-blue-500', val: stats.priority.hauteMoyenne },
                   { label: 'Moyenne gamme', color: 'bg-amber-500', val: stats.priority.moyenne },
                   { label: 'Économie', color: 'bg-red-500', val: stats.priority.economie }
                 ].map(item => (
                    <div key={item.label} className="flex items-center justify-between text-[11px] font-bold">
                        <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                            <span className="text-std">{item.label}</span>
                        </div>
                        <div className="text-right">
                           <span className="block text-emph">{item.val}</span>
                           <span className="text-[9px] text-slate-400 font-medium">{Math.round((item.val/totalLeadsCount)*100)}%</span>
                        </div>
                    </div>
                 ))}
             </div>
         </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pb-10">
          <div className="lg:col-span-8 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full">
             <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-heading text-lg leading-none">Couverture territoriale</h3>
                    <p className="text-sub mt-1.5">Villes analysées par écriture ({period})</p>
                 </div>
                 <div className="flex bg-slate-50 dark:bg-slate-900 p-1 rounded-lg border border-slate-100 dark:border-slate-700">
                    <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 rounded text-[9px] font-black border border-emerald-100 dark:border-emerald-800/30">Actif</span>
                    <span className="px-2 py-1 text-slate-400 rounded text-[9px] font-black ml-1">Prospect</span>
                 </div>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {stats.coverage.length > 0 ? stats.coverage.map((city) => (
                    <div key={city.name} className="bg-slate-50/50 dark:bg-slate-700/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-600 hover:shadow-md transition-all">
                        <div className="flex justify-between items-start mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
                                    <MapIcon className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <h4 className="text-emph text-sm">{city.name}</h4>
                                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${city.status === 'Actif' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'}`}>
                                        {city.status}
                                    </span>
                                </div>
                            </div>
                            <div className="text-right">
                                 <span className="block text-emph text-sm">{city.conv}%</span>
                                 <p className="text-sub text-[9px]">Conv.</p>
                            </div>
                        </div>

                        <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 mb-6">
                            <div 
                                className={`h-1.5 rounded-full ${city.conv >= 50 ? 'bg-emerald-500' : 'bg-slate-400'}`} 
                                style={{ width: `${city.conv}%` }}
                            ></div>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                            <div>
                                <p className="text-sub text-[9px] mb-1">Visites</p>
                                <p className="text-emph text-xs">{city.visits}</p>
                            </div>
                            <div className="border-x border-slate-200 dark:border-slate-600">
                                <p className="text-sub text-[9px] mb-1">Ventes</p>
                                <p className="text-emph text-xs">{city.sales}</p>
                            </div>
                            <div>
                                <p className="text-sub text-[9px] mb-1">Chiffre</p>
                                <p className={`text-emph text-xs ${city.revenue > 0 ? 'text-emerald-500' : ''}`}>{city.revenue.toLocaleString()}</p>
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-full py-12 text-center text-slate-400 font-bold italic text-std">Données insuffisantes pour la carte géographique</div>
                )}
             </div>
          </div>

          <div className="lg:col-span-4 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 h-full">
             <h3 className="text-heading text-lg mb-8">Performance régionale</h3>
             <div className="space-y-6">
                 {stats.sortedCities.slice(0, 7).map(([name, leads], i) => (
                    <div key={name} className="flex items-center justify-between">
                         <div className="flex items-center gap-4">
                             <div className={`flex items-center justify-center w-8 h-8 rounded-full text-[11px] font-black ${i === 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                 {i + 1}
                             </div>
                             <div>
                                 <p className="text-emph text-[13px]">{name}</p>
                                 <p className="text-sub text-[10px] lowercase">{leads} interactions</p>
                             </div>
                         </div>
                         <div className="text-right">
                             <p className="text-emph text-[12px] text-emerald-500">{Math.round((leads/stats.totalLeads)*100)}%</p>
                             <p className="text-sub text-[9px]">Part</p>
                         </div>
                    </div>
                 ))}
                 {stats.sortedCities.length === 0 && <p className="text-center text-slate-400 italic text-std">Aucune donnée</p>}
             </div>
          </div>
      </div>

      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={(newFilters) => { setFilters(newFilters); setIsFilterModalOpen(false); }} onClear={() => { setFilters({ city: '', gammes: [], priorities: [] }); setIsFilterModalOpen(false); }} currentFilters={filters} stores={stores} />
    </div>
  );
};

export default AnalyticsDashboard;
