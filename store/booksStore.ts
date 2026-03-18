import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Book } from '@/types/book';
import { STORAGE_KEYS } from '@/utils/storageKeys';

interface BooksState {
  library: Book[];
  readingProgress: Record<string, number>;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addBook: (book: Book) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  isInLibrary: (id: string) => boolean;
  setReadingProgress: (bookId: string, pageIndex: number) => Promise<void>;
  getReadingProgress: (bookId: string) => number;
}

export const useBooksStore = create<BooksState>((set, get) => ({
  library: [],
  readingProgress: {},
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const [rawLibrary, rawProgress] = await AsyncStorage.multiGet([STORAGE_KEYS.library, STORAGE_KEYS.readingProgress]);
    const library: Book[] = rawLibrary[1] ? JSON.parse(rawLibrary[1]) : [];
    const readingProgress: Record<string, number> = rawProgress[1] ? JSON.parse(rawProgress[1]) : {};
    set({ library, readingProgress, hydrated: true });
  },

  addBook: async (book: Book) => {
    const bookWithDate: Book = { ...book, addedAt: new Date().toISOString() };
    const library = [...get().library, bookWithDate];
    set({ library });
    await AsyncStorage.setItem(STORAGE_KEYS.library, JSON.stringify(library));
  },

  removeBook: async (id: string) => {
    const library = get().library.filter((b) => b.id !== id);
    set({ library });
    await AsyncStorage.setItem(STORAGE_KEYS.library, JSON.stringify(library));
  },

  isInLibrary: (id: string) => get().library.some((b) => b.id === id),

  setReadingProgress: async (bookId: string, pageIndex: number) => {
    const readingProgress = { ...get().readingProgress, [bookId]: pageIndex };
    set({ readingProgress });
    await AsyncStorage.setItem(STORAGE_KEYS.readingProgress, JSON.stringify(readingProgress));
  },

  getReadingProgress: (bookId: string) => get().readingProgress[bookId] ?? 0,
}));
