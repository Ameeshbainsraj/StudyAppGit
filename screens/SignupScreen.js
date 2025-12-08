// screens/SignupScreen.js
import React, { useState } from "react";
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
} from "react-native";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { useTheme } from "../ThemeContext";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleSignup = async () => {
    if (!name || !email || !password || !confirm) {
      Alert.alert("Missing info", "Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      Alert.alert("Password mismatch", "Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const cred = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        email.trim(),
        password
      );
      const uid = cred.user.uid;

      await setDoc(doc(FIREBASE_DB, "users", uid), {
        name,
        email: email.trim(),
        createdAt: serverTimestamp(),
      });

      navigation.replace("Home", { fromAuth: true });
    } catch (err) {
      console.log("Signup error:", err);

      let message = "Could not create account. Please try again.";
      if (err.code === "auth/email-already-in-use") {
        message = "That email is already in use.";
      } else if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err.code === "auth/weak-password") {
        message = "Password should be at least 6 characters.";
      }

      Alert.alert("Signup failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.iconBox}>
          <Text style={[styles.icon, { color: theme.colors.primary }]}> ☆ </Text>
        </View>

        <Text style={[styles.title, { color: theme.colors.text }]}>
          CREATE ACCOUNT
        </Text>

        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
            },
          ]}
          placeholder="FULL NAME"
          placeholderTextColor={theme.colors.mutedText}
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
            },
          ]}
          placeholder="EMAIL"
          placeholderTextColor={theme.colors.mutedText}
          autoCapitalize="none"
          keyboardType="email-address"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
            },
          ]}
          placeholder="PASSWORD"
          placeholderTextColor={theme.colors.mutedText}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={[
            styles.input,
            {
              backgroundColor: theme.colors.inputBackground,
              color: theme.colors.text,
            },
          ]}
          placeholder="CONFIRM PASSWORD"
          placeholderTextColor={theme.colors.mutedText}
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
            loading && { opacity: 0.7 },
          ]}
          onPress={handleSignup}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color={theme.colors.primaryText} />
          ) : (
            <Text
              style={[
                styles.buttonText,
                { color: theme.colors.primaryText },
              ]}
            >
              Sign Up
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={[styles.loginText, { color: theme.colors.text }]}>
            Already have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.replace("Login")}>
            <Text
              style={[
                styles.loginLink,
                { color: theme.colors.primary },
              ]}
            >
              LOGIN
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  iconBox: { marginBottom: 15 },
  icon: { fontSize: 60 },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  input: {
    width: 280,
    height: 50,
    borderRadius: 25,
    paddingHorizontal: 20,
    fontWeight: "bold",
    marginVertical: 10,
    letterSpacing: 1,
    fontSize: 14,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 80,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: { fontWeight: "bold", fontSize: 18 },
  loginContainer: { flexDirection: "row", alignItems: "center" },
  loginText: { fontWeight: "bold" },
  loginLink: { fontWeight: "bold", fontSize: 16 },
});
