// app/(home)/_layout.tsx
import { Stack } from 'expo-router';

export default function HomeLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#EDEDED' } }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(tabs)" options={{ animation: 'none' }} />
      <Stack.Screen name="article" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="book-detail" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="book-notes" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
