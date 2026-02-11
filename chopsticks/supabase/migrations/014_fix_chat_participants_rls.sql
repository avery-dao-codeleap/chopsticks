-- Fix RLS policy on chat_participants to allow viewing all participants in a chat
-- Date: 2026-02-11
-- Purpose: Users should see ALL participants in chats they're part of, not just themselves

-- Drop old restrictive policy
DROP POLICY IF EXISTS "Chat members can view members" ON public.chat_participants;

-- Create new policy: Users can see all participants in chats they're part of
CREATE POLICY "Chat members can view all participants" ON public.chat_participants
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_participants AS my_participation
      WHERE my_participation.chat_id = chat_participants.chat_id
        AND my_participation.user_id = auth.uid()
    )
  );

COMMENT ON POLICY "Chat members can view all participants" ON public.chat_participants
  IS 'Users can see all participants in chats they are part of';
