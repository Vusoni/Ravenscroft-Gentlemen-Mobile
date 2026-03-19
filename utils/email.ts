/**
 * Strips invisible unicode, whitespace, and commas from an email string,
 * then lowercases. Required before any auth call.
 */
export function sanitizeEmail(raw: string): string {
  return raw
    .replace(/[\s\u00a0\u200b\u200c\u200d\ufeff]+/g, '')
    .replace(/,/g, '.')
    .toLowerCase();
}

/** Basic format check for email addresses. */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
}
