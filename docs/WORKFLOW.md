# Daily Workflow Guide

How to use Chopsticks' automated workflow tools for efficient sprint-based development.

---

## 🌅 Daily Routine

### **Morning: Start Your Day**

```bash
# Run daily standup
node scripts/daily-standup.js
```

This shows you:
- ✅ What was done yesterday (git commits)
- 🎯 Current tasks in progress
- 💡 Suggested next tasks (based on dependencies)
- 📊 Sprint progress (if active)

### **Optional: With Linear Sync**

```bash
LINEAR_API_KEY=your_key node scripts/daily-standup.js
```

Also shows Linear tickets in progress.

---

## 🏃 Sprint Management

### **Start a Sprint**

```bash
node scripts/sprint.js start
```

You'll be prompted for:
- Sprint name (e.g., "Sprint 1 - Foundational")
- Sprint goal (e.g., "Complete Phase 2 foundational tasks")
- Duration (default: 7 days)

### **Check Sprint Progress**

```bash
node scripts/sprint.js status
```

Shows:
- Days elapsed / remaining
- Tasks completed in this sprint
- Velocity (tasks/day)
- Projected completion

### **End a Sprint**

```bash
node scripts/sprint.js end
```

Saves a sprint summary and resets for the next sprint.

---

## 📝 Task Workflow

### **1. Pick a Task**

From your daily standup, pick a suggested task:

```bash
# Example output:
💡 Suggested next tasks:
   1. T022 - Implement Supabase client in services/supabase.ts
   2. T023 - Implement Firebase Auth client in services/firebase.ts
   3. T026 - Define TypeScript types in lib/types.ts
```

### **2. Work on the Task**

Tell Claude (me) what you want to work on:
```
"Let's work on T022 - Implement Supabase client"
```

I'll implement it for you.

### **3. Mark Task Complete**

When done, update [tasks.md](../chopsticks/specs/mvp/tasks.md):

```markdown
- [x] T022 Implement Supabase client in `services/supabase.ts`
```

Or ask me to update it:
```
"Mark T022 as complete"
```

### **4. Commit Changes**

```bash
git add .
git commit -m "feat: implement Supabase client with secure storage

Completed T022
- Added Supabase client initialization
- Integrated expo-secure-store for auth
- Set up TypeScript types

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

---

## 🎯 Sprint Planning Tips

### **Sprint Goals by Phase**

**Sprint 1: Setup + Foundational (2 weeks)**
- Goal: Complete Phase 1 + Phase 2
- Tasks: ~40 tasks (T001-T043)
- Success: Database ready, services configured, base UI built

**Sprint 2: Auth + Onboarding (1 week)**
- Goal: Complete Phase 3 (User Story 1)
- Tasks: ~19 tasks (T044-T061)
- Success: Users can sign up and complete onboarding

**Sprint 3: Core Meal Flow (2 weeks)**
- Goal: Complete Phase 4 + Phase 5 (US2 + US3)
- Tasks: ~26 tasks (T062-T087)
- Success: Users can create, browse, and join meal requests

### **Velocity Tracking**

After Sprint 1, you'll know your velocity:
- Example: 5 tasks/day → 35 tasks/week
- Use this to plan future sprints

---

## 🔄 Example Daily Flow

```bash
# Morning
$ node scripts/daily-standup.js

🌅 Daily Standup Report
══════════════════════════════════════════════════════
📅 Monday, February 10, 2026

🏃 Sprint: Sprint 1 - Foundational
   Goal: Complete foundational setup
   Days remaining: 5 days
   Tasks: 12/147 completed

✅ What was done yesterday:
   a1b2c3d - feat: implement Supabase client
   e4f5g6h - chore: configure ESLint and Prettier

📊 Progress: 12/147 tasks completed

🎯 Currently in progress:
   [ ] T024 - Implement push notifications service
   [ ] T030 - Configure react-i18next

💡 Suggested next tasks:
   1. T024 - Implement push notifications service
      Phase: Phase 2 — Foundational
   2. T036 - Create Button component
      Phase: Phase 2 — Foundational
   3. T037 - Create Input component
      Phase: Phase 2 — Foundational

══════════════════════════════════════════════════════
💬 Ready to work? Pick a task from suggestions above.
```

```
You: "Let's work on T024 - push notifications"
Claude: [implements the task]
You: "Mark T024 complete and commit"
Claude: [updates tasks.md and commits]
```

---

## 📊 Tracking Progress

### **Check Sprint Status Anytime**

```bash
node scripts/sprint.js status
```

### **View All Incomplete Tasks**

```bash
grep "\\[ \\]" chopsticks/specs/mvp/tasks.md
```

### **View Completed Tasks**

```bash
grep "\\[x\\]" chopsticks/specs/mvp/tasks.md | wc -l
```

---

## 🎨 Customize Your Workflow

### **Add Shortcuts to Your Shell**

Add to `~/.zshrc` or `~/.bashrc`:

```bash
alias standup='node ~/Chopsticks/scripts/daily-standup.js'
alias sprint='node ~/Chopsticks/scripts/sprint.js'
alias tasks='grep "\\[ \\]" ~/Chopsticks/chopsticks/specs/mvp/tasks.md'
```

Then just run:
```bash
standup
sprint status
tasks
```

### **Schedule Daily Standup**

macOS: Add to crontab
```bash
# Run at 9 AM every weekday
0 9 * * 1-5 cd ~/Chopsticks && node scripts/daily-standup.js > ~/Desktop/standup.txt && open ~/Desktop/standup.txt
```

---

## 🔗 Integration with Linear

If you have a Linear API key, the daily standup will also:
- Show Linear tickets in progress
- Sync ticket status with tasks.md
- Show assigned tickets

Set up:
```bash
export LINEAR_API_KEY=your_key
# Add to ~/.zshrc to persist
```

---

## 💡 Pro Tips

1. **Run standup every morning** - Make it part of your routine
2. **Update tasks.md as you go** - Don't batch at end of day
3. **Keep sprints short** - 1-2 weeks is ideal
4. **Review velocity** - Adjust planning based on actual speed
5. **Use sprint goals** - Keep focus on what matters

---

**Next:** Read [tasks.md](../chopsticks/specs/mvp/tasks.md) to see all available tasks.
