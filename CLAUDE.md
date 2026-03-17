# Ravenscroft

iOS-first self-mastery companion for men. Curated classic literature, AI literary guidance, stoic philosophy, journaling, and personal grooming — wrapped in a premium glassmorphic UI. Early MVP, active development.

---

## Vision

Ravenscroft is a private club for intellectual growth. The experience combines hand-picked classic books (Project Gutenberg / Google Books / Open Library), a Claude-powered literary assistant, stoic philosophy, and editorial content into one cohesive, premium iOS app.

**Target user**: Men 25–45 interested in self-improvement, classic literature, Stoicism, Marcus Aurelius, Ryan Holiday, Robert Greene. Digital gentleman's club.

**What makes it different**: The aesthetic. Every screen should feel like holding a leather-bound book. No clutter, no gamification, no streaks — quiet, purposeful design.

**Monetisation (future)**: Subscription model. Premium reading list, advanced AI features, exclusive editorial content.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 55, React Native 0.83.2, React 19.2, TypeScript strict |
| Routing | Expo Router v55 (file-based, typed routes enabled) |
| Styling | NativeWind v4 + **Tailwind CSS v3** (NOT v4) |
| Animations | Reanimated v4.2 + react-native-worklets v0.7 |
| State | Zustand v5 + AsyncStorage v2 (all stores persist + hydrate on launch) |
| Auth | Supabase (email/password, Google OAuth, Apple Sign In) |
| Typography | Playfair Display (400, 500, 700, italic variants) via @expo-google-fonts |
| Icons | lucide-react-native + react-native-svg |
| Glass effects | expo-blur (iOS BlurView), semi-transparent fallback (Android) |
| Gradients | expo-linear-gradient |
| CMS | Sanity (editorial articles — planned integration) |
| AI | Claude API (assistant framework ready, API integration pending) |
| Book data | Google Books API + Open Library API + Project Gutenberg |
| Compiler | React Compiler enabled (experimental) |

---

## Commands

```bash
npx expo start --clear          # Dev server (clear cache)
npx expo start --ios            # iOS simulator
npx expo start --android        # Android emulator
npx tsc --noEmit                # Type check
npx expo lint                   # Lint
npx expo export --platform ios  # Production export
```

---

## Project Structure

```
app/
  _layout.tsx                     # Root layout — fonts, Supabase auth listener, providers
  index.tsx                       # Auth + onboarding gate with splash animation
  (auth)/
    _layout.tsx                   # Auth stack (slide animation)
    sign-in.tsx                   # Email/password, Google OAuth, Apple Sign In
    sign-up.tsx                   # Registration with email sanitization
  (onboarding)/
    _layout.tsx
    index.tsx                     # Redirect → screen-1
    screen-1-ravenscroft.tsx      # Typewriter animation intro
    screen-2-gentleman.tsx        # Hero image + copy
    screen-3-soundtrack.tsx       # 3x4 portrait grid (music selection)
    screen-4-interests.tsx        # Multi-select interest chips
    screen-5-birth.tsx            # Date picker → completeOnboarding
  (home)/
    _layout.tsx                   # Home stack (12 routes)
    index.tsx                     # Feed with welcome modal
    (tabs)/
      _layout.tsx                 # Tab bar with GlassTabBar (5 tabs)
      index.tsx                   # Feed / articles
      books.tsx                   # Library — search, discover, For You shelf
      journal.tsx                 # Journal entries by mood/category
      assistant.tsx               # AI assistant chat
      profile.tsx                 # Account, settings, appearance
    article.tsx                   # Article detail
    book-detail.tsx               # Book metadata + add to library
    book-reader.tsx               # In-app EPUB/text reader
    book-notes.tsx                # Per-book annotations
    journal-entry.tsx             # New/edit journal entry
    journal-detail.tsx            # Journal entry detail view
    appearance-setup.tsx          # Face shape, hair, beard, skin tone profile
    wardrobe.tsx                  # Outfit management
    kindle-import.tsx             # Kindle Clippings file import
    app-guide.tsx                 # Feature walkthrough

components/
  GlassTabBar.tsx                 # Frosted glass tab bar (BlurView iOS, fallback Android)
  GlassCard.tsx                   # Reusable glass surface (blur + tinted overlay + hairline border)
  ScreenWrapper.tsx               # SafeArea + KeyboardAvoidingView wrapper
  ContinueButton.tsx              # Animated CTA with spring
  OnboardingProgress.tsx          # Progress dots
  InterestTag.tsx                 # Toggleable interest chip
  WritingAnimation.tsx            # Typewriter text reveal
  ImportButton.tsx                # Document picker trigger
  KindleHighlightCard.tsx         # Kindle clipping display card

store/                            # Zustand v5 — all persist to AsyncStorage
  authStore.ts                    # Supabase auth (email, OAuth, Apple)
  onboardingStore.ts              # Interests, DOB, completion flag
  booksStore.ts                   # Library, reading progress
  chatStore.ts                    # Per-book AI chat (cap 100/book)
  notesStore.ts                   # Per-book annotations
  assistantStore.ts               # General AI assistant messages (cap 100)
  journalStore.ts                 # Journal entries (category/mood/date)
  appearanceStore.ts              # User appearance profile
  kindleStore.ts                  # Kindle clippings, books, import records
  soundtrackStore.ts              # Selected songs from onboarding

types/
  book.ts                         # Book, NoteSet, UserNote
  journal.ts                      # JournalEntry, Mood, JournalCategory
  kindle.ts                       # KindleClipping, KindleBook, ImportRecord
  appearance.ts                   # FaceShape, HairType, BeardStyle, SkinTone
  song.ts                         # Song
  wardrobe.ts                     # Wardrobe/outfit types

constants/
  colors.ts                       # Design tokens (ivory, ink, charcoal, muted, border, surface)
  interests.ts                    # Interest options array
  journalPrompts.ts               # Writing prompts by category
  bookSummaries.ts                # Curated book metadata (22KB)
  gutenbergMap.ts                 # Project Gutenberg ID mappings
  articles.ts                     # Editorial content with categories
  mockNotes.ts                    # Sample annotations
  outfits.ts                      # Sample wardrobe data

lib/
  supabase.ts                     # Supabase client (AsyncStorage session, auto-refresh)
  kindleParser.ts                 # Kindle Clippings.txt parser
  kindleMatcher.ts                # Fuzzy match Kindle books → library
```

---

## Design Tokens

Defined in `tailwind.config.js` and mirrored in `constants/colors.ts`:

| Token | Hex | Usage |
|---|---|---|
| `ivory` | #EDEDED | App background |
| `ink` | #0A0A0A | Primary text, CTAs |
| `charcoal` | #1C1C1C | Secondary text |
| `muted` | #6B6B6B | Captions, metadata |
| `border` | #D4D4D4 | Dividers, hairlines |
| `surface` | #F5F5F5 | Elevated surfaces, card fills |

---

## Path Aliases

`@/*` maps to project root (configured in `tsconfig.json`).

---

## Auth

**Provider**: Supabase (email/password + Google OAuth + Apple Sign In).

**Guest mode**: Users can skip auth via "Continue without account" on both sign-in and sign-up screens — they just won't have cloud sync.

**Auth flow**: `app/index.tsx` gates on auth status + onboarding completion. `app/_layout.tsx` listens to `onAuthStateChange` and syncs user data to `authStore`.

**Email sanitization** (required — iOS keyboards insert invisible unicode):
```
email.replace(/[\s\u00a0\u200b\u200c\u200d\ufeff]+/g, '').toLowerCase()
```

**Email field props** (always apply together):
```
textContentType="emailAddress"
keyboardType="email-address"
autoCorrect={false}
spellCheck={false}
```

**Sign-up response**: Returns `'ok' | 'confirm_email' | false`. Handle the `confirm_email` case with a user-facing message.

---

## State Management

All Zustand stores follow the same pattern: **state + actions + `hydrate()` function**. Every store persists to AsyncStorage immediately on mutation. All AsyncStorage keys are prefixed with `ravenscroft_`.

| Store | File | Purpose | Key(s) |
|---|---|---|---|
| authStore | `store/authStore.ts` | User auth (Supabase-managed session) | Supabase internal |
| onboardingStore | `store/onboardingStore.ts` | Interests, DOB, completion | `_onboarding_complete`, `_interests`, `_dob` |
| booksStore | `store/booksStore.ts` | Library, reading progress | `_library`, `_reading_progress` |
| chatStore | `store/chatStore.ts` | Per-book AI chat (cap 100/book) | `_chats` |
| notesStore | `store/notesStore.ts` | Per-book annotations | `_notes` |
| assistantStore | `store/assistantStore.ts` | General AI assistant (cap 100) | `_assistant_chat` |
| journalStore | `store/journalStore.ts` | Journal entries | `_journal` |
| appearanceStore | `store/appearanceStore.ts` | Appearance profile | `_appearance` |
| kindleStore | `store/kindleStore.ts` | Kindle clippings, books, imports | `_kindle_clippings`, `_kindle_books`, `_kindle_imports` |
| soundtrackStore | `store/soundtrackStore.ts` | Onboarding music picks | `_soundtrack` |

---

## Key Conventions

### Animations
- All interactive elements use **spring animations**: `damping: 18, stiffness: 180`. No tweens.
- `AnimatedPressable` pattern: scale to 0.82 on press, spring back to 1.
- Reanimated v4 worklet callbacks need `'worklet'` directive or `runOnJS` for JS-thread calls.

### Glass surfaces
- iOS: `BlurView` (intensity ~52, tint `systemChromeMaterialLight`)
- Android: semi-transparent overlay fallback
- White hairline border top + left, dark hairline bottom + right

### Styling
- NativeWind `className` props (Tailwind v3 syntax only)
- Opacity modifiers on custom tokens work: `text-muted/60`
- `ScreenWrapper` for every screen (SafeArea + KeyboardAvoidingView)
- `GlassCard` for every elevated surface

### Typography
- Playfair Display for headings (loaded via `useFonts` in root layout)
- System font for body text

### Tab bar
- Custom `GlassTabBar` component (5 tabs: Feed, Books, Journal, Assistant, Profile)
- Tab icons: `Newspaper`, `BookOpen`, `NotebookPen`, `Sparkles`, `User` (lucide)
- Active state: ink fill pill + 4px dot below icon + icon colour shift
- `TAB_BAR_HEIGHT = 58`, `TAB_BAR_BOTTOM_OFFSET = 82`

---

## Config Files

| File | Purpose |
|---|---|
| `babel.config.js` | NativeWind JSX source + worklets plugin |
| `metro.config.js` | NativeWind metro wrapper (`global.css` input) |
| `tailwind.config.js` | Design tokens, Playfair font families, content paths |
| `tsconfig.json` | Strict mode, `@/*` path alias |
| `app.json` | Expo config — SDK 55, typed routes, React Compiler, `com.ravenscroft.app` bundle ID |
| `global.css` | Tailwind directives |
| `.env` | Supabase URL/keys, Google Client ID, Anthropic key (rotate before prod) |

---

## Feature Status

### Shipped
- 5-screen onboarding flow (typewriter, hero, soundtrack, interests, DOB)
- Supabase auth (email/password, Google OAuth, Apple Sign In, guest skip)
- Books library with Open Library + Google Books search, "For You" shelf
- Reading progress tracking
- Per-book notes/annotations
- Journal system (mood, category, prompts)
- Kindle Clippings import with dedup + fuzzy matching
- Appearance profile (face shape, hair, beard, skin tone)
- Wardrobe/outfit management
- AI assistant chat (UI framework — API not yet connected)
- Editorial articles feed with categories
- Glassmorphic UI throughout (GlassTabBar, GlassCard, BlurView)
- Spring animations on all interactive elements
- Full AsyncStorage persistence across all stores
- TypeScript strict mode

### In Progress
- Auth flow refinement (error handling, edge cases)

### Planned
- Claude API integration for AI literary assistant
- Sanity CMS connection for editorial content
- Supabase cloud sync for cross-device data
- Subscription / paywall
- App Store submission

---

## Rules

- **Do not** use Tailwind CSS v4 syntax — this project uses v3
- **Do not** add real image assets without asking — all hero/portrait images are `View` placeholders
- **Do not** use tween/timing animations for interactions — springs only
- **Do not** break the glassmorphic design language
- **Do not** add `.env` values to version control — keys must be rotated before production
- **Do** sanitize email inputs before any Supabase call
- **Do** use `GlassCard` for elevated surfaces and `ScreenWrapper` for screen containers
- **Do** follow the existing Zustand store pattern (state + actions + `hydrate()`)
- **Do** prefix all AsyncStorage keys with `ravenscroft_`
- **Do** use spring configs `{ damping: 18, stiffness: 180 }` for interactive animations
