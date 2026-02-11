-- Add INSERT policies for chats and chat_participants
-- Date: 2026-02-11
-- Purpose: Allow trigger function to create chats and add participants

-- Allow service role (triggers) to insert chats
CREATE POLICY "Service can create chats" ON public.chats
  FOR INSERT WITH CHECK (TRUE);

-- Allow service role (triggers) to insert chat participants
CREATE POLICY "Service can add chat participants" ON public.chat_participants
  FOR INSERT WITH CHECK (TRUE);

-- Also allow request creators to manually create chats (fallback)
CREATE POLICY "Request creators can create chats" ON public.chats
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.meal_requests
      WHERE id = request_id AND requester_id = auth.uid()
    )
  );

-- Allow chat members and request participants to be added to chats
CREATE POLICY "Can add participants to chats" ON public.chat_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chats c
      JOIN public.meal_requests mr ON c.request_id = mr.id
      WHERE c.id = chat_id
      AND (mr.requester_id = auth.uid() OR user_id = auth.uid())
    )
  );
