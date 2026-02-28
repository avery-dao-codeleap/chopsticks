# Chopsticks — Product Strategy

*Last Updated: February 28, 2026*

---

## 1. Product Vision

Chopsticks is the social infrastructure layer for food discovery and real-world dining.

**We turn saved food into shared meals.**

Food is universal, personal, and daily. Yet the journey from discovering a place to actually going is fragmented and inefficient. Chopsticks centralizes discovery, organization, and coordination — whether you go alone, with friends, or meet new people.

---

## 2. Core Problem

Today's food workflow is broken:

| Step | Where it happens today |
|------|----------------------|
| Discovery | TikTok / Instagram |
| Validation | Google Maps |
| Organization | Screenshots / Saves |
| Coordination | iMessage / WhatsApp |
| Execution | Often never happens |

The friction between discovery and action prevents real-world experiences.

**Chopsticks closes the gap.**

---

## 3. Target Users

**Primary:** Urban Gen Z & Millennials (18–35)
- Social, mobile-first
- Heavy TikTok/Instagram food consumers
- Experience-driven

**Use cases:**
- Solo explorers completing curated lists
- Friends coordinating meals
- New connections formed through shared taste

---

## 4. Product Pillars

### Pillar 1: Taste as Identity
Profiles are built around food preferences, budgets, cuisine affinity, and taste patterns. Food replaces generic bios as social signal.

### Pillar 2: From Discovery to Action
Discovery must lead to actual meals — alone or together.

### Pillar 3: Flexible Social Context
Users can go alone, invite friends, or open to new people. Strangers are optional, not required.

### Pillar 4: Trust & Accountability
Public venues, show-up ratings, verification layers, and clear behavioral expectations.

### Pillar 5: High Intent, Low Friction
Fast to create plans, minimal steps, clear commitments.

---

## 5. Feature Strategy by Phase

### Phase 0 — MVP ✅ Complete

**Goal:** Deliver core social dining infrastructure and validate show-up behavior.

**Built:**
- Meal requests (create, browse, filter, join)
- Open join + approval-based join flows
- Group chat for coordination
- Show-up ratings (post-meal)
- Basic profiles (food preferences, persona, photo)
- Curated restaurant seed (~50–100 spots in HCMC)
- Auth + onboarding
- Notifications

**Validated:** >70% show-up rate target

---

### Phase 1 — Explore (Discovery Infrastructure)

**Goal:** Give users value even without network density. Turn passive food saves into organized, actionable lists. Replace the broken TikTok → Google Maps → Notes workflow.

**Unlock condition:** MVP validated

**Core feature: Unified Explore tab (🔭)**

| Screen | What it does |
|--------|-------------|
| Explore Tab Home | Search bar + My Lists section + Curated Lists section |
| My Lists | User-created personal lists (Want to Go, From TikTok, Date Spots, etc.) |
| Save to List Sheet | Bottom sheet to save any restaurant to a personal list from any surface |
| List Detail | Curated (gamified progress bar, Been There, Save ▾) or Personal (Create Request CTA) |
| Restaurant Profile | Hub: Chopsticks social proof, active requests, Save/Been Here/Share, pre-filled Create Request |

**Navigation change:** Profile tab → header avatar. New tabs: 🗺️ Browse | 🔭 Explore | 💬 Chat | 🔔 Notifs.

**Key validation questions:**
- Do users create personal lists and save restaurants?
- Does the restaurant profile drive meal request creation?
- Do users complete curated lists (Been There tracking)?

---

### Phase 2 — Social Layer

**Goal:** Add social proof, taste identity, and sharing to make Explore a living platform.

**Unlock condition:** Phase 1 shows active list creation and Been There tracking

**Features:**

| Feature | Rationale |
|---------|-----------|
| **Trending This Week** | Surfaces restaurants with real activity — now has data from Phase 1 usage |
| **Foodie Personality Quiz** | OkCupid-style food prompts, deepens profiles, improves meal match quality |
| **Reviews** | Short persona-tagged reviews on restaurant profiles, Chopsticks-native social proof |
| **Nominations** | Community curation — users nominate restaurants for lists |
| **"Chopstickers who ate here"** | Social proof on restaurant profile from meal history |
| **Invite to eat from list** | One-tap meal request from a personal or curated list item |

**Key validation questions:**
- Does Trending drive re-engagement?
- Does the quiz improve match quality or join rates?
- Do reviews create useful social proof or noise?

---

### Phase 3 — Network Effects

**Goal:** Turn one-off meal companions into persistent connections. Make the app sticky beyond active meal planning.

**Unlock condition:** Phase 2 shows retention lift from social features

**Features:**

| Feature | Rationale |
|---------|-----------|
| **Foodie Connections** | Persistent relationships beyond single meals |
| **Activity Feed** | See what connections are eating, saving, reviewing |
| **Itinerary Share Card** | Primary UA loop — shareable meal card with deep link for non-installed users |
| **One-Tap Meal Invite** | Frictionless "let's eat" to connections |
| **City Expansion** | Hanoi, Da Nang — replicate HCMC density model |

**Key validation questions:**
- Do meal companions add each other as connections?
- Does the share card drive new user installs?
- Do connections lead to repeat meals together?

---

### Phase 4 — Monetization

**Goal:** Prove revenue model without killing growth.

**Unlock condition:** Phase 3 shows strong retention and social graph formation

**Revenue streams:**

| Stream | Model |
|--------|-------|
| **Premium Access** | Full curated lists (free = top 3, Pro = all) + multi-city unlock |
| **Restaurant Promotion** | Featured placements in relevant lists |
| **Experience Upsell** | Food tours, market crawls, curated group dining events |

---

### Phase 5+ — Expansion & Integrations

**Geographic:** Bangkok, Singapore, regional Southeast Asia.

**Platform Integrations:**

| Integration | Purpose |
|-------------|---------|
| **Google Maps** | Navigate to restaurant directly from restaurant profile |
| **Grab** | Order from restaurant or book a ride to the spot from within the app |
| **Map View** | Visual restaurant discovery with clustering |

**Platform:**
- AI matching: suggest meals based on taste compatibility
- Advanced safety: AI moderation, reputation systems
- Restaurant partnerships: reservations, exclusive deals

---

## 6. Key Metrics

**North Star:** Completed Meals per Active User per Month

**Supporting metrics:**
- Saved Restaurants per User
- Personal Lists Created
- Meal Requests Created
- Join Rate
- Show-Up Rate (>70% target)
- Repeat Meals with Same Group
- 30-Day Retention

---

## 7. Competitive Positioning

Chopsticks is not a review platform. Not a content platform. Not a dating app. Not an event app.

| What we are | What we're not |
|-------------|---------------|
| Discovery → Action | Discovery only (TikTok, Google Maps) |
| Personal + editorial lists | Generic star ratings (Yelp, TripAdvisor) |
| Social dining infrastructure | Hosted experiences (Eatwith) |
| Food-first identity | Generic social (Meetup, Bumble BFF) |

**We own the last mile of food discovery** — the step from "I want to go there" to "I'm actually there."

---

## 8. Strategic Edge

- Food is high-frequency behavior
- City-based density model scales predictably
- Natural social virality (share cards, invites)
- Real-world action creates stickiness
- Monetization aligned with restaurants and users

---

## 9. Key Assumptions to Validate

| Phase | Assumption |
|-------|-----------|
| Phase 0 ✅ | Strangers create requests, join, and show up (>70%) |
| Phase 1 | Users save restaurants to personal lists instead of Google Maps |
| Phase 1 | Restaurant profile drives meal request creation |
| Phase 2 | Reviews + Trending drive re-engagement between meals |
| Phase 2 | Personality quiz improves match quality |
| Phase 3 | Meal companions become persistent connections |
| Phase 3 | Share card drives word-of-mouth installs |
| Phase 4 | Users pay for full list access |
| Phase 4 | Restaurants pay for promoted placement |

---

*This is a living document. Update as assumptions are validated or invalidated.*
