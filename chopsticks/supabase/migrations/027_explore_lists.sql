-- 027_explore_lists.sql
-- Explore Phase 1: lists, list_restaurants, user_visits

-- ============================================================
-- 1. LISTS (unified: curated editorial + personal user lists)
-- ============================================================
CREATE TABLE lists (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type         text NOT NULL CHECK (type IN ('curated', 'personal')),
  owner_id     uuid REFERENCES users(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  emoji        text,
  category     text,
  city         text NOT NULL DEFAULT 'hcmc',
  is_published boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- 2. LIST_RESTAURANTS (restaurants in a list, ranked for curated)
-- ============================================================
CREATE TABLE list_restaurants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  list_id       uuid NOT NULL REFERENCES lists(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  rank          int,
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(list_id, restaurant_id)
);

-- ============================================================
-- 3. USER_VISITS ("Been There" tracking)
-- ============================================================
CREATE TABLE user_visits (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id uuid NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  visited_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, restaurant_id)
);

-- ============================================================
-- 4. INDEXES
-- ============================================================
CREATE INDEX idx_lists_type ON lists(type);
CREATE INDEX idx_lists_owner_id ON lists(owner_id);
CREATE INDEX idx_list_restaurants_list_id ON list_restaurants(list_id);
CREATE INDEX idx_list_restaurants_restaurant_id ON list_restaurants(restaurant_id);
CREATE INDEX idx_user_visits_user_id ON user_visits(user_id);
CREATE INDEX idx_user_visits_restaurant_id ON user_visits(restaurant_id);

-- ============================================================
-- 5. RLS
-- ============================================================
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE list_restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_visits ENABLE ROW LEVEL SECURITY;

-- lists: public read for published curated, owner full access for personal
CREATE POLICY "Public read published curated lists"
  ON lists FOR SELECT
  USING (type = 'curated' AND is_published = true);

CREATE POLICY "Users manage own personal lists"
  ON lists FOR ALL
  USING (type = 'personal' AND owner_id = auth.uid())
  WITH CHECK (type = 'personal' AND owner_id = auth.uid());

-- list_restaurants: public read for curated, owner access for personal lists
CREATE POLICY "Public read curated list restaurants"
  ON list_restaurants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_restaurants.list_id
        AND lists.type = 'curated'
        AND lists.is_published = true
    )
  );

CREATE POLICY "Users manage restaurants in own lists"
  ON list_restaurants FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_restaurants.list_id
        AND lists.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM lists
      WHERE lists.id = list_restaurants.list_id
        AND lists.owner_id = auth.uid()
    )
  );

-- user_visits: private, own rows only
CREATE POLICY "Users manage own visits"
  ON user_visits FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 6. SEED: 5 curated lists (add restaurants via Supabase Studio
--    after seeding — use Studio to get restaurant IDs)
-- ============================================================
INSERT INTO lists (type, title, description, category, city, is_published) VALUES
  ('curated', 'Best Phở in Saigon', 'The definitive guide to Saigon''s best bowls of phở — from classic northern to rich southern styles.', 'Vietnamese', 'hcmc', true),
  ('curated', 'Best Bánh Mì in District 1', 'Crispy baguettes stuffed to perfection. These are the spots worth lining up for.', 'Street Food', 'hcmc', true),
  ('curated', 'Best Cơm Tấm Spots', 'Broken rice done right — juicy grilled pork, perfect fried egg, the works.', 'Vietnamese', 'hcmc', true),
  ('curated', 'Best Late Night Eats', 'Still hungry after midnight? These spots have you covered.', 'Various', 'hcmc', true),
  ('curated', 'Best Street Food in Phú Nhuận', 'A neighbourhood crawl through Phú Nhuận''s best street food gems.', 'Street Food', 'hcmc', true);
