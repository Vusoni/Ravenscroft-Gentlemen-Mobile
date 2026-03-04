import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { UserNote } from '@/types/book';

const NOTES_KEY = 'ravenscroft_notes';

interface NotesState {
  notes: Record<string, UserNote[]>; // keyed by bookId
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addNote: (note: Omit<UserNote, 'id' | 'createdAt'>) => Promise<void>;
  deleteNote: (bookId: string, noteId: string) => Promise<void>;
  getNotesForBook: (bookId: string) => UserNote[];
}

export const useNotesStore = create<NotesState>((set, get) => ({
  notes: {},
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await AsyncStorage.getItem(NOTES_KEY);
    const notes: Record<string, UserNote[]> = raw ? JSON.parse(raw) : {};
    set({ notes, hydrated: true });
  },

  addNote: async ({ bookId, text, pageIndex }) => {
    const note: UserNote = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      bookId,
      text,
      pageIndex,
      createdAt: new Date().toISOString(),
    };
    const current = { ...get().notes };
    current[bookId] = [...(current[bookId] ?? []), note];
    set({ notes: current });
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(current));
  },

  deleteNote: async (bookId: string, noteId: string) => {
    const current = { ...get().notes };
    current[bookId] = (current[bookId] ?? []).filter((n) => n.id !== noteId);
    set({ notes: current });
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(current));
  },

  getNotesForBook: (bookId: string) => get().notes[bookId] ?? [],
}));
