import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen({ navigation }) {
  const handleLogout = () => {
    // Navigate to Login screen
    navigation.replace("Login"); // replace ensures you can't go back with back button
  };

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>SETTINGS</Text>
      </View>

      {/* Main settings blocks */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Account</Text>
        <Text>Username</Text>
        <Text>Edit Profile</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>App Settings</Text>
        <Text>Mode: Dark</Text>
        <Text>Language: English</Text>
        <Text>Font Size: Medium</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Transcriptions</Text>
        <Text>Export Format: TXT</Text>
        <Text>Voice Recognition: John</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Pomodoro Timer</Text>
        <Text>Work Duration: 25 min</Text>
        <Text>Break Duration: 05 min</Text>
        <Text>Long Break: 15 min</Text>
        <Text>Start Breaks Sound: Apple Wood</Text>
      </View>

      {/* Logout Card */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>About & Support</Text>
        <Text>Help Center | Rate App</Text>
        <Text>About App</Text>
      </View>

      <TouchableOpacity style={styles.logoutCard} onPress={handleLogout}>
        <Text style={styles.logoutText}>LOG OUT</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c3122",
    alignItems: "center",
    paddingTop: 26,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    width: "100%",
  },
  header: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
    marginLeft: 18,
    letterSpacing: 2,
  },
  card: {
    backgroundColor: "#B1B95C",
    borderRadius: 18,
    width: 300,
    padding: 19,
    marginVertical: 9,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 6,
    color: "#203728",
  },
  logoutCard: {
    backgroundColor: "#e34b4b", // red to stand out
    borderRadius: 18,
    width: 300,
    padding: 19,
    marginVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
});
