import type { MiddlewareHandler } from 'hono';
import { env } from '../config/env.js';

const allowedOrigins = env.ALLOWED_ORIGINS.split(',').map((o) => o.trim());

export const corsMiddleware: MiddlewareHandler = async (c, next) => {
  const origin = c.req.header('origin') ?? '';

  if (allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
    c.header('Access-Control-Allow-Origin', origin);
    c.header('Access-Control-Allow-Methods', 'GET, OPTIONS');
    c.header('Access-Control-Allow-Headers', 'Content-Type');
  }

  if (c.req.method === 'OPTIONS') {
    return new Response(null, { status: 204 });
  }

  await next();
};
