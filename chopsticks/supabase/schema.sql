-- Chopsticks Database Schema (v2 - Request-Based Model)
-- Matches the ER diagram in docs/prd-diagrams.md
-- Run in Supabase SQL Editor: https://supabase.com/dashboard/project/YOUR_PROJECT/sql

-- Enable PostGIS for location queries
create extension if not exists postgis;

-- ============================================
-- USERS TABLE
-- ============================================
create table if not exists public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  phone text unique not null,
  name text,
  age integer check (age >= 18 and age <= 100),
  gender text check (gender in ('male', 'female', 'non-binary', 'prefer_not_to_say')),
  photo_url text,
  persona text check (persona in ('local', 'traveler')),
  city text default 'hcmc' check (city = 'hcmc'),
  meal_count integer default 0,
  verified boolean default false,
  push_token text,
  language text default 'vi' check (language in ('vi', 'en')),
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.users(id) on delete cascade,
  cuisine_types text[] default '{}',
  budget_ranges text[] default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- RESTAURANTS TABLE
-- ============================================
create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text default 'hcmc' check (city = 'hcmc'),
  cuisine text not null,
  budget_range text check (budget_range in ('under_50k', '50k_150k', '150k_500k', '500k_plus')),
  latitude double precision not null,
  longitude double precision not null,
  is_hidden_spot boolean default false,
  verified boolean default false,
  source text default 'google_maps' check (source in ('google_maps', 'user_added')),
  created_at timestamptz default now()
);

-- ============================================
-- MEAL REQUESTS TABLE (Core Feature)
-- ============================================
create table if not exists public.meal_requests (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid not null references public.users(id) on delete cascade,
  restaurant_id uuid not null references public.restaurants(id),
  cuisine text not null,
  cuisine_custom text,
  budget_range text not null check (budget_range in ('under_50k', '50k_150k', '150k_500k', '500k_plus')),
  time_window timestamptz not null,
  spots_total integer not null default 2 check (spots_total >= 2 and spots_total <= 4),
  spots_taken integer not null default 1,
  join_type text not null check (join_type in ('open', 'approval')),
  status text not null default 'active' check (status in ('active', 'completed', 'canceled', 'expired')),
  created_at timestamptz default now(),
  expires_at timestamptz default (now() + interval '24 hours')
);

-- ============================================
-- REQUEST PARTICIPANTS TABLE
-- ============================================
create table if not exists public.request_participants (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.meal_requests(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('joined', 'pending', 'denied')),
  joined_at timestamptz default now(),
  unique (request_id, user_id)
);

-- ============================================
-- CHATS TABLE
-- ============================================
create table if not exists public.chats (
  id uuid primary key default gen_random_uuid(),
  request_id uuid references public.meal_requests(id) on delete set null,
  type text not null check (type in ('group', 'dm')),
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- ============================================
-- CHAT PARTICIPANTS TABLE
-- ============================================
create table if not exists public.chat_participants (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  user_id uuid not null references public.users(id) on delete cascade,
  unique (chat_id, user_id)
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  chat_id uuid not null references public.chats(id) on delete cascade,
  sender_id uuid not null references public.users(id) on delete cascade,
  content text not null check (char_length(content) <= 1000),
  sent_at timestamptz default now()
);

-- ============================================
-- PERSON RATINGS TABLE (binary show-up)
-- ============================================
create table if not exists public.person_ratings (
  id uuid primary key default gen_random_uuid(),
  rater_id uuid not null references public.users(id) on delete cascade,
  rated_id uuid not null references public.users(id) on delete cascade,
  request_id uuid not null references public.meal_requests(id) on delete cascade,
  showed_up boolean not null,
  optional_comment text,
  created_at timestamptz default now(),
  unique (rater_id, rated_id, request_id)
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  type text not null check (type in ('join_request', 'join_approved', 'new_message')),
  title text not null,
  body text not null,
  data jsonb default '{}',
  read boolean default false,
  created_at timestamptz default now()
);

-- ============================================
-- INDEXES
-- ============================================
create index if not exists idx_restaurants_location on public.restaurants(latitude, longitude);
create index if not exists idx_restaurants_cuisine on public.restaurants(cuisine);
create index if not exists idx_meal_requests_status on public.meal_requests(status);
create index if not exists idx_meal_requests_requester on public.meal_requests(requester_id);
create index if not exists idx_meal_requests_restaurant on public.meal_requests(restaurant_id);
create index if not exists idx_meal_requests_expires on public.meal_requests(expires_at);
create index if not exists idx_request_participants_request on public.request_participants(request_id);
create index if not exists idx_request_participants_user on public.request_participants(user_id);
create index if not exists idx_messages_chat on public.messages(chat_id, sent_at);
create index if not exists idx_notifications_user on public.notifications(user_id, created_at);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
alter table public.users enable row level security;
alter table public.user_preferences enable row level security;
alter table public.restaurants enable row level security;
alter table public.meal_requests enable row level security;
alter table public.request_participants enable row level security;
alter table public.chats enable row level security;
alter table public.chat_participants enable row level security;
alter table public.messages enable row level security;
alter table public.person_ratings enable row level security;
alter table public.notifications enable row level security;

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
create policy "Authenticated users can add restaurants" on public.restaurants for insert with check (auth.uid() is not null);

-- Meal requests policies
create policy "Active requests are viewable by all" on public.meal_requests for select using (true);
create policy "Users can create requests" on public.meal_requests for insert with check (auth.uid() = requester_id);
create policy "Creators can update own requests" on public.meal_requests for update using (auth.uid() = requester_id);

-- Request participants policies
create policy "Participants viewable by all" on public.request_participants for select using (true);
create policy "Users can join requests" on public.request_participants for insert with check (auth.uid() = user_id);
create policy "Request creator can update participant status" on public.request_participants for update using (
  exists (select 1 from public.meal_requests where id = request_id and requester_id = auth.uid())
);

-- Chats policies
create policy "Chat participants can view chats" on public.chats for select using (
  exists (select 1 from public.chat_participants where chat_id = id and user_id = auth.uid())
);

-- Chat participants policies
create policy "Chat participants can view members" on public.chat_participants for select using (
  exists (select 1 from public.chat_participants cp where cp.chat_id = chat_id and cp.user_id = auth.uid())
);

-- Messages policies
create policy "Chat members can view messages" on public.messages for select using (
  exists (select 1 from public.chat_participants where chat_id = messages.chat_id and user_id = auth.uid())
);
create policy "Chat members can send messages" on public.messages for insert with check (
  auth.uid() = sender_id and exists (select 1 from public.chat_participants where chat_id = messages.chat_id and user_id = auth.uid())
);

-- Person ratings policies
create policy "Users can view ratings they gave or received" on public.person_ratings for select using (auth.uid() = rater_id or auth.uid() = rated_id);
create policy "Users can create ratings" on public.person_ratings for insert with check (auth.uid() = rater_id);

-- Notifications policies
create policy "Users can view own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "Users can update own notifications" on public.notifications for update using (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS & TRIGGERS
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

-- Auto-create user profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, phone)
  values (new.id, new.phone);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();

-- ============================================
-- REALTIME
-- ============================================
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.meal_requests;
alter publication supabase_realtime add table public.request_participants;
alter publication supabase_realtime add table public.notifications;
