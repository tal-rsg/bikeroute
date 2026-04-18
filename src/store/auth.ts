import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface Profile {
  name: string | null;
  city: string | null;
  avatar_url: string | null;
  weekly_goal_km: number;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;

  init: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<string | null>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<string | null>;
  signInWithGoogle: () => Promise<string | null>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
  sendPasswordReset: (email: string) => Promise<string | null>;
}

async function loadProfile(set: any, userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('name, city, avatar_url, weekly_goal_km')
    .eq('id', userId)
    .single();
  if (data) set({ profile: { ...data, weekly_goal_km: data.weekly_goal_km ?? 80 } });
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  session: null,
  profile: null,
  loading: true,

  init: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        set({ session, user: session.user });
        await loadProfile(set, session.user.id);
      }
    } catch (e) {
      console.error('Auth init error:', e);
    } finally {
      set({ loading: false });
    }

    supabase.auth.onAuthStateChange(async (_event, session) => {
      set({ session, user: session?.user ?? null });
      if (session?.user) {
        await loadProfile(set, session.user.id);
      } else {
        set({ profile: null });
      }
    });
  },

  signInWithEmail: async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error?.message ?? null;
  },

  signUpWithEmail: async (email, password, name) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    return error?.message ?? null;
  },

  signInWithGoogle: async () => {
    // No Capacitor, abre o browser nativo via OAuth
    // O deep link `bikeroute://auth/callback` deve estar configurado no Supabase
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'bikeroute://auth/callback',
        skipBrowserRedirect: false,
      },
    });
    return error?.message ?? null;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, session: null, profile: null });
  },

  updateProfile: async (data) => {
    const user = get().user;
    if (!user) return;
    await supabase.from('profiles').update(data).eq('id', user.id);
    set(s => ({ profile: s.profile ? { ...s.profile, ...data } : null }));
  },

  sendPasswordReset: async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'bikeroute://auth/reset',
    });
    return error?.message ?? null;
  },
}));
