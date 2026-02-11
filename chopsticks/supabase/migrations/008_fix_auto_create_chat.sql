-- Fix auto-create chat function (remove non-existent columns)
-- Date: 2026-02-11
-- Purpose: Fix the auto_create_chat_for_request function to match actual chats table schema

CREATE OR REPLACE FUNCTION public.auto_create_chat_for_request()
RETURNS TRIGGER AS $$
DECLARE
  v_chat_id UUID;
  v_request_id UUID;
  v_requester_id UUID;
BEGIN
  -- Only proceed if status is 'joined' (approved or instant join)
  IF NEW.status != 'joined' THEN
    RETURN NEW;
  END IF;

  v_request_id := NEW.request_id;

  -- Get requester ID
  SELECT requester_id INTO v_requester_id
  FROM public.meal_requests
  WHERE id = v_request_id;

  -- Check if chat already exists for this request
  SELECT id INTO v_chat_id
  FROM public.chats
  WHERE request_id = v_request_id;

  -- If no chat exists, create one
  IF v_chat_id IS NULL THEN
    INSERT INTO public.chats (request_id)
    VALUES (v_request_id)
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

COMMENT ON FUNCTION public.auto_create_chat_for_request IS 'Automatically creates a chat and adds participants when someone joins a request (fixed schema)';
