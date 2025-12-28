
import React, { useMemo, useState } from 'react';
import { Store } from '../types.ts';
import SearchIcon from './icons/SearchIcon.tsx';
import StoreTable from './StoreTable.tsx';
import PlusIcon from './icons/PlusIcon.tsx';
import ArrowPathIcon from './icons/ArrowPathIcon.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';

import StoreIcon from './icons/StoreIcon.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';

import MapIcon from './icons/MapIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import CubeIcon from './icons/CubeIcon.tsx';
import LeadPrioritizationModal from './LeadPrioritizationModal.tsx';

const StatCard: React.FC<{ title: string, count: number, icon: React.ReactNode, iconColorClass?: string }> = ({ title, count, icon, iconColorClass }) => (
    <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm flex flex-col items-start gap-4 transition-all hover:shadow-md border border-slate-100 dark:border-slate-700">
        <div className="flex justify-between w-full">
            <div className={`p-3 rounded-xl ${iconColorClass || 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {icon}
            </div>
        </div>
        <div>
            <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-1">{count.toLocaleString()}</p>
            <p className="text-sub uppercase tracking-wider">{title}</p>
        </div>
    </div>
)

const CsvIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-emerald-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h1.5m17.25 0a1.125 1.125 0 0 0 1.125-1.125M22.125 19.5h-1.5M3.375 6h17.25M3.375 6a1.125 1.125 0 0 0-1.125 1.125v11.25m18.375-12.375a1.125 1.125 0 0 1 1.125 1.125v11.25m-18.375-12.375h1.5m17.25 0h-1.5M8.25 9.75h.008v.008H8.25V9.75Zm.008 2.25H8.25v.008h.008V12Zm0 2.25H8.25v.008h.008V14.25Zm3-4.5h.008v.008H11.25V9.75Zm.008 2.25H11.25v.008h.008V12Zm0 2.25H11.25v.008h.008V14.25Zm3-4.5h.008v.008H14.25V9.75Zm.008 2.25H14.25v.008h.008V12Zm0 2.25H14.25v.008h.008V14.25Zm3-4.5h.008v.008H17.25V9.75Zm.008 2.25H17.25v.008h.008V12Zm0 2.25H17.25v.008h.008V14.25Z" />
    </svg>
);

const PdfIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-5 h-5 text-rose-600">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
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
        const map = new Map<string, Store>();

        filteredStores.forEach(store => {
            if (!store.Magazin) return;
            const key = store.Magazin.trim().toLowerCase();
            const existing = map.get(key);

            const currentPrix = Number(store.Prix) || 0;
            const currentQty = Number(store.Quantité) || 0;

            if (!existing) {
                map.set(key, { ...store, Prix: currentPrix, Quantité: currentQty });
            } else {
                const dateA = new Date(store['Date Heure'] || store.Date).getTime();
                const dateB = new Date(existing['Date Heure'] || existing.Date).getTime();
                const isNewer = !isNaN(dateA) && !isNaN(dateB) ? dateA > dateB : (parseInt(store.ID) || 0) > (parseInt(existing.ID) || 0);

                const totalPrix = existing.Prix + currentPrix;
                const totalQty = existing.Quantité + currentQty;

                if (isNewer) {
                    map.set(key, { ...store, Prix: totalPrix, Quantité: totalQty });
                } else {
                    map.set(key, { ...existing, Prix: totalPrix, Quantité: totalQty });
                }
            }
        });

        return Array.from(map.values());
    }, [filteredStores]);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedVille('');
        setSelectedGamme('');
        setSelectedUser('');
        setSelectedActionClient('');
    };

    const stats = useMemo(() => {
        const uniqueMagazins = new Set<string>();
        const uniqueCities = new Set<string>();
        let upcomingAppointmentsCount = 0;
        let totalQuantity = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        accessibleStores.forEach(s => {
            if (s.Magazin) uniqueMagazins.add(s.Magazin.trim());
            if (s.Ville) uniqueCities.add(s.Ville.trim());
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
        return { urgentes: uniqueMagazins.size, appointments: upcomingAppointmentsCount, cities: uniqueCities.size, total: accessibleStores.length, quantity: totalQuantity };
    }, [accessibleStores]);

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

    const exportToPdf = () => {
        if (filteredStores.length === 0) return;
        window.print();
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-heading text-3xl">{isAdmin ? 'Gestion des Leads' : 'Mes Prospects'}</h1>
                    <p className="text-std mt-1">{isAdmin ? 'Suivi global des clients et performances.' : 'Suivez vos propres interactions clients.'}</p>
                </div>
                <button
                    onClick={() => setIsPrioritizationModalOpen(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none transition-all active:scale-95 font-bold text-sm"
                >
                    <SparklesIcon className="w-5 h-5 text-yellow-300" />
                    <span>Prioriser avec IA</span>
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <StatCard title="Magasins" count={stats.urgentes} icon={<StoreIcon className="w-6 h-6" />} iconColorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" />
                <StatCard title="Rendez-vous" count={stats.appointments} icon={<CalendarDaysIcon className="w-6 h-6" />} iconColorClass="bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" />
                <StatCard title="Villes" count={stats.cities} icon={<MapIcon className="w-6 h-6" />} iconColorClass="bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" />
                <StatCard title="Articles" count={stats.quantity} icon={<CubeIcon className="w-6 h-6" />} iconColorClass="bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400" />
                <StatCard title="Interactions" count={stats.total} icon={<UsersIcon className="w-6 h-6" />} iconColorClass="bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" />
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm space-y-4 border border-slate-100 dark:border-slate-700">
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
                            className="pl-10 w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-emph"
                        />
                    </div>
                    <select
                        value={selectedVille}
                        onChange={(e) => setSelectedVille(e.target.value)}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-emph"
                    >
                        <option value="">Toutes les Villes</option>
                        {filterOptions.villes.map(v => <option key={v} value={v}>{v}</option>)}
                    </select>
                    <select
                        value={selectedGamme}
                        onChange={(e) => setSelectedGamme(e.target.value)}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-emph"
                    >
                        <option value="">Toutes les Gammes</option>
                        {filterOptions.gammes.map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                    {isAdmin && (
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-emph"
                        >
                            <option value="">Tous les Vendeurs</option>
                            {filterOptions.users.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                    )}
                    <select
                        value={selectedActionClient}
                        onChange={(e) => setSelectedActionClient(e.target.value)}
                        className="w-full rounded-md border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm sm:text-sm focus:border-blue-500 focus:ring-blue-500 text-emph"
                    >
                        <option value="">Toutes les Actions</option>
                        {filterOptions.actions.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={resetFilters}
                        className="text-sub text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                    >
                        Réinitialiser
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <p className="text-std">
                    Affichage de <span className="text-emph font-bold">{uniqueDisplayStores.length}</span> clients (Données cumulées)
                </p>
                <div className="flex items-center gap-3">
                    <button
                        onClick={exportToExcel}
                        className="px-4 py-2 text-sm font-bold text-slate-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 transition-all active:scale-95"
                    >
                        <CsvIcon />
                        <span>Export CSV</span>
                    </button>
                    <button
                        onClick={exportToPdf}
                        className="px-4 py-2 text-sm font-bold text-slate-700 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2.5 transition-all active:scale-95"
                    >
                        <PdfIcon />
                        <span>Export PDF</span>
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
