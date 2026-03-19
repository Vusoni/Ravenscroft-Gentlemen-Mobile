import { env } from '../../config/env.js';
import type { Article } from '../../models/article.js';

export async function fetchFromApify(): Promise<Article[]> {
  if (!env.APIFY_ENABLED || !env.APIFY_TOKEN) {
    return [];
  }

  const url = `https://api.apify.com/v2/acts/${env.APIFY_ACTOR_ID}/run-sync-get-dataset-items`;

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${env.APIFY_TOKEN}`,
      },
      body: JSON.stringify({
        startUrls: [
          { url: 'https://www.entrepreneur.com/business-news' },
          { url: 'https://hbr.org/topics/leadership' },
        ],
        maxPagesPerCrawl: 5,
      }),
      signal: AbortSignal.timeout(30_000),
    });

    if (!res.ok) {
      console.warn(`[Apify] HTTP ${res.status} — skipping`);
      return [];
    }

    const items: Record<string, unknown>[] = await res.json();

    return items
      .filter((item) => typeof item['title'] === 'string' && typeof item['url'] === 'string')
      .map((item) => ({
        id: `apify-${String(item['url']).slice(-16)}`,
        title: String(item['title']),
        summary: String(item['description'] ?? item['text'] ?? ''),
        source: String(item['domain'] ?? 'web'),
        url: String(item['url']),
        imageUrl: typeof item['image'] === 'string' ? item['image'] : null,
        publishedAt: typeof item['date'] === 'string' ? item['date'] : new Date().toISOString(),
        category: 'business' as const,
      }));
  } catch (err) {
    console.warn('[Apify] Request failed — skipping:', err);
    return [];
  }
}
