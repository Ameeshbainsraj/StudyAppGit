import React from "react";
import { View, Text, TextInput, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";

export default function LoginScreen({ navigation }) {
  return (
    <ImageBackground source={require("../assets/LOGIN_PAGE.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>WELCOME BACK</Text>
        <TextInput style={styles.input} placeholder="Email / Username" />
        <TextInput style={styles.input} placeholder="Password" secureTextEntry />
        <TouchableOpacity>
          <Text style={styles.forgot}>FORGET PASSWORD?</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigation.replace("Home")}>
          <Text style={styles.buttonText}>LOGIN</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.replace("Signup")}>
          <Text style={styles.signup}>Don’t have account? SIGN UP</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 30, color: "#fff" },
  input: { width: 250, height: 45, backgroundColor: "#fff", borderRadius: 20, paddingHorizontal: 20, marginVertical: 10 },
  button: { backgroundColor: "#B1B95C", borderRadius: 20, padding: 10, width: 240, alignItems: "center", marginBottom: 20 },
  buttonText: { fontWeight: "bold" },
  forgot: { color: "#B1B95C", marginBottom: 10 },
  signup: { color: "#fff" }
});
