# Chopsticks Pitch Deck

*Social Dining App for Vietnam*

---

## Slide 1: The Problem

### People want to eat together, but it's hard to make it happen

- **Solo by default, not by choice** — Travelers, expats, and locals eat alone because finding meal companions is awkward
- **Discovery is broken** — Google reviews and star ratings don't tell you where locals actually eat
- **Existing solutions fail** — Facebook groups feel unsafe, dating apps are awkward, food tours are too formal
- **Food is social, but apps aren't** — No platform treats food as the foundation of connection

---

## Slide 2: The Vision

### Chopsticks: Where food is your identity and meals bring people together

**The platform where people are represented by their food identity and connect through meals.**

What you eat, where you eat, and who you eat with says more about you than any bio.

---

## Slide 3: Product Pillars

| | |
|---|---|
| 🍜 **Food-First Identity** | Your taste is your profile |
| 🤝 **Meals Are Better Shared** | Always nudge toward eating together |
| 👥 **Discovery Through People** | Real people > algorithms |
| 🛡️ **Safety by Design** | Trust infrastructure built in |
| ⚡ **Low Friction, High Intent** | Easy actions, real commitment |

---

## Slide 4: How It Works (MVP)

### Request-based social dining

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   CREATE          BROWSE           JOIN          MEET   │
│                                                         │
│   📝 ──────────▶ 👀 ──────────▶ ✋ ──────────▶ 🍜      │
│                                                         │
│   "Pho tonight    Filter by       Request to    Show up │
│    at 7pm,        district,       join or       & eat   │
│    District 1,    cuisine,        instant       together │
│    2 spots open"  budget          join                  │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## Slide 5: MVP Features

### Launching in Ho Chi Minh City

| Feature | What It Does |
|---------|--------------|
| **Meal Requests** | Create a request at a restaurant with time, size, cuisine |
| **Browse & Filter** | Find requests by district, cuisine, budget |
| **Join Flows** | Open join (instant) or approval-based (creator approves) |
| **Group Chat** | Coordinate with meal companions |
| **Show-up Ratings** | "Did they show up?" — builds accountability |
| **Safety** | Phone verification, face detection, public venues only |

**Goal:** Validate that strangers actually show up to eat together
**Success metric:** >70% show-up rate

---

## Slide 6: User Profile (MVP)

```
┌─────────────────────────────────────┐
│         ┌─────────┐                 │
│         │  Photo  │                 │
│         └─────────┘                 │
│         Mai, 28, Local              │
│                                     │
│  🍜 12 meals completed              │
│                                     │
│  "Always hunting for the best      │
│   bánh mì in Saigon"               │
│                                     │
│  Cuisines: Pho, Bún, Street Food   │
│                                     │
└─────────────────────────────────────┘
```

Thin profiles → need more depth for credibility

---

## Slide 7: Post-MVP Roadmap

```
        MVP                PHASE 1              PHASE 2              PHASE 3
         │                    │                    │                    │
         ▼                    ▼                    ▼                    ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│                 │  │                 │  │                 │  │                 │
│  VALIDATE       │  │  FOOD IDENTITY  │  │  SOCIAL GRAPH   │  │  MONETIZE       │
│                 │  │  & DISCOVERY    │  │                 │  │                 │
│  • Meal requests│  │  • Personality  │  │  • Connections  │  │  • Paywall:     │
│  • Join & chat  │  │    quiz         │  │  • Share Card   │  │    full lists   │
│  • Show-up      │  │  • Curated      │  │    (UA loop)    │  │  • Paywall:     │
│    ratings      │  │    lists        │  │  • Invites      │  │    other cities │
│                 │  │  • "Been there" │  │  • Activity     │  │  • Paid recs    │
│                 │  │  • Reviews      │  │    feed         │  │                 │
│                 │  │  • Favorites    │  │                 │  │                 │
└─────────────────┘  └─────────────────┘  └─────────────────┘  └─────────────────┘
     Strangers           Solo value          Sticky network        Revenue
     show up?            + credibility       + repeat usage
```

---

## Slide 8: Phase 1 — Foodie Personality Quiz

### Make profiles credible and distinctive

**OkCupid-style prompts, but for food:**

| Question | Answer |
|----------|--------|
| Pho preference? | Rare beef (tái) vs Well-done (chín) |
| Spice tolerance? | Mild → Medium → Hot → Extreme |
| Street food or AC? | Plastic stool, sidewalk 🪑 |
| Sharing food? | Everything shared vs Don't touch my plate |
| Try new places? | "I'll try anything once" |

**29 questions** across 5 categories
**5 random questions** in onboarding (optional, skippable)
**Answers visible** on public profile

---

## Slide 9: Phase 1 — Curated Lists

### Hyper-specific discovery, not generic "best of" lists

**Examples:**
- 🍜 Best Northern-Style Pho in HCMC
- 🦆 Best Bún Ngan (Duck Noodle) Spots
- 🥖 Best Bánh Mì in District 1
- 🌙 Best Late Night Eats in Bình Thạnh

**User actions:**
| Action | What Happens |
|--------|--------------|
| ✓ Mark "Been There" | Track your food journey |
| ❤️ Save to Favorites | Personal list for later |
| ✍️ Write Review | Share your take |
| 📤 Nominate | Suggest restaurants for lists |

**Hybrid curation:** Editorial quality + community nominations

---

## Slide 10: Phase 1 — Discovery Tab

```
┌─────────────────────────────────────┐
│ Discover                     [HCMC]│
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
│ │ 15 spots · #3 visited ████░░   │ │
│ └─────────────────────────────────┘ │
│ ┌─────────────────────────────────┐ │
│ │ 🥖 Best Bánh Mì in D1          │ │
│ │ 8 spots · #1 visited ██░░░░    │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

**Solo value:** Users get value even when not planning meals

---

## Slide 11: Phase 2 — Social Graph

### Turn one-off meals into lasting connections

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   Meal              Add as            Share & Invite    │
│   Together          Connection        to Eat Again      │
│                                                         │
│   🍜 ─────────────▶ 🤝 ─────────────▶ 📤               │
│                                                         │
│   "Great meal       "Add Mai as       "Hey, want to    │
│    with Mai!"        connection"       try that new     │
│                                        bún place?"      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Features:**
- Add foodie connections
- Share restaurants, reviews, lists to friends
- One-tap meal invite ("Let's eat here tonight")
- **Itinerary Share Card** — the primary user acquisition loop (see next slides)

---

## Slide 12: Phase 2 — The Share Card (UA Loop)

### How new users arrive with context, not confusion

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│   @Pho Thin — Thao Dien — 12pm — $$ 100–200k — Join?   │
│                                                         │
│   ┌─────────────────────────────────────────────────┐   │
│   │  🍜  CHOPSTICKS                                 │   │
│   │  Pho Thin                                       │   │
│   │  Thao Dien · Today 12:00 PM · $$ · 2 spots     │   │
│   │  ✓ Recommended by 14 people                     │   │
│   │  [Join This Meal →]                             │   │
│   └─────────────────────────────────────────────────┘   │
│                                                         │
│   Share to: 📋 Copy  💬 WhatsApp  📤 Sheet             │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Why this is the growth engine:**
- New users see what the app *does* before they install
- Tap link → install → first action is joining a real meal
- Zero-friction onboarding: context arrives with the user
- Every shared card is a micro-ad that explains the product

**App not installed?** → Web landing page with card preview + install CTA

---

## Slide 13: Phase 2 — Invite to Eat

### Bridge discovery → social eating

```
┌─────────────────────────────────────┐
│ Invite friends to eat at            │
│ Phở Thìn Bờ Hồ                      │
├─────────────────────────────────────┤
│ When?                               │
│ [Today] [7:00 PM]                   │
├─────────────────────────────────────┤
│ Who?                                │
│ ☑️ Mai L.                           │
│ ☑️ David T.                         │
│                                     │
│ ☐ Also open to strangers           │
│   (Public meal request)             │
├─────────────────────────────────────┤
│ [Send Invite]                       │
└─────────────────────────────────────┘
```

**From discovery to dinner in 3 taps**

---

## Slide 14: Phase 3 — Monetization

### Three revenue streams

| Feature | Model | Value Prop |
|---------|-------|------------|
| **Full Lists** | Subscription | Free = top 3, paid = full list |
| **Other Cities** | Per-city / subscription | Browse Hanoi lists before your trip |
| **Personalized Recs** | Per-request / subscription | "Where should I eat tonight?" AI |

**Future:**
- Promoted restaurant placements (B2B)
- Premium profile features
- Restaurant partnerships & reservations

---

## Slide 15: Travel Use Case

### Plan before you go, eat like a local when you arrive

```
┌─────────────────────────────────────┐
│ 📍 You're in: HCMC                  │
│                                     │
│ 🔓 HCMC lists — FREE                │
│                                     │
│ 🔒 Hanoi lists — PREMIUM            │
│ 🔒 Da Nang lists — PREMIUM          │
│ 🔒 Bangkok lists — PREMIUM          │
│                                     │
│ Planning a trip?                    │
│ [Unlock Hanoi — $X.XX]              │
│ [Unlock All Cities — $XX/year]     │
└─────────────────────────────────────┘
```

**Download lists offline** for travel

---

## Slide 16: Competitive Landscape

| Competitor | What They Do | Chopsticks Difference |
|------------|--------------|----------------------|
| **Eatwith** | Hosted dinners in homes | Public restaurants, peer-to-peer |
| **Meetup** | Event groups | Meal-specific, lower commitment |
| **Bumble BFF** | Friend matching | Food-centered identity, real intent |
| **Yelp/Google** | Restaurant reviews | People-powered, social eating attached |
| **The Infatuation** | Editorial lists | + Community curation + tracking + social |

**Unique position:** Food identity + discovery + social eating in one app

---

## Slide 17: Why Vietnam? Why Now?

### Vietnam is the perfect launch market

- **Food culture is social** — Eating alone is the exception, not the norm
- **Street food is democratic** — $2 pho sits next to $50 restaurants
- **Expat + traveler density** — HCMC has constant inflow of people seeking local knowledge
- **Mobile-first** — 70%+ smartphone penetration, mobile payments normalized
- **No dominant player** — No Yelp, weak Google Maps reviews, fragmented Facebook groups

---

## Slide 18: Traction & Validation Plan

### MVP Goal: Prove strangers show up

| Metric | Target |
|--------|--------|
| **Show-up rate** | >70% (core validation) |
| Requests/day | ~50 |
| Join rate | >50% get ≥1 joiner |
| MAU | ~100 users |
| 7-day retention | >40% |

**If >70% show up → the idea works**
**If <70% show up → pivot or kill**

---

## Slide 19: The Big Picture

```
                         ┌─────────────────────────────────┐
                         │                                 │
                         │   CHOPSTICKS                    │
                         │                                 │
                         │   The platform where people     │
                         │   are represented by their      │
                         │   food identity and connect     │
                         │   through meals                 │
                         │                                 │
                         └─────────────────────────────────┘
                                        │
           ┌────────────────────────────┼────────────────────────────┐
           │                            │                            │
           ▼                            ▼                            ▼
   ┌───────────────┐           ┌───────────────┐           ┌───────────────┐
   │               │           │               │           │               │
   │  WHO YOU ARE  │           │  WHAT YOU     │           │  WHO YOU EAT  │
   │               │           │  DISCOVER     │           │  WITH         │
   │  • Quiz       │           │               │           │               │
   │  • Preferences│           │  • Lists      │           │  • Requests   │
   │  • Taste      │           │  • Reviews    │           │  • Connections│
   │    history    │           │  • Favorites  │           │  • Invites    │
   │               │           │               │           │               │
   └───────────────┘           └───────────────┘           └───────────────┘
        IDENTITY                   DISCOVERY                    SOCIAL
```

---

## Slide 20: Summary

### Chopsticks: Social dining, food identity, local discovery

**MVP** — Validate strangers show up to eat together

**Phase 1** — Food identity (quiz) + discovery (curated lists)

**Phase 2** — Social graph (connections, sharing, invites)

**Phase 3** — Monetization (paywalls, premium features)

**Launch:** Ho Chi Minh City
**Expand:** Hanoi, Da Nang, Bangkok, Singapore

---

## Slide 21: Let's Eat 🍜

### Questions?

---

*Chopsticks — Where food brings people together*
