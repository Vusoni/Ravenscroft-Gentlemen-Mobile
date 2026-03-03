import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Book } from '@/types/book';

const LIBRARY_KEY = 'ravenscroft_library';

interface BooksState {
  library: Book[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addBook: (book: Book) => Promise<void>;
  removeBook: (id: string) => Promise<void>;
  isInLibrary: (id: string) => boolean;
}

export const useBooksStore = create<BooksState>((set, get) => ({
  library: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await AsyncStorage.getItem(LIBRARY_KEY);
    const library: Book[] = raw ? JSON.parse(raw) : [];
    set({ library, hydrated: true });
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
}));
