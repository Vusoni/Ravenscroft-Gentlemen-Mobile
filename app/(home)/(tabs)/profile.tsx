// app/(home)/(tabs)/profile.tsx
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { useOnboardingStore } from '@/store/onboardingStore';
import { router } from 'expo-router';
import { LogOut, User } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ProfileTab() {
  const insets = useSafeAreaInsets();
  const resetOnboarding = useOnboardingStore((s) => s.resetOnboarding);

  const handleLogOut = async () => {
    await resetOnboarding();
    router.replace('/(onboarding)');
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['top']}>
      <View className="flex-1 items-center justify-center px-8">
        <User size={36} color="#D4D4D4" strokeWidth={1} />
        <Text
          className="text-ink text-2xl mt-5 mb-2"
          style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
        >
          Profile
        </Text>
        <Text
          className="text-muted text-sm text-center leading-5"
          style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
        >
          The measure of a man is his character.
        </Text>
        <Text className="text-border text-xs mt-2 tracking-widest uppercase">
          Coming soon
        </Text>

        <Pressable
          onPress={handleLogOut}
          className="flex-row items-center gap-2 mt-10 px-5 py-3 rounded-full border border-border"
          accessibilityRole="button"
          accessibilityLabel="Log out and restart onboarding"
        >
          <LogOut size={14} color="#6B6B6B" strokeWidth={1.5} />
          <Text className="text-muted text-xs tracking-widest uppercase">
            Log Out
          </Text>
        </Pressable>
      </View>
      <View style={{ height: TAB_BAR_BOTTOM_OFFSET + insets.bottom }} />
    </SafeAreaView>
  );
}
