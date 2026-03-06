# Ravenscroft - Project Instructions

## What is this?
iOS-first self-mastery companion app for men. Curated reading, AI literary guidance, stoic philosophy, glassmorphic UI. Early MVP stage.

## Stack
- **Framework**: Expo SDK 55, React Native 0.83.2, React 19.2, TypeScript (strict)
- **Routing**: Expo Router v55 (file-based)
- **Styling**: NativeWind v4 + Tailwind CSS v3 (NOT v4)
- **Animations**: Reanimated v4.2 + react-native-worklets v0.7
- **State**: Zustand v5 + AsyncStorage v2 (all stores persist and hydrate on launch)
- **Typography**: Playfair Display (400, 700, italic variants)
- **Icons**: lucide-react-native
- **Glass effects**: expo-blur (iOS BlurView), semi-transparent fallback (Android)
- **CMS**: Sanity (articles/editorial)
- **AI**: Claude API (planned)
- **Book data**: Google Books API + Open Library API + Project Gutenberg

## Commands
```bash
npx expo start --clear    # Dev server (clear cache)
npx expo start --ios      # iOS simulator
npx expo start --android  # Android
npx tsc --noEmit          # Type check
npx expo lint             # Lint
npx expo export --platform ios  # Production export
```

## Project Structure
```
app/
  index.tsx                     # Onboarding gate
  _layout.tsx                   # Root layout (fonts, providers)
  (onboarding)/                 # 5-screen onboarding flow
  (home)/
    (tabs)/                     # 5 tabs: feed, books, messages, assistant, profile
      _layout.tsx               # Tab bar with GlassTabBar
    article.tsx                 # Article detail
    book-detail.tsx             # Book metadata + CTA
    book-reader.tsx             # In-app reader
    book-notes.tsx              # Per-book notes
    app-guide.tsx               # Feature walkthrough
components/                     # Shared UI (GlassCard, GlassTabBar, ScreenWrapper, etc.)
store/                          # Zustand stores (onboarding, books, chat, notes, assistant)
types/                          # TypeScript interfaces (book.ts)
constants/                      # Static data (colors, gutenbergMap, bookSummaries, mockNotes)
```

## Design Tokens (tailwind.config.js)
- `ivory` (#EDEDED) - app background
- `ink` (#0A0A0A) - primary text, CTAs
- `charcoal` (#1C1C1C) - secondary text
- `muted` (#6B6B6B) - captions, metadata
- `border` (#D4D4D4) - dividers
- `surface` (#F5F5F5) - elevated surfaces

## Path Aliases
- `@/*` maps to project root (configured in tsconfig.json)

## Key Conventions
- All interactive elements use **spring animations** (damping 18, stiffness 180), no tweens
- Glass surfaces: BlurView on iOS, semi-transparent overlay on Android, white hairline border top/left
- Reanimated v4 worklet callbacks need `'worklet'` directive or `runOnJS` for JS callbacks
- NativeWind opacity modifiers (e.g. `text-muted/60`) work on custom hex colors
- AsyncStorage keys are prefixed with `ravenscroft_`
- Zustand stores all follow the pattern: state + actions + `hydrate()` function

## State Stores
| Store | File | Purpose |
|---|---|---|
| onboardingStore | store/onboardingStore.ts | Interests, DOB, completion flag |
| booksStore | store/booksStore.ts | Library, reading progress |
| chatStore | store/chatStore.ts | AI chat messages per book (cap 100) |
| notesStore | store/notesStore.ts | Per-book annotations with page index |
| assistantStore | store/assistantStore.ts | AI assistant state |

## What NOT to do
- Do not use Tailwind CSS v4 syntax - this project uses v3
- Do not add real image assets without asking - all hero/portrait images are View placeholders
- Do not use tween/timing animations for user interactions - springs only
- Do not break the glassmorphic design language
