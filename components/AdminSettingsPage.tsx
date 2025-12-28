
import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle.tsx';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import CheckIcon from './icons/CheckIcon.tsx';
import ConfirmationModal from './ConfirmationModal.tsx';
import { Mode } from '../types.ts';
import ArrowPathIcon from './icons/ArrowPathIcon.tsx';
import ModeToggle from './ModeToggle.tsx';
import UsersIcon from './icons/UsersIcon.tsx';
import ShieldCheckIcon from './icons/ShieldCheckIcon.tsx';
import DeleteIcon from './icons/DeleteIcon.tsx';
import EditIcon from './icons/EditIcon.tsx';
import XMarkIcon from './icons/XMarkIcon.tsx';
import MapIcon from './icons/MapIcon.tsx';
import { authService, UserProfile } from '../services/authService.ts';
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

const accentColors = [
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Sky', value: '#0ea5e9' },
    { name: 'Rose', value: '#e11d48' },
    { name: 'Emerald', value: '#10b981' },
    { name: 'Amber', value: '#f59e0b' },
];

interface EditUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: UserProfile | null;
    onSave: (email: string, updates: Partial<UserProfile>) => Promise<void>;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ isOpen, onClose, user, onSave }) => {
    const [role, setRole] = useState<'admin' | 'user'>('user');
    const [code, setCode] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (user) {
            setRole(user.role);
            setCode(user.code || '');
        }
    }, [user]);

    if (!isOpen || !user) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await onSave(user.email, { role, code });
            onClose();
        } catch (error) {
            alert("Échec de mise à jour");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                    <h3 className="text-heading text-lg">Modifier l'utilisateur</h3>
                    <button onClick={onClose} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="text-sub uppercase mb-1 block">Email</label>
                        <p className="text-emph font-bold">{user.email}</p>
                    </div>
                    <div>
                        <label className="text-sub uppercase mb-2 block">Code d'accès</label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-200 dark:border-slate-600 focus:ring-2 focus:ring-blue-500 outline-none font-bold dark:text-white"
                        />
                    </div>
                    <div>
                        <label className="text-sub uppercase mb-2 block">Rôle</label>
                        <div className="grid grid-cols-2 gap-2">
                            {['user', 'admin'].map(r => (
                                <button
                                    key={r}
                                    type="button"
                                    onClick={() => setRole(r as any)}
                                    className={`py-2 rounded-lg border font-bold text-xs uppercase tracking-widest ${role === r ? 'bg-blue-600 text-white border-blue-600' : 'bg-white dark:bg-slate-700 text-slate-500 border-slate-200 dark:border-slate-600'}`}
                                >
                                    {r === 'user' ? 'Utilisateur' : 'Admin'}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-bold text-slate-500">Annuler</button>
                        <button type="submit" disabled={isSaving} className="px-6 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm shadow-md flex items-center gap-2">
                            {isSaving && <SpinnerIcon className="w-4 h-4 animate-spin" />}
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface AdminSettingsPageProps {
    theme: 'light' | 'dark';
    setTheme: (theme: 'light' | 'dark') => void;
    font: string;
    setFont: (font: string) => void;
    fontSize: string;
    setFontSize: (size: string) => void;
    fontWeight: string;
    setFontWeight: (weight: string) => void;
    accentColor: string;
    setAccentColor: (color: string) => void;
    onClose: () => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
    onRefresh: () => void;
    isLoading: boolean;
    onResetSettings: () => void;
}

const AdminSettingsPage: React.FC<AdminSettingsPageProps> = ({
    theme, setTheme, font, setFont, fontSize, setFontSize, fontWeight, setFontWeight, accentColor, setAccentColor, onClose, mode, setMode, onRefresh, isLoading, onResetSettings
}) => {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [isResetModalOpen, setIsResetModalOpen] = useState(false);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    const [userToEdit, setUserToEdit] = useState<UserProfile | null>(null);
    const [userToDelete, setUserToDelete] = useState<string | null>(null);
    const [fetchingUsers, setFetchingUsers] = useState(false);

    const [sbUrl, setSbUrl] = useState(localStorage.getItem('supabase_url') || 'https://isvhmsatlnwykmwukurh.supabase.co');
    const [sbKey, setSbKey] = useState(localStorage.getItem('supabase_key') || '');
    const [isSavingConn, setIsSavingConn] = useState(false);

    const fetchUsers = async () => {
        setFetchingUsers(true);
        try {
            const data = await authService.getAllUsers();
            setUsers(data);
        } catch (e) { console.error(e); }
        finally { setFetchingUsers(false); }
    };

    useEffect(() => { fetchUsers(); }, []);

    const handleUpdateUser = async (email: string, updates: Partial<UserProfile>) => {
        try { await authService.updateUser(email, updates); await fetchUsers(); }
        catch (e) { throw e; }
    };

    const handleDeleteConfirm = async () => {
        if (!userToDelete) return;
        try { await authService.deleteUser(userToDelete); setUserToDelete(null); await fetchUsers(); }
        catch (e) { alert("Erreur lors de la suppression"); }
    };

    const handleSaveConnection = async () => {
        setIsSavingConn(true);
        try { updateSupabaseConfig(sbUrl, sbKey); window.location.reload(); }
        catch (e) { alert("Erreur de mise à jour"); }
        finally { setIsSavingConn(false); }
    };

    return (
        <div className="bg-[#F8FAFC] dark:bg-slate-900 min-h-screen">
            <header className="sticky top-0 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 p-6 flex items-center justify-between z-20 h-[80px]">
                <div className="flex items-center gap-4">
                    <button type="button" onClick={onClose} className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-colors">
                        <ArrowLeftIcon className="w-6 h-6" />
                    </button>
                    <div>
                        <h1 className="text-heading text-xl leading-none">Panneau de Contrôle</h1>
                        <p className="text-sub mt-1">Administration du Système</p>
                    </div>
                </div>
                <button
                    onClick={onRefresh}
                    disabled={isLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-200 dark:shadow-none hover:bg-blue-700 transition-all disabled:opacity-50"
                >
                    {isLoading ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <ArrowPathIcon className="w-4 h-4" />}
                    Sync Global
                </button>
            </header>

            <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-8 pb-20 animate-in fade-in duration-500">
                <div className="lg:col-span-8 space-y-8">
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
                        <div className="p-6 border-b border-slate-50 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg text-indigo-600"><UsersIcon className="w-5 h-5" /></div>
                                <h2 className="text-heading text-sm uppercase tracking-tight">Utilisateurs Autorisés</h2>
                            </div>
                            <button onClick={() => setIsAddUserModalOpen(true)} className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-lg text-xs font-bold border border-emerald-100 hover:bg-emerald-100 transition-colors">
                                <UserPlusIcon className="w-4 h-4" /> Nouveau
                            </button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-slate-50 dark:bg-slate-700/30 text-sub tracking-widest border-b border-slate-100 dark:border-slate-700">
                                    <tr><th className="px-6 py-4">Utilisateur</th><th className="px-6 py-4 text-center">Rôle</th><th className="px-6 py-4 text-right">Actions</th></tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                                    {fetchingUsers ? (
                                        <tr><td colSpan={3} className="p-12 text-center"><SpinnerIcon className="w-8 h-8 animate-spin text-slate-300 mx-auto" /></td></tr>
                                    ) : users.length === 0 ? (
                                        <tr><td colSpan={3} className="p-12 text-center text-slate-400 text-std">Aucun utilisateur trouvé</td></tr>
                                    ) : users.map(user => (
                                        <tr key={user.email} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-full bg-indigo-50 dark:bg-indigo-900/40 flex items-center justify-center font-bold text-indigo-600 dark:text-indigo-300">{user.email.charAt(0).toUpperCase()}</div>
                                                    <div><p className="text-emph font-bold">{user.email}</p><p className="text-sub text-[10px]">Code: {user.code}</p></div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>{user.role}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => setUserToEdit(user)} className="p-2 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg"><EditIcon className="w-5 h-5" /></button>
                                                    <button onClick={() => setUserToDelete(user.email)} className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg"><DeleteIcon className="w-5 h-5" /></button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600"><MapIcon className="w-5 h-5" /></div>
                            <h2 className="text-heading text-sm uppercase tracking-tight">Paramètres de Connexion</h2>
                        </div>
                        <div className="space-y-4">
                            <div><label className="text-sub tracking-widest block mb-2">Supabase URL</label><input type="text" value={sbUrl} onChange={(e) => setSbUrl(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 outline-none text-sm font-medium dark:text-white" /></div>
                            <div><label className="text-sub tracking-widest block mb-2">Supabase Anon Key</label><input type="password" value={sbKey} onChange={(e) => setSbKey(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 outline-none text-sm font-medium dark:text-white" /></div>
                            <button onClick={handleSaveConnection} disabled={isSavingConn} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all flex items-center justify-center gap-2">{isSavingConn ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <CheckIcon className="w-4 h-4" />} Enregistrer les paramètres</button>
                        </div>
                    </section>

                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-amber-50 dark:bg-amber-900/30 rounded-lg text-amber-600"><ArrowPathIcon className="w-5 h-5" /></div>
                            <h2 className="text-heading text-sm uppercase tracking-tight">Configuration Système</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                <p className="text-emph text-sm mb-1 font-bold">Mode de Fonctionnement</p>
                                <p className="text-[11px] text-slate-500 mb-4 text-std">Le mode Test n'affectه pas la base principale.</p>
                                <ModeToggle mode={mode} setMode={setMode} />
                            </div>
                            <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                                <p className="text-emph text-sm mb-1 font-bold">Maintenance</p>
                                <p className="text-[11px] text-slate-500 mb-4 text-std">Réinitialiser les styles et préférences locales.</p>
                                <button onClick={() => setIsResetModalOpen(true)} className="text-xs font-black text-red-500 uppercase tracking-widest hover:underline">Réinitialiser tout</button>
                            </div>
                        </div>
                    </section>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <section className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 p-6">
                        <div className="flex items-center gap-3 mb-8">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600"><CheckIcon className="w-5 h-5" /></div>
                            <h2 className="text-heading text-sm uppercase tracking-tight">Design Global</h2>
                        </div>
                        <div className="space-y-8">
                            <div>
                                <label className="text-sub tracking-widest block mb-4">Couleur Principale</label>
                                <div className="grid grid-cols-5 gap-2">
                                    {accentColors.map(color => (
                                        <button key={color.name} type="button" onClick={() => setAccentColor(color.value)} className={`aspect-square rounded-xl flex items-center justify-center transition-all ${accentColor === color.value ? 'ring-4 ring-offset-2 ring-slate-200 scale-110' : ''}`} style={{ backgroundColor: color.value } as any}>
                                            {accentColor === color.value && <CheckIcon className="w-5 h-5 text-white" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div>
                                <label className="text-sub tracking-widest block mb-4">Typographie Système</label>
                                <div className="space-y-2">
                                    {['Inter', 'Roboto', 'Lato'].map(f => (
                                        <button key={f} onClick={() => setFont(f)} className={`w-full p-4 rounded-xl border text-left flex items-center justify-between transition-all ${font === f ? 'border-blue-500 bg-blue-50/30 text-blue-700' : 'border-slate-100 text-slate-600'}`} style={{ fontFamily: f }}>
                                            <span className="font-bold">{f}</span>
                                            {font === f && <CheckIcon className="w-4 h-4" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="pt-6 border-t border-slate-50 dark:border-slate-700">
                                <div className="flex items-center justify-between"><span className="text-emph font-bold text-sm">Mode Sombre</span><ThemeToggle theme={theme} setTheme={setTheme} /></div>
                            </div>
                        </div>
                    </section>
                </div>
            </main>
            <SignupModal isOpen={isAddUserModalOpen} onClose={() => { setIsAddUserModalOpen(false); fetchUsers(); }} />
            <EditUserModal isOpen={!!userToEdit} user={userToEdit} onClose={() => setUserToEdit(null)} onSave={handleUpdateUser} />
            <ConfirmationModal isOpen={isResetModalOpen} onClose={() => setIsResetModalOpen(false)} onConfirm={() => { onResetSettings(); setIsResetModalOpen(false); }} title="Réinitialiser" message="Restaurer les styles par défaut ?" confirmText="Réinitialiser" />
            <ConfirmationModal isOpen={!!userToDelete} onClose={() => setUserToDelete(null)} onConfirm={handleDeleteConfirm} title="Supprimer" message={`Supprimer ${userToDelete} ?`} confirmText="Supprimer" />
        </div>
    );
};

export default AdminSettingsPage;
