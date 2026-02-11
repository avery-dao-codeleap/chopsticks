-- Fix RLS recursion between chats and chat_participants
-- Date: 2026-02-11
-- Purpose: Simplify chats RLS to prevent recursion when joining with chat_participants

-- Drop the problematic policy that queries chat_participants
DROP POLICY IF EXISTS "Chat participants can view" ON public.chats;

-- Create simplified policy using security definer function
-- This prevents recursion when chat_participants queries join to chats
CREATE POLICY "Chat participants can view chats" ON public.chats
  FOR SELECT
  USING (
    public.is_chat_member(id, auth.uid())
  );

COMMENT ON POLICY "Chat participants can view chats" ON public.chats
  IS 'Users can view chats they are members of (via security definer function to prevent RLS recursion)';
