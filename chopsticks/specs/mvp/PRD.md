# Product Requirements Document (PRD) v3 - Lean MVP
## Chopsticks - Social Dining App for Vietnam

*Last Updated: January 31, 2026*

---

## 1. Overview

### 1.1 Vision
Chopsticks is a mobile app where strangers meet up for meals at restaurants. Users create meal requests, others join, and they coordinate via chat. Food is the icebreaker; genuine connection is the outcome. Long-term, Chopsticks becomes the centralized platform where people are represented by food-related identity.

### 1.2 Problem Statement
- People want to eat with others but have no convenient way to find spontaneous meal companions
- Food enthusiasts want to discover authentic spots through real people, not algorithms
- Solo diners (travelers, expats, locals) eat alone by default, not by choice
- Existing solutions are unsafe (Facebook groups), awkward (dating apps), or too formal (organized tours)

### 1.3 Solution
A request-based social app centered on food. Users create meal requests at specific restaurants. Others browse by district and cuisine, join, chat, and meet up. The core validation: **Do strangers actually show up to eat together?**

### 1.4 MVP Scope
**Launch:** Ho Chi Minh City only
**Scale:** ~100 users, ~50 requests/day
**Timeline:** Ship in 4-6 weeks
**Success Metric:** >70% show-up rate in first 2 weeks

---

## 2. Target Audience

### 2.1 Primary Users
| Segment | Use Case |
|---------|----------|
| **Expats** | New to HCMC, want local food knowledge and friends |
| **Travelers** | Visiting Vietnam, want authentic meals with locals |
| **Locals** | Bored, want to meet new people over food |
| **Students** | Want casual social connections around food |

### 2.2 Launch Market
- **City:** Ho Chi Minh City (22 districts)
- **Language:** Bilingual Vietnamese + English from day one
- **Audience:** Locals, expats, and travelers

### 2.3 User Personas (Self-Selected)
1. **Local** - I live here and know the food scene
2. **New to the city** - I moved here recently
3. **Expat** - I live here but I'm not from Vietnam
4. **Traveler** - I'm visiting
5. **Student** - I'm studying here

Displayed on public profiles. Used for filtering join requests.

---

## 3. Product Features (MVP)

### 3.1 Onboarding
**Flow:**
1. Phone verification (Firebase Auth → Supabase JWT)
2. Photo upload (face detection required via `expo-face-detector`)
3. Name, age, gender
4. City check → "Currently available in HCMC only" (block if not HCMC)
5. Persona selection (5 options)
6. Cuisine preferences (see [data-model.md](./data-model.md#cuisine-types-reference), multi-select)
7. Budget preferences (4 ranges, multi-select)
8. Bio (food-related prompt, max 200 chars)
9. **Final question:** "Do you know where to eat?"
   - **Yes** → Create request flow
   - **No** → Browse requests

### 3.2 User Profile
**Always visible:**
- Photo, name, age, gender
- Persona
- Meal count (completed meals)
- Cuisine preferences
- Bio

**Private:**
- Budget preferences

**Editable:** All fields except phone and age

### 3.3 Meal Requests (Core Feature)

#### Creating a Request
**Required fields:**
- **Restaurant:** Pick from curated list (~50-100) OR manual entry (name + address + district required)
- **Cuisine:** 1 category (see [data-model.md](./data-model.md#cuisine-types-reference))
- **Budget:** 1 of 4 ranges
- **Time:** Date + time picker (next 24 hours)
- **Group size:** 2-4 people
- **Join type:** Open (instant join) OR Approval (creator approves each person)

**Location reveal:**
- **Approval requests:** Restaurant name/address hidden until approved
- **Open requests:** Location visible immediately

#### Browsing Requests (List View)
**No map for MVP.** List view only.

**Filters:**
- District (22 HCMC districts)
- Cuisine (see [data-model.md](./data-model.md#cuisine-types-reference))
- Budget (4 ranges)

**Each request shows:**
- Creator profile (photo, name, age, gender, persona)
- Cuisine + district + time
- Spots remaining

#### Joining a Request
**Open join:**
- Tap "Join" → added to chat → location revealed

**Approval join:**
- Tap "Request to join" → creator sees your profile
- Creator can filter pending requests by: gender, age, persona
- Creator taps Approve/Reject
- On approval: added to chat → location revealed

#### Request Lifecycle
- **Duration:** Visible until `time_window` passes (no cron jobs, just `WHERE time_window > NOW()`)
- **Cancellation:** Creator cancels → everyone notified → chat readable for 24h → deleted
- **No editing:** Must cancel and recreate

### 3.4 Chat

**Request chat:**
- Created when first person joins/approved
- Text messages, image sharing, timestamps, read receipts
- Creator can remove users
- Expires 24h after cancellation

**No:**
- Typing indicators (cut for MVP)
- Direct messages (cut for MVP)

### 3.5 Post-Meal Rating
**Prompt:** Next app open after meal time

**Question:** "Did [name] show up?" → Yes / No for each participant

**Data:** Stored for analytics. No consequences yet (future: flag serial no-shows).

### 3.6 Safety Features (MVP)

**Built-in:**
- Real phone number required
- Face detection on photo upload
- All meals at public restaurants
- Show-up ratings create accountability
- Report button → sends email to admin (manual handling)

**Deferred post-MVP:**
- Gender filter (collect gender but don't filter)
- Advanced reporting UI
- In-app moderation queue

### 3.7 Restaurant Data
- **Curated seed list:** ~50-100 manually added restaurants
- **User-added:** Manual entry (name + address + district required)
- **No Google Places API for MVP**

---

## 4. User Flows

### 4.1 Create a Request
```
1. Tap "Create" button
2. Select restaurant from list OR enter manually (name, address, district)
3. Choose cuisine, budget, time, group size (2-4)
4. Choose: Open or Approval join
5. Request appears in list view
6. Wait for joiners
```

### 4.2 Join a Request (Open)
```
1. Browse list view → filter by district/cuisine/budget
2. Tap request card → see creator profile + details
3. Tap "Join" → added to chat → location revealed
4. Coordinate in chat
5. Meet and eat
6. Rate "did they show up?"
```

### 4.3 Join a Request (Approval)
```
1. Browse list view → tap request card
2. See: cuisine, district, time, creator profile (location hidden)
3. Tap "Request to join"
4. Wait for approval
5. Get notified: "You've been approved!"
6. Chat unlocked → location revealed
7. Coordinate, meet, eat
8. Rate "did they show up?"
```

### 4.4 Approve a Join Request
```
1. Get notification: "Someone wants to join your request"
2. Open app → see requester profile (photo, name, age, gender, persona, bio)
3. Filter pending requests by gender/age/persona if needed
4. Tap Approve → they're added to chat
   OR Tap Reject → they're notified
```

---

## 5. Design Requirements

### 5.1 Screens (MVP)
1. **Onboarding** - 9 steps (phone → photo → profile → persona → cuisines → budget → bio → intent question)
2. **Browse Requests** (List View) - Filter bar, request cards, create button
3. **Request Detail** - Restaurant info (or hidden if approval), creator profile, time, spots, join/request button
4. **Create Request** - Restaurant picker, cuisine/budget/time/size selectors, join type toggle
5. **Chat** - Message list, input, image picker, member list
6. **Notifications** - List of 3 notification types
7. **Profile** - Your profile (editable) + other users' profiles (read-only)
8. **Settings** - Edit profile, edit preferences, language toggle, delete account, report

### 5.2 Notifications (3 only)
1. Someone wants to join your request (approval mode)
2. You've been approved
3. New chat message

**No:**
- System suggestions
- Meal reminders
- Rating prompts (in-app only)
- Nearby request alerts

---

## 6. Technical Requirements

### 6.1 Platform
- **Framework:** React Native (Expo SDK 52+)
- **Target:** iOS 15+, Android 10+
- **Language:** Bilingual (Vietnamese + English)

### 6.2 Stack
| Layer | Technology |
|-------|------------|
| Frontend | Expo, Expo Router, NativeWind (Tailwind) |
| State | Zustand + TanStack Query |
| Backend | Supabase (Postgres + Realtime + Edge Functions + Storage) |
| Auth | Firebase Auth (phone OTP) → Supabase JWT |
| Notifications | Expo Push Notifications |
| i18n | react-i18next |

### 6.3 Key Integrations
- Phone verification: Firebase Auth
- Face detection: `expo-face-detector`
- Image upload: Supabase Storage
- Realtime chat: Supabase Realtime
- Push notifications: Expo Push

**No:**
- Google Maps API (deferred)
- Map clustering (no map)
- Google Places (manual seed)

---

## 7. Data Model Highlights

**Key tables:**
- `users` - Profile data
- `user_preferences` - Cuisines, budget (editable)
- `restaurants` - Curated + user-added
- `meal_requests` - Active requests
- `request_participants` - Who joined
- `chats` - Request chats
- `chat_participants` - Who's in chat
- `messages` - Chat messages
- `person_ratings` - "Did they show up?" (binary)
- `reports` - Safety reports

**RLS enabled on all tables.**

Full schema: [data-model.md](./specs/mvp/data-model.md)

---

## 8. Success Metrics (MVP)

| Metric | Target |
|--------|--------|
| **Show-up rate** | >70% in first 2 weeks (validates core loop) |
| Requests created/day | ~50 |
| Join rate | >50% of requests get ≥1 joiner |
| MAU | ~100 users |
| Retention (7-day) | >40% |

**Core validation:** If >70% of people show up, the idea works. If not, pivot or kill.

---

## 9. Product Differentiators

1. **Request-based, not swipe-based** - Browse real meal plans, not profiles
2. **Restaurant-first** - Not a stranger's home, always public venues
3. **Safety by design** - Face detection, approval mode, show-up ratings
4. **Vietnam-specific** - Cuisine categories match local food culture (see [data-model.md](./data-model.md#cuisine-types-reference))
5. **Lean coordination** - Just chat + location reveal, no complex features
6. **Validation-focused** - MVP exists to prove "strangers show up together"

---

## 10. Out of Scope (Post-MVP)

**Deferred features:**
- Gender filter (collect data, implement later)
- Dietary restrictions (cut entirely)
- Local Guide badges (retention feature, not validation)
- Restaurant reviews with photos
- Map view with clustering
- System suggestions / matching algorithm
- Meal reminders
- Rating prompts via push notification
- Direct messages
- Typing indicators
- Google Places API
- Advanced moderation UI
- In-app notification settings
- Takeover logic (when creator cancels)

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| **No-shows** | Track show-up rate. If >30% no-show, add consequences (penalties, visibility reduction) |
| **Safety concerns** | Phone verification, face detection, public venues, approval mode, reporting |
| **Low user base** | Target food influencers, seed 50-100 restaurants, launch in dense districts only |
| **Chat spam/abuse** | Creator can remove users, report button, manual review |
| **Fake profiles** | Face detection required, phone verification |

---

## 12. MVP Scope Summary

### In Scope
✅ Phone auth + onboarding (9 steps)
✅ Create request (curated list OR manual entry)
✅ Browse requests (list view with filters)
✅ Join (open OR approval)
✅ Chat (text, images, basic features)
✅ Post-meal rating ("did they show up?")
✅ 3 push notifications
✅ Settings (edit profile/prefs, language, delete account, report)
✅ Vietnamese + English
✅ HCMC only (22 districts)

### Out of Scope
❌ Map view
❌ Gender filter
❌ Dietary restrictions
❌ Local Guide badges
❌ Restaurant reviews
❌ System suggestions
❌ Google Places API
❌ Direct messages
❌ Typing indicators
❌ Hanoi (just HCMC)

---

*Document Version: 3.0 (Lean MVP)*
*Based on product marketing interview: 2026-01-31*
*See also: [product-marketing-context.md](./specs/mvp/product-marketing-context.md)*
