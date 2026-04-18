import { createClient } from '@supabase/supabase-js';
import { Preferences } from '@capacitor/preferences';

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string) ?? '';
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) ?? '';

// Adapter que usa @capacitor/preferences (Keychain/EncryptedSharedPrefs no nativo,
// localStorage no browser de desenvolvimento)
const capacitorStorage = {
  getItem: async (key: string) => {
    const { value } = await Preferences.get({ key });
    return value;
  },
  setItem: async (key: string, value: string) => {
    await Preferences.set({ key, value });
  },
  removeItem: async (key: string) => {
    await Preferences.remove({ key });
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: capacitorStorage as any,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // deep links tratados manualmente no Capacitor
  },
});

