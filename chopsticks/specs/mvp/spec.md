# Technical Specification — Chopsticks Lean MVP

*Based on PRD v3 and product marketing interview (2026-01-31)*

---

## 1. Tech Stack

| Layer | Technology | Notes |
|-------|-----------|-------|
| Frontend | React Native (Expo SDK 52+) | Managed workflow, no native modules |
| Navigation | Expo Router (file-based) | v6+ with typed routes |
| Styling | NativeWind v4 (Tailwind CSS) | Consistent design system |
| State Management | Zustand (global UI state) + TanStack Query v5 (server state) | Simple, performant |
| i18n | react-i18next with JSON translation files | Vietnamese + English |
| Backend / DB | Supabase (Postgres + Edge Functions + Realtime + Storage) | Single backend service |
| Auth | Firebase Auth (phone OTP) → Supabase JWT exchange | Reliable SMS delivery |
| Real-time Chat | Supabase Realtime (Postgres Changes) | No typing indicators for MVP |
| Push Notifications | Expo Push Notifications | 3 notification types only |
| Image Storage | Supabase Storage (public bucket) | 1MB max per image |
| Face Detection | expo-face-detector | On-device, pre-upload validation |
| Build / Deploy | EAS Build + EAS Submit | iOS + Android |

**Cut from MVP:**
- ❌ Google Maps / react-native-maps (no map view)
- ❌ Map clustering
- ❌ Google Places API
- ❌ System suggestions / matching algorithm
- ❌ Advanced moderation UI

---

## 2. Authentication Flow

```
1. User enters phone number
   ↓
2. Firebase Auth sends SMS OTP
   ↓
3. User enters OTP → Firebase verifies → returns Firebase ID token
   ↓
4. Client calls Supabase Edge Function: exchange-firebase-token
   ↓
5. Edge Function:
   - Verifies Firebase token
   - Creates/finds Supabase user (by firebase_uid)
   - Returns Supabase JWT
   ↓
6. Client stores Supabase JWT in expo-secure-store
   ↓
7. All subsequent requests use Supabase JWT
```

**Token refresh:**
- Firebase SDK auto-refreshes token
- Client re-exchanges with Supabase Edge Function
- New Supabase JWT stored

**Why Firebase for phone auth?**
Supabase phone auth uses Twilio (additional config). Firebase phone auth is battle-tested and handles carrier edge cases better.

---

## 3. Database Schema (Lean MVP)

Full schema: [specs/mvp/data-model.md](./specs/mvp/data-model.md)

### Core Tables

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `users` | User profiles | firebase_uid, phone, name, age, gender, persona, meal_count, bio |
| `user_preferences` | Cuisine + budget preferences | cuisines[], budget_ranges[] |
| `restaurants` | Curated + user-added restaurants | name, address, district, city |
| `meal_requests` | Active meal requests | requester_id, restaurant_id, cuisine, budget_range, time_window, group_size, join_type |
| `request_participants` | Who joined which request | request_id, user_id, status (pending/joined/rejected) |
| `chats` | Request chats | request_id, type, expires_at |
| `chat_participants` | Who's in which chat | chat_id, user_id |
| `messages` | Chat messages | chat_id, sender_id, content, created_at |
| `person_ratings` | "Did they show up?" ratings | rater_id, rated_id, request_id, showed_up (boolean) |
| `reports` | Safety reports | reporter_id, reported_id, reason |
| `notifications` | Push notification records | user_id, type, title, body, read |

**Removed tables (deferred post-MVP):**
- ❌ `reviews` (restaurant reviews)
- ❌ `dietary_restrictions` (cut entirely)
- ❌ `rate_limits` (not needed at 100-user scale)

### Row-Level Security (RLS)

All tables have RLS enabled.

| Table | Read | Write |
|-------|------|-------|
| `users` | Public profiles (where deleted_at IS NULL AND banned_at IS NULL) | Own profile only |
| `user_preferences` | Own prefs only | Own prefs only |
| `meal_requests` | WHERE time_window > NOW() AND city = user's city | Creator only |
| `request_participants` | Participants of the request | Joining user (INSERT), creator (UPDATE for approval) |
| `chats`, `messages` | Chat participants only | Chat participants only |
| `person_ratings` | Aggregate only (no individual ratings exposed) | Rater only |
| `reports` | Admin only | Reporter only (INSERT) |
| `notifications` | Own notifications only | System only |

**Simplified from original:**
- ❌ No gender filter RLS (collect gender, but don't filter visibility)
- ❌ No complex status management (just `WHERE time_window > NOW()`)

### Database Triggers (Lean MVP)

| Trigger | Event | Action |
|---------|-------|--------|
| `increment_meal_count` | After INSERT on person_ratings WHERE showed_up = true | Increment meal_count on rated user |
| `enforce_group_capacity` | Before INSERT on request_participants | Lock row, check count < group_size, reject if full |
| `filter_message_content` | Before INSERT on messages | Check simple blocklist, flag if needed |

**Removed triggers:**
- ❌ `award_local_guide` (no badges in MVP)
- ❌ `expire_requests` (no cron, just query filter)
- ❌ `cleanup_rate_limits` (no rate limits table)
- ❌ `cleanup_expired_chats` (manual cleanup post-MVP)

---

## 4. Supabase Edge Functions (Lean MVP)

| Function | Trigger | Purpose |
|----------|---------|---------|
| `exchange-firebase-token` | HTTP POST | Verify Firebase token, upsert Supabase user, return Supabase JWT |
| `handle-request-cancel` | HTTP POST | Notify participants, mark chat as expiring in 24h |
| `delete-account` | HTTP POST | Anonymize user data, remove from chats, delete profile |

**Removed functions:**
- ❌ `suggest-people` (no system suggestions)
- ❌ `cleanup-expired-chats` (manual for MVP)
- ❌ `handle-takeover` (no takeover logic)

---

## 5. Real-Time Chat Architecture

### Supabase Realtime Setup
- Each chat subscribes to Postgres Changes filtered by `chat_id`
- New messages inserted → Supabase broadcasts to all subscribers
- Client displays message instantly

### Chat Lifecycle

| Event | Action |
|-------|--------|
| First person joins/approved | Create chat, add chat_participants |
| New message sent | INSERT into messages → Realtime broadcast |
| Creator cancels request | Edge Function: notify all, set expires_at = NOW() + 24h |
| 24h after cancellation | Chat readable but no new messages allowed |
| Manual cleanup (admin) | DELETE chat after 7+ days |

**No:**
- ❌ Typing indicators (cut for MVP)
- ❌ Direct messages (cut for MVP)
- ❌ Auto-cleanup cron (manual for MVP)

---

## 6. Image Upload & Face Detection

### Profile Photo Upload Flow

```
1. User picks image (expo-image-picker)
   ↓
2. Resize to 800x800, compress to <1MB (expo-image-manipulator)
   ↓
3. Run expo-face-detector (on-device)
   ↓
4. If NO face detected → show error, reject upload
   ↓
5. If face detected → upload to Supabase Storage (public bucket)
   ↓
6. Get public URL, save to user.photo_url
```

### Chat Image Upload Flow

```
1. User picks image
   ↓
2. Compress to <1MB
   ↓
3. Upload to Supabase Storage (chat-images bucket)
   ↓
4. INSERT message with image URL
```

**No:**
- ❌ Restaurant review photos (no reviews in MVP)
- ❌ Hidden spot verification photos (no user-added verification)

---

## 7. Push Notifications (3 Types Only)

| Notification Type | Trigger | Title | Body |
|-------------------|---------|-------|------|
| `join_request` | User requests to join approval-based request | "Someone wants to join!" | "[Name] wants to join your meal at [time]" |
| `join_approved` | Creator approves join request | "You're in!" | "[Name] approved your request. Check the chat!" |
| `new_message` | New message in request chat | "[Name] sent a message" | "[Message preview...]" |

**Implementation:**
- Expo Push Notifications
- Token stored in `users.expo_push_token`
- Send via Supabase Edge Functions or database trigger
- User taps notification → deep link to chat or request

**Removed notifications:**
- ❌ System suggestions (no matching algorithm)
- ❌ Meal reminders (in-app only)
- ❌ Post-meal rating prompts (in-app prompt only)
- ❌ Nearby request alerts

---

## 8. Onboarding Flow (9 Steps)

| Step | Screen | Fields | Validation |
|------|--------|--------|------------|
| 1 | Phone Verification | Phone number | Firebase Auth OTP |
| 2 | Photo Upload | Photo | expo-face-detector (must detect face) |
| 3 | Profile | Name, age, gender | Name: 1-50 chars, Age: 18-100 |
| 4 | City Check | City | If not HCMC → show "Available in HCMC only" |
| 5 | Persona | Select 1 of 5 | Local, New to city, Expat, Traveler, Student |
| 6 | Cuisines | Select 1+ (see [data-model.md](./data-model.md#cuisine-types-reference)) | Multi-select chips |
| 7 | Budget | Select 1+ of 4 | Multi-select buttons |
| 8 | Bio | Text input (food-related) | Max 200 chars, prompt: "Tell us something food-related about yourself" |
| 9 | Intent | "Do you know where to eat?" | Yes → Create flow, No → Browse flow |

**After onboarding:**
- User taken directly to create request OR browse requests based on step 9

**Removed steps:**
- ❌ Dietary restrictions (cut)
- ❌ Allergies (cut)

---

## 9. Core User Flows

### 9.1 Create a Meal Request

```
Screen: Create Request

1. Restaurant Selection
   - Show list of ~50-100 curated restaurants
   - Search by name
   - OR tap "Add restaurant manually"
     - Enter: Name, Address, District (required)

2. Cuisine Selection
   - Single-select from cuisine categories (see [data-model.md](./data-model.md#cuisine-types-reference))

3. Budget Selection
   - 4 ranges (single-select)

4. Time Selection
   - Date + time picker
   - Must be within next 24 hours

5. Group Size
   - Slider: 2-4 people

6. Join Type
   - Toggle: "Open" (anyone joins) OR "Approval" (you approve)

7. Tap "Create Request"
   ↓
   INSERT into meal_requests
   ↓
   If Open: Request visible immediately
   If Approval: Request visible with "Approval required" badge
```

### 9.2 Browse & Join Requests (List View)

```
Screen: Browse Requests (Home)

1. List of requests (cards)
   - Creator photo, name, age, gender, persona
   - Cuisine icon + label
   - District
   - Time
   - Spots remaining (e.g., "2/4 spots")

2. Filter Bar
   - District (dropdown: 22 HCMC districts)
   - Cuisine (multi-select, see [data-model.md](./data-model.md#cuisine-types-reference))
   - Budget (multi-select: 4 ranges)

3. Tap card → Request Detail Screen

Request Detail Screen:

- Creator profile (photo, name, age, gender, persona, bio, meal count)
- Cuisine, budget, time, spots remaining
- IF OPEN REQUEST:
  - Restaurant name, address, district visible
  - Button: "Join" → INSERT into request_participants with status='joined'
    → Add to chat → location locked in

- IF APPROVAL REQUEST:
  - Restaurant name/address HIDDEN (shows only district)
  - Button: "Request to Join" → INSERT into request_participants with status='pending'
    → Wait for approval

On approval:
  - Notification: "You've been approved!"
  - Chat unlocked
  - Restaurant details visible
```

### 9.3 Approve/Reject Join Requests (Creator)

```
Screen: Notifications

1. Creator gets notification: "Someone wants to join!"
2. Tap notification → Pending Requests Screen

Pending Requests Screen:

- List of pending join requests
- Each shows: requester photo, name, age, gender, persona, bio, meal count

- Filter bar (optional):
  - Gender
  - Age range
  - Persona

- Tap Approve → UPDATE request_participants SET status='joined'
  → Add to chat_participants
  → Send "join_approved" push notification
  → Restaurant location revealed to joiner

- Tap Reject → UPDATE request_participants SET status='rejected'
  → Send in-app notification (no push)
```

### 9.4 Chat

```
Screen: Chat

- List of messages (oldest to newest)
- Each message: sender photo (small), name, content, timestamp

Input:
- Text input (max 2000 chars)
- Image button → opens image picker → uploads to Supabase

Actions:
- Creator sees "Remove user" button on long-press user
  → DELETE from chat_participants
  → User gets notification

- "Leave chat" button
  → DELETE own chat_participant row
```

**No:**
- ❌ Typing indicators
- ❌ Read receipts
- ❌ Message reactions
- ❌ Voice messages

### 9.5 Post-Meal Rating

```
Trigger: User opens app after meal time_window has passed

Screen: Rate Your Meal

For each participant (except self):
  - Photo, name
  - Question: "Did [name] show up?"
  - Buttons: Yes / No

On submit:
  - INSERT into person_ratings (rater_id, rated_id, request_id, showed_up)
  - If showed_up = true → trigger increments rated_id.meal_count

- Rating stored for analytics
- No immediate consequences (future: flag no-shows)
```

---

## 10. Restaurant Data

### Curated Seed List
- Manually add ~50-100 restaurants in HCMC
- Fields: name, address, district, cuisine_type, location (lat/lng)
- Source: Google Maps research, local food blogs, recommendations

### User-Added Restaurants
- Users can manually enter restaurants during request creation
- Required fields: name, address, district
- Source: 'user_added'
- No verification needed for MVP (trust-based)

**No:**
- ❌ Google Places API integration
- ❌ Photo verification for "hidden spots"
- ❌ Restaurant reviews/ratings

---

## 11. Settings & Profile Editing

### Settings Screen
1. **Edit Profile** → Update photo, name, bio
2. **Edit Preferences** → Update cuisines, budget ranges
3. **Language** → Toggle Vietnamese / English (persists in user.language)
4. **Delete Account** → Confirmation dialog → call `delete-account` Edge Function
5. **Report** → Opens email to admin with reporter_id + description

**No:**
- ❌ Notification settings (OS-level only)
- ❌ Gender filter toggle
- ❌ Dietary restrictions editor

---

## 12. i18n (Internationalization)

**Setup:**
- react-i18next
- JSON files: `locales/en.json`, `locales/vi.json`
- Expo Localization for device locale detection

**Language Selection:**
- Onboarding: Auto-detect from device → user can change in settings
- Stored in `users.language`
- All UI strings translated (all cuisines per [data-model.md](./data-model.md#cuisine-types-reference), 4 budget ranges, 22 districts, etc.)

**Translation keys:**
```json
{
  "onboarding": {
    "phone_title": "What's your number?",
    "photo_title": "Upload your photo",
    ...
  },
  "cuisines": {
    "noodles_congee": "Noodles & Congee",
    ...
  },
  "districts": {
    "district_1": "District 1",
    ...
  }
}
```

---

## 13. Performance Requirements (from Constitution)

| Target | Requirement |
|--------|-------------|
| Cold start | <3 seconds on mid-range Android |
| App size | <50MB |
| Image size | <1MB per photo |
| API timeout | 10 seconds |
| Chat latency | <500ms message delivery |

**Optimizations:**
- Lazy load screens with Expo Router
- Compress images before upload
- Use TanStack Query caching
- Minimize bundle size (no unused deps)

---

## 14. Deployment

### EAS Build
```bash
# Development build
eas build --profile development --platform ios
eas build --profile development --platform android

# Production build
eas build --profile production --platform all
```

### EAS Submit
```bash
eas submit --platform ios
eas submit --platform android
```

### Over-the-Air Updates
```bash
# Push JS bundle updates (no native code changes)
eas update --branch production --message "Fix chat layout"
```

---

## 15. Security Checklist

- [ ] RLS enabled on all tables
- [ ] Firebase token verification in Edge Function
- [ ] Supabase JWT stored in expo-secure-store (not AsyncStorage)
- [ ] Phone verification required
- [ ] Face detection on profile photos
- [ ] Message content filtering (basic blocklist)
- [ ] Report button functional
- [ ] No hardcoded secrets in code (use expo-constants for env vars)

---

## 16. Testing Strategy (MVP)

**Manual QA:**
- Test on physical iOS device
- Test on physical Android device
- Test all flows: onboarding → create → join → chat → rate
- Test Vietnamese + English languages
- Test face detection (reject photos without faces)

**Future (post-MVP):**
- Unit tests (Jest + React Native Testing Library)
- E2E tests (Maestro)
- Load testing (simulate 100 concurrent users)

---

## 17. Out of Scope (Post-MVP)

- Gender filter RLS
- Dietary restrictions
- Local Guide badges
- Restaurant reviews with photos
- Map view with clustering
- Google Places API integration
- System suggestions / matching algorithm
- Direct messages
- Typing indicators
- Advanced reporting UI
- In-app notification settings
- Takeover logic when creator cancels
- Rate limiting
- Cron job for cleanup
- Twilio integration
- Analytics dashboard

---

## 18. File Structure

See [PRD.md](./PRD.md) Section 6.2 for detailed project structure.

```
chopsticks/
├── app/                    # Expo Router screens
│   ├── (auth)/            # Phone verification
│   ├── (onboarding)/      # 9-step onboarding
│   ├── (tabs)/            # Main app (browse, chats, notifications, profile)
│   ├── request/           # Request detail, create
│   ├── chat/              # Chat screen
│   ├── settings/          # Settings screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI
├── hooks/                 # Custom hooks (useAuth, useRequests, etc.)
├── lib/                   # Constants, schemas, utils
├── stores/                # Zustand stores
├── supabase/              # Migrations, Edge Functions
├── locales/               # en.json, vi.json
└── specs/                 # This file + others
```

---

## 19. Success Metrics (MVP Validation)

**Primary:**
- **Show-up rate:** >70% → MVP validated
- If <70% → investigate: bad matching? Flaky users? Wrong audience?

**Secondary:**
- Requests created/day: ~50
- Join rate: >50% of requests get ≥1 joiner
- MAU: ~100 users
- Retention (7-day): >40%

**Data collection:**
- person_ratings table (show-up data)
- Analytics: mixpanel or PostHog (post-MVP)

---

*Document Version: 3.0 (Lean MVP)*
*Last Updated: 2026-01-31*
*See also: [PRD.md](./PRD.md), [data-model.md](./specs/mvp/data-model.md), [product-marketing-context.md](./specs/mvp/product-marketing-context.md)*
