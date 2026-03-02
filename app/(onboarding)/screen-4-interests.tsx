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
    <SafeAreaView className="flex-1 bg-ivory" edges={['bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-2">
          <Text
            className="text-ink text-[22px] leading-7 mb-1"
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          >
            Define your Interests
          </Text>
          <Text
            className="text-ink text-base mb-1"
            style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
          >
            What defines you beyond the surface?
          </Text>
          <Text className="text-muted text-xs leading-4">
            Behind every remarkable man is a collection of pursuits he took seriously. No hobbie
            disciplines — select what speaks to you honestly and we'll shape a routine worthy of it.
          </Text>
        </View>

        {/* Chips */}
        <View className="px-5 py-4 flex-row flex-wrap">
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
          <View className="mx-6 mt-2 p-3 rounded-xl bg-surface border border-border">
            <Text className="text-muted text-xs tracking-widest uppercase mb-1">
              Your pursuits
            </Text>
            <Text
              className="text-ink text-sm leading-5"
              style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
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
