import crypto from 'node:crypto';
import { env } from '../../config/env.js';
import { passesKeywordFilter } from '../../filters/keywordFilter.js';
import type { ApiCategory, Article } from '../../models/article.js';

const BASE_URL = 'https://gnews.io/api/v4';

interface GNewsSource {
  name: string;
}

interface GNewsArticle {
  title: string;
  description: string;
  url: string;
  image: string | null;
  publishedAt: string;
  source: GNewsSource;
}

interface GNewsResponse {
  articles: GNewsArticle[];
  errors?: string[];
}

const QUERIES: Array<{ q: string; category: ApiCategory }> = [
  { q: 'entrepreneur business leadership', category: 'business' },
  { q: 'wealth finance investing assets', category: 'wealth' },
  { q: 'mindset discipline philosophy habits', category: 'mindset' },
  { q: 'strategy growth startup innovation', category: 'strategy' },
];

async function fetchQuery(q: string, category: ApiCategory): Promise<Article[]> {
  const params = new URLSearchParams({
    q,
    lang: 'en',
    max: '10',
    apikey: env.GNEWS_KEY,
  });

  const res = await fetch(`${BASE_URL}/search?${params}`, {
    signal: AbortSignal.timeout(8_000),
  });

  if (!res.ok) {
    throw new Error(`GNews HTTP ${res.status} for query "${q}"`);
  }

  const json: GNewsResponse = await res.json();

  return json.articles
    .filter((a) => passesKeywordFilter(a.title, a.description))
    .map((a) => ({
      id: crypto.createHash('md5').update(a.url).digest('hex'),
      title: a.title,
      summary: a.description,
      source: a.source.name,
      url: a.url,
      imageUrl: a.image,
      publishedAt: a.publishedAt,
      category,
    }));
}

export async function fetchFromGNews(): Promise<Article[]> {
  const results = await Promise.allSettled(QUERIES.map(({ q, category }) => fetchQuery(q, category)));

  return results
    .filter((r): r is PromiseFulfilledResult<Article[]> => r.status === 'fulfilled')
    .flatMap((r) => r.value);
}
