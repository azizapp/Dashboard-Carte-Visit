
import React, { useState } from 'react';
import { authService, UserSession } from '../services/authService.ts';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import CogIcon from './icons/CogIcon.tsx';
import XMarkIcon from './icons/XMarkIcon.tsx';
import { updateSupabaseConfig } from '../services/supabase.ts';

const EnvelopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25-2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
    </svg>
);

const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

interface LoginPageProps {
    onLoginSuccess: (session: UserSession) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isConfigOpen, setIsConfigOpen] = useState(false);

    const [tempUrl, setTempUrl] = useState(localStorage.getItem('supabase_url') || 'https://isvhmsatlnwykmwukurh.supabase.co');
    const [tempKey, setTempKey] = useState(localStorage.getItem('supabase_key') || '');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const session = await authService.login(email, code);
            onLoginSuccess(session);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.');
            if (err.message?.toLowerCase().includes('api key') || err.message?.toLowerCase().includes('connection')) {
                setError(prev => `${prev} - Veuillez vérifier les paramètres de connexion.`);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSaveConfig = () => {
        updateSupabaseConfig(tempUrl, tempKey);
        setIsConfigOpen(false);
        setError(null);
        alert("Paramètres mis à jour.");
    };

    return (
        <div className="flex min-h-screen flex-col md:flex-row font-sans overflow-hidden relative bg-slate-50 dark:bg-slate-900">
            <button 
                onClick={() => setIsConfigOpen(true)}
                className="absolute top-6 right-6 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-lg md:text-blue-600 md:bg-white md:hover:bg-slate-50"
            >
                <CogIcon className="w-6 h-6" />
            </button>

            {isConfigOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Connexion Supabase</h3>
                            <button onClick={() => setIsConfigOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">URL du Projet</label>
                                <input type="text" value={tempUrl} onChange={(e) => setTempUrl(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 outline-none text-sm dark:text-white" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Clé Publique</label>
                                <input type="password" value={tempKey} onChange={(e) => setTempKey(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 outline-none text-sm dark:text-white" />
                            </div>
                        </div>
                        <button onClick={handleSaveConfig} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm">Appliquer</button>
                    </div>
                </div>
            )}

            <div className="hidden md:flex md:w-1/2 relative bg-blue-700 items-center justify-center p-12 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-indigo-900 opacity-90"></div>
                <div className="relative z-10 w-full max-w-lg">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center"><div className="w-6 h-6 bg-blue-600 rounded-full"></div></div>
                        <div className="font-bold text-xl uppercase">APOLLO<br/><span className="text-white/80">EYEWEAR</span></div>
                    </div>
                    <h2 className="text-7xl font-extrabold mb-8 leading-tight">Hello,<br/>welcome!</h2>
                    <p className="text-lg text-blue-100/80 max-w-md leading-relaxed">Solution complète de gestion pour les professionnels de l'optique.</p>
                </div>
            </div>

            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="md:hidden flex flex-col items-center mb-12">
                        <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center shadow-xl mb-4">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center"><div className="w-6 h-6 bg-blue-600 rounded-full"></div></div>
                        </div>
                        <h1 className="text-2xl font-black text-blue-900">Apollo Eyewear</h1>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center overflow-hidden">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600"><EnvelopeIcon /></div>
                            <div className="px-4 py-2 flex-1">
                                <label className="block text-[10px] uppercase font-bold text-slate-400">Email address</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 dark:text-white" placeholder="name@mail.com" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center overflow-hidden">
                            <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600"><LockClosedIcon /></div>
                            <div className="px-4 py-2 flex-1">
                                <label className="block text-[10px] uppercase font-bold text-slate-400">Password</label>
                                <input type="password" required value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 dark:text-white" placeholder="••••••••" />
                            </div>
                        </div>

                        {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}

                        <button type="submit" disabled={isLoading} className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50">
                            {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5 mx-auto" /> : 'Login'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
