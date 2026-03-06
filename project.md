# Ravenscroft — Project Document

## Overview

**Ravenscroft** is an iOS-first self-mastery companion for the modern gentleman. It provides a curated reading experience, AI-powered literary guidance, and personalised content around stoicism, philosophy, morning rituals, and intellectual pursuits — all wrapped in a refined glassmorphic aesthetic.

- **Platform**: iOS (React Native / Expo), Android-compatible
- **Design philosophy**: Glassmorphism · Playfair Display typography · Minimal ivory palette
- **Status**: Early MVP — core screens built, AI and content layers in progress

---

## Vision & Mission

> "You already know the man you should be."

Ravenscroft exists to help men who invest in personal development close the gap between who they are and who they want to become — through the discipline of great books, stoic philosophy, and intentional daily practice.

**Target user**: Men aged 25–45 who value intellectual growth, self-discipline, and aesthetic quality in the tools they use. They read Marcus Aurelius, keep a journal, and believe how you do anything is how you do everything.

---

## Core Objectives

1. **Curated book library** — Surface the right books (classics, stoicism, philosophy, self-mastery) based on the user's declared interests
2. **AI reading companion** — Let users interrogate books with Claude: ask questions, get summaries, extract insights
3. **Distraction-free reader** — A clean, focused reading environment for public domain texts (Gutenberg)
4. **Personal annotations** — Per-book notes tied to page position
5. **Editorial content** — Commissioned articles on lifestyle, philosophy, and craft (delivered via Sanity CMS)
6. **Intentional onboarding** — Collect interests and date of birth to personalise the entire experience from day one
7. **Daily ritual layer** (future) — Morning check-ins, habit streaks, journaling prompts

---

## Feature Status

### Implemented

| Feature | Details |
|---|---|
| Onboarding flow | 5 screens: typewriter intro, hero manifesto, portrait grid (sound), interest chips, DOB picker |
| Interest personalisation | 8 tags: Exercise, Literature, Stoicism, Journaling, Travel & Culture, Music, Theatre & Cinema, Morning Rituals |
| Home feed | Article card with "Generate Summary" CTA, article preview card |
| Article detail screen | Full article view with title, category, body, and bullet summary |
| Books — My Library | Add/remove books, persisted to AsyncStorage via `booksStore` |
| Books — Discover | Trending books from Open Library API with curated fallback list |
| Books — For You | Google Books API filtered by user's onboarding interests |
| Books — Search | Animated glass search bar, debounced Google Books API query |
| Book cards | Cover image (or letter fallback), title, author, library badge, relative timestamp |
| Glass tab bar | Floating frosted-glass pill with 5 tabs, spring animations, haptic feedback |
| Navigation structure | Expo Router with (onboarding) and (home) route groups + nested (tabs) |
| Local state persistence | Zustand stores (onboarding, books, chat, notes) all synced to AsyncStorage |
| Glassmorphic UI | BlurView on iOS, semi-transparent overlay fallback on Android |
| Welcome modal | First-launch guide modal on the home feed |

### In Progress

| Feature | Details |
|---|---|
| Book reader | Page-turning interface for Gutenberg texts, reading progress tracking via `booksStore` |
| Book detail screen | Cover, description, metadata, add-to-library CTA, open-in-reader button |
| Book notes | Per-book annotations with page index, stored in `notesStore` |
| AI assistant chat | Claude API integration — ask questions about books, get chapter summaries |
| App guide screen | Post-onboarding walkthrough of app features |

### Planned

| Feature | Priority | Details |
|---|---|---|
| Article feed from CMS | High | Pull articles from Sanity CMS (already integrated as MCP), show in home feed |
| Profile screen | High | Display name, avatar, interests, reading stats, edit preferences |
| Messages / community | Medium | Curated discussion threads or peer messaging |
| Push notifications | Medium | Morning ritual reminders, new article alerts |
| Full-text search | Medium | Search across library, articles, and notes |
| Reading streaks | Low | Daily reading habit tracking with streak counter |
| Journaling prompts | Low | Daily stoic prompt tied to the user's current book |
| Offline mode | Low | Cache books and articles for offline reading |

---

## Screen Map

```
app/
  index.tsx                          — Onboarding gate (AsyncStorage check)
  (onboarding)/
    screen-1-ravenscroft.tsx         — Typewriter brand reveal
    screen-2-gentleman.tsx           — Hero image + manifesto copy
    screen-3-soundtrack.tsx          — Portrait grid (multi-select)
    screen-4-interests.tsx           — Interest chip selection
    screen-5-birth.tsx               — Date of birth picker → completeOnboarding()
  (home)/
    (tabs)/
      index.tsx                      — Articles feed (tab 1)
      books.tsx                      — Books library (tab 2)
      messages.tsx                   — Messages / community (tab 3) [placeholder]
      assistant.tsx                  — AI assistant (tab 4) [placeholder]
      profile.tsx                    — Profile (tab 5) [placeholder]
    article.tsx                      — Article detail
    book-detail.tsx                  — Book metadata + CTA
    book-reader.tsx                  — In-app reader
    book-notes.tsx                   — Per-book notes
    app-guide.tsx                    — Feature walkthrough
```

---

## Technical Architecture

### Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 55 · React Native 0.83.2 · React 19.2 |
| Language | TypeScript (strict) |
| Routing | Expo Router v55 (file-based) |
| Styling | NativeWind v4 + Tailwind CSS v3 |
| Animations | Reanimated v4.2 + react-native-worklets v0.7 |
| State | Zustand v5 + AsyncStorage v2 |
| Typography | @expo-google-fonts/playfair-display |
| Icons | lucide-react-native + react-native-svg |
| Glass effects | expo-blur (iOS BlurView) |
| Gradients | expo-linear-gradient |
| AI | Claude API (Anthropic) — planned |
| CMS | Sanity (articles and editorial content) |
| Book data | Google Books API + Open Library API |
| Book texts | Project Gutenberg (public domain) |

### State Management

| Store | Responsibility |
|---|---|
| `onboardingStore` | selectedInterests, dateOfBirth, completion flag |
| `booksStore` | library[], readingProgress{}, hydrate/add/remove |
| `chatStore` | AI chat messages per book (capped at 100) |
| `notesStore` | User annotations per book with page index |

All stores persist to AsyncStorage and call `hydrate()` on app start.

### Key External APIs

- **Google Books API** — book search and For You recommendations
- **Open Library API** — trending/discover books
- **Project Gutenberg** — free book texts for the in-app reader
- **Sanity CMS** — editorial articles and lifestyle content
- **Anthropic Claude API** — AI book companion (planned)

---

## Design System

### Color Tokens

| Token | Hex | Usage |
|---|---|---|
| `ivory` | `#EDEDED` | Primary background |
| `ink` | `#0A0A0A` | Primary text, CTAs, active states |
| `charcoal` | `#1C1C1C` | Secondary text |
| `muted` | `#6B6B6B` | Captions, metadata |
| `border` | `#D4D4D4` | Dividers, inactive borders |
| `surface` | `#F5F5F5` | Subtle elevated surfaces |

### Typography

- **Playfair Display 400** — body text, captions
- **Playfair Display 700** — headings, titles
- **Playfair Display 400 Italic** — pull quotes, manifesto copy
- **Playfair Display 700 Italic** — hero display text

### Motion Principles

- All interactive elements use spring animations (damping 18, stiffness 180)
- Scale feedback: buttons press to 0.96, chips to 0.88–0.92
- Tab switching: icon scale + opacity spring + active pill slide
- No tweens for user-initiated interactions — springs only

### Glass Surface Rules

- iOS: `BlurView` with `intensity` prop (typically 60–80)
- Android: Semi-transparent overlay (ink/8 or white/10)
- Always: white hairline border top/left + dark hairline bottom/right for depth
- Shadow: iOS shadow properties; Android elevation

---

## Project Structure

```
/
  app/              — Expo Router screens
  components/       — Shared UI components
  store/            — Zustand state stores
  types/            — TypeScript interfaces (Book, UserNote, etc.)
  constants/        — Static data (colors, Gutenberg map, book summaries)
  assets/           — Images and static files
  global.css        — Tailwind directives
  tailwind.config.js
  babel.config.js
  metro.config.js
```

---

## Development

```bash
# Start development server
npx expo start --clear

# Run on iOS simulator
npx expo start --ios

# Run on Android
npx expo start --android

# Type check
npx tsc --noEmit

# Export for production
npx expo export --platform ios
```

---

## AsyncStorage Keys

| Key | Value |
|---|---|
| `ravenscroft_onboarding_complete` | `'true'` |
| `ravenscroft_interests` | JSON string array |
| `ravenscroft_dob` | ISO date string |
| `ravenscroft_library` | JSON array of `Book` objects |
| `ravenscroft_reading_progress` | JSON object `{bookId: pageIndex}` |
| `ravenscroft_chats` | JSON object `{bookId: ChatMessage[]}` |
| `ravenscroft_notes` | JSON object `{bookId: UserNote[]}` |
| `ravenscroft_guide_shown` | `'true'` |
