
import React, { useMemo, useState } from 'react';
import { Store, FilterState } from '../types';
import UsersIcon from './icons/UsersIcon';
import PresentationChartLineIcon from './icons/PresentationChartLineIcon';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon';
import ChartBarIcon from './icons/ChartBarIcon';
import MapIcon from './icons/MapIcon';
import FilterModal from './FilterModal';
import CalendarDaysIcon from './icons/CalendarDaysIcon';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import StoreIcon from './icons/StoreIcon';


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

    // Monthly performance data for the calendar year
    const yearStart = new Date(currentEnd.getFullYear(), 0, 1);
    const yearEnd = new Date(currentEnd.getFullYear(), 11, 31, 23, 59, 59, 999);
    const yearData = getFilteredData(yearStart, yearEnd);
    
    const monthlyPerformanceMap: Record<number, { visits: number, sales: number, revenue: number }> = {};
    Array.from({ length: 12 }, (_, i) => {
      monthlyPerformanceMap[i] = { visits: 0, sales: 0, revenue: 0 };
    });

    yearData.forEach(s => {
      const d = parseWritingDate(s);
      if (!d) return;
      const month = d.getMonth();
      monthlyPerformanceMap[month].visits++;
      if (s['Action Client']?.trim().toLowerCase() === 'acheter') {
        monthlyPerformanceMap[month].sales++;
        monthlyPerformanceMap[month].revenue += Number(s.Prix) || 0;
      }
    });

    const monthsFull = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
    const totalYearRevenue = Object.values(monthlyPerformanceMap).reduce((sum, m) => sum + m.revenue, 0) || 1;

    const coverageData = monthsFull.map((name, idx) => {
      const data = monthlyPerformanceMap[idx];
      return {
        name,
        status: data.sales > 0 ? 'Actif' : 'Inactif',
        conv: Math.round((data.sales / (data.visits || 1)) * 100),
        visits: data.visits,
        sales: data.sales,
        revenue: data.revenue,
        contribution: (data.revenue / totalYearRevenue) * 100
      };
    });

    const monthlyVisits = Array.from({ length: 12 }, () => 0);
    yearData.forEach(s => {
      const d = parseWritingDate(s);
      if (!d) return;
      monthlyVisits[d.getMonth()] = (monthlyVisits[d.getMonth()] || 0) + 1;
    });

    const cityMetrics: Record<string, { visits: number, sales: number, revenue: number }> = {};
    currentData.forEach(s => {
        const city = s.Ville || 'Autre';
        if (!cityMetrics[city]) {
            cityMetrics[city] = { visits: 0, sales: 0, revenue: 0 };
        }
        cityMetrics[city].visits++;
        if (s['Action Client']?.trim().toLowerCase() === 'acheter') {
            cityMetrics[city].sales++;
            cityMetrics[city].revenue += Number(s.Prix) || 0;
        }
    });

    const totalRev = currentMetrics.revenue || 1;
    const cityAnalytics = Object.entries(cityMetrics).map(([name, m]) => ({
        name,
        visits: m.visits,
        sales: m.sales,
        revenue: m.revenue,
        status: m.revenue > 0 ? 'Actif' : 'Prospect',
        conversion: Math.round((m.sales / (m.visits || 1)) * 100),
        contribution: (m.revenue / totalRev) * 100
    })).sort((a, b) => b.revenue - a.revenue);

    const maxRevenue = Math.max(...cityAnalytics.map(c => c.revenue), 1);

    const customLabel = (filters.startDate && filters.endDate) 
        ? `${new Date(filters.startDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})} - ${new Date(filters.endDate).toLocaleDateString('fr-FR', {day: 'numeric', month: 'short'})}`
        : "Période Personnalisée";

    return {
        currentMetrics,
        prevMetrics,
        trends,
        sortedCities,
        cityAnalytics,
        maxRevenue,
      coverage: coverageData,
      monthlyVisits,
      year: currentEnd.getFullYear(),
        priority: priorityStats,
        isCustom,
        customLabel
    };
  }, [stores, period, filters]);

  const totalLeadsCount = stats.currentMetrics.leads || 1;
  const circumference = 251; 
  const p1 = (Number(stats.priority.haute) / Number(totalLeadsCount)) * circumference;
  const p2 = (Number(stats.priority.hauteMoyenne) / Number(totalLeadsCount)) * circumference;
  const p3 = (Number(stats.priority.moyenne) / Number(totalLeadsCount)) * circumference;
  const p4 = (Number(stats.priority.economie) / Number(totalLeadsCount)) * circumference;

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
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-lg">Visites par Mois</h3>
                <p className="text-xs text-slate-500 font-medium italic">Répartition mensuelle — {stats.year}</p>
              </div>
            </div>
            
            <ResponsiveContainer width="100%" height={350}>
              <BarChart 
                data={stats.coverage}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="#e2e8f0" 
                  className="dark:stroke-slate-700"
                />
                <XAxis 
                  dataKey="name" 
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  className="dark:text-slate-400"
                  tickFormatter={(value) => value.substring(0, 3)}
                />
                <YAxis 
                  stroke="#e2e8f0"
                  tick={{ fontSize: 12, fill: '#64748b' }}
                  className="dark:text-slate-400"
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e293b', 
                    border: 'none', 
                    borderRadius: '8px', 
                    color: '#fff'
                  }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                  formatter={(value: any) => [value, 'Visites']}
                />
                <Bar 
                  dataKey="visits" 
                  fill="#3b82f6" 
                  radius={[8, 8, 0, 0]}
                  animationDuration={800}
                />
              </BarChart>
            </ResponsiveContainer>
            
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/20 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Total Annuel</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{stats.monthlyVisits.reduce((a, b) => a + b, 0)}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/20 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Moyenne/Mois</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{Math.round(stats.monthlyVisits.reduce((a, b) => a + b, 0) / 12)}</p>
                </div>
                <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/20 rounded-lg">
                  <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Meilleur Mois</p>
                  <p className="text-2xl font-black text-slate-900 dark:text-white">{Math.max(...stats.monthlyVisits)}</p>
                </div>
              </div>
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

        {/* City Performance Table */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/50 dark:bg-slate-700/30 border-b border-slate-100 dark:border-slate-700">
                        <tr>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Ville</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Statut</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Visites</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Ventes</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Montant</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Conversion</th>
                            <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Contribution</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                        {stats.cityAnalytics.map((city) => (
                            <tr key={city.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-700/20 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-slate-50 dark:bg-slate-700/50 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                                            <StoreIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-900 dark:text-white text-sm">{city.name}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">{city.visits} visites</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                        city.status === 'Actif' 
                                        ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' 
                                        : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400'
                                    }`}>
                                        {city.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center font-black text-slate-700 dark:text-slate-200 text-lg">
                                    {city.visits}
                                </td>
                                <td className="px-6 py-4 text-center font-black text-slate-700 dark:text-slate-200 text-lg">
                                    {city.sales}
                                </td>
                                <td className="px-6 py-4 min-w-[200px]">
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1">
                                            <div className="flex justify-between items-baseline mb-1">
                                                <span className="text-sm font-black text-slate-900 dark:text-white">
                                                    {(city.revenue / 1000).toFixed(1)}k <span className="text-[10px] font-bold text-slate-400">DH</span>
                                                </span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                                                    style={{ width: `${(city.revenue / stats.maxRevenue) * 100}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">
                                        {city.conversion}%
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="text-sm font-black text-slate-900 dark:text-white">
                                        {city.contribution.toFixed(1)}%
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
