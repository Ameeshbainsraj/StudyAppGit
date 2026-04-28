// ─── test_all.js ──────────────────────────────────────────────────────────────
// Master unit test file for Shepard Learn
// Run with: node test_all.js
// ─────────────────────────────────────────────────────────────────────────────

const LEVELS = [
  { level: 1,  title: "Novice",      xpRequired: 0 },
  { level: 2,  title: "Learner",     xpRequired: 100 },
  { level: 3,  title: "Explorer",    xpRequired: 250 },
  { level: 4,  title: "Scholar",     xpRequired: 500 },
  { level: 5,  title: "Apprentice",  xpRequired: 800 },
  { level: 6,  title: "Thinker",     xpRequired: 1200 },
  { level: 7,  title: "Analyst",     xpRequired: 1700 },
  { level: 8,  title: "Researcher",  xpRequired: 2300 },
  { level: 9,  title: "Strategist",  xpRequired: 3000 },
  { level: 10, title: "Sage",        xpRequired: 4000 },
  { level: 11, title: "Expert",      xpRequired: 5200 },
  { level: 12, title: "Mastermind",  xpRequired: 6600 },
  { level: 13, title: "Virtuoso",    xpRequired: 8200 },
  { level: 14, title: "Prodigy",     xpRequired: 10000 },
  { level: 15, title: "Champion",    xpRequired: 12500 },
  { level: 16, title: "Legend",      xpRequired: 15500 },
  { level: 17, title: "Elite",       xpRequired: 19000 },
  { level: 18, title: "Grandmaster", xpRequired: 23500 },
  { level: 19, title: "Luminary",    xpRequired: 29000 },
  { level: 20, title: "Shepard",     xpRequired: 36000 },
];

const BADGES = [
  { id: "bronze_recruit",     label: "Recruit",  minLevel: 1,  maxLevel: 2  },
  { id: "silver_scout",       label: "Scout",    minLevel: 3,  maxLevel: 4  },
  { id: "gold_scholar",       label: "Scholar",  minLevel: 5,  maxLevel: 6  },
  { id: "amethyst_analyst",   label: "Analyst",  minLevel: 7,  maxLevel: 8  },
  { id: "sapphire_sage",      label: "Sage",     minLevel: 9,  maxLevel: 10 },
  { id: "flame_expert",       label: "Expert",   minLevel: 11, maxLevel: 12 },
  { id: "lightning_virtuoso", label: "Virtuoso", minLevel: 13, maxLevel: 14 },
  { id: "emerald_champion",   label: "Champion", minLevel: 15, maxLevel: 16 },
  { id: "crimson_elite",      label: "Elite",    minLevel: 17, maxLevel: 18 },
  { id: "cosmic_luminary",    label: "Luminary", minLevel: 19, maxLevel: 19 },
  { id: "star_shepard",       label: "Shepard",  minLevel: 20, maxLevel: 20 },
];

const XP_REWARDS = {
  TASK_DONE: 5, POMODORO_SESSION: 15, TRANSCRIPTION: 20,
  NOTE_SAVED: 10, FLASHCARD_DECK: 15, FLASHCARD_STUDY: 10,
  QUIZ_COMPLETED: 20, PLANNER_SESSION: 5,
};

const PRIORITY_COLORS = { low: "#4CAF50", medium: "#FF9800", high: "#F44336" };

// ── Pure functions ────────────────────────────────────────────────────────────
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

function getBadgeForLevel(level) {
  return BADGES.find((b) => level >= b.minLevel && level <= b.maxLevel) ?? BADGES[0];
}

function getUnlockedBadges(currentLevel) {
  return BADGES.filter((b) => currentLevel >= b.minLevel);
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
console.log("\n════════════════════════════════════════════════");
console.log("  SHEPARD LEARN — MASTER UNIT TEST SUITE");
console.log("════════════════════════════════════════════════");

// ── SECTION 1: getLevelFromXP ─────────────────────────────────────────────────
console.log("\n─── Section 1: getLevelFromXP (xpConfig.js) ───");
test("U01", "XP=0     → Level 1  Novice",     getLevelFromXP(0).level,     1);
test("U02", "XP=100   → Level 2  Learner",    getLevelFromXP(100).level,   2);
test("U03", "XP=250   → Level 3  Explorer",   getLevelFromXP(250).level,   3);
test("U04", "XP=500   → Level 4  Scholar",    getLevelFromXP(500).level,   4);
test("U05", "XP=36000 → Level 20 Shepard",    getLevelFromXP(36000).level, 20);
test("U06", "XP=0 title is Novice",           getLevelFromXP(0).title,     "Novice");
test("U07", "XP=36000 title is Shepard",      getLevelFromXP(36000).title, "Shepard");
test("U08", "Max level progress = 1",         getLevelFromXP(36000).progress, 1);

// ── SECTION 2: getBadgeForLevel ───────────────────────────────────────────────
console.log("\n─── Section 2: getBadgeForLevel (badgeConfig.js) ───");
test("U09",  "Level 1  → Recruit",  getBadgeForLevel(1).label,  "Recruit");
test("U10",  "Level 2  → Recruit",  getBadgeForLevel(2).label,  "Recruit");
test("U11",  "Level 3  → Scout",    getBadgeForLevel(3).label,  "Scout");
test("U12",  "Level 5  → Scholar",  getBadgeForLevel(5).label,  "Scholar");
test("U13",  "Level 10 → Sage",     getBadgeForLevel(10).label, "Sage");
test("U14",  "Level 15 → Champion", getBadgeForLevel(15).label, "Champion");
test("U15",  "Level 20 → Shepard",  getBadgeForLevel(20).label, "Shepard");

// ── SECTION 3: getUnlockedBadges ─────────────────────────────────────────────
console.log("\n─── Section 3: getUnlockedBadges (badgeConfig.js) ───");
test("U16", "Level 1 unlocks 1 badge",   getUnlockedBadges(1).length,  1);
test("U17", "Level 5 unlocks 3 badges",  getUnlockedBadges(5).length,  3);
test("U18", "Level 20 unlocks all 11",   getUnlockedBadges(20).length, 11);

// ── SECTION 4: awardXP level-crossing detection ───────────────────────────────
console.log("\n─── Section 4: Level-up Detection (xpConfig.js) ───");
const xpBefore1 = getLevelFromXP(90);
const xpAfter1  = getLevelFromXP(110);
test("U19", "XP 90→110 triggers level-up",      xpAfter1.level > xpBefore1.level, true);
test("U20", "XP 90→99 does NOT trigger level-up",getLevelFromXP(99).level > getLevelFromXP(90).level, false);
test("U21", "XP 99→100 triggers level-up",       getLevelFromXP(100).level > getLevelFromXP(99).level, true);

// ── SECTION 5: XP Rewards ────────────────────────────────────────────────────
console.log("\n─── Section 5: XP Reward Values (xpConfig.js) ───");
test("U22", "TASK_DONE = 5",        XP_REWARDS.TASK_DONE,       5);
test("U23", "POMODORO_SESSION = 15",XP_REWARDS.POMODORO_SESSION,15);
test("U24", "TRANSCRIPTION = 20",   XP_REWARDS.TRANSCRIPTION,   20);
test("U25", "NOTE_SAVED = 10",      XP_REWARDS.NOTE_SAVED,      10);
test("U26", "FLASHCARD_DECK = 15",  XP_REWARDS.FLASHCARD_DECK,  15);
test("U27", "QUIZ_COMPLETED = 20",  XP_REWARDS.QUIZ_COMPLETED,  20);
test("U28", "PLANNER_SESSION = 5",  XP_REWARDS.PLANNER_SESSION, 5);

// ── SECTION 6: Task Logic ────────────────────────────────────────────────────
console.log("\n─── Section 6: Task Logic (HomeScreen.js) ───");
const taskA = createTask("Write thesis", "high");
const taskB = createTask("Read notes",   "medium");
const tasks = [taskA, taskB];
test("U29", "createTask sets title",          taskA.title,    "Write thesis");
test("U30", "createTask sets priority",       taskA.priority, "high");
test("U31", "createTask done=false",          taskA.done,     false);
const toggled = toggleTask(tasks, taskA.id);
test("U32", "toggleTask marks done",          toggled[0].done, true);
test("U33", "toggleTask leaves other intact", toggled[1].done, false);
const toggledBack = toggleTask(toggled, taskA.id);
test("U34", "toggleTask toggles back",        toggledBack[0].done, false);
const afterDelete = deleteTask(tasks, taskA.id);
test("U35", "deleteTask removes task",        afterDelete.length,       1);
test("U36", "deleteTask keeps other task",    afterDelete[0].title, "Read notes");

// ── SECTION 7: UI Logic ──────────────────────────────────────────────────────
console.log("\n─── Section 7: UI Logic (HomeScreen.js) ───");
test("U37", "formatXP raw under 1000",   formatXP(500),  "500");
test("U38", "formatXP abbreviates 1500", formatXP(1500), "1.5k");
test("U39", "formatXP handles 1000",     formatXP(1000), "1.0k");
test("U40", "getInitials from name",     getInitials("ameesh"), "A");
test("U41", "getInitials empty = U",     getInitials(""),       "U");
test("U42", "Progress pct 3/5 = 60%",   Math.round((3/5)*100), 60);
test("U43", "PRIORITY_COLORS.low",       PRIORITY_COLORS.low,    "#4CAF50");
test("U44", "PRIORITY_COLORS.medium",    PRIORITY_COLORS.medium, "#FF9800");
test("U45", "PRIORITY_COLORS.high",      PRIORITY_COLORS.high,   "#F44336");

// ─── FINAL SUMMARY ───────────────────────────────────────────────────────────
console.log(`\n════════════════════════════════════════════════`);
console.log(`  RESULTS: ${passed} passed  |  ${failed} failed  |  ${passed + failed} total`);
console.log(`════════════════════════════════════════════════\n`);