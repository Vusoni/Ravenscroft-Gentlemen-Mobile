// components/profile/BannerHeader.tsx
import { LinearGradient } from 'expo-linear-gradient';
import { MoreHorizontal } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, {
  FadeIn,
  type SharedValue,
  interpolate,
  useAnimatedStyle,
} from 'react-native-reanimated';

export function BannerHeader({
  topInset,
  scrollY,
}: {
  topInset: number;
  scrollY: SharedValue<number>;
}) {
  const bannerHeight = topInset + 164;

  const parallaxStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: interpolate(scrollY.value, [-100, 0, 200], [50, 0, -40]) }],
    opacity: interpolate(scrollY.value, [0, 160], [1, 0.6]),
  }));

  return (
    <Animated.View style={parallaxStyle}>
      <LinearGradient
        colors={['#1A1614', '#1C1917', '#252220']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{ height: bannerHeight, paddingTop: topInset }}
      >
        {/* Warm accent gradient overlay */}
        <LinearGradient
          colors={['rgba(212,184,150,0.08)', 'transparent', 'rgba(212,184,150,0.04)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Subtle diagonal lines pattern */}
        <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, overflow: 'hidden', opacity: 0.03 }}>
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <View
              key={i}
              style={{
                position: 'absolute',
                top: -40 + i * 36,
                left: -20,
                right: -20,
                height: 1,
                backgroundColor: '#D4B896',
                transform: [{ rotate: '-35deg' }],
              }}
            />
          ))}
        </View>

        {/* Top row */}
        <Animated.View
          entering={FadeIn.delay(100).duration(500)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingHorizontal: 24,
            paddingTop: 18,
          }}
        >
          <Text style={{
            fontFamily: 'PlayfairDisplay_700Bold',
            fontSize: 11,
            letterSpacing: 3,
            color: 'rgba(212, 184, 150, 0.5)',
            textTransform: 'uppercase',
          }}>
            My Profile
          </Text>
          <Pressable
            hitSlop={12}
            style={({ pressed }) => ({
              opacity: pressed ? 0.5 : 1,
              width: 32,
              height: 32,
              borderRadius: 16,
              borderWidth: 1,
              borderColor: 'rgba(212,184,150,0.18)',
              backgroundColor: 'rgba(212,184,150,0.06)',
              alignItems: 'center',
              justifyContent: 'center',
            })}
          >
            <MoreHorizontal size={15} color="rgba(212,184,150,0.5)" strokeWidth={1.8} />
          </Pressable>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}
