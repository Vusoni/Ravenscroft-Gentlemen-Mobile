// app/(home)/(tabs)/index.tsx — Articles tab
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { ARTICLE_CATEGORIES, ARTICLES, Article, ArticleCategory } from '@/constants/articles';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import { ArrowRight, BookOpen } from 'lucide-react-native';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const GUIDE_SHOWN_KEY = 'ravenscroft_guide_shown';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressCard({ onPress, children }: { onPress: () => void; children: ReactNode }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      onPress={onPress}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── Welcome modal ────────────────────────────────────────────────────────────
function WelcomeModal({ visible, onOpenGuide, onDismiss }: {
  visible: boolean;
  onOpenGuide: () => void;
  onDismiss: () => void;
}) {
  return (
    <Modal visible={visible} animationType="slide" presentationStyle="pageSheet" onRequestClose={onDismiss}>
      <SafeAreaView style={modalStyles.container} edges={['top', 'bottom']}>
        <View style={modalStyles.coverArea}>
          <View style={modalStyles.coverInitialBox}>
            <Text style={modalStyles.coverInitial}>R</Text>
          </View>
        </View>
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
  container: { flex: 1, backgroundColor: '#FAFAF8' },
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
  body: { flex: 1, paddingHorizontal: 32, paddingTop: 40 },
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
  divider: { width: 32, height: 1, backgroundColor: '#0A0A0A', marginBottom: 22 },
  description: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    color: '#1C1C1C',
    lineHeight: 26,
    marginBottom: 14,
  },
  ctaGroup: { paddingHorizontal: 24, paddingBottom: 24, gap: 12 },
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
  ctaSecondary: { alignItems: 'center', paddingVertical: 14 },
  ctaSecondaryLabel: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#6B6B6B',
  },
});

// ─── Category chip ────────────────────────────────────────────────────────────
function CategoryChip({
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
      style={[styles.categoryChip, active && styles.categoryChipActive]}
    >
      <Text style={[styles.categoryChipText, active && styles.categoryChipTextActive]}>
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Article row card ─────────────────────────────────────────────────────────
function ArticleRow({
  article,
  index,
  isLast,
  onPress,
}: {
  article: Article;
  index: number;
  isLast: boolean;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(60 * index).duration(350)}>
      <PressCard onPress={onPress}>
        <View style={[styles.articleRow, isLast && styles.articleRowLast]}>
          <View style={styles.articleRowContent}>
            <Text style={styles.articleRowCategory}>{article.category}</Text>
            <Text style={styles.articleRowTitle} numberOfLines={2}>{article.title}</Text>
            <Text style={styles.articleRowMeta}>{article.date} · {article.readTime}</Text>
          </View>
          {/* Thumbnail placeholder */}
          <View style={styles.articleRowThumb}>
            <Text style={styles.articleThumbLetter}>{article.category[0]}</Text>
          </View>
        </View>
      </PressCard>
    </Animated.View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function ArticlesTab() {
  const insets = useSafeAreaInsets();
  const [showWelcome, setShowWelcome] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ArticleCategory | 'All'>('All');

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

  const navigate = (article: Article) => {
    router.push({ pathname: '/(home)/article', params: { id: article.id } });
  };

  const featured = ARTICLES[0];

  const editorial = useMemo(() => {
    const rest = ARTICLES.slice(1);
    if (activeCategory === 'All') return rest;
    return rest.filter((a) => a.category === activeCategory);
  }, [activeCategory]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top']}>
      <WelcomeModal visible={showWelcome} onOpenGuide={openGuide} onDismiss={dismissWelcome} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Top bar ───────────────────────────── */}
        <View style={styles.topBar}>
          <Text style={styles.topBarTitle}>Ravenscroft</Text>
          <View style={styles.avatarPillShadow}>
            <View style={styles.avatarPill}>
              {Platform.OS === 'ios' && (
                <BlurView intensity={50} tint="systemChromeMaterialLight" style={StyleSheet.absoluteFill} />
              )}
              <View style={[StyleSheet.absoluteFill, styles.avatarPillFill]} pointerEvents="none" />
              <Text style={styles.avatarPillText}>R</Text>
            </View>
          </View>
        </View>

        {/* ── Featured card ─────────────────────── */}
        <PressCard onPress={() => navigate(featured)}>
          <View style={styles.feedCard}>
            <View style={styles.feedImageArea}>
              <Text style={styles.feedCategoryBadge}>{featured.category}</Text>
            </View>
            <View style={styles.feedBody}>
              <Text style={styles.feedMeta}>ravenscroft · {featured.date} · {featured.readTime}</Text>
              <Text style={styles.feedTitle}>{featured.title}</Text>
              <Text style={styles.feedExcerpt} numberOfLines={2}>{featured.excerpt}</Text>
              <View style={styles.readMoreRow}>
                <Text style={styles.readMoreText}>Read article</Text>
                <ArrowRight size={12} color="rgba(237,237,237,0.7)" />
              </View>
            </View>
          </View>
        </PressCard>

        {/* ── Category chips ────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChips}
          style={styles.categoryChipsWrap}
        >
          <CategoryChip
            label="All"
            active={activeCategory === 'All'}
            onPress={() => setActiveCategory('All')}
          />
          {ARTICLE_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
            />
          ))}
        </ScrollView>

        {/* ── Editorial section ─────────────────── */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionLabel}>Editorial</Text>
          <View style={styles.sectionDivider} />
        </View>

        <View style={styles.articleList}>
          {editorial.length > 0 ? (
            editorial.map((article, index) => (
              <ArticleRow
                key={article.id}
                article={article}
                index={index}
                isLast={index === editorial.length - 1}
                onPress={() => navigate(article)}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No articles in this category yet.</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 20,
  },
  topBarTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#0A0A0A',
  },
  avatarPillShadow: {
    borderRadius: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.09, shadowRadius: 10 },
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
    backgroundColor: Platform.select({ ios: 'transparent', android: 'rgba(255,255,255,0.68)' }),
  },
  avatarPillFill: { backgroundColor: 'rgba(255,255,255,0.65)', borderRadius: 17 },
  avatarPillText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 13, color: '#0A0A0A' },

  // Featured card
  feedCard: {
    marginHorizontal: 20,
    marginBottom: 8,
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: '#0A0A0A',
    ...Platform.select({
      ios: { shadowColor: '#0A0A0A', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.28, shadowRadius: 28 },
      android: { elevation: 12 },
    }),
  },
  feedImageArea: {
    height: 160,
    backgroundColor: '#111111',
    justifyContent: 'flex-end',
    padding: 18,
  },
  feedCategoryBadge: {
    fontSize: 9,
    color: 'rgba(237,237,237,0.45)',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
  },
  feedBody: { padding: 20, gap: 8 },
  feedMeta: { fontSize: 10, color: 'rgba(237,237,237,0.38)', letterSpacing: 0.3 },
  feedTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#EDEDED',
    lineHeight: 26,
  },
  feedExcerpt: { fontSize: 12, color: 'rgba(237,237,237,0.52)', lineHeight: 18 },
  readMoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  readMoreText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: 'rgba(237,237,237,0.6)',
  },

  // Category chips
  categoryChipsWrap: { marginTop: 20 },
  categoryChips: { paddingHorizontal: 20, gap: 8 },
  categoryChip: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E8E8E8',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  categoryChipActive: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  categoryChipText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
  },
  categoryChipTextActive: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#EDEDED',
  },

  // Editorial section
  sectionHeader: {
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 8,
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
    backgroundColor: 'rgba(0,0,0,0.08)',
  },
  articleList: { marginHorizontal: 16, gap: 8 },

  // Article row
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    padding: 16,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 10 },
      android: { elevation: 2 },
    }),
  },
  articleRowLast: {},
  articleRowContent: { flex: 1, gap: 5 },
  articleRowCategory: {
    fontSize: 9,
    color: '#9A9A9A',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  articleRowTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: '#0A0A0A',
    lineHeight: 20,
  },
  articleRowMeta: { fontSize: 10, color: '#9A9A9A', marginTop: 2 },
  articleRowThumb: {
    width: 52,
    height: 52,
    borderRadius: 14,
    backgroundColor: '#F0EFED',
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  articleThumbLetter: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#C8C6C2',
  },

  // Empty state
  emptyState: { paddingVertical: 40, alignItems: 'center' },
  emptyText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#ABABAB',
  },
});
