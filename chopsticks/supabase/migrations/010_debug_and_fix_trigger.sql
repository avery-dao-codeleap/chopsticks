-- Debug and fix the auto_create_chat trigger
-- Date: 2026-02-11
-- Purpose: Add error handling and verify trigger works

-- First, let's check if the function exists (this will error if it doesn't)
-- and recreate it with better error handling
CREATE OR REPLACE FUNCTION public.auto_create_chat_for_request()
RETURNS TRIGGER AS $$
DECLARE
  v_chat_id UUID;
  v_request_id UUID;
  v_requester_id UUID;
BEGIN
  -- Log that trigger fired (for debugging)
  RAISE NOTICE 'Trigger fired for user % on request %', NEW.user_id, NEW.request_id;

  -- Only proceed if status is 'joined' (approved or instant join)
  IF NEW.status != 'joined' THEN
    RAISE NOTICE 'Status is %, not joined. Skipping.', NEW.status;
    RETURN NEW;
  END IF;

  v_request_id := NEW.request_id;

  -- Get requester ID
  SELECT requester_id INTO v_requester_id
  FROM public.meal_requests
  WHERE id = v_request_id;

  IF v_requester_id IS NULL THEN
    RAISE WARNING 'Could not find requester for request %', v_request_id;
    RETURN NEW;
  END IF;

  RAISE NOTICE 'Found requester: %', v_requester_id;

  -- Check if chat already exists for this request
  SELECT id INTO v_chat_id
  FROM public.chats
  WHERE request_id = v_request_id;

  -- If no chat exists, create one
  IF v_chat_id IS NULL THEN
    RAISE NOTICE 'Creating new chat for request %', v_request_id;

    INSERT INTO public.chats (request_id)
    VALUES (v_request_id)
    RETURNING id INTO v_chat_id;

    RAISE NOTICE 'Created chat %', v_chat_id;

    -- Add the requester to the chat
    INSERT INTO public.chat_participants (chat_id, user_id, joined_at)
    VALUES (v_chat_id, v_requester_id, NOW())
    ON CONFLICT (chat_id, user_id) DO NOTHING;

    RAISE NOTICE 'Added requester to chat';
  ELSE
    RAISE NOTICE 'Chat already exists: %', v_chat_id;
  END IF;

  -- Add the new participant to the chat
  INSERT INTO public.chat_participants (chat_id, user_id, joined_at)
  VALUES (v_chat_id, NEW.user_id, NOW())
  ON CONFLICT (chat_id, user_id) DO NOTHING;

  RAISE NOTICE 'Added participant % to chat', NEW.user_id;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the insert/update
    RAISE WARNING 'Error in auto_create_chat_for_request: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
DROP TRIGGER IF EXISTS create_chat_on_participant_join ON public.request_participants;

CREATE TRIGGER create_chat_on_participant_join
  AFTER INSERT OR UPDATE OF status
  ON public.request_participants
  FOR EACH ROW
  WHEN (NEW.status = 'joined')
  EXECUTE FUNCTION public.auto_create_chat_for_request();

-- Add comments
COMMENT ON FUNCTION public.auto_create_chat_for_request IS 'Automatically creates a chat and adds participants when someone joins a request (with debug logging)';
COMMENT ON TRIGGER create_chat_on_participant_join ON public.request_participants IS 'Auto-creates chat when participant status becomes joined';
