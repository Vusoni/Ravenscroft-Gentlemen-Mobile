export type FeedArticleSource = 'editorial' | 'live';

export type LiveCategory = 'Business' | 'Mindset' | 'Wealth' | 'Strategy';

export type EditorialCategory =
  | 'Stoicism'
  | 'Culture'
  | 'Philosophy'
  | 'Style'
  | 'Literature'
  | 'Travel'
  | 'Grooming'
  | 'Fitness'
  | 'Watches';

export type FeedCategory = EditorialCategory | LiveCategory;

export interface FeedArticle {
  id: string;
  title: string;
  excerpt: string;
  category: FeedCategory;
  date: string;
  readTime: string;
  imageUrl: string | null;
  url: string | null;
  source: FeedArticleSource;
}
