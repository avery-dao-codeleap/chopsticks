# Curated Lists Phase 1 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a curated restaurant lists tab — browse editorial lists, tap into a rich restaurant detail screen, write persona-tagged reviews, mark "been there", save favorites — plus move Profile to a header avatar and switch the bottom nav to icons-only.

**Architecture:** 5 new DB tables (`lists`, `list_restaurants`, `user_favorites`, `user_visits`, `reviews`) + RLS policies via a single migration. New API service + TanStack Query hooks following the existing pattern. Three new screens (`lists.tsx` tab + `list-detail.tsx` + `restaurant-detail.tsx`). Navigation updated in `_layout.tsx`. No external APIs — restaurant content is seeded manually.

**Tech Stack:** Expo Router (file-based routing), Supabase (postgres + RLS), TanStack Query v5, `@expo/vector-icons/FontAwesome`, React Native dark theme (`#0a0a0a` bg, `#171717` card, `#f97316` orange accent).

**No automated tests** — MVP philosophy, manual QA after each task.

---

## Context You Need

- All shared lib code lives under `chopsticks/lib/` — imported as `@/lib/...`
- API pattern: functions return `{ data, error }`, callers `throw error` inside hooks
- Existing migration numbering: 001–026. New migration = **027**
- Current tabs (3): `index` (Browse/Discover), `chat`, `profile`
- Colors: bg `#0a0a0a`, card `#171717`, border `#262626`, muted text `#6b7280`, orange `#f97316`
- User photo available from `useAuthStore().user?.photo_url`
- Icons use `FontAwesome` from `@expo/vector-icons/FontAwesome`
- All paths below are relative to `chopsticks/`

---

## Task 1: DB Migration — 4 new tables + RLS

**Files:**
- Create: `supabase/migrations/027_curated_lists.sql`

**Step 1: Create the migration file**

```sql
-- supabase/migrations/027_curated_lists.sql

-- 1. lists table
CREATE TABLE lists (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text,
  city text NOT NULL DEFAULT 'hcmc',
  is_published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 2. list_restaurants table
CREATE TABLE list_restaurants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  rank int NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(list_id, restaurant_id),
  UNIQUE(list_id, rank)
);

-- 3. user_favorites table
CREATE TABLE user_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- 4. user_visits table
CREATE TABLE user_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  visited_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- RLS: enable on all tables
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_visits ENABLE ROW LEVEL SECURITY;

-- lists: public read (published only)
CREATE POLICY "Published lists are public"
  ON lists FOR SELECT
  USING (is_published = true);

-- list_restaurants: public read
CREATE POLICY "List restaurants are public"
  ON list_restaurants FOR SELECT
  USING (true);

-- user_favorites: private (own rows only)
CREATE POLICY "Users read own favorites"
  ON user_favorites FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own favorites"
  ON user_favorites FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- user_visits: private (own rows only)
CREATE POLICY "Users read own visits"
  ON user_visits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users manage own visits"
  ON user_visits FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

**Step 2: Apply the migration**

```bash
cd chopsticks
npx supabase db push
```

Expected: "Applying migration 027_curated_lists.sql... done"

**Step 3: Verify in Supabase Studio**

Open your Supabase project → Table Editor → confirm `lists`, `list_restaurants`, `user_favorites`, `user_visits` tables exist.

**Step 4: Commit**

```bash
git add supabase/migrations/027_curated_lists.sql
git commit -m "[Curated Lists] Task 1: DB migration — 4 new tables + RLS"
```

---

## Task 2: Seed Data — 3-5 editorial lists

**Files:**
- Create: `supabase/seed-lists.sql`

**Step 1: Find existing restaurant IDs**

In Supabase Studio → Table Editor → `restaurants` table. Note 5-10 restaurant IDs you want to use (or run this in SQL editor):

```sql
SELECT id, name, district FROM restaurants LIMIT 20;
```

Copy the UUIDs for restaurants you want to feature.

**Step 2: Create the seed file**

Replace `<uuid>` placeholders with real restaurant IDs from your DB:

```sql
-- supabase/seed-lists.sql
-- Run this in Supabase Studio SQL editor after migration 027

-- Insert lists (set is_published = true to make them visible)
INSERT INTO lists (id, title, description, category, city, is_published) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Best Pho in Saigon', 'The finest bowls of pho in Ho Chi Minh City', 'Vietnamese', 'hcmc', true),
  ('22222222-2222-2222-2222-222222222222', 'Best Banh Mi in District 1', 'Top banh mi spots in the heart of the city', 'Street Food', 'hcmc', true),
  ('33333333-3333-3333-3333-333333333333', 'Best Com Tam Spots', 'Broken rice done right across the city', 'Vietnamese', 'hcmc', true);

-- Insert list_restaurants (rank 1 = top of list)
-- Replace restaurant UUIDs with real ones from your restaurants table
INSERT INTO list_restaurants (list_id, restaurant_id, rank) VALUES
  -- Best Pho list
  ('11111111-1111-1111-1111-111111111111', '<restaurant-uuid-1>', 1),
  ('11111111-1111-1111-1111-111111111111', '<restaurant-uuid-2>', 2),
  ('11111111-1111-1111-1111-111111111111', '<restaurant-uuid-3>', 3),
  -- Best Banh Mi list
  ('22222222-2222-2222-2222-222222222222', '<restaurant-uuid-4>', 1),
  ('22222222-2222-2222-2222-222222222222', '<restaurant-uuid-5>', 2),
  -- Best Com Tam list
  ('33333333-3333-3333-3333-333333333333', '<restaurant-uuid-6>', 1),
  ('33333333-3333-3333-3333-333333333333', '<restaurant-uuid-7>', 2),
  ('33333333-3333-3333-3333-333333333333', '<restaurant-uuid-8>', 3);
```

**Step 3: Run the seed in Supabase Studio**

Open Supabase Studio → SQL Editor → paste the contents of `seed-lists.sql` → Run.

**Step 4: Verify**

```sql
SELECT l.title, lr.rank, r.name
FROM lists l
JOIN list_restaurants lr ON lr.list_id = l.id
JOIN restaurants r ON r.id = lr.restaurant_id
ORDER BY l.title, lr.rank;
```

Expected: rows showing your lists with ranked restaurants.

**Step 5: Commit**

```bash
git add supabase/seed-lists.sql
git commit -m "[Curated Lists] Task 2: Seed 3-5 editorial lists"
```

---

## Task 3: API Service

**Files:**
- Create: `lib/services/api/lists.ts`

**Step 1: Create the file**

```typescript
// lib/services/api/lists.ts
import { supabase } from '../supabase';

export interface ListRow {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  city: string;
  is_published: boolean;
  created_at: string;
}

export interface ListRestaurantRow {
  id: string;
  list_id: string;
  restaurant_id: string;
  rank: number;
  restaurants: {
    id: string;
    name: string;
    address: string;
    district: string;
  };
}

/**
 * Fetch all published lists
 */
export async function getLists(): Promise<{
  data: ListRow[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('lists')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    if (error) throw new Error(error.message);
    return { data, error: null };
  } catch (error) {
    console.error('getLists error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Fetch ranked restaurants for a list
 */
export async function getListRestaurants(listId: string): Promise<{
  data: ListRestaurantRow[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('list_restaurants')
      .select(`
        id,
        list_id,
        restaurant_id,
        rank,
        restaurants (
          id,
          name,
          address,
          district
        )
      `)
      .eq('list_id', listId)
      .order('rank', { ascending: true });

    if (error) throw new Error(error.message);
    return { data: data as ListRestaurantRow[], error: null };
  } catch (error) {
    console.error('getListRestaurants error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Toggle favorite for current user — inserts if not exists, deletes if exists
 */
export async function toggleFavorite(restaurantId: string, userId: string): Promise<{
  isFavorited: boolean;
  error: Error | null;
}> {
  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('user_favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)
      .single();

    if (existing) {
      // Remove favorite
      const { error } = await supabase
        .from('user_favorites')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId);
      if (error) throw new Error(error.message);
      return { isFavorited: false, error: null };
    } else {
      // Add favorite
      const { error } = await supabase
        .from('user_favorites')
        .insert({ user_id: userId, restaurant_id: restaurantId });
      if (error) throw new Error(error.message);
      return { isFavorited: true, error: null };
    }
  } catch (error) {
    console.error('toggleFavorite error:', error);
    return { isFavorited: false, error: error as Error };
  }
}

/**
 * Toggle visit for current user — inserts if not exists, deletes if exists
 */
export async function toggleVisit(restaurantId: string, userId: string): Promise<{
  isVisited: boolean;
  error: Error | null;
}> {
  try {
    const { data: existing } = await supabase
      .from('user_visits')
      .select('id')
      .eq('user_id', userId)
      .eq('restaurant_id', restaurantId)
      .single();

    if (existing) {
      const { error } = await supabase
        .from('user_visits')
        .delete()
        .eq('user_id', userId)
        .eq('restaurant_id', restaurantId);
      if (error) throw new Error(error.message);
      return { isVisited: false, error: null };
    } else {
      const { error } = await supabase
        .from('user_visits')
        .insert({ user_id: userId, restaurant_id: restaurantId });
      if (error) throw new Error(error.message);
      return { isVisited: true, error: null };
    }
  } catch (error) {
    console.error('toggleVisit error:', error);
    return { isVisited: false, error: error as Error };
  }
}

/**
 * Fetch all favorited restaurant IDs for current user
 */
export async function getUserFavorites(userId: string): Promise<{
  data: string[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('user_favorites')
      .select('restaurant_id')
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return { data: (data ?? []).map(r => r.restaurant_id), error: null };
  } catch (error) {
    console.error('getUserFavorites error:', error);
    return { data: null, error: error as Error };
  }
}

/**
 * Fetch all visited restaurant IDs for current user
 */
export async function getUserVisits(userId: string): Promise<{
  data: string[] | null;
  error: Error | null;
}> {
  try {
    const { data, error } = await supabase
      .from('user_visits')
      .select('restaurant_id')
      .eq('user_id', userId);
    if (error) throw new Error(error.message);
    return { data: (data ?? []).map(r => r.restaurant_id), error: null };
  } catch (error) {
    console.error('getUserVisits error:', error);
    return { data: null, error: error as Error };
  }
}
```

**Step 2: Commit**

```bash
git add lib/services/api/lists.ts
git commit -m "[Curated Lists] Task 3: API service (getLists, getListRestaurants, toggleFavorite, toggleVisit)"
```

---

## Task 4: Query Hooks

**Files:**
- Create: `lib/hooks/queries/useLists.ts`

**Step 1: Create the file**

```typescript
// lib/hooks/queries/useLists.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth';
import * as listsApi from '@/lib/services/api/lists';

/**
 * Fetch all published lists
 */
export function useLists() {
  return useQuery({
    queryKey: ['lists'],
    queryFn: async () => {
      const { data, error } = await listsApi.getLists();
      if (error) throw error;
      return data ?? [];
    },
  });
}

/**
 * Fetch ranked restaurants for a specific list
 */
export function useListRestaurants(listId: string | undefined) {
  return useQuery({
    queryKey: ['list-restaurants', listId],
    queryFn: async () => {
      if (!listId) return [];
      const { data, error } = await listsApi.getListRestaurants(listId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!listId,
  });
}

/**
 * Fetch all favorited restaurant IDs for the current user
 */
export function useUserFavorites() {
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['user-favorites', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await listsApi.getUserFavorites(user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });
}

/**
 * Fetch all visited restaurant IDs for the current user
 */
export function useUserVisits() {
  const user = useAuthStore(s => s.user);
  return useQuery({
    queryKey: ['user-visits', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await listsApi.getUserVisits(user.id);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!user?.id,
  });
}

/**
 * Toggle favorite — optimistic update
 */
export function useToggleFavorite() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: async (restaurantId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { isFavorited, error } = await listsApi.toggleFavorite(restaurantId, user.id);
      if (error) throw error;
      return { restaurantId, isFavorited };
    },
    onMutate: async (restaurantId) => {
      await queryClient.cancelQueries({ queryKey: ['user-favorites', user?.id] });
      const previous = queryClient.getQueryData<string[]>(['user-favorites', user?.id]) ?? [];
      const next = previous.includes(restaurantId)
        ? previous.filter(id => id !== restaurantId)
        : [...previous, restaurantId];
      queryClient.setQueryData(['user-favorites', user?.id], next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['user-favorites', user?.id], context.previous);
      }
    },
  });
}

/**
 * Toggle visit — optimistic update
 */
export function useToggleVisit() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: async (restaurantId: string) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { isVisited, error } = await listsApi.toggleVisit(restaurantId, user.id);
      if (error) throw error;
      return { restaurantId, isVisited };
    },
    onMutate: async (restaurantId) => {
      await queryClient.cancelQueries({ queryKey: ['user-visits', user?.id] });
      const previous = queryClient.getQueryData<string[]>(['user-visits', user?.id]) ?? [];
      const next = previous.includes(restaurantId)
        ? previous.filter(id => id !== restaurantId)
        : [...previous, restaurantId];
      queryClient.setQueryData(['user-visits', user?.id], next);
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['user-visits', user?.id], context.previous);
      }
    },
  });
}
```

**Step 2: Commit**

```bash
git add lib/hooks/queries/useLists.ts
git commit -m "[Curated Lists] Task 4: Query hooks (useLists, useListRestaurants, useToggleFavorite, useToggleVisit)"
```

---

## Task 5: List Detail Screen

**Files:**
- Create: `app/(screens)/list-detail.tsx`

**Step 1: Create the screen**

```typescript
// app/(screens)/list-detail.tsx
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useListRestaurants } from '@/lib/hooks/queries/useLists';
import { useUserFavorites, useUserVisits, useToggleFavorite, useToggleVisit } from '@/lib/hooks/queries/useLists';
import { mediumHaptic } from '@/lib/haptics';

export default function ListDetailScreen() {
  const { listId, listTitle } = useLocalSearchParams<{ listId: string; listTitle: string }>();
  const router = useRouter();

  const { data: restaurants, isLoading } = useListRestaurants(listId);
  const { data: favorites = [] } = useUserFavorites();
  const { data: visits = [] } = useUserVisits();
  const toggleFavorite = useToggleFavorite();
  const toggleVisit = useToggleVisit();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
      <FlatList
        data={restaurants}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingBottom: 32 }}
        renderItem={({ item }) => {
          const restaurantId = item.restaurant_id;
          const isFavorited = favorites.includes(restaurantId);
          const isVisited = visits.includes(restaurantId);

          return (
            <View style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: '#171717',
              marginHorizontal: 16,
              marginTop: 12,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: '#262626',
            }}>
              {/* Rank number */}
              <Text style={{ color: '#f97316', fontSize: 18, fontWeight: '700', width: 32 }}>
                #{item.rank}
              </Text>

              {/* Restaurant info */}
              <View style={{ flex: 1, marginLeft: 4 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                  {item.restaurants.name}
                </Text>
                <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 2 }}>
                  {item.restaurants.district}
                </Text>
              </View>

              {/* Actions */}
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                {/* Been There */}
                <TouchableOpacity
                  onPress={() => {
                    mediumHaptic();
                    toggleVisit.mutate(restaurantId);
                  }}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: isVisited ? '#16a34a' : '#262626',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    gap: 4,
                  }}
                >
                  <FontAwesome
                    name={isVisited ? 'check' : 'map-marker'}
                    size={12}
                    color={isVisited ? '#fff' : '#9ca3af'}
                  />
                  <Text style={{ color: isVisited ? '#fff' : '#9ca3af', fontSize: 12, fontWeight: '500' }}>
                    {isVisited ? 'Been There' : 'Mark Visited'}
                  </Text>
                </TouchableOpacity>

                {/* Save */}
                <TouchableOpacity
                  onPress={() => {
                    mediumHaptic();
                    toggleFavorite.mutate(restaurantId);
                  }}
                >
                  <FontAwesome
                    name={isFavorited ? 'heart' : 'heart-o'}
                    size={20}
                    color={isFavorited ? '#f97316' : '#6b7280'}
                  />
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ color: '#6b7280', fontSize: 16 }}>No restaurants in this list yet.</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
```

**Step 2: Commit**

```bash
git add app/(screens)/list-detail.tsx
git commit -m "[Curated Lists] Task 5: List detail screen"
```

---

## Task 6: Lists Tab Screen

**Files:**
- Create: `app/(tabs)/lists.tsx`

**Step 1: Create the screen**

```typescript
// app/(tabs)/lists.tsx
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useLists } from '@/lib/hooks/queries/useLists';
import { mediumHaptic } from '@/lib/haptics';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function ListsScreen() {
  const router = useRouter();
  const { data: lists, isLoading } = useLists();

  if (isLoading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color="#f97316" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
      <FlatList
        data={lists}
        keyExtractor={item => item.id}
        contentContainerStyle={{ paddingTop: 8, paddingBottom: 32 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => {
              mediumHaptic();
              router.push({
                pathname: '/(screens)/list-detail',
                params: { listId: item.id, listTitle: item.title },
              });
            }}
            style={{
              backgroundColor: '#171717',
              marginHorizontal: 16,
              marginTop: 12,
              borderRadius: 14,
              padding: 16,
              borderWidth: 1,
              borderColor: '#262626',
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <View style={{ flex: 1 }}>
              <Text style={{ color: '#fff', fontSize: 16, fontWeight: '600' }}>
                {item.title}
              </Text>
              {item.description && (
                <Text style={{ color: '#6b7280', fontSize: 13, marginTop: 4 }} numberOfLines={1}>
                  {item.description}
                </Text>
              )}
              {item.category && (
                <Text style={{ color: '#f97316', fontSize: 12, marginTop: 6, fontWeight: '500' }}>
                  {item.category}
                </Text>
              )}
            </View>
            <FontAwesome name="chevron-right" size={14} color="#6b7280" style={{ marginLeft: 12 }} />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: 80 }}>
            <Text style={{ color: '#6b7280', fontSize: 16 }}>No lists yet. Check back soon!</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}
```

**Step 2: Commit**

```bash
git add app/(tabs)/lists.tsx
git commit -m "[Curated Lists] Task 6: Lists tab screen"
```

---

## Task 7: Update Tab Layout — icons only, add Lists, remove Profile, add header avatar

**Files:**
- Modify: `app/(tabs)/_layout.tsx`

**Step 1: Read the current file first**

The current `_layout.tsx` has 3 tabs: `index`, `chat`, `profile`.

**Step 2: Replace with updated layout**

```typescript
// app/(tabs)/_layout.tsx
import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs, useRouter } from 'expo-router';
import { TouchableOpacity, View, Image } from 'react-native';
import { RatingPrompt } from '@/lib/components/ui/RatingPrompt';
import { OfflineBanner } from '@/lib/components/ui/OfflineBanner';
import { useUnreadDot, markChatTabSeen } from '@/lib/hooks/queries/useChats';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/lib/stores/auth';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome name={props.name} size={24} color={props.color} style={{ marginBottom: -3 }} />;
}

function HeaderAvatar() {
  const router = useRouter();
  const user = useAuthStore(s => s.user);

  return (
    <TouchableOpacity
      onPress={() => router.push('/(tabs)/profile')}
      style={{ marginLeft: 16 }}
    >
      {user?.photo_url ? (
        <Image
          source={{ uri: user.photo_url }}
          style={{ width: 32, height: 32, borderRadius: 16, borderWidth: 2, borderColor: '#f97316' }}
        />
      ) : (
        <View style={{
          width: 32, height: 32, borderRadius: 16,
          backgroundColor: '#262626', borderWidth: 2, borderColor: '#f97316',
          alignItems: 'center', justifyContent: 'center',
        }}>
          <FontAwesome name="user" size={16} color="#9ca3af" />
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function TabLayout() {
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
            tabBarShowLabel: false,
            tabBarStyle: {
              backgroundColor: '#171717',
              borderTopColor: '#262626',
              borderTopWidth: 1,
              paddingTop: 8,
              paddingBottom: 8,
              height: 60,
            },
            headerStyle: {
              backgroundColor: '#0a0a0a',
            },
            headerTintColor: '#ffffff',
            headerShadowVisible: false,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              tabBarIcon: ({ color }) => <TabBarIcon name="cutlery" color={color} />,
              headerTitle: 'Chopsticks',
              headerLeft: () => <HeaderAvatar />,
            }}
          />
          <Tabs.Screen
            name="lists"
            options={{
              tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
              headerTitle: 'Chopsticks',
              headerLeft: () => <HeaderAvatar />,
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
                      position: 'absolute',
                      top: -2,
                      right: -6,
                      width: 10,
                      height: 10,
                      borderRadius: 5,
                      backgroundColor: '#ef4444',
                      borderWidth: 2,
                      borderColor: '#171717',
                    }} />
                  )}
                </View>
              ),
              headerTitle: 'Messages',
            }}
            listeners={{
              tabPress: handleChatTabPress,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              href: null, // Hidden from tab bar but still routable
              headerTitle: 'My Profile',
            }}
          />
        </Tabs>
      </View>
    </>
  );
}
```

> **Note:** `href: null` hides the profile tab from the tab bar while keeping it navigable from the avatar. The notification bell that was in the index headerRight is removed — notifications are still accessible via the bell tab.

**Step 3: Start the dev server and test**

```bash
cd chopsticks
pnpm start --clear
```

Open iOS simulator. Verify:
- Bottom nav shows 4 icons (cutlery, list, comments, bell) — no labels
- Tapping list icon → Lists screen (empty or showing lists from seed)
- Header shows avatar on left side of Browse and Lists tabs
- Tapping avatar → navigates to Profile screen

**Step 4: Commit**

```bash
git add app/(tabs)/_layout.tsx
git commit -m "[Curated Lists] Task 7: Tab layout — icons only, add Lists tab, profile avatar in header"
```

---

## Task 8: Wire up List Detail header title

**Files:**
- Modify: `app/(tabs)/_layout.tsx` — no change needed here
- The list detail screen navigates via `router.push` to `/(screens)/list-detail` which uses the standard screen header

**Step 1: Add dynamic header title to list-detail.tsx**

In `app/(screens)/list-detail.tsx`, add the `Stack.Screen` header config at the top of the component:

```typescript
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';

// Inside the component, before the return:
return (
  <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
    <Stack.Screen options={{ title: listTitle ?? 'List', headerBackTitle: 'Lists' }} />
    <FlatList ... />
  </SafeAreaView>
);
```

**Step 2: Test the full flow**

1. Open app → tap Lists tab (list icon)
2. See list of editorial lists
3. Tap a list → navigate to list detail with correct title in header
4. See ranked restaurants with Been There and Save buttons
5. Tap Been There → button turns green instantly (optimistic update)
6. Tap heart → turns orange instantly
7. Navigate back → lists still visible

**Step 3: Commit**

```bash
git add app/(screens)/list-detail.tsx
git commit -m "[Curated Lists] Task 8: Dynamic header title on list detail + full flow QA"
```

---

---

## Task 9: Reviews — DB + API + Hooks

**Files:**
- Modify: `supabase/migrations/027_curated_lists.sql` — add `reviews` table
- Modify: `lib/services/api/lists.ts` — add review functions
- Modify: `lib/hooks/queries/useLists.ts` — add review hooks

**Step 1: Add `reviews` table to migration 027**

Append to `supabase/migrations/027_curated_lists.sql`:

```sql
-- reviews table
CREATE TABLE reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  text text NOT NULL CHECK (char_length(text) >= 20 AND char_length(text) <= 500),
  persona text, -- snapshot of user's persona at time of writing
  is_visible boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id) -- one review per user per restaurant
);

ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

-- Public read (visible reviews only)
CREATE POLICY "Reviews are public"
  ON reviews FOR SELECT
  USING (is_visible = true);

-- Users manage own reviews
CREATE POLICY "Users manage own reviews"
  ON reviews FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

Run `npx supabase db push` to apply.

**Step 2: Add review functions to `lib/services/api/lists.ts`**

```typescript
export interface ReviewRow {
  id: string;
  user_id: string;
  restaurant_id: string;
  rating: number;
  text: string;
  persona: string | null;
  created_at: string;
  users: {
    name: string | null;
    photo_url: string | null;
    persona: string | null;
  };
}

export async function getReviews(restaurantId: string, personaFilter?: string): Promise<{
  data: ReviewRow[] | null;
  error: Error | null;
}> {
  try {
    let query = supabase
      .from('reviews')
      .select(`
        id, user_id, restaurant_id, rating, text, persona, created_at,
        users ( name, photo_url, persona )
      `)
      .eq('restaurant_id', restaurantId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (personaFilter && personaFilter !== 'all') {
      query = query.eq('persona', personaFilter);
    }

    const { data, error } = await query;
    if (error) throw new Error(error.message);
    return { data: data as ReviewRow[], error: null };
  } catch (error) {
    console.error('getReviews error:', error);
    return { data: null, error: error as Error };
  }
}

export async function submitReview(input: {
  restaurantId: string;
  userId: string;
  rating: number;
  text: string;
  persona: string | null;
}): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('reviews')
      .upsert({
        user_id: input.userId,
        restaurant_id: input.restaurantId,
        rating: input.rating,
        text: input.text,
        persona: input.persona,
      }, { onConflict: 'user_id,restaurant_id' });
    if (error) throw new Error(error.message);
    return { error: null };
  } catch (error) {
    console.error('submitReview error:', error);
    return { error: error as Error };
  }
}
```

**Step 3: Add review hooks to `lib/hooks/queries/useLists.ts`**

```typescript
export function useReviews(restaurantId: string | undefined, personaFilter?: string) {
  return useQuery({
    queryKey: ['reviews', restaurantId, personaFilter],
    queryFn: async () => {
      if (!restaurantId) return [];
      const { data, error } = await listsApi.getReviews(restaurantId, personaFilter);
      if (error) throw error;
      return data ?? [];
    },
    enabled: !!restaurantId,
  });
}

export function useSubmitReview() {
  const queryClient = useQueryClient();
  const user = useAuthStore(s => s.user);

  return useMutation({
    mutationFn: async (input: { restaurantId: string; rating: number; text: string }) => {
      if (!user?.id) throw new Error('Not authenticated');
      const { error } = await listsApi.submitReview({
        restaurantId: input.restaurantId,
        userId: user.id,
        rating: input.rating,
        text: input.text,
        persona: user.persona ?? null,
      });
      if (error) throw error;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['reviews', variables.restaurantId] });
    },
  });
}
```

**Step 4: Commit**

```bash
git add supabase/migrations/027_curated_lists.sql lib/services/api/lists.ts lib/hooks/queries/useLists.ts
git commit -m "[Curated Lists] Task 9: Reviews — DB table, API, hooks"
```

---

## Task 10: Restaurant Detail Screen

**Files:**
- Create: `app/(screens)/restaurant-detail.tsx`
- Modify: `app/(screens)/list-detail.tsx` — make restaurant rows tappable → restaurant detail

**Step 1: Create `app/(screens)/restaurant-detail.tsx`**

```typescript
// app/(screens)/restaurant-detail.tsx
import { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  TextInput, Alert, ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  useUserFavorites, useUserVisits,
  useToggleFavorite, useToggleVisit,
  useReviews, useSubmitReview,
} from '@/lib/hooks/queries/useLists';
import { mediumHaptic } from '@/lib/haptics';

const PERSONAS = ['all', 'local', 'new_to_city', 'expat', 'traveler', 'student'];
const PERSONA_LABELS: Record<string, string> = {
  all: 'All',
  local: '🏠 Local',
  new_to_city: '🆕 New Here',
  expat: '🌍 Expat',
  traveler: '✈️ Traveler',
  student: '🎓 Student',
};

function StarRow({ rating, onRate }: { rating: number; onRate?: (r: number) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <TouchableOpacity key={n} onPress={() => onRate?.(n)} disabled={!onRate}>
          <FontAwesome
            name={n <= rating ? 'star' : 'star-o'}
            size={onRate ? 28 : 16}
            color={n <= rating ? '#f97316' : '#6b7280'}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

export default function RestaurantDetailScreen() {
  const { restaurantId, restaurantName, district } =
    useLocalSearchParams<{ restaurantId: string; restaurantName: string; district: string }>();

  const [personaFilter, setPersonaFilter] = useState('all');
  const [showWriteReview, setShowWriteReview] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState('');

  const { data: favorites = [] } = useUserFavorites();
  const { data: visits = [] } = useUserVisits();
  const toggleFavorite = useToggleFavorite();
  const toggleVisit = useToggleVisit();
  const { data: reviews = [], isLoading: reviewsLoading } = useReviews(restaurantId, personaFilter);
  const submitReview = useSubmitReview();

  const isFavorited = favorites.includes(restaurantId);
  const isVisited = visits.includes(restaurantId);

  const handleSubmitReview = () => {
    if (reviewRating === 0) { Alert.alert('Rating required', 'Please select a star rating.'); return; }
    if (reviewText.trim().length < 20) { Alert.alert('Too short', 'Review must be at least 20 characters.'); return; }

    submitReview.mutate(
      { restaurantId, rating: reviewRating, text: reviewText.trim() },
      {
        onSuccess: () => {
          setShowWriteReview(false);
          setReviewRating(0);
          setReviewText('');
        },
        onError: () => Alert.alert('Error', 'Failed to submit review. Please try again.'),
      }
    );
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0a0a0a' }} edges={['left', 'right']}>
      <Stack.Screen options={{ title: restaurantName ?? 'Restaurant' }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>

        {/* Header card */}
        <View style={{ backgroundColor: '#171717', margin: 16, borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#262626' }}>
          <Text style={{ color: '#fff', fontSize: 22, fontWeight: '700' }}>{restaurantName}</Text>
          <Text style={{ color: '#6b7280', fontSize: 14, marginTop: 4 }}>{district}</Text>

          {/* Action row */}
          <View style={{ flexDirection: 'row', gap: 12, marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => { mediumHaptic(); toggleVisit.mutate(restaurantId); }}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isVisited ? '#16a34a' : '#262626',
                paddingVertical: 10, borderRadius: 10, gap: 6,
              }}
            >
              <FontAwesome name={isVisited ? 'check' : 'map-marker'} size={14} color={isVisited ? '#fff' : '#9ca3af'} />
              <Text style={{ color: isVisited ? '#fff' : '#9ca3af', fontSize: 14, fontWeight: '600' }}>
                {isVisited ? 'Been There' : 'Mark Visited'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => { mediumHaptic(); toggleFavorite.mutate(restaurantId); }}
              style={{
                flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
                backgroundColor: isFavorited ? '#431407' : '#262626',
                paddingVertical: 10, borderRadius: 10, gap: 6,
              }}
            >
              <FontAwesome name={isFavorited ? 'heart' : 'heart-o'} size={14} color={isFavorited ? '#f97316' : '#9ca3af'} />
              <Text style={{ color: isFavorited ? '#f97316' : '#9ca3af', fontSize: 14, fontWeight: '600' }}>
                {isFavorited ? 'Saved' : 'Save'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Reviews section */}
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
            <Text style={{ color: '#fff', fontSize: 18, fontWeight: '700' }}>Reviews</Text>
            <TouchableOpacity
              onPress={() => setShowWriteReview(!showWriteReview)}
              style={{ backgroundColor: '#f97316', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8 }}
            >
              <Text style={{ color: '#fff', fontSize: 13, fontWeight: '600' }}>Write a Review</Text>
            </TouchableOpacity>
          </View>

          {/* Write review form */}
          {showWriteReview && (
            <View style={{ backgroundColor: '#171717', borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#262626' }}>
              <Text style={{ color: '#9ca3af', fontSize: 13, marginBottom: 8 }}>Your rating</Text>
              <StarRow rating={reviewRating} onRate={setReviewRating} />
              <TextInput
                value={reviewText}
                onChangeText={setReviewText}
                placeholder="What did you think? (min 20 characters)"
                placeholderTextColor="#6b7280"
                multiline
                maxLength={500}
                style={{
                  color: '#fff', backgroundColor: '#262626', borderRadius: 10,
                  padding: 12, marginTop: 12, minHeight: 80, fontSize: 14,
                }}
              />
              <Text style={{ color: '#6b7280', fontSize: 12, marginTop: 4, textAlign: 'right' }}>
                {reviewText.length}/500
              </Text>
              <TouchableOpacity
                onPress={handleSubmitReview}
                disabled={submitReview.isPending}
                style={{ backgroundColor: '#f97316', borderRadius: 10, padding: 12, alignItems: 'center', marginTop: 12 }}
              >
                {submitReview.isPending
                  ? <ActivityIndicator color="#fff" />
                  : <Text style={{ color: '#fff', fontWeight: '600' }}>Submit Review</Text>
                }
              </TouchableOpacity>
            </View>
          )}

          {/* Persona filter chips */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {PERSONAS.map(p => (
                <TouchableOpacity
                  key={p}
                  onPress={() => setPersonaFilter(p)}
                  style={{
                    paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
                    backgroundColor: personaFilter === p ? '#f97316' : '#262626',
                    borderWidth: 1, borderColor: personaFilter === p ? '#f97316' : '#404040',
                  }}
                >
                  <Text style={{ color: personaFilter === p ? '#fff' : '#9ca3af', fontSize: 13, fontWeight: '500' }}>
                    {PERSONA_LABELS[p]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Review list */}
          {reviewsLoading ? (
            <ActivityIndicator color="#f97316" style={{ marginTop: 20 }} />
          ) : reviews.length === 0 ? (
            <View style={{ alignItems: 'center', paddingVertical: 32 }}>
              <Text style={{ color: '#6b7280', fontSize: 15 }}>
                {personaFilter === 'all' ? 'No reviews yet. Be the first!' : `No ${PERSONA_LABELS[personaFilter]} reviews yet.`}
              </Text>
            </View>
          ) : (
            reviews.map(review => (
              <View key={review.id} style={{
                backgroundColor: '#171717', borderRadius: 14, padding: 16,
                marginBottom: 12, borderWidth: 1, borderColor: '#262626',
              }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                    <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>
                      {review.users?.name ?? 'Anonymous'}
                    </Text>
                    {review.persona && (
                      <Text style={{ color: '#f97316', fontSize: 12 }}>
                        {PERSONA_LABELS[review.persona] ?? review.persona}
                      </Text>
                    )}
                  </View>
                  <StarRow rating={review.rating} />
                </View>
                <Text style={{ color: '#d1d5db', fontSize: 14, lineHeight: 20 }}>{review.text}</Text>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
```

**Step 2: Update `list-detail.tsx` — make restaurant rows tappable**

In `app/(screens)/list-detail.tsx`, wrap the restaurant row in a `TouchableOpacity` that navigates to restaurant detail. Change:

```typescript
<View style={{ flexDirection: 'row', alignItems: 'center', ... }}>
```

To:

```typescript
<TouchableOpacity
  onPress={() => {
    mediumHaptic();
    router.push({
      pathname: '/(screens)/restaurant-detail',
      params: {
        restaurantId: item.restaurant_id,
        restaurantName: item.restaurants.name,
        district: item.restaurants.district,
      },
    });
  }}
  style={{ flexDirection: 'row', alignItems: 'center', ... }}
>
  {/* existing content */}
</TouchableOpacity>
```

Also import `useRouter` at the top of `list-detail.tsx` if not already imported.

**Step 3: Test the full flow**

1. Tap a list → see ranked restaurants
2. Tap a restaurant row → navigate to Restaurant Detail
3. Header shows restaurant name
4. Tap "Mark Visited" → turns green
5. Tap "Save" → turns orange
6. Tap "Write a Review" → form expands
7. Select stars + type 20+ characters → tap Submit → review appears
8. Filter by persona chip → only matching reviews shown
9. "All" chip → all reviews shown

**Step 4: Commit**

```bash
git add app/(screens)/restaurant-detail.tsx app/(screens)/list-detail.tsx
git commit -m "[Curated Lists] Task 10: Restaurant detail screen with persona-filtered reviews"
```

---

## Manual QA Checklist

After all tasks complete, verify:

- [ ] Bottom nav shows 4 icon-only tabs in order: cutlery | list | comments | bell
- [ ] No labels visible on any tab
- [ ] Profile tab not visible in tab bar
- [ ] Header avatar appears on Browse and Lists tabs
- [ ] Avatar shows user photo if set, fallback user icon if not
- [ ] Tapping avatar → navigates to Profile screen
- [ ] Lists tab loads and shows all published lists
- [ ] Empty state shows if no lists exist
- [ ] Tapping a list → List Detail with correct title
- [ ] Ranked restaurants visible with #1, #2, #3 etc.
- [ ] Tapping a restaurant row → Restaurant Detail screen
- [ ] "Mark Visited" → turns green "Been There" instantly
- [ ] Tapping again → reverts instantly
- [ ] "Save" → turns orange instantly, tapping again reverts
- [ ] State persists after closing and reopening app
- [ ] "Write a Review" form expands/collapses
- [ ] Star rating required, min 20 chars enforced
- [ ] Submitted review appears immediately in list
- [ ] Persona filter chips filter reviews correctly
- [ ] "All" shows all reviews regardless of persona

---

## Notifications Tab

> **Important:** The current `_layout.tsx` does NOT have a notifications tab — notifications are accessed via a bell icon in the `index` header. When you add the bell tab in Task 7, you need a `app/(tabs)/notifications.tsx` file. Check if it exists:

```bash
ls chopsticks/app/(tabs)/
```

If `notifications.tsx` does NOT exist, the bell tab will crash. In that case, either:
- Keep the bell in the `index` header (remove it from the tab bar in Task 7)
- Or create a simple `notifications.tsx` that redirects to `/(screens)/notifications`

Check this BEFORE implementing Task 7.
