-- Migration to support email authentication instead of Firebase phone auth
-- Date: 2026-02-10

-- Make firebase_uid and phone nullable since we're using email now
ALTER TABLE public.users
  ALTER COLUMN firebase_uid DROP NOT NULL,
  ALTER COLUMN phone DROP NOT NULL;

-- Add email column for reference (optional but useful)
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS email TEXT;

-- Update RLS policy to allow users to insert with just auth.uid()
-- (firebase_uid and phone will be null for email signups)
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
