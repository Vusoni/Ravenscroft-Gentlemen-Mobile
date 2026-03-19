export type JournalCategory = 'reflection' | 'gratitude' | 'lessons' | 'goals' | 'ideas';

export type Mood = 'great' | 'good' | 'neutral' | 'difficult' | 'tough';

export const MOOD_LABEL: Record<Mood, string> = {
  great: 'Great',
  good: 'Good',
  neutral: 'Neutral',
  difficult: 'Difficult',
  tough: 'Tough',
};

export const CATEGORY_COLORS: Record<JournalCategory, string> = {
  reflection: '#6B6B6B',
  gratitude: '#4A7C59',
  lessons: '#8B6914',
  goals: '#2B4A8B',
  ideas: '#7B4A8B',
};

export const CATEGORY_LABELS: Record<JournalCategory, string> = {
  reflection: 'Reflection',
  gratitude: 'Gratitude',
  lessons: 'Lessons',
  goals: 'Goals',
  ideas: 'Ideas',
};

export interface JournalEntry {
  id: string;
  title: string;
  body: string;
  category: JournalCategory;
  mood?: Mood;
  createdAt: string;
  updatedAt: string;
}
