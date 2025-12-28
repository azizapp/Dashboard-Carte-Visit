
import React, { useMemo } from 'react';
import { Store } from '../types.ts';

const XMarkIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
  </svg>
);

const CalendarIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18" />
  </svg>
);

interface UpcomingAppointmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stores: Store[];
}

interface Appointment {
  store: Store;
  date: Date;
}

const UpcomingAppointmentsModal: React.FC<UpcomingAppointmentsModalProps> = ({ isOpen, onClose, stores }) => {
  const upcomingAppointments = useMemo((): Appointment[] => {
    if (!stores) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments: Appointment[] = [];
    const processed = new Set<string>(); 

    stores.forEach(store => {
      if (store['Rendez-Vous']) {
        const dateStrings = store['Rendez-Vous'].split(/[\n,]/).map(s => s.trim()).filter(Boolean);
        dateStrings.forEach(dateStr => {
            const appointmentDate = new Date(dateStr);
            if (!isNaN(appointmentDate.getTime()) && appointmentDate >= today) {
                const key = `${store.Magazin}-${dateStr}`;
                if (!processed.has(key)) {
                    appointments.push({ store, date: appointmentDate });
                    processed.add(key);
                }
            }
        });
      }
    });

    appointments.sort((a, b) => a.date.getTime() - b.date.getTime());

    return appointments;
  }, [stores]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60" aria-modal="true" role="dialog" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full m-4" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-start">
            <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900/50 sm:mx-0 sm:h-10 sm:w-10">
              <CalendarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="mt-1 text-center sm:mt-0 sm:ml-4 sm:text-left flex-1">
              <h3 className="text-lg leading-6 font-medium text-slate-900 dark:text-white">Rendez-vous à venir</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">Liste des rendez-vous à venir.</p>
            </div>
             <button onClick={onClose} className="p-1 -mt-1 -mr-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700">
                <XMarkIcon className="w-5 h-5 text-slate-500 dark:text-slate-400" />
             </button>
          </div>
          <div className="mt-4 max-h-80 overflow-y-auto pr-2">
            {upcomingAppointments.length > 0 ? (
              <ul className="space-y-3">
                {upcomingAppointments.map((appt, index) => (
                    <li key={index} className="p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
                       <div>
                         <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm">
                          {appt.store.Magazin}
                        </p>
                        {/* FIX: Replaced appt.store.Gérant with appt.store['Le Gérant'] to match the Store interface. */}
                        <p className="text-sm text-slate-600 dark:text-slate-400">{appt.store['Le Gérant']}</p>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mt-1">
                          {appt.date.toLocaleDateString('fr-CA', { year: 'numeric', month: '2-digit', day: '2-digit' })}
                        </p>
                      </div>
                    </li>
                ))}
              </ul>
            ) : (
              <div className="text-center py-10">
                <CalendarIcon className="mx-auto h-12 w-12 text-slate-400" />
                <h4 className="mt-4 text-sm font-semibold text-slate-800 dark:text-white">Aucun rendez-vous à venir</h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Aucun rendez-vous n'est prévu.</p>
              </div>
            )}
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 sm:px-6 flex justify-end rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="w-full inline-flex justify-center rounded-md border border-slate-300 dark:border-slate-600 shadow-sm px-4 py-2 bg-white dark:bg-slate-700 text-base font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:w-auto sm:text-sm"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpcomingAppointmentsModal;
