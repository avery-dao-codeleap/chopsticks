#!/usr/bin/env node

/**
 * Daily Standup Automation
 *
 * Generates a daily standup report:
 * 1. ✅ What was done yesterday (from git commits)
 * 2. 🎯 What's in progress (from tasks.md)
 * 3. 💡 Suggested next tickets (based on dependencies)
 * 4. 📊 Sprint progress (if active sprint)
 *
 * Usage:
 * - Run daily: node scripts/daily-standup.js
 * - With Linear sync: LINEAR_API_KEY=key node scripts/daily-standup.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const https = require('https');

const API_KEY = process.env.LINEAR_API_KEY;
const TASKS_FILE = path.join(__dirname, '../chopsticks/specs/mvp/tasks.md');
const SPRINT_FILE = path.join(__dirname, '../.sprint.json');

// ─── Git Activity ────────────────────────────────────────────────
function getYesterdayCommits() {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 1);
    since.setHours(0, 0, 0, 0);

    const commits = execSync(
      `git log --since="${since.toISOString()}" --pretty=format:"%h - %s" --no-merges`,
      { encoding: 'utf8', cwd: path.join(__dirname, '..') }
    ).split('\n').filter(Boolean);

    return commits;
  } catch (e) {
    return [];
  }
}

// ─── Tasks.md Parser ─────────────────────────────────────────────
function parseTasksFile() {
  const content = fs.readFileSync(TASKS_FILE, 'utf8');
  const lines = content.split('\n');

  const tasks = [];
  let currentPhase = null;

  for (const line of lines) {
    // Detect phase headers
    if (line.match(/^## Phase \d+:/)) {
      currentPhase = line.replace(/^## /, '').split(':')[0];
    }

    // Parse task lines
    const match = line.match(/^- \[([ xX])\] (T\d+) (.+)/);
    if (match) {
      const [, status, id, title] = match;
      tasks.push({
        id,
        title,
        done: status.toLowerCase() === 'x',
        phase: currentPhase,
        line
      });
    }
  }

  return tasks;
}

// ─── Sprint Management ───────────────────────────────────────────
function loadSprint() {
  try {
    return JSON.parse(fs.readFileSync(SPRINT_FILE, 'utf8'));
  } catch {
    return null;
  }
}

function saveSprint(sprint) {
  fs.writeFileSync(SPRINT_FILE, JSON.stringify(sprint, null, 2));
}

// ─── Linear Integration ──────────────────────────────────────────
async function linearQuery(query, variables = {}) {
  if (!API_KEY) return null;

  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query, variables });
    const req = https.request({
      hostname: 'api.linear.app',
      path: '/graphql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': API_KEY,
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(body);
          resolve(result.errors ? null : result.data);
        } catch {
          resolve(null);
        }
      });
    });
    req.on('error', () => resolve(null));
    req.write(data);
    req.end();
  });
}

async function getLinearProgress() {
  if (!API_KEY) return null;

  const data = await linearQuery(`
    query {
      issues(filter: { state: { type: { in: ["started", "unstarted"] } } }) {
        nodes {
          identifier
          title
          state {
            name
            type
          }
          assignee {
            name
          }
        }
      }
    }
  `);

  return data?.issues?.nodes || [];
}

// ─── Suggestion Engine ───────────────────────────────────────────
function suggestNextTasks(tasks, sprint) {
  const completed = tasks.filter(t => t.done);
  const inProgress = tasks.filter(t => !t.done && t.phase && t.phase.includes('Phase 2')); // Foundational
  const notStarted = tasks.filter(t => !t.done);

  // Priority: Foundational tasks first
  const foundational = notStarted.filter(t => t.phase && t.phase.includes('Phase 2'));
  if (foundational.length > 0) {
    return foundational.slice(0, 3);
  }

  // Then user story tasks
  const userStories = notStarted.filter(t => t.phase && t.phase.match(/Phase [3-9]/));
  return userStories.slice(0, 3);
}

// ─── Report Generation ───────────────────────────────────────────
async function generateReport() {
  console.log('🌅 Daily Standup Report');
  console.log('═'.repeat(60));
  console.log(`📅 ${new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })}\n`);

  // ── Sprint Context ──
  const sprint = loadSprint();
  if (sprint) {
    const startDate = new Date(sprint.startDate);
    const endDate = new Date(sprint.endDate);
    const today = new Date();
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

    console.log(`🏃 Sprint: ${sprint.name}`);
    console.log(`   Goal: ${sprint.goal}`);
    console.log(`   Days remaining: ${daysLeft} days`);
    console.log(`   Tasks: ${sprint.completedTasks}/${sprint.totalTasks} completed\n`);
  }

  // ── Yesterday's Work ──
  const commits = getYesterdayCommits();
  console.log('✅ What was done yesterday:');
  if (commits.length > 0) {
    commits.forEach(c => console.log(`   ${c}`));
  } else {
    console.log('   No commits yesterday');
  }
  console.log();

  // ── Current Tasks ──
  const tasks = parseTasksFile();
  const completed = tasks.filter(t => t.done);
  const inProgress = tasks.filter(t => !t.done && t.phase && t.phase.includes('Phase 2'));

  console.log(`📊 Progress: ${completed.length}/${tasks.length} tasks completed`);
  console.log();

  console.log('🎯 Currently in progress:');
  if (inProgress.length > 0) {
    inProgress.slice(0, 5).forEach(t => {
      console.log(`   [ ] ${t.id} - ${t.title}`);
    });
  } else {
    console.log('   Nothing marked as in-progress');
  }
  console.log();

  // ── Linear Sync ──
  if (API_KEY) {
    const linearIssues = await getLinearProgress();
    if (linearIssues && linearIssues.length > 0) {
      console.log('📍 Linear tickets in progress:');
      linearIssues.slice(0, 5).forEach(issue => {
        console.log(`   ${issue.identifier}: ${issue.title} (${issue.state.name})`);
      });
      console.log();
    }
  }

  // ── Suggestions ──
  const suggestions = suggestNextTasks(tasks, sprint);
  console.log('💡 Suggested next tasks:');
  suggestions.forEach((task, i) => {
    console.log(`   ${i + 1}. ${task.id} - ${task.title}`);
    console.log(`      Phase: ${task.phase}`);
  });
  console.log();

  console.log('═'.repeat(60));
  console.log('💬 Ready to work? Pick a task from suggestions above.\n');
  console.log('Commands:');
  console.log('  • Start sprint: node scripts/sprint.js start');
  console.log('  • View tasks:   cat chopsticks/specs/mvp/tasks.md | grep "\\[ \\]"');
  console.log('  • Update task:  # Edit tasks.md and mark [x] when done\n');
}

// ─── Main ────────────────────────────────────────────────────────
generateReport().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
