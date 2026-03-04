// constants/gutenbergMap.ts
// Maps Open Library work IDs to Project Gutenberg plain-text CDN URLs.
// Only public-domain titles are listed here.
// OL66768W (Hemingway — The Old Man and the Sea) and OL18098W (Frankl — Man's Search for Meaning)
// are intentionally absent as they are not in the public domain.

export const GUTENBERG_TEXT_MAP: Record<string, string> = {
  OL45804W:   'https://www.gutenberg.org/cache/epub/2680/pg2680.txt',   // Meditations — Marcus Aurelius
  OL71490W:   'https://www.gutenberg.org/cache/epub/205/pg205.txt',     // Walden — Henry David Thoreau
  OL22025W:   'https://www.gutenberg.org/cache/epub/132/pg132.txt',     // The Art of War — Sun Tzu
  OL57553W:   'https://www.gutenberg.org/cache/epub/1998/pg1998.txt',   // Thus Spoke Zarathustra — Nietzsche
  OL49236W:   'https://www.gutenberg.org/cache/epub/174/pg174.txt',     // The Picture of Dorian Gray — Wilde
  OL8098828W: 'https://www.gutenberg.org/cache/epub/2554/pg2554.txt',   // Crime and Punishment — Dostoevsky
  OL15404W:   'https://www.gutenberg.org/cache/epub/10661/pg10661.txt', // Letters from a Stoic — Seneca
  OL15403W:   'https://www.gutenberg.org/cache/epub/10661/pg10661.txt', // On the Shortness of Life — Seneca (bundled)
  OL35233W:   'https://www.gutenberg.org/cache/epub/1184/pg1184.txt',   // The Count of Monte Cristo — Dumas
  OL468431W:  'https://www.gutenberg.org/cache/epub/64317/pg64317.txt', // The Great Gatsby — Fitzgerald
};
