import * as Crypto from 'expo-crypto';
import type { KindleClipping, ClippingType } from '@/types/kindle';

const SEPARATOR = '==========';
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

// Title (Author)
const TITLE_AUTHOR_RE = /^(.+)\s+\(([^)]+)\)\s*$/;
// - Your Highlight on [page N | ]Location N[-N] | Added on <date>
const METADATA_RE =
  /- Your (Highlight|Note|Bookmark) on (?:page \d+ \| )?Location (\d+)(?:-(\d+))? \| Added on (.+)$/i;

export function validateClippingsFile(content: string): {
  valid: boolean;
  error?: string;
} {
  if (!content || content.length === 0) {
    return { valid: false, error: 'File is empty.' };
  }
  if (content.length > MAX_FILE_SIZE) {
    return { valid: false, error: 'File exceeds 10 MB limit.' };
  }
  if (!content.includes(SEPARATOR)) {
    return { valid: false, error: 'Not a valid MyClippings.txt file.' };
  }
  return { valid: true };
}

export async function clippingHash(
  bookTitle: string,
  locationStart: number,
  text: string,
): Promise<string> {
  const input = `${bookTitle}|${locationStart}|${text}`;
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    input,
  );
}

export async function fileHash(content: string): Promise<string> {
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    content,
  );
}

export function normalizeKindleKey(title: string, author: string): string {
  return `${title.toLowerCase().trim()}::${author.toLowerCase().trim()}`;
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[:–—]\s*.+$/, '') // strip subtitles after : – —
    .replace(/\s*-\s+.+$/, '') // strip subtitles after " - "
    .replace(/^(the|a|an)\s+/i, '') // strip leading articles
    .replace(/[^\w\s]/g, '') // remove punctuation
    .replace(/\s+/g, ' ') // collapse whitespace
    .trim();
}

function parseDate(dateStr: string): string {
  const d = new Date(dateStr.trim());
  return isNaN(d.getTime()) ? new Date().toISOString() : d.toISOString();
}

function parseClippingType(raw: string): ClippingType {
  const lower = raw.toLowerCase();
  if (lower === 'note') return 'note';
  if (lower === 'bookmark') return 'bookmark';
  return 'highlight';
}

export async function parseMyClippings(
  content: string,
): Promise<KindleClipping[]> {
  const blocks = content.split(SEPARATOR);
  const clippings: KindleClipping[] = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    const lines = trimmed.split('\n').map((l) => l.trim());
    if (lines.length < 2) continue;

    // Line 1: Title (Author)
    const titleMatch = lines[0].match(TITLE_AUTHOR_RE);
    if (!titleMatch) continue;
    const bookTitle = titleMatch[1].trim();
    const author = titleMatch[2].trim();

    // Line 2: Metadata
    const metaMatch = lines[1].match(METADATA_RE);
    if (!metaMatch) continue;

    const type = parseClippingType(metaMatch[1]);
    const locationStart = parseInt(metaMatch[2], 10);
    const locationEnd = metaMatch[3]
      ? parseInt(metaMatch[3], 10)
      : undefined;
    const addedAt = parseDate(metaMatch[4]);

    // Skip bookmarks (no text content)
    if (type === 'bookmark') continue;

    // Remaining lines: the clipping text
    const text = lines
      .slice(2)
      .filter((l) => l.length > 0)
      .join('\n')
      .trim();
    if (!text) continue;

    const id = await clippingHash(bookTitle, locationStart, text);

    clippings.push({
      id,
      bookTitle,
      author,
      type,
      text,
      locationStart,
      locationEnd,
      addedAt,
    });
  }

  return clippings;
}
