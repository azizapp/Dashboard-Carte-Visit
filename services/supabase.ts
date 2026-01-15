import { createClient } from '@supabase/supabase-js';

// Fallback constants
const DEFAULT_URL = 'https://isvhmsatlnwykmwukurh.supabase.co';
const DEFAULT_KEY = 'sb_publishable_4lFHcw3ymRZBCN_tlmCE7Q_pW_qhaS1';

// Robust environment variable access
const getEnv = (key: string) => {
    try {
        return (process.env && process.env[key]) || null;
    } catch (e) {
        return null;
    }
};

const SUPABASE_URL = getEnv('VITE_SUPABASE_URL') || DEFAULT_URL;
const SUPABASE_KEY = getEnv('VITE_SUPABASE_ANON_KEY') || DEFAULT_KEY;

const getStoredConfig = () => {
  const url = localStorage.getItem('supabase_url') || SUPABASE_URL;
  const key = localStorage.getItem('supabase_key') || SUPABASE_KEY;
  return { url, key };
};

const config = getStoredConfig();

export let supabase = createClient(config.url, config.key);

export const updateSupabaseConfig = (url: string, key: string) => {
  if (!url || !key) return;
  localStorage.setItem('supabase_url', url);
  localStorage.setItem('supabase_key', key);
  supabase = createClient(url, key);
};

export const uploadImageToStorage = async (base64Data: string): Promise<string> => {
    try {
        const response = await fetch(base64Data);
        const blob = await response.blob();
        
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.jpg`;
        const filePath = `visits/${fileName}`;

        const { data, error } = await supabase.storage
            .from('visit-images')
            .upload(filePath, blob, {
                contentType: 'image/jpeg'
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('visit-images')
            .getPublicUrl(filePath);

        return publicUrl;
    } catch (err) {
        console.error("Storage Upload Error:", err);
        throw new Error("Failed to upload image to storage");
    }
};