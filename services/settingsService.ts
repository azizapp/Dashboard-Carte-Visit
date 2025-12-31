import { supabase, uploadImageToStorage } from './supabase.ts';
import { AppSettings } from '../types.ts';

const SETTINGS_CACHE_KEY = 'app-custom-settings';

const settingsService = {
  async getSettings(): Promise<AppSettings | null> {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('*')
        .eq('id', 'global_settings')
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        return this.getDefaultSettings();
      }

      localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(data));
      return data as AppSettings;
    } catch (e) {
      const cached = localStorage.getItem(SETTINGS_CACHE_KEY);
      return cached ? JSON.parse(cached) : this.getDefaultSettings();
    }
  },

  getDefaultSettings(): AppSettings {
    return {
      app_name: 'Apollo Eyewear',
      short_name: 'Apollo',
      accent_color: '#4f46e5',
      favicon_url: '',
      icon_192_url: '',
      icon_512_url: ''
    };
  },

  async updateSettings(settings: AppSettings): Promise<void> {
    const updated = { ...settings };
    
    // رفع الصور إذا كانت جديدة (Base64)
    if (updated.favicon_url?.startsWith('data:image')) {
      updated.favicon_url = await uploadImageToStorage(updated.favicon_url);
    }
    if (updated.icon_192_url?.startsWith('data:image')) {
      updated.icon_192_url = await uploadImageToStorage(updated.icon_192_url);
    }
    if (updated.icon_512_url?.startsWith('data:image')) {
      updated.icon_512_url = await uploadImageToStorage(updated.icon_512_url);
    }

    const { error } = await supabase
      .from('app_settings')
      .upsert({ 
        ...updated, 
        id: 'global_settings', 
        updated_at: new Date().toISOString() 
      });

    if (error) throw error;
    localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(updated));
  },

  applySettings(settings: AppSettings) {
    if (!settings) return;

    // 1. تحديث عنوان الصفحة
    document.title = settings.app_name;

    // 2. تحديث الألوان في CSS
    document.documentElement.style.setProperty('--accent-color', settings.accent_color);
    // توليد لون أغمق قليلاً للـ hover (بسيط)
    document.documentElement.style.setProperty('--accent-color-hover', settings.accent_color + 'dd');
    
    // تحديث لون الميتا (شريط الهاتف)
    const metaTheme = document.getElementById('meta-theme-color');
    if (metaTheme) metaTheme.setAttribute('content', settings.accent_color);

    // 3. تحديث Favicon
    if (settings.favicon_url) {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'shortcut icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = settings.favicon_url;
    }

    // 4. تحديث Manifest ديناميكي
    const manifest = {
      name: settings.app_name,
      short_name: settings.short_name,
      start_url: "/",
      display: "standalone",
      background_color: "#ffffff",
      theme_color: settings.accent_color,
      icons: [
        {
          src: settings.icon_192_url || "/icon-192.png",
          sizes: "192x192",
          type: "image/png",
          purpose: "any maskable"
        },
        {
          src: settings.icon_512_url || "/icon-512.png",
          sizes: "512x512",
          type: "image/png",
          purpose: "any maskable"
        }
      ]
    };
    
    const stringManifest = JSON.stringify(manifest);
    const blob = new Blob([stringManifest], {type: 'application/json'});
    const manifestURL = URL.createObjectURL(blob);
    const manifestTag = document.getElementById('dynamic-manifest');
    if (manifestTag) {
      manifestTag.setAttribute('href', manifestURL);
    }
  }
};

export default settingsService;