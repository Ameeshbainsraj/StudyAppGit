import { FIREBASE_DB, FIREBASE_AUTH } from "./FirebaseConfig";
import {
  collection, doc, addDoc, getDocs,
  deleteDoc, updateDoc, query, orderBy, serverTimestamp
} from "firebase/firestore";

const getRef = () =>
  collection(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "sessions");

export async function loadSessions() {
  try {
    const snap = await getDocs(query(getRef(), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) { console.log("loadSessions error:", e); return []; }
}

export async function saveSession(session) {
  try {
    const { id, ...data } = session;
    await addDoc(getRef(), { ...data, createdAt: serverTimestamp() });
    return await loadSessions();
  } catch (e) { console.log("saveSession error:", e); return null; }
}

export async function deleteSession(id) {
  try {
    await deleteDoc(
      doc(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "sessions", id)
    );
    return await loadSessions();
  } catch (e) { console.log("deleteSession error:", e); return null; }
}

export async function toggleSessionDone(id) {
  try {
    const list = await loadSessions();
    const session = list.find((s) => s.id === id);
    if (!session) return list;
    await updateDoc(
      doc(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "sessions", id),
      { done: !session.done }
    );
    return await loadSessions();
  } catch (e) { console.log("toggleSessionDone error:", e); return null; }
}

export function createSession(
  subject = "", date = "", durationMinutes = 25, color = "#7C3AED"
) {
  return {
    subject, date, durationMinutes,
    done: false, color,
    createdAt: new Date().toISOString(),
  };
}

export const SESSION_COLORS = [
  "#7C3AED", "#3B82F6", "#10B981", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#84CC16",
];