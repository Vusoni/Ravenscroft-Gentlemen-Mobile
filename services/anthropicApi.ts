// services/anthropicApi.ts
// Anthropic Claude API client extracted from app/(home)/(tabs)/assistant.tsx.
import { AssistantMessage } from '@/store/assistantStore';

const API_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY ?? '';
const API_URL = 'https://api.anthropic.com/v1/messages';
const MAX_CONTEXT_MESSAGES = 20;

const SYSTEM_PROMPT = [
  'You are "The Ravenscroft" — a refined, articulate AI assistant for a gentleman\'s lifestyle app.',
  'You help with dating, networking, social etiquette, professional situations, and personal development.',
  'Your tone is warm yet direct — like a well-travelled mentor, not a formal butler.',
  'Be practical and specific. Give actionable advice, not generic platitudes.',
  'Keep responses to 2-4 paragraphs unless the question genuinely requires more depth.',
  'When giving advice about social situations, consider nuance and emotional intelligence.',
  'You may use wit sparingly, but substance always comes first.',
].join('\n');

export async function askAssistant(
  messages: AssistantMessage[],
  userInterests: string[],
  signal: AbortSignal,
): Promise<string> {
  const contextLines = [SYSTEM_PROMPT];
  if (userInterests.length > 0) {
    contextLines.push(`\nThe user's interests: ${userInterests.join(', ')}.`);
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      system: contextLines.join('\n'),
      messages: messages.slice(-MAX_CONTEXT_MESSAGES).map((m) => ({
        role: m.role,
        content: m.text,
      })),
    }),
    signal,
  });

  if (!response.ok) {
    const body = await response.text().catch(() => '');
    throw new Error(`API ${response.status}: ${body}`);
  }

  const data = await response.json();
  return (data.content[0]?.text as string) ?? '';
}
