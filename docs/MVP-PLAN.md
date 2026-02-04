# Chopsticks MVP Shipping Plan

## Current State Assessment

### What's Built ✅
| Component | Status | Notes |
|-----------|--------|-------|
| Project Setup | ✅ Done | Expo 54, pnpm monorepo, TypeScript |
| Auth Flow | ✅ Done | Login + OTP verify screens, dev bypass |
| Onboarding | ✅ Done | Profile + preferences screens (UI only) |
| Tab Navigation | ✅ Done | Feed, Discover, Chat, Profile |
| Match Feed UI | ✅ Done | Card layout with placeholder data |
| Discover UI | ✅ Done | Restaurant list + filters (placeholder) |
| Chat List UI | ✅ Done | Conversation list (placeholder) |
| Stores | ✅ Done | auth.ts, matches.ts with Supabase |
| Testing Setup | ✅ Done | Jest + React Testing Library |

### What's Missing ❌
| Component | Priority | Effort |
|-----------|----------|--------|
| Supabase Database Schema | P0 | 1 day |
| Real Data Integration | P0 | 2 days |
| Matching Algorithm | P0 | 2 days |
| Like/Pass Actions | P0 | 1 day |
| Chat Detail Screen | P0 | 2 days |
| Real-time Messaging | P0 | 2 days |
| Map Integration | P1 | 2 days |
| Push Notifications | P1 | 1 day |
| Image Upload | P1 | 1 day |

---

## Sprint Plan (3 Weeks to MVP)

### Week 1: Backend + Core Data

#### Day 1-2: Database Setup
```
□ Create Supabase tables:
  - users (id, phone, name, age, bio, profile_image_url, verification_status, meal_count)
  - user_preferences (user_id, cuisine_types[], dietary_restrictions[], allergies[], budget_min, budget_max, preferred_radius_km)
  - restaurants (id, name, cuisine_type, price_range, latitude, longitude, address, rating_avg, is_hidden_gem)
  - matches (id, user_1_id, user_2_id, status, restaurant_id, scheduled_time, expires_at)
  - messages (id, match_id, sender_id, content, sent_at, read_at)

□ Set up Row Level Security (RLS) policies
□ Create database indexes for performance
□ Seed 50 restaurants in HCMC
```

#### Day 3-4: Auth + Profile Integration
```
□ Connect login screen to real Supabase auth
□ Save user profile to database on onboarding complete
□ Upload profile image to Supabase Storage
□ Load user data on app launch
□ Fix TextInput issues (use StyleSheet instead of NativeWind)
```

#### Day 5: Match Feed Real Data
```
□ Create matching algorithm (location + preferences)
□ Fetch potential matches from database
□ Display real user data in feed cards
□ Handle empty state when no matches
```

---

### Week 2: Matching + Chat

#### Day 6-7: Like/Pass Flow
```
□ Implement swipe gestures (react-native-gesture-handler)
□ Like action → create pending match
□ Pass action → skip user (don't show again)
□ Mutual match detection → show notification
□ Match expiration (24hr cron job or edge function)
```

#### Day 8: Match Detail Screen
```
□ Create /match/[id] screen
□ Show other user profile
□ Show match status (pending/accepted)
□ Accept/decline buttons for incoming matches
□ Navigate to chat on accept
```

#### Day 9-10: Chat Implementation
```
□ Create /chat/[matchId] screen
□ Message input + send button
□ Display message bubbles (sent/received)
□ Supabase Realtime subscription for new messages
□ Mark messages as read
□ Scroll to bottom on new message
```

---

### Week 3: Discovery + Polish

#### Day 11-12: Map Integration
```
□ Install react-native-maps
□ Display HCMC map with restaurant pins
□ Custom dark theme for map
□ Tap pin → show restaurant card
□ Filter restaurants by cuisine on map
```

#### Day 13: Push Notifications
```
□ Set up Expo Push Notifications
□ Request permission on onboarding complete
□ Save push token to user record
□ Trigger notifications:
  - New match request
  - Match accepted
  - New message
```

#### Day 14: Testing + Bug Fixes
```
□ Test complete user flow (signup → match → chat)
□ Fix any TextInput issues
□ Fix navigation edge cases
□ Performance optimization
□ Error handling for network failures
```

#### Day 15: Launch Prep
```
□ App icon + splash screen
□ App Store metadata (screenshots, description)
□ TestFlight build
□ Invite 10-20 beta testers
□ Monitor crash reports (Sentry)
```

---

## Technical Implementation Details

### Database Schema (Supabase SQL)

```sql
-- Enable PostGIS for location queries
create extension if not exists postgis;

-- Users table
create table users (
  id uuid primary key references auth.users(id),
  phone text unique,
  name text,
  age integer check (age >= 18),
  bio text,
  profile_image_url text,
  verification_status text default 'unverified',
  meal_count integer default 0,
  location geography(point),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- User preferences
create table user_preferences (
  user_id uuid primary key references users(id),
  cuisine_types text[] default '{}',
  dietary_restrictions text[] default '{}',
  allergies text[] default '{}',
  budget_min integer default 0,
  budget_max integer default 500000,
  preferred_radius_km integer default 10
);

-- Restaurants
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cuisine_type text,
  price_range text check (price_range in ('cheap', 'moderate', 'expensive')),
  address text,
  city text default 'Ho Chi Minh City',
  location geography(point),
  rating_avg numeric(2,1) default 0,
  visit_count integer default 0,
  is_hidden_gem boolean default false,
  image_urls text[] default '{}',
  created_at timestamptz default now()
);

-- Matches
create table matches (
  id uuid primary key default gen_random_uuid(),
  user_1_id uuid references users(id),
  user_2_id uuid references users(id),
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired', 'completed')),
  restaurant_id uuid references restaurants(id),
  scheduled_time timestamptz,
  expires_at timestamptz default (now() + interval '24 hours'),
  created_at timestamptz default now()
);

-- Messages
create table messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid references matches(id),
  sender_id uuid references users(id),
  content text not null,
  sent_at timestamptz default now(),
  read_at timestamptz
);

-- Indexes
create index idx_users_location on users using gist(location);
create index idx_restaurants_location on restaurants using gist(location);
create index idx_matches_users on matches(user_1_id, user_2_id);
create index idx_messages_match on messages(match_id, sent_at);

-- RLS Policies
alter table users enable row level security;
alter table user_preferences enable row level security;
alter table matches enable row level security;
alter table messages enable row level security;

-- Users can read all profiles, update only their own
create policy "Public profiles are viewable" on users for select using (true);
create policy "Users can update own profile" on users for update using (auth.uid() = id);

-- Preferences only visible to owner
create policy "Users can manage own preferences" on user_preferences
  for all using (auth.uid() = user_id);

-- Matches visible to participants
create policy "Users can view own matches" on matches
  for select using (auth.uid() = user_1_id or auth.uid() = user_2_id);
create policy "Users can create matches" on matches
  for insert with check (auth.uid() = user_1_id);

-- Messages visible to match participants
create policy "Users can view match messages" on messages
  for select using (
    exists (
      select 1 from matches
      where matches.id = messages.match_id
      and (matches.user_1_id = auth.uid() or matches.user_2_id = auth.uid())
    )
  );
```

### Matching Algorithm (v1)

```typescript
// apps/mobile/lib/matching.ts
interface MatchScore {
  userId: string;
  score: number;
  user: User;
}

export async function getPotentialMatches(
  currentUser: User,
  preferences: UserPreferences,
  limit = 10
): Promise<MatchScore[]> {
  const { data: candidates } = await supabase
    .from('users')
    .select(`
      *,
      preferences:user_preferences(*)
    `)
    .neq('id', currentUser.id)
    .not('id', 'in', await getAlreadyMatchedIds(currentUser.id));

  const scored = candidates.map(candidate => ({
    userId: candidate.id,
    user: candidate,
    score: calculateScore(currentUser, preferences, candidate),
  }));

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

function calculateScore(
  user1: User,
  prefs1: UserPreferences,
  user2: User
): number {
  let score = 0;
  const prefs2 = user2.preferences;

  // Cuisine overlap (0-30 points)
  const cuisineOverlap = prefs1.cuisine_types.filter(
    c => prefs2.cuisine_types.includes(c)
  ).length;
  score += Math.min(30, cuisineOverlap * 10);

  // Budget overlap (0-20 points)
  const budgetOverlap = Math.max(0,
    Math.min(prefs1.budget_max, prefs2.budget_max) -
    Math.max(prefs1.budget_min, prefs2.budget_min)
  );
  score += budgetOverlap > 0 ? 20 : 0;

  // Distance (0-20 points, closer = higher)
  // TODO: Calculate actual distance with PostGIS

  // Experience similarity (0-10 points)
  const expDiff = Math.abs(user1.meal_count - user2.meal_count);
  score += Math.max(0, 10 - expDiff);

  return score;
}
```

### Real-time Chat Setup

```typescript
// apps/mobile/lib/chat.ts
export function subscribeToMessages(
  matchId: string,
  onMessage: (message: Message) => void
) {
  const channel = supabase
    .channel(`match:${matchId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `match_id=eq.${matchId}`,
      },
      (payload) => onMessage(payload.new as Message)
    )
    .subscribe();

  return () => supabase.removeChannel(channel);
}

export async function sendMessage(
  matchId: string,
  content: string
): Promise<{ error: Error | null }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: new Error('Not authenticated') };

  const { error } = await supabase.from('messages').insert({
    match_id: matchId,
    sender_id: user.id,
    content,
  });

  return { error: error as Error | null };
}
```

---

## Success Criteria for MVP

### Functional Requirements
- [ ] User can sign up with phone number
- [ ] User can complete profile + preferences
- [ ] User can see potential matches
- [ ] User can like/pass on matches
- [ ] Mutual likes create a match
- [ ] Matched users can chat
- [ ] Messages appear in real-time
- [ ] User can browse restaurants on map/list
- [ ] Push notifications for new matches/messages

### Quality Requirements
- [ ] < 3s app launch time
- [ ] < 1% crash rate
- [ ] Offline handling (show cached data)
- [ ] Error messages for all failure states

### Beta Launch Targets
- 20 beta testers
- 10+ matches created
- 5+ conversations with 10+ messages
- NPS score > 7

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| TextInput not working | Use StyleSheet instead of NativeWind on inputs |
| Slow matching | Add database indexes, limit candidates |
| Chat not real-time | Test Supabase Realtime early |
| No users to match | Seed test accounts, launch in small area |
| App Store rejection | Follow guidelines, test on real devices |

---

## Post-MVP Improvements

1. **Swipe animations** - Tinder-like card swiping
2. **Restaurant detail screen** - Full info + reviews
3. **Profile verification** - Photo verification flow
4. **Meal completion** - Rate buddy + restaurant
5. **Saved connections** - Re-match with past buddies
6. **Groups** - Food groups for larger meals

---

*Start with Day 1-2 database setup. Everything else builds on this foundation.*
