import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { Book } from '@/types/book';

const LIBRARY_KEY = 'ravenscroft_library';
const PROGRESS_KEY = 'ravenscroft_reading_progress';

// Matches all Open Library cover CDN URLs (unreliable — 302 → 503)
const OL_COVER_PATTERN = /^https?:\/\/covers\.openlibrary\.org\//;

async function refreshCoverUrl(book: Book): Promise<string | undefined> {
  try {
    const q = encodeURIComponent(`${book.title} ${book.author}`);
    const res = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${q}&maxResults=1`,
      { signal: AbortSignal.timeout(5000) },
    );
    if (!res.ok) return undefined;
    const data = await res.json();
    const links = data.items?.[0]?.volumeInfo?.imageLinks;
    const raw = links?.thumbnail ?? links?.smallThumbnail;
    if (!raw) return undefined;
    return raw
      .replace('http://', 'https://')
      .replace('zoom=1', 'zoom=2')
      .replace('&edge=curl', '');
  } catch {
    return undefined;
  }
}

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

    // Background migration: silently refresh any stale Open Library cover URLs
    const stale = library.filter((b) => b.coverUrl && OL_COVER_PATTERN.test(b.coverUrl));
    if (stale.length === 0) return;
    Promise.allSettled(stale.map((b) => refreshCoverUrl(b).then((url) => ({ id: b.id, url }))))
      .then((results) => {
        let changed = false;
        const updated = get().library.map((b) => {
          if (!b.coverUrl || !OL_COVER_PATTERN.test(b.coverUrl)) return b;
          const match = results.find(
            (r) => r.status === 'fulfilled' && r.value.id === b.id && r.value.url,
          );
          if (match?.status === 'fulfilled' && match.value.url) {
            changed = true;
            return { ...b, coverUrl: match.value.url };
          }
          return b;
        });
        if (changed) {
          set({ library: updated });
          AsyncStorage.setItem(LIBRARY_KEY, JSON.stringify(updated));
        }
      });
  },

  addBook: async (book: Book) => {
    const bookWithDate: Book = { ...book, addedAt: new Date().toISOString() };
    const library = [...get().library, bookWithDate];
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
