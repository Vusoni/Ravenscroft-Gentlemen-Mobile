// components/profile/StreakRow.tsx
import { GlassCard } from '@/components/GlassCard';
import { Flame } from 'lucide-react-native';
import { Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function StreakRow() {
  return (
    <Animated.View
      entering={FadeInDown.delay(700).duration(500)}
      style={{ marginHorizontal: 24, marginTop: 16 }}
    >
      <GlassCard intensity={46} borderRadius={22} fillColor="rgba(255,255,255,0.58)">
        <View style={{ overflow: 'hidden', borderRadius: 22, flexDirection: 'row', alignItems: 'center' }}>
          {/* Gold left accent */}
          <View style={{ width: 3, height: '100%', backgroundColor: '#D4B896', position: 'absolute', left: 0 }} />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 15 }}>
            <Flame size={15} color="#D4B896" strokeWidth={1.5} />
            <Text style={{ flex: 1, fontSize: 14, fontWeight: '500', color: '#1C1C1C', marginLeft: 12 }}>
              Reading Streak
            </Text>
            <Text style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 13, color: '#ABABAB' }}>
              —
            </Text>
          </View>
        </View>
      </GlassCard>
    </Animated.View>
  );
}
