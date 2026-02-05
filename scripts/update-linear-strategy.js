#!/usr/bin/env node

/**
 * Add 'strategy' label and tag human-input tasks in Linear
 *
 * Tasks requiring human input include:
 * - Content decisions (restaurant curation, quiz questions, list topics)
 * - Marketing strategy (influencer selection, pricing, channels)
 * - Design decisions (UX flows, visual design)
 * - Research tasks (user interviews, competitive analysis)
 * - Product strategy (feature prioritization, pricing)
 *
 * Usage:
 * LINEAR_API_KEY=your_key node scripts/update-linear-strategy.js
 */

const https = require('https');

const API_KEY = process.env.LINEAR_API_KEY;
const TEAM_KEY = 'CSX';

if (!API_KEY) {
  console.error('❌ Missing LINEAR_API_KEY environment variable');
  console.log('\nUsage: LINEAR_API_KEY=your_key node scripts/update-linear-strategy.js');
  process.exit(1);
}

// GraphQL helper
async function linearQuery(query, variables = {}) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });

    const options = {
      hostname: 'api.linear.app',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
        'Content-Length': Buffer.byteLength(data)
      }
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          if (result.errors) {
            reject(new Error(result.errors[0].message));
          } else {
            resolve(result.data);
          }
        } catch (e) {
          reject(e);
        }
      });
    });

    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// Get team ID
async function getTeamId() {
  const data = await linearQuery(`
    query {
      teams {
        nodes {
          id
          key
          name
        }
      }
    }
  `);

  const team = data.teams.nodes.find(t => t.key === TEAM_KEY);
  if (!team) {
    throw new Error(`Team with key ${TEAM_KEY} not found`);
  }
  return team.id;
}

// Create or get label
async function ensureLabel(teamId, name, color) {
  // Try to create
  try {
    const data = await linearQuery(`
      mutation CreateLabel($input: IssueLabelCreateInput!) {
        issueLabelCreate(input: $input) {
          success
          issueLabel {
            id
            name
          }
        }
      }
    `, {
      input: { teamId, name, color }
    });
    console.log(`✅ Created label: ${name}`);
    return data.issueLabelCreate.issueLabel;
  } catch (e) {
    if (e.message.includes('already exists') || e.message.includes('duplicate')) {
      // Get existing
      const labels = await linearQuery(`
        query GetLabels($teamId: ID!) {
          issueLabels(filter: { team: { id: { eq: $teamId } } }) {
            nodes { id name }
          }
        }
      `, { teamId });
      const existing = labels.issueLabels.nodes.find(l => l.name === name);
      console.log(`⏭️  Label already exists: ${name}`);
      return existing;
    }
    throw e;
  }
}

// Get all issues
async function getIssues(teamId) {
  const data = await linearQuery(`
    query GetIssues($teamId: ID!) {
      issues(filter: { team: { id: { eq: $teamId } } }, first: 250) {
        nodes {
          id
          identifier
          title
          labels {
            nodes { id name }
          }
        }
      }
    }
  `, { teamId });
  return data.issues.nodes;
}

// Add label to issue
async function addLabelToIssue(issueId, labelIds) {
  await linearQuery(`
    mutation UpdateIssue($id: String!, $labelIds: [String!]!) {
      issueUpdate(id: $id, input: { labelIds: $labelIds }) {
        success
      }
    }
  `, { id: issueId, labelIds });
}

// Human-input task patterns
const HUMAN_INPUT_PATTERNS = [
  // Content tasks
  /seed.*restaurant/i,
  /curated.*restaurant/i,
  /seed.*quiz/i,
  /create.*list/i,
  /initial.*list/i,
  /hanoi.*content/i,
  /translate/i,

  // Marketing tasks
  /influencer/i,
  /outreach/i,
  /landing.*page/i,
  /instagram.*setup/i,
  /tiktok.*setup/i,
  /press.*kit/i,
  /launch.*announcement/i,
  /content.*strategy/i,
  /facebook.*group/i,
  /university.*outreach/i,
  /hostel.*partnership/i,
  /coworking.*partnership/i,
  /user.*story.*feature/i,
  /restaurant.*feature.*series/i,
  /seasonal.*content/i,
  /creative.*testing/i,

  // Research
  /research/i,
  /competitive/i,
  /user.*interview/i,

  // Strategy decisions
  /pricing/i,
  /paywall/i,
  /premium/i,
  /subscription/i,

  // App store
  /app.*store.*submission/i,
  /play.*store.*submission/i,
];

function needsHumanInput(title) {
  return HUMAN_INPUT_PATTERNS.some(pattern => pattern.test(title));
}

async function main() {
  console.log('🚀 Updating Linear with strategy labels...\n');

  const teamId = await getTeamId();
  console.log(`Found team: CSX (${teamId})\n`);

  // Create strategy label
  const strategyLabel = await ensureLabel(teamId, 'strategy', '#E879F9'); // Purple/pink

  if (!strategyLabel) {
    console.error('❌ Could not get strategy label');
    process.exit(1);
  }

  // Get all issues
  console.log('\n📋 Fetching issues...');
  const issues = await getIssues(teamId);
  console.log(`Found ${issues.length} issues`);

  // Tag issues that need human input
  console.log('\n🏷️  Tagging human-input tasks...\n');

  let tagged = 0;
  for (const issue of issues) {
    if (needsHumanInput(issue.title)) {
      // Check if already has strategy label
      const hasLabel = issue.labels.nodes.some(l => l.name === 'strategy');
      if (!hasLabel) {
        const currentLabelIds = issue.labels.nodes.map(l => l.id);
        await addLabelToIssue(issue.id, [...currentLabelIds, strategyLabel.id]);
        console.log(`  ✅ ${issue.identifier}: ${issue.title}`);
        tagged++;
      } else {
        console.log(`  ⏭️  ${issue.identifier}: ${issue.title} (already tagged)`);
      }
    }
  }

  console.log(`\n✅ Done! Tagged ${tagged} issues with 'strategy' label`);
  console.log('\nThese tasks require human input/decisions:');
  console.log('- Content curation (restaurants, lists, quiz questions)');
  console.log('- Marketing decisions (influencers, channels, timing)');
  console.log('- Research tasks');
  console.log('- Pricing/monetization strategy');
  console.log('- App store submissions');
  console.log(`\nView: https://linear.app/chopsticks/team/CSX/active?label=strategy`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
