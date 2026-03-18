// components/assistant/ScenarioCard.tsx
import { Briefcase, Heart, MessageCircle, Users } from 'lucide-react-native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

export interface Scenario {
  icon: typeof Heart;
  title: string;
  prompt: string;
}

export const SCENARIOS: Scenario[] = [
  {
    icon: Heart,
    title: 'Dating',
    prompt: "I'd like advice on dating. I want to make a great impression — what should I know?",
  },
  {
    icon: Users,
    title: 'Networking',
    prompt: "I have a networking event coming up. How do I approach people naturally and make meaningful connections?",
  },
  {
    icon: Briefcase,
    title: 'Professional',
    prompt: "I need help with a professional situation. How should I handle a difficult workplace conversation?",
  },
  {
    icon: MessageCircle,
    title: 'Etiquette',
    prompt: "I want to improve my social etiquette. What are the fundamentals a modern gentleman should master?",
  },
];

export function ScenarioCard({
  scenario,
  index,
  onPress,
}: {
  scenario: Scenario;
  index: number;
  onPress: () => void;
}) {
  const Icon = scenario.icon;
  return (
    <Animated.View entering={FadeInDown.delay(100 + index * 80).duration(400)}>
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.scenarioCard, pressed && { opacity: 0.7 }]}
      >
        <View style={styles.scenarioIconWrap}>
          <Icon size={18} color="#0A0A0A" strokeWidth={1.5} />
        </View>
        <Text style={styles.scenarioTitle}>{scenario.title}</Text>
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  scenarioCard: {
    width: '47%',
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#D4D4D4',
    borderRadius: 14,
    padding: 16,
    gap: 10,
  },
  scenarioIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(10,10,10,0.06)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scenarioTitle: {
    fontFamily: 'PlayfairDisplay_700Bold',
    fontSize: 14,
    color: '#0A0A0A',
  },
});
