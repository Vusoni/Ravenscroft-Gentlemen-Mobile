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
      <Stack.Screen name="book-reader" options={{ animation: 'slide_from_right' }} />
      <Stack.Screen name="app-guide" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="journal-entry" options={{ animation: 'slide_from_bottom' }} />
      <Stack.Screen name="journal-detail" options={{ animation: 'slide_from_right' }} />
    </Stack>
  );
}
