// app/(home)/book-notes.tsx — Gentleman's AI reflections on a book
import { getMockNoteCount, getMockNotes } from '@/constants/mockNotes';
import { Book, NoteSet } from '@/types/book';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Skeleton card ────────────────────────────────────────────────────────────
function SkeletonCard({ height = 80 }: { height?: number }) {
  const opacity = useSharedValue(0.35);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 700 }),
        withTiming(0.35, { duration: 700 }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animStyle = useAnimatedStyle(() => ({ opacity: opacity.value }));

  return (
    <View style={{ width: '100%', height, borderRadius: 12, overflow: 'hidden' }}>
      <Animated.View style={[{ flex: 1, backgroundColor: '#D4D4D4' }, animStyle]} />
    </View>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ label }: { label: string }) {
  return (
    <Text style={styles.sectionLabel}>{label}</Text>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function BookNotesScreen() {
  const params = useLocalSearchParams<{ book: string }>();
  const book: Book = JSON.parse(params.book);

  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<NoteSet | null>(null);
  const [noteIndex, setNoteIndex] = useState(0);
  const contentOpacity = useSharedValue(0);
  const contentStyle = useAnimatedStyle(() => ({ opacity: contentOpacity.value }));

  const loadNotes = (index: number) => {
    setLoading(true);
    setNotes(null);
    contentOpacity.value = 0;
    setTimeout(() => {
      setNotes(getMockNotes(book.id, index));
      setLoading(false);
      contentOpacity.value = withTiming(1, { duration: 400 });
    }, 900);
  };

  useEffect(() => { loadNotes(0); }, []);

  const handleNewPerspective = () => {
    const total = getMockNoteCount(book.id);
    const next = (noteIndex + 1) % Math.max(total, 1);
    setNoteIndex(next);
    loadNotes(next);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEDED' }} edges={['top', 'bottom']}>
      {/* Nav */}
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.back()}
          style={styles.navBack}
          accessibilityRole="button"
          accessibilityLabel="Back"
        >
          <ArrowLeft size={16} color="#6B6B6B" strokeWidth={1.5} />
          <Text numberOfLines={1} style={styles.navTitle}>{book.title}</Text>
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Dark header card */}
        <View style={styles.headerCard}>
          <Text style={styles.headerLabel}>GENTLEMAN'S NOTES</Text>
          <Text style={styles.headerTitle} numberOfLines={2}>{book.title}</Text>
          <Text style={styles.headerAuthor}>{book.author}</Text>
        </View>

        {loading ? (
          /* Skeleton */
          <View style={{ gap: 10 }}>
            <SectionLabel label="Key Insights" />
            <SkeletonCard height={72} />
            <SkeletonCard height={72} />
            <SkeletonCard height={72} />
            <SectionLabel label="Gentleman's Reflection" />
            <SkeletonCard height={110} />
            <SectionLabel label="Reflect On This" />
            <SkeletonCard height={72} />
            <SkeletonCard height={72} />
          </View>
        ) : (
          /* Loaded content */
          <Animated.View style={[{ gap: 0 }, contentStyle]}>
            {/* Key Insights */}
            <SectionLabel label="Key Insights" />
            <View style={{ gap: 8, marginBottom: 20 }}>
              {notes!.insights.map((insight, i) => (
                <View key={i} style={styles.insightCard}>
                  <View style={styles.insightDot} />
                  <Text style={styles.insightText}>{insight}</Text>
                </View>
              ))}
            </View>

            {/* Gentleman's Reflection */}
            <SectionLabel label="Gentleman's Reflection" />
            <View style={[styles.reflectionCard, { marginBottom: 20 }]}>
              <Text style={styles.reflectionText}>{notes!.reflection}</Text>
            </View>

            {/* Reflect On This */}
            <SectionLabel label="Reflect On This" />
            <View style={{ gap: 8, marginBottom: 28 }}>
              {notes!.questions.map((q, i) => (
                <View key={i} style={styles.questionCard}>
                  <View style={styles.questionBadge}>
                    <Text style={styles.questionBadgeText}>{i + 1}</Text>
                  </View>
                  <Text style={styles.questionText}>{q}</Text>
                </View>
              ))}
            </View>

            {/* New Perspective button */}
            <Pressable
              style={styles.outlineButton}
              onPress={handleNewPerspective}
              accessibilityRole="button"
              accessibilityLabel="Generate new perspective"
            >
              <Text style={styles.outlineButtonLabel}>New Perspective</Text>
            </Pressable>
          </Animated.View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D4D4D4',
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  navTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#6B6B6B',
    flex: 1,
  },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
    gap: 0,
  },
  headerCard: {
    backgroundColor: '#0A0A0A',
    borderRadius: 18,
    padding: 20,
    marginBottom: 20,
  },
  headerLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 10,
    color: 'rgba(237,237,237,0.5)',
    letterSpacing: 2,
    marginBottom: 6,
  },
  headerTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#EDEDED',
    lineHeight: 24,
    marginBottom: 4,
  },
  headerAuthor: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    color: 'rgba(237,237,237,0.5)',
  },
  sectionLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 10,
    color: 'rgba(10,10,10,0.4)',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 10,
    marginTop: 4,
  },
  insightCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  insightDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#0A0A0A',
    marginTop: 7,
    flexShrink: 0,
  },
  insightText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#1C1C1C',
    lineHeight: 20,
    flex: 1,
  },
  reflectionCard: {
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    padding: 16,
  },
  reflectionText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#0A0A0A',
    lineHeight: 24,
  },
  questionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  questionBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: 1,
  },
  questionBadgeText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 11,
    color: '#EDEDED',
  },
  questionText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#1C1C1C',
    lineHeight: 20,
    flex: 1,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#0A0A0A',
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
  },
  outlineButtonLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#0A0A0A',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
