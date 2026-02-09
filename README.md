# Chopsticks

**Social dining app where people are represented by their food identity and connect through meals.**

---

## What is Chopsticks?

**Chopsticks is the platform where people are represented by their food identity and connect through meals.**

Food is universal but deeply personal. What you eat, where you eat, and who you eat with says more about you than any bio. Chopsticks makes food the foundation of social connection.

### The Problems We Solve

**1. Fragmented food discovery**
- Discover on TikTok/YouTube → Validate via comments + Google Maps → No place to organize → Manual coordination
- **Chopsticks centralizes discovery, validation, organization, and social coordination**

**2. Hard to find meal companions**
- People eat alone by default, not by choice
- Dating apps feel awkward for platonic meetups
- **Chopsticks lets strangers create meal requests, others join, and they actually show up to eat together**

**MVP Goal:** Validate that strangers show up (>70% show-up rate)

**Target Market:** Launching in Ho Chi Minh City, Vietnam
**Current Status:** MVP Development

---

## Repository Structure

```
chopsticks/
├── chopsticks/          # React Native mobile app (Expo)
│   ├── app/            # Expo Router screens
│   ├── components/     # Reusable UI components
│   ├── lib/            # Utilities and services
│   └── specs/          # Product documentation
├── apps/               # Additional apps (if any)
└── scripts/            # Utility scripts (Linear sync, etc.)
```

---

## Documentation

All product documentation lives in `chopsticks/specs/`. Documents are also synced to Linear for team collaboration.

### Quick Links

| Document | Purpose | Location |
|----------|---------|----------|
| **Product Strategy** | Vision, pillars, competitive positioning, roadmap | [specs/product-strategy.md](chopsticks/specs/product-strategy.md) |
| **Product Roadmap** | Phase-by-phase feature rollout plan | [specs/product-roadmap.md](chopsticks/specs/product-roadmap.md) |
| **Pitch Deck** | Investor presentation | [specs/pitch-deck.md](chopsticks/specs/pitch-deck.md) |
| **Competitive Research** | Market analysis and competitor insights | [specs/competitive-research.md](chopsticks/specs/competitive-research.md) |
| **Marketing Plan** | Go-to-market strategy | [specs/marketing-plan.md](chopsticks/specs/marketing-plan.md) |

### MVP Documentation

Located in `chopsticks/specs/mvp/`:

| Document | Purpose |
|----------|---------|
| **[PRD.md](chopsticks/specs/mvp/PRD.md)** | Product Requirements Document for MVP |
| **[data-model.md](chopsticks/specs/mvp/data-model.md)** | Database schema and architecture |
| **[spec.md](chopsticks/specs/mvp/spec.md)** | Technical specification |
| **[tasks.md](chopsticks/specs/mvp/tasks.md)** | Implementation task breakdown |
| **[research.md](chopsticks/specs/mvp/research.md)** | Technical research and decisions |

### Post-MVP Features

Located in `chopsticks/specs/post-mvp/`:
- **[curated-lists.md](chopsticks/specs/post-mvp/curated-lists.md)** - Food discovery lists feature
- **[foodie-personality-quiz.md](chopsticks/specs/post-mvp/foodie-personality-quiz.md)** - Profile enrichment feature

---

## Getting Started

### Prerequisites
- Node.js 18+
- pnpm
- Expo CLI
- iOS Simulator (Mac) or Android Emulator

### Installation

```bash
# Install dependencies
cd chopsticks
pnpm install

# Start development server
pnpm start

# Run on iOS
pnpm ios

# Run on Android
pnpm android
```

### Environment Setup

Copy `.env.example` to `.env` and configure:
- Supabase credentials
- Firebase configuration
- API keys

---

## Product Roadmap

### Phase 0: MVP (Current)
**Goal:** Validate that strangers show up to eat together (>70% show-up rate)
- Meal requests (create, browse, join)
- Basic profiles with preferences
- Show-up ratings
- HCMC only, ~100 users

### Phase 1: Food Identity & Discovery
**Goal:** Give users solo value beyond meal planning
- Foodie personality quiz
- Curated restaurant lists
- "Been there" tracking
- Reviews and nominations

### Phase 2: Social Graph
**Goal:** Turn one-off meals into lasting connections
- Foodie connections
- Share restaurants/lists
- Itinerary Share Card (primary UA loop)
- One-tap meal invites

### Phase 3: Monetization
**Goal:** Prove revenue model
- Paywall for full lists
- City expansion (unlock other cities)
- Personalized recommendations

---

## Tech Stack

- **Frontend:** React Native (Expo), TypeScript, NativeWind (Tailwind)
- **Backend:** Supabase (PostgreSQL, Auth, Realtime)
- **State Management:** Zustand
- **Navigation:** Expo Router
- **Validation:** Zod

---

## Contributing

This is currently a private project. For team members:
1. Read the [Product Strategy](chopsticks/specs/product-strategy.md) first
2. Check [Linear](https://linear.app/chopsticks) for current tasks
3. Follow the implementation plan in `specs/mvp/tasks.md`

---

## Contact

For questions or collaboration:
- Linear: https://linear.app/chopsticks
- Documentation: `chopsticks/specs/`

---

*Chopsticks — Where food brings people together* 🍜
