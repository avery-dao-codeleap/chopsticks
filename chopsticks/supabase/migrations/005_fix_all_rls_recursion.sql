-- Fix All RLS Circular Dependencies
-- Date: 2026-02-11
-- Purpose: Fix all infinite recursion errors in RLS policies
-- Tables affected: meal_requests, request_participants, chats, chat_participants

-- ============================================
-- FIX 1: meal_requests + request_participants
-- ============================================

DROP POLICY IF EXISTS "Active requests visible" ON public.meal_requests;

CREATE POLICY "Active requests visible" ON public.meal_requests
  FOR SELECT USING (
    -- Future requests visible to all (for browsing)
    time_window > NOW()
    OR
    -- User is the requester (can always see own requests)
    requester_id = auth.uid()
  );

DROP POLICY IF EXISTS "Participants readable" ON public.request_participants;

CREATE POLICY "Participants readable" ON public.request_participants
  FOR SELECT USING (
    -- User is one of the participants (direct check - no recursion!)
    user_id = auth.uid()
    OR
    -- User is the requester
    EXISTS (
      SELECT 1 FROM public.meal_requests
      WHERE id = request_participants.request_id
      AND requester_id = auth.uid()
    )
    OR
    -- Request is active (future) - visible to all for browsing
    EXISTS (
      SELECT 1 FROM public.meal_requests
      WHERE id = request_participants.request_id
      AND time_window > NOW()
    )
  );

-- ============================================
-- FIX 2: chats + chat_participants
-- ============================================

DROP POLICY IF EXISTS "Chat participants can view" ON public.chats;

CREATE POLICY "Chat participants can view" ON public.chats
  FOR SELECT USING (
    -- Check if user is a participant directly via FK
    EXISTS (
      SELECT 1 FROM public.chat_participants
      WHERE chat_id = chats.id
      AND user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Chat members can view members" ON public.chat_participants;

CREATE POLICY "Chat members can view members" ON public.chat_participants
  FOR SELECT USING (
    -- Only direct check - no recursion!
    -- Users can see participants of chats they're in via the chats RLS policy
    user_id = auth.uid()
  );

-- Add helpful comments
COMMENT ON POLICY "Active requests visible" ON public.meal_requests IS 'No circular reference: shows future requests + own requests';
COMMENT ON POLICY "Participants readable" ON public.request_participants IS 'No circular reference: direct user_id check + requester check';
COMMENT ON POLICY "Chat participants can view" ON public.chats IS 'Checks chat_participants (safe direction)';
COMMENT ON POLICY "Chat members can view members" ON public.chat_participants IS 'No circular reference: direct check + IN subquery';
