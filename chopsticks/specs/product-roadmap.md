# Chopsticks Product Roadmap

*Last Updated: February 3, 2026*

---

## Roadmap Overview

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                                                                                 │
│  PHASE 0          PHASE 1              PHASE 2              PHASE 3            │
│  MVP              IDENTITY &           SOCIAL               MONETIZATION       │
│                   DISCOVERY            GRAPH                                   │
│                                                                                 │
│  ════════════     ════════════         ════════════         ════════════       │
│                                                                                 │
│  Validate         Give users           Turn meals           Prove              │
│  core loop        solo value &         into lasting         revenue            │
│                   richer identity      connections          model              │
│                                                                                 │
│  Unlock:          Unlock:              Unlock:              Unlock:            │
│  Launch           >70% show-up         Retention lift       Strong             │
│                   rate                 from Phase 1         social graph       │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## Phase 0: MVP

### Goal
**Validate that strangers actually show up to eat together.**

If they don't, nothing else matters.

### Unlock Condition
Ship it.

### Success Criteria
| Metric | Target | Status |
|--------|--------|--------|
| Show-up rate | >70% | ⬜ |
| Requests created/day | ~50 | ⬜ |
| Join rate (requests with ≥1 joiner) | >50% | ⬜ |
| MAU | ~100 | ⬜ |
| 7-day retention | >40% | ⬜ |

### Features

| Feature | Description | Priority |
|---------|-------------|----------|
| Phone auth + onboarding | 9-step flow with verification | P0 |
| User profiles | Photo, name, age, persona, bio, cuisines, budget | P0 |
| Create meal request | Restaurant + cuisine + budget + time + size + join type | P0 |
| Browse requests | List view with district/cuisine/budget filters | P0 |
| Join flows | Open join + approval-based join | P0 |
| Group chat | Text, images, member management | P0 |
| Show-up ratings | Post-meal "did they show up?" | P0 |
| Push notifications | Join request, approval, new message | P0 |
| Curated restaurant seed | ~50-100 manually added restaurants | P0 |
| Manual restaurant entry | User adds name + address + district | P0 |
| Safety features | Face detection, report button | P0 |
| Settings | Edit profile, language toggle, delete account | P0 |
| Bilingual | Vietnamese + English | P0 |

### Decisions Made
- HCMC only (no other cities)
- No map view (list only)
- No direct messages
- No gender filter (collect data, don't filter yet)
- No dietary restrictions
- No Google Places API

### Exit Criteria
- **Pass:** >70% show-up rate → proceed to Phase 1
- **Fail:** <70% show-up rate → diagnose, iterate, or pivot

---

## Phase 1: Food Identity & Discovery

### Goal
**Give users reasons to engage outside of active meal planning. Build the "food identity" foundation.**

Users should open the app even when they're not looking to eat with someone right now.

### Unlock Condition
MVP validates (>70% show-up rate confirmed over 2+ weeks)

### Success Criteria
| Metric | Target | Status |
|--------|--------|--------|
| Discovery tab opens / DAU | >30% | ⬜ |
| Quiz completion (onboarding) | >50% start, >80% complete | ⬜ |
| Answers per user (30-day) | >10 average | ⬜ |
| Lists viewed per user per week | >3 | ⬜ |
| "Been there" marks per user (30-day) | >5 | ⬜ |
| Favorites saved per user (30-day) | >3 | ⬜ |
| Reviews written per user (30-day) | >1 | ⬜ |
| Solo recommendation → visit rate | >25% | ⬜ |
| Solo visit rate by persona (segment) | Track all 5 | ⬜ |
| 7-day retention | >50% (up from 40%) | ⬜ |

### Features

#### 1A: Foodie Personality Quiz

| Feature | Description | Priority |
|---------|-------------|----------|
| Question bank | 29 questions across 5 categories | P0 |
| Quiz in onboarding | 5 randomized questions, all optional, skippable | P0 |
| Answer more later | Answer additional questions from profile | P0 |
| Profile display | Show answers on public profile | P0 |
| Question types | This-or-that, spectrum, multiple choice, multi-select | P1 |

**Spec:** [foodie-personality-quiz.md](./post-mvp/foodie-personality-quiz.md)

#### 1B: Curated Lists & Discovery

| Feature | Description | Priority |
|---------|-------------|----------|
| Lists data model | Editorial lists with ranked restaurants | P0 |
| Discovery tab | New bottom tab for browsing lists | P0 |
| List view | Browse lists by category, district | P0 |
| List detail | See ranked restaurants, descriptions | P0 |
| Top 3 free | Free users see top 3 per list | P0 |
| "Been there" | Mark restaurants as visited | P0 |
| Favorites | Save restaurants to personal list | P0 |
| Restaurant detail | Enhanced view with lists, stats | P0 |
| Open requests at restaurant | Show active meal requests happening at this restaurant | P1 |
| Initial list seed | 15-20 curated lists at launch | P0 |

**Spec:** [curated-lists.md](./post-mvp/curated-lists.md)

#### 1C: Reviews

| Feature | Description | Priority |
|---------|-------------|----------|
| Write review | Rating (1-5) + text + photos | P1 |
| Review display | Show on restaurant detail | P1 |
| Review moderation | Flag/remove inappropriate reviews | P1 |
| Aggregate ratings | Calculate and display average rating | P1 |

#### 1D: Nominations

| Feature | Description | Priority |
|---------|-------------|----------|
| Nominate for list | Suggest restaurant for existing list | P2 |
| Suggest new list | Propose new list category | P2 |
| Editorial queue | Internal tool to review nominations | P2 |

### Decisions to Make
- [ ] How many lists at Phase 1 launch? (Recommend: 15-20)
- [ ] Review minimum character count? (Recommend: 20 chars)
- [ ] Display priority for quiz answers on profile?

### Exit Criteria
- **Pass:** Retention lifts to >50%, discovery engagement strong → proceed to Phase 2
- **Fail:** No retention lift → diagnose what's not working, iterate

---

## Phase 2: Social Graph

### Goal
**Turn one-off meal companions into persistent connections. Make the app stickier through relationships.**

### Unlock Condition
Phase 1 shows measurable retention lift from discovery features

### Success Criteria
| Metric | Target | Status |
|--------|--------|--------|
| Connection rate (post-meal) | >30% add each other | ⬜ |
| Connections per user (30-day) | >5 | ⬜ |
| Shares per user per week | >2 | ⬜ |
| Invites sent per user (30-day) | >3 | ⬜ |
| Repeat meals (same users) | >20% of meals | ⬜ |
| 30-day retention | >40% | ⬜ |

### Features

#### 2A: Foodie Connections

| Feature | Description | Priority |
|---------|-------------|----------|
| Add connection | Send/accept connection request | P0 |
| Connection list | View your connections | P0 |
| Post-meal prompt | "Add [name] as a connection?" after meals | P0 |
| Connection on profile | Show connection count on profile | P1 |
| Mutual connections | Show shared connections when viewing profile | P2 |

#### 2B: Share to Connections

| Feature | Description | Priority |
|---------|-------------|----------|
| Share restaurant | Send restaurant to connections | P0 |
| Share list | Send list to connections | P0 |
| Share with message | Add optional note when sharing | P0 |
| Receive share | Notification + inbox for received shares | P0 |
| External share | Copy link, share to WhatsApp/Messenger | P1 |

#### 2C: Invite to Eat

| Feature | Description | Priority |
|---------|-------------|----------|
| Invite from restaurant | "Invite friends to eat here" flow | P0 |
| Select connections | Pick which connections to invite | P0 |
| Set time | Choose date/time for meal | P0 |
| Private meal request | Creates request visible only to invitees | P0 |
| Open to strangers toggle | Optionally make it public | P1 |
| Invite notification | Push + in-app for invitees | P0 |
| Accept/decline | Invitee responds to invite | P0 |

#### 2E: Itinerary Share Card

This is the primary external sharing mechanic and the main user acquisition loop. A shareable card that turns a meal request into an invite anyone can act on.

**Format:** `@Pho Thin — Thao Dien — 12pm — $$ 100–200k — Join?`

| Feature | Description | Priority |
|---------|-------------|----------|
| Share card layout | Restaurant name, district, time, budget range, "Join?" CTA | P0 |
| Visibility toggle | Connections only / Me only / Everyone | P0 |
| External share | Copy link or share to WhatsApp/Messenger | P0 |
| In-app share | Send directly to connections | P0 |
| Share → join flow | Tapping shared link opens the request detail with join action | P0 |
| Social proof signal | Show "recommended by X people" or "X saved this place" on the card | P1 |

**Why this matters:** This card is both the UA mechanic and the Phase 2 share feature. If people share it externally, new users arrive with context — they already know what the app does before they open it. See [competitive-research.md](./competitive-research.md) for why demand-side cold start kills most apps in this space.

---

#### 2D: Activity Feed (Optional)

| Feature | Description | Priority |
|---------|-------------|----------|
| Feed tab | See what connections are doing | P2 |
| Activity types | Reviews, "been there", meals completed | P2 |
| Privacy controls | Choose what to share to feed | P2 |

### Decisions to Make
- [ ] Connection model: mutual (like Facebook) or follow (like Instagram)?
- [ ] Can you invite non-connections to eat? Or connections only?
- [ ] Activity feed: build it or skip it?

### Exit Criteria
- **Pass:** Strong connection formation, repeat meals happening → proceed to Phase 3
- **Fail:** Users not connecting → diagnose friction, iterate

---

## Phase 3: Monetization

### Goal
**Prove the revenue model without killing growth.**

### Unlock Condition
Phase 2 shows strong social graph formation and retention

### Success Criteria
| Metric | Target | Status |
|--------|--------|--------|
| Premium conversion rate | >5% | ⬜ |
| Revenue per user (ARPU) | TBD | ⬜ |
| Churn rate (premium) | <10% monthly | ⬜ |
| Paywall view → conversion | >10% | ⬜ |

### Features

#### 3A: Paywall — Full Lists

| Feature | Description | Priority |
|---------|-------------|----------|
| Lock items 4+ | Free users see top 3, rest blurred/locked | P0 |
| Unlock CTA | "See all X spots" upgrade prompt | P0 |
| Premium flag | Track premium status on user | P0 |
| Subscription flow | In-app purchase integration | P0 |

#### 3B: Paywall — Other Cities

| Feature | Description | Priority |
|---------|-------------|----------|
| City selector | Show available cities | P0 |
| Lock other cities | Non-current cities require premium | P0 |
| Per-city unlock | Option to unlock single city | P1 |
| All-cities subscription | Unlock all cities with subscription | P0 |
| Hanoi lists | First expansion city content | P0 |

#### 3C: Personalized Recommendations (Optional)

| Feature | Description | Priority |
|---------|-------------|----------|
| "Where should I eat?" | AI-powered recommendation | P2 |
| Based on preferences | Use quiz, history, favorites | P2 |
| Premium feature | Paid per-request or subscription | P2 |

#### 3D: Sponsored Experiences (Park Until Phase 2 Validates)

> **Status:** Not designed. Do not build until the organic loop is proven and users have established trust in the platform.

Potential second revenue stream beyond the paywall. Restaurants and experience providers pay for placement or sponsored meal events.

| Feature | Description | Priority |
|---------|-------------|----------|
| Sponsored restaurant placement | Restaurants pay for boosted visibility in curated lists | P2 |
| Guided tour partnerships | Local guides offer curated dining tours bookable via the app | P2 |
| Sponsored meal requests | A restaurant sponsors a group meal as a marketing event | P2 |

**Risk:** Sponsored content in social apps degrades trust if introduced too early or too aggressively. Dinner Lab tried to monetize crowdsourced data before the product had earned trust — it failed. See [competitive-research.md](./competitive-research.md) for the full pattern. Only pursue once organic engagement is strong and users see the app as a trusted source.

---

### Decisions to Make
- [ ] Pricing: subscription vs one-time vs hybrid?
- [ ] Price points for different markets?
- [ ] Free trial for premium?
- [ ] Which city to expand to first after HCMC?

### Exit Criteria
- **Pass:** Sustainable revenue, conversion rate healthy → scale
- **Fail:** Low conversion → adjust pricing, value prop, or timing

---

## Phase 4+: Future Expansion

### Geographic Expansion
| City | Notes |
|------|-------|
| Hanoi | Second Vietnam city, different food culture |
| Da Nang | Tourist destination, seasonal |
| Bangkok | Regional expansion, similar street food culture |
| Singapore | High expat density, English-speaking |

### Feature Expansion
| Feature | Description |
|---------|-------------|
| Map view | Visual discovery with clustering |
| AI matching | System suggests meals based on taste compatibility |
| Direct messages | Private chat outside meal requests |
| No-show consequences | Visibility reduction, penalties for serial no-shows |
| Restaurant partnerships | Reservations, exclusive deals, promoted placement |
| Advanced moderation | AI flagging, in-app moderation queue |
| Offline lists | Download for travel |
| Food personality types | "The Adventurous Local" summaries |
| User-created lists | Let users curate and share own lists |

---

## Dependencies & Sequencing

```
                    ┌─────────────┐
                    │   MVP       │
                    │   Launch    │
                    └──────┬──────┘
                           │
                           │ >70% show-up rate
                           ▼
          ┌────────────────┴────────────────┐
          │                                 │
          ▼                                 ▼
   ┌─────────────┐                   ┌─────────────┐
   │   Quiz      │                   │   Lists &   │
   │   (1A)      │                   │   Discovery │
   │             │                   │   (1B)      │
   └──────┬──────┘                   └──────┬──────┘
          │                                 │
          │         ┌───────────────────────┤
          │         │                       │
          │         ▼                       ▼
          │  ┌─────────────┐         ┌─────────────┐
          │  │   Reviews   │         │ Nominations │
          │  │   (1C)      │         │   (1D)      │
          │  └─────────────┘         └─────────────┘
          │
          │ Retention lift confirmed
          ▼
   ┌─────────────┐
   │ Connections │
   │   (2A)      │
   └──────┬──────┘
          │
          ├─────────────────┬─────────────────┬─────────────────┐
          │                 │                 │                 │
          ▼                 ▼                 ▼                 ▼
   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
   │   Share     │   │  Invite to  │   │  Activity   │   │ Share Card  │
   │   (2B)      │   │  Eat (2C)   │   │  Feed (2D)  │   │  (2E) ★UA   │
   └─────────────┘   └─────────────┘   └─────────────┘   └─────────────┘
          │
          │ Social graph established
          ▼
   ┌─────────────────────────────────────────┐
   │              PHASE 3                    │
   │                                         │
   │  ┌──────────┐ ┌──────────┐ ┌──────────┐│
   │  │ Paywall: │ │ Paywall: │ │ Paid     ││
   │  │ Lists    │ │ Cities   │ │ Recs     ││
   │  │ (3A)     │ │ (3B)     │ │ (3C)     ││
   │  └──────────┘ └──────────┘ └──────────┘│
   │                                         │
   └─────────────────────────────────────────┘
```

---

## Key Milestones

| Milestone | Definition | Phase |
|-----------|------------|-------|
| **MVP Launch** | App live in App Store + Play Store, HCMC | 0 |
| **Core Validated** | >70% show-up rate confirmed over 2 weeks | 0 |
| **100 Users** | 100 MAU reached | 0 |
| **Discovery Live** | Quiz + Lists + Favorites + Been There shipped | 1 |
| **1,000 Reviews** | Community content flywheel started | 1 |
| **Social Graph Live** | Connections + Sharing + Invites shipped | 2 |
| **Repeat Meals** | >20% of meals are between repeat users | 2 |
| **First Revenue** | Paywall live, first paying user | 3 |
| **Second City** | Hanoi lists live and generating engagement | 3 |
| **Sustainable Revenue** | MRR covers operating costs | 3 |

---

## Risk Register

| Risk | Impact | Likelihood | Mitigation |
|------|--------|------------|------------|
| Low show-up rate | High | Medium | Track early, add consequences, improve commitment UX |
| No retention outside meals | High | Medium | Phase 1 discovery features address this |
| Users don't connect post-meal | Medium | Medium | In-context prompt, make it frictionless |
| Low willingness to pay | Medium | Medium | Test pricing early, validate value prop |
| Content quality (lists/reviews) | Medium | Low | Editorial oversight, moderation, incentives |
| Safety incidents | High | Low | Verification, reporting, quick response process |
| Competition enters market | Medium | Low | Move fast, build network effects |

---

## Open Questions (All Phases)

### Phase 0
- [x] City: HCMC only ✓
- [x] Language: Bilingual from day 1 ✓

### Phase 1
- [ ] How many lists at launch?
- [ ] Quiz answer display priority on profiles?
- [ ] Review minimum length?

### Phase 2
- [ ] Connection model: mutual or follow?
- [ ] Can you invite non-connections?
- [ ] Build activity feed or skip?

### Phase 3
- [ ] Subscription vs one-time pricing?
- [ ] Price points?
- [ ] Free trial?
- [ ] First expansion city?

---

## Document Links

| Document | Description |
|----------|-------------|
| [PRD.md](./mvp/PRD.md) | MVP product requirements |
| [product-strategy.md](./product-strategy.md) | Vision, pillars, feature inventory |
| [foodie-personality-quiz.md](./post-mvp/foodie-personality-quiz.md) | Quiz feature spec |
| [curated-lists.md](./post-mvp/curated-lists.md) | Lists & discovery feature spec |
| [competitive-research.md](./competitive-research.md) | Failed + surviving social dining apps, risk mapping |
| [pitch-deck.md](./pitch-deck.md) | Investor/stakeholder pitch |

---

*This roadmap is sequenced by validated learning, not calendar dates. Each phase unlocks based on the previous phase hitting success criteria.*
