// components/GlassTabBar.tsx
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import {
  BookOpen,
  Newspaper,
  NotebookPen,
  Sparkles,
  User,
} from "lucide-react-native";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TAB_BAR_HEIGHT = 58;
export const TAB_BAR_BOTTOM_OFFSET = TAB_BAR_HEIGHT + 8 + 16;

type LucideIcon = typeof BookOpen;

const TAB_CONFIG: Record<string, { icon: LucideIcon }> = {
  index:     { icon: Newspaper },
  books:     { icon: BookOpen },
  journal:   { icon: NotebookPen },
  assistant: { icon: Sparkles },
  profile:   { icon: User },
};

// ─── Single tab item ──────────────────────────────────────────────────────────
function TabItem({
  routeName,
  isFocused,
  onPress,
}: {
  routeName: string;
  isFocused: boolean;
  onPress: () => void;
}) {
  const scale = useSharedValue(1);
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);
  const iconColor = useSharedValue(isFocused ? 1 : 0);
  const dotScale = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    pillOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
    iconColor.value   = withTiming(isFocused ? 1 : 0, { duration: 200 });
    dotScale.value    = withSpring(isFocused ? 1 : 0, { damping: 18, stiffness: 260 });
  }, [isFocused]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
  }));

  const dotStyle = useAnimatedStyle(() => ({
    transform: [{ scale: dotScale.value }],
    opacity: dotScale.value,
  }));

  const handlePress = () => {
    scale.value = withSpring(0.82, { damping: 14 }, () => {
      "worklet";
      scale.value = withSpring(1, { damping: 14 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const config = TAB_CONFIG[routeName];
  if (!config) return null;
  const { icon: Icon } = config;

  return (
    <AnimatedPressable
      style={[styles.tabItem, containerStyle]}
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
    >
      {/* Subtle active fill */}
      <Animated.View style={[styles.activeFill, pillStyle]} />

      {/* Icon */}
      <Icon
        size={20}
        color={isFocused ? "#0A0A0A" : "#9A9A9A"}
        strokeWidth={isFocused ? 2 : 1.4}
      />

      {/* Active dot */}
      <Animated.View style={[styles.activeDot, dotStyle]} />
    </AnimatedPressable>
  );
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────
export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeIn.delay(300).duration(500)}
      style={[styles.wrapper, { bottom: insets.bottom + 12 }]}
      pointerEvents="box-none"
    >
      <View style={styles.shadowLayer}>
        <View style={styles.pill}>
          {/* True blur — iOS */}
          {Platform.OS === "ios" && (
            <BlurView
              intensity={80}
              tint="systemUltraThinMaterialLight"
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Barely-there white tint — near-invisible fill */}
          <View style={[StyleSheet.absoluteFill, styles.tint]} />

          {/* Top specular highlight hairline */}
          <View style={[StyleSheet.absoluteFill, styles.highlight]} />

          {/* Tab items */}
          <View style={styles.tabRow}>
            {state.routes.map((route, index) => {
              const isFocused = state.index === index;
              const onPress = () => {
                const event = navigation.emit({
                  type: "tabPress",
                  target: route.key,
                  canPreventDefault: true,
                });
                if (!isFocused && !event.defaultPrevented) {
                  navigation.navigate(route.name);
                }
              };
              return (
                <TabItem
                  key={route.key}
                  routeName={route.name}
                  isFocused={isFocused}
                  onPress={onPress}
                />
              );
            })}
          </View>
        </View>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 20,
    right: 20,
    height: TAB_BAR_HEIGHT,
    pointerEvents: "box-none",
  },

  shadowLayer: {
    flex: 1,
    borderRadius: 34,
    ...Platform.select({
      ios: {
        shadowColor: "#000000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 24,
      },
      android: { elevation: 10 },
    }),
  },

  pill: {
    flex: 1,
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.55)",
    backgroundColor: Platform.select({
      ios: "transparent",
      android: "rgba(242,242,242,0.72)",
    }),
  },

  // Near-invisible tint — let blur do the work
  tint: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 34,
  },

  // Subtle specular line at top edge
  highlight: {
    borderRadius: 34,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.90)",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: "rgba(255,255,255,0.55)",
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },

  tabRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
  },

  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 5,
    paddingVertical: 10,
  },

  // Very subtle ink fill — barely perceptible
  activeFill: {
    position: "absolute",
    width: 44,
    height: 38,
    borderRadius: 16,
    backgroundColor: "rgba(10,10,10,0.055)",
  },

  // 4px ink dot below active icon
  activeDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#0A0A0A",
  },
});
