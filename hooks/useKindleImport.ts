// hooks/useKindleImport.ts
// Encapsulates the Kindle import state machine extracted from kindle-import.tsx.
import { fileHash, parseMyClippings, validateClippingsFile } from '@/lib/kindleParser';
import { matchKindleBooks } from '@/lib/kindleMatcher';
import { useBooksStore } from '@/store/booksStore';
import { useKindleStore } from '@/store/kindleStore';
import * as DocumentPicker from 'expo-document-picker';
import * as Haptics from 'expo-haptics';
import { useCallback, useState } from 'react';

export interface ImportResult {
  added: number;
  duplicates: number;
  booksFound: number;
}

export interface UseKindleImportReturn {
  importing: boolean;
  result: ImportResult | null;
  error: string | null;
  handleImport: () => Promise<void>;
  handleConfirmMatch: (kindleKey: string, bookId: string) => Promise<void>;
}

export function useKindleImport(): UseKindleImportReturn {
  const { importClippings, hasImportedFile, setBookMatch } = useKindleStore();
  const { library } = useBooksStore();

  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImport = useCallback(async () => {
    try {
      setError(null);
      setResult(null);

      const picked = await DocumentPicker.getDocumentAsync({
        type: 'text/plain',
        copyToCacheDirectory: true,
      });

      if (picked.canceled) return;

      const file = picked.assets[0];
      if (!file.uri) return;

      setImporting(true);
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      const response = await fetch(file.uri);
      const content = await response.text();

      const validation = validateClippingsFile(content);
      if (!validation.valid) {
        setError(validation.error ?? 'Invalid file.');
        setImporting(false);
        return;
      }

      const hash = await fileHash(content);
      if (hasImportedFile(hash)) {
        setError('This file has already been imported.');
        setImporting(false);
        return;
      }

      const parsed = await parseMyClippings(content);
      if (parsed.length === 0) {
        setError('No highlights or notes found in this file.');
        setImporting(false);
        return;
      }

      const importResult = await importClippings(parsed, hash);
      setResult(importResult);

      const currentBooks = useKindleStore.getState().books;
      const unmatchedBooks = currentBooks.filter((b) => !b.matchedBookId);
      if (unmatchedBooks.length > 0 && library.length > 0) {
        const matches = matchKindleBooks(unmatchedBooks, library);
        for (const match of matches) {
          if (match.matchedBookId) {
            await setBookMatch(match.kindleKey, match.matchedBookId);
          }
        }
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Import failed.';
      setError(msg);
    } finally {
      setImporting(false);
    }
  }, [importClippings, hasImportedFile, setBookMatch, library]);

  const handleConfirmMatch = useCallback(
    async (kindleKey: string, bookId: string) => {
      await setBookMatch(kindleKey, bookId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    [setBookMatch],
  );

  return { importing, result, error, handleImport, handleConfirmMatch };
}
