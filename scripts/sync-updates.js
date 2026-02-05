#!/usr/bin/env node

/**
 * Delta-sync script: pushes only NEW and CHANGED content to Linear.
 *
 * What it syncs:
 *   Docs (upsert by title — no duplicates):
 *     - marketing-plan.md          → update existing issue
 *     - product-roadmap.md         → update existing issue
 *     - competitive-research.md    → create (new file)
 *
 *   Feature tickets (create if title doesn't already exist):
 *     - P1-036  Open requests on restaurant detail
 *     - P2-019  Share Card layout
 *     - P2-020  Share Card visibility toggle
 *     - P2-021  Share Card external share
 *     - P2-022  Share → join deep link
 *     - P2-023  Social proof signal on card
 *     - MKT-019 Launch event — food crawl / pop-up
 *     - P3-012  [PARKED] Sponsored restaurant placement
 *     - P3-013  [PARKED] Sponsored meal requests
 *
 * Usage:
 *   LINEAR_API_KEY=your_key node scripts/sync-updates.js
 */

const https = require('https');
const fs    = require('fs');
const path  = require('path');

// ─── Config ──────────────────────────────────────────────────────────────────
const API_KEY      = process.env.LINEAR_API_KEY;
const TEAM_ID      = '4ae2e989-de00-451e-b8a4-9fedf814536f';
const DOC_PROJECT  = 'c8ffba55-192f-4353-a707-9410bffc3064';
const SPECS_ROOT   = path.resolve(__dirname, '../chopsticks/specs');

if (!API_KEY) {
  console.error('❌  LINEAR_API_KEY not set\n');
  console.log('    LINEAR_API_KEY=your_key node scripts/sync-updates.js');
  process.exit(1);
}

// ─── GraphQL ─────────────────────────────────────────────────────────────────
async function q(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: 'api.linear.app',
      path:     '/graphql',
      method:   'POST',
      headers:  {
        'Content-Type':   'application/json',
        'Authorization':  API_KEY,
        'Content-Length': Buffer.byteLength(body),
      },
    }, (res) => {
      let raw = '';
      res.on('data',  chunk => raw += chunk);
      res.on('end',   () => {
        const r = JSON.parse(raw);
        r.errors ? reject(new Error(r.errors[0].message)) : resolve(r.data);
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function readDoc(file) {
  let txt = fs.readFileSync(path.join(SPECS_ROOT, file), 'utf8');
  if (txt.length > 65000) txt = txt.slice(0, 65000) + '\n\n---\n*[truncated — see source]*';
  return `> **Source:** \`${file}\`\n\n` + txt;
}

async function fetchAll() {
  const [issueData, projData, labelData] = await Promise.all([
    q(`{ issues(filter:{team:{id:{eq:"${TEAM_ID}"}}}, first:250) { nodes { id identifier title } } }`),
    q(`{ projects(filter:{team:{id:{eq:"${TEAM_ID}"}}}) { nodes { id name } } }`),
    q(`{ issueLabels(filter:{team:{id:{eq:"${TEAM_ID}"}}}) { nodes { id name } } }`),
  ]);
  return {
    issues:   issueData.issues.nodes,
    projects: projData.projects.nodes,
    labels:   labelData.issueLabels.nodes,
  };
}

// ─── Main ────────────────────────────────────────────────────────────────────
async function main() {
  console.log('🔄  Fetching Linear state…');
  const { issues, projects, labels } = await fetchAll();
  console.log(`    ${issues.length} issues · ${projects.length} projects · ${labels.length} labels\n`);

  // ── lookup helpers ──
  const projectByName = (sub) => {
    const p = projects.find(p => p.name.toLowerCase().includes(sub.toLowerCase()));
    if (!p) console.warn(`    ⚠️  no project matching "${sub}"`);
    return p?.id;
  };
  const labelIds = (names) =>
    names.map(n => labels.find(l => l.name.toLowerCase() === n.toLowerCase())?.id).filter(Boolean);
  const issueByTitle = (title) => issues.find(i => i.title === title);

  // ── 1. Doc upserts ──────────────────────────────────────────────────────
  console.log('📄  Docs');

  const DOCS = [
    { title: 'Marketing Plan — Pre-launch to Growth',                          file: 'marketing-plan.md' },
    { title: 'Product Roadmap — Phase 0–3',                                    file: 'product-roadmap.md' },
    { title: 'Competitive Research — Social Dining App Failures & Risk Mapping', file: 'competitive-research.md' },
  ];

  for (const doc of DOCS) {
    const existing = issueByTitle(doc.title);
    if (existing) {
      await q(
        `mutation U($id:String!,$i:IssueUpdateInput!){ issueUpdate(id:$id,input:$i){ success } }`,
        { id: existing.id, i: { description: readDoc(doc.file) } }
      );
      console.log(`    ✅ updated  ${existing.identifier}  ${doc.title}`);
    } else {
      const r = await q(
        `mutation C($i:IssueCreateInput!){ issueCreate(input:$i){ issue{ identifier } } }`,
        { i: { teamId: TEAM_ID, projectId: DOC_PROJECT, title: doc.title, description: readDoc(doc.file), priority: 4 } }
      );
      console.log(`    ✅ created  ${r.issueCreate.issue.identifier}  ${doc.title}`);
    }
  }

  // ── 2. Feature tickets ──────────────────────────────────────────────────
  console.log('\n🎯  Feature tickets');

  const phase1  = projectByName('phase 1') || projectByName('identity') || projectByName('discovery');
  const phase2  = projectByName('phase 2') || projectByName('social');
  const phase3  = projectByName('phase 3') || projectByName('monetiz');
  const mktProj = projectByName('marketing');

  const TICKETS = [
    // ── Phase 1B ──
    {
      title:      'Show open meal requests on restaurant detail',
      projectId:  phase1,
      priority:   2,
      labels:     ['frontend'],
      description:
        '**Phase 1B — Open Requests at Restaurant**\n\n' +
        'When viewing a restaurant detail, surface any active meal requests happening there.\n\n' +
        '- Green live-dot indicator when requests exist\n- List: time, host name, spots remaining\n- Inline Join button (open) or Request button (approval)\n- Only requests where `time_window > NOW()`\n\n' +
        'Ties into the Share Card UA loop — users land on restaurant detail via shared links and can see what\'s live.',
    },
    // ── Phase 2E: Share Card ──
    {
      title:      'Share Card — layout and shareable format',
      projectId:  phase2,
      priority:   1,
      labels:     ['frontend', 'design'],
      description:
        '**Phase 2E — Itinerary Share Card (primary UA mechanic)**\n\n' +
        'Format: `@Restaurant — District — Time — $$ Budget — Join?`\n\n' +
        'Card renders:\n- Chopsticks brand chip (logo + "CHOPSTICKS")\n- Restaurant name (large)\n- District · Time · Budget range · Spots left\n- Social proof line: "Recommended by X people"\n- "Join This Meal →" CTA\n\n' +
        'This card is what gets shared externally. New users arrive with full context before installing.',
    },
    {
      title:      'Share Card — visibility toggle',
      projectId:  phase2,
      priority:   2,
      labels:     ['frontend'],
      description:
        '**Phase 2E**\n\n' +
        'Three visibility levels:\n- 🌍 **Everyone** — anyone with the link (default, maximises UA)\n- 👥 **Connections** — food friends only\n- 🔒 **Me only** — private draft\n\n' +
        'Selection persists per card. Default is Everyone.',
    },
    {
      title:      'Share Card — external share channels',
      projectId:  phase2,
      priority:   2,
      labels:     ['frontend'],
      description:
        '**Phase 2E**\n\n' +
        'Share destinations:\n1. 📋 Copy link\n2. 💬 WhatsApp (auto-formats card text + link)\n3. 📤 System share sheet\n4. 🔗 In-app share to connections\n\n' +
        'WhatsApp preview should show card text even before tap.',
    },
    {
      title:      'Share Card — deep link join flow',
      projectId:  phase2,
      priority:   1,
      labels:     ['frontend', 'backend'],
      description:
        '**Phase 2E — closing the UA loop**\n\n' +
        'Tap a shared card link:\n- App installed → opens request detail, Join button pre-focused\n- App not installed → web landing page with card preview + install CTA\n\n' +
        'This is the moment a new user\'s first action is joining a real meal. Optimise for zero friction.',
    },
    {
      title:      'Share Card — social proof signal',
      projectId:  phase2,
      priority:   3,
      labels:     ['frontend'],
      description:
        '**Phase 2E (P1 priority)**\n\n' +
        'Social proof displayed on the card:\n- "Recommended by X people" (share count for this restaurant)\n- "X saved this place" (favourites count)\n\n' +
        'Visible on both the preview the sharer sees and the card the recipient sees.',
    },
    // ── Marketing: Launch Event ──
    {
      title:      'Launch event — food crawl / pop-up planning',
      projectId:  mktProj,
      priority:   2,
      labels:     ['marketing'],
      description:
        '**Launch Phase — new addition**\n\n' +
        'Options:\n- 🚶 Food crawl across 3–5 restaurants in one district\n- 🏢 Pop-up at a single venue\n- 🍜 Restaurant takeover (partner for one night)\n\n' +
        'District targeting: pick based on expat + foodie density overlap.\n\n' +
        '**Target: 100 installs from the event.**\n\n' +
        'See marketing-plan.md → Launch Phase → Launch Event.',
    },
    // ── Phase 3D: Sponsored (parked) ──
    {
      title:      '[PARKED] Sponsored restaurant placement',
      projectId:  phase3,
      priority:   4,
      labels:     ['backend'],
      description:
        '**Phase 3D — DO NOT BUILD until Phase 2 organic loop is validated.**\n\n' +
        'Restaurants pay for boosted visibility in curated lists.\n\n' +
        '⚠️ Dinner Lab failed with exactly this pattern — monetised crowdsourced data before trust was earned. ' +
        'See competitive-research.md for the full post-mortem.\n\n' +
        'Unblock condition: Phase 2 share card shows strong organic engagement metrics.',
    },
    {
      title:      '[PARKED] Sponsored meal requests',
      projectId:  phase3,
      priority:   4,
      labels:     ['backend', 'frontend'],
      description:
        '**Phase 3D — DO NOT BUILD until Phase 2 organic loop is validated.**\n\n' +
        'A restaurant sponsors a group meal as a marketing event. Appears as a sponsored experience in browse.\n\n' +
        '⚠️ Same trust-degradation risk as sponsored placement. Park until organic loop proven.',
    },
  ];

  for (const t of TICKETS) {
    if (!t.projectId) {
      console.log(`    ⚠️  skipped  ${t.title}  (no matching project)`);
      continue;
    }
    if (issueByTitle(t.title)) {
      console.log(`    ⏭️  exists   ${t.title}`);
      continue;
    }
    const r = await q(
      `mutation C($i:IssueCreateInput!){ issueCreate(input:$i){ issue{ identifier } } }`,
      { i: { teamId: TEAM_ID, projectId: t.projectId, title: t.title, description: t.description, priority: t.priority, labelIds: labelIds(t.labels) } }
    );
    console.log(`    ✅ created  ${r.issueCreate.issue.identifier}  ${t.title}`);
  }

  console.log('\n✅  Done — https://linear.app/chopsticks');
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
