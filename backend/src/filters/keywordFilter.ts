const INCLUDE_KEYWORDS = [
  'entrepreneur',
  'startup',
  'business',
  'wealth',
  'discipline',
  'finance',
  'leadership',
  'strategy',
  'invest',
  'stoic',
  'philosophy',
  'mindset',
  'self-improvement',
  'productivity',
  'success',
  'growth',
  'focus',
  'habits',
  'capital',
  'founder',
  'ceo',
  'executive',
  'revenue',
];

const EXCLUDE_KEYWORDS = [
  'celebrity',
  'gossip',
  'kardashian',
  'taylor swift',
  'nfl',
  'nba',
  'mlb',
  'soccer',
  'dating',
  'romance',
  'reality tv',
  'scandal',
  'entertainment',
  'box office',
  'movie trailer',
  'tv show',
];

function normalise(text: string): string {
  return text.toLowerCase();
}

export function passesKeywordFilter(title: string, description: string): boolean {
  const combined = normalise(`${title} ${description}`);

  for (const term of EXCLUDE_KEYWORDS) {
    if (combined.includes(term)) return false;
  }

  for (const term of INCLUDE_KEYWORDS) {
    if (combined.includes(term)) return true;
  }

  return false;
}
