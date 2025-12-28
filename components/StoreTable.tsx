
import { Store } from '../types.ts';
import EditIcon from './icons/EditIcon.tsx';
import DeleteIcon from './icons/DeleteIcon.tsx';
import ChevronLeftIcon from './icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';
import React, { useState, useMemo } from 'react';

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0Z" />
  </svg>
);

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 inline-block ml-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 inline-block ml-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const ArrowsUpDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block ml-1 opacity-20 group-hover:opacity-50">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15L12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
  </svg>
);


interface StoreTableProps {
  stores: Store[];
  onViewDetails: (store: Store) => void;
  onEdit?: (store: Store) => void;
  isLoading: boolean;
  isAdmin?: boolean;
}

const StoreTable: React.FC<StoreTableProps> = ({ stores, onViewDetails, onEdit, isLoading, isAdmin }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const itemsPerPage = 10;

  const sortedStores = useMemo(() => {
    let sortableItems = [...stores];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        // @ts-ignore - Dynamic key access
        let aValue = a[sortConfig.key];
        // @ts-ignore
        let bValue = b[sortConfig.key];

        // Handle numeric values for Price and Quantity
        if (sortConfig.key === 'Prix' || sortConfig.key === 'Quantité') {
          const aNum = Number(aValue) || 0;
          const bNum = Number(bValue) || 0;
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        // Handle strings
        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    } else {
      // Default sort: Quantity descending
      sortableItems.sort((a, b) => (Number(b.Quantité) || 0) - (Number(a.Quantité) || 0));
    }
    return sortableItems;
  }, [stores, sortConfig]);

  const totalPages = Math.ceil(sortedStores.length / itemsPerPage);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStores = sortedStores.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelectedIds = new Set(selectedIds);
    if (e.target.checked) {
      currentStores.forEach(store => newSelectedIds.add(store.ID));
    } else {
      currentStores.forEach(store => newSelectedIds.delete(store.ID));
    }
    setSelectedIds(newSelectedIds);
  };

  const handleSelectRow = (id: string) => {
    const newSelectedIds = new Set(selectedIds);
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id);
    } else {
      newSelectedIds.add(id);
    }
    setSelectedIds(newSelectedIds);
  };

  const isAllSelected = currentStores.length > 0 && currentStores.every(store => selectedIds.has(store.ID));
  const isIndeterminate = currentStores.some(store => selectedIds.has(store.ID)) && !isAllSelected;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <svg className="animate-spin h-8 w-8 text-slate-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-10 px-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <h3 className="text-heading">Aucun lead trouvé</h3>
        <p className="mt-1 text-std">Essayez de modifier votre recherche ou vos filtres.</p>
      </div>
    );
  }

  const columns = [
    { label: 'Magazin', key: 'Magazin' },
    { label: 'Le Gérant', key: 'Le Gérant' },
    { label: 'Ville', key: 'Ville' },
    { label: 'Prix', key: 'Prix' },
    { label: 'Quantité', key: 'Quantité' },
    { label: 'USER', key: 'USER' },
    { label: 'Actions', key: null },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full text-left">
        <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-100 dark:border-slate-700">
          <tr>
            <th scope="col" className="px-6 py-4 whitespace-nowrap w-4">
              <input
                type="checkbox"
                className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                checked={isAllSelected}
                ref={input => {
                  if (input) input.indeterminate = isIndeterminate;
                }}
                onChange={handleSelectAll}
              />
            </th>
            {columns.map(({ label, key }) => (
              <th
                key={label}
                scope="col"
                className={`px-6 py-4 whitespace-nowrap text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 ${key ? 'cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-700' : ''}`}
                onClick={() => key && handleSort(key)}
              >
                <div className="flex items-center">
                  {label}
                  {key && (
                    sortConfig?.key === key
                      ? (sortConfig.direction === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />)
                      : <ArrowsUpDownIcon />
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
          {currentStores.map((store) => {
            const userName = store.USER ? store.USER.split('@')[0] : '-';
            const isSelected = selectedIds.has(store.ID);
            return (
              <tr
                key={store.ID}
                className={`transition-colors ${isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                onClick={() => handleSelectRow(store.ID)}
              >
                <td className="px-6 py-4 whitespace-nowrap w-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-indigo-600 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    checked={isSelected}
                    onChange={() => handleSelectRow(store.ID)}
                  />
                </td>
                <td className="px-6 py-4 text-emph font-bold whitespace-nowrap">{store.Magazin}</td>
                <td className="px-6 py-4 text-std">{store['Le Gérant']}</td>
                <td className="px-6 py-4 text-std">{store.Ville}</td>
                <td className="px-6 py-4 text-emph font-bold">{store.Prix.toLocaleString()} DH</td>
                <td className="px-6 py-4 text-emph font-bold">{store.Quantité}</td>
                <td className="px-6 py-4">
                  <span className="text-sub bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded font-bold uppercase">
                    {userName}
                  </span>
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center space-x-1">
                    <button type="button" onClick={() => onViewDetails(store)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all" title="Détails"><EyeIcon className="w-5 h-5" /></button>
                    <button type="button" onClick={() => onEdit?.(store)} className="p-1.5 text-slate-400 hover:text-amber-600 rounded-md hover:bg-amber-50 dark:hover:bg-amber-900/30 transition-all" title="Modifier"><EditIcon className="w-5 h-5" /></button>
                    {isAdmin && (
                      <button type="button" className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900/30 transition-all" title="Supprimer"><DeleteIcon className="w-5 h-5" /></button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-slate-50 dark:bg-slate-700/50 border-t border-slate-100 dark:border-slate-700">
          <tr className="text-emph font-bold">
            <td className="px-6 py-4"></td>
            <td className="px-6 py-4">Total Cumulé</td>
            <td className="px-6 py-4"></td>
            <td className="px-6 py-4"></td>
            <td className="px-6 py-4">
              {stores.reduce((acc, store) => acc + (Number(store.Prix) || 0), 0).toLocaleString()} DH
            </td>
            <td className="px-6 py-4">
              {stores.reduce((acc, store) => acc + (Number(store.Quantité) || 0), 0).toLocaleString()}
            </td>
            <td className="px-6 py-4"></td>
            <td className="px-6 py-4"></td>
          </tr>
        </tfoot>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-lg">
        <div className="text-sub uppercase font-bold">
          Page {currentPage} sur {totalPages || 1}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border ${currentPage === 1 ? 'opacity-30 cursor-not-allowed' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700'}`}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`p-2 rounded-lg border ${currentPage === totalPages || totalPages === 0 ? 'opacity-30 cursor-not-allowed' : 'border-slate-200 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-700'}`}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreTable;
