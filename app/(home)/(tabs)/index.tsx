// app/(home)/(tabs)/index.tsx — Articles tab
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { ArrowRight, BookOpen } from 'lucide-react-native';
import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const GUIDE_SHOWN_KEY = 'ravenscroft_guide_shown';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const ARTICLE = {
  id: 'art-makers',
  category: 'ravenscroft · 01 Mar 2026 · 15 min',
  title: 'ART MAKERS AND RULE BREAKERS FOR A LIBRARIAN MEN CULTURE SHOWCASE.',
  summary: [
    'AI has the potential to shift focus from productivity to creativity, prioritising original, meaningful, and authentic work over traditional metrics.',
    'Productivity tools often hinder creativity by forcing standardisation, efficiency and predictability, lacking support for non-linear insight and idea generation.',
    'Creative tools should enhance the collection, connection, and creation of ideas, seamlessly supporting both passive foraging and active hunting modes of information discovery.',
  ],
};

function PressCard({ onPress, children }: { onPress: () => void; children: ReactNode }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={() => { scale.value = withSpring(0.98); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── First-launch welcome modal ───────────────────────────────────────────────

function WelcomeModal({ visible, onOpenGuide, onDismiss }: {
  visible: boolean;
  onOpenGuide: () => void;
  onDismiss: () => void;
}) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onDismiss}
    >
      <SafeAreaView style={modalStyles.container} edges={['top', 'bottom']}>
        {/* Cover art */}
        <View style={modalStyles.coverArea}>
          <View style={modalStyles.coverInitialBox}>
            <Text style={modalStyles.coverInitial}>R</Text>
          </View>
        </View>

        {/* Body */}
        <View style={modalStyles.body}>
          <Text style={modalStyles.welcomeLabel}>Welcome to</Text>
          <Text style={modalStyles.appName}>Ravenscroft</Text>
          <View style={modalStyles.divider} />
          <Text style={modalStyles.description}>
            A private library for the modern gentleman. Literature, reflection, and self-cultivation — in one application.
          </Text>
          <Text style={modalStyles.description}>
            Before you begin, we recommend reading The Ravenscroft Guide — a brief handbook covering everything this application offers.
          </Text>
        </View>

        {/* CTAs */}
        <View style={modalStyles.ctaGroup}>
          <Pressable style={modalStyles.ctaPrimary} onPress={onOpenGuide}>
            <BookOpen size={15} color="#EDEDED" strokeWidth={1.5} />
            <Text style={modalStyles.ctaPrimaryLabel}>Read the Guide</Text>
          </Pressable>
          <Pressable style={modalStyles.ctaSecondary} onPress={onDismiss}>
            <Text style={modalStyles.ctaSecondaryLabel}>Explore on my own</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const modalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAF8',
  },
  coverArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 52,
    paddingBottom: 36,
    backgroundColor: '#0A0A0A',
  },
  coverInitialBox: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 1,
    borderColor: 'rgba(237,237,237,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverInitial: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 42,
    color: '#EDEDED',
    letterSpacing: 2,
  },
  body: {
    flex: 1,
    paddingHorizontal: 32,
    paddingTop: 40,
    gap: 0,
  },
  welcomeLabel: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#6B6B6B',
    marginBottom: 6,
  },
  appName: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 36,
    color: '#0A0A0A',
    letterSpacing: -0.5,
    marginBottom: 18,
  },
  divider: {
    width: 32,
    height: 1,
    backgroundColor: '#0A0A0A',
    marginBottom: 22,
  },
  description: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    color: '#1C1C1C',
    lineHeight: 26,
    marginBottom: 14,
  },
  ctaGroup: {
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  ctaPrimary: {
    backgroundColor: '#0A0A0A',
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaPrimaryLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#EDEDED',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  ctaSecondary: {
    alignItems: 'center',
    paddingVertical: 14,
  },
  ctaSecondaryLabel: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#6B6B6B',
  },
});

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function ArticlesTab() {
  const insets = useSafeAreaInsets();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(GUIDE_SHOWN_KEY).then((val) => {
      if (!val) setShowWelcome(true);
    });
  }, []);

  const dismissWelcome = async () => {
    await AsyncStorage.setItem(GUIDE_SHOWN_KEY, 'true');
    setShowWelcome(false);
  };

  const openGuide = async () => {
    await AsyncStorage.setItem(GUIDE_SHOWN_KEY, 'true');
    setShowWelcome(false);
    router.push('/(home)/app-guide');
  };

  const handleGenerateSummary = () => {
    console.log('[Ravenscroft] Generate Summary tapped for:', ARTICLE.title);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEDED' }} edges={['top']}>
      <WelcomeModal
        visible={showWelcome}
        onOpenGuide={openGuide}
        onDismiss={dismissWelcome}
      />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View style={articleStyles.topBar}>
          <Text style={articleStyles.topBarTitle}>
            Ravenscroft
          </Text>
          {/* Glass avatar pill */}
          <View style={articleStyles.avatarPillShadow}>
            <View style={articleStyles.avatarPill}>
              {Platform.OS === 'ios' && (
                <BlurView
                  intensity={50}
                  tint="systemChromeMaterialLight"
                  style={StyleSheet.absoluteFill}
                />
              )}
              <View style={[StyleSheet.absoluteFill, articleStyles.avatarPillFill]} pointerEvents="none" />
              <Text style={articleStyles.avatarPillText}>R</Text>
            </View>
          </View>
        </View>

        {/* Feed card — dark */}
        <View style={articleStyles.feedCard}>
          {/* Image placeholder */}
          <View style={articleStyles.feedImageArea}>
            {/* Subtle glass shimmer at top of image */}
            <View style={articleStyles.feedImageShimmer} />
            <Text style={articleStyles.feedImageLabel}>Image</Text>
          </View>

          {/* Card body */}
          <View style={articleStyles.feedBody}>
            <Text style={articleStyles.feedCategory}>
              {ARTICLE.category}
            </Text>

            <Text style={articleStyles.feedTitle}>
              {ARTICLE.title}
            </Text>

            {/* Glass "Generate Summary" pill */}
            <Pressable
              onPress={handleGenerateSummary}
              style={articleStyles.summaryBtnWrapper}
              accessibilityRole="button"
              accessibilityLabel="Generate Summary"
            >
              <View style={articleStyles.summaryBtn}>
                {Platform.OS === 'ios' && (
                  <BlurView
                    intensity={20}
                    tint="dark"
                    style={StyleSheet.absoluteFill}
                  />
                )}
                <View style={[StyleSheet.absoluteFill, articleStyles.summaryBtnFill]} pointerEvents="none" />
                <Text style={articleStyles.summaryBtnLabel}>Generate Summary</Text>
                <ArrowRight size={12} color="#EDEDED" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Article preview card — glass surface */}
        <PressCard onPress={() => router.push('/(home)/article')}>
          <View style={articleStyles.previewCard}>
            {Platform.OS === 'ios' && (
              <BlurView
                intensity={52}
                tint="systemChromeMaterialLight"
                style={[StyleSheet.absoluteFill, { borderRadius: 20 }]}
              />
            )}
            {/* Glass fill */}
            <View style={[StyleSheet.absoluteFill, articleStyles.previewCardFill]} pointerEvents="none" />
            {/* Dark hairline depth */}
            <View style={[StyleSheet.absoluteFill, articleStyles.previewCardHairline]} pointerEvents="none" />

            {/* Nav bar */}
            <View style={articleStyles.previewNav}>
              <Text style={articleStyles.previewNavLabel}>← Back To Home</Text>
            </View>

            {/* Article header */}
            <View style={articleStyles.previewHeader}>
              <Text style={articleStyles.previewTitle}>
                The Art Activities and Interests
              </Text>
              <Text style={articleStyles.previewMeta}>ravenscroft · 01 Mar 2026 · 15 min</Text>
            </View>

            {/* Body excerpt */}
            <View style={articleStyles.previewBody}>
              <Text style={articleStyles.previewExcerpt} numberOfLines={5}>
                We're like, if a bunch of Art students opened a Swiss Design Studio in the back of a
                Skate Shop. It's a collision of worlds; a dance of contrasts — a harmonious disarray.
                For our clients and partners, it means a journey of leveraging seemingly disparate
                elements to craft compelling and lasting narratives.
              </Text>

              <View style={articleStyles.previewSummaryBlock}>
                <Text style={articleStyles.previewSummaryLabel}>Summary</Text>
                {ARTICLE.summary.map((point, i) => (
                  <View key={i} style={articleStyles.previewSummaryRow}>
                    <Text style={articleStyles.previewBullet}>•</Text>
                    <Text style={articleStyles.previewSummaryText}>{point}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </PressCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const articleStyles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
  },
  topBarTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#0A0A0A',
  },
  avatarPillShadow: {
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.09,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
    }),
  },
  avatarPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Platform.select({
      ios: 'transparent',
      android: 'rgba(255,255,255,0.68)',
    }),
  },
  avatarPillFill: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 17,
  },
  avatarPillText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13,
    color: '#0A0A0A',
  },
  feedCard: {
    marginHorizontal: 24,
    marginBottom: 20,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
    ...Platform.select({
      ios: {
        shadowColor: '#0A0A0A',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.22,
        shadowRadius: 24,
      },
      android: { elevation: 12 },
    }),
  },
  feedImageArea: {
    height: 192,
    backgroundColor: 'rgba(28,28,28,0.85)',
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
    padding: 16,
  },
  feedImageShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  feedImageLabel: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 10,
    color: 'rgba(237,237,237,0.3)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  feedBody: {
    padding: 20,
    gap: 16,
  },
  feedCategory: {
    fontSize: 10,
    color: 'rgba(237,237,237,0.5)',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  feedTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#EDEDED',
    lineHeight: 26,
  },
  summaryBtnWrapper: {
    alignSelf: 'flex-start',
  },
  summaryBtn: {
    overflow: 'hidden',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.22)',
    paddingHorizontal: 16,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: Platform.select({
      ios: 'transparent',
      android: 'rgba(255,255,255,0.12)',
    }),
  },
  summaryBtnFill: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 50,
  },
  summaryBtnLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EDEDED',
    letterSpacing: 0.4,
  },
  // Glass article preview card
  previewCard: {
    marginHorizontal: 24,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.88)',
    backgroundColor: Platform.select({
      ios: 'transparent',
      android: 'rgba(255,255,255,0.76)',
    }),
    ...Platform.select({
      ios: {
        shadowColor: '#1C1C1C',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.09,
        shadowRadius: 18,
      },
      android: { elevation: 8 },
    }),
  },
  previewCardFill: {
    backgroundColor: 'rgba(255,255,255,0.72)',
    borderRadius: 20,
  },
  previewCardHairline: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  previewNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.08)',
  },
  previewNavLabel: {
    fontSize: 12,
    color: '#6B6B6B',
  },
  previewHeader: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  previewTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#0A0A0A',
    lineHeight: 24,
    marginBottom: 4,
  },
  previewMeta: {
    fontSize: 10,
    color: '#6B6B6B',
  },
  previewBody: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  previewExcerpt: {
    fontSize: 12,
    color: '#1C1C1C',
    lineHeight: 18,
    marginBottom: 16,
  },
  previewSummaryBlock: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0,0,0,0.08)',
    paddingTop: 12,
  },
  previewSummaryLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 12,
    color: '#0A0A0A',
    marginBottom: 8,
  },
  previewSummaryRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  previewBullet: {
    fontSize: 10,
    color: '#6B6B6B',
    marginTop: 1,
  },
  previewSummaryText: {
    fontSize: 10,
    color: '#1C1C1C',
    lineHeight: 16,
    flex: 1,
  },
});
