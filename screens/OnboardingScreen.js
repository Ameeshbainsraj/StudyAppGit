import React, { useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

const { width, height } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    icon: "mic-outline",
    title: "Transcribe\nAnything",
    description: "Record lectures and voice notes get instant AI-powered transcriptions in seconds.",
    accent: "✦",
  },
  {
    id: "2",
    icon: "albums-outline",
    title: "Study\nSmarter",
    description: "Auto-generate flashcards and quizzes from your notes using the power of AI.",
    accent: "◈",
  },
  {
    id: "3",
    icon: "timer-outline",
    title: "Stay\nFocused",
    description: "Use the Pomodoro timer to stay productive and plan your study sessions effortlessly.",
    accent: "◎",
  },
  {
    id: "4",
    icon: "star-outline",
    title: "Level\nUp",
    description: "Earn XP for every action transcriptions, quizzes, notes and rise through 20 levels.",
    accent: "★",
  },
];

function Slide({ item, C, isActive }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.88)).current;
  const slideAnim = useRef(new Animated.Value(24)).current;

  useEffect(() => {
    if (isActive) {
      Animated.parallel([
        Animated.timing(fadeAnim, { toValue: 1, duration: 420, useNativeDriver: true }),
        Animated.spring(scaleAnim, { toValue: 1, tension: 70, friction: 9, useNativeDriver: true }),
        Animated.timing(slideAnim, { toValue: 0, duration: 380, useNativeDriver: true }),
      ]).start();
    } else {
      fadeAnim.setValue(0);
      scaleAnim.setValue(0.88);
      slideAnim.setValue(24);
    }
  }, [isActive]);

  return (
    <View style={[styles.slide, { width }]}>
      {/* Icon card */}
      <Animated.View
        style={[
          styles.iconCard,
          {
            backgroundColor: C.card,
            borderColor: C.primary + "33",
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        {/* Decorative corner accent */}
        <Text style={[styles.accentText, { color: C.primary + "55" }]}>{item.accent}</Text>
        <View style={[styles.iconCircle, { backgroundColor: C.primary + "18" }]}>
          <Ionicons name={item.icon} size={52} color={C.primary} />
        </View>
      </Animated.View>

      {/* Text */}
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }],
          alignItems: "center",
        }}
      >
        <Text style={[styles.slideTitle, { color: C.text }]}>{item.title}</Text>
        <Text style={[styles.slideDesc, { color: C.muted }]}>{item.description}</Text>
      </Animated.View>
    </View>
  );
}

export default function OnboardingScreen({ navigation }) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const progressAnim = useRef(new Animated.Value(0)).current;

  const C = {
    bg: theme.colors.background,
    card: theme.colors.card,
    primary: theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text: theme.colors.text,
    muted: theme.colors.mutedText,
  };

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: (currentIndex + 1) / SLIDES.length,
      duration: 380,
      useNativeDriver: false,
    }).start();
  }, [currentIndex]);

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      const next = currentIndex + 1;
      flatListRef.current?.scrollToIndex({ index: next, animated: true });
      setCurrentIndex(next);
    } else {
      navigation.replace("Login");
    }
  };

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  const isLast = currentIndex === SLIDES.length - 1;

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>

      {/* Top bar */}
      <View style={styles.topBar}>
        <View style={[styles.logoMark, { borderColor: C.primary + "55" }]}>
          <Text style={[styles.logoStar, { color: C.primary }]}>✦</Text>
        </View>
        <TouchableOpacity
          style={[styles.skipChip, { backgroundColor: C.card }]}
          onPress={() => navigation.replace("Login")}
        >
          <Text style={[styles.skipText, { color: C.muted }]}>Skip</Text>
        </TouchableOpacity>
      </View>

      {/* Slides */}
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <Slide item={item} C={C} isActive={index === currentIndex} />
        )}
      />

      {/* Bottom controls */}
      <View style={styles.bottomBlock}>

        {/* Step counter */}
        <Text style={[styles.stepCounter, { color: C.muted }]}>
          {String(currentIndex + 1).padStart(2, "0")}
          <Text style={{ color: C.primary + "66" }}> / </Text>
          {String(SLIDES.length).padStart(2, "0")}
        </Text>

        {/* Progress bar */}
        <View style={[styles.progressTrack, { backgroundColor: C.card }]}>
          <Animated.View
            style={[styles.progressFill, { backgroundColor: C.primary, width: progressWidth }]}
          />
        </View>

        {/* Dot indicators */}
        <View style={styles.dotsRow}>
          {SLIDES.map((_, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => {
                flatListRef.current?.scrollToIndex({ index: i, animated: true });
                setCurrentIndex(i);
              }}
            >
              <View
                style={[
                  styles.dot,
                  {
                    backgroundColor: i === currentIndex ? C.primary : C.primary + "30",
                    width: i === currentIndex ? 28 : 8,
                  },
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* CTA button */}
        <TouchableOpacity
          style={[styles.nextBtn, { backgroundColor: C.primary }]}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={[styles.nextText, { color: C.primaryText }]}>
            {isLast ? "Get Started" : "Continue"}
          </Text>
          <View style={[styles.nextIconWrap, { backgroundColor: C.primaryText + "22" }]}>
            <Ionicons
              name={isLast ? "checkmark" : "arrow-forward"}
              size={18}
              color={C.primaryText}
            />
          </View>
        </TouchableOpacity>

      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 28,
    paddingTop: "14%",
    paddingBottom: 8,
  },
  logoMark: {
    width: 40, height: 40, borderRadius: 20, borderWidth: 1.5,
    justifyContent: "center", alignItems: "center",
  },
  logoStar: { fontSize: 16, fontWeight: "bold" },
  skipChip: {
    paddingHorizontal: 16, paddingVertical: 8,
    borderRadius: 20,
  },
  skipText: { fontSize: 13, fontWeight: "600" },

  slide: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32,
    gap: 32,
  },

  iconCard: {
    width: 220, height: 220, borderRadius: 40, borderWidth: 1.5,
    alignItems: "center", justifyContent: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 20,
    elevation: 6,
  },
  accentText: {
    position: "absolute", top: 16, right: 20,
    fontSize: 22, fontWeight: "bold",
  },
  iconCircle: {
    width: 100, height: 100, borderRadius: 50,
    justifyContent: "center", alignItems: "center",
  },

  slideTitle: {
    fontSize: 36, fontWeight: "800",
    textAlign: "center", lineHeight: 42, letterSpacing: -0.5,
  },
  slideDesc: {
    fontSize: 15, textAlign: "center",
    lineHeight: 23, paddingHorizontal: 8,
  },

  bottomBlock: {
    paddingHorizontal: 28,
    paddingBottom: 44,
    alignItems: "center",
    gap: 16,
  },

  stepCounter: {
    fontSize: 12, fontWeight: "700", letterSpacing: 2,
  },

  progressTrack: {
    width: "100%", height: 4, borderRadius: 2, overflow: "hidden",
  },
  progressFill: {
    height: "100%", borderRadius: 2,
  },

  dotsRow: {
    flexDirection: "row", gap: 6, alignItems: "center",
  },
  dot: {
    height: 8, borderRadius: 4,
  },

  nextBtn: {
    width: "100%", flexDirection: "row", alignItems: "center",
    justifyContent: "center", paddingVertical: 17,
    borderRadius: 18, gap: 10, marginTop: 4,
  },
  nextText: { fontSize: 17, fontWeight: "700" },
  nextIconWrap: {
    width: 30, height: 30, borderRadius: 15,
    justifyContent: "center", alignItems: "center",
  },
});