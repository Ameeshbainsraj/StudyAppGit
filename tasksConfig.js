import { FIREBASE_DB, FIREBASE_AUTH } from "./FirebaseConfig";
import {
  collection, doc, addDoc, getDocs, updateDoc,
  deleteDoc, query, orderBy, serverTimestamp
} from "firebase/firestore";

const getRef = () =>
  collection(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "tasks");

export async function loadTasks() {
  try {
    const snap = await getDocs(query(getRef(), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) { console.log("loadTasks error:", e); return []; }
}

export async function saveTask(task) {
  try {
    const { id, ...data } = task;
    await addDoc(getRef(), { ...data, createdAt: serverTimestamp() });
    return await loadTasks();
  } catch (e) { console.log("saveTask error:", e); return null; }
}

export async function toggleTask(id) {
  try {
    const list = await loadTasks();
    const task = list.find((t) => t.id === id);
    if (!task) return list;
    await updateDoc(
      doc(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser.uid, "tasks", id),
      { done: !task.done }
    );
    return await loadTasks();
  } catch (e) { console.log("toggleTask error:", e); return null; }
}

export async function deleteTask(id) {
  try {
    await deleteDoc(
      doc(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser.uid, "tasks", id)
    );
    return await loadTasks();
  } catch (e) { console.log("deleteTask error:", e); return null; }
}

export function createTask(title = "", priority = "low") {
  return { title, priority, done: false, createdAt: new Date().toISOString() };
}

export const PRIORITY_COLORS = {
  low: "#10B981",
  medium: "#F59E0B",
  high: "#EF4444",
};