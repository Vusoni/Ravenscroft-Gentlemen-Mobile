// app/(home)/book-detail.tsx — Book detail screen
import { useBooksStore } from '@/store/booksStore';
import { Book } from '@/types/book';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Bookmark } from 'lucide-react-native';
import { useState } from 'react';
import { Image, Pressable, ScrollView, Text, View, StyleSheet, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Deterministic cover fallback colour
const COVER_COLORS = ['#1C1C1C', '#2C2C2C', '#3B2F2F', '#2B3A2B', '#2B2B3A', '#3A2B38', '#3A352B'];
function coverColor(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return COVER_COLORS[n % COVER_COLORS.length];
}

export default function BookDetailScreen() {
  const params = useLocalSearchParams<{ book: string }>();
  const book: Book = JSON.parse(params.book);

  const { addBook, removeBook, isInLibrary } = useBooksStore();
  const saved = isInLibrary(book.id);

  const [expanded, setExpanded] = useState(false);

  const coverUrl = book.coverUrl ?? null;

  const toggleSave = () => {
    Haptics.selectionAsync();
    if (saved) removeBook(book.id);
    else addBook(book);
  };

  const description = book.description
    ?? 'A work that has endured because it speaks to something permanent in human nature. Its pages reward the attentive reader with insights that sharpen with rereading.';

  const descTrimmed = description.length > 280 && !expanded
    ? description.slice(0, 280).trimEnd() + '…'
    : description;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FFFFFF' }} edges={['top', 'bottom']}>
      {/* Nav */}
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.back()}
          style={styles.navBack}
          accessibilityRole="button"
          accessibilityLabel="Back to library"
        >
          <ArrowLeft size={16} color="#6B6B6B" strokeWidth={1.5} />
          <Text style={styles.navBackLabel}>Library</Text>
        </Pressable>

        <Pressable
          onPress={toggleSave}
          hitSlop={12}
          accessibilityRole="button"
          accessibilityLabel={saved ? 'Remove from library' : 'Save to library'}
        >
          <Bookmark
            size={20}
            color="#0A0A0A"
            strokeWidth={1.5}
            fill={saved ? '#0A0A0A' : 'transparent'}
          />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover */}
        <View style={styles.coverWrapper}>
          <View style={[styles.cover, { backgroundColor: coverColor(book.id) }]}>
            {coverUrl ? (
              <Image source={{ uri: coverUrl }} style={styles.coverImage} resizeMode="cover" />
            ) : (
              <Text style={styles.coverInitial}>{book.title[0]}</Text>
            )}
          </View>
        </View>

        {/* Title & author */}
        <Text style={styles.title}>{book.title}</Text>
        <Text style={styles.author}>{book.author}</Text>

        {/* Meta pills */}
        <View style={styles.pillsRow}>
          {book.genre && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{book.genre}</Text>
            </View>
          )}
          {book.pageCount && (
            <View style={styles.pill}>
              <Text style={styles.pillText}>{book.pageCount} pages</Text>
            </View>
          )}
        </View>

        {/* Divider */}
        <View style={styles.divider} />

        {/* Description */}
        <Text style={styles.description}>{descTrimmed}</Text>
        {description.length > 280 && (
          <Pressable onPress={() => setExpanded(!expanded)} style={{ marginTop: 6 }}>
            <Text style={styles.readMore}>{expanded ? 'Read less' : 'Read more'}</Text>
          </Pressable>
        )}

        {/* CTA */}
        <Pressable
          style={styles.ctaButton}
          onPress={() => router.push({ pathname: '/(home)/book-notes', params: { book: JSON.stringify(book) } })}
          accessibilityRole="button"
          accessibilityLabel="Open gentleman's reflections"
        >
          <Text style={styles.ctaLabel}>Gentleman's Reflections</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#D4D4D4',
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  navBackLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#6B6B6B',
  },
  scroll: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 40,
    alignItems: 'center',
  },
  coverWrapper: {
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#1C1C1C',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: { elevation: 10 },
    }),
  },
  cover: {
    width: 140,
    height: 210,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: 140,
    height: 210,
  },
  coverInitial: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 48,
    color: 'rgba(255,255,255,0.25)',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#0A0A0A',
    textAlign: 'center',
    lineHeight: 30,
    marginTop: 20,
    paddingHorizontal: 8,
  },
  author: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 4,
  },
  pillsRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  pill: {
    backgroundColor: 'rgba(10,10,10,0.06)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  pillText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    color: '#0A0A0A',
    letterSpacing: 0.3,
  },
  divider: {
    width: '100%',
    height: 1,
    backgroundColor: '#D4D4D4',
    marginVertical: 20,
  },
  description: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#1C1C1C',
    lineHeight: 24,
    textAlign: 'left',
    width: '100%',
  },
  readMore: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#6B6B6B',
    textDecorationLine: 'underline',
  },
  ctaButton: {
    marginTop: 28,
    width: '100%',
    backgroundColor: '#0A0A0A',
    borderRadius: 50,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#EDEDED',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
});
