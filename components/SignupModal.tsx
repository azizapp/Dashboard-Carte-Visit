import React, { useState } from 'react';
import { authService } from '../services/authService.ts';
import SpinnerIcon from './icons/SpinnerIcon.tsx';
import XMarkIcon from './icons/XMarkIcon.tsx';

const EnvelopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25-2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
);

const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

const ShieldCheckIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
    </svg>
);

interface SignupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [role, setRole] = useState<'manager' | 'admin' | 'user'>('user');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<{message: string, code?: string} | null>(null);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await authService.signup(email, code, role);
            setSuccess(true);
            setTimeout(() => {
                setSuccess(false);
                setEmail('');
                setCode('');
                setRole('user');
                onClose();
            }, 2500);
        } catch (err: any) {
            setError({
                message: err.message || 'حدث خطأ أثناء إنشاء الحساب',
                code: err.code
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                    <XMarkIcon className="w-6 h-6" />
                </button>

                <div className="p-8">
                    <div className="text-center mb-8">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full mb-4">
                            <ShieldCheckIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ajouter au Staff</h2>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Définissez les droits d'accès</p>
                    </div>

                    {success ? (
                        <div className="py-8 text-center animate-in zoom-in duration-300">
                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                            </div>
                            <h3 className="text-lg font-bold text-emerald-600 mb-1">Succès!</h3>
                            <p className="text-slate-500 dark:text-slate-400">Utilisateur enregistré en tant que {role}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSignup} className="space-y-5">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email</label>
                                <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-blue-500 transition-colors">
                                    <EnvelopeIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="block w-full bg-transparent py-3 pl-10 pr-4 text-slate-900 dark:text-white sm:text-sm outline-none"
                                        placeholder="email@example.com"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Code d'accès</label>
                                <div className="relative border border-slate-200 dark:border-slate-700 rounded-xl focus-within:border-blue-500 transition-colors">
                                    <LockClosedIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                                    <input
                                        type="password"
                                        required
                                        value={code}
                                        onChange={(e) => setCode(e.target.value)}
                                        className="block w-full bg-transparent py-3 pl-10 pr-4 text-slate-900 dark:text-white sm:text-sm outline-none"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Rôle</label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['user', 'admin', 'manager'].map((r) => (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r as any)}
                                            className={`py-2 rounded-xl border text-[10px] font-black uppercase transition-all ${role === r ? 'bg-accent text-white border-accent shadow-md' : 'border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-50'}`}
                                        >
                                            {r}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {error && (
                                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 p-3 rounded-xl text-xs text-red-600">
                                    {error.message}
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full py-3.5 bg-slate-900 dark:bg-blue-600 hover:opacity-90 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center"
                            >
                                {isLoading ? <SpinnerIcon className="animate-spin h-5 w-5" /> : 'Confirmer'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SignupModal;