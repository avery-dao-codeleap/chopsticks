-- Enable CASCADE DELETE for meal requests
-- Date: 2026-02-11
-- Purpose: Allow creators to cancel their requests without foreign key constraint errors

-- Drop existing foreign key constraints
ALTER TABLE public.chats
  DROP CONSTRAINT IF EXISTS chats_request_id_fkey;

ALTER TABLE public.person_ratings
  DROP CONSTRAINT IF EXISTS person_ratings_request_id_fkey;

-- Re-add with CASCADE DELETE
ALTER TABLE public.chats
  ADD CONSTRAINT chats_request_id_fkey
  FOREIGN KEY (request_id)
  REFERENCES public.meal_requests(id)
  ON DELETE CASCADE;

ALTER TABLE public.person_ratings
  ADD CONSTRAINT person_ratings_request_id_fkey
  FOREIGN KEY (request_id)
  REFERENCES public.meal_requests(id)
  ON DELETE CASCADE;

COMMENT ON CONSTRAINT chats_request_id_fkey ON public.chats
  IS 'Cascade delete chats when meal request is deleted';

COMMENT ON CONSTRAINT person_ratings_request_id_fkey ON public.person_ratings
  IS 'Cascade delete ratings when meal request is deleted';
