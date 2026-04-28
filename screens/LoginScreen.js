// screens/LoginScreen.js
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
  Dimensions,
} from "react-native";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { useTheme } from "../ThemeContext";

const { width } = Dimensions.get("window");

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { theme } = useTheme();

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(40)).current;
  const orb1 = useRef(new Animated.Value(0)).current;
  const orb2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 800, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb1, { toValue: 1, duration: 3200, useNativeDriver: true }),
        Animated.timing(orb1, { toValue: 0, duration: 3200, useNativeDriver: true }),
      ])
    ).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(orb2, { toValue: 1, duration: 4100, useNativeDriver: true }),
        Animated.timing(orb2, { toValue: 0, duration: 4100, useNativeDriver: true }),
      ])
    ).start();
  }, []);

  const orb1Y = orb1.interpolate({ inputRange: [0, 1], outputRange: [0, -18] });
  const orb2Y = orb2.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });

  const C = {
    bg: theme.colors.background,
    card: theme.colors.card,
    primary: theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text: theme.colors.text,
    muted: theme.colors.mutedText,
    input: theme.colors.inputBackground,
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter your email and password.");
      return;
    }
    try {
      setLoading(true);
      await signInWithEmailAndPassword(FIREBASE_AUTH, email.trim(), password);
      navigation.replace("Home");
    } catch (err) {
      let message = "Check your details and try again.";
      if (err.code === "auth/invalid-email") message = "Please enter a valid email address.";
      else if (err.code === "auth/user-not-found") message = "No account found with that email.";
      else if (err.code === "auth/wrong-password") message = "Incorrect password. Please try again.";
      else if (err.code === "auth/invalid-credential") message = "Email or password is incorrect.";
      Alert.alert("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email.trim()) {
      Alert.alert("Enter your email", "Type your email address above, then tap 'Forgot Password' to reset it.");
      return;
    }
    try {
      setResetLoading(true);
      await sendPasswordResetEmail(FIREBASE_AUTH, email.trim());
      Alert.alert("Check your inbox ✉️", `A password reset link has been sent to ${email.trim()}.`);
    } catch (err) {
      let message = "Could not send reset email. Please try again.";
      if (err.code === "auth/invalid-email") message = "Please enter a valid email address.";
      else if (err.code === "auth/user-not-found") message = "No account found with that email.";
      Alert.alert("Reset failed", message);
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: C.bg }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Ambient orbs */}
      <Animated.View style={[styles.orb1, { backgroundColor: C.primary + "28", transform: [{ translateY: orb1Y }] }]} />
      <Animated.View style={[styles.orb2, { backgroundColor: C.primary + "18", transform: [{ translateY: orb2Y }] }]} />

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <Animated.View style={[styles.inner, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>

          {/* Logo mark */}
          <View style={styles.logoWrap}>
            <View style={[styles.logoRing, { borderColor: C.primary + "55" }]}>
              <View style={[styles.logoCore, { backgroundColor: C.primary + "22" }]}>
                <Text style={[styles.logoStar, { color: C.primary }]}>✦</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.greeting, { color: C.muted }]}>WELCOME BACK</Text>
<Text style={[styles.title, { color: C.text }]}>SIGN IN{"\n"}</Text>

          <View style={styles.fields}>
            <View style={[styles.fieldWrap, focusedField === "email" && { borderColor: C.primary }, { borderColor: focusedField === "email" ? C.primary : C.input, backgroundColor: C.input }]}>
              <Text style={[styles.fieldLabel, { color: focusedField === "email" ? C.primary : C.muted }]}>EMAIL</Text>
              <TextInput
                style={[styles.fieldInput, { color: C.text }]}
                placeholder="you@example.com"
                placeholderTextColor={C.muted + "88"}
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedField("email")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <View style={[styles.fieldWrap, { borderColor: focusedField === "pass" ? C.primary : C.input, backgroundColor: C.input }]}>
              <Text style={[styles.fieldLabel, { color: focusedField === "pass" ? C.primary : C.muted }]}>PASSWORD</Text>
              <TextInput
                style={[styles.fieldInput, { color: C.text }]}
                placeholder="••••••••"
                placeholderTextColor={C.muted + "88"}
                secureTextEntry
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedField("pass")}
                onBlur={() => setFocusedField(null)}
              />
            </View>

            <TouchableOpacity onPress={handleForgotPassword} disabled={resetLoading} style={styles.forgotRow}>
              {resetLoading
                ? <ActivityIndicator size="small" color={C.primary} />
                : <Text style={[styles.forgotText, { color: C.primary }]}>Forgot password?</Text>
              }
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.btn, { backgroundColor: C.primary }, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color={C.primaryText} />
              : <Text style={[styles.btnText, { color: C.primaryText }]}>Continue →</Text>
            }
          </TouchableOpacity>

          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: C.muted }]}>No account yet? </Text>
            <TouchableOpacity onPress={() => navigation.replace("Signup")}>
              <Text style={[styles.switchLink, { color: C.primary }]}>Create one</Text>
            </TouchableOpacity>
          </View>

        </Animated.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: "center" },
  inner: { paddingHorizontal: 32, paddingVertical: 60, alignItems: "flex-start" },
  orb1: {
    position: "absolute", width: 260, height: 260, borderRadius: 130,
    top: -60, right: -80,
  },
  orb2: {
    position: "absolute", width: 180, height: 180, borderRadius: 90,
    bottom: 40, left: -60,
  },
  logoWrap: { marginBottom: 36 },
  logoRing: {
    width: 64, height: 64, borderRadius: 32, borderWidth: 1.5,
    justifyContent: "center", alignItems: "center",
  },
  logoCore: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: "center", alignItems: "center",
  },
  logoStar: { fontSize: 22, fontWeight: "bold" },
  greeting: { fontSize: 11, fontWeight: "700", letterSpacing: 2.5, marginBottom: 8 },
  title: { fontSize: 32, fontWeight: "800", lineHeight: 40, marginBottom: 40 },
  fields: { width: "100%", gap: 14, marginBottom: 8 },
  fieldWrap: {
    borderRadius: 16, borderWidth: 1.5,
    paddingHorizontal: 18, paddingTop: 12, paddingBottom: 10,
  },
  fieldLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.8, marginBottom: 4 },
  fieldInput: { fontSize: 16, fontWeight: "500", paddingVertical: 2 },
  forgotRow: { alignSelf: "flex-end", paddingVertical: 4, marginTop: 2 },
  forgotText: { fontSize: 13, fontWeight: "600" },
  btn: {
    width: "100%", borderRadius: 16, paddingVertical: 17,
    alignItems: "center", marginTop: 28, marginBottom: 24,
  },
  btnText: { fontSize: 17, fontWeight: "700", letterSpacing: 0.3 },
  switchRow: { flexDirection: "row", alignSelf: "center" },
  switchText: { fontSize: 14 },
  switchLink: { fontSize: 14, fontWeight: "700" },
});