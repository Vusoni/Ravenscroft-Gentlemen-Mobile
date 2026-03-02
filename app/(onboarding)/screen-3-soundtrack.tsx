// app/(onboarding)/screen-3-soundtrack.tsx
import { ContinueButton } from '@/components/ContinueButton';
import { OnboardingProgress } from '@/components/OnboardingProgress';
import { router } from 'expo-router';
import { Check } from 'lucide-react-native';
import { useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_W } = Dimensions.get('window');
const NUM_COLS = 3;
const GRID_H_PADDING = 24;
const ITEM_GAP = 8;
const ITEM_SIZE =
  (SCREEN_W - GRID_H_PADDING * 2 - ITEM_GAP * (NUM_COLS - 1)) / NUM_COLS;

const PORTRAIT_IDS = Array.from({ length: 12 }, (_, i) => `portrait-${i}`);

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PortraitCell({
  id,
  selected,
  onToggle,
}: {
  id: string;
  selected: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = () => {
    scale.value = withSpring(0.92, {}, () => { scale.value = withSpring(1); });
    onToggle();
  };

  return (
    <AnimatedPressable
      style={[animStyle, { width: ITEM_SIZE, height: ITEM_SIZE }]}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      className="overflow-hidden rounded-sm"
    >
      {/* Placeholder portrait — charcoal box */}
      <View className="flex-1 bg-charcoal/20" />

      {/* Selected overlay */}
      {selected && (
        <View className="absolute inset-0 bg-ink/50 items-center justify-center">
          <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      )}
    </AnimatedPressable>
  );
}

export default function Screen3Soundtrack() {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['bottom']}>
      <View className="flex-1">
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text
            className="text-ink text-[22px] leading-7 mb-1"
            style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
          >
            Pickup Soundtrack
          </Text>
          <Text
            className="text-ink text-base"
            style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
          >
            Your Soundtrack Starts Here.
          </Text>
          <Text className="text-muted text-xs mt-1 leading-4">
            Your soundtrack will play during reflections, habit sessions, and evening reviews.
            Select what resonates.
          </Text>
        </View>

        {/* Portrait grid */}
        <FlatList
          data={PORTRAIT_IDS}
          keyExtractor={(item) => item}
          numColumns={NUM_COLS}
          contentContainerStyle={{
            paddingHorizontal: GRID_H_PADDING,
            gap: ITEM_GAP,
          }}
          columnWrapperStyle={{ gap: ITEM_GAP }}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <PortraitCell
              id={item}
              selected={selected.has(item)}
              onToggle={() => toggle(item)}
            />
          )}
        />
      </View>

      <View>
        <OnboardingProgress total={5} current={1} />
        <ContinueButton onPress={() => router.push('/(onboarding)/screen-4-interests')} />
      </View>
    </SafeAreaView>
  );
}
