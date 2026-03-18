// components/auth/OAuthButton.tsx
import { Pressable, StyleSheet, Text } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { subtleShadow } from '@/utils/shadows';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface OAuthButtonProps {
  onPress: () => void;
  disabled: boolean;
  icon: React.ReactNode;
  label: string;
}

export function OAuthButton({ onPress, disabled, icon, label }: OAuthButtonProps) {
  const scale = useSharedValue(1);
  const animStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <AnimatedPressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => { scale.value = withSpring(0.96, { damping: 15 }); }}
      onPressOut={() => { scale.value = withSpring(1, { damping: 15 }); }}
      style={[styles.button, disabled && { opacity: 0.5 }, animStyle]}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {icon}
      <Text style={styles.label}>{label}</Text>
    </AnimatedPressable>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.08)',
    paddingVertical: 14,
    ...subtleShadow,
  },
  label: {
    fontFamily: 'PlayfairDisplay_400Regular',
    fontSize: 14,
    color: '#1C1C1C',
    letterSpacing: 0.2,
  },
});
