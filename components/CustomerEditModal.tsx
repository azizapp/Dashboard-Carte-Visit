import React, { useState, useEffect } from 'react';
import { Store, Customer } from '../types.ts';
import XMarkIcon from './icons/XMarkIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';

interface CustomerEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    store: Store | null;
    onSave: (customerId: string, data: Partial<Customer>) => Promise<void>;
}

const CustomerEditModal: React.FC<CustomerEditModalProps> = ({ isOpen, onClose, store, onSave }) => {
    const [formData, setFormData] = useState<Partial<Customer>>({});
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (store) {
            setFormData({
                name: store.Magazin,
                manager: store['Le Gérant'],
                city: store.Ville,
                gsm1: store.GSM1,
                gsm2: store.GSM2,
                phone: store.Phone,
                email: store.Email,
                gamme: store.Gamme,
                address: store.Adresse,
                region: store.Région,
                location: store.Localisation,
                is_blocked: store.is_blocked || false
            });
        }
    }, [store]);

    if (!isOpen || !store) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(store.id, formData);
            onClose();
        } catch (error) {
            alert("حدث خطأ أثناء حفظ البيانات");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">Modifier les informations client</h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6 text-slate-400" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Magazin *</label>
                            <input name="name" required value={formData.name || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Le Gérant</label>
                            <input name="manager" value={formData.manager || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Ville *</label>
                            <input name="city" required value={formData.city || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">GSM 1 (Principal) *</label>
                            <input name="gsm1" required value={formData.gsm1 || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">GSM 2</label>
                            <input name="gsm2" value={formData.gsm2 || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Ligne Fixe</label>
                            <input name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Email</label>
                            <input name="email" type="email" value={formData.email || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Gamme</label>
                            <select name="gamme" value={formData.gamme || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none">
                                <option value="Haute">Haute</option>
                                <option value="Haute et Moyenne">Haute et Moyenne</option>
                                <option value="Moyenne">Moyenne</option>
                                <option value="Économie">Économie</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Adresse</label>
                            <textarea name="address" value={formData.address || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none h-24 resize-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Région</label>
                            <input name="region" value={formData.region || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Localisation (GPS)</label>
                            <input name="location" value={formData.location || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="33.5731, -7.5898" />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-6 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold rounded-xl hover:opacity-90 transition-all">
                            Annuler
                        </button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">
                            {isSaving && <SpinnerIcon className="w-4 h-4 animate-spin" />}
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CustomerEditModal;