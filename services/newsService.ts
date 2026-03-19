import type { FeedArticle, FeedCategory } from '@/types/news';

const BASE_URL = process.env.EXPO_PUBLIC_NEWS_API_BASE_URL ?? 'http://localhost:4242';

interface ApiArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  category: 'business' | 'mindset' | 'wealth' | 'strategy';
}

interface ApiResponse {
  articles: ApiArticle[];
  count: number;
  fetchedAt: string;
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function estimateReadTime(text: string): string {
  const words = text.split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / 200));
  return `${minutes} min`;
}

const CATEGORY_DISPLAY: Record<ApiArticle['category'], FeedCategory> = {
  business: 'Business',
  mindset: 'Mindset',
  wealth: 'Wealth',
  strategy: 'Strategy',
};

function mapApiArticle(a: ApiArticle): FeedArticle {
  return {
    id: a.id,
    title: a.title,
    excerpt: a.summary,
    category: CATEGORY_DISPLAY[a.category],
    date: formatDate(a.publishedAt),
    readTime: estimateReadTime(a.summary),
    imageUrl: a.imageUrl,
    url: a.url,
    source: 'live',
  };
}

export async function fetchLiveArticles(category?: string): Promise<FeedArticle[]> {
  try {
    const params =
      category && category !== 'All' ? `?category=${category.toLowerCase()}` : '';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10_000);

    const response = await fetch(`${BASE_URL}/api/articles${params}`, {
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    }).finally(() => clearTimeout(timeoutId));

    if (!response.ok) {
      console.warn(`[newsService] HTTP ${response.status}`);
      return [];
    }

    const json: ApiResponse = await response.json();
    return json.articles.map(mapApiArticle);
  } catch (err) {
    console.warn('[newsService] Fetch failed:', err);
    return [];
  }
}
