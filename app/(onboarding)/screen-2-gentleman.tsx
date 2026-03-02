// app/(onboarding)/screen-2-gentleman.tsx
import { ContinueButton } from '@/components/ContinueButton';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { router } from 'expo-router';
import { Dimensions, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { height: SCREEN_H } = Dimensions.get('window');
const HERO_HEIGHT = SCREEN_H * 0.52;

export default function Screen2Gentleman() {
  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['bottom']}>
      {/* Hero — full bleed B&W photo placeholder */}
      <View
        style={{ height: HERO_HEIGHT }}
        className="w-full bg-charcoal overflow-hidden"
      >
        {/* Grain texture effect using nested views */}
        <View className="absolute inset-0 bg-black/20" />
        <View className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/30 to-transparent" />

        {/* Placeholder label — remove when real photo is added */}
        <View className="flex-1 items-center justify-center">
          <Text
            className="text-white/20 text-[10px] tracking-[0.3em] uppercase"
            style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
          >
            Photo: The Gentleman
          </Text>
        </View>
      </View>

      {/* Content below hero */}
      <View className="flex-1 justify-between px-6 pt-6">
        <View className="gap-3">
          <Text
            className="text-ink text-[26px] leading-[34px]"
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          >
            You already know the man you should be.
          </Text>

          <Text
            className="text-muted text-[14px] leading-5"
            style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
          >
            Every great man was once a boy who decided enough was enough.
          </Text>
        </View>

        <View>
          <OnboardingProgress total={5} current={0} />
          <ContinueButton onPress={() => router.push('/(onboarding)/screen-3-soundtrack')} />
        </View>
      </View>
    </SafeAreaView>
  );
}
