// components/assistant/AssistantInputBar.tsx
import { Send, X } from 'lucide-react-native';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

export function AssistantInputBar({
  value,
  onChangeText,
  onSend,
  onCancel,
  isThinking,
  paddingBottom,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onSend: () => void;
  onCancel: () => void;
  isThinking: boolean;
  paddingBottom: number;
}) {
  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={[styles.inputBar, { paddingBottom }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Ask anything..."
          placeholderTextColor="#ABABAB"
          multiline
          maxLength={500}
          style={styles.input}
          returnKeyType="send"
          blurOnSubmit={false}
          onSubmitEditing={onSend}
          editable={!isThinking}
        />
        <Pressable
          onPress={isThinking ? onCancel : onSend}
          style={[styles.sendBtn, { opacity: !value.trim() && !isThinking ? 0.4 : 1 }]}
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
  );
}

const styles = StyleSheet.create({
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
