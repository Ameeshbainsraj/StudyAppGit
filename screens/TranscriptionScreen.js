import React, { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from "react-native";
import { Ionicons, Entypo, FontAwesome5 } from "@expo/vector-icons";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function TranscriptionScreen({ navigation }) {
  const [expanded, setExpanded] = useState(false);
  const [micState, setMicState] = useState("idle"); // idle | playing | paused
  const micAnim = useRef(new Animated.Value(0)).current;

  const animation = useRef(new Animated.Value(0)).current; // bottom card animation

  const toggleBottomBar = () => {
    Animated.timing(animation, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start(() => setExpanded(!expanded));
  };

  // Animate mic glow based on state
  useEffect(() => {
    if (micState === "playing") {
      Animated.loop(
        Animated.sequence([
          Animated.timing(micAnim, { toValue: 1, duration: 500, useNativeDriver: false }),
          Animated.timing(micAnim, { toValue: 0, duration: 500, useNativeDriver: false }),
        ])
      ).start();
    } else if (micState === "paused") {
      Animated.timing(micAnim, { toValue: 0.5, duration: 300, useNativeDriver: false }).start();
    } else {
      Animated.timing(micAnim, { toValue: 0, duration: 300, useNativeDriver: false }).start();
    }
  }, [micState]);

  const bottomBarHeight = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [80, SCREEN_HEIGHT * 0.6],
  });

  return (
    <View style={styles.container}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconBtnTop}>
          <Ionicons name="arrow-back" size={28} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.header}>TRANSCRIPTIONS</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")} style={styles.iconBtnTop}>
          <Entypo name="cog" size={27} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Main content */}
      <View style={styles.mainContent}>
        {/* Export buttons */}
        <View style={styles.exportSection}>
          <Text style={styles.exportLabel}>EXPORT FORMAT :</Text>
          <View style={styles.exportRow}>
            <TouchableOpacity style={styles.exportBtn}><Text style={styles.exportBtnText}>PDF</Text></TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn}><Text style={styles.exportBtnText}>WORD</Text></TouchableOpacity>
            <TouchableOpacity style={styles.exportBtn}><Text style={styles.exportBtnText}>FLASH</Text></TouchableOpacity>
          </View>
        </View>

        {/* Transcription box */}
        <View style={styles.transcriptionBox}>
          <Text style={styles.transcriptionText}>TRANSCRIPTION WILL APPEAR HERE</Text>
          <View style={styles.statusRow}>
            <Text style={styles.statusBtn}>READY</Text>
            <Text style={styles.statusBtn}>RECORDING</Text>
            <Text style={styles.statusBtn}>PROCESSING</Text>
          </View>
        </View>

        {/* Microphone */}
        <View style={styles.microphoneArea}>
          <Animated.View
            style={[
              styles.microOuterCircle,
              {
                shadowColor: "#B1B95C",
                shadowOpacity: micAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.8] }),
                shadowRadius: micAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 15] }),
                shadowOffset: { width: 0, height: 0 },
                borderColor: micAnim.interpolate({ inputRange: [0, 1], outputRange: ["#B1B95C", "#FFFF00"] }),
              },
            ]}
          >
            <View style={styles.microInnerCircle}>
              <FontAwesome5 name="microphone" size={48} color={micState === "playing" ? "#FFFF00" : "#203728"} />
            </View>
          </Animated.View>
        </View>

        {/* Controls */}
        <View style={styles.controlsContainer}>
          <TouchableOpacity style={styles.iconBtnCtl} onPress={() => setMicState("playing")}>
            <Ionicons name="play" size={26} color="#203728" />
            <Text style={styles.ctlTxt}>PLAY</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtnCtl} onPress={() => setMicState("paused")}>
            <Ionicons name="pause" size={26} color="#203728" />
            <Text style={styles.ctlTxt}>PAUSE</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconBtnCtl} onPress={() => setMicState("idle")}>
            <Ionicons name="stop-circle" size={26} color="#203728" />
            <Text style={styles.ctlTxt}>STOP/RESET</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Card */}
      <Animated.View style={[styles.bottomBar, { height: bottomBarHeight }]}>
        <TouchableOpacity style={styles.bottomBarContent} onPress={toggleBottomBar}>
          <Text style={styles.leftTxt}>00:14</Text>
          <Text style={styles.rightTxt}>{expanded ? "Swipe down to collapse" : "Swipe up for history"}</Text>
        </TouchableOpacity>
        {expanded && (
          <View style={styles.historyContent}>
            <Text style={styles.historyText}>History of Transcriptions will appear here</Text>
          </View>
        )}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#1c3122" },
  topBar: { flexDirection: "row", alignItems: "center", paddingHorizontal: 30, width: "100%", justifyContent: "space-between", height: 55, marginTop: 14 },
  iconBtnTop: { padding: 2 },
  header: { color: "#fff", fontWeight: "bold", fontSize: 18, letterSpacing: 1.5, textAlign: "center", flex: 1 },
  mainContent: { flex: 1, justifyContent: "space-between", alignItems: "center", width: "100%", paddingTop: 5, paddingBottom: 12 },
  exportSection: { alignItems: "flex-start", width: "88%", marginBottom: 14 },
  exportLabel: { color: "#c9d4ab", fontWeight: "bold", fontSize: 13, marginLeft: 5, marginBottom: 6 },
  exportRow: { flexDirection: "row", marginTop: 2 },
  exportBtn: { backgroundColor: "#B1B95C", borderRadius: 18, paddingVertical: 7, paddingHorizontal: 22, marginHorizontal: 8, elevation: 2 },
  exportBtnText: { fontWeight: "bold", color: "#203728", fontSize: 15 },
  transcriptionBox: { backgroundColor: "#b1b95c", borderRadius: 24, paddingVertical: 30, paddingHorizontal: 22, alignItems: "center", width: "82%", elevation: 2 },
  transcriptionText: { color: "#203728", fontWeight: "bold", fontSize: 15, marginBottom: 230, textAlign: "top" },
  statusRow: { flexDirection: "row", justifyContent: "center", width: "100%" },
  statusBtn: { backgroundColor: "#e4e9d4", borderRadius: 12, paddingHorizontal: 13, paddingVertical: 5, marginHorizontal: 5, fontWeight: "bold", fontSize: 12, color: "#203728", elevation: 2 },
  microphoneArea: { alignItems: "center", justifyContent: "center", marginVertical: 16, width: "100%" },
  microOuterCircle: { width: 200, height: 200, borderRadius: 100, borderWidth: 3, justifyContent: "center", alignItems: "center", backgroundColor: "#203728" },
  microInnerCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#B1B95C", justifyContent: "center", alignItems: "center", elevation: 2 },
  controlsContainer: { flexDirection: "row", justifyContent: "center", width: "100%", marginBottom: 24, marginTop: 10, gap: 12 },
  iconBtnCtl: { backgroundColor: "#B1B95C", borderRadius: 17, width: 66, height: 66, justifyContent: "center", alignItems: "center", elevation: 2 },
  ctlTxt: { color: "#203728", fontWeight: "bold", fontSize: 12, marginTop: 6, textAlign: "center" },
  bottomBar: { backgroundColor: "#B1B95C", width: "100%", borderTopLeftRadius: 20, borderTopRightRadius: 20, elevation: 4, overflow: "hidden" },
  bottomBarContent: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 26, paddingVertical: 18 },
  leftTxt: { color: "#203728", fontWeight: "bold", fontSize: 16 },
  rightTxt: { color: "#203728", fontWeight: "bold", fontSize: 16 },
  historyContent: { paddingHorizontal: 26, paddingVertical: 20 },
  historyText: { color: "#203728", fontSize: 15 },
});
