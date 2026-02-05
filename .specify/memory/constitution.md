<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 1.0.1
Modified principles:
  - III. Performance is UX: Removed map 60fps requirement (maps deferred post-MVP)
Modified sections:
  - Technology Stack: Maps row updated to "Deferred post-MVP"
  - Governance: Date corrected to 2026
Templates requiring updates: None (patch-level change)
Follow-up TODOs: None
-->

# Chopsticks Constitution

## Core Principles

### I. Mobile-First, Ship Iteratively

Every feature MUST be designed for mobile interaction patterns first. Ship the smallest valuable increment, gather user feedback, then iterate. No feature is "done" until real users have validated it.

- Screen designs MUST prioritize touch targets (44pt minimum), thumb-reachable actions, and portrait orientation
- Features MUST be deployable independently via EAS Update (OTA) when possible
- MVP scope MUST be strictly enforced; defer "nice-to-haves" to future iterations
- User feedback loops MUST be established before expanding feature scope

### II. Security & Privacy by Design (NON-NEGOTIABLE)

User safety is the core value proposition of Chopsticks. Security and privacy MUST be built into every feature from the start, not bolted on afterward.

- All database tables MUST have Row-Level Security (RLS) policies before any data access
- User data MUST be classified (public profile vs. private preferences vs. sensitive PII)
- Authentication tokens MUST be stored securely (expo-secure-store, never AsyncStorage)
- Gender filter implementation MUST be verified at the database level, not just UI
- Phone numbers and personal data MUST never be exposed in API responses or logs
- All user-generated content MUST be validated and sanitized before storage

### III. Performance is UX

A slow app is a broken app. Performance targets are functional requirements, not aspirational goals.

- Cold start MUST be under 3 seconds on mid-range Android devices
- List scrolling and animations MUST maintain 60fps on mid-range devices
- Images MUST be compressed (<1MB) and use progressive loading
- API calls MUST include loading states; no blank screens while fetching
- Offline behavior MUST degrade gracefully with clear user feedback
- Realtime subscriptions MUST be scoped minimally (per-chat, not global)

### IV. Expo-Managed Simplicity

Prefer Expo SDK solutions over bare React Native or native modules. Ejecting or adding native code requires explicit justification and approval.

- Use Expo SDK APIs (expo-location, expo-notifications, expo-image) before third-party alternatives
- Avoid native module dependencies that require custom dev clients unless absolutely necessary
- EAS Build and EAS Submit MUST be the deployment path; no manual Xcode/Android Studio builds
- Config plugins are acceptable; native code modifications are not (for MVP)
- Third-party packages MUST be verified for Expo compatibility before adoption

### V. Supabase as Single Backend

All backend logic MUST live in Supabase (Postgres + Edge Functions + Realtime + Storage). No additional backend services for MVP.

- Business logic MUST be implemented as database functions or Edge Functions
- Data validation MUST use Postgres constraints and triggers, not just client-side
- Realtime features MUST use Supabase Realtime (Postgres Changes + Broadcast)
- File storage MUST use Supabase Storage with appropriate bucket policies
- Exception: Firebase Auth for phone OTP (documented in spec.md, required for reliability)

## Technology Stack

| Layer | Technology | Rationale |
|-------|------------|-----------|
| Framework | React Native (Expo SDK 52+) | Managed workflow, OTA updates, cross-platform |
| Navigation | Expo Router | File-based routing, deep linking support |
| State | Zustand + TanStack Query | Simple global state + server state caching |
| Styling | NativeWind (Tailwind) | Consistent design system, rapid iteration |
| Backend | Supabase | Postgres, Auth integration, Realtime, Edge Functions |
| Auth | Firebase Auth (phone) + Supabase JWT | Reliable SMS OTP + unified session |
| Maps | ⏸️ Deferred post-MVP | List view with district filter for MVP |
| i18n | react-i18next | Vietnamese + English from day one |

## Development Workflow

### Feature Development Cycle

1. **Specify**: Define user stories with acceptance criteria in spec.md
2. **Plan**: Create implementation plan with file paths and dependencies
3. **Build**: Implement smallest working slice first
4. **Test**: Manual QA on physical devices (iOS + Android)
5. **Ship**: Deploy via EAS Update or EAS Submit
6. **Measure**: Collect user feedback and analytics
7. **Iterate**: Refine based on real usage data

### Code Standards

- TypeScript strict mode MUST be enabled; `any` types require justification
- Zod schemas MUST validate all external data (API responses, user input)
- Components MUST be functional with hooks; no class components
- File naming: kebab-case for files, PascalCase for components
- Commits MUST be atomic and reference task IDs when applicable

### Pre-Merge Checklist

- [ ] TypeScript compiles with no errors
- [ ] Runs on iOS simulator and Android emulator
- [ ] RLS policies verified for any new/modified tables
- [ ] No hardcoded secrets or API keys
- [ ] Loading and error states implemented
- [ ] Vietnamese and English strings added

## Governance

This constitution supersedes all other development practices for the Chopsticks project. Amendments require:

1. Written proposal with rationale
2. Impact assessment on existing code
3. Version increment following semantic versioning:
   - MAJOR: Principle removal or fundamental redefinition
   - MINOR: New principle or significant expansion
   - PATCH: Clarification or wording refinement

All implementation plans MUST include a Constitution Check verifying compliance with these principles. Violations MUST be explicitly justified in the Complexity Tracking section of the plan.

**Version**: 1.0.1 | **Ratified**: 2026-01-31 | **Last Amended**: 2026-02-02
