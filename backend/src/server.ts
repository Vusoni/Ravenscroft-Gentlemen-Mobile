import { serve } from '@hono/node-server';
import app from './app.js';
import { env } from './config/env.js';

serve(
  { fetch: app.fetch, port: env.PORT },
  (info) => {
    console.log(`[Ravenscroft News] Server running on http://localhost:${info.port}`);
    console.log(`[Ravenscroft News] ENV: ${env.NODE_ENV}`);
    console.log(`[Ravenscroft News] Cache TTL: ${env.CACHE_TTL_MINUTES} min`);
    console.log(`[Ravenscroft News] Apify enabled: ${env.APIFY_ENABLED}`);
  },
);
