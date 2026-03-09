import type { Book } from '@/types/book';
import type { KindleBook } from '@/types/kindle';
import { normalizeTitle } from './kindleParser';

export type MatchConfidence = 'exact' | 'fuzzy' | 'none';

export interface MatchResult {
  kindleKey: string;
  matchedBookId: string | null;
  confidence: MatchConfidence;
  matchedBook?: Book;
}

function authorWords(author: string): string[] {
  return author
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 1);
}

function authorsOverlap(a: string, b: string): boolean {
  const wordsA = authorWords(a);
  const wordsB = authorWords(b);
  return wordsA.some((w) => wordsB.includes(w));
}

export function matchKindleBooks(
  kindleBooks: KindleBook[],
  library: Book[],
): MatchResult[] {
  return kindleBooks.map((kb) => {
    const kindleNorm = normalizeTitle(kb.rawTitle);
    let bestMatch: MatchResult = {
      kindleKey: kb.kindleKey,
      matchedBookId: null,
      confidence: 'none',
    };

    for (const book of library) {
      const libNorm = normalizeTitle(book.title);
      const authorMatch = authorsOverlap(kb.rawAuthor, book.author);

      // Exact: normalized titles equal + author overlap
      if (kindleNorm === libNorm && authorMatch) {
        bestMatch = {
          kindleKey: kb.kindleKey,
          matchedBookId: book.id,
          confidence: 'exact',
          matchedBook: book,
        };
        break; // exact match, no need to keep looking
      }

      // Fuzzy: one title contains the other + author overlap
      if (
        authorMatch &&
        (kindleNorm.includes(libNorm) || libNorm.includes(kindleNorm)) &&
        bestMatch.confidence === 'none'
      ) {
        bestMatch = {
          kindleKey: kb.kindleKey,
          matchedBookId: book.id,
          confidence: 'fuzzy',
          matchedBook: book,
        };
        // don't break — keep looking for an exact match
      }
    }

    return bestMatch;
  });
}
