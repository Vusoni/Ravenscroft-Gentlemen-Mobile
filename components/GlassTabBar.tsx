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
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  FadeIn,
  interpolate,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TAB_BAR_HEIGHT = 66;
export const TAB_BAR_BOTTOM_OFFSET = TAB_BAR_HEIGHT + 8 + 16;

type LucideIcon = typeof BookOpen;

const TAB_CONFIG: Record<string, { icon: LucideIcon; label: string }> = {
  index: { icon: Newspaper, label: "Articles" },
  books: { icon: BookOpen, label: "Books" },
  journal: { icon: NotebookPen, label: "Journal" },
  assistant: { icon: Sparkles, label: "Assistant" },
  profile: { icon: User, label: "Profile" },
};

const TAB_COUNT = Object.keys(TAB_CONFIG).length;

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
  const config = TAB_CONFIG[routeName];
  if (!config) return null;
  const { icon: Icon, label } = config;

  const scale = useSharedValue(1);
  const pillOpacity = useSharedValue(isFocused ? 1 : 0);
  const pillScale = useSharedValue(isFocused ? 1 : 0.6);
  const iconOpacity = useSharedValue(isFocused ? 1 : 0.5);

  useEffect(() => {
    pillOpacity.value = withTiming(isFocused ? 1 : 0, { duration: 220 });
    pillScale.value = withSpring(isFocused ? 1 : 0.6, { damping: 16, stiffness: 240 });
    iconOpacity.value = withTiming(isFocused ? 1 : 0.5, { duration: 200 });
  }, [isFocused]);

  const containerAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const pillAnimStyle = useAnimatedStyle(() => ({
    opacity: pillOpacity.value,
    transform: [{ scale: pillScale.value }],
  }));

  const iconAnimStyle = useAnimatedStyle(() => ({
    opacity: interpolate(iconOpacity.value, [0.5, 1], [0.55, 1]),
  }));

  const handlePress = () => {
    scale.value = withSpring(0.84, { damping: 14 }, () => {
      "worklet";
      scale.value = withSpring(1, { damping: 14 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      style={[styles.tabItem, containerAnimStyle]}
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      {/* Active pill behind the icon */}
      <Animated.View style={[styles.activePill, pillAnimStyle]} />

      {/* Icon */}
      <Animated.View style={[styles.iconWrapper, iconAnimStyle]}>
        <Icon
          size={19}
          color={isFocused ? "#EDEDED" : "#6B6B6B"}
          strokeWidth={isFocused ? 2 : 1.5}
        />
      </Animated.View>

      {/* Label */}
      <Text
        style={[
          styles.label,
          isFocused ? styles.labelActive : styles.labelInactive,
        ]}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}

// ─── Tab bar ─────────────────────────────────────────────────────────────────
export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <Animated.View
      entering={FadeIn.delay(200).duration(400)}
      style={[styles.wrapper, { bottom: insets.bottom + 10 }]}
      pointerEvents="box-none"
    >
      {/* Outer container — handles shadow */}
      <View style={styles.shadowLayer}>
        {/* Glass pill — rounded rectangle with blur */}
        <View style={styles.outerBar}>
          {/* True frosted glass (iOS) */}
          <BlurView
            intensity={70}
            tint="systemChromeMaterialLight"
            style={StyleSheet.absoluteFill}
          />

          {/* Semi-transparent white tint over blur */}
          <View style={[StyleSheet.absoluteFill, styles.glassTint]} />

          {/* Bottom / right dark hairline for depth */}
          <View style={[StyleSheet.absoluteFill, styles.darkHairline]} />

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
    left: 16,
    right: 16,
    height: TAB_BAR_HEIGHT,
    pointerEvents: "box-none",
  },
  shadowLayer: {
    flex: 1,
    borderRadius: 24,
    // Multi-layer shadow for a "floating" glass feel
    ...Platform.select({
      ios: {
        shadowColor: "#0A0A0A",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.14,
        shadowRadius: 28,
      },
      android: {
        elevation: 14,
      },
    }),
  },
  outerBar: {
    flex: 1,
    borderRadius: 24,
    overflow: "hidden",
    // Top/left highlight border
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.88)",
    backgroundColor: Platform.select({
      ios: "transparent",
      android: "rgba(245,245,245,0.93)",
    }),
  },
  glassTint: {
    backgroundColor: "rgba(255,255,255,0.52)",
    borderRadius: 24,
  },
  darkHairline: {
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.055)",
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 6,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 3,
    position: "relative",
  },
  activePill: {
    position: "absolute",
    top: 7,
    width: 38,
    height: 30,
    borderRadius: 10,
    backgroundColor: "rgba(10,10,10,0.88)",
  },
  iconWrapper: {
    width: 38,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  label: {
    fontSize: 9,
    letterSpacing: 0.4,
  },
  labelActive: {
    color: "#0A0A0A",
    fontFamily: "PlayfairDisplay_700Bold",
  },
  labelInactive: {
    color: "#ABABAB",
    fontFamily: "PlayfairDisplay_400Regular",
  },
});
