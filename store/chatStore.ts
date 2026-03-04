import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const CHATS_KEY = 'ravenscroft_chats';
const MAX_MESSAGES_PER_BOOK = 100;

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string; // ISO string
}

interface ChatState {
  chats: Record<string, ChatMessage[]>; // keyed by bookId
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addMessage: (bookId: string, message: Omit<ChatMessage, 'id' | 'createdAt'>) => Promise<ChatMessage>;
  clearChat: (bookId: string) => Promise<void>;
  getMessages: (bookId: string) => ChatMessage[];
}

export const useChatStore = create<ChatState>((set, get) => ({
  chats: {},
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await AsyncStorage.getItem(CHATS_KEY);
    const chats: Record<string, ChatMessage[]> = raw ? JSON.parse(raw) : {};
    set({ chats, hydrated: true });
  },

  addMessage: async (bookId, { role, text }) => {
    const message: ChatMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      text,
      createdAt: new Date().toISOString(),
    };
    const current = { ...get().chats };
    let msgs = [...(current[bookId] ?? []), message];
    // Trim to prevent unbounded growth
    if (msgs.length > MAX_MESSAGES_PER_BOOK) {
      msgs = msgs.slice(msgs.length - MAX_MESSAGES_PER_BOOK);
    }
    current[bookId] = msgs;
    set({ chats: current });
    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(current));
    return message;
  },

  clearChat: async (bookId) => {
    const current = { ...get().chats };
    delete current[bookId];
    set({ chats: current });
    await AsyncStorage.setItem(CHATS_KEY, JSON.stringify(current));
  },

  getMessages: (bookId) => get().chats[bookId] ?? [],
}));
