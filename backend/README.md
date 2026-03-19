# Ravenscroft News Backend

Lightweight Node.js/TypeScript service that fetches, filters, ranks, and serves curated news articles to the Ravenscroft mobile app.

## Stack

- **Hono** — TypeScript-first web framework
- **NewsAPI.org** — primary news source
- **GNews.io** — secondary/supplementary source
- **Apify** — optional web scraping (disabled by default)
- **In-memory cache** — 30-min TTL, no Redis required

## Getting Started

### 1. Install dependencies

```bash
cd backend
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your API keys:

| Variable | Source | Required |
|---|---|---|
| `NEWSAPI_KEY` | https://newsapi.org | Yes |
| `GNEWS_KEY` | https://gnews.io | Yes |
| `APIFY_TOKEN` | https://apify.com | No (set `APIFY_ENABLED=false`) |

### 3. Start the server

```bash
npm run dev    # development (tsx watch — hot reload)
npm start      # production (compiled JS)
```

Server starts on `http://localhost:4242` by default.

## API Endpoints

### `GET /health`
Returns server status and cache stats.

```json
{
  "status": "ok",
  "cachedArticles": 1,
  "uptime": 42,
  "timestamp": "2026-03-19T10:00:00.000Z"
}
```

### `GET /api/articles`
Returns up to 60 filtered, ranked articles.

**Query params:**
- `?category=business|mindset|wealth|strategy` — filter by category (optional)

**Response:**
```json
{
  "articles": [
    {
      "id": "a1b2c3d4...",
      "title": "Why Stoic Leaders Build Better Companies",
      "summary": "...",
      "source": "Forbes",
      "url": "https://...",
      "imageUrl": "https://...",
      "publishedAt": "2026-03-19T08:00:00.000Z",
      "category": "mindset"
    }
  ],
  "count": 42,
  "fetchedAt": "2026-03-19T10:00:00.000Z"
}
```

### `GET /api/articles/:id`
Returns a single article by ID (from cache only).

## Connecting from the Mobile App

Set `EXPO_PUBLIC_NEWS_API_BASE_URL` in the React Native project's `.env`:

```
# iOS Simulator / Android Emulator on Mac
EXPO_PUBLIC_NEWS_API_BASE_URL=http://localhost:4242

# Physical device (use your Mac's LAN IP — find it in System Settings → Wi-Fi → Details)
EXPO_PUBLIC_NEWS_API_BASE_URL=http://192.168.1.x:4242
```

> **Important for physical device testing:** The device cannot reach `localhost` — it resolves to the device itself. You must use your Mac's local network IP address (e.g. `192.168.1.42`). Find it in System Settings → Wi-Fi → Details → IP Address.

## API Key Notes

- **NewsAPI free tier**: 100 requests/day, development use only. Top-headlines endpoint only. Upgrade at https://newsapi.org/pricing for production.
- **GNews free tier**: 100 requests/day, max 10 articles per request. See https://gnews.io/pricing for paid plans.
- With the 30-min cache, a normal dev session consumes ~4–8 requests total.

## Apify Integration (Optional)

To enable web scraping of niche sources (Entrepreneur.com, HBR, etc.):

1. Set `APIFY_ENABLED=true` in `.env`
2. Add your `APIFY_TOKEN`
3. Optionally set `APIFY_ACTOR_ID` to a custom actor

With `APIFY_ENABLED=false` (default), zero overhead — the function returns immediately.

## Architecture

```
src/
  config/env.ts               — Zod-validated environment variables
  models/article.ts           — Article type definitions
  storage/cache.ts            — In-memory TTL cache (Map-based)
  filters/
    keywordFilter.ts          — Include/exclude keyword filtering
    qualityScorer.ts          — Recency + keyword density + source scoring
    deduplicator.ts           — URL + title Jaccard deduplication
  services/
    news/
      newsApiService.ts       — NewsAPI.org fetcher
      gNewsService.ts         — GNews.io fetcher
      newsAggregator.ts       — Pipeline orchestration
    scraping/
      apifyService.ts         — Optional Apify integration
  middleware/
    rateLimiter.ts            — Per-IP token bucket (60 req/min)
    cors.ts                   — CORS headers
  routes/
    articles.ts               — GET /api/articles
    health.ts                 — GET /health
  app.ts                      — Hono app + cache singleton
  server.ts                   — Entry point
```
