
import React, { useState, useRef } from 'react';
import { AppSettings } from '../types.ts';
import settingsService from '../services/settingsService.ts';
import storeService from '../services/storeService.ts';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import CheckIcon from './icons/CheckIcon.tsx';
import PaintBrushIcon from './icons/PaintBrushIcon.tsx';
import DocumentTextIcon from './icons/DocumentTextIcon.tsx';

const InfoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm8.706-1.442c1.146-.573 2.437.463 2.126 1.706l-.709 2.836c-.149.598.013 1.146.467 1.442a.75.75 0 0 1-.813 1.26c-1.146.573-2.437-.463-2.126-1.706l.709-2.836c.149-.598-.013-1.146-.467-1.442a.75.75 0 0 1 1.813-1.26zM12 7a1 1 0 110 2 1 1 0 010-2z" clipRule="evenodd" />
  </svg>
);

const PhotoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" {...props}>
    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 1 1.5 18V6zM3 16.06V18c0 .414.336.75.75.75h16.5A.75.75 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0z" clipRule="evenodd" />
  </svg>
);

const DatabaseIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75m-16.5-3.75v3.75m16.5 0v3.75m-16.5-3.75v3.75" />
  </svg>
);

const CloudArrowDownIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75v6.75m0 0-3-3m3 3 3-3m-8.25 6a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.233-2.33 3 3 0 0 1 3.758 3.848A3.752 3.752 0 0 1 18 19.5H6.75Z" />
    </svg>
);

interface WhiteLabelPageProps {
    appSettings: AppSettings | null;
    onClose: () => void;
    setAccentColor: (color: string) => void;
    onSync?: () => Promise<void>;
}

const WhiteLabelPage: React.FC<WhiteLabelPageProps> = ({ appSettings, onClose, setAccentColor, onSync }) => {
    const [customSettings, setCustomSettings] = useState<AppSettings>(appSettings || settingsService.getDefaultSettings());
    const [isSaving, setIsSaving] = useState(false);
    const [isImporting, setIsImporting] = useState<string | null>(null);
    const fileInputRef = useRef<Record<string, HTMLInputElement | null>>({});
    const jsonInputRef = useRef<Record<string, HTMLInputElement | null>>({});

    const handleAppSettChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setCustomSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleImageUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const result = ev.target?.result;
                if (typeof result === 'string') {
                    setCustomSettings(prev => ({ ...prev, [key]: result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveAll = async () => {
        setIsSaving(true);
        try {
            await settingsService.updateSettings(customSettings);
            settingsService.applySettings(customSettings);
            setAccentColor(customSettings.accent_color);
            alert("Configuration enregistrée avec succès.");
            onClose();
        } catch (e: any) {
            console.error(e);
            alert(`Erreur lors de l'enregistrement: ${e.message || "Une erreur inconnue est survenue."}`);
        } finally {
            setIsSaving(false);
        }
    };

    const handleImportJSON = async (type: 'customers' | 'visits', e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsImporting(type);
        try {
            const text = await file.text();
            const data = JSON.parse(text);
            
            let count = 0;
            if (type === 'customers') {
                count = await storeService.bulkImportCustomers(data);
            } else {
                count = await storeService.bulkImportVisits(data);
            }
            
            alert(`Importation de ${count} éléments réussie !`);
            
            if (onSync) await onSync();
            
        } catch (err: any) {
            console.error(err);
            alert(`Erreur d'importation: ${err.message || 'Format JSON invalide أو erreur serveur'}`);
        } finally {
            setIsImporting(null);
            if (e.target) e.target.value = '';
        }
    };

    const handleExportJSON = async (type: 'customers' | 'visits') => {
        try {
            const data = type === 'customers' ? await storeService.exportCustomers() : await storeService.exportVisits();
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `export_${type}_${new Date().toISOString().split('T')[0]}.json`);
            link.click();
        } catch (err: any) {
            console.error(err);
            alert(`Erreur lors de l'exportation: ${err.message || "Erreur inconnue"}`);
        }
    };

    return (
        <div className="bg-[#0f172a] min-h-screen text-slate-300 font-sans pb-32">
            <header className="px-8 py-6 flex items-center justify-between border-b border-slate-800 sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-30">
                <div className="flex flex-col">
                    <h1 className="text-2xl font-bold text-white tracking-tight">System Configuration</h1>
                    <p className="text-xs text-slate-500 font-medium italic">Gérez l'identité et les pipelines de données JSON.</p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-semibold text-slate-400 hover:text-white transition-colors border border-slate-800 rounded-lg">Annuler</button>
                    <button onClick={handleSaveAll} disabled={isSaving} className="px-5 py-2 text-sm font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-lg shadow-lg flex items-center gap-2 transition-all disabled:opacity-50">
                        {isSaving ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />}
                        Sauvegarder
                    </button>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-8 space-y-12">
                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <DatabaseIcon className="w-6 h-6 text-emerald-400" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Data Pipeline (JSON Only)</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                    Base الزبناء (Clients)
                                </h3>
                                <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">Master Data</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">Importez massivement vos prospects. Le système utilise le nom et la ville pour éviter les doublons.</p>
                            
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button 
                                    onClick={() => jsonInputRef.current['cust']?.click()}
                                    disabled={!!isImporting}
                                    className="flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                                >
                                    {isImporting === 'customers' ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <CloudArrowDownIcon className="w-4 h-4" />}
                                    Importer JSON
                                </button>
                                <button 
                                    onClick={() => handleExportJSON('customers')}
                                    className="flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-700 hover:border-sky-500/50 rounded-xl text-xs font-bold text-white transition-all"
                                >
                                    <DocumentTextIcon className="w-4 h-4" />
                                    Exporter JSON
                                </button>
                                <input type="file" ref={el => jsonInputRef.current['cust'] = el} className="hidden" accept=".json" onChange={(e) => handleImportJSON('customers', e)} />
                            </div>
                        </div>

                        <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="font-bold text-white flex items-center gap-2">
                                    <div className="w-2 h-2 bg-sky-500 rounded-full"></div>
                                    Base الزيارات (Visites)
                                </h3>
                                <span className="text-[10px] font-black bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded border border-sky-500/20 uppercase">Event Data</span>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed">Historique des suivis. Attention : Chaque visite doit contenir un `customer_id` valide pour être liée.</p>
                            
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                <button 
                                    onClick={() => jsonInputRef.current['visit']?.click()}
                                    disabled={!!isImporting}
                                    className="flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-700 hover:border-sky-500/50 rounded-xl text-xs font-bold text-white transition-all disabled:opacity-50"
                                >
                                    {isImporting === 'visits' ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <CloudArrowDownIcon className="w-4 h-4" />}
                                    Importer JSON
                                </button>
                                <button 
                                    onClick={() => handleExportJSON('visits')}
                                    className="flex items-center justify-center gap-2 py-3 bg-slate-900 border border-slate-700 hover:border-emerald-500/50 rounded-xl text-xs font-bold text-white transition-all"
                                >
                                    <DocumentTextIcon className="w-4 h-4" />
                                    Exporter JSON
                                </button>
                                <input type="file" ref={el => jsonInputRef.current['visit'] = el} className="hidden" accept=".json" onChange={(e) => handleImportJSON('visits', e)} />
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-blue-900/20 border border-blue-800/30 rounded-xl">
                        <InfoIcon className="w-4 h-4 text-blue-400" />
                        <p className="text-[11px] text-blue-300 font-medium">Format de fichier supporté : JSON Array of Objects. Voir la documentation pour les schémas requis.</p>
                    </div>
                </section>

                <section>
                    <div className="flex items-center gap-3 mb-6">
                        <PaintBrushIcon className="w-6 h-6 text-sky-400" />
                        <h2 className="text-xl font-bold text-white uppercase tracking-wider">Identité Visuelle</h2>
                    </div>
                    <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8 space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">App Identity</label>
                                <input name="app_name" value={customSettings.app_name} onChange={handleAppSettChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-sky-500 outline-none" placeholder="App Full Name" />
                                <input name="short_name" value={customSettings.short_name} onChange={handleAppSettChange} className="w-full bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white focus:ring-1 focus:ring-sky-500 outline-none" placeholder="Short Name" />
                            </div>
                            <div className="space-y-4">
                                <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500 ml-1">Accent Color</label>
                                <div className="flex items-center gap-4">
                                    <input type="color" name="accent_color" value={customSettings.accent_color} onChange={handleAppSettChange} className="w-12 h-12 bg-transparent border-none cursor-pointer" />
                                    <input name="accent_color" value={customSettings.accent_color} onChange={handleAppSettChange} className="flex-1 bg-slate-900/50 border border-slate-700 rounded-xl py-3 px-4 text-white font-mono" />
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-8">
                    <h3 className="font-bold text-white mb-6">Icons & PWA Graphics</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            { label: 'Favicon', key: 'favicon_url' },
                            { label: 'Icon 192', key: 'icon_192_url' },
                            { label: 'Icon 512', key: 'icon_512_url' },
                            { label: 'Splash Screen', key: 'splash_url' }
                        ].map(asset => (
                            <div key={asset.key} className="space-y-3">
                                <p className="text-[10px] font-bold text-slate-500 uppercase text-center">{asset.label}</p>
                                <div onClick={() => fileInputRef.current[asset.key]?.click()} className="aspect-square bg-slate-900/50 border-2 border-dashed border-slate-700 rounded-2xl flex items-center justify-center cursor-pointer hover:border-sky-500 transition-all overflow-hidden p-4">
                                    {(customSettings as any)[asset.key] ? <img src={(customSettings as any)[asset.key]} className="w-full h-full object-contain" /> : <PhotoIcon className="w-8 h-8 text-slate-700" />}
                                </div>
                                <input type="file" ref={el => fileInputRef.current[asset.key] = el} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(asset.key, e)} />
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default WhiteLabelPage;
