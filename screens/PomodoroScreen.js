import React from "react";
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";
export default function PomodoroScreen({ navigation }) {
  return (
    <ImageBackground source={require("../assets/POMODORO_PAGE.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.timer}>25:00</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.button}><Text>Play</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button}><Text>Pause</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button}><Text>Reset</Text></TouchableOpacity>
        </View>
        {/* Add more UI here as you develop the timer */}
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  timer: { fontSize: 48, color: "#fff", fontWeight: "bold", marginBottom: 40 },
  buttonsRow: { flexDirection: "row", marginVertical: 10 },
  button: { backgroundColor: "#B1B95C", borderRadius: 20, padding: 20, marginHorizontal: 10, alignItems: "center" }
});
