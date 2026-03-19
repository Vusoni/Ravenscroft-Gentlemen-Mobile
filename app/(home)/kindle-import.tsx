// app/(home)/kindle-import.tsx
import { router } from 'expo-router';
import { ArrowLeft } from 'lucide-react-native';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function KindleImportScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#EDEDED' }} edges={['top', 'bottom']}>
      <Pressable
        onPress={() => router.back()}
        hitSlop={12}
        style={{ position: 'absolute', top: 56, left: 24, zIndex: 10 }}
      >
        <ArrowLeft size={20} color="#6B6B6B" strokeWidth={1.5} />
      </Pressable>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 }}>
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_400Regular_Italic',
            fontSize: 28,
            color: '#0A0A0A',
            textAlign: 'center',
            letterSpacing: 0.5,
          }}
        >
          Coming soon.
        </Text>
        <Text
          style={{
            fontFamily: 'PlayfairDisplay_400Regular_Italic',
            fontSize: 14,
            color: '#6B6B6B',
            textAlign: 'center',
            marginTop: 12,
            lineHeight: 22,
          }}
        >
          Kindle highlights import is on its way.
        </Text>
      </View>
    </SafeAreaView>
  );
}
