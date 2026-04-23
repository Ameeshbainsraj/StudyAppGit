// screens/HomeScreen.js
import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, Image, ScrollView, TextInput, Modal,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons, FontAwesome5, Ionicons } from "@expo/vector-icons";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "../ThemeContext";
import {
  loadTasks, saveTask, toggleTask,
  deleteTask, createTask, PRIORITY_COLORS,
} from "../tasksConfig.js";

export default function HomeScreen({ navigation, route }) {
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [name, setName] = useState("USERNAME");
  const { theme } = useTheme();

  const C = {
    bg:      theme.colors.background,
    card:    theme.colors.card,
    primary: theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text:    theme.colors.text,
    muted:   theme.colors.mutedText,
    input:   theme.colors.inputBackground,
    danger:  theme.colors.danger,
  };

  // ── Task state ─────────────────────────────────────────────────────────────
  const [tasks, setTasks]               = useState([]);
  const [showAddTask, setShowAddTask]   = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newPriority, setNewPriority]   = useState("low");

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.fromAuth) Alert.alert("Success", "You're logged in.");
    }, [route])
  );

  useFocusEffect(
    useCallback(() => {
      const fetchUser = async () => {
        try {
          const user = FIREBASE_AUTH.currentUser;
          if (!user) return;
          const ref = doc(FIREBASE_DB, "users", user.uid);
          const snap = await getDoc(ref);
          if (snap.exists()) {
            const data = snap.data();
            if (data.name) setName(data.name);
            if (data.localProfileUri) setProfileImageUrl(data.localProfileUri);
          }
        } catch (err) {
          console.log("Fetch user error:", err);
        }
      };
      fetchUser();
      loadTasks().then(setTasks);
    }, [])
  );

  // ── Add task ───────────────────────────────────────────────────────────────
  const handleAddTask = async () => {
    if (!newTaskTitle.trim()) {
      Alert.alert("Empty task", "Please enter a task title.");
      return;
    }
    const task = createTask(newTaskTitle.trim(), newPriority);
    const updated = await saveTask(task);
    if (updated) setTasks(updated);
    setNewTaskTitle("");
    setNewPriority("low");
    setShowAddTask(false);
  };

  // ── Toggle done ────────────────────────────────────────────────────────────
  const handleToggle = async (id) => {
    const updated = await toggleTask(id);
    if (updated) setTasks(updated);
  };

  // ── Delete task ────────────────────────────────────────────────────────────
  const handleDelete = async (id) => {
    const updated = await deleteTask(id);
    if (updated) setTasks(updated);
  };

  // ── Stats ──────────────────────────────────────────────────────────────────
  const doneTasks  = tasks.filter((t) => t.done).length;
  const totalTasks = tasks.length;

  const stats = [
    { icon: "time-outline",  iconLib: "ion", label: "Focus Today",    value: "0m" },
    { icon: "flame-outline", iconLib: "ion", label: "Sessions Today", value: "0"  },
    { icon: "trending-up",   iconLib: "ion", label: "This Week",      value: "0"  },
  ];

  const quickActions = [
    { label: "Start Focus",  icon: "timer-outline",  iconLib: "ion", route: "Pomodoro"      },
    { label: "Transcribe",   icon: "mic-outline",    iconLib: "ion", route: "Transcription" },
    { label: "Flashcards",   icon: "albums-outline", iconLib: "ion", route: "Flashcards"    },
  ];

  const moreFeatures = [
    { label: "Notes",    icon: "document-text-outline", iconLib: "ion", route: "Notes"        },
    { label: "Quiz",     icon: "help-circle-outline",   iconLib: "ion", route: "Quiz"         },
    { label: "Planner",  icon: "calendar-outline",      iconLib: "ion", route: "StudyPlanner" },
    { label: "Settings", icon: "settings-outline",      iconLib: "ion", route: "Settings"     },
  ];

  const renderIcon = (icon, iconLib, size, color) => {
    if (iconLib === "ion") return <Ionicons name={icon} size={size} color={color} />;
    if (iconLib === "fa5") return <FontAwesome5 name={icon} size={size} color={color} />;
    return <MaterialIcons name={icon} size={size} color={color} />;
  };

  const initials = name ? name.charAt(0).toUpperCase() : "U";

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >

        {/* ── Header ─────────────────────────────────────────────────────── */}
        <View style={s.header}>
          <View style={s.headerLeft}>
            <Text style={[s.welcomeTxt, { color: C.muted }]}>Welcome back,</Text>
            <Text style={[s.nameTxt, { color: C.text }]}>{name.toUpperCase()}</Text>
          </View>
          <TouchableOpacity
            style={[s.avatar, { backgroundColor: C.primary }]}
            onPress={() => navigation.navigate("Settings")}
          >
            {profileImageUrl ? (
              <Image source={{ uri: profileImageUrl }} style={s.avatarImg} />
            ) : (
              <Text style={[s.avatarInitial, { color: C.primaryText }]}>{initials}</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* ── Stats Row ──────────────────────────────────────────────────── */}
        <View style={s.statsRow}>
          {stats.map((stat, i) => (
            <View key={i} style={[s.statCard, { backgroundColor: C.card }]}>
              {renderIcon(stat.icon, stat.iconLib, 22, C.primary)}
              <Text style={[s.statValue, { color: C.text }]}>{stat.value}</Text>
              <Text style={[s.statLabel, { color: C.muted }]}>{stat.label}</Text>
            </View>
          ))}
        </View>

        {/* ── Today's Tasks header ────────────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={[s.sectionTitle, { color: C.text }]}>Today's Tasks</Text>
          <TouchableOpacity
            style={[s.addBtn, { backgroundColor: C.primary }]}
            onPress={() => setShowAddTask(!showAddTask)}
          >
            <Ionicons name={showAddTask ? "close" : "add"} size={20} color={C.primaryText} />
          </TouchableOpacity>
        </View>

        {/* ── Add Task inline form — matches screenshot ─────────────────── */}
        {showAddTask && (
          <View style={[s.addTaskCard, { backgroundColor: C.card }]}>
            <Text style={[s.addTaskTitle, { color: C.text }]}>Add New Task</Text>

            <TextInput
              style={[s.taskInput, { backgroundColor: C.input, color: C.text }]}
              placeholder="Task title..."
              placeholderTextColor={C.muted}
              value={newTaskTitle}
              onChangeText={setNewTaskTitle}
              maxLength={80}
            />

            {/* Priority selector */}
            <View style={s.priorityRow}>
              {[
                { key: "low",    label: "Low",    color: PRIORITY_COLORS.low    },
                { key: "medium", label: "Medium", color: PRIORITY_COLORS.medium },
                { key: "high",   label: "High",   color: PRIORITY_COLORS.high   },
              ].map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    s.priorityBtn,
                    {
                      borderColor: p.color,
                      backgroundColor: newPriority === p.key ? p.color + "25" : "transparent",
                    },
                  ]}
                  onPress={() => setNewPriority(p.key)}
                >
                  <Text style={[s.priorityTxt, { color: p.color, fontWeight: newPriority === p.key ? "700" : "500" }]}>
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Action buttons */}
            <View style={s.addTaskBtns}>
              <TouchableOpacity
                style={[s.cancelBtn, { backgroundColor: C.input }]}
                onPress={() => { setShowAddTask(false); setNewTaskTitle(""); setNewPriority("low"); }}
              >
                <Text style={[s.cancelTxt, { color: C.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[s.confirmBtn, { backgroundColor: C.primary }]}
                onPress={handleAddTask}
              >
                <Text style={[s.confirmTxt, { color: C.primaryText }]}>Add Task</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Task list ──────────────────────────────────────────────────── */}
        {!showAddTask && (
          tasks.length === 0 ? (
            <View style={[s.emptyTasksCard, { backgroundColor: C.card }]}>
              <Ionicons name="clipboard-outline" size={44} color={C.muted} />
              <Text style={[s.emptyTasksTxt, { color: C.muted }]}>
                No tasks yet. Add one to get started!
              </Text>
            </View>
          ) : (
            <View style={[s.tasksCard, { backgroundColor: C.card }]}>
              {/* Progress bar */}
              {totalTasks > 0 && (
                <View style={s.progressWrap}>
                  <Text style={[s.progressTxt, { color: C.muted }]}>
                    {doneTasks}/{totalTasks} done
                  </Text>
                  <View style={[s.progressBar, { backgroundColor: C.input }]}>
                    <View
                      style={[
                        s.progressFill,
                        { backgroundColor: C.primary, width: `${(doneTasks / totalTasks) * 100}%` },
                      ]}
                    />
                  </View>
                </View>
              )}

              {tasks.map((task, i) => (
                <View
                  key={task.id}
                  style={[
                    s.taskRow,
                    i < tasks.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.input },
                  ]}
                >
                  {/* Priority dot */}
                  <View style={[s.priorityDot, { backgroundColor: PRIORITY_COLORS[task.priority] }]} />

                  {/* Tick button */}
                  <TouchableOpacity
                    onPress={() => handleToggle(task.id)}
                    style={[
                      s.tickBtn,
                      {
                        borderColor: task.done ? C.primary : C.muted,
                        backgroundColor: task.done ? C.primary : "transparent",
                      },
                    ]}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    {task.done && <Ionicons name="checkmark" size={12} color={C.primaryText} />}
                  </TouchableOpacity>

                  {/* Task title */}
                  <Text
                    style={[
                      s.taskTitle,
                      {
                        color: task.done ? C.muted : C.text,
                        textDecorationLine: task.done ? "line-through" : "none",
                        flex: 1,
                      },
                    ]}
                    numberOfLines={2}
                  >
                    {task.title}
                  </Text>

                  {/* Priority badge */}
                  <View style={[s.priorityBadge, { backgroundColor: PRIORITY_COLORS[task.priority] + "20" }]}>
                    <Text style={[s.priorityBadgeTxt, { color: PRIORITY_COLORS[task.priority] }]}>
                      {task.priority}
                    </Text>
                  </View>

                  {/* Delete button */}
                  <TouchableOpacity
                    onPress={() => handleDelete(task.id)}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Ionicons name="trash-outline" size={16} color={C.muted} />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )
        )}

        {/* ── Quick Actions ───────────────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { color: C.text, marginHorizontal: 20, marginBottom: 12, marginTop: 24 }]}>
          Quick Actions
        </Text>
        <View style={s.quickRow}>
          {quickActions.map((action, i) => (
            <TouchableOpacity
              key={i}
              style={[s.quickCard, { backgroundColor: C.card }]}
              onPress={() => navigation.navigate(action.route)}
              activeOpacity={0.8}
            >
              {renderIcon(action.icon, action.iconLib, 28, C.primary)}
              <Text style={[s.quickLabel, { color: C.text }]}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── More Features ───────────────────────────────────────────────── */}
        <Text style={[s.sectionTitle, { color: C.text, marginHorizontal: 20, marginTop: 24, marginBottom: 12 }]}>
          More Features
        </Text>
        <View style={s.moreRow}>
          {moreFeatures.map((f, i) => (
            <TouchableOpacity
              key={i}
              style={[s.moreCard, { backgroundColor: C.card }]}
              onPress={() => navigation.navigate(f.route)}
              activeOpacity={0.8}
            >
              {renderIcon(f.icon, f.iconLib, 24, C.primary)}
              <Text style={[s.moreLabel, { color: C.text }]}>{f.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: "14%", paddingBottom: 20,
  },
  headerLeft:    { flex: 1 },
  welcomeTxt:    { fontSize: 14, marginBottom: 4 },
  nameTxt:       { fontSize: 26, fontWeight: "900", letterSpacing: 1 },
  avatar: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: "center", alignItems: "center", overflow: "hidden",
  },
  avatarImg:     { width: "100%", height: "100%", resizeMode: "cover" },
  avatarInitial: { fontSize: 20, fontWeight: "bold" },

  statsRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10, marginBottom: 24 },
  statCard:  { flex: 1, borderRadius: 16, padding: 14, alignItems: "flex-start", gap: 6 },
  statValue: { fontSize: 22, fontWeight: "bold" },
  statLabel: { fontSize: 11 },

  sectionHeader: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, marginBottom: 12,
  },
  sectionTitle: { fontSize: 20, fontWeight: "bold" },
  addBtn: {
    width: 34, height: 34, borderRadius: 17,
    justifyContent: "center", alignItems: "center",
  },

  // Add task form — matches screenshot
  addTaskCard: {
    marginHorizontal: 16, borderRadius: 20,
    padding: 20, gap: 16, marginBottom: 16,
  },
  addTaskTitle: { fontSize: 20, fontWeight: "bold" },
  taskInput: {
    borderRadius: 14, paddingHorizontal: 16,
    paddingVertical: 14, fontSize: 15,
  },
  priorityRow: { flexDirection: "row", gap: 10 },
  priorityBtn: {
    flex: 1, paddingVertical: 12, borderRadius: 12,
    borderWidth: 1.5, alignItems: "center",
  },
  priorityTxt: { fontSize: 14 },
  addTaskBtns: { flexDirection: "row", gap: 12 },
  cancelBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: "center",
  },
  cancelTxt:  { fontSize: 15, fontWeight: "600" },
  confirmBtn: {
    flex: 1, paddingVertical: 14, borderRadius: 14,
    alignItems: "center",
  },
  confirmTxt: { fontSize: 15, fontWeight: "700" },

  // Empty state
  emptyTasksCard: {
    marginHorizontal: 16, borderRadius: 18,
    paddingVertical: 40, alignItems: "center",
    gap: 12, marginBottom: 8,
  },
  emptyTasksTxt: { fontSize: 14 },

  // Task list card
  tasksCard: {
    marginHorizontal: 16, borderRadius: 18,
    paddingVertical: 4, marginBottom: 8,
    overflow: "hidden",
  },
  progressWrap: { paddingHorizontal: 16, paddingVertical: 12, gap: 6 },
  progressTxt:  { fontSize: 12, textAlign: "right" },
  progressBar:  { height: 4, borderRadius: 2, overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 2 },

  taskRow: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 10,
  },
  priorityDot: { width: 6, height: 6, borderRadius: 3 },
  tickBtn: {
    width: 22, height: 22, borderRadius: 11,
    borderWidth: 1.5, justifyContent: "center", alignItems: "center",
  },
  taskTitle: { fontSize: 14, lineHeight: 20 },
  priorityBadge: {
    paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8,
  },
  priorityBadgeTxt: { fontSize: 10, fontWeight: "700", textTransform: "uppercase" },

  // Quick actions
  quickRow: { flexDirection: "row", paddingHorizontal: 16, gap: 10 },
  quickCard: {
    flex: 1, borderRadius: 18, paddingVertical: 22,
    paddingHorizontal: 8, alignItems: "center", gap: 10,
  },
  quickLabel: { fontSize: 13, fontWeight: "700", textAlign: "center" },

  // More features
  moreRow: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 16, gap: 10 },
  moreCard: {
    width: "47%", borderRadius: 16,
    paddingVertical: 18, paddingHorizontal: 14,
    flexDirection: "row", alignItems: "center", gap: 12,
  },
  moreLabel: { fontSize: 14, fontWeight: "600" },
});