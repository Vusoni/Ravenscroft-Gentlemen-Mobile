// app/(home)/journal-entry.tsx — Create / edit a journal entry
import { JOURNAL_PROMPTS } from '@/constants/journalPrompts';
import { useJournalStore } from '@/store/journalStore';
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  JournalCategory,
  JournalEntry,
  Mood,
  MOOD_LABEL,
} from '@/types/journal';
import { router, useLocalSearchParams } from 'expo-router';
import { CloudRain, Meh, Smile, Sun, X, Zap } from 'lucide-react-native';

type LucideIcon = typeof Sun;
const MOOD_ICON: Record<Mood, LucideIcon> = {
  great:     Sun,
  good:      Smile,
  neutral:   Meh,
  difficult: CloudRain,
  tough:     Zap,
};
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const CATEGORIES: JournalCategory[] = [
  'reflection',
  'gratitude',
  'lessons',
  'goals',
  'ideas',
];

const MOODS: Mood[] = ['great', 'good', 'neutral', 'difficult', 'tough'];

export default function JournalEntryScreen() {
  const params = useLocalSearchParams<{ entryId?: string }>();
  const isEditing = !!params.entryId;

  const { entries, addEntry, updateEntry } = useJournalStore();

  // Load existing entry if editing
  const existing: JournalEntry | undefined = useMemo(
    () => (isEditing ? entries.find((e) => e.id === params.entryId) : undefined),
    [params.entryId],
  );

  const [title, setTitle] = useState(existing?.title ?? '');
  const [body, setBody] = useState(existing?.body ?? '');
  const [category, setCategory] = useState<JournalCategory>(
    existing?.category ?? 'reflection',
  );
  const [mood, setMood] = useState<Mood | undefined>(existing?.mood);

  // Random prompt for current category
  const prompt = useMemo(() => {
    const prompts = JOURNAL_PROMPTS[category];
    return prompts[Math.floor(Math.random() * prompts.length)];
  }, [category]);

  const titleRef = useRef<TextInput>(null);
  const canSave = title.trim().length > 0;

  useEffect(() => {
    if (!isEditing) {
      // Small delay to avoid animation conflict
      setTimeout(() => titleRef.current?.focus(), 350);
    }
  }, []);

  const handleSave = async () => {
    if (!canSave) return;
    if (isEditing && params.entryId) {
      await updateEntry(params.entryId, {
        title: title.trim(),
        body: body.trim(),
        category,
        mood,
      });
    } else {
      await addEntry({
        title: title.trim(),
        body: body.trim(),
        category,
        mood,
      });
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {/* ── Top bar ──────────────────────────────── */}
        <View style={styles.topBar}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={12}
            accessibilityLabel="Cancel"
          >
            <X size={20} color="#6B6B6B" strokeWidth={1.5} />
          </Pressable>

          <Text style={styles.topBarTitle}>
            {isEditing ? 'Edit Entry' : 'New Entry'}
          </Text>

          <Pressable
            onPress={handleSave}
            disabled={!canSave}
            hitSlop={12}
            accessibilityLabel="Save"
          >
            <Text
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            >
              Save
            </Text>
          </Pressable>
        </View>

        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Mood picker ────────────────────────── */}
          <View style={styles.moodSection}>
            <Text style={styles.sectionLabel}>How are you feeling?</Text>
            <View style={styles.moodRow}>
              {MOODS.map((m) => {
                const Icon = MOOD_ICON[m];
                const active = mood === m;
                return (
                  <Pressable
                    key={m}
                    onPress={() => setMood(active ? undefined : m)}
                    style={[styles.moodPill, active && styles.moodPillActive]}
                  >
                    <Icon
                      size={14}
                      color={active ? '#EDEDED' : '#6B6B6B'}
                      strokeWidth={1.6}
                    />
                    <Text
                      style={[
                        styles.moodLabel,
                        active && styles.moodLabelActive,
                      ]}
                    >
                      {MOOD_LABEL[m]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          {/* ── Category picker ────────────────────── */}
          <View style={styles.categorySection}>
            <Text style={styles.sectionLabel}>Category</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoryRow}
            >
              {CATEGORIES.map((cat) => (
                <Pressable
                  key={cat}
                  onPress={() => setCategory(cat)}
                  style={[
                    styles.categoryChip,
                    category === cat && {
                      backgroundColor: CATEGORY_COLORS[cat],
                      borderColor: CATEGORY_COLORS[cat],
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.categoryChipText,
                      category === cat && styles.categoryChipTextActive,
                    ]}
                  >
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>

          {/* ── Guided prompt ──────────────────────── */}
          <Text style={styles.guidedPrompt}>{prompt}</Text>

          {/* ── Title ──────────────────────────────── */}
          <TextInput
            ref={titleRef}
            value={title}
            onChangeText={setTitle}
            placeholder="Entry title..."
            placeholderTextColor="#ABABAB"
            style={styles.titleInput}
            maxLength={120}
            returnKeyType="next"
          />

          {/* ── Body ───────────────────────────────── */}
          <TextInput
            value={body}
            onChangeText={setBody}
            placeholder="Write your thoughts..."
            placeholderTextColor="#ABABAB"
            style={styles.bodyInput}
            multiline
            textAlignVertical="top"
            scrollEnabled={false}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDEDED' },
  flex: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#D4D4D4',
  },
  topBarTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 16,
    color: '#0A0A0A',
  },
  saveBtn: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 15,
    color: '#0A0A0A',
  },
  saveBtnDisabled: { opacity: 0.3 },

  scrollContent: { padding: 20, paddingBottom: 60 },

  // Mood
  moodSection: { marginBottom: 20 },
  sectionLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 10,
    color: '#ABABAB',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  moodRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  moodPillActive: {
    backgroundColor: '#0A0A0A',
    borderColor: '#0A0A0A',
  },
  moodLabel: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
  },
  moodLabelActive: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#EDEDED',
  },

  // Category
  categorySection: { marginBottom: 16 },
  categoryRow: { gap: 8 },
  categoryChip: {
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 7,
  },
  categoryChipText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 12,
    color: '#6B6B6B',
  },
  categoryChipTextActive: {
    fontFamily: 'PlayfairDisplay_700Bold',
    color: '#FFFFFF',
  },

  // Guided prompt
  guidedPrompt: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    color: '#ABABAB',
    lineHeight: 20,
    marginBottom: 20,
  },

  // Title
  titleInput: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 22,
    color: '#0A0A0A',
    marginBottom: 16,
    padding: 0,
  },

  // Body
  bodyInput: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 15,
    color: '#0A0A0A',
    lineHeight: 26,
    minHeight: 200,
    padding: 0,
  },
});
