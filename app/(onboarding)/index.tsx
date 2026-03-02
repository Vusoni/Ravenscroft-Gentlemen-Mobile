// app/(onboarding)/index.tsx — redirect to first screen
import { Redirect } from 'expo-router';

export default function OnboardingIndex() {
  return <Redirect href="/(onboarding)/screen-1-ravenscroft" />;
}
