// app/(home)/app-guide.tsx — In-app reading guide, formatted like a book
import { router } from 'expo-router';
import { ArrowLeft, Sun, Sunset, Type } from 'lucide-react-native';
import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// ─── Theme & font config (mirrors book-reader.tsx) ───────────────────────────

type Theme = 'light' | 'sepia';
type FontSize = 'S' | 'M' | 'L';

const THEMES = {
  light: {
    bg: '#FAFAF8',
    text: '#0A0A0A',
    muted: '#6B6B6B',
    nav: '#FAFAF8',
    border: '#D4D4D4',
    surface: '#F5F5F5',
    chapterNum: '#ABABAB',
    divider: '#E8E8E8',
  },
  sepia: {
    bg: '#F4ECD8',
    text: '#3B2A1A',
    muted: '#8B6E4E',
    nav: '#EDE0C4',
    border: '#D4C5A9',
    surface: '#EDE0C4',
    chapterNum: '#B8956A',
    divider: '#D4C5A9',
  },
} as const;

const FONT_SIZES: Record<FontSize, number> = { S: 13, M: 15, L: 18 };
const LINE_HEIGHTS: Record<FontSize, number> = { S: 21, M: 26, L: 32 };

// ─── Guide content ────────────────────────────────────────────────────────────

type Block =
  | { type: 'chapter'; num: string; title: string }
  | { type: 'subchapter'; num: string; title: string }
  | { type: 'paragraph'; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'divider' };

const GUIDE_CONTENT: Block[] = [
  // Chapter 1
  { type: 'chapter', num: 'I', title: 'What Ravenscroft Is' },
  { type: 'subchapter', num: '1.1', title: 'A Platform for the Modern Gentleman' },
  { type: 'paragraph', text: 'Ravenscroft is not simply a reading application. It is a platform built around a single, unfashionable idea: that being a gentleman is still worth pursuing.' },
  { type: 'paragraph', text: 'Not in the superficial sense — the tailoring, the etiquette, the social performance. But in the deeper sense: a man who reads widely, thinks carefully, speaks honestly, and moves through the world with intention and discipline.' },
  { type: 'paragraph', text: 'This app exists to support that kind of man, or the man who aspires to become him.' },
  { type: 'subchapter', num: '1.2', title: 'The Philosophy' },
  { type: 'paragraph', text: 'Every gentleman worth the title has, in some form, a private practice — a set of daily disciplines that build character rather than merely consume time. Reading. Reflection. Physical rigour. Cultural curiosity. An ear for music. An eye for beauty. A willingness to sit with difficult ideas.' },
  { type: 'paragraph', text: 'Ravenscroft is designed to serve that practice. Not to replace the discipline it requires, but to remove the friction that gets in its way.' },
  { type: 'paragraph', text: 'When you selected your interests during setup, you were not personalising a news feed. You were declaring — at least partially — who you are trying to become. The app holds that declaration and works from it.' },
  { type: 'subchapter', num: '1.3', title: 'How This App Is Organised' },
  { type: 'paragraph', text: 'The app is divided into five areas, each accessible from the tab bar at the bottom of your screen:' },
  { type: 'bullet', text: 'Articles — essays, commentary, and ideas worth your time' },
  { type: 'bullet', text: 'Books — your library, curated discoveries, and personal shelf' },
  { type: 'bullet', text: 'Messages — correspondence (coming soon)' },
  { type: 'bullet', text: 'Assistant — your personal guide and advisor (coming soon)' },
  { type: 'bullet', text: 'Profile — your interests, reading history, and preferences' },
  { type: 'divider' },

  // Chapter 2
  { type: 'chapter', num: 'II', title: 'Articles' },
  { type: 'subchapter', num: '2.1', title: 'Reading the Daily Feed' },
  { type: 'paragraph', text: 'A gentleman reads. Not to appear informed — but to actually be so. The Articles tab is your daily intellectual brief: essays, commentary, and long-form pieces selected for depth rather than virality.' },
  { type: 'paragraph', text: 'The format is intentional. No notifications. No endless scroll. A small number of pieces, given the room they deserve. Tap any card to open the full article.' },
  { type: 'subchapter', num: '2.2', title: 'What \'Generate Summary\' Does' },
  { type: 'paragraph', text: 'Some days call for depth; others call for efficiency. The \'Generate Summary\' button asks your AI companion to distil the article\'s essential arguments into three or four clear points — the kind of briefing a well-read aide might prepare before a dinner conversation.' },
  { type: 'paragraph', text: 'It is not a replacement for reading. It is a primer. Use it to decide whether a piece deserves your full attention, or to recall an article you read days ago.' },
  { type: 'divider' },

  // Chapter 3
  { type: 'chapter', num: 'III', title: 'Your Library' },
  { type: 'subchapter', num: '3.1', title: 'Discovering Books' },
  { type: 'paragraph', text: 'The library is the heart of Ravenscroft. A gentleman\'s bookshelf says more about him than his wardrobe. The Discover tab presents books trending in literary circles this year, drawn from global reading data — not bestseller lists, but works that discerning readers are returning to.' },
  { type: 'paragraph', text: 'Use the search icon in the top-right corner to search for any title by name, author, or subject. Results are drawn from the Google Books catalogue of over forty million volumes.' },
  { type: 'subchapter', num: '3.2', title: 'Saving Books to My Library' },
  { type: 'paragraph', text: 'Open any book to view its detail page. The bookmark icon in the top-right corner saves the book to your personal library. Your library persists across sessions and can be accessed from the My Library tab.' },
  { type: 'paragraph', text: 'Each book you save is stamped with the date you added it — a quiet record of when a title entered your life.' },
  { type: 'subchapter', num: '3.3', title: 'The For You Shelf' },
  { type: 'paragraph', text: 'The For You tab is built from your interests, selected during the onboarding. Ravenscroft maps each interest to a curated set of books and presents them here — titles you are likely to find worthwhile, chosen on your behalf rather than by an algorithm.' },
  { type: 'paragraph', text: 'Your interests can be updated at any time from the Profile tab. The For You shelf will refresh accordingly.' },
  { type: 'divider' },

  // Chapter 4
  { type: 'chapter', num: 'IV', title: 'The Reading Room' },
  { type: 'subchapter', num: '4.1', title: 'Opening a Book' },
  { type: 'paragraph', text: 'Public-domain titles — those whose copyright has expired — can be read directly within Ravenscroft, without leaving the app. These include works by Marcus Aurelius, Oscar Wilde, Fyodor Dostoevsky, Friedrich Nietzsche, and others.' },
  { type: 'paragraph', text: 'On a book\'s detail page, the \'Read Now\' button will be available for eligible titles. Titles still under copyright will show \'Not Available\' — they may be found via your local library or preferred bookseller.' },
  { type: 'subchapter', num: '4.2', title: 'Navigating Pages' },
  { type: 'paragraph', text: 'Within the reader, you may turn pages in three ways:' },
  { type: 'bullet', text: 'Tap the left third of the screen to go to the previous page' },
  { type: 'bullet', text: 'Tap the right third of the screen to advance one page' },
  { type: 'bullet', text: 'Swipe left or right across the screen to turn pages' },
  { type: 'paragraph', text: 'The centre of the screen shows and hides the navigation controls. Tap once to reveal them, once more to return to full-screen reading.' },
  { type: 'subchapter', num: '4.3', title: 'Font & Theme Controls' },
  { type: 'paragraph', text: 'The reader offers three text sizes — S, M, and L — controlled via the Aa button in the top-right corner. Choose the size that suits your reading conditions.' },
  { type: 'paragraph', text: 'Three reading themes are available, cycled by tapping the sun icon: Light (crisp white), Sepia (warm parchment), and Dark (black canvas for low-light reading).' },
  { type: 'subchapter', num: '4.4', title: 'Taking Notes While Reading' },
  { type: 'paragraph', text: 'The floating pencil button at the bottom-right of the reader opens a note panel. Write any reflection, question, or observation — it will be saved and associated with the page you were reading.' },
  { type: 'paragraph', text: 'Your notes are visible from the book\'s detail page, and are passed to the Gentleman\'s Reflections AI when you begin a conversation about that book.' },
  { type: 'divider' },

  // Chapter 5
  { type: 'chapter', num: 'V', title: 'Gentleman\'s Reflections' },
  { type: 'subchapter', num: '5.1', title: 'Starting a Conversation' },
  { type: 'paragraph', text: 'Every book has a companion conversation. From the book\'s detail page, tap \'Gentleman\'s Reflections\' to open a private dialogue about that specific work.' },
  { type: 'paragraph', text: 'Your AI interlocutor has been instructed to speak as a well-read friend rather than a lecturer. It will not summarise the book at you — it will discuss it with you.' },
  { type: 'subchapter', num: '5.2', title: 'Suggested Prompts' },
  { type: 'paragraph', text: 'If you are not sure where to begin, suggested prompts appear beneath the input field when a conversation is new. These are not generic questions — they are tailored to the specific book and to your declared interests.' },
  { type: 'paragraph', text: 'One prompt, in particular, will ask the AI to consider where the book\'s ideas might apply in your own life, given the interests you nominated during setup.' },
  { type: 'subchapter', num: '5.3', title: 'How Your Notes Are Used' },
  { type: 'paragraph', text: 'If you have taken notes while reading, they are quietly shared with your AI companion at the start of each conversation. You need not quote them — the AI already knows what you marked as significant.' },
  { type: 'paragraph', text: 'This allows the conversation to begin at a more useful point: not \'what is this book about\', but \'given what you found meaningful, what would you like to explore further\'.' },
  { type: 'divider' },

  // Chapter 6
  { type: 'chapter', num: 'VI', title: 'Your Profile' },
  { type: 'subchapter', num: '6.1', title: 'Interests and Curation' },
  { type: 'paragraph', text: 'The interests you selected during setup are not preference tags. They are a portrait of the man you are working to become. Ravenscroft uses them to shape your book recommendations, personalise your AI conversations, and curate the content you encounter.' },
  { type: 'paragraph', text: 'They are never used for advertising, never shared, and can be updated at any time from the Profile tab under \'My Interests\'.' },
  { type: 'subchapter', num: '6.2', title: 'Reading History' },
  { type: 'paragraph', text: 'Your reading progress is saved automatically as you turn pages. When you return to a book, the reader opens at the page where you left off — no bookmarks required.' },
  { type: 'paragraph', text: 'Your reading history is a record worth keeping. The books you finish, the passages you annotate, the conversations you have about what you\'ve read — these compound. The Profile tab gives you a view of that record.' },
  { type: 'divider' },

  // Chapter 7
  { type: 'chapter', num: 'VII', title: 'A Final Word' },
  { type: 'subchapter', num: '7.1', title: 'What This App Cannot Do' },
  { type: 'paragraph', text: 'Ravenscroft can surface the right books. It can help you reflect on what you read. It can remember your progress and personalise your experience. What it cannot do is read for you, think for you, or build the discipline the practice requires.' },
  { type: 'paragraph', text: 'The app is a tool. The work is yours.' },
  { type: 'subchapter', num: '7.2', title: 'The Standard We Hold' },
  { type: 'paragraph', text: 'The word gentleman has been cheapened — reduced to a synonym for \'polite\' or \'well-dressed\'. Ravenscroft holds a different standard. A man of genuine character: widely read, intellectually honest, physically disciplined, curious about the world, and capable of sustained attention in an age designed to prevent it.' },
  { type: 'paragraph', text: 'That is the man this application is built for. If you are not yet him — welcome. Neither are most of us. But the fact that you are here, reading this, suggests you are at least pointed in the right direction.' },
];

// ─── Content renderers ────────────────────────────────────────────────────────

function ChapterHeader({ block, t, fontSize }: { block: Extract<Block, { type: 'chapter' }>; t: typeof THEMES['light']; fontSize: FontSize }) {
  return (
    <View style={styles.chapterBlock}>
      <Text style={[styles.chapterNum, { color: t.chapterNum, fontSize: FONT_SIZES[fontSize] - 1 }]}>
        Chapter {block.num}
      </Text>
      <Text style={[styles.chapterTitle, { color: t.text, fontSize: FONT_SIZES[fontSize] + 8 }]}>
        {block.title}
      </Text>
      <View style={[styles.chapterUnderline, { backgroundColor: t.text }]} />
    </View>
  );
}

function SubchapterHeader({ block, t, fontSize }: { block: Extract<Block, { type: 'subchapter' }>; t: typeof THEMES['light']; fontSize: FontSize }) {
  return (
    <View style={styles.subchapterBlock}>
      <Text style={[styles.subchapterNum, { color: t.chapterNum, fontSize: FONT_SIZES[fontSize] - 2 }]}>
        {block.num}
      </Text>
      <Text style={[styles.subchapterTitle, { color: t.text, fontSize: FONT_SIZES[fontSize] + 1, lineHeight: LINE_HEIGHTS[fontSize] + 2 }]}>
        {block.title}
      </Text>
    </View>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────

export default function AppGuideScreen() {
  const [fontSize, setFontSize] = useState<FontSize>('M');
  const [theme, setTheme] = useState<Theme>('light');
  const [showFontPicker, setShowFontPicker] = useState(false);

  const t = THEMES[theme];
  const ThemeIcon = theme === 'sepia' ? Sunset : Sun;

  const cycleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'sepia' : 'light'));
  };

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.bg }]} edges={['top', 'bottom']}>
      {/* Nav bar */}
      <View style={[styles.navBar, { backgroundColor: t.nav, borderBottomColor: t.border }]}>
        <Pressable onPress={() => router.back()} style={styles.navBack}>
          <ArrowLeft size={16} color={t.muted} strokeWidth={1.5} />
          <Text style={[styles.navTitle, { color: t.muted }]}>The Ravenscroft Guide</Text>
        </Pressable>
        <View style={styles.navActions}>
          {/* Font size */}
          <View>
            <Pressable
              onPress={(e) => { e.stopPropagation(); setShowFontPicker((p) => !p); }}
              hitSlop={10}
              style={styles.navIconBtn}
            >
              <Type size={17} color={t.text} strokeWidth={1.5} />
            </Pressable>
            {showFontPicker && (
              <View style={[styles.fontPicker, { backgroundColor: t.surface, borderColor: t.border }]}>
                {(['S', 'M', 'L'] as FontSize[]).map((size) => (
                  <Pressable
                    key={size}
                    onPress={(e) => { e.stopPropagation(); setFontSize(size); setShowFontPicker(false); }}
                    style={[styles.fontPickerItem, fontSize === size && { backgroundColor: t.bg }]}
                  >
                    <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: FONT_SIZES[size], color: fontSize === size ? t.text : t.muted }}>
                      A
                    </Text>
                  </Pressable>
                ))}
              </View>
            )}
          </View>
          {/* Theme toggle */}
          <Pressable onPress={cycleTheme} hitSlop={10} style={styles.navIconBtn}>
            <ThemeIcon size={17} color={t.text} strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>

      {/* Content */}
      <Pressable style={styles.flex} onPress={() => setShowFontPicker(false)}>
        <ScrollView
          style={[styles.flex, { backgroundColor: t.bg }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Title page */}
          <View style={styles.titlePage}>
            <Text style={[styles.titlePageLabel, { color: t.chapterNum, fontSize: FONT_SIZES[fontSize] - 2 }]}>
              Ravenscroft · The Guide
            </Text>
            <Text style={[styles.titlePageTitle, { color: t.text, fontSize: FONT_SIZES[fontSize] + 14 }]}>
              How to Use{'\n'}This Application
            </Text>
            <View style={[styles.titlePageDivider, { backgroundColor: t.text }]} />
            <Text style={[styles.titlePageSub, { color: t.muted, fontSize: FONT_SIZES[fontSize] - 1, lineHeight: LINE_HEIGHTS[fontSize] }]}>
              A platform for the modern gentleman.{'\n'}Literature, discipline, and self-cultivation.
            </Text>
          </View>

          {/* Content blocks */}
          {GUIDE_CONTENT.map((block, index) => {
            if (block.type === 'chapter') {
              return <ChapterHeader key={index} block={block} t={t} fontSize={fontSize} />;
            }
            if (block.type === 'subchapter') {
              return <SubchapterHeader key={index} block={block} t={t} fontSize={fontSize} />;
            }
            if (block.type === 'paragraph') {
              return (
                <Text key={index} style={[styles.paragraph, { color: t.text, fontSize: FONT_SIZES[fontSize], lineHeight: LINE_HEIGHTS[fontSize] }]}>
                  {block.text}
                </Text>
              );
            }
            if (block.type === 'bullet') {
              return (
                <View key={index} style={styles.bulletRow}>
                  <Text style={[styles.bulletDash, { color: t.muted, fontSize: FONT_SIZES[fontSize] }]}>—</Text>
                  <Text style={[styles.bulletText, { color: t.text, fontSize: FONT_SIZES[fontSize], lineHeight: LINE_HEIGHTS[fontSize] }]}>
                    {block.text}
                  </Text>
                </View>
              );
            }
            if (block.type === 'divider') {
              return <View key={index} style={[styles.sectionDivider, { backgroundColor: t.divider }]} />;
            }
            return null;
          })}

          {/* Colophon */}
          <View style={styles.colophon}>
            <View style={[styles.colophonLine, { backgroundColor: t.divider }]} />
            <Text style={[styles.colophonText, { color: t.chapterNum, fontSize: FONT_SIZES[fontSize] - 2 }]}>
              Ravenscroft · First Edition
            </Text>
          </View>
        </ScrollView>
      </Pressable>
    </SafeAreaView>
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
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
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
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.12, shadowRadius: 8 },
      android: { elevation: 6 },
    }),
  },
  fontPickerItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 28,
    paddingTop: 40,
    paddingBottom: 60,
  },
  // Title page
  titlePage: {
    alignItems: 'center',
    paddingVertical: 32,
    marginBottom: 40,
  },
  titlePageLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    letterSpacing: 2,
    textTransform: 'uppercase',
    marginBottom: 20,
  },
  titlePageTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: 20,
  },
  titlePageDivider: {
    width: 40,
    height: 1,
    marginBottom: 20,
  },
  titlePageSub: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    textAlign: 'center',
  },
  // Chapter
  chapterBlock: {
    marginTop: 32,
    marginBottom: 20,
    alignItems: 'flex-start',
  },
  chapterNum: {
    fontFamily: 'PlayfairDisplay_400Regular',
    letterSpacing: 2.5,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  chapterTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    lineHeight: 42,
    marginBottom: 12,
  },
  chapterUnderline: {
    width: 32,
    height: 1,
  },
  // Subchapter
  subchapterBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginTop: 22,
    marginBottom: 10,
  },
  subchapterNum: {
    fontFamily: 'PlayfairDisplay_400Regular',
    letterSpacing: 0.5,
    marginTop: 3,
  },
  subchapterTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    flex: 1,
  },
  // Body
  paragraph: {
    fontFamily: 'PlayfairDisplay_400Regular',
    marginBottom: 16,
    textAlign: 'left',
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 8,
    paddingLeft: 4,
  },
  bulletDash: {
    fontFamily: 'PlayfairDisplay_400Regular',
    marginTop: 1,
  },
  bulletText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    flex: 1,
  },
  sectionDivider: {
    height: 1,
    marginVertical: 32,
  },
  // Colophon
  colophon: {
    alignItems: 'center',
    marginTop: 20,
    gap: 16,
  },
  colophonLine: {
    width: 40,
    height: 1,
  },
  colophonText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    letterSpacing: 1.5,
  },
});
