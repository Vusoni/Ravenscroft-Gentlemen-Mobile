import { Hono } from 'hono';
import { env } from './config/env.js';
import { corsMiddleware } from './middleware/cors.js';
import { rateLimiter } from './middleware/rateLimiter.js';
import type { Article } from './models/article.js';
import { articlesRoute } from './routes/articles.js';
import { healthRoute } from './routes/health.js';
import { InMemoryCache } from './storage/cache.js';

export const articleCache = new InMemoryCache<Article[]>(env.CACHE_TTL_MINUTES * 60 * 1000);

const app = new Hono();

app.use('*', corsMiddleware);
app.use('/api/*', rateLimiter);

app.route('/health', healthRoute);
app.route('/api/articles', articlesRoute);

app.notFound((c) => c.json({ error: 'Not found' }, 404));

app.onError((err, c) => {
  console.error('[App] Unhandled error:', err);
  return c.json({ error: 'Internal server error' }, 500);
});

export default app;
