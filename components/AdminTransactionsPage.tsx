
import React, { useMemo, useState } from 'react';
import { Store } from '../types.ts';
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

import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import CubeIcon from './icons/CubeIcon.tsx';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon.tsx';
import ArrowTrendingUpIcon from './icons/ArrowTrendingUpIcon.tsx';
import ClockIcon from './icons/ClockIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import UserCircleIcon from './icons/UserCircleIcon.tsx';

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
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-600 text-white">
                    <div className="flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-yellow-300" /><h3 className="text-xl font-black">Audit Smart IA Pro</h3></div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <SpinnerIcon className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
                            <p className="font-bold text-slate-700 dark:text-slate-200 text-center uppercase tracking-widest text-sm px-10">L'IA analyse vos performances commerciales...</p>
                        </div>
                    ) : (
                        <div className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: String(content || "") }} />
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Fermer l'Audit</button>
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
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [analysisResult, setAnalysisResult] = useState('');
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [sortConfig, setSortConfig] = useState<{ key: keyof Store | 'Date'; direction: 'asc' | 'desc' } | null>({ key: 'Date', direction: 'desc' });
    const [currentPage, setCurrentPage] = useState(1);
    const [transactionToDelete, setTransactionToDelete] = useState<Store | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Store | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 12;

    const runAiAnalysis = async () => {
        setIsAnalyzing(true);
        setShowAnalysis(true);
        try {
            const summary = stores.slice(0, 150).map(t => ({ user: t.USER, client: t.Magazin, action: t['Action Client'], price: t.Prix, city: t.Ville }));
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: `Audit ces transactions pour une entreprise au Maroc. Données : ${JSON.stringify(summary)}. Analyse les performances par vendeur, ville, et propose un plan de redressement du CA. Format HTML Tailwind.`,
                config: { thinkingConfig: { thinkingBudget: 24576 } }
            });
            const text = response.text;
            setAnalysisResult(String(text || "Impossible d'obtenir une réponse de l'IA."));
        } catch (e: any) {
            console.error(e);
            setAnalysisResult(`<div class="text-red-500">L'IA n'a pas pu traiter la demande: ${e.message || "Erreur inconnue"}</div>`);
        } finally { setIsAnalyzing(false); }
    };

    const recentTransactions = useMemo(() => {
        const now = new Date();
        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(now.getDate() - 10);
        tenDaysAgo.setHours(0, 0, 0, 0);

        return stores.filter(t => {
            const tDate = new Date(t['Date Heure'] || t.created_at || t.Date);
            const isRecent = tDate >= tenDaysAgo;
            
            const matchesSearch = searchQuery === '' || 
                t.Magazin.toLowerCase().includes(searchQuery.toLowerCase()) || 
                t.Ville.toLowerCase().includes(searchQuery.toLowerCase());
            
            const matchesUser = selectedUser === 'all' || t.USER === selectedUser;
            
            return isRecent && matchesSearch && matchesUser;
        });
    }, [stores, searchQuery, selectedUser]);

    const sortedTransactions = useMemo(() => {
        if (!sortConfig) return recentTransactions;

        return [...recentTransactions].sort((a, b) => {
            let aV: any = sortConfig.key === 'Date' ? new Date(a['Date Heure'] || a.created_at || a.Date).getTime() : a[sortConfig.key as keyof Store];
            let bV: any = sortConfig.key === 'Date' ? new Date(b['Date Heure'] || b.created_at || b.Date).getTime() : b[sortConfig.key as keyof Store];
            
            if (sortConfig.key === 'Prix' || sortConfig.key === 'Quantité') {
                return sortConfig.direction === 'asc' ? Number(aV) - Number(bV) : Number(bV) - Number(aV);
            }
            
            const strA = String(aV || "");
            const strB = String(bV || "");
            return sortConfig.direction === 'asc' ? strA.localeCompare(strB) : strB.localeCompare(strA);
        });
    }, [recentTransactions, sortConfig]);

    const stats = useMemo(() => {
        const tSales = recentTransactions.reduce((acc, t) => acc + (Number(t.Prix) || 0), 0);
        const tQty = recentTransactions.reduce((acc, t) => acc + (Number(t.Quantité) || 0), 0);
        const buyT = recentTransactions.filter(t => t['Action Client']?.toLowerCase() === 'acheter').length;
        return { 
            totalSales: tSales, 
            totalQty: tQty, 
            totalVisits: recentTransactions.length, 
            conversionRate: recentTransactions.length > 0 ? (buyT / recentTransactions.length * 100) : 0 
        };
    }, [recentTransactions]);

    const paginatedData = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return sortedTransactions.slice(start, start + itemsPerPage);
    }, [sortedTransactions, currentPage]);

    const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);

    const handleSort = (key: keyof Store | 'Date') => {
        let direction: 'asc' | 'desc' = 'asc';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
            direction = 'desc';
        }
        setSortConfig({ key, direction });
    };

    const handleDelete = async () => {
        if (!transactionToDelete) return;
        setIsDeleting(true);
        try {
            const { error } = await supabase
                .from('visits')
                .delete()
                .eq('id', transactionToDelete.ID);
            
            if (error) throw error;
            onRefresh();
            setTransactionToDelete(null);
        } catch (err) {
            alert("Erreur lors de la suppression");
        } finally {
            setIsDeleting(false);
        }
    };

    const uniqueUsers = useMemo(() => Array.from(new Set(stores.map(s => s.USER))).filter(Boolean), [stores]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-800 dark:text-white">Registre des Transactions</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-indigo-500" />
                        Suivi des activités des <span className="font-bold text-slate-700 dark:text-slate-200 underline decoration-indigo-500 decoration-2">10 derniers jours</span>
                    </p>
                </div>
                <button 
                    onClick={runAiAnalysis} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all active:scale-95 font-bold text-sm"
                >
                    <SparklesIcon className="w-5 h-5 text-yellow-300" /> 
                    Auditor Smart IA Pro
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0 dark:bg-emerald-900/20"><CurrencyDollarIcon className="w-6 h-6" /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CA Récent</p><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalSales.toLocaleString()} DH</h3></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0 dark:bg-blue-900/20"><CubeIcon className="w-6 h-6" /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pièces Vendues</p><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalQty.toLocaleString()}</h3></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 flex-shrink-0 dark:bg-indigo-900/20"><ClipboardDocumentListIcon className="w-6 h-6" /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Visites</p><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalVisits.toLocaleString()}</h3></div>
                </div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
                    <div className="p-3 rounded-xl bg-amber-50 text-amber-600 flex-shrink-0 dark:bg-amber-900/20"><ArrowTrendingUpIcon className="w-6 h-6" /></div>
                    <div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversion</p><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.conversionRate.toFixed(1)}%</h3></div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex gap-3 flex-1 min-w-[300px]">
                        <div className="relative flex-1 max-w-sm">
                            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input 
                                type="text" 
                                placeholder="Rechercher (Client, Ville...)" 
                                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <select 
                            className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-sm font-medium dark:text-white outline-none focus:ring-2 focus:ring-indigo-500"
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                        >
                            <option value="all">Tous les vendeurs</option>
                            {uniqueUsers.map(u => <option key={u} value={u}>{u.split('@')[0]}</option>)}
                        </select>
                    </div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
                        {sortedTransactions.length} résultats récents
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-900/20 text-slate-400 uppercase text-[10px] font-black tracking-widest border-b border-slate-100 dark:border-slate-700">
                                <th className="px-6 py-4 cursor-pointer group" onClick={() => handleSort('Date')}>
                                    <div className="flex items-center gap-2">Date {sortConfig?.key === 'Date' ? (sortConfig.direction === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : <ArrowsUpDownIcon />}</div>
                                </th>
                                <th className="px-6 py-4 cursor-pointer group" onClick={() => handleSort('Magazin')}>
                                    <div className="flex items-center gap-2">Client {sortConfig?.key === 'Magazin' ? (sortConfig.direction === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : <ArrowsUpDownIcon />}</div>
                                </th>
                                <th className="px-6 py-4">Vendeur</th>
                                <th className="px-6 py-4">Action</th>
                                <th className="px-6 py-4 text-right cursor-pointer group" onClick={() => handleSort('Prix')}>
                                    <div className="flex items-center justify-end gap-2">Montant {sortConfig?.key === 'Prix' ? (sortConfig.direction === 'asc' ? <ChevronUpIcon /> : <ChevronDownIcon />) : <ArrowsUpDownIcon />}</div>
                                </th>
                                <th className="px-6 py-4 text-right">Qty</th>
                                <th className="px-6 py-4 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                            {paginatedData.map((t) => {
                                const tDate = new Date(t['Date Heure'] || t.created_at || t.Date);
                                return (
                                    <tr key={t.ID} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{tDate.toLocaleDateString('fr-FR')}</span>
                                                <span className="text-[10px] text-slate-400 font-medium">{tDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg flex-shrink-0"><MapIcon className="w-4 h-4 text-indigo-500" /></div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700 dark:text-white leading-tight">{t.Magazin}</p>
                                                    <p className="text-xs text-slate-500 font-medium">{t.Ville}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <UserCircleIcon className="w-5 h-5 text-slate-300" />
                                                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 capitalize">{t.USER?.split('@')[0]}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter ${
                                                t['Action Client']?.toLowerCase() === 'acheter' ? 'bg-emerald-100 text-emerald-700' :
                                                t['Action Client']?.toLowerCase() === 'revisiter' ? 'bg-amber-100 text-amber-700' :
                                                'bg-blue-100 text-blue-700'
                                            }`}>
                                                {t['Action Client']}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right text-sm font-medium text-slate-700 dark:text-white">
                                            {Number(t.Prix || 0).toLocaleString()} <span className="text-[10px] text-slate-400">DH</span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded text-sm font-medium text-slate-700 dark:text-slate-400">
                                                {t.Quantité || 0}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button 
                                                    onClick={() => setTransactionToEdit(t)} 
                                                    className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                >
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setTransactionToDelete(t)} 
                                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <DeleteIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center">
                                            <ClipboardDocumentListIcon className="w-12 h-12 text-slate-200 mb-4" />
                                            <p className="text-slate-500 font-bold">Aucune transaction trouvée pour ces 10 jours</p>
                                            <p className="text-xs text-slate-400 mt-1">Les nouvelles transactions s'afficheront ici automatiquement.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50/30 flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-400">Page {currentPage} sur {totalPages}</span>
                        <div className="flex gap-2">
                            <button 
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                                className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronLeftIcon className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                                className="p-2 border border-slate-200 dark:border-slate-600 rounded-lg hover:bg-white dark:hover:bg-slate-700 disabled:opacity-50 transition-colors"
                            >
                                <ChevronRightIcon className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
            
            <AnalysisModal isOpen={showAnalysis} onClose={() => setShowAnalysis(false)} content={analysisResult} isLoading={isAnalyzing} />
            
            <EditVisitModal 
                isOpen={!!transactionToEdit} 
                onClose={() => setTransactionToEdit(null)} 
                visit={transactionToEdit} 
                onSave={() => { onRefresh(); setTransactionToEdit(null); }} 
            />

            <ConfirmationModal 
                isOpen={!!transactionToDelete} 
                onClose={() => setTransactionToDelete(null)} 
                onConfirm={handleDelete} 
                title="Supprimer la Transaction" 
                message={`Êtes-vous sûr de vouloir supprimer la transaction du ${transactionToDelete ? new Date(transactionToDelete['Date Heure'] || transactionToDelete.Date).toLocaleDateString('fr-FR') : ''} pour ${transactionToDelete?.Magazin} ? Cette action est irréversible.`} 
                confirmText={isDeleting ? "Suppression..." : "Supprimer définitivement"} 
            />
        </div>
    );
};

export default AdminTransactionsPage;
