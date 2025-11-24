import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.iconBox}>
          <Text style={styles.icon}>🧙‍♂️</Text>
        </View>

        <Text style={styles.title}>Create Account</Text>

        <TextInput
          style={[styles.input, styles.greyInput]}
          placeholder="FULL NAME"
          placeholderTextColor="#222"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="EMAIL"
          placeholderTextColor="#222"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="PASSWORD"
          placeholderTextColor="#222"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="CONFIRM PASSWORD"
          placeholderTextColor="#222"
          secureTextEntry
          value={confirm}
          onChangeText={setConfirm}
        />

        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Home")}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace("Login")}>
            <Text style={styles.loginLink}>LOGIN</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c3122",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  iconBox: { marginBottom: 15 },
  icon: { fontSize: 60, color: "#B1B95C" },
  title: { color: "#fff", fontSize: 24, fontWeight: "bold", marginBottom: 30 },
  input: {
    width: 280,
    height: 50,
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingHorizontal: 20,
    fontWeight: "bold",
    marginVertical: 10,
    letterSpacing: 1,
    fontSize: 14,
  },
  greyInput: { backgroundColor: "#ccc" },
  button: {
    backgroundColor: "#B1B95C",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 80,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: { fontWeight: "bold", fontSize: 18, color: "#203728" },
  loginContainer: { flexDirection: "row", alignItems: "center" },
  loginText: { color: "#fff", fontWeight: "bold" },
  loginLink: { color: "#B1B95C", fontWeight: "bold", fontSize: 16 },
});
