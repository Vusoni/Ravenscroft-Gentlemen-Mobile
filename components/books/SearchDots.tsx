// components/books/SearchDots.tsx
import { useEffect } from 'react';
import { View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

function SearchDot({ delay }: { delay: number }) {
  const opacity = useSharedValue(0.2);

  useEffect(() => {
    const timer = setTimeout(() => {
      opacity.value = withRepeat(
        withSequence(withTiming(1, { duration: 480 }), withTiming(0.2, { duration: 480 })),
        -1,
        false,
      );
    }, delay);
    return () => clearTimeout(timer);
  }, [delay, opacity]);

  const s = useAnimatedStyle(() => ({ opacity: opacity.value }));
  return <Animated.View style={[s, { width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#ABABAB' }]} />;
}

export function SearchDots() {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <SearchDot delay={0} />
      <SearchDot delay={190} />
      <SearchDot delay={380} />
    </View>
  );
}
