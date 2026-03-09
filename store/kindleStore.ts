import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import type { KindleClipping, KindleBook, ImportRecord } from '@/types/kindle';
import { normalizeKindleKey } from '@/lib/kindleParser';

const CLIPPINGS_KEY = 'ravenscroft_kindle_clippings';
const BOOKS_KEY = 'ravenscroft_kindle_books';
const IMPORTS_KEY = 'ravenscroft_kindle_imports';

interface ImportResult {
  added: number;
  duplicates: number;
  booksFound: number;
}

interface KindleState {
  clippings: Record<string, KindleClipping[]>; // keyed by kindleKey
  books: KindleBook[];
  imports: ImportRecord[];
  hydrated: boolean;

  hydrate: () => Promise<void>;
  importClippings: (
    parsed: KindleClipping[],
    fileHashValue: string,
  ) => Promise<ImportResult>;
  setBookMatch: (kindleKey: string, bookId: string) => Promise<void>;
  clearBookMatch: (kindleKey: string) => Promise<void>;
  getClippingsForBook: (kindleKey: string) => KindleClipping[];
  getClippingsForLibraryBook: (bookId: string) => KindleClipping[];
  getBookByKindleKey: (kindleKey: string) => KindleBook | undefined;
  getMatchedKindleBook: (bookId: string) => KindleBook | undefined;
  hasImportedFile: (fileHashValue: string) => boolean;
  clearAllKindleData: () => Promise<void>;
}

async function persist(state: KindleState) {
  await AsyncStorage.multiSet([
    [CLIPPINGS_KEY, JSON.stringify(state.clippings)],
    [BOOKS_KEY, JSON.stringify(state.books)],
    [IMPORTS_KEY, JSON.stringify(state.imports)],
  ]);
}

export const useKindleStore = create<KindleState>((set, get) => ({
  clippings: {},
  books: [],
  imports: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const [[, rawClippings], [, rawBooks], [, rawImports]] =
      await AsyncStorage.multiGet([CLIPPINGS_KEY, BOOKS_KEY, IMPORTS_KEY]);

    set({
      clippings: rawClippings ? JSON.parse(rawClippings) : {},
      books: rawBooks ? JSON.parse(rawBooks) : [],
      imports: rawImports ? JSON.parse(rawImports) : [],
      hydrated: true,
    });
  },

  importClippings: async (parsed, fileHashValue) => {
    const state = get();
    const clippings = { ...state.clippings };
    const booksMap = new Map(state.books.map((b) => [b.kindleKey, { ...b }]));

    let added = 0;
    let duplicates = 0;

    for (const clip of parsed) {
      const key = normalizeKindleKey(clip.bookTitle, clip.author);

      // Ensure book entry exists
      if (!booksMap.has(key)) {
        booksMap.set(key, {
          kindleKey: key,
          rawTitle: clip.bookTitle,
          rawAuthor: clip.author,
          highlightCount: 0,
          noteCount: 0,
        });
      }

      // Ensure clippings array exists
      if (!clippings[key]) clippings[key] = [];

      // Dedup check
      const exists = clippings[key].some((c) => c.id === clip.id);
      if (exists) {
        duplicates++;
        continue;
      }

      clippings[key].push(clip);
      added++;

      // Update counts
      const book = booksMap.get(key)!;
      if (clip.type === 'highlight') book.highlightCount++;
      if (clip.type === 'note') book.noteCount++;
    }

    const books = Array.from(booksMap.values());

    const importRecord: ImportRecord = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      importedAt: new Date().toISOString(),
      fileHash: fileHashValue,
      clippingsAdded: added,
      booksFound: books.length,
    };

    const imports = [...state.imports, importRecord];

    set({ clippings, books, imports });
    await persist(get());

    return { added, duplicates, booksFound: books.length };
  },

  setBookMatch: async (kindleKey, bookId) => {
    const books = get().books.map((b) =>
      b.kindleKey === kindleKey ? { ...b, matchedBookId: bookId } : b,
    );
    set({ books });
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  },

  clearBookMatch: async (kindleKey) => {
    const books = get().books.map((b) =>
      b.kindleKey === kindleKey
        ? { ...b, matchedBookId: undefined }
        : b,
    );
    set({ books });
    await AsyncStorage.setItem(BOOKS_KEY, JSON.stringify(books));
  },

  getClippingsForBook: (kindleKey) => get().clippings[kindleKey] ?? [],

  getClippingsForLibraryBook: (bookId) => {
    const book = get().books.find((b) => b.matchedBookId === bookId);
    if (!book) return [];
    return get().clippings[book.kindleKey] ?? [];
  },

  getBookByKindleKey: (kindleKey) =>
    get().books.find((b) => b.kindleKey === kindleKey),

  getMatchedKindleBook: (bookId) =>
    get().books.find((b) => b.matchedBookId === bookId),

  hasImportedFile: (fileHashValue) =>
    get().imports.some((i) => i.fileHash === fileHashValue),

  clearAllKindleData: async () => {
    set({ clippings: {}, books: [], imports: [] });
    await AsyncStorage.multiRemove([CLIPPINGS_KEY, BOOKS_KEY, IMPORTS_KEY]);
  },
}));
