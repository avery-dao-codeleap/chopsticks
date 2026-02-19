-- Push notification support
-- Date: 2026-02-19
-- Purpose: Enable actual push notification delivery via Expo Push API
--   1. Fix notification type constraint to include request_canceled
--   2. Enable pg_net extension for async HTTP calls from triggers
--   3. Create helper function to send push via Edge Function
--   4. Create trigger for join_request notifications (participant INSERT with status=pending)
--   5. Create trigger for join_approved notifications (participant UPDATE to status=joined)
--   6. Update notify_new_message to also send push notifications

-- ============================================
-- 1. Fix notification type constraint
-- ============================================
ALTER TABLE public.notifications
  DROP CONSTRAINT IF EXISTS notifications_type_check;

ALTER TABLE public.notifications
  ADD CONSTRAINT notifications_type_check
  CHECK (type IN ('join_request', 'join_approved', 'new_message', 'request_canceled'));

-- ============================================
-- 2. Enable pg_net for async HTTP from triggers
-- ============================================
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- ============================================
-- 3. Helper: send push notification via Edge Function
-- ============================================
CREATE OR REPLACE FUNCTION public.send_push_notification(
  p_user_id UUID,
  p_title TEXT,
  p_body TEXT,
  p_data JSONB DEFAULT '{}'::JSONB
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_token TEXT;
  v_supabase_url TEXT;
  v_service_key TEXT;
BEGIN
  -- Get user's push token directly (skip users without tokens)
  SELECT expo_push_token INTO v_token
  FROM public.users
  WHERE id = p_user_id;

  IF v_token IS NULL THEN
    RETURN;
  END IF;

  -- Send directly to Expo Push API via pg_net (non-blocking)
  PERFORM extensions.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    body := jsonb_build_object(
      'to', v_token,
      'sound', 'default',
      'title', p_title,
      'body', p_body,
      'data', p_data
    )::TEXT,
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Accept', 'application/json'
    )
  );
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'send_push_notification error: % %', SQLERRM, SQLSTATE;
END;
$$;

COMMENT ON FUNCTION public.send_push_notification IS 'Sends push notification to a user via Expo Push API using pg_net';

-- ============================================
-- 4. Notify host when someone requests to join
-- ============================================
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
BEGIN
  -- Only fire for new pending participants
  IF NEW.status != 'pending' THEN
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

  -- Create in-app notification
  INSERT INTO notifications (user_id, type, title, body, data, read)
  VALUES (
    v_requester_id,
    'join_request',
    COALESCE(v_joiner_name, 'Someone') || ' wants to join',
    'New join request for ' || COALESCE(v_restaurant_name, 'your meal'),
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
    COALESCE(v_joiner_name, 'Someone') || ' wants to join',
    'New join request for ' || COALESCE(v_restaurant_name, 'your meal'),
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

DROP TRIGGER IF EXISTS on_join_request ON public.request_participants;

CREATE TRIGGER on_join_request
  AFTER INSERT ON public.request_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_join_request();

COMMENT ON FUNCTION public.notify_join_request IS 'Notifies host when someone requests to join their meal';
COMMENT ON TRIGGER on_join_request ON public.request_participants IS 'Fires after a new participant record is created';

-- ============================================
-- 5. Notify joiner when approved
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_join_approved()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_restaurant_name TEXT;
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

  -- Create in-app notification
  INSERT INTO notifications (user_id, type, title, body, data, read)
  VALUES (
    NEW.user_id,
    'join_approved',
    'You''re in!',
    'Your request to join at ' || COALESCE(v_restaurant_name, 'the meal') || ' was approved',
    jsonb_build_object(
      'type', 'join_approved',
      'requestId', NEW.request_id
    ),
    false
  );

  -- Send push notification
  PERFORM send_push_notification(
    NEW.user_id,
    'You''re in!',
    'Your request to join at ' || COALESCE(v_restaurant_name, 'the meal') || ' was approved',
    jsonb_build_object(
      'type', 'join_approved',
      'requestId', NEW.request_id
    )
  );

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_join_approved error: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_join_approved ON public.request_participants;

CREATE TRIGGER on_join_approved
  AFTER UPDATE ON public.request_participants
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_join_approved();

COMMENT ON FUNCTION public.notify_join_approved IS 'Notifies user when their join request is approved';
COMMENT ON TRIGGER on_join_approved ON public.request_participants IS 'Fires after participant status is updated';

-- ============================================
-- 6. Update notify_new_message to also send push
-- ============================================
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
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
    -- Create in-app notification
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

    -- Send push notification
    PERFORM send_push_notification(
      v_participant.user_id,
      COALESCE(v_sender_name, 'Someone'),
      v_message_preview,
      jsonb_build_object(
        'chatId', NEW.chat_id,
        'messageId', NEW.id,
        'senderId', NEW.sender_id,
        'requestId', v_request_id
      )
    );
  END LOOP;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in notify_new_message: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create trigger (function was replaced above)
DROP TRIGGER IF EXISTS notify_new_message_trigger ON public.messages;

CREATE TRIGGER notify_new_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

-- ============================================
-- 7. Update notify_request_canceled to also send push
-- ============================================
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

    -- Send push notification
    PERFORM send_push_notification(
      participant_record.user_id,
      'Meal Canceled',
      'The meal at ' || COALESCE(request_info.restaurant_name, 'the restaurant') || ' has been canceled',
      jsonb_build_object(
        'type', 'request_canceled',
        'request_id', OLD.id
      )
    );
  END LOOP;

  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_request_canceled error: % %', SQLERRM, SQLSTATE;
    RETURN OLD;
END;
$$;

-- Re-create trigger
DROP TRIGGER IF EXISTS on_request_canceled ON public.meal_requests;

CREATE TRIGGER on_request_canceled
  BEFORE DELETE ON public.meal_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_request_canceled();
