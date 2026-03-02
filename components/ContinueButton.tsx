// components/ContinueButton.tsx
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { Pressable, Text } from 'react-native';

interface Props {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ContinueButton({ label = 'Continue', onPress, disabled = false }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={() => { scale.value = withSpring(0.96); }}
      onPressOut={() => { scale.value = withSpring(1); }}
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={label}
      className={`mx-6 mb-4 rounded-full py-4 items-center justify-center ${
        disabled ? 'bg-charcoal/40' : 'bg-ink'
      }`}
    >
      <Text className="text-white text-base font-semibold tracking-widest uppercase">
        {label}
      </Text>
    </AnimatedPressable>
  );
}
