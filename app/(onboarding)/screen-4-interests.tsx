// app/(onboarding)/screen-4-interests.tsx
import { ContinueButton } from '@/components/ContinueButton';
import { InterestTag } from '@/components/InterestTag';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { useOnboardingStore } from '@/store/onboardingStore';
import { router } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const INTERESTS = [
  'Exercise',
  'Literature',
  'Stoicism',
  'Journaling',
  'Travel & Culture',
  'Music',
  'Theatre & Cinema',
  'Morning Rituals',
];

export default function Screen4Interests() {
  const selectedInterests = useOnboardingStore((s) => s.selectedInterests);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);

  const pursuitsSummary = selectedInterests.join(' · ');

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Centered title + decorative underline */}
        <View className="items-center pt-5 pb-4 px-6">
          <Text
            className="text-ink text-[22px] text-center"
            style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
          >
            Define your Interests
          </Text>
          <View style={{ width: 40, height: 1, backgroundColor: '#0A0A0A', marginTop: 8 }} />
        </View>

        {/* Italic subtitle */}
        <View className="px-6 pb-2">
          <Text
            className="text-ink text-base text-center"
            style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
          >
            What defines you beyond the surface?
          </Text>
        </View>

        {/* Description paragraph */}
        <View className="px-6 pb-4">
          <Text
            className="text-muted text-[13px] leading-5 text-center"
            style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
          >
            Behind every remarkable man is a collection of pursuits he took seriously. Not hobbies —
            disciplines. Select what speaks to you honestly, and we'll shape a routine worthy of it.
          </Text>
        </View>

        {/* Bold statement */}
        <View className="px-6 pb-3">
          <Text
            className="text-ink text-[19px] leading-7"
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          >
            Select a few pursuits{'\n'}that speak to you.{'\n'}We'll handle the rest.
          </Text>
        </View>

        {/* Interest chips */}
        <View className="px-5 pb-4 flex-row flex-wrap">
          {INTERESTS.map((tag) => (
            <InterestTag
              key={tag}
              label={tag}
              selected={selectedInterests.includes(tag)}
              onToggle={() => toggleInterest(tag)}
            />
          ))}
        </View>

        {/* Pursuits summary */}
        {selectedInterests.length > 0 && (
          <View className="mx-5 mb-3 px-4 py-3 bg-ink/5 rounded-xl">
            <Text
              className="text-ink/40 text-[10px] tracking-widest uppercase mb-1"
              style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
            >
              Your selection · {selectedInterests.length}
            </Text>
            <Text
              className="text-ink text-[13px] leading-5"
              style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
            >
              {pursuitsSummary}
            </Text>
          </View>
        )}

        <View className="flex-1" />
      </ScrollView>

      <View>
        <OnboardingProgress total={5} current={2} />
        <ContinueButton
          onPress={() => router.push('/(onboarding)/screen-5-birth')}
          disabled={selectedInterests.length === 0}
        />
      </View>
    </SafeAreaView>
  );
}
