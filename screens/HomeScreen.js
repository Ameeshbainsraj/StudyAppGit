import React from "react";
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";
export default function HomeScreen({ navigation }) {
  return (
    <ImageBackground source={require("../assets/HOME_PAGE.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>USERNAME</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate("Transcription")}>
            <Text>Transcriptions</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate("Pomodoro")}>
            <Text>Pomodoro Timer</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate("Notes")}>
            <Text>Notes</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.icon} onPress={() => navigation.navigate("Settings")}>
            <Text>Settings</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20, color: "#fff" },
  buttonsRow: { flexDirection: "row", marginVertical: 10 },
  icon: { backgroundColor: "#B1B95C", borderRadius: 20, padding: 30, marginHorizontal: 10, alignItems: "center" }
});
