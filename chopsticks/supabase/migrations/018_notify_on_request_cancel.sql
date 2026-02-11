-- Notify participants when a request is canceled
-- Date: 2026-02-11
-- Purpose: Send notifications to all participants when creator cancels a meal request

-- Create function to notify participants before request is deleted
CREATE OR REPLACE FUNCTION public.notify_request_canceled()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  participant_record RECORD;
  request_info RECORD;
BEGIN
  -- Get request details before deletion
  SELECT
    mr.id,
    r.name as restaurant_name,
    mr.time_window,
    mr.requester_id
  INTO request_info
  FROM meal_requests mr
  JOIN restaurants r ON r.id = mr.restaurant_id
  WHERE mr.id = OLD.id;

  -- Notify all participants (except the creator)
  FOR participant_record IN
    SELECT DISTINCT user_id
    FROM request_participants
    WHERE request_id = OLD.id
      AND status = 'joined'
      AND user_id != request_info.requester_id
  LOOP
    INSERT INTO notifications (
      user_id,
      type,
      title,
      message,
      data,
      created_at
    ) VALUES (
      participant_record.user_id,
      'request_canceled',
      'Meal Request Canceled',
      'The meal at ' || request_info.restaurant_name || ' has been canceled by the creator.',
      jsonb_build_object(
        'request_id', OLD.id,
        'restaurant_name', request_info.restaurant_name,
        'time_window', request_info.time_window
      ),
      NOW()
    );
  END LOOP;

  RETURN OLD;
END;
$$;

-- Create trigger that fires BEFORE delete (so we can still access participants)
DROP TRIGGER IF EXISTS on_request_canceled ON public.meal_requests;

CREATE TRIGGER on_request_canceled
  BEFORE DELETE ON public.meal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_request_canceled();

COMMENT ON FUNCTION public.notify_request_canceled()
  IS 'Notifies all participants when a meal request is canceled by the creator';

COMMENT ON TRIGGER on_request_canceled ON public.meal_requests
  IS 'Fires before request deletion to notify participants';
