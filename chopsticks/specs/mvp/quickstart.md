# Quickstart: Chopsticks MVP

**Date**: 2026-01-31 | **Plan**: [plan.md](./plan.md)

This guide gets a new developer running the Chopsticks app locally in under 30 minutes.

---

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** 8+ (`npm install -g pnpm`)
- **Expo CLI** (`npm install -g expo-cli`)
- **EAS CLI** (`npm install -g eas-cli`)
- **Supabase CLI** (`brew install supabase/tap/supabase`)
- **iOS Simulator** (Xcode 15+) or **Android Emulator** (Android Studio)
- **Expo Go** app on physical device (optional)

---

## 1. Clone & Install

```bash
# Clone the repository
git clone <repo-url> chopsticks
cd chopsticks/chopsticks

# Install dependencies
pnpm install
```

---

## 2. Environment Setup

### Create Environment File

```bash
cp .env.example .env.local
```

### Required Variables

```bash
# .env.local

# Supabase (from supabase.com dashboard)
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Firebase (from firebase console)
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

---

## 3. Supabase Setup

### Start Local Supabase

```bash
# Start local Supabase (Docker required)
supabase start

# This outputs local credentials - copy them to .env.local
# API URL: http://localhost:54321
# anon key: eyJ...
```

### Run Migrations

```bash
# Apply database schema
supabase db push

# Seed restaurant data (optional)
supabase db seed
```

### Deploy Edge Functions (for production testing)

```bash
supabase functions deploy exchange-firebase-token
supabase functions deploy suggest-people
supabase functions deploy handle-request-cancel
supabase functions deploy delete-account
```

---

## 4. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create project or select existing
3. Enable **Phone Authentication**:
   - Authentication → Sign-in method → Phone → Enable
4. Add iOS app (Bundle ID: `com.chopsticks.app`)
5. Add Android app (Package: `com.chopsticks.app`)
6. Download config files:
   - `GoogleService-Info.plist` → `/ios/`
   - `google-services.json` → `/android/`

### Test Phone Numbers (Development)

Firebase allows test phone numbers that skip actual SMS:

1. Authentication → Sign-in method → Phone → Phone numbers for testing
2. Add: `+84 900 000 001` with code `123456`

---

## 5. Run the App

### iOS Simulator

```bash
# Start Metro bundler + iOS simulator
pnpm ios
```

### Android Emulator

```bash
# Start Metro bundler + Android emulator
pnpm android
```

### Physical Device (Expo Go)

```bash
# Start Metro bundler
pnpm start

# Scan QR code with Expo Go app
```

---

## 6. Development Workflow

### Start All Services

```bash
# Terminal 1: Supabase (if using local)
supabase start

# Terminal 2: Metro bundler
pnpm start

# Terminal 3: iOS or Android
pnpm ios  # or pnpm android
```

### Useful Commands

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Format code
pnpm format

# Reset Metro cache
pnpm start --clear

# Rebuild native code (after config changes)
pnpm expo prebuild --clean
```

---

## 7. Project Structure Overview

```
chopsticks/
├── app/                    # Expo Router screens
│   ├── (auth)/             # Login + 9-step onboarding
│   ├── (tabs)/             # Main tab navigation (browse, chats, notifications, profile)
│   ├── request/            # Request detail, create, pending approvals
│   ├── chat/               # Chat screens
│   ├── settings/           # Settings screens
│   └── _layout.tsx         # Root layout
├── components/             # Reusable UI (ui, chat, request, forms)
├── hooks/                  # Custom hooks + TanStack Query hooks
├── services/               # Supabase, Firebase, notifications
├── stores/                 # Zustand state
├── lib/                    # Utils, types, constants, i18n
├── locales/                # Translation files (en.json, vi.json)
├── supabase/               # Backend
│   ├── migrations/         # SQL migrations
│   ├── functions/          # Edge Functions (3 for MVP)
│   └── seed.sql            # Restaurant seed data
└── assets/                 # Images, fonts
```

---

## 8. Testing on Device

### Build Development Client

For features requiring native modules (maps, notifications):

```bash
# Create development build
eas build --profile development --platform ios
# or
eas build --profile development --platform android

# Install on device and connect to local Metro
```

### Preview Build

For testing production-like behavior:

```bash
eas build --profile preview --platform all
```

---

## 9. Common Issues

### "Metro bundler failed to start"

```bash
# Clear cache and restart
pnpm start --clear
```

### "Supabase connection failed"

```bash
# Check Supabase is running
supabase status

# Restart if needed
supabase stop && supabase start
```

### "Firebase auth not working"

- Verify test phone number is configured
- Check Firebase config files are in correct locations
- Ensure Bundle ID/Package name matches Firebase project

### "Expo Go limitations"

Some features require a development build:
- Push notifications (need device token)
- Face detection (needs ML Kit)

Build a dev client: `eas build --profile development`

---

## 10. Validation Checklist

Before considering setup complete, verify:

- [ ] App launches without errors on iOS simulator
- [ ] App launches without errors on Android emulator
- [ ] Can sign in with test phone number
- [ ] Supabase queries return data
- [ ] TypeScript compiles: `pnpm typecheck`

---

## Next Steps

1. Review [plan.md](./plan.md) for implementation roadmap
2. Review [data-model.md](./data-model.md) for database schema
3. Review [contracts/](./contracts/) for API patterns
4. Run `/speckit.tasks` to generate implementation tasks
