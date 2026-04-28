// ─── test_HomeScreen.js ───────────────────────────────────────────────────────
// Unit tests for pure logic extracted from HomeScreen.js
// Run with: node test_HomeScreen.js
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS = [
  { level: 1,  title: "Novice",     xpRequired: 0 },
  { level: 2,  title: "Learner",    xpRequired: 100 },
  { level: 3,  title: "Explorer",   xpRequired: 250 },
  { level: 4,  title: "Scholar",    xpRequired: 500 },
  { level: 5,  title: "Apprentice", xpRequired: 800 },
  { level: 10, title: "Sage",       xpRequired: 4000 },
  { level: 20, title: "Shepard",    xpRequired: 36000 },
];

const XP_REWARDS = {
  TASK_DONE: 5, POMODORO_SESSION: 15, TRANSCRIPTION: 20,
  NOTE_SAVED: 10, FLASHCARD_DECK: 15, FLASHCARD_STUDY: 10,
  QUIZ_COMPLETED: 20, PLANNER_SESSION: 5,
};

const PRIORITY_COLORS = { low: "#4CAF50", medium: "#FF9800", high: "#F44336" };

function getLevelFromXP(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  const nextLevel = LEVELS.find((l) => l.xpRequired > xp);
  const xpForNext = nextLevel ? nextLevel.xpRequired : current.xpRequired;
  const progress = nextLevel ? (xp - current.xpRequired) / (xpForNext - current.xpRequired) : 1;
  return { ...current, xp, nextLevel, progress };
}

let idCounter = 1;
function createTask(title, priority = "low") {
  return { id: String(idCounter++), title, priority, done: false, createdAt: new Date().toISOString() };
}

function toggleTask(tasks, id) {
  return tasks.map((t) => t.id === id ? { ...t, done: !t.done } : t);
}

function deleteTask(tasks, id) {
  return tasks.filter((t) => t.id !== id);
}

function formatXP(xp) {
  return xp > 999 ? `${(xp / 1000).toFixed(1)}k` : String(xp);
}

function getInitials(name) {
  return name ? name.charAt(0).toUpperCase() : "U";
}

// ─── TEST RUNNER ─────────────────────────────────────────────────────────────
let passed = 0; let failed = 0;
function test(id, description, actual, expected) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  console.log(`${ok ? "✅ PASS" : "❌ FAIL"} | ${id} | ${description}`);
  if (!ok) console.log(`        Expected: ${JSON.stringify(expected)} | Got: ${JSON.stringify(actual)}`);
  ok ? passed++ : failed++;
}

// ─────────────────────────────────────────────────────────────────────────────
console.log("\n=== HomeScreen — Task Logic Tests ===");

const taskA = createTask("Finish thesis", "high");
const taskB = createTask("Read notes", "medium");
const tasks = [taskA, taskB];

test("H01", "createTask sets correct title",     taskA.title,    "Finish thesis");
test("H02", "createTask sets correct priority",  taskA.priority, "high");
test("H03", "createTask initialises done=false", taskA.done,     false);

const toggled = toggleTask(tasks, taskA.id);
test("H04", "toggleTask marks task as done",          toggled[0].done, true);
test("H05", "toggleTask does not affect other tasks", toggled[1].done, false);
const toggledBack = toggleTask(toggled, taskA.id);
test("H06", "toggleTask toggles back to undone",      toggledBack[0].done, false);

const afterDelete = deleteTask(tasks, taskA.id);
test("H07", "deleteTask removes correct task",        afterDelete.length,       1);
test("H08", "deleteTask keeps remaining task intact", afterDelete[0].title, "Read notes");

console.log("\n=== HomeScreen — XP & Reward Tests ===");

test("H09", "XP_REWARDS.TASK_DONE = 5",        XP_REWARDS.TASK_DONE,      5);
test("H10", "XP_REWARDS.QUIZ_COMPLETED = 20",  XP_REWARDS.QUIZ_COMPLETED, 20);
test("H11", "XP_REWARDS.TRANSCRIPTION = 20",   XP_REWARDS.TRANSCRIPTION,  20);
test("H12", "XP_REWARDS.NOTE_SAVED = 10",      XP_REWARDS.NOTE_SAVED,     10);

test("H13", "formatXP shows raw under 1000",   formatXP(500),  "500");
test("H14", "formatXP abbreviates 1000+ as k", formatXP(1500), "1.5k");
test("H15", "formatXP handles exact 1000",     formatXP(1000), "1.0k");

const before = getLevelFromXP(90);
const after  = getLevelFromXP(110);
test("H16", "Level-up detected when XP crosses threshold", after.level > before.level, true);

console.log("\n=== HomeScreen — Priority & UI Logic Tests ===");

test("H17", "PRIORITY_COLORS.low is green",     PRIORITY_COLORS.low,    "#4CAF50");
test("H18", "PRIORITY_COLORS.medium is orange", PRIORITY_COLORS.medium, "#FF9800");
test("H19", "PRIORITY_COLORS.high is red",      PRIORITY_COLORS.high,   "#F44336");

test("H20", "getInitials returns first letter uppercased", getInitials("ameesh"), "A");
test("H21", "getInitials returns U for empty name",        getInitials(""),       "U");

const done = 3; const total = 5;
test("H22", "Progress percentage is correct", Math.round((done / total) * 100), 60);

const mixedTasks = [{ done: true }, { done: false }, { done: true }, { done: false }, { done: true }];
test("H23", "doneTasks count is correct",  mixedTasks.filter(t => t.done).length, 3);
test("H24", "totalTasks count is correct", mixedTasks.length,                     5);

console.log(`\n─────────────────────────────────────`);
console.log(`Results: ${passed} passed, ${failed} failed out of ${passed + failed} tests`);
console.log(`─────────────────────────────────────\n`);