// utils/dateHelpers.ts
// Date/time formatting and calendar utilities extracted from journal.tsx.

/** Returns a time-appropriate greeting string. */
export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Formats a Date as "Monday, 18 March 2026". */
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Formats an ISO timestamp as "9:30 am". */
export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Returns true if two ISO date strings fall on the same calendar day.
 * Comparison is based on the YYYY-MM-DD prefix only.
 */
export function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

/** Returns a human-readable relative date string ("today", "yesterday", "3 days ago"). */
export function getRelativeDate(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return 'today';
  if (days === 1) return 'yesterday';
  if (days < 30) return `${days} days ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/**
 * Returns the 7-day week array (Sun–Sat) that contains the given anchor date.
 */
export function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay(); // 0 = Sunday
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
