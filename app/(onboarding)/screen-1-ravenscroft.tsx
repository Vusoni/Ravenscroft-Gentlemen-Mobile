// app/(onboarding)/screen-1-ravenscroft.tsx
import { WritingAnimation } from '@/components/WritingAnimation';
import { router } from 'expo-router';
import { useCallback } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function Screen1Ravenscroft() {
  const handleComplete = useCallback(() => {
    setTimeout(() => {
      router.push('/(onboarding)/screen-2-gentleman');
    }, 1400);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['top', 'bottom']}>
      <Pressable
        className="flex-1 items-center justify-center px-10"
        onPress={() => router.push('/(onboarding)/screen-2-gentleman')}
        accessibilityRole="button"
        accessibilityLabel="Skip animation and continue"
        accessibilityHint="Double tap to skip the writing animation"
      >
        {/* Label above */}
        <Text
          className="text-muted text-[11px] tracking-[0.3em] uppercase mb-4"
          style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
        >
          [Writing Animation]
        </Text>

        {/* Animated headline */}
        <WritingAnimation
          text="Ravenscroft"
          charDelayMs={85}
          onComplete={handleComplete}
          style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 48,
            color: '#0A0A0A',
            letterSpacing: -1,
          }}
        />
      </Pressable>

      {/* Tap hint */}
      <View className="items-center pb-10">
        <Text
          className="text-border text-[10px] tracking-[0.25em] uppercase"
          style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
        >
          Tap anywhere to skip
        </Text>
      </View>
    </SafeAreaView>
  );
}
