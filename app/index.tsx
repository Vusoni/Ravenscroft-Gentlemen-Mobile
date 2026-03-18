// app/index.tsx — auth + onboarding gate
import { useAuth } from '@clerk/clerk-expo';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

type Destination = '/(auth)/sign-in' | '/(onboarding)' | '/(home)';

export default function Index() {
  const [destination, setDestination] = useState<Destination | null>(null);
  const [navigating, setNavigating] = useState(false);
  const { isSignedIn, isLoaded } = useAuth();
  const checkOnboardingStatus = useOnboardingStore((s) => s.checkOnboardingStatus);

  // White overlay fades out revealing ivory beneath, then we navigate
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    if (!isLoaded) return;

    (async () => {
      if (!isSignedIn) {
        setDestination('/(auth)/sign-in');
      } else {
        const onboardingDone = await checkOnboardingStatus();
        setDestination(onboardingDone ? '/(home)' : '/(onboarding)');
      }
      // Brief pause so the wordmark is visible, then dissolve
      overlayOpacity.value = withDelay(400, withTiming(0, { duration: 700 }));
      setTimeout(() => setNavigating(true), 1100);
    })();
  }, [isLoaded, isSignedIn, checkOnboardingStatus]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (navigating && destination) {
    return <Redirect href={destination} />;
  }

  return (
    // Ivory base — visible as the white overlay dissolves
    <View style={styles.base}>
      <Animated.View style={[styles.overlay, overlayStyle]}>
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_400Regular',
            fontSize: 18,
            color: '#0A0A0A',
            letterSpacing: 4,
          }}
        >
          RAVENSCROFT
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    flex: 1,
    backgroundColor: '#EDEDED', // ivory
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
