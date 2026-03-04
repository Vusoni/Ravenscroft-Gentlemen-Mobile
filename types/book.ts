export interface Book {
  id: string;           // Open Library work key (curated) or Google Books volume ID (search)
  title: string;
  author: string;
  coverUrl?: string;    // direct HTTPS image URL — set by whichever API sourced the book
  genre?: string;
  pageCount?: number;
  description?: string;
}

export interface NoteSet {
  insights: string[];
  reflection: string;
  questions: string[];
}

export interface UserNote {
  id: string;
  bookId: string;
  text: string;
  pageIndex?: number;
  createdAt: string; // ISO string
}
