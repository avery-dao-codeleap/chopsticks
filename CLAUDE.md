# Claude Code Instructions — Chopsticks MVP

> **Last Updated:** 2026-02-10
> **Purpose:** Project-specific instructions to work efficiently on the Chopsticks MVP

---

## 📋 Project Overview

**Chopsticks** is a social dining app for Vietnam where strangers meet for meals at restaurants.

- **Tech Stack:** React Native (Expo SDK 52+), Firebase Auth, Supabase, TypeScript
- **Target:** MVP with ~100 users in Ho Chi Minh City
- **Success Metric:** >70% show-up rate

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
│   ├── services/            # API clients (Supabase, Firebase)
│   ├── stores/              # Zustand state management
│   ├── lib/                 # Utils, types, constants
│   └── supabase/            # Database migrations, Edge Functions
├── specs/mvp/               # All design documents
│   ├── tasks.md             # 147 tasks (source of truth)
│   ├── spec.md              # Technical specification
│   ├── plan.md              # Implementation plan
│   └── data-model.md        # Database schema
└── CLAUDE.md                # This file
```

---

## 🎯 Task & Progress Tracking

### **CRITICAL: Single Source of Truth**

1. **tasks.md** → Local task list with checkboxes (147 tasks)
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

**Current Phase:** Phase 7 (Chat) — 0/15 tasks

**Completed:**
- ✅ Phase 1: Setup (7/7)
- ✅ Phase 2: Foundation (36/36)
- ✅ Phase 3: Auth + Onboarding (19/19)
- ✅ Phase 4: Create Request (13/13)
- ✅ Phase 5: Browse & Join (13/13)

**Next:**
- 🔄 Phase 7: Chat (0/15)
- ⏸️ Phase 6: Approve/Reject (0/11)

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

---

## 🛠️ Common Commands

### Installation & Setup
```bash
# Install dependencies (from root)
pnpm install

# Setup Firebase (if needed)
# Follow: specs/mvp/spec.md Section 3

# Run Supabase migrations
npx supabase db push

# Seed database
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

### Firebase + Supabase Pattern

1. **Firebase:** Phone OTP only (no user data stored)
2. **Supabase:** All user data, profiles, preferences
3. **Token Exchange:** Firebase ID token → Supabase JWT via Edge Function

### Key Files
- `services/firebase.ts` — Firebase Auth client
- `services/supabase.ts` — Supabase client
- `services/api/auth.ts` — Auth API functions
- `stores/auth.ts` — Auth state (Zustand)
- `hooks/useAuth.ts` — Clean auth hook for components

### Mock Mode
- **Expo Go:** Firebase unavailable → auto-login as mock user
- **Dev Client:** Full Firebase Auth works

---

## 📦 Dependencies

### Critical Packages
- **expo**: SDK 52+
- **expo-router**: v6+ (file-based routing)
- **@supabase/supabase-js**: v2
- **@react-native-firebase/auth**: v23+
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
- **tasks.md** — What to build (147 tasks)
- **spec.md** — How to build it (technical spec)
- **plan.md** — Implementation strategy
- **data-model.md** — Database schema + RLS policies
- **research.md** — Technical decisions + rationale

### Quick References
- **Auth flow:** spec.md Section 3
- **Onboarding steps:** spec.md Section 4
- **Database schema:** data-model.md
- **Constants:** lib/constants.ts (cuisines, budgets, districts)

---

## 🧪 Testing Phase 3 (Current)

### End-to-End Test Flow

1. **Launch app** → See login screen
2. **Enter phone** → Send OTP via Firebase
3. **Verify OTP** → Token exchange → Supabase session
4. **Onboarding:**
   - Birthdate → Gender → Privacy → City → Persona
   - Profile (name, bio, photo with face detection)
   - Preferences (cuisines, budget)
   - Intent (knows where to eat?)
5. **Land on app** → Browse or Create based on intent

### Test in Mock Mode (Expo Go)
```bash
cd chopsticks
pnpm start
# Press 'i' for iOS or 'a' for Android
# Auto-login as Alex (mock user)
# Onboarding starts automatically
```

### Test in Dev Client (Real Firebase)
```bash
npx expo run:ios
# Use real phone number
# Receive real OTP
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
- **Firebase:** FIREBASE_PROJECT_ID (set in app.json)

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
- **Read existing code** before implementing similar features
- **Test in Expo Go first** (faster iteration)
- **Follow tasks.md order** (dependencies matter)
- **Keep it simple** (MVP philosophy)

---

## 📚 Resources

- **Expo Docs:** https://docs.expo.dev
- **Supabase Docs:** https://supabase.com/docs
- **Firebase Auth Docs:** https://firebase.google.com/docs/auth
- **React Native Docs:** https://reactnative.dev

---

**Questions?** Check specs/mvp/spec.md or ask the user directly.
