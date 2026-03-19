import { deduplicate } from '../../filters/deduplicator.js';
import { scoreArticle, sortByScore } from '../../filters/qualityScorer.js';
import type { Article } from '../../models/article.js';
import { fetchFromApify } from '../scraping/apifyService.js';
import { fetchFromGNews } from './gNewsService.js';
import { fetchFromNewsApi } from './newsApiService.js';

const MAX_ARTICLES = 60;

export async function aggregateArticles(): Promise<Article[]> {
  const raw: Article[] = [];

  // 1. Primary: NewsAPI
  try {
    const articles = await fetchFromNewsApi();
    console.log(`[Aggregator] NewsAPI: ${articles.length} articles`);
    raw.push(...articles);
  } catch (err) {
    console.error('[Aggregator] NewsAPI failed:', err);
  }

  // 2. Supplementary: GNews (always runs to add more coverage)
  try {
    const articles = await fetchFromGNews();
    console.log(`[Aggregator] GNews: ${articles.length} articles`);
    raw.push(...articles);
  } catch (err) {
    console.error('[Aggregator] GNews failed:', err);
  }

  // 3. Optional: Apify scraping layer
  const apifyArticles = await fetchFromApify();
  if (apifyArticles.length > 0) {
    console.log(`[Aggregator] Apify: ${apifyArticles.length} articles`);
    raw.push(...apifyArticles);
  }

  if (raw.length === 0) {
    throw new Error('All news sources failed — no articles available');
  }

  console.log(`[Aggregator] Raw total: ${raw.length} articles`);

  const deduped = deduplicate(raw);
  console.log(`[Aggregator] After dedup: ${deduped.length} articles`);

  const scored = deduped.map(scoreArticle);
  const sorted = sortByScore(scored);

  // Strip internal scoring field
  return sorted.slice(0, MAX_ARTICLES).map(({ _score: _s, ...article }) => article);
}
