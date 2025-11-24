
import { createClient } from '@supabase/supabase-js';

// Helper function to safely get environment variables
const getEnvVar = (key: string) => {
  try {
    let val = '';
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      val = process.env[key] || '';
    }
    // @ts-ignore
    else if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      val = import.meta.env[key] || '';
    }
    return val.trim();
  } catch (e) {
    console.warn('Error accessing environment variables', e);
  }
  return '';
};

// Helper to ensure URL is valid
const formatUrl = (url: string | null): string => {
    if (!url) return '';
    let clean = url.trim();
    if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
        clean = `https://${clean}`;
    }
    // Remove trailing slash
    return clean.replace(/\/$/, '');
};

// 1. Check Local Storage (User entered via UI)
const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('sb_url') : null;
const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('sb_key') : null;

// 2. Check Env Vars (Developer setup)
const envUrl = getEnvVar('VITE_SUPABASE_URL');
const envKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// 3. Fallback (Triggers Setup Modal)
// Clean URL prevents double slash issues from bad copy-paste and ensures https
const rawUrl = storedUrl || envUrl || 'https://placeholder-project.supabase.co';
const supabaseUrl = formatUrl(rawUrl);
const supabaseAnonKey = storedKey || envKey || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
    return supabaseUrl !== 'https://placeholder-project.supabase.co';
};

export const saveSupabaseConfig = (url: string, key: string) => {
    // Basic sanitation
    const cleanUrl = formatUrl(url);
    const cleanKey = key.trim();
    localStorage.setItem('sb_url', cleanUrl);
    localStorage.setItem('sb_key', cleanKey);
    window.location.reload();
};

export const clearSupabaseConfig = () => {
    localStorage.removeItem('sb_url');
    localStorage.removeItem('sb_key');
    window.location.reload();
};
