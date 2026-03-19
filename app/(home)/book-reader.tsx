// app/(home)/book-reader.tsx — Apple Books-inspired reading screen
import { GUTENBERG_TEXT_MAP } from '@/constants/gutenbergMap';
import { useBooksStore } from '@/store/booksStore';
import { useNotesStore } from '@/store/notesStore';
import { Book } from '@/types/book';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import {
  ArrowLeft,
  BookOpen,
  Check,
  Clock,
  List,
  Moon,
  PenLine,
  Sun,
  Sunset,
  X,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  InteractionManager,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
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
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── Theme & font config ─────────────────────────────────────────────────────

type Theme = 'light' | 'sepia' | 'dark';
type FontSize = 'S' | 'M' | 'L';
type Brightness = 'dim' | 'normal' | 'bright';

const THEMES = {
  light: {
    bg: '#FAFAF8',
    text: '#0A0A0A',
    muted: '#6B6B6B',
    nav: '#FAFAF8',
    border: '#D4D4D4',
    surface: '#EDEDED',
    icon: '#0A0A0A',
    progress: '#0A0A0A',
    progressTrack: '#D4D4D4',
  },
  sepia: {
    bg: '#F4ECD8',
    text: '#3B2A1A',
    muted: '#8B6E4E',
    nav: '#EDE0C4',
    border: '#D4C5A9',
    surface: '#EDE0C4',
    icon: '#3B2A1A',
    progress: '#3B2A1A',
    progressTrack: '#D4C5A9',
  },
  dark: {
    bg: '#1C1C1C',
    text: '#EDEDED',
    muted: '#888888',
    nav: '#1C1C1C',
    border: '#333333',
    surface: '#2C2C2C',
    icon: '#EDEDED',
    progress: '#EDEDED',
    progressTrack: '#444444',
  },
} as const;

const FONT_SIZES: Record<FontSize, number> = { S: 14, M: 17, L: 20 };
const LINE_HEIGHTS: Record<FontSize, number> = { S: 22, M: 28, L: 34 };

// ─── Data types ───────────────────────────────────────────────────────────────

interface Page {
  text: string;
  dropCapLetter?: string;
  chapterTitle?: string;
  chapterSubtitle?: string;
  isChapterStart: boolean;
  chapterIndex: number;
  pageInChapter: number;
  totalPagesInChapter: number;
}

interface ChapterInfo {
  title: string;
  subtitle: string | null;
  body: string;
}

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

function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// Chapter heading detection — covers all major Gutenberg formatting styles
const KEYWORD_HEADING_RE = /^(CHAPTER|BOOK|PART|PROLOGUE|EPILOGUE|PREFACE|INTRODUCTION|APPENDIX|INTERLUDE|SECTION)\b/i;
const ROMAN_HEADING_RE = /^[IVXLC]{1,6}[.)]\s/;
const NUMERIC_HEADING_RE = /^\d{1,3}\.\s/;

function isHeadingLine(trimmed: string, prevLineWasBlank: boolean): boolean {
  if (!trimmed || trimmed.length > 80) return false;
  // Gutenberg headings are always preceded by a blank line
  if (!prevLineWasBlank) return false;
  return (
    KEYWORD_HEADING_RE.test(trimmed) ||
    ROMAN_HEADING_RE.test(trimmed) ||
    NUMERIC_HEADING_RE.test(trimmed)
  );
}

function parseChapters(text: string): ChapterInfo[] {
  const lines = text.split('\n');
  const chapters: ChapterInfo[] = [];
  let currentTitle = '';
  let currentSubtitle: string | null = null;
  let currentBodyLines: string[] = [];
  let inChapter = false;
  let prevLineWasBlank = true; // treat document start as blank
  let prevLineWasHeading = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      prevLineWasBlank = true;
      if (inChapter) currentBodyLines.push(line);
      continue;
    }

    if (isHeadingLine(trimmed, prevLineWasBlank)) {
      // Save previous chapter if it has content
      if (inChapter && currentBodyLines.join('').trim()) {
        chapters.push({
          title: currentTitle,
          subtitle: currentSubtitle,
          body: currentBodyLines.join('\n').trim(),
        });
      }
      currentTitle = trimmed;
      currentSubtitle = null;
      currentBodyLines = [];
      inChapter = true;
      prevLineWasBlank = false;
      prevLineWasHeading = true;
      continue;
    }

    // Subtitle: first non-empty line right after a heading that looks like a label not body
    if (prevLineWasHeading && trimmed.length < 60 && !/[.!?]/.test(trimmed)) {
      currentSubtitle = trimmed;
      prevLineWasBlank = false;
      prevLineWasHeading = false;
      continue;
    }

    prevLineWasBlank = false;
    prevLineWasHeading = false;
    if (inChapter) currentBodyLines.push(line);
  }

  // Push the last chapter
  if (inChapter && currentBodyLines.join('').trim()) {
    chapters.push({
      title: currentTitle,
      subtitle: currentSubtitle,
      body: currentBodyLines.join('\n').trim(),
    });
  }

  // Fallback: no chapters detected — treat entire text as one section
  if (chapters.length === 0) {
    chapters.push({ title: '', subtitle: null, body: text.trim() });
  }

  return chapters;
}

function buildPages(chapters: ChapterInfo[], wordsPerPage: number): { pages: Page[]; chapterFirstPages: number[] } {
  const pages: Page[] = [];
  const chapterFirstPages: number[] = [];

  chapters.forEach((chapter, chapterIndex) => {
    const words = chapter.body.split(/\s+/).filter(Boolean);
    const chunks: string[] = [];
    for (let i = 0; i < words.length; i += wordsPerPage) {
      chunks.push(words.slice(i, i + wordsPerPage).join(' '));
    }
    if (chunks.length === 0) return;

    const totalPagesInChapter = chunks.length;
    chapterFirstPages.push(pages.length);

    chunks.forEach((chunk, pageInChapter) => {
      const isChapterStart = pageInChapter === 0;
      let text = chunk;
      let dropCapLetter: string | undefined;

      if (isChapterStart && text.length > 0) {
        dropCapLetter = text[0];
        text = text.slice(1);
      }

      pages.push({
        text,
        dropCapLetter,
        chapterTitle: chapter.title || undefined,
        chapterSubtitle: chapter.subtitle || undefined,
        isChapterStart,
        chapterIndex,
        pageInChapter,
        totalPagesInChapter,
      });
    });
  });

  return { pages, chapterFirstPages };
}

// ─── Animated pressable ───────────────────────────────────────────────────────

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonBlock({ height, color }: { height: number; color: string }) {
  const opacity = useSharedValue(0.35);
  useEffect(() => {
    opacity.value = withSequence(
      withTiming(0.65, { duration: 700 }),
      withTiming(0.35, { duration: 700 }),
    );
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
    <View style={{ height, borderRadius: 6, overflow: 'hidden', marginBottom: 10 }}>
      <Animated.View style={[{ flex: 1, backgroundColor: color }, anim]} />
    </View>
  );
}

// ─── Pill button ─────────────────────────────────────────────────────────────

function PillButton({
  onPress,
  children,
  style,
}: {
  onPress?: () => void;
  children: React.ReactNode;
  style?: object;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  return (
    <AnimatedPressable
      onPress={() => {
        if (onPress) onPress();
        scale.value = withSpring(0.82, { damping: 18, stiffness: 180 }, () => {
          'worklet';
          scale.value = withSpring(1, { damping: 18, stiffness: 180 });
        });
      }}
      style={[styles.pill, animStyle, style]}
    >
      {children}
    </AnimatedPressable>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function BookReaderScreen() {
  const params = useLocalSearchParams<{ book: string }>();
  const book: Book = JSON.parse(params.book);

  const insets = useSafeAreaInsets();
  const { getReadingProgress, setReadingProgress } = useBooksStore();
  const { addNote, hydrate: hydrateNotes } = useNotesStore();

  const [pages, setPages] = useState<Page[]>([]);
  const [chapterFirstPages, setChapterFirstPages] = useState<number[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<FontSize>('M');
  const [theme, setTheme] = useState<Theme>('light');
  const [brightness, setBrightness] = useState<Brightness>('normal');
  const [showControls, setShowControls] = useState(true);
  const [showFontPanel, setShowFontPanel] = useState(false);
  const [showBrightnessPanel, setShowBrightnessPanel] = useState(false);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showChaptersModal, setShowChaptersModal] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [prevPageIndex, setPrevPageIndex] = useState<number | null>(null);
  const [currentTime, setCurrentTime] = useState('');

  const t = THEMES[theme];
  const textColor = brightness === 'dim' ? t.muted : t.text;
  const controlsOpacity = useSharedValue(1);
  const contentOpacity = useSharedValue(1);
  const contentTranslateX = useSharedValue(0);
  const controlsHideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const saveProgressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const availableForReading = GUTENBERG_TEXT_MAP[book.id] !== undefined;

  const currentPage = pages[pageIndex];

  // ── Clock ────────────────────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      setCurrentTime(
        new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: false }),
      );
    };
    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Fetch & process text ────────────────────────────────────────────────────
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
          const chapters = parseChapters(clean);
          const { pages: builtPages, chapterFirstPages: cfp } = buildPages(chapters, 300);
          const saved = getReadingProgress(book.id);
          setPages(builtPages);
          setChapterFirstPages(cfp);
          setPageIndex(Math.min(saved, Math.max(builtPages.length - 1, 0)));
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
      setShowBrightnessPanel(false);
    }
    return () => {
      if (controlsHideTimer.current) clearTimeout(controlsHideTimer.current);
    };
  }, [showControls]);

  const controlsAnimStyle = useAnimatedStyle(() => ({
    opacity: controlsOpacity.value,
  }));

  // ── Page navigation ─────────────────────────────────────────────────────────
  const goToPage = (newIndex: number, saveJumpFrom?: number) => {
    if (newIndex < 0 || newIndex >= pages.length) return;
    const direction = newIndex > pageIndex ? -1 : 1;

    contentOpacity.value = withTiming(0, { duration: 100 }, () => {
      'worklet';
      contentTranslateX.value = direction * 20;
      contentOpacity.value = withTiming(1, { duration: 180 });
      contentTranslateX.value = withTiming(0, { duration: 180 });
    });

    if (saveJumpFrom !== undefined) {
      setPrevPageIndex(saveJumpFrom);
    }

    setPageIndex(newIndex);
    setShowControls(true);

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
    setShowFontPanel(false);
    setShowBrightnessPanel(false);
    setShowControls((prev) => !prev);
  };

  const cycleTheme = () => {
    const order: Theme[] = ['light', 'sepia', 'dark'];
    const next = order[(order.indexOf(theme) + 1) % order.length];
    setTheme(next);
  };

  const ThemeIcon = theme === 'dark' ? Moon : theme === 'sepia' ? Sunset : Sun;

  // ── Progress fraction ─────────────────────────────────────────────────────────
  const progressFraction = pages.length > 1 ? pageIndex / (pages.length - 1) : 0;

  // ── Chapter label for nav ─────────────────────────────────────────────────────
  const chapterLabel = currentPage?.chapterTitle
    ? currentPage.chapterTitle.replace(/^(CHAPTER|Chapter)\s+/, 'Ch. ').slice(0, 20)
    : '';

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
          {/* Chapter title skeleton */}
          <View style={{ alignItems: 'center', marginBottom: 28, marginTop: 16 }}>
            <SkeletonBlock height={22} color="#D4D4D4" />
          </View>
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
      onPress={() => { setShowBrightnessPanel(false); }}
    >
      <SafeAreaView style={styles.flex} edges={['top', 'bottom']}>

        {/* Nav bar — simplified: back + chapter label + chapters list */}
        <Animated.View style={[styles.navBar, { backgroundColor: t.nav, borderBottomColor: t.border }, controlsAnimStyle]}>
          <Pressable onPress={() => router.back()} style={styles.navBack}>
            <ArrowLeft size={16} color={t.muted} strokeWidth={1.5} />
          </Pressable>
          <View style={styles.navCenter}>
            {chapterLabel ? (
              <Text style={[styles.navChapterLabel, { color: t.muted }]} numberOfLines={1}>
                {chapterLabel}
              </Text>
            ) : null}
          </View>
          <Pressable
            onPress={(e) => { e.stopPropagation(); setShowChaptersModal(true); }}
            hitSlop={10}
            style={styles.navIconBtn}
          >
            <List size={17} color={t.icon} strokeWidth={1.5} />
          </Pressable>
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
              {/* Chapter header — shown only at chapter start */}
              {currentPage?.isChapterStart && currentPage.chapterTitle ? (
                <View style={styles.chapterHeader}>
                  <Text style={[styles.chapterTitle, { color: textColor }]}>
                    {currentPage.chapterTitle}
                  </Text>
                  {currentPage.chapterSubtitle ? (
                    <Text style={[styles.chapterSubtitle, { color: t.muted }]}>
                      {currentPage.chapterSubtitle}
                    </Text>
                  ) : null}
                </View>
              ) : null}

              {/* Body text with optional drop cap */}
              {currentPage ? (
                currentPage.isChapterStart && currentPage.dropCapLetter ? (
                  <Text
                    style={[
                      styles.pageText,
                      {
                        fontSize: FONT_SIZES[fontSize],
                        lineHeight: LINE_HEIGHTS[fontSize],
                        color: textColor,
                      },
                    ]}
                  >
                    <Text style={[styles.dropCap, { color: textColor }]}>
                      {currentPage.dropCapLetter}
                    </Text>
                    {currentPage.text}
                  </Text>
                ) : (
                  <Text
                    style={[
                      styles.pageText,
                      {
                        fontSize: FONT_SIZES[fontSize],
                        lineHeight: LINE_HEIGHTS[fontSize],
                        color: textColor,
                      },
                    ]}
                  >
                    {currentPage.text}
                  </Text>
                )
              ) : null}
            </View>

            {/* Bottom gradient fade — blends text into toolbar */}
            <LinearGradient
              colors={[hexToRgba(t.bg, 0), t.bg]}
              start={{ x: 0, y: 0 }}
              end={{ x: 0, y: 1 }}
              style={styles.bottomFade}
              pointerEvents="none"
            />
          </Animated.View>
        </GestureDetector>

        {/* Floating note button — wrapped in controlsAnimStyle */}
        <Animated.View style={[styles.floatingNoteBtnContainer, controlsAnimStyle]}>
          <Pressable
            style={[styles.floatingNoteBtn, { backgroundColor: t.text }]}
            onPress={() => { setNoteText(''); setShowNoteModal(true); }}
            accessibilityRole="button"
            accessibilityLabel="Add a note"
          >
            <PenLine size={16} color={t.bg} strokeWidth={1.5} />
          </Pressable>
        </Animated.View>

        {/* Brightness popover — appears above toolbar */}
        {showBrightnessPanel ? (
          <Animated.View style={[styles.brightnessPanel, controlsAnimStyle]}>
            {(['dim', 'normal', 'bright'] as Brightness[]).map((b) => (
              <Pressable
                key={b}
                onPress={() => { setBrightness(b); setShowBrightnessPanel(false); }}
                style={[
                  styles.brightnessPillItem,
                  brightness === b && styles.brightnessPillItemActive,
                ]}
              >
                <Text style={[styles.pillText, brightness === b && { color: '#0A0A0A' }]}>
                  {b.charAt(0).toUpperCase() + b.slice(1)}
                </Text>
              </Pressable>
            ))}
          </Animated.View>
        ) : null}

        {/* Floating pill toolbar */}
        <Animated.View style={[styles.toolbarContainer, { paddingBottom: insets.bottom + 16 }, controlsAnimStyle]} pointerEvents="box-none">
          {/* Back to previous position */}
          {prevPageIndex !== null ? (
            <Pressable
              onPress={() => {
                const prev = prevPageIndex;
                setPrevPageIndex(null);
                goToPage(prev);
              }}
              hitSlop={8}
              style={styles.backToRow}
            >
              <Text style={[styles.backToLabel, { color: t.muted }]}>
                ← Back to p.{prevPageIndex + 1}
              </Text>
            </Pressable>
          ) : null}

          {/* Progress line */}
          <View style={[styles.progressLine, { backgroundColor: t.progressTrack }]}>
            <View
              style={[
                styles.progressLineFill,
                { backgroundColor: t.progress, width: `${progressFraction * 100}%` },
              ]}
            />
          </View>

          {/* Pill row */}
          <View style={styles.pillRow}>
            {/* Time — non-interactive display */}
            <View style={styles.pill}>
              <Clock size={13} color="#EDEDED" strokeWidth={1.5} />
              <Text style={styles.pillText}>{currentTime}</Text>
            </View>

            {/* Read | Listen segmented pill */}
            <View style={styles.segmentedPill}>
              <View style={styles.segmentActive}>
                <Text style={[styles.pillText, { color: '#0A0A0A' }]}>Read</Text>
              </View>
              <View style={styles.segmentInactive}>
                <Text style={[styles.pillText, { color: '#EDEDED' }]}>Listen</Text>
              </View>
            </View>

            {/* Brightness */}
            <PillButton
              onPress={() => {
                setShowBrightnessPanel((p) => !p);
              }}
            >
              <Sun size={15} color="#EDEDED" strokeWidth={1.5} />
            </PillButton>

            {/* Font / Appearance */}
            <PillButton
              onPress={() => {
                setShowBrightnessPanel(false);
                setShowFontPanel(true);
              }}
            >
              <Text style={[styles.pillText, { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14 }]}>Aa</Text>
            </PillButton>
          </View>
        </Animated.View>

        {/* ── Note modal ──────────────────────────────────────────────────────── */}
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
              <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
                <Text style={[styles.modalTitle, { color: t.text }]}>
                  Note — Page {pageIndex + 1}
                </Text>
                <Pressable onPress={() => setShowNoteModal(false)} hitSlop={12}>
                  <X size={18} color={t.muted} strokeWidth={1.5} />
                </Pressable>
              </View>
              <TextInput
                value={noteText}
                onChangeText={setNoteText}
                multiline
                placeholder="Write your reflection here..."
                placeholderTextColor={t.muted}
                autoFocus
                style={[styles.noteInput, { color: t.text, backgroundColor: t.bg }]}
              />
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

        {/* ── Chapters modal ──────────────────────────────────────────────────── */}
        <Modal
          visible={showChaptersModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowChaptersModal(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'bottom']}>
            <View style={[styles.modalHeader, { borderBottomColor: t.border }]}>
              <Text style={[styles.modalTitle, { color: t.text }]}>Chapters</Text>
              <Pressable onPress={() => setShowChaptersModal(false)} hitSlop={12}>
                <X size={18} color={t.muted} strokeWidth={1.5} />
              </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.chaptersListContent}>
              {chapterFirstPages.map((firstPageIdx, i) => {
                const chapterPage = pages[firstPageIdx];
                if (!chapterPage) return null;
                const isCurrentChapter = currentPage?.chapterIndex === i;
                const title = chapterPage.chapterTitle || `Section ${i + 1}`;
                const subtitle = chapterPage.chapterSubtitle;
                return (
                  <Pressable
                    key={i}
                    style={[
                      styles.chapterRow,
                      { borderBottomColor: t.border },
                      isCurrentChapter && { backgroundColor: t.surface },
                    ]}
                    onPress={() => {
                      setShowChaptersModal(false);
                      goToPage(firstPageIdx, pageIndex);
                    }}
                  >
                    <View style={styles.chapterRowText}>
                      <Text
                        style={[
                          styles.chapterRowTitle,
                          { color: isCurrentChapter ? t.text : t.muted },
                          isCurrentChapter && { fontFamily: 'PlayfairDisplay_700Bold' },
                        ]}
                        numberOfLines={1}
                      >
                        {title}
                      </Text>
                      {subtitle ? (
                        <Text style={[styles.chapterRowSubtitle, { color: t.muted }]} numberOfLines={1}>
                          {subtitle}
                        </Text>
                      ) : null}
                    </View>
                    {isCurrentChapter ? (
                      <Check size={15} color={t.text} strokeWidth={2} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </SafeAreaView>
        </Modal>

        {/* ── Appearance modal (font size + theme) ───────────────────────────── */}
        <Modal
          visible={showFontPanel}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowFontPanel(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: t.bg }} edges={['top', 'bottom']}>
            {/* Drag handle */}
            <View style={[styles.appearanceDragHandle, { backgroundColor: t.border }]} />

            {/* Header */}
            <View style={styles.appearanceHeader}>
              <Text style={[styles.appearanceTitleLarge, { color: t.text }]}>Appearance</Text>
              <Pressable
                onPress={() => setShowFontPanel(false)}
                hitSlop={16}
                style={[styles.appearanceCloseBtn, { backgroundColor: t.surface }]}
              >
                <X size={13} color={t.muted} strokeWidth={2.5} />
              </Pressable>
            </View>

            <View style={styles.appearanceContent}>
              {/* Font size — segmented control */}
              <View>
                <Text style={[styles.appearanceSectionLabel, { color: t.muted }]}>Size</Text>
                <View style={[styles.fontSizeSegment, { backgroundColor: t.surface, borderColor: t.border }]}>
                  {(['S', 'M', 'L'] as FontSize[]).map((size, index) => (
                    <Pressable
                      key={size}
                      onPress={() => setFontSize(size)}
                      style={[
                        styles.fontSizeOption,
                        index < 2 && { borderRightWidth: StyleSheet.hairlineWidth, borderRightColor: t.border },
                        fontSize === size && { backgroundColor: t.text },
                      ]}
                    >
                      <Text
                        style={{
                          fontFamily: 'PlayfairDisplay_400Regular',
                          fontSize: FONT_SIZES[size] + 1,
                          color: fontSize === size ? t.bg : t.muted,
                          lineHeight: FONT_SIZES[size] + 10,
                        }}
                      >
                        A
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Theme */}
              <View>
                <Text style={[styles.appearanceSectionLabel, { color: t.muted }]}>Theme</Text>
                <View style={styles.themeRow}>
                  {(['light', 'sepia', 'dark'] as Theme[]).map((th) => {
                    const tc = THEMES[th];
                    const isActive = theme === th;
                    const ThIcon = th === 'dark' ? Moon : th === 'sepia' ? Sunset : Sun;
                    return (
                      <Pressable
                        key={th}
                        onPress={() => setTheme(th)}
                        style={[
                          styles.themePill,
                          {
                            backgroundColor: tc.bg,
                            borderWidth: isActive ? 2 : StyleSheet.hairlineWidth,
                            borderColor: isActive ? tc.text : tc.border,
                          },
                        ]}
                      >
                        <ThIcon size={18} color={tc.text} strokeWidth={1.5} />
                        <Text style={[styles.themeLabel, { color: tc.text }]}>
                          {th.charAt(0).toUpperCase() + th.slice(1)}
                        </Text>
                        <Text style={[styles.themeSample, { color: tc.muted }]} numberOfLines={2}>
                          {'The unexamined\nlife is not worth\nliving.'}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>
            </View>
          </SafeAreaView>
        </Modal>

      </SafeAreaView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },

  // ── Nav ────────────────────────────────────────────────────────────────────
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  navBack: {
    padding: 4,
    marginRight: 8,
  },
  navCenter: {
    flex: 1,
    alignItems: 'center',
  },
  navChapterLabel: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    letterSpacing: 0.2,
  },
  navTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    flex: 1,
  },
  navIconBtn: {
    padding: 4,
  },

  // ── Page content ───────────────────────────────────────────────────────────
  tapZonesRow: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    zIndex: 10,
  },
  pageContent: {
    ...StyleSheet.absoluteFillObject,
    paddingHorizontal: 28,
    paddingVertical: 20,
    justifyContent: 'flex-start',
    zIndex: 1,
  },

  // ── Chapter header ─────────────────────────────────────────────────────────
  chapterHeader: {
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 12,
  },
  chapterTitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 26,
    textAlign: 'center',
    letterSpacing: 0.3,
  },
  chapterSubtitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
    letterSpacing: 0.2,
  },

  // ── Text ───────────────────────────────────────────────────────────────────
  pageText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    textAlign: 'left',
  },
  dropCap: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 72,
    lineHeight: 60,
  },

  // ── Bottom gradient fade ────────────────────────────────────────────────────
  bottomFade: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: 120,
    zIndex: 5,
  },

  // ── Floating note button ───────────────────────────────────────────────────
  floatingNoteBtnContainer: {
    position: 'absolute',
    bottom: 110,
    right: 20,
    zIndex: 20,
  },
  floatingNoteBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
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

  // ── Pill toolbar ───────────────────────────────────────────────────────────
  toolbarContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 8,
    zIndex: 25,
  },
  progressLine: {
    height: 2,
    borderRadius: 1,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressLineFill: {
    height: '100%',
    borderRadius: 1,
  },
  backToRow: {
    alignItems: 'center',
    paddingBottom: 6,
  },
  backToLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    letterSpacing: 0.3,
  },
  pillRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pill: {
    backgroundColor: '#0A0A0A',
    borderRadius: 50,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  pillText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#EDEDED',
    letterSpacing: 0.3,
  },
  segmentedPill: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: '#0A0A0A',
    borderRadius: 50,
    padding: 3,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  segmentActive: {
    flex: 1,
    backgroundColor: '#EDEDED',
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
  },
  segmentInactive: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 7,
    opacity: 0.45,
  },

  // ── Brightness popover ─────────────────────────────────────────────────────
  brightnessPanel: {
    position: 'absolute',
    bottom: 84,
    right: 16,
    backgroundColor: '#0A0A0A',
    borderRadius: 50,
    flexDirection: 'row',
    paddingVertical: 6,
    paddingHorizontal: 6,
    gap: 4,
    zIndex: 30,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
    }),
  },
  brightnessPillItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brightnessPillItemActive: {
    backgroundColor: '#EDEDED',
  },

  // ── Centred states ─────────────────────────────────────────────────────────
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

  // ── Modals ─────────────────────────────────────────────────────────────────
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

  // ── Chapters list ──────────────────────────────────────────────────────────
  chaptersListContent: {
    paddingVertical: 4,
  },
  chapterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chapterRowText: {
    flex: 1,
    marginRight: 12,
  },
  chapterRowTitle: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    letterSpacing: 0.2,
  },
  chapterRowSubtitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 12,
    marginTop: 2,
  },

  // ── Appearance panel ───────────────────────────────────────────────────────
  appearanceDragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  appearanceHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 8,
    paddingBottom: 20,
  },
  appearanceTitleLarge: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 22,
    letterSpacing: 0.2,
  },
  appearanceCloseBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  appearanceContent: {
    paddingHorizontal: 24,
    gap: 28,
  },
  appearanceSectionLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 10,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  fontSizeSegment: {
    flexDirection: 'row',
    borderRadius: 14,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  fontSizeOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  themeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  themePill: {
    flex: 1,
    borderRadius: 18,
    paddingVertical: 24,
    paddingHorizontal: 10,
    alignItems: 'center',
    gap: 10,
  },
  themeLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    letterSpacing: 0.4,
  },
  themeSample: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 9,
    letterSpacing: 0.2,
    textAlign: 'center',
    lineHeight: 14,
    opacity: 0.7,
  },
});
