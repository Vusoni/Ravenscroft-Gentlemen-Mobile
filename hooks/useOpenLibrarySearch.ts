// hooks/useOpenLibrarySearch.ts
// Encapsulates all search/discover/forYou state for the books screen.
import {
  CURATED_FALLBACK,
  fetchForYouBooks,
  fetchTrendingBooks,
  searchOpenLibrary,
} from '@/services/openLibraryApi';
import { useBooksStore } from '@/store/booksStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import { Book } from '@/types/book';
import { useEffect, useMemo, useRef, useState } from 'react';

export type ActiveTab = 'library' | 'discover' | 'foryou';

export interface UseOpenLibrarySearchReturn {
  library: Book[];
  selectedInterests: string[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchOpen: boolean;
  toggleSearch: () => void;
  query: string;
  handleQueryChange: (text: string) => void;
  searching: boolean;
  searchError: boolean;
  searchResults: Book[];
  loadingMore: boolean;
  handleLoadMore: () => void;
  trendingBooks: Book[];
  trendingLoading: boolean;
  forYouBooks: Book[];
  forYouLoading: boolean;
  filteredLibrary: Book[];
  showingSearch: boolean;
  hasMore: boolean;
  displayData: Book[];
}

export function useOpenLibrarySearch(): UseOpenLibrarySearchReturn {
  const { library, hydrate } = useBooksStore();
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

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

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
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      abortRef.current?.abort();
    };
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
        const { books, total } = await searchOpenLibrary(text, 0, controller.signal);
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
      const { books, total } = await searchOpenLibrary(query, nextOffset, controller.signal);
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
  const displayData: Book[] = showingSearch
    ? (activeTab === 'library' ? filteredLibrary : searchResults)
    : activeTab === 'library'
      ? library
      : activeTab === 'foryou'
        ? forYouBooks
        : trendingBooks;

  return {
    library,
    selectedInterests,
    activeTab,
    setActiveTab,
    searchOpen,
    toggleSearch,
    query,
    handleQueryChange,
    searching,
    searchError,
    searchResults,
    loadingMore,
    handleLoadMore,
    trendingBooks,
    trendingLoading,
    forYouBooks,
    forYouLoading,
    filteredLibrary,
    showingSearch,
    hasMore,
    displayData,
  };
}
