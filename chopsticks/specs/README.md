# Chopsticks Documentation

This directory contains all product, technical, and strategic documentation for Chopsticks.

---

## Documentation Structure

```
specs/
├── README.md                    ← You are here
│
├── 📊 Strategy & Vision
│   ├── product-strategy.md      ← Product vision, pillars, competitive positioning
│   ├── product-roadmap.md       ← Multi-phase execution plan
│   ├── pitch-deck.md            ← Investor presentation
│   ├── competitive-research.md  ← Market analysis
│   └── marketing-plan.md        ← Go-to-market strategy
│
├── 🛠️ MVP (Phase 0)
│   └── mvp/
│       ├── PRD.md              ← Product requirements
│       ├── data-model.md       ← Database schema
│       ├── spec.md             ← Technical specification
│       ├── tasks.md            ← Implementation tasks
│       ├── research.md         ← Technical decisions
│       ├── quickstart.md       ← Quick start guide
│       └── contracts/          ← API contracts
│
└── 🚀 Post-MVP (Phase 1+)
    └── post-mvp/
        ├── curated-lists.md            ← Food discovery lists
        └── foodie-personality-quiz.md  ← Profile enrichment
```

---

## Document Index

### Strategy & Vision Layer

| Document | Audience | Purpose | When to Use |
|----------|----------|---------|-------------|
| **[product-strategy.md](product-strategy.md)** | Product, Engineering, Founders | Defines product vision, pillars, feature areas, roadmap, and competitive positioning | When making product decisions, prioritizing features, or explaining what Chopsticks is |
| **[product-roadmap.md](product-roadmap.md)** | Product, Engineering, Founders | Phase-by-phase feature rollout plan with validation gates | When planning sprints, estimating timelines, or understanding feature dependencies |
| **[pitch-deck.md](pitch-deck.md)** | Investors, Founders, Marketing | Investor-ready presentation covering problem, solution, market, and vision | When fundraising, recruiting, or explaining the business to external stakeholders |
| **[competitive-research.md](competitive-research.md)** | Product, Marketing, Founders | Analysis of competitors, what failed, and how Chopsticks avoids common pitfalls | When positioning the product, learning from competitors, or pitching to investors |
| **[marketing-plan.md](marketing-plan.md)** | Marketing, Founders | Go-to-market strategy, channels, content calendar, and launch plan | When planning marketing activities, content, or launch events |

### MVP Documentation (Phase 0)

| Document | Audience | Purpose | When to Use |
|----------|----------|---------|-------------|
| **[mvp/PRD.md](mvp/PRD.md)** | Engineering, Product | Detailed product requirements for MVP features, screens, and flows | When building MVP features, writing tickets, or clarifying implementation details |
| **[mvp/data-model.md](mvp/data-model.md)** | Engineering | Complete database schema with entities, relationships, and RLS policies | When writing database migrations, API endpoints, or understanding data architecture |
| **[mvp/spec.md](mvp/spec.md)** | Engineering | Technical specification and architecture decisions | When implementing features or understanding technical approach |
| **[mvp/tasks.md](mvp/tasks.md)** | Engineering | Dependency-ordered implementation task breakdown | When planning sprints or tracking implementation progress |
| **[mvp/research.md](mvp/research.md)** | Engineering | Technical research, decisions, and rationale | When understanding why certain technical choices were made |
| **[mvp/quickstart.md](mvp/quickstart.md)** | Engineering | Quick start guide for development setup | When onboarding new developers |

### Post-MVP Features (Phase 1+)

| Document | Audience | Purpose |
|----------|----------|---------|
| **[post-mvp/curated-lists.md](post-mvp/curated-lists.md)** | Product, Engineering | Specification for curated restaurant lists feature |
| **[post-mvp/foodie-personality-quiz.md](post-mvp/foodie-personality-quiz.md)** | Product, Engineering | Specification for foodie personality quiz feature |

---

## How to Navigate

### For Product Decisions
1. Start with **product-strategy.md** to understand vision and pillars
2. Check **product-roadmap.md** for phasing and dependencies
3. Reference **competitive-research.md** for market context

### For Implementation Work
1. Start with **mvp/PRD.md** for feature requirements
2. Check **mvp/data-model.md** for database structure
3. Reference **mvp/spec.md** for technical architecture
4. Follow **mvp/tasks.md** for implementation order

### For External Communication
1. Use **pitch-deck.md** for investor/founder conversations
2. Reference **product-strategy.md** for product positioning
3. Check **marketing-plan.md** for go-to-market strategy

### For New Team Members
1. Read **product-strategy.md** (vision and strategy)
2. Read **mvp/quickstart.md** (development setup)
3. Read **mvp/PRD.md** (what we're building)
4. Check **mvp/tasks.md** (what's being worked on)

---

## Documentation Principles

### Keep It Updated
- Update **product-strategy.md** when assumptions are validated or invalidated
- Update **product-roadmap.md** after each phase completion
- Update **mvp/data-model.md** when schema changes occur
- Update **competitive-research.md** quarterly or when new competitors emerge

### Version Control
- **mvp/** docs are locked once MVP is complete (create new versions for changes)
- **post-mvp/** docs are living until features ship
- Strategy docs are always living documents

### Sync to Linear
These documents are synced to Linear's Documentation project for team collaboration. Updates should be made in code first, then synced to Linear using the sync scripts in `/scripts/`.

---

## Key Concepts

### The Fragmented Discovery Problem

Chopsticks solves a real user pain point:
1. **Discovery**: People find food content on TikTok/YouTube
2. **Validation**: They cross-check via comments and Google Maps reviews
3. **Organization**: No centralized place to save and organize finds
4. **Action**: Manual coordination with friends to actually go eat

**Chopsticks centralizes all of this** while adding a social dining layer.

### Product Pillars (From product-strategy.md)

1. **Food-First Identity** — Your taste is your profile
2. **Meals Are Better Shared** — Always nudge toward eating together
3. **Discovery Through People** — Real people > algorithms
4. **Safety by Design** — Trust infrastructure built in
5. **Low Friction, High Intent** — Easy actions, real commitment

### Multi-Phase Roadmap

- **Phase 0 (MVP)**: Validate strangers show up (>70% show-up rate)
- **Phase 1**: Food identity + discovery (solo value)
- **Phase 2**: Social graph (persistent connections)
- **Phase 3**: Monetization (prove revenue model)

---

## Contributing to Documentation

1. **Make changes in code first** (this directory)
2. Use markdown formatting consistently
3. Update the date in `*Last Updated:*` headers
4. Run sync scripts to push changes to Linear (if applicable)
5. Link between documents using relative paths

---

*For more information, see the main project README at [/README.md](../../README.md)*
