-- Reset Schema (run this first if tables already exist)
-- WARNING: This will delete all data!

-- Drop triggers first
drop trigger if exists on_auth_user_created on auth.users;
drop trigger if exists set_users_updated_at on public.users;
drop trigger if exists set_user_preferences_updated_at on public.user_preferences;

-- Drop functions (CASCADE removes any dependent triggers automatically)
drop function if exists public.handle_new_user() cascade;
drop function if exists public.handle_updated_at() cascade;

-- Drop tables in reverse order (due to foreign keys)
drop table if exists public.matches cascade;
drop table if exists public.past_visits cascade;
drop table if exists public.notifications cascade;
drop table if exists public.person_ratings cascade;
drop table if exists public.reviews cascade;
drop table if exists public.messages cascade;
drop table if exists public.chat_participants cascade;
drop table if exists public.chats cascade;
drop table if exists public.request_participants cascade;
drop table if exists public.meal_requests cascade;
drop table if exists public.restaurants cascade;
drop table if exists public.user_preferences cascade;
drop table if exists public.users cascade;
