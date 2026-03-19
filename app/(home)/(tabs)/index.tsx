// app/(home)/(tabs)/index.tsx — Articles tab
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { ALL_FEED_CATEGORIES } from '@/constants/articles';
import { useNewsStore } from '@/store/newsStore';
import type { FeedArticle, FeedCategory } from '@/types/news';
import { router } from 'expo-router';
import * as Linking from 'expo-linking';
import { ArrowUpRight, BookOpen } from 'lucide-react-native';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import {
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { useScaleAnimation } from '@/hooks/useScaleAnimation';

const GUIDE_SHOWN_KEY = 'ravenscroft_guide_shown';
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PressCard({ onPress, children }: { onPress: () => void; children: ReactNode }) {
  const { animStyle, onPressIn, onPressOut } = useScaleAnimation({ pressedScale: 0.97 });
  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
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
function CategoryChip({ label, active, onPress }: {
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

// ─── Article card ─────────────────────────────────────────────────────────────
function ArticleCard({ article, index, onPress }: {
  article: FeedArticle;
  index: number;
  onPress: () => void;
}) {
  return (
    <Animated.View entering={FadeInDown.delay(80 * index).duration(400)}>
      <PressCard onPress={onPress}>
        <View style={styles.card}>
          {article.imageUrl ? (
            <Image source={{ uri: article.imageUrl }} style={styles.cardImage} resizeMode="cover" />
          ) : (
            <View style={[styles.cardImage, styles.cardImagePlaceholder]} />
          )}
          <View style={styles.cardBody}>
            <Text style={styles.cardMeta}>{article.date} · {article.readTime}</Text>
            <Text style={styles.cardTitle} numberOfLines={2}>{article.title}</Text>
            <Text style={styles.cardExcerpt} numberOfLines={3}>{article.excerpt}</Text>
            <View style={styles.cardCtaRow}>
              <Text style={styles.cardCtaText}>
                {article.source === 'live' ? 'Read article' : 'View more'}
              </Text>
              <ArrowUpRight size={12} color="#0A0A0A" strokeWidth={1.5} />
            </View>
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
  const [activeCategory, setActiveCategory] = useState<FeedCategory | 'All'>('All');

  const { articles, isLoading, error, hydrate, fetchAndStore } = useNewsStore();

  useEffect(() => {
    AsyncStorage.getItem(GUIDE_SHOWN_KEY).then((val) => {
      if (!val) setShowWelcome(true);
    });
  }, []);

  useEffect(() => {
    hydrate().then(() => fetchAndStore());
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

  const navigate = (article: FeedArticle) => {
    if (article.source === 'live' && article.url) {
      Linking.openURL(article.url);
    } else {
      router.push({ pathname: '/(home)/article', params: { id: article.id } });
    }
  };

  const filteredArticles = useMemo(() => {
    if (activeCategory === 'All') return articles;
    return articles.filter((a) => a.category === activeCategory);
  }, [articles, activeCategory]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEDED' }} edges={['top']}>
      <WelcomeModal visible={showWelcome} onOpenGuide={openGuide} onDismiss={dismissWelcome} />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom + 8 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Page header ───────────────────────── */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Articles</Text>
          <Text style={styles.headerSubtitle}>Stay updated with our newest articles and ideas.</Text>
          {error && !isLoading && (
            <Text style={styles.errorBanner}>{error}</Text>
          )}
        </View>

        {/* ── Category chips ────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryChips}
        >
          <CategoryChip
            label="All"
            active={activeCategory === 'All'}
            onPress={() => setActiveCategory('All')}
          />
          {ALL_FEED_CATEGORIES.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              active={activeCategory === cat}
              onPress={() => setActiveCategory(cat)}
            />
          ))}
        </ScrollView>

        {/* ── Article cards ─────────────────────── */}
        <View style={styles.articleList}>
          {filteredArticles.length > 0 ? (
            filteredArticles.map((article, index) => (
              <ArticleCard
                key={article.id}
                article={article}
                index={index}
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
  // Page header
  header: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: 22,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 30,
    color: '#0A0A0A',
    letterSpacing: -0.5,
    marginBottom: 6,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
  },
  errorBanner: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 11,
    color: '#9A9A9A',
    textAlign: 'center',
    marginTop: 8,
  },

  // Category chips
  categoryChips: { paddingHorizontal: 20, gap: 8, paddingBottom: 4 },
  categoryChip: {
    borderWidth: 1,
    borderColor: '#C0BFBD',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
    backgroundColor: 'transparent',
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

  // Article list
  articleList: { paddingHorizontal: 20, marginTop: 20, gap: 16 },

  // Article card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 12 },
      android: { elevation: 2 },
    }),
  },
  cardImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#D4D0CA',
  },
  cardImagePlaceholder: {
    backgroundColor: '#E8E4DF',
  },
  cardBody: {
    padding: 16,
    gap: 6,
  },
  cardMeta: {
    fontSize: 11,
    color: '#9A9A9A',
    letterSpacing: 0.2,
  },
  cardTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#0A0A0A',
    lineHeight: 25,
  },
  cardExcerpt: {
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 20,
  },
  cardCtaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  cardCtaText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#0A0A0A',
  },

  // Empty state
  emptyState: { paddingVertical: 48, alignItems: 'center' },
  emptyText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#ABABAB',
  },
});
