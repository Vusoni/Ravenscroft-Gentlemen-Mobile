// app/(home)/(tabs)/journal.tsx — Journaling tab
import { GlassCard } from '@/components/GlassCard';
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { useJournalStore } from '@/store/journalStore';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  JournalCategory,
  JournalEntry,
  Mood,
} from '@/types/journal';
import { router } from 'expo-router';
import { CloudRain, Meh, NotebookPen, Plus, Search, Smile, Sun, Zap } from 'lucide-react-native';

type LucideIcon = typeof Sun;
const MOOD_ICON: Record<Mood, LucideIcon> = {
  great:     Sun,
  good:      Smile,
  neutral:   Meh,
  difficult: CloudRain,
  tough:     Zap,
};
import { useEffect, useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeIn,
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

function isSameDay(a: string, b: string): boolean {
  return a.slice(0, 10) === b.slice(0, 10);
}

function getWeekDates(anchor: Date): Date[] {
  const day = anchor.getDay(); // 0=Sun
  const start = new Date(anchor);
  start.setDate(anchor.getDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

const DAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

type FilterCategory = JournalCategory | 'all';
const FILTER_TABS: { key: FilterCategory; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'reflection', label: 'Reflection' },
  { key: 'gratitude', label: 'Gratitude' },
  { key: 'lessons', label: 'Lessons' },
  { key: 'goals', label: 'Goals' },
  { key: 'ideas', label: 'Ideas' },
];

// ─── Calendar day circle ─────────────────────────────────────────────────────
function DayCircle({
  date,
  dayIndex,
  isSelected,
  isToday,
  onPress,
}: {
  date: Date;
  dayIndex: number;
  isSelected: boolean;
  isToday: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.dayCol}>
      <Text style={[styles.dayLetter, isSelected && styles.dayLetterActive]}>
        {DAY_LETTERS[dayIndex]}
      </Text>
      <View
        style={[
          styles.dayCircle,
          isSelected && styles.dayCircleActive,
          !isSelected && isToday && styles.dayCircleToday,
        ]}
      >
        <Text style={[styles.dayNumber, isSelected && styles.dayNumberActive]}>
          {date.getDate()}
        </Text>
      </View>
    </Pressable>
  );
}

// ─── Entry card ──────────────────────────────────────────────────────────────
function EntryCard({ entry, index }: { entry: JournalEntry; index: number }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = () => {
    scale.value = withSpring(0.97, { damping: 15 });
  };
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15 });
  };

  return (
    <Animated.View entering={FadeInDown.delay(60 * index).duration(350)}>
      <AnimatedPressable
        style={animStyle}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={() =>
          router.push({ pathname: '/(home)/journal-detail', params: { entryId: entry.id } })
        }
      >
        <GlassCard style={styles.entryCard}>
          {/* Accent bar */}
          <View
            style={[
              styles.accentBar,
              { backgroundColor: CATEGORY_COLORS[entry.category] },
            ]}
          />

          <View style={styles.entryContent}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryTitle} numberOfLines={1}>
                {entry.title}
              </Text>
              {entry.mood && (() => {
                const Icon = MOOD_ICON[entry.mood];
                return <Icon size={15} color="#6B6B6B" strokeWidth={1.5} />;
              })()}
            </View>

            <Text style={styles.entryBody} numberOfLines={2}>
              {entry.body}
            </Text>

            <View style={styles.entryMeta}>
              <View
                style={[
                  styles.categoryBadge,
                  { backgroundColor: CATEGORY_COLORS[entry.category] + '18' },
                ]}
              >
                <Text
                  style={[
                    styles.categoryBadgeText,
                    { color: CATEGORY_COLORS[entry.category] },
                  ]}
                >
                  {CATEGORY_LABELS[entry.category]}
                </Text>
              </View>
              <Text style={styles.entryTime}>{formatTime(entry.createdAt)}</Text>
            </View>
          </View>
        </GlassCard>
      </AnimatedPressable>
    </Animated.View>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function JournalTab() {
  const insets = useSafeAreaInsets();
  const { hydrate, entries } = useJournalStore();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const todayISO = useMemo(() => new Date().toISOString(), []);
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  useEffect(() => {
    hydrate();
  }, []);

  // Filtered entries
  const filteredEntries = useMemo(() => {
    let result = entries;

    // Date filter
    const dateStr = selectedDate.toISOString();
    result = result.filter((e) => isSameDay(e.createdAt, dateStr));

    // Category filter
    if (activeFilter !== 'all') {
      result = result.filter((e) => e.category === activeFilter);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) || e.body.toLowerCase().includes(q),
      );
    }

    return result;
  }, [entries, selectedDate, activeFilter, searchQuery]);

  // Recent entries (not today, last 7 days)
  const recentEntries = useMemo(() => {
    return entries
      .filter((e) => !isSameDay(e.createdAt, todayISO))
      .slice(0, 10);
  }, [entries, todayISO]);

  const isToday = isSameDay(selectedDate.toISOString(), todayISO);
  const showRecent = isToday && activeFilter === 'all' && !searchQuery.trim();

  // FAB animation
  const fabScale = useSharedValue(1);
  const fabStyle = useAnimatedStyle(() => ({
    transform: [{ scale: fabScale.value }],
  }));

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEDED' }} edges={['top']}>
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{
          paddingBottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom + 24,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Greeting ─────────────────────────────── */}
        <Animated.View entering={FadeIn.duration(500)} style={styles.greetingWrap}>
          <Text style={styles.greetingText}>{getGreeting()}</Text>
          <Text style={styles.greetingDate}>{formatDate(selectedDate)}</Text>
        </Animated.View>

        {/* ── Week calendar strip ──────────────────── */}
        <View style={styles.calendarStrip}>
          {weekDates.map((date, i) => {
            const isSelected = isSameDay(
              date.toISOString(),
              selectedDate.toISOString(),
            );
            const isTodayDate = isSameDay(date.toISOString(), todayISO);
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
        <Pressable
          onPress={() => setSearchOpen(true)}
          style={styles.searchBarWrap}
        >
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
                onBlur={() => {
                  if (!searchQuery.trim()) setSearchOpen(false);
                }}
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
              style={[
                styles.filterChip,
                activeFilter === tab.key && styles.filterChipActive,
              ]}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === tab.key && styles.filterChipTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* ── Today's entries ──────────────────────── */}
        {filteredEntries.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {isToday ? 'Today' : formatDate(selectedDate).split(',')[0]}
            </Text>
            {filteredEntries.map((entry, i) => (
              <EntryCard key={entry.id} entry={entry} index={i} />
            ))}
          </View>
        ) : (
          <Animated.View entering={FadeIn.delay(200).duration(400)} style={styles.emptyState}>
            <NotebookPen size={36} color="#D4D4D4" strokeWidth={1} />
            <Text style={styles.emptyTitle}>Begin Your Journal</Text>
            <Text style={styles.emptySubtitle}>
              A gentleman reflects. Start your first entry.
            </Text>
          </Animated.View>
        )}

        {/* ── Recent entries (only on today + all filter) ── */}
        {showRecent && recentEntries.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Entries</Text>
            {recentEntries.map((entry, i) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                index={i + filteredEntries.length}
              />
            ))}
          </View>
        )}
      </ScrollView>

      {/* ── FAB ────────────────────────────────────── */}
      <AnimatedPressable
        style={[
          styles.fab,
          fabStyle,
          { bottom: TAB_BAR_BOTTOM_OFFSET + insets.bottom + 16 },
        ]}
        onPressIn={() => {
          fabScale.value = withSpring(0.88, { damping: 14 });
        }}
        onPressOut={() => {
          fabScale.value = withSpring(1, { damping: 14 });
        }}
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
  flex: { flex: 1 },

  // Greeting
  greetingWrap: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 4 },
  greetingText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 24,
    color: '#0A0A0A',
  },
  greetingDate: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 2,
  },

  // Calendar strip
  calendarStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  dayCol: { alignItems: 'center', gap: 6 },
  dayLetter: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    color: '#ABABAB',
  },
  dayLetterActive: { color: '#0A0A0A' },
  dayCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  dayCircleActive: { backgroundColor: '#0A0A0A' },
  dayCircleToday: {
    borderWidth: 1.5,
    borderColor: '#0A0A0A',
    backgroundColor: 'transparent',
  },
  dayNumber: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#1C1C1C',
  },
  dayNumberActive: { color: '#EDEDED' },

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
  searchPlaceholder: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#ABABAB',
  },

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
  filterChipActive: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
  },
  filterChipText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
  },
  filterChipTextActive: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#EDEDED',
  },

  // Sections
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionTitle: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#6B6B6B',
    marginBottom: 12,
  },

  // Entry card
  entryCard: {
    flexDirection: 'row',
    marginBottom: 10,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
    borderTopLeftRadius: 18,
    borderBottomLeftRadius: 18,
  },
  entryContent: {
    flex: 1,
    padding: 14,
    gap: 6,
  },
  entryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  entryTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: '#0A0A0A',
    flex: 1,
    marginRight: 8,
  },
  entryBody: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 13,
    color: '#6B6B6B',
    lineHeight: 19,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
  },
  categoryBadge: {
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  categoryBadgeText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 10,
    letterSpacing: 0.3,
  },
  entryTime: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 10,
    color: '#ABABAB',
  },

  // Empty state
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 20,
    color: '#0A0A0A',
    marginTop: 16,
    marginBottom: 6,
  },
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
