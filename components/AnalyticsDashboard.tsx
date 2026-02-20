
import React, { useMemo, useState } from 'react';
import { Store, FilterState } from '../types.ts';
import UsersIcon from './icons/UsersIcon.tsx';
import PresentationChartLineIcon from './icons/PresentationChartLineIcon.tsx';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import ChartBarIcon from './icons/ChartBarIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import FilterModal from './FilterModal.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon.tsx';

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

const KpiCard = ({ title, value, change, subtext, icon, prevValue }: any) => {
    const isNegative = change.startsWith('-');
    const isZero = change === '0%' || change === '0.0%';
    const tagBg = isZero ? 'bg-slate-50 text-slate-500' : (isNegative ? 'bg-red-50 text-red-600 dark:bg-red-900/30' : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30');
    
    return (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-slate-600 dark:text-slate-300">
                    {icon}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${tagBg}`}>
                    {change}
                </span>
            </div>
            <div>
                <h3 className="text-2xl font-semibold text-slate-900 dark:text-white tracking-tight">{value}</h3>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 font-bold uppercase tracking-wider mt-1">{title}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium italic">{subtext}</p>
                {prevValue !== undefined && (
                    <div className="mt-3 pt-3 border-t border-slate-50 dark:border-slate-700">
                         <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">Précédent: <span className="font-bold text-slate-600 dark:text-slate-300">{prevValue.toLocaleString()}</span></p>
                    </div>
                )}
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
    priorities: [],
    startDate: '',
    endDate: ''
  });

  const stats = useMemo(() => {
    const today = new Date();
    
    const parseWritingDate = (s: Store) => {
        const dStr = s['Date Heure'] || s.Date;
        if (!dStr) return null;
        const d = new Date(dStr);
        if (!isNaN(d.getTime())) return d;
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
        currentEnd = today;
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

    const isCustom = !!(filters.startDate || filters.endDate);
    if (isCustom) {
        currentStart = filters.startDate ? new Date(filters.startDate) : new Date(0);
        currentEnd = filters.endDate ? new Date(filters.endDate) : new Date();
        currentStart.setHours(0, 0, 0, 0);
        currentEnd.setHours(23, 59, 59, 999);
        const duration = currentEnd.getTime() - currentStart.getTime();
        prevEnd = new Date(currentStart.getTime() - 1);
        prevStart = new Date(prevEnd.getTime() - duration);
    }

    const calculateMetrics = (data: Store[], sDate: Date, eDate: Date) => {
        let rev = 0;
        let buyCount = 0;
        const periodFirstRegistrations = new Set<string>();
        firstRegistrationDates.forEach((regDate, name) => {
            if (regDate >= sDate.getTime() && regDate <= eDate.getTime()) {
                periodFirstRegistrations.add(name);
            }
        });
        data.forEach(s => {
            if (s['Action Client']?.trim().toLowerCase() === 'acheter') {
                rev += Number(s.Prix) || 0;
                buyCount++;
            }
        });
        return { 
            leads: data.length, 
            revenue: rev, 
            buyCount,
            newClientsCount: periodFirstRegistrations.size, 
            convRate: data.length > 0 ? (buyCount / data.length) * 100 : 0 
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
    currentData.forEach(s => { cityCounts[s.Ville] = (cityCounts[s.Ville] || 0) + 1; });
    const sortedCities = Object.entries(cityCounts).sort((a,b) => b[1]-a[1]);

    const totalRevenue = currentMetrics.revenue || 1;
    const priorityStats = { haute: 0, hauteMoyenne: 0, moyenne: 0, economie: 0 };
    currentData.forEach(s => {
        const g = s.Gamme || '';
        if (g === 'Haute') priorityStats.haute++;
        else if (g === 'Haute et Moyenne') priorityStats.hauteMoyenne++;
        else if (g === 'Moyenne') priorityStats.moyenne++;
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
        conv: Math.round((data.sales / (data.visits || 1)) * 100),
        visits: data.visits,
        sales: data.sales,
        revenue: data.revenue,
        contribution: (data.revenue / totalRevenue) * 100
    })).sort((a,b) => b.visits - a.visits);

    const customLabel = (filters.startDate && filters.endDate) 
        ? `${new Date(filters.startDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})} - ${new Date(filters.endDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}`
        : "Période Personnalisée";

    const maxRevenue = Math.max(...coverageData.map(c => c.revenue), 1);

    return {
        currentMetrics,
        prevMetrics,
        trends,
        sortedCities,
        coverage: coverageData,
        maxRevenue,
        priority: priorityStats,
        isCustom,
        customLabel
    };
  }, [stores, period, filters]);

  const totalLeadsCount = stats.currentMetrics.leads || 1;
  const circumference = 251; 
  const p1 = (stats.priority.haute / totalLeadsCount) * circumference;
  const p2 = (stats.priority.hauteMoyenne / totalLeadsCount) * circumference;
  const p3 = (stats.priority.moyenne / totalLeadsCount) * circumference;
  const p4 = (stats.priority.economie / totalLeadsCount) * circumference;

  return (
    <div className="p-6 max-w-[1600px] mx-auto">
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
              <span>Gestion des Leads</span>
              <span className="text-slate-300">/</span>
              <span className="text-blue-600">Analyses Globales</span>
            </div>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white tracking-tight">Analyses & Rapports</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 bg-white dark:bg-slate-800 px-1 py-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-x-auto">
              {['Ce mois', 'Mois passé', 'Dernier trimestre', 'Cette année'].map(p => (
                <button 
                  key={p}
                  onClick={() => {
                    setPeriod(p);
                    setFilters(prev => ({...prev, startDate: '', endDate: ''}));
                  }}
                  className={`px-4 py-2 text-[11px] font-bold rounded-lg whitespace-nowrap transition-all ${!stats.isCustom && period === p ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-inner' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                  {p}
                </button>
              ))}
              {stats.isCustom && (
                  <div className="flex items-center gap-2 px-4 py-2 text-[11px] font-black bg-blue-600 text-white rounded-lg shadow-lg shadow-blue-200/50">
                      <CalendarDaysIcon className="w-3.5 h-3.5" />
                      <span>{stats.customLabel}</span>
                  </div>
              )}
            </div>
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className={`p-2.5 rounded-xl shadow-sm border transition-all flex-shrink-0 ${stats.isCustom ? 'bg-white border-blue-200 text-blue-600' : 'bg-white dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:bg-slate-50'}`}
            >
              <FilterIcon className="w-5 h-5" />
            </button>
            <button className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-200 dark:shadow-none transition-all flex-shrink-0">
              <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="Total des Leads" 
            value={stats.currentMetrics.leads} 
            change={stats.trends.leads} 
            subtext="Visites uniques effectuées" 
            prevValue={stats.prevMetrics.leads}
            icon={<MapIcon className="w-6 h-6" />} 
          />
          <KpiCard 
            title="Nouveaux Clients" 
            value={stats.currentMetrics.newClientsCount} 
            change={stats.trends.newClients} 
            subtext="Acquisitions sur la période" 
            prevValue={stats.prevMetrics.newClientsCount}
            icon={<PresentationChartLineIcon className="w-6 h-6" />} 
          />
          <KpiCard 
            title="Conversion" 
            value={`${stats.currentMetrics.convRate.toFixed(1)}%`} 
            change={stats.trends.convRate} 
            subtext="Actions d'achat réussies" 
            prevValue={`${stats.currentMetrics.buyCount} ventes`}
            icon={<ChartBarIcon className="w-6 h-6" />} 
          />
          <KpiCard 
            title="Volume d'Affaires" 
            value={`${stats.currentMetrics.revenue.toLocaleString()} DH`} 
            change={stats.trends.revenue} 
            subtext="Montant total des commandes" 
            prevValue={stats.prevMetrics.revenue}
            icon={<CurrencyDollarIcon className="w-6 h-6" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Répartition par Ville</h3>
                <p className="text-xs text-slate-500 font-medium italic">Villes les plus actives ({stats.isCustom ? 'Période personnalisée' : period})</p>
              </div>
            </div>
            <div className="flex items-end space-x-6 h-64 w-full pt-4">
              {stats.sortedCities.slice(0, 7).map(([city, count], idx) => {
                const maxCount = Math.max(...stats.sortedCities.map(c => c[1]));
                const heightPercent = (count / (maxCount || 1)) * 100;
                return (
                  <div key={city} className="flex flex-col items-center justify-end flex-1 h-full group">
                    <div className="relative w-full max-w-[44px] flex flex-col justify-end h-full">
                      <div 
                        className="w-full bg-blue-500 rounded-t-xl group-hover:bg-blue-600 transition-all duration-500 relative shadow-sm" 
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl">
                          {count} visites
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mt-4 truncate w-full text-center" title={city}>{city}</span>
                  </div>
                );
              })}
              {stats.sortedCities.length === 0 && (
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic text-sm">Aucune donnée disponible</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
            <div className="mb-6 text-center lg:text-left">
              <h3 className="font-bold text-slate-900 dark:text-white text-lg">Qualité du Pipe</h3>
              <p className="text-xs text-slate-500 font-medium">Segmentation par Gamme</p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <div className="relative w-48 h-48">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="12" className="dark:stroke-slate-700"></circle>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="12" strokeDasharray={`${p1} ${circumference}`} strokeDashoffset="0" className="transition-all duration-1000"></circle>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="12" strokeDasharray={`${p2} ${circumference}`} strokeDashoffset={`-${p1}`} className="transition-all duration-1000"></circle>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="12" strokeDasharray={`${p3} ${circumference}`} strokeDashoffset={`-${p1 + p2}`} className="transition-all duration-1000"></circle>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F43F5E" strokeWidth="12" strokeDasharray={`${p4} ${circumference}`} strokeDashoffset={`-${p1 + p2 + p3}`} className="transition-all duration-1000"></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-black text-slate-800 dark:text-white tracking-tighter">{stats.currentMetrics.leads}</span>
                  <span className="text-[10px] uppercase text-slate-400 font-black tracking-widest">Leads</span>
                </div>
              </div>
            </div>
            <div className="space-y-3.5 mt-8">
              {[
                { label: 'Haute Gamme', count: stats.priority.haute, color: 'bg-emerald-500' },
                { label: 'Haute & Moyenne', count: stats.priority.hauteMoyenne, color: 'bg-blue-500' },
                { label: 'Moyenne Gamme', count: stats.priority.moyenne, color: 'bg-amber-500' },
                { label: 'Économie', count: stats.priority.economie, color: 'bg-rose-500' }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-[11px] group">
                  <div className="flex items-center gap-2.5">
                    <span className={`w-2.5 h-2.5 rounded-sm ${item.color} shadow-sm group-hover:scale-125 transition-transform`}></span>
                    <span className="text-slate-600 dark:text-slate-300 font-bold uppercase tracking-tight">{item.label}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-slate-900 dark:text-white mr-1.5">{item.count}</span>
                    <span className="text-slate-400 font-medium">({((item.count / totalLeadsCount) * 100).toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- SECTION: Aperçu de la Performance (Image-inspired Redesign) --- */}
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-slate-900 dark:text-white text-xl">Aperçu de la Performance</h3>
                    <p className="text-sm text-slate-500 font-medium">Suivez les indicateurs clés de vente par ville en temps réel.</p>
                </div>
            </div>
            
            <div className="bg-[#111827] rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
                {/* Table Header */}
                <div className="hidden md:grid grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1.5fr_1fr_1fr] px-6 py-4 border-b border-slate-800 bg-[#111827]">
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Ville</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Statut</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center flex items-center justify-center gap-1">
                        Visites <span className="text-[8px]">▼</span>
                    </div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Ventes</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Montant</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Conversion</div>
                    <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest text-center">Contribution</div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-slate-800/50">
                    {stats.coverage.map((city) => (
                        <div key={city.name} className="grid grid-cols-2 md:grid-cols-[1.5fr_1fr_0.8fr_0.8fr_1.5fr_1fr_1fr] px-6 py-5 items-center hover:bg-slate-800/30 transition-colors group gap-y-4 md:gap-y-0">
                            {/* Ville */}
                            <div className="flex items-center gap-4 col-span-2 md:col-span-1">
                                <div className="w-10 h-10 rounded-lg bg-blue-900/20 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                    <ClipboardDocumentListIcon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white tracking-tight">{city.name}</h4>
                                    <p className="text-[10px] text-slate-500 font-medium">{city.visits} visites</p>
                                </div>
                            </div>

                            {/* Statut */}
                            <div className="flex justify-center">
                                <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                                    city.status === 'Actif' 
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                    : 'bg-slate-700/30 text-slate-500 border border-slate-700/50'
                                }`}>
                                    {city.status}
                                </span>
                            </div>

                            {/* Visites */}
                            <div className="text-center">
                                <span className="text-lg font-bold text-white">{city.visits}</span>
                            </div>

                            {/* Ventes */}
                            <div className="text-center">
                                <span className="text-lg font-bold text-white">{city.sales}</span>
                            </div>

                            {/* Montant */}
                            <div className="flex flex-col items-center gap-2 px-4">
                                <div className="flex items-baseline gap-1">
                                    <span className="text-lg font-bold text-white">
                                        {city.revenue >= 1000 ? `${(city.revenue / 1000).toFixed(1)}k` : city.revenue}
                                    </span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase">DH</span>
                                </div>
                                <div className="w-full max-w-[100px] bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-blue-500 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]" 
                                        style={{ width: `${(city.revenue / stats.maxRevenue) * 100}%` }} 
                                    />
                                </div>
                            </div>

                            {/* Conversion */}
                            <div className="text-center">
                                <span className="text-lg font-bold text-blue-400">{city.conv}%</span>
                            </div>

                            {/* Contribution */}
                            <div className="text-center">
                                <span className="text-lg font-bold text-white">{(city.contribution || 0).toFixed(1)}%</span>
                            </div>
                        </div>
                    ))}

                    {stats.coverage.length === 0 && (
                        <div className="py-20 text-center">
                            <p className="text-slate-500 italic font-medium">Aucune donnée disponible pour cette période.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Note */}
            <div className="text-center py-4">
                <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">
                    Dernière mise à jour : Aujourd'hui à {new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})} • Données basées sur la période sélectionnée
                </p>
            </div>
        </div>
      </div>

      <FilterModal 
        isOpen={isFilterModalOpen} 
        onClose={() => setIsFilterModalOpen(false)} 
        onApply={(newFilters) => { setFilters(newFilters); setIsFilterModalOpen(false); }} 
        onClear={() => { setFilters({ city: '', gammes: [], priorities: [], startDate: '', endDate: '' }); setIsFilterModalOpen(false); }} 
        currentFilters={filters} 
        stores={stores} 
      />
    </div>
  );
};

export default AnalyticsDashboard;
