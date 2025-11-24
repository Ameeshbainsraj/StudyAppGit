import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function SignupScreen({ navigation }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  return (
    <View style={styles.container}>
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
      <Text style={styles.loginText}>Already have an account?</Text>
      <TouchableOpacity onPress={() => navigation.replace("Login")}>
        <Text style={styles.loginLink}>LOGIN</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c3122",
    alignItems: "center",
    paddingTop: 60,
  },
  iconBox: { marginBottom: 10 },
  icon: { fontSize: 50, color: "#B1B95C" },
  title: { color: "#fff", fontSize: 22, fontWeight: "bold", marginBottom: 30 },
  input: {
    width: 255,
    height: 45,
    backgroundColor: "#fff",
    borderRadius: 22,
    paddingHorizontal: 18,
    fontWeight: "bold",
    marginVertical: 8,
    letterSpacing: 1,
    fontSize: 13
  },
  greyInput: { backgroundColor: "#ccc" },
  button: {
    backgroundColor: "#B1B95C",
    borderRadius: 22,
    marginBottom: 18,
    padding: 13,
    width: 255,
    alignItems: "center",
  },
  buttonText: { fontWeight: "bold", fontSize: 18 },
  loginText: { color: "#fff", fontWeight: "bold" },
  loginLink: { color: "#fff", fontWeight: "bold", fontSize: 16, marginTop: 2 }
});
