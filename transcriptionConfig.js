// transcriptionConfig.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const SETTINGS_KEY = "transcription-settings";
const HISTORY_KEY = "transcription-history";

const DEFAULT_SETTINGS = {
  voice: "voiceA", // "voiceA" | "voiceB" | "voiceC"
};

export async function loadTranscriptionSettings() {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch (e) {
    console.log("loadTranscriptionSettings error:", e);
    return DEFAULT_SETTINGS;
  }
}

export async function setVoice(id) {
  try {
    const current = await loadTranscriptionSettings();
    const merged = { ...current, voice: id };
    await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(merged));
    return merged;
  } catch (e) {
    console.log("setVoice error:", e);
    return null;
  }
}

// ----- History -----

export async function loadTranscriptionHistory() {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.log("loadTranscriptionHistory error:", e);
    return [];
  }
}

export async function addTranscriptionToHistory(entry) {
  // entry: { id, title, text, createdAt }
  try {
    const list = await loadTranscriptionHistory();
    const updated = [entry, ...list];
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("addTranscriptionToHistory error:", e);
    return null;
  }
}
