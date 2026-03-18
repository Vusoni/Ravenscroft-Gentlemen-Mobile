// components/profile/StatsRow.tsx
import { GlassCard } from '@/components/GlassCard';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import Animated, {
  FadeInUp,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withTiming,
} from 'react-native-reanimated';

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedCounter({ target, delay = 0 }: { target: number; delay?: number }) {
  const count = useSharedValue(0);
  const [displayed, setDisplayed] = useState(0);

  useEffect(() => {
    count.value = withDelay(delay, withTiming(target, { duration: 800 }));
  }, [target]);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const end = target;
      if (end === 0) { setDisplayed(0); return; }
      const duration = 800;
      const stepTime = Math.max(Math.floor(duration / end), 30);
      const interval = setInterval(() => {
        start += 1;
        setDisplayed(start);
        if (start >= end) clearInterval(interval);
      }, stepTime);
      return () => clearInterval(interval);
    }, delay);
    return () => clearTimeout(timer);
  }, [target, delay]);

  const animStyle = useAnimatedStyle(() => ({ opacity: 1 }));

  return (
    <Animated.Text style={[{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 24, color: '#0A0A0A', letterSpacing: -0.5 }, animStyle]}>
      {displayed}
    </Animated.Text>
  );
}

// ─── Stat cell ────────────────────────────────────────────────────────────────
function StatCell({ value, label, delay }: { value: number; label: string; delay: number }) {
  return (
    <View style={{ flex: 1, alignItems: 'center' }}>
      <AnimatedCounter target={value} delay={delay} />
      <Text style={{ fontSize: 10, color: '#ABABAB', letterSpacing: 1.2, marginTop: 3, textTransform: 'uppercase' }}>
        {label}
      </Text>
    </View>
  );
}

// ─── Stats row ────────────────────────────────────────────────────────────────
export function StatsRow({
  articlesRead,
  booksSaved,
  interestsCount,
}: {
  articlesRead: number;
  booksSaved: number;
  interestsCount: number;
}) {
  return (
    <Animated.View entering={FadeInUp.delay(550).duration(500)} style={{ marginHorizontal: 24, marginTop: 28 }}>
      <GlassCard intensity={50} borderRadius={20} fillColor="rgba(255,255,255,0.58)">
        <View style={{ flexDirection: 'row', paddingVertical: 20 }}>
          <StatCell value={articlesRead} label="Articles" delay={600} />
          <View style={{ width: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 4 }} />
          <StatCell value={booksSaved} label="Books" delay={700} />
          <View style={{ width: 1, backgroundColor: 'rgba(0,0,0,0.08)', marginVertical: 4 }} />
          <StatCell value={interestsCount} label="Interests" delay={800} />
        </View>
      </GlassCard>
    </Animated.View>
  );
}
