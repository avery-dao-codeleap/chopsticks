#!/usr/bin/env node

/**
 * Syncs documentation to Linear:
 * 1. Updates MVP project description
 * 2. Creates milestones on MVP project
 * 3. Creates a "Documentation" project with all .md files as issues
 *
 * Usage: LINEAR_API_KEY=your_key node scripts/sync-linear-docs.js
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.LINEAR_API_KEY;
const TEAM_ID = '4ae2e989-de00-451e-b8a4-9fedf814536f';
const MVP_PROJECT_ID = 'f1eb6f1b-7ab9-4943-9850-a49bbabc6c39';

if (!API_KEY) {
  console.error('❌ Missing LINEAR_API_KEY');
  process.exit(1);
}

async function q(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: 'api.linear.app',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
        'Content-Length': Buffer.byteLength(data),
      },
    }, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        const r = JSON.parse(body);
        r.errors ? reject(new Error(JSON.stringify(r.errors))) : resolve(r.data);
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// ─── MVP Description ────────────────────────────────────────────
const MVP_DESCRIPTION = `Validate core loop: do strangers show up to eat together? HCMC only, ~100 users. Target: >70% show-up rate. Core loop: Auth → Onboard → Browse/Create → Join → Chat → Rate. See Documentation project for full specs.`;

// ─── Milestones ──────────────────────────────────────────────────
const MILESTONES = [
  { name: 'Phase 1 — Setup', description: 'Project scaffolding, config, env' },
  { name: 'Phase 2 — Foundational', description: 'DB schema, RLS, services, i18n, base UI — BLOCKS all user stories' },
  { name: 'Phase 3 — Auth & Onboarding', description: 'Phone OTP, 9-step onboarding (US1)' },
  { name: 'Phase 4 — Create Request', description: 'Restaurant picker, create flow (US2)' },
  { name: 'Phase 5 — Browse & Join', description: 'List view, filters, join flows (US3)' },
  { name: 'Phase 6 — Approve / Reject', description: 'Creator approval screen, notifications (US4)' },
  { name: 'Phase 7 — Chat', description: 'Realtime group chat, image upload (US5)' },
  { name: 'Phase 8 — Post-Meal Rating', description: 'Show-up rating prompt & submission (US6)' },
  { name: 'Phase 9 — Settings', description: 'Profile edit, language, delete account (US7)' },
  { name: 'Phase 10 — Polish & QA', description: 'Loading/error states, NFR validation, manual QA on iOS + Android' },
];

// ─── Documentation files ─────────────────────────────────────────
const SPECS_ROOT = path.resolve(__dirname, '../chopsticks/specs');

const DOCS = [
  { file: 'mvp/PRD.md', title: 'PRD — Product Requirements Document' },
  { file: 'mvp/spec.md', title: 'Technical Specification — MVP' },
  { file: 'mvp/plan.md', title: 'Implementation Plan — MVP' },
  { file: 'mvp/tasks.md', title: 'Task List — MVP (147 tasks)' },
  { file: 'mvp/data-model.md', title: 'Data Model — Database Schema & RLS' },
  { file: 'mvp/research.md', title: 'Research — Technical Decisions' },
  { file: 'mvp/quickstart.md', title: 'Quickstart — Developer Setup Guide' },
  { file: 'mvp/product-marketing-context.md', title: 'Product & Marketing Context' },
  { file: 'mvp/contracts/supabase-client.md', title: 'API Contracts — Supabase Client' },
  { file: 'product-strategy.md', title: 'Product Strategy — Pillars & Vision' },
  { file: 'product-roadmap.md', title: 'Product Roadmap — Phase 0–3' },
  { file: 'post-mvp/foodie-personality-quiz.md', title: 'Spec — Foodie Personality Quiz' },
  { file: 'post-mvp/curated-lists.md', title: 'Spec — Curated Lists & Paywall' },
  { file: 'pitch-deck.md', title: 'Pitch Deck — Investor Slides' },
  { file: 'marketing-plan.md', title: 'Marketing Plan — Pre-launch to Growth' },
  { file: 'competitive-research.md', title: 'Competitive Research — Social Dining App Failures & Risk Mapping' },
];

async function main() {
  console.log('🚀 Syncing docs to Linear...\n');

  // ── 1. Update MVP project description
  await q(
    `mutation UpdateProject($id: String!, $input: ProjectUpdateInput!) {
       projectUpdate(id: $id, input: $input) { success }
     }`,
    { id: MVP_PROJECT_ID, input: { description: MVP_DESCRIPTION } }
  );
  console.log('✅ MVP project description updated\n');

  // ── 2. Create milestones
  console.log('📍 Creating milestones...');
  for (const ms of MILESTONES) {
    try {
      await q(
        `mutation CreateMilestone($input: ProjectMilestoneCreateInput!) {
           projectMilestoneCreate(input: $input) { success projectMilestone { id name } }
         }`,
        { input: { projectId: MVP_PROJECT_ID, name: ms.name, description: ms.description } }
      );
      console.log(`  ✅ ${ms.name}`);
    } catch (e) {
      console.log(`  ⚠️  ${ms.name} — ${e.message}`);
    }
  }

  // ── 3. Documentation project (already created)
  const docProjectId = 'c8ffba55-192f-4353-a707-9410bffc3064';
  console.log('\n📁 Using Documentation project');

  // ── 4. Create one issue per doc
  console.log('\n📄 Creating documentation issues...');
  for (const doc of DOCS) {
    const fullPath = path.join(SPECS_ROOT, doc.file);
    let content;
    try {
      content = fs.readFileSync(fullPath, 'utf8');
    } catch (e) {
      console.log(`  ⚠️  Not found: ${doc.file}`);
      continue;
    }

    // Truncate if over Linear's limit
    if (content.length > 65000) {
      content = content.slice(0, 65000) + '\n\n---\n*[truncated — see source file]*';
    }

    const description = `> **Source:** \`${doc.file}\`\n\n` + content;

    try {
      const result = await q(
        `mutation CreateIssue($input: IssueCreateInput!) {
           issueCreate(input: $input) { success issue { identifier title } }
         }`,
        {
          input: {
            teamId: TEAM_ID,
            projectId: docProjectId,
            title: doc.title,
            description,
            priority: 4, // No priority
          },
        }
      );
      console.log(`  📄 ${result.issueCreate.issue.identifier}: ${doc.title}`);
    } catch (e) {
      console.log(`  ⚠️  ${doc.title} — ${e.message}`);
    }
  }

  console.log('\n✅ Done! All docs synced to Linear.');
  console.log('   → MVP project: https://linear.app/chopsticks/project/mvp-phase-0');
  console.log('   → Documentation: https://linear.app/chopsticks/team/CSX/projects');
}

main().catch((e) => {
  console.error('❌', e.message);
  process.exit(1);
});
