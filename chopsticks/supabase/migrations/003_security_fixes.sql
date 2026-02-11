-- Security Fixes Migration
-- Date: 2026-02-11
-- Purpose: Fix phone number exposure and rating feature RLS policy
-- Related: SECURITY_AUDIT.md Critical Issues #1 and #2

-- ============================================
-- FIX 1: Phone Number Privacy
-- ============================================

-- Issue: Phone numbers are publicly visible in user profiles
-- Impact: Privacy violation - PII exposure
-- Solution: Create public_profiles view excluding sensitive fields

-- Create public profiles view (excludes phone, firebase_uid, expo_push_token)
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT
  id,
  name,
  age,
  gender,
  photo_url,
  persona,
  city,
  bio,
  meal_count,
  language,
  last_active_at,
  created_at
FROM public.users
WHERE deleted_at IS NULL AND banned_at IS NULL;

-- Grant SELECT on view to authenticated users
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Note: Keep existing RLS policy on users table for authenticated access to own profile
-- The "Own profile editable" policy still allows users to read their full profile

-- ============================================
-- FIX 2: Rating Feature RLS Policy
-- ============================================

-- Issue: Cannot read past requests, blocks rating functionality
-- Impact: Users cannot rate participants after meal completes
-- Solution: Allow users to see past requests they participated in

-- Drop existing policy
DROP POLICY IF EXISTS "Active requests visible" ON public.meal_requests;

-- Create new policy that allows:
-- 1. All users to see future requests (browse)
-- 2. Participants to see past requests they joined (for rating)
CREATE POLICY "Active requests visible" ON public.meal_requests
  FOR SELECT USING (
    -- Future requests visible to all
    time_window > NOW()
    OR
    -- Past requests visible to participants (for post-meal rating)
    EXISTS (
      SELECT 1 FROM public.request_participants
      WHERE request_id = meal_requests.id
      AND user_id = auth.uid()
    )
  );

-- Also update request_participants policy to allow reading past participants
DROP POLICY IF EXISTS "Participants readable" ON public.request_participants;

CREATE POLICY "Participants readable" ON public.request_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_requests
      WHERE id = request_participants.request_id
      AND (
        -- Requester can always see participants
        requester_id = auth.uid()
        OR
        -- Active requests visible to all
        time_window > NOW()
        OR
        -- Past requests visible if user is a participant (for rating)
        EXISTS (
          SELECT 1 FROM public.request_participants rp
          WHERE rp.request_id = request_participants.request_id
          AND rp.user_id = auth.uid()
        )
      )
    )
  );

-- ============================================
-- BONUS FIX: Add Input Validation
-- ============================================

-- Add phone number format validation (E.164 international format)
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS valid_phone_format;

ALTER TABLE public.users
  ADD CONSTRAINT valid_phone_format
  CHECK (phone ~ '^\+[1-9]\d{1,14}$');

-- Add basic URL validation for photo_url
ALTER TABLE public.users
  DROP CONSTRAINT IF EXISTS valid_photo_url;

ALTER TABLE public.users
  ADD CONSTRAINT valid_photo_url
  CHECK (photo_url IS NULL OR photo_url ~ '^https?://');

-- Add comment for documentation
COMMENT ON VIEW public.public_profiles IS 'Public user profiles excluding sensitive PII (phone, firebase_uid, push tokens)';
COMMENT ON POLICY "Active requests visible" ON public.meal_requests IS 'Allows browsing future requests + viewing past requests for rating';
COMMENT ON POLICY "Participants readable" ON public.request_participants IS 'Allows viewing participants for active requests + past requests for rating';
