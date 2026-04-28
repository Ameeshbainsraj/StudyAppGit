// screens/TermsScreen.js
import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

const CONTENT = [
  {
    section: "Terms & Conditions",
    items: [
      { title: "1. Acceptance of Terms", body: "By creating an account and using Shepard Learn, you agree to be bound by these Terms & Conditions. If you do not agree, please do not use this app." },
      { title: "2. Use of Service", body: "Shepard Learn is provided for personal, non-commercial educational use only. You agree not to misuse the service, attempt to gain unauthorised access, or use it in any way that violates applicable laws." },
      { title: "3. Your Account", body: "You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account. Notify us immediately of any unauthorised use." },
      { title: "4. Content Ownership", body: "You retain ownership of content you create (notes, recordings, flashcards). By submitting content, you grant us a limited licence to use it solely to provide and improve the service." },
      { title: "5. AI-Generated Content", body: "Shepard Learn uses AI to generate transcriptions, flashcards, and quizzes. AI output may not always be accurate. Always verify important information independently before relying on it." },
      { title: "6. Termination", body: "We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time from the Settings screen." },
      { title: "7. Changes to Terms", body: "We may update these Terms from time to time. Continued use of the app after changes constitutes acceptance of the new Terms." },
    ],
  },
  {
    section: "Privacy Policy",
    items: [
      { title: "1. Data We Collect", body: "We collect your name, email address, and usage data (XP, notes, quiz results, transcriptions) in order to provide the service." },
      { title: "2. How We Use Your Data", body: "Your data is used to operate the app, personalise your experience, and improve our AI models. We do not sell your personal data to third parties under any circumstances." },
      { title: "3. Data Storage & Security", body: "Your data is stored securely using Firebase (Google Cloud). Data may be stored on servers within the EU or USA. We apply industry-standard security measures to protect your information." },
      { title: "4. Your Rights (GDPR)", body: "Under GDPR, you have the right to access, correct, or delete your personal data at any time. You can delete your account and all associated data directly from Settings → Delete My Account & Data." },
      { title: "5. Data Retention", body: "We retain your data for as long as your account is active. Upon account deletion, all personal data is permanently removed from our systems within 30 days." },
      { title: "6. Third-Party Services", body: "We use Firebase (Google) for authentication and data storage, and OpenAI for AI-powered features. These services have their own privacy policies which we encourage you to review." },
      { title: "7. Contact", body: "For any privacy concerns or data requests, contact us at: support@shepardlearn.com" },
    ],
  },
];

export default function TermsScreen({ navigation }) {
  const { theme } = useTheme();
  const C = {
    bg:      theme.colors.background,
    card:    theme.colors.card,
    primary: theme.colors.primary,
    text:    theme.colors.text,
    muted:   theme.colors.mutedText,
  };

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>

      {/* Header */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={22} color={C.text} />
        </TouchableOpacity>
        <Text style={[s.topBarTitle, { color: C.text }]}>Legal</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView
        contentContainerStyle={s.scroll}
        showsVerticalScrollIndicator={false}
      >
        {CONTENT.map((block) => (
          <View key={block.section}>

            {/* Section heading */}
            <View style={[s.sectionHead, { borderLeftColor: C.primary }]}>
              <Text style={[s.sectionTitle, { color: C.text }]}>{block.section}</Text>
            </View>

            {/* Items */}
            {block.items.map((item) => (
              <View key={item.title} style={[s.card, { backgroundColor: C.card }]}>
                <Text style={[s.itemTitle, { color: C.primary }]}>{item.title}</Text>
                <Text style={[s.itemBody, { color: C.muted }]}>{item.body}</Text>
              </View>
            ))}

          </View>
        ))}

        <Text style={[s.lastUpdated, { color: C.muted }]}>Last updated: January 2025</Text>
      </ScrollView>

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingTop: "14%", paddingBottom: 16,
  },
  backBtn: { width: 36, height: 36, justifyContent: "center" },
  topBarTitle: { fontSize: 17, fontWeight: "800", letterSpacing: 0.3 },

  scroll: { paddingHorizontal: 20, paddingBottom: 48 },

  sectionHead: {
    borderLeftWidth: 3, paddingLeft: 12,
    marginTop: 24, marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: "800" },

  card: {
    borderRadius: 16, padding: 16, marginBottom: 10,
  },
  itemTitle: { fontSize: 13, fontWeight: "700", marginBottom: 6 },
  itemBody:  { fontSize: 14, lineHeight: 21 },

  lastUpdated: { textAlign: "center", fontSize: 12, marginTop: 16 },
});