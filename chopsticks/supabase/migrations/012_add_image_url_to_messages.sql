-- Add image_url column to messages table
-- Date: 2026-02-11
-- Purpose: Support image messages in chat

ALTER TABLE public.messages
ADD COLUMN image_url TEXT;

COMMENT ON COLUMN public.messages.image_url IS 'URL of image if this is an image message';
