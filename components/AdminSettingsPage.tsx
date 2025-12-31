import React, { useState, useEffect, useRef } from 'react';
import ThemeToggle from './ThemeToggle.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import CheckIcon from './icons/CheckIcon.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { Mode, AppSettings, UserProfile } from '../types.ts';
import ArrowPathIcon from './icons/ArrowPathIcon.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import DeleteIcon from './icons/DeleteIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import XMarkIcon from './icons/XMarkIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import CameraIcon from './icons/CameraIcon.tsx';
import StoreIcon from './icons/StoreIcon.tsx';
import SparklesIcon from './icons/SparklesIcon.tsx';
import { authService } from '../services/authService.ts';
import settingsService from '../services/settingsService.ts';
import SignupModal from './SignupModal.tsx';
import { updateSupabaseConfig } from '../services/supabase.ts';

const ArrowLeftIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
    </svg>
);

const UserPlusIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
);

const AdminSettingsPage: React.FC<any> = ({
    userRole, theme, setTheme, font, setFont, fontSize, setFontSize, fontWeight, setFontWeight,
    accentColor, setAccentColor, mode, setMode, onRefresh, isLoading, onClose, onResetSettings, appSettings
}) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [fetchingUsers, setFetchingUsers] = useState(false);

    // Dynamic settings
    const [customSettings, setCustomSettings] = useState<AppSettings>(appSettings || settingsService.getDefaultSettings());
    const [isSavingAppSett, setIsSavingAppSett] = useState(false);
    const fileInputRef = useRef<Record<string, HTMLInputElement | null>>({});

    const isManager = userRole === 'manager';

    useEffect(() => {
        const fetchUsers = async () => {
            setFetchingUsers(true);
            try {
                const data = await authService.getAllUsers();
                setUsers(data);
            } catch (e) { console.error(e); }
            finally { setFetchingUsers(false); }
        };
        fetchUsers();
    }, []);

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        try { 
            await authService.deleteUser(userToDelete); 
            setUserToDelete(null); 
            const data = await authService.getAllUsers();
            setUsers(data);
        } catch (e) { alert("Erreur lors de la suppression"); }
    };

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
        setIsSavingAppSett(true);
        try {
            await settingsService.updateSettings(customSettings);
            settingsService.applySettings(customSettings);
            setAccentColor(customSettings.accent_color);
            alert("Identité visuelle mise à jour avec succès !");
        } catch (e) {
            alert("Erreur lors de la mise à jour");
        } finally {
            setIsSavingAppSett(false);
        }
    };

    return (
        <div className="bg-[#F8FAFC] dark:bg-slate-900 min-h-screen pb-20">
            <header className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between z-20">
                <div className="flex items-center gap-4">
                    <button onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-black text-slate-900 dark:text-white">Réglages Système</h1>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">{userRole} Control Center</p>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-8 space-y-8">
                    
                    {/* Personnalisation White-Label - Restricted to Manager Only */}
                    {isManager && (
                        <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                            <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex items-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-slate-800 dark:to-slate-800">
                                 <div className="p-2 bg-accent rounded-lg text-white"><SparklesIcon className="w-5 h-5" /></div>
                                 <h2 className="text-lg font-bold text-slate-800 dark:text-white">Personnalisation White-Label</h2>
                            </div>
                            
                            <div className="p-8 space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="text-label-caps block mb-2">Nom de l'application</label>
                                        <input name="app_name" value={customSettings.app_name} onChange={handleAppSettChange} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 dark:border-slate-600 outline-none font-bold dark:text-white focus:ring-2 focus:ring-accent/20" />
                                    </div>
                                    <div>
                                        <label className="text-label-caps block mb-2">Nom court (Icône Mobile)</label>
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
                                            <label className="text-label-caps block mb-3">{img.label}</label>
                                            <div className="relative group aspect-square rounded-2xl bg-slate-50 dark:bg-slate-700 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-600 overflow-hidden">
                                                {(customSettings as any)[img.key] ? (
                                                    <img src={(customSettings as any)[img.key]} className="w-full h-full object-contain p-4" />
                                                ) : (
                                                    <StoreIcon className="w-10 h-10 text-slate-300" />
                                                )}
                                                <button onClick={() => fileInputRef.current[img.key]?.click()} className="absolute inset-0 bg-accent/80 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-all backdrop-blur-sm">Changer</button>
                                                <input type="file" ref={el => fileInputRef.current[img.key] = el} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(img.key, e)} />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="p-6 bg-slate-50 dark:bg-slate-700/30 rounded-2xl border border-slate-100 dark:border-slate-700">
                                    <label className="text-label-caps block mb-4">Couleur Principale du Thème</label>
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
                                            <p className="text-xs text-slate-400 leading-relaxed">Cette couleur sera appliquée globalement à tous les utilisateurs du système.</p>
                                        </div>
                                    </div>
                                </div>

                                <button 
                                    onClick={saveAppSettings}
                                    disabled={isSavingAppSett}
                                    className="w-full py-4 bg-accent text-white rounded-2xl font-bold shadow-lg shadow-accent/20 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                >
                                    {isSavingAppSett ? <SpinnerIcon className="w-5 h-5 animate-spin" /> : <CheckIcon className="w-5 h-5" />}
                                    Appliquer l'identité visuelle
                                </button>
                            </div>
                        </section>
                    )}

                    {/* Users Management */}
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <UsersIcon className="w-5 h-5 text-accent" />
                                <h2 className="text-lg font-bold">Gestion du Staff</h2>
                            </div>
                            <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                <UserPlusIcon className="w-4 h-4" /> Ajouter un membre
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/30 text-slate-400 font-bold uppercase text-[10px] tracking-widest border-b border-slate-100 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4">Utilisateur</th>
                                        <th className="px-6 py-4 text-center">Rôle</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {fetchingUsers ? (
                                        <tr><td colSpan={3} className="p-12 text-center"><SpinnerIcon className="w-8 h-8 animate-spin text-slate-300 mx-auto" /></td></tr>
                                    ) : users.map(user => (
                                        <tr key={user.email} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center font-bold text-accent">{user.email.charAt(0).toUpperCase()}</div>
                                                    <div>
                                                        <p className="font-bold text-slate-900 dark:text-white">{user.email}</p>
                                                        <p className="text-[10px] text-slate-400 font-bold">Code: {user.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                                                    user.role === 'manager' ? 'bg-indigo-100 text-indigo-700' : 
                                                    user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 
                                                    'bg-blue-100 text-blue-600'
                                                }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setUserToDelete(user.email)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                                        <DeleteIcon className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                {/* Sidebar Column */}
                <div className="lg:col-span-4 space-y-6">
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <ThemeToggle theme={theme} setTheme={setTheme} />
                            <h2 className="font-bold">Mode d'affichage</h2>
                        </div>
                        <div className="space-y-4">
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-2">Typographie</p>
                            <div className="grid grid-cols-1 gap-2">
                                {['Inter', 'Roboto', 'Poppins', 'Lato'].map(f => (
                                    <button key={f} onClick={() => setFont(f)} className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all ${font === f ? 'border-accent bg-accent/5 text-accent font-bold' : 'border-slate-100 text-slate-600 dark:text-slate-300'}`} style={{ fontFamily: f }}>
                                        {f} {font === f && <CheckIcon className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600">
                                <ArrowPathIcon className="w-5 h-5" />
                            </div>
                            <h2 className="font-bold">Sync & Performance</h2>
                        </div>
                        <div className="space-y-4">
                             <button 
                                onClick={onRefresh}
                                disabled={isLoading}
                                className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 dark:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-sm font-bold border border-slate-100 dark:border-slate-600 hover:bg-slate-100 transition-colors shadow-sm disabled:opacity-50"
                              >
                                {isLoading ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <ArrowPathIcon className="w-4 h-4" />}
                                Forcer la synchronisation
                              </button>
                        </div>
                    </section>
                </div>
            </main>
            
            <SignupModal isOpen={isAddUserModalOpen} onClose={() => setIsAddUserModalOpen(false)} />
            <ConfirmationModal 
                isOpen={!!userToDelete} 
                onClose={() => setUserToDelete(null)} 
                onConfirm={handleDeleteConfirm} 
                title="Supprimer l'utilisateur" 
                message={`Êtes-vous sûr de vouloir révoquer l'accès de ${userToDelete} ?`} 
            />
        </div>
    );
};

export default AdminSettingsPage;