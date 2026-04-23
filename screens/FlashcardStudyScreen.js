// screens/FlashcardStudyScreen.js
import React, { useState, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Animated, Dimensions,
} from "react-native";
import { Ionicons, MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

const { width } = Dimensions.get("window");

export default function FlashcardStudyScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { deck } = route.params;

  const C = {
    bg:      theme.colors.background,
    card:    theme.colors.card,
    primary: theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text:    theme.colors.text,
    muted:   theme.colors.mutedText,
    danger:  theme.colors.danger,
  };

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped]       = useState(false);
  const [known, setKnown]               = useState([]);
  const [unknown, setUnknown]           = useState([]);
  const [finished, setFinished]         = useState(false);

  const flipAnim = useRef(new Animated.Value(0)).current;
  const cards = deck.cards;
  const card  = cards[currentIndex];

  // ── Flip animation ─────────────────────────────────────────────────────────
  const flip = () => {
    Animated.spring(flipAnim, {
      toValue: isFlipped ? 0 : 1,
      friction: 8,
      tension: 10,
      useNativeDriver: true,
    }).start();
    setIsFlipped(!isFlipped);
  };

  const frontInterpolate = flipAnim.interpolate({
    inputRange: [0, 1], outputRange: ["0deg", "180deg"],
  });
  const backInterpolate = flipAnim.interpolate({
    inputRange: [0, 1], outputRange: ["180deg", "360deg"],
  });

  // ── Navigate cards ─────────────────────────────────────────────────────────
  const next = (markKnown) => {
    if (markKnown) {
      setKnown((k) => [...k, card.id]);
    } else {
      setUnknown((u) => [...u, card.id]);
    }

    // Reset flip
    flipAnim.setValue(0);
    setIsFlipped(false);

    if (currentIndex + 1 >= cards.length) {
      setFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setIsFlipped(false);
    setKnown([]);
    setUnknown([]);
    setFinished(false);
    flipAnim.setValue(0);
  };

  // ── Finished screen ────────────────────────────────────────────────────────
  if (finished) {
    return (
      <View style={[s.container, { backgroundColor: C.bg }]}>
        <View style={s.topBar}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={28} color={C.text} />
          </TouchableOpacity>
          <Text style={[s.topBarTitle, { color: C.text }]}>RESULTS</Text>
          <View style={{ width: 28 }} />
        </View>

        <View style={s.resultsWrap}>
          <Text style={{ fontSize: 60 }}>🎉</Text>
          <Text style={[s.resultsTitle, { color: C.text }]}>Deck Complete!</Text>

          <View style={[s.scoreRow]}>
            <View style={[s.scoreBox, { backgroundColor: "#10B98120" }]}>
              <Text style={[s.scoreNum, { color: "#10B981" }]}>{known.length}</Text>
              <Text style={[s.scoreLabel, { color: C.muted }]}>Known ✓</Text>
            </View>
            <View style={[s.scoreBox, { backgroundColor: `${C.danger}20` }]}>
              <Text style={[s.scoreNum, { color: C.danger }]}>{unknown.length}</Text>
              <Text style={[s.scoreLabel, { color: C.muted }]}>Review ✗</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[s.restartBtn, { backgroundColor: C.primary }]}
            onPress={restart}
          >
            <Ionicons name="refresh" size={18} color={C.primaryText} />
            <Text style={[s.restartTxt, { color: C.primaryText }]}>Study Again</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.backBtn, { borderColor: C.primary }]}
            onPress={() => navigation.goBack()}
          >
            <Text style={[s.backBtnTxt, { color: C.primary }]}>Back to Decks</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // ── Study screen ───────────────────────────────────────────────────────────
  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>

      {/* Top Bar */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={[s.topBarTitle, { color: C.text }]} numberOfLines={1}>
          {deck.title}
        </Text>
        <View style={{ width: 28 }} />
      </View>

      {/* Progress */}
      <View style={s.progressWrap}>
        <Text style={[s.progressTxt, { color: C.muted }]}>
          {currentIndex + 1} / {cards.length}
        </Text>
        <View style={[s.progressBar, { backgroundColor: C.card }]}>
          <View style={[s.progressFill, { backgroundColor: C.primary, width: `${((currentIndex + 1) / cards.length) * 100}%` }]} />
        </View>
      </View>

      {/* Tap to flip hint */}
      <Text style={[s.flipHint, { color: C.muted }]}>
        {isFlipped ? "Answer" : "Tap card to reveal answer"}
      </Text>

      {/* Flip Card */}
      <TouchableOpacity onPress={flip} activeOpacity={0.9} style={s.cardWrap}>
        {/* Front — Question */}
        <Animated.View
          style={[
            s.flashCard,
            { backgroundColor: C.primary, transform: [{ rotateY: frontInterpolate }] },
            isFlipped && s.hidden,
          ]}
        >
          <Text style={[s.cardLabel, { color: C.primaryText + "99" }]}>QUESTION</Text>
          <Text style={[s.cardText, { color: C.primaryText }]}>{card.question}</Text>
        </Animated.View>

        {/* Back — Answer */}
        <Animated.View
          style={[
            s.flashCard,
            s.cardBack,
            { backgroundColor: C.card, transform: [{ rotateY: backInterpolate }] },
            !isFlipped && s.hidden,
          ]}
        >
          <Text style={[s.cardLabel, { color: C.muted }]}>ANSWER</Text>
          <Text style={[s.cardText, { color: C.text }]}>{card.answer}</Text>
        </Animated.View>
      </TouchableOpacity>

      {/* Action buttons — only show after flip */}
      {isFlipped && (
        <View style={s.actionRow}>
          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: `${C.danger}20`, borderColor: C.danger }]}
            onPress={() => next(false)}
          >
            <MaterialIcons name="close" size={24} color={C.danger} />
            <Text style={[s.actionTxt, { color: C.danger }]}>Still Learning</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[s.actionBtn, { backgroundColor: "#10B98120", borderColor: "#10B981" }]}
            onPress={() => next(true)}
          >
            <MaterialIcons name="check" size={24} color="#10B981" />
            <Text style={[s.actionTxt, { color: "#10B981" }]}>Got It</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Skip button */}
      {!isFlipped && (
        <TouchableOpacity
          style={[s.skipBtn, { borderColor: C.muted }]}
          onPress={() => next(false)}
        >
          <Text style={[s.skipTxt, { color: C.muted }]}>Skip →</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    width: "90%", flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: "15%", marginBottom: 16, alignSelf: "center",
  },
  topBarTitle: { fontWeight: "bold", fontSize: 16, flex: 1, textAlign: "center" },
  progressWrap: { paddingHorizontal: 24, marginBottom: 8 },
  progressTxt:  { fontSize: 13, marginBottom: 6, textAlign: "center" },
  progressBar:  { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 3 },
  flipHint:     { textAlign: "center", fontSize: 13, marginBottom: 16 },
  cardWrap:     { alignItems: "center", marginHorizontal: 20 },
  flashCard: {
    width: width - 40, minHeight: 220,
    borderRadius: 24, padding: 30,
    justifyContent: "center", alignItems: "center",
    backfaceVisibility: "hidden",
    shadowOpacity: 0.15, shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },
  cardBack:  { position: "absolute", top: 0 },
  hidden:    { opacity: 0 },
  cardLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 2, marginBottom: 16 },
  cardText:  { fontSize: 18, fontWeight: "600", textAlign: "center", lineHeight: 26 },
  actionRow: {
    flexDirection: "row", gap: 14,
    paddingHorizontal: 24, marginTop: 28, justifyContent: "center",
  },
  actionBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, paddingVertical: 16, borderRadius: 16, borderWidth: 1.5,
  },
  actionTxt: { fontSize: 14, fontWeight: "700" },
  skipBtn:   { alignSelf: "center", marginTop: 20, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  skipTxt:   { fontSize: 14, fontWeight: "600" },

  // Results
  resultsWrap:  { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 30, gap: 16 },
  resultsTitle: { fontSize: 26, fontWeight: "bold" },
  scoreRow:     { flexDirection: "row", gap: 16, marginVertical: 8 },
  scoreBox:     { flex: 1, borderRadius: 16, padding: 20, alignItems: "center", gap: 6 },
  scoreNum:     { fontSize: 32, fontWeight: "bold" },
  scoreLabel:   { fontSize: 13, fontWeight: "600" },
  restartBtn:   { flexDirection: "row", alignItems: "center", gap: 8, paddingHorizontal: 32, paddingVertical: 14, borderRadius: 16 },
  restartTxt:   { fontSize: 16, fontWeight: "700" },
  backBtn:      { paddingHorizontal: 32, paddingVertical: 12, borderRadius: 16, borderWidth: 1.5 },
  backBtnTxt:   { fontSize: 15, fontWeight: "600" },
});