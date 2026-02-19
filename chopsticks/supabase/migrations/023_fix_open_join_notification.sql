-- Fix: notify host for both open and approval-required joins
-- Date: 2026-02-19
-- Problem: notify_join_request only fired for status='pending', missing open joins (status='joined')

CREATE OR REPLACE FUNCTION public.notify_join_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_requester_id UUID;
  v_joiner_name TEXT;
  v_restaurant_name TEXT;
  v_request_id UUID;
  v_title TEXT;
  v_body TEXT;
BEGIN
  -- Only fire for pending or joined (skip 'rejected', 'cancelled', etc.)
  IF NEW.status NOT IN ('pending', 'joined') THEN
    RETURN NEW;
  END IF;

  v_request_id := NEW.request_id;

  -- Get meal request info
  SELECT mr.requester_id, r.name
  INTO v_requester_id, v_restaurant_name
  FROM meal_requests mr
  JOIN restaurants r ON r.id = mr.restaurant_id
  WHERE mr.id = v_request_id;

  -- Don't notify yourself
  IF v_requester_id = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get joiner's name
  SELECT name INTO v_joiner_name
  FROM users WHERE id = NEW.user_id;

  -- Different message for pending vs open join
  IF NEW.status = 'pending' THEN
    v_title := COALESCE(v_joiner_name, 'Someone') || ' wants to join';
    v_body := 'New join request for ' || COALESCE(v_restaurant_name, 'your meal');
  ELSE
    v_title := COALESCE(v_joiner_name, 'Someone') || ' joined your meal';
    v_body := COALESCE(v_joiner_name, 'Someone') || ' joined at ' || COALESCE(v_restaurant_name, 'your meal');
  END IF;

  -- Create in-app notification
  INSERT INTO notifications (user_id, type, title, body, data, read)
  VALUES (
    v_requester_id,
    'join_request',
    v_title,
    v_body,
    jsonb_build_object(
      'type', 'join_request',
      'requestId', v_request_id,
      'userId', NEW.user_id
    ),
    false
  );

  -- Send push notification
  PERFORM send_push_notification(
    v_requester_id,
    v_title,
    v_body,
    jsonb_build_object(
      'type', 'join_request',
      'requestId', v_request_id,
      'userId', NEW.user_id
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_join_request error: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;
