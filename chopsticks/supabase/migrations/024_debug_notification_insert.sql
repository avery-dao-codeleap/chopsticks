-- Debug: manually insert a test notification to verify the trigger pipeline works
-- This runs as the migration role (postgres), same as SECURITY DEFINER functions

INSERT INTO public.notifications (user_id, type, title, body, data, read)
VALUES (
  '5a5dd2ea-0d62-49b6-8a97-3171be1fc5f5',
  'join_request',
  'DEBUG: Test notification',
  'If you see this, notification inserts work from DB triggers',
  '{"type": "join_request", "requestId": "31ba19fd-415f-40c9-a78e-c3df3bf6a014"}'::jsonb,
  false
);
