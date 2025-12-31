
import React, { useState, useRef } from 'react';
import { AppSettings } from '../types.ts';
import settingsService from '../services/settingsService.ts';
import { updateSupabaseConfig } from '../services/supabase.ts';
import SparklesIcon from './icons/SparklesIcon.tsx';
import StoreIcon from './icons/StoreIcon.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import CheckIcon from './icons/CheckIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
// FIX: Imported missing ArrowPathIcon component to resolve compilation error on line 201.
import ArrowPathIcon from './icons/ArrowPathIcon.tsx';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);

interface WhiteLabelPageProps {
    appSettings: AppSettings | null;
    onClose: () => void;
    setAccentColor: (color: string) => void;
}

const WhiteLabelPage: React.FC<WhiteLabelPageProps> = ({ appSettings, onClose, setAccentColor }) => {
    // Branding States
    const [customSettings, setCustomSettings] = useState<AppSettings>(appSettings || settingsService.getDefaultSettings());
    const [isSavingBranding, setIsSavingBranding] = useState(false);
    const fileInputRef = useRef<Record<string, HTMLInputElement | null>>({});

    // Supabase States
    const [sbUrl, setSbUrl] = useState(localStorage.getItem('supabase_url') || '');
    const [sbKey, setSbKey] = useState(localStorage.getItem('supabase_key') || '');
    const [isSavingConn, setIsSavingConn] = useState(false);

    const handleAppSettChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setCustomSettings(prev => ({ ...prev, [name]: value }));
        if (name === 'accent_color') {
            document.documentElement.style.setProperty('--accent-color', value);
        }
    };

    const handleImageUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const base64 = ev.target?.result as string;
                setCustomSettings(prev => ({ ...prev, [key]: base64 }));
            };
            reader.readAsDataURL(file);
        }
    };

    const saveAppSettings = async () => {
        setIsSavingBranding(true);
        try {
            await settingsService.updateSettings(customSettings);
            settingsService.applySettings(customSettings);
            setAccentColor(customSettings.accent_color);
            alert("Identité visuelle mise à jour avec succès !");
        } catch (e) {
            alert("Erreur lors de la mise à jour");
        } finally {
            setIsSavingBranding(false);
        }
    };

    const saveSupabaseConfig = () => {
        setIsSavingConn(true);
        try {
            updateSupabaseConfig(sbUrl, sbKey);
            alert("Configuration Supabase mise à jour. L'application va redémarrer.");
            window.location.reload();
        } catch (e) {
            alert("Erreur de configuration");
        } finally {
            setIsSavingConn(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] dark:bg-slate-900 min-h-screen pb-20">
            <header className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Configuration du Système</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">White-Label & Infrastructure</p>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto p-6 space-y-8">
                {/* Section 1: Personnalisation White-Label */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-slate-800 dark:to-slate-800">
                         <div className="p-2 bg-accent rounded-lg text-white"><SparklesIcon className="w-5 h-5" /></div>
                         <h2 className="text-lg font-bold text-slate-800 dark:text-white">Identité Visuelle</h2>
                    </div>
                    
                    <div className="p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nom de l'application</label>
                                <input name="app_name" value={customSettings.app_name} onChange={handleAppSettChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 dark:border-slate-600 outline-none font-bold dark:text-white focus:ring-2 focus:ring-accent/20" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Nom court (Icône Mobile)</label>
                                <input name="short_name" value={customSettings.short_name} onChange={handleAppSettChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 dark:border-slate-600 outline-none font-bold dark:text-white focus:ring-2 focus:ring-accent/20" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            {[
                                { label: 'Favicon (Onglet)', key: 'favicon_url' },
                                { label: 'Icône PWA (192px)', key: 'icon_192_url' },
                                { label: 'Splash (512px)', key: 'icon_512_url' }
                            ].map(img => (
                                <div key={img.key}>
                                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-3">{img.label}</label>
                                    <div className="relative group aspect-square rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-600 overflow-hidden">
                                        {(customSettings as any)[img.key] ? (
                                            <img src={(customSettings as any)[img.key]} className="w-full h-full object-contain p-4" />
                                        ) : (
                                            <StoreIcon className="w-10 h-10 text-slate-300" />
                                        )}
                                        <button onClick={() => fileInputRef.current[img.key]?.click()} className="absolute inset-0 bg-accent/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all backdrop-blur-sm">Changer</button>
                                        <input type="file" ref={el => { fileInputRef.current[img.key] = el; }} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(img.key, e)} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-4">Couleur Principale du Thème</label>
                            <div className="flex items-center gap-6">
                                <div className="relative">
                                    <input 
                                        type="color" 
                                        name="accent_color" 
                                        value={customSettings.accent_color} 
                                        onChange={handleAppSettChange} 
                                        className="w-20 h-20 rounded-2xl cursor-pointer bg-white dark:bg-slate-800 p-1 shadow-sm border border-slate-200" 
                                    />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1">Code Couleur: <span className="font-mono text-accent">{customSettings.accent_color.toUpperCase()}</span></p>
                                    <p className="text-xs text-slate-400 leading-relaxed">Appliqué aux boutons et éléments interactifs.</p>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={saveAppSettings}
                            disabled={isSavingBranding}
                            className="w-full py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSavingBranding ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <CheckIcon className="w-5 h-5" />}
                            Enregistrer l'identité visuelle
                        </button>
                    </div>
                </section>

                {/* Section 2: Accès Supabase API */}
                <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-slate-800 dark:to-slate-800">
                         <div className="p-2 bg-emerald-500 rounded-lg text-white"><MapIcon className="w-5 h-5" /></div>
                         <h2 className="text-lg font-bold text-slate-800 dark:text-white">Accès Supabase API</h2>
                    </div>
                    
                    <div className="p-8 space-y-6">
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">URL du Projet</label>
                            <input 
                                type="text" 
                                value={sbUrl} 
                                onChange={(e) => setSbUrl(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 dark:border-slate-600 outline-none font-mono text-xs dark:text-white focus:ring-2 focus:ring-emerald-500/20" 
                                placeholder="https://xyz.supabase.co"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-2">Clé API (Anon Key)</label>
                            <input 
                                type="password" 
                                value={sbKey} 
                                onChange={(e) => setSbKey(e.target.value)} 
                                className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 dark:border-slate-600 outline-none font-mono text-xs dark:text-white focus:ring-2 focus:ring-emerald-500/20" 
                                placeholder="votre_cle_anon_ici"
                            />
                        </div>

                        <button 
                            onClick={saveSupabaseConfig}
                            disabled={isSavingConn}
                            className="w-full py-4 bg-slate-900 dark:bg-slate-700 text-white rounded-2xl font-bold shadow-lg hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                        >
                            {isSavingConn ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <ArrowPathIcon className="w-5 h-5" />}
                            Mettre à jour la connexion
                        </button>
                        <p className="text-center text-[10px] text-slate-400 italic">Attention: Une mauvaise configuration peut rendre l'application inaccessible.</p>
                    </div>
                </section>
            </main>
        </div>
    );
};

export default WhiteLabelPage;
