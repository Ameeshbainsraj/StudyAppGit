import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  return (
    <View style={styles.container}>
      <View style={styles.iconBox}>
        {/* You can use any icon, e.g., */}
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
      <Text style={styles.signup}>Don’t have account?</Text>
      <TouchableOpacity onPress={() => navigation.replace("Signup")}>
        <Text style={styles.linkBold}>SIGN UP</Text>
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
  forgot: { color: "#B1B95C", marginBottom: 7, fontWeight: "bold" },
  button: {
    backgroundColor: "#B1B95C",
    borderRadius: 22,
    marginBottom: 18,
    padding: 13,
    width: 255,
    alignItems: "center",
  },
  buttonText: { fontWeight: "bold", fontSize: 18 },
  signup: { color: "#fff", fontWeight: "bold" },
  linkBold: { color: "#fff", fontWeight: "bold", fontSize: 16, marginTop: 2 }
});
