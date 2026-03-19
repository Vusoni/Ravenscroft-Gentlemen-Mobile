import { Hono } from 'hono';
import { articleCache } from '../app.js';
import type { ApiCategory } from '../models/article.js';
import { aggregateArticles } from '../services/news/newsAggregator.js';

const VALID_CATEGORIES = new Set<ApiCategory>(['business', 'mindset', 'wealth', 'strategy']);
const CACHE_KEY = 'articles:all';

export const articlesRoute = new Hono();

articlesRoute.get('/', async (c) => {
  const categoryParam = c.req.query('category');

  try {
    let articles = articleCache.get(CACHE_KEY);

    if (!articles) {
      console.log('[Route] Cache miss — fetching from sources');
      articles = await aggregateArticles();
      articleCache.set(CACHE_KEY, articles);
    } else {
      console.log('[Route] Cache hit');
    }

    if (categoryParam && VALID_CATEGORIES.has(categoryParam as ApiCategory)) {
      articles = articles.filter((a) => a.category === categoryParam);
    }

    return c.json({
      articles,
      count: articles.length,
      fetchedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[Route] Failed to fetch articles:', err);
    return c.json({ error: 'Failed to fetch articles', articles: [], count: 0 }, 503);
  }
});

articlesRoute.get('/:id', async (c) => {
  const { id } = c.req.param();
  const articles = articleCache.get(CACHE_KEY) ?? [];
  const article = articles.find((a) => a.id === id);

  if (!article) {
    return c.json({ error: 'Article not found' }, 404);
  }

  return c.json(article);
});
