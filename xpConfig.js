// xpConfig.js
import { FIREBASE_DB, FIREBASE_AUTH } from "./FirebaseConfig";
import { doc, updateDoc, increment, getDoc } from "firebase/firestore";

export const XP_REWARDS = {
  TASK_DONE: 5, POMODORO_SESSION: 15, TRANSCRIPTION: 20,
  NOTE_SAVED: 10, FLASHCARD_DECK: 15, FLASHCARD_STUDY: 10,
  QUIZ_COMPLETED: 20, PLANNER_SESSION: 5,
};

export const LEVELS = [
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
  { level: 20, title: "Shepard 🌟",  xpRequired: 36000 },
];

export function getLevelFromXP(xp) {
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

export async function getUserXP() {
  try {
    const uid = FIREBASE_AUTH.currentUser?.uid;
    const snap = await getDoc(doc(FIREBASE_DB, "users", uid));
    return snap.data()?.xp ?? 0;
  } catch (e) { return 0; }
}

/**
 * Awards XP to the current user.
 * Returns { leveledUp: boolean, newLevel: object | null }
 * so callers can show a level-up alert when appropriate.
 */
export async function awardXP(amount) {
  try {
    const uid = FIREBASE_AUTH.currentUser?.uid;
    if (!uid) return { leveledUp: false, newLevel: null };

    const ref = doc(FIREBASE_DB, "users", uid);

    // Read XP before the increment
    const snapBefore = await getDoc(ref);
    const xpBefore = snapBefore.data()?.xp ?? 0;

    // Apply the increment
    await updateDoc(ref, { xp: increment(amount) });

    const xpAfter = xpBefore + amount;

    // Detect level crossing
    const levelBefore = getLevelFromXP(xpBefore).level;
    const levelAfter  = getLevelFromXP(xpAfter).level;

    if (levelAfter > levelBefore) {
      const newLevel = getLevelFromXP(xpAfter);
      return { leveledUp: true, newLevel };
    }

    return { leveledUp: false, newLevel: null };
  } catch (e) {
    console.log("awardXP error:", e);
    return { leveledUp: false, newLevel: null };
  }
}