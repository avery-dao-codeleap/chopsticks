-- Chopsticks Database Schema (MVP - Matches data-model.md v3.0)
-- Date: 2026-02-02

-- Enable PostGIS for location queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  firebase_uid TEXT UNIQUE NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  name TEXT CHECK (char_length(name) BETWEEN 1 AND 50),
  age INTEGER CHECK (age >= 18 AND age <= 100),
  gender TEXT CHECK (gender IN ('male', 'female', 'non-binary', 'prefer_not_to_say')),
  photo_url TEXT,
  persona TEXT CHECK (persona IN ('local', 'new_to_city', 'expat', 'traveler', 'student')),
  city TEXT DEFAULT 'hcmc' CHECK (city = 'hcmc'),
  bio TEXT CHECK (char_length(bio) <= 200),
  meal_count INTEGER DEFAULT 0,
  language TEXT DEFAULT 'vi' CHECK (language IN ('vi', 'en')),
  expo_push_token TEXT,
  last_active_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ,
  banned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_city ON public.users(city) WHERE deleted_at IS NULL AND banned_at IS NULL;
CREATE INDEX idx_users_firebase_uid ON public.users(firebase_uid);
CREATE INDEX idx_users_last_active ON public.users(last_active_at) WHERE deleted_at IS NULL;

-- ============================================
-- USER PREFERENCES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_preferences (
  user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
  cuisines TEXT[] NOT NULL CHECK (array_length(cuisines, 1) >= 1),
  budget_ranges TEXT[] NOT NULL CHECK (array_length(budget_ranges, 1) >= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- RESTAURANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  district TEXT NOT NULL,
  city TEXT DEFAULT 'hcmc' CHECK (city = 'hcmc'),
  cuisine_type TEXT NOT NULL,
  location GEOGRAPHY(POINT),
  source TEXT NOT NULL CHECK (source IN ('curated', 'user_added')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_restaurants_city ON public.restaurants(city);
CREATE INDEX idx_restaurants_district ON public.restaurants(district);

-- ============================================
-- MEAL REQUESTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.meal_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES public.restaurants(id),
  cuisine TEXT NOT NULL,
  budget_range TEXT NOT NULL CHECK (budget_range IN ('under_50k', '50k_150k', '150k_500k', '500k_plus')),
  time_window TIMESTAMPTZ NOT NULL,
  group_size INTEGER NOT NULL CHECK (group_size BETWEEN 2 AND 4),
  join_type TEXT NOT NULL CHECK (join_type IN ('open', 'approval')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_requests_time_window ON public.meal_requests(time_window);
CREATE INDEX idx_requests_requester ON public.meal_requests(requester_id);
CREATE INDEX idx_requests_restaurant ON public.meal_requests(restaurant_id);

-- ============================================
-- REQUEST PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.request_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.meal_requests(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'joined', 'rejected')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (request_id, user_id)
);

CREATE INDEX idx_request_participants_request ON public.request_participants(request_id);
CREATE INDEX idx_request_participants_user ON public.request_participants(user_id);

-- ============================================
-- CHATS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.meal_requests(id),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- CHAT PARTICIPANTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.chat_participants (
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (chat_id, user_id)
);

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) BETWEEN 1 AND 2000),
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_chat_created ON public.messages(chat_id, created_at DESC);

-- ============================================
-- PERSON RATINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.person_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rater_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rated_id UUID NOT NULL REFERENCES public.users(id),
  request_id UUID NOT NULL REFERENCES public.meal_requests(id),
  showed_up BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (rater_id, rated_id, request_id),
  CHECK (rater_id != rated_id)
);

-- ============================================
-- REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID NOT NULL REFERENCES public.users(id),
  reported_id UUID NOT NULL REFERENCES public.users(id),
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('join_request', 'join_approved', 'new_message')),
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user_unread ON public.notifications(user_id, created_at DESC) WHERE read = FALSE;

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.request_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.person_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Public profiles readable" ON public.users
  FOR SELECT USING (deleted_at IS NULL AND banned_at IS NULL);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Own profile editable" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- User preferences policies
CREATE POLICY "Own preferences only" ON public.user_preferences
  FOR ALL USING (user_id = auth.uid());

-- Restaurants policies
CREATE POLICY "Restaurants viewable by all" ON public.restaurants
  FOR SELECT USING (TRUE);

CREATE POLICY "Authenticated users can add restaurants" ON public.restaurants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Meal requests policies
CREATE POLICY "Active requests visible" ON public.meal_requests
  FOR SELECT USING (time_window > NOW());

CREATE POLICY "Users can create requests" ON public.meal_requests
  FOR INSERT WITH CHECK (auth.uid() = requester_id);

CREATE POLICY "Creator can modify" ON public.meal_requests
  FOR UPDATE USING (requester_id = auth.uid());

CREATE POLICY "Creator can cancel" ON public.meal_requests
  FOR DELETE USING (requester_id = auth.uid());

-- Request participants policies
CREATE POLICY "Participants readable" ON public.request_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.meal_requests
      WHERE id = request_participants.request_id
      AND (requester_id = auth.uid() OR time_window > NOW())
    )
  );

CREATE POLICY "Users can join requests" ON public.request_participants
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Creator can update participant status" ON public.request_participants
  FOR UPDATE USING (
    EXISTS (SELECT 1 FROM public.meal_requests WHERE id = request_id AND requester_id = auth.uid())
  );

-- Chats policies
CREATE POLICY "Chat participants can view" ON public.chats
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_participants WHERE chat_id = id AND user_id = auth.uid())
  );

-- Chat participants policies
CREATE POLICY "Chat members can view members" ON public.chat_participants
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_participants cp WHERE cp.chat_id = chat_id AND cp.user_id = auth.uid())
  );

-- Messages policies
CREATE POLICY "Chat members can view messages" ON public.messages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.chat_participants WHERE chat_id = messages.chat_id AND user_id = auth.uid())
  );

CREATE POLICY "Chat members can send messages" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (SELECT 1 FROM public.chat_participants WHERE chat_id = messages.chat_id AND user_id = auth.uid())
  );

-- Person ratings policies
CREATE POLICY "Users can view ratings they gave or received" ON public.person_ratings
  FOR SELECT USING (auth.uid() = rater_id OR auth.uid() = rated_id);

CREATE POLICY "Users can create ratings" ON public.person_ratings
  FOR INSERT WITH CHECK (auth.uid() = rater_id);

-- Reports policies
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- Notifications policies
CREATE POLICY "Users can view own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- TRIGGERS & FUNCTIONS
-- ============================================

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_user_preferences_updated_at
  BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Increment meal_count trigger
CREATE OR REPLACE FUNCTION public.increment_meal_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.showed_up = TRUE THEN
    UPDATE public.users
    SET meal_count = meal_count + 1
    WHERE id = NEW.rated_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_increment_meal_count
  AFTER INSERT ON public.person_ratings
  FOR EACH ROW EXECUTE FUNCTION public.increment_meal_count();

-- Enforce group capacity trigger
CREATE OR REPLACE FUNCTION public.enforce_group_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_count INTEGER;
  max_size INTEGER;
BEGIN
  SELECT COUNT(*), group_size INTO current_count, max_size
  FROM public.request_participants rp
  JOIN public.meal_requests mr ON mr.id = rp.request_id
  WHERE rp.request_id = NEW.request_id AND rp.status = 'joined'
  GROUP BY mr.group_size
  FOR UPDATE;

  IF current_count >= max_size THEN
    RAISE EXCEPTION 'Request is at full capacity';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_enforce_group_capacity
  BEFORE INSERT ON public.request_participants
  FOR EACH ROW EXECUTE FUNCTION public.enforce_group_capacity();

-- Filter message content trigger (simple blocklist)
CREATE OR REPLACE FUNCTION public.filter_message_content()
RETURNS TRIGGER AS $$
DECLARE
  blocklist TEXT[] := ARRAY['spam', 'scam', 'viagra']; -- Placeholder blocklist
BEGIN
  -- Check if content contains blocked words
  IF NEW.content ~* ANY(blocklist) THEN
    NEW.flagged = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_filter_message_content
  BEFORE INSERT ON public.messages
  FOR EACH ROW EXECUTE FUNCTION public.filter_message_content();

-- ============================================
-- REALTIME
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meal_requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.request_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
