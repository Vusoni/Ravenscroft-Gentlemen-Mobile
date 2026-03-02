// app/index.tsx — onboarding gate
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { View } from 'react-native';
import { useOnboardingStore } from '@/store/onboardingStore';

export default function Index() {
  const [ready, setReady] = useState(false);
  const [onboardingDone, setOnboardingDone] = useState(false);
  const checkOnboardingStatus = useOnboardingStore((s) => s.checkOnboardingStatus);

  useEffect(() => {
    checkOnboardingStatus().then((complete) => {
      setOnboardingDone(complete);
      setReady(true);
    });
  }, [checkOnboardingStatus]);

  if (!ready) {
    return <View className="flex-1 bg-ivory" />;
  }

  return <Redirect href={onboardingDone ? '/(home)' : '/(onboarding)'} />;
}
