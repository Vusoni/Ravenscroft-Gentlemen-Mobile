// app/(home)/(tabs)/profile.tsx
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { BannerHeader } from '@/components/profile/BannerHeader';
import { EditInterestsModal } from '@/components/profile/EditInterestsModal';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { InterestChips } from '@/components/profile/InterestChips';
import { type SettingRow } from '@/components/profile/SettingItem';
import { SettingSection } from '@/components/profile/SettingSection';
import { SignOutButton } from '@/components/profile/SignOutButton';
import { SoundtrackCard } from '@/components/profile/SoundtrackCard';
import { StatsRow } from '@/components/profile/StatsRow';
import { StreakRow } from '@/components/profile/StreakRow';
import { UserIdentity } from '@/components/profile/UserIdentity';
import { useAuthStore } from '@/store/authStore';
import { useBooksStore } from '@/store/booksStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import {
  Bell,
  BookMarked,
  BookOpen,
  Compass,
  FileText,
  HelpCircle,
  Layers,
  Lock,
  ScrollText,
  Shirt,
} from 'lucide-react-native';
import { useCallback, useState } from 'react';
import { Alert, ScrollView } from 'react-native';
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);

// ─── Section data ─────────────────────────────────────────────────────────────
const ACCOUNT_ROWS: SettingRow[] = [
  { id: 'library',    label: 'My Library',            icon: BookOpen },
  { id: 'bookmarks',  label: 'Saved Articles',        icon: BookMarked },
  { id: 'reading',    label: 'Reading History',       icon: ScrollText },
  { id: 'appearance', label: 'My Appearance',         icon: Shirt },
  { id: 'wardrobe',   label: 'My Wardrobe',           icon: Layers },
  { id: 'kindle',     label: 'Kindle Highlights',      icon: FileText },
  { id: 'guide',      label: 'The Ravenscroft Guide', icon: Compass },
];

const SETTINGS_ROWS: SettingRow[] = [
  { id: 'notifications', label: 'Notifications',     icon: Bell, value: 'On' },
  { id: 'privacy',       label: 'Privacy & Security', icon: Lock },
];

const SUPPORT_ROWS: SettingRow[] = [
  { id: 'help',  label: 'Help Center',        icon: HelpCircle },
  { id: 'legal', label: 'Terms & Conditions', icon: ScrollText },
];

const ROW_HANDLERS: Record<string, () => void> = {
  kindle:     () => router.push('/(home)/kindle-import'),
  guide:      () => router.push('/(home)/app-guide'),
  appearance: () => router.push('/(home)/appearance-setup'),
  wardrobe:   () => router.push('/(home)/wardrobe'),
};

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const insets = useSafeAreaInsets();
  const { selectedInterests } = useOnboardingStore();
  const signOut = useAuthStore((s) => s.signOut);
  const { library } = useBooksStore();

  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [editInterestsVisible, setEditInterestsVisible] = useState(false);
  const [editProfileVisible, setEditProfileVisible] = useState(false);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(null);

  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const handlePickPhoto = useCallback(async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setProfilePhoto(result.assets[0].uri);
    }
  }, []);

  const handleLogOut = useCallback(() => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            setIsLoggingOut(true);
            await signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ],
    );
  }, [signOut]);

  return (
    <>
      <AnimatedScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={{ flex: 1, backgroundColor: '#EDEDED' }}
        contentContainerStyle={{ paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
      >
        <BannerHeader topInset={insets.top} scrollY={scrollY} />

        <UserIdentity
          interests={selectedInterests}
          photoUri={profilePhoto}
          onPickPhoto={handlePickPhoto}
          onEditProfile={() => setEditProfileVisible(true)}
        />

        <StatsRow
          articlesRead={12}
          booksSaved={library.length}
          interestsCount={selectedInterests.length}
        />

        <InterestChips
          interests={selectedInterests}
          onEdit={() => setEditInterestsVisible(true)}
        />

        <SoundtrackCard />
        <StreakRow />

        <SettingSection
          title="Account"
          rows={ACCOUNT_ROWS}
          delay={750}
          onRowPress={(id) => ROW_HANDLERS[id]?.()}
        />
        <SettingSection
          title="Settings"
          rows={SETTINGS_ROWS}
          delay={850}
          onRowPress={(id) => ROW_HANDLERS[id]?.()}
        />
        <SettingSection
          title="Support"
          rows={SUPPORT_ROWS}
          delay={950}
          onRowPress={(id) => ROW_HANDLERS[id]?.()}
        />

        <SignOutButton onPress={handleLogOut} disabled={isLoggingOut} />
      </AnimatedScrollView>

      <EditInterestsModal
        visible={editInterestsVisible}
        onClose={() => setEditInterestsVisible(false)}
      />
      <EditProfileModal
        visible={editProfileVisible}
        onClose={() => setEditProfileVisible(false)}
      />
    </>
  );
}
