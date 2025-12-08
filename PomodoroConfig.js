// pomodoroConfig.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "pomodoro-settings";

const DEFAULTS = {
  workMinutes: 25,
  shortBreakMinutes: 5,
  longBreakMinutes: 15,
  startSound: "HEE",   // or "none"
  breakEndSound: "CHIME",
};

export async function loadPomodoroSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed };
  } catch (e) {
    console.log("loadPomodoroSettings error:", e);
    return DEFAULTS;
  }
}

async function save(partial) {
  try {
    const current = await loadPomodoroSettings();
    const merged = { ...current, ...partial };
    await AsyncStorage.setItem(KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.log("savePomodoroSettings error:", e);
    return null;
  }
}

export const setWorkMinutes = (n) => save({ workMinutes: n });
export const setShortBreakMinutes = (n) => save({ shortBreakMinutes: n });
export const setLongBreakMinutes = (n) => save({ longBreakMinutes: n });
export const setStartSound = (id) => save({ startSound: id });
export const setBreakEndSound = (id) => save({ breakEndSound: id });
