import React from "react";
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";
export default function TranscriptionScreen() {
  return (
    <ImageBackground source={require("../assets/TRANSCRIBE_PAGE.jpg")} style={styles.background}>
      <View style={styles.container}>
        <Text style={styles.title}>Transcription will appear here</Text>
        <View style={styles.buttonsRow}>
          <TouchableOpacity style={styles.button}><Text>Play</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button}><Text>Pause</Text></TouchableOpacity>
          <TouchableOpacity style={styles.button}><Text>Stop/Reset</Text></TouchableOpacity>
        </View>
        {/* Add recording logic later */}
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 20, color: "#fff", fontWeight: "bold", marginBottom: 40 },
  buttonsRow: { flexDirection: "row", marginVertical: 10 },
  button: { backgroundColor: "#B1B95C", borderRadius: 20, padding: 20, marginHorizontal: 10, alignItems: "center" }
});
