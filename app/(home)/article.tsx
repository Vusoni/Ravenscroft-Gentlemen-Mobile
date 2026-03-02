// app/(home)/article.tsx
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const SUMMARY_POINTS = [
  'AI has the potential to shift focus from productivity to creativity, prioritising original, meaningful, and authentic work over traditional metrics.',
  'Productivity tools often hinder creativity by forcing standardisation, efficiency and predictability, lacking support for non-linear insight and idea generation.',
  'Creative tools should enhance the collection, connection, and creation of ideas, seamlessly supporting both passive foraging and active hunting modes of information discovery.',
];

export default function ArticleScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={['bottom']}>
      {/* Nav */}
      <View className="flex-row items-center px-5 py-3 border-b border-border">
        <Pressable
          onPress={() => router.back()}
          className="flex-row items-center gap-2"
          accessibilityRole="button"
          accessibilityLabel="Back to home"
        >
          <ArrowLeft size={16} color="#6B6B6B" />
          <Text className="text-muted text-sm">Back To Home</Text>
        </Pressable>
      </View>

      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 24, paddingBottom: 48 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Text
          className="text-ink text-2xl leading-8 mb-2"
          style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
        >
          The Art Activities and Interests
        </Text>

        {/* Why intelligence…*/}
        <Text
          className="text-muted text-sm mb-1"
          style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
        >
          Why intelligence and art matter in modes world.
        </Text>

        <Text className="text-muted text-[11px] mb-6">ravenscroft · 01 Mar 2026 · 15 min</Text>

        {/* Body */}
        <Text className="text-charcoal text-sm leading-5 mb-4">
          We're like, if a bunch of Art students opened a Swiss Design Studio in the back of a
          Skate Shop. It's a collision of worlds; a dance of contrasts — a harmonious disarray,
          if you will. For our clients and partners, it means a journey of leveraging seemingly
          disparate elements to craft compelling and lasting narratives. After all, every
          great design tells a story worth living.
        </Text>

        <Text className="text-charcoal text-sm leading-5 mb-6">
          The modern gentleman understands that culture is not a passive inheritance — it is an
          active discipline. To engage with art is to sharpen perception, expand empathy, and
          cultivate the kind of refined judgment that elevates every decision.
        </Text>

        {/* Summary section */}
        <View className="border-t border-border pt-5">
          <Text
            className="text-ink text-base mb-4"
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          >
            Summary
          </Text>

          {SUMMARY_POINTS.map((point, i) => (
            <View key={i} className="flex-row gap-3 mb-4">
              <View className="w-1 h-1 rounded-full bg-ink mt-2 shrink-0" />
              <Text className="text-charcoal text-sm leading-5 flex-1">{point}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
