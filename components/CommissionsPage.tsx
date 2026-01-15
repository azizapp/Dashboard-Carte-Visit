import React, { useState, useMemo } from 'react';
import { Store } from '../types.ts';
import CubeIcon from './icons/CubeIcon.tsx';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import BellIcon from './icons/BellIcon.tsx';
import ClockIcon from './icons/ClockIcon.tsx';

// --- StatCard: بطاقة إحصاء بنصوص صغيرة وأوزان خفيفة ---
const StatCard = ({ title, value, sub, icon: Icon, iconBg }: any) => (
  <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-3">
    <div className={`w-8 h-8 rounded-lg ${iconBg} flex items-center justify-center`}>
      <Icon className="w-4 h-4 text-current" />
    </div>
    <div className="space-y-0.5">
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">{value}</h3>
      <p className="text-[9px] font-medium text-slate-400 uppercase tracking-wider">{title}</p>
      <p className="text-[10px] text-slate-400 font-normal italic">{sub}</p>
    </div>
  </div>
);

// --- CommissionLevelBar: بطاقة البائع بمستويات واقعية (0-2000 مبيعة) ---
const CommissionLevelBar: React.FC<{ user: string; currentSales: number; revenue: number }> = ({ user, currentSales, revenue }) => {
  const levels = [0, 700, 1000, 1500, 2000];
  const max = 2000;
  const progressPercent = Math.min((currentSales / max) * 100, 100);
  
  const getLevelLabel = (sales: number) => {
    if (sales >= 2000) return "Élite Diamant";
    if (sales >= 1501) return "Sénior Expert";
    if (sales >= 1001) return "Confirmé Plus";
    if (sales >= 701) return "Intermédiaire";
    return ""; 
  };

  const levelLabel = getLevelLabel(currentSales);
  const nextLevel = levels.find(l => l > currentSales) || max;
  const remaining = nextLevel - currentSales;

  return (
    <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-4 hover:border-accent transition-colors group">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 flex items-center justify-center text-slate-400 font-semibold text-sm">
            {user.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800 dark:text-white group-hover:text-accent transition-colors">{user}</h3>
            {levelLabel && (
                <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[8px] font-bold uppercase rounded border border-indigo-100 dark:border-indigo-800/50">
                    {levelLabel}
                </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <h4 className="text-sm font-semibold text-slate-900 dark:text-white">{revenue.toLocaleString()} DH</h4>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{currentSales} Pièces Vendues / {max}</p>
        </div>
      </div>

      <div className="relative pt-2 pb-1">
        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-700 rounded-full relative">
          <div 
            className="absolute top-0 left-0 h-full bg-accent rounded-full transition-all duration-1000 shadow-[0_0_8px_rgba(79,70,229,0.3)]"
            style={{ width: `${progressPercent}%` }}
          />
          {levels.map((v, i) => (
             <div 
                key={i} 
                className="absolute top-1/2 -translate-y-1/2 w-1 h-1 bg-white dark:bg-slate-900 rounded-full z-10 opacity-30"
                style={{ left: `${(v/max)*100}%` }}
             />
          ))}
        </div>
        <div className="flex justify-between mt-2.5 text-[8px] font-bold text-slate-400 uppercase tracking-widest opacity-60">
          <span>Start</span>
          <span>700</span>
          <span>1000</span>
          <span>1500</span>
          <span>Max 2000</span>
        </div>
      </div>

      <div className="flex justify-between items-center border-t border-slate-50 dark:border-slate-700 pt-3">
        <span className="text-[9px] font-medium text-slate-400 italic">Basé sur le volume de ventes réel</span>
        <p className="text-[8px] font-black text-indigo-500 uppercase tracking-widest flex items-center gap-1">
          {remaining > 0 ? `${remaining} pièces pour progresser` : 'Objectif Final Atteint'}
          <ClockIcon className="w-2 h-2" />
        </p>
      </div>
    </div>
  );
};

const CommissionsPage: React.FC<{ stores: Store[] }> = ({ stores }) => {
  const [selectedUser, setSelectedUser] = useState('all');
  const [selectedCity, setSelectedCity] = useState('all');
  // تم تغيير الحالة الافتراضية إلى 'month' (هذا الشهر) بناءً على الطلب
  const [period, setPeriod] = useState('month');

  const uniqueUsers = useMemo(() => Array.from(new Set(stores.map(s => s.USER))).filter(Boolean).sort(), [stores]);
  const uniqueCities = useMemo(() => Array.from(new Set(stores.map(s => s.Ville))).filter(Boolean).sort(), [stores]);

  const stats = useMemo(() => {
    const now = new Date();

    // تفعيل الفلترة الصارمة على جميع البيانات المستعملة في الصفحة
    const filtered = stores.filter(s => {
      const matchesUser = selectedUser === 'all' || s.USER === selectedUser;
      const matchesCity = selectedCity === 'all' || s.Ville === selectedCity;
      
      let matchesPeriod = true;
      if (period !== 'all') {
          const storeDate = new Date(s['Date Heure'] || s.Date);
          
          if (period === 'today') {
              matchesPeriod = storeDate.toDateString() === now.toDateString();
          } else if (period === 'month') {
              matchesPeriod = storeDate.getMonth() === now.getMonth() && storeDate.getFullYear() === now.getFullYear();
          } else if (period === 'last_month') {
              const firstOfCurrent = new Date(now.getFullYear(), now.getMonth(), 1);
              const firstOfLast = new Date(now.getFullYear(), now.getMonth() - 1, 1);
              matchesPeriod = storeDate >= firstOfLast && storeDate < firstOfCurrent;
          } else if (period === 'last_3_months') {
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setDate(now.getDate() - 90);
              matchesPeriod = storeDate >= threeMonthsAgo;
          } else if (period === 'current_quarter') {
              const qMonth = Math.floor(now.getMonth() / 3) * 3;
              const firstOfQuarter = new Date(now.getFullYear(), qMonth, 1);
              matchesPeriod = storeDate >= firstOfQuarter;
          }
      }
      return matchesUser && matchesCity && matchesPeriod;
    });

    const totalSales = filtered.filter(s => s['Action Client']?.toLowerCase() === 'acheter').reduce((acc, s) => acc + (Number(s.Quantité) || 0), 0);
    const totalRevenue = filtered.reduce((acc, s) => acc + (Number(s.Prix) || 0), 0);
    const citiesCount = new Set(filtered.map(s => s.Ville)).size;
    const interactionsCount = filtered.length;

    // العثور على آخر مبيعة بناءً على البيانات المفلترة
    const salesOnly = filtered.filter(s => s['Action Client']?.toLowerCase() === 'acheter');
    const latestSale = salesOnly.sort((a, b) => 
        new Date(b['Date Heure'] || b.Date).getTime() - new Date(a['Date Heure'] || a.Date).getTime()
    )[0];

    const userMap = new Map<string, { revenue: number; sales: number }>();
    filtered.forEach(s => {
        if (!s.USER) return;
        const current = userMap.get(s.USER) || { revenue: 0, sales: 0 };
        const isSale = s['Action Client']?.toLowerCase() === 'acheter';
        userMap.set(s.USER, {
            revenue: current.revenue + (Number(s.Prix) || 0),
            // حساب التقدم بناءً على عدد القطع المباعة (الكمية) وليس عدد الزيارات
            sales: current.sales + (isSale ? (Number(s.Quantité) || 1) : 0)
        });
    });

    const ranking = Array.from(userMap.entries()).map(([email, data]) => ({
        name: email.split('@')[0],
        fullEmail: email,
        ...data
    })).sort((a, b) => b.revenue - a.revenue);

    return { totalSales, totalRevenue, citiesCount, interactionsCount, ranking, latestSale };
  }, [stores, selectedUser, selectedCity, period]);

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-[1600px] mx-auto pb-32 bg-[#F7F8FA] dark:bg-slate-900 min-h-screen font-sans">
      
      {/* Header & Filters Area */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">Suivi Commercial</h1>
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-[0.2em] mt-1.5">Analyse des objectifs et des paliers de l'équipe</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm w-full lg:w-auto">
                <select 
                    value={selectedUser} 
                    onChange={e => { setSelectedUser(e.target.value); }}
                    className="bg-transparent text-[11px] font-bold text-slate-600 dark:text-slate-300 px-4 py-2 outline-none border-r border-slate-100 dark:border-slate-700 cursor-pointer"
                >
                    <option value="all">Toute l'Équipe</option>
                    {uniqueUsers.map(u => <option key={u} value={u}>{u.split('@')[0]}</option>)}
                </select>
                <select 
                    value={selectedCity} 
                    onChange={e => { setSelectedCity(e.target.value); }}
                    className="bg-transparent text-[11px] font-bold text-slate-600 dark:text-slate-300 px-4 py-2 outline-none border-r border-slate-100 dark:border-slate-700 cursor-pointer"
                >
                    <option value="all">Toutes les Villes</option>
                    {uniqueCities.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <select 
                    value={period} 
                    onChange={e => { setPeriod(e.target.value); }}
                    className="bg-transparent text-[11px] font-bold text-slate-600 dark:text-slate-300 px-4 py-2 outline-none cursor-pointer"
                >
                    <option value="all">Global</option>
                    <option value="today">Aujourd'hui</option>
                    <option value="month">Ce mois</option>
                    <option value="last_month">Mois dernier</option>
                    <option value="last_3_months">3 derniers mois</option>
                    <option value="current_quarter">Trimestre actuel</option>
                </select>
            </div>
        </div>
      </div>

      {/* Top Stat Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Pièces Vendues" value={stats.totalSales} sub="Volume cumulé (Période)" icon={CubeIcon} iconBg="bg-blue-50 text-blue-500 dark:bg-blue-900/20" />
        <StatCard title="CA RÉALISÉ" value={`${stats.totalRevenue.toLocaleString()} DH`} sub="Valeur totale (Période)" icon={CurrencyDollarIcon} iconBg="bg-emerald-50 text-emerald-500 dark:bg-emerald-900/20" />
        <StatCard title="Villes Actives" value={stats.citiesCount} sub="Secteurs d'activité" icon={MapIcon} iconBg="bg-purple-50 text-purple-500 dark:bg-purple-900/20" />
        <StatCard title="Interactions" value={stats.interactionsCount} sub="Visites & Contacts" icon={UsersIcon} iconBg="bg-amber-50 text-amber-500 dark:bg-amber-900/20" />
      </div>

      {/* Main Container with Sidebar alignment */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        
        {/* Left Column: Staff Progression */}
        <div className="lg:col-span-8 flex flex-col gap-6">
             <div className="flex items-center justify-between px-1">
                <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-1 h-4 bg-accent rounded-full"></span>
                    Progression de l'Équipe
                </h2>
                <span className="text-[9px] font-bold text-slate-300 bg-white dark:bg-slate-800 px-3 py-1 rounded-full border border-slate-100 dark:border-slate-700 shadow-sm">Objectif: 2000 Pièces</span>
             </div>
             <div className="flex flex-col gap-5">
                {stats.ranking.map((user) => (
                    <CommissionLevelBar key={user.fullEmail} user={user.name} currentSales={user.sales} revenue={user.revenue} />
                ))}
                {stats.ranking.length === 0 && (
                    <div className="py-24 text-center bg-white dark:bg-slate-800 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700">
                        <p className="text-xs text-slate-400 font-medium italic">Aucune donnée pour cette sélection</p>
                    </div>
                )}
             </div>
        </div>

        {/* Right Column: Alerts & Performance */}
        <div className="lg:col-span-4 flex flex-col h-full">
          
          {/* Header MATCHING the left column for alignment */}
          <div className="flex items-center justify-between px-1 mb-6">
            <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1 h-4 bg-indigo-400 rounded-full"></span>
                Analyse & Performance
            </h2>
            <span className="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">Filtres Actifs</span>
          </div>

          {/* Top Performance Ranking Card */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mb-8">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg text-indigo-500">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/></svg>
              </div>
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Classement (Période)</h3>
            </div>
            
            <div className="space-y-6">
              {stats.ranking.slice(0, 5).map((user, idx) => (
                <div key={user.fullEmail} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-[10px] font-black border ${idx === 0 ? 'bg-amber-50 border-amber-100 text-amber-600 shadow-sm' : 'bg-slate-50 dark:bg-slate-700 border-slate-100 dark:border-slate-600 text-slate-400'}`}>
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-[12px] font-bold text-slate-700 dark:text-slate-200">{user.name}</h4>
                      <p className="text-[9px] text-slate-400 font-medium">{user.sales} pièces</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-bold text-slate-900 dark:text-white tracking-tight">{user.revenue.toLocaleString()} DH</p>
                  </div>
                </div>
              ))}
              {stats.ranking.length === 0 && (
                <p className="text-center py-6 text-[10px] text-slate-400 italic">Aucune donnée</p>
              )}
            </div>
          </div>

          <div className="flex-grow"></div>

          {/* Activity Alerts - ALIGNED TO BOTTOM OF GRID */}
          <div className="bg-white dark:bg-slate-800 p-8 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm mt-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-rose-50 dark:bg-rose-900/20 rounded-lg text-rose-500 shadow-sm">
                  <BellIcon className="w-4 h-4" />
              </div>
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Dernière Vente (Période)</h3>
            </div>
            <div className="space-y-5">
               {/* Last Sale Enhanced Alert */}
               {stats.latestSale ? (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/30 rounded-2xl border-l-4 border-emerald-500 group hover:bg-emerald-100 transition-colors shadow-sm">
                     <div className="flex items-center justify-between mb-3">
                         <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-black uppercase tracking-tight">Vente Récente</p>
                         <span className="text-[9px] font-bold text-slate-400">{stats.latestSale.Date}</span>
                     </div>
                     <div className="flex justify-between items-end">
                         <div className="max-w-[140px]">
                             <p className="text-[12px] font-bold text-slate-800 dark:text-white leading-tight truncate">{stats.latestSale.Magazin}</p>
                             <p className="text-[10px] text-slate-400 mt-1 font-medium italic">Par {stats.latestSale.USER?.split('@')[0]}</p>
                         </div>
                         <div className="text-right">
                            <p className="text-[14px] font-black text-emerald-600 dark:text-emerald-400">{stats.latestSale.Prix.toLocaleString()} DH</p>
                            <p className="text-[8px] text-emerald-400 font-bold uppercase">{stats.latestSale.Quantité} Unités</p>
                         </div>
                     </div>
                  </div>
               ) : (
                  <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-l-4 border-slate-300">
                     <p className="text-[10px] text-slate-400 font-bold uppercase italic text-center">Aucune vente enregistrée sur cette période</p>
                  </div>
               )}

               <div className="p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border-l-4 border-indigo-400">
                  <p className="text-[10px] text-slate-600 dark:text-slate-300 font-medium leading-relaxed uppercase tracking-tight">Focus <span className="text-indigo-600 font-black">{selectedCity === 'all' ? (uniqueCities[0] || 'Secteur') : selectedCity}</span></p>
                  <p className="text-[11px] text-slate-500 mt-1">L'IA analyse les opportunités sur ce segment temporel.</p>
               </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CommissionsPage;