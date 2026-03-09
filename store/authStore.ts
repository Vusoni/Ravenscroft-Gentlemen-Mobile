// store/authStore.ts — Supabase-backed authentication store
import { supabase } from '@/lib/supabase';
import * as AppleAuthentication from 'expo-apple-authentication';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { create } from 'zustand';

// Warm up the browser on Android for faster OAuth
WebBrowser.maybeCompleteAuthSession();

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  checkAuthStatus: () => Promise<boolean>;
  signIn: (email: string, password: string) => Promise<boolean>;
  signUp: (email: string, password: string, displayName?: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signInWithApple: () => Promise<boolean>;
  signOut: () => Promise<void>;
  clearError: () => void;
  setUser: (user: AuthUser | null) => void;
}

function mapUser(supabaseUser: {
  id: string;
  email?: string;
  user_metadata?: Record<string, string>;
}): AuthUser {
  const email = supabaseUser.email ?? '';
  const displayName =
    supabaseUser.user_metadata?.display_name ??
    supabaseUser.user_metadata?.full_name ??
    supabaseUser.user_metadata?.name ??
    email.split('@')[0];
  return { id: supabaseUser.id, email, displayName };
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,

  clearError: () => set({ error: null }),
  setUser: (user) => set({ user }),

  checkAuthStatus: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.user) return false;
    set({ user: mapUser(session.user) });
    return true;
  },

  signIn: async (email, password) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      set({ isLoading: false, error: error?.message ?? 'Sign in failed.' });
      return false;
    }
    set({ user: mapUser(data.user), isLoading: false });
    return true;
  },

  signUp: async (email, password, displayName) => {
    set({ isLoading: true, error: null });
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName?.trim() || email.split('@')[0] },
      },
    });
    if (error || !data.user) {
      set({ isLoading: false, error: error?.message ?? 'Registration failed.' });
      return false;
    }
    set({ user: mapUser(data.user), isLoading: false });
    return true;
  },

  signInWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const redirectTo = makeRedirectUri();
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo, skipBrowserRedirect: true },
      });
      if (error || !data.url) {
        set({ isLoading: false, error: error?.message ?? 'Google sign in failed.' });
        return false;
      }
      const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
      if (result.type !== 'success') {
        set({ isLoading: false, error: 'Google sign in is not available. Please use email and password.' });
        return false;
      }
      // Check if Supabase returned an error in the redirect URL (e.g. provider not enabled)
      if (result.url.includes('error=') || result.url.includes('error_code=')) {
        set({ isLoading: false, error: 'Google sign in is not available. Please use email and password.' });
        return false;
      }
      const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
      if (sessionError) {
        set({ isLoading: false, error: sessionError.message });
        return false;
      }
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        set({ isLoading: false, error: 'Could not retrieve session.' });
        return false;
      }
      set({ user: mapUser(session.user), isLoading: false });
      return true;
    } catch {
      set({ isLoading: false, error: 'Google sign in failed.' });
      return false;
    }
  },

  signInWithApple: async () => {
    set({ isLoading: true, error: null });
    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });
      if (!credential.identityToken) {
        set({ isLoading: false, error: 'Apple sign in failed — no identity token.' });
        return false;
      }
      const { data, error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });
      if (error || !data.user) {
        set({ isLoading: false, error: error?.message ?? 'Apple sign in failed.' });
        return false;
      }
      set({ user: mapUser(data.user), isLoading: false });
      return true;
    } catch (e: unknown) {
      if (e instanceof Error && 'code' in e && (e as { code: string }).code === 'ERR_CANCELED') {
        set({ isLoading: false, error: null }); // dismissed — not an error
      } else {
        set({ isLoading: false, error: 'Apple sign in failed.' });
      }
      return false;
    }
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null });
  },
}));
