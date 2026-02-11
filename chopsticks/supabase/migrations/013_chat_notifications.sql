-- Create notifications when new chat messages are sent
-- Date: 2026-02-11
-- Purpose: Notify other participants when someone sends a message

CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_sender_name TEXT;
  v_message_preview TEXT;
  v_participant RECORD;
BEGIN
  -- Get sender's name
  SELECT name INTO v_sender_name
  FROM public.users
  WHERE id = NEW.sender_id;

  -- Create message preview (first 50 chars)
  IF NEW.image_url IS NOT NULL THEN
    v_message_preview := '📷 Sent an image';
  ELSE
    v_message_preview := LEFT(NEW.content, 50);
    IF LENGTH(NEW.content) > 50 THEN
      v_message_preview := v_message_preview || '...';
    END IF;
  END IF;

  -- Notify all other participants in the chat
  FOR v_participant IN
    SELECT user_id
    FROM public.chat_participants
    WHERE chat_id = NEW.chat_id
      AND user_id != NEW.sender_id  -- Don't notify the sender
  LOOP
    INSERT INTO public.notifications (user_id, type, title, body, data, read)
    VALUES (
      v_participant.user_id,
      'new_message',
      v_sender_name || ' sent a message',
      v_message_preview,
      jsonb_build_object(
        'chatId', NEW.chat_id,
        'messageId', NEW.id,
        'senderId', NEW.sender_id
      ),
      false
    );
  END LOOP;

  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the message insert
    RAISE WARNING 'Error in notify_new_message: % %', SQLERRM, SQLSTATE;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
DROP TRIGGER IF EXISTS notify_new_message_trigger ON public.messages;

CREATE TRIGGER notify_new_message_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();

-- Add comment
COMMENT ON FUNCTION public.notify_new_message IS 'Creates notifications for chat participants when a new message is sent';
COMMENT ON TRIGGER notify_new_message_trigger ON public.messages IS 'Notifies other participants about new messages';
