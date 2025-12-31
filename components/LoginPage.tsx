import React, { useState } from 'react';
import { authService } from '../services/authService.ts';
import { UserSession, AppSettings } from '../types.ts';
import SpinnerIcon from './icons/SpinnerIcon.tsx';

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
    appSettings?: AppSettings | null;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess, appSettings }) => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const session = await authService.login(email, code);
            onLoginSuccess(session);
        } catch (err: any) {
            setError(err.message || 'Une erreur est survenue.');
        } finally {
            setIsLoading(false);
        }
    };

    // مكوّن الشعار الديناميكي بخلفية شفافة
    // تم التحديث لاستخدام icon_192_url (Icône PWA) بدلاً من favicon بناءً على طلب المستخدم لضمان استخدام الشعار بدقة عالية
    const AppLogo = ({ size = "w-10 h-10" }: { size?: string }) => (
        <div className={`${size} bg-transparent flex items-center justify-center overflow-hidden`}>
            {appSettings?.icon_192_url ? (
                <img src={appSettings.icon_192_url} alt="Logo" className="w-full h-full object-contain" />
            ) : (
                <div className="w-4/5 h-4/5 bg-accent rounded-xl shadow-lg shadow-accent/20"></div>
            )}
        </div>
    );

    return (
        <div className="flex min-h-screen flex-col md:flex-row font-sans overflow-hidden relative bg-slate-50 dark:bg-slate-900">
            {/* Desktop View */}
            <div className="hidden md:flex md:w-1/2 relative bg-accent items-center justify-center p-12 text-white overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-black/20 to-black/40"></div>
                <div className="relative z-10 w-full max-w-lg">
                    <div className="flex items-center gap-5 mb-16">
                        <AppLogo size="w-16 h-16" />
                        <div className="font-black text-3xl uppercase tracking-tighter leading-tight drop-shadow-sm">
                            {appSettings?.app_name || 'APOLLO EYEWEAR'}
                        </div>
                    </div>
                    <h2 className="text-7xl font-extrabold mb-8 leading-tight">Bonjour,<br/>Bienvenue !</h2>
                    <p className="text-lg text-white/80 max-w-md leading-relaxed">Solution complète de gestion personnalisée pour votre entreprise.</p>
                </div>
            </div>

            {/* Form Section */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                    <div className="md:hidden flex flex-col items-center mb-12">
                        <AppLogo size="w-24 h-24" />
                        <h1 className="text-2xl font-black text-slate-800 dark:text-white text-center mt-4">
                            {appSettings?.app_name || 'Apollo Eyewear'}
                        </h1>
                    </div>

                    <form className="space-y-5" onSubmit={handleSubmit}>
                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center overflow-hidden">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700 text-slate-400"><EnvelopeIcon /></div>
                            <div className="px-4 py-2 flex-1">
                                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest">Email address</label>
                                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 dark:text-white" placeholder="vendeur@mail.com" />
                            </div>
                        </div>

                        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center overflow-hidden">
                            <div className="p-4 bg-slate-50 dark:bg-slate-700 text-slate-400"><LockClosedIcon /></div>
                            <div className="px-4 py-2 flex-1">
                                <label className="block text-[10px] uppercase font-bold text-slate-400 tracking-widest">Password (Code)</label>
                                <input type="password" required value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-transparent border-none p-0 text-sm font-semibold focus:ring-0 dark:text-white" placeholder="••••••••" />
                            </div>
                        </div>

                        {error && <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg border border-red-100">{error}</div>}

                        <button type="submit" disabled={isLoading} className="w-full py-4 bg-accent text-white rounded-xl font-bold shadow-lg shadow-accent/20 hover:opacity-90 transition-all active:scale-95 disabled:opacity-50">
                            {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5 mx-auto" /> : 'Se Connecter'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;