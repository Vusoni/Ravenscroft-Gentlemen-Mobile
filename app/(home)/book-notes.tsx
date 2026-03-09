// app/(home)/book-notes.tsx — AI literary companion chat
import { ChatMessage, useChatStore } from '@/store/chatStore';
import { useKindleStore } from '@/store/kindleStore';
import { useNotesStore } from '@/store/notesStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Book } from '@/types/book';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Send, Trash2, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── API config ───────────────────────────────────────────────────────────────
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_CONTEXT_MESSAGES = 20;

async function askClaude(
  messages: ChatMessage[],
  book: Book,
  userNoteTexts: string[],
  kindleHighlightTexts: string[],
  userInterests: string[],
  signal: AbortSignal,
): Promise<string> {
  const systemPrompt = [
    `You are a literary companion discussing "${book.title}" by ${book.author}.`,
    "Help the reader understand themes, reflect on what they've read, and connect ideas to their own life.",
    'Be concise, thoughtful, and conversational — like a well-read friend, not a professor.',
    'Keep responses to 2-4 paragraphs unless the question genuinely requires more depth.',
    userInterests.length > 0
      ? `\nThe reader's interests: ${userInterests.join(', ')}.`
      : '',
    userNoteTexts.length > 0
      ? `\nThe reader's personal notes:\n${userNoteTexts.map((n) => `- ${n}`).join('\n')}`
      : '',
    kindleHighlightTexts.length > 0
      ? `\nThe reader's Kindle highlights:\n${kindleHighlightTexts.map((h) => `- "${h}"`).join('\n')}`
      : '',
  ]
    .filter(Boolean)
    .join('\n');

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-opus-4-6',
      max_tokens: 1024,
      system: systemPrompt,
      messages: messages.slice(-MAX_CONTEXT_MESSAGES).map((m) => ({
        role: m.role,
        content: m.text,
      })),
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`API ${response.status}: ${body}`);
  }

  const data = await response.json();
  return (data.content[0]?.text as string) ?? '';
}

// ─── Thinking dots animation ──────────────────────────────────────────────────
function ThinkingDots() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const pulse = (val: typeof dot1, delay: number) => {
      setTimeout(() => {
        val.value = withRepeat(
          withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
          -1,
          false,
        );
      }, delay);
    };
    pulse(dot1, 0);
    pulse(dot2, 160);
    pulse(dot3, 320);
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.thinkingRow}>
      <Animated.View style={[styles.thinkingDot, s1]} />
      <Animated.View style={[styles.thinkingDot, s2]} />
      <Animated.View style={[styles.thinkingDot, s3]} />
    </View>
  );
}

// ─── Message bubble ───────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === 'user';
  return (
    <View style={[styles.bubbleRow, isUser ? styles.bubbleRowUser : styles.bubbleRowAssistant]}>
      <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAssistant]}>
        <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAssistant]}>
          {message.text}
        </Text>
      </View>
    </View>
  );
}

// ─── Suggested prompt chip ────────────────────────────────────────────────────
function PromptChip({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.promptChip, pressed && { opacity: 0.65 }]}
      accessibilityRole="button"
    >
      <Text style={styles.promptChipText} numberOfLines={2}>{label}</Text>
    </Pressable>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function BookNotesScreen() {
  const params = useLocalSearchParams<{ book: string }>();
  const book: Book = JSON.parse(params.book);

  const { hydrate: hydrateChat, addMessage, clearChat, getMessages } = useChatStore();
  const { hydrate: hydrateNotes, getNotesForBook } = useNotesStore();
  const { selectedInterests, checkOnboardingStatus } = useOnboardingStore();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const initialised = useRef(false);

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    const init = async () => {
      await hydrateChat();
      await hydrateNotes();
      // Ensure interests are loaded from storage
      if (selectedInterests.length === 0) {
        await checkOnboardingStatus();
      }

      const history = getMessages(book.id);
      if (history.length === 0 && !initialised.current) {
        initialised.current = true;
        const greeting = await addMessage(book.id, {
          role: 'assistant',
          text: `Good day. I've been waiting to discuss "${book.title}". What aspects of the book are on your mind?`,
        });
        setMessages([greeting]);
      } else {
        initialised.current = true;
        setMessages(history);
      }
      scrollToBottom();
    };
    init();
  }, []);

  // Suggested prompts — tailored to book + user interests
  const suggestedPrompts = [
    `What did you enjoy most about "${book.title}"?`,
    `What are the key themes I should understand in this book?`,
    selectedInterests.length > 0
      ? `How can I apply the wisdom from this book given my interest in ${selectedInterests.slice(0, 2).join(' and ')}?`
      : `How can I apply the wisdom from "${book.title}" in everyday life?`,
    `Who would benefit most from reading "${book.title}"?`,
  ];

  const sendText = async (text: string) => {
    if (!text.trim() || isThinking) return;
    const userText = text.trim();
    setInputText('');

    const userMsg = await addMessage(book.id, { role: 'user', text: userText });
    setMessages((prev) => [...prev, userMsg]);
    scrollToBottom();

    setIsThinking(true);
    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const history = getMessages(book.id);
      const userNotes = getNotesForBook(book.id).map((n) => n.text);
      const kindleHighlights = useKindleStore
        .getState()
        .getClippingsForLibraryBook(book.id)
        .filter((c) => c.type === 'highlight')
        .slice(0, 20)
        .map((c) => c.text);
      const responseText = await askClaude(history, book, userNotes, kindleHighlights, selectedInterests, controller.signal);

      const assistantMsg = await addMessage(book.id, { role: 'assistant', text: responseText });
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e: unknown) {
      if ((e as Error)?.name === 'AbortError') return;
      const errMsg = await addMessage(book.id, {
        role: 'assistant',
        text: 'I seem to have lost my train of thought. Please try again.',
      });
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
      abortControllerRef.current = null;
      scrollToBottom();
    }
  };

  const handleSend = () => sendText(inputText);

  const handleCancel = () => {
    abortControllerRef.current?.abort();
    setIsThinking(false);
  };

  const handleClearChat = () => {
    Alert.alert('Clear Conversation', 'Remove all messages for this book?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: async () => {
          await clearChat(book.id);
          setMessages([]);
        },
      },
    ]);
  };

  const showPromptChips = messages.length <= 1 && !isThinking;
  const hasMessages = messages.length > 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEDED' }} edges={['top', 'bottom']}>
      {/* Nav */}
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.back()}
          style={styles.navBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={16} color="#6B6B6B" strokeWidth={1.5} />
          <Text numberOfLines={1} style={styles.navTitle}>{book.title}</Text>
        </Pressable>
        {hasMessages && (
          <Pressable onPress={handleClearChat} hitSlop={12} accessibilityLabel="Clear chat">
            <Trash2 size={16} color="#6B6B6B" strokeWidth={1.5} />
          </Pressable>
        )}
      </View>

      {/* Book context pill */}
      <View style={styles.contextPill}>
        <Text style={styles.contextPillText}>{book.author}</Text>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.flex}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {messages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isThinking && (
          <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
            <View style={[styles.bubble, styles.bubbleAssistant, styles.bubbleThinking]}>
              <ThinkingDots />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Suggested prompts */}
      {showPromptChips && (
        <View style={styles.promptsWrapper}>
          <Text style={styles.promptsLabel}>Suggested</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.promptsScroll}
          >
            {suggestedPrompts.map((prompt, i) => (
              <PromptChip
                key={i}
                label={prompt}
                onPress={() => sendText(prompt)}
              />
            ))}
          </ScrollView>
        </View>
      )}

      {/* Input bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.inputBar}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder={`Ask about ${book.title}...`}
            placeholderTextColor="#ABABAB"
            multiline
            maxLength={500}
            style={styles.input}
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSend}
            editable={!isThinking}
          />
          <Pressable
            onPress={isThinking ? handleCancel : handleSend}
            style={[styles.sendBtn, { opacity: (!inputText.trim() && !isThinking) ? 0.4 : 1 }]}
            accessibilityLabel={isThinking ? 'Cancel' : 'Send'}
          >
            {isThinking
              ? <X size={15} color="#EDEDED" strokeWidth={2} />
              : <Send size={15} color="#EDEDED" strokeWidth={2} />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D4D4D4',
    backgroundColor: '#EDEDED',
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    marginRight: 12,
  },
  navTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#6B6B6B',
    flex: 1,
  },
  contextPill: {
    alignSelf: 'center',
    backgroundColor: 'rgba(10,10,10,0.06)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginTop: 10,
    marginBottom: 4,
  },
  contextPillText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#6B6B6B',
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 10,
  },
  bubbleRow: {
    width: '100%',
    flexDirection: 'row',
  },
  bubbleRowUser: {
    justifyContent: 'flex-end',
  },
  bubbleRowAssistant: {
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    padding: 14,
  },
  bubbleUser: {
    backgroundColor: '#0A0A0A',
    borderBottomRightRadius: 4,
  },
  bubbleAssistant: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderBottomLeftRadius: 4,
  },
  bubbleThinking: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  bubbleText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  bubbleTextUser: {
    color: '#EDEDED',
  },
  bubbleTextAssistant: {
    color: '#1C1C1C',
  },
  thinkingRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  thinkingDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#6B6B6B',
  },
  // Suggested prompts
  promptsWrapper: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D4D4D4',
    paddingTop: 10,
    paddingBottom: 6,
    backgroundColor: '#EDEDED',
  },
  promptsLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 10,
    color: '#ABABAB',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  promptsScroll: {
    paddingHorizontal: 12,
    gap: 8,
  },
  promptChip: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    maxWidth: 220,
  },
  promptChipText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#1C1C1C',
    lineHeight: 17,
  },
  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 10,
    backgroundColor: '#EDEDED',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#D4D4D4',
  },
  input: {
    flex: 1,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#0A0A0A',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    maxHeight: 120,
    lineHeight: 20,
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
});
