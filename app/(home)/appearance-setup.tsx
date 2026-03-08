// app/(home)/appearance-setup.tsx — Appearance profile setup
import { GlassCard } from '@/components/GlassCard';
import { useAppearanceStore } from '@/store/appearanceStore';
import {
  BEARD_STYLE_LABELS,
  BEARD_STYLES,
  BeardStyle,
  FACE_SHAPE_DESCRIPTIONS,
  FACE_SHAPE_LABELS,
  FACE_SHAPES,
  FaceShape,
  HAIR_LENGTH_LABELS,
  HAIR_LENGTHS,
  HAIR_TYPE_LABELS,
  HAIR_TYPES,
  HairLength,
  HairType,
  SKIN_TONE_COLORS,
  SKIN_TONES,
  SkinTone,
} from '@/types/appearance';
import { router } from 'expo-router';
import { ArrowLeft, Sparkles } from 'lucide-react-native';
import { useEffect } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Face shape geometric illustration ───────────────────────────────────────
function FaceShapeIllustration({ shape, active }: { shape: FaceShape; active: boolean }) {
  const color = active ? '#EDEDED' : '#6B6B6B';
  const bg = active ? '#0A0A0A' : 'transparent';

  const dimensions: Record<FaceShape, { w: number; h: number; r: number }> = {
    oval:   { w: 28, h: 38, r: 14 },
    square: { w: 34, h: 34, r: 5 },
    round:  { w: 34, h: 34, r: 17 },
    heart:  { w: 34, h: 30, r: 10 },
    oblong: { w: 22, h: 40, r: 11 },
  };

  const dim = dimensions[shape];

  return (
    <View
      style={{
        width: dim.w,
        height: dim.h,
        borderRadius: dim.r,
        borderWidth: 1.5,
        borderColor: color,
        backgroundColor: bg,
        // Heart gets a subtle bottom-point illusion via extra rounding
        ...(shape === 'heart'
          ? { borderBottomLeftRadius: 2, borderBottomRightRadius: 14 }
          : {}),
      }}
    />
  );
}

// ─── Section header ───────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {subtitle && <Text style={styles.sectionSubtitle}>{subtitle}</Text>}
    </View>
  );
}

// ─── Simple chip ──────────────────────────────────────────────────────────────
function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        active && styles.chipActive,
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={[styles.chipText, active && styles.chipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function AppearanceSetupScreen() {
  const { profile, hydrate, updateProfile } = useAppearanceStore();

  useEffect(() => {
    hydrate();
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Nav ──────────────────────────────────── */}
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          style={styles.navBack}
          accessibilityLabel="Back"
        >
          <ArrowLeft size={16} color="#6B6B6B" strokeWidth={1.5} />
          <Text style={styles.navTitle}>My Appearance</Text>
        </Pressable>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Face Shape ───────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(60).duration(380)}>
          <SectionHeader
            title="Face Shape"
            subtitle="Select the shape that best matches your face"
          />
          <View style={styles.faceShapeRow}>
            {FACE_SHAPES.map((shape) => {
              const active = profile.faceShape === shape;
              return (
                <Pressable
                  key={shape}
                  onPress={() => updateProfile({ faceShape: shape })}
                  style={({ pressed }) => [
                    styles.faceCard,
                    active && styles.faceCardActive,
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <FaceShapeIllustration shape={shape} active={active} />
                  <Text style={[styles.faceLabel, active && styles.faceLabelActive]}>
                    {FACE_SHAPE_LABELS[shape]}
                  </Text>
                  <Text style={[styles.faceDesc, active && styles.faceDescActive]} numberOfLines={2}>
                    {FACE_SHAPE_DESCRIPTIONS[shape]}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </Animated.View>

        {/* ── Hair Type ────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(120).duration(380)}>
          <SectionHeader title="Hair Type" />
          <View style={styles.chipRow}>
            {HAIR_TYPES.map((type) => (
              <Chip
                key={type}
                label={HAIR_TYPE_LABELS[type]}
                active={profile.hairType === type}
                onPress={() => updateProfile({ hairType: type as HairType })}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Hair Length ──────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(180).duration(380)}>
          <SectionHeader title="Hair Length" />
          <View style={styles.chipRow}>
            {HAIR_LENGTHS.map((len) => (
              <Chip
                key={len}
                label={HAIR_LENGTH_LABELS[len]}
                active={profile.hairLength === len}
                onPress={() => updateProfile({ hairLength: len as HairLength })}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Beard ────────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(240).duration(380)}>
          <SectionHeader title="Beard" />
          <View style={styles.chipRow}>
            {BEARD_STYLES.map((style) => (
              <Chip
                key={style}
                label={BEARD_STYLE_LABELS[style]}
                active={profile.beardStyle === style}
                onPress={() => updateProfile({ beardStyle: style as BeardStyle })}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── Skin Tone ────────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(300).duration(380)}>
          <SectionHeader
            title="Skin Tone"
            subtitle="Used for personalised grooming and style advice"
          />
          <View style={styles.skinToneRow}>
            {SKIN_TONES.map((tone) => (
              <Pressable
                key={tone}
                onPress={() => updateProfile({ skinTone: tone as SkinTone })}
                style={[
                  styles.skinToneCircle,
                  { backgroundColor: SKIN_TONE_COLORS[tone] },
                  profile.skinTone === tone && styles.skinToneCircleActive,
                ]}
                accessibilityLabel={`Skin tone ${tone}`}
              />
            ))}
          </View>
        </Animated.View>

        {/* ── AI Advice CTA ─────────────────────────── */}
        <Animated.View entering={FadeInDown.delay(360).duration(380)}>
          <GlassCard
            style={styles.ctaCard}
            fillColor="rgba(10,10,10,0.04)"
            borderRadius={22}
          >
            <View style={styles.ctaInner}>
              <View style={styles.ctaIconWrap}>
                <Sparkles size={20} color="#0A0A0A" strokeWidth={1.5} />
              </View>
              <View style={styles.ctaText}>
                <Text style={styles.ctaTitle}>Get Style Advice</Text>
                <Text style={styles.ctaSubtitle}>
                  Your assistant uses this profile to give personalised grooming and clothing recommendations.
                </Text>
              </View>
            </View>
            <Pressable
              onPress={() => {
                router.back();
                // Navigate to assistant tab — slight delay to allow back animation
                setTimeout(() => router.push('/(home)/(tabs)/assistant'), 350);
              }}
              style={({ pressed }) => [
                styles.ctaBtn,
                pressed && { opacity: 0.75 },
              ]}
            >
              <Text style={styles.ctaBtnText}>Open Assistant</Text>
            </Pressable>
          </GlassCard>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDEDED' },
  flex: { flex: 1 },

  // Nav
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D4D4D4',
  },
  navBack: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  navTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#0A0A0A',
  },

  scrollContent: { paddingBottom: 40 },

  // Section header
  sectionHeader: { paddingHorizontal: 20, paddingTop: 28, paddingBottom: 14 },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#0A0A0A',
    marginBottom: 3,
  },
  sectionSubtitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 18,
  },

  // Face shape cards
  faceShapeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  faceCard: {
    width: '18%',
    minWidth: 60,
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 6,
    gap: 8,
  },
  faceCardActive: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
  },
  faceLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 11,
    color: '#1C1C1C',
    textAlign: 'center',
  },
  faceLabelActive: { color: '#EDEDED' },
  faceDesc: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 9,
    color: '#ABABAB',
    textAlign: 'center',
    lineHeight: 13,
  },
  faceDescActive: { color: 'rgba(237,237,237,0.6)' },

  // Chips
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 10,
  },
  chip: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 9,
  },
  chipActive: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  chipText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#6B6B6B',
  },
  chipTextActive: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#EDEDED',
  },

  // Skin tones
  skinToneRow: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 14,
  },
  skinToneCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
  },
  skinToneCircleActive: {
    borderWidth: 3,
    borderColor: '#0A0A0A',
  },

  // CTA card
  ctaCard: { marginHorizontal: 20, marginTop: 36, padding: 20 },
  ctaInner: { flexDirection: 'row', gap: 14, marginBottom: 16 },
  ctaIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: 'rgba(10,10,10,0.07)',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  ctaText: { flex: 1 },
  ctaTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: '#0A0A0A',
    marginBottom: 4,
  },
  ctaSubtitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 19,
  },
  ctaBtn: {
    backgroundColor: '#0A0A0A',
    borderRadius: 50,
    paddingVertical: 13,
    alignItems: 'center',
  },
  ctaBtnText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: '#EDEDED',
    letterSpacing: 0.3,
  },
});
