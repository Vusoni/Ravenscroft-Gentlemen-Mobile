// app/(onboarding)/screen-5-birth.tsx
import { ContinueButton } from '@/components/ContinueButton';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { useOnboardingStore } from '@/store/onboardingStore';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
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
    if (date) {
      setDOB(date);
      Haptics.selectionAsync();
    }
  };

  const handleGetStarted = async () => {
    await completeOnboarding();
    router.replace('/(home)');
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['top', 'bottom']}>
      <View className="flex-1 justify-between">
        {/* Header — large centered title */}
        <View className="items-center px-6 pt-8">
          <Text
            className="text-ink text-[28px] leading-9 text-center"
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          >
            When did your{'\n'}story begin?
          </Text>
          <View style={{ width: 40, height: 1, backgroundColor: '#0A0A0A', marginTop: 10 }} />

          <Text
            className="text-ink text-base text-center mt-5"
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          >
            Select your date of birth.
          </Text>
        </View>

        {/* Date picker — iOS spinner drum-roll */}
        <View className="items-center py-4">
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

        {/* Privacy notice */}
        <View className="px-8">
          <Text
            className="text-muted/70 text-[11px] text-center leading-[18px]"
            style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
          >
            Please refer to our{' '}
            <Text style={{ textDecorationLine: 'underline' }}>Privacy notice</Text>
            {' '}for further information on how we process this data.
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
