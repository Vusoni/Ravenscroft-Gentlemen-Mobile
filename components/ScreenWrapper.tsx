// components/ScreenWrapper.tsx
import { ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface Props {
  children: ReactNode;
  scrollable?: boolean;
  className?: string;
}

export function ScreenWrapper({ children, scrollable = false, className }: Props) {
  const inner = scrollable ? (
    <ScrollView
      className="flex-1"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ flexGrow: 1 }}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  ) : (
    <View className="flex-1">{children}</View>
  );

  return (
    <SafeAreaView className={`flex-1 bg-ivory ${className ?? ''}`}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {inner}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
