// app/(auth)/sign-up.tsx
import { useSignUp, useSSO, useSignInWithApple } from '@clerk/clerk-expo';
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

// ─── Sign Up Screen ───────────────────────────────────────────────────────────
export default function SignUp() {
  const insets = useSafeAreaInsets();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Email verification step
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');

  const emailRef = useRef<TextInput | null>(null);
  const passwordRef = useRef<TextInput | null>(null);

  const { signUp, setActive, isLoaded } = useSignUp();
  const { startSSOFlow } = useSSO();
  const { startAppleAuthenticationFlow } = useSignInWithApple();
  const checkOnboardingStatus = useOnboardingStore((s) => s.checkOnboardingStatus);

  const buttonScale = useSharedValue(1);
  const secondaryScale = useSharedValue(1);
  const shakeX = useSharedValue(0);

  useEffect(() => {
    if (error) setError(null);
  }, [displayName, email, password, code]);

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
      setError(clerkErr.errors?.[0]?.message ?? 'Apple sign in failed.');
    } finally {
      setIsLoading(false);
    }
  }, [startAppleAuthenticationFlow, navigateAfterAuth]);

  const handleRegister = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    Keyboard.dismiss();
    const cleanEmail = sanitizeEmail(email);
    if (!cleanEmail || !password.trim()) { triggerShake(); return; }
    if (!EMAIL_REGEX.test(cleanEmail)) {
      setError('Please enter a valid email address.');
      triggerShake();
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      triggerShake();
      return;
    }
    buttonScale.value = withSpring(0.96, { damping: 15 }, () => {
      'worklet';
      buttonScale.value = withSpring(1, { damping: 15 });
    });
    setIsLoading(true);
    try {
      const result = await signUp.create({
        emailAddress: cleanEmail,
        password,
        firstName: displayName.trim() || undefined,
      });
      if (result.status === 'complete') {
        await setActive!({ session: result.createdSessionId });
        await navigateAfterAuth();
      } else {
        // Email verification required
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { longMessage?: string; message: string }[] };
      const msg = clerkErr.errors?.[0]?.longMessage ?? clerkErr.errors?.[0]?.message ?? 'Registration failed.';
      setError(msg);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }, [displayName, email, password, isLoaded, signUp, setActive, navigateAfterAuth, triggerShake]);

  const handleVerification = useCallback(async () => {
    if (!isLoaded || !signUp) return;
    Keyboard.dismiss();
    if (!code.trim()) { triggerShake(); return; }
    setIsLoading(true);
    try {
      const result = await signUp.attemptEmailAddressVerification({ code });
      if (result.status === 'complete') {
        await setActive!({ session: result.createdSessionId });
        await navigateAfterAuth();
      } else {
        setError('Verification incomplete. Please try again.');
        triggerShake();
      }
    } catch (err: unknown) {
      const clerkErr = err as { errors?: { longMessage?: string; message: string }[] };
      const msg = clerkErr.errors?.[0]?.longMessage ?? clerkErr.errors?.[0]?.message ?? 'Invalid code.';
      setError(msg);
      triggerShake();
    } finally {
      setIsLoading(false);
    }
  }, [code, isLoaded, signUp, setActive, navigateAfterAuth, triggerShake]);

  const buttonAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: buttonScale.value }] }));
  const secondaryAnimStyle = useAnimatedStyle(() => ({ transform: [{ scale: secondaryScale.value }] }));
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
          style={{ position: 'absolute', top: insets.top + 16, left: 24, zIndex: 10 }}
        >
          <Pressable
            onPress={() => pendingVerification ? setPendingVerification(false) : router.back()}
            hitSlop={12}
            style={({ pressed }) => ({ opacity: pressed ? 0.5 : 1 })}
          >
            <Text style={styles.backLabel}>← Back</Text>
          </Pressable>
        </Animated.View>

        {/* Wordmark */}
        <Animated.View
          entering={FadeIn.duration(600)}
          style={{ position: 'absolute', top: insets.top + 20, alignSelf: 'center', zIndex: 10 }}
        >
          <Text style={styles.wordmark}>RAVENSCROFT</Text>
        </Animated.View>

        {pendingVerification ? (
          /* ── Email Verification Step ── */
          <ScrollView
            contentContainerStyle={[styles.inner, { paddingTop: insets.top + 72 }]}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            <Animated.Text entering={FadeInDown.delay(80).duration(500)} style={styles.title}>
              Check your email.
            </Animated.Text>
            <Animated.Text entering={FadeInDown.delay(120).duration(500)} style={styles.subtitle}>
              We sent a 6-digit code to {email.trim().toLowerCase()}. Enter it below to verify your account.
            </Animated.Text>

            <Animated.View entering={FadeInDown.delay(200).duration(500)}>
              <Animated.View style={[styles.form, formShakeStyle]}>
                <BoxInput
                  label="Verification Code"
                  placeholder="000000"
                  value={code}
                  onChangeText={setCode}
                  keyboardType="number-pad"
                  textContentType="oneTimeCode"
                  returnKeyType="go"
                  onSubmitEditing={handleVerification}
                />

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
        ) : (
          /* ── Main Sign Up Form ── */
          <ScrollView
            contentContainerStyle={[styles.inner, { paddingTop: insets.top + 72 }]}
            keyboardShouldPersistTaps="handled"
            bounces={false}
            showsVerticalScrollIndicator={false}
          >
            {/* Title */}
            <Animated.Text entering={FadeInDown.delay(80).duration(500)} style={styles.title}>
              Create account.
            </Animated.Text>

            {/* Subtitle */}
            <Animated.Text entering={FadeInDown.delay(120).duration(500)} style={styles.subtitle}>
              Join Ravenscroft and begin your journey.
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
                label="Display Name"
                placeholder="Your name (optional)"
                value={displayName}
                onChangeText={setDisplayName}
                autoCapitalize="words"
                textContentType="name"
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
                textContentType="emailAddress"
                onSubmitEditing={() => passwordRef.current?.focus()}
                inputRef={emailRef}
              />

              <View style={{ height: 16 }} />

              <BoxInput
                label="Password"
                placeholder="Min. 8 characters"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                returnKeyType="go"
                onSubmitEditing={handleRegister}
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
        )}

        {/* ── Bottom actions — always visible above keyboard ── */}
        <Animated.View entering={FadeIn.duration(500)} style={[styles.bottomActions, { paddingBottom: insets.bottom + 24 }]}>
          <Animated.View style={buttonAnimStyle}>
            <AnimatedPressable
              onPress={pendingVerification ? handleVerification : handleRegister}
              disabled={isLoading}
              style={({ pressed }) => [
                styles.registerButton,
                pressed && { opacity: 0.85 },
                isLoading && { opacity: 0.6 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={pendingVerification ? 'Verify email' : 'Create account'}
            >
              {isLoading ? (
                <ActivityIndicator color="#EDEDED" size="small" />
              ) : (
                <Text style={styles.registerButtonLabel}>
                  {pendingVerification ? 'VERIFY EMAIL' : 'CONTINUE'}
                </Text>
              )}
            </AnimatedPressable>
          </Animated.View>

          {!pendingVerification && (
            <AnimatedPressable
              onPress={() => router.back()}
              disabled={isLoading}
              onPressIn={() => { secondaryScale.value = withSpring(0.97, { damping: 14, stiffness: 200 }); }}
              onPressOut={() => { secondaryScale.value = withSpring(1, { damping: 14, stiffness: 200 }); }}
              style={[styles.secondaryButton, secondaryAnimStyle, { marginTop: 14 }]}
              accessibilityRole="button"
              accessibilityLabel="Sign in"
            >
              <Text style={styles.secondaryLabel}>Sign In Instead</Text>
            </AnimatedPressable>
          )}
        </Animated.View>
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
    flexGrow: 1,
    paddingHorizontal: 24,
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
    marginBottom: 28,
  },

  // ── OAuth row ──
  oauthRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 4,
  },

  form: {
    marginBottom: 4,
  },
  errorText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#B83025',
    textAlign: 'center',
    marginTop: 12,
    height: 20,
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
  bottomActions: {
    paddingHorizontal: 24,
    paddingTop: 12,
  },
});

