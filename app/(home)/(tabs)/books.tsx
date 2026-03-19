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
import { useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
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
// Cover URLs use Open Library ISBN covers as reliable static fallbacks.
// fetchTrendingBooks() fetches these same titles from Google Books and may replace this list.
const OL_COVER = (isbn: string) => `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`;

const CURATED_FALLBACK: Book[] = [
  { id: 'OL45804W',   title: 'Meditations',               author: 'Marcus Aurelius',     genre: 'Philosophy',  pageCount: 254,  coverUrl: OL_COVER('0812968255') },
  { id: 'OL66768W',   title: 'The Old Man and the Sea',    author: 'Ernest Hemingway',    genre: 'Literature',  pageCount: 127,  coverUrl: OL_COVER('0684801221') },
  { id: 'OL18098W',   title: "Man's Search for Meaning",   author: 'Viktor Frankl',       genre: 'Psychology',  pageCount: 165,  coverUrl: OL_COVER('0807014273') },
  { id: 'OL468431W',  title: 'The Great Gatsby',           author: 'F. Scott Fitzgerald', genre: 'Fiction',     pageCount: 180,  coverUrl: OL_COVER('0743273567') },
  { id: 'OL15404W',   title: 'Letters from a Stoic',       author: 'Seneca',              genre: 'Philosophy',  pageCount: 256,  coverUrl: OL_COVER('0140442103') },
  { id: 'OL49236W',   title: 'The Picture of Dorian Gray', author: 'Oscar Wilde',         genre: 'Fiction',     pageCount: 254,  coverUrl: OL_COVER('0141439572') },
  { id: 'OL8098828W', title: 'Crime and Punishment',       author: 'Fyodor Dostoevsky',   genre: 'Fiction',     pageCount: 671,  coverUrl: OL_COVER('0140449132') },
  { id: 'OL57553W',   title: 'Thus Spoke Zarathustra',     author: 'Friedrich Nietzsche', genre: 'Philosophy',  pageCount: 336,  coverUrl: OL_COVER('0140441182') },
  { id: 'OL71490W',   title: 'Walden',                     author: 'Henry David Thoreau', genre: 'Essays',      pageCount: 224,  coverUrl: OL_COVER('0691096120') },
  { id: 'OL35233W',   title: 'The Count of Monte Cristo',  author: 'Alexandre Dumas',     genre: 'Fiction',     pageCount: 1276, coverUrl: OL_COVER('0140449264') },
  { id: 'OL15403W',   title: 'On the Shortness of Life',   author: 'Seneca',              genre: 'Philosophy',  pageCount: 97,   coverUrl: OL_COVER('0143036327') },
  { id: 'OL22025W',   title: 'The Art of War',             author: 'Sun Tzu',             genre: 'Strategy',    pageCount: 112,  coverUrl: OL_COVER('1590302257') },
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

// ─── Google Books API ─────────────────────────────────────────────────────────
type GBVolume = {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
    pageCount?: number;
    categories?: string[];
    description?: string;
  };
};

type GBResponse = {
  totalItems: number;
  items?: GBVolume[];
};

function gbCoverUrl(item: GBVolume): string | undefined {
  const raw = item.volumeInfo.imageLinks?.thumbnail ?? item.volumeInfo.imageLinks?.smallThumbnail;
  if (!raw) return undefined;
  return raw
    .replace('http://', 'https://')
    .replace('zoom=1', 'zoom=2')
    .replace('&edge=curl', '');
}

async function searchGoogleBooks(
  query: string,
  offset: number = 0,
  signal?: AbortSignal,
): Promise<{ books: Book[]; total: number }> {
  const res = await fetch(
    `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&startIndex=${offset}&maxResults=20&orderBy=relevance`,
    { signal: signal ?? AbortSignal.timeout(8000) },
  );
  if (!res.ok) throw new Error(`GB ${res.status}`);
  const data: GBResponse = await res.json();
  const items = data.items ?? [];
  const books = items
    .filter((item) => gbCoverUrl(item))
    .map((item) => ({
      id: item.id,
      title: item.volumeInfo.title,
      author: item.volumeInfo.authors?.[0] ?? 'Unknown',
      coverUrl: gbCoverUrl(item),
      pageCount: item.volumeInfo.pageCount,
      genre: item.volumeInfo.categories?.[0],
      description: item.volumeInfo.description,
    }));
  return { books, total: data.totalItems ?? 0 };
}

async function fetchTrendingBooks(): Promise<Book[]> {
  const TRENDING_QUERIES = [
    'Meditations Marcus Aurelius',
    'The Old Man and the Sea Hemingway',
    "Man's Search for Meaning Frankl",
    'The Great Gatsby Fitzgerald',
    'Letters from a Stoic Seneca',
    'The Picture of Dorian Gray Wilde',
    'Crime and Punishment Dostoevsky',
    'Thus Spoke Zarathustra Nietzsche',
    'Walden Thoreau',
    'The Count of Monte Cristo Dumas',
    'On the Shortness of Life Seneca',
    'The Art of War Sun Tzu',
  ];
  const results = await Promise.allSettled(
    TRENDING_QUERIES.map((q) => searchGoogleBooks(q, 0)),
  );
  const seen = new Set<string>();
  const books: Book[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      const first = result.value.books[0];
      if (first && !seen.has(first.id)) {
        seen.add(first.id);
        books.push(first);
      }
    }
  }
  return books;
}

async function fetchForYouBooks(interests: string[]): Promise<Book[]> {
  const queries = interests.slice(0, 4).map((i) => INTEREST_QUERIES[i]).filter(Boolean);
  const results = await Promise.allSettled(queries.map((q) => searchGoogleBooks(q)));
  const seen = new Set<string>();
  const books: Book[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const book of result.value.books.slice(0, 5)) {
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
  }, [delay, opacity]);
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
          <Image
            source={{ uri: book.coverUrl }}
            style={{ width: CARD_W, height: coverH }}
            contentFit="cover"
            transition={200}
          />
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
  const [searchOffset, setSearchOffset] = useState(0);
  const [searchTotal, setSearchTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);

  const [trendingBooks, setTrendingBooks] = useState<Book[]>(CURATED_FALLBACK);
  const [trendingLoading, setTrendingLoading] = useState(true);
  const trendingFetched = useRef(false);

  const [forYouBooks, setForYouBooks] = useState<Book[]>([]);
  const [forYouLoading, setForYouLoading] = useState(false);
  const forYouFetched = useRef(false);

  const searchH = useSharedValue(0);
  const searchStyle = useAnimatedStyle(() => ({ height: searchH.value, overflow: 'hidden' }));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const loadMoreScale = useSharedValue(1);
  const loadMoreStyle = useAnimatedStyle(() => ({ transform: [{ scale: loadMoreScale.value }] }));

  useEffect(() => () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    abortRef.current?.abort();
  }, []);

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

  // Reset For You cache when interests change
  const prevInterestsKey = useRef('');
  useEffect(() => {
    const key = selectedInterests.slice().sort().join(',');
    if (key !== prevInterestsKey.current) {
      prevInterestsKey.current = key;
      forYouFetched.current = false;
    }
  }, [selectedInterests]);

  // Lazy-load For You on first visit or after interests change
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
    if (!open) {
      abortRef.current?.abort();
      setQuery('');
      setSearchResults([]);
      setSearchError(false);
      setSearchOffset(0);
      setSearchTotal(0);
    }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    setSearchError(false);
    abortRef.current?.abort();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) {
      setSearchResults([]);
      setSearchOffset(0);
      setSearchTotal(0);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      const controller = new AbortController();
      abortRef.current = controller;
      setSearching(true);
      setSearchError(false);
      setSearchOffset(0);
      setSearchTotal(0);
      setSearchResults([]);
      try {
        const { books, total } = await searchGoogleBooks(text, 0, controller.signal);
        if (!controller.signal.aborted) {
          setSearchResults(books);
          setSearchTotal(total);
        }
      } catch {
        if (!controller.signal.aborted) {
          setSearchResults([]);
          setSearchError(true);
        }
      } finally {
        if (!controller.signal.aborted) setSearching(false);
      }
    }, 400);
  };

  const handleLoadMore = async () => {
    if (loadingMore || searching) return;
    const nextOffset = searchOffset + 20;
    if (nextOffset >= searchTotal) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoadingMore(true);
    try {
      const { books, total } = await searchGoogleBooks(query, nextOffset, controller.signal);
      if (!controller.signal.aborted) {
        const existingIds = new Set(searchResults.map((b) => b.id));
        const fresh = books.filter((b) => !existingIds.has(b.id));
        setSearchResults((prev) => [...prev, ...fresh]);
        setSearchOffset(nextOffset);
        setSearchTotal(total);
      }
    } catch {
      // silent — user retains existing results
    } finally {
      if (!controller.signal.aborted) setLoadingMore(false);
    }
  };

  const filteredLibrary = useMemo(() => {
    if (!query.trim()) return library;
    const lower = query.toLowerCase().trim();
    return library.filter(
      (b) => b.title.toLowerCase().includes(lower) || b.author.toLowerCase().includes(lower),
    );
  }, [library, query]);

  const showingSearch = searchOpen && query.trim().length > 0;
  const hasMore = showingSearch && activeTab !== 'library' && searchOffset + 20 < searchTotal;
  const displayData = showingSearch
    ? (activeTab === 'library' ? filteredLibrary : searchResults)
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
      if (activeTab === 'library') {
        return (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, paddingHorizontal: 32 }}>
            <Search size={28} color="#D4D4D4" strokeWidth={1} />
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 14, color: '#6B6B6B', textAlign: 'center', marginTop: 12, lineHeight: 20 }}>
              No books in your library match{'\n'}"{query.trim()}"
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
              placeholder={activeTab === 'library' ? 'Search your library…' : 'Search any book…'}
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
        {!showingSearch && (
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
        )}
      </View>

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
          backgroundColor: activeTab === 'library' ? '#FAFAF8' : 'transparent',
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
        ListFooterComponent={
          hasMore || loadingMore ? (
            <View style={{ paddingVertical: 20, alignItems: 'center' }}>
              {loadingMore ? (
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <SearchDots />
                  <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 12, color: '#6B6B6B' }}>
                    Loading more…
                  </Text>
                </View>
              ) : (
                <AnimatedPressable
                  style={[loadMoreStyle, {
                    borderWidth: StyleSheet.hairlineWidth,
                    borderColor: '#D4D4D4',
                    borderRadius: 20,
                    paddingHorizontal: 24,
                    paddingVertical: 10,
                    backgroundColor: 'rgba(255,255,255,0.72)',
                  }]}
                  onPressIn={() => { loadMoreScale.value = withSpring(0.95, { damping: 18, stiffness: 180 }); }}
                  onPressOut={() => { loadMoreScale.value = withSpring(1, { damping: 18, stiffness: 180 }); }}
                  onPress={handleLoadMore}
                  accessibilityRole="button"
                  accessibilityLabel="Load more books"
                >
                  <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#1C1C1C', letterSpacing: 0.3 }}>
                    Load more
                  </Text>
                </AnimatedPressable>
              )}
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <BookCard
            book={item}
            inLibrary={isInLibrary(item.id)}
            isLibraryView={activeTab === 'library'}
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
});
