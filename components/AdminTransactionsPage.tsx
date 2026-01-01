import React, { useMemo, useState, useEffect } from 'react';
import { Store, Mode } from '../types.ts';
import SearchIcon from './icons/SearchIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import DeleteIcon from './icons/DeleteIcon.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import ChevronLeftIcon from './icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from './icons/ChevronRightIcon.tsx';
import { GoogleGenAI } from "@google/genai";
import ConfirmationModal from './ConfirmationModal.tsx';
import EditVisitModal from './EditVisitModal.tsx';
import { supabase } from '../services/supabase.ts';

const ChevronUpIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-3 h-3">
    <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
  </svg>
);

const ArrowsUpDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3 opacity-30 group-hover:opacity-100 transition-opacity">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15 12 18.75 15.75 15m-7.5-6L12 5.25 15.75 9" />
  </svg>
);

const AnalysisModal: React.FC<{ isOpen: boolean; onClose: () => void; content: string; isLoading: boolean }> = ({ isOpen, onClose, content, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-600 text-white">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-yellow-300" />
                        <h3 className="text-xl font-black">Audit Smart IA</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">&times;</button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <SpinnerIcon className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
                            <p className="font-bold text-slate-700 dark:text-slate-200">Analyse du pipeline en cours...</p>
                        </div>
                    ) : (
                        <div className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Compris</button>
                </div>
            </div>
        </div>
    );
};

interface AdminTransactionsPageProps {
    stores: Store[];
    onRefresh: () => void;
}

const AdminTransactionsPage: React.FC<AdminTransactionsPageProps> = ({ stores, onRefresh }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUser, setSelectedUser] = useState('all');
    const [selectedAction, setSelectedAction] = useState('all');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [showAnalysis, setShowAnalysis] = useState(false);
    
    const [sortConfig, setSortConfig] = useState<{ key: keyof Store | 'Date'; direction: 'asc' | 'desc' } | null>({ key: 'Date', direction: 'desc' });

    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [transactionToDelete, setTransactionToDelete] = useState<Store | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Store | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const resetFilters = () => {
        setSearchQuery('');
        setSelectedUser('all');
        setSelectedAction('all');
        setSortConfig({ key: 'Date', direction: 'desc' });
        setCurrentPage(1);
    };

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, selectedUser, selectedAction, sortConfig]);

    const handleSort = (key: keyof Store | 'Date') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const sortedTransactions = useMemo(() => {
        const filtered = stores.filter(t => {
            const matchesSearch = searchQuery === '' || 
                t.Magazin.toLowerCase().includes(searchQuery.toLowerCase()) || 
                t.Ville.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesUser = selectedUser === 'all' || t.USER === selectedUser;
            const matchesAction = selectedAction === 'all' || t['Action Client']?.toLowerCase() === selectedAction.toLowerCase();
            return matchesSearch && matchesUser && matchesAction;
        });

        if (!sortConfig) return filtered;

        return [...filtered].sort((a, b) => {
            let aVal: any;
            let bVal: any;

            if (sortConfig.key === 'Date') {
                aVal = new Date(a['Date Heure'] || a.created_at || a.Date).getTime();
                bVal = new Date(b['Date Heure'] || b.created_at || b.Date).getTime();
            } else {
                aVal = a[sortConfig.key];
                bVal = b[sortConfig.key];
            }

            if (sortConfig.key === 'Prix' || sortConfig.key === 'Quantité') {
                const aNum = Number(aVal) || 0;
                const bNum = Number(bVal) || 0;
                return sortConfig.direction === 'asc' ? aNum - bNum : bNum - aNum;
            }

            const aStr = String(aVal || '').toLowerCase();
            const bStr = String(bVal || '').toLowerCase();
            if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
            if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [stores, searchQuery, selectedUser, selectedAction, sortConfig]);

    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const currentTransactions = useMemo(() => {
        return sortedTransactions.slice(startIndex, startIndex + itemsPerPage);
    }, [sortedTransactions, startIndex]);

    const users = useMemo(() => Array.from(new Set(stores.map(s => s.USER))).sort(), [stores]);

    const stats = useMemo(() => {
        const totalSales = sortedTransactions.reduce((acc, t) => acc + (Number(t.Prix) || 0), 0);
        const totalQty = sortedTransactions.reduce((acc, t) => acc + (Number(t.Quantité) || 0), 0);
        const totalVisits = sortedTransactions.length;
        const salesTransactions = sortedTransactions.filter(t => t['Action Client']?.toLowerCase() === 'acheter').length;
        const conversionRate = totalVisits > 0 ? (salesTransactions / totalVisits * 100) : 0;
        
        return { totalSales, totalQty, totalVisits, salesTransactions, conversionRate };
    }, [sortedTransactions]);

    const handleDelete = async () => {
        if (!transactionToDelete) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase.from('visits').delete().eq('id', transactionToDelete.ID);
            if (error) throw error;
            onRefresh();
            setTransactionToDelete(null);
        } catch (e) {
            alert("Erreur lors de la suppression");
        } finally {
            setIsDeleting(false);
        }
    };

    const runAiAnalysis = async () => {
        setIsAnalyzing(true);
        setShowAnalysis(true);
        try {
            const summary = sortedTransactions.slice(0, 100).map(t => ({
                vendeur: t.USER,
                client: t.Magazin,
                action: t['Action Client'],
                prix: t.Prix,
                ville: t.Ville
            }));

            const prompt = `
                Analyse les transactions suivantes pour une entreprise de vente de lunettes au Maroc. 
                Données : ${JSON.stringify(summary)}
                
                Tâche :
                1. Évalue la progression des ventes.
                2. Identifie les meilleurs vendeurs et ceux qui ont des difficultés.
                3. Relève les anomalies (villes sans ventes, beaucoup de visites sans achats).
                4. Donne 3 recommandations concrètes pour améliorer le CA.
                
                Réponds au format HTML propre avec des titres en gras et des listes à puces.
            `;

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-flash-preview',
                contents: prompt
            });
            setAnalysisResult(response.text || "Erreur d'analyse");
        } catch (e) {
            setAnalysisResult("L'IA n'a pas pu traiter la demande.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const SortableHeader = ({ label, sortKey, align = 'left' }: { label: string, sortKey: keyof Store | 'Date', align?: 'left' | 'right' | 'center' }) => {
        const isActive = sortConfig?.key === sortKey;
        const alignmentClass = align === 'right' ? 'justify-end text-right' : align === 'center' ? 'justify-center text-center' : 'justify-start text-left';
        
        return (
            <th 
                className={`px-6 py-3 cursor-pointer select-none group transition-colors hover:bg-slate-100 dark:hover:bg-slate-700/50 ${isActive ? 'bg-indigo-50/30 dark:bg-indigo-900/10' : ''}`}
                onClick={() => handleSort(sortKey)}
            >
                <div className={`flex items-center gap-2 ${alignmentClass}`}>
                    <span className={`whitespace-nowrap transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`}>{label}</span>
                    <div className="flex-shrink-0">
                        {isActive ? (
                            sortConfig.direction === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />
                        ) : (
                            <ArrowsUpDownIcon />
                        )}
                    </div>
                </div>
            </th>
        );
    };

    const isFiltered = searchQuery !== '' || selectedUser !== 'all' || selectedAction !== 'all';

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white">Registre des Transactions</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Historique complet de toutes les interactions commerciales sur le terrain.</p>
                </div>
                <button 
                    onClick={runAiAnalysis}
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all active:scale-95 font-bold text-sm"
                >
                    <SparklesIcon className="w-5 h-5 text-yellow-300" />
                    Auditor IA
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Chiffre d'Affaires</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalSales.toLocaleString()} DH</h3>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Pièces</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalQty.toLocaleString()}</h3>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Visites / Actions</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalVisits.toLocaleString()}</h3>
                </div>
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Taux de Conversion</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.conversionRate.toFixed(1)}%</h3>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-4 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-1 w-full">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                        <input 
                            type="text" 
                            placeholder="Rechercher Magazin ou Ville..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-700 border-none rounded-xl text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="grid grid-cols-2 md:flex gap-4 w-full md:w-auto">
                        <select 
                            value={selectedUser} 
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-700 border-none rounded-xl text-sm py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">Vendeurs</option>
                            {users.map(u => <option key={u} value={u}>{u}</option>)}
                        </select>
                        <select 
                            value={selectedAction} 
                            onChange={(e) => setSelectedAction(e.target.value)}
                            className="bg-slate-50 dark:bg-slate-700 border-none rounded-xl text-sm py-2.5 px-4 outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">Actions</option>
                            <option value="acheter">Achat</option>
                            <option value="revisiter">Visite</option>
                            <option value="contact">Contact</option>
                        </select>
                    </div>
                    {isFiltered && (
                        <button 
                            onClick={resetFilters}
                            className="text-xs font-bold text-red-500 hover:text-red-600 underline px-2 whitespace-nowrap"
                        >
                            Effacer les filtres
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50 dark:bg-slate-700/50 dark:text-slate-300 border-b border-slate-100 dark:border-slate-700">
                            <tr>
                                <SortableHeader label="Client" sortKey="Magazin" />
                                <SortableHeader label="Gamme" sortKey="Gamme" />
                                <SortableHeader label="Vendeur" sortKey="USER" />
                                <SortableHeader label="Action" sortKey="Action Client" />
                                <SortableHeader label="Prix (MAD)" sortKey="Prix" align="right" />
                                <SortableHeader label="Qté" sortKey="Quantité" align="center" />
                                <SortableHeader label="Date" sortKey="Date" align="center" />
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
                            {currentTransactions.map((t) => (
                                <tr key={t.ID} className="hover:bg-slate-50/50 dark:hover:bg-slate-800 transition-colors group">
                                    <td className="px-6 py-4">
                                        <p className="font-semibold text-slate-900 dark:text-white truncate max-w-[150px]">{t.Magazin}</p>
                                        <p className="text-[11px] text-slate-400 font-medium">{t.Ville}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="text-[11px] px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full font-bold">{t.Gamme}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-[10px] font-black uppercase">{t.USER?.charAt(0)}</div>
                                            <span className="text-xs font-medium text-slate-600 dark:text-slate-400 truncate max-w-[100px]">{t.USER?.split('@')[0]}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded ${
                                            t['Action Client']?.toLowerCase() === 'acheter' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'
                                        }`}>
                                            {t['Action Client']}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right text-xs font-normal text-slate-800 dark:text-slate-200">
                                        {Number(t.Prix).toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs font-normal text-slate-800 dark:text-slate-200">
                                        {t.Quantité}
                                    </td>
                                    <td className="px-6 py-4 text-center text-xs text-slate-400 font-normal whitespace-nowrap">
                                        {t.Date}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                                onClick={() => setTransactionToEdit(t)}
                                                className="p-1.5 text-slate-400 hover:text-amber-500 hover:bg-amber-50 rounded-lg transition-all"
                                            >
                                                <EditIcon className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => setTransactionToDelete(t)}
                                                className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                            >
                                                <DeleteIcon className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {sortedTransactions.length === 0 ? (
                    <div className="py-20 text-center text-slate-400 italic">Aucune transaction correspondante.</div>
                ) : (
                    <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 rounded-b-lg">
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                            Affichage de <span className="font-semibold text-slate-900 dark:text-white">{startIndex + 1}</span> à <span className="font-semibold text-slate-900 dark:text-white">{Math.min(startIndex + itemsPerPage, sortedTransactions.length)}</span> sur <span className="font-semibold text-slate-900 dark:text-white">{sortedTransactions.length}</span> résultats
                        </div>
                        <div className="flex items-center space-x-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                disabled={currentPage === 1} 
                                className={`p-2 rounded-md border ${currentPage === 1 ? 'border-slate-200 text-slate-300 cursor-not-allowed dark:border-slate-700 dark:text-slate-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <div className="flex space-x-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                                    <button 
                                        key={pageNum}
                                        onClick={() => setCurrentPage(pageNum)}
                                        className={`px-3 py-1 text-sm font-medium rounded-md border transition-colors ${
                                            currentPage === pageNum 
                                            ? 'bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900/20 dark:border-blue-500 dark:text-blue-400' 
                                            : 'bg-white border-slate-300 text-slate-500 hover:bg-slate-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-400'
                                        }`}
                                    >
                                        {pageNum}
                                    </button>
                                ))}
                            </div>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                disabled={currentPage === totalPages || totalPages === 0} 
                                className={`p-2 rounded-md border ${currentPage === totalPages || totalPages === 0 ? 'border-slate-200 text-slate-300 cursor-not-allowed dark:border-slate-700 dark:text-slate-600' : 'border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700'}`}
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            <AnalysisModal 
                isOpen={showAnalysis} 
                onClose={() => setShowAnalysis(false)} 
                content={analysisResult} 
                isLoading={isAnalyzing} 
            />

            <ConfirmationModal 
                isOpen={!!transactionToDelete} 
                onClose={() => setTransactionToDelete(null)} 
                onConfirm={handleDelete} 
                title="Supprimer la transaction" 
                message={`Êtes-vous sûr de vouloir supprimer cette transaction du magasin ${transactionToDelete?.Magazin} ? Cette action est irréversible.`} 
                confirmText={isDeleting ? "Suppression..." : "Supprimer"} 
            />

            <EditVisitModal 
                isOpen={!!transactionToEdit} 
                onClose={() => setTransactionToEdit(null)} 
                visit={transactionToEdit} 
                onSave={() => { onRefresh(); setTransactionToEdit(null); }} 
            />
        </div>
    );
};

export default AdminTransactionsPage;