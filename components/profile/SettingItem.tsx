// components/profile/SettingItem.tsx
import * as Haptics from 'expo-haptics';
import { ChevronRight } from 'lucide-react-native';
import { useCallback } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export type SettingRow = {
  id: string;
  label: string;
  icon: typeof ChevronRight;
  value?: string;
};

export function SettingItem({
  index,
  total,
  row,
  onPress,
}: {
  index: number;
  total: number;
  row: SettingRow;
  onPress?: () => void;
}) {
  const Icon = row.icon;
  const isFirst = index === 0;
  const isLast = index === total - 1;
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePress = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 15 }, () => {
      'worklet';
      scale.value = withSpring(1, { damping: 15 });
    });
    Haptics.selectionAsync();
    onPress?.();
  }, [onPress]);

  return (
    <AnimatedPressable
      onPress={handlePress}
      style={[
        {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 15,
          backgroundColor: 'rgba(255,255,255,0.6)',
          borderTopLeftRadius: isFirst ? 20 : 0,
          borderTopRightRadius: isFirst ? 20 : 0,
          borderBottomLeftRadius: isLast ? 20 : 0,
          borderBottomRightRadius: isLast ? 20 : 0,
          borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
          borderBottomColor: 'rgba(0,0,0,0.07)',
        },
        animStyle,
      ]}
      accessibilityRole="button"
      accessibilityLabel={row.label}
    >
      <View style={{
        width: 32,
        height: 32,
        borderRadius: 9,
        backgroundColor: 'rgba(255,255,255,0.72)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.9)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 14,
        ...Platform.select({
          ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 4 },
        }),
      }}>
        <Icon size={15} color="#1C1C1C" strokeWidth={1.5} />
      </View>

      <Text style={{ flex: 1, fontSize: 15, fontWeight: '500', color: '#1C1C1C' }}>
        {row.label}
      </Text>

      {row.value && (
        <Text style={{ fontSize: 13, color: '#ABABAB', marginRight: 8 }}>{row.value}</Text>
      )}

      <ChevronRight size={14} color="#D4D4D4" strokeWidth={2} />
    </AnimatedPressable>
  );
}
