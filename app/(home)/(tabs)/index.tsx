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

const ARTICLES = [
  {
    id: 'discipline-of-morning',
    category: 'Stoicism',
    date: '06 Mar 2026',
    readTime: '8 min',
    title: 'THE DISCIPLINE OF MORNING: HOW GREAT MEN BEGIN THEIR DAY.',
    excerpt: 'The Stoics were not simply philosophers. They were practitioners. Marcus Aurelius rose before dawn not because he wanted to, but because he chose to — and in that distinction lies everything.',
    summary: [
      'Morning rituals are a form of philosophical practice, not mere productivity optimisation.',
      'Intentional early rising creates a window of uncontested solitude that primes the mind for clarity.',
      'The quality of a day is largely determined before the first obligation begins.',
    ],
  },
  {
    id: 'art-makers',
    category: 'Culture',
    date: '01 Mar 2026',
    readTime: '15 min',
    title: 'ART MAKERS AND RULE BREAKERS FOR A LIBRARIAN MEN CULTURE SHOWCASE.',
    excerpt: "We're like, if a bunch of Art students opened a Swiss Design Studio in the back of a Skate Shop. It's a collision of worlds; a dance of contrasts — a harmonious disarray.",
    summary: [
      'AI has the potential to shift focus from productivity to creativity, prioritising original, meaningful, and authentic work.',
      'Productivity tools often hinder creativity by forcing standardisation, efficiency and predictability.',
      'Creative tools should enhance the collection, connection, and creation of ideas.',
    ],
  },
  {
    id: 'virtue-of-silence',
    category: 'Philosophy',
    date: '25 Feb 2026',
    readTime: '6 min',
    title: 'ON THE VIRTUE OF SILENCE IN A WORLD THAT REWARDS NOISE.',
    excerpt: 'In antiquity, silence was considered a mark of wisdom. Today we mistake verbosity for intelligence, and volume for confidence. The gentleman reacquaints himself with restraint.',
    summary: [
      'Silence is not passivity — it is active, disciplined attention to what is actually worth saying.',
      'The compulsive need to fill space with words signals insecurity, not authority.',
      'Strategic reticence commands more respect than constant commentary.',
    ],
  },
  {
    id: 'well-dressed-mind',
    category: 'Style',
    date: '20 Feb 2026',
    readTime: '10 min',
    title: 'THE WELL-DRESSED MIND: ON BOOKS, TAILORING, AND THE ART OF BEING.',
    excerpt: 'Dress is character made visible. But what of the interior? The man who attends to his wardrobe yet neglects his library presents a curious contradiction — appearance without substance.',
    summary: [
      'Personal style and intellectual cultivation are not separate pursuits — they are expressions of a single integrated identity.',
      'The gentleman understands that how he presents himself in dress and in thought are equally deliberate choices.',
      'Neglecting one domain while perfecting the other produces an imbalance others intuitively sense.',
    ],
  },
  {
    id: 'marcus-aurelius-2026',
    category: 'Literature',
    date: '14 Feb 2026',
    readTime: '12 min',
    title: 'READING MARCUS AURELIUS IN 2026: WHAT THE EMPEROR STILL TEACHES US.',
    excerpt: "The Meditations were never meant to be published. They were private reminders from a man who held the fate of an empire — and still worried he wasn't doing enough. That honesty is what makes them timeless.",
    summary: [
      'The Meditations offer a rare document of a powerful man holding himself accountable to his own values.',
      "Aurelius's recurring themes — impermanence, virtue, reason — are as urgent now as they were in 170 AD.",
      'Reading the Stoics is not historical study. It is applied philosophy for daily life.',
    ],
  },
  {
    id: 'london-patience',
    category: 'Travel',
    date: '08 Feb 2026',
    readTime: '9 min',
    title: 'WHAT LONDON TAUGHT ME ABOUT PATIENCE, CRAFT, AND MEASURED AMBITION.',
    excerpt: 'London does not rush. The city has weathered centuries with a particular brand of unhurried confidence that the frenetic capitals of the new world have yet to cultivate.',
    summary: [
      'Cities carry philosophies — London embodies restraint, continuity, and earned authority.',
      'Patience is not inaction. It is the willingness to let quality compound over time rather than chase immediate recognition.',
      'The gentleman studies places as he studies books — for what they reveal about the longer arc of civilisation.',
    ],
  },
];

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

  const featured = ARTICLES[0];
  const editorialArticles = ARTICLES.slice(1);

  const handleGenerateSummary = () => {
    console.log('[Ravenscroft] Generate Summary tapped for:', featured.title);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
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

        {/* Featured card — dark */}
        <View style={articleStyles.feedCard}>
          <View style={articleStyles.feedImageArea}>
            <View style={articleStyles.feedImageShimmer} />
            <Text style={articleStyles.feedCategoryBadge}>{featured.category}</Text>
          </View>

          <View style={articleStyles.feedBody}>
            <Text style={articleStyles.feedMeta}>
              ravenscroft · {featured.date} · {featured.readTime}
            </Text>

            <Text style={articleStyles.feedTitle}>
              {featured.title}
            </Text>

            <Text style={articleStyles.feedExcerpt} numberOfLines={2}>
              {featured.excerpt}
            </Text>

            <Pressable
              onPress={handleGenerateSummary}
              style={articleStyles.summaryBtnWrapper}
              accessibilityRole="button"
              accessibilityLabel="Generate Summary"
            >
              <View style={articleStyles.summaryBtn}>
                {Platform.OS === 'ios' && (
                  <BlurView intensity={20} tint="dark" style={StyleSheet.absoluteFill} />
                )}
                <View style={[StyleSheet.absoluteFill, articleStyles.summaryBtnFill]} pointerEvents="none" />
                <Text style={articleStyles.summaryBtnLabel}>Generate Summary</Text>
                <ArrowRight size={12} color="#EDEDED" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Editorial section */}
        <View style={articleStyles.sectionHeader}>
          <Text style={articleStyles.sectionLabel}>Editorial</Text>
          <View style={articleStyles.sectionDivider} />
        </View>

        <View style={articleStyles.articleList}>
          {editorialArticles.map((article, index) => (
            <PressCard key={article.id} onPress={() => router.push('/(home)/article')}>
              <View style={[
                articleStyles.articleRow,
                index === editorialArticles.length - 1 && articleStyles.articleRowLast,
              ]}>
                <View style={articleStyles.articleRowContent}>
                  <Text style={articleStyles.articleRowCategory}>{article.category}</Text>
                  <Text style={articleStyles.articleRowTitle} numberOfLines={2}>
                    {article.title}
                  </Text>
                  <Text style={articleStyles.articleRowMeta}>
                    {article.date} · {article.readTime}
                  </Text>
                </View>
                <View style={articleStyles.articleRowThumb} />
              </View>
            </PressCard>
          ))}
        </View>
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
    height: 180,
    backgroundColor: 'rgba(28,28,28,0.9)',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: 16,
    flexDirection: 'column',
  },
  feedImageShimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  feedCategoryBadge: {
    fontSize: 9,
    color: 'rgba(237,237,237,0.5)',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginTop: 'auto',
  },
  feedBody: {
    padding: 20,
    gap: 10,
  },
  feedMeta: {
    fontSize: 10,
    color: 'rgba(237,237,237,0.4)',
    letterSpacing: 0.3,
  },
  feedTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 19,
    color: '#EDEDED',
    lineHeight: 26,
  },
  feedExcerpt: {
    fontSize: 12,
    color: 'rgba(237,237,237,0.55)',
    lineHeight: 18,
  },
  summaryBtnWrapper: {
    alignSelf: 'flex-start',
    marginTop: 6,
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
  // Editorial section
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 28,
    marginBottom: 4,
    gap: 10,
  },
  sectionLabel: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: '#6B6B6B',
    letterSpacing: 0.5,
  },
  sectionDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  articleList: {
    marginHorizontal: 16,
    marginTop: 6,
    gap: 8,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.07)',
    padding: 14,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
      },
      android: { elevation: 1 },
    }),
  },
  articleRowLast: {},
  articleRowContent: {
    flex: 1,
    gap: 5,
  },
  articleRowCategory: {
    fontSize: 9,
    color: '#6B6B6B',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  articleRowTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: '#0A0A0A',
    lineHeight: 20,
  },
  articleRowMeta: {
    fontSize: 10,
    color: '#6B6B6B',
    marginTop: 2,
  },
  articleRowThumb: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#F0EFED',
    flexShrink: 0,
  },
});
