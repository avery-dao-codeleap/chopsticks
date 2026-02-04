# Feature Spec: Foodie Personality Quiz

*Last Updated: February 3, 2026*
*Status: Post-MVP*

---

## 1. Overview

### 1.1 What Is This?
A series of food-related personality questions that users answer to build a richer profile. Answers are displayed publicly on profiles, making users more distinctive and credible to others.

### 1.2 Why Build This?
- **Profiles feel thin:** Current MVP profiles have photo, name, age, persona, cuisine preferences, and a 200-char bio. Not enough to feel like you "know" someone.
- **Matching is shallow:** Approval-based joins rely on gut feeling from minimal info. More signals = better decisions.
- **Identity depth:** The vision is "food-related identity." A quiz makes food personality tangible and shareable.
- **Conversation starters:** Quiz answers give meal companions something to talk about.
- **Credibility:** Someone who answers 20 food questions feels more "real" than a bare profile.

### 1.3 Design Principles
1. **Low friction:** Binary or multiple choice only. No open text (that's what bio is for).
2. **Opinionated:** Questions should reveal taste, not just collect data. "Pho: rare beef or well-done?" is better than "Do you like pho?"
3. **Fun, not tedious:** Questions should feel like a game, not a form.
4. **Skippable:** Optional in onboarding, can complete later in profile.
5. **Visible:** Answers display on public profile. This isn't hidden matching data.

---

## 2. Question Framework

### 2.1 Question Types

| Type | Format | Example |
|------|--------|---------|
| **This or That** | Binary choice between two options | "Pho: rare beef or well-done?" |
| **Spectrum** | Pick a point on a scale (3-5 options) | "Spice tolerance: mild → medium → hot → extreme" |
| **Multiple Choice** | Pick one from 3-4 options | "Your ideal meal time: breakfast / lunch / dinner / late night" |
| **Multi-Select** | Pick all that apply (2-4 options) | "Deal breakers: slow service / no AC / cash only / loud music" |

### 2.2 Question Categories

| Category | What It Reveals | Example Questions |
|----------|-----------------|-------------------|
| **Taste Preferences** | What flavors/styles you prefer | Rare vs well-done, sweet vs savory, soup vs dry |
| **Dining Style** | How you like to eat | Solo vs group, quick vs leisurely, adventurous vs familiar |
| **Food Philosophy** | Your relationship with food | Eat to live vs live to eat, Instagram vs just eat, street food vs restaurant |
| **Local Knowledge** | How deep is your food knowledge | Tourist spots vs hidden gems, know the menu vs ask the waiter |
| **Social Eating** | How you behave at meals | Share everything vs own plate, try my food vs don't touch my food |

---

## 3. Question Bank

### 3.1 This or That (Binary)

| # | Question | Option A | Option B |
|---|----------|----------|----------|
| 1 | Pho preference | Rare beef (tái) | Well-done (chín) |
| 2 | Bánh mì filling | Pate & cold cuts | Grilled meat |
| 3 | Morning drink | Cà phê sữa đá | Trà đá |
| 4 | Noodle soup base | Beef broth | Pork broth |
| 5 | Bún vs Phở | Bún (vermicelli) | Phở (flat noodles) |
| 6 | Street food setting | Plastic stool, sidewalk | Air-conditioned restaurant |
| 7 | Trying new places | Love discovering new spots | Stick to my favorites |
| 8 | Food photos | Always snap before eating | Just eat, no photos |
| 9 | Menu strategy | Know what I want | Ask for recommendations |
| 10 | Sharing food | Everything on the table is shared | I ordered this, it's mine |
| 11 | Spice preference | Add more chili | Keep it mild |
| 12 | Meal timing | Eat when hungry | Eat on schedule |
| 13 | Portion size | One dish, finish it | Multiple dishes, taste everything |
| 14 | Waiting for food | Worth the wait if it's good | No food is worth a queue |
| 15 | Cooking at home | Love cooking | Prefer eating out |

### 3.2 Spectrum (3-5 Options)

| # | Question | Options (left to right) |
|---|----------|------------------------|
| 16 | Spice tolerance | None → Mild → Medium → Hot → Extreme |
| 17 | Budget comfort zone | Street food cheap → Mid-range → Fancy is fine → Price doesn't matter |
| 18 | Meal pace | Fast, I'm busy → Normal → Slow, let's enjoy this |
| 19 | Adventure level | Only eat what I know → Curious but cautious → I'll try anything once |
| 20 | Sweetness in drinks | No sugar → Light → Normal → Extra sweet |

### 3.3 Multiple Choice (Pick One)

| # | Question | Options |
|---|----------|---------|
| 21 | Best meal of the day | Breakfast / Lunch / Dinner / Late night |
| 22 | Ideal group size for eating | Solo / 2 people / 3-4 people / Big group |
| 23 | If you could only eat one cuisine | Vietnamese / Japanese / Korean / Thai / Western |
| 24 | Restaurant vibe preference | Quiet and intimate / Lively and bustling / Don't care, just good food |
| 25 | How do you find new restaurants? | Friends' recommendations / Social media / Walking around / Food apps |

### 3.4 Multi-Select (Pick All That Apply)

| # | Question | Options |
|---|----------|---------|
| 26 | Restaurant deal breakers | Slow service / No AC / Cash only / Too loud / Bad lighting |
| 27 | Must-haves at the table | Chili sauce / Lime / Fresh herbs / Fish sauce |
| 28 | I eat this weekly | Phở / Cơm tấm / Bún / Bánh mì |
| 29 | Food experiences I want | Hole-in-the-wall gem / High-end tasting menu / Cooking class / Food tour |

---

## 4. User Experience

### 4.1 Onboarding Integration

**Placement:** After cuisine/budget preferences, before bio.

**Flow:**
```
1. Screen: "Let's learn your food personality"
   Subtitle: "Answer a few questions so others know what kind of eater you are"
   [Start Quiz] [Skip for now]

2. If Start Quiz:
   - Show 5 randomized questions from the bank (different for each user)
   - One question per screen
   - Tap to answer, auto-advance
   - Progress indicator (1/5, 2/5...)
   - All questions are optional - can skip any question

3. After 5 questions:
   Screen: "Nice! You can answer more questions anytime in your profile"
   [Continue to bio]

4. If Skip:
   - Proceed to bio
   - Profile shows "0 questions answered" or empty quiz section
```

**Why only 5 in onboarding:**
- Reduces friction to complete signup
- Users can answer more later
- Creates a "complete your profile" hook for retention

### 4.2 Profile Quiz Section

**Location:** On user profile, below bio, above cuisine preferences.

**Display:**

```
┌─────────────────────────────────────┐
│ 🍜 Food Personality                 │
│                                     │
│ Pho: Rare beef (tái)               │
│ Spice: 🌶️🌶️🌶️ Hot                   │
│ Street food > Restaurant            │
│ "I'll try anything once"            │
│ Shares food at the table            │
│                                     │
│ [See all 12 answers]                │
│ [Answer more questions]             │
└─────────────────────────────────────┘
```

**Display rules:**
- Show up to 5 answers on profile preview
- "See all X answers" expands to full list
- If <5 answers, show all + "Answer more questions" prompt
- If 0 answers, show "No food personality yet" + CTA

### 4.3 Answering More Questions

**Entry points:**
1. Profile → "Answer more questions" button
2. Settings → "Food Personality Quiz"
3. Post-meal prompt (optional): "Answer a question while you wait?"

**Flow:**
```
1. Quiz screen shows unanswered questions
2. One question per screen
3. User can:
   - Answer → saves immediately, shows next question
   - Skip → shows next question
   - Exit → return to profile
4. Can change previous answers anytime
```

### 4.4 Viewing Others' Answers

**On other users' profiles:**
- Same display as own profile
- No "Answer more questions" CTA
- Tapping "See all X answers" shows full list

**In approval flow:**
- Quiz answers visible when reviewing join requests
- Helps creator decide who to approve

---

## 5. Data Model

### 5.1 Tables

**quiz_questions**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| question_text | text | The question |
| question_type | enum | this_or_that, spectrum, multiple_choice, multi_select |
| category | text | taste, dining_style, philosophy, knowledge, social |
| options | jsonb | Array of {value, label, emoji?} |
| is_active | boolean | Can be shown to users |
| display_order | int | For consistent ordering |
| created_at | timestamp | |

**user_quiz_answers**
| Column | Type | Description |
|--------|------|-------------|
| id | uuid | Primary key |
| user_id | uuid | FK to users |
| question_id | uuid | FK to quiz_questions |
| answer | jsonb | Selected option(s) |
| answered_at | timestamp | |
| updated_at | timestamp | |

**Indexes:**
- user_quiz_answers(user_id) - for loading profile
- user_quiz_answers(user_id, question_id) - unique constraint

### 5.2 RLS Policies

```sql
-- Anyone can read quiz questions
CREATE POLICY "Quiz questions are public"
ON quiz_questions FOR SELECT
USING (is_active = true);

-- Users can read anyone's quiz answers
CREATE POLICY "Quiz answers are public"
ON user_quiz_answers FOR SELECT
USING (true);

-- Users can only write their own answers
CREATE POLICY "Users manage own answers"
ON user_quiz_answers FOR ALL
USING (auth.uid() = user_id);
```

---

## 6. Future Considerations

### 6.1 Matching Implications
Currently, quiz answers are display-only. Future possibilities:
- **Compatibility score:** Calculate similarity between users' answers
- **Filter by answer:** Creator filters join requests by specific answers (e.g., "only people who share food")
- **Smart suggestions:** Recommend meal requests based on quiz compatibility

### 6.2 Question Expansion
- Add seasonal/event questions (Tết food preferences, etc.)
- Add city-specific questions when expanding beyond HCMC
- User-submitted questions (moderated)

### 6.3 Gamification
- "Food personality type" summary (e.g., "The Adventurous Local")
- Badges for answering all questions in a category
- Share personality card to social media

### 6.4 Analytics
Track:
- Which questions have highest completion rate
- Which answers are most common (find the interesting splits)
- Correlation between quiz completion and show-up rate
- Whether quiz similarity predicts successful meals

---

## 7. Open Questions

1. ~~**How many questions total?** Current bank has ~29. Is that enough? Too many?~~ **Decided:** 29 is good for launch.

2. ~~**Should any questions be required?** Or all optional?~~ **Decided:** All optional.

3. **Display priority:** Which answers show in the 5-answer preview? Most recent? Most "interesting"? User's choice?

4. **Change answers:** Can users change answers freely, or is there a limit to prevent gaming?

5. **Question weighting:** Are some questions more important for future matching algorithms?

---

## 8. Success Metrics

| Metric | Target | Why It Matters |
|--------|--------|----------------|
| Quiz start rate (onboarding) | >60% | Do users engage with the concept? |
| Quiz completion rate (5 questions) | >80% of starters | Is it too long/boring? |
| Answers per user (after 30 days) | >10 average | Do users come back to answer more? |
| Profile views with quiz data | >70% | Is this becoming standard? |
| Qualitative: conversation starters | Positive feedback | Do quiz answers help at meals? |

---

## 9. Implementation Notes

### 9.1 MVP of the Feature
Start with:
- 15-20 questions (subset of bank above)
- This or That + Spectrum types only (simplest UI)
- 5 questions in onboarding
- Basic profile display

Add later:
- Multiple choice + multi-select types
- More questions
- Analytics dashboard
- Matching integration

### 9.2 Localization
All questions need Vietnamese translations. Some questions are Vietnam-specific (pho, bánh mì, cà phê sữa đá) - these work for HCMC launch. For future city expansion, need city-appropriate question variants.

---

*End of spec*
