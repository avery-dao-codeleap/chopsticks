# Data Model: Chopsticks MVP

**Date**: 2026-01-31 | **Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

This document defines the complete database schema for Chopsticks MVP, including entities, relationships, constraints, and RLS policies.

---

## Entity Relationship Diagram

```
┌─────────────────┐       ┌──────────────────────┐       ┌─────────────────┐
│      USER       │       │    USER_PREFERENCES  │       │   RESTAURANT    │
├─────────────────┤       ├──────────────────────┤       ├─────────────────┤
│ id (PK)         │──────<│ user_id (PK, FK)     │       │ id (PK)         │
│ firebase_uid    │       │ cuisines[]           │       │ name            │
│ phone           │       │ budget_ranges[]      │       │ address         │
│ name            │       └──────────────────────┘       │ district        │
│ photo_url       │                                      │ city            │
│ age             │                                      │ cuisine_type    │
│ gender          │       ┌──────────────────────┐       │ location        │
│ city            │       │    MEAL_REQUEST      │       │ source          │
│ persona         │       ├──────────────────────┤       └─────────────────┘
│ bio             │       │ id (PK)              │              │
│ meal_count      │──────<│ requester_id (FK)    │>─────────────┘
│ language        │       │ restaurant_id (FK)   │
│ expo_push_token │       │ cuisine              │
│ last_active_at  │       │ budget_range         │
│ deleted_at      │       │ time_window          │
│ banned_at       │       │ group_size           │
│ created_at      │       │ join_type            │
└─────────────────┘       │ status               │
        │                 │ created_at           │
        │                 └──────────────────────┘
        │                          │
        │                 ┌────────┴────────┐
        │                 │                 │
        │    ┌────────────────────┐  ┌──────────────────┐
        │    │ REQUEST_PARTICIPANT│  │      CHAT        │
        │    ├────────────────────┤  ├──────────────────┤
        └───<│ id (PK)            │  │ id (PK)          │
             │ request_id (FK)    │  │ request_id (FK)  │
             │ user_id (FK)       │  │ type             │
             │ status             │  │ expires_at       │
             │ joined_at          │  │ created_at       │
             └────────────────────┘  └──────────────────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
           ┌────────────────┐      ┌────────────────┐     ┌─────────────────┐
           │CHAT_PARTICIPANT│      │    MESSAGE     │     │  PERSON_RATING  │
           ├────────────────┤      ├────────────────┤     ├─────────────────┤
           │ chat_id (FK)   │      │ id (PK)        │     │ id (PK)         │
           │ user_id (FK)   │      │ chat_id (FK)   │     │ rater_id (FK)   │
           │ joined_at      │      │ sender_id (FK) │     │ rated_id (FK)   │
           └────────────────┘      │ content        │     │ request_id (FK) │
                                   │ flagged        │     │ showed_up       │
                                   │ created_at     │     │ created_at      │
                                   └────────────────┘     └─────────────────┘

┌─────────────────┐       ┌──────────────────┐
│     REPORT      │       │   NOTIFICATION   │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)          │
│ reporter_id(FK) │       │ user_id (FK)     │
│ reported_id(FK) │       │ type             │
│ reason          │       │ title            │
│ created_at      │       │ body             │
└─────────────────┘       │ data             │
                          │ read             │
                          │ created_at       │
                          └──────────────────┘
```

---

## Entities

### USER

Primary user account table.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| `firebase_uid` | TEXT | UNIQUE, NOT NULL | Firebase Auth UID |
| `phone` | TEXT | UNIQUE, NOT NULL | Phone number (E.164 format) |
| `name` | TEXT | NOT NULL, LENGTH 1-50 | Display name |
| `photo_url` | TEXT | NOT NULL | Supabase Storage URL |
| `age` | INTEGER | NOT NULL, CHECK >= 18 | User age |
| `gender` | TEXT | NOT NULL, CHECK IN ('male','female','non-binary','prefer_not_to_say') | Self-declared gender |
| `city` | TEXT | NOT NULL, CHECK IN ('hcmc') | Current city (HCMC only for MVP) |
| `persona` | TEXT | NOT NULL, CHECK IN ('local','new_to_city','expat','traveler','student') | User type |
| `bio` | TEXT | NULLABLE, MAX 200 | Food-related bio |
| `meal_count` | INTEGER | DEFAULT 0 | Completed meals count |
| `language` | TEXT | DEFAULT 'vi', CHECK IN ('vi','en') | Preferred language |
| `expo_push_token` | TEXT | NULLABLE | Push notification token |
| `last_active_at` | TIMESTAMPTZ | DEFAULT NOW() | Last activity timestamp |
| `deleted_at` | TIMESTAMPTZ | NULLABLE | Soft delete marker |
| `banned_at` | TIMESTAMPTZ | NULLABLE | Ban timestamp |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Account creation |

**Indexes**:
- `idx_users_city` ON (city) WHERE deleted_at IS NULL AND banned_at IS NULL
- `idx_users_firebase_uid` ON (firebase_uid)
- `idx_users_last_active` ON (last_active_at) WHERE deleted_at IS NULL

---

### USER_PREFERENCES

User food and matching preferences (1:1 with USER).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | UUID | PK, FK → users(id) ON DELETE CASCADE | User reference |
| `cuisines` | TEXT[] | NOT NULL, CHECK array_length >= 1 | Preferred cuisines |
| `budget_ranges` | TEXT[] | NOT NULL, CHECK array_length >= 1 | Budget preferences |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update |

**Validation**:
- `cuisines` values must be from predefined categories (see [Cuisine Types Reference](#cuisine-types-reference))
- `budget_ranges` values must be: 'under_50k', '50k_150k', '150k_500k', '500k_plus'

---

### RESTAURANT

Restaurant/venue data from curated seed list or user submissions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| `name` | TEXT | NOT NULL | Restaurant name |
| `address` | TEXT | NOT NULL | Street address |
| `district` | TEXT | NOT NULL | District (22 HCMC districts) |
| `city` | TEXT | NOT NULL, DEFAULT 'hcmc' | City (HCMC only for MVP) |
| `cuisine_type` | TEXT | NOT NULL | Primary cuisine |
| `location` | GEOGRAPHY(POINT) | NULLABLE | Lat/lng coordinates (optional for MVP) |
| `source` | TEXT | NOT NULL, CHECK IN ('curated','user_added') | Data source |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Indexes**:
- `idx_restaurants_city` ON (city)
- `idx_restaurants_district` ON (district)

---

### MEAL_REQUEST

Active meal requests created by users.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| `requester_id` | UUID | FK → users(id), NOT NULL | Creator |
| `restaurant_id` | UUID | FK → restaurants(id), NOT NULL | Venue |
| `cuisine` | TEXT | NOT NULL | Cuisine type (see [Cuisine Types Reference](#cuisine-types-reference)) |
| `budget_range` | TEXT | NOT NULL | Budget range (1 of 4 ranges) |
| `time_window` | TIMESTAMPTZ | NOT NULL | Meal time (within next 24h) |
| `group_size` | INTEGER | NOT NULL, CHECK BETWEEN 2 AND 4 | Total spots |
| `join_type` | TEXT | NOT NULL, CHECK IN ('open','approval') | Join mode |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Visibility**: Requests are visible where `time_window > NOW()`. No status field or cron jobs for MVP.

**Indexes**:
- `idx_requests_time_window` ON (time_window) WHERE time_window > NOW()
- `idx_requests_requester` ON (requester_id)
- `idx_requests_restaurant` ON (restaurant_id)

---

### REQUEST_PARTICIPANT

Junction table for users joining meal requests.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| `request_id` | UUID | FK → meal_requests(id) ON DELETE CASCADE | Request reference |
| `user_id` | UUID | FK → users(id), NOT NULL | Participant |
| `status` | TEXT | NOT NULL, DEFAULT 'pending', CHECK IN ('pending','joined','rejected') | Join status |
| `joined_at` | TIMESTAMPTZ | NULLABLE | When approved/joined |

**Constraints**:
- UNIQUE (request_id, user_id) - One entry per user per request
- Trigger `enforce_group_capacity` prevents inserts when at capacity

---

### CHAT

Chat room for meal requests (no DMs for MVP).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| `request_id` | UUID | FK → meal_requests(id), NOT NULL | Associated request |
| `expires_at` | TIMESTAMPTZ | NULLABLE | Set to NOW() + 24h when request canceled |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

### CHAT_PARTICIPANT

Junction table for chat membership.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `chat_id` | UUID | FK → chats(id) ON DELETE CASCADE | Chat reference |
| `user_id` | UUID | FK → users(id), NOT NULL | Participant |
| `joined_at` | TIMESTAMPTZ | DEFAULT NOW() | Join timestamp |
| PRIMARY KEY | (chat_id, user_id) | | Composite key |

---

### MESSAGE

Chat messages.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| `chat_id` | UUID | FK → chats(id) ON DELETE CASCADE | Chat reference |
| `sender_id` | UUID | FK → users(id), NOT NULL | Message author |
| `content` | TEXT | NOT NULL, LENGTH 1-2000 | Message text |
| `flagged` | BOOLEAN | DEFAULT FALSE | Content filter flagged |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Send timestamp |

**Indexes**:
- `idx_messages_chat_created` ON (chat_id, created_at DESC)

---

---

### PERSON_RATING

Binary ratings of meal companions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| `rater_id` | UUID | FK → users(id) ON DELETE CASCADE | Who rated |
| `rated_id` | UUID | FK → users(id), NOT NULL | Who was rated |
| `request_id` | UUID | FK → meal_requests(id), NOT NULL | Associated request |
| `showed_up` | BOOLEAN | NOT NULL | Did they show up? |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Rating timestamp |

**Constraints**:
- UNIQUE (rater_id, rated_id, request_id) - One rating per pair per meal
- rater_id != rated_id - Cannot rate self

---

### REPORT

User reports for safety/moderation (manual handling via email for MVP).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| `reporter_id` | UUID | FK → users(id), NOT NULL | Who reported |
| `reported_id` | UUID | FK → users(id), NOT NULL | Who was reported |
| `reason` | TEXT | NOT NULL | Report reason |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Report timestamp |

---

### NOTIFICATION

Push notification records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | UUID | PK, DEFAULT uuid_generate_v4() | Primary key |
| `user_id` | UUID | FK → users(id) ON DELETE CASCADE | Recipient |
| `type` | TEXT | NOT NULL | Notification type |
| `title` | TEXT | NOT NULL | Notification title |
| `body` | TEXT | NOT NULL | Notification body |
| `data` | JSONB | DEFAULT '{}' | Deep link data |
| `read` | BOOLEAN | DEFAULT FALSE | Read status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Send timestamp |

**Indexes**:
- `idx_notifications_user_unread` ON (user_id, created_at DESC) WHERE read = FALSE

---

---

## Row-Level Security Policies

All tables have RLS enabled. Key policies:

### USER

**IMPORTANT (Constitution II)**: The `phone` column contains PII and MUST NOT be exposed in API responses. Use the `public_profiles` view for all client queries.

```sql
-- Create view that excludes sensitive columns
CREATE VIEW public_profiles AS
SELECT
  id, firebase_uid, name, photo_url, age, gender, city, persona,
  bio, meal_count, language, last_active_at, created_at
FROM users
WHERE deleted_at IS NULL AND banned_at IS NULL;

-- Grant SELECT on view (not base table) to authenticated users
GRANT SELECT ON public_profiles TO authenticated;

-- Base table: only own row readable (for profile editing)
CREATE POLICY "Own profile readable"
  ON users FOR SELECT
  USING (auth.uid() = id);

-- Users can update only their own row
CREATE POLICY "Own profile editable"
  ON users FOR UPDATE
  USING (auth.uid() = id);
```

**Client Code**: Always query `public_profiles` view, never `users` table directly (except for own profile).

### USER_PREFERENCES
```sql
-- Users can only read/write their own preferences
CREATE POLICY "Own preferences only"
  ON user_preferences FOR ALL
  USING (user_id = auth.uid());
```

### MEAL_REQUEST
```sql
-- Active requests visible (time_window > NOW)
CREATE POLICY "Active requests visible"
  ON meal_requests FOR SELECT
  USING (time_window > NOW());

-- Only creator can modify
CREATE POLICY "Creator can modify"
  ON meal_requests FOR UPDATE
  USING (requester_id = auth.uid());

-- Only creator can delete (cancel)
CREATE POLICY "Creator can cancel"
  ON meal_requests FOR DELETE
  USING (requester_id = auth.uid());
```

### REQUEST_PARTICIPANT
```sql
-- Participants of the request can read
CREATE POLICY "Participants readable"
  ON request_participants FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM meal_requests
      WHERE id = request_participants.request_id
      AND (requester_id = auth.uid() OR time_window > NOW())
    )
  );

-- Users can join requests (INSERT)
CREATE POLICY "Users can join"
  ON request_participants FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Creator can approve/reject (UPDATE)
CREATE POLICY "Creator can approve"
  ON request_participants FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM meal_requests
      WHERE id = request_participants.request_id
      AND requester_id = auth.uid()
    )
  );
```

### MESSAGE
```sql
-- Only chat participants can read/write
CREATE POLICY "Participants only"
  ON messages FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM chat_participants
      WHERE chat_id = messages.chat_id
      AND user_id = auth.uid()
    )
  );
```

### PERSON_RATING
```sql
-- Users can only see aggregate data (meal_count), not individual ratings
CREATE POLICY "Insert own ratings only"
  ON person_ratings FOR INSERT
  WITH CHECK (rater_id = auth.uid());
```

### REPORT
```sql
-- Users can only insert reports
CREATE POLICY "Insert own reports"
  ON reports FOR INSERT
  WITH CHECK (reporter_id = auth.uid());
```

### NOTIFICATION
```sql
-- Users can only read their own notifications
CREATE POLICY "Own notifications only"
  ON notifications FOR SELECT
  USING (user_id = auth.uid());
```

---

## Database Triggers (Lean MVP)

| Trigger | Table | Event | Action |
|---------|-------|-------|--------|
| `increment_meal_count` | person_ratings | AFTER INSERT | If showed_up = true, increment meal_count on rated user |
| `enforce_group_capacity` | request_participants | BEFORE INSERT | Lock row, check count < group_size, reject if full |
| `filter_message_content` | messages | BEFORE INSERT | Check simple blocklist, set flagged = true if needed |

**Removed triggers (deferred post-MVP):**
- ❌ `award_local_guide` (no badges)
- ❌ `expire_requests` (no cron, just query filter)
- ❌ `cleanup_rate_limits` (no rate limits table)
- ❌ `cleanup_expired_chats` (manual cleanup)

---

## Cuisine Types (Reference)

> **Source of truth**: `chopsticks/lib/constants.ts` → `CUISINE_CATEGORIES`

| Key | Label (EN) | Label (VI) |
|-----|------------|------------|
| `noodles_congee` | Noodles & Congee | Bún/Phở/Cháo |
| `rice` | Rice | Cơm |
| `hotpot_grill` | Hotpot & Grill | Lẩu & Nướng |
| `seafood` | Seafood | Hải sản |
| `bread` | Bread | Bánh mì |
| `vietnamese_cakes` | Vietnamese Cakes | Bánh Việt |
| `snack` | Snack | Ăn vặt |
| `dessert` | Dessert | Tráng miệng |
| `drinks` | Drinks | Đồ uống |
| `fast_food` | Fast Food | Đồ ăn nhanh |
| `international` | International Food | Món quốc tế |
| `healthy` | Healthy Food | Đồ ăn healthy |
| `veggie` | Veggie | Chay |
| `others` | Others | Khác |

**Total: 14 categories**

---

## Budget Ranges (Reference)

| Key | Label | Range (VND) |
|-----|-------|-------------|
| `under_50k` | Under 50k | < 50,000 |
| `50k_150k` | 50k – 150k | 50,000 – 150,000 |
| `150k_500k` | 150k – 500k | 150,000 – 500,000 |
| `500k_plus` | 500k+ | > 500,000 |
