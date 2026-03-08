// app/(home)/wardrobe.tsx — Wardrobe & Outfit Ideas
import { GlassCard } from '@/components/GlassCard';
import { CAPSULE_ESSENTIALS, OUTFITS } from '@/constants/outfits';
import {
  OCCASION_COLORS,
  OCCASION_LABELS,
  SEASON_LABELS,
  WardrobeOccasion,
  WardrobeSeason,
  type Outfit,
} from '@/types/wardrobe';
import { router } from 'expo-router';
import {
  ArrowLeft,
  Shirt,
  Sparkles,
} from 'lucide-react-native';
import { useMemo, useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Outfit Card ──────────────────────────────────────────────────────────────
function OutfitCard({ outfit, index }: { outfit: Outfit; index: number }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 80).duration(400).springify()}
      style={{ marginBottom: 14 }}
    >
      <AnimatedPressable
        style={[styles.outfitCard, animStyle]}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 14 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 14 }); }}
        onPress={() =>
          router.push({
            pathname: '/(home)/(tabs)/assistant',
            params: { prompt: `Give me styling advice for the "${outfit.title}" outfit: ${outfit.pieces.map(p => `${p.color} ${p.item}`).join(', ')}.` },
          })
        }
        accessibilityRole="button"
        accessibilityLabel={outfit.title}
      >
        {/* Left accent bar */}
        <View style={[styles.accentBar, { backgroundColor: outfit.accentColor }]} />

        <View style={styles.outfitContent}>
          {/* Top row: occasion badge + season pills */}
          <View style={styles.outfitTopRow}>
            <View style={[styles.occasionBadge, { backgroundColor: `${outfit.accentColor}18` }]}>
              <Text style={[styles.occasionBadgeText, { color: outfit.accentColor }]}>
                {OCCASION_LABELS[outfit.occasion]}
              </Text>
            </View>
            <View style={styles.seasonRow}>
              {outfit.seasons.slice(0, 2).map((s) => (
                <Text key={s} style={styles.seasonTag}>
                  {SEASON_LABELS[s].slice(0, 2)}
                </Text>
              ))}
              {outfit.seasons.length > 2 && (
                <Text style={styles.seasonTag}>+{outfit.seasons.length - 2}</Text>
              )}
            </View>
          </View>

          {/* Title */}
          <Text style={styles.outfitTitle}>{outfit.title}</Text>
          <Text style={styles.outfitSubtitle}>{outfit.subtitle}</Text>

          {/* Pieces list */}
          <View style={styles.piecesList}>
            {outfit.pieces.map((piece, i) => (
              <View key={i} style={styles.pieceRow}>
                <View style={styles.pieceDot} />
                <Text style={styles.pieceText}>
                  <Text style={styles.pieceItem}>{piece.item}</Text>
                  {'  '}
                  <Text style={styles.pieceColor}>{piece.color}{piece.fabric ? ` · ${piece.fabric}` : ''}</Text>
                </Text>
              </View>
            ))}
          </View>

          {/* Color palette */}
          <View style={styles.paletteRow}>
            {outfit.palette.map((hex, i) => (
              <View
                key={i}
                style={[
                  styles.paletteDot,
                  { backgroundColor: hex },
                  hex === '#FFFFFF' || hex === '#F5F5F5' || hex === '#F5F5F0' || hex === '#F5F0E5'
                    ? { borderWidth: StyleSheet.hairlineWidth, borderColor: 'rgba(0,0,0,0.15)' }
                    : undefined,
                ]}
              />
            ))}
          </View>

          {/* Styling note */}
          <Text style={styles.stylingNote} numberOfLines={2}>
            {outfit.stylingNote}
          </Text>

          {/* AI CTA */}
          <View style={styles.aiCta}>
            <Sparkles size={11} color="#6B6B6B" strokeWidth={1.5} />
            <Text style={styles.aiCtaText}>Ask the AI for personalised advice</Text>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ─── Capsule Item Row ─────────────────────────────────────────────────────────
function CapsuleRow({ item, index }: { item: typeof CAPSULE_ESSENTIALS[0]; index: number }) {
  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).duration(350).springify()}
      style={styles.capsuleRow}
    >
      <View style={styles.capsuleIndex}>
        <Text style={styles.capsuleIndexText}>{String(index + 1).padStart(2, '0')}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.capsuleItem}>{item.item}</Text>
        <Text style={styles.capsuleWhy}>{item.why}</Text>
      </View>
    </Animated.View>
  );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────
type FilterOccasion = WardrobeOccasion | 'all';
type FilterSeason = WardrobeSeason | 'all';

const OCCASIONS: { id: FilterOccasion; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'casual', label: 'Casual' },
  { id: 'professional', label: 'Professional' },
  { id: 'date', label: 'Date Night' },
  { id: 'formal', label: 'Black Tie' },
  { id: 'athletic', label: 'Athletic' },
];

const SEASONS: { id: FilterSeason; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'spring', label: 'Spring' },
  { id: 'summer', label: 'Summer' },
  { id: 'autumn', label: 'Autumn' },
  { id: 'winter', label: 'Winter' },
];

type ActiveView = 'outfits' | 'capsule';

export default function WardrobeScreen() {
  const insets = useSafeAreaInsets();
  const [activeView, setActiveView] = useState<ActiveView>('outfits');
  const [occasion, setOccasion] = useState<FilterOccasion>('all');
  const [season, setSeason] = useState<FilterSeason>('all');

  const filteredOutfits = useMemo(() => {
    return OUTFITS.filter((o) => {
      if (occasion !== 'all' && o.occasion !== occasion) return false;
      if (season !== 'all' && !o.seasons.includes(season as WardrobeSeason)) return false;
      return true;
    });
  }, [occasion, season]);

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* Nav */}
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.back()}
          style={styles.navBack}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={16} color="#6B6B6B" strokeWidth={1.5} />
          <Text style={styles.navBackLabel}>Profile</Text>
        </Pressable>

        {/* Segment: Outfits | Capsule */}
        <View style={styles.segmentContainer}>
          {(['outfits', 'capsule'] as ActiveView[]).map((v) => (
            <Pressable
              key={v}
              onPress={() => setActiveView(v)}
              style={[styles.segmentBtn, activeView === v && styles.segmentBtnActive]}
            >
              <Text style={[styles.segmentLabel, activeView === v && styles.segmentLabelActive]}>
                {v === 'outfits' ? 'Outfits' : 'Capsule'}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerIcon}>
          <Shirt size={16} color="#6B6B6B" strokeWidth={1.5} />
        </View>
        <View>
          <Text style={styles.headerTitle}>
            {activeView === 'outfits' ? 'Wardrobe' : 'The Capsule'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {activeView === 'outfits'
              ? 'Curated outfits for every occasion'
              : 'Ten foundational pieces every gentleman needs'}
          </Text>
        </View>
      </View>

      {activeView === 'outfits' && (
        <>
          {/* Season filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
            style={{ flexGrow: 0 }}
          >
            {SEASONS.map((s) => (
              <Pressable
                key={s.id}
                onPress={() => setSeason(s.id)}
                style={[styles.filterChip, season === s.id && styles.filterChipActive]}
              >
                <Text style={[styles.filterChipLabel, season === s.id && styles.filterChipLabelActive]}>
                  {s.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          {/* Occasion filter */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.filterRow, { paddingTop: 0, paddingBottom: 8 }]}
            style={{ flexGrow: 0 }}
          >
            {OCCASIONS.map((o) => (
              <Pressable
                key={o.id}
                onPress={() => setOccasion(o.id)}
                style={[
                  styles.occasionChip,
                  occasion === o.id && {
                    backgroundColor:
                      o.id === 'all'
                        ? '#0A0A0A'
                        : OCCASION_COLORS[o.id as WardrobeOccasion],
                  },
                ]}
              >
                <Text style={[
                  styles.occasionChipLabel,
                  occasion === o.id && styles.occasionChipLabelActive,
                ]}>
                  {o.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        </>
      )}

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {activeView === 'outfits' ? (
          filteredOutfits.length > 0 ? (
            filteredOutfits.map((outfit, i) => (
              <OutfitCard key={outfit.id} outfit={outfit} index={i} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Shirt size={36} color="#D4D4D4" strokeWidth={1} />
              <Text style={styles.emptyTitle}>No outfits found</Text>
              <Text style={styles.emptySubtitle}>
                Adjust the season or occasion filters above.
              </Text>
            </View>
          )
        ) : (
          <>
            {/* Capsule intro */}
            <Animated.View
              entering={FadeInDown.duration(400).springify()}
              style={{ marginBottom: 20 }}
            >
              <GlassCard intensity={48} borderRadius={20} fillColor="rgba(255,255,255,0.58)">
                <View style={styles.capsuleIntroCard}>
                  <Text style={styles.capsuleIntroText}>
                    A capsule wardrobe is not a limitation — it is an architecture. Ten pieces,
                    chosen with care, produce more combinations than a wardrobe of fifty chosen
                    without thought.
                  </Text>
                </View>
              </GlassCard>
            </Animated.View>

            {/* Capsule items */}
            <View style={styles.capsuleList}>
              {CAPSULE_ESSENTIALS.map((item, i) => (
                <CapsuleRow key={item.id} item={item} index={i} />
              ))}
            </View>

            {/* AI CTA */}
            <Animated.View
              entering={FadeInDown.delay(600).duration(400).springify()}
              style={{ marginTop: 16 }}
            >
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: '/(home)/(tabs)/assistant',
                    params: { prompt: 'Help me build a capsule wardrobe tailored to my lifestyle and appearance profile.' },
                  })
                }
                style={({ pressed }) => [styles.aiAdviceBtn, { opacity: pressed ? 0.75 : 1 }]}
              >
                <Sparkles size={14} color="#EDEDED" strokeWidth={1.5} />
                <Text style={styles.aiAdviceBtnText}>Get AI wardrobe advice</Text>
              </Pressable>
            </Animated.View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDEDED' },

  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.07)',
  },
  navBack: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  navBackLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#6B6B6B',
  },

  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)',
    padding: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
    }),
  },
  segmentBtn: {
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 11,
  },
  segmentBtnActive: {
    backgroundColor: '#0A0A0A',
  },
  segmentLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
    letterSpacing: 0.2,
  },
  segmentLabelActive: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#EDEDED',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  headerIcon: {
    width: 38,
    height: 38,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 5,
      },
    }),
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#0A0A0A',
  },
  headerSubtitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 11,
    color: '#6B6B6B',
    marginTop: 2,
  },

  filterRow: {
    paddingHorizontal: 20,
    paddingVertical: 6,
    gap: 8,
    flexDirection: 'row',
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(10,10,10,0.08)',
    borderColor: 'rgba(10,10,10,0.15)',
  },
  filterChipLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
    letterSpacing: 0.2,
  },
  filterChipLabelActive: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#0A0A0A',
  },

  occasionChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.55)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)',
  },
  occasionChipLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
    letterSpacing: 0.2,
  },
  occasionChipLabelActive: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#EDEDED',
  },

  scrollContent: { padding: 20, paddingTop: 8 },

  // Outfit card
  outfitCard: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0A0A0A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
    }),
  },
  accentBar: {
    width: 4,
    flexShrink: 0,
  },
  outfitContent: {
    flex: 1,
    padding: 16,
  },
  outfitTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  occasionBadge: {
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  occasionBadgeText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 9,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
  seasonRow: {
    flexDirection: 'row',
    gap: 4,
  },
  seasonTag: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 9,
    color: '#ABABAB',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  outfitTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#0A0A0A',
    marginBottom: 2,
  },
  outfitSubtitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#6B6B6B',
    marginBottom: 12,
  },

  piecesList: { gap: 6, marginBottom: 12 },
  pieceRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  pieceDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#ABABAB',
    marginTop: 6,
    flexShrink: 0,
  },
  pieceText: { flex: 1 },
  pieceItem: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13,
    color: '#0A0A0A',
  },
  pieceColor: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
  },

  paletteRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
  },
  paletteDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },

  stylingNote: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#6B6B6B',
    lineHeight: 18,
    marginBottom: 10,
  },

  aiCta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  aiCtaText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    color: '#6B6B6B',
    letterSpacing: 0.2,
  },

  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 12,
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#0A0A0A',
  },
  emptySubtitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
  },

  // Capsule
  capsuleIntroCard: { padding: 18 },
  capsuleIntroText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#1C1C1C',
    lineHeight: 22,
  },
  capsuleList: {
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: '#0A0A0A',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 16,
      },
      android: { elevation: 4 },
    }),
  },
  capsuleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  capsuleIndex: {
    width: 28,
    paddingTop: 1,
  },
  capsuleIndexText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 10,
    color: '#ABABAB',
    letterSpacing: 0.5,
  },
  capsuleItem: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: '#0A0A0A',
    marginBottom: 3,
  },
  capsuleWhy: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
    lineHeight: 18,
  },

  aiAdviceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#0A0A0A',
    borderRadius: 50,
    paddingVertical: 16,
  },
  aiAdviceBtnText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: '#EDEDED',
    letterSpacing: 0.3,
  },
});
