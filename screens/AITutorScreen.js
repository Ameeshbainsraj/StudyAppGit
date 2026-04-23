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
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

const GROQ_API_KEY = "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"; // 🔑 paste your gsk_... key here
const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export default function AITutorScreen({ navigation, route }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets(); // ← reactive to any phone nav bar height
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
      content: `Hi! I've read your lecture: "${transcriptionTitle}". Ask me anything about it — I can explain concepts, quiz you, summarise it, or enhance your notes.`,
    },
  ]);
  const [input, setInput]     = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 150);
  }, [messages, loading]);

  // ── Send message ───────────────────────────────────────────────────────────
  const sendMessage = async (userMessage) => {
    const msg = userMessage.trim();
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
            content: `You are a helpful AI study tutor. The student has provided the following lecture transcription:

---
${transcriptionText ? transcriptionText : "No transcription was provided."}
---

Your rules:
- Answer questions based on the lecture content above
- If asked to summarise, give clear bullet points
- If asked for quiz questions, generate them from the lecture
- If asked to explain a concept, use simple language and examples
- If the topic is not in the lecture, say so and answer from general knowledge
- Keep answers clear and concise`,
          },
          ...updatedMessages.slice(-8).map((m) => ({
            role: m.role,
            content: m.content,
          })),
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
        console.error("Groq chat error status:", response.status);
        console.error("Groq chat error body:", rawText);
        let errorMsg = "Something went wrong. Please try again.";
        if (response.status === 401) errorMsg = "Invalid API key. Check your GROQ_API_KEY.";
        if (response.status === 429) errorMsg = "Rate limit hit. Wait a moment and try again.";
        if (response.status === 400) errorMsg = "Bad request — the message may be too long.";
        setMessages((prev) => [...prev, { role: "assistant", content: `⚠️ Error ${response.status}: ${errorMsg}` }]);
        return;
      }

      const data = JSON.parse(rawText);
      const reply = data?.choices?.[0]?.message?.content?.trim();

      if (!reply) {
        setMessages((prev) => [...prev, { role: "assistant", content: "I didn't get a response. Please try again." }]);
        return;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: reply }]);

    } catch (err) {
      console.error("AI Tutor fetch error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Network error: ${err.message}. Check your internet connection.` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Quick actions ──────────────────────────────────────────────────────────
  const quickActions = [
    { label: "📝 Summarise",     prompt: "Summarise the key points from this lecture in bullet points" },
    { label: "❓ Quiz me",        prompt: "Give me 5 quiz questions based on this lecture" },
    { label: "🔑 Key terms",     prompt: "What are the most important terms or concepts from this lecture?" },
    { label: "✨ Enhance notes", prompt: "Rewrite these lecture notes as structured, detailed study notes with headings and key points" },
  ];

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <SafeAreaView style={[s.safeArea, { backgroundColor: C.bg }]} edges={["top"]}>
      <KeyboardAvoidingView
        style={s.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >

        {/* ── Top Bar ────────────────────────────────────────────────────── */}
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={C.text} />
          </TouchableOpacity>
          <View style={s.titleWrap}>
            <MaterialIcons name="psychology" size={20} color={C.primary} />
            <Text style={[s.titleText, { color: C.text }]}>AI TUTOR</Text>
          </View>
          <View style={{ width: 28 }} />
        </View>

        {/* ── Context pill ───────────────────────────────────────────────── */}
        <View style={[s.contextPill, { backgroundColor: C.card }]}>
          <MaterialIcons name="description" size={14} color={C.primary} />
          <Text style={[s.contextText, { color: C.muted }]} numberOfLines={1}>
            {transcriptionText
              ? `Context: ${transcriptionTitle}`
              : "⚠️ No transcript loaded — open from Transcription screen"}
          </Text>
        </View>

        {/* ── Quick action chips ──────────────────────────────────────────── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={s.quickRow}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
        >
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[s.quickBtn, { backgroundColor: C.card, borderColor: C.primary + "50" }]}
              onPress={() => sendMessage(action.prompt)}
              disabled={loading}
            >
              <Text style={[s.quickBtnTxt, { color: C.primary }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── Message list ───────────────────────────────────────────────── */}
        <ScrollView
          ref={scrollRef}
          style={s.messageList}
          contentContainerStyle={{ padding: 16, gap: 10, paddingBottom: 24 }}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg, i) => {
            const isUser = msg.role === "user";
            return (
              <View
                key={i}
                style={[
                  s.bubble,
                  isUser
                    ? [s.userBubble, { backgroundColor: C.primary }]
                    : [s.aiBubble, { backgroundColor: C.card }],
                ]}
              >
                {!isUser && (
                  <View style={[s.aiAvatar, { backgroundColor: C.primary }]}>
                    <Text style={{ color: C.primaryText, fontSize: 10, fontWeight: "bold" }}>AI</Text>
                  </View>
                )}
                <View style={s.bubbleContent}>
                  <Text style={[s.bubbleText, { color: isUser ? C.primaryText : C.text }]}>
                    {msg.content}
                  </Text>
                </View>
              </View>
            );
          })}

          {loading && (
            <View style={[s.bubble, s.aiBubble, { backgroundColor: C.card }]}>
              <View style={[s.aiAvatar, { backgroundColor: C.primary }]}>
                <Text style={{ color: C.primaryText, fontSize: 10, fontWeight: "bold" }}>AI</Text>
              </View>
              <View style={s.typingDots}>
                <ActivityIndicator color={C.primary} size="small" />
                <Text style={[s.typingText, { color: C.muted }]}>Thinking...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* ── Input bar — dynamically clears phone nav buttons ───────────── */}
        <View
          style={[
            s.inputBar,
            {
              backgroundColor: C.card,
              borderTopColor: C.input,
              // Math.max ensures minimum padding even on devices with no nav bar
              paddingBottom: Math.max(insets.bottom + 8, 16),
            },
          ]}
        >
          <TextInput
            style={[s.textInput, { color: C.text, backgroundColor: C.bg }]}
            placeholder="Ask anything about your lecture..."
            placeholderTextColor={C.muted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              s.sendBtn,
              { backgroundColor: input.trim() && !loading ? C.primary : C.input },
            ]}
            onPress={() => sendMessage(input)}
            disabled={!input.trim() || loading}
          >
            <Ionicons name="send" size={18} color={C.primaryText} />
          </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safeArea: { flex: 1 },
  flex:     { flex: 1 },

  topBar: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 16,
    marginBottom: 10,
    alignSelf: "center",
  },
  titleWrap: { flexDirection: "row", alignItems: "center", gap: 8 },
  titleText: { fontWeight: "700", fontSize: 16, letterSpacing: 2 },

  contextPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginHorizontal: 16,
    marginBottom: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  contextText: { fontSize: 12, flex: 1 },

  quickRow: { maxHeight: 46, marginBottom: 4 },
  quickBtn: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 20, borderWidth: 1,
  },
  quickBtnTxt: { fontSize: 12, fontWeight: "600" },

  messageList: { flex: 1 },

  bubble: {
    flexDirection: "row",
    alignItems: "flex-start",
    maxWidth: "85%",
    marginBottom: 8,
  },
  userBubble: {
    alignSelf: "flex-end",
    borderRadius: 18, borderBottomRightRadius: 4,
    padding: 12,
  },
  aiBubble: {
    alignSelf: "flex-start",
    borderRadius: 18, borderBottomLeftRadius: 4,
    padding: 12,
  },
  aiAvatar: {
    width: 26, height: 26, borderRadius: 13,
    justifyContent: "center", alignItems: "center",
    marginRight: 8, marginTop: 2,
  },
  bubbleContent: { flex: 1 },
  bubbleText:    { fontSize: 14, lineHeight: 21 },
  typingDots:    { flexDirection: "row", alignItems: "center", gap: 8 },
  typingText:    { fontSize: 13 },

  inputBar: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
    borderTopWidth: 1,
    // paddingBottom is set dynamically using insets.bottom in the JSX
  },
  textInput: {
    flex: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendBtn: {
    width: 44, height: 44, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
    marginBottom: 2,
  },
});