import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";

export default function PomodoroScreen({ navigation }) {
  return (
    <View style={styles.container}>
{/* Top Bar */}
<View style={styles.topBar}>
  <TouchableOpacity onPress={() => navigation.goBack()}>
    <Ionicons name="arrow-back" size={30} color="#fff" />
  </TouchableOpacity>
  <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
    <Entypo name="cog" size={30} color="#fff" />
  </TouchableOpacity>
</View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Timer Circle */}
        <View style={styles.timerCircle}>
          <Text style={styles.timerText}>25:00</Text>
          <Text style={styles.focusText}>FOCUS TIME</Text>
        </View>

        <Text style={styles.sessionText}>Session 1 of 4</Text>
        <View style={styles.sessionType}>
          <Text style={styles.sessionTypeText}>WORK SESSION</Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="play" size={30} color="#203728" />
            <Text style={styles.ctlTxt}>PLAY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="pause" size={30} color="#203728" />
            <Text style={styles.ctlTxt}>PAUSE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn}>
            <Ionicons name="reload" size={30} color="#203728" />
            <Text style={styles.ctlTxt}>RESET</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.shortBtnsRow}>
          <TouchableOpacity style={styles.shortBtn}>
            <Text style={styles.shortBtnTxt}>25 MIN WORK</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shortBtn}>
            <Text style={styles.shortBtnTxt}>5 MIN BREAK</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Summary Bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomBarTxt}>Today: 3 Sessions | 75 min Focused</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c3122",
  },
  topBar: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 40,
    marginBottom: 30,
    alignSelf: "center",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "#B1B95C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  timerText: { fontSize: 36, fontWeight: "bold", color: "#fff", letterSpacing: 2 },
  focusText: { fontSize: 15, color: "#fff", marginTop: 6 },
  sessionText: { color: "#fff", fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  sessionType: {
    backgroundColor: "#B1B95C",
    borderRadius: 20,
    paddingHorizontal: 28,
    paddingVertical: 9,
    marginBottom: 25,
  },
  sessionTypeText: { color: "#203728", fontWeight: "bold" },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  iconBtn: {
    backgroundColor: "#B1B95C",
    borderRadius: 20,
    marginHorizontal: 12,
    width: 75,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  ctlTxt: { color: "#203728", marginTop: 7, fontWeight: "bold", fontSize: 12 },
  shortBtnsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
  },
  shortBtn: {
    backgroundColor: "#B1B95C",
    borderRadius: 18,
    marginHorizontal: 10,
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  shortBtnTxt: { color: "#203728", fontWeight: "bold", fontSize: 14 },
  bottomBar: {
    backgroundColor: "#B1B95C",
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  bottomBarTxt: { color: "#203728", fontWeight: "bold", fontSize: 16 },
});
