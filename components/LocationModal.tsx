
import React, { useState, useEffect } from 'react';
import XMarkIcon from './icons/XMarkIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import PlusIcon from './icons/PlusIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import SearchIcon from './icons/SearchIcon.tsx';
import locationService, { LocationEntry } from '../services/locationService.ts';

interface LocationModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose }) => {
    const [locations, setLocations] = useState<LocationEntry[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    
    const [newVille, setNewVille] = useState('');
    const [newRegion, setNewRegion] = useState('');

    const fetchLocations = async () => {
        setIsLoading(true);
        const data = await locationService.getAllLocations();
        setLocations(data);
        setIsLoading(false);
    };

    useEffect(() => {
        if (isOpen) fetchLocations();
    }, [isOpen]);

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newVille || !newRegion) return;
        
        setIsSubmitting(true);
        try {
            await locationService.addLocation(newVille, newRegion);
            setNewVille('');
            setNewRegion('');
            await fetchLocations();
            alert("Emplacement ajouté avec succès !");
        } catch (error) {
            alert("Erreur lors de l'ajout. Vérifiez si l'emplacement existe déjà.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const filteredLocations = locations.filter(l => 
        l.ville.toLowerCase().includes(searchTerm.toLowerCase()) || 
        l.region.toLowerCase().includes(searchTerm.toLowerCase())
    ).slice(0, 50);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden relative flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <header className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-emerald-600 text-white">
                    <div className="flex items-center gap-3">
                        <MapIcon className="w-6 h-6" />
                        <div>
                            <h3 className="text-xl font-black text-white">Gérer les Emplacements</h3>
                            <p className="text-[10px] uppercase font-bold text-emerald-100">Villes et Régions du Maroc</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </header>

                <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50">
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <input 
                            type="text" 
                            placeholder="Ville (ex: Casablanca)" 
                            required
                            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                            value={newVille}
                            onChange={e => setNewVille(e.target.value)}
                        />
                        <input 
                            type="text" 
                            placeholder="Région/Quartier" 
                            required
                            className="p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm outline-none focus:ring-2 focus:ring-emerald-500 dark:text-white"
                            value={newRegion}
                            onChange={e => setNewRegion(e.target.value)}
                        />
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all active:scale-95 flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-5 h-5" />}
                            Ajouter
                        </button>
                    </form>
                </div>

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="relative mb-4">
                        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Rechercher une ville ou région..." 
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-lg text-xs outline-none focus:ring-2 focus:ring-emerald-500"
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>

                    {isLoading ? (
                        <div className="flex justify-center py-10">
                            <SpinnerIcon className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : (
                        <div className="overflow-hidden border border-slate-100 dark:border-slate-700 rounded-xl">
                            <table className="w-full text-left text-xs">
                                <thead className="bg-slate-50 dark:bg-slate-700 text-slate-500 uppercase font-black">
                                    <tr>
                                        <th className="px-4 py-3">Ville</th>
                                        <th className="px-4 py-3">Région / Quartier</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {filteredLocations.map((loc, idx) => (
                                        <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-700/50">
                                            <td className="px-4 py-3 font-bold text-slate-700 dark:text-slate-200">{loc.ville}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{loc.region}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LocationModal;
