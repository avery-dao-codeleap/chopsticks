# Linear Project Structure - Chopsticks

*Ready to import once Linear MCP is connected*

---

## Project Setup

### Team Structure
- **Team:** Chopsticks
- **Projects:**
  - MVP (Phase 0)
  - Phase 1: Identity & Discovery
  - Phase 2: Social Graph
  - Phase 3: Monetization
  - Marketing & Growth

### Labels
- `feature` - New functionality
- `bug` - Something broken
- `design` - Design work needed
- `backend` - Supabase/API work
- `frontend` - React Native work
- `content` - Copy, translations, curated data
- `marketing` - Growth initiatives
- `research` - User research, competitive analysis

### Priorities
- `urgent` - Blocking launch
- `high` - Core functionality
- `medium` - Important but not blocking
- `low` - Nice to have

---

## Phase 0: MVP

### Epic: Authentication & Onboarding

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MVP-001 | Phone auth with Firebase | Implement Firebase phone OTP verification | High | backend |
| MVP-002 | Firebase → Supabase JWT bridge | Exchange Firebase token for Supabase JWT | High | backend |
| MVP-003 | Photo upload with face detection | Implement expo-face-detector for profile photos | High | frontend |
| MVP-004 | Onboarding flow UI | 9-step onboarding (phone → photo → profile → persona → cuisines → budget → bio → intent) | High | frontend, design |
| MVP-005 | City check (HCMC only) | Block users not in HCMC with appropriate messaging | Medium | frontend |
| MVP-006 | Persona selection screen | 5 persona options (Local, New to city, Expat, Traveler, Student) | Medium | frontend |
| MVP-007 | Cuisine preferences screen | 14 cuisine categories, multi-select | Medium | frontend |
| MVP-008 | Budget preferences screen | 4 budget ranges, multi-select | Medium | frontend |
| MVP-009 | Bio input with prompt | Food-related prompt, 200 char max | Medium | frontend |
| MVP-010 | "Do you know where to eat?" routing | Final question that routes to create vs browse | Medium | frontend |

### Epic: User Profiles

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MVP-011 | User profile data model | Create users + user_preferences tables with RLS | High | backend |
| MVP-012 | Profile view screen | Display photo, name, age, persona, meal count, cuisines, bio | High | frontend |
| MVP-013 | Edit profile flow | Allow editing all fields except phone and age | Medium | frontend |
| MVP-014 | Other user profile view | Read-only view of other users' profiles | Medium | frontend |

### Epic: Restaurants

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MVP-015 | Restaurant data model | Create restaurants table with RLS | High | backend |
| MVP-016 | Seed curated restaurants | Add 50-100 HCMC restaurants to database | High | content |
| MVP-017 | Restaurant picker component | Searchable list of curated restaurants | High | frontend |
| MVP-018 | Manual restaurant entry | Form for name + address + district | Medium | frontend |

### Epic: Meal Requests

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MVP-019 | Meal request data model | Create meal_requests + request_participants tables | High | backend |
| MVP-020 | Create request flow | Restaurant + cuisine + budget + time + size + join type | High | frontend |
| MVP-021 | Browse requests list view | List with request cards showing creator, cuisine, district, time, spots | High | frontend |
| MVP-022 | Filter bar component | District, cuisine, budget filters | High | frontend |
| MVP-023 | Request detail screen | Full request info with join button | High | frontend |
| MVP-024 | Open join flow | Instant join → add to chat → reveal location | High | frontend, backend |
| MVP-025 | Approval join flow | Request to join → creator approves → add to chat | High | frontend, backend |
| MVP-026 | Creator approval screen | View pending requests, filter by gender/age/persona, approve/reject | High | frontend |
| MVP-027 | Request expiration logic | Filter out expired requests (WHERE time_window > NOW()) | Medium | backend |
| MVP-028 | Request cancellation | Creator cancels → notify everyone → chat readable 24h | Medium | frontend, backend |

### Epic: Chat

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MVP-029 | Chat data model | Create chats, chat_participants, messages tables | High | backend |
| MVP-030 | Supabase Realtime setup | Configure realtime subscriptions for messages | High | backend |
| MVP-031 | Chat screen UI | Message list, input, timestamps, read receipts | High | frontend |
| MVP-032 | Image sharing in chat | Upload and display images in chat | Medium | frontend, backend |
| MVP-033 | Creator remove user | Allow creator to remove participants from chat | Medium | frontend, backend |
| MVP-034 | Chat member list | View all participants in the chat | Low | frontend |

### Epic: Post-Meal Rating

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MVP-035 | Rating data model | Create person_ratings table | Medium | backend |
| MVP-036 | Rating prompt trigger | Prompt on next app open after meal time | Medium | frontend |
| MVP-037 | Rating UI | "Did [name] show up?" Yes/No for each participant | Medium | frontend |

### Epic: Notifications

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MVP-038 | Expo Push setup | Configure Expo Push Notifications | High | backend |
| MVP-039 | Push token storage | Store device push tokens in Supabase | High | backend |
| MVP-040 | Join request notification | "Someone wants to join your request" | High | backend |
| MVP-041 | Approval notification | "You've been approved" | High | backend |
| MVP-042 | New message notification | Push for new chat messages | High | backend |
| MVP-043 | Notification list screen | View all notifications in-app | Medium | frontend |

### Epic: Safety & Settings

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MVP-044 | Report button | Report user → sends email to admin | Medium | frontend, backend |
| MVP-045 | Reports data model | Create reports table | Medium | backend |
| MVP-046 | Settings screen | Edit profile, language toggle, delete account, report | Medium | frontend |
| MVP-047 | Language toggle (i18n) | Vietnamese + English with react-i18next | High | frontend |
| MVP-048 | Delete account flow | Soft delete user data | Medium | frontend, backend |

### Epic: Infrastructure

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MVP-049 | Supabase project setup | Create project, configure auth, storage | High | backend |
| MVP-050 | Database migrations | All table schemas with RLS policies | High | backend |
| MVP-051 | Expo project setup | SDK 52+, Expo Router, NativeWind | High | frontend |
| MVP-052 | State management setup | Zustand + TanStack Query | High | frontend |
| MVP-053 | App Store submission | iOS App Store listing and review | High | frontend |
| MVP-054 | Play Store submission | Google Play Store listing and review | High | frontend |

---

## Phase 1: Identity & Discovery

### Epic: Foodie Personality Quiz

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| P1-001 | Quiz data model | quiz_questions + user_quiz_answers tables | High | backend |
| P1-002 | Seed quiz questions | Add 29 questions to database | High | content |
| P1-003 | Quiz intro screen | "Let's learn your food personality" with Start/Skip | High | frontend, design |
| P1-004 | This-or-that question component | Binary choice UI | High | frontend |
| P1-005 | Spectrum question component | 3-5 point scale UI | High | frontend |
| P1-006 | Multiple choice component | Pick one from 3-4 options | Medium | frontend |
| P1-007 | Multi-select component | Pick all that apply | Medium | frontend |
| P1-008 | Quiz flow in onboarding | 5 random questions, optional, skippable | High | frontend |
| P1-009 | Quiz section on profile | Display 5 answers with "see all" | High | frontend |
| P1-010 | Answer more questions screen | Answer remaining questions from profile | Medium | frontend |
| P1-011 | Quiz answers on other profiles | View other users' quiz answers | Medium | frontend |
| P1-012 | Translate quiz questions | Vietnamese translations for all 29 | Medium | content |

### Epic: Curated Lists

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| P1-013 | Lists data model | lists + list_restaurants tables | High | backend |
| P1-014 | Create initial lists | 15-20 curated lists for HCMC | High | content |
| P1-015 | Discovery tab (bottom nav) | New tab with list browsing | High | frontend, design |
| P1-016 | Discovery home screen | Search, your lists, popular lists, categories | High | frontend |
| P1-017 | List detail screen | Cover, description, ranked restaurants | High | frontend |
| P1-018 | List progress indicator | "3/12 visited" progress bar | Medium | frontend |
| P1-019 | Category browsing | Browse lists by cuisine category | Medium | frontend |
| P1-020 | District browsing | Browse lists by district | Medium | frontend |

### Epic: User Actions on Restaurants

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| P1-021 | Favorites data model | user_favorites table | High | backend |
| P1-022 | Save to favorites | Add/remove restaurant from favorites | High | frontend |
| P1-023 | Favorites list screen | View all saved restaurants | High | frontend |
| P1-024 | Visits data model | user_visits table | High | backend |
| P1-025 | Mark "Been There" | Record restaurant visit | High | frontend |
| P1-026 | Been There list screen | View all visited restaurants | High | frontend |
| P1-027 | Enhanced restaurant detail | Lists it appears on, actions, visit count | High | frontend |

### Epic: Reviews

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| P1-028 | Reviews data model | reviews table with photos | High | backend |
| P1-029 | Write review flow | Rating + text + optional photos | High | frontend |
| P1-030 | Reviews on restaurant detail | Display reviews with ratings | High | frontend |
| P1-031 | Restaurant stats aggregation | Avg rating, review count, visit count | Medium | backend |
| P1-032 | Review moderation | Flag/remove inappropriate reviews | Medium | backend |

### Epic: Nominations

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| P1-033 | Nominations data model | nominations table | Medium | backend |
| P1-034 | Nominate for list flow | Select list or suggest new | Medium | frontend |
| P1-035 | Nomination admin queue | Internal tool to review nominations | Low | backend |

---

## Phase 2: Social Graph

### Epic: Connections

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| P2-001 | Connections data model | user_connections table | High | backend |
| P2-002 | Add connection flow | Send/accept connection request | High | frontend |
| P2-003 | Post-meal connection prompt | "Add [name] as a connection?" | High | frontend |
| P2-004 | Connections list screen | View all connections | High | frontend |
| P2-005 | Connection count on profile | Display connection count | Medium | frontend |

### Epic: Sharing

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| P2-006 | Share data model | shares table | High | backend |
| P2-007 | Share restaurant to connections | Select connections, add message | High | frontend |
| P2-008 | Share list to connections | Select connections, add message | High | frontend |
| P2-009 | Shares inbox | View received shares | High | frontend |
| P2-010 | Share notification | Push when someone shares with you | High | backend |
| P2-011 | External share | Copy link, WhatsApp, Messenger | Medium | frontend |

### Epic: Invite to Eat

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| P2-012 | Private meal request type | Meal requests visible only to invitees | High | backend |
| P2-013 | Invite from restaurant | "Invite friends to eat here" flow | High | frontend |
| P2-014 | Select time picker | Date/time selection for invite | High | frontend |
| P2-015 | Select connections | Pick which connections to invite | High | frontend |
| P2-016 | "Open to strangers" toggle | Make private invite also public | Medium | frontend |
| P2-017 | Invite notification | Push for meal invites | High | backend |
| P2-018 | Accept/decline invite | Invitee responds to invite | High | frontend |

---

## Phase 3: Monetization

### Epic: Premium Infrastructure

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| P3-001 | Premium status data model | is_premium flag, subscription dates | High | backend |
| P3-002 | In-app purchase setup (iOS) | StoreKit integration | High | frontend |
| P3-003 | In-app purchase setup (Android) | Google Play Billing | High | frontend |
| P3-004 | Subscription management | View/cancel subscription | Medium | frontend |

### Epic: Paywall - Full Lists

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| P3-005 | List paywall logic | Show top 3 free, lock rest | High | frontend |
| P3-006 | Unlock prompt UI | "See all X spots" upgrade modal | High | frontend, design |
| P3-007 | Premium list access | Full list for premium users | High | frontend |

### Epic: Paywall - Other Cities

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| P3-008 | City selector component | Show available cities with lock icons | High | frontend |
| P3-009 | City unlock logic | Premium users can browse other cities | High | backend |
| P3-010 | Hanoi content | Create lists and restaurants for Hanoi | High | content |
| P3-011 | Per-city unlock option | Unlock single city vs all cities | Medium | frontend |

---

## Marketing & Growth

### Epic: Pre-Launch

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MKT-001 | Landing page | chopsticks.app with waitlist signup | High | marketing, design |
| MKT-002 | Instagram account setup | @chopsticks.vn with content strategy | High | marketing |
| MKT-003 | TikTok account setup | @chopsticks.vn for food content | Medium | marketing |
| MKT-004 | Food influencer outreach list | Identify 20 HCMC food influencers | High | marketing |
| MKT-005 | Influencer outreach campaign | Personal outreach for beta access | High | marketing |
| MKT-006 | Press kit | App screenshots, founder story, key stats | Medium | marketing |

### Epic: Launch

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MKT-007 | Launch announcement | Social posts, email to waitlist | High | marketing |
| MKT-008 | Influencer launch posts | Coordinated posts from influencer partners | High | marketing |
| MKT-009 | Facebook group seeding | Post in HCMC expat/food groups | Medium | marketing |
| MKT-010 | University outreach | Target student groups in HCMC | Medium | marketing |
| MKT-011 | Hostel/coworking partnerships | Flyers and QR codes in high-traffic spots | Medium | marketing |

### Epic: Content & Community

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MKT-012 | Weekly "best of" content | Instagram/TikTok food features | Medium | marketing, content |
| MKT-013 | User story features | Highlight successful meal meetups | Medium | marketing |
| MKT-014 | Restaurant feature series | Behind-the-scenes at curated spots | Medium | marketing, content |
| MKT-015 | Seasonal list content | Tết food, rainy season comfort food, etc. | Medium | marketing, content |

### Epic: Paid Acquisition (Post-Validation)

| Ticket | Title | Description | Priority | Labels |
|--------|-------|-------------|----------|--------|
| MKT-016 | Facebook/Instagram ads setup | Pixel, audiences, campaign structure | Low | marketing |
| MKT-017 | Creative testing | 5-10 ad variations | Low | marketing, design |
| MKT-018 | Retargeting campaigns | Website visitors, app installers | Low | marketing |

---

## Milestones

| Milestone | Target | Dependencies |
|-----------|--------|--------------|
| MVP Feature Complete | - | All MVP-* tickets |
| MVP Launch | - | App Store + Play Store approval |
| 100 Users | - | Launch marketing |
| Core Validated (>70% show-up) | 2 weeks post-launch | Rating data |
| Phase 1 Feature Complete | - | All P1-* tickets |
| 1,000 Reviews | - | Review feature live |
| Phase 2 Feature Complete | - | All P2-* tickets |
| First Paying Customer | - | P3 paywall live |
| Second City (Hanoi) | - | Hanoi content ready |

---

*This document is the source of truth for Linear tickets. Once Linear MCP is connected, these will be created as issues.*
