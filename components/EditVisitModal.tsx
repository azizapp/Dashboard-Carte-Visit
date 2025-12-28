
import React, { useState, useEffect } from 'react';
import { Store } from '../types.ts';
import XMarkIcon from './icons/XMarkIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentListIcon.tsx';
import { supabase } from '../services/supabase.ts';

interface EditVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    visit: Store | null;
    onSave: () => void;
}

const EditVisitModal: React.FC<EditVisitModalProps> = ({ isOpen, onClose, visit, onSave }) => {
    const [date, setDate] = useState('');
    const [note, setNote] = useState('');
    const [action, setAction] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (visit) {
            // تحويل التاريخ من الصيغة المخزنة (غالباً YYYY-MM-DD)
            setDate(visit['Rendez-Vous'] || '');
            setNote(visit.Note || '');
            setAction(visit['Action Client'] || 'Revisiter');
        }
    }, [visit]);

    if (!isOpen || !visit) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const { error } = await supabase
                .from('visits')
                .update({
                    appointment_date: date,
                    note: note,
                    action: action
                })
                .eq('id', visit.ID);
            
            if (error) throw error;
            onSave();
            onClose();
        } catch (err) {
            console.error("Update error:", err);
            alert("Erreur lors de la mise à jour du rendez-vous");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-amber-500 text-white">
                    <h3 className="text-lg font-bold">Modifier le Rendez-vous</h3>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-xl border border-slate-100 dark:border-slate-700 mb-2">
                        <p className="text-xs font-black text-slate-400 uppercase mb-1">Client</p>
                        <p className="font-bold text-slate-800 dark:text-white">{visit.Magazin}</p>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Date du Rendez-vous</label>
                        <div className="relative">
                            <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input 
                                type="date" 
                                required
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm dark:text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Type d'action</label>
                        <div className="relative">
                            <ClipboardDocumentCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <select 
                                value={action}
                                onChange={(e) => setAction(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 font-bold text-sm dark:text-white appearance-none"
                            >
                                <option value="Revisiter">Revisiter</option>
                                <option value="Acheter">Acheter (Commande)</option>
                                <option value="Prospecter">Prospecter</option>
                                <option value="Contact">Contact</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Notes / Remarques</label>
                        <textarea 
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-amber-500 text-sm dark:text-white"
                            placeholder="Modifier les notes..."
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSaving} className="flex-[2] py-3.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                            {isSaving && <SpinnerIcon className="w-4 h-4 animate-spin" />}
                            Mettre à jour
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVisitModal;
