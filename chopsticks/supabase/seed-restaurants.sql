-- Seed restaurants in Ho Chi Minh City
-- Run this after 001_complete_schema.sql

INSERT INTO public.restaurants (name, address, district, city, cuisine_type, location, source) VALUES

-- Vietnamese - Pho
('Pho Hoa Pasteur', '260C Pasteur, District 3', 'District 3', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6895 10.7769)'), 'curated'),
('Pho Le', '413 Nguyen Trai, District 5', 'District 5', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6621 10.7534)'), 'curated'),
('Pho Quynh', '323 Pham Ngu Lao, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6932 10.7685)'), 'curated'),
('Pho 2000', '1 Phan Chu Trinh, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.7012 10.7731)'), 'curated'),

-- Vietnamese - Banh Mi
('Banh Mi Huynh Hoa', '26 Le Thi Rieng, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6897 10.7728)'), 'curated'),
('Banh Mi 37 Nguyen Trai', '37 Nguyen Trai, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6945 10.7712)'), 'curated'),
('Banh Mi Hoa Ma', '53 Cao Thang, District 3', 'District 3', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6823 10.7789)'), 'curated'),

-- Vietnamese - Com Tam
('Com Tam Moc', '85 Ly Tu Trong, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6982 10.7756)'), 'curated'),
('Com Tam Ba Ghien', '84 Dang Van Ngu, Phu Nhuan', 'Phu Nhuan', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6756 10.7987)'), 'curated'),
('Com Tam Bui', '171 Bui Vien, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6934 10.7678)'), 'curated'),

-- Vietnamese - Bun
('Bun Cha 145', '145 Bui Vien, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6928 10.7681)'), 'curated'),
('Bun Bo Hue An', '110A Nguyen Du, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6945 10.7812)'), 'curated'),
('Bun Thit Nuong Chi Tuyet', '195 Co Giang, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6878 10.7623)'), 'curated'),

-- Vietnamese - Other
('Quan Bui', '17A Ngo Van Nam, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.7034 10.7789)'), 'curated'),
('Secret Garden', '158 Pasteur, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6912 10.7756)'), 'curated'),
('Cuc Gach Quan', '10 Dang Tat, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6989 10.7834)'), 'curated'),
('Ngon 138', '138 Nam Ky Khoi Nghia, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6934 10.7778)'), 'curated'),
('Banh Xeo 46A', '46A Dinh Cong Trang, District 1', 'District 1', 'hcmc', 'Vietnamese', ST_GeographyFromText('SRID=4326;POINT(106.6912 10.7845)'), 'curated'),

-- Street Food
('Nem Nuong Nha Trang', '38 Nguyen Thuong Hien, District 3', 'District 3', 'hcmc', 'Street Food', ST_GeographyFromText('SRID=4326;POINT(106.6834 10.7823)'), 'curated'),
('Banh Trang Tron', 'Ben Thanh Market, District 1', 'District 1', 'hcmc', 'Street Food', ST_GeographyFromText('SRID=4326;POINT(106.6981 10.7725)'), 'curated'),
('Oc Dao', '212 Nguyen Trai, District 1', 'District 1', 'hcmc', 'Street Food', ST_GeographyFromText('SRID=4326;POINT(106.6867 10.7634)'), 'curated'),
('Bo Bia Anh', 'Le Loi Street, District 1', 'District 1', 'hcmc', 'Street Food', ST_GeographyFromText('SRID=4326;POINT(106.7001 10.7712)'), 'curated'),
('Banh Cuon Tay Ho', '42 Tran Dinh Xu, District 1', 'District 1', 'hcmc', 'Street Food', ST_GeographyFromText('SRID=4326;POINT(106.6923 10.7698)'), 'curated'),

-- Korean
('Gogi House', 'Vincom Center, District 1', 'District 1', 'hcmc', 'Korean', ST_GeographyFromText('SRID=4326;POINT(106.7012 10.7789)'), 'curated'),
('Seoul Garden', 'Diamond Plaza, District 1', 'District 1', 'hcmc', 'Korean', ST_GeographyFromText('SRID=4326;POINT(106.7023 10.7812)'), 'curated'),
('K-Pub', '123 Le Thanh Ton, District 1', 'District 1', 'hcmc', 'Korean', ST_GeographyFromText('SRID=4326;POINT(106.7034 10.7778)'), 'curated'),
('Jokbal Story', 'Pham Viet Chanh, Binh Thanh', 'Binh Thanh', 'hcmc', 'Korean', ST_GeographyFromText('SRID=4326;POINT(106.7123 10.8012)'), 'curated'),
('Buk Buk', '15 Le Thanh Ton, District 1', 'District 1', 'hcmc', 'Korean', ST_GeographyFromText('SRID=4326;POINT(106.7045 10.7789)'), 'curated'),

-- Japanese
('Ichiban Sushi', 'Takashimaya, District 1', 'District 1', 'hcmc', 'Japanese', ST_GeographyFromText('SRID=4326;POINT(106.7001 10.7734)'), 'curated'),
('Tokyo Deli', 'SC VivoCity, District 7', 'District 7', 'hcmc', 'Japanese', ST_GeographyFromText('SRID=4326;POINT(106.7212 10.7298)'), 'curated'),
('Yoshinoya', 'Nguyen Hue, District 1', 'District 1', 'hcmc', 'Japanese', ST_GeographyFromText('SRID=4326;POINT(106.7023 10.7745)'), 'curated'),
('Sushi Hokkaido Sachi', '85 Le Loi, District 1', 'District 1', 'hcmc', 'Japanese', ST_GeographyFromText('SRID=4326;POINT(106.6998 10.7712)'), 'curated'),
('Marukame Udon', 'Vincom Dong Khoi, District 1', 'District 1', 'hcmc', 'Japanese', ST_GeographyFromText('SRID=4326;POINT(106.7034 10.7798)'), 'curated'),

-- Chinese
('Li Bai', 'Sheraton Hotel, District 1', 'District 1', 'hcmc', 'Chinese', ST_GeographyFromText('SRID=4326;POINT(106.6989 10.7823)'), 'curated'),
('Din Tai Fung', 'Takashimaya, District 1', 'District 1', 'hcmc', 'Chinese', ST_GeographyFromText('SRID=4326;POINT(106.7012 10.7734)'), 'curated'),
('Hai Cang', 'Cholon, District 5', 'District 5', 'hcmc', 'Chinese', ST_GeographyFromText('SRID=4326;POINT(106.6567 10.7534)'), 'curated'),
('Crystal Jade', 'Takashimaya, District 1', 'District 1', 'hcmc', 'Chinese', ST_GeographyFromText('SRID=4326;POINT(106.7001 10.7728)'), 'curated'),
('Tim Ho Wan', 'Vincom Center, District 1', 'District 1', 'hcmc', 'Chinese', ST_GeographyFromText('SRID=4326;POINT(106.7023 10.7795)'), 'curated'),

-- Thai
('Thai Express', 'Crescent Mall, District 7', 'District 7', 'hcmc', 'Thai', ST_GeographyFromText('SRID=4326;POINT(106.7198 10.7312)'), 'curated'),
('Coca Suki', 'Nguyen Thi Minh Khai, District 1', 'District 1', 'hcmc', 'Thai', ST_GeographyFromText('SRID=4326;POINT(106.6978 10.7834)'), 'curated'),
('Thai Market', 'Thao Dien, District 2', 'District 2', 'hcmc', 'Thai', ST_GeographyFromText('SRID=4326;POINT(106.7345 10.8123)'), 'curated'),

-- BBQ
('King BBQ', 'AEON Mall, Binh Tan', 'Binh Tan', 'hcmc', 'BBQ', ST_GeographyFromText('SRID=4326;POINT(106.6234 10.7512)'), 'curated'),
('Sumo BBQ', 'Nowzone, District 1', 'District 1', 'hcmc', 'BBQ', ST_GeographyFromText('SRID=4326;POINT(106.6912 10.7712)'), 'curated'),
('Meat Plus', 'Le Thanh Ton, District 1', 'District 1', 'hcmc', 'BBQ', ST_GeographyFromText('SRID=4326;POINT(106.7023 10.7789)'), 'curated'),
('Beef & Leaf', 'Thao Dien, District 2', 'District 2', 'hcmc', 'BBQ', ST_GeographyFromText('SRID=4326;POINT(106.7367 10.8098)'), 'curated'),

-- Seafood
('Oc Oanh', '534 Vinh Khanh, District 4', 'District 4', 'hcmc', 'Seafood', ST_GeographyFromText('SRID=4326;POINT(106.7012 10.7534)'), 'curated'),
('Quan Hai San 94', '94 Dinh Tien Hoang, Binh Thanh', 'Binh Thanh', 'hcmc', 'Seafood', ST_GeographyFromText('SRID=4326;POINT(106.7089 10.8012)'), 'curated'),
('Nha Hang Ngon', 'Pasteur, District 1', 'District 1', 'hcmc', 'Seafood', ST_GeographyFromText('SRID=4326;POINT(106.6923 10.7756)'), 'curated'),

-- Fusion
('The Workshop', '27 Ngo Duc Ke, District 1', 'District 1', 'hcmc', 'Fusion', ST_GeographyFromText('SRID=4326;POINT(106.7034 10.7778)'), 'curated'),
('Pizza 4Ps', '8 Thu Khoa Huan, District 1', 'District 1', 'hcmc', 'Fusion', ST_GeographyFromText('SRID=4326;POINT(106.7001 10.7734)'), 'curated'),
('Propaganda', '21 Han Thuyen, District 1', 'District 1', 'hcmc', 'Fusion', ST_GeographyFromText('SRID=4326;POINT(106.6989 10.7812)'), 'curated');
