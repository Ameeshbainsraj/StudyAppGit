// screens/PomodoroScreen.js
import React, { useEffect, useState, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { loadPomodoroSettings } from "../PomodoroConfig";
import { playWorkStart, playBreakEnd } from "../sounds";
import { useFocusEffect } from "@react-navigation/native";


export default function PomodoroScreen({ navigation }) {
  const { theme } = useTheme();

  const [mode, setMode] = useState("work"); // "work" | "short" | "long"
  const [remaining, setRemaining] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [settings, setSettings] = useState(null);

  const intervalRef = useRef(null);

useFocusEffect(
  React.useCallback(() => {
    const load = async () => {
      const s = await loadPomodoroSettings();
      setSettings(s);
      setMode("work");
      setRemaining(s.workMinutes * 60);
      setIsRunning(false); // stop any previous timer
    };
    load();
  }, [])
);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          handleSessionEnd();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isRunning, mode, settings]);

  const handleSessionEnd = async () => {
    setIsRunning(false);
    if (!settings) return;

    if (mode === "work") {
      if (settings.breakEndSound !== "none") {
        await playBreakEnd();
      }
      setMode("short");
      setRemaining(settings.shortBreakMinutes * 60);
    } else {
      if (settings.startSound !== "none") {
        await playWorkStart();
      }
      setMode("work");
      setRemaining(settings.workMinutes * 60);
    }
  };

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  const handleReset = () => {
    if (!settings) return;
    let secs = settings.workMinutes * 60;
    if (mode === "short") secs = settings.shortBreakMinutes * 60;
    if (mode === "long") secs = settings.longBreakMinutes * 60;
    setIsRunning(false);
    setRemaining(secs);
  };

  const setWork = () => {
    if (!settings) return;
    setMode("work");
    setIsRunning(false);
    setRemaining(settings.workMinutes * 60);
  };

  const setShortBreak = () => {
    if (!settings) return;
    setMode("short");
    setIsRunning(false);
    setRemaining(settings.shortBreakMinutes * 60);
  };

  const setLongBreak = () => {
    if (!settings) return;
    setMode("long");
    setIsRunning(false);
    setRemaining(settings.longBreakMinutes * 60);
  };

  const sessionLabel =
    mode === "work" ? "WORK SESSION" : mode === "short" ? "SHORT BREAK" : "LONG BREAK";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Top Bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#111111" />
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 18, color: "#111111" }}>
          POMODORO
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Entypo name="cog" size={30} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Timer Circle */}
        <View
          style={[
            styles.timerCircle,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          <Text
            style={[
              styles.timerText,
              { color: theme.colors.primaryText },
            ]}
          >
            {formatTime(remaining)}
          </Text>
          <Text
            style={[
              styles.focusText,
              { color: theme.colors.primaryText },
            ]}
          >
            {sessionLabel}
          </Text>
        </View>

        {/* Controls */}
        <View style={styles.controlsRow}>
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={() => setIsRunning(true)}
          >
            <Ionicons name="play" size={30} color={theme.colors.primary} />
            <Text style={[styles.ctlTxt, { color: theme.colors.primary }]}>
              PLAY
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={() => setIsRunning(false)}
          >
            <Ionicons name="pause" size={30} color={theme.colors.primary} />
            <Text style={[styles.ctlTxt, { color: theme.colors.primary }]}>
              PAUSE
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={handleReset}
          >
            <Ionicons name="reload" size={30} color={theme.colors.primary} />
            <Text style={[styles.ctlTxt, { color: theme.colors.primary }]}>
              RESET
            </Text>
          </TouchableOpacity>
        </View>

        {/* Short / Long / Work buttons */}
        <View style={styles.shortBtnsRow}>
          <TouchableOpacity
            style={[
              styles.shortBtn,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={setWork}
          >
            <Text
              style={[
                styles.shortBtnTxt,
                { color: theme.colors.primary },
              ]}
            >
              WORK
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.shortBtn,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={setShortBreak}
          >
            <Text
              style={[
                styles.shortBtnTxt,
                { color: theme.colors.primary },
              ]}
            >
              SHORT BREAK
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.shortBtn,
              { backgroundColor: theme.colors.card },
            ]}
            onPress={setLongBreak}
          >
            <Text
              style={[
                styles.shortBtnTxt,
                { color: theme.colors.primary },
              ]}
            >
              LONG BREAK
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bottom Summary Bar */}
      <View
        style={[
          styles.bottomBar,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Text
          style={[
            styles.bottomBarTxt,
            { color: theme.colors.primaryText },
          ]}
        >
          Today: 3 Sessions | 75 min Focused
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "15%",
    marginBottom: 30,
    alignSelf: "center",
    alignItems: "center",
  },
  mainContent: {
    flex: 1,
    alignItems: "center",
    marginTop: "10%",
  },
  timerCircle: {
    width: 220,
    height: 220,
    borderRadius: 110,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  timerText: {
    fontSize: 35,
    fontWeight: "bold",
    letterSpacing: 2,
  },
  focusText: { fontSize: 15, marginTop: 6 },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    marginTop: 10,
  },
  iconBtn: {
    borderRadius: 20,
    marginHorizontal: 12,
    width: 75,
    height: 75,
    justifyContent: "center",
    alignItems: "center",
  },
  ctlTxt: { marginTop: 7, fontWeight: "bold", fontSize: 13 },
  shortBtnsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 30,
    marginTop: 10,
  },
  shortBtn: {
    borderRadius: 18,
    marginHorizontal: 8,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  shortBtnTxt: { fontWeight: "bold", fontSize: 14 },
  bottomBar: {
    width: "100%",
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  bottomBarTxt: { fontWeight: "bold", fontSize: 18 },
});
