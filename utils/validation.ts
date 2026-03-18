// utils/validation.ts
// Shared input validation utilities used across auth screens.

/**
 * Sanitizes an email address by stripping invisible Unicode whitespace,
 * replacing commas (iOS keyboard autocorrect artefact), and lowercasing.
 * Must be applied before any Supabase/Clerk auth call.
 */
export function sanitizeEmail(raw: string): string {
  return raw
    .replace(/[\s\u00a0\u200b\u200c\u200d\ufeff]+/g, '')
    .replace(/,/g, '.')
    .toLowerCase();
}

/** Basic email format regex — use after sanitizeEmail. */
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
