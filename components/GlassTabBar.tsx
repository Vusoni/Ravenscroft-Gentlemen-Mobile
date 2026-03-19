// components/GlassTabBar.tsx
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { LinearGradient } from "expo-linear-gradient";
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
  const indicatorOpacity = useSharedValue(isFocused ? 1 : 0);

  useEffect(() => {
    pillOpacity.value    = withTiming(isFocused ? 1 : 0, { duration: 200 });
    iconColor.value      = withTiming(isFocused ? 1 : 0, { duration: 200 });
    indicatorOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 200 });
  }, [isFocused]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
  }));

  const indicatorStyle = useAnimatedStyle(() => ({
    opacity: indicatorOpacity.value,
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
      {/* Frosted chip behind active icon */}
      <Animated.View style={[styles.activeFill, pillStyle]} />

      {/* Icon */}
      <Icon
        size={22}
        color={isFocused ? "#0A0A0A" : "#9A9A9A"}
        strokeWidth={isFocused ? 2.2 : 1.4}
      />

      {/* Dot below icon */}
      <Animated.View style={[styles.activeIndicator, indicatorStyle]} />
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
              intensity={52}
              tint="systemUltraThinMaterialLight"
              style={StyleSheet.absoluteFill}
            />
          )}

          {/* Gradient tint — refraction shimmer top → transparent */}
          <LinearGradient
            colors={["rgba(255,255,255,0.12)", "rgba(255,255,255,0.00)"]}
            style={[StyleSheet.absoluteFill, styles.gradientTint]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
          />

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
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.13,
        shadowRadius: 32,
      },
      android: { elevation: 10 },
    }),
  },

  pill: {
    flex: 1,
    borderRadius: 34,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.70)",
    backgroundColor: Platform.select({
      ios: "transparent",
      android: "rgba(242,242,242,0.72)",
    }),
  },

  gradientTint: {
    borderRadius: 34,
  },

  // Crisper specular hairline at top + left edge
  highlight: {
    borderRadius: 34,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(255,255,255,0.95)",
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: "rgba(255,255,255,0.70)",
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
    paddingVertical: 10,
  },

  // Frosted chip behind active icon
  activeFill: {
    position: "absolute",
    width: 44,
    height: 40,
    borderRadius: 14,
    backgroundColor: "rgba(10,10,10,0.10)",
  },

  // 4px dot below icon
  activeIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    marginTop: 4,
    backgroundColor: "rgba(10,10,10,0.50)",
  },
});
