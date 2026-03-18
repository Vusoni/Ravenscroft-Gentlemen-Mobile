// app/(home)/kindle-import.tsx — Kindle highlights import screen
import { GlassCard } from '@/components/GlassCard';
import { ImportButton } from '@/components/ImportButton';
import { KindleHighlightCard } from '@/components/KindleHighlightCard';
import { useKindleImport } from '@/hooks/useKindleImport';
import { useBooksStore } from '@/store/booksStore';
import { useKindleStore } from '@/store/kindleStore';
import type { KindleBook } from '@/types/kindle';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Circle,
  FileText,
  Highlighter,
  MessageSquareText,
  X,
} from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function KindleImportScreen() {
  const insets = useSafeAreaInsets();
  const {
    hydrate,
    books,
    imports,
    getClippingsForBook,
  } = useKindleStore();
  const { library, hydrate: hydrateBooks } = useBooksStore();

  const { importing, result, error, handleImport, handleConfirmMatch } = useKindleImport();

  // Matching modal
  const [matchingBook, setMatchingBook] = useState<KindleBook | null>(null);
  // Highlights modal
  const [viewingBook, setViewingBook] = useState<KindleBook | null>(null);

  useEffect(() => {
    hydrate();
    hydrateBooks();
  }, []);

  const lastImport = imports.length > 0 ? imports[imports.length - 1] : null;

  // ─── Render helpers ─────────────────────────────────────────────────────────

  const renderBookRow = ({ item, index }: { item: KindleBook; index: number }) => {
    const isMatched = !!item.matchedBookId;
    const matchedLib = isMatched ? library.find((b) => b.id === item.matchedBookId) : null;
    return (
      <Animated.View entering={FadeInDown.delay(index * 60).duration(400)}>
        <Pressable onPress={() => setViewingBook(item)}>
          <GlassCard borderRadius={16} style={styles.bookCard}>
            <View style={styles.bookHeader}>
              <View style={styles.bookInfo}>
                <Text style={styles.bookTitle} numberOfLines={2}>{item.rawTitle}</Text>
                <Text style={styles.bookAuthor} numberOfLines={1}>{item.rawAuthor}</Text>
              </View>
              <View style={[styles.statusDot, { backgroundColor: isMatched ? '#34C759' : '#FF9500' }]} />
            </View>

            <View style={styles.stats}>
              <View style={styles.statPill}>
                <Highlighter size={12} color="#6B6B6B" strokeWidth={2} />
                <Text style={styles.statText}>{item.highlightCount}</Text>
              </View>
              {item.noteCount > 0 && (
                <View style={styles.statPill}>
                  <MessageSquareText size={12} color="#6B6B6B" strokeWidth={2} />
                  <Text style={styles.statText}>{item.noteCount}</Text>
                </View>
              )}
            </View>

            {isMatched && matchedLib ? (
              <View style={styles.matchedRow}>
                <Check size={14} color="#34C759" strokeWidth={2.5} />
                <Text style={styles.matchedText} numberOfLines={1}>
                  Matched to {matchedLib.title}
                </Text>
              </View>
            ) : (
              <Pressable style={styles.matchButton} onPress={() => setMatchingBook(item)}>
                <BookOpen size={14} color="#0A0A0A" strokeWidth={2} />
                <Text style={styles.matchButtonText}>Match to Library</Text>
              </Pressable>
            )}
          </GlassCard>
        </Pressable>
      </Animated.View>
    );
  };

  // ─── Matching modal ─────────────────────────────────────────────────────────

  const renderMatchingModal = () => (
    <Modal
      visible={!!matchingBook}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setMatchingBook(null)}
    >
      <SafeAreaView style={styles.modalContainer}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>Match Book</Text>
          <Pressable onPress={() => setMatchingBook(null)}>
            <X size={22} color="#0A0A0A" strokeWidth={2} />
          </Pressable>
        </View>

        {matchingBook && (
          <View style={styles.matchingInfo}>
            <Text style={styles.matchingKindleTitle}>{matchingBook.rawTitle}</Text>
            <Text style={styles.matchingKindleAuthor}>by {matchingBook.rawAuthor}</Text>
          </View>
        )}

        <Text style={styles.matchingLabel}>Select from your library:</Text>

        {library.length === 0 ? (
          <View style={styles.emptyState}>
            <BookOpen size={32} color="#D4D4D4" strokeWidth={1.5} />
            <Text style={styles.emptyText}>Your library is empty. Add books first.</Text>
          </View>
        ) : (
          <FlatList
            data={library}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            renderItem={({ item }) => (
              <Pressable
                style={styles.libraryRow}
                onPress={async () => {
                  if (matchingBook) {
                    await handleConfirmMatch(matchingBook.kindleKey, item.id);
                    setMatchingBook(null);
                  }
                }}
              >
                <View style={styles.libraryRowInfo}>
                  <Text style={styles.libraryRowTitle} numberOfLines={1}>{item.title}</Text>
                  <Text style={styles.libraryRowAuthor} numberOfLines={1}>{item.author}</Text>
                </View>
                <Circle size={18} color="#D4D4D4" strokeWidth={1.5} />
              </Pressable>
            )}
          />
        )}

        <Pressable style={styles.skipButton} onPress={() => setMatchingBook(null)}>
          <Text style={styles.skipButtonText}>Skip</Text>
        </Pressable>
      </SafeAreaView>
    </Modal>
  );

  // ─── Highlights modal ──────────────────────────────────────────────────────

  const renderHighlightsModal = () => {
    if (!viewingBook) return null;
    const clippings = getClippingsForBook(viewingBook.kindleKey);

    return (
      <Modal
        visible={!!viewingBook}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setViewingBook(null)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <View style={{ flex: 1 }}>
              <Text style={styles.modalTitle} numberOfLines={1}>{viewingBook.rawTitle}</Text>
              <Text style={styles.modalSubtitle}>{clippings.length} clippings</Text>
            </View>
            <Pressable onPress={() => setViewingBook(null)}>
              <X size={22} color="#0A0A0A" strokeWidth={2} />
            </Pressable>
          </View>

          <FlatList
            data={clippings}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 40 }}
            renderItem={({ item }) => <KindleHighlightCard clipping={item} />}
            ListEmptyComponent={
              <View style={styles.emptyState}>
                <Text style={styles.emptyText}>No clippings found.</Text>
              </View>
            }
          />
        </SafeAreaView>
      </Modal>
    );
  };

  // ─── Main render ────────────────────────────────────────────────────────────

  return (
    <View style={{ flex: 1, backgroundColor: '#EDEDED' }}>
      <SafeAreaView style={{ flex: 1 }} edges={['top']}>
        {/* Nav bar */}
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={22} color="#0A0A0A" strokeWidth={2} />
          </Pressable>
          <Text style={styles.navTitle}>Kindle Highlights</Text>
          <View style={{ width: 22 }} />
        </View>

        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingBottom: insets.bottom + 40,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Import Card */}
          <GlassCard borderRadius={20} style={styles.importCard}>
            <FileText size={32} color="#0A0A0A" strokeWidth={1.4} />
            <Text style={styles.importTitle}>Import MyClippings.txt</Text>
            <Text style={styles.importDesc}>
              Connect your Kindle device to your computer, find the MyClippings.txt file, and transfer it to your phone.
            </Text>

            <View style={{ marginTop: 16 }}>
              <ImportButton onPress={handleImport} loading={importing} />
            </View>

            {lastImport && (
              <Text style={styles.lastImport}>
                Last import: {new Date(lastImport.importedAt).toLocaleDateString()} ({lastImport.clippingsAdded} added)
              </Text>
            )}
          </GlassCard>

          {/* Error */}
          {error && (
            <Animated.View entering={FadeInDown.duration(300)}>
              <View style={styles.errorCard}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            </Animated.View>
          )}

          {/* Import result */}
          {result && (
            <Animated.View entering={FadeInDown.duration(400)}>
              <GlassCard borderRadius={14} style={styles.resultCard}>
                <Text style={styles.resultTitle}>Import Complete</Text>
                <Text style={styles.resultText}>
                  {result.added} new highlights added across {result.booksFound} books.
                  {result.duplicates > 0 && ` ${result.duplicates} duplicates skipped.`}
                </Text>
              </GlassCard>
            </Animated.View>
          )}

          {/* Book list */}
          {books.length > 0 && (
            <View style={{ marginTop: 24 }}>
              <Text style={styles.sectionTitle}>Your Kindle Books ({books.length})</Text>
              {books.map((book, index) => (
                <View key={book.kindleKey}>
                  {renderBookRow({ item: book, index })}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      </SafeAreaView>

      {renderMatchingModal()}
      {renderHighlightsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  navTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    color: '#0A0A0A',
  },
  importCard: {
    padding: 24,
    alignItems: 'center',
    marginTop: 8,
  },
  importTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#0A0A0A',
    marginTop: 12,
  },
  importDesc: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 8,
    paddingHorizontal: 8,
  },
  lastImport: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    color: '#6B6B6B',
    marginTop: 12,
  },
  errorCard: {
    backgroundColor: '#FFF0F0',
    borderRadius: 12,
    padding: 14,
    marginTop: 16,
    borderWidth: 1,
    borderColor: '#FFD4D4',
  },
  errorText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#CC3333',
    textAlign: 'center',
  },
  resultCard: {
    padding: 16,
    marginTop: 16,
  },
  resultTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: '#0A0A0A',
  },
  resultText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 4,
    lineHeight: 20,
  },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    color: '#0A0A0A',
    marginBottom: 14,
  },
  bookCard: {
    padding: 16,
    marginBottom: 12,
  },
  bookHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  bookInfo: { flex: 1 },
  bookTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: '#0A0A0A',
    lineHeight: 21,
  },
  bookAuthor: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
    marginTop: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  stats: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(245,245,245,0.8)',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  statText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
  },
  matchedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 10,
  },
  matchedText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#34C759',
    flex: 1,
  },
  matchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 10,
    paddingVertical: 8,
  },
  matchButtonText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 12,
    color: '#0A0A0A',
  },
  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: '#EDEDED',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D4D4D4',
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 17,
    color: '#0A0A0A',
  },
  modalSubtitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
    marginTop: 2,
  },
  matchingInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#D4D4D4',
  },
  matchingKindleTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#0A0A0A',
  },
  matchingKindleAuthor: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 2,
  },
  matchingLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 13,
    color: '#6B6B6B',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  libraryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#D4D4D4',
  },
  libraryRowInfo: { flex: 1 },
  libraryRowTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: '#0A0A0A',
  },
  libraryRowAuthor: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
    marginTop: 2,
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#D4D4D4',
    marginHorizontal: 20,
  },
  skipButtonText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#6B6B6B',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 12,
  },
  emptyText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
  },
});
