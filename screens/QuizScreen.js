// screens/QuizScreen.js
import React, { useState } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Alert,
} from "react-native";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { awardXP, XP_REWARDS } from "../xpConfig";

//const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_KEY;
const GROQ_API_KEY = "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";          //<<==== insert fresh groq key here
const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL = "llama-3.3-70b-versatile";

export default function QuizScreen({ navigation, route }) {
  const { theme } = useTheme();
  const sourceText  = route.params?.text  || "";
  const sourceTitle = route.params?.title || "Quiz";

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

  const [phase, setPhase]         = useState("generate"); // "generate"|"quiz"|"result"
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers]     = useState({});         // { questionIndex: choiceIndex }
  const [generating, setGenerating] = useState(false);
  const [currentQ, setCurrentQ]   = useState(0);

  // ── Generate quiz ──────────────────────────────────────────────────────────
  const generateQuiz = async () => {
    if (!sourceText.trim()) {
      Alert.alert("No content", "Open from a Note or Transcription to generate a quiz.");
      return;
    }
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
          temperature: 0.6,
          messages: [
            {
              role: "system",
              content: `You are a quiz generator. Generate exactly 5 multiple choice questions from the content given.
Return ONLY a valid JSON array with no extra text:
[
  {
    "question": "Question text here?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correct": 0
  }
]
"correct" is the 0-based index of the correct option. Make questions varied and challenging but fair.`,
            },
            {
              role: "user",
              content: `Generate a quiz from this content:\n\n${sourceText}`,
            },
          ],
        }),
      });

      const rawText = await response.text();
      if (!response.ok) {
        Alert.alert("Error", `Could not generate quiz. Status: ${response.status}`);
        return;
      }

      const data = JSON.parse(rawText);
      const content = data?.choices?.[0]?.message?.content?.trim();
      const jsonMatch = content.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        Alert.alert("Error", "Could not parse quiz questions. Try again.");
        return;
      }

      const parsed = JSON.parse(jsonMatch[0]);
      setQuestions(parsed);
      setAnswers({});
      setCurrentQ(0);
      setPhase("quiz");
    } catch (err) {
      console.error("generateQuiz error:", err);
      Alert.alert("Error", "Could not generate quiz. Check your connection.");
    } finally {
      setGenerating(false);
    }
  };

  const selectAnswer = (questionIndex, choiceIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: choiceIndex }));
  };

  const submitQuiz = async () => {
    if (Object.keys(answers).length < questions.length) {
      Alert.alert("Not done", "Please answer all questions before submitting.");
      return;
    }

    // Award XP for completing the quiz
    const { leveledUp, newLevel } = await awardXP(XP_REWARDS.QUIZ_COMPLETED);
    if (leveledUp && newLevel) {
      Alert.alert(
        "🎉 Level Up!",
        `You reached Level ${newLevel.level}\n"${newLevel.title}"\n\nYour knowledge is growing!`,
        [{ text: "Let's Go! 🚀", style: "default" }]
      );
    }

    setPhase("result");
  };

  // ── Score calculation ──────────────────────────────────────────────────────
  const score = questions.filter((q, i) => answers[i] === q.correct).length;

  // ── Generate phase ─────────────────────────────────────────────────────────
  if (phase === "generate") {
    return (
      <View style={[s.container, { backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={C.text} />
          </TouchableOpacity>
          <Text style={[s.topBarTitle, { color: C.text }]}>QUIZ</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={s.generateWrap}>
          <Text style={{ fontSize: 60 }}>📊</Text>
          <Text style={[s.generateTitle, { color: C.text }]}>Ready to test yourself?</Text>
          <Text style={[s.generateSub, { color: C.muted }]}>
            {sourceText
              ? `AI will generate 5 questions from:\n"${sourceTitle}"`
              : "Open from a Note or Transcription to generate a quiz"}
          </Text>

          {sourceText ? (
            <TouchableOpacity
              style={[s.generateBtn, { backgroundColor: C.primary }]}
              onPress={generateQuiz}
              disabled={generating}
            >
              {generating ? (
                <ActivityIndicator color={C.primaryText} />
              ) : (
                <>
                  <MaterialIcons name="auto-awesome" size={18} color={C.primaryText} />
                  <Text style={[s.generateBtnTxt, { color: C.primaryText }]}>Generate Quiz</Text>
                </>
              )}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[s.generateBtn, { backgroundColor: C.card }]}
              onPress={() => navigation.goBack()}
            >
              <Text style={[s.generateBtnTxt, { color: C.muted }]}>Go Back</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  }

  // ── Quiz phase ─────────────────────────────────────────────────────────────
  if (phase === "quiz") {
    const q = questions[currentQ];
    const answered = answers[currentQ] !== undefined;

    return (
      <View style={[s.container, { backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => setPhase("generate")}>
            <Ionicons name="arrow-back" size={28} color={C.text} />
          </TouchableOpacity>
          <Text style={[s.topBarTitle, { color: C.text }]}>
            {currentQ + 1} / {questions.length}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Progress bar */}
        <View style={[s.progressBar, { backgroundColor: C.card, marginHorizontal: 20, marginBottom: 20 }]}>
          <View style={[s.progressFill, { backgroundColor: C.primary, width: `${((currentQ + 1) / questions.length) * 100}%` }]} />
        </View>

        <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
          {/* Question */}
          <View style={[s.questionCard, { backgroundColor: C.card }]}>
            <Text style={[s.questionTxt, { color: C.text }]}>{q.question}</Text>
          </View>

          {/* Options */}
          {q.options.map((option, i) => {
            const isSelected = answers[currentQ] === i;
            return (
              <TouchableOpacity
                key={i}
                style={[
                  s.optionBtn,
                  {
                    backgroundColor: isSelected ? C.primary : C.card,
                    borderColor: isSelected ? C.primary : C.input,
                  },
                ]}
                onPress={() => selectAnswer(currentQ, i)}
              >
                <View style={[s.optionLetter, { backgroundColor: isSelected ? C.primaryText + "30" : C.input }]}>
                  <Text style={[s.optionLetterTxt, { color: isSelected ? C.primaryText : C.muted }]}>
                    {["A", "B", "C", "D"][i]}
                  </Text>
                </View>
                <Text style={[s.optionTxt, { color: isSelected ? C.primaryText : C.text }]}>
                  {option}
                </Text>
              </TouchableOpacity>
            );
          })}

          {/* Navigation */}
          <View style={s.navRow}>
            {currentQ > 0 && (
              <TouchableOpacity
                style={[s.navBtn, { borderColor: C.muted }]}
                onPress={() => setCurrentQ((q) => q - 1)}
              >
                <Text style={[s.navBtnTxt, { color: C.muted }]}>← Previous</Text>
              </TouchableOpacity>
            )}
            {currentQ < questions.length - 1 ? (
              <TouchableOpacity
                style={[s.navBtn, { backgroundColor: C.primary, borderColor: C.primary, marginLeft: "auto" }]}
                onPress={() => setCurrentQ((q) => q + 1)}
              >
                <Text style={[s.navBtnTxt, { color: C.primaryText }]}>Next →</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                style={[s.navBtn, { backgroundColor: C.primary, borderColor: C.primary, marginLeft: "auto" }]}
                onPress={submitQuiz}
              >
                <Text style={[s.navBtnTxt, { color: C.primaryText }]}>Submit ✓</Text>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </View>
    );
  }

  // ── Result phase ───────────────────────────────────────────────────────────
  const pct = Math.round((score / questions.length) * 100);
  const emoji = pct >= 80 ? "🏆" : pct >= 60 ? "👍" : "📚";
  const message = pct >= 80 ? "Excellent work!" : pct >= 60 ? "Good effort!" : "Keep studying!";

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={[s.topBarTitle, { color: C.text }]}>RESULTS</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100 }}>
        {/* Score card */}
        <View style={[s.scoreCard, { backgroundColor: C.card }]}>
          <Text style={{ fontSize: 50 }}>{emoji}</Text>
          <Text style={[s.scorePct, { color: C.primary }]}>{pct}%</Text>
          <Text style={[s.scoreMsg, { color: C.text }]}>{message}</Text>
          <Text style={[s.scoreSub, { color: C.muted }]}>
            {score} out of {questions.length} correct
          </Text>
        </View>

        {/* Review answers */}
        <Text style={[s.reviewTitle, { color: C.text }]}>Review Answers</Text>
        {questions.map((q, i) => {
          const isCorrect = answers[i] === q.correct;
          return (
            <View key={i} style={[s.reviewCard, { backgroundColor: C.card, borderLeftColor: isCorrect ? "#10B981" : C.danger }]}>
              <Text style={[s.reviewQ, { color: C.text }]}>{i + 1}. {q.question}</Text>
              <Text style={[s.reviewYour, { color: isCorrect ? "#10B981" : C.danger }]}>
                {isCorrect ? "✓" : "✗"} Your answer: {q.options[answers[i]]}
              </Text>
              {!isCorrect && (
                <Text style={[s.reviewCorrect, { color: "#10B981" }]}>
                  ✓ Correct: {q.options[q.correct]}
                </Text>
              )}
            </View>
          );
        })}

        {/* Retry */}
        <TouchableOpacity
          style={[s.retryBtn, { backgroundColor: C.primary }]}
          onPress={() => { setAnswers({}); setCurrentQ(0); setPhase("quiz"); }}
        >
          <Ionicons name="refresh" size={18} color={C.primaryText} />
          <Text style={[s.retryTxt, { color: C.primaryText }]}>Try Again</Text>
        </TouchableOpacity>
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

  // Generate phase
  generateWrap:   { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, gap: 16 },
  generateTitle:  { fontSize: 22, fontWeight: "bold", textAlign: "center" },
  generateSub:    { fontSize: 14, textAlign: "center", lineHeight: 20 },
  generateBtn:    { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16, marginTop: 8 },
  generateBtnTxt: { fontSize: 16, fontWeight: "700" },

  // Quiz phase
  progressBar:  { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  questionCard: { borderRadius: 18, padding: 20, marginBottom: 20 },
  questionTxt:  { fontSize: 17, fontWeight: "600", lineHeight: 26 },
  optionBtn: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 14, padding: 16, marginBottom: 10, borderWidth: 1.5,
  },
  optionLetter:    { width: 32, height: 32, borderRadius: 16, justifyContent: "center", alignItems: "center" },
  optionLetterTxt: { fontSize: 14, fontWeight: "700" },
  optionTxt:       { flex: 1, fontSize: 15, lineHeight: 20 },
  navRow: { flexDirection: "row", marginTop: 16, gap: 10 },
  navBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 14, borderWidth: 1.5 },
  navBtnTxt: { fontSize: 14, fontWeight: "700" },

  // Result phase
  scoreCard:   { borderRadius: 20, padding: 30, alignItems: "center", gap: 8, marginBottom: 24 },
  scorePct:    { fontSize: 52, fontWeight: "bold" },
  scoreMsg:    { fontSize: 20, fontWeight: "700" },
  scoreSub:    { fontSize: 14 },
  reviewTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  reviewCard:  { borderRadius: 14, padding: 16, marginBottom: 10, borderLeftWidth: 4 },
  reviewQ:     { fontSize: 14, fontWeight: "600", marginBottom: 8, lineHeight: 20 },
  reviewYour:  { fontSize: 13, fontWeight: "600", marginBottom: 4 },
  reviewCorrect: { fontSize: 13, fontWeight: "600" },
  retryBtn:    { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 16, marginTop: 16 },
  retryTxt:    { fontSize: 16, fontWeight: "700" },
});