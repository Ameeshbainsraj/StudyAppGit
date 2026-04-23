import { FIREBASE_DB, FIREBASE_AUTH } from "./FirebaseConfig";
import {
  collection, doc, setDoc, getDocs,
  deleteDoc, query, orderBy, serverTimestamp
} from "firebase/firestore";

const getRef = () =>
  collection(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "flashcardDecks");

export async function loadDecks() {
  try {
    const snap = await getDocs(query(getRef(), orderBy("createdAt", "desc")));
    return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
  } catch (e) { console.log("loadDecks error:", e); return []; }
}

export async function saveDeck(deck) {
  try {
    const uid = FIREBASE_AUTH.currentUser?.uid;
    await setDoc(doc(FIREBASE_DB, "users", uid, "flashcardDecks", deck.id), {
      title: deck.title,
      source: deck.source || "",
      cards: deck.cards,
      createdAt: deck.createdAt || serverTimestamp(),
    });
    return await loadDecks();
  } catch (e) { console.log("saveDeck error:", e); return null; }
}

export async function deleteDeck(id) {
  try {
    await deleteDoc(
      doc(FIREBASE_DB, "users", FIREBASE_AUTH.currentUser?.uid, "flashcardDecks", id)
    );
    return await loadDecks();
  } catch (e) { console.log("deleteDeck error:", e); return null; }
}

export function createDeck(title = "", source = "", cards = []) {
  return {
    id: Date.now().toString(),
    title,
    source,
    cards,
    createdAt: new Date().toISOString(),
  };
}