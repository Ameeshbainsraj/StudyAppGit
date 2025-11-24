import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function SettingsScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>SETTINGS</Text>
      </View>

      {/* Main settings blocks */}
      <View style={styles.card}><Text>Account</Text>{"\n"}Username{"\n"}Edit Profile</View>
      <View style={styles.card}><Text>App Settings</Text>{"\n"}Mode: Dark{"\n"}Language: English{"\n"}Font Size: Medium</View>
      <View style={styles.card}><Text>Transcriptions</Text>{"\n"}Export Format: TXT{"\n"}Voice Recognition: John</View>
      <View style={styles.card}><Text>Pomodoro Timer</Text>{"\n"}Work Duration: 25 min{"\n"}Break Duration: 05 min{"\n"}Long Break: 15 min{"\n"}Start Breaks Sound: apple wood</View>
      <View style={styles.card}>
        <Text>About & Support</Text>{"\n"}Help Center{" "}|{" "}Rate App{"\n"}About App{"\n"}LOG OUT
        </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c3122", alignItems: "center", paddingTop: 26 },
  topBar: { flexDirection: "row", alignItems: "center", marginBottom: 15, width: "100%" },
  header: { color: "#fff", fontWeight: "bold", fontSize: 22, marginLeft: 18, letterSpacing: 2 },
  card: { backgroundColor: "#B1B95C", borderRadius: 18, width: 300, padding: 19, marginVertical: 9, fontWeight: "bold", fontSize: 14 }
});
