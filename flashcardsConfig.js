// flashcardsConfig.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const DECKS_KEY = "flashcard-decks";

export async function loadDecks() {
  try {
    const raw = await AsyncStorage.getItem(DECKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.log("loadDecks error:", e);
    return [];
  }
}

export async function saveDeck(deck) {
  // deck: { id, title, source, cards: [{id, question, answer}], createdAt }
  try {
    const list = await loadDecks();
    const index = list.findIndex((d) => d.id === deck.id);
    if (index >= 0) {
      list[index] = deck;
    } else {
      list.unshift(deck);
    }
    await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(list));
    return list;
  } catch (e) {
    console.log("saveDeck error:", e);
    return null;
  }
}

export async function deleteDeck(id) {
  try {
    const list = await loadDecks();
    const updated = list.filter((d) => d.id !== id);
    await AsyncStorage.setItem(DECKS_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.log("deleteDeck error:", e);
    return null;
  }
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