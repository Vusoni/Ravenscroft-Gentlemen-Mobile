import { FileText } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function ImportButton({ onPress, loading = false, disabled = false }: Props) {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      style={animatedStyle}
      onPressIn={() => {
        scale.value = withSpring(0.96, { damping: 18, stiffness: 180 });
      }}
      onPressOut={() => {
        scale.value = withSpring(1, { damping: 18, stiffness: 180 });
      }}
      onPress={onPress}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityLabel="Select MyClippings.txt file"
      className={`flex-row items-center justify-center gap-3 rounded-full py-4 px-8 ${
        isDisabled ? 'bg-charcoal/40' : 'bg-ink'
      }`}
    >
      {loading ? (
        <ActivityIndicator color="#EDEDED" size="small" />
      ) : (
        <FileText size={18} color="#EDEDED" strokeWidth={1.8} />
      )}
      <Text className="text-white text-base font-semibold tracking-widest uppercase">
        {loading ? 'Importing...' : 'Select File'}
      </Text>
    </AnimatedPressable>
  );
}
