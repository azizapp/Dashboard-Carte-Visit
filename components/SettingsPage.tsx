
import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import CheckIcon from './icons/CheckIcon.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { Mode } from '../types.ts';
import ArrowPathIcon from './icons/ArrowPathIcon.tsx';
import ModeToggle from './ModeToggle.tsx';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
  </svg>
);

const SignalIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.136 12.006a8.25 8.25 0 0 1 13.728 0M2 8.974a12 12 0 0 1 20 0m-8.254 9.112.022.022L12 21.01l-1.768-1.768a.75.75 0 0 1 1.06-1.06Z" />
    </svg>
);

const accentColors = [
  { name: 'Indigo', value: '#4f46e5' },
  { name: 'Sky', value: '#0ea5e9' },
  { name: 'Rose', value: '#e11d48' },
  { name: 'Emerald', value: '#10b981' },
  { name: 'Amber', value: '#f59e0b' },
];

interface SettingsPageProps {
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
  font: string;
  setFont: (font: string) => void;
  accentColor: string;
  setAccentColor: (color: string) => void;
  onClose: () => void;
  mode: Mode;
  setMode: (mode: Mode) => void;
  isOnline: boolean;
  onRefresh: () => void;
  isLoading: boolean;
  onResetSettings: () => void;
  onLogout: () => void;
}

const SettingsPage: React.FC<SettingsPageProps> = ({ 
  theme, setTheme, font, setFont, accentColor, setAccentColor, onClose, mode, setMode, isOnline, onRefresh, isLoading, onResetSettings, onLogout
}) => {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  return (
    <div className="bg-[#F7F8FA] dark:bg-slate-900 min-h-screen">
      <header className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-100 dark:border-slate-700 p-4 flex items-center justify-center h-[64px] z-20">
        <button type="button" onClick={onClose} className="absolute left-4 p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-full transition-colors">
          <ArrowLeftIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-bold text-slate-900 dark:text-white">Réglages</h1>
      </header>
      
      <main className="max-w-xl mx-auto p-4 space-y-8 pb-20 animate-in fade-in duration-500">
        
        {/* Section: DONNÉES & SYNCHRONISATION */}
        <section className="space-y-2">
          <h2 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-1">Données & Synchronisation</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-50 dark:divide-slate-700">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Mode de stockage</p>
                <p className="text-[12px] text-slate-400 mt-0.5">Test (local) ou Production (en ligne).</p>
              </div>
              <div className="flex items-center gap-3">
                <div className={`flex items-center gap-1.5 text-xs font-bold ${mode === Mode.Production ? 'text-emerald-500' : 'text-slate-300'}`}>
                    <SignalIcon className="w-4 h-4" />
                    <span>Production</span>
                </div>
                <ModeToggle mode={mode} setMode={setMode} />
                <span className={`text-xs font-bold ${mode === Mode.Test ? 'text-[var(--accent-color)]' : 'text-slate-300'}`}>Test</span>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Mise à jour des données</p>
                <p className="text-[12px] text-slate-400 mt-0.5">Forcer la synchronisation avec le serveur.</p>
              </div>
              <button 
                onClick={onRefresh}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-100 dark:border-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
              >
                {isLoading ? <SpinnerIcon className="w-4 h-4 animate-spin text-slate-400" /> : <ArrowPathIcon className="w-4 h-4" />}
                Actualiser
              </button>
            </div>
          </div>
        </section>

        {/* Section: APPARENCE */}
        <section className="space-y-2">
          <h2 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-1">Apparence</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-50 dark:divide-slate-700">
            <div className="p-4 flex items-center justify-between">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Thème</p>
              <ThemeToggle theme={theme} setTheme={setTheme} />
            </div>
            <div className="p-4 space-y-4">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Couleur d'accentuation</p>
              <div className="flex items-center gap-3">
                {accentColors.map(color => (
                  <button 
                    key={color.name} 
                    type="button" 
                    onClick={() => setAccentColor(color.value)} 
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${accentColor === color.value ? 'ring-2 ring-offset-2 ring-slate-400' : ''}`} 
                    style={{ backgroundColor: color.value } as any}
                  >
                    {accentColor === color.value && <CheckIcon className="w-5 h-5 text-white" />}
                  </button>
                ))}
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Police</p>
              <select 
                value={font}
                onChange={(e) => setFont(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-500 dark:text-slate-400 border-none focus:ring-0 outline-none cursor-pointer text-right appearance-none px-2"
              >
                {['Inter', 'Roboto', 'Lato'].map(f => (
                    <option key={f} value={f}>{f}</option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {/* Section: COMPTE */}
        <section className="space-y-2">
          <h2 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-1">Compte</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-50 dark:divide-slate-700">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Se déconnecter</p>
                <p className="text-[12px] text-slate-400 mt-0.5">Vous serez redirigé vers la page de connexion.</p>
              </div>
              <button 
                onClick={onLogout}
                className="px-4 py-2 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-xs font-bold border border-slate-100 dark:border-slate-600 hover:bg-slate-100 transition-colors shadow-sm"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </section>

        {/* Section: GÉNÉRAL */}
        <section className="space-y-2">
          <h2 className="text-[11px] font-bold uppercase text-slate-400 tracking-wider px-1">Général</h2>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden divide-y divide-slate-50 dark:divide-slate-700">
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[14px] font-bold text-slate-800 dark:text-slate-100">Réinitialiser les paramètres</p>
                <p className="text-[12px] text-slate-400 mt-0.5">Restaurer tous les paramètres à leurs valeurs par défaut.</p>
              </div>
              <button 
                onClick={() => setIsResetModalOpen(true)}
                className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-xs font-bold border border-red-100 dark:border-red-900/40 hover:bg-red-100 transition-colors shadow-sm"
              >
                Réinitialiser
              </button>
            </div>
          </div>
        </section>
      </main>
      
      <ConfirmationModal 
        isOpen={isResetModalOpen} 
        onClose={() => setIsResetModalOpen(false)} 
        onConfirm={() => { onResetSettings(); setIsResetModalOpen(false); }} 
        title="Réinitialiser" 
        message="Voulez-vous restaurer les paramètres par défaut ?" 
        confirmText="Réinitialiser" 
      />
    </div>
  );
};

export default SettingsPage;
