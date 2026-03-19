// components/ContinueButton.tsx
import Animated from 'react-native-reanimated';
import { Pressable, Text } from 'react-native';
import { useScaleAnimation } from '@/hooks/useScaleAnimation';

interface Props {
  label?: string;
  onPress: () => void;
  disabled?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function ContinueButton({ label = 'Continue', onPress, disabled = false }: Props) {
  const { animStyle, onPressIn, onPressOut } = useScaleAnimation();

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
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
