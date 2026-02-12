-- Add meal completion tracking
-- Date: 2026-02-12
-- Purpose: Track when meals are marked as completed by creator

-- Add meal_completed_at column to meal_requests
ALTER TABLE public.meal_requests
ADD COLUMN meal_completed_at TIMESTAMPTZ;

-- Add index for efficient querying of completed meals
CREATE INDEX idx_meal_requests_completed_at
ON public.meal_requests(meal_completed_at)
WHERE meal_completed_at IS NOT NULL;

-- Add index for time_window queries (for archive status)
CREATE INDEX idx_meal_requests_time_window
ON public.meal_requests(time_window);

COMMENT ON COLUMN public.meal_requests.meal_completed_at
IS 'Timestamp when creator marked the meal as completed';
