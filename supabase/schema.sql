-- Chopsticks Database Schema
-- Run this in Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ============================================
-- USERS
-- ============================================
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  phone TEXT,
  name TEXT NOT NULL,
  age INTEGER CHECK (age >= 18),
  bio TEXT,
  profile_image_url TEXT,
  verification_status TEXT DEFAULT 'unverified' CHECK (verification_status IN ('unverified', 'pending', 'verified')),
  meal_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- USER PREFERENCES
-- ============================================
CREATE TABLE public.user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  cuisine_types TEXT[] DEFAULT '{}',
  dietary_restrictions TEXT[] DEFAULT '{}',
  allergies TEXT[] DEFAULT '{}',
  budget_min INTEGER DEFAULT 0,
  budget_max INTEGER DEFAULT 500000,
  preferred_radius_km NUMERIC DEFAULT 10,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- ============================================
-- RESTAURANTS / FOOD STALLS
-- ============================================
CREATE TABLE public.restaurants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cuisine_type TEXT NOT NULL,
  price_range TEXT DEFAULT 'cheap' CHECK (price_range IN ('cheap', 'moderate', 'expensive')),
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  location GEOGRAPHY(POINT, 4326), -- PostGIS point for geospatial queries
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  image_urls TEXT[] DEFAULT '{}',
  visit_count INTEGER DEFAULT 0,
  rating_avg NUMERIC,
  rating_count INTEGER DEFAULT 0,
  is_hidden_gem BOOLEAN DEFAULT FALSE,
  submitted_by_user_id UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create spatial index for location queries
CREATE INDEX restaurants_location_idx ON public.restaurants USING GIST (location);
CREATE INDEX restaurants_city_idx ON public.restaurants(city);
CREATE INDEX restaurants_cuisine_idx ON public.restaurants(cuisine_type);

-- ============================================
-- MATCHES
-- ============================================
CREATE TABLE public.matches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_1_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  user_2_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired', 'completed')),
  restaurant_id UUID REFERENCES public.restaurants(id),
  scheduled_time TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_1_id, user_2_id)
);

CREATE INDEX matches_user_1_idx ON public.matches(user_1_id);
CREATE INDEX matches_user_2_idx ON public.matches(user_2_id);
CREATE INDEX matches_status_idx ON public.matches(status);

-- ============================================
-- MESSAGES
-- ============================================
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ
);

CREATE INDEX messages_match_idx ON public.messages(match_id);
CREATE INDEX messages_sent_at_idx ON public.messages(sent_at);

-- ============================================
-- MEAL HISTORY
-- ============================================
CREATE TABLE public.meal_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  match_id UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  restaurant_id UUID REFERENCES public.restaurants(id),
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  user_1_rating INTEGER CHECK (user_1_rating BETWEEN 1 AND 5),
  user_2_rating INTEGER CHECK (user_2_rating BETWEEN 1 AND 5),
  restaurant_review TEXT,
  restaurant_rating INTEGER CHECK (restaurant_rating BETWEEN 1 AND 5)
);

-- ============================================
-- SAVED CONNECTIONS
-- ============================================
CREATE TABLE public.saved_connections (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  connected_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  meals_together INTEGER DEFAULT 1,
  saved_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, connected_user_id)
);

-- ============================================
-- GROUPS (for future)
-- ============================================
CREATE TABLE public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  cuisine_focus TEXT,
  image_url TEXT,
  created_by UUID NOT NULL REFERENCES public.users(id),
  member_count INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

-- ============================================
-- ROW LEVEL SECURITY
-- ============================================

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meal_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- Users: Users can read all profiles, but only update their own
CREATE POLICY "Users can view all profiles" ON public.users
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- User Preferences: Users can only access their own
CREATE POLICY "Users can manage own preferences" ON public.user_preferences
  FOR ALL USING (auth.uid() = user_id);

-- Restaurants: Anyone can read, authenticated users can insert
CREATE POLICY "Anyone can view restaurants" ON public.restaurants
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can add restaurants" ON public.restaurants
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Matches: Users can only see their own matches
CREATE POLICY "Users can view own matches" ON public.matches
  FOR SELECT USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

CREATE POLICY "Users can create matches" ON public.matches
  FOR INSERT WITH CHECK (auth.uid() = user_1_id);

CREATE POLICY "Users can update own matches" ON public.matches
  FOR UPDATE USING (auth.uid() = user_1_id OR auth.uid() = user_2_id);

-- Messages: Users can only see messages in their matches
CREATE POLICY "Users can view messages in their matches" ON public.messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = messages.match_id
      AND (matches.user_1_id = auth.uid() OR matches.user_2_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches" ON public.messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE matches.id = match_id
      AND matches.status = 'accepted'
      AND (matches.user_1_id = auth.uid() OR matches.user_2_id = auth.uid())
    )
  );

-- Saved Connections: Users can only manage their own
CREATE POLICY "Users can manage own connections" ON public.saved_connections
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update restaurant location from lat/lng
CREATE OR REPLACE FUNCTION update_restaurant_location()
RETURNS TRIGGER AS $$
BEGIN
  NEW.location = ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_restaurant_location
  BEFORE INSERT OR UPDATE ON public.restaurants
  FOR EACH ROW
  EXECUTE FUNCTION update_restaurant_location();

-- Function to find nearby restaurants
CREATE OR REPLACE FUNCTION nearby_restaurants(
  lat NUMERIC,
  lng NUMERIC,
  radius_km NUMERIC DEFAULT 5
)
RETURNS SETOF public.restaurants AS $$
BEGIN
  RETURN QUERY
  SELECT *
  FROM public.restaurants
  WHERE ST_DWithin(
    location,
    ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography,
    radius_km * 1000 -- Convert km to meters
  )
  ORDER BY location <-> ST_SetSRID(ST_MakePoint(lng, lat), 4326)::geography;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
CREATE TRIGGER users_updated_at BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER user_preferences_updated_at BEFORE UPDATE ON public.user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER restaurants_updated_at BEFORE UPDATE ON public.restaurants
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER matches_updated_at BEFORE UPDATE ON public.matches
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================
-- SEED DATA (Sample restaurants in HCMC & Hanoi)
-- ============================================

-- Ho Chi Minh City restaurants
INSERT INTO public.restaurants (name, description, cuisine_type, price_range, latitude, longitude, address, city, is_hidden_gem) VALUES
  ('Pho Hoa Pasteur', 'Famous pho restaurant since 1968', 'Vietnamese', 'cheap', 10.7769, 106.6955, '260C Pasteur, District 3', 'Ho Chi Minh City', false),
  ('Banh Mi Huynh Hoa', 'Best banh mi in Saigon', 'Vietnamese', 'cheap', 10.7728, 106.6897, '26 Le Thi Rieng, District 1', 'Ho Chi Minh City', true),
  ('Com Tam Moc', 'Authentic broken rice', 'Vietnamese', 'cheap', 10.7856, 106.6782, '85 Ly Tu Trong, District 1', 'Ho Chi Minh City', false),
  ('Bun Cha 145', 'Grilled pork with noodles', 'Vietnamese', 'cheap', 10.7801, 106.6912, '145 Bui Vien, District 1', 'Ho Chi Minh City', false),
  ('Korean BBQ Town', 'All-you-can-eat Korean BBQ', 'Korean', 'moderate', 10.7892, 106.6823, 'Pham Ngu Lao, District 1', 'Ho Chi Minh City', false);

-- Hanoi restaurants
INSERT INTO public.restaurants (name, description, cuisine_type, price_range, latitude, longitude, address, city, is_hidden_gem) VALUES
  ('Pho Thin', 'Legendary pho bo', 'Vietnamese', 'cheap', 21.0285, 105.8542, '13 Lo Duc, Hai Ba Trung', 'Hanoi', true),
  ('Bun Cha Huong Lien', 'Obama Bun Cha', 'Vietnamese', 'cheap', 21.0123, 105.8456, '24 Le Van Huu, Hai Ba Trung', 'Hanoi', false),
  ('Cha Ca La Vong', 'Traditional fish dish', 'Vietnamese', 'moderate', 21.0334, 105.8489, '14 Cha Ca, Hoan Kiem', 'Hanoi', false),
  ('Xoi Yen', 'Best sticky rice in town', 'Vietnamese', 'cheap', 21.0298, 105.8512, '35B Nguyen Huu Huan, Hoan Kiem', 'Hanoi', true),
  ('Nha Hang Ngon', 'Street food in elegant setting', 'Vietnamese', 'moderate', 21.0245, 105.8523, '18 Phan Boi Chau, Hoan Kiem', 'Hanoi', false);
