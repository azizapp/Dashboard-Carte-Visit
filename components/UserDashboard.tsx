
import React, { useState, useMemo } from 'react';
import { Store } from '../types.ts';
import SearchIcon from './icons/SearchIcon.tsx';
import PlusIcon from './icons/PlusIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import LocationMarkerIcon from './icons/LocationMarkerIcon.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import EllipsisVerticalIcon from './icons/EllipsisVerticalIcon.tsx';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon.tsx';

interface UserDashboardProps {
    stores: Store[];
    authenticatedUser: string;
    onAddLead: () => void;
    onViewDetails: (store: Store) => void;
}

const UserDashboard: React.FC<UserDashboardProps> = ({ stores, authenticatedUser, onAddLead, onViewDetails }) => {
    const [searchQuery, setSearchQuery] = useState('');

    const userLeads = useMemo(() => {
        // Group by Magazin to get the latest visit and count of visits
        const map = new Map<string, { latest: Store, count: number }>();
        
        stores.filter(s => s.USER === authenticatedUser).forEach(s => {
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
            .filter(item => 
                item.latest.Magazin.toLowerCase().includes(searchQuery.toLowerCase()) ||
                item.latest.Ville.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .sort((a, b) => new Date(b.latest.Date).getTime() - new Date(a.latest.Date).getTime());
    }, [stores, authenticatedUser, searchQuery]);

    return (
        <div className="relative min-h-full pb-24">
            {/* Search Header */}
            <div className="sticky top-0 z-10 bg-[#F7F8FA] dark:bg-slate-900 pb-4 pt-2">
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                    <div className="flex-1 relative">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher des prospects"
                            className="w-full pl-10 pr-4 py-2 bg-transparent outline-none text-sm dark:text-white"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-1 pr-1 border-l border-slate-100 dark:border-slate-700 pl-2">
                        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10.5 6h9.75M10.5 6a1.5 1.5 0 1 1-3 0m3 0a1.5 1.5 0 1 0-3 0M3.75 6H7.5m3 12h9.75m-9.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-3.75 0H7.5m9-6h3.75m-3.75 0a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m-9.75 0h9.75" /></svg>
                        </button>
                        <button className="p-2 text-green-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.136 12.006a8.25 8.25 0 0 1 13.728 0M2 8.974a12 12 0 0 1 20 0m-8.254 9.112.022.022L12 21.01l-1.768-1.768a.75.75 0 0 1 1.06-1.06Z" /></svg>
                        </button>
                        <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg">
                            <EllipsisVerticalIcon className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Leads List */}
            <div className="space-y-4 mt-2">
                {userLeads.map(({ latest, count }) => (
                    <div 
                        key={latest.ID}
                        onClick={() => onViewDetails(latest)}
                        className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all active:scale-[0.98] cursor-pointer relative"
                    >
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold text-slate-900 dark:text-white leading-tight pr-8">
                                {latest.Magazin}
                            </h3>
                            <div className="absolute top-5 right-5 w-3 h-3 rounded-full bg-slate-400 border-2 border-white dark:border-slate-800 shadow-sm"></div>
                        </div>

                        <div className="space-y-2.5">
                            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                <LocationMarkerIcon className="w-4 h-4 text-slate-300" />
                                <span className="text-sm font-medium">{latest.Ville}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                <CalendarDaysIcon className="w-4 h-4 text-slate-300" />
                                <span className="text-sm font-medium">{latest.Date}: Dernière visite</span>
                            </div>
                            {count > 1 && (
                                <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                                    <ClipboardDocumentListIcon className="w-4 h-4 text-slate-300" />
                                    <span className="text-sm font-medium">{count} suivis</span>
                                </div>
                            )}
                        </div>

                        {latest.Gamme && (
                            <div className="mt-4 flex justify-end">
                                <span className="bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-lg text-xs font-bold border border-slate-100 dark:border-slate-600">
                                    {latest.Gamme}
                                </span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Floating Action Button */}
            <button 
                onClick={onAddLead}
                className="fixed bottom-8 right-8 w-14 h-14 bg-[#4407EB] text-white rounded-2xl shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-20"
            >
                <PlusIcon className="w-8 h-8" />
            </button>
        </div>
    );
};

export default UserDashboard;
