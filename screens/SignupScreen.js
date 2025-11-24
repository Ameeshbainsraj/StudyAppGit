import React from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";
export default function SignupScreen({ navigation }) {
  return (
    <ImageBackground source={require("../assets/REGISTER_PAGE.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Create Account</Text>
        <TextInput style={styles.input} placeholder="Full Name" />
        <TextInput style={styles.input} placeholder="Email" />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry />
        <TextInput style={styles.input} placeholder="Confirm Password" secureTextEntry />
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Home")}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace("Login")}>
          <Text style={styles.signup}>Already have an account? LOGIN</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#fff" },
  input: { width: 250, height: 45, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 20, marginVertical: 10 },
  button: { backgroundColor: "#B1B95C", borderRadius: 20, padding: 10, width: 240, alignItems: "center", marginBottom: 20 },
  buttonText: { fontWeight: "bold" },
  signup: { color: "#fff" }
});
