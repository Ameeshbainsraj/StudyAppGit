// screens/TranscriptionScreen.js
// Features: Groq Whisper + PDF + Word + AI Tutor + Notes + Flashcards + Quiz + Delete

import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, Animated, Easing, ActivityIndicator,
} from "react-native";
import { Ionicons, FontAwesome5, MaterialIcons, Feather, Entypo } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import {
  loadTranscriptionHistory,
  addTranscriptionToHistory,
  deleteTranscriptionFromHistory,
  clearTranscriptionHistory,
} from "../transcriptionConfig";
import { createNote } from "../notesConfig";

const GROQ_API_KEY = "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"; // 🔑 replace with your key
const GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions";

// ── Pulse ring ────────────────────────────────────────────────────────────────
function PulseRing({ color }) {
  const ring1 = useRef(new Animated.Value(0)).current;
  const ring2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulse = (val, delay) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(val, { toValue: 1, duration: 1400, easing: Easing.out(Easing.ease), useNativeDriver: true }),
          Animated.timing(val, { toValue: 0, duration: 0, useNativeDriver: true }),
        ])
      );
    const anim = Animated.parallel([pulse(ring1, 0), pulse(ring2, 700)]);
    anim.start();
    return () => anim.stop();
  }, []);

  const ringStyle = (val) => ({
    position: "absolute", width: 110, height: 110, borderRadius: 55,
    borderWidth: 2, borderColor: color,
    opacity: val.interpolate({ inputRange: [0, 1], outputRange: [0.7, 0] }),
    transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [1, 2.5] }) }],
  });

  return (
    <>
      <Animated.View style={ringStyle(ring1)} />
      <Animated.View style={ringStyle(ring2)} />
    </>
  );
}

export default function TranscriptionScreen({ navigation }) {
  const { theme } = useTheme();

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

  const [isRecording, setIsRecording]   = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [elapsed, setElapsed]           = useState(0);
  const [history, setHistory]           = useState([]);
  const [activeItem, setActiveItem]     = useState(null);

  const recordingRef   = useRef(null);
  const timerRef       = useRef(null);
  const processingAnim = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      loadTranscriptionHistory().then(setHistory);
    }, [])
  );

  useEffect(() => {
    return () => {
      if (recordingRef.current) recordingRef.current.stopAndUnloadAsync().catch(() => {});
      clearInterval(timerRef.current);
      Speech.stop();
    };
  }, []);

  useEffect(() => {
    if (isProcessing) {
      Animated.loop(
        Animated.timing(processingAnim, { toValue: 1, duration: 900, easing: Easing.linear, useNativeDriver: true })
      ).start();
    } else {
      processingAnim.setValue(0);
    }
  }, [isProcessing]);

  const spinStyle = {
    transform: [{ rotate: processingAnim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] }) }],
  };

  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      clearInterval(timerRef.current);
      if (!isProcessing) setElapsed(0);
    }
    return () => clearInterval(timerRef.current);
  }, [isRecording]);

  const formatTime = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  // ── Recording ──────────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      if (recordingRef.current) {
        try { await recordingRef.current.stopAndUnloadAsync(); } catch (_) {}
        recordingRef.current = null;
      }
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== "granted") { Alert.alert("Permission needed", "Microphone access is required."); return; }
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      recordingRef.current = recording;
      setIsRecording(true);
      setElapsed(0);
    } catch (e) {
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;
      setIsRecording(false);
      setIsProcessing(true);
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      await Audio.setAudioModeAsync({ allowsRecordingIOS: false });
      await transcribeWithGroq(uri);
    } catch (e) {
      Alert.alert("Error", "Could not stop recording.");
      setIsProcessing(false);
    }
  };

  const handleMicPress = () => {
    if (isProcessing) return;
    if (isRecording) stopRecording();
    else startRecording();
  };

  // ── Groq Whisper ───────────────────────────────────────────────────────────
  const transcribeWithGroq = async (uri) => {
    try {
      const formData = new FormData();
      formData.append("file", { uri, name: "recording.m4a", type: "audio/m4a" });
      formData.append("model", "whisper-large-v3-turbo");
      formData.append("response_format", "text");

      const response = await fetch(GROQ_WHISPER_URL, {
        method: "POST",
        headers: { Authorization: `Bearer ${GROQ_API_KEY}` },
        body: formData,
      });

      if (!response.ok) throw new Error(`Groq error: ${response.status}`);

      const transcript = (await response.text()).trim();
      if (!transcript) { Alert.alert("No speech detected", "Try speaking closer to the mic."); setIsProcessing(false); return; }

      const title = "Transcript · " + new Date().toLocaleTimeString();
      const entry = { id: Date.now().toString(), title, text: transcript, createdAt: new Date().toISOString() };
      const updated = await addTranscriptionToHistory(entry);
      if (updated) setHistory(updated);
      setActiveItem(entry);
      setIsProcessing(false);
    } catch (e) {
      console.error("Groq transcription error:", e);
      Alert.alert("Transcription failed", "Check your Groq API key and connection.");
      setIsProcessing(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDeleteOne = (id, title) => {
    Alert.alert("Delete Transcription", `Delete "${title}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const updated = await deleteTranscriptionFromHistory(id);
          if (updated !== null) { setHistory(updated); if (activeItem?.id === id) setActiveItem(null); }
        },
      },
    ]);
  };

  const handleClearAll = () => {
    if (history.length === 0) return;
    Alert.alert("Clear All", "Delete all transcriptions? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear All", style: "destructive",
        onPress: async () => {
          const updated = await clearTranscriptionHistory();
          if (updated !== null) { setHistory(updated); setActiveItem(null); }
        },
      },
    ]);
  };

  // ── Export PDF ─────────────────────────────────────────────────────────────
  const exportAsPDF = async (item) => {
    try {
      const html = `<html><head><meta charset="utf-8"/>
        <style>body{font-family:Arial,sans-serif;padding:40px;color:#111;line-height:1.7;}
        h1{font-size:22px;color:#333;border-bottom:2px solid #7C3AED;padding-bottom:10px;}
        .meta{font-size:12px;color:#888;margin-top:6px;}
        p{font-size:15px;margin-top:20px;white-space:pre-wrap;}</style></head>
        <body><h1>${item.title}</h1>
        <div class="meta">Shepard Learn · ${new Date().toLocaleString()}</div>
        <p>${item.text}</p></body></html>`;
      const { uri } = await Print.printToFileAsync({ html });
      await Sharing.shareAsync(uri, { mimeType: "application/pdf", dialogTitle: "Save your transcript PDF" });
    } catch (e) { Alert.alert("Export failed", "Could not generate PDF."); }
  };

  // ── Export Word ────────────────────────────────────────────────────────────
  const exportAsDOCX = async (item) => {
    try {
      const wordHtml = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
        <head><meta charset="utf-8"/><title>${item.title}</title></head>
        <body style="font-family:Calibri,sans-serif;font-size:12pt;line-height:1.6;padding:40px;">
        <h1 style="font-size:18pt;color:#333;">${item.title}</h1>
        <p style="font-size:10pt;color:#888;">Shepard Learn · ${new Date().toLocaleString()}</p>
        <hr/><p style="white-space:pre-wrap;font-size:12pt;">${item.text}</p>
        </body></html>`;
      const fileUri = `${FileSystem.documentDirectory}transcript_${Date.now()}.doc`;
      await FileSystem.writeAsStringAsync(fileUri, wordHtml, { encoding: FileSystem.EncodingType.UTF8 });
      await Sharing.shareAsync(fileUri, { mimeType: "application/msword", dialogTitle: "Save your transcript Word doc" });
    } catch (e) { Alert.alert("Export failed", "Could not generate Word document."); }
  };

  // ── Open AI Tutor ──────────────────────────────────────────────────────────
  const openAITutor = (item) => {
    navigation.navigate("AITutor", { transcriptionText: item.text, transcriptionTitle: item.title });
  };

  // ── Save to Notes ──────────────────────────────────────────────────────────
  const saveToNotes = (item) => {
    const note = createNote(item.title, item.text);
    navigation.navigate("NoteEditor", { note, isNew: true });
  };

  // ── Open Quiz ──────────────────────────────────────────────────────────────
  const openQuiz = (item) => {
    navigation.navigate("Quiz", { text: item.text, title: item.title });
  };

  // ── Open Flashcards ────────────────────────────────────────────────────────
  const openFlashcards = (item) => {
    navigation.navigate("Flashcards", { text: item.text, title: item.title });
  };

  const micLabel = isProcessing ? "Processing..." : isRecording ? `Recording  ${formatTime(elapsed)}` : "Tap to record";

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="arrow-back" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={[s.topBarTitle, { color: C.text }]}>TRANSCRIPTION</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Entypo name="cog" size={30} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* ── Mic Card ─────────────────────────────────────────────────────── */}
      <View style={[s.micCard, { backgroundColor: C.card }]}>
        <View style={s.micWrap}>
          {isRecording && (
            <View style={StyleSheet.absoluteFill} pointerEvents="none">
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                <PulseRing color={C.primary} />
              </View>
            </View>
          )}
          {isProcessing ? (
            <Animated.View style={[s.micBtn, { backgroundColor: C.primary }, spinStyle]}>
              <ActivityIndicator color={C.primaryText} size="large" />
            </Animated.View>
          ) : (
            <TouchableOpacity
              style={[s.micBtn, { backgroundColor: isRecording ? C.danger : C.primary }]}
              onPress={handleMicPress}
              activeOpacity={0.85}
            >
              <FontAwesome5 name={isRecording ? "stop" : "microphone"} size={38} color={C.primaryText} />
            </TouchableOpacity>
          )}
        </View>
        <Text style={[s.micLabel, { color: C.muted }]}>{micLabel}</Text>
      </View>

      {/* ── Section header ───────────────────────────────────────────────── */}
      <View style={s.sectionRow}>
        <Text style={[s.sectionTitle, { color: C.text }]}>Recent Transcriptions</Text>
        {history.length > 0 && (
          <TouchableOpacity onPress={handleClearAll} style={s.clearAllBtn}>
            <MaterialIcons name="delete-sweep" size={18} color={C.danger} />
            <Text style={[s.clearAllTxt, { color: C.danger }]}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* ── Transcription List ────────────────────────────────────────────── */}
      <ScrollView style={s.list} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
        {history.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: C.card }]}>
            <FontAwesome5 name="file-alt" size={40} color={C.muted} />
            <Text style={[s.emptyTxt, { color: C.muted }]}>No transcriptions yet</Text>
          </View>
        ) : (
          history.map((item) => {
            const isActive = activeItem?.id === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                style={[s.transcriptCard, {
                  backgroundColor: C.card,
                  borderColor: isActive ? C.primary : "transparent",
                  borderWidth: isActive ? 1.5 : 0,
                }]}
                onPress={() => setActiveItem(isActive ? null : item)}
                activeOpacity={0.8}
              >
                <View style={s.cardTopRow}>
                  <View style={[s.cardDot, { backgroundColor: C.primary }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.cardTitle, { color: C.text }]}>{item.title}</Text>
                    <Text numberOfLines={isActive ? undefined : 2} style={[s.cardPreview, { color: C.muted }]}>
                      {item.text}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleDeleteOne(item.id, item.title)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <MaterialIcons name="delete-outline" size={20} color={C.danger} />
                  </TouchableOpacity>
                </View>

                {/* ── Expanded action buttons ─────────────────────────── */}
                {isActive && (
                  <View style={[s.actionRow, { borderTopColor: C.input }]}>

                    {/* PDF */}
                    <TouchableOpacity
                      style={[s.actionBtn, { backgroundColor: `${C.danger}18`, borderColor: `${C.danger}40` }]}
                      onPress={() => exportAsPDF(item)}
                    >
                      <MaterialIcons name="picture-as-pdf" size={14} color={C.danger} />
                      <Text style={[s.actionTxt, { color: C.danger }]}>PDF</Text>
                    </TouchableOpacity>

                    {/* Word */}
                    <TouchableOpacity
                      style={[s.actionBtn, { backgroundColor: `${C.primary}18`, borderColor: `${C.primary}40` }]}
                      onPress={() => exportAsDOCX(item)}
                    >
                      <MaterialIcons name="description" size={14} color={C.primary} />
                      <Text style={[s.actionTxt, { color: C.primary }]}>Word</Text>
                    </TouchableOpacity>

                    {/* AI Tutor */}
                    <TouchableOpacity
                      style={[s.actionBtn, { backgroundColor: `${C.primary}25`, borderColor: C.primary }]}
                      onPress={() => openAITutor(item)}
                    >
                      <MaterialIcons name="psychology" size={14} color={C.primary} />
                      <Text style={[s.actionTxt, { color: C.primary, fontWeight: "700" }]}>Tutor</Text>
                    </TouchableOpacity>

                    {/* Notes */}
                    <TouchableOpacity
                      style={[s.actionBtn, { backgroundColor: `${C.primary}18`, borderColor: `${C.primary}40` }]}
                      onPress={() => saveToNotes(item)}
                    >
                      <MaterialIcons name="note-add" size={14} color={C.primary} />
                      <Text style={[s.actionTxt, { color: C.primary }]}>Notes</Text>
                    </TouchableOpacity>

                    {/* Read aloud */}
                    <TouchableOpacity
                      style={[s.actionBtn, { backgroundColor: `${C.primary}18`, borderColor: `${C.primary}40` }]}
                      onPress={() => { Speech.stop(); Speech.speak(item.text); }}
                    >
                      <Feather name="volume-2" size={14} color={C.primary} />
                      <Text style={[s.actionTxt, { color: C.primary }]}>Read</Text>
                    </TouchableOpacity>

                  </View>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    width: "90%", flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: "15%", marginBottom: 24, alignSelf: "center",
  },
  topBarTitle: { fontWeight: "bold", fontSize: 18 },
  micCard: {
    marginHorizontal: 16, borderRadius: 20,
    paddingVertical: 32, paddingHorizontal: 20,
    alignItems: "center", marginBottom: 28,
  },
  micWrap: { width: 110, height: 110, alignItems: "center", justifyContent: "center", marginBottom: 16 },
  micBtn: {
    width: 110, height: 110, borderRadius: 55,
    justifyContent: "center", alignItems: "center",
    shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 6 }, elevation: 10,
  },
  micLabel: { fontSize: 14, fontWeight: "500" },
  sectionRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 22, marginBottom: 12,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold" },
  clearAllBtn:  { flexDirection: "row", alignItems: "center", gap: 4 },
  clearAllTxt:  { fontSize: 13, fontWeight: "600" },
  list: { flex: 1, paddingHorizontal: 16 },
  emptyCard: { borderRadius: 20, paddingVertical: 60, alignItems: "center", gap: 14 },
  emptyTxt: { fontSize: 15 },
  transcriptCard: { borderRadius: 16, padding: 16, marginBottom: 10, overflow: "hidden" },
  cardTopRow: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  cardDot:    { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  cardTitle:   { fontSize: 13, fontWeight: "700", marginBottom: 4 },
  cardPreview: { fontSize: 13, lineHeight: 19 },
  actionRow: {
    flexDirection: "row", gap: 8,
    marginTop: 14, paddingTop: 12,
    borderTopWidth: 1, flexWrap: "wrap",
  },
  actionBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    paddingHorizontal: 10, paddingVertical: 7,
    borderRadius: 10, borderWidth: 1,
  },
  actionTxt: { fontSize: 12, fontWeight: "600" },
});