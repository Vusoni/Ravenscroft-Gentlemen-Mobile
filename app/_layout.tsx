// app/_layout.tsx
import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_700Bold,
  PlayfairDisplay_700Bold_Italic,
  useFonts,
} from '@expo-google-fonts/playfair-display';
import { ClerkProvider, useAuth, useUser } from '@clerk/clerk-expo';
import { useAuthStore } from '@/store/authStore';
import * as SecureStore from 'expo-secure-store';
import { SplashScreen, Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

SplashScreen.preventAutoHideAsync();

const tokenCache = {
  async getToken(key: string) {
    return SecureStore.getItemAsync(key);
  },
  async saveToken(key: string, value: string) {
    return SecureStore.setItemAsync(key, value);
  },
  async clearToken(key: string) {
    return SecureStore.deleteItemAsync(key);
  },
};

// Syncs Clerk auth state → Zustand store. Must live inside <ClerkProvider>.
function ClerkAuthSync() {
  const { signOut: clerkSignOut, isSignedIn, isLoaded } = useAuth();
  const { user: clerkUser } = useUser();
  const setUser = useAuthStore((s) => s.setUser);
  const setSignOut = useAuthStore((s) => s.setSignOut);

  useEffect(() => {
    if (!isLoaded) return;
    if (isSignedIn && clerkUser) {
      setUser({
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? '',
        displayName:
          clerkUser.fullName ??
          clerkUser.firstName ??
          clerkUser.primaryEmailAddress?.emailAddress?.split('@')[0] ??
          '',
      });
    } else {
      setUser(null);
    }
  }, [isSignedIn, isLoaded, clerkUser, setUser]);

  useEffect(() => {
    setSignOut(async () => {
      await clerkSignOut();
    });
  }, [clerkSignOut, setSignOut]);

  return null;
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_700Bold_Italic,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <ClerkProvider
      publishableKey={process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!}
      tokenCache={tokenCache}
    >
      <GestureHandlerRootView className="flex-1">
        <SafeAreaProvider>
          <ClerkAuthSync />
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, animation: 'fade' }}>
            <Stack.Screen name="index" />
            <Stack.Screen name="(auth)" />
            <Stack.Screen name="(onboarding)" />
            <Stack.Screen name="(home)" />
          </Stack>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}
