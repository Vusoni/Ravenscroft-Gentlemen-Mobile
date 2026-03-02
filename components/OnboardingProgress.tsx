// components/OnboardingProgress.tsx
import { View } from 'react-native';

interface Props {
  total: number;
  current: number; // 0-indexed
}

export function OnboardingProgress({ total, current }: Props) {
  return (
    <View className="flex-row items-center justify-center gap-2 py-4">
      {Array.from({ length: total }).map((_, i) => (
        <View
          key={i}
          className={`rounded-full ${
            i === current ? 'w-5 h-[5px] bg-ink' : 'w-[5px] h-[5px] bg-border'
          }`}
        />
      ))}
    </View>
  );
}
