// screens/FlashcardsScreen.js
import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, ActivityIndicator,
} from "react-native";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { loadDecks, deleteDeck, createDeck, saveDeck } from "../flashcardsConfig";

const GROQ_API_KEY = "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"; // 🔑 your key
const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export default function FlashcardsScreen({ navigation, route }) {
  const { theme } = useTheme();
  const [decks, setDecks]         = useState([]);
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated]   = useState(false); // prevent double-generate

  const incomingText  = route.params?.text  || "";
  const incomingTitle = route.params?.title || "";

  const C = {
    bg:      theme.colors.background,
    card:    theme.colors.card,
    primary: theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text:    theme.colors.text,
    muted:   theme.colors.mutedText,
    danger:  theme.colors.danger,
    input:   theme.colors.inputBackground,
  };

  useFocusEffect(
    useCallback(() => {
      loadDecks().then(setDecks);
      // Auto-generate only once when arriving with content
      if (incomingText && !generated) {
        setGenerated(true);
        generateDeck(incomingText, incomingTitle);
      }
    }, [incomingText])
  );

  // ── Generate flashcards from text ──────────────────────────────────────────
  const generateDeck = async (text, title) => {
    if (!text?.trim()) return;
    setGenerating(true);
    try {
      const response = await fetch(GROQ_CHAT_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 2048,
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content: `You are a flashcard generator. Given study content, generate 8-12 flashcards.
Return ONLY a valid JSON array with no extra text or markdown:
[
  {"question": "What is X?", "answer": "X is..."},
  {"question": "Define Y", "answer": "Y means..."}
]
Make questions clear and concise. Answers should be short but complete.`,
            },
            {
              role: "user",
              content: `Generate flashcards from this content:\n\n${text}`,
            },
          ],
        }),
      });

      const rawText = await response.text();
      if (!response.ok) {
        Alert.alert("Error", `Could not generate flashcards. Status: ${response.status}`);
        return;
      }

      const data = JSON.parse(rawText);
      const content = data?.choices?.[0]?.message?.content?.trim();

      // Strip markdown code fences if present
      const cleaned = content.replace(/```json|```/g, "").trim();
      const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        Alert.alert("Error", "Could not parse flashcards. Try again.");
        return;
      }

      const cards = JSON.parse(jsonMatch[0]).map((c, i) => ({
        id: `${Date.now()}_${i}`,
        question: c.question,
        answer: c.answer,
      }));

      if (!cards.length) {
        Alert.alert("Error", "No flashcards were generated. Try again.");
        return;
      }

      const deck = createDeck(
        title || `Deck · ${new Date().toLocaleTimeString()}`,
        text.slice(0, 60) + "...",
        cards
      );

      const updated = await saveDeck(deck);
      if (updated) setDecks(updated);

      Alert.alert("✅ Done!", `Generated ${cards.length} flashcards. Tap the deck to study!`);
    } catch (err) {
      console.error("generateDeck error:", err);
      Alert.alert("Error", "Could not generate flashcards. Check your connection.");
    } finally {
      setGenerating(false);
    }
  };

  const handleDelete = (id, title) => {
    Alert.alert("Delete Deck", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const updated = await deleteDeck(id);
          if (updated !== null) setDecks(updated);
        },
      },
    ]);
  };

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="arrow-back" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={[s.topBarTitle, { color: C.text }]}>FLASHCARDS</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Entypo name="cog" size={30} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* ── Generating indicator ──────────────────────────────────────────── */}
      {generating && (
        <View style={[s.generatingBar, { backgroundColor: C.card }]}>
          <ActivityIndicator color={C.primary} size="small" />
          <Text style={[s.generatingTxt, { color: C.primary }]}>
            Generating flashcards with AI...
          </Text>
        </View>
      )}

      {/* ── Hint — only when no incoming text ────────────────────────────── */}
      {!incomingText && !generating && (
        <View style={[s.hintCard, { backgroundColor: C.card }]}>
          <MaterialIcons name="auto-awesome" size={18} color={C.primary} />
          <Text style={[s.hintText, { color: C.muted }]}>
            Open a{" "}
            <Text style={{ color: C.primary, fontWeight: "700" }}>Note</Text>
            {" "}and tap{" "}
            <Text style={{ color: C.primary, fontWeight: "700" }}>Flashcards</Text>
            {" "}to generate a deck with AI
          </Text>
        </View>
      )}

      {/* ── Section title ─────────────────────────────────────────────────── */}
      <Text style={[s.sectionTitle, { color: C.text }]}>My Decks</Text>

      {/* ── Decks list ────────────────────────────────────────────────────── */}
      <ScrollView
        style={s.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {decks.length === 0 && !generating ? (
          <View style={[s.emptyCard, { backgroundColor: C.card }]}>
            <Text style={{ fontSize: 40 }}>🃏</Text>
            <Text style={[s.emptyTitle, { color: C.text }]}>No decks yet</Text>
            <Text style={[s.emptySubtitle, { color: C.muted }]}>
              Open a Note and tap Flashcards to create your first deck
            </Text>
          </View>
        ) : (
          decks.map((deck) => (
            <TouchableOpacity
              key={deck.id}
              style={[s.deckCard, { backgroundColor: C.card }]}
              onPress={() => navigation.navigate("FlashcardStudy", { deck })}
              activeOpacity={0.8}
            >
              <View style={[s.deckIcon, { backgroundColor: C.primary + "20" }]}>
                <Text style={{ fontSize: 24 }}>🃏</Text>
              </View>
              <View style={s.deckInfo}>
                <Text style={[s.deckTitle, { color: C.text }]} numberOfLines={1}>
                  {deck.title}
                </Text>
                <Text style={[s.deckCount, { color: C.muted }]}>
                  {deck.cards.length} cards · {new Date(deck.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => handleDelete(deck.id, deck.title)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="delete-outline" size={20} color={C.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    width: "90%", flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: "15%", marginBottom: 16, alignSelf: "center",
  },
  topBarTitle: { fontWeight: "bold", fontSize: 18 },
  generatingBar: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 16, padding: 14, borderRadius: 14, marginBottom: 12,
  },
  generatingTxt: { fontSize: 14, fontWeight: "600" },
  hintCard: {
    flexDirection: "row", alignItems: "center", gap: 10,
    marginHorizontal: 16, padding: 14, borderRadius: 14, marginBottom: 16,
  },
  hintText: { fontSize: 13, flex: 1, lineHeight: 19 },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginHorizontal: 22, marginBottom: 12 },
  list: { flex: 1, paddingHorizontal: 16 },
  emptyCard: {
    borderRadius: 20, paddingVertical: 60, alignItems: "center", gap: 10,
  },
  emptyTitle:    { fontSize: 17, fontWeight: "700" },
  emptySubtitle: { fontSize: 13, textAlign: "center", paddingHorizontal: 30 },
  deckCard: {
    flexDirection: "row", alignItems: "center", gap: 14,
    borderRadius: 16, padding: 16, marginBottom: 10,
  },
  deckIcon:  { width: 52, height: 52, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  deckInfo:  { flex: 1 },
  deckTitle: { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  deckCount: { fontSize: 12 },
});