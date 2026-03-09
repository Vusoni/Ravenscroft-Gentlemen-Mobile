export type ClippingType = 'highlight' | 'note' | 'bookmark';

export interface KindleClipping {
  id: string;
  bookTitle: string;
  author: string;
  type: ClippingType;
  text: string;
  locationStart: number;
  locationEnd?: number;
  addedAt: string;
}

export interface KindleBook {
  kindleKey: string;
  rawTitle: string;
  rawAuthor: string;
  matchedBookId?: string;
  highlightCount: number;
  noteCount: number;
}

export interface ImportRecord {
  id: string;
  importedAt: string;
  fileHash: string;
  clippingsAdded: number;
  booksFound: number;
}
