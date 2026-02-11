-- Backfill missing chats for requests with joined participants
-- Date: 2026-02-11
-- Purpose: Create chats retroactively for requests that had joins before the trigger was added

-- Add unique constraint on request_id to ensure one chat per request
ALTER TABLE public.chats
ADD CONSTRAINT chats_request_id_unique UNIQUE (request_id);

-- Create chats for all requests that have joined participants but no chat
INSERT INTO public.chats (request_id, created_at)
SELECT DISTINCT
  rp.request_id,
  MIN(rp.joined_at) as created_at  -- Use earliest join time as chat creation time
FROM public.request_participants rp
WHERE rp.status = 'joined'
  AND NOT EXISTS (
    SELECT 1 FROM public.chats c WHERE c.request_id = rp.request_id
  )
GROUP BY rp.request_id;

-- Add all joined participants to their chats (including requesters)
WITH requests_with_new_chats AS (
  SELECT DISTINCT
    c.id as chat_id,
    c.request_id,
    mr.requester_id
  FROM public.chats c
  JOIN public.meal_requests mr ON mr.id = c.request_id
  LEFT JOIN public.chat_participants cp ON cp.chat_id = c.id
  WHERE cp.chat_id IS NULL  -- Chat has no participants yet
),
all_participants AS (
  -- Get the requester
  SELECT
    rwc.chat_id,
    rwc.requester_id as user_id,
    c.created_at as joined_at
  FROM requests_with_new_chats rwc
  JOIN public.chats c ON c.id = rwc.chat_id

  UNION

  -- Get all joined participants (not the requester)
  SELECT
    rwc.chat_id,
    rp.user_id,
    rp.joined_at
  FROM requests_with_new_chats rwc
  JOIN public.request_participants rp ON rp.request_id = rwc.request_id
  WHERE rp.status = 'joined'
    AND rp.user_id != rwc.requester_id
)
INSERT INTO public.chat_participants (chat_id, user_id, joined_at)
SELECT
  chat_id,
  user_id,
  joined_at
FROM all_participants
ON CONFLICT (chat_id, user_id) DO NOTHING;

-- Add comment
COMMENT ON TABLE public.chats IS 'Chats for meal requests (auto-created when first participant joins)';
