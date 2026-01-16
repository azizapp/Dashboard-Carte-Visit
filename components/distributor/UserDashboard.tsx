
import React, { useState, useMemo } from 'react';
import { Store, FilterState } from '../../types.ts';
import SearchIcon from '../icons/SearchIcon.tsx';
import PlusIcon from '../icons/PlusIcon.tsx';
import LocationMarkerIcon from '../icons/LocationMarkerIcon.tsx';
import CalendarDaysIcon from '../icons/CalendarDaysIcon.tsx';
import EllipsisVerticalIcon from '../icons/EllipsisVerticalIcon.tsx';
import ClipboardDocumentListIcon from '../icons/ClipboardDocumentListIcon.tsx';
import FilterModal from '../FilterModal.tsx';

const AdjustmentsHorizontalIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" />
  </svg>
);

interface UserDashboardProps {
    stores: Store[];
    authenticatedUser: string;
    onAddLead: () => void;
    onViewDetails: (store: Store) => void;
    onViewAppointments?: () => void;
    onViewSettings?: () => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ stores, authenticatedUser, onAddLead, onViewDetails, onViewAppointments, onViewSettings }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
    const [filters, setFilters] = useState<FilterState>({
        city: '',
        gammes: [],
        priorities: []
    });

    const userLeads = useMemo(() => {
        const map = new Map<string, { latest: Store, count: number }>();
        
        // Filtrer par utilisateur authentifié d'abord
        const userSpecificStores = stores.filter(s => s.USER === authenticatedUser);

        userSpecificStores.forEach(s => {
            const key = s.Magazin.toLowerCase().trim();
            const existing = map.get(key);
            if (!existing) {
                map.set(key, { latest: s, count: 1 });
            } else {
                const dateA = new Date(s['Date Heure'] || s.Date).getTime();
                const dateB = new Date(existing.latest['Date Heure'] || existing.latest.Date).getTime();
                if (dateA > dateB) {
                    map.set(key, { latest: s, count: existing.count + 1 });
                } else {
                    map.set(key, { latest: existing.latest, count: existing.count + 1 });
                }
            }
        });

        return Array.from(map.values())
            .filter(({ latest }) => {
                // Filtre de recherche
                const matchesSearch = 
                    latest.Magazin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    latest.Ville.toLowerCase().includes(searchQuery.toLowerCase());
                
                if (!matchesSearch) return false;

                // Filtre de ville
                if (filters.city && latest.Ville !== filters.city) return false;

                // Filtre de gamme
                if (filters.gammes.length > 0) {
                    if (!latest.Gamme || !filters.gammes.includes(latest.Gamme)) return false;
                }

                return true;
            })
            .sort((a, b) => new Date(b.latest['Date Heure'] || b.latest.Date).getTime() - new Date(a.latest['Date Heure'] || a.latest.Date).getTime());
    }, [stores, authenticatedUser, searchQuery, filters]);

    const activeFiltersCount = (filters.city ? 1 : 0) + filters.gammes.length;

    return (
        <div className="relative min-h-full pb-24 bg-[#F7F8FA] dark:bg-slate-900 max-w-xl mx-auto">
            {/* Zone d'en-tête / Recherche */}
            <div className="sticky top-0 z-10 bg-[#F7F8FA]/95 dark:bg-slate-900/95 backdrop-blur-sm pb-4 pt-4 px-2">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2.5 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher des prospects"
                            className="w-full pl-11 pr-4 py-2 bg-transparent outline-none text-[15px] font-medium text-slate-700 dark:text-white placeholder:text-slate-400"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-1 pr-1 border-l border-slate-100 dark:border-slate-700 pl-2">
                        <button 
                            onClick={() => setIsFilterModalOpen(true)}
                            className={`p-2 rounded-xl transition-colors relative ${activeFiltersCount > 0 ? 'text-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700'}`}
                        >
                            <AdjustmentsHorizontalIcon className="w-5 h-5" />
                            {activeFiltersCount > 0 && (
                                <span className="absolute top-1 right-1 w-2 h-2 bg-blue-600 rounded-full border-2 border-white dark:border-slate-800"></span>
                            )}
                        </button>
                        <button 
                            onClick={onViewAppointments}
                            className="p-2 text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded-xl transition-colors"
                        >
                            <CalendarDaysIcon className="w-5 h-5" />
                        </button>
                        <button 
                            onClick={onViewSettings}
                            className="p-2 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl transition-colors"
                        >
                            <EllipsisVerticalIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Liste des prospects */}
            <div className="space-y-4 mt-2 px-2 pb-10">
                {userLeads.length > 0 ? (
                    userLeads.map(({ latest, count }) => (
                        <div 
                            key={latest.ID}
                            onClick={() => onViewDetails(latest)}
                            className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all active:scale-[0.99] cursor-pointer relative overflow-hidden group"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-[17px] font-bold text-slate-900 dark:text-white leading-tight pr-8">
                                    {latest.Magazin}
                                </h3>
                                <div className="absolute top-6 right-5 w-2.5 h-2.5 rounded-full bg-slate-400 border-2 border-white dark:border-slate-800 shadow-sm"></div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <LocationMarkerIcon className="w-[16px] h-[16px] text-slate-300" />
                                    <span className="text-[12px] font-normal">{latest.Ville}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <CalendarDaysIcon className="w-[16px] h-[16px] text-slate-300" />
                                    <span className="text-[12px] font-normal">{latest.Date}: Dernière visite</span>
                                </div>
                                {count > 1 && (
                                    <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                        <ClipboardDocumentListIcon className="w-[16px] h-[16px] text-slate-300" />
                                        <span className="text-[12px] font-normal">{count} suivis</span>
                                    </div>
                                )}
                            </div>

                            {latest.Gamme && (
                                <div className="mt-5 flex justify-end">
                                    <span className="bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-3 py-1.5 rounded-xl text-[11px] font-bold border border-slate-100 dark:border-slate-700">
                                        {latest.Gamme}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 mx-2">
                        <SearchIcon className="w-12 h-12 text-slate-200 dark:text-slate-700 mx-auto mb-4" />
                        <p className="text-slate-500 dark:text-slate-400 font-bold">Aucun prospect trouvé</p>
                        <p className="text-slate-400 text-xs mt-1">Essayez d'ajuster vos filtres ou votre recherche</p>
                    </div>
                )}
            </div>

            {/* Bouton d'action flottant */}
            <button 
                onClick={onAddLead}
                className="fixed bottom-10 right-10 w-16 h-16 bg-[#4407EB] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20 shadow-blue-500/20 border-4 border-white/20"
            >
                <PlusIcon className="w-8 h-8 stroke-[2.5px]" />
            </button>

            <FilterModal 
                isOpen={isFilterModalOpen}
                onClose={() => setIsFilterModalOpen(false)}
                onApply={(newFilters) => {
                    setFilters(newFilters);
                    setIsFilterModalOpen(false);
                }}
                onClear={() => {
                    setFilters({ city: '', gammes: [], priorities: [] });
                    setIsFilterModalOpen(false);
                }}
                currentFilters={filters}
                stores={stores.filter(s => s.USER === authenticatedUser)}
            />
        </div>
    );
};

export default UserDashboard;
