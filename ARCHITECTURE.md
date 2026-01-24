# Solution Architecture
## Chopsticks - Technical Implementation Guide

---

## 1. Recommended Tech Stack

### 1.1 Frontend (Mobile)
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | **React Native + Expo** | Cross-platform, fast iteration, OTA updates |
| Navigation | Expo Router | File-based routing, deep linking support |
| State Management | Zustand | Lightweight, simple, great for real-time data |
| UI Components | Tamagui or NativeWind | Performance + Gen Z aesthetic flexibility |
| Maps | react-native-maps + Mapbox | Custom styling, clustering, smooth UX |
| Forms | React Hook Form + Zod | Type-safe validation |

### 1.2 Backend
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Runtime | **Node.js + TypeScript** | Same language as frontend, type safety |
| Framework | Hono or Express | Lightweight, fast |
| API | tRPC or REST | End-to-end type safety with tRPC |
| Real-time | Socket.io or Ably | Chat + live matching updates |
| Auth | Clerk or Supabase Auth | Social login, phone verification |

### 1.3 Database & Storage
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Primary DB | **PostgreSQL** (via Supabase or Neon) | Relational data, PostGIS for geolocation |
| Cache | Redis (Upstash) | Match sessions, real-time presence |
| File Storage | Cloudflare R2 or S3 | Profile images, restaurant photos |
| Search | Meilisearch or Algolia | Fast restaurant/user search |

### 1.4 Infrastructure
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Hosting | Vercel / Railway / Fly.io | Easy deployment, edge functions |
| CDN | Cloudflare | Global, fast image delivery |
| Push Notifications | Expo Push + OneSignal | Native notifications |
| Analytics | PostHog or Mixpanel | Product analytics, funnel tracking |
| Monitoring | Sentry | Error tracking |

### 1.5 AI/ML
| Layer | Technology | Rationale |
|-------|------------|-----------|
| Recommendations | OpenAI API / Claude API | Restaurant suggestions, match scoring |
| Vector Search | Pinecone or pgvector | Preference-based matching |

---

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        MOBILE APP (Expo)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────────────┐ │
│  │  Auth    │  │  Match   │  │  Chat    │  │  Discovery/Map   │ │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────────┬─────────┘ │
└───────┼─────────────┼────────────┼──────────────────┼───────────┘
        │             │            │                  │
        ▼             ▼            ▼                  ▼
┌─────────────────────────────────────────────────────────────────┐
│                         API GATEWAY                             │
│                    (REST/tRPC + WebSocket)                      │
└───────┬─────────────┬────────────┬──────────────────┬───────────┘
        │             │            │                  │
        ▼             ▼            ▼                  ▼
┌──────────────┐ ┌──────────┐ ┌──────────┐ ┌───────────────────┐
│ Auth Service │ │  Match   │ │  Chat    │ │ Discovery Service │
│   (Clerk)    │ │  Engine  │ │ Service  │ │  (AI + Search)    │
└──────────────┘ └────┬─────┘ └────┬─────┘ └─────────┬─────────┘
                      │            │                 │
                      ▼            ▼                 ▼
              ┌─────────────────────────────────────────┐
              │              DATA LAYER                 │
              │  ┌────────────┐  ┌────────────────────┐ │
              │  │ PostgreSQL │  │ Redis (Sessions/   │ │
              │  │ + PostGIS  │  │  Presence/Cache)   │ │
              │  └────────────┘  └────────────────────┘ │
              └─────────────────────────────────────────┘
```

---

## 3. Database Schema (Core Tables)

```sql
-- Users
users (
  id, email, phone, name, age, bio,
  profile_image_url, verification_status,
  created_at, updated_at
)

-- User Preferences
user_preferences (
  user_id, cuisine_types[], dietary_restrictions[],
  allergies[], budget_min, budget_max,
  preferred_radius_km
)

-- Restaurants/Stalls
restaurants (
  id, name, description, cuisine_type,
  price_range, latitude, longitude,
  image_urls[], visit_count, rating_avg,
  is_hidden_gem, submitted_by_user_id
)

-- Matches
matches (
  id, user_1_id, user_2_id,
  status (pending/accepted/expired/completed),
  restaurant_id, scheduled_time,
  expires_at, created_at
)

-- Messages
messages (
  id, match_id, sender_id,
  content, sent_at, read_at
)

-- Meal History
meal_history (
  id, match_id, restaurant_id,
  completed_at, user_1_rating, user_2_rating,
  restaurant_review
)

-- Groups
groups (
  id, name, description, cuisine_focus,
  created_by, member_count
)

-- Saved Connections
saved_connections (
  user_id, connected_user_id,
  meals_together, saved_at
)
```

---

## 4. Development Phases

### Phase 1: MVP (4-6 weeks)
**Goal:** Core loop - Sign up → Set preferences → Match → Chat → Meet

| Feature | Priority | Effort |
|---------|----------|--------|
| User auth (phone/social) | P0 | 3 days |
| Profile creation + preferences | P0 | 4 days |
| Basic matching algorithm | P0 | 5 days |
| Match feed UI | P0 | 4 days |
| 1:1 Chat | P0 | 5 days |
| Simple map with restaurants | P0 | 4 days |
| Match expiration (24hr) | P0 | 2 days |
| Push notifications | P1 | 3 days |

**MVP Scope:**
- Single city launch
- Manual restaurant seeding (50-100 spots)
- Basic location-based matching
- No AI features yet
- No groups

---

### Phase 2: Core Experience (4-6 weeks)
**Goal:** Complete the meal cycle, add stickiness

| Feature | Priority | Effort |
|---------|----------|--------|
| Meal completion flow | P0 | 3 days |
| Connection rating system | P0 | 3 days |
| Restaurant reviews | P0 | 4 days |
| Meal count tracking | P0 | 2 days |
| Save connections | P0 | 2 days |
| User verification | P1 | 4 days |
| Improved matching algorithm | P1 | 5 days |
| Hidden gems submission | P1 | 4 days |

---

### Phase 3: Discovery & AI (4-6 weeks)
**Goal:** Smart recommendations, richer discovery

| Feature | Priority | Effort |
|---------|----------|--------|
| AI restaurant suggestions | P0 | 5 days |
| Advanced map filtering | P0 | 4 days |
| Cuisine category browsing | P0 | 3 days |
| Search functionality | P0 | 3 days |
| Preference learning | P1 | 5 days |
| "Find more people" for group meals | P1 | 5 days |

---

### Phase 4: Social & Growth (4-6 weeks)
**Goal:** Community features, retention

| Feature | Priority | Effort |
|---------|----------|--------|
| Food groups | P0 | 6 days |
| Group chat | P0 | 4 days |
| Share to social media | P1 | 3 days |
| Referral system | P1 | 4 days |
| Restaurant partnerships | P1 | 5 days |
| Premium features | P2 | 5 days |

---

## 5. Matching Algorithm (v1)

```typescript
interface MatchScore {
  userId: string;
  score: number;
  factors: {
    cuisineOverlap: number;    // 0-30 points
    budgetMatch: number;       // 0-20 points
    timeAvailability: number;  // 0-20 points
    proximity: number;         // 0-20 points
    mealCountSimilarity: number; // 0-10 points (experience level)
  };
}

// v1: Simple weighted scoring
function calculateMatchScore(user1, user2, context): MatchScore {
  // Cuisine overlap (Jaccard similarity)
  const cuisineOverlap = jaccardSimilarity(
    user1.preferences.cuisines,
    user2.preferences.cuisines
  ) * 30;

  // Budget compatibility (overlapping ranges)
  const budgetMatch = budgetOverlap(
    user1.preferences.budget,
    user2.preferences.budget
  ) * 20;

  // Time window overlap
  const timeMatch = timeWindowOverlap(
    user1.availableTimes,
    user2.availableTimes
  ) * 20;

  // Distance (inverse, closer = higher)
  const proximity = Math.max(0, 20 - (distanceKm * 2));

  // Experience similarity (avoid big gaps)
  const expMatch = 10 - Math.min(10,
    Math.abs(user1.mealCount - user2.mealCount)
  );

  return {
    userId: user2.id,
    score: cuisineOverlap + budgetMatch + timeMatch + proximity + expMatch,
    factors: { cuisineOverlap, budgetMatch, timeMatch, proximity, expMatch }
  };
}
```

---

## 6. Key API Endpoints

```
Authentication
POST   /auth/phone/send-otp
POST   /auth/phone/verify
POST   /auth/social/:provider

Users
GET    /users/me
PATCH  /users/me
POST   /users/me/preferences
GET    /users/:id/profile (public view)

Matching
GET    /matches/feed           # Get potential matches
POST   /matches/:userId/like   # Send match request
POST   /matches/:id/accept
GET    /matches/active         # Current active matches
POST   /matches/:id/complete   # Mark meal as done

Chat
GET    /matches/:id/messages
POST   /matches/:id/messages
WS     /ws/chat/:matchId       # Real-time messaging

Discovery
GET    /restaurants?lat=&lng=&cuisine=&budget=
GET    /restaurants/:id
POST   /restaurants            # Submit hidden gem
GET    /restaurants/suggestions # AI-powered

Groups
GET    /groups
POST   /groups
GET    /groups/:id/messages
POST   /groups/:id/join
```

---

## 7. Project Structure

```
chopsticks/
├── apps/
│   ├── mobile/                 # Expo app
│   │   ├── app/               # Expo Router pages
│   │   │   ├── (auth)/        # Auth screens
│   │   │   ├── (tabs)/        # Main tab navigation
│   │   │   │   ├── feed/      # Match feed
│   │   │   │   ├── discover/  # Map & discovery
│   │   │   │   ├── chat/      # Messages
│   │   │   │   └── profile/   # User profile
│   │   │   └── match/[id]/    # Match detail
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── stores/            # Zustand stores
│   │   └── utils/
│   │
│   └── api/                   # Backend
│       ├── src/
│       │   ├── routes/
│       │   ├── services/
│       │   ├── models/
│       │   └── utils/
│       └── prisma/            # DB schema
│
├── packages/
│   └── shared/                # Shared types, utils
│
└── package.json               # Monorepo root
```

---

## 8. Recommended Next Steps

### Immediate (This Week)
1. **Set up monorepo** with Turborepo or Nx
2. **Initialize Expo app** with Expo Router
3. **Set up Supabase** project (auth + database + storage)
4. **Create DB schema** with Prisma migrations
5. **Design core screens** in Figma (or start with UI framework)

### Week 2-3
1. Build auth flow (phone OTP + profile setup)
2. Implement preference selection UI
3. Basic matching endpoint + feed UI
4. Seed 50 restaurants in target city

### Week 4-6
1. Chat implementation (Socket.io)
2. Map integration with restaurant pins
3. Match flow completion
4. Push notifications
5. Internal testing / dogfooding

---

## 9. Cost Estimates (MVP Scale)

| Service | Free Tier | Paid (1k-10k users) |
|---------|-----------|---------------------|
| Supabase | 500MB DB, 1GB storage | ~$25/mo |
| Vercel | 100GB bandwidth | ~$20/mo |
| Expo EAS | 30 builds/mo | ~$0-29/mo |
| Redis (Upstash) | 10k commands/day | ~$10/mo |
| Maps (Mapbox) | 50k loads/mo | ~$0-50/mo |
| Push (OneSignal) | 10k subscribers | Free |
| **Total MVP** | **~$0** | **~$85-135/mo** |

---

## 10. Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Cold start (no users) | Launch in 1 neighborhood, partner with food influencers |
| No restaurants data | Manual curation first, then community submissions |
| Real-time complexity | Use managed services (Ably/Pusher) vs self-hosted |
| Matching quality | Start simple, iterate based on completion rates |
| App store rejection | Follow guidelines, ensure photo moderation |

---

## 11. Frontend Design Guidelines

### 11.1 Design System

**Color Palette (Dark Theme - Default)**
```
Background:     #0a0a0a (near black)
Surface:        #171717 (cards, inputs)
Surface Elevated: #262626 (modals, dropdowns)
Primary:        #f97316 (orange - food vibes)
Secondary:      #d946ef (purple - accents)
Success:        #22c55e
Error:          #ef4444
Text Primary:   #ffffff
Text Secondary: #9ca3af
Text Muted:     #6b7280
```

**Typography**
- Headings: Inter Bold / SF Pro Bold
- Body: Inter Regular / SF Pro Regular
- Monospace: SF Mono (for numbers, codes)

**Spacing Scale (8px base)**
```
xs: 4px   sm: 8px   md: 16px   lg: 24px   xl: 32px   2xl: 48px
```

### 11.2 Component Patterns

**Cards**
- Rounded corners: 12-16px
- Subtle border or elevation
- Consistent padding: 16px

**Buttons**
- Primary: Solid orange background, white text
- Secondary: Ghost/outline style
- Height: 48-56px for touch targets
- Rounded: Full (pill) or 12px

**Inputs**
- Dark background (#171717)
- Subtle border on focus
- Clear placeholder text
- 48px minimum height

**Lists**
- Swipeable actions where appropriate
- Pull-to-refresh
- Skeleton loaders during fetch

### 11.3 Animation Guidelines

- Use `react-native-reanimated` for smooth 60fps animations
- Micro-interactions: 150-300ms duration
- Page transitions: 300-400ms
- Spring animations for natural feel
- Avoid blocking animations during data fetch

### 11.4 Accessibility

- Minimum touch target: 44x44px
- Color contrast ratio: 4.5:1 minimum
- Support dynamic font sizes
- Screen reader labels on all interactive elements

### 11.5 Key Screens Design Notes

**Login/Auth**
- Full-screen, centered content
- Large brand logo/emoji
- Phone input with country code picker
- Single CTA button

**Match Feed**
- Card-based layout (like Tinder but for food)
- Profile photo prominent
- Food preferences as tags
- Swipe or button interactions

**Discovery Map**
- Full-bleed map with custom dark styling
- Floating search bar at top
- Category chips for filtering
- Bottom sheet for restaurant details

**Chat**
- Message bubbles (sender right, receiver left)
- Timestamp grouping
- Restaurant suggestion cards inline
- Quick actions (share location, suggest place)

**Profile**
- Hero image at top
- Stats row (meal count, connections)
- Preferences as editable chips
- Settings accessible but not prominent

---

## 12. Backend Design Guidelines

### 12.1 API Design Principles

**RESTful Conventions**
- Use nouns for resources: `/users`, `/matches`, `/restaurants`
- HTTP methods: GET (read), POST (create), PATCH (update), DELETE (remove)
- Consistent response format:
```json
{
  "data": { ... },
  "meta": { "page": 1, "total": 100 },
  "error": null
}
```

**Error Handling**
```json
{
  "data": null,
  "error": {
    "code": "MATCH_EXPIRED",
    "message": "This match has expired",
    "details": { "expiredAt": "2024-01-20T12:00:00Z" }
  }
}
```

### 12.2 Supabase Patterns

**Row Level Security (RLS)**
- Always enable RLS on all tables
- Users can only read/write their own data
- Public data (restaurants) readable by all

**Real-time Subscriptions**
```typescript
// Subscribe to new messages
supabase
  .channel('messages')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'messages',
    filter: `match_id=eq.${matchId}`
  }, handleNewMessage)
  .subscribe();
```

**Edge Functions (for complex logic)**
- Matching algorithm
- AI-powered suggestions
- Notification triggers

### 12.3 Data Validation

**Use Zod schemas shared between frontend/backend**
```typescript
// packages/shared/schemas/user.ts
export const userProfileSchema = z.object({
  name: z.string().min(2).max(50),
  age: z.number().int().min(18).max(100),
  bio: z.string().max(200).optional(),
});
```

### 12.4 Performance Patterns

**Caching Strategy**
- User profiles: Cache for 5 minutes
- Restaurant data: Cache for 1 hour
- Match feed: No cache (real-time)

**Pagination**
- Default limit: 20 items
- Cursor-based for infinite scroll
- Include `hasMore` flag in response

**Geospatial Queries**
- Use PostGIS for proximity searches
- Index location columns
- Pre-calculate distances in query

### 12.5 Security Checklist

- [ ] All endpoints require authentication (except public reads)
- [ ] Rate limiting on auth endpoints
- [ ] Input sanitization on all user inputs
- [ ] No sensitive data in URLs
- [ ] HTTPS only
- [ ] Validate file uploads (type, size)
- [ ] Audit logs for sensitive operations

### 12.6 Background Jobs

**Scheduled Tasks**
- Expire old matches (every hour)
- Send reminder notifications (meal time approaching)
- Cleanup unused uploads (daily)

**Event-Driven**
- New match → Push notification
- Message received → Push notification
- Meal completed → Update stats

---

## 13. Testing Strategy

### 13.1 Frontend Testing

**Unit Tests**
- Zustand stores
- Utility functions
- Form validation

**Component Tests**
- React Native Testing Library
- Test user interactions
- Snapshot tests for UI consistency

**E2E Tests**
- Detox for critical flows
- Auth flow
- Match + Chat flow

### 13.2 Backend Testing

**Unit Tests**
- Service functions
- Validation schemas
- Utility functions

**Integration Tests**
- API endpoints with test database
- RLS policies

**Load Tests**
- Matching algorithm performance
- Real-time message throughput

---

*Ready to build? Start with the monorepo setup and auth flow.*
