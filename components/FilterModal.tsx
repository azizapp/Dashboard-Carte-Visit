
import React, { useState, useMemo, useEffect } from 'react';
import { Store } from '../types.ts';
import { FilterState } from '../types.ts';

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
    </svg>
);

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onClear: () => void;
  currentFilters: FilterState;
  stores: Store[];
}

const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onApply,
  onClear,
  currentFilters,
  stores,
}) => {
  const [filters, setFilters] = useState<FilterState>(currentFilters);

  useEffect(() => {
    setFilters(currentFilters);
  }, [currentFilters, isOpen]);

  const cities = useMemo(() => {
    const citySet = new Set<string>();
    stores.forEach(store => {
      if (store.Ville) {
        citySet.add(store.Ville);
      }
    });
    return Array.from(citySet).sort();
  }, [stores]);
  
  const clientLevels = ['Haute', 'Haute et Moyenne', 'Moyenne', 'Économie'];
  const priorities = ['High', 'Medium', 'Low'];

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const toggleSelection = (key: 'gammes' | 'priorities', value: string) => {
    setFilters(prev => {
      const currentValues = (prev[key] || []) as string[];
      const newValues = currentValues.includes(value)
        ? currentValues.filter(v => v !== value)
        : [...currentValues, value];
      return { ...prev, [key]: newValues };
    });
  };

  const handleApply = () => {
    onApply(filters);
  };
  
  const handleClear = () => {
    const clearedFilters = { city: '', gammes: [], priorities: [], startDate: '', endDate: '' };
    setFilters(clearedFilters);
    onClear();
  };

  const clearDates = () => {
    setFilters(prev => ({ ...prev, startDate: '', endDate: '' }));
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/60 z-[150] flex justify-center items-end sm:items-center backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md m-0 sm:m-4 overflow-hidden animate-in slide-in-from-bottom-10 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
          <div>
            <h2 className="text-lg font-medium text-slate-900 dark:text-white uppercase tracking-tight">Filtres Avancés</h2>
            <p className="text-[10px] text-slate-400 font-normal uppercase tracking-widest mt-0.5">Personnalisez vos analyses</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
            aria-label="Close filters"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </header>

        <div className="p-6 space-y-8 max-h-[65vh] overflow-y-auto custom-scrollbar">
          {/* Section Période Custom */}
          <div className="space-y-4">
            <div className="flex items-center justify-between ml-1">
                <h3 className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">Période personnalisée</h3>
                {(filters.startDate || filters.endDate) && (
                    <button onClick={clearDates} className="text-[10px] font-normal text-red-500 hover:underline uppercase tracking-tight">Vider les dates</button>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase mb-2 ml-1">Date de début</label>
                    <div className="relative group">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="date"
                            name="startDate"
                            value={filters.startDate || ''}
                            onChange={handleChange}
                            className="block w-full pl-9 pr-3 py-3 text-sm font-normal rounded-xl border border-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
                <div>
                    <label className="block text-[10px] font-medium text-slate-400 uppercase mb-2 ml-1">Date de fin</label>
                    <div className="relative group">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-blue-500 transition-colors" />
                        <input 
                            type="date"
                            name="endDate"
                            value={filters.endDate || ''}
                            onChange={handleChange}
                            className="block w-full pl-9 pr-3 py-3 text-sm font-normal rounded-xl border border-slate-100 dark:border-slate-600 dark:bg-slate-700 dark:text-white focus:ring-1 focus:ring-blue-500 focus:border-transparent outline-none transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>
          </div>

          <div>
            <label htmlFor="city" className="block text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-3 ml-1">
              Ville
            </label>
            <div className="relative">
                <select
                  id="city"
                  name="city"
                  value={filters.city}
                  onChange={handleChange}
                  className="block w-full rounded-xl border border-slate-100 dark:border-slate-600 shadow-sm focus:ring-1 focus:ring-blue-500 outline-none sm:text-sm dark:bg-slate-700 dark:text-white py-3 px-4 font-normal appearance-none transition-all"
                >
                  <option value="">Toutes les villes</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /></svg>
                </div>
            </div>
          </div>

          <div>
            <h3 className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Niveau client</h3>
            <div className="flex flex-wrap gap-2.5">
              {clientLevels.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleSelection('gammes', level)}
                  className={`px-4 py-2 text-[11px] font-medium rounded-xl border transition-all ${
                    filters.gammes.includes(level)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200/40 scale-105'
                      : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-100 dark:border-slate-600 hover:border-blue-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em] mb-4 ml-1">Priorité IA</h3>
            <div className="flex flex-wrap gap-2.5">
              {priorities.map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => toggleSelection('priorities', priority)}
                   className={`px-4 py-2 text-[11px] font-medium rounded-xl border transition-all ${
                    filters.priorities.includes(priority)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200/40 scale-105'
                      : 'bg-white dark:bg-slate-700 text-slate-500 dark:text-slate-300 border-slate-100 dark:border-slate-600 hover:border-indigo-200'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end p-6 bg-slate-50/50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-700 space-x-4">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 px-6 py-3.5 text-[12px] font-medium uppercase tracking-widest text-slate-500 dark:text-slate-200 hover:text-red-500 transition-colors"
          >
            Réinitialiser
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-[2] px-6 py-3.5 text-[12px] font-medium uppercase tracking-widest text-white bg-blue-600 rounded-2xl shadow-lg shadow-blue-200/40 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95"
          >
            Appliquer
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FilterModal;
