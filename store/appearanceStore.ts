import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { AppearanceProfile } from '@/types/appearance';
import { STORAGE_KEYS } from '@/utils/storageKeys';

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
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.appearance);
    const profile: AppearanceProfile = raw ? JSON.parse(raw) : {};
    set({ profile, hydrated: true });
  },

  updateProfile: async (updates) => {
    const profile = { ...get().profile, ...updates };
    set({ profile });
    await AsyncStorage.setItem(STORAGE_KEYS.appearance, JSON.stringify(profile));
  },

  clearProfile: async () => {
    set({ profile: {} });
    await AsyncStorage.removeItem(STORAGE_KEYS.appearance);
  },
}));
