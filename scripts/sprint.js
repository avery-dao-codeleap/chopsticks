#!/usr/bin/env node

/**
 * Sprint Management
 *
 * Commands:
 * - start:  Start a new sprint
 * - status: Check sprint progress
 * - end:    Complete current sprint
 *
 * Usage:
 *   node scripts/sprint.js start
 *   node scripts/sprint.js status
 *   node scripts/sprint.js end
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const SPRINT_FILE = path.join(__dirname, '../.sprint.json');
const TASKS_FILE = path.join(__dirname, '../chopsticks/specs/mvp/tasks.md');

// ─── Sprint File Management ──────────────────────────────────────
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

function deleteSprint() {
  try {
    fs.unlinkSync(SPRINT_FILE);
  } catch {}
}

// ─── Task Analysis ───────────────────────────────────────────────
function parseTasksFile() {
  const content = fs.readFileSync(TASKS_FILE, 'utf8');
  const lines = content.split('\n');

  const tasks = [];

  for (const line of lines) {
    const match = line.match(/^- \[([ xX])\] (T\d+) (.+)/);
    if (match) {
      const [, status, id, title] = match;
      tasks.push({
        id,
        title,
        done: status.toLowerCase() === 'x'
      });
    }
  }

  return tasks;
}

// ─── Interactive Input ───────────────────────────────────────────
function prompt(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise(resolve => {
    rl.question(question, answer => {
      rl.close();
      resolve(answer);
    });
  });
}

// ─── Commands ────────────────────────────────────────────────────
async function startSprint() {
  const existing = loadSprint();
  if (existing) {
    console.log('⚠️  Active sprint already exists:');
    console.log(`   ${existing.name} (${existing.startDate} to ${existing.endDate})`);
    const answer = await prompt('   End current sprint and start new one? (y/N): ');
    if (answer.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      return;
    }
    await endSprint();
  }

  console.log('\n🏃 Starting a new sprint...\n');

  const name = await prompt('Sprint name (e.g., "Sprint 1 - Foundational"): ');
  const goal = await prompt('Sprint goal: ');
  const durationDays = parseInt(await prompt('Duration in days (default: 7): ') || '7', 10);

  const startDate = new Date();
  const endDate = new Date();
  endDate.setDate(endDate.getDate() + durationDays);

  const tasks = parseTasksFile();
  const completedTasks = tasks.filter(t => t.done).length;

  const sprint = {
    name: name || 'Unnamed Sprint',
    goal,
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0],
    totalTasks: tasks.length,
    completedTasks,
    startCompletedTasks: completedTasks
  };

  saveSprint(sprint);

  console.log('\n✅ Sprint started!');
  console.log(`   Name: ${sprint.name}`);
  console.log(`   Goal: ${sprint.goal}`);
  console.log(`   Duration: ${sprint.startDate} → ${sprint.endDate}`);
  console.log(`   Baseline: ${sprint.completedTasks}/${sprint.totalTasks} tasks completed\n`);
}

async function sprintStatus() {
  const sprint = loadSprint();
  if (!sprint) {
    console.log('❌ No active sprint. Start one with: node scripts/sprint.js start');
    return;
  }

  const tasks = parseTasksFile();
  const completedTasks = tasks.filter(t => t.done).length;
  const sprintProgress = completedTasks - sprint.startCompletedTasks;

  const startDate = new Date(sprint.startDate);
  const endDate = new Date(sprint.endDate);
  const today = new Date();
  const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((today - startDate) / (1000 * 60 * 60 * 24));
  const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));

  console.log('\n📊 Sprint Status\n');
  console.log(`🏃 ${sprint.name}`);
  console.log(`   Goal: ${sprint.goal}\n`);
  console.log(`📅 Timeline:`);
  console.log(`   Start: ${sprint.startDate}`);
  console.log(`   End:   ${sprint.endDate}`);
  console.log(`   Days elapsed: ${daysElapsed}/${totalDays} (${daysLeft} days left)\n`);
  console.log(`✅ Progress:`);
  console.log(`   Sprint tasks completed: ${sprintProgress}`);
  console.log(`   Total tasks: ${completedTasks}/${sprint.totalTasks}\n`);

  // Velocity
  const velocity = daysElapsed > 0 ? (sprintProgress / daysElapsed).toFixed(1) : 0;
  const projectedCompletion = velocity > 0 ? Math.ceil((sprint.totalTasks - completedTasks) / velocity) : '∞';

  console.log(`📈 Velocity: ${velocity} tasks/day`);
  if (projectedCompletion !== '∞') {
    console.log(`   Projected completion: ${projectedCompletion} days\n`);
  } else {
    console.log();
  }
}

async function endSprint() {
  const sprint = loadSprint();
  if (!sprint) {
    console.log('❌ No active sprint.');
    return;
  }

  const tasks = parseTasksFile();
  const completedTasks = tasks.filter(t => t.done).length;
  const sprintProgress = completedTasks - sprint.startCompletedTasks;

  console.log('\n🏁 Ending sprint...\n');
  console.log(`Sprint: ${sprint.name}`);
  console.log(`Goal: ${sprint.goal}`);
  console.log(`Completed: ${sprintProgress} tasks\n`);

  const answer = await prompt('Save sprint summary? (Y/n): ');
  if (answer.toLowerCase() !== 'n') {
    const summaryFile = path.join(__dirname, `../sprint-${sprint.startDate}.md`);
    const summary = `# ${sprint.name}

**Goal:** ${sprint.goal}
**Duration:** ${sprint.startDate} to ${sprint.endDate}

## Results
- Tasks completed: ${sprintProgress}
- Baseline: ${sprint.startCompletedTasks}/${sprint.totalTasks}
- Final: ${completedTasks}/${sprint.totalTasks}

## Retrospective
[Add notes here]
`;
    fs.writeFileSync(summaryFile, summary);
    console.log(`✅ Summary saved to: sprint-${sprint.startDate}.md\n`);
  }

  deleteSprint();
  console.log('✅ Sprint ended.\n');
}

// ─── Main ────────────────────────────────────────────────────────
async function main() {
  const command = process.argv[2];

  switch (command) {
    case 'start':
      await startSprint();
      break;
    case 'status':
      await sprintStatus();
      break;
    case 'end':
      await endSprint();
      break;
    default:
      console.log('Usage: node scripts/sprint.js <command>');
      console.log('\nCommands:');
      console.log('  start   - Start a new sprint');
      console.log('  status  - Check current sprint progress');
      console.log('  end     - Complete current sprint');
  }
}

main().catch(err => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
