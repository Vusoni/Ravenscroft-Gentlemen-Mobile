// components/GlassTabBar.tsx
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import {
  BookOpen,
  MessageSquare,
  Newspaper,
  Sparkles,
  User,
} from "lucide-react-native";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export const TAB_BAR_HEIGHT = 64;
// Use this to compute bottom padding in screens: TAB_BAR_BOTTOM_OFFSET + insets.bottom
export const TAB_BAR_BOTTOM_OFFSET = TAB_BAR_HEIGHT + 8 + 16; // bar + margin + breathing room

type LucideIcon = typeof BookOpen;

const TAB_CONFIG: Record<string, { icon: LucideIcon; label: string }> = {
  index: { icon: Newspaper, label: "Articles" },
  books: { icon: BookOpen, label: "Books" },
  messages: { icon: MessageSquare, label: "Messages" },
  assistant: { icon: Sparkles, label: "Assistant" },
  profile: { icon: User, label: "Profile" },
};

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
  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    scale.value = withSpring(0.82, { damping: 14 }, () => {
      'worklet';
      scale.value = withSpring(1, { damping: 14 });
    });
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  return (
    <AnimatedPressable
      style={[styles.tabItem, animStyle]}
      onPress={handlePress}
      accessibilityRole="tab"
      accessibilityState={{ selected: isFocused }}
      accessibilityLabel={label}
    >
      <View style={[styles.iconWrapper, isFocused && styles.iconWrapperActive]}>
        <Icon
          size={20}
          color={isFocused ? "#0A0A0A" : "#6B6B6B"}
          strokeWidth={isFocused ? 2 : 1.5}
        />
      </View>
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

export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[styles.wrapper, { bottom: insets.bottom + 8 }]}
      pointerEvents="box-none"
    >
      <View style={styles.bar}>
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
  );
}

// Styles
const styles = StyleSheet.create({
  wrapper: {
    position: "absolute",
    left: 16,
    right: 16,
    height: TAB_BAR_HEIGHT,
    pointerEvents: "box-none",
  },
  bar: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(245, 245, 245, 0.88)",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.8)",
    paddingHorizontal: 4,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#1C1C1C",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.14,
        shadowRadius: 24,
      },
      android: {
        elevation: 12,
      },
    }),
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 3,
  },
  iconWrapper: {
    width: 38,
    height: 30,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  iconWrapperActive: {
    backgroundColor: "rgba(10, 10, 10, 0.07)",
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
