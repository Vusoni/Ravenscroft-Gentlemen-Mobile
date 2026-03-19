export type ApiCategory = 'business' | 'mindset' | 'wealth' | 'strategy';

export interface Article {
  id: string;
  title: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string | null;
  publishedAt: string;
  category: ApiCategory;
}

export interface ScoredArticle extends Article {
  _score: number;
}
