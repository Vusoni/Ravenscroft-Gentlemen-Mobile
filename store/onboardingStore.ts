// store/onboardingStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const ONBOARDING_KEY = 'ravenscroft_onboarding_complete';
const INTERESTS_KEY = 'ravenscroft_interests';
const DOB_KEY = 'ravenscroft_dob';

interface OnboardingState {
  selectedInterests: string[];
  dateOfBirth: Date | null;
  isOnboardingComplete: boolean;
  toggleInterest: (tag: string) => void;
  setDOB: (date: Date) => void;
  checkOnboardingStatus: () => Promise<boolean>;
  completeOnboarding: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  selectedInterests: [],
  dateOfBirth: new Date(1995, 1, 18), // Feb 18 1995 as default (matches Figma)
  isOnboardingComplete: false,

  toggleInterest: (tag: string) => {
    const { selectedInterests } = get();
    const exists = selectedInterests.includes(tag);
    set({
      selectedInterests: exists
        ? selectedInterests.filter((t) => t !== tag)
        : [...selectedInterests, tag],
    });
  },

  setDOB: (date: Date) => {
    set({ dateOfBirth: date });
  },

  checkOnboardingStatus: async () => {
    const value = await AsyncStorage.getItem(ONBOARDING_KEY);
    const complete = value === 'true';
    set({ isOnboardingComplete: complete });
    return complete;
  },

  completeOnboarding: async () => {
    const { selectedInterests, dateOfBirth } = get();
    await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    await AsyncStorage.setItem(INTERESTS_KEY, JSON.stringify(selectedInterests));
    if (dateOfBirth) {
      await AsyncStorage.setItem(DOB_KEY, dateOfBirth.toISOString());
    }
    set({ isOnboardingComplete: true });
  },
}));
