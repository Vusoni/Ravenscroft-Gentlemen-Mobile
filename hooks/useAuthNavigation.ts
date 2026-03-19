import { router } from 'expo-router';
import { useCallback } from 'react';
import { useOnboardingStore } from '@/store/onboardingStore';

export function useAuthNavigation() {
  const checkOnboardingStatus = useOnboardingStore((s) => s.checkOnboardingStatus);

  const navigateAfterAuth = useCallback(async () => {
    const done = await checkOnboardingStatus();
    router.replace(done ? '/(home)' : '/(onboarding)');
  }, [checkOnboardingStatus]);

  return { navigateAfterAuth };
}
