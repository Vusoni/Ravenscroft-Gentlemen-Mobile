import { JournalCategory } from '@/types/journal';

export const JOURNAL_PROMPTS: Record<JournalCategory, string[]> = {
  reflection: [
    'What occupied your mind today?',
    'How did you feel this morning vs. tonight?',
    'What moment stood out from today?',
  ],
  gratitude: [
    'Name three things you are grateful for today.',
    'Who made your day better?',
    'What small comfort did you enjoy today?',
  ],
  lessons: [
    'What did you learn today that surprised you?',
    'What would you do differently?',
    'What mistake taught you something valuable?',
  ],
  goals: [
    'What is one step you took toward your goals today?',
    'Where do you want to be in 90 days?',
    'What habit are you building this week?',
  ],
  ideas: [
    'What sparked your curiosity today?',
    'Describe a breakthrough you had.',
    'What connection between ideas did you notice?',
  ],
};
