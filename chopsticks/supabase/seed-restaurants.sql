-- Seed restaurants in Binh Thanh and Thao Dien (District 2)
-- Real restaurants for MVP testing
-- Run this after 001_complete_schema.sql

-- Map cuisine types to new categories from constants.ts:
-- noodles_congee, rice, hotpot_grill, seafood, bread, vietnamese_cakes,
-- snack, dessert, drinks, fast_food, international, healthy, veggie, others

-- Note: budget_range is NOT stored per restaurant, it's per meal_request
INSERT INTO public.restaurants (name, address, district, city, cuisine_type, location, source) VALUES

-- ============================================================================
-- BINH THANH DISTRICT - Vietnamese Classics
-- ============================================================================

-- Noodles & Congee
('Bun Bo Hue Bac Hai', '84A Nguyen Huu Canh, Binh Thanh', 'Binh Thanh', 'hcmc', 'noodles_congee', ST_GeographyFromText('SRID=4326;POINT(106.7123 10.8012)'), 'curated'),
('Pho Le', '271 Xo Viet Nghe Tinh, Binh Thanh', 'Binh Thanh', 'hcmc', 'noodles_congee', ST_GeographyFromText('SRID=4326;POINT(106.7089 10.7987)'), 'curated'),
('Hu Tieu Nam Vang Mau Dich', '252 Xo Viet Nghe Tinh, Binh Thanh', 'Binh Thanh', 'hcmc', 'noodles_congee', ST_GeographyFromText('SRID=4326;POINT(106.7078 10.7978)'), 'curated'),
('Bun Rieu Cua 87', '87 Nguyen Huu Canh, Binh Thanh', 'Binh Thanh', 'hcmc', 'noodles_congee', ST_GeographyFromText('SRID=4326;POINT(106.7119 10.8015)'), 'curated'),
('Mi Quang 1A', '1A Phan Dang Luu, Binh Thanh', 'Binh Thanh', 'hcmc', 'noodles_congee', ST_GeographyFromText('SRID=4326;POINT(106.7045 10.7934)'), 'curated'),

-- Rice Dishes
('Com Tam Suon Nuong Ba Ghien', '36 Dinh Bo Linh, Binh Thanh', 'Binh Thanh', 'hcmc', 'rice', ST_GeographyFromText('SRID=4326;POINT(106.7156 10.7998)'), 'curated'),
('Com Ga Xoi Mo', '213 Xo Viet Nghe Tinh, Binh Thanh', 'Binh Thanh', 'hcmc', 'rice', ST_GeographyFromText('SRID=4326;POINT(106.7067 10.7965)'), 'curated'),
('Com Nieu Sai Gon', '180 Nguyen Dinh Chieu, Binh Thanh', 'Binh Thanh', 'hcmc', 'rice', ST_GeographyFromText('SRID=4326;POINT(106.7089 10.7912)'), 'curated'),

-- Snacks & Street Food
('Banh Xeo Ba Duong', '46A Dinh Tien Hoang, Binh Thanh', 'Binh Thanh', 'hcmc', 'snack', ST_GeographyFromText('SRID=4326;POINT(106.7098 10.8023)'), 'curated'),
('Oc Oanh', '534 Vinh Khanh, Binh Thanh', 'Binh Thanh', 'hcmc', 'snack', ST_GeographyFromText('SRID=4326;POINT(106.7134 10.7945)'), 'curated'),
('Banh Mi Huynh Hoa Chi Nhanh', '26 Phan Dang Luu, Binh Thanh', 'Binh Thanh', 'hcmc', 'bread', ST_GeographyFromText('SRID=4326;POINT(106.7056 10.7923)'), 'curated'),

-- Seafood
('Quan Hai San 94', '94 Dinh Tien Hoang, Binh Thanh', 'Binh Thanh', 'hcmc', 'seafood', ST_GeographyFromText('SRID=4326;POINT(106.7089 10.8012)'), 'curated'),
('Hai San Be Man', '45 Nguyen Huu Canh, Binh Thanh', 'Binh Thanh', 'hcmc', 'seafood', ST_GeographyFromText('SRID=4326;POINT(106.7145 10.8034)'), 'curated'),

-- Hotpot & BBQ
('Lau Thai Smile', '123 Xo Viet Nghe Tinh, Binh Thanh', 'Binh Thanh', 'hcmc', 'hotpot_grill', ST_GeographyFromText('SRID=4326;POINT(106.7034 10.7956)'), 'curated'),
('Sumo BBQ Vincom Landmark 81', 'Landmark 81, Binh Thanh', 'Binh Thanh', 'hcmc', 'hotpot_grill', ST_GeographyFromText('SRID=4326;POINT(106.7123 10.7945)'), 'curated'),

-- Drinks & Cafes
('The Coffee House - Nguyen Huu Canh', '56 Nguyen Huu Canh, Binh Thanh', 'Binh Thanh', 'hcmc', 'drinks', ST_GeographyFromText('SRID=4326;POINT(106.7112 10.8018)'), 'curated'),
('Highlands Coffee Landmark 81', 'Landmark 81, Binh Thanh', 'Binh Thanh', 'hcmc', 'drinks', ST_GeographyFromText('SRID=4326;POINT(106.7119 10.7948)'), 'curated'),

-- International
('Pizza 4Ps - Landmark 81', 'Landmark 81, Binh Thanh', 'Binh Thanh', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7126 10.7942)'), 'curated'),
('Jokbal Story', 'Pham Viet Chanh, Binh Thanh', 'Binh Thanh', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7098 10.8009)'), 'curated'),
('Gogi House Vincom', 'Vincom Mega Mall, Binh Thanh', 'Binh Thanh', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7134 10.7951)'), 'curated'),

-- ============================================================================
-- THAO DIEN (DISTRICT 2) - Expat Haven
-- ============================================================================

-- Vietnamese - Upscale
('Bun Cha Hoi Hai', '26B Street 10, Thao Dien, District 2', 'District 2', 'hcmc', 'noodles_congee', ST_GeographyFromText('SRID=4326;POINT(106.7345 10.8098)'), 'curated'),
('Pho Thin Bo Ho', '142 Xuan Thuy, Thao Dien, District 2', 'District 2', 'hcmc', 'noodles_congee', ST_GeographyFromText('SRID=4326;POINT(106.7367 10.8112)'), 'curated'),
('Banh Mi Huynh Hoa Thao Dien', '74 Xuan Thuy, Thao Dien, District 2', 'District 2', 'hcmc', 'bread', ST_GeographyFromText('SRID=4326;POINT(106.7356 10.8103)'), 'curated'),

-- International - French & Western
('La Villa French Restaurant', '14 Ngo Quang Huy, Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7389 10.8089)'), 'curated'),
('The Deck Saigon', '38 Nguyen U Di, Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7423 10.8067)'), 'curated'),
('Boat House', '40 Lily Road, Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7398 10.8076)'), 'curated'),
('The Loop', '20 Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7378 10.8091)'), 'curated'),
('Pendolasco', '87 Xuan Thuy, Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7361 10.8106)'), 'curated'),

-- International - Pizza & Italian
('Pizza 4Ps Thao Dien', '8/15 Le Quy Don, Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7334 10.8087)'), 'curated'),
('Chicos Pizza Bar', '34 Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7371 10.8094)'), 'curated'),
('Ciao Bella', '11 Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7352 10.8082)'), 'curated'),

-- International - Japanese
('Danbo Ramen', '27 Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7375 10.8093)'), 'curated'),
('Sushi Rei', '92 Xuan Thuy, Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7363 10.8108)'), 'curated'),
('Kushi Dining & Bar', '15 Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7359 10.8085)'), 'curated'),

-- International - Korean
('Bulgogi Brothers', '38 Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7382 10.8097)'), 'curated'),
('Seoul House', '65 Xuan Thuy, Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7354 10.8101)'), 'curated'),

-- International - Middle Eastern
('Ararat', '10 Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7349 10.8080)'), 'curated'),
('Shri Restaurant & Lounge', '18 Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7365 10.8088)'), 'curated'),

-- International - Thai
('Thai Market', '33 Thao Dien, District 2', 'District 2', 'hcmc', 'international', ST_GeographyFromText('SRID=4326;POINT(106.7368 10.8092)'), 'curated'),

-- Hotpot & BBQ
('Beef & Leaf', '73 Thao Dien, District 2', 'District 2', 'hcmc', 'hotpot_grill', ST_GeographyFromText('SRID=4326;POINT(106.7388 10.8105)'), 'curated'),
('Gogi House Thao Dien', '54 Xuan Thuy, Thao Dien, District 2', 'District 2', 'hcmc', 'hotpot_grill', ST_GeographyFromText('SRID=4326;POINT(106.7347 10.8097)'), 'curated'),

-- Healthy & Vegetarian
('Du Yen - Michelin Guide', '26B Street 10, Thao Dien, District 2', 'District 2', 'hcmc', 'veggie', ST_GeographyFromText('SRID=4326;POINT(106.7343 10.8096)'), 'curated'),
('Organik', '7 Nguyen U Di, Thao Dien, District 2', 'District 2', 'hcmc', 'healthy', ST_GeographyFromText('SRID=4326;POINT(106.7407 10.8062)'), 'curated'),
('Grain Thao Dien', '25 Thao Dien, District 2', 'District 2', 'hcmc', 'healthy', ST_GeographyFromText('SRID=4326;POINT(106.7372 10.8091)'), 'curated'),

-- Cafes & Brunch
('The Coffee House Thao Dien', '43 Thao Dien, District 2', 'District 2', 'hcmc', 'drinks', ST_GeographyFromText('SRID=4326;POINT(106.7377 10.8095)'), 'curated'),
('L''Usine Thao Dien', '151 Xuan Thuy, Thao Dien, District 2', 'District 2', 'hcmc', 'drinks', ST_GeographyFromText('SRID=4326;POINT(106.7371 10.8115)'), 'curated'),
('An Coffee Roastery', '5 Thao Dien, District 2', 'District 2', 'hcmc', 'drinks', ST_GeographyFromText('SRID=4326;POINT(106.7341 10.8078)'), 'curated'),
('The Workshop Coffee', '27 Ngo Quang Huy, Thao Dien, District 2', 'District 2', 'hcmc', 'drinks', ST_GeographyFromText('SRID=4326;POINT(106.7395 10.8093)'), 'curated'),
('Bread & Butter', '3 Thao Dien, District 2', 'District 2', 'hcmc', 'drinks', ST_GeographyFromText('SRID=4326;POINT(106.7338 10.8075)'), 'curated'),

-- Dessert & Bakery
('Maison Marou Thao Dien', '167-169 Nguyen Van Huong, Thao Dien, District 2', 'District 2', 'hcmc', 'dessert', ST_GeographyFromText('SRID=4326;POINT(106.7401 10.8101)'), 'curated'),
('The Bloom Saigon', '37 Thao Dien, District 2', 'District 2', 'hcmc', 'dessert', ST_GeographyFromText('SRID=4326;POINT(106.7379 10.8096)'), 'curated'),

-- Seafood
('MeKong Merchant', '23 Thao Dien, District 2', 'District 2', 'hcmc', 'seafood', ST_GeographyFromText('SRID=4326;POINT(106.7369 10.8090)'), 'curated');
