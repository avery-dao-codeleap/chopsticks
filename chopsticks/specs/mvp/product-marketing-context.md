# Product Marketing Context

*Last updated: 2026-01-31*

## Product Overview

**One-liner:** Social dining app where strangers meet up for meals at restaurants in Vietnam

**What it does:** Chopsticks connects people who want to share a meal together. Users create meal requests at specific restaurants, others join, and they meet up to eat. The app handles the coordination—who's going, when, where—and helps verify people actually showed up.

**Product category:** Social dining / Food discovery / Meetup platform

**Product type:** Mobile app (iOS + Android via Expo/React Native)

**Business model:** Free for MVP (monetization TBD - potential partnerships with restaurants, premium features)

## Target Audience

**Target companies:** N/A (B2C)

**Decision-makers:** Individual users in Ho Chi Minh City

**Primary use case:** People who want to discover food and meet new people through shared meals

**Jobs to be done:**
- Find someone to eat with when traveling/new to the city
- Discover hidden local food spots from locals
- Meet new people in a casual, food-centered setting
- Avoid eating alone

**Use cases:**
- Expat new to HCMC wants to try authentic Vietnamese food with a local guide
- Traveler looking for meal companions at a specific restaurant
- Local student bored and wants to meet new people over food
- Someone tired of dating apps, wants platonic food-centered connections

## Personas

N/A (B2C product)

## Problems & Pain Points

**Core problem:** People want to discover food and meet others, but existing solutions are either:
- Too formal (organized food tours)
- Too random (dating apps repurposed for platonic meetups)
- Lacking safety/verification (informal Facebook groups)

**Why alternatives fall short:**
- Dating apps: Wrong intent, uncomfortable dynamics
- Food tours: Expensive, scheduled, not spontaneous
- Facebook groups: No verification, safety concerns, logistical chaos
- Going alone: Lonely, intimidating, less enjoyable

**What it costs them:**
- Missing out on authentic local food experiences
- Eating alone when they'd prefer company
- Safety concerns when meeting strangers
- Time wasted coordinating via DMs and group chats

**Emotional tension:**
- Fear of meeting sketchy people (safety)
- Anxiety about being stood up
- Frustration with flaky people
- FOMO on hidden food spots locals know about

## Competitive Landscape

**Direct:**
- Nomadtable (Europe-focused social dining) — falls short because limited to Western markets, not Vietnam-specific
- EatWith / BonAppetour (hosted dining experiences) — falls short because requires hosts to organize formal events, too structured

**Secondary:**
- Facebook groups (e.g., "Saigon Foodies") — falls short because no verification, unsafe, disorganized
- Meetup.com — falls short because too broad, not food-specific, requires event organizing

**Indirect:**
- Dating apps (Bumble BFF, Tinder) — falls short because wrong intent, uncomfortable
- Food delivery apps (Grab, Baemin) — falls short because solo experience, no social component

## Differentiation

**Key differentiators:**
- Restaurant-first (not host-first): You pick where to eat, not a stranger's home
- Verification via "showed up" ratings: Build trust, filter flakes
- Vietnam-specific: Categories match local food culture (14 Vietnamese-focused cuisines)
- Safety-first: Profile verification (face detection), approval-based joins, reporting

**How we solve it differently:**
- Lightweight coordination (chat + location reveal only after approval)
- No formal event hosting required—just "I'm going here at this time, join me"
- Focus on strangers becoming friends through food, not dating

**Why that's better:**
- Lower friction than organizing events
- Safer than unverified Facebook groups
- More authentic than tourist food tours
- Less awkward than dating app pivots

**Why customers choose us:**
- They want to eat with people, not alone
- They trust the verification system
- They want local food knowledge from real people

## Objections

| Objection | Response |
|-----------|----------|
| "What if someone doesn't show up?" | We track "showed up" ratings. Serial flakes get flagged. MVP focuses on data collection; future versions will penalize no-shows. |
| "Is this safe? Meeting strangers?" | Profile verification (face detection required), approval-based joins (you choose who to meet), in-app reporting. We're not Tinder—this is about food, not dating. |
| "Why not just use Facebook groups?" | No verification, coordination chaos, safety concerns. Chopsticks is purpose-built for this. |

**Anti-persona:**
- People looking for dating (use Tinder instead)
- People who want delivery, not dining out
- People uncomfortable meeting new people

## Switching Dynamics

**Push:** Frustration with flaky people in Facebook groups, fear of safety issues, tired of eating alone

**Pull:** Simple coordination, verification system, Vietnam-specific food culture, real people (not bots)

**Habit:** Used to planning meals alone or via messy group chats

**Anxiety:** "What if they're weird?" / "What if I get stood up?" / "What if it's unsafe?"

## Customer Language

**How they describe the problem:**
- "I want to try this restaurant but don't want to go alone"
- "I'm new here and don't know where to eat"
- "I'm tired of eating by myself"
- "I want to meet people, but dating apps feel awkward for this"

**How they describe us:**
- (TBD—will collect after launch)

**Words to use:**
- Meal, dining, food discovery, local spots, hidden gems, meet people, spontaneous, casual
- Vietnamese: ăn cùng, khám phá ẩm thực, gặp gỡ, quán ăn

**Words to avoid:**
- "Date", "match" (too romantic)
- "Host" (implies formal event)
- "Stranger danger" (acknowledge safety without scaremongering)

**Glossary:**

| Term | Meaning |
|------|---------|
| Meal request | A user-created invitation to eat at a specific restaurant |
| Open join | Anyone can join immediately (no approval needed) |
| Approval join | Creator approves each person who wants to join |
| Showed up rating | Binary yes/no rating after meal: did they show up? |

## Brand Voice

**Tone:** Casual, friendly, food-obsessed, safety-conscious

**Style:** Direct, conversational, bilingual (Vietnamese + English equally important)

**Personality:** Enthusiastic about food, community-minded, trustworthy, unpretentious

## Proof Points

**Metrics:** (TBD post-launch)

**Customers:** MVP targets ~100 users in HCMC

**Testimonials:** (TBD)

**Value themes:**

| Theme | Proof |
|-------|-------|
| Food discovery | (TBD: % of users who tried new cuisines via app) |
| Connection | (TBD: % of users who met 3+ new people) |
| Safety | Face detection required, approval-based joins, reporting system |
| Trust | "Showed up" ratings visible on profiles |

## Goals

**Business goal:** Validate core loop: "Strangers actually showed up to eat together"

**Conversion action:**
1. Complete onboarding
2. Create or join a meal request
3. Show up to the meal
4. Rate companions

**Current metrics:** Pre-launch (as of 2026-01-31)

---

## Lean MVP Scope

### What's IN (validated as essential):
- Phone auth + onboarding (photo with face detection, name, age, gender, persona, cuisines, budget, bio)
- Create meal request (restaurant from curated list OR manual entry, cuisine, budget, time, group size 2-4, open OR approval join)
- Browse requests (list view with district/cuisine/budget filters)
- Approval flow (filter by gender/age/persona, approve/reject)
- Location reveal (only after approval or open join)
- Basic chat (text, images, read receipts, timestamps, creator can remove users)
- 3 push notifications (join request, approved, new message)
- Post-meal "showed up?" rating (binary yes/no)
- Cancellation (chat readable 24h, then deleted)
- Settings (edit profile, edit preferences, language toggle, delete account, report button → email)
- i18n (Vietnamese + English from day one)
- HCMC only (22 districts)
- 14 cuisine categories (Vietnam-focused)
- 4 budget ranges (under 50k, 50k-150k, 150k-500k, 500k+)

### What's OUT (deferred post-MVP):
- Gender filter (collect gender but don't filter by it yet)
- Dietary restrictions/allergies
- Map view (list + district filter instead)
- Local guide badges
- Restaurant reviews with photos
- Typing indicators
- Google Places API (manual seed + user entry)
- Complex status management (just filter by time_window > NOW)
- Takeover logic
- In-app notification settings
- Advanced reporting UI

### Core Validation Metric:
**"Did strangers show up to eat together?"** → Track via "showed up" ratings. If >70% show-up rate in first 2 weeks, MVP validates the idea.
