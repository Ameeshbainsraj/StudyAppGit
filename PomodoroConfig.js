import { FIREBASE_DB, FIREBASE_AUTH } from "./FirebaseConfig";
import { doc, getDoc, setDoc } from "firebase/firestore";

const DEFAULTS = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  startSound: "HEE",
  breakEndSound: "CHIME",
};

const getRef = () =>
  doc(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "pomodoroSettings", "settings");

export async function loadPomodoroSettings() {
  try {
    const snap = await getDoc(getRef());
    if (!snap.exists()) return DEFAULTS;
    return { ...DEFAULTS, ...snap.data() };
  } catch (e) { return DEFAULTS; }
}

async function save(partial) {
  try {
    const current = await loadPomodoroSettings();
    const merged = { ...current, ...partial };
    await setDoc(getRef(), merged);
    return merged;
  } catch (e) { return null; }
}

export const setWorkMinutes = (n) => save({ workMinutes: n });
export const setShortBreakMinutes = (n) => save({ shortBreakMinutes: n });
export const setLongBreakMinutes = (n) => save({ longBreakMinutes: n });
export const setStartSound = (id) => save({ startSound: id });
export const setBreakEndSound = (id) => save({ breakEndSound: id });