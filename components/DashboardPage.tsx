import React, { useMemo, useState } from 'react';
import { Store } from '../types.ts';
import SearchIcon from './icons/SearchIcon.tsx';
import StoreTable from './StoreTable.tsx';
import StoreIcon from './icons/StoreIcon.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import CubeIcon from './icons/CubeIcon.tsx';
import LeadPrioritizationModal from './LeadPrioritizationModal.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';
import ArrowPathIcon from './icons/ArrowPathIcon.tsx';

const StatCard: React.FC<{ title: string, count: number, icon: React.ReactNode, iconBgClass: string }> = ({ title, count, icon, iconBgClass }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm flex items-center">
        <div className={`p-3 rounded-full mr-4 ${iconBgClass}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{title}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{count.toLocaleString()}</p>
        </div>
    </div>
);

const ExportExcelIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 14v6m-4-6v6m-4-6v6M3 14h18M3 8l9-5 9 5M3 8v8a2 2 0 002 2h14a2 2 0 002-2V8"></path>
    </svg>
);

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 3v4a1 1 0 001 1h4"></path>
        <path d="M5 12v-7a2 2 0 012-2h7l5 5v11a2 2 0 01-2 2H7a2 2 0 01-2-2v-1"></path>
        <path d="M9 16a1 1 0 011-1h1a1 1 0 110 2H10a1 1 0 01-1-1zm3-1a1 1 0 100 2h.01"></path>
        <path d="M17 17a1 1 0 10-1-1"></path>
    </svg>
);

interface DashboardPageProps {
    stores: Store[];
    authenticatedUser: string;
    isLoading: boolean;
    onViewDetails: (store: Store) => void;
    onEdit?: (store: Store) => void;
    isAdmin?: boolean;
}

const DashboardPage: React.FC<DashboardPageProps> = ({ stores, authenticatedUser, isLoading, onViewDetails, onEdit, isAdmin }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedVille, setSelectedVille] = useState('');
    const [selectedGamme, setSelectedGamme] = useState('');
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedActionClient, setSelectedActionClient] = useState('');
    const [isPrioritizationModalOpen, setIsPrioritizationModalOpen] = useState(false);

    const accessibleStores = useMemo(() => {
        return isAdmin ? stores : stores.filter(s => s.USER === authenticatedUser);
    }, [stores, isAdmin, authenticatedUser]);

    const filterOptions = useMemo(() => {
        const villes = new Set<string>();
        const gammes = new Set<string>();
        const users = new Set<string>();
        const actions = new Set<string>();

        accessibleStores.forEach(store => {
            if (store.Ville) villes.add(store.Ville);
            if (store.Gamme) gammes.add(store.Gamme);
            if (store.USER) users.add(store.USER);
            if (store['Action Client']) actions.add(store['Action Client']);
        });

        return {
            villes: Array.from(villes).sort(),
            gammes: Array.from(gammes).sort(),
            users: Array.from(users).sort(),
            actions: Array.from(actions).sort(),
        };
    }, [accessibleStores]);

    const filteredStores = useMemo(() => {
        return accessibleStores.filter(store => {
            const matchesSearch = searchQuery === '' ||
                Object.values(store).some(val =>
                    String(val).toLowerCase().includes(searchQuery.toLowerCase())
                );

            const matchesVille = selectedVille === '' || store.Ville === selectedVille;
            const matchesGamme = selectedGamme === '' || store.Gamme === selectedGamme;
            const matchesUser = selectedUser === '' || store.USER === selectedUser;
            const matchesAction = selectedActionClient === '' || store['Action Client'] === selectedActionClient;

            return matchesSearch && matchesVille && matchesGamme && matchesUser && matchesAction;
        });
    }, [accessibleStores, searchQuery, selectedVille, selectedGamme, selectedUser, selectedActionClient]);

    const uniqueDisplayStores = useMemo(() => {
        const map = new Map<string, Store & { clientType?: string }>();
        const now = new Date();
        const hundredEightyDaysAgo = new Date(now.getTime() - (180 * 24 * 60 * 60 * 1000));
        const oneYearAgo = new Date(now.getTime() - (365 * 24 * 60 * 60 * 1000));

        const storeGroups = new Map<string, Store[]>();
        accessibleStores.forEach(s => {
            const key = s.Magazin.trim().toLowerCase();
            if (!storeGroups.has(key)) storeGroups.set(key, []);
            storeGroups.get(key)!.push(s);
        });

        filteredStores.forEach(store => {
            if (!store.Magazin) return;
            const key = store.Magazin.trim().toLowerCase();
            const existing = map.get(key);

            const currentPrix = Number(store.Prix) || 0;
            const currentQty = Number(store.Quantité) || 0;

            const allInteractions = storeGroups.get(key) || [];
            const orders = allInteractions.filter(i => i['Action Client']?.toLowerCase() === 'acheter');
            const latestOrder = orders.length > 0 ? orders.sort((a, b) => new Date(b['Date Heure'] || b.Date).getTime() - new Date(a['Date Heure'] || a.Date).getTime())[0] : null;
            const latestOrderDate = latestOrder ? new Date(latestOrder['Date Heure'] || latestOrder.Date) : null;
            
            const ordersLast180Days = orders.filter(i => new Date(i['Date Heure'] || i.Date) >= hundredEightyDaysAgo);
            const totalRevenueYear = orders
                .filter(i => new Date(i['Date Heure'] || i.Date) >= oneYearAgo)
                .reduce((sum, i) => sum + (Number(i.Prix) || 0), 0);

            let type = 'Lead';
            // التحقق أولاً من خاصية الحظر الدائمة
            if (store.is_blocked) {
                type = 'Client Bloqué';
            } else if (totalRevenueYear >= 40000) {
                type = 'Client Stratégique';
            } else if (ordersLast180Days.length >= 2) {
                type = 'Client Actif';
            } else if (latestOrderDate && latestOrderDate < hundredEightyDaysAgo) {
                type = 'Client Perdu';
            } else if (orders.length === 1) {
                type = 'Nouveau Client';
            }

            if (!existing) {
                map.set(key, { ...store, Prix: currentPrix, Quantité: currentQty, clientType: type });
            } else {
                const dateA = new Date(store['Date Heure'] || store.Date).getTime();
                const dateB = new Date(existing['Date Heure'] || existing.Date).getTime();
                const isNewer = !isNaN(dateA) && !isNaN(dateB) ? dateA > dateB : (parseInt(store.ID) || 0) > (parseInt(existing.ID) || 0);

                const totalPrix = existing.Prix + currentPrix;
                const totalQty = existing.Quantité + currentQty;

                if (isNewer) {
                    map.set(key, { ...store, Prix: totalPrix, Quantité: totalQty, clientType: type });
                } else {
                    map.set(key, { ...existing, Prix: totalPrix, Quantité: totalQty, clientType: type });
                }
            }
        });

        return Array.from(map.values());
    }, [filteredStores, accessibleStores]);

    const stats = useMemo(() => {
        const uniqueMagazins = new Set(accessibleStores.map(s => s.Magazin.trim().toLowerCase())).size;
        const uniqueCities = new Set(accessibleStores.map(s => s.Ville.trim().toLowerCase())).size;
        let upcomingAppointmentsCount = 0;
        let totalQuantity = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        accessibleStores.forEach(s => {
            if (s.Quantité) {
                const qty = typeof s.Quantité === 'string' ? parseFloat(s.Quantité) : s.Quantité;
                if (!isNaN(qty)) totalQuantity += qty;
            }
            if (s['Rendez-Vous']) {
                const dateStrings = s['Rendez-Vous'].split(/[\n,]/).map(str => str.trim()).filter(Boolean);
                dateStrings.forEach(dateStr => {
                    const appointmentDate = new Date(dateStr);
                    if (!isNaN(appointmentDate.getTime()) && appointmentDate >= today) {
                        upcomingAppointmentsCount++;
                    }
                });
            }
        });
        return { 
            magazins: uniqueMagazins, 
            appointments: upcomingAppointmentsCount, 
            cities: uniqueCities, 
            totalInteractions: accessibleStores.length, 
            quantity: totalQuantity 
        };
    }, [accessibleStores]);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedVille('');
        setSelectedGamme('');
        setSelectedUser('');
        setSelectedActionClient('');
    };

    const exportToExcel = () => {
        if (filteredStores.length === 0) return;
        const headers = ['ID Visite', 'Date Visite', 'Magazin', 'Le Gérant', 'GSM 1', 'Ville', 'Gamme', 'Action', 'Prix', 'Quantité', 'USER'];
        const csvRows = filteredStores.map(store => {
            const row = [store.ID, store.Date, store.Magazin, store['Le Gérant'], store.GSM1, store.Ville, store.Gamme, store['Action Client'], store.Prix, store.Quantité, store.USER];
            return row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',');
        });
        const csvContent = [headers.join(','), ...csvRows].join('\n');
        const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `export_apollo_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Gestion des Leads</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Créez et suivez vos prospects à travers le Maroc. Filtrez, organisez et planifiez vos actions commerciales.</p>
                </div>
                <button
                    onClick={() => setIsPrioritizationModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all active:scale-95 font-bold text-sm"
                >
                    <SparklesIcon className="w-5 h-5 text-yellow-300" />
                    <span>Prioriser avec IA</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard 
                    title="Les Magazin" 
                    count={stats.magazins} 
                    icon={<StoreIcon className="w-6 h-6" />} 
                    iconBgClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" 
                />
                <StatCard 
                    title="Rendez-vous" 
                    count={stats.appointments} 
                    icon={<CalendarDaysIcon className="w-6 h-6" />} 
                    iconBgClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" 
                />
                <StatCard 
                    title="Nombre Villes" 
                    count={stats.cities} 
                    icon={<MapIcon className="w-6 h-6" />} 
                    iconBgClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" 
                />
                <StatCard 
                    title="Quantité" 
                    count={stats.quantity} 
                    icon={<CubeIcon className="w-6 h-6" />} 
                    iconBgClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" 
                />
                <StatCard 
                    title="Total Visits" 
                    count={stats.totalInteractions} 
                    icon={<UsersIcon className="w-6 h-6" />} 
                    iconBgClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" 
                />
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Recherche..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10 w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white"
                        />
                    </div>
                    <select
                        value={selectedVille}
                        onChange={(e) => setSelectedVille(e.target.value)}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white"
                    >
                        <option value="">Villes</option>
                        {filterOptions.villes.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <select
                        value={selectedGamme}
                        onChange={(e) => setSelectedGamme(e.target.value)}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white"
                    >
                        <option value="">Gammes</option>
                        {filterOptions.gammes.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white"
                    >
                        <option value="">Utilisateurs</option>
                        {filterOptions.users.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                    <select
                        value={selectedActionClient}
                        onChange={(e) => setSelectedActionClient(e.target.value)}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-slate-900 dark:text-white"
                    >
                        <option value="">Actions Client</option>
                        {filterOptions.actions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={resetFilters}
                        className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium cursor-pointer"
                    >
                        Réinitialiser les filtres
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-white">{uniqueDisplayStores.length}</span> Clients Uniques
                    <span className="text-xs ml-1 text-slate-400">(sur {stats.totalInteractions} interactions)</span>
                </p>
                <div className="flex items-center gap-2">
                    <button
                        onClick={exportToExcel}
                        className="p-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                        <ExportExcelIcon /> Export Excel
                    </button>
                    <button
                        onClick={() => window.print()}
                        className="p-2 text-sm font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border dark:border-slate-700 rounded-md shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                    >
                        <PdfIcon /> PDF
                    </button>
                </div>
            </div>

            <StoreTable
                stores={uniqueDisplayStores}
                onViewDetails={onViewDetails}
                onEdit={onEdit}
                isLoading={isLoading}
                isAdmin={isAdmin}
            />

            <LeadPrioritizationModal
                isOpen={isPrioritizationModalOpen}
                onClose={() => setIsPrioritizationModalOpen(false)}
                stores={uniqueDisplayStores}
            />
        </div>
    );
};

export default DashboardPage;