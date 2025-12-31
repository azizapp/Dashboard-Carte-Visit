import { supabase } from './supabase.ts';
import { UserSession, UserProfile } from '../types.ts';

const login = async (email: string, code: string): Promise<UserSession> => {
    if (!email || !code) {
        throw new Error("الرجاء إدخال البريد الإلكتروني والرمز");
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data, error } = await supabase
        .from('allowed_users')
        .select('email, code, role')
        .eq('email', cleanEmail)
        .eq('code', code.trim())
        .maybeSingle();

    if (error) {
        console.error("Login Error:", JSON.stringify(error, null, 2));
        throw new Error(error.message || 'حدث خطأ أثناء تسجيل الدخول');
    }

    if (!data) {
        throw new Error('البريد الإلكتروني أو الرمز غير صحيح.');
    }
    
    return {
        email: data.email,
        role: (data.role || 'user') as 'admin' | 'user'
    };
};

const signup = async (email: string, code: string, role: 'admin' | 'user' = 'user'): Promise<void> => {
    if (!email || !code) {
        throw new Error("الرجاء إدخال البريد الإلكتروني والرمز المطلوب");
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
        .from('allowed_users')
        .select('email')
        .eq('email', cleanEmail)
        .maybeSingle();

    if (checkError) {
        console.error("Signup Check Error:", JSON.stringify(checkError, null, 2));
        throw new Error(checkError.message || 'خطأ أثناء التحقق من وجود الحساب');
    }

    if (existingUser) {
        throw new Error('هذا البريد الإلكتروني مسجل مسبقاً.');
    }

    const { error: insertError } = await supabase
        .from('allowed_users')
        .insert([{ email: cleanEmail, code: code.trim(), role }]);

    if (insertError) {
        console.error("Signup Insert Error Details:", JSON.stringify(insertError, null, 2));
        const errorToThrow = new Error(insertError.message || 'فشل إنشاء الحساب');
        (errorToThrow as any).code = insertError.code;
        throw errorToThrow;
    }
};

const getAllUsers = async (): Promise<UserProfile[]> => {
    const { data, error } = await supabase
        .from('allowed_users')
        .select('email, role, code')
        .order('email', { ascending: true });

    if (error) throw error;
    return data as UserProfile[];
};

const updateUser = async (email: string, updates: Partial<UserProfile>): Promise<void> => {
    const { error } = await supabase
        .from('allowed_users')
        .update(updates)
        .eq('email', email);

    if (error) throw error;
};

const deleteUser = async (email: string): Promise<void> => {
    const { error } = await supabase
        .from('allowed_users')
        .delete()
        .eq('email', email);

    if (error) throw error;
};

export const authService = {
    login,
    signup,
    getAllUsers,
    updateUser,
    deleteUser
};