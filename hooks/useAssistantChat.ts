// hooks/useAssistantChat.ts
// Encapsulates assistant chat state and actions extracted from assistant.tsx.
import { askAssistant } from '@/services/anthropicApi';
import { AssistantMessage, useAssistantStore } from '@/store/assistantStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useEffect, useRef, useState } from 'react';
import { Alert } from 'react-native';

const GREETING_TEXT =
  "Good day. I'm here to help you navigate life's situations with confidence — whether it's a first date, a business dinner, or simply finding the right words. What's on your mind?";

export interface UseAssistantChatReturn {
  localMessages: AssistantMessage[];
  isThinking: boolean;
  sendText: (text: string) => Promise<void>;
  handleCancel: () => void;
  handleClearChat: () => void;
}

export function useAssistantChat(): UseAssistantChatReturn {
  const { hydrate, addMessage, clearChat } = useAssistantStore();
  const { selectedInterests, checkOnboardingStatus } = useOnboardingStore();

  const [localMessages, setLocalMessages] = useState<AssistantMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const initialised = useRef(false);

  useEffect(() => {
    const init = async () => {
      await hydrate();
      if (selectedInterests.length === 0) {
        await checkOnboardingStatus();
      }

      const history = useAssistantStore.getState().messages;
      if (history.length === 0 && !initialised.current) {
        initialised.current = true;
        const greeting = await addMessage({ role: 'assistant', text: GREETING_TEXT });
        setLocalMessages([greeting]);
      } else {
        initialised.current = true;
        setLocalMessages(history);
      }
    };
    init();
  }, []);

  const sendText = async (text: string) => {
    if (!text.trim() || isThinking) return;

    const userMsg = await addMessage({ role: 'user', text: text.trim() });
    setLocalMessages((prev) => [...prev, userMsg]);

    setIsThinking(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const history = useAssistantStore.getState().messages;
      const responseText = await askAssistant(history, selectedInterests, controller.signal);
      const assistantMsg = await addMessage({ role: 'assistant', text: responseText });
      setLocalMessages((prev) => [...prev, assistantMsg]);
    } catch (e: unknown) {
      if ((e as Error)?.name === 'AbortError') return;
      const errMsg = await addMessage({
        role: 'assistant',
        text: 'I seem to have lost my train of thought. Please try again.',
      });
      setLocalMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
    }
  };

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsThinking(false);
  };

  const handleClearChat = () => {
    Alert.alert('Clear Conversation', 'Remove all messages?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearChat();
          initialised.current = false;
          const greeting = await addMessage({ role: 'assistant', text: GREETING_TEXT });
          setLocalMessages([greeting]);
        },
      },
    ]);
  };

  return { localMessages, isThinking, sendText, handleCancel, handleClearChat };
}
