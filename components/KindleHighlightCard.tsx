import type { KindleClipping } from '@/types/kindle';
import { MapPin } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  clipping: KindleClipping;
  onPress?: () => void;
  onLongPress?: () => void;
}

function relativeDate(iso: string): string {
  const now = Date.now();
  const then = new Date(iso).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

export function KindleHighlightCard({ clipping, onPress, onLongPress }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={[styles.card, animatedStyle]}
      onPressIn={() => {
        scale.value = withSpring(0.97, { damping: 18, stiffness: 180 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 180 });
      }}
      onPress={onPress}
      onLongPress={onLongPress}
    >
      {clipping.type === 'note' && (
        <View style={styles.noteBadge}>
          <Text style={styles.noteBadgeText}>Note</Text>
        </View>
      )}

      <Text style={styles.text} numberOfLines={6}>
        {clipping.type === 'highlight' ? `\u201C${clipping.text}\u201D` : clipping.text}
      </Text>

      <View style={styles.meta}>
        <View style={styles.locationPill}>
          <MapPin size={10} color="#6B6B6B" strokeWidth={2} />
          <Text style={styles.locationText}>
            Loc {clipping.locationStart}
            {clipping.locationEnd ? `\u2013${clipping.locationEnd}` : ''}
          </Text>
        </View>
        <Text style={styles.date}>{relativeDate(clipping.addedAt)}</Text>
      </View>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#D4D4D4',
    padding: 16,
    marginBottom: 10,
  },
  noteBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#F5F5F5',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginBottom: 8,
  },
  noteBadgeText: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 10,
    color: '#6B6B6B',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  text: {
    fontFamily: 'PlayfairDisplay_400Regular_Italic',
    fontSize: 14,
    lineHeight: 22,
    color: '#1C1C1C',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  locationText: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    color: '#6B6B6B',
  },
  date: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 11,
    color: '#6B6B6B',
  },
});
