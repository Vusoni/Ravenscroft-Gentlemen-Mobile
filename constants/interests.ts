// constants/interests.ts
export const INTERESTS = [
  'Exercise',
  'Literature',
  'Stoicism',
  'Journaling',
  'Travel & Culture',
  'Music',
  'Theatre & Cinema',
  'Morning Rituals',
] as const;

export type Interest = (typeof INTERESTS)[number];
