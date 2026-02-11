-- Fix notification insert policy for trigger functions
-- Date: 2026-02-11
-- Purpose: Allow SECURITY DEFINER functions to insert notifications

-- Add INSERT policy for notifications (needed for trigger functions)
CREATE POLICY "Service can create notifications" ON public.notifications
  FOR INSERT
  WITH CHECK (true);

COMMENT ON POLICY "Service can create notifications" ON public.notifications
  IS 'Allows SECURITY DEFINER trigger functions to create notifications';
