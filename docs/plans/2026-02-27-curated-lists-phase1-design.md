# Design: Curated Lists & Food Discovery — Phase 1

*Date: 2026-02-27*
*Status: Approved*
*Scope: Phase 1 (Lean Discover) — foundation for Phase 2 (Reviews + Social) and Phase 3 (Community + Premium)*

---

## 1. Goal

Add a curated restaurant lists tab to the app so users can discover great spots in HCMC. Phase 1 is intentionally lean: browse editorial lists, mark restaurants as "been there", save favorites. No paywall. No reviews. No social sharing yet.

---

## 2. Navigation Changes

### Bottom Tabs (icons only, no labels)
```
🗺  📋  💬  🔔
```
| Icon | Screen | File |
|------|--------|------|
| Map/compass | Browse meal requests (existing) | `app/(tabs)/index.tsx` |
| List | Curated lists (new) | `app/(tabs)/lists.tsx` |
| Chat bubble | Chats (existing) | `app/(tabs)/chat.tsx` |
| Bell | Notifications (existing) | `app/(tabs)/notifications.tsx` |

**Profile tab removed.** Profile avatar added to header (top-left, next to "Chopsticks" wordmark) on Browse and Lists tabs. Tapping avatar routes to existing profile screen.

**Files affected:**
- `chopsticks/app/(tabs)/_layout.tsx` — reorder tabs, remove Profile, add Lists, icon-only
- `chopsticks/app/(tabs)/index.tsx` — add header avatar
- `chopsticks/app/(tabs)/lists.tsx` — new file

---

## 3. Screens

### 3.1 Lists Tab (`app/(tabs)/lists.tsx`)

Simple scrollable list of editorial lists.

```
[Avatar]  Chopsticks

  Best Pho in Saigon
  12 spots · Vietnamese
  ─────────────────────
  Best Bánh Mì in D1
  8 spots · Street Food
  ─────────────────────
  Best Late Night Eats
  6 spots · Various
```

- Fetches all published lists via `useLists()`
- Each row is a pressable card → navigates to List Detail

### 3.2 List Detail (`app/(screens)/list-detail.tsx`)

Ranked restaurant list with inline actions.

```
← Best Pho in Saigon

  #1  Phở Thìn Bờ Hồ       D1
      [✓ Been There]  [♡ Save]

  #2  Phở Lệ                D3
      [Mark Visited]  [♡ Save]

  #3  Phở Hòa Pasteur       D3
      [Mark Visited]  [♡ Save]
```

- Fetches ranked restaurants via `useListRestaurants(listId)`
- Been There: toggles on/off, saves instantly to `user_visits`
- Save: toggles favorite on/off, saves instantly to `user_favorites`
- No separate restaurant detail screen in Phase 1

---

## 4. Data Model

### New Tables

**`lists`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| title | text | e.g., "Best Pho in Saigon" |
| description | text | Short editorial description |
| category | text | e.g., "Vietnamese", "Street Food" |
| city | text | "hcmc" for now |
| is_published | boolean | Only published lists shown |
| created_at | timestamptz | |

**`list_restaurants`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| list_id | uuid | FK → lists |
| restaurant_id | uuid | FK → restaurants |
| rank | int | 1 = top of list |
| created_at | timestamptz | |

**`user_favorites`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| restaurant_id | uuid | FK → restaurants |
| created_at | timestamptz | |

**`user_visits`**
| Column | Type | Notes |
|--------|------|-------|
| id | uuid | PK |
| user_id | uuid | FK → users |
| restaurant_id | uuid | FK → restaurants |
| visited_at | timestamptz | |

### Unique Constraints
- `user_favorites(user_id, restaurant_id)` — one favorite per restaurant per user
- `user_visits(user_id, restaurant_id)` — one visit mark per restaurant per user

### RLS Policies
- `lists` → public read (`is_published = true`)
- `list_restaurants` → public read
- `user_favorites` → private (own rows only)
- `user_visits` → private (own rows only)

---

## 5. API & Hooks

### New files
- `chopsticks/lib/services/api/lists.ts` — `getLists()`, `getListRestaurants(listId)`, `toggleFavorite()`, `toggleVisit()`
- `chopsticks/lib/hooks/queries/useLists.ts` — `useLists()`, `useListRestaurants(listId)`, `useToggleFavorite()`, `useToggleVisit()`

---

## 6. Seed Data

**File:** `chopsticks/supabase/seed-lists.sql`

3-5 editorial lists referencing existing restaurants already in the DB. Managed via SQL seed for initial launch, then Supabase Studio for ongoing additions.

Example lists:
1. Best Pho in Saigon
2. Best Bánh Mì in District 1
3. Best Cơm Tấm Spots
4. Best Late Night Eats
5. Best Street Food in Phú Nhuận

---

## 7. Out of Scope (Phase 1)

- Paywall / premium access
- Restaurant detail screen
- Reviews
- Social sharing / invite to eat
- Community nominations
- Favorites and Been There list screens
- Other cities

These are planned for Phase 2 and Phase 3.

---

## 8. End Goal (Phase 2 + 3)

Phase 1 is the foundation. Future phases add:
- **Phase 2:** Full restaurant detail screen (as hub), reviews, social sharing, invite to eat
- **Phase 3:** Community nominations, premium city access, personalized recommendations

---

*Approved by user on 2026-02-27*
