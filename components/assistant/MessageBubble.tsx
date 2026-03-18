// components/assistant/MessageBubble.tsx
import { AssistantMessage } from '@/store/assistantStore';
import { StyleSheet, Text, View } from 'react-native';

export function MessageBubble({ message }: { message: AssistantMessage }) {
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

const styles = StyleSheet.create({
  bubbleRow: {
    width: '100%',
    flexDirection: 'row',
  },
  bubbleRowUser: { justifyContent: 'flex-end' },
  bubbleRowAssistant: { justifyContent: 'flex-start' },
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
  bubbleText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    lineHeight: 22,
  },
  bubbleTextUser: { color: '#EDEDED' },
  bubbleTextAssistant: { color: '#1C1C1C' },
});
