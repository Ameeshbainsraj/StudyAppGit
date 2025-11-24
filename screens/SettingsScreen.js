import React from "react";
import { View, Text, TouchableOpacity, ImageBackground, StyleSheet } from "react-native";
export default function SettingsScreen() {
  return (
    <ImageBackground source={require("../assets/SETTINGS_PAGE.jpg")} style={styles.background}>
      <View style={styles.container}>
        {/* Add the boxes/content as shown in your image using Views/Text */}
        <Text style={styles.title}>Settings</Text>
        {/* Example setting rows */}
        <View style={styles.settingBox}><Text>Account</Text></View>
        <View style={styles.settingBox}><Text>App Settings</Text></View>
        <View style={styles.settingBox}><Text>Transcriptions</Text></View>
        <View style={styles.settingBox}><Text>Pomodoro Timer</Text></View>
        <View style={styles.settingBox}><Text>About & Support</Text></View>
      </View>
    </ImageBackground>
  );
}
const styles = StyleSheet.create({
  background: { flex: 1 },
  container: { flex: 1, alignItems: "center", paddingTop: 60 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 10, color: "#fff" },
  settingBox: { backgroundColor: "#B1B95C", borderRadius: 15, padding: 18, marginVertical: 8, width: 280 }
});
