// components/auth/BoxInput.tsx
// Shared animated text input for auth screens.
// Uses sign-up's superset prop type (adds number-pad, name, oneTimeCode).
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Animated, {
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface BoxInputProps {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address' | 'number-pad';
  returnKeyType?: 'done' | 'next' | 'go';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
  textContentType?: 'emailAddress' | 'password' | 'newPassword' | 'name' | 'oneTimeCode' | 'none';
  rightIcon?: React.ReactNode;
}

export function BoxInput({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  returnKeyType,
  onSubmitEditing,
  inputRef,
  textContentType,
  rightIcon,
}: BoxInputProps) {
  const focused = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focused.value, [0, 1], ['rgba(0,0,0,0)', '#0A0A0A']),
  }));

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <Animated.View style={[styles.box, borderStyle]}>
        <View style={styles.inputRow}>
          <TextInput
            ref={inputRef}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor="#ABABAB"
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize ?? 'none'}
            autoCorrect={false}
            spellCheck={false}
            keyboardType={keyboardType}
            returnKeyType={returnKeyType ?? 'done'}
            textContentType={textContentType ?? 'none'}
            onSubmitEditing={onSubmitEditing}
            onFocus={() => { focused.value = withSpring(1, { damping: 18, stiffness: 180 }); }}
            onBlur={() => { focused.value = withSpring(0, { damping: 18, stiffness: 180 }); }}
            style={styles.input}
          />
          {rightIcon}
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 6,
  },
  label: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
    letterSpacing: 0.3,
  },
  box: {
    backgroundColor: '#F0F0EE',
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  input: {
    flex: 1,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    color: '#0A0A0A',
    padding: 0,
  },
});
