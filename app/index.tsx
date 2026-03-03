// app/index.tsx — onboarding gate
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

export default function Index() {
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [navigating, setNavigating] = useState(false);
  const checkOnboardingStatus = useOnboardingStore((s) => s.checkOnboardingStatus);

  // White overlay fades out revealing ivory beneath, then we navigate
  const overlayOpacity = useSharedValue(1);

  useEffect(() => {
    checkOnboardingStatus().then((complete) => {
      setOnboardingDone(complete);
      // Brief pause so the wordmark is visible, then dissolve (400ms delay + 700ms fade)
      overlayOpacity.value = withDelay(400, withTiming(0, { duration: 700 }));
      setTimeout(() => setNavigating(true), 1100);
    });
  }, [checkOnboardingStatus]);

  const overlayStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value,
  }));

  if (navigating) {
    return <Redirect href={onboardingDone ? '/(home)' : '/(onboarding)'} />;
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
