import { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

export interface ScaleAnimationOptions {
  pressedScale?: number;
  damping?: number;
  stiffness?: number;
}

export function useScaleAnimation(options: ScaleAnimationOptions = {}) {
  const { pressedScale = 0.96, damping = 18, stiffness = 180 } = options;

  const scale = useSharedValue(1);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(pressedScale, { damping, stiffness });
  };

  const onPressOut = () => {
    scale.value = withSpring(1, { damping, stiffness });
  };

  return { animStyle, onPressIn, onPressOut };
}
