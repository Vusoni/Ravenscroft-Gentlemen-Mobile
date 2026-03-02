// app/(home)/index.tsx
import { router } from 'expo-router';
import { ArrowRight } from 'lucide-react-native';
import { type ReactNode } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

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

export default function HomeScreen() {
  const handleGenerateSummary = () => {
    console.log('[Ravenscroft] Generate Summary tapped for:', ARTICLE.title);
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 32 }}
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

            {/* Generate Summary button */}
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

              {/* Summary */}
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
