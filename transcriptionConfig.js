import { FIREBASE_DB, FIREBASE_AUTH } from "./FirebaseConfig";
import {
  collection, doc, addDoc, getDocs, deleteDoc,
  query, orderBy, setDoc, getDoc
} from "firebase/firestore";

const getSettingsRef = () =>
  doc(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "transcriptionSettings", "settings");

const getHistoryRef = () =>
  collection(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "transcriptions");

const DEFAULT_SETTINGS = { voice: "voiceA" };

export async function loadTranscriptionSettings() {
  try {
    const snap = await getDoc(getSettingsRef());
    if (!snap.exists()) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...snap.data() };
  } catch (e) {
    console.error("loadTranscriptionSettings error:", e);
    return DEFAULT_SETTINGS;
  }
}

export async function setVoice(id) {
  try {
    const current = await loadTranscriptionSettings();
    const merged = { ...current, voice: id };
    await setDoc(getSettingsRef(), merged);
    return merged;
  } catch (e) {
    console.error("setVoice error:", e);
    return null;
  }
}

export async function loadTranscriptionHistory() {
  try {
    const snap = await getDocs(
      query(getHistoryRef(), orderBy("createdAt", "desc"))
    );
    // Always use Firestore's real doc ID — never the id field stored inside the doc
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
    }));
  } catch (e) {
    console.error("loadTranscriptionHistory error:", e);
    return [];
  }
}

export async function addTranscriptionToHistory(entry) {
  try {
    // Strip any local id field — Firestore generates the real doc ID
    const { id: _ignore, ...rest } = entry;

    // Use a client-side ISO timestamp so the doc is immediately
    // queryable by orderBy("createdAt") without a serverTimestamp race condition
    await addDoc(getHistoryRef(), {
      ...rest,
      createdAt: new Date().toISOString(),
    });

    // Reload and return the updated list with correct Firestore IDs
    return await loadTranscriptionHistory();
  } catch (e) {
    console.error("addTranscriptionToHistory error:", e);
    return null;
  }
}

export async function deleteTranscriptionFromHistory(id) {
  try {
    await deleteDoc(
      doc(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "transcriptions", id)
    );
    return await loadTranscriptionHistory();
  } catch (e) {
    console.error("deleteTranscriptionFromHistory error:", e);
    return null;
  }
}

export async function clearTranscriptionHistory() {
  try {
    const list = await loadTranscriptionHistory();
    const uid = FIREBASE_AUTH.currentUser?.uid;
    await Promise.all(
      list.map((item) =>
        deleteDoc(doc(FIREBASE_DB, "users", uid, "transcriptions", item.id))
      )
    );
    return [];
  } catch (e) {
    console.error("clearTranscriptionHistory error:", e);
    return null;
  }
}