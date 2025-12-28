
import React, { useState } from 'react';
import { authService } from '../services/authService.ts';
import SpinnerIcon from './icons/SpinnerIcon.tsx';

const EnvelopeIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25-2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" /></svg>
);

const LockClosedIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 0 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
    </svg>
);

const UserPlusIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
    </svg>
);

interface SignupPageProps {
    onBackToLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<{message: string, code?: string} | null>(null);
    const [success, setSuccess] = useState(false);
    const [copied, setCopied] = useState(false);

    const sqlFix = `ALTER TABLE allowed_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert" ON allowed_users FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public select" ON allowed_users FOR SELECT USING (true);`;

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await authService.signup(email, code);
            setSuccess(true);
            setTimeout(() => {
                onBackToLogin();
            }, 3000);
        } catch (err: any) {
            setError({
                message: err.message || 'حدث خطأ أثناء إنشاء الحساب',
                code: err.code
            });
        } finally {
            setIsLoading(false);
        }
    };

    const copySql = () => {
        navigator.clipboard.writeText(sqlFix);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (success) {
        return (
            <div className="flex min-h-screen flex-col items-center justify-center bg-[#4407EB] px-8 text-center text-white">
                <div className="mb-6 w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-xl animate-bounce">
                    <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                </div>
                <h1 className="text-3xl font-bold mb-2">تم إنشاء الحساب!</h1>
                <p className="text-blue-100 mb-8">سيتم تحويلك لصفحة تسجيل الدخول خلال لحظات...</p>
                <button onClick={onBackToLogin} className="text-white underline font-semibold">اضغط هنا للذهاب فوراً</button>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen flex-col items-center bg-[#4407EB] px-8 pt-16 font-sans">
             <div className="mb-6 w-32 h-32 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center shadow-lg border border-white/20">
                <UserPlusIcon className="w-16 h-16 text-white" />
            </div>

            <div className="w-full max-w-sm mx-auto text-center">
                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-white">إنشاء حساب جديد</h1>
                    <p className="text-blue-200 mt-2">انضم إلى فريق Apollo Ayoware</p>
                </div>

                <form className="space-y-6" onSubmit={handleSignup}>
                    <div>
                        <div className="relative border-b border-blue-400 focus-within:border-amber-400 transition-colors duration-300">
                            <EnvelopeIcon className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="block w-full bg-transparent py-3 pl-10 text-white placeholder:text-slate-300 focus:outline-none sm:text-sm"
                                placeholder="البريد الإلكتروني"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="relative border-b border-blue-400 focus-within:border-amber-400 transition-colors duration-300">
                            <LockClosedIcon className="absolute left-1 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            <input
                                type="password"
                                required
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                                className="block w-full bg-transparent py-3 pl-10 text-white placeholder:text-slate-300 focus:outline-none sm:text-sm"
                                placeholder="اختر رمز دخول (Code)"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="mt-4 text-right">
                            <div className="bg-red-900/40 border border-red-500/30 p-3 rounded-lg">
                                <p className="text-xs text-red-100 font-bold mb-1">خطأ في النظام (Code: {error.code || 'Unknown'})</p>
                                <p className="text-[11px] text-red-200 leading-relaxed">{error.message}</p>
                            </div>
                            
                            {error.code === '42501' && (
                                <div className="mt-2 bg-slate-900/80 p-3 rounded-lg border border-amber-500/30">
                                    <p className="text-[10px] text-amber-300 mb-2 font-bold underline">حل مشكلة الصلاحيات (RLS):</p>
                                    <p className="text-[9px] text-slate-300 mb-2">انسخ الكود التالي ونفذه في SQL Editor داخل Supabase:</p>
                                    <button 
                                        type="button"
                                        onClick={copySql}
                                        className="w-full py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-[10px] font-bold rounded transition-colors"
                                    >
                                        {copied ? '✅ تم النسخ' : '📋 نسخ كود SQL للإصلاح'}
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="pt-6">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex w-full justify-center items-center rounded-full bg-slate-900 px-3 py-4 text-md font-semibold text-white shadow-lg hover:bg-slate-700 disabled:opacity-70 transition-all active:scale-95"
                        >
                            {isLoading ? (
                                <SpinnerIcon className="animate-spin h-5 w-5 text-white" />
                            ) : 'تأكيد إنشاء الحساب'}
                        </button>
                    </div>
                </form>

                <p className="mt-10 text-center text-sm text-blue-200">
                    لديك حساب بالفعل؟ 
                    <button onClick={onBackToLogin} className="font-semibold text-cyan-300 hover:text-cyan-200 underline ml-2">
                        سجل دخولك هنا
                    </button>
                </p>
            </div>
        </div>
    );
};

export default SignupPage;
