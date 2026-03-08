// app/(onboarding)/screen-3-soundtrack.tsx
import { ContinueButton } from '@/components/ContinueButton';
import { GlassCard } from '@/components/GlassCard';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { useSoundtrackStore } from '@/store/soundtrackStore';
import { Song } from '@/types/song';
import { router } from 'expo-router';
import { Check, Music, Search } from 'lucide-react-native';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  FadeInDown,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

async function searchSongs(query: string): Promise<Song[]> {
  const encoded = encodeURIComponent(query);
  const res = await fetch(
    `https://itunes.apple.com/search?term=${encoded}&media=music&entity=song&limit=15`
  );
  const data = await res.json();
  return (data.results ?? []).map((item: any) => ({
    id: String(item.trackId),
    title: item.trackName,
    artist: item.artistName,
    albumArt: (item.artworkUrl100 ?? '').replace('100x100', '300x300'),
    previewUrl: item.previewUrl ?? '',
    albumName: item.collectionName ?? '',
  }));
}

function SongRow({
  song,
  isSelected,
  onPress,
}: {
  song: Song;
  isSelected: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.95, { damping: 18, stiffness: 180 }, () => {
      'worklet';
      scale.value = withSpring(1, { damping: 18, stiffness: 180 });
    });
    onPress();
  };

  return (
    <AnimatedPressable
      style={animStyle}
      onPress={handlePress}
      className={`flex-row items-center px-4 py-3 mx-5 mb-2 rounded-2xl border ${
        isSelected ? 'bg-ink border-ink' : 'bg-white/60 border-border'
      }`}
    >
      <Image
        source={{ uri: song.albumArt }}
        style={{ width: 48, height: 48, borderRadius: 10 }}
      />
      <View className="flex-1 ml-3 mr-2">
        <Text
          numberOfLines={1}
          className={`text-[14px] ${isSelected ? 'text-white' : 'text-ink'}`}
          style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
        >
          {song.title}
        </Text>
        <Text
          numberOfLines={1}
          className={`text-[12px] mt-0.5 ${isSelected ? 'text-white/70' : 'text-muted'}`}
          style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
        >
          {song.artist}
        </Text>
      </View>
      {isSelected && <Check size={18} color="#FFFFFF" strokeWidth={2.5} />}
    </AnimatedPressable>
  );
}

export default function Screen3Soundtrack() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mountedRef = useRef(true);

  const selectedSong = useSoundtrackStore((s) => s.selectedSong);
  const setSong = useSoundtrackStore((s) => s.setSong);
  const clearSong = useSoundtrackStore((s) => s.clearSong);

  useEffect(() => {
    useSoundtrackStore.getState().hydrate();
    return () => {
      mountedRef.current = false;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleSearch = useCallback((text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (text.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const songs = await searchSongs(text.trim());
        if (mountedRef.current) setResults(songs);
      } catch {
        if (mountedRef.current) setResults([]);
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    }, 300);
  }, []);

  const handleSelect = (song: Song) => {
    if (selectedSong?.id === song.id) {
      clearSong();
    } else {
      setSong(song);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['top', 'bottom']}>
      {/* Header */}
      <View className="items-center pt-5 pb-3">
        <Text
          className="text-ink text-[22px] text-center"
          style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
        >
          Pickup Soundtrack
        </Text>
        <View style={{ width: 40, height: 1, backgroundColor: '#0A0A0A', marginTop: 8 }} />
      </View>

      {/* Subtitle */}
      <View className="px-6 pb-3">
        <Text
          className="text-ink text-base text-center"
          style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
        >
          Every gentleman has a song that sets the tone.
        </Text>
      </View>

      {/* Search bar */}
      <View className="mx-5 mb-3">
        <View
          className={`flex-row items-center rounded-full border px-4 py-3 ${
            Platform.OS === 'ios' ? 'bg-white/50' : 'bg-white/70'
          } border-border`}
        >
          <Search size={16} color="#6B6B6B" strokeWidth={1.8} />
          <TextInput
            className="flex-1 ml-2.5 text-[14px] text-ink"
            style={{ fontFamily: 'PlayfairDisplay_400Regular', padding: 0 }}
            placeholder="Search for a song..."
            placeholderTextColor="#ABABAB"
            value={query}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
          />
          {loading && <ActivityIndicator size="small" color="#6B6B6B" />}
        </View>
      </View>

      {/* Results */}
      <FlatList
        className="flex-1"
        data={results}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 8 }}
        ListEmptyComponent={
          query.length >= 2 && !loading ? (
            <View className="items-center pt-10">
              <Music size={32} color="#D4D4D4" strokeWidth={1.2} />
              <Text
                className="text-muted text-[13px] mt-3 text-center"
                style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
              >
                No songs found. Try a different search.
              </Text>
            </View>
          ) : query.length < 2 ? (
            <View className="items-center pt-10 px-8">
              <Music size={32} color="#D4D4D4" strokeWidth={1.2} />
              <Text
                className="text-muted text-[13px] mt-3 text-center leading-5"
                style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
              >
                Search for a song that defines your rhythm.{'\n'}This is optional — you can skip ahead.
              </Text>
            </View>
          ) : null
        }
        renderItem={({ item }) => (
          <SongRow
            song={item}
            isSelected={selectedSong?.id === item.id}
            onPress={() => handleSelect(item)}
          />
        )}
      />

      {/* Selected song preview */}
      {selectedSong && (
        <Animated.View entering={FadeInDown.duration(400)} style={{ marginHorizontal: 20, marginBottom: 8 }}>
          <GlassCard intensity={46} borderRadius={18} fillColor="rgba(255,255,255,0.58)">
            <View className="flex-row items-center p-3">
              <Image
                source={{ uri: selectedSong.albumArt }}
                style={{ width: 44, height: 44, borderRadius: 10 }}
              />
              <View className="flex-1 ml-3">
                <Text
                  numberOfLines={1}
                  className="text-ink text-[14px]"
                  style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
                >
                  {selectedSong.title}
                </Text>
                <Text
                  numberOfLines={1}
                  className="text-muted text-[12px] mt-0.5"
                  style={{ fontFamily: 'PlayfairDisplay_400Regular' }}
                >
                  {selectedSong.artist}
                </Text>
              </View>
              <Check size={16} color="#0A0A0A" strokeWidth={2} />
            </View>
          </GlassCard>
        </Animated.View>
      )}

      {/* Footer */}
      <View>
        <OnboardingProgress total={5} current={1} />
        <ContinueButton
          onPress={() => router.push('/(onboarding)/screen-4-interests')}
        />
      </View>
    </SafeAreaView>
  );
}
