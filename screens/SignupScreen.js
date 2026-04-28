// screens/SignupScreen.js
import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
  Animated,
  Modal,
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { useTheme } from "../ThemeContext";
import { Ionicons } from "@expo/vector-icons";

const TERMS_TEXT = `Terms & Conditions

Last updated: January 2026

1. Acceptance of Terms
By creating an account, you agree to be bound by these Terms & Conditions. If you do not agree, do not use this app.

2. Use of Service
Shepard Learn is provided for personal, non-commercial educational use. You agree not to misuse the service or help anyone else do so.

3. Your Account
You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.

4. Content
You retain ownership of content you create. By submitting content, you grant us a licence to use it to provide and improve the service.

5. AI-Generated Content
Our app uses AI to generate transcriptions, flashcards, and quizzes. AI output may not always be accurate — always verify important information.

6. Privacy
Your use of Shepard Learn is also governed by our Privacy Policy, which is incorporated into these Terms by reference.

Privacy Policy

1. Data We Collect
We collect your name, email address, and usage data (XP, notes, quiz results) to provide the service.

2. How We Use Your Data
We use your data to operate the app, personalise your experience, and improve our AI models. We do not sell your data to third parties.

3. Data Storage
Your data is stored securely using Firebase (Google). Data may be stored on servers in the EU or USA.

4. Your Rights
You have the right to access, correct, or delete your personal data at any time by contacting us.

5. Cookies & Analytics
We may use anonymised analytics to understand how users interact with the app.

6. Contact
For any privacy concerns, contact us at: support@shepardlearn.com`;

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { theme } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const orb1 = useRef(new Animated.Value(0)).current;
  const checkAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1, { toValue: 1, duration: 3800, useNativeDriver: true }),
        Animated.timing(orb1, { toValue: 0, duration: 3800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  useEffect(() => {
    Animated.spring(checkAnim, {
      toValue: agreed ? 1 : 0,
      tension: 80,
      friction: 7,
      useNativeDriver: true,
    }).start();
  }, [agreed]);

  const orb1Y = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -20] });

  const C = {
    bg: theme.colors.background,
    card: theme.colors.card,
    primary: theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text: theme.colors.text,
    muted: theme.colors.mutedText,
    input: theme.colors.inputBackground,
  };

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }
    if (!agreed) {
      Alert.alert("Consent required", "Please agree to the Terms & Conditions to continue.");
      return;
    }
    try {
      setLoading(true);
      const cred = await createUserWithEmailAndPassword(FIREBASE_AUTH, email.trim(), password);
      await setDoc(doc(FIREBASE_DB, "users", cred.user.uid), {
        name,
        email: email.trim(),
        createdAt: serverTimestamp(),
        consentGiven: true,
        consentDate: serverTimestamp(),
      });
      navigation.replace("Home", { fromAuth: true });
    } catch (err) {
      let message = "Could not create account. Please try again.";
      if (err.code === "auth/email-already-in-use") message = "That email is already in use.";
      else if (err.code === "auth/invalid-email") message = "Please enter a valid email address.";
      else if (err.code === "auth/weak-password") message = "Password should be at least 6 characters.";
      Alert.alert("Signup failed", message);
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { key: "name",    label: "FULL NAME",       placeholder: "Your name",         secure: false, keyboard: "default",       value: name,     setter: setName },
    { key: "email",   label: "EMAIL",            placeholder: "you@example.com",   secure: false, keyboard: "email-address", value: email,    setter: setEmail },
    { key: "pass",    label: "PASSWORD",         placeholder: "Min. 6 characters", secure: true,  keyboard: "default",       value: password, setter: setPassword },
    { key: "confirm", label: "CONFIRM PASSWORD", placeholder: "Repeat password",   secure: true,  keyboard: "default",       value: confirm,  setter: setConfirm },
  ];

  const checkScale = checkAnim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] });

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <Animated.View style={[styles.orb1, { backgroundColor: C.primary + "22", transform: [{ translateY: orb1Y }] }]} />
      <View style={[styles.orb2, { backgroundColor: C.primary + "12" }]} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          <TouchableOpacity onPress={() => navigation.replace("Login")} style={styles.backBtn}>
            <Text style={[styles.backText, { color: C.muted }]}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.logoWrap}>
            <View style={[styles.logoRing, { borderColor: C.primary + "55" }]}>
              <View style={[styles.logoCore, { backgroundColor: C.primary + "22" }]}>
                <Text style={[styles.logoStar, { color: C.primary }]}>✦</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.greeting, { color: C.muted }]}>GET STARTED</Text>
          <Text style={[styles.title, { color: C.text }]}>Create{"\n"}account</Text>

          <View style={styles.fields}>
            {fields.map((f) => (
              <View
                key={f.key}
                style={[styles.fieldWrap, { borderColor: focusedField === f.key ? C.primary : C.input, backgroundColor: C.input }]}
              >
                <Text style={[styles.fieldLabel, { color: focusedField === f.key ? C.primary : C.muted }]}>
                  {f.label}
                </Text>
                <TextInput
                  style={[styles.fieldInput, { color: C.text }]}
                  placeholder={f.placeholder}
                  placeholderTextColor={C.muted + "88"}
                  secureTextEntry={f.secure}
                  keyboardType={f.keyboard}
                  autoCapitalize={f.key === "name" ? "words" : "none"}
                  value={f.value}
                  onChangeText={f.setter}
                  onFocus={() => setFocusedField(f.key)}
                  onBlur={() => setFocusedField(null)}
                />
              </View>
            ))}
          </View>

          {/* ── Consent row ── */}
          <View style={[styles.consentRow, { backgroundColor: C.input, borderColor: agreed ? C.primary + "55" : C.input }]}>
            <TouchableOpacity
              onPress={() => setAgreed(!agreed)}
              activeOpacity={0.8}
              style={[styles.checkbox, { borderColor: agreed ? C.primary : C.muted + "88", backgroundColor: agreed ? C.primary : "transparent" }]}
            >
              <Animated.View style={{ transform: [{ scale: checkScale }], opacity: checkAnim }}>
                <Ionicons name="checkmark" size={13} color={C.primaryText} />
              </Animated.View>
            </TouchableOpacity>

            <Text style={[styles.consentText, { color: C.muted }]}>
              I agree to the{" "}
              <Text
                style={[styles.consentLink, { color: C.primary }]}
                onPress={() => setShowTerms(true)}
              >
                Terms & Conditions{"\n"}and Privacy Policy
              </Text>
            </Text>
          </View>

          {/* ── Button ── */}
          <TouchableOpacity
            style={[
              styles.btn,
              { backgroundColor: agreed ? C.primary : C.muted + "44" },
              loading && { opacity: 0.7 },
            ]}
            onPress={handleSignup}
            disabled={loading || !agreed}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={C.primaryText} />
              : <Text style={[styles.btnText, { color: agreed ? C.primaryText : C.muted }]}>
                  Create Account →
                </Text>
            }
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: C.muted }]}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.replace("Login")}>
              <Text style={[styles.switchLink, { color: C.primary }]}>Sign in</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>

      {/* ── Terms Modal ── */}
      <Modal visible={showTerms} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: C.card }]}>

            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.text }]}>Terms & Privacy Policy</Text>
              <TouchableOpacity onPress={() => setShowTerms(false)}>
                <Ionicons name="close" size={24} color={C.muted} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScroll}>
              <Text style={[styles.termsText, { color: C.muted }]}>{TERMS_TEXT}</Text>
            </ScrollView>

            <TouchableOpacity
              style={[styles.agreeBtn, { backgroundColor: C.primary }]}
              onPress={() => { setAgreed(true); setShowTerms(false); }}
              activeOpacity={0.85}
            >
              <Ionicons name="checkmark-circle-outline" size={18} color={C.primaryText} />
              <Text style={[styles.agreeBtnText, { color: C.primaryText }]}>I Agree</Text>
            </TouchableOpacity>

          </View>
        </View>
      </Modal>

    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center" },
  inner: { paddingHorizontal: 32, paddingVertical: 60, alignItems: "flex-start" },
  orb1: { position: "absolute", width: 240, height: 240, borderRadius: 120, bottom: 20, right: -70 },
  orb2: { position: "absolute", width: 160, height: 160, borderRadius: 80, top: -30, left: -50 },
  backBtn: { marginBottom: 28 },
  backText: { fontSize: 14, fontWeight: "600" },
  logoWrap: { marginBottom: 28 },
  logoRing: { width: 56, height: 56, borderRadius: 28, borderWidth: 1.5, justifyContent: "center", alignItems: "center" },
  logoCore: { width: 40, height: 40, borderRadius: 20, justifyContent: "center", alignItems: "center" },
  logoStar: { fontSize: 18, fontWeight: "bold" },
  greeting: { fontSize: 11, fontWeight: "700", letterSpacing: 2.5, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "800", lineHeight: 40, marginBottom: 36 },
  fields: { width: "100%", gap: 12, marginBottom: 16 },
  fieldWrap: { borderRadius: 16, borderWidth: 1.5, paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10 },
  fieldLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.8, marginBottom: 4 },
  fieldInput: { fontSize: 16, fontWeight: "500", paddingVertical: 2 },

  consentRow: {
    width: "100%", flexDirection: "row", alignItems: "center",
    gap: 12, borderRadius: 16, borderWidth: 1.5,
    paddingHorizontal: 16, paddingVertical: 14, marginBottom: 20,
  },
  checkbox: {
    width: 24, height: 24, borderRadius: 7, borderWidth: 2,
    alignItems: "center", justifyContent: "center",
  },
  consentText: { fontSize: 13, lineHeight: 19, flex: 1 },
  consentLink: { fontWeight: "700" },

  btn: { width: "100%", borderRadius: 16, paddingVertical: 17, alignItems: "center", marginBottom: 24 },
  btnText: { fontSize: 17, fontWeight: "700", letterSpacing: 0.3 },
  switchRow: { flexDirection: "row", alignSelf: "center" },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: "700" },

  modalOverlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 28, maxHeight: "88%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 17, fontWeight: "800" },
  modalScroll: { marginBottom: 20 },
  termsText: { fontSize: 13, lineHeight: 22 },
  agreeBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, borderRadius: 16, paddingVertical: 16,
  },
  agreeBtnText: { fontSize: 16, fontWeight: "700" },
});