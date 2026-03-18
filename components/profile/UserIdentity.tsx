// components/profile/UserIdentity.tsx
import { GlassBlur } from '@/components/GlassBlur';
import { useAuthStore } from '@/store/authStore';
import * as Haptics from 'expo-haptics';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { FloatingAvatar } from './FloatingAvatar';

export function UserIdentity({
  interests,
  photoUri,
  onPickPhoto,
  onEditProfile,
}: {
  interests: string[];
  photoUri: string | null;
  onPickPhoto: () => void;
  onEditProfile: () => void;
}) {
  const user = useAuthStore((s) => s.user);
  const displayName = user?.displayName ?? user?.email?.split('@')[0] ?? 'V';
  const initials = displayName.length > 0 ? displayName[0].toUpperCase() : 'V';
  const tagline = interests.length > 0 ? interests.slice(0, 2).join(' & ') : 'Ravenscroft Member';

  return (
    <View style={{ paddingHorizontal: 24 }}>
      {/* Avatar row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginTop: -42, marginBottom: 16 }}>
        <FloatingAvatar initials={initials} photoUri={photoUri} onPickPhoto={onPickPhoto} />
        <Animated.View entering={FadeInDown.delay(400).duration(400).springify()}>
          {/* Glass Edit Profile button */}
          <View style={styles.editBtnShadow}>
            <Pressable
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                onEditProfile();
              }}
              style={({ pressed }) => [styles.editBtn, { opacity: pressed ? 0.7 : 1 }]}
            >
              <GlassBlur intensity={48} />
              <View style={[StyleSheet.absoluteFill, styles.editBtnFill]} pointerEvents="none" />
              <Text style={styles.editBtnLabel}>Edit Profile</Text>
            </Pressable>
          </View>
        </Animated.View>
      </View>

      {/* Name */}
      <Animated.Text
        entering={FadeInDown.delay(300).duration(500)}
        style={{ fontFamily: 'PlayfairDisplay_700Bold', fontSize: 30, color: '#0A0A0A', letterSpacing: -0.5, lineHeight: 36 }}
      >
        {displayName}.
      </Animated.Text>

      {/* Tagline */}
      <Animated.Text
        entering={FadeInDown.delay(400).duration(500)}
        style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic', fontSize: 14, color: '#6B6B6B', marginTop: 3, marginBottom: 12 }}
      >
        {tagline}
      </Animated.Text>

      {/* Badge */}
      <Animated.View
        entering={FadeInDown.delay(500).duration(500)}
        style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1, borderColor: 'rgba(212,184,150,0.6)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(212,184,150,0.08)' }}
      >
        <View style={{ width: 5, height: 5, borderRadius: 3, backgroundColor: '#D4B896' }} />
        <Text style={{ fontSize: 9, fontFamily: 'PlayfairDisplay_700Bold', color: '#D4B896', letterSpacing: 1.8 }}>
          GENTLEMAN
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  editBtnShadow: {
    borderRadius: 24,
    marginBottom: 4,
    ...Platform.select({
      ios: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
      android: { elevation: 6 },
    }),
  },
  editBtn: {
    overflow: 'hidden',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.88)',
    paddingHorizontal: 24,
    paddingVertical: 11,
    backgroundColor: Platform.select({ ios: 'transparent', android: 'rgba(255,255,255,0.72)' }),
  },
  editBtnFill: {
    backgroundColor: 'rgba(255,255,255,0.65)',
    borderRadius: 24,
  },
  editBtnLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1C1C',
    letterSpacing: 0.3,
  },
});
