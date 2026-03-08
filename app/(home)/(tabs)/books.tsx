// app/(home)/(tabs)/books.tsx — Books library with search, trending discover, and For You shelf
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { useBooksStore } from '@/store/booksStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Book } from '@/types/book';
import { BlurView } from 'expo-blur';
import { router } from 'expo-router';
import {
  BookMarked,
  BookOpen,
  Search,
  Sparkles,
  TrendingUp,
  X,
} from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_H_PAD = 20;
const CARD_W = (SCREEN_W - CARD_H_PAD * 2 - CARD_GAP) / 2;
const COVER_H = CARD_W * 1.5;
const COVER_H_LIBRARY = CARD_W * 1.65;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Curated fallback ─────────────────────────────────────────────────────────
const CURATED_FALLBACK: Book[] = [
  { id: 'OL45804W',   title: 'Meditations',                  author: 'Marcus Aurelius',     genre: 'Philosophy',  pageCount: 254,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg' },
  { id: 'OL66768W',   title: 'The Old Man and the Sea',       author: 'Ernest Hemingway',    genre: 'Literature',  pageCount: 127,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780684801223-L.jpg' },
  { id: 'OL18098W',   title: "Man's Search for Meaning",      author: 'Viktor Frankl',       genre: 'Psychology',  pageCount: 165,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780807014271-L.jpg' },
  { id: 'OL468431W',  title: 'The Great Gatsby',              author: 'F. Scott Fitzgerald', genre: 'Fiction',     pageCount: 180,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg' },
  { id: 'OL15404W',   title: 'Letters from a Stoic',          author: 'Seneca',              genre: 'Philosophy',  pageCount: 256,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140442106-L.jpg' },
  { id: 'OL49236W',   title: 'The Picture of Dorian Gray',    author: 'Oscar Wilde',         genre: 'Fiction',     pageCount: 254,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg' },
  { id: 'OL8098828W', title: 'Crime and Punishment',          author: 'Fyodor Dostoevsky',   genre: 'Fiction',     pageCount: 671,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg' },
  { id: 'OL57553W',   title: 'Thus Spoke Zarathustra',        author: 'Friedrich Nietzsche', genre: 'Philosophy',  pageCount: 336,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140441185-L.jpg' },
  { id: 'OL71490W',   title: 'Walden',                        author: 'Henry David Thoreau', genre: 'Essays',      pageCount: 224,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451531445-L.jpg' },
  { id: 'OL35233W',   title: 'The Count of Monte Cristo',     author: 'Alexandre Dumas',     genre: 'Fiction',     pageCount: 1276, coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449266-L.jpg' },
  { id: 'OL15403W',   title: 'On the Shortness of Life',      author: 'Seneca',              genre: 'Philosophy',  pageCount: 97,   coverUrl: 'https://covers.openlibrary.org/b/isbn/9780143036326-L.jpg' },
  { id: 'OL22025W',   title: 'The Art of War',                author: 'Sun Tzu',             genre: 'Strategy',    pageCount: 112,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9781590302255-L.jpg' },
];

// ─── Interest → query map ─────────────────────────────────────────────────────
const INTEREST_QUERIES: Record<string, string> = {
  'Exercise':         'fitness health high performance athlete',
  'Literature':       'classic literature fiction masterpiece timeless',
  'Stoicism':         'stoicism philosophy ancient wisdom marcus aurelius',
  'Journaling':       'journaling self reflection introspection writing',
  'Travel & Culture': 'travel culture world discovery civilization',
  'Music':            'music history culture theory composition',
  'Theatre & Cinema': 'cinema film arts theatre screenplay',
  'Morning Rituals':  'morning routine discipline habits excellence',
};

// ─── Open Library trending API ────────────────────────────────────────────────
type OLWork = {
  key?: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  subject?: string[];
};

async function fetchTrendingBooks(): Promise<Book[]> {
  const res = await fetch(
    'https://openlibrary.org/trending/yearly.json?limit=24',
    { signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) throw new Error(`OL ${res.status}`);
  const data = await res.json();
  const works: OLWork[] = data.works ?? [];
  return works
    .filter((w) => w.cover_i && w.key)
    .map((w) => ({
      id: w.key!.replace('/works/', ''),
      title: w.title,
      author: w.author_name?.[0] ?? 'Unknown',
      coverUrl: `https://covers.openlibrary.org/b/id/${w.cover_i}-L.jpg`,
      pageCount: w.number_of_pages_median,
      genre: w.subject?.[0],
    }));
}

// ─── Open Library search (same API as trending — no key needed) ───────────────
async function searchOpenLibrary(query: string): Promise<Book[]> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20`,
    { signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) throw new Error(`OL ${res.status}`);
  const data = await res.json();
  const docs: OLWork[] = data.docs ?? [];
  return docs
    .filter((d) => d.cover_i && d.title)
    .map((d) => ({
      id: d.key!.replace('/works/', ''),
      title: d.title,
      author: d.author_name?.[0] ?? 'Unknown',
      coverUrl: `https://covers.openlibrary.org/b/id/${d.cover_i}-L.jpg`,
      pageCount: d.number_of_pages_median,
      genre: d.subject?.[0],
    }));
}

async function fetchForYouBooks(interests: string[]): Promise<Book[]> {
  const queries = interests.slice(0, 4).map((i) => INTEREST_QUERIES[i]).filter(Boolean);
  const results = await Promise.allSettled(queries.map((q) => searchOpenLibrary(q)));
  const seen = new Set<string>();
  const books: Book[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const book of result.value.slice(0, 5)) {
        if (!seen.has(book.id) && book.coverUrl) {
          seen.add(book.id);
          books.push(book);
        }
      }
    }
  }
  return books;
}

// ─── Relative date ────────────────────────────────────────────────────────────
function getRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

// ─── Cover colour ─────────────────────────────────────────────────────────────
const COVER_COLORS = ['#1C1C1C', '#2C2C2C', '#3B2F2F', '#2B3A2B', '#2B2B3A', '#3A2B38', '#3A352B'];
function coverColor(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return COVER_COLORS[n % COVER_COLORS.length];
}

// ─── Search dot (single animated dot) ────────────────────────────────────────
function SearchDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.2);
  useEffect(() => {
    setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(withTiming(1, { duration: 480 }), withTiming(0.2, { duration: 480 })),
        -1,
        false,
      );
    }, delay);
  }, []);
  const s = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[s, { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#ABABAB' }]} />;
}

function SearchDots() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <SearchDot delay={0} />
      <SearchDot delay={190} />
      <SearchDot delay={380} />
    </View>
  );
}

// ─── BookCard ─────────────────────────────────────────────────────────────────
function BookCard({
  book,
  inLibrary,
  isLibraryView = false,
}: {
  book: Book;
  inLibrary: boolean;
  isLibraryView?: boolean;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));
  const coverH = isLibraryView ? COVER_H_LIBRARY : COVER_H;

  return (
    <AnimatedPressable
      style={[animStyle, { width: CARD_W }]}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 14 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 14 }); }}
      onPress={() =>
        router.push({ pathname: '/(home)/book-detail', params: { book: JSON.stringify(book) } })
      }
      accessibilityRole="button"
      accessibilityLabel={`${book.title} by ${book.author}`}
    >
      {/* Cover */}
      <View style={{ width: CARD_W, height: coverH, borderRadius: 14, overflow: 'hidden', backgroundColor: coverColor(book.id) }}>
        {book.coverUrl ? (
          <Image source={{ uri: book.coverUrl }} style={{ width: CARD_W, height: coverH }} resizeMode="cover" />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 36, color: 'rgba(255,255,255,0.20)' }}>
              {book.title[0]}
            </Text>
          </View>
        )}

        {/* Library badge — in-use everywhere except library view itself */}
        {inLibrary && !isLibraryView && (
          <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#0A0A0A', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
            <BookMarked size={12} color="#EDEDED" strokeWidth={2} />
          </View>
        )}

        {/* Library view — bottom gradient author strip */}
        {isLibraryView && (
          <View style={{ position: 'absolute', bottom: 0, left: 0, right: 0, paddingHorizontal: 8, paddingBottom: 7, paddingTop: 14, backgroundColor: 'rgba(10,10,10,0.5)' }}>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 9, color: 'rgba(237,237,237,0.7)', letterSpacing: 0.3 }} numberOfLines={1}>
              {book.author}
            </Text>
          </View>
        )}
      </View>

      {/* Meta */}
      <View style={{ marginTop: 8, gap: 2 }}>
        <Text numberOfLines={2} style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 13, color: '#0A0A0A', lineHeight: 18 }}>
          {book.title}
        </Text>
        {!isLibraryView && (
          <Text numberOfLines={1} style={{ fontSize: 11, fontStyle: 'italic', color: '#6B6B6B' }}>
            {book.author}
          </Text>
        )}
        {isLibraryView && book.addedAt && (
          <Text style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 10, color: '#ABABAB', letterSpacing: 0.2 }}>
            Added {getRelativeDate(book.addedAt)}
          </Text>
        )}
      </View>
    </AnimatedPressable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
type ActiveTab = 'library' | 'discover' | 'foryou';

export default function BooksTab() {
  const insets = useSafeAreaInsets();
  const { library, hydrate, isInLibrary } = useBooksStore();
  const { selectedInterests, checkOnboardingStatus } = useOnboardingStore();

  const [activeTab, setActiveTab] = useState<ActiveTab>('discover');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(false);

  const [trendingBooks, setTrendingBooks] = useState<Book[]>(CURATED_FALLBACK);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const trendingFetched = useRef(false);

  const [forYouBooks, setForYouBooks] = useState<Book[]>([]);
  const [forYouLoading, setForYouLoading] = useState(false);
  const forYouFetched = useRef(false);

  const searchH = useSharedValue(0);
  const searchStyle = useAnimatedStyle(() => ({ height: searchH.value, overflow: 'hidden' }));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    hydrate();
    if (selectedInterests.length === 0) {
      checkOnboardingStatus();
    }
    if (!trendingFetched.current) {
      trendingFetched.current = true;
      fetchTrendingBooks()
        .then((books) => { if (books.length > 0) setTrendingBooks(books); })
        .catch(() => {})
        .finally(() => setTrendingLoading(false));
    }
  }, [hydrate]);

  // Lazy-load For You on first visit
  useEffect(() => {
    if (activeTab === 'foryou' && !forYouFetched.current && selectedInterests.length > 0) {
      forYouFetched.current = true;
      setForYouLoading(true);
      fetchForYouBooks(selectedInterests)
        .then(setForYouBooks)
        .catch(() => {})
        .finally(() => setForYouLoading(false));
    }
  }, [activeTab, selectedInterests]);

  const toggleSearch = () => {
    const open = !searchOpen;
    setSearchOpen(open);
    searchH.value = withTiming(open ? 52 : 0, { duration: 220 });
    if (!open) { setQuery(''); setSearchResults([]); setSearchError(false); }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setSearchError(false);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      setSearchError(false);
      try {
        const results = await searchOpenLibrary(text);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
        setSearchError(true);
      } finally {
        setSearching(false);
      }
    }, 400);
  };

  const showingSearch = searchOpen && query.trim().length > 0;
  const displayData = showingSearch
    ? searchResults
    : activeTab === 'library'
      ? library
      : activeTab === 'foryou'
        ? forYouBooks
        : trendingBooks;

  const renderEmpty = () => {
    if (showingSearch && searching) return null;
    if (showingSearch) {
      if (searchError) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 16, color: '#0A0A0A', textAlign: 'center', marginBottom: 6 }}>
              Search Unavailable
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#6B6B6B', textAlign: 'center', lineHeight: 20 }}>
              Unable to reach the books catalogue. Check your connection and try again.
            </Text>
          </View>
        );
      }
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
          <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 14, color: '#6B6B6B' }}>No results found.</Text>
        </View>
      );
    }
    if (activeTab === 'library') {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
          <BookOpen size={36} color="#D4D4D4" strokeWidth={1} />
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#0A0A0A', marginTop: 16, marginBottom: 6, textAlign: 'center' }}>
            Begin Your Collection
          </Text>
          <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#6B6B6B', textAlign: 'center', lineHeight: 20 }}>
            A gentleman&apos;s library is the mirror of his mind. Discover a book and save it here.
          </Text>
        </View>
      );
    }
    if (activeTab === 'foryou') {
      if (forYouLoading) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
            <ActivityIndicator color="#6B6B6B" />
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#6B6B6B', marginTop: 12 }}>
              Curating your shelf…
            </Text>
          </View>
        );
      }
      if (selectedInterests.length === 0) {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
            <Sparkles size={36} color="#D4D4D4" strokeWidth={1} />
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#0A0A0A', marginTop: 16, marginBottom: 6, textAlign: 'center' }}>
              No Interests Set
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#6B6B6B', textAlign: 'center', lineHeight: 20 }}>
              Visit your Profile to set your interests and unlock a personalised shelf.
            </Text>
          </View>
        );
      }
    }
    return null;
  };

  const TAB_LABELS: { id: ActiveTab; label: string }[] = [
    { id: 'library',  label: 'My Library' },
    { id: 'discover', label: 'Discover' },
    { id: 'foryou',   label: 'For You' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['top']}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: '#0A0A0A' }}>
          Library
        </Text>
        <Pressable onPress={toggleSearch} hitSlop={12} accessibilityRole="button" accessibilityLabel={searchOpen ? 'Close search' : 'Search books'}>
          {searchOpen
            ? <X size={20} color="#6B6B6B" strokeWidth={1.5} />
            : <Search size={20} color="#6B6B6B" strokeWidth={1.5} />}
        </Pressable>
      </View>

      {/* Animated search bar — glass pill */}
      <Animated.View style={[searchStyle, { paddingHorizontal: 20 }]}>
        <View style={booksStyles.searchBarShadow}>
          <View style={booksStyles.searchBar}>
            {Platform.OS === 'ios' && (
              <BlurView intensity={52} tint="systemChromeMaterialLight" style={StyleSheet.absoluteFill} />
            )}
            <View style={[StyleSheet.absoluteFill, booksStyles.searchBarFill]} pointerEvents="none" />
            <Search size={14} color="#6B6B6B" strokeWidth={1.5} />
            <TextInput
              value={query}
              onChangeText={handleQueryChange}
              placeholder="Search any book…"
              placeholderTextColor="#ABABAB"
              style={{ flex: 1, marginLeft: 8, fontFamily: 'PlayfairDisplay_400Regular', fontSize: 14, color: '#0A0A0A' }}
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              returnKeyType="search"
            />
            {searching && <SearchDots />}
          </View>
        </View>
      </Animated.View>

      {/* Tabs — unified glassmorphic segmented control */}
      {!showingSearch && (
        <View style={{ paddingHorizontal: 20, paddingTop: 12, paddingBottom: 8 }}>
          <View style={booksStyles.segmentContainer}>
            {Platform.OS === 'ios' && (
              <BlurView intensity={56} tint="systemUltraThinMaterialLight" style={StyleSheet.absoluteFill} />
            )}
            <View style={[StyleSheet.absoluteFill, booksStyles.segmentFill]} pointerEvents="none" />
            {TAB_LABELS.map(({ id, label }) => {
              const active = activeTab === id;
              return (
                <Pressable
                  key={id}
                  onPress={() => setActiveTab(id)}
                  style={booksStyles.segmentItem}
                >
                  {active && <View style={booksStyles.segmentActivePill} />}
                  <Text style={{
                    fontFamily: active ? 'PlayfairDisplay_700Bold' : 'PlayfairDisplay_400Regular',
                    fontSize: 12,
                    color: active ? '#0A0A0A' : '#6B6B6B',
                    letterSpacing: 0.3,
                    zIndex: 1,
                  }}>
                    {label}
                  </Text>
                </Pressable>
              );
            })}
          </View>
          {/* Metadata row below */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-end', marginTop: 8, gap: 4 }}>
            {activeTab === 'discover' && (
              trendingLoading
                ? <ActivityIndicator size="small" color="#ABABAB" />
                : <>
                    <TrendingUp size={11} color="#ABABAB" strokeWidth={1.5} />
                    <Text style={{ fontSize: 10, color: '#ABABAB', letterSpacing: 0.3 }}>This year</Text>
                  </>
            )}
            {activeTab === 'foryou' && selectedInterests.length > 0 && (
              <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 10, color: '#ABABAB' }} numberOfLines={1}>
                {selectedInterests.slice(0, 2).join(' · ')}
              </Text>
            )}
            {activeTab === 'library' && library.length > 0 && (
              <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 10, color: '#ABABAB' }}>
                {library.length} book{library.length !== 1 ? 's' : ''}
              </Text>
            )}
          </View>
        </View>
      )}

      {/* Library personal header strip */}
      {activeTab === 'library' && !showingSearch && (
        <View style={{ backgroundColor: '#0A0A0A', paddingHorizontal: 24, paddingVertical: 13 }}>
          <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 12, color: '#EDEDED', letterSpacing: 2, textTransform: 'uppercase' }}>
            My Collection
          </Text>
          <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 11, color: 'rgba(237,237,237,0.45)', marginTop: 2 }}>
            {library.length === 0
              ? 'No books saved yet'
              : `${library.length} book${library.length !== 1 ? 's' : ''} · personally chosen`}
          </Text>
        </View>
      )}

      {/* Grid */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        key="grid"
        style={{
          flex: 1,
          backgroundColor: activeTab === 'library' && !showingSearch ? '#FAFAF8' : 'transparent',
        }}
        contentContainerStyle={{
          paddingHorizontal: CARD_H_PAD,
          paddingTop: 14,
          paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom,
          gap: CARD_GAP,
          flexGrow: 1,
        }}
        columnWrapperStyle={{ gap: CARD_GAP }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => (
          <BookCard
            book={item}
            inLibrary={isInLibrary(item.id)}
            isLibraryView={activeTab === 'library' && !showingSearch}
          />
        )}
      />
    </SafeAreaView>
  );
}

// ─── Books tab styles ─────────────────────────────────────────────────────────
const booksStyles = StyleSheet.create({
  // Glass search bar
  searchBarShadow: {
    borderRadius: 20,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
      },
      android: { elevation: 5 },
    }),
  },
  searchBar: {
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.88)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    height: 44,
    backgroundColor: Platform.select({
      ios: 'transparent',
      android: 'rgba(255,255,255,0.72)',
    }),
  },
  searchBarFill: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 20,
  },
  // Segmented tab control
  segmentContainer: {
    flexDirection: 'row',
    overflow: 'hidden',
    borderRadius: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(255,255,255,0.9)',
    backgroundColor: Platform.select({ android: 'rgba(255,255,255,0.55)' }),
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
    }),
  },
  segmentFill: {
    backgroundColor: 'rgba(255,255,255,0.45)',
    borderRadius: 20,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
  },
  segmentActivePill: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.82)',
    borderRadius: 16,
    marginHorizontal: 3,
    marginVertical: 3,
  },
  // kept for potential re-use
  subTabPillInactiveFill: {
    backgroundColor: 'rgba(255,255,255,0.58)',
    borderRadius: 20,
  },
});
