// app/(home)/index.tsx — redirects into the tabs group
import { Redirect } from 'expo-router';

export default function HomeIndex() {
  return <Redirect href="/(home)/(tabs)" />;
}
