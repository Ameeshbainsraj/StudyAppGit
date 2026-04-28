// screens/AITutorScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Alert,
  Linking,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { Audio } from "expo-av";
import { useTheme } from "../ThemeContext";

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_KEY;

const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_WHISPER_URL = "https://api.groq.com/openai/v1/audio/transcriptions";
const MODEL = "llama-3.3-70b-versatile";

// ── Branding ────────────────────────────────────────────────────────────────
const AI_NAME = "Shepard Learn AI";

export default function AITutorScreen({ navigation, route }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();
  const { transcriptionText = "", transcriptionTitle = "Lecture" } = route.params || {};

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

  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: `Hi! I'm ${AI_NAME}. I've read your lecture: "${transcriptionTitle}". Ask me anything — type or tap the mic to speak.`,
    },
  ]);
  const [input, setInput]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [recording, setRecording]     = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);

  const scrollRef    = useRef(null);
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const pulseOpacity = useRef(new Animated.Value(0)).current;
  const inputRef     = useRef(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  }, [messages, loading]);

  // Pulse animation when recording
  useEffect(() => {
    if (isRecording) {
      pulseOpacity.setValue(1);
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.6, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,   duration: 700, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
      Animated.timing(pulseOpacity, { toValue: 0, duration: 200, useNativeDriver: true }).start();
    }
  }, [isRecording]);

  // ── Voice recording ────────────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const { status, canAskAgain } = await Audio.requestPermissionsAsync();

      if (status === "granted") {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
        });
        const { recording: rec } = await Audio.Recording.createAsync(
          Audio.RecordingOptionsPresets.HIGH_QUALITY
        );
        setRecording(rec);
        setIsRecording(true);

      } else if (!canAskAgain) {
        // Permission permanently denied — open device Settings
        Alert.alert(
          "Microphone Access Required",
          `${AI_NAME} needs microphone access to record your voice. Please enable it in your device Settings.`,
          [
            { text: "Cancel", style: "cancel" },
            { text: "Open Settings", onPress: () => Linking.openSettings() },
          ]
        );

      } else {
        // Denied but can still ask again
        Alert.alert(
          "Microphone Permission Denied",
          "Microphone access is needed to record your voice. Please allow it when prompted.",
          [{ text: "OK" }]
        );
      }
    } catch (err) {
      console.error("Start recording error:", err);
    }
  };

  const stopRecording = async () => {
    if (!recording) return;
    try {
      setIsRecording(false);
      setTranscribing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      // Send to Groq Whisper
      const formData = new FormData();
      formData.append("file", { uri, type: "audio/m4a", name: "voice.m4a" });
      formData.append("model", "whisper-large-v3");
      formData.append("language", "en");

      const res = await fetch(GROQ_WHISPER_URL, {
        method: "POST",
        headers: { "Authorization": `Bearer ${GROQ_API_KEY}` },
        body: formData,
      });

      const data = await res.json();
      const transcribed = data?.text?.trim();

      if (transcribed) {
        setInput(transcribed);
        // Auto-send after a brief moment so user sees what was heard
        setTimeout(() => sendMessage(transcribed), 400);
      } else {
        Alert.alert("Not Understood", "Couldn't understand the audio. Please try again.");
      }
    } catch (err) {
      console.error("Stop recording error:", err);
      Alert.alert("Transcription Failed", "Voice transcription failed. Please try again.");
    } finally {
      setTranscribing(false);
    }
  };

  const handleMicPress = () => {
    if (isRecording) stopRecording();
    else startRecording();
  };

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (userMessage) => {
    const msg = (userMessage ?? input).trim();
    if (!msg || loading) return;

    const updatedMessages = [...messages, { role: "user", content: msg }];
    setMessages(updatedMessages);
    setInput("");
    setLoading(true);

    try {
      const payload = {
        model: MODEL,
        max_tokens: 1024,
        temperature: 0.7,
        messages: [
          {
            role: "system",
            content: `You are ${AI_NAME}, a helpful AI study tutor. The student has provided the following lecture transcription:

---
${transcriptionText || "No transcription was provided."}
---

Your rules:
- Always refer to yourself as "${AI_NAME}" if asked who you are
- Answer questions based on the lecture content above
- If asked to summarise, give clear bullet points
- If asked for quiz questions, generate them from the lecture
- If asked to explain a concept, use simple language and examples
- If the topic is not in the lecture, say so and answer from general knowledge
- Keep answers clear and concise`,
          },
          ...updatedMessages.slice(-8).map((m) => ({ role: m.role, content: m.content })),
        ],
      };

      const response = await fetch(GROQ_CHAT_URL, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const rawText = await response.text();
      if (!response.ok) {
        let errorMsg = "Something went wrong.";
        if (response.status === 401) errorMsg = "Invalid API key.";
        if (response.status === 429) errorMsg = "Rate limit hit. Wait a moment.";
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ ${errorMsg}` }]);
        return;
      }

      const data = JSON.parse(rawText);
      const reply = data?.choices?.[0]?.message?.content?.trim();
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: reply || "No response. Try again." },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Network error: ${err.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    { label: "📝 Summarise",     prompt: "Summarise the key points from this lecture in bullet points" },
    { label: "❓ Quiz me",        prompt: "Give me 5 quiz questions based on this lecture" },
    { label: "🔑 Key terms",     prompt: "What are the most important terms or concepts from this lecture?" },
    { label: "✨ Enhance notes", prompt: "Rewrite these lecture notes as structured, detailed study notes with headings and key points" },
  ];

  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: C.bg }]} edges={["top"]}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >

        {/* ── Top Bar ── */}
        <View style={s.topBar}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={[s.iconBtn, { backgroundColor: C.card }]}
          >
            <Ionicons name="arrow-back" size={20} color={C.text} />
          </TouchableOpacity>

          <View style={s.titleBlock}>
            <View style={[s.titleIconWrap, { backgroundColor: C.primary + "22" }]}>
              <MaterialIcons name="psychology" size={18} color={C.primary} />
            </View>
            <View>
              <Text style={[s.titleText, { color: C.text }]}>{AI_NAME}</Text>
              <Text style={[s.titleSub, { color: C.muted }]} numberOfLines={1}>
                {transcriptionText ? transcriptionTitle : "No transcript"}
              </Text>
            </View>
          </View>

          <View style={[s.statusDot, { backgroundColor: loading ? "#F59E0B" : "#10B981" }]} />
        </View>

        {/* ── Quick actions ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.quickRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[s.quickBtn, { backgroundColor: C.card, borderColor: C.primary + "40" }]}
              onPress={() => sendMessage(action.prompt)}
              disabled={loading}
            >
              <Text style={[s.quickBtnTxt, { color: C.primary }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Messages ── */}
        <ScrollView
          ref={scrollRef}
          style={s.messageList}
          contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <View key={i} style={[s.msgRow, isUser && s.msgRowUser]}>
                {!isUser && (
                  <View style={[s.aiAvatar, { backgroundColor: C.primary }]}>
                    <MaterialIcons name="psychology" size={14} color={C.primaryText} />
                  </View>
                )}
                <View
                  style={[
                    s.bubble,
                    isUser
                      ? { backgroundColor: C.primary,   borderBottomRightRadius: 4 }
                      : { backgroundColor: C.card,      borderBottomLeftRadius: 4 },
                  ]}
                >
                  <Text style={[s.bubbleText, { color: isUser ? C.primaryText : C.text }]}>
                    {msg.content}
                  </Text>
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={s.msgRow}>
              <View style={[s.aiAvatar, { backgroundColor: C.primary }]}>
                <MaterialIcons name="psychology" size={14} color={C.primaryText} />
              </View>
              <View style={[s.bubble, { backgroundColor: C.card, borderBottomLeftRadius: 4 }]}>
                <View style={s.typingRow}>
                  <ActivityIndicator color={C.primary} size="small" />
                  <Text style={[s.typingText, { color: C.muted }]}>Thinking...</Text>
                </View>
              </View>
            </View>
          )}

          {transcribing && (
            <View style={s.msgRow}>
              <View style={[s.aiAvatar, { backgroundColor: C.primary + "66" }]}>
                <Ionicons name="mic" size={14} color={C.primaryText} />
              </View>
              <View style={[s.bubble, { backgroundColor: C.card, borderBottomLeftRadius: 4 }]}>
                <View style={s.typingRow}>
                  <ActivityIndicator color={C.primary} size="small" />
                  <Text style={[s.typingText, { color: C.muted }]}>Transcribing your voice...</Text>
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Input bar ── */}
        <View
          style={[
            s.inputBar,
            {
              backgroundColor: C.card,
              borderTopColor: C.input,
              paddingBottom: Math.max(insets.bottom + 8, 16),
            },
          ]}
        >
          {/* Mic button with pulse ring */}
          <View style={s.micWrap}>
            <Animated.View
              style={[
                s.micPulse,
                {
                  borderColor: C.primary,
                  opacity: pulseOpacity,
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            <TouchableOpacity
              style={[
                s.micBtn,
                {
                  backgroundColor: isRecording ? C.danger : C.primary + "22",
                  borderColor:     isRecording ? C.danger : C.primary,
                },
              ]}
              onPress={handleMicPress}
              disabled={transcribing || loading}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={20}
                color={isRecording ? "#fff" : C.primary}
              />
            </TouchableOpacity>
          </View>

          {/* Text input */}
          <TextInput
            ref={inputRef}
            style={[s.textInput, { color: C.text, backgroundColor: C.input }]}
            placeholder={isRecording ? "Listening..." : "Ask anything..."}
            placeholderTextColor={C.muted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
            editable={!isRecording}
          />

          {/* Send button */}
          <TouchableOpacity
            style={[
              s.sendBtn,
              { backgroundColor: input.trim() && !loading ? C.primary : C.input },
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Ionicons
              name="arrow-up"
              size={20}
              color={input.trim() && !loading ? C.primaryText : C.muted}
            />
          </TouchableOpacity>
        </View>

        {/* Recording status bar */}
        {isRecording && (
          <View
            style={[
              s.recordingBar,
              { backgroundColor: C.danger + "18", borderColor: C.danger + "40" },
            ]}
          >
            <Animated.View
              style={[s.recDot, { backgroundColor: C.danger, transform: [{ scale: pulseAnim }] }]}
            />
            <Text style={[s.recText, { color: C.danger }]}>Recording — tap stop when done</Text>
          </View>
        )}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1 },
  flex:     { flex: 1 },

  topBar: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 12,
    gap: 12,
  },
  iconBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  titleBlock: { flex: 1, flexDirection: "row", alignItems: "center", gap: 10 },
  titleIconWrap: {
    width: 36, height: 36, borderRadius: 10,
    justifyContent: "center", alignItems: "center",
  },
  titleText: { fontSize: 16, fontWeight: "800" },
  titleSub:  { fontSize: 11, marginTop: 1, maxWidth: 180 },
  statusDot: { width: 9, height: 9, borderRadius: 5 },

  quickRow: { maxHeight: 46, marginBottom: 4 },
  quickBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  quickBtnTxt: { fontSize: 12, fontWeight: "600" },

  messageList: { flex: 1 },

  msgRow:     { flexDirection: "row", alignItems: "flex-end", gap: 8, marginBottom: 4 },
  msgRowUser: { flexDirection: "row-reverse" },

  aiAvatar: {
    width: 28, height: 28, borderRadius: 14,
    justifyContent: "center", alignItems: "center",
    marginBottom: 2,
  },
  bubble: {
    maxWidth: "78%", borderRadius: 18,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  bubbleText: { fontSize: 14, lineHeight: 21 },
  typingRow:  { flexDirection: "row", alignItems: "center", gap: 8 },
  typingText: { fontSize: 13 },

  inputBar: {
    flexDirection: "row", alignItems: "flex-end",
    paddingHorizontal: 12, paddingTop: 10, gap: 8,
    borderTopWidth: 1,
  },

  micWrap: { justifyContent: "center", alignItems: "center", width: 46, height: 46 },
  micPulse: {
    position: "absolute", width: 46, height: 46,
    borderRadius: 23, borderWidth: 2,
  },
  micBtn: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: "center", alignItems: "center", borderWidth: 1.5,
  },

  textInput: {
    flex: 1, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, maxHeight: 100,
  },
  sendBtn: {
    width: 42, height: 42, borderRadius: 21,
    justifyContent: "center", alignItems: "center",
    marginBottom: 2,
  },

  recordingBar: {
    position: "absolute", bottom: 90, left: 16, right: 16,
    flexDirection: "row", alignItems: "center", gap: 8,
    borderRadius: 14, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10,
  },
  recDot:  { width: 8, height: 8, borderRadius: 4 },
  recText: { fontSize: 13, fontWeight: "600" },
});