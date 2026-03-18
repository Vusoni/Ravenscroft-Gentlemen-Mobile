// app/(auth)/sign-in.tsx
import { useSignIn, useSSO, useSignInWithApple } from '@clerk/clerk-expo';
import { useOnboardingStore } from '@/store/onboardingStore';
import { AuthDivider } from '@/components/auth/AuthDivider';
import { AppleIcon } from '@/components/auth/AppleIcon';
import { BoxInput } from '@/components/auth/BoxInput';
import { GoogleIcon } from '@/components/auth/GoogleIcon';
import { OAuthButton } from '@/components/auth/OAuthButton';
import { sanitizeEmail, EMAIL_REGEX } from '@/utils/validation';
import { buttonShadow } from '@/utils/shadows';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { router } from 'expo-router';
import { Eye, EyeOff } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
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

// Required for OAuth web browser redirect to complete
WebBrowser.maybeCompleteAuthSession();

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Sign In Screen ───────────────────────────────────────────────────────────
export default function SignIn() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput | null>(null);

  const { signIn, setActive, isLoaded } = useSignIn();
  const { startSSOFlow } = useSSO();
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const checkOnboardingStatus = useOnboardingStore((s) => s.checkOnboardingStatus);

  const buttonScale = useSharedValue(1);
  const secondaryScale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (error) setError(null);
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
    if (!isLoaded || !signIn) return;
    Keyboard.dismiss();
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail || !password.trim()) { triggerShake(); return; }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      triggerShake();
      return;
    }
    buttonScale.value = withSpring(0.96, { damping: 15 }, () => {
      'worklet';
      buttonScale.value = withSpring(1, { damping: 15 });
    });
    setIsLoading(true);
    try {
      const result = await signIn.create({ identifier: cleanEmail, password });
      if (result.status === 'complete') {
        await setActive!({ session: result.createdSessionId });
        await navigateAfterAuth();
      } else {
        setError('Sign in incomplete. Please try again.');
        triggerShake();
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { longMessage?: string; message: string }[] };
      const msg = clerkErr.errors?.[0]?.longMessage ?? clerkErr.errors?.[0]?.message ?? 'Sign in failed.';
      setError(msg);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }, [email, password, isLoaded, signIn, setActive, navigateAfterAuth, triggerShake]);

  const handleGoogle = useCallback(async () => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive: sa } = await startSSOFlow({
        strategy: 'oauth_google',
        redirectUrl: makeRedirectUri(),
      });
      if (createdSessionId && sa) {
        await sa({ session: createdSessionId });
        await navigateAfterAuth();
      }
    } catch {
      setError('Google sign in failed.');
    } finally {
      setIsLoading(false);
    }
  }, [startSSOFlow, navigateAfterAuth]);

  const handleApple = useCallback(async () => {
    setIsLoading(true);
    try {
      const { createdSessionId, setActive: sa } = await startAppleAuthenticationFlow();
      if (createdSessionId && sa) {
        await sa({ session: createdSessionId });
        await navigateAfterAuth();
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { message: string }[] };
      const msg = clerkErr.errors?.[0]?.message ?? 'Apple sign in failed.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [startAppleAuthenticationFlow, navigateAfterAuth]);

  const buttonAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const secondaryAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: secondaryScale.value }],
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
        <ScrollView
          contentContainerStyle={[
            styles.inner,
            { paddingTop: insets.top + 48, paddingBottom: insets.bottom + 32 },
          ]}
          keyboardShouldPersistTaps="handled"
          bounces={false}
          showsVerticalScrollIndicator={false}
        >
          {/* Wordmark */}
          <Animated.View entering={FadeIn.duration(600)} style={styles.wordmarkRow}>
            <Text style={styles.wordmark}>RAVENSCROFT</Text>
            <View style={styles.hairline} />
          </Animated.View>

          {/* Title */}
          <Animated.Text entering={FadeInDown.delay(80).duration(500)} style={styles.title}>
            Welcome Back.
          </Animated.Text>

          {/* Subtitle */}
          <Animated.Text entering={FadeInDown.delay(120).duration(500)} style={styles.subtitle}>
            Sign in to continue your pursuit of excellence.
          </Animated.Text>

          {/* OAuth row */}
          <Animated.View entering={FadeInDown.delay(160).duration(500)} style={styles.oauthRow}>
            <OAuthButton
              onPress={handleGoogle}
              disabled={isLoading}
              icon={<GoogleIcon size={17} />}
              label="Google"
            />
            {Platform.OS === 'ios' && (
              <OAuthButton
                onPress={handleApple}
                disabled={isLoading}
                icon={<AppleIcon size={17} />}
                label="Apple"
              />
            )}
          </Animated.View>

          {/* "or" divider */}
          <Animated.View entering={FadeInDown.delay(240).duration(500)}>
            <AuthDivider />
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.delay(320).duration(500)}>
          <Animated.View style={[styles.form, formShakeStyle]}>
            <BoxInput
              label="Email Address"
              placeholder="your@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              returnKeyType="next"
              textContentType="emailAddress"
              onSubmitEditing={() => passwordRef.current?.focus()}
            />

            <View style={{ height: 16 }} />

            <BoxInput
              label="Password"
              placeholder="••••••••"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              returnKeyType="go"
              onSubmitEditing={handleLogin}
              inputRef={passwordRef}
              rightIcon={
                <Pressable
                  onPress={() => setShowPassword((v) => !v)}
                  hitSlop={8}
                  accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff size={18} color="#6B6B6B" strokeWidth={1.5} />
                  ) : (
                    <Eye size={18} color="#6B6B6B" strokeWidth={1.5} />
                  )}
                </Pressable>
              }
            />

            {/* Forgot password */}
            <Pressable
              onPress={() => {/* TODO: forgot password flow */}}
              hitSlop={8}
              style={styles.forgotRow}
            >
              <Text style={styles.forgotText}>Forgot password?</Text>
            </Pressable>

            {/* Error */}
            {error ? (
              <Animated.Text entering={FadeIn.duration(300)} style={styles.errorText}>
                {error}
              </Animated.Text>
            ) : (
              <View style={{ height: 18 }} />
            )}
          </Animated.View>
          </Animated.View>

        </ScrollView>

        {/* ── Bottom actions — always visible above keyboard ── */}
        <Animated.View entering={FadeIn.duration(500)} style={[styles.bottomActions, { paddingBottom: insets.bottom + 24 }]}>
          <Animated.View style={buttonAnimStyle}>
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
                <Text style={styles.loginButtonLabel}>CONTINUE</Text>
              )}
            </AnimatedPressable>
          </Animated.View>

          <AnimatedPressable
            onPress={() => router.push('/(auth)/sign-up')}
            disabled={isLoading}
            onPressIn={() => { secondaryScale.value = withSpring(0.97, { damping: 14, stiffness: 200 }); }}
            onPressOut={() => { secondaryScale.value = withSpring(1, { damping: 14, stiffness: 200 }); }}
            style={[styles.secondaryButton, secondaryAnimStyle, { marginTop: 14 }]}
            accessibilityRole="button"
            accessibilityLabel="Create account"
          >
            <Text style={styles.secondaryLabel}>Create Account Instead</Text>
            <Text style={styles.secondaryArrow}>→</Text>
          </AnimatedPressable>
        </Animated.View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  // ── Layout ──
  inner: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  wordmarkRow: {
    alignItems: 'center',
    marginBottom: 32,
  },
  wordmark: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    letterSpacing: 4,
    color: '#0A0A0A',
    opacity: 0.4,
    marginBottom: 12,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D4D4D4',
    width: 60,
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 34,
    color: '#0A0A0A',
    lineHeight: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 22,
    marginBottom: 28,
  },

  // ── OAuth row ──
  oauthRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },

  // ── Form ──
  form: {
    marginBottom: 20,
  },
  forgotRow: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
    letterSpacing: 0.2,
  },
  errorText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#B83025',
    textAlign: 'center',
    marginTop: 12,
    height: 20,
  },

  // ── CTA ──
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
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 50,
    paddingVertical: 16,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.8)',
    ...buttonShadow,
  },
  secondaryLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    letterSpacing: 1,
    color: '#1C1C1C',
  },
  secondaryArrow: {
    fontSize: 16,
    color: '#6B6B6B',
    marginTop: -1,
  },
  bottomActions: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});

