import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Book } from '@/types/book';

const LIBRARY_KEY = 'ravenscroft_library';
const PROGRESS_KEY = 'ravenscroft_reading_progress';

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
    const [rawLibrary, rawProgress] = await AsyncStorage.multiGet([LIBRARY_KEY, PROGRESS_KEY]);
    const library: Book[] = rawLibrary[1] ? JSON.parse(rawLibrary[1]) : [];
    const readingProgress: Record<string, number> = rawProgress[1] ? JSON.parse(rawProgress[1]) : {};
    set({ library, readingProgress, hydrated: true });
  },

  addBook: async (book: Book) => {
    const library = [...get().library, book];
    set({ library });
    await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  },

  removeBook: async (id: string) => {
    const library = get().library.filter((b) => b.id !== id);
    set({ library });
    await AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(library));
  },

  isInLibrary: (id: string) => get().library.some((b) => b.id === id),

  setReadingProgress: async (bookId: string, pageIndex: number) => {
    const readingProgress = { ...get().readingProgress, [bookId]: pageIndex };
    set({ readingProgress });
    await AsyncStorage.setItem(PROGRESS_KEY, JSON.stringify(readingProgress));
  },

  getReadingProgress: (bookId: string) => get().readingProgress[bookId] ?? 0,
}));
