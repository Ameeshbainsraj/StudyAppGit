import { FIREBASE_DB, FIREBASE_AUTH } from "./FirebaseConfig";
import {
  collection, doc, addDoc, getDocs, deleteDoc,
  query, orderBy, serverTimestamp, setDoc, getDoc
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
  } catch (e) { return DEFAULT_SETTINGS; }
}

export async function setVoice(id) {
  try {
    const current = await loadTranscriptionSettings();
    const merged = { ...current, voice: id };
    await setDoc(getSettingsRef(), merged);
    return merged;
  } catch (e) { return null; }
}

export async function loadTranscriptionHistory() {
  try {
    const snap = await getDocs(
      query(getHistoryRef(), orderBy("createdAt", "desc"))
    );
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) { return []; }
}

export async function addTranscriptionToHistory(entry) {
  try {
    await addDoc(getHistoryRef(), { ...entry, createdAt: serverTimestamp() });
    return await loadTranscriptionHistory();
  } catch (e) { return null; }
}

export async function deleteTranscriptionFromHistory(id) {
  try {
    await deleteDoc(
      doc(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "transcriptions", id)
    );
    return await loadTranscriptionHistory();
  } catch (e) { return null; }
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
  } catch (e) { return null; }
}