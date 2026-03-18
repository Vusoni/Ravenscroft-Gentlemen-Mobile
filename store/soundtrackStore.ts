// store/soundtrackStore.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Song } from '@/types/song';
import { STORAGE_KEYS } from '@/utils/storageKeys';

interface SoundtrackState {
  selectedSong: Song | null;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setSong: (song: Song) => Promise<void>;
  clearSong: () => Promise<void>;
}

export const useSoundtrackStore = create<SoundtrackState>((set, get) => ({
  selectedSong: null,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.soundtrack);
    const selectedSong: Song | null = raw ? JSON.parse(raw) : null;
    set({ selectedSong, hydrated: true });
  },

  setSong: async (song: Song) => {
    set({ selectedSong: song });
    await AsyncStorage.setItem(STORAGE_KEYS.soundtrack, JSON.stringify(song));
  },

  clearSong: async () => {
    set({ selectedSong: null });
    await AsyncStorage.removeItem(STORAGE_KEYS.soundtrack);
  },
}));
