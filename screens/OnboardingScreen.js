import React, { useRef, useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, Dimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

const { width } = Dimensions.get("window");

const SLIDES = [
  { id: "1", icon: "mic-outline", title: "Transcribe Anything", description: "Record lectures, meetings or voice notes and get instant AI-powered transcriptions." },
  { id: "2", icon: "albums-outline", title: "Study Smarter", description: "Generate flashcards and quizzes from your notes automatically using AI." },
  { id: "3", icon: "timer-outline", title: "Stay Focused", description: "Use the Pomodoro timer to stay productive and plan your study sessions." },
  { id: "4", icon: "star-outline", title: "Level Up", description: "Earn XP for every action — transcriptions, quizzes, notes — and rise through 20 levels." },
];

export default function OnboardingScreen({ navigation }) {
  const { theme } = useTheme();
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const C = { bg: theme.colors.background, primary: theme.colors.primary, primaryText: theme.colors.primaryText, text: theme.colors.text, muted: theme.colors.mutedText };

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1, animated: true });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace("Login");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <TouchableOpacity style={styles.skipBtn} onPress={() => navigation.replace("Login")}>
        <Text style={[styles.skipText, { color: C.muted }]}>Skip</Text>
      </TouchableOpacity>
      <FlatList
        ref={flatListRef}
        data={SLIDES}
        keyExtractor={(item) => item.id}
        horizontal pagingEnabled scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={[styles.slide, { width }]}>
            <View style={[styles.iconWrap, { backgroundColor: C.primary + "22" }]}>
              <Ionicons name={item.icon} size={64} color={C.primary} />
            </View>
            <Text style={[styles.slideTitle, { color: C.text }]}>{item.title}</Text>
            <Text style={[styles.slideDesc, { color: C.muted }]}>{item.description}</Text>
          </View>
        )}
      />
      <View style={styles.dotsRow}>
        {SLIDES.map((_, i) => (
          <View key={i} style={[styles.dot, { backgroundColor: i === currentIndex ? C.primary : C.muted }, i === currentIndex && styles.dotActive]} />
        ))}
      </View>
      <TouchableOpacity style={[styles.nextBtn, { backgroundColor: C.primary }]} onPress={handleNext}>
        <Text style={[styles.nextText, { color: C.primaryText }]}>{currentIndex === SLIDES.length - 1 ? "Get Started" : "Next"}</Text>
        <Ionicons name={currentIndex === SLIDES.length - 1 ? "checkmark-outline" : "arrow-forward-outline"} size={20} color={C.primaryText} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  skipBtn: { position: "absolute", top: "12%", right: 24, zIndex: 10 },
  skipText: { fontSize: 14, fontWeight: "600" },
  slide: { alignItems: "center", justifyContent: "center", paddingHorizontal: 40, gap: 20 },
  iconWrap: { width: 130, height: 130, borderRadius: 40, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  slideTitle: { fontSize: 26, fontWeight: "bold", textAlign: "center" },
  slideDesc: { fontSize: 16, textAlign: "center", lineHeight: 24 },
  dotsRow: { flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dotActive: { width: 24 },
  nextBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginHorizontal: 24, paddingVertical: 16, borderRadius: 20, marginBottom: 40 },
  nextText: { fontSize: 17, fontWeight: "700" },
});