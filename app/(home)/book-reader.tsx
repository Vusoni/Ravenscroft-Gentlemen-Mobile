// app/(home)/book-reader.tsx — Kindle-like reading screen
import { GUTENBERG_TEXT_MAP } from '@/constants/gutenbergMap';
import { useBooksStore } from '@/store/booksStore';
import { useNotesStore } from '@/store/notesStore';
import { Book } from '@/types/book';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  BookOpen,
  Moon,
  PenLine,
  Sun,
  Sunset,
  Type,
  X,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  InteractionManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Theme & font config ─────────────────────────────────────────────────────

type Theme = 'light' | 'sepia' | 'dark';
type FontSize = 'S' | 'M' | 'L';

const THEMES = {
  light: {
    bg: '#FAFAF8',
    text: '#0A0A0A',
    muted: '#6B6B6B',
    nav: '#FAFAF8',
    border: '#D4D4D4',
    surface: '#EDEDED',
    icon: '#0A0A0A',
  },
  sepia: {
    bg: '#F4ECD8',
    text: '#3B2A1A',
    muted: '#8B6E4E',
    nav: '#EDE0C4',
    border: '#D4C5A9',
    surface: '#EDE0C4',
    icon: '#3B2A1A',
  },
  dark: {
    bg: '#1C1C1C',
    text: '#EDEDED',
    muted: '#888888',
    nav: '#1C1C1C',
    border: '#333333',
    surface: '#2C2C2C',
    icon: '#EDEDED',
  },
} as const;

const FONT_SIZES: Record<FontSize, number> = { S: 14, M: 17, L: 20 };
const LINE_HEIGHTS: Record<FontSize, number> = { S: 22, M: 28, L: 34 };

// ─── Text processing ─────────────────────────────────────────────────────────

function stripGutenbergHeader(raw: string): string {
  const startMarker = '*** START OF THE PROJECT GUTENBERG';
  const endMarker = '*** END OF THE PROJECT GUTENBERG';
  const startIdx = raw.indexOf(startMarker);
  const endIdx = raw.indexOf(endMarker);

  let body = raw;
  if (startIdx !== -1) {
    const afterStart = raw.indexOf('\n', startIdx);
    body = afterStart !== -1 ? raw.slice(afterStart + 1) : raw.slice(startIdx + startMarker.length);
  }
  if (endIdx !== -1) {
    const bodyEndIdx = body.indexOf(endMarker);
    if (bodyEndIdx !== -1) body = body.slice(0, bodyEndIdx);
  }
  return body.trim();
}

function paginateText(text: string, wordsPerPage: number): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const pages: string[] = [];
  for (let i = 0; i < words.length; i += wordsPerPage) {
    pages.push(words.slice(i, i + wordsPerPage).join(' '));
  }
  return pages;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBlock({ height, color }: { height: number; color: string }) {
  const opacity = useSharedValue(0.35);
  useEffect(() => {
    opacity.value = withSequence(
      withTiming(0.65, { duration: 700 }),
      withTiming(0.35, { duration: 700 }),
    );
    // loop manually
    const id = setInterval(() => {
      opacity.value = withSequence(
        withTiming(0.65, { duration: 700 }),
        withTiming(0.35, { duration: 700 }),
      );
    }, 1400);
    return () => clearInterval(id);
  }, []);
  const anim = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return (
    <View style={{ height, borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
      <Animated.View style={[{ flex: 1, backgroundColor: color }, anim]} />
    </View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function BookReaderScreen() {
  const params = useLocalSearchParams<{ book: string }>();
  const book: Book = JSON.parse(params.book);

  const { getReadingProgress, setReadingProgress } = useBooksStore();
  const { addNote, hydrate: hydrateNotes } = useNotesStore();

  const [pages, setPages] = useState<string[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<FontSize>('M');
  const [theme, setTheme] = useState<Theme>('light');
  const [showControls, setShowControls] = useState(true);
  const [showFontPicker, setShowFontPicker] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [noteText, setNoteText] = useState('');

  const t = THEMES[theme];
  const controlsOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(1);
  const contentTranslateX = useSharedValue(0);
  const controlsHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveProgressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const availableForReading = GUTENBERG_TEXT_MAP[book.id] !== undefined;

  // ── Fetch & process text + hydrate notes ────────────────────────────────────
  useEffect(() => {
    hydrateNotes();
    if (!availableForReading) {
      setLoading(false);
      return;
    }
    const url = GUTENBERG_TEXT_MAP[book.id];
    fetch(url)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((raw) => {
        InteractionManager.runAfterInteractions(() => {
          const clean = stripGutenbergHeader(raw);
          const chunks = paginateText(clean, 300);
          const saved = getReadingProgress(book.id);
          setPages(chunks);
          setPageIndex(Math.min(saved, Math.max(chunks.length - 1, 0)));
          setLoading(false);
        });
      })
      .catch(() => {
        setError('Unable to load book text. Check your connection and try again.');
        setLoading(false);
      });
  }, [book.id]);

  // ── Controls auto-hide ──────────────────────────────────────────────────────
  const resetHideTimer = () => {
    if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
    controlsHideTimer.current = setTimeout(() => {
      setShowControls(false);
    }, 4000);
  };

  useEffect(() => {
    if (showControls) {
      controlsOpacity.value = withTiming(1, { duration: 200 });
      resetHideTimer();
    } else {
      controlsOpacity.value = withTiming(0, { duration: 300 });
    }
    return () => {
      if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
    };
  }, [showControls]);

  const controlsAnimStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  // ── Page navigation ─────────────────────────────────────────────────────────
  const goToPage = (newIndex: number) => {
    if (newIndex < 0 || newIndex >= pages.length) return;
    const direction = newIndex > pageIndex ? -1 : 1;

    contentOpacity.value = withTiming(0, { duration: 100 }, () => {
      'worklet';
      contentTranslateX.value = direction * 20;
      contentOpacity.value = withTiming(1, { duration: 180 });
      contentTranslateX.value = withTiming(0, { duration: 180 });
    });

    setPageIndex(newIndex);
    setShowControls(true);

    // Debounced progress save
    if (saveProgressTimer.current) clearTimeout(saveProgressTimer.current);
    saveProgressTimer.current = setTimeout(() => {
      setReadingProgress(book.id, newIndex);
    }, 2000);
  };

  const contentAnimStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateX: contentTranslateX.value }],
  }));

  const panGesture = Gesture.Pan().onEnd((e) => {
    'worklet';
    if (e.translationX < -50) {
      runOnJS(goToPage)(pageIndex + 1);
    } else if (e.translationX > 50) {
      runOnJS(goToPage)(pageIndex - 1);
    }
  });

  const handleCentreTap = () => {
    setShowFontPicker(false);
    setShowControls((prev) => !prev);
  };

  const cycleTheme = () => {
    const order: Theme[] = ['light', 'sepia', 'dark'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'sepia' ? Sunset : Sun;

  // ── Not available ───────────────────────────────────────────────────────────
  if (!availableForReading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: THEMES.light.bg }]} edges={['top', 'bottom']}>
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} style={styles.navBack}>
            <ArrowLeft size={16} color={THEMES.light.muted} strokeWidth={1.5} />
            <Text style={[styles.navTitle, { color: THEMES.light.muted }]} numberOfLines={1}>{book.title}</Text>
          </Pressable>
        </View>
        <View style={styles.centredState}>
          <BookOpen size={40} color={THEMES.light.muted} strokeWidth={1} />
          <Text style={[styles.unavailableTitle, { color: THEMES.light.text }]}>Not Available</Text>
          <Text style={[styles.unavailableBody, { color: THEMES.light.muted }]}>
            This title is not in the public domain and cannot be loaded for reading.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: THEMES.light.bg }]} edges={['top', 'bottom']}>
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} style={styles.navBack}>
            <ArrowLeft size={16} color={THEMES.light.muted} strokeWidth={1.5} />
            <Text style={[styles.navTitle, { color: THEMES.light.muted }]}>{book.title}</Text>
          </Pressable>
        </View>
        <View style={styles.centredState}>
          <Text style={[styles.unavailableTitle, { color: THEMES.light.text }]}>Load Failed</Text>
          <Text style={[styles.unavailableBody, { color: THEMES.light.muted }]}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Loading ─────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <SafeAreaView style={[styles.flex, { backgroundColor: THEMES.light.bg }]} edges={['top', 'bottom']}>
        <View style={styles.navBar}>
          <Pressable onPress={() => router.back()} style={styles.navBack}>
            <ArrowLeft size={16} color={THEMES.light.muted} strokeWidth={1.5} />
            <Text style={[styles.navTitle, { color: THEMES.light.muted }]}>{book.title}</Text>
          </Pressable>
        </View>
        <View style={styles.loadingContainer}>
          <SkeletonBlock height={18} color="#D4D4D4" />
          <SkeletonBlock height={18} color="#D4D4D4" />
          <SkeletonBlock height={18} color="#D4D4D4" />
          <SkeletonBlock height={18} color="#D4D4D4" />
          <SkeletonBlock height={18} color="#D4D4D4" />
          <SkeletonBlock height={18} color="#D4D4D4" />
          <SkeletonBlock height={18} color="#D4D4D4" />
          <SkeletonBlock height={18} color="#D4D4D4" />
          <SkeletonBlock height={12} color="#D4D4D4" />
        </View>
      </SafeAreaView>
    );
  }

  // ── Reader ──────────────────────────────────────────────────────────────────
  return (
    <Pressable
      style={[styles.flex, { backgroundColor: t.bg }]}
      onPress={() => { setShowFontPicker(false); }}
    >
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>
        {/* Nav bar */}
        <Animated.View style={[styles.navBar, { backgroundColor: t.nav, borderBottomColor: t.border }, controlsAnimStyle]}>
          <Pressable onPress={() => router.back()} style={styles.navBack}>
            <ArrowLeft size={16} color={t.muted} strokeWidth={1.5} />
            <Text style={[styles.navTitle, { color: t.muted }]} numberOfLines={1}>{book.title}</Text>
          </Pressable>
          <View style={styles.navActions}>
            {/* Font size toggle */}
            <View>
              <Pressable
                onPress={(e) => { e.stopPropagation(); setShowFontPicker((p) => !p); }}
                hitSlop={10}
                style={styles.navIconBtn}
              >
                <Type size={17} color={t.icon} strokeWidth={1.5} />
              </Pressable>
              {showFontPicker && (
                <View style={[styles.fontPicker, { backgroundColor: t.surface, borderColor: t.border }]}>
                  {(['S', 'M', 'L'] as FontSize[]).map((size) => (
                    <Pressable
                      key={size}
                      onPress={(e) => { e.stopPropagation(); setFontSize(size); setShowFontPicker(false); }}
                      style={[styles.fontPickerItem, fontSize === size && { backgroundColor: t.bg }]}
                    >
                      <Text
                        style={{
                          fontFamily: 'PlayfairDisplay_400Regular',
                          fontSize: FONT_SIZES[size],
                          color: fontSize === size ? t.text : t.muted,
                        }}
                      >
                        A
                      </Text>
                    </Pressable>
                  ))}
                </View>
              )}
            </View>
            {/* Theme cycle */}
            <Pressable onPress={cycleTheme} hitSlop={10} style={styles.navIconBtn}>
              <ThemeIcon size={17} color={t.icon} strokeWidth={1.5} />
            </Pressable>
          </View>
        </Animated.View>

        {/* Reading area */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[styles.flex, contentAnimStyle]}>
            {/* Invisible tap zones: left 30%, centre 40%, right 30% */}
            <View style={styles.tapZonesRow}>
              <Pressable style={styles.flex} onPress={() => goToPage(pageIndex - 1)} />
              <Pressable style={styles.flex} onPress={handleCentreTap} />
              <Pressable style={styles.flex} onPress={() => goToPage(pageIndex + 1)} />
            </View>
            {/* Text content */}
            <View style={styles.pageContent} pointerEvents="none">
              <Text
                style={[
                  styles.pageText,
                  {
                    fontSize: FONT_SIZES[fontSize],
                    lineHeight: LINE_HEIGHTS[fontSize],
                    color: t.text,
                  },
                ]}
              >
                {pages[pageIndex]}
              </Text>
            </View>
          </Animated.View>
        </GestureDetector>

        {/* Bottom controls */}
        <Animated.View style={[styles.bottomBar, { backgroundColor: t.nav, borderTopColor: t.border }, controlsAnimStyle]}>
          <Pressable
            onPress={() => goToPage(pageIndex - 1)}
            disabled={pageIndex === 0}
            hitSlop={12}
            style={[styles.pageNavBtn, { opacity: pageIndex === 0 ? 0.3 : 1 }]}
          >
            <Text style={[styles.pageNavText, { color: t.text }]}>‹</Text>
          </Pressable>
          <Text style={[styles.pageIndicator, { color: t.muted }]}>
            {pageIndex + 1} of {pages.length}
          </Text>
          <Pressable
            onPress={() => goToPage(pageIndex + 1)}
            disabled={pageIndex === pages.length - 1}
            hitSlop={12}
            style={[styles.pageNavBtn, { opacity: pageIndex === pages.length - 1 ? 0.3 : 1 }]}
          >
            <Text style={[styles.pageNavText, { color: t.text }]}>›</Text>
          </Pressable>
        </Animated.View>

        {/* Floating note button — always visible */}
        <Pressable
          style={[styles.floatingNoteBtn, { backgroundColor: t.text }]}
          onPress={() => { setNoteText(''); setShowNoteModal(true); }}
          accessibilityRole="button"
          accessibilityLabel="Add a note"
        >
          <PenLine size={16} color={t.bg} strokeWidth={1.5} />
        </Pressable>

        {/* Note modal */}
        <Modal
          visible={showNoteModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowNoteModal(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
              style={{ flex: 1 }}
              behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
              {/* Modal header */}
              <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
                <Text style={[styles.modalTitle, { color: t.text }]}>
                  Note — Page {pageIndex + 1}
                </Text>
                <Pressable onPress={() => setShowNoteModal(false)} hitSlop={12}>
                  <X size={18} color={t.muted} strokeWidth={1.5} />
                </Pressable>
              </View>

              {/* Text input */}
              <TextInput
                value={noteText}
                onChangeText={setNoteText}
                multiline
                placeholder="Write your reflection here..."
                placeholderTextColor={t.muted}
                autoFocus
                style={[styles.noteInput, { color: t.text, backgroundColor: t.bg }]}
              />

              {/* Save button */}
              <Pressable
                style={[styles.noteSaveBtn, { backgroundColor: t.text, opacity: noteText.trim() ? 1 : 0.4 }]}
                disabled={!noteText.trim()}
                onPress={async () => {
                  await addNote({ bookId: book.id, text: noteText.trim(), pageIndex });
                  setNoteText('');
                  setShowNoteModal(false);
                  Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                }}
              >
                <Text style={[styles.noteSaveBtnLabel, { color: t.bg }]}>Save Note</Text>
              </Pressable>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    marginRight: 8,
  },
  navTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    flex: 1,
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  navIconBtn: {
    padding: 4,
  },
  fontPicker: {
    position: 'absolute',
    top: 34,
    right: 0,
    flexDirection: 'row',
    borderRadius: 12,
    borderWidth: 1,
    overflow: 'hidden',
    zIndex: 100,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.12,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  fontPickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tapZonesRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 10,
  },
  pageContent: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 28,
    paddingVertical: 24,
    justifyContent: 'flex-start',
    zIndex: 1,
  },
  pageText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    textAlign: 'left',
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  pageNavBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  pageNavText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 24,
    lineHeight: 28,
  },
  pageIndicator: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    letterSpacing: 0.5,
  },
  centredState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 12,
  },
  unavailableTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 18,
    textAlign: 'center',
    marginTop: 8,
  },
  unavailableBody: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingContainer: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 24,
  },
  floatingNoteBtn: {
    position: 'absolute',
    bottom: 72,
    right: 20,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: { elevation: 6 },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  modalTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    letterSpacing: 0.3,
  },
  noteInput: {
    flex: 1,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 16,
    lineHeight: 26,
    paddingHorizontal: 20,
    paddingTop: 20,
    textAlignVertical: 'top',
  },
  noteSaveBtn: {
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  noteSaveBtnLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    letterSpacing: 1.8,
    textTransform: 'uppercase',
  },
});
