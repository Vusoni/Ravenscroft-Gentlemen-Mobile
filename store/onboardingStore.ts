// store/onboardingStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { STORAGE_KEYS } from '@/utils/storageKeys';

interface OnboardingState {
  selectedInterests: string[];
  dateOfBirth: Date | null;
  isOnboardingComplete: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  toggleInterest: (tag: string) => void;
  setDOB: (date: Date) => void;
  checkOnboardingStatus: () => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
  resetOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  selectedInterests: [],
  dateOfBirth: new Date(1995, 1, 18), // Feb 18 1995 as default (matches Figma)
  isOnboardingComplete: false,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const [[, completeRaw], [, interestsRaw], [, dobRaw]] =
      await AsyncStorage.multiGet([
        STORAGE_KEYS.onboardingComplete,
        STORAGE_KEYS.interests,
        STORAGE_KEYS.dob,
      ]);
    const isOnboardingComplete = completeRaw === 'true';
    const selectedInterests: string[] = interestsRaw ? JSON.parse(interestsRaw) : [];
    const dateOfBirth = dobRaw ? new Date(dobRaw) : null;
    set({ isOnboardingComplete, selectedInterests, dateOfBirth, hydrated: true });
  },

  toggleInterest: (tag: string) => {
    const { selectedInterests } = get();
    const exists = selectedInterests.includes(tag);
    const updated = exists
      ? selectedInterests.filter((t) => t !== tag)
      : [...selectedInterests, tag];
    set({ selectedInterests: updated });
    AsyncStorage.setItem(STORAGE_KEYS.interests, JSON.stringify(updated));
  },

  setDOB: (date: Date) => {
    set({ dateOfBirth: date });
  },

  checkOnboardingStatus: async () => {
    const [[, completeRaw], [, interestsRaw]] = await AsyncStorage.multiGet([
      STORAGE_KEYS.onboardingComplete,
      STORAGE_KEYS.interests,
    ]);
    const complete = completeRaw === 'true';
    const selectedInterests: string[] = interestsRaw ? JSON.parse(interestsRaw) : [];
    set({ isOnboardingComplete: complete, selectedInterests });
    return complete;
  },

  completeOnboarding: async () => {
    const { selectedInterests, dateOfBirth } = get();
    await AsyncStorage.setItem(STORAGE_KEYS.onboardingComplete, 'true');
    await AsyncStorage.setItem(STORAGE_KEYS.interests, JSON.stringify(selectedInterests));
    if (dateOfBirth) {
      await AsyncStorage.setItem(STORAGE_KEYS.dob, dateOfBirth.toISOString());
    }
    set({ isOnboardingComplete: true });
  },

  resetOnboarding: async () => {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.onboardingComplete,
      STORAGE_KEYS.interests,
      STORAGE_KEYS.dob,
      STORAGE_KEYS.soundtrack,
    ]);
    set({
      isOnboardingComplete: false,
      selectedInterests: [],
      dateOfBirth: null,
    });
  },
}));
