#!/usr/bin/env node

/**
 * Chopsticks Linear Setup Script
 *
 * This script creates all projects, labels, and tickets in Linear.
 *
 * Usage:
 * 1. Get your Linear API key from: https://linear.app/chopsticks/settings/api
 * 2. Run: LINEAR_API_KEY=your_key node scripts/setup-linear.js
 */

const https = require('https');

const API_KEY = process.env.LINEAR_API_KEY;
const TEAM_KEY = 'CSX';

if (!API_KEY) {
  console.error('❌ Missing LINEAR_API_KEY environment variable');
  console.log('\nTo get your API key:');
  console.log('1. Go to https://linear.app/chopsticks/settings/api');
  console.log('2. Create a new personal API key');
  console.log('3. Run: LINEAR_API_KEY=your_key node scripts/setup-linear.js');
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

// Create a project
async function createProject(teamId, name, description) {
  const data = await linearQuery(`
    mutation CreateProject($input: ProjectCreateInput!) {
      projectCreate(input: $input) {
        success
        project {
          id
          name
        }
      }
    }
  `, {
    input: {
      teamIds: [teamId],
      name,
      description
    }
  });

  console.log(`✅ Created project: ${name}`);
  return data.projectCreate.project;
}

// Create a label
async function createLabel(teamId, name, color) {
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
      input: {
        teamId,
        name,
        color
      }
    });

    console.log(`✅ Created label: ${name}`);
    return data.issueLabelCreate.issueLabel;
  } catch (e) {
    if (e.message.includes('already exists') || e.message.includes('duplicate')) {
      console.log(`⏭️  Label already exists: ${name}`);
      return null;
    }
    throw e;
  }
}

// Create an issue
async function createIssue(teamId, projectId, title, description, priority, labelIds = []) {
  const data = await linearQuery(`
    mutation CreateIssue($input: IssueCreateInput!) {
      issueCreate(input: $input) {
        success
        issue {
          id
          identifier
          title
        }
      }
    }
  `, {
    input: {
      teamId,
      projectId,
      title,
      description,
      priority,
      labelIds
    }
  });

  const issue = data.issueCreate.issue;
  console.log(`  📝 ${issue.identifier}: ${title}`);
  return issue;
}

// Get existing labels
async function getLabels(teamId) {
  const data = await linearQuery(`
    query GetLabels($teamId: ID!) {
      issueLabels(filter: { team: { id: { eq: $teamId } } }) {
        nodes {
          id
          name
        }
      }
    }
  `, { teamId });

  return data.issueLabels.nodes;
}

// Main setup
async function main() {
  console.log('🚀 Setting up Chopsticks Linear workspace...\n');

  // Get team
  const teamId = await getTeamId();
  console.log(`Found team: CHO (${teamId})\n`);

  // Create labels
  console.log('📋 Creating labels...');
  const labelColors = {
    'feature': '#5E6AD2',
    'bug': '#EB5757',
    'design': '#F2994A',
    'backend': '#6FCF97',
    'frontend': '#56CCF2',
    'content': '#BB6BD9',
    'marketing': '#F2C94C',
    'research': '#9B51E0',
    'urgent': '#EB5757',
    'high': '#F2994A',
    'medium': '#F2C94C',
    'low': '#6FCF97'
  };

  for (const [name, color] of Object.entries(labelColors)) {
    await createLabel(teamId, name, color);
  }

  // Get all labels for reference
  const labels = await getLabels(teamId);
  const labelMap = {};
  labels.forEach(l => labelMap[l.name] = l.id);

  console.log('\n📁 Creating projects...');

  // Create projects
  const projects = {
    mvp: await createProject(teamId, 'MVP (Phase 0)', 'Validate core loop: do strangers show up to eat together?'),
    phase1: await createProject(teamId, 'Phase 1: Identity & Discovery', 'Quiz, curated lists, reviews, favorites'),
    phase2: await createProject(teamId, 'Phase 2: Social Graph', 'Connections, sharing, invite to eat'),
    phase3: await createProject(teamId, 'Phase 3: Monetization', 'Paywalls, premium features'),
    marketing: await createProject(teamId, 'Marketing & Growth', 'Pre-launch, launch, and growth initiatives')
  };

  // Helper to get label IDs
  const getLabelIds = (labelNames) => labelNames.map(n => labelMap[n]).filter(Boolean);

  console.log('\n📝 Creating MVP tickets...');

  // MVP Tickets - Authentication & Onboarding
  const mvpTickets = [
    // Auth & Onboarding
    { title: 'Phone auth with Firebase', desc: 'Implement Firebase phone OTP verification', priority: 2, labels: ['backend', 'high'] },
    { title: 'Firebase → Supabase JWT bridge', desc: 'Exchange Firebase token for Supabase JWT', priority: 2, labels: ['backend', 'high'] },
    { title: 'Photo upload with face detection', desc: 'Implement expo-face-detector for profile photos', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Onboarding flow UI', desc: '9-step onboarding: phone → photo → profile → persona → cuisines → budget → bio → intent', priority: 2, labels: ['frontend', 'design', 'high'] },
    { title: 'City check (HCMC only)', desc: 'Block users not in HCMC with appropriate messaging', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Persona selection screen', desc: '5 persona options: Local, New to city, Expat, Traveler, Student', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Cuisine preferences screen', desc: '14 cuisine categories, multi-select', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Budget preferences screen', desc: '4 budget ranges, multi-select', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Bio input with prompt', desc: 'Food-related prompt, 200 char max', priority: 3, labels: ['frontend', 'medium'] },
    { title: '"Do you know where to eat?" routing', desc: 'Final question that routes to create vs browse', priority: 3, labels: ['frontend', 'medium'] },

    // User Profiles
    { title: 'User profile data model', desc: 'Create users + user_preferences tables with RLS', priority: 2, labels: ['backend', 'high'] },
    { title: 'Profile view screen', desc: 'Display photo, name, age, persona, meal count, cuisines, bio', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Edit profile flow', desc: 'Allow editing all fields except phone and age', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Other user profile view', desc: 'Read-only view of other users\' profiles', priority: 3, labels: ['frontend', 'medium'] },

    // Restaurants
    { title: 'Restaurant data model', desc: 'Create restaurants table with RLS', priority: 2, labels: ['backend', 'high'] },
    { title: 'Seed curated restaurants', desc: 'Add 50-100 HCMC restaurants to database', priority: 2, labels: ['content', 'high'] },
    { title: 'Restaurant picker component', desc: 'Searchable list of curated restaurants', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Manual restaurant entry', desc: 'Form for name + address + district', priority: 3, labels: ['frontend', 'medium'] },

    // Meal Requests
    { title: 'Meal request data model', desc: 'Create meal_requests + request_participants tables', priority: 2, labels: ['backend', 'high'] },
    { title: 'Create request flow', desc: 'Restaurant + cuisine + budget + time + size + join type', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Browse requests list view', desc: 'List with request cards showing creator, cuisine, district, time, spots', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Filter bar component', desc: 'District, cuisine, budget filters', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Request detail screen', desc: 'Full request info with join button', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Open join flow', desc: 'Instant join → add to chat → reveal location', priority: 2, labels: ['frontend', 'backend', 'high'] },
    { title: 'Approval join flow', desc: 'Request to join → creator approves → add to chat', priority: 2, labels: ['frontend', 'backend', 'high'] },
    { title: 'Creator approval screen', desc: 'View pending requests, filter by gender/age/persona, approve/reject', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Request expiration logic', desc: 'Filter out expired requests (WHERE time_window > NOW())', priority: 3, labels: ['backend', 'medium'] },
    { title: 'Request cancellation', desc: 'Creator cancels → notify everyone → chat readable 24h', priority: 3, labels: ['frontend', 'backend', 'medium'] },

    // Chat
    { title: 'Chat data model', desc: 'Create chats, chat_participants, messages tables', priority: 2, labels: ['backend', 'high'] },
    { title: 'Supabase Realtime setup', desc: 'Configure realtime subscriptions for messages', priority: 2, labels: ['backend', 'high'] },
    { title: 'Chat screen UI', desc: 'Message list, input, timestamps, read receipts', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Image sharing in chat', desc: 'Upload and display images in chat', priority: 3, labels: ['frontend', 'backend', 'medium'] },
    { title: 'Creator remove user', desc: 'Allow creator to remove participants from chat', priority: 3, labels: ['frontend', 'backend', 'medium'] },
    { title: 'Chat member list', desc: 'View all participants in the chat', priority: 4, labels: ['frontend', 'low'] },

    // Post-Meal Rating
    { title: 'Rating data model', desc: 'Create person_ratings table', priority: 3, labels: ['backend', 'medium'] },
    { title: 'Rating prompt trigger', desc: 'Prompt on next app open after meal time', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Rating UI', desc: '"Did [name] show up?" Yes/No for each participant', priority: 3, labels: ['frontend', 'medium'] },

    // Notifications
    { title: 'Expo Push setup', desc: 'Configure Expo Push Notifications', priority: 2, labels: ['backend', 'high'] },
    { title: 'Push token storage', desc: 'Store device push tokens in Supabase', priority: 2, labels: ['backend', 'high'] },
    { title: 'Join request notification', desc: '"Someone wants to join your request"', priority: 2, labels: ['backend', 'high'] },
    { title: 'Approval notification', desc: '"You\'ve been approved"', priority: 2, labels: ['backend', 'high'] },
    { title: 'New message notification', desc: 'Push for new chat messages', priority: 2, labels: ['backend', 'high'] },
    { title: 'Notification list screen', desc: 'View all notifications in-app', priority: 3, labels: ['frontend', 'medium'] },

    // Safety & Settings
    { title: 'Report button', desc: 'Report user → sends email to admin', priority: 3, labels: ['frontend', 'backend', 'medium'] },
    { title: 'Reports data model', desc: 'Create reports table', priority: 3, labels: ['backend', 'medium'] },
    { title: 'Settings screen', desc: 'Edit profile, language toggle, delete account, report', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Language toggle (i18n)', desc: 'Vietnamese + English with react-i18next', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Delete account flow', desc: 'Soft delete user data', priority: 3, labels: ['frontend', 'backend', 'medium'] },

    // Infrastructure
    { title: 'Supabase project setup', desc: 'Create project, configure auth, storage', priority: 2, labels: ['backend', 'high'] },
    { title: 'Database migrations', desc: 'All table schemas with RLS policies', priority: 2, labels: ['backend', 'high'] },
    { title: 'Expo project setup', desc: 'SDK 52+, Expo Router, NativeWind', priority: 2, labels: ['frontend', 'high'] },
    { title: 'State management setup', desc: 'Zustand + TanStack Query', priority: 2, labels: ['frontend', 'high'] },
    { title: 'App Store submission', desc: 'iOS App Store listing and review', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Play Store submission', desc: 'Google Play Store listing and review', priority: 2, labels: ['frontend', 'high'] },
  ];

  for (const ticket of mvpTickets) {
    await createIssue(
      teamId,
      projects.mvp.id,
      ticket.title,
      ticket.desc,
      ticket.priority,
      getLabelIds(ticket.labels)
    );
  }

  console.log('\n📝 Creating Phase 1 tickets...');

  // Phase 1 Tickets
  const phase1Tickets = [
    // Quiz
    { title: 'Quiz data model', desc: 'quiz_questions + user_quiz_answers tables', priority: 2, labels: ['backend', 'high'] },
    { title: 'Seed quiz questions', desc: 'Add 29 questions to database', priority: 2, labels: ['content', 'high'] },
    { title: 'Quiz intro screen', desc: '"Let\'s learn your food personality" with Start/Skip', priority: 2, labels: ['frontend', 'design', 'high'] },
    { title: 'This-or-that question component', desc: 'Binary choice UI', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Spectrum question component', desc: '3-5 point scale UI', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Multiple choice component', desc: 'Pick one from 3-4 options', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Multi-select component', desc: 'Pick all that apply', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Quiz flow in onboarding', desc: '5 random questions, optional, skippable', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Quiz section on profile', desc: 'Display 5 answers with "see all"', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Answer more questions screen', desc: 'Answer remaining questions from profile', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Quiz answers on other profiles', desc: 'View other users\' quiz answers', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Translate quiz questions', desc: 'Vietnamese translations for all 29', priority: 3, labels: ['content', 'medium'] },

    // Curated Lists
    { title: 'Lists data model', desc: 'lists + list_restaurants tables', priority: 2, labels: ['backend', 'high'] },
    { title: 'Create initial lists', desc: '15-20 curated lists for HCMC', priority: 2, labels: ['content', 'high'] },
    { title: 'Discovery tab (bottom nav)', desc: 'New tab with list browsing', priority: 2, labels: ['frontend', 'design', 'high'] },
    { title: 'Discovery home screen', desc: 'Search, your lists, popular lists, categories', priority: 2, labels: ['frontend', 'high'] },
    { title: 'List detail screen', desc: 'Cover, description, ranked restaurants', priority: 2, labels: ['frontend', 'high'] },
    { title: 'List progress indicator', desc: '"3/12 visited" progress bar', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Category browsing', desc: 'Browse lists by cuisine category', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'District browsing', desc: 'Browse lists by district', priority: 3, labels: ['frontend', 'medium'] },

    // User Actions
    { title: 'Favorites data model', desc: 'user_favorites table', priority: 2, labels: ['backend', 'high'] },
    { title: 'Save to favorites', desc: 'Add/remove restaurant from favorites', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Favorites list screen', desc: 'View all saved restaurants', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Visits data model', desc: 'user_visits table', priority: 2, labels: ['backend', 'high'] },
    { title: 'Mark "Been There"', desc: 'Record restaurant visit', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Been There list screen', desc: 'View all visited restaurants', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Enhanced restaurant detail', desc: 'Lists it appears on, actions, visit count', priority: 2, labels: ['frontend', 'high'] },

    // Reviews
    { title: 'Reviews data model', desc: 'reviews table with photos', priority: 2, labels: ['backend', 'high'] },
    { title: 'Write review flow', desc: 'Rating + text + optional photos', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Reviews on restaurant detail', desc: 'Display reviews with ratings', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Restaurant stats aggregation', desc: 'Avg rating, review count, visit count', priority: 3, labels: ['backend', 'medium'] },
    { title: 'Review moderation', desc: 'Flag/remove inappropriate reviews', priority: 3, labels: ['backend', 'medium'] },

    // Nominations
    { title: 'Nominations data model', desc: 'nominations table', priority: 3, labels: ['backend', 'medium'] },
    { title: 'Nominate for list flow', desc: 'Select list or suggest new', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Nomination admin queue', desc: 'Internal tool to review nominations', priority: 4, labels: ['backend', 'low'] },
  ];

  for (const ticket of phase1Tickets) {
    await createIssue(
      teamId,
      projects.phase1.id,
      ticket.title,
      ticket.desc,
      ticket.priority,
      getLabelIds(ticket.labels)
    );
  }

  console.log('\n📝 Creating Phase 2 tickets...');

  // Phase 2 Tickets
  const phase2Tickets = [
    // Connections
    { title: 'Connections data model', desc: 'user_connections table', priority: 2, labels: ['backend', 'high'] },
    { title: 'Add connection flow', desc: 'Send/accept connection request', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Post-meal connection prompt', desc: '"Add [name] as a connection?"', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Connections list screen', desc: 'View all connections', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Connection count on profile', desc: 'Display connection count', priority: 3, labels: ['frontend', 'medium'] },

    // Sharing
    { title: 'Share data model', desc: 'shares table', priority: 2, labels: ['backend', 'high'] },
    { title: 'Share restaurant to connections', desc: 'Select connections, add message', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Share list to connections', desc: 'Select connections, add message', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Shares inbox', desc: 'View received shares', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Share notification', desc: 'Push when someone shares with you', priority: 2, labels: ['backend', 'high'] },
    { title: 'External share', desc: 'Copy link, WhatsApp, Messenger', priority: 3, labels: ['frontend', 'medium'] },

    // Invite to Eat
    { title: 'Private meal request type', desc: 'Meal requests visible only to invitees', priority: 2, labels: ['backend', 'high'] },
    { title: 'Invite from restaurant', desc: '"Invite friends to eat here" flow', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Select time picker', desc: 'Date/time selection for invite', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Select connections', desc: 'Pick which connections to invite', priority: 2, labels: ['frontend', 'high'] },
    { title: '"Open to strangers" toggle', desc: 'Make private invite also public', priority: 3, labels: ['frontend', 'medium'] },
    { title: 'Invite notification', desc: 'Push for meal invites', priority: 2, labels: ['backend', 'high'] },
    { title: 'Accept/decline invite', desc: 'Invitee responds to invite', priority: 2, labels: ['frontend', 'high'] },
  ];

  for (const ticket of phase2Tickets) {
    await createIssue(
      teamId,
      projects.phase2.id,
      ticket.title,
      ticket.desc,
      ticket.priority,
      getLabelIds(ticket.labels)
    );
  }

  console.log('\n📝 Creating Phase 3 tickets...');

  // Phase 3 Tickets
  const phase3Tickets = [
    // Premium Infrastructure
    { title: 'Premium status data model', desc: 'is_premium flag, subscription dates', priority: 2, labels: ['backend', 'high'] },
    { title: 'In-app purchase setup (iOS)', desc: 'StoreKit integration', priority: 2, labels: ['frontend', 'high'] },
    { title: 'In-app purchase setup (Android)', desc: 'Google Play Billing', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Subscription management', desc: 'View/cancel subscription', priority: 3, labels: ['frontend', 'medium'] },

    // Paywall - Lists
    { title: 'List paywall logic', desc: 'Show top 3 free, lock rest', priority: 2, labels: ['frontend', 'high'] },
    { title: 'Unlock prompt UI', desc: '"See all X spots" upgrade modal', priority: 2, labels: ['frontend', 'design', 'high'] },
    { title: 'Premium list access', desc: 'Full list for premium users', priority: 2, labels: ['frontend', 'high'] },

    // Paywall - Cities
    { title: 'City selector component', desc: 'Show available cities with lock icons', priority: 2, labels: ['frontend', 'high'] },
    { title: 'City unlock logic', desc: 'Premium users can browse other cities', priority: 2, labels: ['backend', 'high'] },
    { title: 'Hanoi content', desc: 'Create lists and restaurants for Hanoi', priority: 2, labels: ['content', 'high'] },
    { title: 'Per-city unlock option', desc: 'Unlock single city vs all cities', priority: 3, labels: ['frontend', 'medium'] },
  ];

  for (const ticket of phase3Tickets) {
    await createIssue(
      teamId,
      projects.phase3.id,
      ticket.title,
      ticket.desc,
      ticket.priority,
      getLabelIds(ticket.labels)
    );
  }

  console.log('\n📝 Creating Marketing tickets...');

  // Marketing Tickets
  const marketingTickets = [
    // Pre-Launch
    { title: 'Landing page', desc: 'chopsticks.app with waitlist signup', priority: 2, labels: ['marketing', 'design', 'high'] },
    { title: 'Instagram account setup', desc: '@chopsticks.vn with content strategy', priority: 2, labels: ['marketing', 'high'] },
    { title: 'TikTok account setup', desc: '@chopsticks.vn for food content', priority: 3, labels: ['marketing', 'medium'] },
    { title: 'Food influencer outreach list', desc: 'Identify 20 HCMC food influencers', priority: 2, labels: ['marketing', 'research', 'high'] },
    { title: 'Influencer outreach campaign', desc: 'Personal outreach for beta access', priority: 2, labels: ['marketing', 'high'] },
    { title: 'Press kit', desc: 'App screenshots, founder story, key stats', priority: 3, labels: ['marketing', 'medium'] },

    // Launch
    { title: 'Launch announcement', desc: 'Social posts, email to waitlist', priority: 2, labels: ['marketing', 'high'] },
    { title: 'Influencer launch posts', desc: 'Coordinated posts from influencer partners', priority: 2, labels: ['marketing', 'high'] },
    { title: 'Facebook group seeding', desc: 'Post in HCMC expat/food groups', priority: 3, labels: ['marketing', 'medium'] },
    { title: 'University outreach', desc: 'Target student groups in HCMC', priority: 3, labels: ['marketing', 'medium'] },
    { title: 'Hostel/coworking partnerships', desc: 'Flyers and QR codes in high-traffic spots', priority: 3, labels: ['marketing', 'medium'] },

    // Content & Community
    { title: 'Weekly "best of" content', desc: 'Instagram/TikTok food features', priority: 3, labels: ['marketing', 'content', 'medium'] },
    { title: 'User story features', desc: 'Highlight successful meal meetups', priority: 3, labels: ['marketing', 'medium'] },
    { title: 'Restaurant feature series', desc: 'Behind-the-scenes at curated spots', priority: 3, labels: ['marketing', 'content', 'medium'] },
    { title: 'Seasonal list content', desc: 'Tết food, rainy season comfort food, etc.', priority: 3, labels: ['marketing', 'content', 'medium'] },

    // Paid (Future)
    { title: 'Facebook/Instagram ads setup', desc: 'Pixel, audiences, campaign structure', priority: 4, labels: ['marketing', 'low'] },
    { title: 'Creative testing', desc: '5-10 ad variations', priority: 4, labels: ['marketing', 'design', 'low'] },
    { title: 'Retargeting campaigns', desc: 'Website visitors, app installers', priority: 4, labels: ['marketing', 'low'] },
  ];

  for (const ticket of marketingTickets) {
    await createIssue(
      teamId,
      projects.marketing.id,
      ticket.title,
      ticket.desc,
      ticket.priority,
      getLabelIds(ticket.labels)
    );
  }

  console.log('\n✅ Done! Created:');
  console.log(`   - 5 projects`);
  console.log(`   - 12 labels`);
  console.log(`   - ${mvpTickets.length} MVP tickets`);
  console.log(`   - ${phase1Tickets.length} Phase 1 tickets`);
  console.log(`   - ${phase2Tickets.length} Phase 2 tickets`);
  console.log(`   - ${phase3Tickets.length} Phase 3 tickets`);
  console.log(`   - ${marketingTickets.length} Marketing tickets`);
  console.log(`\n🎉 Total: ${mvpTickets.length + phase1Tickets.length + phase2Tickets.length + phase3Tickets.length + marketingTickets.length} tickets`);
  console.log(`\nView your board: https://linear.app/chopsticks/team/CHO/active`);
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
