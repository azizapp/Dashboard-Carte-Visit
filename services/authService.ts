
import { supabase } from './supabase.ts';
import { UserSession, UserProfile } from '../types.ts';

const login = async (email: string, code: string): Promise<UserSession> => {
    if (!email || !code) {
        throw new Error("Veuillez saisir votre email et votre code.");
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
        throw new Error(error.message || 'Une erreur est survenue lors de la connexion.');
    }

    if (!data) {
        throw new Error('Email ou code incorrect.');
    }
    
    return {
        email: data.email,
        role: (data.role || 'user') as 'manager' | 'admin' | 'user'
    };
};

const signup = async (email: string, code: string, role: 'manager' | 'admin' | 'user' = 'user'): Promise<void> => {
    if (!email || !code) {
        throw new Error("Veuillez saisir l'email et le code requis.");
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
        throw new Error(checkError.message || "Erreur lors de la vérification de l'existence du compte.");
    }

    if (existingUser) {
        throw new Error('Cet email est déjà enregistré.');
    }

    const { error: insertError } = await supabase
        .from('allowed_users')
        .insert([{ email: cleanEmail, code: code.trim(), role }]);

    if (insertError) {
        console.error("Signup Insert Error Details:", JSON.stringify(insertError, null, 2));
        const errorToThrow = new Error(insertError.message || 'Échec de la création du compte.');
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
