// components/profile/FloatingAvatar.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { Camera } from 'lucide-react-native';
import { useEffect } from 'react';
import { Image, Pressable, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

export function FloatingAvatar({
  initials,
  photoUri,
  onPickPhoto,
}: {
  initials: string;
  photoUri: string | null;
  onPickPhoto: () => void;
}) {
  const scale = useSharedValue(0.5);
  const opacity = useSharedValue(0);

  useEffect(() => {
    scale.value = withDelay(200, withSpring(1, { damping: 12, stiffness: 120 }));
    opacity.value = withDelay(200, withTiming(1, { duration: 400 }));
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[{ width: 84, height: 84, borderRadius: 42 }, animStyle]}>
      <Pressable onPress={onPickPhoto}>
        {/* Gradient shimmer ring */}
        <LinearGradient
          colors={['#D4B896', 'rgba(212,184,150,0.35)', '#D4B896']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ width: 84, height: 84, borderRadius: 42, padding: 3, alignItems: 'center', justifyContent: 'center' }}
        >
          <View style={{ width: 78, height: 78, borderRadius: 39, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {photoUri ? (
              <Image source={{ uri: photoUri }} style={{ width: 78, height: 78, borderRadius: 39 }} />
            ) : (
              <Text style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 26, color: '#1C1C1C', letterSpacing: 1 }}>
                {initials}
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* Camera badge */}
        <View style={{ position: 'absolute', bottom: 0, right: 0, width: 26, height: 26, borderRadius: 13, backgroundColor: '#0A0A0A', borderWidth: 2, borderColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
          <Camera size={12} color="#EDEDED" strokeWidth={2} />
        </View>
      </Pressable>
    </Animated.View>
  );
}
