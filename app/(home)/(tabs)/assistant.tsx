// app/(home)/(tabs)/assistant.tsx — AI lifestyle assistant
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { AssistantMessage, useAssistantStore } from '@/store/assistantStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Briefcase, Heart, MessageCircle, Send, Sparkles, Trash2, Users, X } from 'lucide-react-native';
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
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── API config ───────────────────────────────────────────────────────────────
const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_CONTEXT_MESSAGES = 20;

const SYSTEM_PROMPT = [
  'You are "The Ravenscroft" — a refined, articulate AI assistant for a gentleman\'s lifestyle app.',
  'You help with dating, networking, social etiquette, professional situations, and personal development.',
  'Your tone is warm yet direct — like a well-travelled mentor, not a formal butler.',
  'Be practical and specific. Give actionable advice, not generic platitudes.',
  'Keep responses to 2-4 paragraphs unless the question genuinely requires more depth.',
  'When giving advice about social situations, consider nuance and emotional intelligence.',
  'You may use wit sparingly, but substance always comes first.',
].join('\n');

async function askAssistant(
  messages: AssistantMessage[],
  userInterests: string[],
  signal: AbortSignal,
): Promise<string> {
  const contextLines = [SYSTEM_PROMPT];
  if (userInterests.length > 0) {
    contextLines.push(`\nThe user's interests: ${userInterests.join(', ')}.`);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: contextLines.join('\n'),
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

// ─── Scenario cards ──────────────────────────────────────────────────────────
interface Scenario {
  icon: typeof Heart;
  title: string;
  prompt: string;
}

const SCENARIOS: Scenario[] = [
  {
    icon: Heart,
    title: 'Dating',
    prompt: "I'd like advice on dating. I want to make a great impression — what should I know?",
  },
  {
    icon: Users,
    title: 'Networking',
    prompt: "I have a networking event coming up. How do I approach people naturally and make meaningful connections?",
  },
  {
    icon: Briefcase,
    title: 'Professional',
    prompt: "I need help with a professional situation. How should I handle a difficult workplace conversation?",
  },
  {
    icon: MessageCircle,
    title: 'Etiquette',
    prompt: "I want to improve my social etiquette. What are the fundamentals a modern gentleman should master?",
  },
];

// ─── Thinking dots ───────────────────────────────────────────────────────────
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

// ─── Message bubble ──────────────────────────────────────────────────────────
function MessageBubble({ message }: { message: AssistantMessage }) {
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

// ─── Scenario card ───────────────────────────────────────────────────────────
function ScenarioCard({
  scenario,
  index,
  onPress,
}: {
  scenario: Scenario;
  index: number;
  onPress: () => void;
}) {
  const Icon = scenario.icon;
  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 80).duration(400)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.scenarioCard, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.scenarioIconWrap}>
          <Icon size={18} color="#0A0A0A" strokeWidth={1.5} />
        </View>
        <Text style={styles.scenarioTitle}>{scenario.title}</Text>
      </Pressable>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function AssistantTab() {
  const insets = useSafeAreaInsets();
  const { hydrate, addMessage, clearChat, messages } = useAssistantStore();
  const { selectedInterests, checkOnboardingStatus } = useOnboardingStore();

  const [localMessages, setLocalMessages] = useState<AssistantMessage[]>([]);
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
      await hydrate();
      if (selectedInterests.length === 0) {
        await checkOnboardingStatus();
      }

      const history = useAssistantStore.getState().messages;
      if (history.length === 0 && !initialised.current) {
        initialised.current = true;
        const greeting = await addMessage({
          role: 'assistant',
          text: 'Good day. I\'m here to help you navigate life\'s situations with confidence — whether it\'s a first date, a business dinner, or simply finding the right words. What\'s on your mind?',
        });
        setLocalMessages([greeting]);
      } else {
        initialised.current = true;
        setLocalMessages(history);
      }
      scrollToBottom();
    };
    init();
  }, []);

  const sendText = async (text: string) => {
    if (!text.trim() || isThinking) return;
    const userText = text.trim();
    setInputText('');

    const userMsg = await addMessage({ role: 'user', text: userText });
    setLocalMessages((prev) => [...prev, userMsg]);
    scrollToBottom();

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
      scrollToBottom();
    }
  };

  const handleSend = () => sendText(inputText);

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
          const greeting = await addMessage({
            role: 'assistant',
            text: 'Good day. I\'m here to help you navigate life\'s situations with confidence — whether it\'s a first date, a business dinner, or simply finding the right words. What\'s on your mind?',
          });
          setLocalMessages([greeting]);
        },
      },
    ]);
  };

  const showScenarios = localMessages.length <= 1 && !isThinking;
  const hasMessages = localMessages.length > 1;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEDED' }} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Sparkles size={18} color="#0A0A0A" strokeWidth={1.5} />
          <Text style={styles.headerTitle}>Assistant</Text>
        </View>
        {hasMessages && (
          <Pressable onPress={handleClearChat} hitSlop={12} accessibilityLabel="Clear chat">
            <Trash2 size={16} color="#6B6B6B" strokeWidth={1.5} />
          </Pressable>
        )}
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.flex}
        contentContainerStyle={[
          styles.messagesContent,
          { paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom + 16 },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {localMessages.map((msg) => (
          <MessageBubble key={msg.id} message={msg} />
        ))}
        {isThinking && (
          <View style={[styles.bubbleRow, styles.bubbleRowAssistant]}>
            <View style={[styles.bubble, styles.bubbleAssistant, styles.bubbleThinking]}>
              <ThinkingDots />
            </View>
          </View>
        )}

        {/* Scenario cards — shown when conversation is fresh */}
        {showScenarios && (
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.scenariosSection}>
            <Text style={styles.scenariosLabel}>Choose a topic</Text>
            <View style={styles.scenariosGrid}>
              {SCENARIOS.map((scenario, i) => (
                <ScenarioCard
                  key={scenario.title}
                  scenario={scenario}
                  index={i}
                  onPress={() => sendText(scenario.prompt)}
                />
              ))}
            </View>
          </Animated.View>
        )}
      </ScrollView>

      {/* Input bar */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={[styles.inputBar, { paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom }]}>
          <TextInput
            value={inputText}
            onChangeText={setInputText}
            placeholder="Ask anything..."
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
            style={[styles.sendBtn, { opacity: !inputText.trim() && !isThinking ? 0.4 : 1 }]}
            accessibilityLabel={isThinking ? 'Cancel' : 'Send'}
          >
            {isThinking ? (
              <X size={15} color="#EDEDED" strokeWidth={2} />
            ) : (
              <Send size={15} color="#EDEDED" strokeWidth={2} />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D4D4D4',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#0A0A0A',
  },
  // Messages
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
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
  // Scenarios
  scenariosSection: {
    marginTop: 12,
    paddingHorizontal: 4,
  },
  scenariosLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 10,
    color: '#ABABAB',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  scenariosGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  scenarioCard: {
    width: '47%',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  scenarioIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(10,10,10,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: '#0A0A0A',
  },
  // Input
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 12,
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
