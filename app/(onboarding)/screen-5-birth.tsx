// app/(onboarding)/screen-5-birth.tsx
import { ContinueButton } from '@/components/ContinueButton';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { useOnboardingStore } from '@/store/onboardingStore';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { router } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const MIN_DATE = new Date(1920, 0, 1);
const MAX_DATE = new Date();

export default function Screen5Birth() {
  const dateOfBirth = useOnboardingStore((s) => s.dateOfBirth);
  const setDOB = useOnboardingStore((s) => s.setDOB);
  const completeOnboarding = useOnboardingStore((s) => s.completeOnboarding);

  const currentDate = dateOfBirth ?? new Date(1995, 1, 18);

  const handleChange = (_event: DateTimePickerEvent, date?: Date) => {
    if (date) setDOB(date);
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(home)');
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['bottom']}>
      <View className="flex-1 justify-between">
        {/* Header */}
        <View className="px-6 pt-6">
          <Text
            className="text-ink text-[22px] leading-7 mb-2"
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          >
            When did your story begin?
          </Text>
          <Text
            className="text-muted text-sm"
            style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
          >
            Select your date of birth.
          </Text>
        </View>

        {/* Date picker — iOS spinner style matches Figma drum-roll */}
        <View className="items-center py-6">
          <DateTimePicker
            value={currentDate}
            mode="date"
            display="spinner"
            onChange={handleChange}
            minimumDate={MIN_DATE}
            maximumDate={MAX_DATE}
            themeVariant="light"
            style={{ width: 320, height: 180 }}
            textColor="#0A0A0A"
          />
        </View>

        {/* Privacy note */}
        <View className="px-6">
          <Text
            className="text-muted/70 text-[11px] text-center leading-4"
            style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
          >
            Your date of birth is used only to personalise your experience. It is never shared.
          </Text>
        </View>

        <View>
          <OnboardingProgress total={5} current={3} />
          <ContinueButton label="Get Started" onPress={handleGetStarted} />
        </View>
      </View>
    </SafeAreaView>
  );
}
