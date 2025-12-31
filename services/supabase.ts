import { createClient } from '@supabase/supabase-js';

// Standard Vite environment variable access
// FIX: Replaced import.meta.env with process.env to resolve Property 'env' does not exist on type 'ImportMeta' error, as process.env is defined in vite.config.ts
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://isvhmsatlnwykmwukurh.supabase.co';
// FIX: Replaced import.meta.env with process.env to resolve Property 'env' does not exist on type 'ImportMeta' error, as process.env is defined in vite.config.ts
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_4lFHcw3ymRZBCN_tlmCE7Q_pW_qhaS1';

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