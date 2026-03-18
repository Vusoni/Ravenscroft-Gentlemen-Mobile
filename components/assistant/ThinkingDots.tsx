// components/assistant/ThinkingDots.tsx
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

export function ThinkingDots() {
  const dot1 = useSharedValue(0.3);
  const dot2 = useSharedValue(0.3);
  const dot3 = useSharedValue(0.3);

  useEffect(() => {
    const pulse = (val: typeof dot1, delay: number) => {
      const timer = setTimeout(() => {
        val.value = withRepeat(
          withSequence(withTiming(1, { duration: 400 }), withTiming(0.3, { duration: 400 })),
          -1,
          false,
        );
      }, delay);
      return timer;
    };
    const t1 = pulse(dot1, 0);
    const t2 = pulse(dot2, 160);
    const t3 = pulse(dot3, 320);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, []);

  const s1 = useAnimatedStyle(() => ({ opacity: dot1.value }));
  const s2 = useAnimatedStyle(() => ({ opacity: dot2.value }));
  const s3 = useAnimatedStyle(() => ({ opacity: dot3.value }));

  return (
    <View style={styles.bubbleRow}>
      <View style={[styles.bubble, styles.bubbleThinking]}>
        <View style={styles.dotsRow}>
          <Animated.View style={[styles.dot, s1]} />
          <Animated.View style={[styles.dot, s2]} />
          <Animated.View style={[styles.dot, s3]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bubbleRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  bubble: {
    maxWidth: '82%',
    borderRadius: 18,
    padding: 14,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderBottomLeftRadius: 4,
  },
  bubbleThinking: {
    paddingVertical: 16,
    paddingHorizontal: 18,
  },
  dotsRow: {
    flexDirection: 'row',
    gap: 5,
    alignItems: 'center',
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#6B6B6B',
  },
});
