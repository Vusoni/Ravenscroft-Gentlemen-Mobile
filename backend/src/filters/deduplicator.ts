import type { Article } from '../models/article.js';

function tokenise(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .replace(/[^a-z0-9 ]/g, '')
      .split(/\s+/)
      .filter((w) => w.length > 3),
  );
}

function jaccardSimilarity(a: Set<string>, b: Set<string>): number {
  const intersection = [...a].filter((w) => b.has(w)).length;
  const union = new Set([...a, ...b]).size;
  return union === 0 ? 0 : intersection / union;
}

const TITLE_SIMILARITY_THRESHOLD = 0.72;

export function deduplicate(articles: Article[]): Article[] {
  const seenUrls = new Set<string>();
  const titleTokens: Array<Set<string>> = [];
  const result: Article[] = [];

  for (const article of articles) {
    const normalUrl = article.url.replace(/\/$/, '').toLowerCase();
    if (seenUrls.has(normalUrl)) continue;

    const tokens = tokenise(article.title);
    const isDuplicate = titleTokens.some(
      (other) => jaccardSimilarity(tokens, other) >= TITLE_SIMILARITY_THRESHOLD,
    );

    if (!isDuplicate) {
      seenUrls.add(normalUrl);
      titleTokens.push(tokens);
      result.push(article);
    }
  }

  return result;
}
