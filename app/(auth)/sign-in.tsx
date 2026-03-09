// app/(auth)/sign-in.tsx
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import * as AppleAuthentication from 'expo-apple-authentication';
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
import Svg, { Path } from 'react-native-svg';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Google G icon ─────────────────────────────────────────────────────────
function GoogleIcon({ size = 18 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 48 48">
      <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </Svg>
  );
}

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

// ─── OAuth button ─────────────────────────────────────────────────────────────
function OAuthButton({
  onPress,
  disabled,
  icon,
  label,
}: {
  onPress: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      style={[styles.oauthButton, disabled && { opacity: 0.5 }, animStyle]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
      <Text style={styles.oauthLabel}>{label}</Text>
    </AnimatedPressable>
  );
}

// ─── Sign In Screen ───────────────────────────────────────────────────────────
export default function SignIn() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [appleAvailable, setAppleAvailable] = useState(false);
  const passwordRef = useRef<TextInput | null>(null);
  const { signIn, signInWithGoogle, signInWithApple, isLoading, error, clearError } = useAuthStore();
  const checkOnboardingStatus = useOnboardingStore((s) => s.checkOnboardingStatus);

  const buttonScale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => setAppleAvailable(false));
  }, []);

  useEffect(() => {
    if (error) clearError();
  }, [email, password]);

  const triggerShake = useCallback(() => {
    shakeX.value = withSequence(
      withTiming(-8, { duration: 60 }),
      withTiming(8, { duration: 60 }),
      withTiming(-6, { duration: 60 }),
      withTiming(6, { duration: 60 }),
      withTiming(0, { duration: 60 }),
    );
  }, []);

  const navigateAfterAuth = useCallback(async () => {
    const onboardingDone = await checkOnboardingStatus();
    router.replace(onboardingDone ? '/(home)' : '/(onboarding)');
  }, [checkOnboardingStatus]);

  const handleLogin = useCallback(async () => {
    Keyboard.dismiss();
    if (!email.trim() || !password.trim()) { triggerShake(); return; }
    buttonScale.value = withSpring(0.96, { damping: 15 }, () => {
      'worklet';
      buttonScale.value = withSpring(1, { damping: 15 });
    });
    const ok = await signIn(email.trim(), password);
    if (ok) { await navigateAfterAuth(); } else { triggerShake(); }
  }, [email, password, signIn, navigateAfterAuth, triggerShake]);

  const handleGoogle = useCallback(async () => {
    const ok = await signInWithGoogle();
    if (ok) await navigateAfterAuth();
  }, [signInWithGoogle, navigateAfterAuth]);

  const handleApple = useCallback(async () => {
    const ok = await signInWithApple();
    if (ok) await navigateAfterAuth();
  }, [signInWithApple, navigateAfterAuth]);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const formShakeStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shakeX.value }],
  }));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1, backgroundColor: '#EDEDED' }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Wordmark */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{ position: 'absolute', top: insets.top + 20, alignSelf: 'center' }}
        >
          <Text style={styles.wordmark}>RAVENSCROFT</Text>
        </Animated.View>

        <View style={[styles.inner, { paddingBottom: insets.bottom + 32 }]}>

          {/* Title */}
          <Animated.Text entering={FadeInDown.delay(80).duration(500)} style={styles.title}>
            Welcome Back.
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text entering={FadeInDown.delay(160).duration(500)} style={styles.subtitle}>
            Sign in to continue your pursuit of excellence.
          </Animated.Text>

          {/* OAuth row — side by side, ABOVE form */}
          <Animated.View
            entering={FadeInDown.delay(240).duration(500)}
            style={styles.oauthRow}
          >
            <OAuthButton
              onPress={handleGoogle}
              disabled={isLoading}
              icon={<GoogleIcon size={17} />}
              label="Google"
            />
            {Platform.OS === 'ios' && appleAvailable && (
              <AppleAuthentication.AppleAuthenticationButton
                buttonType={AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN}
                buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE_OUTLINE}
                cornerRadius={50}
                style={styles.appleButton}
                onPress={handleApple}
              />
            )}
          </Animated.View>

          {/* "or" divider */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(500)}
            style={styles.orRow}
          >
            <Text style={styles.orLabel}>or</Text>
          </Animated.View>

          {/* Form */}
          <Animated.View
            entering={FadeInDown.delay(360).duration(500)}
            style={[styles.form, formShakeStyle]}
          >
            <BoxInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <View style={{ height: 16 }} />

            <BoxInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              returnKeyType="go"
              onSubmitEditing={handleLogin}
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

            {/* Register link */}
            <View style={styles.registerRow}>
              <Text style={styles.registerBase}>Don&apos;t have an account?{' '}</Text>
              <Pressable onPress={() => router.push('/(auth)/sign-up')} hitSlop={8}>
                <Text style={styles.registerLink}>Register Here</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* SIGN IN button */}
          <Animated.View
            entering={FadeInDown.delay(440).duration(500)}
            style={buttonAnimStyle}
          >
            <AnimatedPressable
              onPress={handleLogin}
              disabled={isLoading}
              style={({ pressed }) => [styles.loginButton, pressed && { opacity: 0.85 }, isLoading && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              {isLoading ? (
                <ActivityIndicator color="#EDEDED" size="small" />
              ) : (
                <Text style={styles.loginButtonLabel}>SIGN IN</Text>
              )}
            </AnimatedPressable>
          </Animated.View>

          {/* CREATE ACCOUNT secondary button */}
          <Animated.View entering={FadeInDown.delay(520).duration(500)} style={{ marginTop: 12 }}>
            <Pressable
              onPress={() => router.push('/(auth)/sign-up')}
              disabled={isLoading}
              style={({ pressed }) => [styles.createAccountButton, pressed && { opacity: 0.6 }]}
              accessibilityRole="button"
              accessibilityLabel="Create account"
            >
              <Text style={styles.createAccountLabel}>CREATE ACCOUNT</Text>
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

  // OAuth row
  oauthRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },
  oauthButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingVertical: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
      },
      android: { elevation: 2 },
    }),
  },
  oauthLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#1C1C1C',
    letterSpacing: 0.2,
  },
  appleButton: {
    flex: 1,
    height: 50,
  },

  // "or" divider
  orRow: {
    alignItems: 'center',
    marginVertical: 20,
  },
  orLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#ABABAB',
    letterSpacing: 0.5,
  },

  // Form
  form: {
    marginBottom: 20,
  },
  errorText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#B83025',
    textAlign: 'center',
    marginTop: 12,
    height: 20,
  },
  registerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
  },
  registerBase: {
    fontSize: 13,
    color: '#6B6B6B',
    fontFamily: 'PlayfairDisplay_400Regular',
  },
  registerLink: {
    fontSize: 13,
    color: '#5B6AF0',
    fontFamily: 'PlayfairDisplay_700Bold',
  },

  // CTA
  loginButton: {
    backgroundColor: '#0A0A0A',
    borderRadius: 50,
    paddingVertical: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13,
    letterSpacing: 3,
    color: '#EDEDED',
  },
  createAccountButton: {
    borderRadius: 50,
    paddingVertical: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
    backgroundColor: 'transparent',
  },
  createAccountLabel: {
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
