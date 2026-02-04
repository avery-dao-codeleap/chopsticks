-- Seed 50 restaurants in Ho Chi Minh City
-- Run this after schema.sql

INSERT INTO public.restaurants (name, description, cuisine_type, price_range, address, city, latitude, longitude, rating_avg, is_hidden_gem) VALUES

-- Vietnamese - Pho
('Pho Hoa Pasteur', 'Famous pho spot since 1968', 'Vietnamese', 'cheap', '260C Pasteur, District 3', 'Ho Chi Minh City', 10.7769, 106.6895, 4.5, false),
('Pho Le', 'Legendary beef pho', 'Vietnamese', 'cheap', '413 Nguyen Trai, District 5', 'Ho Chi Minh City', 10.7534, 106.6621, 4.6, false),
('Pho Quynh', '24-hour pho restaurant', 'Vietnamese', 'cheap', '323 Pham Ngu Lao, District 1', 'Ho Chi Minh City', 10.7685, 106.6932, 4.3, false),
('Pho 2000', 'Bill Clinton ate here', 'Vietnamese', 'cheap', '1 Phan Chu Trinh, District 1', 'Ho Chi Minh City', 10.7731, 106.7012, 4.2, false),

-- Vietnamese - Banh Mi
('Banh Mi Huynh Hoa', 'Best banh mi in Saigon', 'Vietnamese', 'cheap', '26 Le Thi Rieng, District 1', 'Ho Chi Minh City', 10.7728, 106.6897, 4.8, true),
('Banh Mi 37 Nguyen Trai', 'Crispy banh mi classic', 'Vietnamese', 'cheap', '37 Nguyen Trai, District 1', 'Ho Chi Minh City', 10.7712, 106.6945, 4.5, false),
('Banh Mi Hoa Ma', 'Pan-fried banh mi style', 'Vietnamese', 'cheap', '53 Cao Thang, District 3', 'Ho Chi Minh City', 10.7789, 106.6823, 4.4, true),

-- Vietnamese - Com Tam
('Com Tam Moc', 'Broken rice specialist', 'Vietnamese', 'cheap', '85 Ly Tu Trong, District 1', 'Ho Chi Minh City', 10.7756, 106.6982, 4.3, false),
('Com Tam Ba Ghien', 'Famous com tam since 1960s', 'Vietnamese', 'cheap', '84 Dang Van Ngu, Phu Nhuan', 'Ho Chi Minh City', 10.7987, 106.6756, 4.6, false),
('Com Tam Bui', 'Local favorite broken rice', 'Vietnamese', 'cheap', '171 Bui Vien, District 1', 'Ho Chi Minh City', 10.7678, 106.6934, 4.2, false),

-- Vietnamese - Bun
('Bun Cha 145', 'Hanoi-style grilled pork', 'Vietnamese', 'cheap', '145 Bui Vien, District 1', 'Ho Chi Minh City', 10.7681, 106.6928, 4.3, false),
('Bun Bo Hue An', 'Spicy Hue noodles', 'Vietnamese', 'cheap', '110A Nguyen Du, District 1', 'Ho Chi Minh City', 10.7812, 106.6945, 4.5, false),
('Bun Thit Nuong Chi Tuyet', 'Grilled pork noodles', 'Vietnamese', 'cheap', '195 Co Giang, District 1', 'Ho Chi Minh City', 10.7623, 106.6878, 4.4, true),

-- Vietnamese - Other
('Quan Bui', 'Modern Vietnamese cuisine', 'Vietnamese', 'moderate', '17A Ngo Van Nam, District 1', 'Ho Chi Minh City', 10.7789, 106.7034, 4.4, false),
('Secret Garden', 'Rooftop Vietnamese', 'Vietnamese', 'moderate', '158 Pasteur, District 1', 'Ho Chi Minh City', 10.7756, 106.6912, 4.5, false),
('Cuc Gach Quan', 'Rustic Vietnamese villa', 'Vietnamese', 'moderate', '10 Dang Tat, District 1', 'Ho Chi Minh City', 10.7834, 106.6989, 4.6, false),
('Ngon 138', 'Street food collection', 'Vietnamese', 'moderate', '138 Nam Ky Khoi Nghia, District 1', 'Ho Chi Minh City', 10.7778, 106.6934, 4.3, false),
('Banh Xeo 46A', 'Crispy pancakes', 'Vietnamese', 'cheap', '46A Dinh Cong Trang, District 1', 'Ho Chi Minh City', 10.7845, 106.6912, 4.5, true),

-- Street Food
('Nem Nuong Nha Trang', 'Nha Trang grilled pork', 'Street Food', 'cheap', '38 Nguyen Thuong Hien, District 3', 'Ho Chi Minh City', 10.7823, 106.6834, 4.3, false),
('Banh Trang Tron', 'Rice paper salad', 'Street Food', 'cheap', 'Ben Thanh Market, District 1', 'Ho Chi Minh City', 10.7725, 106.6981, 4.1, false),
('Oc Dao', 'Snail restaurant', 'Street Food', 'cheap', '212 Nguyen Trai, District 1', 'Ho Chi Minh City', 10.7634, 106.6867, 4.4, false),
('Bo Bia Anh', 'Spring rolls spot', 'Street Food', 'cheap', 'Le Loi Street, District 1', 'Ho Chi Minh City', 10.7712, 106.7001, 4.2, true),
('Banh Cuon Tay Ho', 'Steamed rice rolls', 'Street Food', 'cheap', '42 Tran Dinh Xu, District 1', 'Ho Chi Minh City', 10.7698, 106.6923, 4.5, false),

-- Korean
('Gogi House', 'Korean BBQ chain', 'Korean', 'moderate', 'Vincom Center, District 1', 'Ho Chi Minh City', 10.7789, 106.7012, 4.2, false),
('Seoul Garden', 'Korean BBQ buffet', 'Korean', 'moderate', 'Diamond Plaza, District 1', 'Ho Chi Minh City', 10.7812, 106.7023, 4.1, false),
('K-Pub', 'Korean fried chicken', 'Korean', 'moderate', '123 Le Thanh Ton, District 1', 'Ho Chi Minh City', 10.7778, 106.7034, 4.3, false),
('Jokbal Story', 'Korean pig feet', 'Korean', 'moderate', 'Pham Viet Chanh, Binh Thanh', 'Ho Chi Minh City', 10.8012, 106.7123, 4.4, true),
('Buk Buk', 'Korean street food', 'Korean', 'cheap', '15 Le Thanh Ton, District 1', 'Ho Chi Minh City', 10.7789, 106.7045, 4.2, false),

-- Japanese
('Ichiban Sushi', 'Conveyor belt sushi', 'Japanese', 'moderate', 'Takashimaya, District 1', 'Ho Chi Minh City', 10.7734, 106.7001, 4.0, false),
('Tokyo Deli', 'Japanese family restaurant', 'Japanese', 'moderate', 'SC VivoCity, District 7', 'Ho Chi Minh City', 10.7298, 106.7212, 4.1, false),
('Yoshinoya', 'Japanese beef bowls', 'Japanese', 'cheap', 'Nguyen Hue, District 1', 'Ho Chi Minh City', 10.7745, 106.7023, 3.9, false),
('Sushi Hokkaido Sachi', 'Fresh sushi', 'Japanese', 'moderate', '85 Le Loi, District 1', 'Ho Chi Minh City', 10.7712, 106.6998, 4.3, false),
('Marukame Udon', 'Fresh udon noodles', 'Japanese', 'cheap', 'Vincom Dong Khoi, District 1', 'Ho Chi Minh City', 10.7798, 106.7034, 4.2, false),

-- Chinese
('Li Bai', 'Cantonese fine dining', 'Chinese', 'expensive', 'Sheraton Hotel, District 1', 'Ho Chi Minh City', 10.7823, 106.6989, 4.5, false),
('Din Tai Fung', 'Taiwanese dumplings', 'Chinese', 'moderate', 'Takashimaya, District 1', 'Ho Chi Minh City', 10.7734, 106.7012, 4.4, false),
('Hai Cang', 'Dim sum restaurant', 'Chinese', 'moderate', 'Cholon, District 5', 'Ho Chi Minh City', 10.7534, 106.6567, 4.3, false),
('Crystal Jade', 'Hong Kong cuisine', 'Chinese', 'moderate', 'Takashimaya, District 1', 'Ho Chi Minh City', 10.7728, 106.7001, 4.2, false),
('Tim Ho Wan', 'Dim sum chain', 'Chinese', 'moderate', 'Vincom Center, District 1', 'Ho Chi Minh City', 10.7795, 106.7023, 4.1, false),

-- Thai
('Thai Express', 'Quick Thai food', 'Thai', 'moderate', 'Crescent Mall, District 7', 'Ho Chi Minh City', 10.7312, 106.7198, 3.9, false),
('Coca Suki', 'Thai hot pot', 'Thai', 'moderate', 'Nguyen Thi Minh Khai, District 1', 'Ho Chi Minh City', 10.7834, 106.6978, 4.0, false),
('Thai Market', 'Authentic Thai', 'Thai', 'moderate', 'Thao Dien, District 2', 'Ho Chi Minh City', 10.8123, 106.7345, 4.3, false),

-- BBQ
('King BBQ', 'Korean-style BBQ', 'BBQ', 'moderate', 'AEON Mall, Binh Tan', 'Ho Chi Minh City', 10.7512, 106.6234, 4.1, false),
('Sumo BBQ', 'Japanese BBQ buffet', 'BBQ', 'moderate', 'Nowzone, District 1', 'Ho Chi Minh City', 10.7712, 106.6912, 4.0, false),
('Meat Plus', 'Premium steaks', 'BBQ', 'expensive', 'Le Thanh Ton, District 1', 'Ho Chi Minh City', 10.7789, 106.7023, 4.4, false),
('Beef & Leaf', 'Korean BBQ', 'BBQ', 'moderate', 'Thao Dien, District 2', 'Ho Chi Minh City', 10.8098, 106.7367, 4.2, false),

-- Seafood
('Oc Oanh', 'Famous snail alley', 'Seafood', 'cheap', '534 Vinh Khanh, District 4', 'Ho Chi Minh City', 10.7534, 106.7012, 4.3, true),
('Quan Hai San 94', 'Live seafood', 'Seafood', 'moderate', '94 Dinh Tien Hoang, Binh Thanh', 'Ho Chi Minh City', 10.8012, 106.7089, 4.2, false),
('Nha Hang Ngon', 'Seafood restaurant', 'Seafood', 'moderate', 'Pasteur, District 1', 'Ho Chi Minh City', 10.7756, 106.6923, 4.1, false),

-- Cafe / Fusion
('The Workshop', 'Specialty coffee + food', 'Fusion', 'moderate', '27 Ngo Duc Ke, District 1', 'Ho Chi Minh City', 10.7778, 106.7034, 4.5, false),
('Pizza 4Ps', 'Vietnamese-Japanese pizza', 'Fusion', 'moderate', '8 Thu Khoa Huan, District 1', 'Ho Chi Minh City', 10.7734, 106.7001, 4.6, false),
('Propaganda', 'Vietnamese bistro', 'Fusion', 'moderate', '21 Han Thuyen, District 1', 'Ho Chi Minh City', 10.7812, 106.6989, 4.4, false);
