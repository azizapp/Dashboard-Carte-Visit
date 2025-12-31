import React, { useState, useRef } from 'react';
import { AppSettings } from '../types.ts';
import settingsService from '../services/settingsService.ts';
import { updateSupabaseConfig } from '../services/supabase.ts';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import CheckIcon from './icons/CheckIcon.tsx';
import GlobeAltIcon from './icons/GlobeAltIcon.tsx'; 
import KeyIcon from './icons/KeyIcon.tsx'; 
import PaintBrushIcon from './icons/PaintBrushIcon.tsx';
// FIX: Added missing import for ArrowPathIcon used in the DB Maintenance section.
import ArrowPathIcon from './icons/ArrowPathIcon.tsx';

// Icons
const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836c-.149.598.013 1.146.467 1.442a.75.75 0 0 1-.813 1.26c-1.146.573-2.437-.463-2.126-1.706l.709-2.836c.149-.598-.013-1.146-.467-1.442a.75.75 0 0 1 1.813-1.26zM12 7a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
  </svg>
);

const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 012.25-2.25h16.5A2.25 2.25 0 0122.5 6v12a2.25 2.25 0 01-2.25 2.25H3.75A2.25 2.25 0 011.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0021 18v-1.94l-2.69-2.689a1.5 1.5 0 00-2.12 0l-.88.879.97.97a.75.75 0 11-1.06 1.06l-5.16-5.159a1.5 1.5 0 00-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 112.25 0 1.125 1.125 0 01-2.25 0z" clipRule="evenodd" />
  </svg>
);

const EyeIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const BriefcaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M7.5 6v.75H4.125a3 3 0 00-3 3v7.5a3 3 0 003 3h15.75a3 3 0 003-3v-7.5a3 3 0 00-3-3H16.5V6a3.75 3.75 0 10-7.5 0zM15 6.75V6a2.25 2.25 0 00-4.5 0v.75h4.5zM3.75 10.5h16.5a1.5 1.5 0 011.5 1.5v2.625M3.75 10.5A1.5 1.5 0 002.25 12v2.625m1.5-4.125h16.5V14.25m-16.5 0h16.5v3.75a1.5 1.5 0 01-1.5 1.5H3.75a1.5 1.5 0 01-1.5-1.5v-3.75h16.5z" clipRule="evenodd" />
  </svg>
);

const LinkIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
  </svg>
);

const UploadIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
  </svg>
);

const ShieldExclamationIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Zm0 13.036h.008v.008H12v-.008Z" />
    </svg>
);

interface WhiteLabelPageProps {
    appSettings: AppSettings | null;
    onClose: () => void;
    setAccentColor: (color: string) => void;
}

const WhiteLabelPage: React.FC<WhiteLabelPageProps> = ({ appSettings, onClose, setAccentColor }) => {
    const [customSettings, setCustomSettings] = useState<AppSettings>(appSettings || settingsService.getDefaultSettings());
    const [isSaving, setIsSaving] = useState(false);
    const [copiedSql, setCopiedSql] = useState(false);
    const fileInputRef = useRef<Record<string, HTMLInputElement | null>>({});

    const [sbUrl, setSbUrl] = useState(localStorage.getItem('supabase_url') || '');
    const [sbKey, setSbKey] = useState(localStorage.getItem('supabase_key') || '');
    const [showKey, setShowKey] = useState(false);

    const missingColumnSql = `ALTER TABLE app_settings ADD COLUMN IF NOT EXISTS splash_url TEXT;`;

    const handleAppSettChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            if (sbUrl !== localStorage.getItem('supabase_url') || sbKey !== localStorage.getItem('supabase_key')) {
              updateSupabaseConfig(sbUrl, sbKey);
            }
            
            await settingsService.updateSettings(customSettings);
            settingsService.applySettings(customSettings);
            setAccentColor(customSettings.accent_color);
            
            alert("Configuration enregistrée avec succès. L'application va s'actualiser.");
            window.location.reload();
        } catch (e: any) {
            console.error(e);
            if (e.message?.includes('splash_url')) {
                alert("Erreur: La colonne 'splash_url' semble manquer dans votre table Supabase. Utilisez le bouton 'Réparer la DB' en bas de page.");
            } else {
                alert("Erreur lors de l'enregistrement. Vérifiez votre console et votre structure Supabase.");
            }
        } finally {
            setIsSaving(false);
        }
    };

    const copySql = () => {
        navigator.clipboard.writeText(missingColumnSql);
        setCopiedSql(true);
        setTimeout(() => setCopiedSql(false), 3000);
    };

    return (
        <div className="bg-[#0f172a] min-h-screen text-slate-300 font-sans pb-32">
            {/* Header */}
            <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-30">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Configuration</h1>
                    <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                            <span className="text-xs font-medium text-slate-400">System Online</span>
                        </div>
                        <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
                        <span className="text-xs font-medium text-slate-400">Global Settings</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button 
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors border border-slate-800 rounded-lg hover:bg-slate-800"
                    >
                        Discard
                    </button>
                    <button 
                        onClick={handleSaveAll}
                        disabled={isSaving}
                        className="px-5 py-2 text-sm font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-lg shadow-lg shadow-sky-500/20 flex items-center gap-2 transition-all disabled:opacity-50"
                    >
                        {isSaving ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                        Save Changes
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-8 space-y-10">
                
                {/* Section: Application Details */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <InfoIcon className="w-5 h-5 text-sky-400" />
                        <h2 className="text-lg font-bold text-white">Application Details</h2>
                    </div>
                    
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 space-y-8 shadow-xl">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <div className="space-y-2 lg:col-span-1">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Application Name</label>
                                <div className="relative group">
                                    <BriefcaseIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                    <input 
                                        name="app_name" 
                                        value={customSettings.app_name} 
                                        onChange={handleAppSettChange} 
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-700" 
                                        placeholder="e.g. Apollo Eyewear CRM"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2 lg:col-span-1">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Short Name</label>
                                <div className="relative group">
                                    <TagIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                    <input 
                                        name="short_name" 
                                        value={customSettings.short_name} 
                                        onChange={handleAppSettChange} 
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all placeholder:text-slate-700" 
                                        placeholder="e.g. Apollo"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-2 lg:col-span-1">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Project URL</label>
                                <div className="relative group">
                                    <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                    <input 
                                        value={sbUrl} 
                                        onChange={(e) => setSbUrl(e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all font-mono text-sm placeholder:text-slate-700" 
                                        placeholder="https://your-project.supabase.co"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">API Key (Anonymous Key)</label>
                            <div className="relative group">
                                <KeyIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500 group-focus-within:text-sky-400 transition-colors" />
                                <input 
                                    type={showKey ? "text" : "password"}
                                    value={sbKey} 
                                    onChange={(e) => setSbKey(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-white focus:ring-1 focus:ring-sky-500 focus:border-sky-500 outline-none transition-all font-mono text-sm" 
                                    placeholder="••••••••••••••••••••••••••••••••"
                                />
                                <button 
                                    onClick={() => setShowKey(!showKey)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-500 hover:text-white transition-colors"
                                >
                                    <EyeIcon className="w-5 h-5" />
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-600 ml-1">Public key for client-side API requests.</p>
                        </div>
                    </div>
                </section>

                {/* Section: Branding & Theme */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <PaintBrushIcon className="w-5 h-5 text-sky-400" />
                        <h2 className="text-lg font-bold text-white">Branding & Theme</h2>
                    </div>
                    
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
                        <div className="space-y-4">
                            <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Main Theme Color</label>
                            <div className="flex items-center gap-4 max-w-sm">
                                <input 
                                    type="color" 
                                    name="accent_color" 
                                    value={customSettings.accent_color} 
                                    onChange={handleAppSettChange} 
                                    className="w-14 h-14 bg-transparent border-none rounded-lg cursor-pointer overflow-hidden"
                                />
                                <div className="flex-1 relative">
                                    <input 
                                        name="accent_color" 
                                        value={customSettings.accent_color.toUpperCase()} 
                                        onChange={handleAppSettChange}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3.5 px-4 text-white font-mono uppercase focus:ring-1 focus:ring-sky-500 outline-none"
                                    />
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-600 ml-1">Primary color used for buttons, links, and accents.</p>
                        </div>
                    </div>
                </section>

                {/* Section: Site Assets & Icons */}
                <section>
                    <div className="flex items-center gap-2 mb-6">
                        <PhotoIcon className="w-5 h-5 text-sky-400" />
                        <h2 className="text-lg font-bold text-white">Site Assets & Icons</h2>
                    </div>
                    
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 shadow-xl">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[
                                { label: 'Favicon', key: 'favicon_url', size: '32×32' },
                                { label: 'Mobile Icon', key: 'icon_192_url', size: '180×180' },
                                { label: 'PWA Manifest', key: 'icon_512_url', size: '512×512' },
                                { label: 'Splash Screen', key: 'splash_url', size: '2048×2732' }
                            ].map(asset => (
                                <div key={asset.key} className="space-y-3">
                                    <div className="flex items-center justify-between px-1">
                                        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-tighter">{asset.label}</label>
                                        <span className="text-[9px] bg-slate-900 text-slate-500 px-1.5 py-0.5 rounded font-mono border border-slate-700">{asset.size}</span>
                                    </div>
                                    
                                    <div 
                                        onClick={() => fileInputRef.current[asset.key]?.click()}
                                        className="group relative aspect-square rounded-2xl bg-slate-900/50 border-2 border-dashed border-slate-700 hover:border-sky-500/50 hover:bg-slate-800 transition-all flex flex-col items-center justify-center cursor-pointer overflow-hidden shadow-inner"
                                    >
                                        {(customSettings as any)[asset.key] ? (
                                            <>
                                              <img src={(customSettings as any)[asset.key]} className="w-full h-full object-contain p-6" alt={asset.label} />
                                              <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-2 transition-opacity backdrop-blur-[2px]">
                                                  <UploadIcon className="w-6 h-6 text-white" />
                                                  <span className="text-[10px] font-bold text-white uppercase tracking-widest">Change</span>
                                              </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-3 text-slate-600 group-hover:text-slate-400 transition-colors text-center px-4">
                                                <UploadIcon className="w-8 h-8" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">Click to upload<br/>{asset.size}</span>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            ref={el => { fileInputRef.current[asset.key] = el; }} 
                                            className="hidden" 
                                            accept="image/*" 
                                            onChange={(e) => handleImageUpload(asset.key, e)} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Section: DB Maintenance Help */}
                <section>
                    <div className="bg-amber-900/20 border border-amber-500/30 rounded-2xl p-6 flex flex-col md:flex-row items-center gap-6 shadow-lg">
                        <div className="w-14 h-14 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <ShieldExclamationIcon className="w-8 h-8 text-amber-500" />
                        </div>
                        <div className="flex-1 text-center md:text-left">
                            <h3 className="text-lg font-bold text-amber-400 mb-1">Database Sync Check</h3>
                            <p className="text-sm text-amber-200/70 leading-relaxed">
                                If you receive an error about <b>"splash_url"</b> when saving, run this SQL command in your Supabase SQL Editor to add the missing column.
                            </p>
                        </div>
                        <button 
                            onClick={copySql}
                            className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 flex-shrink-0 ${copiedSql ? 'bg-emerald-600 text-white' : 'bg-amber-600 hover:bg-amber-500 text-white shadow-lg shadow-amber-900/20'}`}
                        >
                            {copiedSql ? <CheckIcon className="w-4 h-4" /> : <ArrowPathIcon className="w-4 h-4" />}
                            {copiedSql ? "Command Copied!" : "Fix Missing Column SQL"}
                        </button>
                    </div>
                </section>
            </main>
        </div>
    );
};

const TagIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
    </svg>
);

export default WhiteLabelPage;