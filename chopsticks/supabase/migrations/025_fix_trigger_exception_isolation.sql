-- Fix: isolate push notification errors from in-app notification inserts
-- Date: 2026-02-19
-- Problem: When send_push_notification() errors, the EXCEPTION block in the
--   trigger function rolls back ALL changes including the notification INSERT.
--   PostgreSQL's EXCEPTION handler creates a savepoint at BEGIN; any caught
--   exception rolls back to that savepoint.
-- Fix: Use nested BEGIN...EXCEPTION blocks so push errors don't affect inserts.

-- ============================================
-- 1. Fix notify_join_request
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

  -- Step 1: Create in-app notification (must survive even if push fails)
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

  -- Step 2: Try push notification in isolated block
  BEGIN
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
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'notify_join_request push error (non-fatal): % %', SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_join_request error: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- ============================================
-- 2. Fix notify_join_approved
-- ============================================
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

  -- Step 1: Create in-app notification
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

  -- Step 2: Try push in isolated block
  BEGIN
    PERFORM send_push_notification(
      NEW.user_id,
      v_title,
      v_body,
      jsonb_build_object(
        'type', 'join_approved',
        'requestId', NEW.request_id
      )
    );
  EXCEPTION
    WHEN OTHERS THEN
      RAISE WARNING 'notify_join_approved push error (non-fatal): % %', SQLERRM, SQLSTATE;
  END;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_join_approved error: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- ============================================
-- 3. Fix notify_new_message
-- ============================================
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
    -- Step 1: Create in-app notification
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

    -- Step 2: Try push in isolated block
    BEGIN
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
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'notify_new_message push error (non-fatal): % %', SQLERRM, SQLSTATE;
    END;
  END LOOP;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error in notify_new_message: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$;

-- ============================================
-- 4. Fix notify_request_canceled
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
    -- Step 1: In-app notification
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

    -- Step 2: Try push in isolated block
    BEGIN
      PERFORM send_push_notification(
        participant_record.user_id,
        'Meal Canceled',
        'The meal at ' || COALESCE(request_info.restaurant_name, 'the restaurant') || ' has been canceled',
        jsonb_build_object(
          'type', 'request_canceled',
          'request_id', OLD.id
        )
      );
    EXCEPTION
      WHEN OTHERS THEN
        RAISE WARNING 'notify_request_canceled push error (non-fatal): % %', SQLERRM, SQLSTATE;
    END;
  END LOOP;

  RETURN OLD;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'notify_request_canceled error: % %', SQLERRM, SQLSTATE;
    RETURN OLD;
END;
$$;
