# Product Requirements Document (PRD)
## Chopsticks - Food Discovery & Social Connection App

---

## 1. Overview

### 1.1 Vision
Chopsticks is a mobile-first React Native application built with Expo that connects food enthusiasts to discover authentic street food culture, share experiences through community groups, and meet fellow diners through real-time matching. Inspired by hawker centers, night markets, and casual eateries where people gather over affordable, delicious food.

### 1.2 Problem Statement
- People are tired of traditional dating apps with no genuine connection
- Diners often want company but lack a convenient way to find meal companions
- Food enthusiasts want to discover authentic spots and share experiences
- Existing apps don't provide a tangible "ice breaker" for social connections

### 1.3 Solution
A foodie-focused social app that lets users match with others based on meal preferences, time, location, and budget - using food as the foundation for meaningful connections.

---

## 2. Target Audience

### 2.1 Primary Users
| Segment | Description |
|---------|-------------|
| Young people (Gen Z) | Want authentic social connections, not traditional dating |
| Food enthusiasts | Passionate about discovering authentic street food, hawker stalls, and hidden gems |
| Solo diners | Don't want to eat alone, seeking meal companions |
| Connection seekers | Want real friendships without romantic pressure |
| Spontaneous users | Browse when bored, looking for instant plans |

### 2.2 User Needs
- Find meal companions based on food preference, time, and budget
- Discover hidden food spots and get recommendations
- Build genuine connections through shared dining experiences
- Have a built-in conversation starter (the meal itself)

---

## 3. Product Features

### 3.1 Core Features

#### 3.1.1 User Profile
- **Required fields:** Name, age, profile picture (clear face required)
- **Food preferences:** Cuisine types, dietary restrictions, allergy flags
- **Budget range:** Price preference for meals
- **Meal count:** Track of completed meals with connections
- **Saved locations:** Favorite restaurants and hidden spots
- **Verification status:** Trust indicator for safety

#### 3.1.2 Real-Time Matching
- Match users based on:
  - Food preference alignment
  - Time availability
  - Location proximity
  - Budget compatibility
- **Match expiration:** 24 hours if no confirmed plan
- **Meal time expiration:** 1 hour past scheduled meal time
- Group matching: Find more people to join a meal

#### 3.1.3 Food Discovery
- **Multi-category browsing:** Street food, hawker stalls, night markets, casual eateries, food courts
- **Cuisine filters:** Chinese, Thai, Vietnamese, Korean, Mexican, Indian, fusion, etc.
- AI-powered suggestions on 2D map (e.g., "cheap eats near me", "best pho nearby")
- Hidden spot recommendations from community
- Restaurant/stall profiles with visit counts
- Price range indicators for budget-friendly discovery

#### 3.1.4 Social Groups
- Community groups based on food interests
- Integrated group chat
- Share experiences and recommendations

#### 3.1.5 Post-Meal Actions
- Rate your connection
- Add restaurant to personal map
- Write restaurant review
- Increment meal count (+1 for both users)
- Add visit count to restaurant profile
- Option to save connection for future meals

### 3.2 Safety Features
- Clear face photo requirement
- Verification system
- Match expiration to prevent stale connections
- No doom-scrolling design (intentional friction)
- Public meeting places (restaurants)

---

## 4. User Flows

### 4.1 Matching Flow
```
1. User sets meal preferences (cuisine, time, budget, location)
2. Browse potential matches or get AI recommendations
3. Send/receive match requests
4. Match confirmed → Chat unlocked
5. Confirm meal plan within 24 hours
6. Meet at restaurant
7. Mark meal as completed
8. Rate connection & review restaurant
```

### 4.2 Discovery Flow
```
1. Open map view
2. Filter by cuisine category
3. View AI suggestions or community hidden spots
4. Check restaurant details & reviews
5. Optionally find a meal companion for that spot
```

---

## 5. Design Requirements

### 5.1 Design Aesthetic
- Gen Z focused design language
- Clean, convenient flow
- Minimal doom-scrolling
- Food-centric visual hierarchy

### 5.2 Key Screens
1. **Home/Discovery** - Map with restaurant pins and AI suggestions
2. **Match Feed** - Potential meal companions
3. **Chat** - Messaging with matches
4. **Profile** - User info, meal history, saved spots
5. **Groups** - Community food groups with chat

---

## 6. Technical Requirements

### 6.1 Platform
- **Framework:** React Native with Expo
- **Target platforms:** iOS, Android
- **Architecture:** Mobile-first design

### 6.2 Key Integrations
- Real-time chat functionality
- Location services / Maps API
- Push notifications
- AI recommendation engine
- Image upload and verification

---

## 7. Business Goals

### 7.1 Revenue Streams
- Restaurant advertisements and promotions
- Premium features (expanded matches, priority visibility)
- Partnership with restaurants

### 7.2 Success Metrics
| Metric | Description |
|--------|-------------|
| DAU/MAU | Daily and monthly active users |
| Match rate | % of users who successfully match |
| Meal completion rate | % of matches that result in completed meals |
| Retention | User return rate after first meal |
| Restaurant partnerships | Number of partner restaurants |

---

## 8. Product Differentiators

1. **Not a dating app** - Focused on food and friendship, not romance
2. **Built-in ice breaker** - The meal provides natural conversation
3. **Tangible outcome** - Every match has a concrete goal (eating together)
4. **Time-bound matches** - 24-hour expiration prevents endless swiping
5. **Quality over quantity** - Intentional friction reduces superficial browsing
6. **Community driven** - Hidden spots and authentic recommendations
7. **Street food focused** - Hawker centers, night markets, cheap eats - not fine dining

---

## 9. Future Considerations

- Expand to new cities with strong street food culture (Singapore, Bangkok, Tokyo, Mexico City, etc.)
- Restaurant/stall booking integration
- Loyalty/rewards program with partner vendors
- Event-based group meals (night market crawls, food tours)
- Food preference learning over time
- Vendor-side app for stall owners

---

## 10. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Safety concerns | Photo verification, public venues only, rating system |
| Low initial user base | Focus on specific geographic areas, partner with food influencers |
| Match quality | Refine algorithm based on completed meal feedback |
| No-shows | Reputation system, match history visibility |

---

*Document Version: 1.0*
*Last Updated: January 2025*