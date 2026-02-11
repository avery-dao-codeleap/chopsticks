# Claude Code Instructions — Chopsticks MVP

> **Last Updated:** 2026-02-11
> **Purpose:** Project-specific instructions to work efficiently on the Chopsticks MVP

---

## 📋 Project Overview

**Chopsticks** is a social dining app for Vietnam where strangers meet for meals at restaurants.

- **Tech Stack:** React Native (Expo SDK 52+), Supabase (Auth + Database), TypeScript
- **Target:** MVP with ~100 users in Ho Chi Minh City
- **Success Metric:** >70% show-up rate
- **Status:** 97% complete (145/149 tasks) — Phase 10 in progress

---

## 🗂️ Project Structure

```
Chopsticks/
├── chopsticks/              # Main Expo app (pnpm workspace)
│   ├── app/                 # Expo Router screens
│   │   ├── (auth)/          # Login + onboarding
│   │   ├── (tabs)/          # Main app tabs
│   │   └── _layout.tsx      # Root layout
│   ├── components/          # Reusable UI components
│   ├── hooks/               # React hooks
│   ├── services/            # API clients (Supabase)
│   ├── stores/              # Zustand state management
│   ├── lib/                 # Utils, types, constants
│   └── supabase/            # Database migrations, Edge Functions
├── specs/mvp/               # All design documents
│   ├── tasks.md             # 149 tasks (source of truth)
│   ├── spec.md              # Technical specification
│   ├── plan.md              # Implementation plan
│   └── data-model.md        # Database schema
└── CLAUDE.md                # This file
```

---

## 🎯 Task & Progress Tracking

### **CRITICAL: Single Source of Truth**

1. **tasks.md** → Local task list with checkboxes (149 tasks)
2. **Linear CSX-145** → Public MVP tracker that mirrors tasks.md

### ⚠️ **DO NOT CREATE NEW TRACKING ISSUES**

- ❌ **NEVER** create new issues like "Phase X complete" or "Phase Y in progress"
- ✅ **ALWAYS** update [CSX-145](https://linear.app/chopsticks/issue/CSX-145) with progress from tasks.md
- ✅ Use CSX-145 as the **only** progress tracking issue

### How to Update Progress

```bash
# 1. Read current progress
cat specs/mvp/tasks.md | grep -E "^\- \[X\]" | wc -l

# 2. Update CSX-145 with:
#    - Current phase status
#    - Tasks complete per phase
#    - Overall progress percentage
```

---

## 🏗️ Development Workflow

### ⚠️ **CRITICAL: Manual Approval Required**

**BEFORE implementing ANY changes (features, fixes, refactors, new files):**

1. **Explain what you plan to do** — Describe the changes, files affected, and approach
2. **Wait for explicit approval** — User must approve before you proceed
3. **No assumptions** — If anything is unclear, ask questions first

**This applies to:**
- ✅ Adding new features or components
- ✅ Modifying existing code
- ✅ Creating new files
- ✅ Refactoring or restructuring
- ✅ Installing dependencies
- ✅ Database changes

**Exceptions (can proceed without approval):**
- ❌ Reading files for investigation
- ❌ Searching/exploring codebase
- ❌ Answering questions about code

**Example workflow:**
```
User: "Add a share button to the request card"
Claude: "I'll add a share button to RequestCard.tsx that will:
  - Use React Native's Share API
  - Share the request details and restaurant info
  - Include haptic feedback on press
  - Add an icon to the top-right of the card

Should I proceed with this approach?"
User: "Yes, go ahead"
Claude: [proceeds with implementation]
```

---

### Phase Approach

**Current Phase:** Phase 10 (Testing & Polish) — 8/14 tasks (57% complete)

**Overall Progress:** 145/149 tasks (97%)

**Completed Phases:**
- ✅ Phase 1: Setup (7/7)
- ✅ Phase 2: Foundation (36/36)
- ✅ Phase 3: Auth + Onboarding (19/19)
- ✅ Phase 4: Create Request (13/13)
- ✅ Phase 5: Browse & Join (13/13)
- ✅ Phase 6: Approve/Reject (11/11)
- ✅ Phase 7: Chat (15/15)
- ✅ Phase 8: Post-Meal Rating (12/12)
- ✅ Phase 9: Notifications (11/11)

**Remaining Tasks (Phase 10):**
- [ ] T136: Review Vietnamese translations
- [ ] T137: Test deep linking for notifications
- [ ] T138: Optimize images and lazy loading
- [ ] T140: Manual QA on iOS device
- [ ] T141: Manual QA on Android device
- [ ] T142: Run quickstart.md validation checklist

### Task Execution Order

1. Read specs/mvp/tasks.md for the current phase
2. Implement tasks in order (respect dependencies)
3. Mark tasks complete in tasks.md with `[X]`
4. Update Linear CSX-145 after completing a phase or milestone

### **Documentation Updates**

**CRITICAL:** When making product-level changes (not just bug fixes), **always update documentation** to keep it in scope:

- ✅ **Update CLAUDE.md** if workflow, patterns, or conventions change
- ✅ **Update specs/mvp/spec.md** if features or architecture change
- ✅ **Update MEMORY.md** if you discover important patterns or gotchas
- ✅ **Update tasks.md** to reflect any skipped, added, or modified tasks

**Examples of product-level changes:**
- Removing onboarding screens (update flow diagrams)
- Changing navigation patterns (update routing docs)
- Adding new API patterns (update Key Patterns section)
- Skipping features (mark as skipped in tasks.md with reason)

**Not needed for:**
- Simple bug fixes
- Code formatting
- Minor UI tweaks

#### **Testing & Iteration Workflow**

**ALWAYS update documentation when making product decisions during testing:**

1. **During Manual Testing:**
   - Record UX issues, design changes, and feature modifications in specs/mvp/spec.md
   - Update MEMORY.md with testing insights, gotchas, and lessons learned
   - If a feature is modified/removed, update tasks.md and note the reason

2. **After Each Testing Session:**
   - Update specs to reflect any decisions made (e.g., "removed privacy screen", "changed time picker UX")
   - Document the "why" behind changes for future reference
   - Keep specs in sync with actual implementation

3. **Linear Syncing:**
   - After updating docs, **always sync with Linear CSX-145**
   - Update CSX-145 description with current phase status and any notable changes
   - Format: "Phase X: Y/Z tasks complete. Recent changes: [list key decisions]"

**Example workflow:**
```
User tests feature → finds UX issue → we fix it
→ Update spec.md with the change and rationale
→ Update MEMORY.md if it's a pattern/gotcha
→ Update Linear CSX-145 with progress
```

This ensures specs remain the **single source of truth** and don't drift from reality.

---

## 🛠️ Common Commands

### Installation & Setup
```bash
# Install dependencies (from root)
pnpm install

# Run Supabase migrations
cd chopsticks
npx supabase db push

# Seed database (optional)
npx supabase db reset
```

### Development
```bash
cd chopsticks

# Start Expo dev server
pnpm start

# iOS simulator
pnpm ios

# Android emulator
pnpm android

# Type checking
pnpm typecheck

# Linting
pnpm lint
```

### Testing
```bash
# Manual QA only for MVP (no automated tests)
# See: specs/mvp/spec.md Section 16
```

---

## 🎨 Code Style & Conventions

### File Naming
- **Screens:** PascalCase (e.g., `LoginScreen.tsx`)
- **Components:** PascalCase (e.g., `Button.tsx`)
- **Hooks:** camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Services:** camelCase (e.g., `supabase.ts`)
- **Types:** PascalCase (e.g., `User`, `MealRequest`)

### Import Order
1. React/React Native
2. Third-party libraries
3. Local components
4. Local hooks/services
5. Types
6. Styles

### TypeScript
- **Strict mode enabled** — no `any` types
- Use Zod for runtime validation (lib/schemas.ts)
- Define types in lib/types.ts or inline with component

### Styling
- **NativeWind v4** for most styling (Tailwind classes)
- **StyleSheet.create** for complex/dynamic styles
- Colors from design system (lib/constants.ts)

---

## 🔐 Authentication Flow (Important!)

### Supabase Email/Password Auth

**Current Implementation:**
1. **Supabase Auth:** Email/password authentication
2. **User Data:** All profiles, preferences, and app data in Supabase
3. **No Mock Mode:** Always connects to real Supabase database

### Key Files
- `services/supabase.ts` — Supabase client
- `services/api/auth.ts` — Auth API functions (signInWithEmail, signUpWithEmail, upsertUser)
- `stores/auth.ts` — Auth state (Zustand)
- `app/(auth)/login.tsx` — Login/signup screen

### Authentication States
- **Not logged in:** Show login screen
- **Logged in, not onboarded:** Show onboarding flow (birthdate → gender → city → persona → profile → preferences → intent)
- **Logged in, onboarded:** Show main app (browse/create/chat/profile tabs)

### Testing Auth
- **All environments** (Expo Go, dev build, production) connect to real Supabase
- Create test account: Email: `test@example.com`, Password: `password123` (min 10 chars)

---

## 📦 Dependencies

### Critical Packages
- **expo**: SDK 52+
- **expo-router**: v6+ (file-based routing)
- **@supabase/supabase-js**: v2 (auth + database)
- **zustand**: State management
- **@tanstack/react-query**: v5 (server state)
- **nativewind**: v4 (Tailwind CSS)
- **react-native-reanimated**: v4 (requires worklets 0.7+)
- **expo-haptics**: Haptic feedback
- **@react-native-community/netinfo**: Offline detection

### ⚠️ IMPORTANT: Always Check Dependencies First

**BEFORE creating any new component or utility:**
1. Check if the package is already installed: `grep "package-name" package.json`
2. If NOT installed, install it FIRST: `pnpm add package-name`
3. THEN create the component/utility that uses it
4. This avoids multiple restart cycles

**Common packages that need explicit installation:**
- `expo-haptics` - Haptic feedback
- `@react-native-community/netinfo` - Network detection
- `expo-image-picker` - Image selection
- `expo-camera` - Camera access
- Any new native modules

**After installing native packages:**
```bash
# Always restart Metro bundler with cache clear
pnpm start --clear
```

### Common Dependency Issues

**Reanimated + Worklets:**
```bash
# If pod install fails with worklets version error:
cd chopsticks
pnpm add react-native-worklets@^0.7.0
cd ios && rm -rf Pods Podfile.lock && pod install
```

**ESLint peer warnings:**
- Safe to ignore (ESLint 10 compatibility)

---

## 🚨 Development Philosophy

### From spec.md Section 2.2

1. **MVP-First:** Build only what's needed for validation
2. **No Over-Engineering:** Avoid abstractions, helpers for one-time use
3. **Manual QA Only:** No automated tests for MVP
4. **Speed Over Perfection:** Ship fast, iterate based on feedback

### What NOT to Do

❌ Create separate form components if used once (inline instead)
❌ Add error handling for impossible scenarios
❌ Build features not in tasks.md
❌ Add abstractions before they're needed
❌ Create new Linear tracking issues (use CSX-145)
❌ **NEVER infer or assume** — always ask the user if anything is unclear

### What TO Do

✅ **Get approval before implementing** — Explain your plan and wait for user approval before writing code
✅ Follow tasks.md exactly
✅ Update CSX-145 after completing phases
✅ **Always ask questions** when requirements, design decisions, or implementation details are ambiguous — never guess
✅ Test manually after each phase
✅ Keep code simple and direct

---

## 📝 Helpful Specs

### Key Documents (specs/mvp/)
- **tasks.md** — What to build (149 tasks, 145 complete)
- **spec.md** — How to build it (technical spec)
- **plan.md** — Implementation strategy
- **data-model.md** — Database schema + RLS policies
- **PERFORMANCE_AUDIT.md** — Performance analysis & optimizations
- **SECURITY_AUDIT.md** — Security review & fixes

### Quick References
- **Auth flow:** Email/password via Supabase Auth
- **Onboarding steps:** Birthdate → Gender → City → Persona → Profile → Preferences → Intent
- **Database schema:** data-model.md
- **Constants:** lib/constants.ts (cuisines, budgets, districts)

---

## 🧪 Testing (MVP at 97%)

### End-to-End Test Flow

1. **Launch app** → See login screen
2. **Sign up/Sign in** → Email + password (min 10 chars)
3. **Onboarding** (if new user):
   - Birthdate → Gender → City → Persona
   - Profile (name, bio, photo - optional)
   - Preferences (cuisines, budget)
   - Intent (knows where to eat?)
4. **Main app:**
   - Browse requests → Join → Chat
   - Create request → Approve joiners → Chat
   - Rate participants after meal
   - View/edit profile

### Test in Expo Go
```bash
cd chopsticks
pnpm start
# Press 'i' for iOS or 'a' for Android
# Sign up with email: test@example.com, password: password123
# Complete onboarding flow
```

### Test on Physical Device (USB)
```bash
# iOS
npx expo run:ios --device

# Android
npx expo run:android --device
```

### Test with EAS Build
```bash
# Development build (wireless install)
eas build --profile development --platform ios

# TestFlight (beta testing)
eas build --profile production --platform ios
eas submit --platform ios --profile production
```

---

## 🔄 Git Workflow

### Branch Strategy
- **main** — Production-ready code
- **Feature branches** — One per user story/phase

### Commit Messages
```bash
# Format: [Phase] Brief description

git commit -m "[Phase 3] Add intent screen for onboarding flow"
git commit -m "[Phase 2] Complete foundation infrastructure"
```

### When to Commit
- After completing a logical task or group of tasks
- After marking tasks as `[X]` in tasks.md
- Before major refactoring

---

## 🎓 Key Patterns

### State Management
- **Zustand:** Global state (auth, UI)
- **TanStack Query:** Server state (requests, chats, users)
- **useState:** Component-local state only

### Data Fetching
```typescript
// Custom hook pattern
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/services/supabase';

export function useRequests() {
  return useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('meal_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
  });
}
```

### Error Handling
```typescript
// User-facing errors only
try {
  await updateProfile(data);
} catch (error) {
  Alert.alert('Error', 'Failed to save profile. Please try again.');
  console.error('Profile save error:', error);
}
```

---

## 🚀 Deployment

### EAS Build (when ready)
```bash
# Development build
eas build --profile development --platform ios

# Preview (TestFlight)
eas build --profile preview --platform ios

# Production
eas build --profile production --platform ios
```

### Environment Variables
- **Required:** See .env.example
- **Supabase:** EXPO_PUBLIC_SUPABASE_URL, EXPO_PUBLIC_SUPABASE_ANON_KEY
- Set in chopsticks/.env (not committed to git)

---

## 📞 When Stuck

1. **Check specs:** specs/mvp/spec.md or plan.md
2. **Review tasks.md:** Am I following the task order?
3. **Ask user:** Don't guess on requirements
4. **Check completed files:** See how similar features were built

---

## 💡 Pro Tips

- **Always update CSX-145 after completing a phase**
- **Don't create new tracking issues** (use CSX-145)
- **Update docs during testing** (CLAUDE.md, spec.md, MEMORY.md, tasks.md)
- **Read existing code** before implementing similar features
- **Test on physical device** for final QA (USB or dev build)
- **Follow tasks.md order** (dependencies matter)
- **Keep it simple** (MVP philosophy)
- **All environments connect to Supabase** (no mock mode)

---

## 📚 Resources

- **Expo Docs:** https://docs.expo.dev
- **Supabase Docs:** https://supabase.com/docs
- **React Native Docs:** https://reactnative.dev
- **TanStack Query:** https://tanstack.com/query/latest
- **NativeWind:** https://www.nativewind.dev

---

**Questions?** Check specs/mvp/spec.md or ask the user directly.
