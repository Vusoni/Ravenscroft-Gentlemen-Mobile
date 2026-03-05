// app/(home)/(tabs)/index.tsx — Articles tab
import AsyncStorage from '@react-native-async-storage/async-storage';
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { router } from 'expo-router';
import { ArrowRight, BookOpen } from 'lucide-react-native';
import { type ReactNode, useEffect, useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
    <SafeAreaView className="flex-1 bg-ivory" edges={['top']}>
      <WelcomeModal
        visible={showWelcome}
        onOpenGuide={openGuide}
        onDismiss={dismissWelcome}
      />

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom }}
        showsVerticalScrollIndicator={false}
      >
        {/* Top bar */}
        <View className="flex-row items-center justify-between px-6 pt-4 pb-6">
          <Text
            className="text-ink text-2xl"
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          >
            Ravenscroft
          </Text>
          <View className="w-8 h-8 rounded-full bg-charcoal/10 items-center justify-center">
            <Text className="text-ink text-xs font-semibold">R</Text>
          </View>
        </View>

        {/* Feed card — dark */}
        <View className="mx-6 mb-6 rounded-2xl overflow-hidden bg-ink">
          {/* Image placeholder */}
          <View className="h-48 bg-charcoal/80 items-end justify-start p-4">
            <Text
              className="text-ivory/30 text-[10px] tracking-widest uppercase"
              style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
            >
              Image
            </Text>
          </View>

          {/* Card body */}
          <View className="p-5 gap-4">
            <Text className="text-ivory/50 text-[10px] tracking-widest uppercase">
              {ARTICLE.category}
            </Text>

            <Text
              className="text-ivory text-xl leading-6"
              style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
            >
              {ARTICLE.title}
            </Text>

            <Pressable
              onPress={handleGenerateSummary}
              className="flex-row items-center gap-2 self-start"
              accessibilityRole="button"
              accessibilityLabel="Generate Summary"
            >
              <View className="bg-ivory/10 rounded-full px-4 py-2 flex-row items-center gap-2">
                <Text className="text-ivory text-xs font-semibold tracking-wide">
                  Generate Summary
                </Text>
                <ArrowRight size={12} color="#EDEDED" />
              </View>
            </Pressable>
          </View>
        </View>

        {/* Article preview card */}
        <PressCard onPress={() => router.push('/(home)/article')}>
          <View className="mx-6 rounded-2xl overflow-hidden bg-white border border-border">
            {/* Nav bar */}
            <View className="flex-row items-center px-4 py-3 border-b border-border">
              <Text className="text-muted text-xs">← Back To Home</Text>
            </View>

            {/* Article header */}
            <View className="px-5 pt-4 pb-3">
              <Text
                className="text-ink text-base leading-6 mb-1"
                style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
              >
                The Art Activities and Interests
              </Text>
              <Text className="text-muted text-[10px]">ravenscroft · 01 Mar 2026 · 15 min</Text>
            </View>

            {/* Body excerpt */}
            <View className="px-5 pb-3">
              <Text className="text-charcoal text-xs leading-4 mb-4" numberOfLines={5}>
                We're like, if a bunch of Art students opened a Swiss Design Studio in the back of a
                Skate Shop. It's a collision of worlds; a dance of contrasts — a harmonious disarray.
                For our clients and partners, it means a journey of leveraging seemingly disparate
                elements to craft compelling and lasting narratives.
              </Text>

              <View className="border-t border-border pt-3">
                <Text
                  className="text-ink text-xs font-semibold mb-2"
                  style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                >
                  Summary
                </Text>
                {ARTICLE.summary.map((point, i) => (
                  <View key={i} className="flex-row gap-2 mb-2">
                    <Text className="text-muted text-[10px] mt-0.5">•</Text>
                    <Text className="text-charcoal text-[10px] leading-4 flex-1">{point}</Text>
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
