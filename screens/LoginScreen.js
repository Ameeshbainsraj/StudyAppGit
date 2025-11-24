import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from "react-native";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
        <View style={styles.iconBox}>
          <Text style={styles.icon}>🧙‍♂️</Text>
        </View>

        <Text style={styles.title}>WELCOME BACK</Text>

        <TextInput
          style={styles.input}
          placeholder="EMAIL / USERNAME"
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

        <TouchableOpacity>
          <Text style={styles.forgot}>FORGET PASSWORD?</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Home")}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>

        <View style={styles.signupContainer}>
          <Text style={styles.signup}>Don’t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.replace("Signup")}>
            <Text style={styles.linkBold}>SIGN UP</Text>
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
  forgot: { color: "#B1B95C", marginBottom: 15, fontWeight: "bold", alignSelf: "flex-end", marginRight: 50 },
  button: {
    backgroundColor: "#B1B95C",
    borderRadius: 25,
    paddingVertical: 15,
    paddingHorizontal: 80,
    marginBottom: 20,
    alignItems: "center",
  },
  buttonText: { fontWeight: "bold", fontSize: 18, color: "#203728" },
  signupContainer: { flexDirection: "row", alignItems: "center" },
  signup: { color: "#fff", fontWeight: "bold" },
  linkBold: { color: "#B1B95C", fontWeight: "bold", fontSize: 16 },
});
