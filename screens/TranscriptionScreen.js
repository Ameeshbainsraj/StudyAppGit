import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, FontAwesome5, Entypo } from "@expo/vector-icons";

export default function TranscriptionScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={30} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>TRANSCRIPTIONS</Text>
        <Text style={styles.settings}><Entypo name="cog" size={30} color="#fff" /></Text>
      </View>

      {/* Export Format Buttons */}
      <View style={styles.exportRow}>
        <TouchableOpacity style={styles.exportBtn}><Text>PDF</Text></TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn}><Text>WORD</Text></TouchableOpacity>
        <TouchableOpacity style={styles.exportBtn}><Text>FLASH</Text></TouchableOpacity>
      </View>

      {/* Transcription Display */}
      <View style={styles.displayBox}>
        <Text style={styles.displayText}>Transcription will appear here</Text>
        <View style={styles.statusRow}>
          <Text style={styles.statusBtn}>READY</Text>
          <Text style={styles.statusBtn}>RECORDING</Text>
          <Text style={styles.statusBtn}>PROCESSING</Text>
        </View>
      </View>

      {/* Microphone Circle */}
      <View style={styles.microCircle}>
        <FontAwesome5 name="microphone" size={55} color="#203728" />
      </View>

      {/* Controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity style={styles.iconBtn}><Ionicons name="play" size={30} color="#203728" /><Text style={styles.ctlTxt}>PLAY</Text></TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}><Ionicons name="pause" size={30} color="#203728" /><Text style={styles.ctlTxt}>PAUSE</Text></TouchableOpacity>
        <TouchableOpacity style={styles.iconBtn}><Ionicons name="trash" size={30} color="#203728" /><Text style={styles.ctlTxt}>STOP/RESET</Text></TouchableOpacity>
      </View>
      
      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.leftTxt}>00:14</Text>
        <Text style={styles.rightTxt}>Swipe up for history</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c3122", alignItems: "center", paddingTop: 26 },
  topBar: { flexDirection: "row", alignItems: "center", marginBottom: 8, width: "100%", justifyContent: "space-between", paddingHorizontal: 13 },
  header: { color: "#fff", fontWeight: "bold", fontSize: 20, letterSpacing: 2 },
  settings: { marginLeft: 10 },
  exportRow: { flexDirection: "row", justifyContent: "center", marginBottom: 10 },
  exportBtn: { backgroundColor: "#B1B95C", borderRadius: 15, paddingVertical: 8, paddingHorizontal: 16, marginHorizontal: 6, fontWeight: "bold" },
  displayBox: { backgroundColor: "#B1B95C", borderRadius: 18, width: 255, alignItems: "center", marginBottom: 15, paddingVertical: 15, paddingHorizontal: 7 },
  displayText: { fontWeight: "bold", fontSize: 16, color: "#203728" },
  statusRow: { flexDirection: "row", marginTop: 10 },
  statusBtn: { backgroundColor: "#ccc", borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4, marginHorizontal: 4, fontWeight: "bold", fontSize: 11 },
  microCircle: { width: 95, height: 95, borderRadius: 50, borderWidth: 3, borderColor: "#B1B95C", backgroundColor: "#B1B95C", justifyContent: "center", alignItems: "center", marginBottom: 15 },
  controlsRow: { flexDirection: "row", justifyContent: "center", marginBottom: 12 },
  iconBtn: { backgroundColor: "#B1B95C", borderRadius: 20, marginHorizontal: 10, width: 68, height: 68, justifyContent: "center", alignItems: "center" },
  ctlTxt: { color: "#203728", marginTop: 7, fontWeight: "bold", fontSize: 12, textAlign: "center" },
  bottomBar: { backgroundColor: "#B1B95C", width: "100%", position: "absolute", bottom: 0, paddingVertical: 10, paddingHorizontal: 18, flexDirection: "row", justifyContent: "space-between", borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  leftTxt: { color: "#203728", fontWeight: "bold", fontSize: 15 },
  rightTxt: { color: "#203728", fontWeight: "bold", fontSize: 15 }
});
