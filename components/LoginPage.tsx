
import React, { useState } from 'react';
import { authService, UserSession } from '../services/authService.ts';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import CogIcon from './icons/CogIcon.tsx';
import XMarkIcon from './icons/XMarkIcon.tsx';
import { updateSupabaseConfig } from '../services/supabase.ts';

const EnvelopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25-2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
);

const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
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

    // Temp state for config fields
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
            setError(err.message || 'حدث خطأ غير متوقع.');
            // If the error looks like an API key issue, prompt the user to check config
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
        alert("Paramètres mis à jour. Nouvelle tentative possible.");
    };

    return (
        <div className="flex min-h-screen flex-col md:flex-row font-sans overflow-hidden relative">
            {/* Connection Settings Toggle */}
            <button 
                onClick={() => setIsConfigOpen(true)}
                className="absolute top-6 right-6 z-20 p-2 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full text-white transition-all shadow-lg md:text-blue-600 md:bg-white md:hover:bg-slate-50"
                title="Paramètres de connexion"
            >
                <CogIcon className="w-6 h-6" />
            </button>

            {/* Config Modal */}
            {isConfigOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5 animate-in zoom-in duration-200">
                        <div className="flex justify-between items-center mb-2">
                            <h3 className="text-xl font-black text-slate-800 dark:text-white">Connexion Supabase</h3>
                            <button onClick={() => setIsConfigOpen(false)} className="p-1 hover:bg-slate-100 rounded-full"><XMarkIcon className="w-5 h-5 text-slate-400" /></button>
                        </div>
                        <p className="text-xs text-slate-500">Configurez manuellement votre instance Supabase si la connexion par défaut échoue.</p>
                        
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">URL du Projet</label>
                                <input 
                                    type="text" 
                                    value={tempUrl}
                                    onChange={(e) => setTempUrl(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 outline-none text-sm dark:text-white"
                                    placeholder="https://xyz.supabase.co"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Clé Publique (Anon Key)</label>
                                <input 
                                    type="password" 
                                    value={tempKey}
                                    onChange={(e) => setTempKey(e.target.value)}
                                    className="w-full bg-slate-50 dark:bg-slate-700 p-3 rounded-xl border border-slate-100 outline-none text-sm dark:text-white"
                                    placeholder="eyJhbGciOiJIUzI1Ni..."
                                />
                            </div>
                        </div>

                        <div className="pt-4 flex flex-col gap-2">
                            <button 
                                onClick={handleSaveConfig}
                                className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm shadow-lg hover:opacity-90 transition-all"
                            >
                                Enregistrer et Appliquer
                            </button>
                            <button 
                                onClick={() => { setTempUrl('https://isvhmsatlnwykmwukurh.supabase.co'); setTempKey(''); }}
                                className="text-xs text-slate-400 hover:text-slate-600 font-bold"
                            >
                                Réinitialiser aux valeurs par défaut
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Left Side: Decorative / Info (Hidden on mobile) */}
            <div className="hidden md:flex md:w-1/2 relative bg-blue-700 overflow-hidden items-center justify-center p-12 text-white">
                <div className="absolute inset-0 z-0 opacity-40" style={{ 
                    backgroundImage: 'linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.1) 45%, rgba(255,255,255,0.1) 50%, transparent 50%)',
                    backgroundSize: '40px 40px'
                }}></div>
                <div className="absolute inset-0 z-0 bg-gradient-to-br from-blue-600 via-blue-800 to-indigo-900 opacity-90"></div>
                
                <div className="relative z-10 w-full max-w-lg">
                    <div className="absolute top-0 left-0 flex items-center gap-3 mb-16">
                        <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg">
                            <div className="w-6 h-6 bg-blue-600 rounded-full"></div>
                        </div>
                        <div className="font-bold text-xl tracking-tighter leading-none uppercase">
                            APOLLO<br/><span className="text-white/80">EYEWEAR</span>
                        </div>
                    </div>

                    <div className="mt-32">
                        <h2 className="text-7xl font-extrabold mb-8 leading-tight">
                            Hello,<br/>welcome!
                        </h2>
                        <p className="text-lg text-blue-100/80 mb-10 max-w-md leading-relaxed">
                            Solution complète de gestion pour les professionnels de l'optique. Suivez vos leads, vos visites et vos ventes en toute simplicité.
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Login Form */}
            <div className="w-full md:w-1/2 bg-slate-50 flex items-center justify-center p-8 md:p-16">
                <div className="w-full max-w-sm">
                    <div className="md:hidden flex flex-col items-center mb-12">
                        <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-xl mb-4">
                             <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                                <div className="w-8 h-8 bg-blue-600 rounded-full"></div>
                             </div>
                        </div>
                        <h1 className="text-2xl font-black text-blue-900">Apollo Eyewear</h1>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="space-y-1">
                            <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                <div className="p-4 bg-blue-100/50 text-blue-600">
                                    <EnvelopeIcon className="h-6 w-6" />
                                </div>
                                <div className="px-4 py-2 flex-1">
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Email address</label>
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full bg-transparent border-none p-0 text-blue-900 font-semibold placeholder:text-slate-300 focus:ring-0 sm:text-sm"
                                        placeholder="name@mail.com"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <div className="flex items-center bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                                <div className="p-4 bg-blue-100/50 text-blue-600">
                                    <LockClosedIcon className="h-6 w-6" />
                                </div>
                                <div className="px-4 py-2 flex-1">
                                    <label className="block text-[10px] uppercase font-bold text-slate-400 mb-0.5">Password</label>
                                    <input
                                        type="password"
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="block w-full bg-transparent border-none p-0 text-blue-900 font-semibold placeholder:text-slate-300 focus:ring-0 sm:text-sm"
                                        placeholder="••••••••••••"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center justify-between px-1">
                            <div className="flex items-center">
                                <input id="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-500 font-medium">Remember me</label>
                            </div>
                        </div>

                        {error && (
                            <div className="text-right bg-red-50 p-3 rounded-lg border border-red-100">
                                <p className="text-[11px] text-red-600 font-medium leading-relaxed">{error}</p>
                            </div>
                        )}

                        <div className="pt-2">
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex w-full justify-center items-center rounded-xl bg-white px-6 py-4 text-sm font-bold text-blue-600 shadow-lg shadow-blue-200/50 hover:bg-slate-50 disabled:opacity-70 transition-all active:scale-95 border border-slate-100"
                            >
                                {isLoading ? (
                                    <SpinnerIcon className="animate-spin h-5 w-5 text-blue-600" />
                                ) : 'Login'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
