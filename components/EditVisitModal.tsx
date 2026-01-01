import React, { useState, useEffect } from 'react';
import { Store } from '../types.ts';
import XMarkIcon from './icons/XMarkIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import ClipboardDocumentListIcon from './icons/ClipboardDocumentListIcon.tsx';
import CurrencyDollarIcon from './icons/CurrencyDollarIcon.tsx';
import CubeIcon from './icons/CubeIcon.tsx';
import StoreIcon from './icons/StoreIcon.tsx';
import { supabase } from '../services/supabase.ts';

interface EditVisitModalProps {
    isOpen: boolean;
    onClose: () => void;
    visit: Store | null;
    onSave: () => void;
}

const EditVisitModal: React.FC<EditVisitModalProps> = ({ isOpen, onClose, visit, onSave }) => {
    const [magazinName, setMagazinName] = useState('');
    const [visitDate, setVisitDate] = useState('');
    const [appointmentDate, setAppointmentDate] = useState('');
    const [note, setNote] = useState('');
    const [action, setAction] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [quantity, setQuantity] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (visit) {
            setMagazinName(visit.Magazin || '');
            // تحويل التاريخ من صيغة العرض إلى صيغة حقل التاريخ (YYYY-MM-DD)
            if (visit['Date Heure']) {
                setVisitDate(new Date(visit['Date Heure']).toISOString().split('T')[0]);
            } else {
                setVisitDate('');
            }
            setAppointmentDate(visit['Rendez-Vous'] || '');
            setNote(visit.Note || '');
            setAction(visit['Action Client'] || 'Revisiter');
            setPrice(Number(visit.Prix) || 0);
            setQuantity(Number(visit.Quantité) || 0);
        }
    }, [visit]);

    if (!isOpen || !visit) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            // 1. تحديث اسم الزبون في جدول customers إذا تغير
            if (magazinName !== visit.Magazin) {
                const { error: custError } = await supabase
                    .from('customers')
                    .update({ name: magazinName })
                    .eq('id', visit.id);
                if (custError) throw custError;
            }

            // 2. تحديث بيانات المعاملة في جدول visits
            const updateData: any = {
                action: action,
                note: note,
                appointment_date: action === 'Revisiter' ? appointmentDate : null,
                price: action === 'Acheter' ? price : 0,
                quantity: action === 'Acheter' ? quantity : 0,
            };

            // تحديث تاريخ المعاملة إذا تم توفيره
            if (visitDate) {
                updateData.created_at = new Date(visitDate).toISOString();
            }

            const { error: visitError } = await supabase
                .from('visits')
                .update(updateData)
                .eq('id', visit.ID);
            
            if (visitError) throw visitError;

            onSave();
            onClose();
        } catch (err) {
            console.error("Update error:", err);
            alert("Erreur lors de la mise à jour des données.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-600 text-white">
                    <div className="flex items-center gap-2">
                        <ClipboardDocumentListIcon className="w-5 h-5 text-indigo-200" />
                        <h3 className="text-lg font-bold uppercase tracking-tight">Modifier la Transaction</h3>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    {/* تعديل اسم الزبون */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Nom du Client / Magazin</label>
                        <div className="relative">
                            <StoreIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input 
                                type="text" 
                                required
                                value={magazinName}
                                onChange={(e) => setMagazinName(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm dark:text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {/* تعديل تاريخ المعاملة */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Date Transaction</label>
                            <div className="relative">
                                <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <input 
                                    type="date" 
                                    required
                                    value={visitDate}
                                    onChange={(e) => setVisitDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm dark:text-white"
                                />
                            </div>
                        </div>

                        {/* تعديل نوع العملية */}
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Type d'Action</label>
                            <div className="relative">
                                <ClipboardDocumentListIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                                <select 
                                    value={action}
                                    onChange={(e) => setAction(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm dark:text-white appearance-none"
                                >
                                    <option value="Acheter">Acheter (Commande)</option>
                                    <option value="Revisiter">Revisiter (Rendez-vous)</option>
                                    <option value="Contact">Contact</option>
                                    <option value="Prospecter">Prospecter</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* حقول الشراء */}
                    {action === 'Acheter' && (
                        <div className="grid grid-cols-2 gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-800 rounded-xl animate-in slide-in-from-top-2">
                            <div>
                                <label className="block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-2 ml-1 tracking-widest">Montant (MAD)</label>
                                <div className="relative">
                                    <CurrencyDollarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" />
                                    <input 
                                        type="number" 
                                        value={price}
                                        onChange={(e) => setPrice(Number(e.target.value))}
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm dark:text-white"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase mb-2 ml-1 tracking-widest">Quantité</label>
                                <div className="relative">
                                    <CubeIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-300" />
                                    <input 
                                        type="number" 
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-700 rounded-xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold text-sm dark:text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* حقل الموعد القادم */}
                    {action === 'Revisiter' && (
                        <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800 rounded-xl animate-in slide-in-from-top-2">
                            <label className="block text-[10px] font-black text-indigo-600 dark:text-indigo-400 uppercase mb-2 ml-1 tracking-widest">Date du Prochain RDV</label>
                            <div className="relative">
                                <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-indigo-300" />
                                <input 
                                    type="date" 
                                    required
                                    value={appointmentDate}
                                    onChange={(e) => setAppointmentDate(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-indigo-200 dark:border-indigo-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm dark:text-white"
                                />
                            </div>
                        </div>
                    )}

                    {/* الملاحظات */}
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-widest">Notes / Compte-rendu</label>
                        <textarea 
                            rows={3}
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white resize-none"
                            placeholder="Détails supplémentaires sur la transaction..."
                        />
                    </div>

                    <div className="pt-2 flex gap-3">
                        <button type="button" onClick={onClose} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:bg-slate-200 transition-all">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSaving} className="flex-[2] py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2">
                            {isSaving && <SpinnerIcon className="w-4 h-4 animate-spin" />}
                            Mettre à jour la transaction
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditVisitModal;