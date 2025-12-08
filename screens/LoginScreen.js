// screens/LoginScreen.js
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
import { signInWithEmailAndPassword } from "firebase/auth";
import { FIREBASE_AUTH } from "../FirebaseConfig";
import { useTheme } from "../ThemeContext";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { theme } = useTheme();

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Please enter email and password.");
      return;
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(FIREBASE_AUTH, email.trim(), password);
      navigation.replace("Home");
    } catch (err) {
      console.log("Login error:", err);

      let message = "Check your details and try again.";
      if (err.code === "auth/invalid-email") {
        message = "Please enter a valid email address.";
      } else if (err.code === "auth/user-not-found") {
        message = "No account found with that email.";
      } else if (err.code === "auth/wrong-password") {
        message = "Incorrect password. Please try again.";
      } else if (err.code === "auth/invalid-credential") {
        message = "Email or password is incorrect. Please try again.";
      }

      Alert.alert("Login failed", message);
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
          WELCOME BACK
        </Text>

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

        <TouchableOpacity>
          <Text style={[styles.forgot, { color: theme.colors.primary }]}>
            FORGET PASSWORD?
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            { backgroundColor: theme.colors.primary },
            loading && { opacity: 0.7 },
          ]}
          onPress={handleLogin}
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
              LOGIN
            </Text>
          )}
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={[styles.signup, { color: theme.colors.text }]}>
            Don’t have an account?{" "}
          </Text>
          <TouchableOpacity onPress={() => navigation.replace("Signup")}>
            <Text
              style={[
                styles.linkBold,
                { color: theme.colors.primary },
              ]}
            >
              SIGN UP
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
  title: { fontSize: 25, fontWeight: "bold", marginBottom: 30 },
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
  forgot: {
    marginBottom: 15,
    fontWeight: "bold",
    alignSelf: "flex-end",
    marginRight: 50,
  },
  button: {
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 80,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: { fontWeight: "bold", fontSize: 18 },
  signupContainer: { flexDirection: "row", alignItems: "center" },
  signup: { fontWeight: "bold" },
  linkBold: { fontWeight: "bold", fontSize: 16 },
});
