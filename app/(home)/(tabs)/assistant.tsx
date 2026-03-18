// app/(home)/(tabs)/assistant.tsx — AI lifestyle assistant
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { AssistantInputBar } from '@/components/assistant/AssistantInputBar';
import { MessageBubble } from '@/components/assistant/MessageBubble';
import { ScenarioCard, SCENARIOS } from '@/components/assistant/ScenarioCard';
import { ThinkingDots } from '@/components/assistant/ThinkingDots';
import { useAssistantChat } from '@/hooks/useAssistantChat';
import { Sparkles, Trash2 } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function AssistantTab() {
  const insets = useSafeAreaInsets();
  const { localMessages, isThinking, sendText, handleCancel, handleClearChat } = useAssistantChat();
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    const t = setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    return () => clearTimeout(t);
  }, [localMessages, isThinking]);

  const handleSend = () => {
    if (!inputText.trim()) return;
    sendText(inputText);
    setInputText('');
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

        {isThinking && <ThinkingDots />}

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

      <AssistantInputBar
        value={inputText}
        onChangeText={setInputText}
        onSend={handleSend}
        onCancel={handleCancel}
        isThinking={isThinking}
        paddingBottom={TAB_BAR_BOTTOM_OFFSET + insets.bottom}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
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
  messagesContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
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
});
