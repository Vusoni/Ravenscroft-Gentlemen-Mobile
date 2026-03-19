<h2>Preview</h2>
<p align="center">
<img src="https://github.com/Vusoni/Ravenscroft-Gentlemen-Mobile/blob/1355277e4c482d946d18960409c6a4df6d6330a1/Design/Ravenscroft.png" width="700" />
</p>

# Ravenscroft

> *"You already know the man you should be."*

A high-end self-mastery mobile app for modern gentlemen — stoicism, literature, morning rituals, intellectual pursuits.

---

## Stack

| Layer | Technology |
|---|---|
| Framework | Expo SDK 54 · React Native 0.81.5 |
| Routing | Expo Router v6 (file-based) |
| Styling | NativeWind v4 + Tailwind CSS v3 |
| Animations | Reanimated v4 + react-native-worklets |
| State | Zustand v5 |
| Persistence | AsyncStorage v2 |
| Typography | Playfair Display (Google Fonts) |
| Icons | Lucide React Native |
| Date Picker | @react-native-community/datetimepicker |
| Language | TypeScript (strict) |

---

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Fill in your values inside `.env` (see `.env.example` for all required keys).

### 3. Start the dev server

```bash
npx expo start --clear
```

Scan the QR code with **Expo Go** (iOS / Android) or press `i` for iOS Simulator.

---

## Project structure

```
app/
├── _layout.tsx                   # Root layout — fonts, providers, status bar
├── index.tsx                     # Onboarding gate (checks AsyncStorage)
│
├── (onboarding)/
│   ├── _layout.tsx
│   ├── index.tsx                 # → redirects to screen-1
│   ├── screen-1-ravenscroft.tsx  # Typewriter animation intro
│   ├── screen-2-gentleman.tsx    # Hero image + manifesto copy
│   ├── screen-3-soundtrack.tsx   # 3×4 selectable portrait grid
│   ├── screen-4-interests.tsx    # Multi-select interest chips
│   └── screen-5-birth.tsx        # Date of birth picker → completes onboarding
│
└── (home)/
    ├── _layout.tsx
    ├── index.tsx                 # Feed card + article preview
    └── article.tsx               # Article detail screen

components/
├── ContinueButton.tsx            # Black pill CTA with spring press
├── InterestTag.tsx               # Animated chip with toggle state
├── OnboardingProgress.tsx        # 5-dot progress indicator
├── ScreenWrapper.tsx             # SafeAreaView + KeyboardAvoidingView
└── WritingAnimation.tsx          # Typewriter letter-by-letter animation

store/
└── onboardingStore.ts            # Zustand: interests, DOB, completeOnboarding()

constants/
└── colors.ts                     # Design tokens
```

---

## Design tokens

| Token | Hex | Usage |
|---|---|---|
| `ivory` | `#EDEDED` | App background |
| `ink` | `#0A0A0A` | Primary text, CTAs |
| `charcoal` | `#1C1C1C` | Secondary text, dark surfaces |
| `muted` | `#6B6B6B` | Captions, metadata |
| `border` | `#D4D4D4` | Dividers, card borders |
| `surface` | `#F5F5F5` | Subtle card backgrounds |

---

## Onboarding flow

```
Screen 1  →  Screen 2  →  Screen 3  →  Screen 4  →  Screen 5
Ravenscroft  Gentleman     Soundtrack   Interests    Birth date
(typewriter) (hero image)  (portrait    (chips +     (spinner
                           grid)        pursuits)    picker)
                                                        ↓
                                               AsyncStorage persists
                                               interests + DOB, then
                                               navigates to Home
```

On subsequent launches the gate (`app/index.tsx`) reads `ravenscroft_onboarding_complete` from AsyncStorage and skips directly to Home.

---

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `EXPO_PUBLIC_ANTHROPIC_API_KEY` | For AI feature | Anthropic API key for Generate Summary |
| `EXPO_PUBLIC_APP_ENV` | No | `development` \| `staging` \| `production` |

All `EXPO_PUBLIC_*` variables are bundled into the client. Never put secrets in non-`EXPO_PUBLIC_` variables.

---

## Scripts

```bash
npx expo start           # Start dev server
npx expo start --clear   # Clear Metro cache and start
npx expo start --ios     # Open in iOS Simulator directly
npx tsc --noEmit         # TypeScript check (no build output)
npx expo export          # Production bundle
```

---

## Adding real images

Replace the placeholder `View` boxes with real assets:

1. Add images to `assets/images/`
2. In `screen-2-gentleman.tsx`, replace the hero `View` with:
   ```tsx
   <Image source={require('@/assets/images/gentleman-hero.jpg')} ... />
   ```
3. In `screen-3-soundtrack.tsx`, replace each `PortraitCell`'s inner `View` with an `Image`

---

## Next steps

- **AI Summary** — wire up `EXPO_PUBLIC_ANTHROPIC_API_KEY` to stream Claude summaries into the home feed card
- **Real photography** — replace placeholder views with B&W editorial photography
- **Audio layer** — integrate soundtrack playback on the home screen
- **Daily rituals** — build the morning ritual tracker module
- **Push notifications** — morning check-in reminders via `expo-notifications`
- **EAS Build** — configure `eas.json` for TestFlight distribution
