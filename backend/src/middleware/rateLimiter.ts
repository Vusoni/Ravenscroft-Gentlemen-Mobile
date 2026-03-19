import type { MiddlewareHandler } from 'hono';

interface Bucket {
  count: number;
  resetAt: number;
}

const MAX_REQUESTS_PER_MINUTE = 60;
const buckets = new Map<string, Bucket>();

export const rateLimiter: MiddlewareHandler = async (c, next) => {
  const ip =
    c.req.header('x-forwarded-for') ?? c.req.header('x-real-ip') ?? 'unknown';
  const now = Date.now();
  const bucket = buckets.get(ip);

  if (!bucket || now > bucket.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + 60_000 });
  } else if (bucket.count >= MAX_REQUESTS_PER_MINUTE) {
    return c.json({ error: 'Rate limit exceeded' }, 429);
  } else {
    bucket.count++;
  }

  await next();
};
