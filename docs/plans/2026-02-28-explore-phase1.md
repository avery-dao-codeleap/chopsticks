# Explore Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build the full unified Explore tab — My Lists, Curated Lists with progress, Restaurant Profile hub, Save to List sheet, smart list name suggestions, and search — replacing the narrower Curated Lists plan.

**Architecture:** Single Supabase migration (027) adds `lists`, `list_restaurants`, `user_visits`. New API service + TanStack Query hooks following existing `{ data, error }` pattern. Six new screens/components. Navigation gains Explore tab and Notifs tab; Profile tab moves to header avatar.

**Tech Stack:** Expo Router (file-based), Supabase (postgres + RLS), TanStack Query v5, FontAwesome icons, React Native dark theme (`#0a0a0a` bg, `#171717` card, `#f97316` orange).

**Design doc:** `docs/plans/2026-02-28-explore-phase1-design.md`

---

## Context You Need

- All lib code lives under `chopsticks/lib/` — imported as `@/lib/...`
- API pattern: functions return `{ data, error }`, hooks `throw error` inside `queryFn`
- Colors: bg `#0a0a0a`, card `#171717`, border `#262626`, muted `#6b7280`, orange `#f97316`
- Icons: `FontAwesome` from `@expo/vector-icons/FontAwesome`
- Auth: `useAuthStore(state => state.session)` for current user session
- Navigation params: `useLocalSearchParams<{ id: string }>()` from expo-router
- Current migration numbering: 001–026. New migration = **027**
- Current tabs: `index` (Browse), `chat`, `profile`. After this plan: `index`, `explore`, `chat`, `notifications`
- All paths below are relative to `chopsticks/`

---

## Task 1: DB Migration 027 — New Tables + RLS + Seed

**Files:**
- Create: `supabase/migrations/027_explore_lists.sql`

**Step 1: Create the migration file**

```sql
-- 027_explore_lists.sql
-- Explore Phase 1: lists, list_restaurants, user_visits

-- ============================================================
-- 1. LISTS (unified: curated editorial + personal user lists)
-- ============================================================
CREATE TABLE lists (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text NOT NULL CHECK (type IN ('curated', 'personal')),
  owner_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  emoji        text,
  category     text,
  city         text NOT NULL DEFAULT 'hcmc',
  is_published boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. LIST_RESTAURANTS (restaurants in a list, ranked for curated)
-- ============================================================
CREATE TABLE list_restaurants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id       uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  rank          int,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(list_id, restaurant_id)
);

-- ============================================================
-- 3. USER_VISITS ("Been There" tracking)
-- ============================================================
CREATE TABLE user_visits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  visited_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- ============================================================
-- 4. INDEXES
-- ============================================================
CREATE INDEX idx_lists_type ON lists(type);
CREATE INDEX idx_lists_owner_id ON lists(owner_id);
CREATE INDEX idx_list_restaurants_list_id ON list_restaurants(list_id);
CREATE INDEX idx_list_restaurants_restaurant_id ON list_restaurants(restaurant_id);
CREATE INDEX idx_user_visits_user_id ON user_visits(user_id);
CREATE INDEX idx_user_visits_restaurant_id ON user_visits(restaurant_id);

-- ============================================================
-- 5. RLS
-- ============================================================
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_visits ENABLE ROW LEVEL SECURITY;

-- lists: public read for published curated, owner full access for personal
CREATE POLICY "Public read published curated lists"
  ON lists FOR SELECT
  USING (type = 'curated' AND is_published = true);

CREATE POLICY "Users manage own personal lists"
  ON lists FOR ALL
  USING (type = 'personal' AND owner_id = auth.uid())
  WITH CHECK (type = 'personal' AND owner_id = auth.uid());

-- list_restaurants: public read for curated, owner access for personal lists
CREATE POLICY "Public read curated list restaurants"
  ON list_restaurants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_restaurants.list_id
        AND lists.type = 'curated'
        AND lists.is_published = true
    )
  );

CREATE POLICY "Users manage restaurants in own lists"
  ON list_restaurants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_restaurants.list_id
        AND lists.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_restaurants.list_id
        AND lists.owner_id = auth.uid()
    )
  );

-- user_visits: private, own rows only
CREATE POLICY "Users manage own visits"
  ON user_visits FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 6. SEED: 5 curated lists (add restaurants via Supabase Studio
--    after seeding — use Studio to get restaurant IDs)
-- ============================================================
INSERT INTO lists (type, title, description, category, city, is_published) VALUES
  ('curated', 'Best Phở in Saigon', 'The definitive guide to Saigon''s best bowls of phở — from classic northern to rich southern styles.', 'Vietnamese', 'hcmc', true),
  ('curated', 'Best Bánh Mì in District 1', 'Crispy baguettes stuffed to perfection. These are the spots worth lining up for.', 'Street Food', 'hcmc', true),
  ('curated', 'Best Cơm Tấm Spots', 'Broken rice done right — juicy grilled pork, perfect fried egg, the works.', 'Vietnamese', 'hcmc', true),
  ('curated', 'Best Late Night Eats', 'Still hungry after midnight? These spots have you covered.', 'Various', 'hcmc', true),
  ('curated', 'Best Street Food in Phú Nhuận', 'A neighbourhood crawl through Phú Nhuận''s best street food gems.', 'Street Food', 'hcmc', true);
```

**Step 2: Run the migration**

```bash
cd chopsticks
npx supabase db push
```

Expected: migration applies without error. Verify in Supabase Studio → Tables that `lists`, `list_restaurants`, `user_visits` exist with 5 seed rows in `lists`.

**Step 3: Commit**

```bash
git add supabase/migrations/027_explore_lists.sql
git commit -m "[Explore] Task 1: DB migration 027 — lists, list_restaurants, user_visits + RLS + seed"
```

---

## Task 2: API Service — `lib/services/api/lists.ts`

**Files:**
- Create: `lib/services/api/lists.ts`

**Step 1: Create the file**

```typescript
import { supabase } from '../supabase';

// ============================================================
// Types
// ============================================================

export interface ListRow {
  id: string;
  type: 'curated' | 'personal';
  owner_id: string | null;
  title: string;
  description: string | null;
  emoji: string | null;
  category: string | null;
  city: string;
  is_published: boolean;
  created_at: string;
}

export interface ListRestaurantRow {
  id: string;
  list_id: string;
  restaurant_id: string;
  rank: number | null;
  created_at: string;
  restaurants: {
    id: string;
    name: string;
    address: string;
    district: string;
    cuisine_type: string;
  };
}

export interface UserVisitRow {
  id: string;
  user_id: string;
  restaurant_id: string;
  visited_at: string;
}

export interface RestaurantDetail {
  id: string;
  name: string;
  address: string;
  district: string;
  cuisine_type: string;
  city: string;
  source: string;
  stats: {
    meal_count: number;
    diner_count: number;
    avg_rating: number | null;
  };
  active_requests: ActiveRequestRow[];
  curated_list_memberships: { list_id: string; list_title: string; rank: number | null }[];
  user_list_memberships: { list_id: string; list_title: string; emoji: string | null }[];
  user_has_visited: boolean;
}

export interface ActiveRequestRow {
  id: string;
  time_window: string;
  group_size: number;
  join_type: 'open' | 'approval';
  participant_count: number;
  requester: { id: string; name: string | null };
}

export interface CreateListInput {
  title: string;
  emoji: string;
}

// ============================================================
// Curated Lists
// ============================================================

export async function getCuratedLists(): Promise<{ data: ListRow[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('type', 'curated')
      .eq('is_published', true)
      .order('created_at', { ascending: true });
    if (error) return { data: [], error: new Error(error.message) };
    return { data: data ?? [], error: null };
  } catch (err) {
    console.error('getCuratedLists error:', err);
    return { data: [], error: err as Error };
  }
}

// ============================================================
// Personal Lists
// ============================================================

export async function getUserLists(userId: string): Promise<{ data: ListRow[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('type', 'personal')
      .eq('owner_id', userId)
      .order('created_at', { ascending: true });
    if (error) return { data: [], error: new Error(error.message) };
    return { data: data ?? [], error: null };
  } catch (err) {
    console.error('getUserLists error:', err);
    return { data: [], error: err as Error };
  }
}

export async function createList(
  userId: string,
  input: CreateListInput,
): Promise<{ data: ListRow | null; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .insert({ type: 'personal', owner_id: userId, title: input.title, emoji: input.emoji, city: 'hcmc' })
      .select()
      .single();
    if (error) return { data: null, error: new Error(error.message) };
    return { data, error: null };
  } catch (err) {
    console.error('createList error:', err);
    return { data: null, error: err as Error };
  }
}

export async function deleteList(listId: string): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase.from('lists').delete().eq('id', listId);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err) {
    console.error('deleteList error:', err);
    return { error: err as Error };
  }
}

// ============================================================
// List Restaurants
// ============================================================

export async function getListRestaurants(
  listId: string,
): Promise<{ data: ListRestaurantRow[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('list_restaurants')
      .select('*, restaurants(id, name, address, district, cuisine_type)')
      .eq('list_id', listId)
      .order('rank', { ascending: true, nullsFirst: false });
    if (error) return { data: [], error: new Error(error.message) };
    return { data: data ?? [], error: null };
  } catch (err) {
    console.error('getListRestaurants error:', err);
    return { data: [], error: err as Error };
  }
}

export async function addToList(
  listId: string,
  restaurantId: string,
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('list_restaurants')
      .upsert({ list_id: listId, restaurant_id: restaurantId }, { onConflict: 'list_id,restaurant_id' });
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err) {
    console.error('addToList error:', err);
    return { error: err as Error };
  }
}

export async function removeFromList(
  listId: string,
  restaurantId: string,
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('list_restaurants')
      .delete()
      .eq('list_id', listId)
      .eq('restaurant_id', restaurantId);
    if (error) return { error: new Error(error.message) };
    return { error: null };
  } catch (err) {
    console.error('removeFromList error:', err);
    return { error: err as Error };
  }
}

// ============================================================
// User Visits ("Been There")
// ============================================================

export async function getUserVisits(
  userId: string,
): Promise<{ data: UserVisitRow[]; error: Error | null }> {
  try {
    const { data, error } = await supabase
      .from('user_visits')
      .select('*')
      .eq('user_id', userId);
    if (error) return { data: [], error: new Error(error.message) };
    return { data: data ?? [], error: null };
  } catch (err) {
    console.error('getUserVisits error:', err);
    return { data: [], error: err as Error };
  }
}

export async function toggleVisit(
  userId: string,
  restaurantId: string,
  currentlyVisited: boolean,
): Promise<{ error: Error | null }> {
  try {
    if (currentlyVisited) {
      const { error } = await supabase
        .from('user_visits')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId);
      if (error) return { error: new Error(error.message) };
    } else {
      const { error } = await supabase
        .from('user_visits')
        .upsert({ user_id: userId, restaurant_id: restaurantId }, { onConflict: 'user_id,restaurant_id' });
      if (error) return { error: new Error(error.message) };
    }
    return { error: null };
  } catch (err) {
    console.error('toggleVisit error:', err);
    return { error: err as Error };
  }
}

// ============================================================
// Restaurant Detail (hub screen)
// ============================================================

export async function getRestaurantDetail(
  restaurantId: string,
  userId: string | null,
): Promise<{ data: RestaurantDetail | null; error: Error | null }> {
  try {
    // 1. Base restaurant row
    const { data: restaurant, error: rErr } = await supabase
      .from('restaurants')
      .select('*')
      .eq('id', restaurantId)
      .single();
    if (rErr || !restaurant) return { data: null, error: new Error(rErr?.message ?? 'Not found') };

    // 2. Completed meal count + unique diner count
    const { data: completedRequests } = await supabase
      .from('meal_requests')
      .select('id')
      .eq('restaurant_id', restaurantId)
      .eq('status', 'completed');
    const requestIds = (completedRequests ?? []).map((r: { id: string }) => r.id);

    let mealCount = requestIds.length;
    let dinerCount = 0;
    let avgRating: number | null = null;

    if (requestIds.length > 0) {
      const { count } = await supabase
        .from('request_participants')
        .select('*', { count: 'exact', head: true })
        .in('request_id', requestIds)
        .eq('status', 'joined');
      dinerCount = count ?? 0;

      const { data: ratingsData } = await supabase
        .from('ratings')
        .select('score')
        .in('request_id', requestIds);
      if (ratingsData && ratingsData.length > 0) {
        const sum = ratingsData.reduce((acc: number, r: { score: number }) => acc + r.score, 0);
        avgRating = Math.round((sum / ratingsData.length) * 10) / 10;
      }
    }

    // 3. Active requests at this restaurant
    const { data: activeReqs } = await supabase
      .from('meal_requests')
      .select(`
        id, time_window, group_size, join_type,
        users!meal_requests_requester_id_fkey(id, name)
      `)
      .eq('restaurant_id', restaurantId)
      .eq('status', 'active')
      .order('time_window', { ascending: true })
      .limit(3);

    const active_requests: ActiveRequestRow[] = await Promise.all(
      (activeReqs ?? []).map(async (req: {
        id: string;
        time_window: string;
        group_size: number;
        join_type: 'open' | 'approval';
        users: { id: string; name: string | null };
      }) => {
        const { count } = await supabase
          .from('request_participants')
          .select('*', { count: 'exact', head: true })
          .eq('request_id', req.id)
          .eq('status', 'joined');
        return {
          id: req.id,
          time_window: req.time_window,
          group_size: req.group_size,
          join_type: req.join_type,
          participant_count: count ?? 0,
          requester: { id: req.users.id, name: req.users.name },
        };
      }),
    );

    // 4. Curated list memberships
    const { data: curatedMemberships } = await supabase
      .from('list_restaurants')
      .select('rank, lists!inner(id, title, type, is_published)')
      .eq('restaurant_id', restaurantId)
      .eq('lists.type', 'curated')
      .eq('lists.is_published', true);

    const curated_list_memberships = (curatedMemberships ?? []).map((m: {
      rank: number | null;
      lists: { id: string; title: string };
    }) => ({
      list_id: m.lists.id,
      list_title: m.lists.title,
      rank: m.rank,
    }));

    // 5. User's personal list memberships
    let user_list_memberships: { list_id: string; list_title: string; emoji: string | null }[] = [];
    if (userId) {
      const { data: personalMemberships } = await supabase
        .from('list_restaurants')
        .select('lists!inner(id, title, emoji, owner_id, type)')
        .eq('restaurant_id', restaurantId)
        .eq('lists.type', 'personal')
        .eq('lists.owner_id', userId);

      user_list_memberships = (personalMemberships ?? []).map((m: {
        lists: { id: string; title: string; emoji: string | null };
      }) => ({
        list_id: m.lists.id,
        list_title: m.lists.title,
        emoji: m.lists.emoji,
      }));
    }

    // 6. Has user visited?
    let user_has_visited = false;
    if (userId) {
      const { data: visit } = await supabase
        .from('user_visits')
        .select('id')
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId)
        .maybeSingle();
      user_has_visited = !!visit;
    }

    return {
      data: {
        ...restaurant,
        stats: { meal_count: mealCount, diner_count: dinerCount, avg_rating: avgRating },
        active_requests,
        curated_list_memberships,
        user_list_memberships,
        user_has_visited,
      },
      error: null,
    };
  } catch (err) {
    console.error('getRestaurantDetail error:', err);
    return { data: null, error: err as Error };
  }
}

// ============================================================
// Search
// ============================================================

export async function searchRestaurants(
  query: string,
): Promise<{ data: { id: string; name: string; district: string; cuisine_type: string }[]; error: Error | null }> {
  try {
    if (!query.trim()) return { data: [], error: null };
    const { data, error } = await supabase
      .from('restaurants')
      .select('id, name, district, cuisine_type')
      .ilike('name', `%${query.trim()}%`)
      .limit(20);
    if (error) return { data: [], error: new Error(error.message) };
    return { data: data ?? [], error: null };
  } catch (err) {
    console.error('searchRestaurants error:', err);
    return { data: [], error: err as Error };
  }
}
```

**Step 2: Verify TypeScript compiles**

```bash
cd chopsticks && pnpm typecheck 2>&1 | grep "lists.ts"
```

Expected: no errors for this file.

**Step 3: Commit**

```bash
git add lib/services/api/lists.ts
git commit -m "[Explore] Task 2: API service — lists, visits, restaurant detail, search"
```

---

## Task 3: Hooks — `lib/hooks/queries/useLists.ts`

**Files:**
- Create: `lib/hooks/queries/useLists.ts`

**Step 1: Create the file**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as listsApi from '@/lib/services/api/lists';
import type { CreateListInput } from '@/lib/services/api/lists';
import { useAuthStore } from '@/lib/stores/auth';

// ── Curated Lists ────────────────────────────────────────────
export function useCuratedLists() {
  return useQuery({
    queryKey: ['curated-lists'],
    queryFn: async () => {
      const { data, error } = await listsApi.getCuratedLists();
      if (error) throw error;
      return data;
    },
  });
}

// ── User Personal Lists ──────────────────────────────────────
export function useUserLists() {
  const session = useAuthStore(state => state.session);
  const userId = session?.user?.id ?? '';
  return useQuery({
    queryKey: ['user-lists', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await listsApi.getUserLists(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useCreateList() {
  const qc = useQueryClient();
  const session = useAuthStore(state => state.session);
  return useMutation({
    mutationFn: async (input: CreateListInput) => {
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');
      const { data, error } = await listsApi.createList(userId, input);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-lists'] });
    },
  });
}

export function useDeleteList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (listId: string) => {
      const { error } = await listsApi.deleteList(listId);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-lists'] });
    },
  });
}

// ── List Restaurants ─────────────────────────────────────────
export function useListRestaurants(listId: string | undefined) {
  return useQuery({
    queryKey: ['list-restaurants', listId],
    queryFn: async () => {
      if (!listId) return [];
      const { data, error } = await listsApi.getListRestaurants(listId);
      if (error) throw error;
      return data;
    },
    enabled: !!listId,
  });
}

export function useAddToList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, restaurantId }: { listId: string; restaurantId: string }) => {
      const { error } = await listsApi.addToList(listId, restaurantId);
      if (error) throw error;
    },
    onSuccess: (_data, { listId }) => {
      qc.invalidateQueries({ queryKey: ['list-restaurants', listId] });
    },
  });
}

export function useRemoveFromList() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ listId, restaurantId }: { listId: string; restaurantId: string }) => {
      const { error } = await listsApi.removeFromList(listId, restaurantId);
      if (error) throw error;
    },
    onSuccess: (_data, { listId }) => {
      qc.invalidateQueries({ queryKey: ['list-restaurants', listId] });
    },
  });
}

// ── User Visits ("Been There") ───────────────────────────────
export function useUserVisits() {
  const session = useAuthStore(state => state.session);
  const userId = session?.user?.id ?? '';
  return useQuery({
    queryKey: ['user-visits', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await listsApi.getUserVisits(userId);
      if (error) throw error;
      return data;
    },
    enabled: !!userId,
  });
}

export function useToggleVisit() {
  const qc = useQueryClient();
  const session = useAuthStore(state => state.session);
  return useMutation({
    mutationFn: async ({ restaurantId, currentlyVisited }: { restaurantId: string; currentlyVisited: boolean }) => {
      const userId = session?.user?.id;
      if (!userId) throw new Error('Not authenticated');
      const { error } = await listsApi.toggleVisit(userId, restaurantId, currentlyVisited);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['user-visits'] });
      qc.invalidateQueries({ queryKey: ['restaurant-detail'] });
    },
  });
}

// ── Restaurant Detail ────────────────────────────────────────
export function useRestaurantDetail(restaurantId: string | undefined) {
  const session = useAuthStore(state => state.session);
  const userId = session?.user?.id ?? null;
  return useQuery({
    queryKey: ['restaurant-detail', restaurantId, userId],
    queryFn: async () => {
      if (!restaurantId) return null;
      const { data, error } = await listsApi.getRestaurantDetail(restaurantId, userId);
      if (error) throw error;
      return data;
    },
    enabled: !!restaurantId,
  });
}

// ── Search ───────────────────────────────────────────────────
export function useSearchRestaurants(query: string) {
  return useQuery({
    queryKey: ['search-restaurants', query],
    queryFn: async () => {
      const { data, error } = await listsApi.searchRestaurants(query);
      if (error) throw error;
      return data;
    },
    enabled: query.trim().length > 1,
  });
}
```

**Step 2: Typecheck**

```bash
cd chopsticks && pnpm typecheck 2>&1 | grep "useLists.ts"
```

Expected: no errors.

**Step 3: Commit**

```bash
git add lib/hooks/queries/useLists.ts
git commit -m "[Explore] Task 3: TanStack Query hooks for lists, visits, restaurant detail, search"
```

---

## Task 4: Utility — `lib/utils/suggestListName.ts`

**Files:**
- Create: `lib/utils/suggestListName.ts`

**Step 1: Create the file**

```typescript
/**
 * Rule-based list name suggestion based on restaurant attributes.
 * No API call — pure logic using cuisine_type and district.
 */

interface RestaurantForSuggestion {
  cuisine_type: string;
  district?: string;
  name?: string;
}

interface ListSuggestion {
  title: string;
  emoji: string;
}

const CUISINE_SUGGESTIONS: Record<string, ListSuggestion> = {
  drinks:            { title: 'Café Spots', emoji: '☕' },
  dessert:           { title: 'Sweet Spots', emoji: '🍨' },
  bread:             { title: 'Bánh Mì Spots', emoji: '🥖' },
  seafood:           { title: 'Seafood Spots', emoji: '🦐' },
  hotpot_grill:      { title: 'Hotpot & Grill', emoji: '🍲' },
  fast_food:         { title: 'Quick Bites', emoji: '🍔' },
  healthy:           { title: 'Healthy Eats', emoji: '🥗' },
  veggie:            { title: 'Veggie Spots', emoji: '🥦' },
  international:     { title: 'International Spots', emoji: '🌍' },
  snack:             { title: 'Snack Spots', emoji: '🍿' },
  vietnamese_cakes:  { title: 'Vietnamese Cakes', emoji: '🍰' },
};

export function suggestListName(restaurant: RestaurantForSuggestion): ListSuggestion {
  const { cuisine_type, name = '' } = restaurant;
  const nameLower = name.toLowerCase();

  // Noodle sub-type detection from name
  if (cuisine_type === 'noodles_congee') {
    if (nameLower.includes('phở') || nameLower.includes('pho')) {
      return { title: 'Phở Spots', emoji: '🍜' };
    }
    if (nameLower.includes('bún bò') || nameLower.includes('bun bo')) {
      return { title: 'Bún Bò Spots', emoji: '🌶️' };
    }
    if (nameLower.includes('bún') || nameLower.includes('bun')) {
      return { title: 'Bún Spots', emoji: '🍜' };
    }
    return { title: 'Noodle Spots', emoji: '🍜' };
  }

  if (cuisine_type === 'rice') {
    if (nameLower.includes('cơm tấm') || nameLower.includes('com tam')) {
      return { title: 'Cơm Tấm Spots', emoji: '🍚' };
    }
    return { title: 'Rice Spots', emoji: '🍚' };
  }

  return CUISINE_SUGGESTIONS[cuisine_type] ?? { title: 'Want to Go', emoji: '📌' };
}

/**
 * Default quick-start list templates shown in the Create List sheet.
 */
export const LIST_TEMPLATES: ListSuggestion[] = [
  { title: 'Want to Go',            emoji: '📌' },
  { title: 'From TikTok',           emoji: '🎬' },
  { title: 'Date Night',            emoji: '💑' },
  { title: 'Cheap Eats',            emoji: '💰' },
  { title: 'Café Spots',            emoji: '☕' },
  { title: 'Drinks & Cocktails',    emoji: '🍺' },
  { title: 'Late Night',            emoji: '🌙' },
  { title: 'Phở Spots',             emoji: '🍜' },
  { title: 'Bánh Mì Spots',         emoji: '🥖' },
  { title: 'Work Lunch',            emoji: '🏢' },
];
```

**Step 2: Commit**

```bash
git add lib/utils/suggestListName.ts
git commit -m "[Explore] Task 4: suggestListName utility + list templates"
```

---

## Task 5: Component — `CreateListSheet`

**Files:**
- Create: `lib/components/lists/CreateListSheet.tsx`

**Step 1: Create the file**

```typescript
import { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal,
  ScrollView, KeyboardAvoidingView, Platform,
} from 'react-native';
import { useCreateList } from '@/lib/hooks/queries/useLists';
import { LIST_TEMPLATES } from '@/lib/utils/suggestListName';

interface Props {
  visible: boolean;
  onClose: () => void;
  /** Pre-fill name+emoji based on a restaurant (from Save to List flow) */
  suggestion?: { title: string; emoji: string };
}

const EMOJI_OPTIONS = ['📌','🎬','💑','💰','☕','🍺','🌙','🍜','🥖','🏢','🌶️','🦐','🥗','🌍','🍨','🍰','🍿','🍚','🍲','🍔'];

export function CreateListSheet({ visible, onClose, suggestion }: Props) {
  const createList = useCreateList();
  const [name, setName] = useState(suggestion?.title ?? '');
  const [emoji, setEmoji] = useState(suggestion?.emoji ?? '📌');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleTemplate = (t: { title: string; emoji: string }) => {
    setName(t.title);
    setEmoji(t.emoji);
  };

  const handleCreate = async () => {
    if (!name.trim()) return;
    try {
      await createList.mutateAsync({ title: name.trim(), emoji });
      setName('');
      setEmoji('📌');
      onClose();
    } catch {
      // error handled by mutation
    }
  };

  const handleClose = () => {
    setName('');
    setEmoji('📌');
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={handleClose}>
      <TouchableOpacity
        style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }}
        activeOpacity={1}
        onPress={handleClose}
      />
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={{ backgroundColor: '#171717', borderTopLeftRadius: 16, borderTopRightRadius: 16, paddingBottom: 40 }}>
          {/* Handle */}
          <View style={{ width: 40, height: 4, backgroundColor: '#374151', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 }} />

          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', marginHorizontal: 20, marginBottom: 16 }}>
            Create a list
          </Text>

          {/* Name + Emoji row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 20, marginBottom: 16, gap: 10 }}>
            <TouchableOpacity
              onPress={() => setShowEmojiPicker(!showEmojiPicker)}
              style={{ width: 44, height: 44, backgroundColor: '#262626', borderRadius: 10, alignItems: 'center', justifyContent: 'center' }}
            >
              <Text style={{ fontSize: 22 }}>{emoji}</Text>
            </TouchableOpacity>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Name your list..."
              placeholderTextColor="#6b7280"
              style={{ flex: 1, backgroundColor: '#262626', color: '#fff', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15 }}
              autoFocus={!suggestion}
              returnKeyType="done"
              onSubmitEditing={handleCreate}
            />
          </View>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 20, marginBottom: 12, gap: 8 }}>
              {EMOJI_OPTIONS.map(e => (
                <TouchableOpacity
                  key={e}
                  onPress={() => { setEmoji(e); setShowEmojiPicker(false); }}
                  style={{
                    width: 44, height: 44, backgroundColor: e === emoji ? '#f97316' : '#262626',
                    borderRadius: 10, alignItems: 'center', justifyContent: 'center',
                  }}
                >
                  <Text style={{ fontSize: 22 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Quick-start templates (only show if no suggestion pre-fill) */}
          {!suggestion && (
            <>
              <View style={{ height: 1, backgroundColor: '#262626', marginHorizontal: 20, marginBottom: 12 }} />
              <Text style={{ color: '#6b7280', fontSize: 12, fontWeight: '600', marginHorizontal: 20, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                Quick start
              </Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 8, flexDirection: 'row' }}>
                {LIST_TEMPLATES.map(t => (
                  <TouchableOpacity
                    key={t.title}
                    onPress={() => handleTemplate(t)}
                    style={{ backgroundColor: '#262626', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, flexDirection: 'row', alignItems: 'center', gap: 6 }}
                  >
                    <Text style={{ fontSize: 16 }}>{t.emoji}</Text>
                    <Text style={{ color: '#d1d5db', fontSize: 13 }}>{t.title}</Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </>
          )}

          {/* Create button */}
          <TouchableOpacity
            onPress={handleCreate}
            disabled={!name.trim() || createList.isPending}
            style={{
              marginHorizontal: 20, marginTop: 16, backgroundColor: name.trim() ? '#f97316' : '#374151',
              borderRadius: 12, paddingVertical: 14, alignItems: 'center',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>
              {createList.isPending ? 'Creating...' : 'Create List'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
```

**Step 2: Manual QA**

Run the app. Navigate to the Explore tab (after Task 8). Tap "+ New List". Verify:
- Template pills scroll horizontally
- Tapping a template pre-fills name + emoji
- Emoji picker opens/closes
- Create button is disabled when name is empty
- Creating a list closes the sheet and appears in My Lists

**Step 3: Commit**

```bash
git add lib/components/lists/CreateListSheet.tsx
git commit -m "[Explore] Task 5: CreateListSheet component with templates + emoji picker"
```

---

## Task 6: Component — `SaveToListSheet`

**Files:**
- Create: `lib/components/lists/SaveToListSheet.tsx`

**Step 1: Create the file**

```typescript
import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ScrollView, ActivityIndicator } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useUserLists, useListRestaurants, useAddToList, useRemoveFromList } from '@/lib/hooks/queries/useLists';
import { CreateListSheet } from './CreateListSheet';
import { suggestListName } from '@/lib/utils/suggestListName';

interface Restaurant {
  id: string;
  name: string;
  cuisine_type: string;
  district?: string;
}

interface Props {
  visible: boolean;
  restaurant: Restaurant | null;
  onClose: () => void;
}

function ListRow({ list, restaurantId }: { list: { id: string; title: string; emoji: string | null }; restaurantId: string }) {
  const { data: items = [], isLoading } = useListRestaurants(list.id);
  const addToList = useAddToList();
  const removeFromList = useRemoveFromList();
  const isInList = items.some(item => item.restaurant_id === restaurantId);

  const handleToggle = async () => {
    if (isInList) {
      await removeFromList.mutateAsync({ listId: list.id, restaurantId });
    } else {
      await addToList.mutateAsync({ listId: list.id, restaurantId });
    }
  };

  return (
    <TouchableOpacity
      onPress={handleToggle}
      style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 12 }}
    >
      <View style={{
        width: 24, height: 24, borderRadius: 12,
        backgroundColor: isInList ? '#f97316' : 'transparent',
        borderWidth: isInList ? 0 : 2, borderColor: '#374151',
        alignItems: 'center', justifyContent: 'center',
      }}>
        {isInList && <FontAwesome name="check" size={12} color="#fff" />}
      </View>
      <Text style={{ fontSize: 20 }}>{list.emoji ?? '📌'}</Text>
      <Text style={{ flex: 1, color: '#fff', fontSize: 15 }}>{list.title}</Text>
      <Text style={{ color: '#6b7280', fontSize: 13 }}>{items.length}</Text>
    </TouchableOpacity>
  );
}

export function SaveToListSheet({ visible, restaurant, onClose }: Props) {
  const { data: userLists = [], isLoading } = useUserLists();
  const [showCreate, setShowCreate] = useState(false);

  const suggestion = restaurant ? suggestListName(restaurant) : undefined;

  return (
    <>
      <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' }} activeOpacity={1} onPress={onClose} />
        <View style={{ backgroundColor: '#171717', borderTopLeftRadius: 16, borderTopRightRadius: 16, maxHeight: '60%', paddingBottom: 40 }}>
          <View style={{ width: 40, height: 4, backgroundColor: '#374151', borderRadius: 2, alignSelf: 'center', marginTop: 12, marginBottom: 16 }} />
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', marginHorizontal: 20, marginBottom: 4 }}>
            Save to list...
          </Text>
          {restaurant && (
            <Text style={{ color: '#6b7280', fontSize: 13, marginHorizontal: 20, marginBottom: 12 }}>{restaurant.name}</Text>
          )}
          <View style={{ height: 1, backgroundColor: '#262626' }} />

          {isLoading ? (
            <ActivityIndicator size="small" color="#f97316" style={{ marginTop: 24 }} />
          ) : (
            <ScrollView>
              {userLists.map(list => (
                <ListRow key={list.id} list={list} restaurantId={restaurant?.id ?? ''} />
              ))}
              <View style={{ height: 1, backgroundColor: '#262626', marginTop: 4 }} />
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 20, gap: 12 }}
              >
                <FontAwesome name="plus" size={16} color="#f97316" />
                <Text style={{ color: '#f97316', fontSize: 15, fontWeight: '500' }}>Create new list</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </Modal>

      <CreateListSheet
        visible={showCreate}
        onClose={() => setShowCreate(false)}
        suggestion={suggestion}
      />
    </>
  );
}
```

**Step 2: Manual QA**

From the restaurant detail screen (Task 11), tap "Save ▾". Verify:
- User's personal lists appear with item counts
- Checked lists show orange checkmark
- Toggling adds/removes from the list
- Tapping "+ Create new list" opens CreateListSheet with a suggested name

**Step 3: Commit**

```bash
git add lib/components/lists/SaveToListSheet.tsx
git commit -m "[Explore] Task 6: SaveToListSheet component"
```

---

## Task 7: Navigation — Swap Profile → Explore, Add Notifs Tab

**Files:**
- Modify: `app/(tabs)/_layout.tsx`
- Create: `app/(tabs)/explore.tsx` (stub — full screen in Task 8)
- Create: `app/(tabs)/notifications.tsx` (thin wrapper)

**Step 1: Create `app/(tabs)/notifications.tsx`**

```typescript
import { View, Text, FlatList, ActivityIndicator, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useNotifications, useMarkNotificationRead } from '@/lib/hooks/queries/useNotifications';
import { useAuthStore } from '@/lib/stores/auth';

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHrs = Math.floor(diffMins / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  return `${Math.floor(diffHrs / 24)}d ago`;
}

export default function NotificationsTab() {
  const router = useRouter();
  const session = useAuthStore(state => state.session);
  const { data: notifications = [], isLoading } = useNotifications(session?.user?.id);
  const markRead = useMarkNotificationRead();

  const handlePress = (n: { id: string; request_id: string | null; is_read: boolean }) => {
    if (!n.is_read) markRead.mutate(n.id);
    if (n.request_id) router.push({ pathname: '/(screens)/request-detail', params: { requestId: n.request_id } });
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <FlatList
        data={notifications}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        ListEmptyComponent={
          <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 40 }}>No notifications yet</Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => handlePress(item)}
            style={{
              backgroundColor: item.is_read ? '#171717' : '#1c1917',
              borderRadius: 12, padding: 14, marginBottom: 8,
              borderWidth: item.is_read ? 0 : 1, borderColor: '#f9731620',
            }}
          >
            <Text style={{ color: '#fff', fontSize: 14 }}>{item.message}</Text>
            <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4 }}>{formatTime(item.created_at)}</Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
```

**Step 2: Create stub `app/(tabs)/explore.tsx`** (will be filled in Task 8)

```typescript
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ExploreTab() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: '#6b7280' }}>Explore — coming soon</Text>
    </SafeAreaView>
  );
}
```

**Step 3: Update `app/(tabs)/_layout.tsx`**

Replace the existing `Tabs.Screen` blocks and add the profile avatar header logic:

```typescript
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View, Text } from 'react-native';
import { RatingPrompt } from '@/lib/components/ui/RatingPrompt';
import { OfflineBanner } from '@/lib/components/ui/OfflineBanner';
import { useUnreadDot, markChatTabSeen } from '@/lib/hooks/queries/useChats';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth';

function TabBarIcon(props: { name: React.ComponentProps<typeof FontAwesome>['name']; color: string }) {
  return <FontAwesome name={props.name} size={24} color={props.color} style={{ marginBottom: -3 }} />;
}

function ProfileAvatar() {
  const router = useRouter();
  const user = useAuthStore(state => state.user);
  const initials = user?.name ? user.name.charAt(0).toUpperCase() : '?';

  return (
    <TouchableOpacity
      onPress={() => router.push('/(screens)/user-profile')}
      style={{ marginLeft: 16 }}
    >
      {user?.photo_url ? (
        // If you have an Image component set up, use it here.
        // For now, fallback to initials circle always.
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{initials}</Text>
        </View>
      ) : (
        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#f97316', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ color: '#fff', fontSize: 14, fontWeight: '700' }}>{initials}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TabLayout() {
  const router = useRouter();
  const { data: hasUnread } = useUnreadDot();
  const queryClient = useQueryClient();

  const handleChatTabPress = () => {
    markChatTabSeen().then(() => {
      queryClient.invalidateQueries({ queryKey: ['unread-dot'] });
    });
  };

  return (
    <>
      <RatingPrompt />
      <View style={{ flex: 1 }}>
        <OfflineBanner />
        <Tabs
          screenOptions={{
            tabBarActiveTintColor: '#f97316',
            tabBarInactiveTintColor: '#6b7280',
            tabBarStyle: {
              backgroundColor: '#171717',
              borderTopColor: '#262626',
              borderTopWidth: 1,
              paddingTop: 8,
              paddingBottom: 8,
              height: 60,
            },
            tabBarShowLabel: false,
            headerStyle: { backgroundColor: '#0a0a0a' },
            headerTintColor: '#ffffff',
            headerShadowVisible: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ color }) => <TabBarIcon name="cutlery" color={color} />,
              headerTitle: 'Chopsticks',
              headerLeft: () => <ProfileAvatar />,
            }}
          />
          <Tabs.Screen
            name="explore"
            options={{
              tabBarIcon: ({ color }) => <TabBarIcon name="compass" color={color} />,
              headerTitle: 'Chopsticks',
              headerLeft: () => <ProfileAvatar />,
            }}
          />
          <Tabs.Screen
            name="chat"
            options={{
              tabBarIcon: ({ color }) => (
                <View>
                  <TabBarIcon name="comments" color={color} />
                  {hasUnread && (
                    <View style={{
                      position: 'absolute', top: -2, right: -6,
                      width: 10, height: 10, borderRadius: 5,
                      backgroundColor: '#ef4444', borderWidth: 2, borderColor: '#171717',
                    }} />
                  )}
                </View>
              ),
              headerTitle: 'Messages',
            }}
            listeners={{ tabPress: handleChatTabPress }}
          />
          <Tabs.Screen
            name="notifications"
            options={{
              tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
              headerTitle: 'Notifications',
            }}
          />
        </Tabs>
      </View>
    </>
  );
}
```

**Step 4: Manual QA**

Run app. Verify:
- 4 tabs visible: cutlery, compass, chat, bell (no labels)
- Profile avatar appears in Browse and Explore tab headers
- Tapping avatar navigates to profile screen
- Chat unread dot still works
- Notifications tab renders the notification list

**Step 5: Commit**

```bash
git add "app/(tabs)/_layout.tsx" "app/(tabs)/explore.tsx" "app/(tabs)/notifications.tsx"
git commit -m "[Explore] Task 7: Navigation — Explore + Notifs tabs, Profile avatar in header"
```

---

## Task 8: Screen — Explore Tab Home

**Files:**
- Modify: `app/(tabs)/explore.tsx` (replace stub)

**Step 1: Write the full screen**

```typescript
import { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useCuratedLists, useUserLists, useUserVisits, useListRestaurants, useSearchRestaurants } from '@/lib/hooks/queries/useLists';
import { CreateListSheet } from '@/lib/components/lists/CreateListSheet';

// Progress bar for curated lists
function ProgressBar({ fraction }: { fraction: number }) {
  return (
    <View style={{ height: 4, backgroundColor: '#262626', borderRadius: 2, overflow: 'hidden' }}>
      <View style={{ height: 4, backgroundColor: '#f97316', borderRadius: 2, width: `${Math.min(fraction * 100, 100)}%` }} />
    </View>
  );
}

function CuratedListCard({ list, visitedIds }: {
  list: { id: string; title: string; category: string | null };
  visitedIds: Set<string>;
}) {
  const router = useRouter();
  const { data: items = [] } = useListRestaurants(list.id);
  const visitedCount = items.filter(r => visitedIds.has(r.restaurant_id)).length;
  const total = items.length;

  return (
    <TouchableOpacity
      onPress={() => router.push({ pathname: '/(screens)/list-detail', params: { listId: list.id, listType: 'curated' } })}
      style={{ backgroundColor: '#171717', borderRadius: 12, padding: 14, marginBottom: 10 }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
        <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', flex: 1 }}>🏆 {list.title}</Text>
        <FontAwesome name="chevron-right" size={12} color="#6b7280" style={{ marginTop: 3 }} />
      </View>
      <Text style={{ color: '#6b7280', fontSize: 12, marginBottom: 8 }}>
        {total} spots{list.category ? ` · ${list.category}` : ''}
      </Text>
      <ProgressBar fraction={total > 0 ? visitedCount / total : 0} />
      <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 4 }}>
        <Text style={{ color: '#f97316', fontWeight: '600' }}>{visitedCount}</Text> of {total} visited
      </Text>
    </TouchableOpacity>
  );
}

function SearchResults({ query, onClose }: { query: string; onClose: () => void }) {
  const router = useRouter();
  const { data: results = [], isLoading } = useSearchRestaurants(query);

  if (isLoading) return <ActivityIndicator size="small" color="#f97316" style={{ marginTop: 20 }} />;
  if (!results.length) return <Text style={{ color: '#6b7280', textAlign: 'center', marginTop: 20 }}>No restaurants found</Text>;

  return (
    <FlatList
      data={results}
      keyExtractor={item => item.id}
      keyboardShouldPersistTaps="handled"
      renderItem={({ item }) => (
        <TouchableOpacity
          onPress={() => {
            onClose();
            router.push({ pathname: '/(screens)/restaurant-detail', params: { restaurantId: item.id } });
          }}
          style={{ paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' }}
        >
          <Text style={{ color: '#fff', fontSize: 15 }}>{item.name}</Text>
          <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>📍 {item.district} · {item.cuisine_type.replace(/_/g, ' ')}</Text>
        </TouchableOpacity>
      )}
    />
  );
}

export default function ExploreTab() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [showCreateList, setShowCreateList] = useState(false);

  const { data: curatedLists = [], isLoading: loadingCurated } = useCuratedLists();
  const { data: userLists = [], isLoading: loadingPersonal } = useUserLists();
  const { data: userVisits = [] } = useUserVisits();
  const visitedIds = new Set(userVisits.map(v => v.restaurant_id));

  const handleSearchFocus = useCallback(() => setIsSearching(true), []);
  const handleSearchClose = useCallback(() => {
    setIsSearching(false);
    setSearchQuery('');
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['bottom']}>
      {/* Search bar */}
      <View style={{ paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#171717', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, gap: 8 }}>
          <FontAwesome name="search" size={14} color="#6b7280" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={handleSearchFocus}
            placeholder="Search restaurants, dishes..."
            placeholderTextColor="#6b7280"
            style={{ flex: 1, color: '#fff', fontSize: 14 }}
          />
          {isSearching && (
            <TouchableOpacity onPress={handleSearchClose}>
              <Text style={{ color: '#f97316', fontSize: 14 }}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Search results overlay */}
      {isSearching ? (
        <View style={{ flex: 1, paddingHorizontal: 16, paddingTop: 8 }}>
          {searchQuery.length > 1 && <SearchResults query={searchQuery} onClose={handleSearchClose} />}
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 32 }}>
          {/* My Lists section */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 10 }}>
            <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700' }}>My Lists</Text>
            <TouchableOpacity onPress={() => router.push('/(screens)/my-lists')}>
              <Text style={{ color: '#6b7280', fontSize: 13 }}>See all</Text>
            </TouchableOpacity>
          </View>

          {loadingPersonal ? (
            <ActivityIndicator size="small" color="#f97316" />
          ) : (
            <>
              {userLists.slice(0, 3).map(list => (
                <TouchableOpacity
                  key={list.id}
                  onPress={() => router.push({ pathname: '/(screens)/list-detail', params: { listId: list.id, listType: 'personal' } })}
                  style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f1f1f', gap: 12 }}
                >
                  <Text style={{ fontSize: 22 }}>{list.emoji ?? '📌'}</Text>
                  <Text style={{ flex: 1, color: '#fff', fontSize: 15 }}>{list.title}</Text>
                  <FontAwesome name="chevron-right" size={12} color="#6b7280" />
                </TouchableOpacity>
              ))}
              <TouchableOpacity
                onPress={() => setShowCreateList(true)}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 10 }}
              >
                <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: '#1f1f1f', alignItems: 'center', justifyContent: 'center' }}>
                  <FontAwesome name="plus" size={12} color="#f97316" />
                </View>
                <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '500' }}>New List</Text>
              </TouchableOpacity>
            </>
          )}

          {/* Curated Lists section */}
          <Text style={{ color: '#fff', fontSize: 17, fontWeight: '700', marginTop: 24, marginBottom: 12 }}>Curated Lists</Text>

          {loadingCurated ? (
            <ActivityIndicator size="small" color="#f97316" />
          ) : (
            curatedLists.map(list => (
              <CuratedListCard key={list.id} list={list} visitedIds={visitedIds} />
            ))
          )}
        </ScrollView>
      )}

      <CreateListSheet visible={showCreateList} onClose={() => setShowCreateList(false)} />
    </SafeAreaView>
  );
}
```

**Step 2: Manual QA**

Run app → Explore tab. Verify:
- My Lists shows up to 3 personal lists (empty state if none)
- "+ New List" opens CreateListSheet
- "See all" navigates to my-lists screen
- Curated lists render with progress bars
- Tapping a curated list navigates to list-detail
- Search bar opens search mode, typing shows restaurant results

**Step 3: Commit**

```bash
git add "app/(tabs)/explore.tsx"
git commit -m "[Explore] Task 8: Explore tab home — My Lists + Curated + Search"
```

---

## Task 9: Screen — My Lists

**Files:**
- Create: `app/(screens)/my-lists.tsx`

**Step 1: Create the file**

```typescript
import { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useUserLists, useDeleteList } from '@/lib/hooks/queries/useLists';
import { CreateListSheet } from '@/lib/components/lists/CreateListSheet';

export default function MyListsScreen() {
  const router = useRouter();
  const { data: userLists = [], isLoading } = useUserLists();
  const deleteList = useDeleteList();
  const [showCreate, setShowCreate] = useState(false);

  const handleDelete = (list: { id: string; title: string }) => {
    Alert.alert('Delete List', `Delete "${list.title}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive',
        onPress: () => deleteList.mutate(list.id),
      },
    ]);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <FontAwesome name="chevron-left" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' }}>My Lists</Text>
        <TouchableOpacity onPress={() => setShowCreate(true)}>
          <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '600' }}>+ New</Text>
        </TouchableOpacity>
      </View>

      <Text style={{ color: '#6b7280', fontSize: 13, margin: 16, lineHeight: 18 }}>
        Save restaurants from TikTok, Instagram, or anywhere — all in one place, ready to act on.
      </Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#f97316" style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={userLists}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 40 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 60, gap: 12 }}>
              <Text style={{ fontSize: 40 }}>📋</Text>
              <Text style={{ color: '#6b7280', fontSize: 15, textAlign: 'center' }}>
                Create your first list{'\n'}to start saving restaurants
              </Text>
              <TouchableOpacity
                onPress={() => setShowCreate(true)}
                style={{ backgroundColor: '#f97316', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20, marginTop: 8 }}
              >
                <Text style={{ color: '#fff', fontWeight: '700' }}>Create a list</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => router.push({ pathname: '/(screens)/list-detail', params: { listId: item.id, listType: 'personal' } })}
              onLongPress={() => handleDelete(item)}
              style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderBottomWidth: 1, borderBottomColor: '#1f1f1f', gap: 14 }}
            >
              <Text style={{ fontSize: 26 }}>{item.emoji ?? '📌'}</Text>
              <View style={{ flex: 1 }}>
                <Text style={{ color: '#fff', fontSize: 15, fontWeight: '500' }}>{item.title}</Text>
              </View>
              <FontAwesome name="chevron-right" size={12} color="#6b7280" />
            </TouchableOpacity>
          )}
        />
      )}

      <CreateListSheet visible={showCreate} onClose={() => setShowCreate(false)} />
    </SafeAreaView>
  );
}
```

**Step 2: Manual QA**

Navigate to Explore → "See all" next to My Lists. Verify:
- All personal lists shown with emoji
- Long press prompts delete confirmation
- Empty state shows CTA
- "+ New" opens CreateListSheet

**Step 3: Commit**

```bash
git add "app/(screens)/my-lists.tsx"
git commit -m "[Explore] Task 9: My Lists screen"
```

---

## Task 10: Screen — List Detail

**Files:**
- Create: `app/(screens)/list-detail.tsx`

**Step 1: Create the file**

```typescript
import { useState, useMemo } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useListRestaurants, useUserVisits, useToggleVisit } from '@/lib/hooks/queries/useLists';
import { useCuratedLists, useUserLists } from '@/lib/hooks/queries/useLists';
import { SaveToListSheet } from '@/lib/components/lists/SaveToListSheet';
import { mediumHaptic } from '@/lib/haptics';

const CUISINE_EMOJIS: Record<string, string> = {
  noodles_congee: '🍜', rice: '🍚', hotpot_grill: '🍲', seafood: '🦐',
  bread: '🥖', vietnamese_cakes: '🍰', snack: '🍿', dessert: '🍨',
  drinks: '☕', fast_food: '🍔', international: '🌍', healthy: '🥗',
  veggie: '🥦', others: '🍽️',
};

type ListFilters = {
  cuisines: string[];
  districts: string[];
  status: 'all' | 'visited' | 'not_visited';
};

function FilterPill({ label, active, onPress }: { label: string; active: boolean; onPress: () => void }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 8,
        backgroundColor: active ? '#f97316' : '#262626',
      }}
    >
      <Text style={{ color: active ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: active ? '600' : '400' }}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function ProgressHeader({ visited, total }: { visited: number; total: number }) {
  const pct = total > 0 ? (visited / total) * 100 : 0;
  return (
    <View style={{ backgroundColor: '#171717', padding: 14, marginBottom: 8, borderRadius: 10 }}>
      <Text style={{ color: '#9ca3af', fontSize: 12, marginBottom: 6 }}>Your progress</Text>
      <View style={{ height: 6, backgroundColor: '#262626', borderRadius: 3, overflow: 'hidden', marginBottom: 6 }}>
        <View style={{ height: 6, backgroundColor: '#f97316', borderRadius: 3, width: `${pct}%` }} />
      </View>
      <Text style={{ color: '#6b7280', fontSize: 12 }}>
        <Text style={{ color: '#f97316', fontWeight: '600' }}>{visited}</Text> of {total} visited
      </Text>
    </View>
  );
}

export default function ListDetailScreen() {
  const { listId, listType } = useLocalSearchParams<{ listId: string; listType: 'curated' | 'personal' }>();
  const router = useRouter();
  const isCurated = listType === 'curated';

  const { data: items = [], isLoading } = useListRestaurants(listId);
  const { data: userVisits = [] } = useUserVisits();
  const toggleVisit = useToggleVisit();

  const { data: curatedLists = [] } = useCuratedLists();
  const { data: userLists = [] } = useUserLists();
  const listInfo = isCurated
    ? curatedLists.find(l => l.id === listId)
    : userLists.find(l => l.id === listId);

  const visitedIds = new Set(userVisits.map(v => v.restaurant_id));

  // Filter state
  const [filters, setFilters] = useState<ListFilters>({ cuisines: [], districts: [], status: 'all' });
  const [saveSheetRestaurant, setSaveSheetRestaurant] = useState<{ id: string; name: string; cuisine_type: string } | null>(null);

  // Derive available filter options from list items
  const availableCuisines = useMemo(() => [...new Set(items.map(i => i.restaurants.cuisine_type))], [items]);
  const availableDistricts = useMemo(() => [...new Set(items.map(i => i.restaurants.district))], [items]);

  const toggleFilter = <K extends 'cuisines' | 'districts'>(key: K, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value],
    }));
  };

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const { cuisine_type, district } = item.restaurants;
      if (filters.cuisines.length && !filters.cuisines.includes(cuisine_type)) return false;
      if (filters.districts.length && !filters.districts.includes(district)) return false;
      if (filters.status === 'visited' && !visitedIds.has(item.restaurant_id)) return false;
      if (filters.status === 'not_visited' && visitedIds.has(item.restaurant_id)) return false;
      return true;
    });
  }, [items, filters, visitedIds]);

  const visitedCount = items.filter(i => visitedIds.has(i.restaurant_id)).length;

  const handleToggleVisit = async (restaurantId: string) => {
    mediumHaptic();
    await toggleVisit.mutateAsync({ restaurantId, currentlyVisited: visitedIds.has(restaurantId) });
  };

  const title = listInfo
    ? (isCurated ? `🏆 ${listInfo.title}` : `${listInfo.emoji ?? '📌'} ${listInfo.title}`)
    : '...';

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <FontAwesome name="chevron-left" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' }} numberOfLines={1}>{title}</Text>
      </View>

      <FlatList
        data={filteredItems}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            {/* Progress (curated only) */}
            {isCurated && <ProgressHeader visited={visitedCount} total={items.length} />}

            {/* Filter pills */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
              {isCurated && (
                <>
                  <FilterPill label="All" active={filters.status === 'all'} onPress={() => setFilters(f => ({ ...f, status: 'all' }))} />
                  <FilterPill label="Been There" active={filters.status === 'visited'} onPress={() => setFilters(f => ({ ...f, status: 'visited' }))} />
                  <FilterPill label="Not Yet" active={filters.status === 'not_visited'} onPress={() => setFilters(f => ({ ...f, status: 'not_visited' }))} />
                  <View style={{ width: 1, backgroundColor: '#262626', marginRight: 8 }} />
                </>
              )}
              {availableCuisines.length > 1 && availableCuisines.map(c => (
                <FilterPill key={c} label={c.replace(/_/g, ' ')} active={filters.cuisines.includes(c)} onPress={() => toggleFilter('cuisines', c)} />
              ))}
              {availableDistricts.length > 1 && availableDistricts.map(d => (
                <FilterPill key={d} label={d} active={filters.districts.includes(d)} onPress={() => toggleFilter('districts', d)} />
              ))}
            </ScrollView>

            <Text style={{ color: '#6b7280', fontSize: 12 }}>
              {filteredItems.length} restaurant{filteredItems.length !== 1 ? 's' : ''}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const isVisited = visitedIds.has(item.restaurant_id);
          const emoji = CUISINE_EMOJIS[item.restaurants.cuisine_type] ?? '🍽️';

          return (
            <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#1f1f1f', flexDirection: 'row', gap: 12, alignItems: 'flex-start' }}>
              {isCurated && item.rank != null && (
                <Text style={{ color: '#f97316', fontWeight: '700', fontSize: 15, minWidth: 24 }}>#{item.rank}</Text>
              )}
              {!isCurated && <Text style={{ fontSize: 22 }}>{emoji}</Text>}

              <View style={{ flex: 1 }}>
                <TouchableOpacity onPress={() => router.push({ pathname: '/(screens)/restaurant-detail', params: { restaurantId: item.restaurant_id } })}>
                  <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 2 }}>{item.restaurants.name}</Text>
                </TouchableOpacity>
                <Text style={{ color: '#6b7280', fontSize: 12 }}>📍 {item.restaurants.district}</Text>

                <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
                  {isCurated ? (
                    <>
                      <TouchableOpacity
                        onPress={() => handleToggleVisit(item.restaurant_id)}
                        style={{
                          paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8,
                          backgroundColor: isVisited ? '#f97316' : '#262626',
                        }}
                      >
                        <Text style={{ color: '#fff', fontSize: 12, fontWeight: '500' }}>
                          {isVisited ? '✓ Been There' : 'Mark Visited'}
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => setSaveSheetRestaurant({ id: item.restaurant_id, ...item.restaurants })}
                        style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#262626' }}
                      >
                        <Text style={{ color: '#9ca3af', fontSize: 12 }}>📌 Save ▾</Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <TouchableOpacity
                      onPress={() => router.push({ pathname: '/(screens)/create-request', params: { restaurantId: item.restaurant_id } })}
                      style={{ paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#262626' }}
                    >
                      <Text style={{ color: '#f97316', fontSize: 12, fontWeight: '500' }}>🍽️ Create Request</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            </View>
          );
        }}
      />

      <SaveToListSheet
        visible={!!saveSheetRestaurant}
        restaurant={saveSheetRestaurant}
        onClose={() => setSaveSheetRestaurant(null)}
      />
    </SafeAreaView>
  );
}
```

**Step 2: Manual QA**

- Open a curated list → verify progress bar + rank numbers + Been There toggle + filter pills
- Toggle Been There → progress bar updates
- Open a personal list → verify emoji icons + Create Request button
- Filter by cuisine/district → list narrows correctly
- Tap restaurant name → navigates to restaurant detail

**Step 3: Commit**

```bash
git add "app/(screens)/list-detail.tsx"
git commit -m "[Explore] Task 10: List Detail screen — curated + personal variants + filters"
```

---

## Task 11: Screen — Restaurant Detail Hub

**Files:**
- Create: `app/(screens)/restaurant-detail.tsx`

**Step 1: Create the file**

```typescript
import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Share, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRestaurantDetail, useToggleVisit } from '@/lib/hooks/queries/useLists';
import { SaveToListSheet } from '@/lib/components/lists/SaveToListSheet';
import { mediumHaptic } from '@/lib/haptics';

const CUISINE_EMOJIS: Record<string, string> = {
  noodles_congee: '🍜', rice: '🍚', hotpot_grill: '🍲', seafood: '🦐',
  bread: '🥖', vietnamese_cakes: '🍰', snack: '🍿', dessert: '🍨',
  drinks: '☕', fast_food: '🍔', international: '🌍', healthy: '🥗',
  veggie: '🥦', others: '🍽️',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const isToday = d.toDateString() === new Date().toDateString();
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  return isToday ? `Today · ${time}` : `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · ${time}`;
}

export default function RestaurantDetailScreen() {
  const { restaurantId } = useLocalSearchParams<{ restaurantId: string }>();
  const router = useRouter();
  const { data: restaurant, isLoading } = useRestaurantDetail(restaurantId);
  const toggleVisit = useToggleVisit();
  const [showSaveSheet, setShowSaveSheet] = useState(false);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#f97316" />
      </View>
    );
  }

  if (!restaurant) {
    return (
      <View style={{ flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#6b7280' }}>Restaurant not found</Text>
      </View>
    );
  }

  const emoji = CUISINE_EMOJIS[restaurant.cuisine_type] ?? '🍽️';
  const spotsLeft = (req: { group_size: number; participant_count: number }) =>
    Math.max(0, req.group_size - req.participant_count);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${restaurant.name} — ${restaurant.district} · ${restaurant.cuisine_type.replace(/_/g, ' ')} | Chopsticks`,
      });
    } catch { /* ignore */ }
  };

  const handleBeenHere = () => {
    mediumHaptic();
    toggleVisit.mutate({ restaurantId: restaurant.id, currentlyVisited: restaurant.user_has_visited });
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#1f1f1f' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12 }}>
          <FontAwesome name="chevron-left" size={18} color="#fff" />
        </TouchableOpacity>
        <Text style={{ flex: 1, color: '#fff', fontSize: 16, fontWeight: '700' }} numberOfLines={1}>{restaurant.name}</Text>
        <TouchableOpacity onPress={handleShare}>
          <FontAwesome name="share" size={18} color="#6b7280" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 48 }}>
        {/* Hero */}
        <View style={{ alignItems: 'center', paddingVertical: 24, gap: 6 }}>
          <Text style={{ fontSize: 56 }}>{emoji}</Text>
          <Text style={{ color: '#fff', fontSize: 20, fontWeight: '700' }}>{restaurant.name}</Text>
          <Text style={{ color: '#6b7280', fontSize: 13 }}>📍 {restaurant.district} · {restaurant.cuisine_type.replace(/_/g, ' ')}</Text>
          {restaurant.stats.avg_rating != null && (
            <Text style={{ color: '#f97316', fontSize: 14, fontWeight: '600' }}>
              ⭐ {restaurant.stats.avg_rating}
              <Text style={{ color: '#6b7280', fontWeight: '400' }}> ({restaurant.stats.diner_count} Chopstickers)</Text>
            </Text>
          )}
        </View>

        {/* Action buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, paddingHorizontal: 20, marginBottom: 16 }}>
          <TouchableOpacity
            onPress={() => setShowSaveSheet(true)}
            style={{ flex: 1, alignItems: 'center', backgroundColor: '#171717', borderRadius: 10, paddingVertical: 12, gap: 4 }}
          >
            <FontAwesome name="bookmark-o" size={18} color="#9ca3af" />
            <Text style={{ color: '#9ca3af', fontSize: 11 }}>Save ▾</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleBeenHere}
            style={{ flex: 1, alignItems: 'center', backgroundColor: restaurant.user_has_visited ? '#f97316' : '#171717', borderRadius: 10, paddingVertical: 12, gap: 4 }}
          >
            <FontAwesome name="check" size={18} color={restaurant.user_has_visited ? '#fff' : '#9ca3af'} />
            <Text style={{ color: restaurant.user_has_visited ? '#fff' : '#9ca3af', fontSize: 11 }}>Been Here</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={{ flex: 1, alignItems: 'center', backgroundColor: '#171717', borderRadius: 10, paddingVertical: 12, gap: 4 }}
          >
            <FontAwesome name="share" size={18} color="#9ca3af" />
            <Text style={{ color: '#9ca3af', fontSize: 11 }}>Share</Text>
          </TouchableOpacity>
        </View>

        {/* Create Meal Request CTA */}
        <TouchableOpacity
          onPress={() => router.push({ pathname: '/(screens)/create-request', params: { restaurantId: restaurant.id } })}
          style={{ marginHorizontal: 20, backgroundColor: '#f97316', borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginBottom: 24 }}
        >
          <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700' }}>🍽️ Create Meal Request Here</Text>
        </TouchableOpacity>

        {/* On Chopsticks stats */}
        {restaurant.stats.meal_count > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 12 }}>On Chopsticks</Text>
            <View style={{ flexDirection: 'row', backgroundColor: '#171717', borderRadius: 12, padding: 16, gap: 0 }}>
              {[
                { num: restaurant.stats.meal_count, label: 'Meals' },
                { num: restaurant.stats.diner_count, label: 'Diners' },
                { num: restaurant.stats.avg_rating ?? '—', label: 'Avg Rating' },
              ].map((s, i) => (
                <View key={s.label} style={{ flex: 1, alignItems: 'center', borderLeftWidth: i > 0 ? 1 : 0, borderLeftColor: '#262626' }}>
                  <Text style={{ color: '#f97316', fontSize: 20, fontWeight: '700' }}>{s.num}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 11, marginTop: 2 }}>{s.label}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Active Requests */}
        {restaurant.active_requests.length > 0 && (
          <View style={{ marginHorizontal: 20, marginBottom: 20 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 10 }}>Active Requests Now</Text>
            {restaurant.active_requests.map(req => (
              <TouchableOpacity
                key={req.id}
                onPress={() => router.push({ pathname: '/(screens)/request-detail', params: { requestId: req.id } })}
                style={{ backgroundColor: '#171717', borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 }}
              >
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '500' }}>{formatTime(req.time_window)}</Text>
                  <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 2 }}>
                    {spotsLeft(req)} spot{spotsLeft(req) !== 1 ? 's' : ''} left · by {req.requester.name ?? 'Someone'} · {req.join_type === 'open' ? 'Open join' : 'Approval'}
                  </Text>
                </View>
                <View style={{ backgroundColor: '#f97316', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Join</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Part of Lists */}
        {(restaurant.curated_list_memberships.length > 0 || restaurant.user_list_memberships.length > 0) && (
          <View style={{ marginHorizontal: 20 }}>
            <Text style={{ color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 10 }}>Part of Lists</Text>
            {restaurant.curated_list_memberships.map(m => (
              <TouchableOpacity
                key={m.list_id}
                onPress={() => router.push({ pathname: '/(screens)/list-detail', params: { listId: m.list_id, listType: 'curated' } })}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 }}
              >
                <Text style={{ fontSize: 16 }}>🏆</Text>
                <Text style={{ color: '#9ca3af', fontSize: 13 }}>
                  {m.list_title}{m.rank != null ? ` (#${m.rank} of list)` : ''}
                </Text>
                <FontAwesome name="chevron-right" size={10} color="#374151" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}
            {restaurant.user_list_memberships.map(m => (
              <TouchableOpacity
                key={m.list_id}
                onPress={() => router.push({ pathname: '/(screens)/list-detail', params: { listId: m.list_id, listType: 'personal' } })}
                style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 8, gap: 8 }}
              >
                <Text style={{ fontSize: 16 }}>{m.emoji ?? '📌'}</Text>
                <Text style={{ color: '#9ca3af', fontSize: 13 }}>Your "{m.list_title}"</Text>
                <FontAwesome name="chevron-right" size={10} color="#374151" style={{ marginLeft: 'auto' }} />
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      <SaveToListSheet
        visible={showSaveSheet}
        restaurant={restaurant}
        onClose={() => setShowSaveSheet(false)}
      />
    </SafeAreaView>
  );
}
```

**Step 2: Manual QA**

Navigate to any restaurant (via list detail → tap name). Verify:
- Hero emoji, name, district, avg rating display
- Save/Been Here/Share buttons work
- Been Here toggles orange correctly
- "Create Meal Request Here" navigates to create-request
- On Chopsticks stats visible if meal history exists
- Active requests show with Join button
- Part of Lists shows curated and personal memberships

**Step 3: Commit**

```bash
git add "app/(screens)/restaurant-detail.tsx"
git commit -m "[Explore] Task 11: Restaurant Detail hub screen"
```

---

## Task 12: Pre-filled Create Request

**Files:**
- Modify: `app/(screens)/create-request.tsx`

**Step 1: Read current params handling**

The existing `create-request.tsx` starts at Step 1 with restaurant search. We need it to accept an optional `restaurantId` param that skips step 1 with the restaurant pre-selected.

**Step 2: Add param reading + pre-selection**

At the top of `CreateRequestScreen`, add:

```typescript
const { restaurantId: prefilledRestaurantId } = useLocalSearchParams<{ restaurantId?: string }>();
const { data: allRestaurants } = useRestaurants('');
```

Add a `useEffect` after the restaurants query to pre-fill when `prefilledRestaurantId` is provided:

```typescript
import { useEffect } from 'react';

// Inside CreateRequestScreen, after existing state declarations:
useEffect(() => {
  if (prefilledRestaurantId && allRestaurants) {
    const found = allRestaurants.find(r => r.id === prefilledRestaurantId);
    if (found) {
      setSelectedRestaurant(found);
      // Auto-fill cuisine from restaurant type
      setSelectedCuisineId(found.cuisine_type);
      // Skip to step 2
      setStep(2);
    }
  }
}, [prefilledRestaurantId, allRestaurants]);
```

Also lock the restaurant field when pre-filled — in the Step 1 restaurant picker, wrap the search input and list with:

```typescript
{!prefilledRestaurantId && (
  // existing restaurant search UI
)}
{prefilledRestaurantId && selectedRestaurant && (
  <View style={{ backgroundColor: '#171717', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', gap: 10 }}>
    <Text style={{ fontSize: 22 }}>{CUISINE_EMOJIS[selectedRestaurant.cuisine_type] ?? '🍽️'}</Text>
    <View style={{ flex: 1 }}>
      <Text style={{ color: '#fff', fontSize: 15, fontWeight: '600' }}>{selectedRestaurant.name}</Text>
      <Text style={{ color: '#6b7280', fontSize: 12 }}>📍 {selectedRestaurant.district}</Text>
    </View>
    <FontAwesome name="lock" size={12} color="#f97316" />
  </View>
)}
```

**Step 3: Manual QA**

From restaurant detail screen, tap "Create Meal Request Here". Verify:
- Screen opens directly on Step 2 (date/time picker)
- Restaurant field shows locked card at top with restaurant name
- Cuisine is pre-selected matching the restaurant
- Can still complete the form and submit normally

**Step 4: Commit**

```bash
git add "app/(screens)/create-request.tsx"
git commit -m "[Explore] Task 12: Pre-filled Create Request from restaurant profile"
```

---

## Task 13: Final QA + Seed Restaurants

**Step 1: Populate curated lists via Supabase Studio**

1. Open Supabase Studio → Table Editor → `lists` — note the IDs of the 5 seeded lists
2. Open `restaurants` table — find restaurant IDs for your seeded data
3. Insert rows into `list_restaurants` with:
   - `list_id` = the list ID
   - `restaurant_id` = the restaurant ID
   - `rank` = 1, 2, 3… for ordering

**Step 2: End-to-end flow test**

1. Open Explore tab → see My Lists (empty) + Curated Lists with progress bars
2. Tap a curated list → see ranked restaurants
3. Tap "Mark Visited" → progress bar increments
4. Tap "Save ▾" → Save to List sheet opens
5. Create a new list → list appears in My Lists
6. Tap restaurant name → Restaurant Profile hub
7. Tap "Create Meal Request Here" → create-request opens pre-filled
8. Tap "Been Here" on restaurant profile → toggles orange
9. Search "phở" → results appear → tap result → restaurant profile

**Step 3: Typecheck the whole project**

```bash
cd chopsticks && pnpm typecheck
```

Expected: 0 errors.

**Step 4: Final commit**

```bash
git add -A
git commit -m "[Explore] Phase 1 complete — Explore tab, My Lists, Curated Lists, Restaurant Profile, Save to List, Filters, Search, Pre-filled Create Request"
```

---

## Summary

| Task | What ships |
|------|-----------|
| 1 | DB migration — lists, list_restaurants, user_visits, RLS, seed |
| 2 | API service — lists.ts |
| 3 | Hooks — useLists.ts |
| 4 | Utility — suggestListName + LIST_TEMPLATES |
| 5 | Component — CreateListSheet |
| 6 | Component — SaveToListSheet |
| 7 | Navigation — Explore + Notifs tabs, Profile avatar |
| 8 | Screen — Explore tab home |
| 9 | Screen — My Lists |
| 10 | Screen — List Detail (curated + personal + filters) |
| 11 | Screen — Restaurant Detail hub |
| 12 | Create Request — pre-fill from restaurant |
| 13 | QA + seed restaurants via Studio |
