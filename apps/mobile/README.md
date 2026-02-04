# Chopsticks Mobile App

A React Native mobile app that connects food enthusiasts for shared meal experiences.

## Overview

Chopsticks helps users discover authentic street food and find meal companions based on shared food preferences, location, time, and budget. The app focuses on building genuine connections through food, targeting Gen Z and young professionals in Vietnamese cities.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | React Native 0.81.5 + Expo 54 |
| Routing | Expo Router (file-based) |
| State | Zustand 5.0.3 |
| Styling | NativeWind (Tailwind) + StyleSheet |
| Forms | React Hook Form + Zod |
| Backend | Supabase (PostgreSQL + Auth + Realtime) |
| Testing | Jest + React Testing Library |

## Project Structure

```
apps/mobile/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Authentication flow
│   │   ├── _layout.tsx    # Auth stack layout
│   │   ├── login.tsx      # Phone input screen
│   │   └── verify.tsx     # OTP verification
│   ├── (onboarding)/      # User onboarding
│   │   ├── _layout.tsx
│   │   ├── profile.tsx    # Profile setup
│   │   └── preferences.tsx # Food preferences
│   ├── (tabs)/            # Main app tabs
│   │   ├── _layout.tsx    # Tab navigation
│   │   ├── index.tsx      # Match feed
│   │   ├── discover.tsx   # Restaurant discovery
│   │   ├── chat.tsx       # Messaging
│   │   └── profile.tsx    # User profile
│   ├── _layout.tsx        # Root layout with auth guard
│   └── modal.tsx          # Shared modal
├── components/            # Reusable UI components
├── stores/                # Zustand state stores
│   ├── auth.ts           # Authentication state
│   └── matches.ts        # Match management
├── lib/
│   └── supabase.ts       # Supabase client config
├── types/
│   ├── index.ts          # App type definitions
│   └── database.ts       # Database schema types
├── __tests__/            # Test files
│   └── login.test.tsx    # Login screen tests
├── assets/               # Images, fonts
├── constants/            # App constants
├── hooks/                # Custom React hooks
└── utils/                # Helper functions
```

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- pnpm 10.x
- Xcode (for iOS development)
- Android Studio (for Android development)

### Environment Setup

Create `.env` in the mobile app directory:

```env
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
EXPO_PUBLIC_MAPBOX_TOKEN=your-mapbox-token  # Optional
```

### Installation

```bash
# From monorepo root
pnpm install

# Start development server
pnpm dev

# Or start with iOS simulator
pnpm dev --ios

# Or start with Android emulator
pnpm dev --android
```

### Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage
```

## Authentication Flow

1. **Login Screen** (`/app/(auth)/login.tsx`)
   - User enters phone number with +84 country code
   - Supabase sends SMS OTP

2. **Verify Screen** (`/app/(auth)/verify.tsx`)
   - User enters 6-digit OTP code
   - On success, checks if user profile exists

3. **Onboarding** (`/app/(onboarding)/`)
   - New users complete profile (name, age, bio, photo)
   - Set food preferences (cuisines, budget, dietary restrictions)

4. **Main App** (`/app/(tabs)/`)
   - Authenticated users access the main tab navigation

### Dev Bypass

For development, tap "Skip to App (Dev)" on the login screen to bypass authentication with mock user data.

## State Management

### Auth Store (`stores/auth.ts`)

```typescript
interface AuthState {
  session: Session | null;
  user: User | null;
  preferences: UserPreferences | null;
  isLoading: boolean;
  isOnboarded: boolean;
  devBypass: boolean;

  // Actions
  initialize(): Promise<void>;
  signInWithPhone(phone: string): Promise<{ error: Error | null }>;
  verifyOtp(phone: string, token: string): Promise<{ error: Error | null }>;
  signOut(): Promise<void>;
  updateProfile(data: Partial<User>): Promise<{ error: Error | null }>;
  updatePreferences(data: Partial<UserPreferences>): Promise<{ error: Error | null }>;
  enableDevBypass(): void;
}
```

### Matches Store (`stores/matches.ts`)

Handles match fetching, filtering, and lifecycle (send request, accept, decline, complete).

## Type Definitions

### User

```typescript
interface User {
  id: string;
  email?: string;
  phone: string;
  name: string;
  age: number;
  bio?: string;
  profileImageUrl?: string | null;
  verificationStatus: 'pending' | 'verified' | 'rejected';
  mealCount: number;
}
```

### UserPreferences

```typescript
interface UserPreferences {
  cuisineTypes: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  budgetMin: number;
  budgetMax: number;
  preferredRadiusKm: number;
}
```

### Match

```typescript
interface Match {
  id: string;
  userId: string;
  matchedUserId: string;
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'completed';
  restaurant?: Restaurant;
  scheduledAt?: string;
  expiresAt: string;
  createdAt: string;
}
```

## Styling

The app uses a dark theme with the following color palette:

| Color | Hex | Usage |
|-------|-----|-------|
| Primary | `#f97316` | Orange - CTAs, highlights |
| Secondary | `#d946ef` | Purple - accents |
| Background | `#0a0a0a` | Near-black background |
| Surface | `#171717` | Card backgrounds |
| Surface Elevated | `#262626` | Elevated elements |

### Styling Approach

- **NativeWind** for utility-first styling via `className`
- **StyleSheet** for complex components (better performance)
- Brand colors defined in `tailwind.config.js`

## Key Features

### Implemented
- Phone-based OTP authentication
- Secure token storage (Expo SecureStore)
- User profile creation and editing
- Food preferences management
- Tab-based navigation
- Dark theme UI
- Dev bypass mode for testing

### Placeholder (UI Only)
- Match feed with swipe cards
- Restaurant discovery with filters
- Chat list with conversations
- Profile stats and settings

### Not Started
- Matching algorithm
- Real-time chat (WebSocket)
- Map integration (Mapbox)
- Push notifications
- Image upload to storage
- AI-powered recommendations

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm dev` | Start Expo dev server |
| `pnpm dev --ios` | Start with iOS simulator |
| `pnpm dev --android` | Start with Android emulator |
| `pnpm test` | Run Jest tests |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage |
| `pnpm lint` | Run ESLint |
| `pnpm clean` | Remove node_modules and .expo |

## Troubleshooting

### TextInput not working
The app uses `StyleSheet` instead of NativeWind `className` for TextInput components due to touch handling issues.

### expo-secure-store SSR crash
The Supabase client includes platform checks to prevent SecureStore from crashing during SSR in expo-router.

### Metro bundler port conflict
Kill existing processes: `lsof -ti:8081 | xargs kill -9`

## Contributing

1. Create a feature branch
2. Make changes with tests
3. Run `pnpm test` and `pnpm lint`
4. Submit a pull request

## License

Private - All rights reserved
