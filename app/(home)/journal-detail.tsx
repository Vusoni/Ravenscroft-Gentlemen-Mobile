// app/(home)/journal-detail.tsx — Read-only journal entry detail
import { useJournalStore } from '@/store/journalStore';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  MOOD_EMOJI,
} from '@/types/journal';
import { router, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Pen, Trash2 } from 'lucide-react-native';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

function formatFullDate(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  const time = d.toLocaleTimeString('en-GB', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
  return `${date} at ${time}`;
}

export default function JournalDetailScreen() {
  const { entryId } = useLocalSearchParams<{ entryId: string }>();
  const { entries, deleteEntry } = useJournalStore();

  const entry = entries.find((e) => e.id === entryId);

  if (!entry) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.nav}>
          <Pressable onPress={() => router.back()} hitSlop={12}>
            <ArrowLeft size={16} color="#6B6B6B" strokeWidth={1.5} />
          </Pressable>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>Entry not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleDelete = () => {
    Alert.alert('Delete Entry', 'Remove this journal entry permanently?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteEntry(entry.id);
          router.back();
        },
      },
    ]);
  };

  const handleEdit = () => {
    router.push({
      pathname: '/(home)/journal-entry',
      params: { entryId: entry.id },
    });
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      {/* ── Nav ──────────────────────────────────── */}
      <View style={styles.nav}>
        <Pressable
          onPress={() => router.back()}
          style={styles.navBack}
          hitSlop={12}
          accessibilityLabel="Back"
        >
          <ArrowLeft size={16} color="#6B6B6B" strokeWidth={1.5} />
        </Pressable>

        <View style={styles.navActions}>
          <Pressable onPress={handleEdit} hitSlop={12} accessibilityLabel="Edit">
            <Pen size={16} color="#6B6B6B" strokeWidth={1.5} />
          </Pressable>
          <Pressable
            onPress={handleDelete}
            hitSlop={12}
            accessibilityLabel="Delete"
          >
            <Trash2 size={16} color="#6B6B6B" strokeWidth={1.5} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ── Date + mood ────────────────────────── */}
        <View style={styles.dateRow}>
          <Text style={styles.dateText}>
            {formatFullDate(entry.createdAt)}
          </Text>
          {entry.mood && (
            <Text style={styles.moodEmoji}>{MOOD_EMOJI[entry.mood]}</Text>
          )}
        </View>

        {/* ── Category badge ─────────────────────── */}
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

        {/* ── Title ──────────────────────────────── */}
        <Text style={styles.title}>{entry.title}</Text>

        {/* ── Body ───────────────────────────────── */}
        {entry.body.split('\n').map((paragraph, i) => (
          <Text key={i} style={styles.body}>
            {paragraph}
          </Text>
        ))}

        {/* ── Updated indicator ───────────────────── */}
        {entry.updatedAt !== entry.createdAt && (
          <Text style={styles.updatedText}>
            Edited {formatFullDate(entry.updatedAt)}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDEDED' },
  flex: { flex: 1 },

  // Nav
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D4D4D4',
  },
  navBack: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
  },

  // Not found
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#6B6B6B',
  },

  scrollContent: { padding: 20, paddingBottom: 48 },

  // Date + mood
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  dateText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 13,
    color: '#6B6B6B',
    flex: 1,
  },
  moodEmoji: { fontSize: 20, marginLeft: 8 },

  // Category
  categoryBadge: {
    alignSelf: 'flex-start',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: 16,
  },
  categoryBadgeText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    letterSpacing: 0.3,
  },

  // Title
  title: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 26,
    color: '#0A0A0A',
    marginBottom: 20,
    lineHeight: 34,
  },

  // Body
  body: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    color: '#1C1C1C',
    lineHeight: 26,
    marginBottom: 12,
  },

  // Updated
  updatedText: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 11,
    color: '#ABABAB',
    marginTop: 20,
  },
});
