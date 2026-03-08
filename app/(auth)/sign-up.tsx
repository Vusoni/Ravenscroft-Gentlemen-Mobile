// app/(auth)/sign-up.tsx
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { router } from 'expo-router';
import { Lock, Mail, Type } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Underline Input ──────────────────────────────────────────────────────────
function UnderlineInput({
  icon,
  placeholder,
  value,
  onChangeText,
  secureTextEntry,
  autoCapitalize,
  keyboardType,
  returnKeyType,
  onSubmitEditing,
  inputRef,
}: {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  returnKeyType?: 'done' | 'next' | 'go';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
}) {
  const lineWidth = useSharedValue(0);

  const handleFocus = useCallback(() => {
    lineWidth.value = withSpring(1, { damping: 18, stiffness: 180 });
  }, []);

  const handleBlur = useCallback(() => {
    lineWidth.value = withSpring(0, { damping: 18, stiffness: 180 });
  }, []);

  const lineStyle = useAnimatedStyle(() => ({
    transform: [{ scaleX: lineWidth.value }],
    opacity: lineWidth.value,
  }));

  return (
    <View style={inputStyles.container}>
      <View style={inputStyles.iconWrap}>{icon}</View>
      <View style={{ flex: 1 }}>
        <TextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#ABABAB"
          secureTextEntry={secureTextEntry}
          autoCapitalize={autoCapitalize ?? 'none'}
          autoCorrect={false}
          keyboardType={keyboardType}
          returnKeyType={returnKeyType ?? 'done'}
          onSubmitEditing={onSubmitEditing}
          onFocus={handleFocus}
          onBlur={handleBlur}
          style={inputStyles.input}
        />
        <View style={inputStyles.staticLine} />
        <Animated.View style={[inputStyles.focusLine, lineStyle]} />
      </View>
    </View>
  );
}

// ─── Sign Up Screen ───────────────────────────────────────────────────────────
export default function SignUp() {
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);
  const { signUp, isLoading, error, clearError } = useAuthStore();
  const checkOnboardingStatus = useOnboardingStore((s) => s.checkOnboardingStatus);

  const buttonScale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (error) clearError();
  }, [displayName, email, password]);

  const triggerShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-6, { duration: 60 }),
      withTiming(6, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  }, []);

  const handleRegister = useCallback(async () => {
    Keyboard.dismiss();
    if (!email.trim() || !password.trim()) { triggerShake(); return; }
    if (password.length < 6) {
      useAuthStore.setState({ error: 'Password must be at least 6 characters.' });
      triggerShake();
      return;
    }
    buttonScale.value = withSpring(0.96, { damping: 15 }, () => {
      'worklet';
      buttonScale.value = withSpring(1, { damping: 15 });
    });
    const ok = await signUp(email.trim(), password, displayName.trim() || undefined);
    if (ok) {
      const onboardingDone = await checkOnboardingStatus();
      router.replace(onboardingDone ? '/(home)' : '/(onboarding)');
    } else {
      triggerShake();
    }
  }, [displayName, email, password, signUp, checkOnboardingStatus, triggerShake]);

  const buttonAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));
  const formShakeStyle = useAnimatedStyle(() => ({ transform: [{ translateX: shakeX.value }] }));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#EDEDED' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Back */}
        <Animated.View
          entering={FadeIn.duration(400)}
          style={{ position: 'absolute', top: insets.top + 16, left: 24 }}
        >
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Text style={styles.backLabel}>← Back</Text>
          </Pressable>
        </Animated.View>

        {/* Wordmark */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{ position: 'absolute', top: insets.top + 20, alignSelf: 'center' }}
        >
          <Text style={styles.wordmark}>RAVENSCROFT</Text>
        </Animated.View>

        <View style={[styles.inner, { paddingBottom: insets.bottom + 40 }]}>
          <Animated.Text entering={FadeInDown.delay(100).duration(500)} style={styles.title}>
            REGISTER
          </Animated.Text>

          <Animated.View
            entering={FadeInDown.delay(200).duration(500)}
            style={[styles.form, formShakeStyle]}
          >
            <UnderlineInput
              icon={<Type size={16} color="#ABABAB" strokeWidth={1.5} />}
              placeholder="Display Name (optional)"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <View style={{ height: 28 }} />

            <UnderlineInput
              icon={<Mail size={16} color="#ABABAB" strokeWidth={1.5} />}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              inputRef={emailRef}
            />

            <View style={{ height: 28 }} />

            <UnderlineInput
              icon={<Lock size={16} color="#ABABAB" strokeWidth={1.5} />}
              placeholder="Password (min. 6 characters)"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={handleRegister}
              inputRef={passwordRef}
            />

            {error ? (
              <Animated.Text entering={FadeIn.duration(300)} style={styles.errorText}>
                {error}
              </Animated.Text>
            ) : (
              <View style={{ height: 22 }} />
            )}

            <Animated.View
              entering={FadeInDown.delay(300).duration(500)}
              style={styles.signInRow}
            >
              <Text style={styles.signInBase}>Already have an account?{' '}</Text>
              <Pressable onPress={() => router.back()} hitSlop={8}>
                <Text style={styles.signInLink}>Sign In</Text>
              </Pressable>
            </Animated.View>
          </Animated.View>

          <Animated.View entering={FadeInDown.delay(400).duration(500)} style={buttonAnimStyle}>
            <AnimatedPressable
              onPress={handleRegister}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.registerButton,
                pressed && { opacity: 0.85 },
                isLoading && { opacity: 0.6 },
              ]}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              {isLoading ? (
                <ActivityIndicator color="#EDEDED" size="small" />
              ) : (
                <Text style={styles.registerButtonLabel}>CREATE ACCOUNT</Text>
              )}
            </AnimatedPressable>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  wordmark: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    letterSpacing: 4,
    color: '#0A0A0A',
    opacity: 0.35,
  },
  backLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#6B6B6B',
    letterSpacing: 0.5,
  },
  inner: {
    flex: 1,
    paddingHorizontal: 36,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    letterSpacing: 3,
    color: '#0A0A0A',
    textAlign: 'center',
    marginBottom: 44,
  },
  form: {
    marginBottom: 32,
  },
  errorText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#B83025',
    textAlign: 'center',
    marginTop: 14,
    height: 22,
  },
  signInRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  signInBase: {
    fontSize: 13,
    color: '#6B6B6B',
    fontFamily: 'PlayfairDisplay_400Regular',
  },
  signInLink: {
    fontSize: 13,
    color: '#5B6AF0',
    fontFamily: 'PlayfairDisplay_700Bold',
  },
  registerButton: {
    backgroundColor: '#0A0A0A',
    borderRadius: 4,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButtonLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13,
    letterSpacing: 3,
    color: '#EDEDED',
  },
});

const inputStyles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 20,
    alignItems: 'center',
    paddingBottom: 2,
  },
  input: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    color: '#0A0A0A',
    paddingVertical: 8,
    paddingRight: 4,
  },
  staticLine: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D4D4D4',
    marginTop: 2,
  },
  focusLine: {
    height: 1.5,
    backgroundColor: '#0A0A0A',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    transformOrigin: 'left',
  },
});
