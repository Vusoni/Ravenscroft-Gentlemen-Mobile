// hooks/useJournalFiltering.ts
// Derives filtered/recent entries and calendar data from journal state.
import { isSameDay, getWeekDates } from '@/utils/dateHelpers';
import { JournalCategory, JournalEntry } from '@/types/journal';
import { useMemo } from 'react';

export type FilterCategory = JournalCategory | 'all';

export interface UseJournalFilteringReturn {
  weekDates: Date[];
  filteredEntries: JournalEntry[];
  recentEntries: JournalEntry[];
  isToday: boolean;
  showRecent: boolean;
}

export function useJournalFiltering({
  entries,
  selectedDate,
  activeFilter,
  searchQuery,
}: {
  entries: JournalEntry[];
  selectedDate: Date;
  activeFilter: FilterCategory;
  searchQuery: string;
}): UseJournalFilteringReturn {
  const todayISO = useMemo(() => new Date().toISOString(), []);

  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const filteredEntries = useMemo(() => {
    let result = entries;

    const dateStr = selectedDate.toISOString();
    result = result.filter((e) => isSameDay(e.createdAt, dateStr));

    if (activeFilter !== 'all') {
      result = result.filter((e) => e.category === activeFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) => e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q),
      );
    }

    return result;
  }, [entries, selectedDate, activeFilter, searchQuery]);

  const recentEntries = useMemo(
    () => entries.filter((e) => !isSameDay(e.createdAt, todayISO)).slice(0, 10),
    [entries, todayISO],
  );

  const isToday = isSameDay(selectedDate.toISOString(), todayISO);
  const showRecent = isToday && activeFilter === 'all' && !searchQuery.trim();

  return { weekDates, filteredEntries, recentEntries, isToday, showRecent };
}
