// utils/storageKeys.ts
// Single source of truth for all AsyncStorage keys used across the app.
// All keys are prefixed with 'ravenscroft_' per project convention.
export const STORAGE_KEYS = {
  onboardingComplete: 'ravenscroft_onboarding_complete',
  interests: 'ravenscroft_interests',
  dob: 'ravenscroft_dob',
  soundtrack: 'ravenscroft_soundtrack',
  library: 'ravenscroft_library',
  readingProgress: 'ravenscroft_reading_progress',
  notes: 'ravenscroft_notes',
  chats: 'ravenscroft_chats',
  assistantChat: 'ravenscroft_assistant_chat',
  journal: 'ravenscroft_journal',
  appearance: 'ravenscroft_appearance',
  kindleClippings: 'ravenscroft_kindle_clippings',
  kindleBooks: 'ravenscroft_kindle_books',
  kindleImports: 'ravenscroft_kindle_imports',
} as const;
