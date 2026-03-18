// app/(home)/(tabs)/journal.tsx — Journaling tab
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { DayCircle } from '@/components/journal/DayCircle';
import { EntryCard } from '@/components/journal/EntryCard';
import { FilterCategory, useJournalFiltering } from '@/hooks/useJournalFiltering';
import { useJournalStore } from '@/store/journalStore';
import { JournalEntry } from '@/types/journal';
import { formatDate, getGreeting, isSameDay } from '@/utils/dateHelpers';
import { router } from 'expo-router';
import { NotebookPen, Plus, Search } from 'lucide-react-native';
import { useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const FILTER_TABS: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'reflection', label: 'Reflection' },
  { key: 'gratitude', label: 'Gratitude' },
  { key: 'lessons', label: 'Lessons' },
  { key: 'goals', label: 'Goals' },
  { key: 'ideas', label: 'Ideas' },
];

type SectionHeader = { kind: 'section-header'; label: string };
type EntryItem = { kind: 'entry'; entry: JournalEntry; listIndex: number };
type ListItem = SectionHeader | EntryItem;

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function JournalTab() {
  const insets = useSafeAreaInsets();
  const { hydrate, entries } = useJournalStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, []);

  const { weekDates, filteredEntries, recentEntries, isToday, showRecent } = useJournalFiltering({
    entries,
    selectedDate,
    activeFilter,
    searchQuery,
  });

  const listData = useMemo<ListItem[]>(() => {
    const items: ListItem[] = [];
    if (filteredEntries.length > 0) {
      const label = isToday ? 'Today' : formatDate(selectedDate).split(',')[0];
      items.push({ kind: 'section-header', label });
      filteredEntries.forEach((entry, i) => items.push({ kind: 'entry', entry, listIndex: i }));
    }
    if (showRecent && recentEntries.length > 0) {
      items.push({ kind: 'section-header', label: 'Recent Entries' });
      recentEntries.forEach((entry, i) =>
        items.push({ kind: 'entry', entry, listIndex: filteredEntries.length + i }),
      );
    }
    return items;
  }, [filteredEntries, recentEntries, showRecent, isToday, selectedDate]);

  const fabScale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({ transform: [{ scale: fabScale.value }] }));

  const ListHeader = (
    <>
      {/* ── Greeting ─────────────────────────────── */}
      <Animated.View entering={FadeIn.duration(500)} style={styles.greetingWrap}>
        <Text style={styles.greetingText}>{getGreeting()}</Text>
        <Text style={styles.greetingDate}>{formatDate(selectedDate)}</Text>
      </Animated.View>

      {/* ── Week calendar strip ──────────────────── */}
      <View style={styles.calendarStrip}>
        {weekDates.map((date, i) => {
          const isSelected = isSameDay(date.toISOString(), selectedDate.toISOString());
          const isTodayDate = isSameDay(date.toISOString(), new Date().toISOString());
          return (
            <DayCircle
              key={i}
              date={date}
              dayIndex={i}
              isSelected={isSelected}
              isToday={isTodayDate}
              onPress={() => setSelectedDate(new Date(date))}
            />
          );
        })}
      </View>

      {/* ── Search bar ───────────────────────────── */}
      <Pressable onPress={() => setSearchOpen(true)} style={styles.searchBarWrap}>
        <View style={styles.searchBar}>
          <Search size={16} color="#ABABAB" strokeWidth={1.5} />
          {searchOpen ? (
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search entries"
              placeholderTextColor="#ABABAB"
              autoFocus
              style={styles.searchInput}
              onBlur={() => { if (!searchQuery.trim()) setSearchOpen(false); }}
            />
          ) : (
            <Text style={styles.searchPlaceholder}>Search entries</Text>
          )}
        </View>
      </Pressable>

      {/* ── Category filter chips ────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterChips}
      >
        {FILTER_TABS.map((tab) => (
          <Pressable
            key={tab.key}
            onPress={() => setActiveFilter(tab.key)}
            style={[styles.filterChip, activeFilter === tab.key && styles.filterChipActive]}
          >
            <Text style={[styles.filterChipText, activeFilter === tab.key && styles.filterChipTextActive]}>
              {tab.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </>
  );

  const ListEmpty = (
    <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.emptyState}>
      <NotebookPen size={36} color="#D4D4D4" strokeWidth={1} />
      <Text style={styles.emptyTitle}>Begin Your Journal</Text>
      <Text style={styles.emptySubtitle}>A gentleman reflects. Start your first entry.</Text>
    </Animated.View>
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEDED' }} edges={['top']}>
      <FlatList
        data={listData}
        keyExtractor={(item) =>
          item.kind === 'section-header' ? `hdr-${item.label}` : item.entry.id
        }
        renderItem={({ item }) => {
          if (item.kind === 'section-header') {
            return (
              <View style={styles.sectionHeaderWrap}>
                <Text style={styles.sectionTitle}>{item.label}</Text>
              </View>
            );
          }
          return (
            <View style={styles.entryWrap}>
              <EntryCard entry={item.entry} index={item.listIndex} />
            </View>
          );
        }}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom + 24,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      />

      {/* ── FAB ────────────────────────────────────── */}
      <AnimatedPressable
        style={[styles.fab, fabStyle, { bottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom + 16 }]}
        onPressIn={() => { fabScale.value = withSpring(0.88, { damping: 14 }); }}
        onPressOut={() => { fabScale.value = withSpring(1, { damping: 14 }); }}
        onPress={() => router.push('/(home)/journal-entry')}
        accessibilityLabel="New journal entry"
      >
        <Plus size={24} color="#EDEDED" strokeWidth={2} />
      </AnimatedPressable>
    </SafeAreaView>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  // Greeting
  greetingWrap: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  greetingText: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: '#0A0A0A' },
  greetingDate: { fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#6B6B6B', marginTop: 2 },

  // Calendar strip
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },

  // Search
  searchBarWrap: { paddingHorizontal: 20, marginBottom: 12 },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#0A0A0A',
    padding: 0,
  },
  searchPlaceholder: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 14, color: '#ABABAB' },

  // Filter chips
  filterChips: { paddingHorizontal: 16, gap: 8, marginBottom: 20 },
  filterChip: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  filterChipActive: { backgroundColor: '#0A0A0A', borderColor: '#0A0A0A' },
  filterChipText: { fontFamily: 'PlayfairDisplay_400Regular', fontSize: 12, color: '#6B6B6B' },
  filterChipTextActive: { fontFamily: 'PlayfairDisplay_700Bold', color: '#EDEDED' },

  // List items
  sectionHeaderWrap: { paddingHorizontal: 20, marginBottom: 12, marginTop: 8 },
  sectionTitle: { fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#6B6B6B' },
  entryWrap: { paddingHorizontal: 20 },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: { fontFamily: 'PlayfairDisplay_700Bold', fontSize: 20, color: '#0A0A0A', marginTop: 16, marginBottom: 6 },
  emptySubtitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 20,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#0A0A0A',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0A0A0A',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10,
  },
});
