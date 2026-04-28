// ─── Paste your LEVELS array and functions directly (no Firebase imports needed) ───

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
  { id: "bronze_recruit",     label: "Recruit",   minLevel: 1,  maxLevel: 2  },
  { id: "silver_scout",       label: "Scout",     minLevel: 3,  maxLevel: 4  },
  { id: "gold_scholar",       label: "Scholar",   minLevel: 5,  maxLevel: 6  },
  { id: "amethyst_analyst",   label: "Analyst",   minLevel: 7,  maxLevel: 8  },
  { id: "sapphire_sage",      label: "Sage",      minLevel: 9,  maxLevel: 10 },
  { id: "flame_expert",       label: "Expert",    minLevel: 11, maxLevel: 12 },
  { id: "lightning_virtuoso", label: "Virtuoso",  minLevel: 13, maxLevel: 14 },
  { id: "emerald_champion",   label: "Champion",  minLevel: 15, maxLevel: 16 },
  { id: "crimson_elite",      label: "Elite",     minLevel: 17, maxLevel: 18 },
  { id: "cosmic_luminary",    label: "Luminary",  minLevel: 19, maxLevel: 19 },
  { id: "star_shepard",       label: "Shepard",   minLevel: 20, maxLevel: 20 },
];

function getLevelFromXP(xp) {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.xpRequired) current = lvl;
    else break;
  }
  const nextLevel = LEVELS.find((l) => l.xpRequired > xp);
  const xpForNext = nextLevel ? nextLevel.xpRequired : current.xpRequired;
  const progress = nextLevel
    ? (xp - current.xpRequired) / (xpForNext - current.xpRequired)
    : 1;
  return { ...current, xp, nextLevel, progress };
}

function getBadgeForLevel(level) {
  return BADGES.find((b) => level >= b.minLevel && level <= b.maxLevel) ?? BADGES[0];
}

// ─── UNIT TESTS ───────────────────────────────────────────────────────────────

console.log("=== getLevelFromXP Unit Tests ===");
console.log("U01 | XP=0     | Expected: Level 1  (Novice)     | Got:", getLevelFromXP(0).level, "-", getLevelFromXP(0).title);
console.log("U02 | XP=100   | Expected: Level 2  (Learner)    | Got:", getLevelFromXP(100).level, "-", getLevelFromXP(100).title);
console.log("U03 | XP=250   | Expected: Level 3  (Explorer)   | Got:", getLevelFromXP(250).level, "-", getLevelFromXP(250).title);
console.log("U04 | XP=500   | Expected: Level 4  (Scholar)    | Got:", getLevelFromXP(500).level, "-", getLevelFromXP(500).title);
console.log("U05 | XP=36000 | Expected: Level 20 (Shepard)    | Got:", getLevelFromXP(36000).level, "-", getLevelFromXP(36000).title);

console.log("");
console.log("=== getBadgeForLevel Unit Tests ===");
console.log("U06 | Level 1  | Expected: Recruit  | Got:", getBadgeForLevel(1).label);
console.log("U07 | Level 3  | Expected: Scout    | Got:", getBadgeForLevel(3).label);
console.log("U08 | Level 5  | Expected: Scholar  | Got:", getBadgeForLevel(5).label);
console.log("U09 | Level 10 | Expected: Sage     | Got:", getBadgeForLevel(10).label);
console.log("U10 | Level 15 | Expected: Champion | Got:", getBadgeForLevel(15).label);
console.log("U11 | Level 20 | Expected: Shepard  | Got:", getBadgeForLevel(20).label);

console.log("");
console.log("=== awardXP Level Crossing Test ===");
const before = getLevelFromXP(90);
const after  = getLevelFromXP(110);
const leveledUp = after.level > before.level;
console.log("U12 | XP 90→110 | Expected: level-up detected | Got:", leveledUp ? "LEVEL UP DETECTED ✓" : "no level up");