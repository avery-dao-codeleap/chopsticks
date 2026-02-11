-- Fix enforce_group_capacity trigger
-- Date: 2026-02-11
-- Purpose: Remove FOR UPDATE clause that conflicts with GROUP BY
-- Issue: PostgreSQL doesn't allow FOR UPDATE with GROUP BY

-- Drop and recreate the trigger function without FOR UPDATE
CREATE OR REPLACE FUNCTION public.enforce_group_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_size INTEGER;
BEGIN
  -- Get current participant count and max group size
  -- Removed FOR UPDATE since it conflicts with GROUP BY
  SELECT COUNT(*), mr.group_size INTO current_count, max_size
  FROM public.request_participants rp
  JOIN public.meal_requests mr ON mr.id = rp.request_id
  WHERE rp.request_id = NEW.request_id AND rp.status = 'joined'
  GROUP BY mr.group_size;

  -- If no rows found, set count to 0 and fetch max_size separately
  IF current_count IS NULL THEN
    current_count := 0;
    SELECT group_size INTO max_size
    FROM public.meal_requests
    WHERE id = NEW.request_id;
  END IF;

  -- Check if adding this participant would exceed capacity
  -- Use >= because current_count doesn't include the new participant yet
  IF current_count >= max_size THEN
    RAISE EXCEPTION 'Request is at full capacity';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Note: Trigger already exists, no need to recreate it
-- It will automatically use the updated function

COMMENT ON FUNCTION public.enforce_group_capacity IS 'Enforces group size capacity limit without FOR UPDATE lock';
