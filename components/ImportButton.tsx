import { FileText } from 'lucide-react-native';
import { ActivityIndicator, Pressable, Text } from 'react-native';
import Animated from 'react-native-reanimated';
import { useScaleAnimation } from '@/hooks/useScaleAnimation';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

interface Props {
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function ImportButton({ onPress, loading = false, disabled = false }: Props) {
  const { animStyle, onPressIn, onPressOut } = useScaleAnimation();

  const isDisabled = disabled || loading;

  return (
    <AnimatedPressable
      style={animStyle}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
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
