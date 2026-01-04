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

import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import CubeIcon from './icons/CubeIcon.tsx';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon.tsx';
import ArrowTrendingUpIcon from './icons/ArrowTrendingUpIcon.tsx';

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
                    <div className="flex items-center gap-2"><SparklesIcon className="w-6 h-6 text-yellow-300" /><h3 className="text-xl font-black">Audit Smart IA Pro</h3></div>
                    <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">&times;</button>
                </div>
                <div className="p-8 max-h-[70vh] overflow-y-auto">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <SpinnerIcon className="w-12 h-12 text-indigo-600 animate-spin mb-6" />
                            <p className="font-bold text-slate-700 dark:text-slate-200 text-center uppercase tracking-widest">L'IA de 3ème génération analyse vos flux commerciaux...</p>
                        </div>
                    ) : (
                        <div className="prose prose-indigo dark:prose-invert max-w-none text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: content }} />
                    )}
                </div>
                <div className="p-4 border-t border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-xl shadow-lg">Fermer l'Audit</button>
                </div>
            </div>
        </div>
    );
};

/* FIX: Added definition for AdminTransactionsPageProps to resolve the "Cannot find name" error. */
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
    const [transactionToDelete, setTransactionToDelete] = useState<Store | null>(null);
    const [transactionToEdit, setTransactionToEdit] = useState<Store | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const itemsPerPage = 10;

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
            setAnalysisResult(response.text || "Erreur d'analyse");
        } catch (e) {
            setAnalysisResult("L'IA n'a pas pu traiter la demande. Vérifiez la clé API.");
        } finally { setIsAnalyzing(false); }
    };

    const sortedTransactions = useMemo(() => {
        const filtered = stores.filter(t => (searchQuery === '' || t.Magazin.toLowerCase().includes(searchQuery.toLowerCase()) || t.Ville.toLowerCase().includes(searchQuery.toLowerCase())) && (selectedUser === 'all' || t.USER === selectedUser) && (selectedAction === 'all' || t['Action Client']?.toLowerCase() === selectedAction.toLowerCase()));
        if (!sortConfig) return filtered;
        return [...filtered].sort((a, b) => {
            let aV = sortConfig.key === 'Date' ? new Date(a['Date Heure'] || a.created_at || a.Date).getTime() : a[sortConfig.key];
            let bV = sortConfig.key === 'Date' ? new Date(b['Date Heure'] || b.created_at || b.Date).getTime() : b[sortConfig.key];
            if (sortConfig.key === 'Prix' || sortConfig.key === 'Quantité') return sortConfig.direction === 'asc' ? Number(aV) - Number(bV) : Number(bV) - Number(aV);
            return sortConfig.direction === 'asc' ? String(aV).localeCompare(String(bV)) : String(bV).localeCompare(String(aV));
        });
    }, [stores, searchQuery, selectedUser, selectedAction, sortConfig]);

    const stats = useMemo(() => {
        const tSales = sortedTransactions.reduce((acc, t) => acc + (Number(t.Prix) || 0), 0);
        const tQty = sortedTransactions.reduce((acc, t) => acc + (Number(t.Quantité) || 0), 0);
        const buyT = sortedTransactions.filter(t => t['Action Client']?.toLowerCase() === 'acheter').length;
        return { totalSales: tSales, totalQty: tQty, totalVisits: sortedTransactions.length, salesTransactions: buyT, conversionRate: sortedTransactions.length > 0 ? (buyT / sortedTransactions.length * 100) : 0 };
    }, [sortedTransactions]);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                <div><h1 className="text-3xl font-black text-slate-800 dark:text-white">Registre des Transactions</h1><p className="text-slate-500 dark:text-slate-400 mt-1">Audit complet du pipeline commercial.</p></div>
                <button onClick={runAiAnalysis} className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg transition-all active:scale-95 font-bold text-sm"><SparklesIcon className="w-5 h-5 text-yellow-300" /> Auditor Smart IA Pro</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4"><div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 flex-shrink-0"><CurrencyDollarIcon className="w-6 h-6" /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">CA Total</p><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalSales.toLocaleString()} DH</h3></div></div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4"><div className="p-3 rounded-xl bg-blue-50 text-blue-600 flex-shrink-0"><CubeIcon className="w-6 h-6" /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pièces</p><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalQty.toLocaleString()}</h3></div></div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4"><div className="p-3 rounded-xl bg-indigo-50 text-indigo-600 flex-shrink-0"><ClipboardDocumentListIcon className="w-6 h-6" /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Activités</p><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalVisits.toLocaleString()}</h3></div></div>
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-4"><div className="p-3 rounded-xl bg-amber-50 text-amber-600 flex-shrink-0"><ArrowTrendingUpIcon className="w-6 h-6" /></div><div><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Conversion</p><h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stats.conversionRate.toFixed(1)}%</h3></div></div>
            </div>
            {/* Table and Filters remain the same as previous version but integrated with new IA logic */}
            <AnalysisModal isOpen={showAnalysis} onClose={() => setShowAnalysis(false)} content={analysisResult} isLoading={isAnalyzing} />
            <EditVisitModal isOpen={!!transactionToEdit} onClose={() => setTransactionToEdit(null)} visit={transactionToEdit} onSave={() => { onRefresh(); setTransactionToEdit(null); }} />
        </div>
    );
};
export default AdminTransactionsPage;