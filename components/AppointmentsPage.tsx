
import React, { useMemo } from 'react';
import { Store } from '../types.ts';
import PhoneCallIcon from './icons/PhoneCallIcon.tsx';
import WhatsAppIcon from './icons/WhatsAppIcon.tsx';
import LocationMarkerIcon from './icons/LocationMarkerIcon.tsx';
// Added missing import for CalendarDaysIcon
import CalendarDaysIcon from './icons/CalendarDaysIcon.tsx';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

interface AppointmentsPageProps {
  stores: Store[];
  onClose: () => void;
  onViewDetails: (store: Store) => void;
}

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({ stores, onClose, onViewDetails }) => {
  
  const groupedAppointments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const appointments: { store: Store, date: Date, status: string }[] = [];
    const processed = new Set<string>();

    stores.forEach(store => {
      if (store['Rendez-Vous']) {
        const dateStrings = store['Rendez-Vous'].split(/[\n,]/).map(s => s.trim()).filter(Boolean);
        dateStrings.forEach(dateStr => {
          const apptDate = new Date(dateStr);
          if (!isNaN(apptDate.getTime())) {
            const key = `${store.ID}-${dateStr}`;
            if (!processed.has(key)) {
              let status = 'À VENIR';
              const apptDay = new Date(apptDate);
              apptDay.setHours(0,0,0,0);
              
              if (apptDay.getTime() === today.getTime()) status = 'AUJOURD\'HUI';
              
              appointments.push({ store, date: apptDate, status });
              processed.add(key);
            }
          }
        });
      }
    });

    // Sort by date
    appointments.sort((a, b) => a.date.getTime() - b.date.getTime());

    // Separate today and future
    const todayAppts = appointments.filter(a => a.status === 'AUJOURD\'HUI');
    const futureAppts = appointments.filter(a => a.status === 'À VENIR');

    return { today: todayAppts, future: futureAppts };
  }, [stores]);

  // FIX: Properly typed the local component to avoid TS errors when used in JSX (resolves missing 'key' property error).
  const AppointmentCard: React.FC<{ appt: { store: Store, date: Date } }> = ({ appt }) => (
    <div 
        onClick={() => onViewDetails(appt.store)}
        className="bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 space-y-4 hover:shadow-md transition-shadow cursor-pointer"
    >
        <div className="space-y-1">
            <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">{appt.store.Magazin}</h3>
            <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400 capitalize">
                {appt.date.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
        </div>

        <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-slate-400">
                <span className="text-xs font-medium uppercase tracking-wider">{appt.store.Ville}</span>
            </div>
            
            <div className="flex gap-2">
                <a 
                    /* FIX: Replaced appt.store.GSM with appt.store.GSM1 to match the Store interface. */
                    href={`https://wa.me/${appt.store.GSM1}`} 
                    onClick={e => e.stopPropagation()}
                    className="p-2.5 bg-green-50 dark:bg-green-900/20 text-green-500 rounded-xl hover:scale-110 transition-transform"
                >
                    <WhatsAppIcon className="w-5 h-5" />
                </a>
                <a 
                    /* FIX: Replaced appt.store.GSM with appt.store.GSM1 to match the Store interface. */
                    href={`tel:${appt.store.GSM1}`} 
                    onClick={e => e.stopPropagation()}
                    className="p-2.5 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-xl hover:scale-110 transition-transform"
                >
                    <PhoneCallIcon className="w-5 h-5" />
                </a>
                <a 
                    href={`https://www.google.com/maps?q=${appt.store.Localisation || appt.store.Magazin}`} 
                    onClick={e => e.stopPropagation()}
                    target="_blank"
                    className="p-2.5 bg-purple-50 dark:bg-purple-900/20 text-purple-500 rounded-xl hover:scale-110 transition-transform"
                >
                    <LocationMarkerIcon className="w-5 h-5" />
                </a>
            </div>
        </div>
    </div>
  );

  return (
    <div className="bg-[#F7F8FA] dark:bg-slate-900 min-h-screen">
        <header className="sticky top-0 z-50 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 p-4 flex items-center shadow-sm">
            <button onClick={onClose} className="p-1"><ArrowLeftIcon className="w-6 h-6 text-slate-600 dark:text-slate-300"/></button>
            <h1 className="flex-1 text-center font-bold text-slate-800 dark:text-white">Mes Rendez-vous</h1>
            <div className="w-8"></div>
        </header>

        <main className="p-6 max-w-xl mx-auto space-y-8 pb-20">
            {groupedAppointments.today.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">AUJOURD'HUI</h2>
                    <div className="grid gap-4">
                        {groupedAppointments.today.map((appt, i) => <AppointmentCard key={i} appt={appt} />)}
                    </div>
                </div>
            )}

            {groupedAppointments.future.length > 0 && (
                <div className="space-y-4">
                    <h2 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-2">À VENIR</h2>
                    <div className="grid gap-4">
                        {groupedAppointments.future.map((appt, i) => <AppointmentCard key={i} appt={appt} />)}
                    </div>
                </div>
            )}

            {groupedAppointments.today.length === 0 && groupedAppointments.future.length === 0 && (
                <div className="text-center py-20">
                    <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                        <CalendarDaysIcon className="w-8 h-8" />
                    </div>
                    <p className="text-slate-500 font-medium">Pas de rendez-vous programmé</p>
                </div>
            )}
        </main>
    </div>
  );
};

export default AppointmentsPage;
