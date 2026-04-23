// tasksConfig.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const TASKS_KEY = "home-tasks";

export async function loadTasks() {
  try {
    const raw = await AsyncStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.log("loadTasks error:", e);
    return [];
  }
}

export async function saveTask(task) {
  // task: { id, title, priority, done, createdAt }
  try {
    const list = await loadTasks();
    const updated = [task, ...list];
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("saveTask error:", e);
    return null;
  }
}

export async function toggleTask(id) {
  try {
    const list = await loadTasks();
    const updated = list.map((t) =>
      t.id === id ? { ...t, done: !t.done } : t
    );
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("toggleTask error:", e);
    return null;
  }
}

export async function deleteTask(id) {
  try {
    const list = await loadTasks();
    const updated = list.filter((t) => t.id !== id);
    await AsyncStorage.setItem(TASKS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("deleteTask error:", e);
    return null;
  }
}

export function createTask(title = "", priority = "low") {
  return {
    id: Date.now().toString(),
    title,
    priority, // "low" | "medium" | "high"
    done: false,
    createdAt: new Date().toISOString(),
  };
}

export const PRIORITY_COLORS = {
  low:    "#10B981",
  medium: "#F59E0B",
  high:   "#EF4444",
};