-- Chopsticks Database Schema
-- Run this in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Enable PostGIS for location queries
create extension if not exists postgis;

-- ============================================
-- USERS TABLE
-- ============================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique,
  name text,
  age integer check (age >= 18 and age <= 100),
  bio text check (char_length(bio) <= 200),
  profile_image_url text,
  verification_status text default 'unverified' check (verification_status in ('unverified', 'pending', 'verified')),
  meal_count integer default 0,
  latitude double precision,
  longitude double precision,
  push_token text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
create table if not exists public.user_preferences (
  user_id uuid primary key references public.users(id) on delete cascade,
  cuisine_types text[] default '{}',
  dietary_restrictions text[] default '{}',
  allergies text[] default '{}',
  budget_min integer default 30000,
  budget_max integer default 200000,
  preferred_radius_km integer default 10,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- RESTAURANTS TABLE
-- ============================================
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  cuisine_type text not null,
  price_range text check (price_range in ('cheap', 'moderate', 'expensive')),
  address text,
  city text default 'Ho Chi Minh City',
  latitude double precision not null,
  longitude double precision not null,
  rating_avg numeric(2,1) default 0 check (rating_avg >= 0 and rating_avg <= 5),
  review_count integer default 0,
  visit_count integer default 0,
  is_hidden_gem boolean default false,
  image_urls text[] default '{}',
  submitted_by_user_id uuid references public.users(id),
  created_at timestamptz default now()
);

-- ============================================
-- MATCHES TABLE
-- ============================================
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_1_id uuid not null references public.users(id) on delete cascade,
  user_2_id uuid not null references public.users(id) on delete cascade,
  status text default 'pending' check (status in ('pending', 'accepted', 'declined', 'expired', 'completed', 'cancelled')),
  restaurant_id uuid references public.restaurants(id),
  scheduled_time timestamptz,
  expires_at timestamptz default (now() + interval '24 hours'),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint unique_match unique (user_1_id, user_2_id)
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  match_id uuid not null references public.matches(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null check (char_length(content) <= 1000),
  sent_at timestamptz default now(),
  read_at timestamptz
);

-- ============================================
-- SKIPPED USERS TABLE
-- ============================================
create table if not exists public.skipped_users (
  user_id uuid not null references public.users(id) on delete cascade,
  skipped_user_id uuid not null references public.users(id) on delete cascade,
  skipped_at timestamptz default now(),
  primary key (user_id, skipped_user_id)
);

-- ============================================
-- SAVED CONNECTIONS TABLE
-- ============================================
create table if not exists public.saved_connections (
  user_id uuid not null references public.users(id) on delete cascade,
  connected_user_id uuid not null references public.users(id) on delete cascade,
  meals_together integer default 1,
  saved_at timestamptz default now(),
  primary key (user_id, connected_user_id)
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_users_location on public.users(latitude, longitude);
create index if not exists idx_restaurants_location on public.restaurants(latitude, longitude);
create index if not exists idx_restaurants_cuisine on public.restaurants(cuisine_type);
create index if not exists idx_matches_user1 on public.matches(user_1_id);
create index if not exists idx_matches_user2 on public.matches(user_2_id);
create index if not exists idx_matches_status on public.matches(status);
create index if not exists idx_messages_match on public.messages(match_id, sent_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.users enable row level security;
alter table public.user_preferences enable row level security;
alter table public.restaurants enable row level security;
alter table public.matches enable row level security;
alter table public.messages enable row level security;
alter table public.skipped_users enable row level security;
alter table public.saved_connections enable row level security;

-- Users policies
create policy "Public profiles are viewable" on public.users for select using (true);
create policy "Users can insert own profile" on public.users for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.users for update using (auth.uid() = id);

-- Preferences policies
create policy "Users can view own preferences" on public.user_preferences for select using (auth.uid() = user_id);
create policy "Users can insert own preferences" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update own preferences" on public.user_preferences for update using (auth.uid() = user_id);

-- Restaurants policies
create policy "Restaurants are viewable by all" on public.restaurants for select using (true);
create policy "Authenticated users can submit restaurants" on public.restaurants for insert with check (auth.uid() is not null);

-- Matches policies
create policy "Users can view own matches" on public.matches for select using (auth.uid() = user_1_id or auth.uid() = user_2_id);
create policy "Users can create matches" on public.matches for insert with check (auth.uid() = user_1_id);
create policy "Match participants can update" on public.matches for update using (auth.uid() = user_1_id or auth.uid() = user_2_id);

-- Messages policies
create policy "Match participants can view messages" on public.messages for select using (
  exists (select 1 from public.matches where matches.id = messages.match_id and (matches.user_1_id = auth.uid() or matches.user_2_id = auth.uid()))
);
create policy "Match participants can send messages" on public.messages for insert with check (
  auth.uid() = sender_id and exists (select 1 from public.matches where matches.id = match_id and status = 'accepted' and (matches.user_1_id = auth.uid() or matches.user_2_id = auth.uid()))
);

-- Skipped users policies
create policy "Users can view own skips" on public.skipped_users for select using (auth.uid() = user_id);
create policy "Users can insert skips" on public.skipped_users for insert with check (auth.uid() = user_id);

-- Saved connections policies
create policy "Users can view own connections" on public.saved_connections for select using (auth.uid() = user_id);
create policy "Users can save connections" on public.saved_connections for insert with check (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_users_updated_at before update on public.users for each row execute function public.handle_updated_at();
create trigger set_user_preferences_updated_at before update on public.user_preferences for each row execute function public.handle_updated_at();
create trigger set_matches_updated_at before update on public.matches for each row execute function public.handle_updated_at();

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ============================================
-- REALTIME
-- ============================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.matches;
