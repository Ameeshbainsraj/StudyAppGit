// screens/StudyPlannerScreen.js
import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, Alert, TextInput, Modal,
} from "react-native";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import {
  loadSessions, saveSession, deleteSession,
  toggleSessionDone, createSession, SESSION_COLORS,
} from "../plannerConfig";
import { awardXP, XP_REWARDS } from "../xpConfig"; // ← NEW

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function StudyPlannerScreen({ navigation }) {
  const { theme } = useTheme();

  const C = {
    bg:      theme.colors.background,
    card:    theme.colors.card,
    primary: theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text:    theme.colors.text,
    muted:   theme.colors.mutedText,
    danger:  theme.colors.danger,
    input:   theme.colors.inputBackground,
  };

  const [sessions, setSessions]       = useState([]);
  const [selectedDay, setSelectedDay] = useState(getTodayKey());
  const [showModal, setShowModal]     = useState(false);
  const [newSubject, setNewSubject]   = useState("");
  const [newDuration, setNewDuration] = useState("25");
  const [newColor, setNewColor]       = useState(SESSION_COLORS[0]);

  function getTodayKey() {
    const day = new Date().getDay();
    const map = [6, 0, 1, 2, 3, 4, 5];
    return DAYS[map[day]];
  }

  useFocusEffect(
    useCallback(() => {
      loadSessions().then(setSessions);
    }, [])
  );

  const todaySessions = sessions.filter((s) => s.date === selectedDay);
  const totalMinutes  = todaySessions.reduce((sum, s) => sum + s.durationMinutes, 0);
  const doneSessions  = todaySessions.filter((s) => s.done);

  const handleAddSession = async () => {
    if (!newSubject.trim()) {
      Alert.alert("Missing subject", "Enter a subject name.");
      return;
    }
    const duration = parseInt(newDuration, 10);
    if (isNaN(duration) || duration <= 0) {
      Alert.alert("Invalid duration", "Enter a valid number of minutes.");
      return;
    }
    const session = createSession(newSubject.trim(), selectedDay, duration, newColor);
    const updated = await saveSession(session);
    if (updated) {
      setSessions(updated);
      await awardXP(XP_REWARDS.PLANNER_SESSION); // ← NEW
    }
    setNewSubject("");
    setNewDuration("25");
    setNewColor(SESSION_COLORS[0]);
    setShowModal(false);
  };

  const handleToggle = async (id) => {
    const updated = await toggleSessionDone(id);
    if (updated) setSessions(updated);
  };

  const handleDelete = (id, subject) => {
    Alert.alert("Delete Session", `Delete "${subject}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const updated = await deleteSession(id);
          if (updated) setSessions(updated);
        },
      },
    ]);
  };

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="arrow-back" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={[s.topBarTitle, { color: C.text }]}>STUDY PLANNER</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Entypo name="cog" size={30} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* ── Day selector ─────────────────────────────────────────────────── */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={s.dayRow}
        contentContainerStyle={{ paddingHorizontal: 16, gap: 8 }}
      >
        {DAYS.map((day) => {
          const isSelected  = selectedDay === day;
          const isToday     = day === getTodayKey();
          const daySessions = sessions.filter((s) => s.date === day);
          return (
            <TouchableOpacity
              key={day}
              style={[s.dayBtn, {
                backgroundColor: isSelected ? C.primary : C.card,
                borderColor: isToday && !isSelected ? C.primary : "transparent",
                borderWidth: isToday && !isSelected ? 1.5 : 0,
              }]}
              onPress={() => setSelectedDay(day)}
            >
              <Text style={[s.dayTxt, { color: isSelected ? C.primaryText : C.text }]}>
                {day}
              </Text>
              {daySessions.length > 0 && (
                <View style={[s.dayDot, { backgroundColor: isSelected ? C.primaryText : C.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── Summary card ─────────────────────────────────────────────────── */}
      <View style={[s.summaryCard, { backgroundColor: C.card }]}>
        <View style={s.summaryItem}>
          <Text style={[s.summaryNum, { color: C.primary }]}>{todaySessions.length}</Text>
          <Text style={[s.summaryLabel, { color: C.muted }]}>Sessions</Text>
        </View>
        <View style={[s.summaryDivider, { backgroundColor: C.input }]} />
        <View style={s.summaryItem}>
          <Text style={[s.summaryNum, { color: C.primary }]}>{totalMinutes}</Text>
          <Text style={[s.summaryLabel, { color: C.muted }]}>Minutes</Text>
        </View>
        <View style={[s.summaryDivider, { backgroundColor: C.input }]} />
        <View style={s.summaryItem}>
          <Text style={[s.summaryNum, { color: "#10B981" }]}>{doneSessions.length}</Text>
          <Text style={[s.summaryLabel, { color: C.muted }]}>Done</Text>
        </View>
      </View>

      {/* ── Add session button ────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[s.addBtn, { backgroundColor: C.primary }]}
        onPress={() => setShowModal(true)}
      >
        <Ionicons name="add" size={20} color={C.primaryText} />
        <Text style={[s.addBtnTxt, { color: C.primaryText }]}>Add Session</Text>
      </TouchableOpacity>

      {/* ── Sessions list ─────────────────────────────────────────────────── */}
      <ScrollView
        style={s.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {todaySessions.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: C.card }]}>
            <Text style={{ fontSize: 40 }}>⏰</Text>
            <Text style={[s.emptyTitle, { color: C.text }]}>No sessions planned</Text>
            <Text style={[s.emptySubtitle, { color: C.muted }]}>
              Tap "Add Session" to plan your study time for {selectedDay}
            </Text>
          </View>
        ) : (
          todaySessions.map((session) => (
            <View key={session.id} style={[s.sessionCard, { backgroundColor: C.card }]}>
              <View style={[s.colorStrip, { backgroundColor: session.color }]} />
              <View style={s.sessionContent}>
                <View style={s.sessionTop}>
                  <Text style={[s.sessionSubject, {
                    color: C.text,
                    textDecorationLine: session.done ? "line-through" : "none",
                    opacity: session.done ? 0.5 : 1,
                  }]}>
                    {session.subject}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleDelete(session.id, session.subject)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <MaterialIcons name="delete-outline" size={18} color={C.danger} />
                  </TouchableOpacity>
                </View>
                <View style={s.sessionBottom}>
                  <Text style={[s.sessionDuration, { color: C.muted }]}>
                    ⏱ {session.durationMinutes} min
                  </Text>
                  <View style={s.sessionActions}>
                    <TouchableOpacity
                      style={[s.pomodoroBtn, { backgroundColor: C.primary + "20", borderColor: C.primary + "60" }]}
                      onPress={() => navigation.navigate("Pomodoro")}
                    >
                      <MaterialIcons name="timer" size={13} color={C.primary} />
                      <Text style={[s.pomodoroBtnTxt, { color: C.primary }]}>Start</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[s.doneBtn, {
                        backgroundColor: session.done ? "#10B98120" : C.input,
                        borderColor: session.done ? "#10B981" : C.input,
                      }]}
                      onPress={() => handleToggle(session.id)}
                    >
                      <MaterialIcons
                        name={session.done ? "check-circle" : "radio-button-unchecked"}
                        size={16}
                        color={session.done ? "#10B981" : C.muted}
                      />
                      <Text style={[s.doneBtnTxt, { color: session.done ? "#10B981" : C.muted }]}>
                        {session.done ? "Done" : "Mark done"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* ── Add Session Modal ─────────────────────────────────────────────── */}
      <Modal visible={showModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalCard, { backgroundColor: C.bg }]}>
            <Text style={[s.modalTitle, { color: C.text }]}>Add Session — {selectedDay}</Text>
            <TextInput
              style={[s.modalInput, { backgroundColor: C.card, color: C.text }]}
              placeholder="Subject (e.g. Biology, Maths)"
              placeholderTextColor={C.muted}
              value={newSubject}
              onChangeText={setNewSubject}
            />
            <TextInput
              style={[s.modalInput, { backgroundColor: C.card, color: C.text }]}
              placeholder="Duration in minutes (e.g. 25)"
              placeholderTextColor={C.muted}
              value={newDuration}
              onChangeText={setNewDuration}
              keyboardType="number-pad"
            />
            <Text style={[s.colorLabel, { color: C.muted }]}>Pick a colour:</Text>
            <View style={s.colorRow}>
              {SESSION_COLORS.map((color) => (
                <TouchableOpacity
                  key={color}
                  style={[s.colorDot, { backgroundColor: color }, newColor === color && s.colorDotSelected]}
                  onPress={() => setNewColor(color)}
                />
              ))}
            </View>
            <View style={s.modalBtns}>
              <TouchableOpacity
                style={[s.modalBtn, { borderColor: C.muted }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={[s.modalBtnTxt, { color: C.muted }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.modalBtn, { backgroundColor: C.primary, borderColor: C.primary }]}
                onPress={handleAddSession}
              >
                <Text style={[s.modalBtnTxt, { color: C.primaryText }]}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    width: "90%", flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: "15%", marginBottom: 16, alignSelf: "center",
  },
  topBarTitle: { fontWeight: "bold", fontSize: 18 },
  dayRow: { maxHeight: 60, marginBottom: 14 },
  dayBtn: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 20, alignItems: "center", gap: 4 },
  dayTxt: { fontSize: 13, fontWeight: "700" },
  dayDot: { width: 5, height: 5, borderRadius: 3 },
  summaryCard: {
    flexDirection: "row", marginHorizontal: 16, borderRadius: 16,
    padding: 16, marginBottom: 14, justifyContent: "space-around",
  },
  summaryItem:    { alignItems: "center", gap: 4 },
  summaryNum:     { fontSize: 22, fontWeight: "bold" },
  summaryLabel:   { fontSize: 12 },
  summaryDivider: { width: 1, marginVertical: 4 },
  addBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 8, marginHorizontal: 16, paddingVertical: 12, borderRadius: 14, marginBottom: 16,
  },
  addBtnTxt: { fontSize: 15, fontWeight: "700" },
  list: { flex: 1, paddingHorizontal: 16 },
  emptyCard: { borderRadius: 20, paddingVertical: 50, alignItems: "center", gap: 10 },
  emptyTitle:    { fontSize: 17, fontWeight: "700" },
  emptySubtitle: { fontSize: 13, textAlign: "center", paddingHorizontal: 30 },
  sessionCard: { flexDirection: "row", borderRadius: 16, marginBottom: 10, overflow: "hidden" },
  colorStrip:    { width: 5 },
  sessionContent:{ flex: 1, padding: 14 },
  sessionTop:    { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  sessionSubject:{ fontSize: 15, fontWeight: "700", flex: 1 },
  sessionBottom: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  sessionDuration:{ fontSize: 13 },
  sessionActions: { flexDirection: "row", gap: 8 },
  pomodoroBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  pomodoroBtnTxt: { fontSize: 11, fontWeight: "600" },
  doneBtn: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, borderWidth: 1 },
  doneBtnTxt: { fontSize: 11, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  modalCard:    { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, gap: 14 },
  modalTitle:   { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  modalInput:   { borderRadius: 12, padding: 14, fontSize: 15 },
  colorLabel:   { fontSize: 13 },
  colorRow:     { flexDirection: "row", gap: 12, flexWrap: "wrap" },
  colorDot:     { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: "#fff", transform: [{ scale: 1.15 }] },
  modalBtns:    { flexDirection: "row", gap: 12, marginTop: 4 },
  modalBtn:     { flex: 1, paddingVertical: 14, borderRadius: 14, borderWidth: 1.5, alignItems: "center" },
  modalBtnTxt:  { fontSize: 15, fontWeight: "700" },
});