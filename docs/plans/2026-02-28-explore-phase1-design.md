# Design: Explore Tab — Phase 1 (Discovery Infrastructure)

*Date: 2026-02-28*
*Status: Approved*
*Replaces: `2026-02-27-curated-lists-phase1-design.md` (superseded)*

---

## 1. Goal

Replace the existing narrow Curated Lists plan with a full unified Explore tab — the discovery infrastructure that gives users value even without network density. Centralizes the broken TikTok → Google Maps → Screenshots → WhatsApp workflow into one place.

**What ships in Phase 1:**
- 🔭 Explore tab (unified home: My Lists + Curated Lists + Search)
- My Lists (user-created personal lists with smart name suggestions)
- Curated Lists (editorial, gamified progress)
- Restaurant Profile (hub screen — social proof, active requests, pre-filled create request)
- Save to List bottom sheet (available from any surface)
- Pre-filled Create Request from restaurant profile

**Deferred to Phase 2:**
- Trending This Week (needs real activity data)
- Reviews
- Nominations
- PRO paywall on lists

---

## 2. Navigation Changes

### Bottom Tabs

Old: 🗺️ Browse | 💬 Chat | 🔔 Notifs | 👤 Profile
New: 🗺️ Browse | 🔭 Explore | 💬 Chat | 🔔 Notifs

Profile tab removed. Profile avatar (initials circle or photo) added to top-left of header on Browse and Explore tabs. Tapping it navigates to the existing profile screen.

**Files:**
- `app/(tabs)/_layout.tsx` — swap Profile for Explore, icons only (no labels)
- `app/(tabs)/index.tsx` — add avatar to header
- `app/(tabs)/explore.tsx` — new tab (Explore home)

---

## 3. Screens

### 3.1 Explore Tab Home (`app/(tabs)/explore.tsx`)

```
[Avatar]  Chopsticks

  🔍  Search restaurants, dishes...

  ── My Lists ──────────────────────
  📌 Want to Go          14  ›
  🎬 From TikTok          6  ›
  💑 Date Night           3  ›
  + New List

  ── Curated Lists ─────────────────
  🏆 Best Pho in Saigon
     12 spots · Vietnamese
     ████░░░░  3 of 12 visited

  🏆 Best Bánh Mì in D1
     8 spots · Street Food
     ░░░░░░░░  0 of 8 visited

  🏆 Best Cơm Tấm Spots
     10 spots · Vietnamese
     ██░░░░░░  2 of 10 visited
```

- My Lists section shows up to 3 lists, count badge, arrow to list detail
- "+ New List" opens the Create List sheet
- Curated Lists show progress bar (user_visits / total restaurants in list)
- Tapping any list → `list-detail.tsx`
- Search bar → inline search results (restaurants + dishes)

### 3.2 List Detail (`app/(screens)/list-detail.tsx`)

Handles both curated and personal lists. Variant determined by `list.type`.

Both list variants support **filter pills** to slice the restaurant list. Filters are derived dynamically from the restaurants in the list — only categories with >1 match are shown.

**Filter dimensions:**
| Filter | Values |
|--------|--------|
| Cuisine | Vietnamese, Japanese, Korean, Western, … (from restaurant data) |
| District | D1, D3, D5, Phú Nhuận, … (from restaurant data) |
| Budget | $ · $$ · $$$ |
| Status *(curated only)* | All · Been There · Not Yet |

Filters are multi-select pills, active filters shown in orange. Counts update as filters change (e.g. "3 of 12").

**Curated variant:**
```
← Best Pho in Saigon

  Your progress
  ████░░░░░░░░  3 of 12 visited

  [Vietnamese ✕]  [D1]  [D3]  [$]   ← active filter orange
  3 restaurants

  #1  Phở Thìn Bờ Hồ
      📍 D1 · ⭐ 4.6 · 23 Chopstickers
      [✓ Been There]  [📌 Save ▾]

  #3  Phở Hòa Pasteur
      📍 D3 · ⭐ 4.5 · 17 Chopstickers
      [Mark Visited]  [📌 Save ▾]
```

- Progress bar always reflects full list (not filtered view)
- Been There toggles on/off, updates `user_visits`, recalculates progress bar
- Save ▾ opens Save to List sheet
- Tapping restaurant name → `restaurant-detail.tsx`

**Personal variant:**
```
← 🎬 From TikTok                    •••

  14 restaurants · Private

  [All]  [Vietnamese]  [D1]  [D5]  [$$]
  14 restaurants

  🍜  Phở Thìn Bờ Hồ
      📍 D1 · ⭐ 4.6 on Chopsticks
      [🍽️ Create Request]

  🥖  Bánh Mì Huỳnh Hoa
      📍 D5 · ⭐ 4.8 on Chopsticks
      [🍽️ Create Request]

  🍲  Lẻ Quán
      📍 D7 · New on Chopsticks
      [🍽️ Create Request]
```

- ••• menu → rename list, delete list
- Filters derived from restaurants in the list (only show filters with >1 match)
- "Create Request" navigates to `create-request.tsx` with restaurant pre-filled
- Tapping restaurant name → `restaurant-detail.tsx`

### 3.3 Restaurant Profile (`app/(screens)/restaurant-detail.tsx`)

The hub every surface links to. Chopsticks-native social proof (not Google Maps).

```
← Phở Thìn Bờ Hồ                    ↗

  🍜
  Phở Thìn Bờ Hồ
  📍 District 1 · Vietnamese
  ⭐ 4.6  (23 Chopstickers rated this)

  [📌 Save ▾]  [✓ Been Here]  [↗ Share]

  ── [🍽️ Create Meal Request Here] ──

  ── On Chopsticks ─────────────────
  31 Meals     89 Diners     4.6 Rating

  "The broth is unreal, go before 8am"
  — Minh · last week

  "Order the fried dough sticks with it"
  — Linh · 2 weeks ago

  ── Active Requests Now ───────────
  12:00 · Today · 2 spots left
  by Minh · Open join          [Join]

  ── Part of Lists ─────────────────
  🏆 Best Pho in Saigon (#1 of 12)
  📌 Your "Want to Go"
```

- "↗" in header → React Native Share API (share restaurant name + address)
- Save ▾ → Save to List sheet
- Been Here → toggles `user_visits`
- "Create Meal Request Here" → `create-request.tsx` with restaurant, cuisine, district pre-filled
- Active Requests: live query of open requests at this restaurant, Join button inline
- Part of Lists: shows curated lists this restaurant appears in + user's personal lists containing it
- Reviews: from `reviews` table (populated via post-meal flow, Phase 2 expands)

### 3.4 My Lists Screen (`app/(screens)/my-lists.tsx`)

Full list management — navigated to from "My Lists" section header on Explore home.

```
← My Lists                        + New

  Save restaurants from TikTok, Instagram,
  or anywhere — all in one place.

  📌  Want to Go           14  ›
  🎬  From TikTok           6  ›
  💑  Date Night            3  ›
  🍺  Late Night            2  ›

  + Create a new list
```

- "+ New" and "+ Create a new list" both open the Create List sheet

---

## 4. Create List Sheet

Bottom sheet, invoked from Explore home, My Lists screen, and Save to List sheet.

**Step 1: Template picker (quick start)**
```
Create a list

  [emoji]  Name your list...

  ── Quick start ───────────────────
  📌  Want to Go
  🎬  From TikTok / Instagram
  💑  Date Night
  💰  Cheap Eats
  ☕  Café Spots
  🍺  Drinks & Cocktails
  🌙  Late Night
  🌶️  Pho Spots
  🥖  Bánh Mì Spots
  🏢  Work Lunch
  ─────────────────────────────────
      [Create blank list]
```

Tapping a template pre-fills the name + emoji. User can edit before confirming.

**Smart suggestion when saving a restaurant:**
When triggered from the Save to List sheet ("+  Create new list"), the sheet pre-fills a suggestion based on the restaurant's attributes:

| Restaurant signal | Suggested name | Emoji |
|------------------|----------------|-------|
| budget = `$` | Cheap Eats | 💰 |
| budget = `$$$`+ | Date Night | 💑 |
| category = café | Café Spots | ☕ |
| category = bar/cocktail | Drinks & Cocktails | 🍺 |
| cuisine = Vietnamese, dish type = pho | Pho Spots | 🍜 |
| cuisine = Vietnamese, dish type = bún bò | Bún Bò Spots | 🌶️ |
| cuisine = Vietnamese, dish type = bánh mì | Bánh Mì Spots | 🥖 |
| open_after_10pm = true | Late Night | 🌙 |
| district matches another list | [District] Faves | 📍 |

Implemented as a pure `suggestListName(restaurant)` utility — no API call, rule-based only. User can edit the pre-fill before creating.

---

## 5. Save to List Sheet

Bottom sheet modal. Invoked from list detail (Save ▾ button) and restaurant profile (Save ▾ button).

```
Save to list...

  [✓]  📌 Want to Go          14
  [ ]  🎬 From TikTok          6
  [ ]  💑 Date Night           3
  ─────────────────────────────────
  +  Create new list  ← opens Create List sheet
                        with smart suggestion pre-filled
```

- Toggle checkmarks add/remove from `list_restaurants`
- Multiple lists can be selected simultaneously
- "Create new list" opens Create List sheet, then returns here with new list checked

---

## 6. Pre-filled Create Request

When "Create Meal Request Here" is tapped from the restaurant profile:

- Navigates to existing `create-request.tsx`
- Restaurant field: locked (pre-filled, non-editable)
- Cuisine field: auto-filled from restaurant, labelled "auto"
- District field: auto-filled from restaurant, labelled "auto"
- All other fields: normal (time, group size, budget, join type)

No new screen — just a navigation param `restaurantId` passed to the existing create-request screen.

---

## 7. Search

Basic text search on the Explore tab home. Searches the `restaurants` table by name.

```
← [🔍 bún bò              ✕]

  Vietnamese  District 1  <100k    ← filter pills

  4 restaurants found

  Bún Bò Huế Mệ Kéo
  📍 D3 · Vietnamese
  ⭐ 4.7 · 8 Chopstickers · 🏆 Top 5 Bún Bò

  Bún Bò Nam Bộ
  📍 D1 · Vietnamese
  ⭐ 4.2 · 5 Chopstickers · 📌 Your list
```

- Debounced query on `restaurants` table (name ILIKE)
- Results show Chopstickers rating, list membership badges
- Tapping result → restaurant-detail.tsx
- Filter pills for cuisine / district / budget (nice-to-have, can ship after)

---

## 8. Data Model

### New tables (single migration: 027)

```sql
-- Unified lists: curated (type='curated') and personal (type='personal')
CREATE TABLE lists (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text NOT NULL CHECK (type IN ('curated', 'personal')),
  owner_id     uuid REFERENCES users(id) ON DELETE CASCADE,  -- null for curated
  title        text NOT NULL,
  description  text,
  emoji        text,            -- personal lists
  category     text,            -- curated lists
  city         text DEFAULT 'hcmc',
  is_published boolean DEFAULT false,  -- curated only
  created_at   timestamptz DEFAULT now()
);

-- Restaurants within a list
CREATE TABLE list_restaurants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id       uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  rank          int,   -- 1-based for curated, null for personal
  created_at    timestamptz DEFAULT now(),
  UNIQUE(list_id, restaurant_id)
);

-- Been There / visited tracking
CREATE TABLE user_visits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  visited_at    timestamptz DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);
```

No `user_favorites` table — My Lists replaces the favorites pattern entirely.

### RLS Policies

| Table | Policy |
|-------|--------|
| `lists` (curated) | Public read where `is_published = true` |
| `lists` (personal) | Owner read/write only (`owner_id = auth.uid()`) |
| `list_restaurants` (curated list) | Public read |
| `list_restaurants` (personal list) | Owner read/write via list ownership |
| `user_visits` | Owner read/write only (`user_id = auth.uid()`) |

### Seed data

File: `supabase/seed-lists.sql`

5 curated lists referencing existing restaurants in the DB:
1. 🏆 Best Pho in Saigon (12 spots)
2. 🏆 Best Bánh Mì in District 1 (8 spots)
3. 🏆 Best Cơm Tấm Spots (10 spots)
4. 🏆 Best Late Night Eats (6 spots)
5. 🏆 Best Street Food in Phú Nhuận (8 spots)

---

## 9. API & Hooks

### New service: `lib/services/api/lists.ts`

```typescript
getLists()                                    // all published curated lists
getUserLists(userId)                          // user's personal lists
getListRestaurants(listId, filters?)          // restaurants in a list, optional filter params
createList(data)                              // create personal list
deleteList(listId)                            // delete personal list
addToList(listId, restaurantId)               // add restaurant to personal list
removeFromList(listId, restaurantId)
toggleVisit(restaurantId)                     // add/remove user_visits
getUserVisits(userId)                         // all been-there marks for a user
getRestaurantDetail(restaurantId)             // restaurant + stats + reviews + active requests + list memberships
searchRestaurants(query)                      // name ILIKE search
suggestListName(restaurant)                   // pure utility, rule-based, no API call
```

**Filter params shape (client-side for MVP — filters applied after fetch):**
```typescript
interface ListFilters {
  cuisines?: string[]    // e.g. ['Vietnamese', 'Japanese']
  districts?: string[]   // e.g. ['District 1', 'Phú Nhuận']
  budgets?: string[]     // e.g. ['$', '$$']
  status?: 'all' | 'visited' | 'not_visited'  // curated only
}
```

Filtering is done client-side on the already-fetched list (no extra DB round-trips). Filter options are derived from the restaurant data already loaded in the list.

### New hooks: `lib/hooks/queries/useLists.ts`

```typescript
useCuratedLists()
useUserLists()
useListRestaurants(listId)       // returns full list; component applies filters locally
useCreateList()
useDeleteList()
useAddToList()
useRemoveFromList()
useToggleVisit()
useUserVisits()
useRestaurantDetail(restaurantId)
useSearchRestaurants(query)
```

Follows existing pattern: TanStack Query v5, `{ data, error }` return from API layer, `throw error` inside hooks.

---

## 10. Out of Scope (Phase 1)

| Feature | Deferred to |
|---------|------------|
| Trending This Week | Phase 2 (needs real activity data) |
| Reviews (write new) | Phase 2 |
| Nominations | Phase 2 |
| PRO paywall on lists | Phase 4 |
| AI-powered list name suggestions (LLM) | Phase 2+ |
| Map view | Phase 5+ |
| Grab / Google Maps integration | Phase 5+ |

---

## 11. End State

After Phase 1, every surface in the app links to the restaurant profile as a hub:
- Meal request cards → restaurant profile
- List detail rows → restaurant profile
- Search results → restaurant profile
- Restaurant profile → create request (pre-filled)
- Restaurant profile → save to list
- Restaurant profile → been here

This closes the loop between discovery and action.

---

*Approved by user on 2026-02-28*
