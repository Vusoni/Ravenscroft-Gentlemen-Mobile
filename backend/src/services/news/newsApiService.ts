import crypto from 'node:crypto';
import { env } from '../../config/env.js';
import { passesKeywordFilter } from '../../filters/keywordFilter.js';
import type { ApiCategory, Article } from '../../models/article.js';

const BASE_URL = 'https://newsapi.org/v2';

const CATEGORY_MAP: Record<string, ApiCategory> = {
  business: 'business',
  general: 'mindset',
  science: 'mindset',
  technology: 'strategy',
  health: 'mindset',
};

interface NewsApiSource {
  name: string;
}

interface NewsApiArticle {
  title: string | null;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  source: NewsApiSource;
}

interface NewsApiResponse {
  status: string;
  articles: NewsApiArticle[];
  message?: string;
}

async function fetchCategory(category: string): Promise<Article[]> {
  const params = new URLSearchParams({
    category,
    language: 'en',
    pageSize: '40',
    apiKey: env.NEWSAPI_KEY,
  });

  const res = await fetch(`${BASE_URL}/top-headlines?${params}`, {
    headers: { 'User-Agent': 'Ravenscroft/1.0' },
    signal: AbortSignal.timeout(8_000),
  });

  if (!res.ok) {
    throw new Error(`NewsAPI HTTP ${res.status} for category "${category}"`);
  }

  const json: NewsApiResponse = await res.json();

  if (json.status !== 'ok') {
    throw new Error(`NewsAPI error: ${json.message ?? 'unknown'}`);
  }

  const apiCategory = CATEGORY_MAP[category] ?? 'business';

  return json.articles
    .filter((a) => a.title && a.description && a.url && !a.title.includes('[Removed]'))
    .filter((a) => passesKeywordFilter(a.title!, a.description!))
    .map((a) => ({
      id: crypto.createHash('md5').update(a.url).digest('hex'),
      title: a.title!,
      summary: a.description!,
      source: a.source.name,
      url: a.url,
      imageUrl: a.urlToImage,
      publishedAt: a.publishedAt,
      category: apiCategory,
    }));
}

export async function fetchFromNewsApi(): Promise<Article[]> {
  const results = await Promise.allSettled([
    fetchCategory('business'),
    fetchCategory('general'),
    fetchCategory('technology'),
  ]);

  return results
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);
}
