import { FIREBASE_DB, FIREBASE_AUTH } from "./FirebaseConfig";
import {
  collection, doc, setDoc, getDocs,
  deleteDoc, query, orderBy, serverTimestamp
} from "firebase/firestore";

const getRef = () =>
  collection(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "notes");

export async function loadNotes() {
  try {
    const snap = await getDocs(query(getRef(), orderBy("updatedAt", "desc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) { console.log("loadNotes error:", e); return []; }
}

export async function saveNote(note) {
  try {
    const uid = FIREBASE_AUTH.currentUser?.uid;
    await setDoc(doc(FIREBASE_DB, "users", uid, "notes", note.id), {
      title: note.title,
      content: note.content,
      updatedAt: serverTimestamp(),
      createdAt: note.createdAt || new Date().toISOString(),
    });
    return await loadNotes();
  } catch (e) { console.log("saveNote error:", e); return null; }
}

export async function deleteNote(id) {
  try {
    await deleteDoc(
      doc(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "notes", id)
    );
    return await loadNotes();
  } catch (e) { console.log("deleteNote error:", e); return null; }
}

export function createNote(title = "", content = "") {
  return {
    id: Date.now().toString(),
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}