# Tasks: Chopsticks MVP

**Input**: Design documents from `chopsticks/specs/mvp/`
**Prerequisites**: plan.md, spec.md, data-model.md, research.md, contracts/supabase-client.md
**Date**: 2026-01-31

**Tests**: Manual QA only (per spec.md Section 16). No automated tests for MVP.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)
- Include exact file paths in descriptions

## Path Conventions

All paths relative to `chopsticks/` (the Expo app root):

- **Screens**: `app/`
- **Components**: `components/`
- **Hooks**: `hooks/`
- **Services**: `services/`
- **Stores**: `stores/`
- **Utils**: `lib/`
- **Backend**: `supabase/`
- **Translations**: `locales/`

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Project scaffolding and configuration

- [X] T001 Initialize Expo project with SDK 52+ in `chopsticks/`
- [X] T002 [P] Configure TypeScript strict mode in `tsconfig.json`
- [X] T003 [P] Configure NativeWind v4 in `tailwind.config.js`
- [ ] T004 [P] Configure ESLint and Prettier for TypeScript/React Native
- [X] T005 [P] Create `app.json` with Expo config (bundle IDs, splash, icons)
- [ ] T006 [P] Create `eas.json` with build profiles (development, preview, production)
- [X] T007 Create `.env.example` with required environment variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story

**Critical**: No user story work can begin until this phase is complete

### Database Setup

- [ ] T008 Create Supabase project and configure environment variables
- [X] T009 Create migration `001_users.sql` for users table in `supabase/migrations/` (Combined in 001_complete_schema.sql)
- [X] T010 [P] Create migration `002_user_preferences.sql` for user_preferences table (Combined in 001_complete_schema.sql)
- [X] T011 [P] Create migration `003_restaurants.sql` for restaurants table (Combined in 001_complete_schema.sql)
- [X] T012 [P] Create migration `004_meal_requests.sql` for meal_requests table (Combined in 001_complete_schema.sql)
- [X] T013 [P] Create migration `005_request_participants.sql` for request_participants table (Combined in 001_complete_schema.sql)
- [X] T014 [P] Create migration `006_chats.sql` for chats and chat_participants tables (Combined in 001_complete_schema.sql)
- [X] T015 [P] Create migration `007_messages.sql` for messages table (Combined in 001_complete_schema.sql)
- [X] T016 [P] Create migration `008_person_ratings.sql` for person_ratings table (Combined in 001_complete_schema.sql)
- [X] T017 [P] Create migration `009_reports.sql` for reports table (Combined in 001_complete_schema.sql)
- [X] T018 [P] Create migration `010_notifications.sql` for notifications table (Combined in 001_complete_schema.sql)
- [X] T019 Create migration `011_rls_policies.sql` for all RLS policies (Combined in 001_complete_schema.sql)
- [X] T020 Create migration `012_triggers.sql` for database triggers (increment_meal_count, enforce_group_capacity, filter_message_content) (Combined in 001_complete_schema.sql)
- [X] T021 Create `supabase/seed.sql` with 50-100 curated HCMC restaurants (seed-restaurants.sql exists)

### Service Layer Setup

- [X] T022 Implement Supabase client in `services/supabase.ts` with expo-secure-store auth storage
- [X] T023 [P] Implement Firebase Auth client in `services/firebase.ts`
- [ ] T024 [P] Implement push notifications service in `services/notifications.ts`
- [X] T025 Create `exchange-firebase-token` Edge Function in `supabase/functions/exchange-firebase-token/`

### Type Definitions & Constants

- [X] T026 Define TypeScript types in `lib/types.ts` (User, MealRequest, Message, etc.) (Partial - in services/supabase.ts)
- [X] T027 [P] Define Zod validation schemas in `lib/schemas.ts`
- [X] T028 [P] Define app constants in `lib/constants.ts` (cuisines, budgets, districts per data-model.md)
- [X] T029 [P] Create utility functions in `lib/utils.ts` (formatDate, formatTime, etc.)

### i18n Setup

- [X] T030 Configure react-i18next in `lib/i18n.ts` with expo-localization (Partial - needs proper setup)
- [X] T031 [P] Create English translations in `locales/en.json`
- [X] T032 [P] Create Vietnamese translations in `locales/vi.json`

### Navigation & Layout

- [X] T033 Create root layout in `app/_layout.tsx` with providers (Supabase, TanStack Query, i18n) (Partial - needs TanStack Query provider)
- [X] T034 Create auth layout in `app/(auth)/_layout.tsx`
- [X] T035 [P] Create tabs layout in `app/(tabs)/_layout.tsx` with 4 tabs (Browse, Chats, Notifications, Profile)

### Base UI Components

- [ ] T036 Create Button component in `components/ui/Button.tsx`
- [ ] T037 [P] Create Input component in `components/ui/Input.tsx`
- [ ] T038 [P] Create Card component in `components/ui/Card.tsx`
- [ ] T039 [P] Create Avatar component in `components/ui/Avatar.tsx`
- [ ] T040 [P] Create LoadingSpinner component in `components/ui/LoadingSpinner.tsx`
- [ ] T041 [P] Create ErrorMessage component in `components/ui/ErrorMessage.tsx`

### State Management

- [X] T042 Create auth store in `stores/auth.ts` (user, isAuthenticated, loading) (Needs update to use real Firebase)
- [X] T043 [P] Create UI store in `stores/language.ts` (language, theme) (Partial)

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - Phone Auth + Onboarding (Priority: P1) MVP

**Goal**: Users can sign up via phone OTP and complete 9-step onboarding to create their profile

**Independent Test**:
1. Launch app → See login screen
2. Enter phone → Receive OTP → Verify → Proceed to onboarding
3. Complete all 9 steps → Land on browse or create screen based on intent

### Implementation for US1

#### Auth Hook & Service

- [ ] T044 [US1] Create useAuth hook in `hooks/useAuth.ts` (login, logout, onboarding state)
- [ ] T045 [US1] Implement auth API functions in `services/api/auth.ts` (exchangeToken, createUser, updateUser)
- [ ] T045b [US1] Implement token refresh logic in `hooks/useAuth.ts` (Firebase auto-refresh → re-exchange Supabase JWT)

#### Login Screen

- [ ] T046 [US1] Create login screen in `app/(auth)/login.tsx` with phone input
- [ ] T047 [US1] Implement OTP verification flow in login screen (Firebase Auth integration)

#### Onboarding Screens (9 steps)

- [ ] T048 [US1] Create onboarding layout in `app/(auth)/onboarding/_layout.tsx` with progress indicator
- [ ] T049 [P] [US1] Create photo upload screen in `app/(auth)/onboarding/photo.tsx` with face detection
- [ ] T050 [P] [US1] Create profile screen in `app/(auth)/onboarding/profile.tsx` (name, age, gender)
- [ ] T051 [P] [US1] Create city check screen in `app/(auth)/onboarding/city.tsx` (HCMC only)
- [ ] T052 [P] [US1] Create persona screen in `app/(auth)/onboarding/persona.tsx` (5 options)
- [ ] T053 [P] [US1] Create cuisines screen in `app/(auth)/onboarding/cuisines.tsx` (per data-model.md)
- [ ] T054 [P] [US1] Create budget screen in `app/(auth)/onboarding/budget.tsx` (4 ranges)
- [ ] T055 [P] [US1] Create bio screen in `app/(auth)/onboarding/bio.tsx` (max 200 chars)
- [ ] T056 [US1] Create intent screen in `app/(auth)/onboarding/intent.tsx` (know where to eat?)

#### Form Components

- [ ] T057 [P] [US1] Create CuisineSelector component in `components/forms/CuisineSelector.tsx`
- [ ] T058 [P] [US1] Create BudgetPicker component in `components/forms/BudgetPicker.tsx`
- [ ] T059 [P] [US1] Create PersonaSelector component in `components/forms/PersonaSelector.tsx`

#### Image Upload

- [ ] T060 [US1] Implement image compression and face detection in `lib/imageUtils.ts`
- [ ] T061 [US1] Implement profile photo upload to Supabase Storage in `services/api/users.ts`

**Checkpoint**: Users can authenticate and complete onboarding

---

## Phase 4: User Story 2 - Create Meal Request (Priority: P1)

**Goal**: Users can create meal requests at restaurants with all required details

**Independent Test**:
1. Tap "Create" button → See create request form
2. Select restaurant (from list or add manually) → Select cuisine, budget, time, size, join type
3. Tap "Create" → Request appears in browse list

### Implementation for US2

#### Query Hooks

- [ ] T062 [US2] Create useRestaurants hook in `hooks/queries/useRestaurants.ts` (list, search, add)
- [ ] T063 [US2] Create useRequests mutation hook in `hooks/queries/useRequests.ts` (create, cancel)

#### API Functions

- [ ] T064 [US2] Implement requests API in `services/api/requests.ts` (createRequest, listRequests)
- [ ] T065 [P] [US2] Implement restaurants API in `services/api/restaurants.ts` (listRestaurants, addRestaurant)

#### Create Request Screen

- [ ] T066 [US2] Create request creation screen in `app/request/create.tsx`
- [ ] T067 [US2] Implement restaurant selection with search in create screen
- [ ] T068 [US2] Implement manual restaurant entry in create screen
- [ ] T069 [US2] Implement cuisine, budget, time, size, join type selectors

#### Form Components

- [ ] T070 [P] [US2] Create RestaurantPicker component in `components/forms/RestaurantPicker.tsx`
- [ ] T071 [P] [US2] Create DistrictPicker component in `components/forms/DistrictPicker.tsx`
- [ ] T072 [P] [US2] Create TimePicker component in `components/forms/TimePicker.tsx`
- [ ] T073 [P] [US2] Create GroupSizeSlider component in `components/forms/GroupSizeSlider.tsx`
- [ ] T074 [P] [US2] Create JoinTypeToggle component in `components/forms/JoinTypeToggle.tsx`

**Checkpoint**: Users can create meal requests

---

## Phase 5: User Story 3 - Browse & Join Requests (Priority: P1)

**Goal**: Users can browse active requests with filters and join them

**Independent Test**:
1. Open app → See list of active requests on home tab
2. Apply filters (district, cuisine, budget) → List updates
3. Tap request → See detail → Join (open) or Request to Join (approval)

### Implementation for US3

#### Query Hooks

- [ ] T075 [US3] Extend useRequests hook with list query and filters in `hooks/queries/useRequests.ts`
- [ ] T076 [US3] Create useJoinRequest mutation hook in `hooks/queries/useRequests.ts`

#### API Functions

- [ ] T077 [US3] Implement joinRequest in `services/api/requests.ts`

#### Browse Screen

- [ ] T078 [US3] Create browse requests screen (home tab) in `app/(tabs)/index.tsx`
- [ ] T079 [US3] Implement filter bar with district, cuisine, budget in browse screen

#### Request Components

- [ ] T080 [P] [US3] Create RequestCard component in `components/request/RequestCard.tsx`
- [ ] T081 [P] [US3] Create RequestList component in `components/request/RequestList.tsx`
- [ ] T082 [P] [US3] Create FilterBar component in `components/request/FilterBar.tsx`

#### Request Detail Screen

- [ ] T083 [US3] Create request detail screen in `app/request/[id].tsx`
- [ ] T084 [US3] Implement creator profile display in request detail
- [ ] T085 [US3] Implement join/request-to-join button with appropriate behavior

#### User Profile Components

- [ ] T086 [P] [US3] Create UserProfileCard component in `components/ui/UserProfileCard.tsx`
- [ ] T087 [US3] Create other user profile screen in `app/user/[id].tsx`

**Checkpoint**: Users can browse and join meal requests

---

## Phase 6: User Story 4 - Approve/Reject Join Requests (Priority: P2)

**Goal**: Request creators can view and approve/reject pending join requests

**Independent Test**:
1. Create approval-type request → Someone requests to join
2. Receive notification → Tap → See pending requests screen
3. View requester profile → Tap Approve/Reject → Status updates

### Implementation for US4

#### Push Notifications Integration

- [ ] T088 [US4] Register push token on login in `hooks/useAuth.ts`
- [ ] T089 [US4] Implement push notification handling for deep links in `app/_layout.tsx`

#### Notifications Screen

- [ ] T090 [US4] Create notifications screen in `app/(tabs)/notifications.tsx`
- [ ] T091 [US4] Create useNotifications hook in `hooks/queries/useNotifications.ts`
- [ ] T092 [P] [US4] Create NotificationItem component in `components/ui/NotificationItem.tsx`

#### Pending Requests Screen

- [ ] T093 [US4] Create pending requests screen in `app/request/pending.tsx`
- [ ] T094 [US4] Implement approve/reject actions with optimistic updates
- [ ] T095 [US4] Implement optional filter bar (gender, age, persona) in pending screen

#### API Functions

- [ ] T096 [US4] Implement approveParticipant, rejectParticipant in `services/api/requests.ts`
- [ ] T097 [US4] Implement notifications API in `services/api/notifications.ts`

#### Edge Function for Notifications

- [ ] T098 [US4] Create database trigger or Edge Function to send push on join request

**Checkpoint**: Creators can manage join requests

---

## Phase 7: User Story 5 - Chat (Priority: P1)

**Goal**: Approved participants can chat in meal request groups with real-time messages

**Independent Test**:
1. Join a request → Chat becomes available
2. Open chat → See message history → Send message → Appears instantly
3. Other participant sends message → Appears in real-time

### Implementation for US5

#### Realtime Hook

- [ ] T099 [US5] Create useRealtime hook in `hooks/useRealtime.ts` for Supabase Postgres Changes

#### Chat Query Hooks

- [ ] T100 [US5] Create useChats hook in `hooks/queries/useChats.ts` (list user's chats)
- [ ] T101 [US5] Create useChatMessages hook in `hooks/queries/useChatMessages.ts` (messages + realtime)

#### API Functions

- [ ] T102 [US5] Implement chats API in `services/api/chats.ts` (listChats, getChatMessages, sendMessage)

#### Chat List Screen

- [ ] T103 [US5] Create chats list screen in `app/(tabs)/chats.tsx`
- [ ] T104 [P] [US5] Create ChatListItem component in `components/chat/ChatListItem.tsx`

#### Chat Detail Screen

- [ ] T105 [US5] Create chat detail screen in `app/chat/[id].tsx`
- [ ] T106 [US5] Implement real-time message subscription in chat screen
- [ ] T107 [US5] Implement message sending with optimistic updates

#### Chat Components

- [ ] T108 [P] [US5] Create MessageBubble component in `components/chat/MessageBubble.tsx`
- [ ] T109 [P] [US5] Create ChatInput component in `components/chat/ChatInput.tsx`
- [ ] T110 [P] [US5] Create MessageList component in `components/chat/MessageList.tsx`

#### Chat Image Upload

- [ ] T111 [US5] Implement chat image upload in `services/api/chats.ts`

#### Chat Actions

- [ ] T112 [US5] Implement creator "remove user" action in chat screen
- [ ] T113 [US5] Implement "leave chat" action in chat screen

**Checkpoint**: Participants can coordinate via real-time chat

---

## Phase 8: User Story 6 - Post-Meal Rating (Priority: P2)

**Goal**: After meal time passes, users can rate whether participants showed up

**Independent Test**:
1. Meal time passes → Open app → Rating prompt appears
2. For each participant → Tap Yes/No for "Did they show up?"
3. Submit → Ratings saved → meal_count incremented for "Yes" ratings

### Implementation for US6

#### Rating Hook

- [ ] T114 [US6] Create useRatings hook in `hooks/queries/useRatings.ts` (pending ratings, submit)

#### API Functions

- [ ] T115 [US6] Implement ratings API in `services/api/ratings.ts` (getPendingRatings, submitRating)

#### Rating Screen/Modal

- [ ] T116 [US6] Create rating screen/modal in `app/rating.tsx` or as modal component
- [ ] T117 [US6] Implement rating prompt trigger (check for past meals on app open)

#### Rating Components

- [ ] T118 [P] [US6] Create RatingCard component in `components/ui/RatingCard.tsx`
- [ ] T119 [US6] Implement rating submission with trigger for meal_count increment

**Checkpoint**: Show-up ratings can be collected for validation metric

---

## Phase 9: User Story 7 - Settings & Profile (Priority: P2)

**Goal**: Users can view/edit their profile, change preferences, and manage their account

**Independent Test**:
1. Go to Profile tab → See own profile with meal_count
2. Go to Settings → Edit profile (photo, name, bio) → Save → Updates visible
3. Change language → App switches to Vietnamese/English
4. Delete account → Account removed

### Implementation for US7

#### Profile Screen

- [ ] T120 [US7] Create profile tab screen in `app/(tabs)/profile.tsx` with own profile display

#### User Query Hook

- [ ] T121 [US7] Create useUser hook in `hooks/queries/useUser.ts` (get, update)

#### Settings Screens

- [ ] T122 [US7] Create settings index screen in `app/settings/index.tsx`
- [ ] T123 [P] [US7] Create edit profile screen in `app/settings/edit-profile.tsx`
- [ ] T124 [P] [US7] Create edit preferences screen in `app/settings/edit-preferences.tsx`
- [ ] T125 [P] [US7] Create language settings screen in `app/settings/language.tsx`
- [ ] T126 [US7] Create delete account screen in `app/settings/delete-account.tsx`

#### Edge Functions

- [ ] T127 [US7] Create `delete-account` Edge Function in `supabase/functions/delete-account/`
- [ ] T128 [US7] Create `handle-request-cancel` Edge Function in `supabase/functions/handle-request-cancel/`

#### Report Functionality

- [ ] T129 [US7] Implement report button that opens email with pre-filled info

#### API Functions

- [ ] T130 [US7] Implement users API in `services/api/users.ts` (getUser, updateUser, updatePreferences, deleteAccount)

**Checkpoint**: Users can manage their profile and account

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements across all user stories

- [ ] T131 [P] Add loading states to all screens
- [ ] T132 [P] Add error handling and retry logic to all API calls
- [ ] T133 [P] Add empty states for lists (no requests, no chats, etc.)
- [ ] T134 [P] Implement offline detection with "No connection" banner
- [ ] T135 [P] Add haptic feedback to key interactions
- [ ] T136 Review and polish all Vietnamese translations
- [ ] T137 Test deep linking for all notification types
- [ ] T138 [P] Optimize images and lazy load screens for performance
- [ ] T139 Security review: verify no hardcoded secrets, RLS working
- [ ] T140 Manual QA on physical iOS device
- [ ] T141 Manual QA on physical Android device
- [ ] T142 Run quickstart.md validation checklist

### NFR Validation (Constitution III)

- [ ] T143 Verify bundle size <50MB using `npx expo-optimize` and EAS build output
- [ ] T144 Verify cold start <3s on mid-range Android (Samsung A53 or equivalent)
- [ ] T145 Verify chat message delivery <500ms using Supabase realtime latency
- [ ] T146 Verify 60fps scrolling on FlatList components (manual profiler check)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational - BLOCKS US2-US7 (auth required)
- **User Stories 2-7 (Phases 4-9)**: Depend on US1 completion
- **Polish (Phase 10)**: Depends on all user stories being complete

### User Story Dependencies

| Story | Depends On | Can Start After |
|-------|------------|-----------------|
| US1 (Auth + Onboarding) | Foundational | Phase 2 complete |
| US2 (Create Request) | US1 | Phase 3 complete |
| US3 (Browse & Join) | US1 | Phase 3 complete |
| US4 (Approve/Reject) | US1, US3 | Phase 5 complete |
| US5 (Chat) | US1, US3 | Phase 5 complete |
| US6 (Rating) | US1, US5 | Phase 7 complete |
| US7 (Settings) | US1 | Phase 3 complete |

### Suggested Parallel Execution

After US1 is complete, these stories can be developed in parallel:
- US2 + US3 (request creation and browsing) - tightly related
- US7 (settings) - independent

After US3 is complete:
- US4 + US5 (approval and chat) - build on join flow

### Within Each Phase

- Models/migrations before services
- Services before screens
- Core screens before secondary screens
- [P] tasks can run in parallel within their phase

---

## Parallel Example: Foundational Phase

```bash
# After T008-T009, launch all remaining migrations in parallel:
T010, T011, T012, T013, T014, T015, T016, T017, T018 (all [P])

# After migrations complete, launch all parallel service setup:
T022, T023, T024, T026, T027, T028, T029, T030, T031, T032 (many [P])

# After services, launch all base UI components in parallel:
T036, T037, T038, T039, T040, T041 (all [P])
```

---

## Implementation Strategy

### MVP First (US1 + US2 + US3 + US5)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL)
3. Complete Phase 3: US1 (Auth + Onboarding)
4. Complete Phase 4: US2 (Create Request)
5. Complete Phase 5: US3 (Browse & Join)
6. Complete Phase 7: US5 (Chat)
7. **STOP and VALIDATE**: Test core loop (create → join → chat)
8. Deploy to TestFlight/internal testing

### Incremental Delivery

1. MVP (US1-US3 + US5) → Core social dining loop
2. Add US4 (Approve/Reject) → Approval mode works
3. Add US6 (Rating) → Show-up validation metric
4. Add US7 (Settings) → User account management
5. Phase 10 (Polish) → Production ready

### Task Count Summary

| Phase | Story | Task Count |
|-------|-------|------------|
| Phase 1 | Setup | 7 |
| Phase 2 | Foundational | 36 |
| Phase 3 | US1 - Auth + Onboarding | 19 |
| Phase 4 | US2 - Create Request | 13 |
| Phase 5 | US3 - Browse & Join | 13 |
| Phase 6 | US4 - Approve/Reject | 11 |
| Phase 7 | US5 - Chat | 15 |
| Phase 8 | US6 - Rating | 6 |
| Phase 9 | US7 - Settings | 11 |
| Phase 10 | Polish + NFR Validation | 16 |
| **Total** | | **147** |

---

## Notes

- [P] tasks can run in parallel (different files, no dependencies)
- [Story] label maps task to specific user story for traceability
- Manual QA only for MVP (per spec.md Section 16)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- All file paths relative to `chopsticks/` (Expo app root)
