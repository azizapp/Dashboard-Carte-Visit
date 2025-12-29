
import React, { useMemo, useState } from 'react';
import { Store, Mode, Customer } from '../../types.ts';
import PhoneCallIcon from '../icons/PhoneCallIcon.tsx';
import WhatsAppIcon from '../icons/WhatsAppIcon.tsx';
import LocationMarkerIcon from '../icons/LocationMarkerIcon.tsx';
import CalendarDaysIcon from '../icons/CalendarDaysIcon.tsx';
import UserCircleIcon from '../icons/UserCircleIcon.tsx';
import PlusIcon from '../icons/PlusIcon.tsx';
import ChevronLeftIcon from '../icons/ChevronLeftIcon.tsx';
import ChevronRightIcon from '../icons/ChevronRightIcon.tsx';
import EllipsisVerticalIcon from '../icons/EllipsisVerticalIcon.tsx';
import SpinnerIcon from '../icons/SpinnerIcon.tsx';
import NewAppointmentModal from '../NewAppointmentModal.tsx';
import QuickLogModal from '../QuickLogModal.tsx';
import EditVisitModal from '../EditVisitModal.tsx';
import storeService from '../../services/storeService.ts';
import ClipboardDocumentCheckIcon from '../icons/ClipboardDocumentListIcon.tsx';
import EditIcon from '../icons/EditIcon.tsx';
import DeleteIcon from '../icons/DeleteIcon.tsx';
import ConfirmationModal from '../ConfirmationModal.tsx';
import UsersIcon from '../icons/UsersIcon.tsx';
import ClockIcon from '../icons/ClockIcon.tsx';
import { supabase } from '../../services/supabase.ts';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const FilterIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 0 1-.659 1.591l-5.432 5.432a2.25 2.25 0 0 0-.659 1.591v2.927a2.25 2.25 0 0 1-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 0 0-.659-1.591L3.659 7.409A2.25 2.25 0 0 1 3 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0 1 12 3Z" />
    </svg>
);

type TimePeriod = 'all' | 'today' | 'thisWeek' | 'nextWeek' | 'thisMonth' | 'nextMonth' | 'calendar';

interface AppointmentsPageProps {
  stores: Store[];
  onClose: () => void;
  onViewDetails: (store: Store) => void;
  isAdmin?: boolean;
  authenticatedUser: string;
  onOptimisticUpdate: (newStore: Store) => void;
  onEditStore?: (store: Store) => void; 
  onRefresh?: () => void; 
}

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ stores, onClose, onViewDetails, isAdmin = true, authenticatedUser, onOptimisticUpdate, onEditStore, onRefresh }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [filterUser, setFilterUser] = useState<string>('all');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<TimePeriod>('thisWeek');
  const [isNewAppointmentModalOpen, setIsNewAppointmentModalOpen] = useState(false);
  const [isQuickLogModalOpen, setIsQuickLogModalOpen] = useState(false);
  const [isEditVisitModalOpen, setIsEditVisitModalOpen] = useState(false);
  const [isActionInProgress, setIsActionInProgress] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState<Store | null>(null);
  const [appointmentToEdit, setAppointmentToEdit] = useState<Store | null>(null);

  const allAppointments = useMemo(() => {
    const list: { store: Store; date: Date; user: string; city: string }[] = [];
    const accessibleStores = isAdmin ? stores : stores.filter(s => s.USER === authenticatedUser);

    accessibleStores.forEach(s => {
      if (s['Rendez-Vous']) {
        const dates = s['Rendez-Vous'].split(/[\n,]/).map(d => d.trim()).filter(Boolean);
        dates.forEach(d => {
          const date = new Date(d);
          if (!isNaN(date.getTime())) {
            list.push({ store: s, date, user: s.USER || 'Inconnu', city: s.Ville });
          }
        });
      }
    });
    return list;
  }, [stores, isAdmin, authenticatedUser]);

  const users = useMemo(() => Array.from(new Set(allAppointments.map(a => a.user))).sort(), [allAppointments]);
  const cities = useMemo(() => Array.from(new Set(allAppointments.map(a => a.city))).sort(), [allAppointments]);

  const filteredAppointments = useMemo(() => {
    return allAppointments.filter(a => {
      if (filterUser !== 'all' && a.user !== filterUser) return false;
      if (filterCity !== 'all' && a.city !== filterCity) return false;
      return true;
    });
  }, [allAppointments, filterUser, filterCity]);

  const displayAppointments = useMemo(() => {
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    let start: Date;
    let end: Date;

    switch (timeFilter) {
      case 'all':
        return filteredAppointments.sort((a, b) => a.date.getTime() - b.date.getTime());
      case 'today':
        start = startOfToday;
        end = endOfToday;
        break;
      case 'thisWeek': {
        const currentDay = startOfToday.getDay();
        start = new Date(startOfToday);
        start.setDate(startOfToday.getDate() - currentDay);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'nextWeek': {
        const currentDay = startOfToday.getDay();
        start = new Date(startOfToday);
        start.setDate(startOfToday.getDate() - currentDay + 7);
        end = new Date(start);
        end.setDate(start.getDate() + 6);
        end.setHours(23, 59, 59, 999);
        break;
      }
      case 'thisMonth':
        start = new Date(now.getFullYear(), now.getMonth(), 1);
        end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        break;
      case 'nextMonth':
        start = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        end = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59, 999);
        break;
      case 'calendar': {
        start = new Date(selectedDate);
        start.setHours(0,0,0,0);
        end = new Date(selectedDate);
        end.setHours(23, 59, 59, 999);
        break;
      }
      default:
        return [];
    }

    return filteredAppointments
        .filter(a => a.date >= start && a.date <= end)
        .sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [filteredAppointments, timeFilter, selectedDate]);

  const getTimeFilterLabel = () => {
      switch(timeFilter) {
          case 'all': return "Toutes les dates";
          case 'today': return "Aujourd'hui";
          case 'thisWeek': return "Cette semaine";
          case 'nextWeek': return "Semaine prochaine";
          case 'thisMonth': return "Ce mois";
          case 'nextMonth': return "Mois prochain";
          case 'calendar': return selectedDate.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
          default: return "Rendez-vous";
      }
  };

  const handleSaveAppointment = (customer: Customer, date: string, note: string, userEmail: string, action: string) => {
    const newStore: Store = {
      ...customer,
      id: customer.id,
      ID: Date.now().toString(),
      Magazin: customer.name,
      Ville: customer.city,
      'Le Gérant': customer.manager,
      GSM1: customer.gsm1,
      'Action Client': action,
      'Rendez-Vous': date,
      Note: note,
      Prix: 0,
      Quantité: 0,
      USER: userEmail || authenticatedUser,
      Date: new Date().toLocaleDateString('fr-FR')
    } as Store;

    onOptimisticUpdate(newStore);
    setIsNewAppointmentModalOpen(false);
    setIsActionInProgress(true);

    storeService.addStore(Mode.Production, newStore, undefined, userEmail || authenticatedUser)
      .then(() => onRefresh?.())
      .catch(err => console.error("Background Save Error:", err))
      .finally(() => setIsActionInProgress(false));
  };

  const handleSaveQuickLog = (customer: Customer, contacted: string, discussed: string, note: string) => {
    const newStore: Store = {
      ...customer,
      id: customer.id,
      ID: Date.now().toString(),
      Magazin: customer.name,
      Ville: customer.city,
      'Le Gérant': customer.manager,
      GSM1: customer.gsm1,
      'Action Client': 'Contact',
      'Contacté': contacted,
      'Discuté': discussed,
      Note: note,
      Prix: 0,
      Quantité: 0,
      USER: authenticatedUser,
      Date: new Date().toLocaleDateString('fr-FR')
    } as Store;

    onOptimisticUpdate(newStore);
    setIsQuickLogModalOpen(false);
    setIsActionInProgress(true);

    storeService.addStore(Mode.Production, newStore, undefined, authenticatedUser)
      .then(() => onRefresh?.())
      .catch(err => console.error("Background Save Error:", err))
      .finally(() => setIsActionInProgress(false));
  };

  const handleDeleteAppointment = async () => {
      if (!appointmentToDelete) return;
      setIsActionInProgress(true);
      try {
          const { error } = await supabase
              .from('visits')
              .delete()
              .eq('id', appointmentToDelete.ID);
          
          if (error) throw error;
          onRefresh?.(); 
      } catch (err) {
          console.error("Delete error:", err);
          alert("Erreur lors de la suppression");
      } finally {
          setAppointmentToDelete(null);
          setIsActionInProgress(false);
      }
  };

  const handleEditClick = (appt: Store) => {
      setAppointmentToEdit(appt);
      setIsEditVisitModalOpen(true);
  };

  const handleEditSave = () => {
      onRefresh?.(); 
      setIsEditVisitModalOpen(false);
  };

  const calendarDays = useMemo(() => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1).getDay();
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();
    
    const days = [];
    for (let i = firstDayOfMonth - 1; i >= 0; i--) {
        const d = new Date(year, month - 1, daysInPrevMonth - i);
        days.push({ day: d.getDate(), date: d, isCurrentMonth: false });
    }
    for (let i = 1; i <= daysInCurrentMonth; i++) {
        const d = new Date(year, month, i);
        const hasAppt = filteredAppointments.some(a => 
            a.date.getDate() === i && 
            a.date.getMonth() === month && 
            a.date.getFullYear() === year
        );
        days.push({ day: i, date: d, isCurrentMonth: true, hasAppt });
    }
    const totalCells = 42;
    const nextDaysNeeded = totalCells - days.length;
    for (let i = 1; i <= nextDaysNeeded; i++) {
        const d = new Date(year, month + 1, i);
        const hasApptInNext = filteredAppointments.some(a => 
            a.date.getDate() === i && 
            a.date.getMonth() === month + 1 && 
            a.date.getFullYear() === (month === 11 ? year + 1 : year)
        );
        days.push({ day: i, date: d, isCurrentMonth: false, hasAppt: hasApptInNext });
    }
    return days;
  }, [selectedDate, filteredAppointments]);

  const changeMonth = (offset: number) => {
    const newDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + offset, 1);
    setSelectedDate(newDate);
  };

  const formattedMonthYear = selectedDate.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

  if (!isAdmin) {
      return (
        <div className="bg-[#F7F8FA] dark:bg-slate-900 min-h-screen max-w-xl mx-auto border-x border-slate-100 dark:border-slate-800">
            <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 p-4 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center">
                    <button onClick={onClose} className="p-1 mr-2"><ArrowLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300"/></button>
                    <h1 className="text-lg font-bold text-slate-800 dark:text-white">Mes Rendez-vous</h1>
                  </div>
                  <div className="flex items-center gap-2">
                      <button onClick={() => setIsQuickLogModalOpen(true)} className="p-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors" title="Contact">
                          <ClipboardDocumentCheckIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => setIsNewAppointmentModalOpen(true)} className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors" title="Nouveau RDV">
                          <PlusIcon className="w-5 h-5" />
                      </button>
                  </div>
                </div>
            </header>
            <main className="p-4 space-y-4 pb-24">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center gap-3">
                    <FilterIcon className="w-4 h-4 text-slate-400" />
                    <select value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as TimePeriod)} className="flex-1 bg-transparent border-none text-sm font-bold outline-none dark:text-white appearance-none cursor-pointer">
                        <option value="today">Aujourd'hui</option>
                        <option value="thisWeek">Cette semaine</option>
                        <option value="nextWeek">Semaine prochaine</option>
                        <option value="thisMonth">Ce mois</option>
                        <option value="nextMonth">Mois prochain</option>
                    </select>
                </div>

                {displayAppointments.length === 0 ? (
                    <div className="text-center py-20 text-slate-400 font-medium italic">Aucun rendez-vous pour cette période</div>
                ) : (
                    displayAppointments.map((a, i) => (
                        <div key={i} className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow cursor-pointer" onClick={() => onViewDetails(a.store)}>
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-lg text-slate-900 dark:text-white leading-tight">{a.store.Magazin}</h3>
                                <span className="text-[10px] font-black px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded-full uppercase font-bold">
                                    {a.date.toLocaleDateString('fr-FR', { weekday: 'short' })}
                                </span>
                            </div>
                            <p className="text-blue-600 dark:text-blue-400 font-black">{a.date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}</p>
                            
                            <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700 flex justify-between items-end">
                                <div className="flex flex-col">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest font-bold">{a.city}</span>
                                    <div className="flex gap-2 mt-3">
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); handleEditClick(a.store); }} 
                                            className="p-2 text-amber-600 bg-amber-50 dark:bg-amber-900/20 rounded-lg hover:bg-amber-100 shadow-sm"
                                            title="Modifier le RDV"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={(e) => { e.stopPropagation(); setAppointmentToDelete(a.store); }} 
                                            className="p-2 text-red-600 bg-red-50 dark:bg-red-900/20 rounded-lg hover:bg-red-100 shadow-sm"
                                            title="Supprimer le RDV"
                                        >
                                            <DeleteIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://www.google.com/maps?q=${a.store.Localisation || a.store.Ville}`, '_blank'); }} className="p-2 bg-purple-50 text-purple-600 rounded-xl shadow-sm"><LocationMarkerIcon className="w-4 h-4" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${a.store.GSM1}`, '_blank'); }} className="p-2 bg-green-50 text-green-600 rounded-xl shadow-sm"><WhatsAppIcon className="w-4 h-4 fill-current" /></button>
                                    <button onClick={(e) => { e.stopPropagation(); window.location.href=`tel:${a.store.GSM1}`; }} className="p-2 bg-blue-50 text-blue-600 rounded-xl shadow-sm"><PhoneCallIcon className="w-4 h-4" /></button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </main>
            <NewAppointmentModal isOpen={isNewAppointmentModalOpen} onClose={() => setIsNewAppointmentModalOpen(false)} onSave={handleSaveAppointment} />
            <QuickLogModal isOpen={isQuickLogModalOpen} onClose={() => setIsQuickLogModalOpen(false)} onSave={handleSaveQuickLog} />
            <EditVisitModal isOpen={isEditVisitModalOpen} onClose={() => setIsEditVisitModalOpen(false)} visit={appointmentToEdit} onSave={handleEditSave} />
            
            <ConfirmationModal 
                isOpen={!!appointmentToDelete} 
                onClose={() => setAppointmentToDelete(null)} 
                onConfirm={handleDeleteAppointment} 
                title="Supprimer le RDV" 
                message="Êtes-vous sûr de vouloir supprimer ce rendez-vous ?" 
                confirmText={isActionInProgress ? "Suppression..." : "Supprimer"} 
            />
        </div>
    );
  }

  return (
    <div className="bg-[#F7F8FA] dark:bg-slate-900 min-h-screen p-8 space-y-8 animate-in fade-in duration-500">
      <div className="mb-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
              <button className="hover:text-blue-600 flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18"></path>
                  </svg> 
                  Calendrier
              </button>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Planning des Rendez-vous</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
              <span className="font-semibold text-slate-900 dark:text-white">{allAppointments.length}</span> rendez-vous programmés au total.
          </p>
      </div>

      <div className="mb-8 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col md:flex-row gap-3 items-center">
        <div className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300 mr-2">
          <FilterIcon className="w-4 h-4" /> 
          Filtres:
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full md:w-auto flex-1">
          <select 
            value={filterUser} 
            onChange={(e) => setFilterUser(e.target.value)}
            className="w-full text-sm border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none cursor-pointer"
          >
            <option value="all">Tous les utilisateurs</option>
            {users.map(u => <option key={u} value={u}>{u}</option>)}
          </select>
          <select 
            value={filterCity} 
            onChange={(e) => setFilterCity(e.target.value)}
            className="w-full text-sm border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none cursor-pointer"
          >
            <option value="all">Toutes les villes</option>
            {cities.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <select 
            value={timeFilter} 
            onChange={(e) => setTimeFilter(e.target.value as TimePeriod)}
            className="w-full text-sm border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-700 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-500 dark:text-white appearance-none cursor-pointer"
          >
            <option value="all">Toutes les dates</option>
            <option value="today">Aujourd'hui</option>
            <option value="thisWeek">Cette semaine</option>
            <option value="nextWeek">Semaine prochaine</option>
            <option value="thisMonth">Ce mois</option>
          </select>
        </div>
        {isActionInProgress && <div className="flex items-center gap-2 text-blue-600 text-xs font-bold px-4"><SpinnerIcon className="w-4 h-4 animate-spin" /> Actualisation...</div>}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 pb-10">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 flex-1 min-w-[300px]">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                        {formattedMonthYear}
                    </h2>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => changeMonth(-1)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500"
                    >
                        <ChevronLeftIcon className="w-5 h-5" />
                    </button>
                    <button 
                        onClick={() => changeMonth(1)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-500"
                    >
                        <ChevronRightIcon className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-y-4 text-center">
                {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(d => (
                    <div key={d} className="text-xs font-semibold text-slate-400 mb-2">{d}</div>
                ))}
                
                {calendarDays.map((dayData, idx) => {
                    const isSelected = selectedDate.getDate() === dayData.day && 
                                     selectedDate.getMonth() === dayData.date.getMonth() && 
                                     selectedDate.getFullYear() === dayData.date.getFullYear();
                    
                    const btnClass = isSelected
                        ? "bg-green-400 text-white font-bold shadow-md shadow-green-200 dark:shadow-none"
                        : dayData.isCurrentMonth
                            ? "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700"
                            : "text-slate-300 dark:text-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700";

                    return (
                        <div key={idx} className="flex flex-col items-center justify-center">
                            <button 
                                onClick={() => {
                                    setSelectedDate(dayData.date);
                                    setTimeFilter('calendar');
                                }}
                                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm transition-all ${btnClass}`}
                            >
                                {dayData.day}
                            </button>
                            {dayData.hasAppt && (
                                <div className="flex gap-0.5 mt-1">
                                    <span className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-green-400'}`}></span>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 w-full lg:w-[400px] flex flex-col h-full min-h-[600px]">
            <div className="mb-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white capitalize">
                    {getTimeFilterLabel()}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                    {displayAppointments.length} {displayAppointments.length > 1 ? 'Rendez-vous' : 'Rendez-vous'} {timeFilter === 'today' ? "aujourd'hui" : 'sur cette période'}
                </p>
            </div>

            <div className="flex-1 overflow-y-auto space-y-0 relative custom-scrollbar">
                {displayAppointments.length > 0 && (
                   <div className="absolute left-[26px] top-4 bottom-4 w-px bg-slate-200 dark:bg-slate-700 z-0"></div>
                )}
                
                {displayAppointments.map((appt, i) => (
                    <div key={i} className="relative z-10 flex gap-4 pb-6 last:pb-0 group animate-in fade-in slide-in-from-left-2 duration-300">
                        <div className="flex-shrink-0 mt-1">
                            <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-sm bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                                <UsersIcon className="w-6 h-6" />
                            </div>
                        </div>
                        
                        <div 
                          className="flex-1 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 p-3 rounded-xl hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => onViewDetails(appt.store)}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h3 className="font-bold text-slate-800 dark:text-white text-sm line-clamp-1 uppercase tracking-tight">
                                  {appt.store.Magazin}
                                </h3>
                                <div className="flex gap-1">
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); handleEditClick(appt.store); }} 
                                        className="text-slate-400 hover:text-amber-500 p-1"
                                    >
                                        <EditIcon className="w-4 h-4" />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setAppointmentToDelete(appt.store); }} 
                                        className="text-slate-400 hover:text-red-500 p-1"
                                    >
                                        <DeleteIcon className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                            
                            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mb-2">
                                <ClockIcon className="w-3.5 h-3.5 text-slate-400" />
                                {appt.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                            </p>
                            
                            <div className="flex items-center gap-2">
                                <div className="flex -space-x-2">
                                    <img 
                                      className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800" 
                                      alt="User" 
                                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(appt.user)}&background=random&color=fff&size=64`}
                                      title={appt.user}
                                    />
                                    <img 
                                      className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800" 
                                      alt="Client" 
                                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(appt.store['Le Gérant'] || 'C')}&background=random&color=fff`}
                                      title={appt.store['Le Gérant']}
                                    />
                                </div>
                                <span className="text-[10px] text-slate-400 font-medium px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-full">
                                  {appt.city}
                                </span>
                            </div>
                        </div>
                    </div>
                ))}

                {displayAppointments.length === 0 && (
                    <div className="text-center py-20 text-slate-400 font-medium italic text-xs">
                      Aucun rendez-vous trouvé.
                    </div>
                )}
            </div>

            <div className="flex gap-3 mt-6">
                <button 
                    onClick={() => setIsQuickLogModalOpen(true)}
                    style={{ backgroundColor: 'rgb(220, 252, 231)' }}
                    className="flex-1 py-3 text-green-800 font-bold rounded-xl shadow-sm border border-green-200 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                >
                    <ClipboardDocumentCheckIcon className="w-5 h-5 text-green-600" />
                    Contact
                </button>
                <button 
                    onClick={() => setIsNewAppointmentModalOpen(true)}
                    className="flex-[1.5] py-3 bg-[#4ade80] hover:bg-[#42ce77] text-white font-bold rounded-xl shadow-lg shadow-green-200 dark:shadow-none flex items-center justify-center gap-2 transition-colors active:scale-[0.98]"
                >
                    <PlusIcon className="w-5 h-5 stroke-[3px]" />
                    New RDV
                </button>
            </div>
        </div>
      </div>

      <NewAppointmentModal 
        isOpen={isNewAppointmentModalOpen} 
        onClose={() => setIsNewAppointmentModalOpen(false)} 
        onSave={handleSaveAppointment} 
      />
      <QuickLogModal 
        isOpen={isQuickLogModalOpen} 
        onClose={() => setIsQuickLogModalOpen(false)} 
        onSave={handleSaveQuickLog} 
      />
      <EditVisitModal 
        isOpen={isEditVisitModalOpen} 
        onClose={() => setIsEditVisitModalOpen(false)} 
        visit={appointmentToEdit} 
        onSave={handleEditSave} 
      />
      <ConfirmationModal 
        isOpen={!!appointmentToDelete} 
        onClose={() => setAppointmentToDelete(null)} 
        onConfirm={handleDeleteAppointment} 
        title="Supprimer le RDV" 
        message="Êtes-vous sûr de vouloir supprimer ce rendez-vous ?" 
        confirmText={isActionInProgress ? "Suppression..." : "Supprimer"} 
      />
    </div>
  );
};

export default AppointmentsPage;
