
import React, { useState, useMemo, useEffect } from 'react';
import { Store } from '../types.ts';
import { FilterState } from '../types.ts';

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
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

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFilters(prev => ({ ...prev, city: e.target.value }));
  };

  const toggleSelection = (key: 'gammes' | 'priorities', value: string) => {
    setFilters(prev => {
      const currentValues = prev[key] as string[];
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
    const clearedFilters = { city: '', gammes: [], priorities: [] };
    setFilters(clearedFilters);
    onClear(); // Call the parent onClear
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-[150] flex justify-center items-end sm:items-center backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="bg-white dark:bg-slate-800 rounded-t-2xl sm:rounded-2xl shadow-xl w-full max-w-md m-0 sm:m-4 overflow-hidden animate-in slide-in-from-bottom-4 sm:zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between p-5 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Filtres</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close filters"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </header>

        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          <div>
            <label htmlFor="ville" className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Ville
            </label>
            <select
              id="ville"
              name="ville"
              value={filters.city}
              onChange={handleCityChange}
              className="block w-full rounded-xl border-slate-200 dark:border-slate-600 shadow-sm focus:border-[var(--accent-color)] focus:ring-[var(--accent-color)] sm:text-sm dark:bg-slate-700 dark:text-white py-3 px-4"
            >
              <option value="">Toutes les villes</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Niveau client</h3>
            <div className="flex flex-wrap gap-2">
              {clientLevels.map(level => (
                <button
                  key={level}
                  type="button"
                  onClick={() => toggleSelection('gammes', level)}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                    filters.gammes.includes(level)
                      ? 'bg-blue-600 text-white border-blue-600 shadow-md scale-105'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Priorité</h3>
            <div className="flex flex-wrap gap-2">
              {priorities.map(priority => (
                <button
                  key={priority}
                  type="button"
                  onClick={() => toggleSelection('priorities', priority)}
                   className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                    filters.priorities.includes(priority)
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow-md scale-105'
                      : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                  }`}
                >
                  {priority}
                </button>
              ))}
            </div>
          </div>
        </div>

        <footer className="flex items-center justify-end p-5 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 space-x-3">
          <button
            type="button"
            onClick={handleClear}
            className="flex-1 px-6 py-3 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl shadow-sm hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors"
          >
            Effacer
          </button>
          <button
            type="button"
            onClick={handleApply}
            className="flex-1 px-6 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all active:scale-95"
          >
            Appliquer
          </button>
        </footer>
      </div>
    </div>
  );
};

export default FilterModal;
