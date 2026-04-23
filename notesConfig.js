// notesConfig.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const NOTES_KEY = "notes-list";

// Load all notes
export async function loadNotes() {
  try {
    const raw = await AsyncStorage.getItem(NOTES_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.log("loadNotes error:", e);
    return [];
  }
}

// Save a new note or update existing one (matched by id)
export async function saveNote(note) {
  // note: { id, title, content, createdAt, updatedAt }
  try {
    const list = await loadNotes();
    const index = list.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      list[index] = note; // update
    } else {
      list.unshift(note); // add to top
    }
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.log("saveNote error:", e);
    return null;
  }
}

// Delete a note by id
export async function deleteNote(id) {
  try {
    const list = await loadNotes();
    const updated = list.filter((n) => n.id !== id);
    await AsyncStorage.setItem(NOTES_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("deleteNote error:", e);
    return null;
  }
}

// Create a blank note object
export function createNote(title = "", content = "") {
  return {
    id: Date.now().toString(),
    title,
    content,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}