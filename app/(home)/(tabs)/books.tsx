// app/(home)/(tabs)/books.tsx — Books library with search + curated discover
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { useBooksStore } from '@/store/booksStore';
import { Book } from '@/types/book';
import { router } from 'expo-router';
import { BookMarked, BookOpen, Search, X } from 'lucide-react-native';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_GAP = 12;
const CARD_H_PAD = 20;
const CARD_W = (SCREEN_W - CARD_H_PAD * 2 - CARD_GAP) / 2;
const COVER_H = CARD_W * 1.5;

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Curated books (no coverUrl — fetched from Google Books on mount) ─────────
const CURATED_BASE: Omit<Book, 'coverUrl'>[] = [
  { id: 'OL45804W',   title: 'Meditations',                  author: 'Marcus Aurelius',     genre: 'Philosophy',  pageCount: 254 },
  { id: 'OL66768W',   title: 'The Old Man and the Sea',       author: 'Ernest Hemingway',    genre: 'Literature',  pageCount: 127 },
  { id: 'OL18098W',   title: "Man's Search for Meaning",      author: 'Viktor Frankl',       genre: 'Psychology',  pageCount: 165 },
  { id: 'OL468431W',  title: 'The Great Gatsby',              author: 'F. Scott Fitzgerald', genre: 'Fiction',     pageCount: 180 },
  { id: 'OL15404W',   title: 'Letters from a Stoic',          author: 'Seneca',              genre: 'Philosophy',  pageCount: 256 },
  { id: 'OL49236W',   title: 'The Picture of Dorian Gray',    author: 'Oscar Wilde',         genre: 'Fiction',     pageCount: 254 },
  { id: 'OL8098828W', title: 'Crime and Punishment',          author: 'Fyodor Dostoevsky',   genre: 'Fiction',     pageCount: 671 },
  { id: 'OL57553W',   title: 'Thus Spoke Zarathustra',        author: 'Friedrich Nietzsche', genre: 'Philosophy',  pageCount: 336 },
  { id: 'OL71490W',   title: 'Walden',                        author: 'Henry David Thoreau', genre: 'Essays',      pageCount: 224 },
  { id: 'OL35233W',   title: 'The Count of Monte Cristo',     author: 'Alexandre Dumas',     genre: 'Fiction',     pageCount: 1276 },
  { id: 'OL15403W',   title: 'On the Shortness of Life',      author: 'Seneca',              genre: 'Philosophy',  pageCount: 97 },
  { id: 'OL22025W',   title: 'The Art of War',                author: 'Sun Tzu',             genre: 'Strategy',    pageCount: 112 },
];

// ─── Google Books API ─────────────────────────────────────────────────────────
// Why Google Books?
//  • Returns cover URLs *directly* in the search response — no secondary lookup
//  • Covers are served from Google's CDN → reliable, fast
//  • Free up to 1,000 requests/day without a key (add ?key= for more)
//  • Handles errors gracefully (always returns JSON, `items` may be absent)

type GBItem = {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    imageLinks?: { smallThumbnail?: string; thumbnail?: string };
    pageCount?: number;
    categories?: string[];
    description?: string;
  };
};

// Google returns http:// covers; upgrade to https
const httpsUrl = (url?: string) =>
  url ? url.replace('http://', 'https://') : undefined;

async function searchGoogleBooks(query: string): Promise<Book[]> {
  const url =
    `https://www.googleapis.com/books/v1/volumes` +
    `?q=${encodeURIComponent(query)}&maxResults=20` +
    `&fields=items(id,volumeInfo(title,authors,imageLinks,pageCount,categories))`;
  const res = await fetch(url);
  const data = await res.json();
  // `items` is absent when there are no results — always guard with ?? []
  const items: GBItem[] = data.items ?? [];
  return items.map((item) => ({
    id: item.id,
    title: item.volumeInfo.title ?? 'Untitled',
    author: item.volumeInfo.authors?.[0] ?? 'Unknown',
    coverUrl: httpsUrl(item.volumeInfo.imageLinks?.thumbnail ?? item.volumeInfo.imageLinks?.smallThumbnail),
    pageCount: item.volumeInfo.pageCount,
    genre: item.volumeInfo.categories?.[0],
  }));
}

async function fetchCoverForBook(book: Omit<Book, 'coverUrl'>): Promise<string | undefined> {
  // Query Google Books by title + author to get a reliable cover thumbnail
  const q = `intitle:${encodeURIComponent(book.title)}+inauthor:${encodeURIComponent(book.author)}`;
  const url =
    `https://www.googleapis.com/books/v1/volumes` +
    `?q=${q}&maxResults=1&fields=items/volumeInfo/imageLinks`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const links = data.items?.[0]?.volumeInfo?.imageLinks;
    return httpsUrl(links?.thumbnail ?? links?.smallThumbnail);
  } catch {
    return undefined;
  }
}

// ─── Fallback cover colour (deterministic from id) ────────────────────────────
const COVER_COLORS = ['#1C1C1C', '#2C2C2C', '#3B2F2F', '#2B3A2B', '#2B2B3A', '#3A2B38', '#3A352B'];
function coverColor(id: string): string {
  let n = 0;
  for (let i = 0; i < id.length; i++) n += id.charCodeAt(i);
  return COVER_COLORS[n % COVER_COLORS.length];
}

// ─── BookCard ─────────────────────────────────────────────────────────────────
function BookCard({ book, inLibrary }: { book: Book; inLibrary: boolean }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

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
      <View style={{ width: CARD_W, height: COVER_H, borderRadius: 10, overflow: 'hidden', backgroundColor: coverColor(book.id) }}>
        {book.coverUrl ? (
          <Image
            source={{ uri: book.coverUrl }}
            style={{ width: CARD_W, height: COVER_H }}
            resizeMode="cover"
          />
        ) : (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 36, color: 'rgba(255,255,255,0.20)' }}>
              {book.title[0]}
            </Text>
          </View>
        )}
        {inLibrary && (
          <View style={{ position: 'absolute', top: 8, right: 8, backgroundColor: '#0A0A0A', borderRadius: 12, width: 24, height: 24, alignItems: 'center', justifyContent: 'center' }}>
            <BookMarked size={12} color="#EDEDED" strokeWidth={2} />
          </View>
        )}
      </View>

      {/* Meta */}
      <View style={{ marginTop: 8, gap: 2 }}>
        <Text numberOfLines={2} style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 13, color: '#0A0A0A', lineHeight: 18 }}>
          {book.title}
        </Text>
        <Text numberOfLines={1} style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 11, color: '#6B6B6B' }}>
          {book.author}
        </Text>
      </View>
    </AnimatedPressable>
  );
}

// ─── Main screen ──────────────────────────────────────────────────────────────
export default function BooksTab() {
  const insets = useSafeAreaInsets();
  const { library, hydrate, isInLibrary } = useBooksStore();

  // Curated books start without covers; we fetch from Google Books in parallel
  const [curated, setCurated] = useState<Book[]>(CURATED_BASE.map((b) => ({ ...b })));
  const [activeTab, setActiveTab] = useState<'library' | 'discover'>('discover');
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [searching, setSearching] = useState(false);

  const searchH = useSharedValue(0);
  const searchStyle = useAnimatedStyle(() => ({ height: searchH.value, overflow: 'hidden' }));
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Hydrate saved library + fetch covers for curated books on mount
  useEffect(() => {
    hydrate();
    // Fetch all 12 curated covers in parallel from Google Books
    Promise.all(CURATED_BASE.map(async (book) => {
      const coverUrl = await fetchCoverForBook(book);
      return { ...book, coverUrl } as Book;
    })).then(setCurated);
  }, [hydrate]);

  const toggleSearch = () => {
    const open = !searchOpen;
    setSearchOpen(open);
    searchH.value = withTiming(open ? 52 : 0, { duration: 220 });
    if (!open) { setQuery(''); setSearchResults([]); }
  };

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!text.trim()) { setSearchResults([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await searchGoogleBooks(text);
        setSearchResults(results);
      } catch {
        setSearchResults([]);
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
      : curated;

  const renderEmpty = () => {
    if (showingSearch && searching) {
      return (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60 }}>
          <ActivityIndicator color="#6B6B6B" />
        </View>
      );
    }
    if (showingSearch) {
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
            A gentleman's library is the mirror of his mind. Discover a book and save it here.
          </Text>
        </View>
      );
    }
    return null;
  };

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

      {/* Animated search bar */}
      <Animated.View style={[searchStyle, { paddingHorizontal: 20 }]}>
        <View style={{ backgroundColor: '#F5F5F5', borderRadius: 12, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, height: 44 }}>
          <Search size={14} color="#6B6B6B" strokeWidth={1.5} />
          <TextInput
            value={query}
            onChangeText={handleQueryChange}
            placeholder="Search any book…"
            placeholderTextColor="#ABABAB"
            style={{ flex: 1, marginLeft: 8, fontFamily: 'PlayfairDisplay_400Regular', fontSize: 14, color: '#0A0A0A' }}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searching && <ActivityIndicator size="small" color="#6B6B6B" />}
        </View>
      </Animated.View>

      {/* Tab row */}
      {!showingSearch && (
        <View style={{ flexDirection: 'row', paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4, gap: 24 }}>
          {(['library', 'discover'] as const).map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{ paddingBottom: 8, borderBottomWidth: 1.5, borderBottomColor: activeTab === tab ? '#0A0A0A' : 'transparent' }}
            >
              <Text style={{
                fontFamily: activeTab === tab ? 'PlayfairDisplay_700Bold' : 'PlayfairDisplay_400Regular',
                fontSize: 13,
                color: activeTab === tab ? '#0A0A0A' : '#6B6B6B',
                textTransform: 'capitalize',
                letterSpacing: 0.3,
              }}>
                {tab === 'library' ? 'My Library' : 'Discover'}
              </Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Grid */}
      <FlatList
        data={displayData}
        keyExtractor={(item) => item.id}
        numColumns={2}
        key="grid"
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: CARD_H_PAD,
          paddingTop: 12,
          paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom,
          gap: CARD_GAP,
          flexGrow: 1,
        }}
        columnWrapperStyle={{ gap: CARD_GAP }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={renderEmpty}
        renderItem={({ item }) => <BookCard book={item} inLibrary={isInLibrary(item.id)} />}
      />
    </SafeAreaView>
  );
}
