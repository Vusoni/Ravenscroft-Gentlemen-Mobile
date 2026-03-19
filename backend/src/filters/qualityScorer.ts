import type { Article, ScoredArticle } from '../models/article.js';

const SOURCE_SCORES: Record<string, number> = {
  Forbes: 28,
  'Harvard Business Review': 30,
  'Inc.': 25,
  'Fast Company': 24,
  Bloomberg: 26,
  'The Wall Street Journal': 27,
  Entrepreneur: 24,
  'Business Insider': 20,
  'Financial Times': 27,
  Reuters: 23,
  'The Economist': 28,
  Fortune: 25,
  'MIT Technology Review': 24,
};

const DENSITY_KEYWORDS = [
  'entrepreneur',
  'wealth',
  'discipline',
  'leadership',
  'strategy',
  'stoic',
  'mindset',
  'philosophy',
  'invest',
  'finance',
  'founder',
  'productivity',
  'success',
];

function recencyScore(publishedAt: string): number {
  const ageHours = (Date.now() - new Date(publishedAt).getTime()) / 3_600_000;
  // Linear decay: 40 pts at 0h → 0 pts at 48h
  return Math.max(0, 40 - (ageHours / 48) * 40);
}

function densityScore(title: string, summary: string): number {
  const combined = `${title} ${summary}`.toLowerCase();
  const hits = DENSITY_KEYWORDS.filter((kw) => combined.includes(kw)).length;
  return Math.min(30, hits * 3);
}

function sourceScore(sourceName: string): number {
  return SOURCE_SCORES[sourceName] ?? 10;
}

export function scoreArticle(article: Article): ScoredArticle {
  const score =
    recencyScore(article.publishedAt) +
    densityScore(article.title, article.summary) +
    sourceScore(article.source);
  return { ...article, _score: score };
}

export function sortByScore(articles: ScoredArticle[]): ScoredArticle[] {
  return [...articles].sort((a, b) => b._score - a._score);
}
