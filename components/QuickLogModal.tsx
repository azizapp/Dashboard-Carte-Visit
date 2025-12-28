
import React, { useState, useMemo, useEffect } from 'react';
import { Store, Customer } from '../types.ts';
import SearchIcon from './icons/SearchIcon.tsx';
import UserCircleIcon from './icons/UserCircleIcon.tsx';
import XMarkIcon from './icons/XMarkIcon.tsx';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentListIcon.tsx';
import MessageIcon from './icons/MessageIcon.tsx';
import PhoneCallIcon from './icons/PhoneCallIcon.tsx';
import PlusIcon from './icons/PlusIcon.tsx';
import { supabase } from '../services/supabase.ts';

interface QuickLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer, contacted: string, discussed: string, note: string) => void;
  initialCustomer?: Customer | null;
}

const QuickLogModal: React.FC<QuickLogModalProps> = ({ isOpen, onClose, onSave, initialCustomer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [contacted, setContacted] = useState('Téléphone');
  const [discussed, setDiscussed] = useState('');
  const [note, setNote] = useState('');
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (initialCustomer) {
        setSelectedCustomer(initialCustomer);
      }
      const fetchCustomers = async () => {
        setIsSearching(true);
        const { data } = await supabase
          .from('customers')
          .select('*')
          .order('name');
        if (data) setAllCustomers(data);
        setIsSearching(false);
      };
      fetchCustomers();
    } else {
      setSelectedCustomer(null);
      setSearchQuery('');
      setDiscussed('');
      setNote('');
    }
  }, [isOpen, initialCustomer]);

  const filteredCustomers = useMemo(() => {
    if (!searchQuery) return [];
    return allCustomers.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.manager && c.manager.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5);
  }, [allCustomers, searchQuery]);

  const handleSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setSearchQuery('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer) {
      onSave(selectedCustomer, contacted, discussed, note);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-blue-600 text-white">
          <div className="flex items-center gap-2">
            <ClipboardDocumentCheckIcon className="w-5 h-5" />
            <h3 className="text-lg font-bold">Rapport de Contact Rapide</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!selectedCustomer ? (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Rechercher un client
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 outline-none dark:text-white"
                  placeholder="Nom du magasin, Gérant..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                />
              </div>

              <div className="mt-2 space-y-2 max-h-60 overflow-y-auto pr-1">
                {isSearching ? (
                  <div className="text-center py-4 text-slate-400 text-sm">Chargement...</div>
                ) : filteredCustomers.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleSelect(c)}
                    className="w-full text-left px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-blue-500 rounded-xl transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.city} • {c.manager}</p>
                    </div>
                    <PlusIcon className="w-5 h-5 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl border border-blue-100 dark:border-blue-900/30 flex justify-between items-center">
                <div>
                  <p className="font-black text-blue-900 dark:text-blue-200 text-sm">{selectedCustomer.name}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-400">{selectedCustomer.city}</p>
                </div>
                {!initialCustomer && (
                  <button type="button" onClick={() => setSelectedCustomer(null)} className="text-xs font-bold text-blue-600 underline">Changer</button>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Contacté via :</label>
                <div className="relative">
                  <PhoneCallIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                  <select
                    value={contacted}
                    onChange={(e) => setContacted(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 font-bold text-sm dark:text-white appearance-none"
                  >
                    <option value="Téléphone">Téléphone</option>
                    <option value="WhatsApp">WhatsApp</option>
                    <option value="Visite Physique">Visite Physique</option>
                    <option value="Email">Email</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Sujet de discussion :</label>
                <div className="relative">
                  <MessageIcon className="absolute left-3 top-4 w-5 h-5 text-slate-300" />
                  <textarea
                    required
                    rows={2}
                    value={discussed}
                    onChange={(e) => setDiscussed(e.target.value)}
                    placeholder="Qu'est-ce qui a été discuté ?"
                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Notes complémentaires :</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Remarques additionnelles..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 text-sm dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Enregistrer le Rapport
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickLogModal;
