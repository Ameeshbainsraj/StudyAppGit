// screens/PomodoroScreen.js
import React, { useEffect, useState, useRef, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Animated, Easing,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { loadPomodoroSettings } from "../PomodoroConfig";
import { playWorkStart, playBreakEnd } from "../sounds";
import { useFocusEffect } from "@react-navigation/native";
import { awardXP, XP_REWARDS } from "../xpConfig";
import { FIREBASE_DB, FIREBASE_AUTH } from "../FirebaseConfig";
import { collection, addDoc, getDocs } from "firebase/firestore";

// ── Animated ring progress ────────────────────────────────────────────────────
function RingProgress({ progress, size, strokeWidth, color, bgColor }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const anim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress, duration: 600,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, [progress]);

  const strokeDashoffset = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ width: size, height: size }}>
      <Animated.View
        style={{
          position: "absolute", width: size, height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: bgColor,
        }}
      />
      {/* We fake the SVG arc with a rotating overlay approach */}
      <Animated.View
        style={{
          position: "absolute", width: size, height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: color,
          borderRightColor: "transparent",
          borderBottomColor: "transparent",
          transform: [{
            rotate: anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: ["-90deg", "0deg", "270deg"],
            }),
          }],
        }}
      />
      <Animated.View
        style={{
          position: "absolute", width: size, height: size,
          borderRadius: size / 2,
          borderWidth: strokeWidth,
          borderColor: anim.interpolate({
            inputRange: [0, 0.499, 0.5, 1],
            outputRange: ["transparent", "transparent", color, color],
          }),
          borderLeftColor: "transparent",
          borderTopColor: "transparent",
          transform: [{ rotate: "-90deg" }],
        }}
      />
    </View>
  );
}

export default function PomodoroScreen({ navigation }) {
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const C = {
    bg:          theme.colors.background,
    card:        theme.colors.card,
    primary:     theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text:        theme.colors.text,
    muted:       theme.colors.mutedText,
    input:       theme.colors.inputBackground,
    danger:      theme.colors.danger,
  };

  const [mode, setMode]                   = useState("work");
  const [remaining, setRemaining]         = useState(25 * 60);
  const [totalSecs, setTotalSecs]         = useState(25 * 60);
  const [isRunning, setIsRunning]         = useState(false);
  const [settings, setSettings]           = useState(null);
  const [todaySessions, setTodaySessions] = useState(0);
  const [todayMinutes, setTodayMinutes]   = useState(0);

  const intervalRef  = useRef(null);
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const entryAnim    = useRef(new Animated.Value(0)).current;

  useFocusEffect(
    useCallback(() => {
      const load = async () => {
        const s = await loadPomodoroSettings();
        setSettings(s);
        setMode("work");
        const secs = s.workMinutes * 60;
        setRemaining(secs);
        setTotalSecs(secs);
        setIsRunning(false);
        await loadTodayStats();
      };
      load();
      Animated.timing(entryAnim, {
        toValue: 1, duration: 500,
        easing: Easing.out(Easing.cubic), useNativeDriver: true,
      }).start();
    }, [])
  );

  // Pulse while running
  useEffect(() => {
    if (isRunning) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.06, duration: 900, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 900, useNativeDriver: true }),
        ])
      ).start();
    } else {
      pulseAnim.stopAnimation();
      pulseAnim.setValue(1);
    }
  }, [isRunning]);

  // ── Load today's sessions ──────────────────────────────────────────────────
  const loadTodayStats = async () => {
    try {
      const uid = FIREBASE_AUTH.currentUser?.uid;
      if (!uid) return;
      const snap = await getDocs(collection(FIREBASE_DB, "users", uid, "pomodoroSessions"));
      const todayStr = new Date().toISOString().slice(0, 10);
      let sessions = 0, minutes = 0;
      snap.forEach((doc) => {
        const { durationMinutes, completedAt } = doc.data();
        if (!completedAt || !durationMinutes) return;
        if (completedAt.slice(0, 10) === todayStr) {
          sessions += 1;
          minutes  += durationMinutes;
        }
      });
      setTodaySessions(sessions);
      setTodayMinutes(minutes);
    } catch (e) { console.log("loadTodayStats error:", e); }
  };

  useEffect(() => {
    if (!isRunning) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
      return;
    }
    intervalRef.current = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) { handleSessionEnd(); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [isRunning, mode, settings]);

  // ── Save & end session ─────────────────────────────────────────────────────
  const saveSessionRecord = async (durationMinutes) => {
    try {
      const uid = FIREBASE_AUTH.currentUser?.uid;
      if (!uid) return;
      await addDoc(collection(FIREBASE_DB, "users", uid, "pomodoroSessions"), {
        durationMinutes,
        completedAt: new Date().toISOString(),
        type: "work",
      });
    } catch (e) { console.log("saveSessionRecord error:", e); }
  };

  const handleSessionEnd = async () => {
    setIsRunning(false);
    if (!settings) return;
    if (mode === "work") {
      await saveSessionRecord(settings.workMinutes);
      await loadTodayStats();
      const { leveledUp, newLevel } = await awardXP(XP_REWARDS.POMODORO_SESSION);
      if (leveledUp && newLevel) {
        Alert.alert(
          "🎉 Level Up!",
          `You reached Level ${newLevel.level}\n"${newLevel.title}"\n\nYour focus is paying off!`,
          [{ text: "Let's Go! 🚀" }]
        );
      }
      if (settings.breakEndSound !== "none") await playBreakEnd();
      const secs = settings.shortBreakMinutes * 60;
      setMode("short");
      setRemaining(secs);
      setTotalSecs(secs);
    } else {
      if (settings.startSound !== "none") await playWorkStart();
      const secs = settings.workMinutes * 60;
      setMode("work");
      setRemaining(secs);
      setTotalSecs(secs);
    }
  };

  const handleReset = () => {
    if (!settings) return;
    let secs = settings.workMinutes * 60;
    if (mode === "short") secs = settings.shortBreakMinutes * 60;
    if (mode === "long")  secs = settings.longBreakMinutes * 60;
    setIsRunning(false);
    setRemaining(secs);
    setTotalSecs(secs);
  };

  const switchMode = (m) => {
    if (!settings) return;
    let secs = settings.workMinutes * 60;
    if (m === "short") secs = settings.shortBreakMinutes * 60;
    if (m === "long")  secs = settings.longBreakMinutes * 60;
    setMode(m);
    setIsRunning(false);
    setRemaining(secs);
    setTotalSecs(secs);
  };

  const formatTime = (sec) =>
    `${Math.floor(sec / 60).toString().padStart(2, "0")}:${(sec % 60).toString().padStart(2, "0")}`;

  const progress = totalSecs > 0 ? 1 - remaining / totalSecs : 0;

  const modeConfig = {
    work:  { label: "Focus",       color: C.primary,  sub: "Stay locked in" },
    short: { label: "Short Break", color: "#10B981",  sub: "Breathe & rest" },
    long:  { label: "Long Break",  color: "#F59E0B",  sub: "You've earned it" },
  };
  const mc = modeConfig[mode];

  const RING_SIZE = 240;
  const RING_STROKE = 8;

  return (
    <SafeAreaView style={[s.root, { backgroundColor: C.bg }]} edges={["top"]}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.header,
          {
            opacity: entryAnim,
            transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [-10, 0] }) }],
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={[s.headerBtn, { backgroundColor: C.card }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={20} color={C.text} />
        </TouchableOpacity>

        <View style={s.headerCenter}>
          <Text style={[s.headerTitle, { color: C.text }]}>Pomodoro</Text>
          <Text style={[s.headerSub, { color: C.muted }]}>Shepard Learn</Text>
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate("Settings")}
          style={[s.headerBtn, { backgroundColor: C.card }]}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="settings-outline" size={20} color={C.text} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Mode pills ─────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.modePills,
          {
            opacity: entryAnim,
            transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [10, 0] }) }],
          },
        ]}
      >
        {[
          { key: "work",  label: "Focus" },
          { key: "short", label: "Short break" },
          { key: "long",  label: "Long break" },
        ].map(({ key, label }) => (
          <TouchableOpacity
            key={key}
            style={[
              s.modePill,
              { backgroundColor: mode === key ? mc.color + "18" : C.card },
              mode === key && { borderColor: mc.color, borderWidth: 1 },
            ]}
            onPress={() => switchMode(key)}
          >
            <Text
              style={[
                s.modePillTxt,
                { color: mode === key ? mc.color : C.muted },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        ))}
      </Animated.View>

      {/* ── Timer ring ─────────────────────────────────────────────────── */}
      <Animated.View style={[s.ringWrap, { transform: [{ scale: pulseAnim }] }]}>
        {/* Outer glow ring */}
        <View
          style={[
            s.ringGlow,
            {
              width: RING_SIZE + 32,
              height: RING_SIZE + 32,
              borderRadius: (RING_SIZE + 32) / 2,
              backgroundColor: mc.color + "0D",
            },
          ]}
        />

        {/* Track ring */}
        <View
          style={[
            s.ringTrack,
            {
              width: RING_SIZE, height: RING_SIZE,
              borderRadius: RING_SIZE / 2,
              borderWidth: RING_STROKE,
              borderColor: mc.color + "20",
            },
          ]}
        />

        {/* Progress arc — simple border-based quarter arcs */}
        <ProgressArc
          progress={progress}
          size={RING_SIZE}
          stroke={RING_STROKE}
          color={mc.color}
        />

        {/* Center content */}
        <View style={s.ringCenter}>
          <Text style={[s.timerText, { color: C.text }]}>
            {formatTime(remaining)}
          </Text>
          <View style={[s.modeLabelWrap, { backgroundColor: mc.color + "18" }]}>
            <Text style={[s.modeLabel, { color: mc.color }]}>{mc.label}</Text>
          </View>
          <Text style={[s.modeSub, { color: C.muted }]}>{mc.sub}</Text>
        </View>
      </Animated.View>

      {/* ── Controls ───────────────────────────────────────────────────── */}
      <Animated.View
        style={[
          s.controls,
          {
            opacity: entryAnim,
            transform: [{ translateY: entryAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }],
          },
        ]}
      >
        <TouchableOpacity
          style={[s.ctrlBtn, { backgroundColor: C.card }]}
          onPress={handleReset}
        >
          <Ionicons name="reload" size={22} color={C.muted} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.playBtn, { backgroundColor: mc.color }]}
          onPress={() => setIsRunning((r) => !r)}
          activeOpacity={0.85}
        >
          <Ionicons
            name={isRunning ? "pause" : "play"}
            size={30}
            color="#fff"
            style={!isRunning && { marginLeft: 3 }}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[s.ctrlBtn, { backgroundColor: C.card }]}
          onPress={() => switchMode(mode === "work" ? "short" : "work")}
        >
          <Ionicons name="arrow-forward" size={22} color={C.muted} />
        </TouchableOpacity>
      </Animated.View>

      {/* ── Stats bar ──────────────────────────────────────────────────── */}
      <View
        style={[
          s.statsBar,
          {
            backgroundColor: C.card,
            paddingBottom: insets.bottom + 16,
          },
        ]}
      >
        <StatBlock
          value={todaySessions}
          label={todaySessions === 1 ? "Session" : "Sessions"}
          color={mc.color}
          textColor={C.text}
          mutedColor={C.muted}
        />
        <View style={[s.statsDivider, { backgroundColor: C.input }]} />
        <StatBlock
          value={`${todayMinutes}m`}
          label="Focused today"
          color={mc.color}
          textColor={C.text}
          mutedColor={C.muted}
        />
        <View style={[s.statsDivider, { backgroundColor: C.input }]} />
        <StatBlock
          value={`${Math.round(progress * 100)}%`}
          label="This session"
          color={mc.color}
          textColor={C.text}
          mutedColor={C.muted}
        />
      </View>

    </SafeAreaView>
  );
}

// ── Progress arc using border trick ───────────────────────────────────────────
function ProgressArc({ progress, size, stroke, color }) {
  const anim = useRef(new Animated.Value(progress)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: progress, duration: 800,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, [progress]);

  const deg = anim.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  return (
    <View
      style={{
        position: "absolute", width: size, height: size,
        borderRadius: size / 2, overflow: "hidden",
      }}
    >
      {/* Left half */}
      <Animated.View
        style={{
          position: "absolute", width: size / 2, height: size,
          left: 0,
          borderTopLeftRadius: size / 2,
          borderBottomLeftRadius: size / 2,
          borderWidth: stroke,
          borderRightWidth: 0,
          borderColor: color,
          transformOrigin: "right center",
          transform: [{
            rotate: anim.interpolate({
              inputRange: [0, 0.5, 0.5001, 1],
              outputRange: ["-180deg", "0deg", "-180deg", "-180deg"],
            }),
          }],
        }}
      />
      {/* Right half */}
      <Animated.View
        style={{
          position: "absolute", width: size / 2, height: size,
          right: 0,
          borderTopRightRadius: size / 2,
          borderBottomRightRadius: size / 2,
          borderWidth: stroke,
          borderLeftWidth: 0,
          borderColor: color,
          transformOrigin: "left center",
          transform: [{
            rotate: anim.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: ["-180deg", "-180deg", "0deg"],
            }),
          }],
        }}
      />
    </View>
  );
}

// ── Stat block ────────────────────────────────────────────────────────────────
function StatBlock({ value, label, color, textColor, mutedColor }) {
  return (
    <View style={s.statBlock}>
      <Text style={[s.statValue, { color: textColor }]}>{value}</Text>
      <Text style={[s.statLabel, { color: mutedColor }]}>{label}</Text>
    </View>
  );
}

// ── Styles ────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, gap: 12,
  },
  headerBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: "center", alignItems: "center",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "800", letterSpacing: 0.2 },
  headerSub:   { fontSize: 11, marginTop: 1 },

  modePills: {
    flexDirection: "row", justifyContent: "center",
    gap: 8, paddingHorizontal: 16, marginBottom: 28,
  },
  modePill: {
    paddingHorizontal: 14, paddingVertical: 7,
    borderRadius: 99, borderWidth: 1,
    borderColor: "transparent",
  },
  modePillTxt: { fontSize: 12, fontWeight: "600" },

  ringWrap: {
    alignSelf: "center",
    alignItems: "center", justifyContent: "center",
    marginBottom: 36,
    width: 272, height: 272,
  },
  ringGlow: {
    position: "absolute",
  },
  ringTrack: {
    position: "absolute",
  },
  ringCenter: {
    position: "absolute",
    alignItems: "center", justifyContent: "center",
    gap: 6,
  },
  timerText: {
    fontSize: 46, fontWeight: "800", letterSpacing: 2,
    fontVariant: ["tabular-nums"],
  },
  modeLabelWrap: {
    paddingHorizontal: 12, paddingVertical: 4,
    borderRadius: 99, marginTop: 2,
  },
  modeLabel: { fontSize: 12, fontWeight: "700" },
  modeSub:   { fontSize: 12 },

  controls: {
    flexDirection: "row", alignItems: "center",
    justifyContent: "center", gap: 20, marginBottom: 32,
  },
  ctrlBtn: {
    width: 52, height: 52, borderRadius: 16,
    justifyContent: "center", alignItems: "center",
  },
  playBtn: {
    width: 72, height: 72, borderRadius: 22,
    justifyContent: "center", alignItems: "center",
    shadowOpacity: 0.3, shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 }, elevation: 8,
  },

  statsBar: {
    flexDirection: "row", alignItems: "center",
    paddingTop: 16, paddingHorizontal: 16,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    marginTop: "auto",
  },
  statBlock: { flex: 1, alignItems: "center", paddingVertical: 4 },
  statValue: { fontSize: 20, fontWeight: "800", marginBottom: 2 },
  statLabel: { fontSize: 11 },
  statsDivider: { width: 1, height: 32, borderRadius: 1 },
});