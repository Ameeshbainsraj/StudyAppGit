// screens/NoteEditorScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { useTheme } from "../ThemeContext";
import { saveNote, createNote } from "../notesConfig";
import { awardXP, XP_REWARDS } from "../xpConfig"; // ← NEW

//const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_KEY;
const GROQ_API_KEY = "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";    //<<==== insert fresh groq key here
const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export default function NoteEditorScreen({ navigation, route }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { note: initialNote, isNew } = route.params || {};

  const C = {
    bg:          theme.colors.background,
    card:        theme.colors.card,
    primary:     theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text:        theme.colors.text,
    muted:       theme.colors.mutedText,
    input:       theme.colors.inputBackground,
    danger:      theme.colors.danger,
  };

  const [title, setTitle]             = useState(initialNote?.title || "");
  const [content, setContent]         = useState(initialNote?.content || "");
  const [saving, setSaving]           = useState(false);
  const [summarising, setSummarising] = useState(false);

  // ── Save note ──────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!title.trim() && !content.trim()) {
      Alert.alert("Empty note", "Add a title or some content before saving.");
      return;
    }
    setSaving(true);
    const note = {
      ...(initialNote || createNote()),
      title: title.trim() || "Untitled",
      content: content.trim(),
      updatedAt: new Date().toISOString(),
    };
    await saveNote(note);
    await awardXP(XP_REWARDS.NOTE_SAVED); // ← NEW
    setSaving(false);
    navigation.goBack();
  };

  // ── AI Summarise ───────────────────────────────────────────────────────────
  const handleSummarise = async () => {
    if (!content.trim()) {
      Alert.alert("No content", "Write or import some content first.");
      return;
    }
    setSummarising(true);
    try {
      const response = await fetch(GROQ_CHAT_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: MODEL,
          max_tokens: 1024,
          temperature: 0.5,
          messages: [
            {
              role: "system",
              content: "You are a study notes assistant. When given notes, return a clean structured summary with: a brief overview, key points as bullet points, and any important terms. Keep it concise and useful for studying.",
            },
            {
              role: "user",
              content: `Please summarise these notes:\n\n${content}`,
            },
          ],
        }),
      });

      const rawText = await response.text();
      if (!response.ok) {
        Alert.alert("Error", `Could not summarise. Status: ${response.status}`);
        return;
      }

      const data = JSON.parse(rawText);
      const summary = data?.choices?.[0]?.message?.content?.trim();
      if (!summary) { Alert.alert("No response", "Try again."); return; }

      Alert.alert(
        "Summary ready",
        "Replace your notes with the summary, or add it below?",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Add below", onPress: () => setContent((c) => `${c}\n\n─── AI SUMMARY ───\n\n${summary}`) },
          { text: "Replace",   onPress: () => setContent(summary) },
        ]
      );
    } catch (err) {
      Alert.alert("Error", "Network error. Check your connection.");
    } finally {
      setSummarising(false);
    }
  };

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const exportAsPDF = async () => {
    if (!content.trim()) { Alert.alert("No content", "Nothing to export."); return; }
    try {
      const html = `
        <html><head><meta charset="utf-8"/>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; color: #111; line-height: 1.7; }
          h1 { font-size: 22px; color: #333; border-bottom: 2px solid #7C3AED; padding-bottom: 10px; }
          .meta { font-size: 12px; color: #888; margin-top: 6px; }
          p { font-size: 15px; margin-top: 20px; white-space: pre-wrap; }
        </style></head>
        <body>
          <h1>${title || "Untitled Note"}</h1>
          <div class="meta">Shepard Learn · ${new Date().toLocaleString()}</div>
          <p>${content}</p>
        </body></html>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Save note as PDF" });
    } catch (e) { Alert.alert("Export failed", "Could not generate PDF."); }
  };

  // ── Export Word ────────────────────────────────────────────────────────────
  const exportAsDOCX = async () => {
    if (!content.trim()) { Alert.alert("No content", "Nothing to export."); return; }
    try {
      const wordHtml = `
        <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
        <head><meta charset="utf-8"/><title>${title || "Note"}</title></head>
        <body style="font-family:Calibri,sans-serif;font-size:12pt;line-height:1.6;padding:40px;">
          <h1 style="font-size:18pt;color:#333;">${title || "Untitled Note"}</h1>
          <p style="font-size:10pt;color:#888;">Shepard Learn · ${new Date().toLocaleString()}</p>
          <hr/>
          <p style="white-space:pre-wrap;font-size:12pt;">${content}</p>
        </body></html>
      `;
      const fileUri = `${FileSystem.documentDirectory}note_${Date.now()}.doc`;
      await FileSystem.writeAsStringAsync(fileUri, wordHtml, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: "application/msword", dialogTitle: "Save note as Word doc" });
    } catch (e) { Alert.alert("Export failed", "Could not generate Word document."); }
  };

  // ── Open Flashcards ────────────────────────────────────────────────────────
  const openFlashcards = () => {
    if (!content.trim()) {
      Alert.alert("No content", "Write or import some content before generating flashcards.");
      return;
    }
    navigation.navigate("Flashcards", {
      text: content,
      title: title || "Note Flashcards",
    });
  };

  // ── Open Quiz ──────────────────────────────────────────────────────────────
  const openQuiz = () => {
    if (!content.trim()) {
      Alert.alert("No content", "Write or import some content before generating a quiz.");
      return;
    }
    navigation.navigate("Quiz", {
      text: content,
      title: title || "Note Quiz",
    });
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <KeyboardAvoidingView
      style={[s.container, { backgroundColor: C.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={C.text} />
        </TouchableOpacity>

        <Text style={[s.topBarTitle, { color: C.text }]}>
          {isNew ? "NEW NOTE" : "EDIT NOTE"}
        </Text>

        <TouchableOpacity
          style={[s.saveBtn, { backgroundColor: C.primary }]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving
            ? <ActivityIndicator color={C.primaryText} size="small" />
            : <Text style={[s.saveTxt, { color: C.primaryText }]}>Save</Text>
          }
        </TouchableOpacity>
      </View>

      <ScrollView
        style={s.scroll}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* ── Title input ────────────────────────────────────────────────── */}
        <TextInput
          style={[s.titleInput, { color: C.text, borderBottomColor: C.input }]}
          placeholder="Note title..."
          placeholderTextColor={C.muted}
          value={title}
          onChangeText={setTitle}
          maxLength={100}
        />

        {/* ── Action buttons ────────────────────────────────────────────── */}
        <View style={s.actionRow}>

          {/* AI Summarise */}
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: `${C.primary}20`, borderColor: C.primary }]}
            onPress={handleSummarise}
            disabled={summarising}
          >
            {summarising
              ? <ActivityIndicator color={C.primary} size="small" />
              : <MaterialIcons name="auto-awesome" size={15} color={C.primary} />
            }
            <Text style={[s.actionTxt, { color: C.primary }]}>
              {summarising ? "Summarising..." : "AI Summarise"}
            </Text>
          </TouchableOpacity>

          {/* Export PDF */}
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: `${C.danger}15`, borderColor: `${C.danger}50` }]}
            onPress={exportAsPDF}
          >
            <MaterialIcons name="picture-as-pdf" size={15} color={C.danger} />
            <Text style={[s.actionTxt, { color: C.danger }]}>PDF</Text>
          </TouchableOpacity>

          {/* Export Word */}
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: `${C.primary}15`, borderColor: `${C.primary}40` }]}
            onPress={exportAsDOCX}
          >
            <MaterialIcons name="description" size={15} color={C.primary} />
            <Text style={[s.actionTxt, { color: C.primary }]}>Word</Text>
          </TouchableOpacity>

          {/* Flashcards */}
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: `${C.primary}15`, borderColor: `${C.primary}40` }]}
            onPress={openFlashcards}
          >
            <MaterialIcons name="style" size={15} color={C.primary} />
            <Text style={[s.actionTxt, { color: C.primary }]}>Flashcards</Text>
          </TouchableOpacity>

          {/* Quiz */}
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: `${C.primary}15`, borderColor: `${C.primary}40` }]}
            onPress={openQuiz}
          >
            <MaterialIcons name="quiz" size={15} color={C.primary} />
            <Text style={[s.actionTxt, { color: C.primary }]}>Quiz</Text>
          </TouchableOpacity>

        </View>

        {/* ── Content input ─────────────────────────────────────────────── */}
        <TextInput
          style={[s.contentInput, { color: C.text, backgroundColor: C.card }]}
          placeholder="Start writing your notes here..."
          placeholderTextColor={C.muted}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </ScrollView>

    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "15%",
    marginBottom: 20,
    alignSelf: "center",
  },
  topBarTitle: { fontWeight: "bold", fontSize: 18 },
  saveBtn: {
    paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20,
  },
  saveTxt: { fontWeight: "700", fontSize: 14 },

  scroll: { flex: 1 },

  titleInput: {
    fontSize: 22, fontWeight: "700",
    paddingVertical: 10, borderBottomWidth: 1, marginBottom: 16,
  },

  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
  },
  actionTxt: { fontSize: 13, fontWeight: "600" },

  contentInput: {
    borderRadius: 16,
    padding: 16,
    fontSize: 15,
    lineHeight: 24,
    minHeight: 400,
  },
});