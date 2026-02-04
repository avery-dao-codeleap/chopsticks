# Feature Spec: Curated Lists & Food Discovery

*Last Updated: February 3, 2026*
*Status: Post-MVP*

---

## 1. Overview

### 1.1 What Is This?
A discovery system where users browse curated, ranked lists of restaurants by hyper-specific categories (e.g., "Best Northern-Style Pho in HCMC", "Best Bún Chả Spots in District 1"). Users can mark places as "been there", nominate restaurants for lists, write reviews, and save favorites.

### 1.2 Why Build This?
- **Solo value:** Users get value from the app even when not actively planning meals with others
- **Retention hook:** Browsing lists brings users back between meal requests
- **Discovery credibility:** Hyper-specific lists signal deep local knowledge (not generic "best restaurants" lists)
- **Content flywheel:** User nominations and reviews create a content engine
- **Bridge to social:** Discovery flows back to "invite someone to eat here"
- **Monetization path:** Paywalled full lists, travel city access, personalized recommendations

### 1.3 Design Principles
1. **Hyper-specific > generic:** "Best bánh cuốn in Phú Nhuận" beats "Best Vietnamese Food"
2. **Opinionated rankings:** Lists are ranked #1, #2, #3 - not just collections
3. **Hybrid curation:** Editorial quality + community nominations
4. **Action-oriented:** Every restaurant should have a clear next action (save, mark visited, invite friends, create meal request)
5. **Local-first:** Lists are city-specific; other cities are a premium feature

---

## 2. Core Concepts

### 2.1 Lists
A ranked collection of restaurants for a specific category.

**List attributes:**
- Title (e.g., "Best Northern-Style Pho in HCMC")
- Category/cuisine type
- City
- District (optional - can be city-wide or district-specific)
- Description (editorial context)
- Cover image
- Restaurants (ordered 1-N)
- Created by (editorial team or "community picks")
- Last updated date

**List types:**
| Type | Who Creates | Examples |
|------|-------------|----------|
| Editorial | Chopsticks team | "The 10 Best Phở Spots in Saigon" |
| District-Specific | Chopsticks team | "Best Cơm Tấm in District 3" |
| Hyper-Niche | Chopsticks team | "Best Bún Ngan (Duck Noodle) Spots" |
| Community Picks | Aggregated from nominations | "Community Favorites: Late Night Eats" |

### 2.2 Restaurants (Enhanced)
Building on MVP restaurant data with discovery features.

**New attributes:**
- Lists it appears on (with rank)
- Average rating (from reviews)
- Review count
- "Been there" count
- Nomination count
- Photos (from reviews)

### 2.3 User Actions on Restaurants

| Action | Description | Visibility |
|--------|-------------|------------|
| **Save to Favorites** | Add to personal favorites list | Private (only you see your favorites) |
| **Mark "Been There"** | Record that you've visited | Public (count shown, your name not shown) |
| **Write Review** | Text + optional photos + rating | Public |
| **Nominate for List** | Suggest restaurant for a specific list | Semi-public (nomination count visible) |
| **Share** | Send to connections | Social |
| **Invite to Eat** | Create meal request at this restaurant | Social |

---

## 3. User Experience

### 3.1 Discovery Home (New Tab)

**Entry point:** New bottom tab "Discover" (alongside Browse Requests, Chat, Profile)

**Layout:**
```
┌─────────────────────────────────────┐
│ Discover                     [HCMC ▼]│
├─────────────────────────────────────┤
│ 🔍 Search restaurants or lists      │
├─────────────────────────────────────┤
│ Your Lists                          │
│ ┌─────────┐ ┌─────────┐            │
│ │ ❤️ Faves │ │ ✓ Been  │            │
│ │   12    │ │ There 8 │            │
│ └─────────┘ └─────────┘            │
├─────────────────────────────────────┤
│ Popular Lists                       │
│ ┌─────────────────────────────────┐ │
│ │ 🍜 Best Pho in Saigon          │ │
│ │ 15 spots · Updated Jan 2026    │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🥖 Best Bánh Mì in District 1  │ │
│ │ 8 spots · Updated Jan 2026     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Browse by Category                  │
│ [Pho] [Bún] [Cơm] [Bánh Mì] [More] │
│                                     │
│ Browse by District                  │
│ [D1] [D3] [Bình Thạnh] [Phú Nhuận] │
└─────────────────────────────────────┘
```

### 3.2 List View

**When user taps a list:**

```
┌─────────────────────────────────────┐
│ ← Best Northern-Style Pho      [⋮] │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │        [Cover Image]           │ │
│ └─────────────────────────────────┘ │
│ Ho Chi Minh City · 12 spots        │
│ Updated February 2026              │
│                                     │
│ "Northern-style pho is all about   │
│ the clear, delicate broth..."      │
│                                     │
│ Your progress: 3/12 visited ████░░ │
├─────────────────────────────────────┤
│ #1 Phở Thìn Bờ Hồ                  │
│    ⭐ 4.8 · 47 reviews · D1        │
│    [✓ Been There] [❤️] [Share]    │
├─────────────────────────────────────┤
│ #2 Phở Lệ                          │
│    ⭐ 4.6 · 32 reviews · D3        │
│    [Mark Visited] [❤️] [Share]     │
├─────────────────────────────────────┤
│ #3 Phở Hòa Pasteur                 │
│    ⭐ 4.5 · 89 reviews · D3        │
│    [Mark Visited] [❤️] [Share]     │
├─────────────────────────────────────┤
│                                     │
│  🔒 See all 12 spots               │
│  [Unlock Full List - Premium]       │
│                                     │
└─────────────────────────────────────┘
```

**Free vs Premium:**
- Free: See top 3 restaurants per list
- Premium: See full list

### 3.3 Restaurant Detail (Enhanced)

**When user taps a restaurant:**

```
┌─────────────────────────────────────┐
│ ← Phở Thìn Bờ Hồ              [⋮]  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │    [Photo Gallery Carousel]    │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Phở Thìn Bờ Hồ                      │
│ ⭐ 4.8 (47 reviews) · $$ · District 1│
│ 📍 13 Lò Đúc, Hai Bà Trưng          │
│                                     │
│ ┌─────────┬─────────┬─────────┐    │
│ │ ❤️ Save │ ✓ Been  │ 📤 Share│    │
│ │         │ There   │         │    │
│ └─────────┴─────────┴─────────┘    │
│                                     │
│ [🍽️ Invite Friends to Eat Here]    │
│ [📝 Create Meal Request]           │
├─────────────────────────────────────┤
│ Appears on Lists                    │
│ • #1 on Best Northern-Style Pho    │
│ • #3 on Best Pho in Saigon         │
├─────────────────────────────────────┤
│ 127 people have been here          │
├─────────────────────────────────────┤
│ Reviews (47)                        │
│ ┌─────────────────────────────────┐ │
│ │ ⭐⭐⭐⭐⭐ · Mai L. · Jan 2026   │ │
│ │ "The broth is incredible..."    │ │
│ │ [📷 Photo]                      │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ ⭐⭐⭐⭐ · David T. · Dec 2025   │ │
│ │ "Great pho, long wait..."       │ │
│ └─────────────────────────────────┘ │
│                                     │
│ [Write a Review]                    │
├─────────────────────────────────────┤
│ Nominate for a List                 │
│ [Suggest for another list →]        │
└─────────────────────────────────────┘
```

### 3.4 Personal Lists

**Favorites:**
```
┌─────────────────────────────────────┐
│ ← My Favorites                      │
├─────────────────────────────────────┤
│ 12 saved restaurants                │
│                                     │
│ Filter: [All] [Pho] [Bún] [Cơm]    │
├─────────────────────────────────────┤
│ Phở Thìn Bờ Hồ                      │
│ ⭐ 4.8 · D1 · Saved Jan 15         │
│ [Remove] [Been There?]              │
├─────────────────────────────────────┤
│ Bún Chả Hương Liên                  │
│ ⭐ 4.7 · D3 · Saved Jan 10         │
│ [Remove] [✓ Visited Jan 20]        │
└─────────────────────────────────────┘
```

**Been There:**
```
┌─────────────────────────────────────┐
│ ← Places I've Been                  │
├─────────────────────────────────────┤
│ 8 restaurants visited               │
│                                     │
│ Filter: [All] [Pho] [Bún] [Cơm]    │
├─────────────────────────────────────┤
│ Phở Thìn Bờ Hồ                      │
│ Visited Jan 20, 2026               │
│ [Write Review] [Share]              │
├─────────────────────────────────────┤
│ Cơm Tấm Bụi Saigon                  │
│ Visited Jan 18, 2026               │
│ ⭐⭐⭐⭐⭐ "Amazing broken rice..."  │
└─────────────────────────────────────┘
```

### 3.5 Writing a Review

**Flow:**
```
1. Tap "Write a Review" on restaurant detail

2. Review screen:
┌─────────────────────────────────────┐
│ ← Review Phở Thìn Bờ Hồ            │
├─────────────────────────────────────┤
│ Your rating                         │
│ ☆ ☆ ☆ ☆ ☆                          │
├─────────────────────────────────────┤
│ Your review                         │
│ ┌─────────────────────────────────┐ │
│ │ What did you think?             │ │
│ │                                 │ │
│ │                                 │ │
│ └─────────────────────────────────┘ │
│ 0/500 characters                    │
├─────────────────────────────────────┤
│ Add photos (optional)               │
│ [📷 +]                              │
├─────────────────────────────────────┤
│ [Submit Review]                     │
└─────────────────────────────────────┘

3. Review posted, appears on restaurant detail
```

**Review requirements:**
- Rating: Required (1-5 stars)
- Text: Required (min 20 characters, max 500)
- Photos: Optional (max 3)

### 3.6 Nominating a Restaurant

**Flow:**
```
1. From restaurant detail, tap "Nominate for a List"

2. Nomination screen:
┌─────────────────────────────────────┐
│ ← Nominate Restaurant               │
├─────────────────────────────────────┤
│ Phở Thìn Bờ Hồ                      │
│                                     │
│ Which list should this be on?       │
│                                     │
│ ○ Best Northern-Style Pho          │
│ ○ Best Pho in Saigon               │
│ ○ Best Pho in District 1           │
│ ○ Hidden Gems in HCMC              │
│                                     │
│ Or suggest a new list:              │
│ ┌─────────────────────────────────┐ │
│ │ e.g., "Best Late Night Pho"    │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ [Submit Nomination]                 │
└─────────────────────────────────────┘

3. Nomination recorded
   - If existing list: +1 nomination count
   - If new list suggestion: queued for editorial review
```

### 3.7 Social Features

**Share to Connections:**
```
1. Tap Share on restaurant/list

2. Share sheet:
┌─────────────────────────────────────┐
│ Share Phở Thìn Bờ Hồ               │
├─────────────────────────────────────┤
│ Send to Chopsticks connections      │
│                                     │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐   │
│ │ Mai │ │David│ │ Linh│ │ +   │   │
│ └─────┘ └─────┘ └─────┘ └─────┘   │
│                                     │
│ Add a message (optional):           │
│ ┌─────────────────────────────────┐ │
│ │ "You have to try this place!"  │ │
│ └─────────────────────────────────┘ │
├─────────────────────────────────────┤
│ Or share externally                 │
│ [Copy Link] [WhatsApp] [Messenger] │
├─────────────────────────────────────┤
│ [Send]                              │
└─────────────────────────────────────┘
```

**Invite to Eat:**
```
1. Tap "Invite Friends to Eat Here"

2. Invite screen:
┌─────────────────────────────────────┐
│ Invite friends to eat at            │
│ Phở Thìn Bờ Hồ                      │
├─────────────────────────────────────┤
│ When?                               │
│ [Today ▼] [7:00 PM ▼]              │
├─────────────────────────────────────┤
│ Who?                                │
│ Select connections:                 │
│ ☑️ Mai L.                           │
│ ☑️ David T.                         │
│ ☐ Linh N.                          │
│                                     │
│ ☐ Also open to strangers           │
│   (Creates public meal request)     │
├─────────────────────────────────────┤
│ [Send Invite]                       │
└─────────────────────────────────────┘

3. If connections only:
   - Creates private meal request
   - Selected friends get notification
   - They can accept/decline

4. If "open to strangers" checked:
   - Creates public meal request (visible in Browse)
   - Friends are pre-invited
   - Strangers can request to join
```

### 3.8 Browse Other Cities (Premium)

**City selector:**
```
┌─────────────────────────────────────┐
│ Discover                     [HCMC ▼]│
│                              ┌──────┐│
│                              │ HCMC ✓││
│                              │──────││
│                              │Hanoi 🔒│
│                              │Da Nang🔒│
│                              │Bangkok🔒│
│                              └──────┘│
```

**If user selects locked city:**
```
┌─────────────────────────────────────┐
│ 🔒 Unlock Hanoi Lists              │
│                                     │
│ Planning a trip to Hanoi?           │
│ Get access to all curated lists     │
│ before you go.                      │
│                                     │
│ • 15+ curated lists                 │
│ • 200+ reviewed restaurants         │
│ • Offline access                    │
│                                     │
│ [Unlock for $X.XX]                  │
│ [Unlock All Cities - $XX.XX/year]  │
└─────────────────────────────────────┘
```

---

## 4. Editorial Workflow

### 4.1 List Creation (Internal)

**Process:**
1. Editorial team identifies list opportunity (gap in coverage, user requests, trending searches)
2. Create list in admin panel with title, description, category, city, district
3. Research and rank restaurants (visits, tastings, local input)
4. Write editorial descriptions for each pick
5. Publish list

**List maintenance:**
- Quarterly review of all lists
- Update rankings based on quality changes, closures, new openings
- Review community nominations for potential additions

### 4.2 Community Nominations

**Nomination flow:**
1. User nominates restaurant for existing or new list
2. Nomination logged with user ID, restaurant, list, timestamp
3. If nomination count for restaurant + list exceeds threshold (e.g., 5), flag for editorial review
4. Editorial team reviews flagged nominations monthly
5. If approved, restaurant added to list (or new list created)

**New list suggestions:**
1. User suggests new list category
2. Logged for editorial review
3. If multiple users suggest similar lists, prioritize for creation

### 4.3 Review Moderation

**Automated:**
- Flag reviews with profanity
- Flag suspiciously short reviews (<20 chars)
- Flag reviews from accounts with no other activity

**Manual:**
- Reported reviews go to moderation queue
- Remove reviews that are spam, offensive, or clearly fake
- No editing of reviews - remove or keep as-is

---

## 5. Data Model

### 5.1 New Tables

**lists**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| title | text | List title |
| slug | text | URL-friendly identifier |
| description | text | Editorial description |
| category | text | Cuisine category |
| city | text | City (e.g., "hcmc") |
| district | text | District (nullable for city-wide) |
| cover_image_url | text | Cover image |
| list_type | enum | editorial, community_picks |
| is_published | boolean | Visible to users |
| created_at | timestamp | |
| updated_at | timestamp | |

**list_restaurants**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| list_id | uuid | FK to lists |
| restaurant_id | uuid | FK to restaurants |
| rank | int | Position in list (1 = top) |
| editorial_note | text | Why this pick (optional) |
| added_at | timestamp | |

**user_favorites**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| restaurant_id | uuid | FK to restaurants |
| created_at | timestamp | |

**user_visits**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| restaurant_id | uuid | FK to restaurants |
| visited_at | timestamp | When they marked it (or actual date if specified) |

**reviews**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| restaurant_id | uuid | FK to restaurants |
| rating | int | 1-5 stars |
| text | text | Review text |
| photos | jsonb | Array of photo URLs |
| is_visible | boolean | False if moderated out |
| created_at | timestamp | |
| updated_at | timestamp | |

**nominations**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| restaurant_id | uuid | FK to restaurants |
| list_id | uuid | FK to lists (nullable) |
| suggested_list_name | text | If suggesting new list |
| created_at | timestamp | |

**restaurant_stats** (materialized/cached)
| Column | Type | Description |
|--------|------|-------------|
| restaurant_id | uuid | FK to restaurants |
| avg_rating | decimal | Average review rating |
| review_count | int | Number of reviews |
| visit_count | int | Number of "been there" marks |
| nomination_count | int | Number of nominations |
| updated_at | timestamp | |

### 5.2 Enhanced restaurants Table

Add columns:
| Column | Type | Description |
|--------|------|-------------|
| photos | jsonb | Array of photo URLs (from reviews) |
| is_verified | boolean | Confirmed by editorial team |

### 5.3 RLS Policies

```sql
-- Lists are public (published ones)
CREATE POLICY "Published lists are public"
ON lists FOR SELECT
USING (is_published = true);

-- List restaurants are public
CREATE POLICY "List restaurants are public"
ON list_restaurants FOR SELECT
USING (true);

-- Favorites are private to owner
CREATE POLICY "Users see own favorites"
ON user_favorites FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users manage own favorites"
ON user_favorites FOR ALL
USING (auth.uid() = user_id);

-- Visits are private to owner (but counts are aggregated publicly)
CREATE POLICY "Users see own visits"
ON user_visits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users manage own visits"
ON user_visits FOR ALL
USING (auth.uid() = user_id);

-- Reviews are public
CREATE POLICY "Reviews are public"
ON reviews FOR SELECT
USING (is_visible = true);

CREATE POLICY "Users manage own reviews"
ON reviews FOR ALL
USING (auth.uid() = user_id);

-- Nominations are write-only for users
CREATE POLICY "Users can nominate"
ON nominations FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

---

## 6. Monetization Details

### 6.1 Free Tier
- See top 3 restaurants per list
- Mark "been there" (unlimited)
- Save favorites (unlimited)
- Write reviews (unlimited)
- Nominate restaurants (unlimited)
- Browse lists in current city only

### 6.2 Premium Features

| Feature | Price Model | Description |
|---------|-------------|-------------|
| Full list access | Subscription | See all restaurants in all lists |
| Other cities | Per-city or subscription | Browse lists in cities you're not in |
| Personalized recs | Per-request or subscription | "Where should I eat tonight?" AI recommendations |

**Pricing TBD** - needs market research and testing.

### 6.3 Paywall UX

**Soft paywall (lists):**
- Show top 3 freely
- Blur/lock items 4+
- "Unlock full list" CTA
- Can still save top 3 to favorites

**Hard paywall (other cities):**
- City selector shows lock icon
- Tapping locked city shows upgrade modal
- No preview of locked city content

---

## 7. Future Considerations

### 7.1 Personalized Recommendations
- "Where should I eat tonight?" based on:
  - Cuisine preferences
  - Quiz answers
  - Past visits and reviews
  - Time of day
  - Budget
  - Location
- Could be AI-powered or rule-based

### 7.2 List Progress & Gamification
- "Complete the list" challenges
- Badges for visiting all spots on a list
- Leaderboards for most lists completed
- Seasonal/limited-time lists

### 7.3 User-Created Lists
- Let users create and share their own lists
- Could enable "food influencer" use case
- Moderation challenges to consider

### 7.4 Restaurant Partnerships
- Promoted placement in lists (paid)
- Exclusive deals for Chopsticks users
- Reservation integration

### 7.5 Offline Access
- Download lists for offline viewing (travel use case)
- Premium feature

---

## 8. Open Questions

1. **Initial list count:** How many lists do we need at launch to feel valuable? 10? 20? 50?

2. **Nomination threshold:** How many nominations before flagging for editorial review?

3. **Review incentives:** Should we incentivize reviews (badges, visibility) or let it be organic?

4. **Premium pricing:** What's the right price point for full list access? Per-city pricing for travel?

5. **Connection requirement:** Must users be "connected" to share/invite, or can they share with any user?

6. **List freshness:** How do we communicate list freshness and handle restaurant closures?

---

## 9. Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Discovery tab opens/DAU | >30% | Are users engaging with discovery? |
| Lists viewed/user/week | >3 | Is the content compelling? |
| "Been there" marks/user | >5 (30-day) | Are users tracking visits? |
| Favorites saved/user | >3 (30-day) | Are users saving for later? |
| Reviews written/user | >1 (30-day) | Are users contributing content? |
| Nominations/week | >20 | Is community curation working? |
| Premium conversion | >5% | Will users pay for full access? |
| Discovery → Meal request | >10% | Does discovery drive social eating? |

---

## 10. Implementation Phases

### Phase 1: Core Discovery
- Lists (editorial only, no community)
- List browsing and detail view
- Restaurant detail (enhanced)
- Top 3 free, full list paywalled
- "Been there" tracking
- Save to favorites

### Phase 2: Reviews & Social
- Write reviews
- Review display on restaurants
- Share to connections
- Invite to eat flow

### Phase 3: Community & Expansion
- Nominations
- Community picks lists
- Browse other cities (premium)
- Personalized recommendations

---

*End of spec*
