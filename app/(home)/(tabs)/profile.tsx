// app/(home)/(tabs)/profile.tsx
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { GlassCard } from '@/components/GlassCard';
import { INTERESTS } from '@/constants/interests';
import { InterestTag } from '@/components/InterestTag';
import { useAuthStore } from '@/store/authStore';
import { useBooksStore } from '@/store/booksStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useSoundtrackStore } from '@/store/soundtrackStore';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Bell,
  BookMarked,
  BookOpen,
  ChevronRight,
  Compass,
  FileText,
  Flame,
  HelpCircle,
  Layers,
  Lock,
  LogOut,
  MoreHorizontal,
  Music,
  PenLine,
  ScrollText,
  Shirt,
  X,
} from 'lucide-react-native';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  type SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedScrollView = Animated.createAnimatedComponent(ScrollView);
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Types ────────────────────────────────────────────────────────────────────
type SettingRow = {
  id: string;
  label: string;
  icon: typeof Bell;
  value?: string;
};

// ─── Section data ─────────────────────────────────────────────────────────────
const ACCOUNT_ROWS: SettingRow[] = [
  { id: 'library',    label: 'My Library',             icon: BookOpen },
  { id: 'bookmarks',  label: 'Saved Articles',         icon: BookMarked },
  { id: 'reading',    label: 'Reading History',        icon: ScrollText },
  { id: 'appearance', label: 'My Appearance',          icon: Shirt },
  { id: 'wardrobe',   label: 'My Wardrobe',            icon: Layers },
  { id: 'kindle',     label: 'Kindle Highlights',       icon: FileText },
  { id: 'guide',      label: 'The Ravenscroft Guide',  icon: Compass },
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
  kindle:     () => router.push('/(home)/kindle-import'),
  guide:      () => router.push('/(home)/app-guide'),
  appearance: () => router.push('/(home)/appearance-setup'),
  wardrobe:   () => router.push('/(home)/wardrobe'),
};

// ─── Animated Counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, delay = 0 }: { target: number; delay?: number }) {
  const count = useSharedValue(0);

  useEffect(() => {
    count.value = withDelay(delay, withTiming(target, { duration: 800 }));
  }, [target]);

  const animStyle = useAnimatedStyle(() => ({
    opacity: 1,
  }));

  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const end = target;
      if (end === 0) { setDisplayed(0); return; }
      const duration = 800;
      const stepTime = Math.max(Math.floor(duration / end), 30);
      const interval = setInterval(() => {
        start += 1;
        setDisplayed(start);
        if (start >= end) clearInterval(interval);
      }, stepTime);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay]);

  return (
    <Animated.Text style={[{
      fontFamily: 'PlayfairDisplay_700Bold',
      fontSize: 24,
      color: '#0A0A0A',
      letterSpacing: -0.5,
    }, animStyle]}>
      {displayed}
    </Animated.Text>
  );
}

// ─── Banner ───────────────────────────────────────────────────────────────────
function BannerHeader({ topInset, scrollY }: { topInset: number; scrollY: SharedValue<number> }) {
  const bannerHeight = topInset + 164;

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [-100, 0, 200], [50, 0, -40]) }],
    opacity: interpolate(scrollY.value, [0, 160], [1, 0.6]),
  }));

  return (
    <Animated.View style={parallaxStyle}>
      <LinearGradient
        colors={['#0A0A0A', '#151515', '#1C1C1C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: bannerHeight, paddingTop: topInset }}
      >
        {/* Decorative concentric arcs */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 180,
          height: 180,
          opacity: 0.04,
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

        {/* Top row */}
        <Animated.View
          entering={FadeIn.delay(100).duration(500)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 18,
          }}
        >
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
              borderColor: 'rgba(255,255,255,0.18)',
              backgroundColor: 'rgba(255,255,255,0.08)',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <MoreHorizontal size={15} color="rgba(237,237,237,0.6)" strokeWidth={1.8} />
          </Pressable>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function FloatingAvatar({ initials }: { initials: string }) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 120 }));
    opacity.value = withDelay(200, withTiming(1, { duration: 400 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{
      width: 84,
      height: 84,
      borderRadius: 42,
    }, animStyle]}>
      {/* Gradient shimmer ring */}
      <LinearGradient
        colors={['#D4B896', 'rgba(212,184,150,0.35)', '#D4B896']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          width: 84,
          height: 84,
          borderRadius: 42,
          padding: 3,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <View style={{
          width: 78,
          height: 78,
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
      </LinearGradient>
    </Animated.View>
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
        <Animated.View entering={FadeInDown.delay(400).duration(400).springify()}>
          {/* Glass Edit Profile button */}
          <View style={profileStyles.editBtnShadow}>
            <Pressable
              onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
              style={({ pressed }) => [profileStyles.editBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              {Platform.OS === 'ios' && (
                <BlurView
                  intensity={48}
                  tint="systemChromeMaterialLight"
                  style={StyleSheet.absoluteFill}
                />
              )}
              <View style={[StyleSheet.absoluteFill, profileStyles.editBtnFill]} pointerEvents="none" />
              <Text style={profileStyles.editBtnLabel}>Edit Profile</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      {/* Name */}
      <Animated.Text
        entering={FadeInDown.delay(300).duration(500)}
        style={{
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 30,
          color: '#0A0A0A',
          letterSpacing: -0.5,
          lineHeight: 36,
        }}
      >
        John Doe.
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        entering={FadeInDown.delay(400).duration(500)}
        style={{
          fontFamily: 'PlayfairDisplay_400Regular_Italic',
          fontSize: 14,
          color: '#6B6B6B',
          marginTop: 3,
          marginBottom: 12,
        }}
      >
        {tagline}
      </Animated.Text>

      {/* Badge */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(500)}
        style={{
          alignSelf: 'flex-start',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 5,
          borderWidth: 1,
          borderColor: 'rgba(212,184,150,0.6)',
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
          backgroundColor: 'rgba(212,184,150,0.08)',
        }}
      >
        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#D4B896' }} />
        <Text style={{
          fontSize: 9,
          fontFamily: 'PlayfairDisplay_700Bold',
          color: '#D4B896',
          letterSpacing: 1.8,
        }}>
          GENTLEMAN
        </Text>
      </Animated.View>
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
    <Animated.View
      entering={FadeInUp.delay(550).duration(500)}
      style={{ marginHorizontal: 24, marginTop: 28 }}
    >
      <GlassCard intensity={50} borderRadius={20} fillColor="rgba(255,255,255,0.58)">
        <View style={{
          flexDirection: 'row',
          paddingVertical: 20,
        }}>
          <StatCell value={articlesRead} label="Articles" delay={600} />
          <View style={{ width: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 4 }} />
          <StatCell value={booksSaved} label="Books" delay={700} />
          <View style={{ width: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 4 }} />
          <StatCell value={interestsCount} label="Interests" delay={800} />
        </View>
      </GlassCard>
    </Animated.View>
  );
}

function StatCell({ value, label, delay }: { value: number; label: string; delay: number }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <AnimatedCounter target={value} delay={delay} />
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
function InterestChips({ interests, onEdit }: { interests: string[]; onEdit: () => void }) {
  if (interests.length === 0) return null;
  return (
    <Animated.View entering={FadeInDown.delay(650).duration(500)}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 24, gap: 8, paddingVertical: 4 }}
        style={{ marginTop: 16 }}
      >
        <Pressable
          onPress={onEdit}
          style={[profileStyles.chip, { flexDirection: 'row', alignItems: 'center', gap: 4 }]}
        >
          {Platform.OS === 'ios' && (
            <BlurView
              intensity={40}
              tint="systemChromeMaterialLight"
              style={StyleSheet.absoluteFill}
            />
          )}
          <View style={[StyleSheet.absoluteFill, profileStyles.chipFill]} pointerEvents="none" />
          <PenLine size={11} color="#1C1C1C" strokeWidth={1.8} />
          <Text style={profileStyles.chipLabel}>Edit</Text>
        </Pressable>
        {interests.map((tag) => (
          <View
            key={tag}
            style={profileStyles.chip}
          >
            {Platform.OS === 'ios' && (
              <BlurView
                intensity={40}
                tint="systemChromeMaterialLight"
                style={StyleSheet.absoluteFill}
              />
            )}
            <View style={[StyleSheet.absoluteFill, profileStyles.chipFill]} pointerEvents="none" />
            <Text style={profileStyles.chipLabel}>{tag}</Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}

// ─── Edit Interests Modal ────────────────────────────────────────────────────
function EditInterestsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const selectedInterests = useOnboardingStore((s) => s.selectedInterests);
  const toggleInterest = useOnboardingStore((s) => s.toggleInterest);

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEDED' }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 }}>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#0A0A0A' }}>
            Edit Interests
          </Text>
          <Pressable onPress={onClose} hitSlop={12}>
            <X size={22} color="#0A0A0A" strokeWidth={1.8} />
          </Pressable>
        </View>

        {/* Interest tags */}
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', flexWrap: 'wrap' }}>
          {INTERESTS.map((tag) => (
            <InterestTag
              key={tag}
              label={tag}
              selected={selectedInterests.includes(tag)}
              onToggle={() => toggleInterest(tag)}
            />
          ))}
        </View>

        {/* Summary */}
        {selectedInterests.length > 0 && (
          <View style={{ marginHorizontal: 20, marginTop: 20, backgroundColor: 'rgba(10,10,10,0.05)', borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12 }}>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 10, color: 'rgba(10,10,10,0.4)', letterSpacing: 1.6, textTransform: 'uppercase', marginBottom: 4 }}>
              Your selection · {selectedInterests.length}
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 13, color: '#0A0A0A', lineHeight: 20 }}>
              {selectedInterests.join(' · ')}
            </Text>
          </View>
        )}
      </SafeAreaView>
    </Modal>
  );
}

// ─── Soundtrack card ─────────────────────────────────────────────────────────
function SoundtrackCard() {
  const selectedSong = useSoundtrackStore((s) => s.selectedSong);
  const hydrated = useSoundtrackStore((s) => s.hydrated);

  useEffect(() => {
    useSoundtrackStore.getState().hydrate();
  }, []);

  if (!hydrated || !selectedSong) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(680).duration(500)}
      style={{ marginHorizontal: 24, marginTop: 16 }}
    >
      <GlassCard intensity={46} borderRadius={22} fillColor="rgba(255,255,255,0.58)">
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
          <Image
            source={{ uri: selectedSong.albumArt }}
            style={{ width: 52, height: 52, borderRadius: 12 }}
          />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text
              numberOfLines={1}
              style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14, color: '#0A0A0A' }}
            >
              {selectedSong.title}
            </Text>
            <Text
              numberOfLines={1}
              style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 12, color: '#6B6B6B', marginTop: 2 }}
            >
              {selectedSong.artist}
            </Text>
          </View>
          <Music size={16} color="#ABABAB" strokeWidth={1.5} />
        </View>
      </GlassCard>
    </Animated.View>
  );
}

// ─── Streak row ───────────────────────────────────────────────────────────────
function StreakRow() {
  return (
    <Animated.View
      entering={FadeInDown.delay(700).duration(500)}
      style={{ marginHorizontal: 24, marginTop: 16 }}
    >
      <GlassCard intensity={46} borderRadius={22} fillColor="rgba(255,255,255,0.58)">
        <View style={{ overflow: 'hidden', borderRadius: 22, flexDirection: 'row', alignItems: 'center' }}>
          {/* Gold left accent */}
          <View style={{ width: 3, height: '100%', backgroundColor: '#D4B896', position: 'absolute', left: 0 }} />
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 15,
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
      </GlassCard>
    </Animated.View>
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
      paddingTop: 28,
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
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15 }, () => {
      'worklet';
      scale.value = withSpring(1, { damping: 15 });
    });
    Haptics.selectionAsync();
    onPress?.();
  }, [onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 15,
          // Glass surface
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderTopLeftRadius:     isFirst ? 20 : 0,
          borderTopRightRadius:    isFirst ? 20 : 0,
          borderBottomLeftRadius:  isLast  ? 20 : 0,
          borderBottomRightRadius: isLast  ? 20 : 0,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: 'rgba(0,0,0,0.07)',
        },
        animStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={row.label}
    >
      {/* Glass icon container */}
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.72)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        ...Platform.select({
          ios: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 4,
          },
        }),
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
    </AnimatedPressable>
  );
}

// ─── Setting section ──────────────────────────────────────────────────────────
function SettingSection({ title, rows, delay }: { title: string; rows: SettingRow[]; delay: number }) {
  return (
    <Animated.View entering={FadeInDown.delay(delay).duration(400)}>
      <SectionLabel title={title} />
      {/* Glass card wrapper for the whole section */}
      <View style={{
        marginHorizontal: 24,
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.85)',
        ...Platform.select({
          ios: {
            shadowColor: '#1C1C1C',
            shadowOffset: { width: 0, height: 6 },
            shadowOpacity: 0.10,
            shadowRadius: 20,
          },
          android: { elevation: 6 },
        }),
      }}>
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={48}
            tint="systemChromeMaterialLight"
            style={StyleSheet.absoluteFill}
          />
        )}
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
    </Animated.View>
  );
}

// ─── Sign Out Button ──────────────────────────────────────────────────────────
function SignOutButton({ onPress, disabled }: { onPress: () => void; disabled: boolean }) {
  const scale = useSharedValue(1);
  const iconRotate = useSharedValue(0);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${iconRotate.value}deg` }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.96, { damping: 15, stiffness: 200 });
    iconRotate.value = withSpring(-15, { damping: 12, stiffness: 180 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 12, stiffness: 150 });
    iconRotate.value = withSpring(0, { damping: 12, stiffness: 150 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  }, [onPress]);

  return (
    <Animated.View entering={FadeInDown.delay(1050).duration(400)}>
      <View style={{
        marginHorizontal: 24,
        marginTop: 28,
        marginBottom: 8,
        borderRadius: 24,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: 'rgba(220,100,100,0.3)',
        ...Platform.select({
          ios: {
            shadowColor: '#B83025',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 14,
          },
          android: { elevation: 4 },
        }),
      }}>
        {Platform.OS === 'ios' && (
          <BlurView
            intensity={46}
            tint="systemChromeMaterialLight"
            style={StyleSheet.absoluteFill}
          />
        )}
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          disabled={disabled}
          style={[
            {
              backgroundColor: 'rgba(255,235,235,0.72)',
              borderRadius: 23,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 10,
              paddingVertical: 16,
              opacity: disabled ? 0.5 : 1,
            },
            animStyle,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Sign out"
        >
          <Animated.View style={iconStyle}>
            <LogOut size={16} color="#B83025" strokeWidth={1.8} />
          </Animated.View>
          <Text style={{
            fontSize: 15,
            fontWeight: '600',
            color: '#B83025',
            letterSpacing: 0.3,
          }}>
            Sign Out
          </Text>
        </AnimatedPressable>
      </View>
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ProfileTab() {
  const insets = useSafeAreaInsets();
  const { selectedInterests } = useOnboardingStore();
  const signOut = useAuthStore((s) => s.signOut);
  const { library } = useBooksStore();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [editInterestsVisible, setEditInterestsVisible] = useState(false);
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

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
            await signOut();
            router.replace('/(auth)/sign-in');
          },
        },
      ],
    );
  };

  return (
    <>
    <AnimatedScrollView
      onScroll={scrollHandler}
      scrollEventThrottle={16}
      style={{ flex: 1, backgroundColor: '#EDEDED' }}
      contentContainerStyle={{
        paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom + 16,
      }}
      showsVerticalScrollIndicator={false}
    >
      {/* Full-bleed dark banner with parallax */}
      <BannerHeader topInset={insets.top} scrollY={scrollY} />

      {/* Identity: avatar (overlaps banner) + name + badge */}
      <UserIdentity interests={selectedInterests} />

      {/* Stats glass card */}
      <StatsRow
        articlesRead={12}
        booksSaved={library.length}
        interestsCount={selectedInterests.length}
      />

      {/* Interest chips */}
      <InterestChips interests={selectedInterests} onEdit={() => setEditInterestsVisible(true)} />

      {/* Soundtrack */}
      <SoundtrackCard />

      {/* Streak glass card */}
      <StreakRow />

      {/* Account */}
      <SettingSection title="Account" rows={ACCOUNT_ROWS} delay={750} />

      {/* Settings */}
      <SettingSection title="Settings" rows={SETTINGS_ROWS} delay={850} />

      {/* Support */}
      <SettingSection title="Support" rows={SUPPORT_ROWS} delay={950} />

      {/* Sign out */}
      <SignOutButton onPress={handleLogOut} disabled={isLoggingOut} />
    </AnimatedScrollView>

    <EditInterestsModal
      visible={editInterestsVisible}
      onClose={() => setEditInterestsVisible(false)}
    />
    </>
  );
}

// ─── Local styles ─────────────────────────────────────────────────────────────
const profileStyles = StyleSheet.create({
  editBtnShadow: {
    borderRadius: 24,
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
      },
      android: { elevation: 6 },
    }),
  },
  editBtn: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 18,
    paddingVertical: 8,
    backgroundColor: Platform.select({
      ios: 'transparent',
      android: 'rgba(255,255,255,0.72)',
    }),
  },
  editBtnFill: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 24,
  },
  editBtnLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1C1C',
    letterSpacing: 0.3,
  },
  chip: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.85)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: Platform.select({
      ios: 'transparent',
      android: 'rgba(255,255,255,0.65)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
    }),
  },
  chipFill: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 20,
  },
  chipLabel: {
    fontSize: 12,
    color: '#1C1C1C',
    letterSpacing: 0.2,
  },
});
