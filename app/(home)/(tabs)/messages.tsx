// app/(home)/(tabs)/messages.tsx
import { TAB_BAR_BOTTOM_OFFSET } from '@/components/GlassTabBar';
import { MessageSquare } from 'lucide-react-native';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function MessagesTab() {
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView className="flex-1 bg-ivory" edges={['top']}>
      <View className="flex-1 items-center justify-center px-8">
        <MessageSquare size={36} color="#D4D4D4" strokeWidth={1} />
        <Text
          className="text-ink text-2xl mt-5 mb-2"
          style={{ fontFamily: 'PlayfairDisplay_700Bold' }}
        >
          Messages
        </Text>
        <Text
          className="text-muted text-sm text-center leading-5"
          style={{ fontFamily: 'PlayfairDisplay_400Regular_Italic' }}
        >
          Correspondence befitting a gentleman.
        </Text>
        <Text className="text-border text-xs mt-2 tracking-widest uppercase">
          Coming soon
        </Text>
      </View>
      <View style={{ height: TAB_BAR_BOTTOM_OFFSET + insets.bottom }} />
    </SafeAreaView>
  );
}
