// app/(home)/(tabs)/profile.tsx
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { GlassCard } from '@/components/GlassCard';
import { INTERESTS } from '@/constants/interests';
import { InterestTag } from '@/components/InterestTag';
import { useAuthStore } from '@/store/authStore';
import { useBooksStore } from '@/store/booksStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { useSoundtrackStore } from '@/store/soundtrackStore';
import { useUser } from '@clerk/clerk-expo';
import { BlurView } from 'expo-blur';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Bell,
  BookMarked,
  BookOpen,
  Camera,
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
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  FadeInUp,
  type SharedValue,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
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

// ─── Ambient orb ─────────────────────────────────────────────────────────────
function AmbientOrb({
  size, left, top, baseOpacity, durationX, durationY, rangeX, rangeY, phaseX = 0, phaseY = 0,
}: {
  size: number; left: number; top: number; baseOpacity: number;
  durationX: number; durationY: number; rangeX: number; rangeY: number;
  phaseX?: number; phaseY?: number;
}) {
  const tx = useSharedValue(0);
  const ty = useSharedValue(0);
  const op = useSharedValue(baseOpacity);

  useEffect(() => {
    const sinEase = Easing.inOut(Easing.sin);
    tx.value = withDelay(phaseX, withRepeat(
      withSequence(
        withTiming( rangeX, { duration: durationX, easing: sinEase }),
        withTiming(-rangeX, { duration: durationX, easing: sinEase }),
      ), -1, true,
    ));
    ty.value = withDelay(phaseY, withRepeat(
      withSequence(
        withTiming( rangeY, { duration: durationY, easing: sinEase }),
        withTiming(-rangeY, { duration: durationY, easing: sinEase }),
      ), -1, true,
    ));
    op.value = withDelay(phaseX, withRepeat(
      withSequence(
        withTiming(baseOpacity * 2.0, { duration: durationX * 0.85, easing: sinEase }),
        withTiming(baseOpacity * 0.4, { duration: durationX * 0.85, easing: sinEase }),
      ), -1, true,
    ));
  }, []);

  const style = useAnimatedStyle(() => ({
    transform: [{ translateX: tx.value }, { translateY: ty.value }],
    opacity: op.value,
  }));

  return (
    <Animated.View style={[{
      position: 'absolute', left, top,
      width: size, height: size, borderRadius: size / 2,
      backgroundColor: '#FFFFFF',
    }, style]} />
  );
}

// ─── Banner ───────────────────────────────────────────────────────────────────
function BannerHeader({ topInset, scrollY }: { topInset: number; scrollY: SharedValue<number> }) {
  const bannerHeight = topInset + 172;

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [-100, 0, 200], [50, 0, -40]) }],
    opacity: interpolate(scrollY.value, [0, 160], [1, 0.6]),
  }));

  return (
    <Animated.View style={parallaxStyle}>
      {/* ── Ink base ──────────────────────────── */}
      <View style={{ height: bannerHeight, paddingTop: topInset, backgroundColor: '#0A0A0A', overflow: 'hidden' }}>

        {/* ── Ambient orbs ──────────────────────── */}
        <AmbientOrb size={220} left={-50}  top={-60} baseOpacity={0.055} durationX={4200} durationY={5600} rangeX={14} rangeY={10} phaseX={0}    phaseY={600}  />
        <AmbientOrb size={180} left={130}  top={-40} baseOpacity={0.045} durationX={5800} durationY={4400} rangeX={18} rangeY={12} phaseX={900}  phaseY={0}    />
        <AmbientOrb size={140} left={290}  top={50}  baseOpacity={0.065} durationX={3600} durationY={5000} rangeX={10} rangeY={14} phaseX={400}  phaseY={1100} />
        <AmbientOrb size={100} left={70}   top={90}  baseOpacity={0.05}  durationX={4800} durationY={3800} rangeX={12} rangeY={8}  phaseX={1400} phaseY={500}  />

        {/* ── Diagonal stripe texture ───────────── */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity: 0.035 }}>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <View key={i} style={{
              position: 'absolute',
              top: -60 + i * 44,
              left: -40, right: -40,
              height: 1,
              backgroundColor: '#FFFFFF',
              transform: [{ rotate: '-28deg' }],
            }} />
          ))}
        </View>

        {/* ── Top edge shimmer ──────────────────── */}
        <LinearGradient
          colors={['rgba(255,255,255,0.06)', 'transparent']}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2 }}
        />

        {/* ── Bottom fade to ivory ──────────────── */}
        <LinearGradient
          colors={['transparent', 'rgba(237,237,237,0.18)', 'rgba(237,237,237,0.50)']}
          style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 48 }}
        />

        {/* ── Top row ───────────────────────────── */}
        <Animated.View
          entering={FadeIn.delay(100).duration(600)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 20,
          }}
        >
          <Text style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 10,
            letterSpacing: 3.5,
            color: 'rgba(255,255,255,0.35)',
            textTransform: 'uppercase',
          }}>
            My Profile
          </Text>
          <Pressable
            hitSlop={12}
            style={({ pressed }) => ({
              opacity: pressed ? 0.4 : 1,
              width: 32, height: 32, borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(255,255,255,0.14)',
              backgroundColor: 'rgba(255,255,255,0.06)',
              alignItems: 'center', justifyContent: 'center',
            })}
          >
            <MoreHorizontal size={15} color="rgba(255,255,255,0.35)" strokeWidth={1.8} />
          </Pressable>
        </Animated.View>
      </View>
    </Animated.View>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function FloatingAvatar({ initials, photoUri, onPickPhoto }: { initials: string; photoUri: string | null; onPickPhoto: () => void }) {
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
      <Pressable onPress={onPickPhoto}>
        {/* Ring */}
        <LinearGradient
          colors={['#1C1C1C', 'rgba(28,28,28,0.30)', '#1C1C1C']}
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
            backgroundColor: '#FFFFFF',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={{ width: 78, height: 78, borderRadius: 39 }} />
            ) : (
              <Text style={{
                fontFamily: 'PlayfairDisplay_700Bold',
                fontSize: 26,
                color: '#1C1C1C',
                letterSpacing: 1,
              }}>
                {initials}
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* Camera badge */}
        <View style={{
          position: 'absolute',
          bottom: 0,
          right: 0,
          width: 26,
          height: 26,
          borderRadius: 13,
          backgroundColor: '#0A0A0A',
          borderWidth: 2,
          borderColor: '#FFFFFF',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <Camera size={12} color="#EDEDED" strokeWidth={2} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

// ─── User identity block ──────────────────────────────────────────────────────
function UserIdentity({ interests, photoUri, onPickPhoto, onEditProfile }: { interests: string[]; photoUri: string | null; onPickPhoto: () => void; onEditProfile: () => void }) {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'V';
  const initials = displayName.length > 0 ? displayName[0].toUpperCase() : 'V';
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
        <FloatingAvatar initials={initials} photoUri={photoUri} onPickPhoto={onPickPhoto} />
        <Animated.View entering={FadeInDown.delay(400).duration(400).springify()}>
          {/* Glass Edit Profile button */}
          <View style={profileStyles.editBtnShadow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onEditProfile();
              }}
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
        {displayName}.
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
          borderColor: 'rgba(0,0,0,0.14)',
          borderRadius: 20,
          paddingHorizontal: 10,
          paddingVertical: 4,
          backgroundColor: 'rgba(0,0,0,0.04)',
        }}
      >
        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#1C1C1C' }} />
        <Text style={{
          fontSize: 9,
          fontFamily: 'PlayfairDisplay_700Bold',
          color: '#1C1C1C',
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

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { user } = useUser();
  const [name, setName] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (visible && user) {
      setName(user.fullName ?? user.firstName ?? '');
    }
  }, [visible, user]);

  const handleSave = async () => {
    if (!user || !name.trim()) return;
    setIsSaving(true);
    try {
      const parts = name.trim().split(' ');
      const firstName = parts[0];
      const lastName = parts.length > 1 ? parts.slice(1).join(' ') : '';
      await user.update({ firstName, lastName });
      onClose();
    } catch {
      Alert.alert('Error', 'Failed to update name. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingHorizontal: 20,
          paddingTop: 20,
          paddingBottom: 16,
        }}>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            style={{
              width: 32,
              height: 32,
              borderRadius: 16,
              backgroundColor: '#F2F2F2',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={15} color="#0A0A0A" strokeWidth={2} />
          </Pressable>

          <Text style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 16,
            color: '#0A0A0A',
            letterSpacing: 0.2,
          }}>
            Edit Profile
          </Text>

          <Pressable
            onPress={handleSave}
            disabled={isSaving || !name.trim()}
            style={({ pressed }) => ({
              opacity: pressed || isSaving || !name.trim() ? 0.4 : 1,
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#0A0A0A' }}>
              {isSaving ? 'Saving…' : 'Save'}
            </Text>
          </Pressable>
        </View>

        <View style={{ height: StyleSheet.hairlineWidth, backgroundColor: '#E8E8E8' }} />

        {/* Name field */}
        <View style={{ paddingHorizontal: 20, paddingTop: 32 }}>
          <Text style={{
            fontSize: 11,
            fontWeight: '700',
            letterSpacing: 1.6,
            color: '#ABABAB',
            textTransform: 'uppercase',
            marginBottom: 10,
          }}>
            Display Name
          </Text>
          <TextInput
            value={name}
            onChangeText={setName}
            style={{
              height: 52,
              borderRadius: 14,
              backgroundColor: '#F7F7F7',
              paddingHorizontal: 16,
              fontSize: 16,
              color: '#0A0A0A',
              borderWidth: 1,
              borderColor: '#EBEBEB',
            }}
            placeholder="Your name"
            placeholderTextColor="#ABABAB"
            autoFocus
            returnKeyType="done"
            onSubmitEditing={handleSave}
          />
        </View>

        {/* Save button */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <Pressable
            onPress={handleSave}
            disabled={isSaving || !name.trim()}
            style={({ pressed }) => ({
              height: 52,
              borderRadius: 14,
              backgroundColor: '#0A0A0A',
              alignItems: 'center',
              justifyContent: 'center',
              opacity: pressed || isSaving || !name.trim() ? 0.6 : 1,
            })}
          >
            <Text style={{ fontSize: 15, fontWeight: '600', color: '#FFFFFF', letterSpacing: 0.3 }}>
              {isSaving ? 'Saving…' : 'Save Changes'}
            </Text>
          </Pressable>
        </View>
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
          {/* Left accent */}
          <View style={{ width: 3, height: '100%', backgroundColor: '#0A0A0A', position: 'absolute', left: 0 }} />
          <View style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            paddingHorizontal: 20,
            paddingVertical: 15,
          }}>
            <Flame size={15} color="#0A0A0A" strokeWidth={1.5} />
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

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 18, stiffness: 180 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 180 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Animated.View entering={FadeInDown.delay(1050).duration(400)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          {
            marginHorizontal: 24,
            marginTop: 28,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 16,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: 'rgba(0,0,0,0.12)',
            backgroundColor: 'rgba(0,0,0,0.03)',
            opacity: disabled ? 0.5 : 1,
          },
          animStyle,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <LogOut size={15} color="#6B6B6B" strokeWidth={1.5} />
        <Text style={{
          fontSize: 14,
          fontWeight: '500',
          color: '#6B6B6B',
          letterSpacing: 0.2,
        }}>
          Sign Out
        </Text>
      </AnimatedPressable>
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
      <UserIdentity interests={selectedInterests} photoUri={profilePhoto} onPickPhoto={handlePickPhoto} onEditProfile={() => setEditProfileVisible(true)} />

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
    <EditProfileModal
      visible={editProfileVisible}
      onClose={() => setEditProfileVisible(false)}
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
    paddingHorizontal: 24,
    paddingVertical: 11,
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
