// app/(home)/(tabs)/profile.tsx
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { useBooksStore } from '@/store/booksStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import {
  Bell,
  BookMarked,
  BookOpen,
  ChevronRight,
  Compass,
  Flame,
  HelpCircle,
  Lock,
  LogOut,
  MoreHorizontal,
  ScrollText,
} from 'lucide-react-native';
import { useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Types ────────────────────────────────────────────────────────────────────
type SettingRow = {
  id: string;
  label: string;
  icon: typeof Bell;
  value?: string;
};

// ─── Section data ─────────────────────────────────────────────────────────────
const ACCOUNT_ROWS: SettingRow[] = [
  { id: 'library',   label: 'My Library',             icon: BookOpen },
  { id: 'bookmarks', label: 'Saved Articles',          icon: BookMarked },
  { id: 'reading',   label: 'Reading History',         icon: ScrollText },
  { id: 'guide',     label: 'The Ravenscroft Guide',   icon: Compass },
];

const SETTINGS_ROWS: SettingRow[] = [
  { id: 'notifications', label: 'Notifications',    icon: Bell, value: 'On' },
  { id: 'privacy',       label: 'Privacy & Security', icon: Lock },
];

const SUPPORT_ROWS: SettingRow[] = [
  { id: 'help',  label: 'Help Center',        icon: HelpCircle },
  { id: 'legal', label: 'Terms & Conditions', icon: ScrollText },
];

const ROW_HANDLERS: Record<string, () => void> = {
  guide: () => router.push('/(home)/app-guide'),
};

// ─── Banner ───────────────────────────────────────────────────────────────────
function BannerHeader({ topInset }: { topInset: number }) {
  return (
    <LinearGradient
      colors={['#0A0A0A', '#181818', '#1C1C1C']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{ height: topInset + 164, paddingTop: topInset }}
    >
      {/* Subtle decorative lines */}
      <View style={{
        position: 'absolute',
        bottom: 0,
        right: 0,
        width: 180,
        height: 180,
        opacity: 0.05,
      }}>
        {[0, 1, 2, 3, 4].map((i) => (
          <View
            key={i}
            style={{
              position: 'absolute',
              bottom: i * 28,
              right: i * 28,
              width: 180 - i * 28,
              height: 180 - i * 28,
              borderRadius: (180 - i * 28) / 2,
              borderWidth: 1,
              borderColor: '#FFFFFF',
            }}
          />
        ))}
      </View>

      {/* Top label row */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 24,
        paddingTop: 18,
      }}>
        <Text style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 11,
          letterSpacing: 3,
          color: 'rgba(237, 237, 237, 0.45)',
          textTransform: 'uppercase',
        }}>
          My Profile
        </Text>
        <Pressable
          hitSlop={12}
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            width: 32,
            height: 32,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: 'rgba(255,255,255,0.12)',
            alignItems: 'center',
            justifyContent: 'center',
          })}
        >
          <MoreHorizontal size={15} color="rgba(237,237,237,0.6)" strokeWidth={1.8} />
        </Pressable>
      </View>
    </LinearGradient>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function FloatingAvatar({ initials }: { initials: string }) {
  return (
    <View style={{
      width: 84,
      height: 84,
      borderRadius: 42,
      padding: 3,
      backgroundColor: '#D4B896',
    }}>
      <View style={{
        flex: 1,
        borderRadius: 39,
        backgroundColor: '#1C1C1C',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <Text style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 26,
          color: '#EDEDED',
          letterSpacing: 1,
        }}>
          {initials}
        </Text>
      </View>
    </View>
  );
}

// ─── User identity block ──────────────────────────────────────────────────────
function UserIdentity({ interests }: { interests: string[] }) {
  const tagline = interests.length > 0
    ? interests.slice(0, 2).join(' & ')
    : 'Ravenscroft Member';

  return (
    <View style={{ paddingHorizontal: 24 }}>
      {/* Avatar row */}
      <View style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginTop: -42,
        marginBottom: 16,
      }}>
        <FloatingAvatar initials="JD" />
        <Pressable
          style={({ pressed }) => ({
            opacity: pressed ? 0.5 : 1,
            borderWidth: 1,
            borderColor: '#D4D4D4',
            borderRadius: 20,
            paddingHorizontal: 16,
            paddingVertical: 7,
            marginBottom: 4,
          })}
        >
          <Text style={{
            fontSize: 12,
            fontWeight: '500',
            color: '#1C1C1C',
            letterSpacing: 0.3,
          }}>
            Edit Profile
          </Text>
        </Pressable>
      </View>

      {/* Name */}
      <Text style={{
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 30,
        color: '#0A0A0A',
        letterSpacing: -0.5,
        lineHeight: 36,
      }}>
        John Doe.
      </Text>

      {/* Tagline */}
      <Text style={{
        fontFamily: 'PlayfairDisplay_400Regular_Italic',
        fontSize: 14,
        color: '#6B6B6B',
        marginTop: 3,
        marginBottom: 12,
      }}>
        {tagline}
      </Text>

      {/* Badge */}
      <View style={{
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 5,
        borderWidth: 1,
        borderColor: '#D4B896',
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 4,
      }}>
        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#D4B896' }} />
        <Text style={{
          fontSize: 9,
          fontFamily: 'PlayfairDisplay_700Bold',
          color: '#D4B896',
          letterSpacing: 1.8,
        }}>
          GENTLEMAN
        </Text>
      </View>
    </View>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────
function StatsRow({
  articlesRead,
  booksSaved,
  interestsCount,
}: {
  articlesRead: number;
  booksSaved: number;
  interestsCount: number;
}) {
  return (
    <View style={{
      flexDirection: 'row',
      marginHorizontal: 24,
      marginTop: 28,
      paddingVertical: 20,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: '#D4D4D4',
    }}>
      <StatCell value={String(articlesRead)} label="Articles" />
      <View style={{ width: 1, backgroundColor: '#D4D4D4', marginVertical: 4 }} />
      <StatCell value={String(booksSaved)} label="Books" />
      <View style={{ width: 1, backgroundColor: '#D4D4D4', marginVertical: 4 }} />
      <StatCell value={String(interestsCount)} label="Interests" />
    </View>
  );
}

function StatCell({ value, label }: { value: string; label: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <Text style={{
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 24,
        color: '#0A0A0A',
        letterSpacing: -0.5,
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: 10,
        color: '#ABABAB',
        letterSpacing: 1.2,
        marginTop: 3,
        textTransform: 'uppercase',
      }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Interest chips ───────────────────────────────────────────────────────────
function InterestChips({ interests }: { interests: string[] }) {
  if (interests.length === 0) return null;
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingVertical: 2 }}
      style={{ marginTop: 18 }}
    >
      {interests.map((tag) => (
        <View key={tag} style={{
          backgroundColor: '#F0EDE8',
          borderRadius: 20,
          paddingHorizontal: 14,
          paddingVertical: 7,
          borderWidth: 1,
          borderColor: '#E8E4DF',
        }}>
          <Text style={{
            fontSize: 12,
            color: '#1C1C1C',
            letterSpacing: 0.2,
          }}>
            {tag}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

// ─── Streak row ───────────────────────────────────────────────────────────────
function StreakRow() {
  return (
    <View style={{
      marginHorizontal: 24,
      marginTop: 20,
      backgroundColor: '#F5F5F5',
      borderRadius: 14,
      overflow: 'hidden',
      flexDirection: 'row',
      alignItems: 'center',
    }}>
      {/* Gold accent line */}
      <View style={{ width: 3, height: '100%', backgroundColor: '#D4B896', position: 'absolute', left: 0 }} />
      <View style={{
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 15,
        paddingLeft: 20,
      }}>
        <Flame size={15} color="#D4B896" strokeWidth={1.5} />
        <Text style={{
          flex: 1,
          fontSize: 14,
          fontWeight: '500',
          color: '#1C1C1C',
          marginLeft: 12,
        }}>
          Reading Streak
        </Text>
        <Text style={{
          fontFamily: 'PlayfairDisplay_400Regular_Italic',
          fontSize: 13,
          color: '#ABABAB',
        }}>
          —
        </Text>
      </View>
    </View>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ title }: { title: string }) {
  return (
    <Text style={{
      fontSize: 10,
      fontWeight: '700',
      letterSpacing: 2.2,
      color: '#ABABAB',
      textTransform: 'uppercase',
      paddingHorizontal: 24,
      paddingTop: 30,
      paddingBottom: 10,
    }}>
      {title}
    </Text>
  );
}

// ─── Setting item ─────────────────────────────────────────────────────────────
function SettingItem({
  index,
  total,
  row,
  onPress,
}: {
  index: number;
  total: number;
  row: SettingRow;
  onPress?: () => void;
}) {
  const Icon = row.icon;
  const isFirst = index === 0;
  const isLast  = index === total - 1;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        backgroundColor: pressed ? '#EFEFEF' : '#F5F5F5',
        borderTopLeftRadius:     isFirst ? 14 : 0,
        borderTopRightRadius:    isFirst ? 14 : 0,
        borderBottomLeftRadius:  isLast  ? 14 : 0,
        borderBottomRightRadius: isLast  ? 14 : 0,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#EBEBEB',
      })}
      accessibilityRole="button"
      accessibilityLabel={row.label}
    >
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#EBEBEB',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
      }}>
        <Icon size={15} color="#1C1C1C" strokeWidth={1.5} />
      </View>

      <Text style={{
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#1C1C1C',
      }}>
        {row.label}
      </Text>

      {row.value && (
        <Text style={{
          fontSize: 13,
          color: '#ABABAB',
          marginRight: 8,
        }}>
          {row.value}
        </Text>
      )}

      <ChevronRight size={14} color="#D4D4D4" strokeWidth={2} />
    </Pressable>
  );
}

// ─── Setting section ──────────────────────────────────────────────────────────
function SettingSection({ title, rows }: { title: string; rows: SettingRow[] }) {
  return (
    <>
      <SectionLabel title={title} />
      <View style={{ marginHorizontal: 24, borderRadius: 14, overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <SettingItem
            key={row.id}
            index={i}
            total={rows.length}
            row={row}
            onPress={ROW_HANDLERS[row.id]}
          />
        ))}
      </View>
    </>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const insets = useSafeAreaInsets();
  const { resetOnboarding, selectedInterests } = useOnboardingStore();
  const { library } = useBooksStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogOut = () => {
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
            await resetOnboarding();
            router.replace('/(onboarding)');
          },
        },
      ],
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: '#EDEDED' }}
      contentContainerStyle={{
        paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom + 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Full-bleed dark banner */}
      <BannerHeader topInset={insets.top} />

      {/* Identity: avatar (overlaps banner) + name + badge */}
      <UserIdentity interests={selectedInterests} />

      {/* Stats */}
      <StatsRow
        articlesRead={12}
        booksSaved={library.length}
        interestsCount={selectedInterests.length}
      />

      {/* Interest chips */}
      <InterestChips interests={selectedInterests} />

      {/* Streak */}
      <StreakRow />

      {/* Account */}
      <SettingSection title="Account" rows={ACCOUNT_ROWS} />

      {/* Settings */}
      <SettingSection title="Settings" rows={SETTINGS_ROWS} />

      {/* Support */}
      <SettingSection title="Support" rows={SUPPORT_ROWS} />

      {/* Sign out */}
      <Pressable
        onPress={handleLogOut}
        disabled={isLoggingOut}
        style={({ pressed }) => ({
          marginHorizontal: 24,
          marginTop: 32,
          marginBottom: 8,
          backgroundColor: pressed || isLoggingOut ? '#F0E0DF' : '#FDF2F2',
          borderWidth: 1,
          borderColor: '#F0CECE',
          borderRadius: 14,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 9,
          paddingVertical: 15,
        })}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <LogOut size={15} color="#C0392B" strokeWidth={1.5} />
        <Text style={{
          fontSize: 15,
          fontWeight: '600',
          color: '#C0392B',
          letterSpacing: 0.2,
        }}>
          Sign Out
        </Text>
      </Pressable>
    </ScrollView>
  );
}
