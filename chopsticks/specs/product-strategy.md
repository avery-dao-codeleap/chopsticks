# Chopsticks Product Strategy

*Last Updated: February 3, 2026*

---

## 1. Product Vision

**Chopsticks is the platform where people are represented by their food identity and connect through meals.**

Food is universal but deeply personal. What you eat, where you eat, and who you eat with says more about you than any bio. Chopsticks makes food the foundation of social connection - not a filter on a dating app, but the entire premise.

---

## 2. Product Pillars

These are the core beliefs that guide every product decision:

### Pillar 1: Food-First Identity
Everything revolves around food - preferences, personality, history, opinions. Users don't have generic profiles; they have food profiles. Your taste is your identity.

### Pillar 2: Meals Are Better Shared
Solo dining is fine, but shared meals create connection. The product always nudges toward eating together, even when enabling solo discovery.

### Pillar 3: Discovery Through People, Not Algorithms
Authentic recommendations come from real people with real taste. A local who's eaten at 50 pho spots is more credible than a star rating. Trust is built through human curation and social proof.

### Pillar 4: Safety by Design
Strangers meeting requires trust infrastructure. Public venues, verification, accountability (show-up ratings), and transparency are non-negotiable defaults - not opt-in features.

### Pillar 5: Low Friction, High Intent
Every action should be easy but meaningful. Joining a meal request is one tap, but it represents real commitment. Reduce friction without reducing intent.

---

## 3. Product Pillars → Feature Areas

| Pillar | Feature Area | Description |
|--------|--------------|-------------|
| Food-First Identity | **Food Identity** | Profiles, preferences, personality quiz, taste history |
| Meals Are Better Shared | **Social Dining** | Meal requests, matching, chat, meetups |
| Discovery Through People | **Food Discovery** | Curated lists, reviews, recommendations, "been there" |
| Safety by Design | **Trust & Safety** | Verification, ratings, reporting, moderation |
| Low Friction, High Intent | **Social Graph** | Connections, sharing, invites, lightweight coordination |

---

## 4. Feature Inventory

### 4.1 Social Dining (Core - MVP)
The original premise. Strangers create and join meal requests.

| Feature | Status | Description |
|---------|--------|-------------|
| Meal Requests | MVP | Create requests at restaurants with time/size/cuisine |
| Browse & Filter | MVP | List view with district/cuisine/budget filters |
| Join Flows | MVP | Open join + approval-based join |
| Request Chat | MVP | Group chat for coordinating meals |
| Show-up Ratings | MVP | Post-meal "did they show up?" tracking |

### 4.2 Food Identity
How users represent themselves through food.

| Feature | Status | Description |
|---------|--------|-------------|
| Basic Profile | MVP | Photo, name, age, persona, bio |
| Cuisine Preferences | MVP | 14 categories, multi-select |
| Budget Preferences | MVP | 4 ranges, private |
| **Foodie Personality Quiz** | **Post-MVP** | OkCupid-style prompts, binary/multiple choice, visible on profile |
| Taste History | Future | Aggregated from "been there" + reviews |
| Food Reputation | Future | Credibility score based on activity |

### 4.3 Food Discovery
How users find where to eat - with or without a group.

| Feature | Status | Description |
|---------|--------|-------------|
| Curated Restaurant Seed | MVP | ~50-100 manually added restaurants |
| Manual Restaurant Entry | MVP | Users add name + address + district |
| **Curated Lists** | **Post-MVP** | Ranked lists by hyper-specific category (best northern pho in HCMC, etc.) |
| **"Been There" Tracking** | **Post-MVP** | Users mark restaurants they've visited |
| **Nominations** | **Post-MVP** | Users nominate restaurants for lists |
| **Reviews** | **Post-MVP** | User reviews attached to restaurants |
| Personalized Recommendations | Future | AI-driven suggestions based on taste profile |
| Map View | Future | Visual discovery with clustering |

### 4.4 Social Graph
Connections between users beyond one-off meals.

| Feature | Status | Description |
|---------|--------|-------------|
| (No connections) | MVP | Strangers only, no persistent relationships |
| **Foodie Connections** | **Post-MVP** | Add friends, build network |
| **Share to Connections** | **Post-MVP** | Share restaurants, reviews, lists |
| **One-Tap Meal Invite** | **Post-MVP** | Invite connections to eat together |
| **Itinerary Share Card** | **Post-MVP** | Shareable meal card — primary UA loop. Format: `@Restaurant — District — Time — Budget — Join?` Handles both installed and non-installed recipients via deep link. |
| Direct Messages | Future | Private chat outside meal requests |
| Activity Feed | Future | See what connections are eating/reviewing |

### 4.5 Trust & Safety
Infrastructure for stranger meetups.

| Feature | Status | Description |
|---------|--------|-------------|
| Phone Verification | MVP | Firebase Auth OTP |
| Face Detection | MVP | Required on photo upload |
| Show-up Ratings | MVP | Binary "did they show up?" |
| Report Button | MVP | Manual email to admin |
| Approval Mode | MVP | Creator approves joiners |
| No-Show Consequences | Future | Visibility reduction, penalties |
| Advanced Moderation | Future | In-app queue, AI flagging |

### 4.6 Monetization
Revenue features (all future).

| Feature | Status | Description |
|---------|--------|-------------|
| **Paywall: Full Lists** | **Post-MVP** | Free users see top 3, paid see full list |
| **Paywall: Other Cities** | **Post-MVP** | Browse lists in cities you're not in (travel planning) |
| **Paid Recommendations** | **Post-MVP** | Personalized "where should I eat?" |
| Promoted Restaurants | Future | Restaurants pay for visibility |
| Premium Profile Features | Future | Badges, priority in approval queues |

---

## 5. Product Roadmap

### Phase 0: MVP (Current)
**Goal:** Validate that strangers actually show up to eat together.

**Success metric:** >70% show-up rate in first 2 weeks

**Scope:**
- Meal requests (create, browse, join, chat)
- Basic profiles with cuisine/budget preferences
- Curated restaurant seed (~50-100)
- Show-up ratings
- HCMC only, ~100 users

**What we learn:**
- Do people create requests?
- Do others join?
- Do they actually meet?
- What's the no-show rate?

---

### Phase 1: Food Identity & Discovery
**Goal:** Give users reasons to engage beyond active meal planning. Build the "food identity" foundation.

**Unlock condition:** MVP validates (>70% show-up rate)

**Features:**

| Feature | Rationale |
|---------|-----------|
| **Foodie Personality Quiz** | Deepens profiles, makes matching more meaningful, increases profile credibility |
| **Curated Lists** | Solo discovery mode - users get value even without joining meals |
| **"Been There" Tracking** | Lightweight engagement, builds taste history |
| **Reviews** | User-generated content, social proof for restaurants |
| **Nominations** | Community curation, surfaces hidden gems |

**What we learn:**
- Do users engage with lists when not actively seeking meals?
- Does the quiz improve match quality or approval rates?
- What categories of lists get most engagement?

---

### Phase 2: Social Graph
**Goal:** Turn one-off meal companions into persistent connections. Make the app stickier.

**Unlock condition:** Phase 1 shows retention lift from discovery features

**Features:**

| Feature | Rationale |
|---------|-----------|
| **Foodie Connections** | Persistent relationships beyond single meals |
| **Share to Connections** | Social distribution of restaurants/reviews/lists |
| **One-Tap Meal Invite** | Frictionless "let's eat" to friends |
| **Itinerary Share Card** | Primary UA loop — every shared card brings new users with context before they install |
| **Activity Feed** | See what connections are doing (passive engagement) |

**What we learn:**
- Do meal companions add each other as connections?
- Does sharing drive new user acquisition? (Share Card is the key signal)
- Do connections lead to repeat meals together?

---

### Phase 3: Monetization
**Goal:** Prove revenue model without killing growth.

**Unlock condition:** Phase 2 shows strong retention and social graph formation

**Features:**

| Feature | Rationale |
|---------|-----------|
| **Paywall: Full Lists** | Free users see top 3, paid see all - tests willingness to pay for discovery |
| **Paid Recommendations** | Personalized "where should I eat tonight?" - high intent, high value |
| **Promoted Restaurants** | B2B revenue - restaurants pay for visibility in relevant lists |

**What we learn:**
- What's the conversion rate on list paywalls?
- What price point works for recommendations?
- Do promoted restaurants convert to visits?

---

### Phase 4+: Expansion (Future)
- **Geographic expansion:** Hanoi, Da Nang, Bangkok, Singapore
- **Map view:** Visual discovery with clustering
- **AI matching:** System suggests meals based on taste compatibility
- **Advanced safety:** AI moderation, reputation systems
- **Restaurant partnerships:** Reservations, exclusive deals

---

## 6. Feature Prioritization Framework

When deciding what to build next, score features on:

| Criteria | Weight | Questions |
|----------|--------|-----------|
| **Validation** | High | Does this help prove/disprove a core assumption? |
| **Retention** | High | Does this bring users back when they're not actively planning meals? |
| **Identity** | Medium | Does this deepen the "food identity" vision? |
| **Network Effects** | Medium | Does this get better with more users? |
| **Revenue Potential** | Low (for now) | Can this eventually be monetized? |
| **Effort** | Negative | How complex is this to build and maintain? |

---

## 7. Key Assumptions to Validate

### MVP (Phase 0)
1. Strangers will create meal requests
2. Other strangers will join those requests
3. People who commit will actually show up (>70%)
4. Chat is sufficient for coordination

### Phase 1
5. Users want to engage with food content outside of meal planning
6. Curated lists drive discovery and "been there" tracking
7. Personality quiz makes profiles more engaging/credible
8. Reviews create useful social proof

### Phase 2
9. Meal companions want persistent connections
10. Users will share restaurants to connections
11. Connections lead to repeat meals together
12. Social graph improves retention

### Phase 3
13. Users will pay for full list access
14. Personalized recommendations have monetization potential
15. Restaurants will pay for promoted placement

---

## 8. Competitive Positioning

### The Current Fragmented Experience

Today's food discovery workflow is broken across multiple platforms:
1. **Discovery**: TikTok/YouTube for food review content
2. **Validation**: Read comments for confirmation, check Google Maps for reviews/stars
3. **Organization**: No centralized place to save and organize finds
4. **Action**: Manually coordinate with friends to actually go

**The Pain Point**: People want a centralized platform that combines discovery, validation, organization, and social coordination.

### How We Compare

| Competitor | What They Do | Chopsticks Difference |
|------------|--------------|----------------------|
| **TikTok/YouTube** | Viral food content, no save/organize | Curated lists you can save, track, and share |
| **Google Maps** | Final verification destination | Discovery + validation + social in one place |
| **TripAdvisor** | Tourist reviews, fragmented from social content | Local community, integrated with social discovery |
| **Yelp** | Business listings and reviews | People-powered curation + social dining attached |
| **The Infatuation** | Editorial lists | + Community curation + tracking + social meetups |
| **Eatwith** | Hosted dinners in homes | Public restaurants, peer-to-peer |
| **Meetup** | Event groups | Meal-specific, lower commitment |
| **Bumble BFF** | Friend matching | Food-centered identity |

**Unique position:** The only app that centralizes food discovery, validation, organization, AND turns it into real social dining experiences.

---

## 9. Open Questions

1. **List curation model:** What's the right balance of editorial vs. community curation? Do we need "trusted reviewers" or is democratic nomination enough?

2. **Quiz design:** How many questions? What categories? How do answers affect matching (if at all)?

3. **Connection model:** Mutual follow? One-way follow? Request-based like LinkedIn?

4. **Monetization timing:** How long do we stay free to maximize growth before introducing paywalls?

5. **Geographic expansion:** What signals tell us HCMC is "done" and we should expand?

---

## 10. Next Steps

### Immediate (Post-MVP Spec Work)
1. **Spec: Foodie Personality Quiz** - Research OkCupid prompts, define food-specific questions, design profile display
2. **Spec: Curated Lists** - Define list structure, nomination flow, editorial workflow, "been there" mechanics
3. **Spec: Reviews** - Review format, moderation approach, display on restaurant profiles

### Before Phase 1 Build
- Validate MVP metrics (>70% show-up rate)
- User interviews: What do users want to do when not planning meals?
- Competitive research: Deep dive on The Infatuation, Eater, food list products

---

*This is a living document. Update as assumptions are validated or invalidated.*