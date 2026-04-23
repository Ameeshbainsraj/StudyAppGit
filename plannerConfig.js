// plannerConfig.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const SESSIONS_KEY = "study-planner-sessions";

export async function loadSessions() {
  try {
    const raw = await AsyncStorage.getItem(SESSIONS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.log("loadSessions error:", e);
    return [];
  }
}

export async function saveSession(session) {
  // session: { id, subject, date, durationMinutes, done, color }
  try {
    const list = await loadSessions();
    const index = list.findIndex((s) => s.id === session.id);
    if (index >= 0) {
      list[index] = session;
    } else {
      list.unshift(session);
    }
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.log("saveSession error:", e);
    return null;
  }
}

export async function deleteSession(id) {
  try {
    const list = await loadSessions();
    const updated = list.filter((s) => s.id !== id);
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("deleteSession error:", e);
    return null;
  }
}

export async function toggleSessionDone(id) {
  try {
    const list = await loadSessions();
    const updated = list.map((s) =>
      s.id === id ? { ...s, done: !s.done } : s
    );
    await AsyncStorage.setItem(SESSIONS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("toggleSessionDone error:", e);
    return null;
  }
}

export function createSession(subject = "", date = "", durationMinutes = 25, color = "#7C3AED") {
  return {
    id: Date.now().toString(),
    subject,
    date,
    durationMinutes,
    done: false,
    color,
    createdAt: new Date().toISOString(),
  };
}

export const SESSION_COLORS = [
  "#7C3AED", "#3B82F6", "#10B981", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#84CC16",
];