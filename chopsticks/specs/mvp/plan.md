# Implementation Plan: Chopsticks MVP

**Branch**: `main` | **Date**: 2026-01-31 | **Spec**: [spec.md](./spec.md)

## Summary

Chopsticks is a mobile-first social dining app for Vietnam. Users create meal requests at restaurants, others join, and they share meals together. The MVP targets a pilot of ~100 users in Ho Chi Minh City with ~50 requests/day.

**Technical Approach**: React Native (Expo SDK 52+) frontend with Supabase backend (Postgres + Edge Functions + Realtime). Firebase Auth handles phone OTP; tokens are exchanged for Supabase JWTs. List-based browsing (no map for MVP), Expo Push for notifications.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: Expo SDK 52+, React Native 0.73+, Supabase JS v2, Firebase Auth, TanStack Query v5, Zustand v4, NativeWind v4, react-i18next
**Storage**: Supabase Postgres (managed), Supabase Storage (images), expo-secure-store (tokens)
**Testing**: Manual QA on physical devices (unit/E2E tests deferred post-MVP)
**Target Platform**: iOS 15+, Android 10+
**Project Type**: Mobile (Expo managed workflow)
**Performance Goals**: <3s cold start, <500ms message delivery
**Constraints**: <50MB app size, <1MB photos, online-only with graceful degradation
**Scale/Scope**: ~100 users, ~50 requests/day, HCMC only, ~10 screens

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Evidence |
|-----------|--------|----------|
| I. Mobile-First, Ship Iteratively | PASS | Expo managed workflow, EAS deployment, MVP scope defined |
| II. Security & Privacy by Design | PASS | RLS policies defined for all tables, expo-secure-store for tokens, banned user handling |
| III. Performance is UX | PASS | Performance targets specified in NFRs, graceful degradation defined |
| IV. Expo-Managed Simplicity | PASS | All dependencies are Expo-compatible, no native modules required |
| V. Supabase as Single Backend | PASS | All backend in Supabase; Firebase Auth exception documented |

**Gate Result**: PASSED - No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
chopsticks/specs/mvp/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output (API schemas)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
chopsticks/
├── app/                          # Expo Router screens
│   ├── (auth)/                   # Auth flow (login, onboarding)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── onboarding/
│   │       ├── photo.tsx         # Step 2: Photo upload + face detection
│   │       ├── profile.tsx       # Step 3: Name, age, gender
│   │       ├── city.tsx          # Step 4: City check (HCMC only)
│   │       ├── persona.tsx       # Step 5: Persona selection
│   │       ├── cuisines.tsx      # Step 6: Cuisine preferences
│   │       ├── budget.tsx        # Step 7: Budget preferences
│   │       ├── bio.tsx           # Step 8: Bio
│   │       └── intent.tsx        # Step 9: "Do you know where to eat?"
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx
│   │   ├── index.tsx             # Home: Browse requests (list view)
│   │   ├── chats.tsx             # Chat list
│   │   ├── notifications.tsx
│   │   └── profile.tsx
│   ├── request/
│   │   ├── [id].tsx              # Request detail
│   │   ├── create.tsx            # Create request flow
│   │   └── pending.tsx           # Pending join requests (for creators)
│   ├── chat/
│   │   └── [id].tsx              # Chat detail
│   ├── user/
│   │   └── [id].tsx              # User profile view
│   ├── settings/
│   │   ├── index.tsx
│   │   ├── edit-profile.tsx
│   │   ├── edit-preferences.tsx
│   │   ├── language.tsx
│   │   └── delete-account.tsx
│   └── _layout.tsx               # Root layout
├── components/                   # Reusable UI components
│   ├── ui/                       # Base components (Button, Input, Card)
│   ├── chat/                     # Chat components (Message, Input)
│   ├── request/                  # Request components (Card, ParticipantList)
│   └── forms/                    # Form components (CuisineSelector, BudgetPicker, DistrictPicker)
├── hooks/                        # Custom React hooks
│   ├── useAuth.ts
│   ├── useRealtime.ts
│   └── queries/                  # TanStack Query hooks
│       ├── useRequests.ts
│       ├── useChats.ts
│       └── useUser.ts
├── stores/                       # Zustand stores
│   ├── authStore.ts
│   └── uiStore.ts
├── services/                     # External service integrations
│   ├── supabase.ts               # Supabase client
│   ├── firebase.ts               # Firebase Auth
│   ├── notifications.ts          # Expo Push
│   └── api/                      # API service functions
│       ├── auth.ts
│       ├── requests.ts
│       ├── chats.ts
│       └── users.ts
├── lib/                          # Utilities
│   ├── constants.ts              # App constants (cuisines, budgets, districts)
│   ├── types.ts                  # Shared TypeScript types
│   ├── schemas.ts                # Zod validation schemas
│   ├── i18n.ts                   # i18n configuration
│   └── utils.ts                  # Helper functions
├── locales/                      # Translation files
│   ├── en.json
│   └── vi.json
├── supabase/                     # Supabase project
│   ├── migrations/               # SQL migrations
│   ├── functions/                # Edge Functions
│   │   ├── exchange-firebase-token/
│   │   ├── handle-request-cancel/
│   │   └── delete-account/
│   └── seed.sql                  # Initial restaurant data (~50-100)
├── assets/                       # Static assets
│   ├── images/
│   └── fonts/
├── app.json                      # Expo config
├── eas.json                      # EAS Build config
├── tailwind.config.js            # NativeWind config
└── tsconfig.json
```

**Structure Decision**: Mobile project structure following Expo Router conventions. Supabase backend is co-located in `/supabase` for monorepo simplicity. No map components for MVP (list view only).

## Complexity Tracking

> Constitution exceptions are documented below with explicit justification.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| **Constitution II**: Gender filter not enforced at DB level | MVP validates show-up rate before adding complexity. Gender data IS collected for future filtering. | Implementing full gender filter RLS adds ~2 days of work for a feature users haven't requested. Will add in Phase 1 if users report safety concerns. |
| **Constitution III**: No 60fps validation task | Manual QA on physical devices (T140-T141) covers performance. Automated performance testing deferred post-MVP. | Adding FPS monitoring infrastructure is premature at 100-user scale. |
