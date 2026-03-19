import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { ARTICLES } from '@/constants/articles';
import { fetchLiveArticles } from '@/services/newsService';
import type { FeedArticle, FeedCategory } from '@/types/news';

const NEWS_CACHE_KEY = 'ravenscroft_news_cache';
const FETCH_INTERVAL_MS = 30 * 60 * 1000; // 30 min — matches backend TTL

function editorialToFeedArticle(a: (typeof ARTICLES)[number]): FeedArticle {
  return {
    id: a.id,
    title: a.title,
    excerpt: a.excerpt,
    category: a.category as FeedCategory,
    date: a.date,
    readTime: a.readTime,
    imageUrl: a.image,
    url: null,
    source: 'editorial',
  };
}

const FALLBACK_ARTICLES: FeedArticle[] = ARTICLES.map(editorialToFeedArticle);

interface NewsState {
  articles: FeedArticle[];
  isLoading: boolean;
  error: string | null;
  lastFetchedAt: string | null;
  hydrated: boolean;

  hydrate: () => Promise<void>;
  fetchAndStore: () => Promise<void>;
  clearCache: () => Promise<void>;
}

export const useNewsStore = create<NewsState>((set, get) => ({
  articles: FALLBACK_ARTICLES,
  isLoading: false,
  error: null,
  lastFetchedAt: null,
  hydrated: false,

  hydrate: async () => {
    if (get().hydrated) return;

    const raw = await AsyncStorage.getItem(NEWS_CACHE_KEY);
    if (raw) {
      const cached: { articles: FeedArticle[]; lastFetchedAt: string } = JSON.parse(raw);
      set({ articles: cached.articles, lastFetchedAt: cached.lastFetchedAt, hydrated: true });
    } else {
      set({ hydrated: true });
    }
  },

  fetchAndStore: async () => {
    const state = get();

    if (state.lastFetchedAt) {
      const age = Date.now() - new Date(state.lastFetchedAt).getTime();
      if (age < FETCH_INTERVAL_MS) return;
    }

    set({ isLoading: true, error: null });

    const liveArticles = await fetchLiveArticles();

    if (liveArticles.length > 0) {
      const lastFetchedAt = new Date().toISOString();
      set({ articles: liveArticles, isLoading: false, lastFetchedAt });
      await AsyncStorage.setItem(
        NEWS_CACHE_KEY,
        JSON.stringify({ articles: liveArticles, lastFetchedAt }),
      );
    } else {
      set({
        isLoading: false,
        error: 'Could not load latest articles. Showing editorial content.',
        articles: state.articles.length > 0 ? state.articles : FALLBACK_ARTICLES,
      });
    }
  },

  clearCache: async () => {
    await AsyncStorage.removeItem(NEWS_CACHE_KEY);
    set({ articles: FALLBACK_ARTICLES, lastFetchedAt: null, error: null });
  },
}));
