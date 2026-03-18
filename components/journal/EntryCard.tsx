// components/journal/EntryCard.tsx
import { GlassCard } from '@/components/GlassCard';
import { CATEGORY_COLORS, CATEGORY_LABELS, JournalEntry, MOOD_EMOJI } from '@/types/journal';
import { formatTime } from '@/utils/dateHelpers';
import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function EntryCard({ entry, index }: { entry: JournalEntry; index: number }) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.View entering={FadeInDown.delay(60 * index).duration(350)}>
      <AnimatedPressable
        style={animStyle}
        onPressIn={() => { scale.value = withSpring(0.97, { damping: 15 }); }}
        onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
        onPress={() =>
          router.push({ pathname: '/(home)/journal-detail', params: { entryId: entry.id } })
        }
      >
        <GlassCard style={styles.entryCard}>
          {/* Accent bar */}
          <View style={[styles.accentBar, { backgroundColor: CATEGORY_COLORS[entry.category] }]} />

          <View style={styles.entryContent}>
            <View style={styles.entryHeader}>
              <Text style={styles.entryTitle} numberOfLines={1}>
                {entry.title}
              </Text>
              {entry.mood && (
                <Text style={styles.entryMood}>{MOOD_EMOJI[entry.mood]}</Text>
              )}
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

const styles = StyleSheet.create({
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
  entryMood: { fontSize: 16 },
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
});
