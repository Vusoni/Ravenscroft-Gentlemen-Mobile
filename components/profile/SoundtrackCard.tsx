// components/profile/SoundtrackCard.tsx
import { GlassCard } from '@/components/GlassCard';
import { useSoundtrackStore } from '@/store/soundtrackStore';
import { Music } from 'lucide-react-native';
import { useEffect } from 'react';
import { Image, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export function SoundtrackCard() {
  const selectedSong = useSoundtrackStore((s) => s.selectedSong);
  const hydrated = useSoundtrackStore((s) => s.hydrated);

  useEffect(() => {
    useSoundtrackStore.getState().hydrate();
  }, []);

  if (!hydrated || !selectedSong) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(680).duration(500)}
      style={{ marginHorizontal: 24, marginTop: 16 }}
    >
      <GlassCard intensity={46} borderRadius={22} fillColor="rgba(255,255,255,0.58)">
        <View style={{ flexDirection: 'row', alignItems: 'center', padding: 14 }}>
          <Image
            source={{ uri: selectedSong.albumArt }}
            style={{ width: 52, height: 52, borderRadius: 12 }}
          />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text numberOfLines={1} style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 14, color: '#0A0A0A' }}>
              {selectedSong.title}
            </Text>
            <Text numberOfLines={1} style={{ fontFamily: 'PlayfairDisplay_400Regular', fontSize: 12, color: '#6B6B6B', marginTop: 2 }}>
              {selectedSong.artist}
            </Text>
          </View>
          <Music size={16} color="#ABABAB" strokeWidth={1.5} />
        </View>
      </GlassCard>
    </Animated.View>
  );
}
