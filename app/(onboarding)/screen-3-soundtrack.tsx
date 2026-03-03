// app/(onboarding)/screen-3-soundtrack.tsx
import { ContinueButton } from "@/components/ContinueButton";
import { OnboardingProgress } from "@/components/OnboardingProgress";
import { router } from "expo-router";
import { Check } from "lucide-react-native";
import { useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  ImageSourcePropType,
  Pressable,
  Text,
  View,
} from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width: SCREEN_W } = Dimensions.get("window");
const NUM_COLS = 3;
const GRID_H_PADDING = 24;
const ITEM_GAP = 8;
const ITEM_SIZE =
  (SCREEN_W - GRID_H_PADDING * 2 - ITEM_GAP * (NUM_COLS - 1)) / NUM_COLS;

const PORTRAIT_IMAGES: ImageSourcePropType[] = [
  require("../../assets/elegant-images/elegant1.png"),
  require("../../assets/elegant-images/elegant2.png"),
  require("../../assets/elegant-images/elegant3.png"),
  
];

type PortraitItem = { id: string; source: ImageSourcePropType };

const PORTRAIT_DATA: PortraitItem[] = Array.from({ length: 12 }, (_, i) => ({
  id: `portrait-${i}`,
  source: PORTRAIT_IMAGES[i % PORTRAIT_IMAGES.length],
}));

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function PortraitCell({
  item,
  selected,
  onToggle,
}: {
  item: PortraitItem;
  selected: boolean;
  onToggle: () => void;
}) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.92, { damping: 15, stiffness: 300 }, () => {
      "worklet";
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    });
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
      <Image
        source={item.source}
        style={{ width: ITEM_SIZE, height: ITEM_SIZE }}
        resizeMode="cover"
      />
      {selected && (
        <View className="absolute inset-0 bg-ink/50 items-center justify-center">
          <Check size={20} color="#FFFFFF" strokeWidth={2.5} />
        </View>
      )}
    </AnimatedPressable>
  );
}

const GridHeader = () => (
  <View className="items-center pt-5 pb-4">
    <Text
      className="text-ink text-[22px] text-center"
      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
    >
      Pickup Soundtrack
    </Text>
    <View
      style={{ width: 40, height: 1, backgroundColor: "#0A0A0A", marginTop: 8 }}
    />
  </View>
);

const GridFooter = () => (
  <View className="items-center pt-5 pb-4 px-4">
    <Text
      className="text-ink text-[22px] text-center mb-2"
      style={{ fontFamily: "PlayfairDisplay_700Bold" }}
    >
      Your Soundtrack{"\n"}Starts Here.
    </Text>
    <Text
      className="text-muted text-xs text-center leading-4"
      style={{ fontFamily: "PlayfairDisplay_400Regular" }}
    >
      Your soundtrack will play during reflections, habit sessions, and evening
      reviews. You can change this anytime, a gentleman always adapts to the
      room.
    </Text>
  </View>
);

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
    <SafeAreaView className="flex-1 bg-ivory" edges={["top", "bottom"]}>
      <FlatList
        className="flex-1"
        data={PORTRAIT_DATA}
        keyExtractor={(item) => item.id}
        numColumns={NUM_COLS}
        contentContainerStyle={{
          paddingHorizontal: GRID_H_PADDING,
          gap: ITEM_GAP,
        }}
        columnWrapperStyle={{ gap: ITEM_GAP }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={GridHeader}
        ListHeaderComponentStyle={{ paddingHorizontal: 0 }}
        ListFooterComponent={GridFooter}
        renderItem={({ item }) => (
          <PortraitCell
            item={item}
            selected={selected.has(item.id)}
            onToggle={() => toggle(item.id)}
          />
        )}
      />

      <View>
        <OnboardingProgress total={5} current={1} />
        <ContinueButton
          onPress={() => router.push("/(onboarding)/screen-4-interests")}
        />
      </View>
    </SafeAreaView>
  );
}
