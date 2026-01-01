import { Store } from '../types.ts';
import EditIcon from './icons/EditIcon.tsx';
import DeleteIcon from './icons/DeleteIcon.tsx';
import ChevronLeftIcon from './icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';
import React, { useState, useMemo } from 'react';

const EyeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 0 1 6 0Z" />
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
  stores: (Store & { clientType?: string })[];
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

        if (sortConfig.key === 'Prix' || sortConfig.key === 'Quantité') {
          const aNum = Number(aValue) || 0;
          const bNum = Number(bValue) || 0;
          return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
        }

        aValue = String(aValue || '').toLowerCase();
        bValue = String(bValue || '').toLowerCase();

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    } else {
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

  const getClientTypeBadge = (type?: string) => {
    switch (type) {
      case 'Client Stratégique':
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200">Stratégique</span>;
      case 'Client Actif':
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200">Actif</span>;
      case 'Nouveau Client':
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200">Nouveau</span>;
      case 'Client Perdu':
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border border-orange-200">Perdu</span>;
      case 'Client Bloqué':
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 border border-red-200">Bloqué</span>;
      default:
        return <span className="px-2 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-400 border border-slate-200">Lead</span>;
    }
  };

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
        <h3 className="text-lg font-bold text-slate-800 dark:text-white">Aucun lead trouvé</h3>
        <p className="mt-1 text-slate-500">Essayez de modifier votre recherche ou vos filtres.</p>
      </div>
    );
  }

  const columns = [
    { label: 'Client', key: 'Magazin' },
    { label: 'Ville', key: 'Ville' },
    { label: 'Statut Client', key: 'clientType' },
    { label: 'Gamme', key: 'Gamme' },
    { label: 'Prix (DH)', key: 'Prix' },
    { label: 'Actions', key: null },
  ];

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-x-auto">
      <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700/50 dark:text-slate-300">
          <tr>
            <th scope="col" className="p-4">
              <div className="flex items-center">
                <input
                  id="checkbox-all"
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  checked={isAllSelected}
                  ref={input => { if (input) input.indeterminate = isIndeterminate; }}
                  onChange={handleSelectAll}
                />
                <label htmlFor="checkbox-all" className="sr-only">checkbox</label>
              </div>
            </th>
            {columns.map(({ label, key }) => (
              <th
                key={label}
                scope="col"
                className={`px-6 py-3 whitespace-nowrap ${key ? 'cursor-pointer select-none group hover:bg-slate-100 dark:hover:bg-slate-700' : ''}`}
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
            const isSelected = selectedIds.has(store.ID);
            return (
              <tr
                key={store.ID}
                className={`bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600/50 ${isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''}`}
              >
                <td className="w-4 p-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                      checked={isSelected}
                      onChange={() => handleSelectRow(store.ID)}
                    />
                  </div>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                    {store.Magazin}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{store.Ville}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                    {getClientTypeBadge(store.clientType)}
                </td>
                <td className="px-6 py-4">{store.Gamme}</td>
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{Number(store.Prix).toLocaleString()}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-2">
                    <button 
                        type="button" 
                        onClick={() => onViewDetails(store)} 
                        className="p-1.5 text-slate-500 hover:text-blue-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" 
                        title="Détails"
                    >
                        <EyeIcon className="w-5 h-5" />
                    </button>
                    {onEdit && (
                        <button 
                            type="button" 
                            onClick={() => onEdit(store)} 
                            className="p-1.5 text-slate-500 hover:text-amber-600 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" 
                            title="Modifier"
                        >
                            <EditIcon className="w-5 h-5" />
                        </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="bg-slate-50 dark:bg-slate-700/50 font-semibold text-slate-900 dark:text-white">
          <tr>
            <td className="p-4"></td>
            <td className="px-6 py-3">Total (Filtres)</td>
            <td className="px-6 py-3"></td>
            <td className="px-6 py-3"></td>
            <td className="px-6 py-3"></td>
            <td className="px-6 py-3">
                {stores.reduce((acc, s) => acc + (Number(s.Prix) || 0), 0).toLocaleString()} DH
            </td>
            <td className="px-6 py-3"></td>
          </tr>
        </tfoot>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-lg">
        <div className="text-sm text-slate-500 dark:text-slate-400">
          Affichage de <span className="font-semibold text-slate-900 dark:text-white">{startIndex + 1}</span> à <span className="font-semibold text-slate-900 dark:text-white">{Math.min(endIndex, stores.length)}</span> sur <span className="font-semibold text-slate-900 dark:text-white">{stores.length}</span> résultats
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-md border ${currentPage === 1 ? 'border-slate-200 text-slate-300 cursor-not-allowed dark:border-slate-700 dark:text-slate-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`}
          >
            <ChevronLeftIcon className="w-4 h-4" />
          </button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = i + 1;
                return (
                    <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`px-3 py-1 text-sm font-medium rounded-md border ${currentPage === pageNum ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400' : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400 dark:hover:bg-slate-700'}`}
                    >
                        {pageNum}
                    </button>
                );
            })}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages || totalPages === 0}
            className={`p-2 rounded-md border ${currentPage === totalPages || totalPages === 0 ? 'border-slate-200 text-slate-300 cursor-not-allowed dark:border-slate-700 dark:text-slate-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`}
          >
            <ChevronRightIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default StoreTable;