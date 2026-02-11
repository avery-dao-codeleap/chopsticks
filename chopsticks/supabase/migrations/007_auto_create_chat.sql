-- Auto-create chat when participant joins
-- Date: 2026-02-11
-- Purpose: Automatically create a chat and add participants when someone joins a request

-- Function to create chat and add participants when first participant is approved/joins
CREATE OR REPLACE FUNCTION public.auto_create_chat_for_request()
RETURNS TRIGGER AS $$
DECLARE
  v_chat_id UUID;
  v_request_id UUID;
  v_requester_id UUID;
  v_restaurant_id UUID;
BEGIN
  -- Only proceed if status is 'joined' (approved or instant join)
  IF NEW.status != 'joined' THEN
    RETURN NEW;
  END IF;

  v_request_id := NEW.request_id;

  -- Get request details
  SELECT requester_id, restaurant_id INTO v_requester_id, v_restaurant_id
  FROM public.meal_requests
  WHERE id = v_request_id;

  -- Check if chat already exists for this request
  SELECT id INTO v_chat_id
  FROM public.chats
  WHERE request_id = v_request_id;

  -- If no chat exists, create one
  IF v_chat_id IS NULL THEN
    INSERT INTO public.chats (request_id, restaurant_id, created_at, updated_at)
    VALUES (v_request_id, v_restaurant_id, NOW(), NOW())
    RETURNING id INTO v_chat_id;

    -- Add the requester to the chat
    INSERT INTO public.chat_participants (chat_id, user_id, joined_at)
    VALUES (v_chat_id, v_requester_id, NOW())
    ON CONFLICT (chat_id, user_id) DO NOTHING;
  END IF;

  -- Add the new participant to the chat
  INSERT INTO public.chat_participants (chat_id, user_id, joined_at)
  VALUES (v_chat_id, NEW.user_id, NOW())
  ON CONFLICT (chat_id, user_id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on request_participants table
-- Trigger after INSERT (for new joins) and after UPDATE (when status changes to 'joined')
DROP TRIGGER IF EXISTS create_chat_on_participant_join ON public.request_participants;

CREATE TRIGGER create_chat_on_participant_join
  AFTER INSERT OR UPDATE OF status
  ON public.request_participants
  FOR EACH ROW
  WHEN (NEW.status = 'joined')
  EXECUTE FUNCTION public.auto_create_chat_for_request();

COMMENT ON FUNCTION public.auto_create_chat_for_request IS 'Automatically creates a chat and adds participants when someone joins a request';
COMMENT ON TRIGGER create_chat_on_participant_join ON public.request_participants IS 'Auto-creates chat when participant status becomes joined';
