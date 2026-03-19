import { z } from 'zod';

const schema = z.object({
  PORT: z.string().default('4242').transform(Number),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEWSAPI_KEY: z.string().min(1, 'NEWSAPI_KEY is required'),
  GNEWS_KEY: z.string().min(1, 'GNEWS_KEY is required'),
  APIFY_ENABLED: z
    .string()
    .default('false')
    .transform((v) => v === 'true'),
  APIFY_TOKEN: z.string().optional(),
  APIFY_ACTOR_ID: z.string().default('apify/web-scraper'),
  CACHE_TTL_MINUTES: z.string().default('30').transform(Number),
  ALLOWED_ORIGINS: z.string().default('http://localhost:8081'),
});

export const env = schema.parse(process.env);
