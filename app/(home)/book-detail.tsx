// app/(home)/book-detail.tsx — Book detail screen
import { BOOK_SUMMARIES } from '@/constants/bookSummaries';
import { GUTENBERG_TEXT_MAP } from '@/constants/gutenbergMap';
import { useBooksStore } from '@/store/booksStore';
import { useNotesStore } from '@/store/notesStore';
import { Book, UserNote } from '@/types/book';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Bookmark, BookOpen, PenLine, Sparkles, X } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Image,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const COVER_COLORS = ['#1C1C1C', '#2C2C2C', '#3B2F2F', '#2B3A2B', '#2B2B3A', '#3A2B38', '#3A352B'];
function coverColor(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return COVER_COLORS[n % COVER_COLORS.length];
}

function getRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function BookDetailScreen() {
  const params = useLocalSearchParams<{ book: string }>();
  const book: Book = JSON.parse(params.book);

  const { addBook, removeBook, isInLibrary } = useBooksStore();
  const { hydrate: hydrateNotes, getNotesForBook, deleteNote } = useNotesStore();
  const saved = isInLibrary(book.id);
  const canRead = GUTENBERG_TEXT_MAP[book.id] !== undefined;
  const [showNotesModal, setShowNotesModal] = useState(false);

  useEffect(() => { hydrateNotes(); }, []);
  const bookNotes = getNotesForBook(book.id);

  const coverUrl = book.coverUrl ?? null;

  const toggleSave = () => {
    Haptics.selectionAsync();
    if (saved) removeBook(book.id);
    else addBook(book);
  };

  const handleDeleteNote = (note: UserNote) => {
    Alert.alert('Delete Note', 'Remove this note?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteNote(book.id, note.id),
      },
    ]);
  };

  // Use curated summary if available, fall back to API description, then generic
  const bodyText =
    BOOK_SUMMARIES[book.id] ??
    book.description ??
    'A work that has endured because it speaks to something permanent in human nature. Its pages reward the attentive reader with insights that sharpen with rereading.';

  // Split on double newlines to render paragraphs separately
  const paragraphs = bodyText.split('\n\n').filter(Boolean);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAF8' }} edges={['top', 'bottom']}>
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
        <View style={styles.descriptionBlock}>
          <Text style={styles.sectionLabel}>Description</Text>
          {paragraphs.map((p, i) => (
            <Text key={i} style={styles.paragraph}>{p}</Text>
          ))}
        </View>

        {/* My Notes section */}
        <View style={styles.notesSectionDivider} />
        <View style={styles.notesSectionHeader}>
          <View style={styles.notesSectionLeft}>
            <PenLine size={14} color="#0A0A0A" strokeWidth={1.5} />
            <Text style={styles.sectionLabel}>My Notes</Text>
          </View>
          {bookNotes.length > 0 && (
            <Pressable onPress={() => setShowNotesModal(true)} hitSlop={8}>
              <Text style={styles.viewAllLabel}>View All ({bookNotes.length})</Text>
            </Pressable>
          )}
        </View>

        {bookNotes.length === 0 ? (
          <View style={styles.notesEmptyState}>
            <Text style={styles.notesEmptyText}>
              No notes yet. Tap the pencil while reading to add your first reflection.
            </Text>
          </View>
        ) : (
          <Pressable
            style={styles.notePreviewCard}
            onLongPress={() => handleDeleteNote(bookNotes[bookNotes.length - 1])}
          >
            <Text style={styles.notePreviewText} numberOfLines={3}>
              {bookNotes[bookNotes.length - 1].text}
            </Text>
            <View style={styles.notePreviewMeta}>
              {bookNotes[bookNotes.length - 1].pageIndex !== undefined && (
                <Text style={styles.noteMetaLabel}>
                  Page {(bookNotes[bookNotes.length - 1].pageIndex ?? 0) + 1}
                </Text>
              )}
              <Text style={styles.noteMetaLabel}>
                {getRelativeDate(bookNotes[bookNotes.length - 1].createdAt)}
              </Text>
            </View>
          </Pressable>
        )}

        {/* CTAs */}
        <View style={styles.ctaGroup}>
          {/* Primary — Read Now */}
          <Pressable
            style={[styles.ctaButton, !canRead && styles.ctaButtonDisabled]}
            onPress={() => {
              if (canRead) {
                router.push({ pathname: '/(home)/book-reader', params: { book: JSON.stringify(book) } });
              }
            }}
            accessibilityRole="button"
            accessibilityLabel={canRead ? 'Read book' : 'Reading not available'}
          >
            <BookOpen size={15} color="#EDEDED" strokeWidth={1.5} />
            <Text style={styles.ctaLabel}>{canRead ? 'Read Now' : 'Not Available'}</Text>
          </Pressable>

          {/* Secondary — Gentleman&apos;s Reflections */}
          <Pressable
            style={styles.ctaOutline}
            onPress={() =>
              router.push({ pathname: '/(home)/book-notes', params: { book: JSON.stringify(book) } })
            }
            accessibilityRole="button"
            accessibilityLabel="Open AI chat and reflections"
          >
            <Sparkles size={14} color="#0A0A0A" strokeWidth={1.5} />
            <Text style={styles.ctaOutlineLabel}>Gentleman&apos;s Reflections</Text>
          </Pressable>
        </View>
      </ScrollView>

      {/* All Notes Modal */}
      <Modal
        visible={showNotesModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNotesModal(false)}
      >
        <SafeAreaView style={{ flex: 1, backgroundColor: '#FAFAF8' }} edges={['top', 'bottom']}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>My Notes — {book.title}</Text>
            <Pressable onPress={() => setShowNotesModal(false)} hitSlop={12}>
              <X size={18} color="#6B6B6B" strokeWidth={1.5} />
            </Pressable>
          </View>
          <FlatList
            data={[...bookNotes].reverse()}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.notesListContent}
            renderItem={({ item }) => (
              <Pressable
                style={styles.notesListCard}
                onLongPress={() => handleDeleteNote(item)}
              >
                <Text style={styles.notesListText}>{item.text}</Text>
                <View style={styles.notePreviewMeta}>
                  {item.pageIndex !== undefined && (
                    <Text style={styles.noteMetaLabel}>Page {item.pageIndex + 1}</Text>
                  )}
                  <Text style={styles.noteMetaLabel}>{getRelativeDate(item.createdAt)}</Text>
                </View>
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            ListEmptyComponent={() => (
              <Text style={styles.notesEmptyText}>No notes yet.</Text>
            )}
          />
        </SafeAreaView>
      </Modal>
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
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D4D4D4',
    backgroundColor: '#FAFAF8',
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
    paddingBottom: 56,
    alignItems: 'center',
  },
  coverWrapper: {
    marginBottom: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#1C1C1C',
        shadowOffset: { width: 0, height: 14 },
        shadowOpacity: 0.22,
        shadowRadius: 22,
      },
      android: { elevation: 12 },
    }),
  },
  cover: {
    width: 148,
    height: 222,
    borderRadius: 10,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverImage: {
    width: 148,
    height: 222,
  },
  coverInitial: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 52,
    color: 'rgba(255,255,255,0.25)',
  },
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#0A0A0A',
    textAlign: 'center',
    lineHeight: 30,
    marginTop: 22,
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
    marginTop: 14,
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
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D4D4D4',
    marginVertical: 24,
  },
  descriptionBlock: {
    width: '100%',
    gap: 0,
  },
  sectionLabel: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    color: '#0A0A0A',
    marginBottom: 16,
  },
  paragraph: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    color: '#1C1C1C',
    lineHeight: 26,
    textAlign: 'left',
    marginBottom: 16,
  },
  notesSectionDivider: {
    width: '100%',
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#D4D4D4',
    marginBottom: 24,
  },
  notesSectionHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 0,
  },
  notesSectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewAllLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
    letterSpacing: 0.3,
  },
  notesEmptyState: {
    width: '100%',
    backgroundColor: '#F5F5F5',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    padding: 16,
    marginBottom: 24,
  },
  notesEmptyText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 20,
    textAlign: 'center',
  },
  notePreviewCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#D4D4D4',
  },
  notePreviewText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#1C1C1C',
    lineHeight: 22,
    marginBottom: 10,
  },
  notePreviewMeta: {
    flexDirection: 'row',
    gap: 10,
  },
  noteMetaLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    color: '#6B6B6B',
    letterSpacing: 0.3,
  },
  ctaGroup: {
    width: '100%',
    gap: 12,
    marginTop: 12,
  },
  ctaButton: {
    width: '100%',
    backgroundColor: '#0A0A0A',
    borderRadius: 50,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  ctaButtonDisabled: {
    backgroundColor: 'rgba(10,10,10,0.3)',
  },
  ctaLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#EDEDED',
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
  ctaOutline: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#0A0A0A',
    borderRadius: 50,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  ctaOutlineLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#0A0A0A',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D4D4D4',
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: '#0A0A0A',
    flex: 1,
    marginRight: 12,
  },
  notesListContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  notesListCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#D4D4D4',
  },
  notesListText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#1C1C1C',
    lineHeight: 22,
    marginBottom: 10,
  },
});
