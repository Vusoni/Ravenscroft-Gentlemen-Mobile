// components/profile/SignOutButton.tsx
import * as Haptics from 'expo-haptics';
import { LogOut } from 'lucide-react-native';
import { useCallback } from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function SignOutButton({
  onPress,
  disabled,
}: {
  onPress: () => void;
  disabled: boolean;
}) {
  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  const handlePressIn = useCallback(() => {
    scale.value = withSpring(0.97, { damping: 18, stiffness: 180 });
  }, []);

  const handlePressOut = useCallback(() => {
    scale.value = withSpring(1, { damping: 18, stiffness: 180 });
  }, []);

  const handlePress = useCallback(() => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  }, [onPress]);

  return (
    <Animated.View entering={FadeInDown.delay(1050).duration(400)}>
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled}
        style={[
          {
            marginHorizontal: 24,
            marginTop: 28,
            marginBottom: 8,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            paddingVertical: 14,
            borderRadius: 16,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: 'rgba(0,0,0,0.12)',
            backgroundColor: 'rgba(0,0,0,0.03)',
            opacity: disabled ? 0.5 : 1,
          },
          animStyle,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <LogOut size={15} color="#6B6B6B" strokeWidth={1.5} />
        <Text style={{ fontSize: 14, fontWeight: '500', color: '#6B6B6B', letterSpacing: 0.2 }}>
          Sign Out
        </Text>
      </AnimatedPressable>
    </Animated.View>
  );
}
