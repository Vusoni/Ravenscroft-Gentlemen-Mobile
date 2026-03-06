import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const ASSISTANT_KEY = 'ravenscroft_assistant_chat';
const MAX_MESSAGES = 100;

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  createdAt: string;
}

interface AssistantState {
  messages: AssistantMessage[];
  hydrated: boolean;
  hydrate: () => Promise<void>;
  addMessage: (msg: Omit<AssistantMessage, 'id' | 'createdAt'>) => Promise<AssistantMessage>;
  clearChat: () => Promise<void>;
}

export const useAssistantStore = create<AssistantState>((set, get) => ({
  messages: [],
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;
    const raw = await AsyncStorage.getItem(ASSISTANT_KEY);
    const messages: AssistantMessage[] = raw ? JSON.parse(raw) : [];
    set({ messages, hydrated: true });
  },

  addMessage: async ({ role, text }) => {
    const message: AssistantMessage = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      text,
      createdAt: new Date().toISOString(),
    };
    let msgs = [...get().messages, message];
    if (msgs.length > MAX_MESSAGES) {
      msgs = msgs.slice(msgs.length - MAX_MESSAGES);
    }
    set({ messages: msgs });
    await AsyncStorage.setItem(ASSISTANT_KEY, JSON.stringify(msgs));
    return message;
  },

  clearChat: async () => {
    set({ messages: [] });
    await AsyncStorage.removeItem(ASSISTANT_KEY);
  },
}));
