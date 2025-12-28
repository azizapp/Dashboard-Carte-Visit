
import React, { useState, useEffect } from 'react';
import { Store, StoreFormData, Customer } from '../types.ts';
import LocationMarkerIcon from './icons/LocationMarkerIcon.tsx';
import UserCircleIcon from './icons/UserCircleIcon.tsx';
import StoreIcon from './icons/StoreIcon.tsx';
import { supabase } from '../services/supabase.ts';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

interface StoreFormPageProps {
    onClose: () => void;
    onSubmit: (storeData: StoreFormData) => void;
    stores: Store[];
}

const StoreFormPage: React.FC<StoreFormPageProps> = ({ onClose, onSubmit }) => {
  // FIX: Updated property names to match Store interface ('GSM1' and 'Le Gérant' instead of 'GSM' and 'Gérant').
  const [formData, setFormData] = useState<StoreFormData>({
      Magazin: '', Ville: '', GSM1: '', 'Le Gérant': '', Gamme: 'Haute', 'Action Client': 'Revisiter'
  });
  const [existingCustomers, setExistingCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
      const fetchCust = async () => {
          const { data } = await supabase.from('customers').select('*').order('name');
          if (data) setExistingCustomers(data);
      };
      fetchCust();
  }, []);

  const handleSelectCustomer = (c: Customer) => {
      // FIX: Map Customer properties to StoreFormData correctly, using gsm1 and 'Le Gérant'.
      setFormData({
          ...formData,
          id: c.id,
          Magazin: c.name,
          'Le Gérant': c.manager,
          Ville: c.city,
          GSM1: c.gsm1,
          Gamme: c.gamme,
          Localisation: c.location
      });
      setShowSuggestions(false);
      setSearchQuery(c.name);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-[#F7F8FA] dark:bg-slate-900 min-h-screen">
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 p-4 flex items-center shadow-sm">
            <button onClick={onClose} className="p-1"><ArrowLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300"/></button>
            <h1 className="flex-1 text-center font-bold text-slate-800 dark:text-white">Nouveau Lead</h1>
            <div className="w-8"></div>
        </header>

        <main className="p-6 max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-800 mb-2">
                    <UserCircleIcon className="w-10 h-10 text-[#4407EB]" />
                </div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white">Détails du Prospect</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 px-4">Capturez les informations de votre nouveau prospect optique</p>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-6">
                <div className="flex items-center gap-2 text-[#4407EB] font-bold text-sm mb-2">
                    <UserCircleIcon className="w-5 h-5" />
                    <span>Informations Prospect</span>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nom de l'opticien *</label>
                        <div className="relative">
                            <StoreIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input 
                                type="text" 
                                placeholder="Nom du magasin d'optique"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] transition-all text-sm"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowSuggestions(true);
                                    setFormData(p => ({...p, Magazin: e.target.value, id: undefined}));
                                }}
                            />
                            {showSuggestions && searchQuery.length > 1 && (
                                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border rounded-xl shadow-xl max-h-48 overflow-y-auto overflow-x-hidden border-slate-100 dark:border-slate-700">
                                    {existingCustomers.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())).map(c => (
                                        <button key={c.id} onClick={() => handleSelectCustomer(c)} className="w-full p-4 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 border-b last:border-0 border-slate-50 dark:border-slate-700 transition-colors">
                                            <div className="font-bold text-sm text-slate-900 dark:text-white">{c.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">{c.city} • {c.manager}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase ml-1">Nom complet *</label>
                        <div className="relative">
                            <UserCircleIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <input 
                                type="text" 
                                name="Le Gérant"
                                value={formData['Le Gérant'] || ''}
                                onChange={handleChange}
                                placeholder="Entrez le nom complet"
                                className="w-full pl-12 pr-4 py-3.5 bg-slate-50 dark:bg-slate-700 border border-slate-100 dark:border-slate-600 rounded-xl outline-none focus:ring-2 focus:ring-[#4407EB] transition-all text-sm"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-[#4407EB] font-bold text-sm mb-4">
                    <LocationMarkerIcon className="w-5 h-5" />
                    <span>Localisation GPS</span>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-xl border border-green-100 dark:border-green-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-green-500 shadow-sm">
                        <LocationMarkerIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-green-700 dark:text-green-400">Position enregistrée</p>
                        <p className="text-[11px] text-green-600/70 dark:text-green-400/50">Aucune localisation enregistrée</p>
                    </div>
                </div>
            </div>

            <button 
                onClick={() => onSubmit(formData)}
                className="w-full bg-[#4407EB] text-white py-4 rounded-2xl font-bold shadow-xl shadow-blue-200 dark:shadow-none hover:opacity-90 active:scale-[0.98] transition-all"
            >
                Enregistrer le Lead
            </button>
        </main>
    </div>
  );
};

export default StoreFormPage;