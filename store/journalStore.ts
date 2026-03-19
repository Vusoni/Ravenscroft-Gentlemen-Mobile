import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

import { JournalCategory, JournalEntry } from '@/types/journal';
import { generateId } from '@/utils/id';

const JOURNAL_KEY = 'ravenscroft_journal';

interface JournalState {
  entries: JournalEntry[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addEntry: (
    entry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'>,
  ) => Promise<JournalEntry>;
  updateEntry: (
    id: string,
    updates: Partial<Pick<JournalEntry, 'title' | 'body' | 'category' | 'mood'>>,
  ) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntriesForDate: (dateISO: string) => JournalEntry[];
  getEntriesByCategory: (category: JournalCategory | 'all') => JournalEntry[];
}

export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await AsyncStorage.getItem(JOURNAL_KEY);
    const entries: JournalEntry[] = raw ? JSON.parse(raw) : [];
    set({ entries, hydrated: true });
  },

  addEntry: async (data) => {
    const entry: JournalEntry = {
      ...data,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    const entries = [entry, ...get().entries];
    set({ entries });
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
    return entry;
  },

  updateEntry: async (id, updates) => {
    const entries = get().entries.map((e) =>
      e.id === id ? { ...e, ...updates, updatedAt: new Date().toISOString() } : e,
    );
    set({ entries });
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  },

  deleteEntry: async (id) => {
    const entries = get().entries.filter((e) => e.id !== id);
    set({ entries });
    await AsyncStorage.setItem(JOURNAL_KEY, JSON.stringify(entries));
  },

  getEntriesForDate: (dateISO) => {
    const target = dateISO.slice(0, 10);
    return get().entries.filter((e) => e.createdAt.slice(0, 10) === target);
  },

  getEntriesByCategory: (category) => {
    if (category === 'all') return get().entries;
    return get().entries.filter((e) => e.category === category);
  },
}));
