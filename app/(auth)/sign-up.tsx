// app/(auth)/sign-up.tsx
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { router } from 'expo-router';
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
  interpolateColor,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Box Input ────────────────────────────────────────────────────────────────
function BoxInput({
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
}: {
  label: string;
  placeholder?: string;
  value: string;
  onChangeText: (t: string) => void;
  secureTextEntry?: boolean;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  keyboardType?: 'default' | 'email-address';
  returnKeyType?: 'done' | 'next' | 'go';
  onSubmitEditing?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
}) {
  const focused = useSharedValue(0);

  const borderStyle = useAnimatedStyle(() => ({
    borderColor: interpolateColor(focused.value, [0, 1], ['rgba(0,0,0,0)', '#0A0A0A']),
  }));

  return (
    <View style={inputStyles.wrapper}>
      <Text style={inputStyles.label}>{label}</Text>
      <Animated.View style={[inputStyles.box, borderStyle]}>
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
          onFocus={() => { focused.value = withSpring(1, { damping: 18, stiffness: 180 }); }}
          onBlur={() => { focused.value = withSpring(0, { damping: 18, stiffness: 180 }); }}
          style={inputStyles.input}
        />
      </Animated.View>
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

          {/* Title */}
          <Animated.Text entering={FadeInDown.delay(80).duration(500)} style={styles.title}>
            Create account.
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text entering={FadeInDown.delay(160).duration(500)} style={styles.subtitle}>
            Join Ravenscroft and begin your journey.
          </Animated.Text>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(240).duration(500)}
            style={[styles.form, formShakeStyle]}
          >
            <BoxInput
              label="Display Name"
              placeholder="Your name (optional)"
              value={displayName}
              onChangeText={setDisplayName}
              autoCapitalize="words"
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
            />

            <View style={{ height: 16 }} />

            <BoxInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              inputRef={emailRef}
            />

            <View style={{ height: 16 }} />

            <BoxInput
              label="Password"
              placeholder="Min. 6 characters"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={handleRegister}
              inputRef={passwordRef}
            />

            {/* Error */}
            {error ? (
              <Animated.Text entering={FadeIn.duration(300)} style={styles.errorText}>
                {error}
              </Animated.Text>
            ) : (
              <View style={{ height: 18 }} />
            )}

            {/* Sign in link */}
            <View style={styles.signInRow}>
              <Text style={styles.signInBase}>Already have an account?{' '}</Text>
              <Pressable onPress={() => router.back()} hitSlop={8}>
                <Text style={styles.signInLink}>Sign In</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* CREATE ACCOUNT button */}
          <Animated.View
            entering={FadeInDown.delay(360).duration(500)}
            style={buttonAnimStyle}
          >
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

          {/* SIGN IN secondary button */}
          <Animated.View entering={FadeInDown.delay(440).duration(500)} style={{ marginTop: 12 }}>
            <Pressable
              onPress={() => router.back()}
              disabled={isLoading}
              style={({ pressed }) => [styles.signInButton, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              <Text style={styles.signInButtonLabel}>SIGN IN INSTEAD</Text>
            </Pressable>
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
    paddingHorizontal: 32,
    justifyContent: 'center',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 34,
    color: '#0A0A0A',
    marginBottom: 8,
    lineHeight: 40,
  },
  subtitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 22,
    marginBottom: 32,
  },
  form: {
    marginBottom: 24,
  },
  errorText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#B83025',
    textAlign: 'center',
    marginTop: 12,
    height: 20,
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
    borderRadius: 50,
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
  signInButton: {
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
    backgroundColor: 'transparent',
  },
  signInButtonLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13,
    letterSpacing: 3,
    color: '#0A0A0A',
  },
});

const inputStyles = StyleSheet.create({
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
  input: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    color: '#0A0A0A',
    padding: 0,
  },
});
