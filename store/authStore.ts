// store/authStore.ts — Clerk-backed authentication store
import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
}

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  error: string | null;
  signOut: () => Promise<void>;
  clearError: () => void;
  setUser: (user: AuthUser | null) => void;
  setSignOut: (fn: () => Promise<void>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  // Injected by ClerkAuthSync in app/_layout.tsx once Clerk is ready
  signOut: async () => {},
  clearError: () => set({ error: null }),
  setUser: (user) => set({ user }),
  setSignOut: (fn) => set({ signOut: fn }),
}));
