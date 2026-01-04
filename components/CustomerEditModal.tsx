
import React, { useState, useEffect, useMemo } from 'react';
import { Store, Customer } from '../types.ts';
import XMarkIcon from './icons/XMarkIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import ExclamationTriangleIcon from './icons/ExclamationTriangleIcon.tsx';
import locationService, { LocationEntry } from '../services/locationService.ts';

interface CustomerEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    store: Store | null;
    onSave: (customerId: string, data: Partial<Customer>) => Promise<void>;
    isAdmin: boolean;
}

const CustomerEditModal: React.FC<CustomerEditModalProps> = ({ isOpen, onClose, store, onSave, isAdmin }) => {
    const [formData, setFormData] = useState<Partial<Customer>>({});
    const [isSaving, setIsSaving] = useState(false);
    const [dynamicLocations, setDynamicLocations] = useState<LocationEntry[]>([]);
    
    const [showCitySuggestions, setShowCitySuggestions] = useState(false);
    const [showRegionSuggestions, setShowRegionSuggestions] = useState(false);

    useEffect(() => {
        const fetchLocs = async () => {
            const data = await locationService.getAllLocations();
            setDynamicLocations(data);
        };
        if (isOpen) fetchLocs();
    }, [isOpen]);

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

    const uniqueCities = useMemo(() => {
        const cities = new Set<string>();
        dynamicLocations.forEach(loc => cities.add(loc.ville));
        return Array.from(cities).sort((a, b) => a.localeCompare(b, 'fr'));
    }, [dynamicLocations]);

    const filteredRegions = useMemo(() => {
        if (!formData.city) return [];
        return dynamicLocations
            .filter(loc => loc.ville.toLowerCase() === formData.city?.toLowerCase())
            .map(loc => loc.region)
            .sort((a, b) => a.localeCompare(b, 'fr'));
    }, [formData.city, dynamicLocations]);

    if (!isOpen || !store) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target as HTMLInputElement;
        const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
        setFormData(prev => ({ ...prev, [name]: val }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // --- التحقق الصارم من وجود المدينة في قاعدة البيانات ---
        if (formData.city) {
            const cityExists = uniqueCities.some(c => c.toLowerCase() === formData.city?.trim().toLowerCase());
            if (!cityExists) {
                alert("ERREUR : La ville saisie n'existe pas dans le système. Veuillez en choisir une dans la liste autorisée.");
                return;
            }
        }

        // --- التحقق الصارم من وجود المنطقة ---
        if (formData.region) {
            const regionExists = filteredRegions.some(r => r.toLowerCase() === formData.region?.trim().toLowerCase());
            if (!regionExists) {
                alert("ERREUR : La région saisie n'appartient pas à la ville sélectionnée dans notre base de données. Veuillez en choisir une dans la liste.");
                return;
            }
        }

        setIsSaving(true);
        try {
            await onSave(store.id, formData);
            onClose();
        } catch (error) {
            alert("Une erreur est survenue lors de l'enregistrement.");
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
                
                <form onSubmit={handleSubmit} className="p-8 max-h-[80vh] overflow-y-auto custom-scrollbar relative">
                    
                    {isAdmin && (
                        <div className="mb-8 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-xl flex items-center justify-between gap-4">
                            <div className="flex items-center gap-3 text-red-700 dark:text-red-400">
                                <ExclamationTriangleIcon className="w-6 h-6 flex-shrink-0" />
                                <div>
                                    <p className="text-sm font-bold">État du compte client</p>
                                    <p className="text-[11px] opacity-80">Si activé, le client sera marqué comme "Bloqué" dans tous les rapports.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name="is_blocked" 
                                    className="sr-only peer"
                                    checked={formData.is_blocked}
                                    onChange={handleChange}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                                <span className="ml-3 text-sm font-bold text-red-600 dark:text-red-400">
                                    {formData.is_blocked ? 'Bloqué' : 'Actif'}
                                </span>
                            </label>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Magazin *</label>
                            <input name="name" required value={formData.name || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Le Gérant</label>
                            <input name="manager" value={formData.manager || ''} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" />
                        </div>
                        
                        {/* Ville مع الاقتراحات */}
                        <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Ville *</label>
                            <input 
                                name="city" 
                                required 
                                value={formData.city || ''} 
                                onFocus={() => setShowCitySuggestions(true)}
                                onChange={(e) => {
                                    handleChange(e);
                                    setShowCitySuggestions(true);
                                    setFormData(p => ({ ...p, region: '' }));
                                }} 
                                className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                            {showCitySuggestions && (
                                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border rounded-xl shadow-2xl max-h-40 overflow-y-auto border-slate-100 dark:border-slate-700">
                                    {uniqueCities.filter(c => c.toLowerCase().includes(formData.city?.toLowerCase() || '')).map(city => (
                                        <button 
                                            key={city} 
                                            type="button" 
                                            onClick={() => {
                                                setFormData(p => ({ ...p, city }));
                                                setShowCitySuggestions(false);
                                            }} 
                                            className="w-full p-2 text-left hover:bg-blue-50 text-xs font-bold border-b last:border-0 border-slate-50 dark:border-slate-700"
                                        >
                                            {city}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Région مع الاقتراحات */}
                        <div className="space-y-1.5 relative">
                            <label className="text-[10px] font-black text-slate-400 uppercase">Région</label>
                            <input 
                                name="region" 
                                value={formData.region || ''} 
                                onFocus={() => setShowRegionSuggestions(true)}
                                onChange={(e) => {
                                    handleChange(e);
                                    setShowRegionSuggestions(true);
                                }} 
                                className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl text-sm font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none" 
                            />
                            {showRegionSuggestions && filteredRegions.length > 0 && (
                                <div className="absolute z-20 w-full mt-1 bg-white dark:bg-slate-800 border rounded-xl shadow-2xl max-h-40 overflow-y-auto border-slate-100 dark:border-slate-700">
                                    {filteredRegions.filter(r => r.toLowerCase().includes(formData.region?.toLowerCase() || '')).map(reg => (
                                        <button 
                                            key={reg} 
                                            type="button" 
                                            onClick={() => {
                                                setFormData(p => ({ ...p, region: reg }));
                                                setShowRegionSuggestions(false);
                                            }} 
                                            className="w-full p-2 text-left hover:bg-blue-50 text-xs font-bold border-b last:border-0 border-slate-50 dark:border-slate-700"
                                        >
                                            {reg}
                                        </button>
                                    ))}
                                </div>
                            )}
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

                    {/* Click outside to close suggestions */}
                    {(showCitySuggestions || showRegionSuggestions) && (
                        <div className="fixed inset-0 z-10" onClick={() => { setShowCitySuggestions(false); setShowRegionSuggestions(false); }}></div>
                    )}
                </form>
            </div>
        </div>
    );
};

export default CustomerEditModal;
