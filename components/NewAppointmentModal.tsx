
import React, { useState, useMemo, useEffect } from 'react';
import { Customer } from '../types.ts';
import SearchIcon from './icons/SearchIcon.tsx';
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';
import UserCircleIcon from './icons/UserCircleIcon.tsx';
import XMarkIcon from './icons/XMarkIcon.tsx';
import ClipboardDocumentCheckIcon from './icons/ClipboardDocumentListIcon.tsx';
import PlusIcon from './icons/PlusIcon.tsx';
import { supabase } from '../services/supabase.ts';

interface NewAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (customer: Customer, date: string, note: string, user: string, actionClient: string) => void;
  initialCustomer?: Customer | null;
}

const NewAppointmentModal: React.FC<NewAppointmentModalProps> = ({ isOpen, onClose, onSave, initialCustomer }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [selectedUser, setSelectedUser] = useState('');
  const [actionClient, setActionClient] = useState('Revisiter');
  const [userList, setUserList] = useState<string[]>([]);
  const [allCustomers, setAllCustomers] = useState<Customer[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSelectedCustomer(initialCustomer || null);
      if (initialCustomer) {
        setSelectedUser(initialCustomer.user_email || '');
      }
      
      const fetchData = async () => {
        setIsSearching(true);
        try {
          const { data: usersData } = await supabase.from('allowed_users').select('email').order('email');
          if (usersData) setUserList(usersData.map(u => u.email));

          const { data: custData } = await supabase.from('customers').select('*').order('name');
          if (custData) setAllCustomers(custData);
        } catch (e) {
          console.error("Error fetching data:", e);
        } finally {
          setIsSearching(false);
        }
      };
      fetchData();
    } else {
      setSelectedCustomer(null);
      setSearchQuery('');
      setDate('');
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
    setSelectedUser(customer.user_email || '');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCustomer && date) {
      onSave(selectedCustomer, date, note, selectedUser, actionClient);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
        
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-indigo-600 text-white">
          <div className="flex items-center gap-2">
            <CalendarDaysIcon className="w-5 h-5" />
            <h3 className="text-lg font-bold">Nouveau Rendez-vous</h3>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-white/10 rounded-full transition-colors">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {!selectedCustomer ? (
            <div className="space-y-4">
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300">
                Rechercher un client (Tableau Clients)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-3 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none dark:text-white"
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
                    className="w-full text-left px-4 py-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 hover:border-indigo-500 rounded-xl transition-all flex items-center justify-between group"
                  >
                    <div>
                      <p className="font-bold text-slate-800 dark:text-white text-sm">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.city} • {c.manager}</p>
                    </div>
                    <PlusIcon className="w-5 h-5 text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center justify-between bg-indigo-50 dark:bg-indigo-900/20 p-4 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <div>
                  <p className="font-black text-indigo-900 dark:text-indigo-200 text-sm">{selectedCustomer.name}</p>
                  <p className="text-xs text-indigo-700 dark:text-indigo-400">{selectedCustomer.city}</p>
                </div>
                {!initialCustomer && (
                  <button type="button" onClick={() => setSelectedCustomer(null)} className="text-xs font-bold text-indigo-600 underline">Changer</button>
                )}
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Date du Rendez-vous :</label>
                <div className="relative">
                    <CalendarDaysIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <input
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm dark:text-white"
                    />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Assigner à (Mozâa) :</label>
                <div className="relative">
                    <UserCircleIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <select
                        required
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm dark:text-white appearance-none"
                    >
                        <option value="">Sélectionner un Mozâa</option>
                        {userList.map(email => <option key={email} value={email}>{email}</option>)}
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Type d'action :</label>
                <div className="relative">
                    <ClipboardDocumentCheckIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                    <select
                        value={actionClient}
                        onChange={(e) => setActionClient(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-sm dark:text-white appearance-none"
                    >
                        <option value="Revisiter">Revisiter</option>
                        <option value="Acheter">Acheter (Commande)</option>
                        <option value="Prospecter">Prospecter</option>
                    </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase mb-2 ml-1">Notes (Optionnel) :</label>
                <textarea
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Notes de préparation..."
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500 text-sm dark:text-white"
                />
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2"
              >
                Confirmer le Rendez-vous
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewAppointmentModal;
