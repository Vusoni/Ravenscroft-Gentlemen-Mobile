import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { AppearanceProfile } from '@/types/appearance';

const APPEARANCE_KEY = 'ravenscroft_appearance';

interface AppearanceState {
  profile: AppearanceProfile;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  updateProfile: (updates: Partial<AppearanceProfile>) => Promise<void>;
  clearProfile: () => Promise<void>;
}

export const useAppearanceStore = create<AppearanceState>((set, get) => ({
  profile: {},
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await AsyncStorage.getItem(APPEARANCE_KEY);
    const profile: AppearanceProfile = raw ? JSON.parse(raw) : {};
    set({ profile, hydrated: true });
  },

  updateProfile: async (updates) => {
    const profile = { ...get().profile, ...updates };
    set({ profile });
    await AsyncStorage.setItem(APPEARANCE_KEY, JSON.stringify(profile));
  },

  clearProfile: async () => {
    set({ profile: {} });
    await AsyncStorage.removeItem(APPEARANCE_KEY);
  },
}));
