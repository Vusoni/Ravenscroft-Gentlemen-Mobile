import { Hono } from 'hono';
import { articleCache } from '../app.js';

export const healthRoute = new Hono();

healthRoute.get('/', (c) => {
  return c.json({
    status: 'ok',
    cachedArticles: articleCache.size(),
    uptime: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});
