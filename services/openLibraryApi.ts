// services/openLibraryApi.ts
// Open Library API client extracted from app/(home)/(tabs)/books.tsx.
import { Book } from '@/types/book';

// ─── Curated fallback (shown while trending loads) ────────────────────────────
export const CURATED_FALLBACK: Book[] = [
  { id: 'OL45804W',   title: 'Meditations',                  author: 'Marcus Aurelius',     genre: 'Philosophy',  pageCount: 254,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg' },
  { id: 'OL66768W',   title: 'The Old Man and the Sea',       author: 'Ernest Hemingway',    genre: 'Literature',  pageCount: 127,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780684801223-L.jpg' },
  { id: 'OL18098W',   title: "Man's Search for Meaning",      author: 'Viktor Frankl',       genre: 'Psychology',  pageCount: 165,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780807014271-L.jpg' },
  { id: 'OL468431W',  title: 'The Great Gatsby',              author: 'F. Scott Fitzgerald', genre: 'Fiction',     pageCount: 180,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg' },
  { id: 'OL15404W',   title: 'Letters from a Stoic',          author: 'Seneca',              genre: 'Philosophy',  pageCount: 256,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140442106-L.jpg' },
  { id: 'OL49236W',   title: 'The Picture of Dorian Gray',    author: 'Oscar Wilde',         genre: 'Fiction',     pageCount: 254,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439570-L.jpg' },
  { id: 'OL8098828W', title: 'Crime and Punishment',          author: 'Fyodor Dostoevsky',   genre: 'Fiction',     pageCount: 671,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449136-L.jpg' },
  { id: 'OL57553W',   title: 'Thus Spoke Zarathustra',        author: 'Friedrich Nietzsche', genre: 'Philosophy',  pageCount: 336,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140441185-L.jpg' },
  { id: 'OL71490W',   title: 'Walden',                        author: 'Henry David Thoreau', genre: 'Essays',      pageCount: 224,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9780451531445-L.jpg' },
  { id: 'OL35233W',   title: 'The Count of Monte Cristo',     author: 'Alexandre Dumas',     genre: 'Fiction',     pageCount: 1276, coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140449266-L.jpg' },
  { id: 'OL15403W',   title: 'On the Shortness of Life',      author: 'Seneca',              genre: 'Philosophy',  pageCount: 97,   coverUrl: 'https://covers.openlibrary.org/b/isbn/9780143036326-L.jpg' },
  { id: 'OL22025W',   title: 'The Art of War',                author: 'Sun Tzu',             genre: 'Strategy',    pageCount: 112,  coverUrl: 'https://covers.openlibrary.org/b/isbn/9781590302255-L.jpg' },
];

// ─── Interest → search query map ─────────────────────────────────────────────
export const INTEREST_QUERIES: Record<string, string> = {
  'Exercise':         'fitness health high performance athlete',
  'Literature':       'classic literature fiction masterpiece timeless',
  'Stoicism':         'stoicism philosophy ancient wisdom marcus aurelius',
  'Journaling':       'journaling self reflection introspection writing',
  'Travel & Culture': 'travel culture world discovery civilization',
  'Music':            'music history culture theory composition',
  'Theatre & Cinema': 'cinema film arts theatre screenplay',
  'Morning Rituals':  'morning routine discipline habits excellence',
};

// ─── API types ────────────────────────────────────────────────────────────────
export type OLWork = {
  key?: string;
  title: string;
  author_name?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
  subject?: string[];
};

type OLSearchResponse = {
  numFound: number;
  start: number;
  docs: OLWork[];
};

function olWorkToBook(w: OLWork): Book {
  return {
    id: w.key!.replace('/works/', ''),
    title: w.title,
    author: w.author_name?.[0] ?? 'Unknown',
    coverUrl: `https://covers.openlibrary.org/b/id/${w.cover_i}-L.jpg`,
    pageCount: w.number_of_pages_median,
    genre: w.subject?.[0],
  };
}

export async function fetchTrendingBooks(): Promise<Book[]> {
  const res = await fetch(
    'https://openlibrary.org/trending/yearly.json?limit=24',
    { signal: AbortSignal.timeout(8000) },
  );
  if (!res.ok) throw new Error(`OL ${res.status}`);
  const data = await res.json();
  const works: OLWork[] = data.works ?? [];
  return works.filter((w) => w.cover_i && w.key).map(olWorkToBook);
}

export async function searchOpenLibrary(
  query: string,
  offset: number = 0,
  signal?: AbortSignal,
): Promise<{ books: Book[]; total: number }> {
  const res = await fetch(
    `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=20&offset=${offset}`,
    { signal: signal ?? AbortSignal.timeout(8000) },
  );
  if (!res.ok) throw new Error(`OL ${res.status}`);
  const data: OLSearchResponse = await res.json();
  const books = (data.docs ?? [])
    .filter((d) => d.cover_i && d.title && d.key)
    .map(olWorkToBook);
  return { books, total: data.numFound ?? 0 };
}

export async function fetchForYouBooks(interests: string[]): Promise<Book[]> {
  const queries = interests.slice(0, 4).map((i) => INTEREST_QUERIES[i]).filter(Boolean);
  const results = await Promise.allSettled(queries.map((q) => searchOpenLibrary(q)));
  const seen = new Set<string>();
  const books: Book[] = [];
  for (const result of results) {
    if (result.status === 'fulfilled') {
      for (const book of result.value.books.slice(0, 5)) {
        if (!seen.has(book.id) && book.coverUrl) {
          seen.add(book.id);
          books.push(book);
        }
      }
    }
  }
  return books;
}
