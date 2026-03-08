// components/InterestTag.tsx
import { Check } from 'lucide-react-native';
import { Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

interface Props {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

export function InterestTag({ label, selected, onToggle }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePress = () => {
    // Call onToggle immediately so the UI reflects state change fast
    onToggle();
    // Then run the bounce animation
    scale.value = withSpring(0.88, { damping: 15, stiffness: 300 }, () => {
      'worklet';
      scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    });
  };

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPress={handlePress}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: selected }}
      accessibilityLabel={label}
      className={`flex-row items-center gap-1.5 px-4 py-2.5 rounded-full border m-1 ${
        selected ? 'bg-ink border-ink' : 'bg-ivory border-border'
      }`}
    >
      {selected && <Check size={12} color="#FFFFFF" strokeWidth={2.5} />}
      <Text
        className={`text-sm font-medium ${selected ? 'text-white' : 'text-charcoal'}`}
      >
        {label}
      </Text>
    </AnimatedPressable>
  );
}
