-- Fix infinite recursion in chat_participants RLS policy
-- Date: 2026-02-11
-- Purpose: Use security definer function to check chat membership without triggering RLS recursion

-- Drop the problematic policy
DROP POLICY IF EXISTS "Chat members can view all participants" ON public.chat_participants;

-- Create a security definer function that bypasses RLS to check if user is in a chat
CREATE OR REPLACE FUNCTION public.is_chat_member(p_chat_id UUID, p_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.chat_participants
    WHERE chat_id = p_chat_id
      AND user_id = p_user_id
  );
END;
$$;

-- Grant execute to authenticated users
GRANT EXECUTE ON FUNCTION public.is_chat_member(UUID, UUID) TO authenticated;

-- Create new policy using the security definer function
CREATE POLICY "Chat members can view all participants" ON public.chat_participants
  FOR SELECT
  USING (
    public.is_chat_member(chat_id, auth.uid())
  );

COMMENT ON FUNCTION public.is_chat_member(UUID, UUID)
  IS 'Security definer function to check chat membership without RLS recursion';

COMMENT ON POLICY "Chat members can view all participants" ON public.chat_participants
  IS 'Users can see all participants in chats they are members of (via security definer function)';
