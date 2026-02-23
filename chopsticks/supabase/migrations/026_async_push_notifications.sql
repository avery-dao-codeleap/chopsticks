-- Make notifications instant by moving push to async Edge Function
-- Date: 2026-02-19
-- Problem: send_push_notification() blocks triggers for 5+ seconds
-- Solution: Remove push calls from triggers, create separate async trigger on notifications table

-- ============================================
-- 1. Remove push calls from notification triggers
-- ============================================

-- notify_join_request: Remove push, keep in-app notification only
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
  IF v_requester_id IS NULL OR v_requester_id = NEW.user_id THEN
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

  -- Create in-app notification only (push handled by separate trigger)
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

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_join_request error: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- notify_join_approved: Remove push, keep in-app notification only
CREATE OR REPLACE FUNCTION public.notify_join_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_restaurant_name TEXT;
  v_title TEXT;
  v_body TEXT;
BEGIN
  -- Only fire when status changes to 'joined'
  IF OLD.status = NEW.status OR NEW.status != 'joined' THEN
    RETURN NEW;
  END IF;

  -- Get restaurant name
  SELECT r.name INTO v_restaurant_name
  FROM meal_requests mr
  JOIN restaurants r ON r.id = mr.restaurant_id
  WHERE mr.id = NEW.request_id;

  v_title := 'You''re in!';
  v_body := 'Your request to join at ' || COALESCE(v_restaurant_name, 'the meal') || ' was approved';

  -- Create in-app notification only
  INSERT INTO notifications (user_id, type, title, body, data, read)
  VALUES (
    NEW.user_id,
    'join_approved',
    v_title,
    v_body,
    jsonb_build_object(
      'type', 'join_approved',
      'requestId', NEW.request_id
    ),
    false
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_join_approved error: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- notify_new_message: Remove push, keep in-app notification only
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_sender_name TEXT;
  v_message_preview TEXT;
  v_participant RECORD;
  v_request_id UUID;
BEGIN
  -- Get sender's name
  SELECT name INTO v_sender_name
  FROM public.users
  WHERE id = NEW.sender_id;

  -- Create message preview (first 50 chars)
  IF NEW.image_url IS NOT NULL THEN
    v_message_preview := 'Sent an image';
  ELSE
    v_message_preview := LEFT(NEW.content, 50);
    IF LENGTH(NEW.content) > 50 THEN
      v_message_preview := v_message_preview || '...';
    END IF;
  END IF;

  -- Get the request_id from the chat for deep linking
  SELECT request_id INTO v_request_id
  FROM public.chats
  WHERE id = NEW.chat_id;

  -- Notify all other participants in the chat
  FOR v_participant IN
    SELECT user_id
    FROM public.chat_participants
    WHERE chat_id = NEW.chat_id
      AND user_id != NEW.sender_id
  LOOP
    -- Create in-app notification only
    INSERT INTO public.notifications (user_id, type, title, body, data, read)
    VALUES (
      v_participant.user_id,
      'new_message',
      COALESCE(v_sender_name, 'Someone') || ' sent a message',
      v_message_preview,
      jsonb_build_object(
        'chatId', NEW.chat_id,
        'messageId', NEW.id,
        'senderId', NEW.sender_id,
        'requestId', v_request_id
      ),
      false
    );
  END LOOP;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in notify_new_message: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- notify_request_canceled: Remove push, keep in-app notification only
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
    -- Create in-app notification only
    INSERT INTO notifications (user_id, type, title, body, data, read)
    VALUES (
      participant_record.user_id,
      'request_canceled',
      'Meal Canceled',
      'The meal at ' || COALESCE(request_info.restaurant_name, 'the restaurant') || ' has been canceled',
      jsonb_build_object(
        'type', 'request_canceled',
        'request_id', OLD.id,
        'restaurant_name', request_info.restaurant_name,
        'time_window', request_info.time_window
      ),
      false
    );
  END LOOP;

  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_request_canceled error: % %', SQLERRM, SQLSTATE;
    RETURN OLD;
END;
$$;

-- ============================================
-- 2. Create async push notification handler
-- ============================================

-- This trigger fires AFTER a notification is inserted
-- It asynchronously calls send_push_notification (which won't block the INSERT)
CREATE OR REPLACE FUNCTION public.send_push_notification_async()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token TEXT;
BEGIN
  -- Get user's push token
  SELECT expo_push_token INTO v_token
  FROM public.users
  WHERE id = NEW.user_id;

  -- Skip if no token
  IF v_token IS NULL THEN
    RETURN NEW;
  END IF;

  -- Send push notification asynchronously via pg_net (fire-and-forget)
  -- This won't block the notification INSERT
  BEGIN
    PERFORM net.http_post(
      url := 'https://exp.host/--/api/v2/push/send',
      body := jsonb_build_object(
        'to', v_token,
        'sound', 'default',
        'title', NEW.title,
        'body', NEW.body,
        'data', NEW.data
      ),
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Accept', 'application/json'
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- Log but don't fail (push is optional)
      RAISE WARNING 'send_push_notification_async error: % %', SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
END;
$$;

-- Create trigger on notifications table (fires AFTER INSERT, async)
DROP TRIGGER IF EXISTS on_notification_send_push ON public.notifications;

CREATE TRIGGER on_notification_send_push
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_push_notification_async();

COMMENT ON FUNCTION public.send_push_notification_async IS 'Sends push notification asynchronously after notification is created (does not block INSERT)';
COMMENT ON TRIGGER on_notification_send_push ON public.notifications IS 'Fires after notification INSERT to send push asynchronously';
