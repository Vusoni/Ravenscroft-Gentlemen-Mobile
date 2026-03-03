export interface Book {
  id: string;          // Open Library work key e.g. "OL45804W"
  title: string;
  author: string;
  coverId?: number;    // Open Library cover ID for image URL
  genre?: string;
  pageCount?: number;
  description?: string;
}

export interface NoteSet {
  insights: string[];
  reflection: string;
  questions: string[];
}
