-- Fix push notification helper function
-- Date: 2026-02-19
-- Purpose: Fix pg_net schema (net, not extensions) and body type (jsonb, not text)

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
BEGIN
  -- Get user's push token directly (skip users without tokens)
  SELECT expo_push_token INTO v_token
  FROM public.users
  WHERE id = p_user_id;

  IF v_token IS NULL THEN
    RETURN;
  END IF;

  -- Send directly to Expo Push API via pg_net (non-blocking)
  -- pg_net functions live in the "net" schema on Supabase Cloud
  PERFORM net.http_post(
    url := 'https://exp.host/--/api/v2/push/send',
    body := jsonb_build_object(
      'to', v_token,
      'sound', 'default',
      'title', p_title,
      'body', p_body,
      'data', p_data
    ),
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
