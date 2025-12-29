
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
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${tagBg}`}>
                    {change}
                </span>
            </div>
            <div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">{title}</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{subtext}</p>
                {prevValue !== undefined && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">vs {prevValue.toLocaleString()} la période précédente</p>
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
    currentData.forEach(s => {
        cityCounts[s.Ville] = (cityCounts[s.Ville] || 0) + 1;
    });
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
        conv: Math.round((data.sales / data.visits) * 100),
        visits: data.visits,
        sales: data.sales,
        revenue: data.revenue,
        contribution: (data.revenue / totalRevenue) * 100
    })).sort((a,b) => b.visits - a.visits);

    return {
        currentMetrics,
        prevMetrics,
        trends,
        sortedCities,
        coverage: coverageData,
        priority: priorityStats
    };
  }, [stores, period, filters]);

  const totalLeadsCount = stats.currentMetrics.leads || 1;
  const circumference = 251; 
  const p1 = (stats.priority.haute / totalLeadsCount) * circumference;
  const p2 = (stats.priority.hauteMoyenne / totalLeadsCount) * circumference;
  const p3 = (stats.priority.moyenne / totalLeadsCount) * circumference;
  const p4 = (stats.priority.economie / totalLeadsCount) * circumference;

  return (
    <div className="p-6">
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <span>Gestion des Leads</span>
              <span className="text-slate-300">/</span>
              <span className="text-blue-600 font-medium">Analyses</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Analyses & Rapports</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-1 bg-white dark:bg-slate-800 px-1 py-1 rounded-lg border border-slate-200 dark:border-slate-700 overflow-x-auto max-w-[calc(100vw-80px)]">
              {['Ce mois', 'Mois passé', 'Dernier trimestre', 'Cette année'].map(p => (
                <button 
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${period === p ? 'bg-slate-100 dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                >
                  {p}
                </button>
              ))}
            </div>
            <button 
              onClick={() => setIsFilterModalOpen(true)}
              className="p-2 rounded-lg shadow-sm transition-colors flex-shrink-0 bg-white dark:bg-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700"
            >
              <FilterIcon className="w-5 h-5" />
            </button>
            <button className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm transition-colors flex-shrink-0">
              <DownloadIcon className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <KpiCard 
            title="Total des Leads" 
            value={stats.currentMetrics.leads} 
            change={stats.trends.leads} 
            subtext="Prospects actifs visités" 
            prevValue={stats.prevMetrics.leads}
            icon={<MapIcon className="w-6 h-6" />} 
          />
          <KpiCard 
            title="Nouveaux Clients" 
            value={stats.currentMetrics.newClientsCount} 
            change={stats.trends.newClients} 
            subtext="Croissance des acquisitions" 
            prevValue={stats.prevMetrics.newClientsCount}
            icon={<PresentationChartLineIcon className="w-6 h-6" />} 
          />
          <KpiCard 
            title="Objectifs" 
            value={`${stats.currentMetrics.convRate.toFixed(1)}%`} 
            change={stats.trends.convRate} 
            subtext="Taux de transformation" 
            prevValue={`${stats.currentMetrics.buyCount} ventes / ${stats.currentMetrics.leads} visites`}
            icon={<ChartBarIcon className="w-6 h-6" />} 
          />
          <KpiCard 
            title="Commissions Estimées" 
            value={`${stats.currentMetrics.revenue.toLocaleString()} MAD`} 
            change={stats.trends.revenue} 
            subtext="Évolution du Chiffre d'Affaires" 
            prevValue={stats.prevMetrics.revenue}
            icon={<CurrencyDollarIcon className="w-6 h-6" />} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Répartition par Ville</h3>
                <p className="text-xs text-slate-500">Top villes performantes ({period})</p>
              </div>
            </div>
            <div className="flex items-end space-x-6 h-56 w-full pt-4">
              {stats.sortedCities.slice(0, 6).map(([city, count], idx) => {
                const maxCount = Math.max(...stats.sortedCities.map(c => c[1]));
                const heightPercent = (count / maxCount) * 100;
                return (
                  <div key={city} className="flex flex-col items-center justify-end flex-1 h-full group">
                    <div className="relative w-full max-w-[40px] flex flex-col justify-end h-full">
                      <div 
                        className="w-full bg-blue-500 rounded-t-lg group-hover:bg-blue-600 transition-all duration-300 relative" 
                        style={{ height: `${heightPercent}%` }}
                      >
                        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
                          {count} leads
                          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                        </div>
                      </div>
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-3 truncate w-full text-center" title={city}>{city}</span>
                  </div>
                );
              })}
              {stats.sortedCities.length === 0 && (
                <div className="w-full h-full flex items-center justify-center text-slate-300 font-bold italic text-sm">Données insuffisantes</div>
              )}
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col">
            <div className="mb-4">
              <h3 className="font-bold text-slate-900 dark:text-white">Leads par Priorité</h3>
              <p className="text-xs text-slate-500">Qualification des prospects ({period})</p>
            </div>
            <div className="flex-1 flex items-center justify-center min-h-[200px]">
              <div className="relative w-44 h-44">
                <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F1F5F9" strokeWidth="15"></circle>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10B981" strokeWidth="15" strokeDasharray={`${p1} ${circumference}`} strokeDashoffset="0"></circle>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#3B82F6" strokeWidth="15" strokeDasharray={`${p2} ${circumference}`} strokeDashoffset={`-${p1}`}></circle>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F59E0B" strokeWidth="15" strokeDasharray={`${p3} ${circumference}`} strokeDashoffset={`-${p1 + p2}`}></circle>
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#F43F5E" strokeWidth="15" strokeDasharray={`${p4} ${circumference}`} strokeDashoffset={`-${p1 + p2 + p3}`}></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-2xl font-bold text-slate-800 dark:text-white">{stats.currentMetrics.leads}</span>
                  <span className="text-[10px] uppercase text-slate-400 font-semibold">Total</span>
                </div>
              </div>
            </div>
            <div className="space-y-3 mt-4">
              {[
                { label: 'Haute Gamme', sub: 'Produits Premium & Luxe', count: stats.priority.haute, color: 'bg-emerald-500' },
                { label: 'Haute et Moyenne', sub: 'Offre Mixte / Intermédiaire', count: stats.priority.hauteMoyenne, color: 'bg-blue-500' },
                { label: 'Moyenne Gamme', sub: 'Produits Standard', count: stats.priority.moyenne, color: 'bg-amber-500' },
                { label: 'Economie', sub: 'Budget / Entrée de gamme', count: stats.priority.economie, color: 'bg-rose-500' }
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${item.color}`}></span>
                    <div className="flex flex-col">
                      <span className="text-slate-700 dark:text-slate-200 font-medium">{item.label}</span>
                      <span className="text-[10px] text-slate-400">{item.sub}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="block font-bold text-slate-800 dark:text-white">{item.count}</span>
                    <span className="text-[10px] text-slate-400">{((item.count / totalLeadsCount) * 100).toFixed(1)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white">Couverture Territoriale</h3>
                <p className="text-xs text-slate-500">Villes visitées ({period})</p>
              </div>
              <div className="flex gap-2">
                <span className="px-2 py-1 bg-emerald-50 text-emerald-600 rounded text-[10px] font-bold border border-emerald-100">Actif</span>
                <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[10px] font-bold border border-slate-200">Prospect</span>
              </div>
            </div>
            <div className="relative w-full h-[400px] overflow-y-auto pr-2 custom-scrollbar p-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {stats.coverage.map((city) => (
                  <div key={city.name} className="bg-slate-50 dark:bg-slate-700/30 p-4 rounded-xl border border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 transition-all group shadow-sm hover:shadow-md">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${city.sales > 0 ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/50 dark:text-indigo-400' : 'bg-slate-200 text-slate-500 dark:bg-slate-600 dark:text-slate-400'}`}>
                          <MapIcon className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-800 dark:text-white text-sm truncate max-w-[120px]" title={city.name}>{city.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${city.status === 'Actif' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-200 text-slate-600 dark:bg-slate-600 dark:text-slate-300'}`}>
                              {city.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`text-sm font-bold ${city.sales > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-600 dark:text-slate-400'}`}>{city.conv}%</span>
                        <p className="text-[10px] text-slate-400">Conv.</p>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-1.5 mb-4">
                      <div 
                        className={`h-1.5 rounded-full ${city.sales > 0 ? 'bg-emerald-500' : 'bg-slate-400'}`} 
                        style={{ width: `${city.conv}%` }}
                      ></div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 border-t border-slate-200 dark:border-slate-600 pt-3">
                      <div className="text-center">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Visites</p>
                        <p className="font-bold text-slate-700 dark:text-slate-200 text-sm">{city.visits}</p>
                      </div>
                      <div className="text-center border-l border-slate-200 dark:border-slate-600">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Ventes</p>
                        <p className="font-bold text-slate-900 dark:text-white text-sm">{city.sales}</p>
                      </div>
                      <div className="text-center border-l border-slate-200 dark:border-slate-600">
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">Chiffre</p>
                        <p className="font-bold text-emerald-600 dark:text-emerald-400 text-sm truncate" title={`${city.revenue.toLocaleString()} MAD`}>
                          {city.revenue >= 1000 ? `${(city.revenue / 1000).toFixed(1)}k` : city.revenue}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4">Performance Régionale</h3>
            <div className="space-y-4">
              {stats.coverage.slice(0, 5).map((city, i) => (
                <div key={city.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${i === 0 ? 'bg-yellow-100 text-yellow-700' : i === 1 ? 'bg-slate-100 text-slate-700' : 'bg-orange-50 text-orange-700'}`}>
                      {i + 1}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-800 dark:text-white">{city.name}</p>
                      <p className="text-xs text-slate-500">{city.visits} leads • {city.sales} ventes</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600">{city.contribution.toFixed(1)}%</p>
                    <p className="text-[10px] text-slate-400">Contribution CA</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <FilterModal isOpen={isFilterModalOpen} onClose={() => setIsFilterModalOpen(false)} onApply={(newFilters) => { setFilters(newFilters); setIsFilterModalOpen(false); }} onClear={() => { setFilters({ city: '', gammes: [], priorities: [] }); setIsFilterModalOpen(false); }} currentFilters={filters} stores={stores} />
    </div>
  );
};

export default AnalyticsDashboard;
