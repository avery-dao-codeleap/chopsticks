# Chopsticks Development Roadmap

## Overview

Chopsticks is a mobile app connecting food enthusiasts for shared meal experiences in Vietnamese cities, targeting Gen Z and young professionals.

---

## Phase 1: MVP (4-6 weeks)

**Goal:** Core loop - Sign up -> Set preferences -> Match -> Chat -> Meet

### P0 - Must Have

| Feature | Description | Effort |
|---------|-------------|--------|
| Phone OTP Auth | Supabase auth with SMS verification | 3 days |
| Profile Creation | Name, age, bio, profile photo upload | 4 days |
| Preference Setup | Cuisines, dietary restrictions, allergies, budget, radius | 3 days |
| Match Feed | Card-based UI showing potential matches | 4 days |
| Basic Matching | Location + preference overlap scoring | 5 days |
| Like/Pass Actions | Swipe or button interactions | 2 days |
| Match Notifications | Push when matched | 2 days |
| 1:1 Chat | Real-time messaging with Supabase Realtime | 5 days |
| Match Expiration | 24hr auto-expire for pending matches | 2 days |

### P1 - Should Have

| Feature | Description | Effort |
|---------|-------------|--------|
| Simple Map | Display restaurant pins on Mapbox | 4 days |
| Restaurant Seeding | Manual seed 50-100 spots in target city | 2 days |
| Push Notifications | Expo Push for match/message alerts | 3 days |
| Dev Bypass | Skip auth for testing | Done |

### MVP Constraints
- Single city launch (Ho Chi Minh City)
- Manual restaurant data (no user submissions yet)
- Basic location-based matching only
- No AI features
- No groups

---

## Phase 2: Core Experience (4-6 weeks)

**Goal:** Complete the meal cycle, add stickiness

### P0 - Must Have

| Feature | Description | Effort |
|---------|-------------|--------|
| Meal Completion | "Mark as done" flow after meeting | 3 days |
| Connection Rating | 1-5 star rating for meal buddy | 3 days |
| Restaurant Reviews | Rate and review after meal | 4 days |
| Meal Count Tracking | Display meals completed on profile | 2 days |
| Save Connections | Keep in touch with past matches | 2 days |

### P1 - Should Have

| Feature | Description | Effort |
|---------|-------------|--------|
| User Verification | Photo verification for trust | 4 days |
| Improved Matching | Factor in ratings, completion rate | 5 days |
| Hidden Gems Submission | Users can submit restaurants | 4 days |
| Moderation Queue | Admin approval for submissions | 3 days |

---

## Phase 3: Discovery & AI (4-6 weeks)

**Goal:** Smart recommendations, richer discovery

### P0 - Must Have

| Feature | Description | Effort |
|---------|-------------|--------|
| AI Restaurant Suggestions | OpenAI/Claude powered recommendations | 5 days |
| Advanced Map Filtering | Cuisine, budget, distance, rating filters | 4 days |
| Cuisine Category Browsing | Browse by cuisine type | 3 days |
| Search | Search restaurants by name/location | 3 days |

### P1 - Should Have

| Feature | Description | Effort |
|---------|-------------|--------|
| Preference Learning | Improve suggestions from behavior | 5 days |
| Group Meal Finder | "Find more people" for larger groups | 5 days |
| Restaurant Photos | User-submitted photos | 3 days |

---

## Phase 4: Social & Growth (4-6 weeks)

**Goal:** Community features, retention, monetization

### P0 - Must Have

| Feature | Description | Effort |
|---------|-------------|--------|
| Food Groups | Topic-based communities | 6 days |
| Group Chat | Messaging within groups | 4 days |
| Group Events | Schedule group meals | 4 days |

### P1 - Should Have

| Feature | Description | Effort |
|---------|-------------|--------|
| Share to Social | Instagram/TikTok sharing | 3 days |
| Referral System | Invite friends, earn rewards | 4 days |
| Restaurant Partnerships | Featured spots, deals | 5 days |

### P2 - Nice to Have

| Feature | Description | Effort |
|---------|-------------|--------|
| Premium Features | Priority matching, unlimited likes | 5 days |
| Analytics Dashboard | User insights, popular spots | 4 days |

---

## Technical Milestones

### Infrastructure
- [x] Monorepo setup (pnpm workspaces)
- [x] Expo + React Native initialized
- [x] Supabase project configured
- [x] Basic auth flow working
- [ ] CI/CD pipeline (GitHub Actions)
- [ ] Staging environment
- [ ] Production deployment

### Database
- [ ] Complete schema migration
- [ ] Row Level Security policies
- [ ] PostGIS for geolocation
- [ ] Database indexes optimized

### Testing
- [x] Jest + React Testing Library setup
- [ ] 80% coverage on stores
- [ ] E2E tests with Detox
- [ ] API integration tests

---

## User Flow Diagrams

Detailed flowcharts available in `/docs/flowcharts/`:

| Flow | File | Status |
|------|------|--------|
| Match Feed + Lifecycle | [match-flow.md](flowcharts/match-flow.md) | Done |
| Discovery Map | [discovery-map-flow.md](flowcharts/discovery-map-flow.md) | Done |
| Authentication | TBD | Planned |
| Onboarding | TBD | Planned |
| Chat | TBD | Planned |

---

## Success Metrics

### MVP Launch
- 100 beta users in target city
- 50+ matches created
- 20+ meals completed
- < 5s app load time
- < 1% crash rate

### Phase 2
- 500 active users
- 70% match acceptance rate
- 50% meal completion rate
- 4.0+ app store rating

### Phase 3
- 2,000 active users
- 500+ restaurant submissions
- AI suggestions click-through > 30%

### Phase 4
- 10,000 active users
- 50+ active food groups
- Revenue from partnerships/premium

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| Cold start (no users) | Launch in 1 neighborhood, partner with food influencers |
| No restaurant data | Manual curation first, then community submissions |
| Real-time complexity | Use managed services (Supabase Realtime) |
| Matching quality | Start simple, iterate based on completion rates |
| App store rejection | Follow guidelines, ensure photo moderation |
| Safety concerns | Verification, reporting, public meeting places |

---

## Current Status

**Phase:** MVP Development
**Sprint:** Auth + Onboarding

### Completed
- [x] Project scaffolding
- [x] Expo Router navigation
- [x] Supabase client setup
- [x] Auth store (Zustand)
- [x] Login screen (phone input)
- [x] OTP verification screen
- [x] Dev bypass mode
- [x] Tab navigation shell
- [x] Jest testing setup

### In Progress
- [ ] Profile onboarding screens
- [ ] Preference selection UI
- [ ] Match feed UI

### Next Up
- [ ] Basic matching algorithm
- [ ] Chat implementation
- [ ] Map integration

---

*Last updated: January 2026*
