// app/(home)/(tabs)/profile.tsx
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { useOnboardingStore } from '@/store/onboardingStore';
import { router } from 'expo-router';
import {
  Bell,
  BookMarked,
  ChevronRight,
  HelpCircle,
  Lock,
  LogOut,
  ScrollText,
  Star,
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
  { id: 'interests', label: 'My Interests',        icon: Star },
  { id: 'bookmarks', label: 'Saved Articles',       icon: BookMarked },
  { id: 'reading',   label: 'Reading History',      icon: ScrollText },
];

const SETTINGS_ROWS: SettingRow[] = [
  { id: 'notifications', label: 'Notifications', icon: Bell,  value: 'On' },
  { id: 'privacy',       label: 'Privacy & Security', icon: Lock },
];

const SUPPORT_ROWS: SettingRow[] = [
  { id: 'help',  label: 'Help Center',      icon: HelpCircle },
  { id: 'legal', label: 'Terms & Conditions', icon: ScrollText },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionLabel({ title }: { title: string }) {
  return (
    <Text style={{
      fontSize: 11,
      fontWeight: '600',
      letterSpacing: 1.8,
      color: '#ABABAB',
      textTransform: 'uppercase',
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 10,
    }}>
      {title}
    </Text>
  );
}

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
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: pressed ? '#F0F0F0' : '#F5F5F5',
        borderTopLeftRadius:  isFirst ? 14 : 0,
        borderTopRightRadius: isFirst ? 14 : 0,
        borderBottomLeftRadius:  isLast ? 14 : 0,
        borderBottomRightRadius: isLast ? 14 : 0,
        borderBottomWidth: isLast ? 0 : 1,
        borderBottomColor: '#E8E8E8',
      })}
      accessibilityRole="button"
      accessibilityLabel={row.label}
    >
      {/* Index number */}
      <Text style={{
        fontSize: 11,
        color: '#ABABAB',
        width: 18,
      }}>
        {index + 1}
      </Text>

      {/* Icon */}
      <View style={{ marginRight: 12 }}>
        <Icon size={16} color="#6B6B6B" strokeWidth={1.5} />
      </View>

      {/* Label */}
      <Text style={{
        flex: 1,
        fontSize: 15,
        fontWeight: '500',
        color: '#1C1C1C',
      }}>
        {row.label}
      </Text>

      {/* Optional value */}
      {row.value && (
        <Text style={{
          fontSize: 14,
          color: '#6B6B6B',
          marginRight: 8,
        }}>
          {row.value}
        </Text>
      )}

      <ChevronRight size={14} color="#D4D4D4" strokeWidth={1.5} />
    </Pressable>
  );
}

function SettingSection({
  title,
  rows,
}: {
  title: string;
  rows: SettingRow[];
}) {
  return (
    <>
      <SectionLabel title={title} />
      <View style={{ marginHorizontal: 20, borderRadius: 14, overflow: 'hidden' }}>
        {rows.map((row, i) => (
          <SettingItem
            key={row.id}
            index={i}
            total={rows.length}
            row={row}
          />
        ))}
      </View>
    </>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ initials }: { initials: string }) {
  return (
    <View style={{
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: '#0A0A0A',
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
  );
}

// ─── Stat pill ────────────────────────────────────────────────────────────────
function StatPill({ value, label }: { value: string; label: string }) {
  return (
    <View style={{
      flex: 1,
      backgroundColor: '#F5F5F5',
      borderRadius: 14,
      paddingVertical: 14,
      alignItems: 'center',
      gap: 3,
    }}>
      <Text style={{
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 22,
        color: '#0A0A0A',
      }}>
        {value}
      </Text>
      <Text style={{
        fontSize: 11,
        color: '#6B6B6B',
      }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const insets = useSafeAreaInsets();
  const { resetOnboarding, selectedInterests } = useOnboardingStore();
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
        paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* ── Safe-area top spacer ── */}
      <View style={{ height: insets.top + 12 }} />

      {/* ── Header: name + avatar ── */}
      <View style={{ paddingHorizontal: 24, paddingTop: 8, paddingBottom: 4 }}>
        {/* Large serif name */}
        <Text style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 34,
          color: '#0A0A0A',
          letterSpacing: -0.5,
          lineHeight: 40,
        }}>
          John Doe.
        </Text>
        <Text style={{
          fontFamily: 'PlayfairDisplay_400Regular_Italic',
          fontSize: 13,
          color: '#6B6B6B',
          marginTop: 3,
          marginBottom: 20,
        }}>
          Member since 2024
        </Text>

        {/* Avatar row */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <Avatar initials="JD" />
          <View style={{ flex: 1, gap: 3 }}>
            <Text style={{
              fontSize: 16,
              fontWeight: '600',
              color: '#0A0A0A',
            }}>
              John Doe
            </Text>
            <Text style={{
              fontSize: 13,
              color: '#6B6B6B',
              marginTop: 1,
            }}>
              john.doe@example.com
            </Text>
            {selectedInterests.length > 0 && (
              <Text style={{
                fontSize: 12,
                color: '#ABABAB',
                marginTop: 3,
              }} numberOfLines={1}>
                {selectedInterests.slice(0, 3).join(' · ')}
              </Text>
            )}
          </View>
        </View>
      </View>

      {/* ── Stats row ── */}
      <View style={{ flexDirection: 'row', gap: 10, marginHorizontal: 20, marginTop: 22 }}>
        <StatPill value="12" label="articles read" />
        <StatPill value="4"  label="books saved" />
        <StatPill value={String(selectedInterests.length || 0)} label="interests" />
      </View>

      {/* ── Divider ── */}
      <View style={{ height: 1, backgroundColor: '#E0E0E0', marginHorizontal: 24, marginTop: 28 }} />

      {/* ── Account section ── */}
      <SettingSection title="Account" rows={ACCOUNT_ROWS} />

      {/* ── Settings section ── */}
      <SettingSection title="Settings" rows={SETTINGS_ROWS} />

      {/* ── Support section ── */}
      <SettingSection title="Support" rows={SUPPORT_ROWS} />

      {/* ── Log out ── */}
      <Pressable
        onPress={handleLogOut}
        disabled={isLoggingOut}
        style={({ pressed }) => ({
          alignSelf: 'center',
          marginTop: 32,
          marginBottom: 8,
          opacity: pressed || isLoggingOut ? 0.5 : 1,
        })}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
          <LogOut size={13} color="#C0392B" strokeWidth={1.5} />
          <Text style={{
            fontSize: 13,
            fontWeight: '500',
            color: '#C0392B',
            letterSpacing: 0.3,
          }}>
            Log Out
          </Text>
        </View>
      </Pressable>
    </ScrollView>
  );
}