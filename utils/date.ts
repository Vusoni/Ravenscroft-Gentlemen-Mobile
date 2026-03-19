export function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

/** Formats a Date as e.g. "Monday, 19 March 2026" */
export function formatEntryDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/** Formats an ISO string as e.g. "9:04 am" */
export function formatEntryTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/** Compares two ISO strings by date portion only (YYYY-MM-DD). */
export function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

/**
 * Returns the 7-day week array for the week containing `anchor`.
 * Week starts on Sunday (index 0).
 */
export function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay();
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}
