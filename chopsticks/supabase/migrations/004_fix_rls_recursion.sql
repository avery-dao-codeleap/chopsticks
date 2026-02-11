-- Fix RLS Infinite Recursion (Complete Fix)
-- Date: 2026-02-11
-- Purpose: Fix circular dependency between meal_requests and request_participants RLS policies
-- Issue: Both policies reference each other, causing infinite recursion

-- ============================================
-- FIX: Break circular dependency
-- ============================================

-- STEP 1: Fix meal_requests policy - remove reference to request_participants
DROP POLICY IF EXISTS "Active requests visible" ON public.meal_requests;

CREATE POLICY "Active requests visible" ON public.meal_requests
  FOR SELECT USING (
    -- Future requests visible to all (for browsing)
    time_window > NOW()
    OR
    -- User is the requester (can always see own requests)
    requester_id = auth.uid()
  );

-- STEP 2: Fix request_participants policy - simplified without circular reference
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

-- Add comments
COMMENT ON POLICY "Active requests visible" ON public.meal_requests IS 'Shows future requests to all + past requests to requesters (no circular reference)';
COMMENT ON POLICY "Participants readable" ON public.request_participants IS 'Shows participants: own participation, requester view, or active requests';
