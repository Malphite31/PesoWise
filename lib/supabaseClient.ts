import { createClient } from '@supabase/supabase-js';

// Helper function to safely get environment variables
const getEnvVar = (key: string) => {
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key];
    }
    // @ts-ignore
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
      // @ts-ignore
      return import.meta.env[key];
    }
  } catch (e) {
    console.warn('Error accessing environment variables', e);
  }
  return '';
};

// 1. Check Local Storage (User entered via UI)
const storedUrl = typeof localStorage !== 'undefined' ? localStorage.getItem('sb_url') : null;
const storedKey = typeof localStorage !== 'undefined' ? localStorage.getItem('sb_key') : null;

// 2. Check Env Vars (Developer setup)
const envUrl = getEnvVar('VITE_SUPABASE_URL');
const envKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

// 3. Fallback (Triggers Setup Modal)
const supabaseUrl = storedUrl || envUrl || 'https://placeholder-project.supabase.co';
const supabaseAnonKey = storedKey || envKey || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
    return supabaseUrl !== 'https://placeholder-project.supabase.co';
};

export const saveSupabaseConfig = (url: string, key: string) => {
    localStorage.setItem('sb_url', url);
    localStorage.setItem('sb_key', key);
    window.location.reload();
};

export const clearSupabaseConfig = () => {
    localStorage.removeItem('sb_url');
    localStorage.removeItem('sb_key');
    window.location.reload();
};