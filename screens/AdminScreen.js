// screens/AdminScreen.js
import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Image,
  TextInput, Alert, Platform, Keyboard,
  Switch, KeyboardAvoidingView, SafeAreaView, Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle, G } from "react-native-svg";
import { useFocusEffect } from "@react-navigation/native";
import { FIREBASE_DB, FIREBASE_AUTH } from "../FirebaseConfig";
import {
  collection, getDocs, doc,
  updateDoc, deleteDoc, serverTimestamp, setDoc,
} from "firebase/firestore";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useTheme } from "../ThemeContext";

const { width: SCREEN_W } = Dimensions.get("window");

// ── Helpers ────────────────────────────────────────────────────────────────
function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const AVATAR_COLORS = [
  "#7C3AED","#3B82F6","#10B981","#F59E0B",
  "#EF4444","#EC4899","#06B6D4","#84CC16",
];
function avatarColor(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const EMPTY_FORM = {
  name: "", email: "", xp: "",
  isAdmin: false, password: "", showPassword: false,
};

const TABS = [
  { key: "users",     label: "USERS",     icon: "people-outline"    },
  { key: "analytics", label: "ANALYTICS", icon: "analytics-outline" },
];

// ── Donut Chart ─────────────────────────────────────────────────────────────
function DonutChart({ segments, size = 190, strokeWidth = 26, centerLabel, centerSub, C }) {
  const radius      = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const cx = size / 2, cy = size / 2;
  const total = segments.reduce((s, seg) => s + seg.value, 0);

  if (total === 0) {
    return (
      <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
        <Svg width={size} height={size}>
          <Circle cx={cx} cy={cy} r={radius} fill="none" stroke={C.border} strokeWidth={strokeWidth} />
        </Svg>
        <View style={[StyleSheet.absoluteFill, { justifyContent: "center", alignItems: "center" }]}>
          <Text style={{ color: C.muted, fontSize: 12 }}>No data</Text>
        </View>
      </View>
    );
  }

  let cumulativePct = 0;
  const arcs = segments.map((seg) => {
    const pct       = seg.value / total;
    const dashArray = `${pct * circumference} ${circumference}`;
    const rotation  = -90 + cumulativePct * 360;
    cumulativePct  += pct;
    return { ...seg, dashArray, rotation };
  });

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size}>
        <Circle cx={cx} cy={cy} r={radius} fill="none" stroke={C.border} strokeWidth={strokeWidth} />
        {arcs.map((arc, i) => (
          <G key={i} rotation={arc.rotation} origin={`${cx}, ${cy}`}>
            <Circle
              cx={cx} cy={cy} r={radius} fill="none"
              stroke={arc.color} strokeWidth={strokeWidth}
              strokeDasharray={arc.dashArray} strokeLinecap="butt"
            />
          </G>
        ))}
      </Svg>
      <View style={[StyleSheet.absoluteFill, { justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ fontSize: 24, fontWeight: "900", color: C.text, lineHeight: 28 }}>
          {centerLabel}
        </Text>
        <Text style={{ fontSize: 10, color: C.muted, marginTop: 2, letterSpacing: 0.5 }}>
          {centerSub}
        </Text>
      </View>
    </View>
  );
}

// ── Main Component ──────────────────────────────────────────────────────────
export default function AdminScreen({ navigation }) {
  const { theme } = useTheme();
  const C = {
    bg:          theme.colors.background,
    card:        theme.colors.card,
    primary:     theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text:        theme.colors.text,
    muted:       theme.colors.mutedText,
    border:      theme.colors.border || theme.colors.primary + "30",
  };

  const [activeTab,     setActiveTab]     = useState("users");
  const [loading,       setLoading]       = useState(true);
  const [users,         setUsers]         = useState([]);
  const [featureUsage,  setFeatureUsage]  = useState({
    transcriptions: 0, notes: 0, flashcardDecks: 0, sessions: 0, tasks: 0,
  });
  const [panelOpen,     setPanelOpen]     = useState(false);
  const [panelMode,     setPanelMode]     = useState("create");
  const [selectedUser,  setSelectedUser]  = useState(null);
  const [form,          setForm]          = useState(EMPTY_FORM);
  const [saving,        setSaving]        = useState(false);
  const [activeSegment, setActiveSegment] = useState(null);

  useFocusEffect(useCallback(() => { loadAdminData(); }, []));

  // ── Load ──────────────────────────────────────────────────────────────────
  const loadAdminData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(FIREBASE_DB, "users"));
      const userList  = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(userList);

      let totalTranscriptions = 0, totalSessions = 0,
          totalNotes = 0, totalDecks = 0, totalTasks = 0;

      await Promise.all(userList.map(async (user) => {
        const [t, s, n, f, tk] = await Promise.all([
          getDocs(collection(FIREBASE_DB, "users", user.id, "transcriptions")),
          getDocs(collection(FIREBASE_DB, "users", user.id, "sessions")),
          getDocs(collection(FIREBASE_DB, "users", user.id, "notes")),
          getDocs(collection(FIREBASE_DB, "users", user.id, "flashcardDecks")),
          getDocs(collection(FIREBASE_DB, "users", user.id, "tasks")),
        ]);
        totalTranscriptions += t.size; totalSessions += s.size;
        totalNotes += n.size; totalDecks += f.size; totalTasks += tk.size;
      }));

      setFeatureUsage({
        transcriptions: totalTranscriptions, notes: totalNotes,
        flashcardDecks: totalDecks, sessions: totalSessions, tasks: totalTasks,
      });
    } catch (e) {
      console.log("loadAdminData error:", e);
      Alert.alert("Error", "Failed to load admin data.");
    } finally {
      setLoading(false);
    }
  };

  // ── Panel helpers ──────────────────────────────────────────────────────────
  const openCreate = () => {
    setPanelMode("create"); setSelectedUser(null); setForm(EMPTY_FORM); setPanelOpen(true);
  };
  const openEdit = (user) => {
    setPanelMode("edit"); setSelectedUser(user);
    setForm({ name: user.name || "", email: user.email || "", xp: String(user.xp ?? ""), isAdmin: user.isAdmin || false, password: "", showPassword: false });
    setPanelOpen(true);
  };
  const closePanel = () => { Keyboard.dismiss(); setPanelOpen(false); };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      Alert.alert("Required Fields", "Please fill in both name and email."); return;
    }
    if (panelMode === "create" && form.password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters."); return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(), email: form.email.trim(),
        xp: parseInt(form.xp) || 0, isAdmin: form.isAdmin,
      };
      if (panelMode === "create") {
        const credential = await createUserWithEmailAndPassword(FIREBASE_AUTH, form.email.trim(), form.password);
        payload.createdAt = serverTimestamp();
        await setDoc(doc(FIREBASE_DB, "users", credential.user.uid), payload);
      } else {
        await updateDoc(doc(FIREBASE_DB, "users", selectedUser.id), payload);
      }
      closePanel(); await loadAdminData();
    } catch (e) {
      const msg =
        e.code === "auth/email-already-in-use" ? "That email is already registered."    :
        e.code === "auth/invalid-email"         ? "Please enter a valid email address."  :
        e.code === "auth/weak-password"         ? "Password must be at least 6 characters." :
        "Failed to save. Please try again.";
      Alert.alert("Error", msg);
    } finally { setSaving(false); }
  };

  const handleDelete = (user) => {
    Alert.alert("Delete User", `Remove "${user.name || user.email}"?\nThis cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: async () => {
        try { await deleteDoc(doc(FIREBASE_DB, "users", user.id)); await loadAdminData(); }
        catch { Alert.alert("Error", "Failed to delete user."); }
      }},
    ]);
  };

  // ── Avatar ────────────────────────────────────────────────────────────────
  const UserAvatar = ({ user, size = 48 }) => {
    const imageData = user.profileImageUrl || user.profileImageBase64 || user.localProfileUri || null;
    const initials  = getInitials(user.name || user.email);
    const bg        = avatarColor(user.id || user.name || "");
    if (imageData) {
      const uri = imageData.startsWith("data:") || imageData.startsWith("file:") || imageData.startsWith("http")
        ? imageData : `data:image/jpeg;base64,${imageData}`;
      return <Image source={{ uri }} style={{ width: size, height: size, borderRadius: size / 2 }} />;
    }
    return (
      <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ fontSize: size * 0.36, fontWeight: "800", color: "#fff" }}>{initials}</Text>
      </View>
    );
  };

  // ── Analytics data ─────────────────────────────────────────────────────────
  const totalInteractions = Object.values(featureUsage).reduce((a, b) => a + b, 0);
  const maxUsage          = Math.max(...Object.values(featureUsage), 1);
  const totalXP           = users.reduce((sum, u) => sum + (u.xp || 0), 0);
  const adminCount        = users.filter((u) => u.isAdmin).length;

  const FEATURES = [
    { key: "transcriptions", label: "Transcriptions",  color: "#7C3AED", icon: "mic-outline"              },
    { key: "notes",          label: "Notes",           color: "#3B82F6", icon: "document-text-outline"    },
    { key: "flashcardDecks", label: "Flashcard Decks", color: "#10B981", icon: "albums-outline"           },
    { key: "sessions",       label: "Study Sessions",  color: "#F59E0B", icon: "calendar-outline"         },
    { key: "tasks",          label: "Tasks",           color: "#EF4444", icon: "checkmark-circle-outline" },
  ];

  const donutSegments = FEATURES.map((f) => ({
    label: f.label, value: featureUsage[f.key], color: f.color,
  }));

  const statGrid = [
    { label: "Total Users",  value: users.length,     icon: "people-outline",   color: "#7C3AED" },
    { label: "Admins",       value: adminCount,        icon: "shield-checkmark", color: "#EF4444" },
    { label: "Total XP",     value: totalXP,           icon: "star",             color: "#F59E0B" },
    { label: "Interactions", value: totalInteractions, icon: "pulse-outline",    color: "#10B981" },
  ];

  const CARD_W = (SCREEN_W - 32 - 10) / 2;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <View style={[s.root, { backgroundColor: C.bg }]}>

      {/* ════════════════ MAIN SCREEN ════════════════ */}
      {!panelOpen && (
        <>
          <View style={s.topBar}>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: C.card }]} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={20} color={C.text} />
            </TouchableOpacity>
            <Text style={[s.topBarTitle, { color: C.text }]}>ADMIN</Text>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: C.card }]} onPress={loadAdminData}>
              <Ionicons name="refresh-outline" size={20} color={C.primary} />
            </TouchableOpacity>
          </View>

          <View style={[s.tabBar, { backgroundColor: C.card }]}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                style={[s.tab, activeTab === tab.key && [s.tabActive, { borderBottomColor: C.primary }]]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons name={tab.icon} size={14} color={activeTab === tab.key ? C.primary : C.muted} style={{ marginBottom: 2 }} />
                <Text style={[s.tabText, { color: activeTab === tab.key ? C.primary : C.muted }]}>{tab.label}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {loading ? (
            <View style={s.loadingWrap}>
              <ActivityIndicator size="large" color={C.primary} />
              <Text style={[s.loadingText, { color: C.muted }]}>Loading…</Text>
            </View>
          ) : (
            <ScrollView style={s.scroll} showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 52 }}>

              {/* ════ USERS ════ */}
              {activeTab === "users" && (
                <View>
                  <View style={s.sectionHeader}>
                    <View>
                      <Text style={[s.sectionTitle, { color: C.text }]}>All Users</Text>
                      <Text style={[s.sectionSub, { color: C.muted }]}>{users.length} registered accounts</Text>
                    </View>
                    <TouchableOpacity style={[s.createBtn, { backgroundColor: C.primary }]} onPress={openCreate}>
                      <Ionicons name="person-add-outline" size={15} color={C.primaryText} />
                      <Text style={[s.createBtnText, { color: C.primaryText }]}>New User</Text>
                    </TouchableOpacity>
                  </View>

                  {users.length === 0 ? (
                    <View style={[s.emptyState, { backgroundColor: C.card }]}>
                      <Ionicons name="people-outline" size={40} color={C.muted} />
                      <Text style={[s.emptyText, { color: C.muted }]}>No users yet</Text>
                    </View>
                  ) : (
                    users.map((user) => (
                      <View key={user.id} style={[s.userCard, { backgroundColor: C.card }]}>
                        <View style={[s.userCardStripe, { backgroundColor: avatarColor(user.id) }]} />
                        <View style={s.userCardBody}>
                          <UserAvatar user={user} size={46} />
                          <View style={s.userInfo}>
                            <View style={s.userNameRow}>
                              <Text style={[s.userName, { color: C.text }]} numberOfLines={1}>
                                {user.name || "Unnamed User"}
                              </Text>
                              {user.isAdmin && (
                                <View style={[s.adminChip, { backgroundColor: C.primary + "22", borderColor: C.primary + "44" }]}>
                                  <Ionicons name="shield-checkmark" size={9} color={C.primary} />
                                  <Text style={[s.adminChipText, { color: C.primary }]}>ADMIN</Text>
                                </View>
                              )}
                            </View>
                            <Text style={[s.userEmail, { color: C.muted }]} numberOfLines={1}>{user.email || "No email"}</Text>
                            <View style={s.userMeta}>
                              <View style={[s.xpPill, { backgroundColor: C.primary + "18" }]}>
                                <Ionicons name="star" size={9} color={C.primary} />
                                <Text style={[s.xpText, { color: C.primary }]}>{user.xp ?? 0} XP</Text>
                              </View>
                              <Text style={[s.joinDate, { color: C.muted }]}>
                                {user.createdAt?.toDate
                                  ? user.createdAt.toDate().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "2-digit" })
                                  : "—"}
                              </Text>
                            </View>
                          </View>
                          <View style={s.userActions}>
                            <TouchableOpacity style={[s.actionBtn, { backgroundColor: C.primary + "15", borderColor: C.primary + "30" }]} onPress={() => openEdit(user)}>
                              <Ionicons name="pencil" size={13} color={C.primary} />
                            </TouchableOpacity>
                            <TouchableOpacity style={[s.actionBtn, { backgroundColor: "#EF444415", borderColor: "#EF444430" }]} onPress={() => handleDelete(user)}>
                              <Ionicons name="trash" size={13} color="#EF4444" />
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              )}

              {/* ════ ANALYTICS ════ */}
              {activeTab === "analytics" && (
                <View>
                  <View style={s.sectionHeader}>
                    <View>
                      <Text style={[s.sectionTitle, { color: C.text }]}>Analytics</Text>
                      <Text style={[s.sectionSub, { color: C.muted }]}>Platform-wide usage overview</Text>
                    </View>
                  </View>

                  {/* 2×2 Stat Grid */}
                  <View style={s.statGrid}>
                    {statGrid.map((stat) => (
                      <View key={stat.label} style={[s.statCard, { backgroundColor: C.card, width: CARD_W }]}>
                        <View style={[s.statIconWrap, { backgroundColor: stat.color + "18" }]}>
                          <Ionicons name={stat.icon} size={18} color={stat.color} />
                        </View>
                        <Text style={[s.statNum, { color: C.text }]}>{stat.value.toLocaleString()}</Text>
                        <Text style={[s.statLabel, { color: C.muted }]}>{stat.label}</Text>
                        <View style={[s.statGlow, { backgroundColor: stat.color + "14" }]} />
                      </View>
                    ))}
                  </View>

                  {/* Donut + Legend */}
                  <View style={[s.donutCard, { backgroundColor: C.card }]}>
                    <Text style={[s.donutTitle, { color: C.text }]}>Feature Distribution</Text>
                    <Text style={[s.donutSub, { color: C.muted }]}>Share of total platform activity</Text>
                    <View style={s.donutRow}>
                      <DonutChart
                        segments={donutSegments} size={190} strokeWidth={26}
                        centerLabel={totalInteractions.toLocaleString()} centerSub="total" C={C}
                      />
                      <View style={s.legend}>
                        {FEATURES.map((f) => {
                          const val = featureUsage[f.key];
                          const pct = totalInteractions > 0 ? Math.round((val / totalInteractions) * 100) : 0;
                          const isActive = activeSegment === f.key;
                          return (
                            <TouchableOpacity
                              key={f.key}
                              style={[s.legendRow, !isActive && activeSegment ? { opacity: 0.4 } : { opacity: 1 }]}
                              onPress={() => setActiveSegment(activeSegment === f.key ? null : f.key)}
                              activeOpacity={0.7}
                            >
                              <View style={[s.legendDot, { backgroundColor: f.color }]} />
                              <Text style={[s.legendLabel, { color: C.text }]} numberOfLines={1}>{f.label}</Text>
                              <View style={[s.legendPctBadge, { backgroundColor: f.color + "18" }]}>
                                <Text style={[s.legendPct, { color: f.color }]}>{pct}%</Text>
                              </View>
                            </TouchableOpacity>
                          );
                        })}
                      </View>
                    </View>
                  </View>

                  {/* ── Feature Breakdown Table ──
                      FIX: Use fixed pixel widths for COUNT + SHARE cols so they
                      never stretch/shrink, making text alignment reliable.
                  ── */}
                  <View style={[s.tableCard, { backgroundColor: C.card }]}>
                    <Text style={[s.tableTitle, { color: C.text }]}>Feature Breakdown</Text>
                    <Text style={[s.tableSub, { color: C.muted }]}>Absolute counts per feature</Text>

                    {/* Header */}
                    <View style={[s.tableHeader, { borderBottomColor: C.border }]}>
                      <View style={s.colFeature}>
                        <Text style={[s.tableHeadCell, { color: C.muted }]}>FEATURE</Text>
                      </View>
                      <View style={s.colCount}>
                        <Text style={[s.tableHeadCell, { color: C.muted, textAlign: "right" }]}>COUNT</Text>
                      </View>
                      <View style={s.colShare}>
                        <Text style={[s.tableHeadCell, { color: C.muted, textAlign: "right" }]}>SHARE</Text>
                      </View>
                    </View>

                    {FEATURES.map((f, i) => {
                      const val  = featureUsage[f.key];
                      const pct  = totalInteractions > 0 ? Math.round((val / totalInteractions) * 100) : 0;
                      const barW = maxUsage > 0 ? val / maxUsage : 0;
                      return (
                        <View key={f.key}
                          style={[s.tableRow, i < FEATURES.length - 1 && { borderBottomWidth: 1, borderBottomColor: C.border }]}>
                          {/* Feature col */}
                          <View style={[s.colFeature, { flexDirection: "row", alignItems: "center" }]}>
                            <View style={[s.featureIconWrap, { backgroundColor: f.color + "20" }]}>
                              <Ionicons name={f.icon} size={12} color={f.color} />
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                              <Text style={[s.tableCellText, { color: C.text }]} numberOfLines={1}>{f.label}</Text>
                              <View style={[s.miniTrack, { backgroundColor: f.color + "18" }]}>
                                <View style={[s.miniFill, { backgroundColor: f.color, width: `${Math.round(barW * 100)}%` }]} />
                              </View>
                            </View>
                          </View>
                          {/* Count col — fixed width, right-aligned number */}
                          <View style={s.colCount}>
                            <Text style={[s.tableCellNum, { color: C.text, textAlign: "right" }]}>{val}</Text>
                          </View>
                          {/* Share col — fixed width, right-aligned badge */}
                          <View style={[s.colShare, { alignItems: "flex-end" }]}>
                            <View style={[s.shareBadge, { backgroundColor: f.color + "18" }]}>
                              <Text style={[s.shareBadgeText, { color: f.color }]}>{pct}%</Text>
                            </View>
                          </View>
                        </View>
                      );
                    })}

                    {/* Total row */}
                    <View style={[s.totalRow, { borderTopColor: C.border, backgroundColor: C.primary + "08" }]}>
                      <View style={s.colFeature}>
                        <Text style={[s.totalLabel, { color: C.muted }]}>TOTAL</Text>
                      </View>
                      <View style={s.colCount}>
                        <Text style={[s.totalValue, { color: C.text, textAlign: "right" }]}>{totalInteractions}</Text>
                      </View>
                      <View style={[s.colShare, { alignItems: "flex-end" }]}>
                        <Text style={[s.totalValue, { color: C.primary, textAlign: "right" }]}>100%</Text>
                      </View>
                    </View>
                  </View>

                </View>
              )}

            </ScrollView>
          )}
        </>
      )}

      {/* ════════════════════════════════════════════════
          CREATE / EDIT PANEL
          — No Modal. Fixed header outside KAV (never jumps).
          — Redesigned create form: avatar initials preview,
            coloured field accent lines, hero gradient header.
      ════════════════════════════════════════════════ */}
      {panelOpen && (
        <SafeAreaView style={[s.panelRoot, { backgroundColor: C.bg }]}>

          {/* ── Fixed header — immune to keyboard ── */}
          <View style={[s.panelHeader, { backgroundColor: C.card, borderBottomColor: C.border }]}>
            <TouchableOpacity style={[s.iconBtn, { backgroundColor: C.bg }]} onPress={closePanel}>
              <Ionicons name="close" size={18} color={C.muted} />
            </TouchableOpacity>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[s.panelTitle, { color: C.text }]}>
                {panelMode === "create" ? "New User" : "Edit User"}
              </Text>
              <Text style={[s.panelSub, { color: C.muted }]}>
                {panelMode === "create" ? "Add someone to the platform" : "Update account details"}
              </Text>
            </View>
            <TouchableOpacity
              style={[s.saveBtn, { backgroundColor: C.primary, opacity: saving ? 0.7 : 1 }]}
              onPress={handleSave} disabled={saving}
            >
              {saving
                ? <ActivityIndicator size="small" color={C.primaryText} />
                : <Text style={[s.saveBtnText, { color: C.primaryText }]}>
                    {panelMode === "create" ? "Create" : "Save"}
                  </Text>
              }
            </TouchableOpacity>
          </View>

          {/* ── Keyboard-safe scroll body ── */}
          <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            keyboardVerticalOffset={0}
          >
            <ScrollView
              keyboardShouldPersistTaps="handled"
              keyboardDismissMode="interactive"
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: Platform.OS === "android" ? 180 : 48 }}
            >

              {/* ── Hero identity banner ── */}
              <View style={[s.formHero, { backgroundColor: C.primary + "12", borderBottomColor: C.border }]}>
                {/* Live avatar preview — updates as name is typed */}
                <View style={[s.formAvatarRing, { borderColor: C.primary + "44" }]}>
                  {(panelMode === "edit" && selectedUser)
                    ? <UserAvatar user={{ ...selectedUser, name: form.name }} size={64} />
                    : (
                      <View style={[s.formAvatarPlaceholder, {
                        backgroundColor: form.name.trim()
                          ? avatarColor(form.name)
                          : C.card,
                        borderColor: C.border,
                      }]}>
                        {form.name.trim() ? (
                          <Text style={s.formAvatarInitials}>
                            {getInitials(form.name)}
                          </Text>
                        ) : (
                          <Ionicons name="person-outline" size={26} color={C.muted} />
                        )}
                      </View>
                    )
                  }
                </View>
                <View style={{ flex: 1, marginLeft: 16 }}>
                  <Text style={[s.formHeroName, { color: C.text }]} numberOfLines={1}>
                    {form.name.trim() || "Full Name"}
                  </Text>
                  <Text style={[s.formHeroEmail, { color: C.muted }]} numberOfLines={1}>
                    {form.email.trim() || "email@example.com"}
                  </Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 }}>
                    {form.isAdmin && (
                      <View style={[s.adminChip, { backgroundColor: C.primary + "22", borderColor: C.primary + "44" }]}>
                        <Ionicons name="shield-checkmark" size={9} color={C.primary} />
                        <Text style={[s.adminChipText, { color: C.primary }]}>ADMIN</Text>
                      </View>
                    )}
                    {(parseInt(form.xp) > 0) && (
                      <View style={[s.xpPill, { backgroundColor: "#F59E0B18" }]}>
                        <Ionicons name="star" size={9} color="#F59E0B" />
                        <Text style={[s.xpText, { color: "#F59E0B" }]}>{form.xp} XP</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>

              <View style={s.panelScroll}>

                {/* ── BASIC INFO ── */}
                <Text style={[s.fieldGroupLabel, { color: C.muted }]}>BASIC INFO</Text>
                <View style={[s.fieldGroup, { backgroundColor: C.card, borderColor: C.border }]}>
                  {/* Name */}
                  <View style={s.fieldRow}>
                    <View style={[s.fieldIconBox, { backgroundColor: C.primary + "15" }]}>
                      <Ionicons name="person-outline" size={15} color={C.primary} />
                    </View>
                    <View style={s.fieldContent}>
                      <Text style={[s.fieldLabel, { color: C.muted }]}>Full Name</Text>
                      <TextInput
                        style={[s.fieldInput, { color: C.text }]}
                        placeholder="Jane Doe"
                        placeholderTextColor={C.muted + "55"}
                        value={form.name}
                        onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
                        returnKeyType="next" blurOnSubmit={false}
                      />
                    </View>
                  </View>
                  <View style={[s.fieldDivider, { backgroundColor: C.border }]} />
                  {/* Email */}
                  <View style={s.fieldRow}>
                    <View style={[s.fieldIconBox, { backgroundColor: "#3B82F615" }]}>
                      <Ionicons name="mail-outline" size={15} color="#3B82F6" />
                    </View>
                    <View style={s.fieldContent}>
                      <Text style={[s.fieldLabel, { color: C.muted }]}>Email Address</Text>
                      <TextInput
                        style={[s.fieldInput, { color: C.text }]}
                        placeholder="jane@example.com"
                        placeholderTextColor={C.muted + "55"}
                        keyboardType="email-address" autoCapitalize="none"
                        value={form.email}
                        onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
                        returnKeyType="next" blurOnSubmit={false}
                      />
                    </View>
                  </View>
                  <View style={[s.fieldDivider, { backgroundColor: C.border }]} />
                  {/* XP */}
                  <View style={s.fieldRow}>
                    <View style={[s.fieldIconBox, { backgroundColor: "#F59E0B15" }]}>
                      <Ionicons name="star-outline" size={15} color="#F59E0B" />
                    </View>
                    <View style={s.fieldContent}>
                      <Text style={[s.fieldLabel, { color: C.muted }]}>XP Points</Text>
                      <TextInput
                        style={[s.fieldInput, { color: C.text }]}
                        placeholder="0"
                        placeholderTextColor={C.muted + "55"}
                        keyboardType="numeric" value={form.xp}
                        onChangeText={(v) => setForm((f) => ({ ...f, xp: v }))}
                        returnKeyType={panelMode === "create" ? "next" : "done"}
                      />
                    </View>
                  </View>
                </View>

                {/* ── SECURITY (create only) ── */}
                {panelMode === "create" && (
                  <>
                    <Text style={[s.fieldGroupLabel, { color: C.muted }]}>SECURITY</Text>
                    <View style={[s.fieldGroup, { backgroundColor: C.card, borderColor: C.border }]}>
                      <View style={s.fieldRow}>
                        <View style={[s.fieldIconBox, { backgroundColor: "#EF444415" }]}>
                          <Ionicons name="lock-closed-outline" size={15} color="#EF4444" />
                        </View>
                        <View style={s.fieldContent}>
                          <Text style={[s.fieldLabel, { color: C.muted }]}>Password</Text>
                          <TextInput
                            style={[s.fieldInput, { color: C.text }]}
                            placeholder="Min. 6 characters"
                            placeholderTextColor={C.muted + "55"}
                            secureTextEntry={!form.showPassword}
                            autoCapitalize="none" autoCorrect={false}
                            value={form.password}
                            onChangeText={(v) => setForm((f) => ({ ...f, password: v }))}
                            returnKeyType="done" onSubmitEditing={Keyboard.dismiss}
                          />
                        </View>
                        <TouchableOpacity
                          onPress={() => setForm((f) => ({ ...f, showPassword: !f.showPassword }))}
                          style={{ padding: 8 }}
                        >
                          <Ionicons
                            name={form.showPassword ? "eye-off-outline" : "eye-outline"}
                            size={17} color={C.muted}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Password strength hint */}
                    {form.password.length > 0 && (
                      <View style={[s.pwHint, { backgroundColor: C.card, borderColor: C.border }]}>
                        {[
                          { ok: form.password.length >= 6, text: "At least 6 characters" },
                          { ok: /[A-Z]/.test(form.password), text: "Uppercase letter" },
                          { ok: /[0-9]/.test(form.password), text: "Number" },
                        ].map((rule) => (
                          <View key={rule.text} style={s.pwHintRow}>
                            <Ionicons
                              name={rule.ok ? "checkmark-circle" : "ellipse-outline"}
                              size={13}
                              color={rule.ok ? "#10B981" : C.muted}
                            />
                            <Text style={[s.pwHintText, { color: rule.ok ? "#10B981" : C.muted }]}>
                              {rule.text}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                )}

                {/* ── PERMISSIONS ── */}
                <Text style={[s.fieldGroupLabel, { color: C.muted }]}>PERMISSIONS</Text>
                <View style={[s.fieldGroup, { backgroundColor: C.card, borderColor: C.border }]}>
                  <View style={[s.fieldRow, { paddingVertical: 14 }]}>
                    <View style={[s.fieldIconBox, { backgroundColor: C.primary + "15" }]}>
                      <Ionicons name="shield-checkmark-outline" size={15} color={C.primary} />
                    </View>
                    <View style={[s.fieldContent, { justifyContent: "center" }]}>
                      <Text style={[s.fieldInput, { color: C.text, fontWeight: "700" }]}>Admin Privileges</Text>
                      <Text style={[s.fieldLabel, { color: C.muted, marginTop: 2 }]}>Full platform access</Text>
                    </View>
                    <Switch
                      value={form.isAdmin}
                      onValueChange={(v) => setForm((f) => ({ ...f, isAdmin: v }))}
                      trackColor={{ false: C.muted + "44", true: C.primary + "88" }}
                      thumbColor={form.isAdmin ? C.primary : "#f4f3f4"}
                    />
                  </View>
                </View>

                {/* Cancel */}
                <TouchableOpacity
                  style={[s.cancelBtn, { borderColor: C.border }]}
                  onPress={closePanel}
                >
                  <Text style={[s.cancelText, { color: C.muted }]}>Cancel</Text>
                </TouchableOpacity>

              </View>
            </ScrollView>
          </KeyboardAvoidingView>
        </SafeAreaView>
      )}

    </View>
  );
}

// ── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  root: { flex: 1 },

  // Top bar
  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    marginTop: "14%", marginBottom: 18, paddingHorizontal: 20,
  },
  topBarTitle: { fontWeight: "900", fontSize: 17, letterSpacing: 2 },
  iconBtn: { width: 38, height: 38, borderRadius: 12, justifyContent: "center", alignItems: "center" },

  // Tabs
  tabBar:    { flexDirection: "row", marginHorizontal: 16, borderRadius: 14, marginBottom: 18, overflow: "hidden" },
  tab:       { flex: 1, paddingVertical: 11, alignItems: "center", justifyContent: "center" },
  tabActive: { borderBottomWidth: 2.5 },
  tabText:   { fontWeight: "800", fontSize: 10, letterSpacing: 1.2 },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center", gap: 10 },
  loadingText: { fontSize: 13 },
  scroll:      { flex: 1, paddingHorizontal: 16 },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14, marginTop: 4 },
  sectionTitle:  { fontSize: 18, fontWeight: "900" },
  sectionSub:    { fontSize: 12, marginTop: 2 },
  createBtn:     { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 14, paddingVertical: 9, borderRadius: 12 },
  createBtnText: { fontSize: 13, fontWeight: "800" },

  // User cards
  userCard:        { borderRadius: 18, marginBottom: 10, overflow: "hidden", flexDirection: "row" },
  userCardStripe:  { width: 4 },
  userCardBody:    { flex: 1, flexDirection: "row", alignItems: "center", padding: 14, gap: 12 },
  userInfo:        { flex: 1, minWidth: 0 },
  userNameRow:     { flexDirection: "row", alignItems: "center", gap: 6, marginBottom: 2 },
  userName:        { fontSize: 15, fontWeight: "800", flexShrink: 1 },
  adminChip:       { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6, borderWidth: 1 },
  adminChipText:   { fontSize: 8, fontWeight: "900", letterSpacing: 0.5 },
  userEmail:       { fontSize: 12, marginBottom: 5 },
  userMeta:        { flexDirection: "row", alignItems: "center", gap: 8 },
  xpPill:          { flexDirection: "row", alignItems: "center", gap: 3, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 8 },
  xpText:          { fontSize: 10, fontWeight: "800" },
  joinDate:        { fontSize: 10 },
  userActions:     { gap: 8 },
  actionBtn:       { width: 34, height: 34, borderRadius: 10, borderWidth: 1, justifyContent: "center", alignItems: "center" },
  emptyState:      { borderRadius: 18, padding: 40, alignItems: "center", gap: 10 },
  emptyText:       { fontSize: 14 },

  // ── Analytics ──────────────────────────────────────────────────────────────
  statGrid:     { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  statCard:     { borderRadius: 18, padding: 16, overflow: "hidden" },
  statIconWrap: { width: 40, height: 40, borderRadius: 12, justifyContent: "center", alignItems: "center", marginBottom: 10 },
  statNum:      { fontSize: 26, fontWeight: "900", marginBottom: 3 },
  statLabel:    { fontSize: 11, fontWeight: "600" },
  statGlow:     { position: "absolute", bottom: -20, right: -20, width: 80, height: 80, borderRadius: 40 },

  donutCard:  { borderRadius: 20, padding: 18, marginBottom: 14 },
  donutTitle: { fontSize: 16, fontWeight: "900", marginBottom: 2 },
  donutSub:   { fontSize: 12, marginBottom: 18 },
  donutRow:   { flexDirection: "row", alignItems: "center", gap: 16 },

  legend:         { flex: 1 },
  legendRow:      { flexDirection: "row", alignItems: "center", paddingVertical: 5, gap: 7 },
  legendDot:      { width: 8, height: 8, borderRadius: 4, flexShrink: 0 },
  legendLabel:    { fontSize: 11, fontWeight: "600", flex: 1 },
  legendPctBadge: { paddingHorizontal: 7, paddingVertical: 2, borderRadius: 20 },
  legendPct:      { fontSize: 11, fontWeight: "900" },

  tableCard:   { borderRadius: 20, padding: 18, marginBottom: 14 },
  tableTitle:  { fontSize: 16, fontWeight: "900", marginBottom: 2 },
  tableSub:    { fontSize: 12, marginBottom: 14 },
  tableHeader: { flexDirection: "row", alignItems: "center", paddingBottom: 10, borderBottomWidth: 1, marginBottom: 2 },
  tableHeadCell: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  tableRow:    { flexDirection: "row", alignItems: "center", paddingVertical: 11 },

  // Fixed-width columns — guarantees COUNT & SHARE always align correctly
  colFeature: { flex: 1, flexDirection: "row", alignItems: "center" },
  colCount:   { width: 52, justifyContent: "center" },   // fixed 52px
  colShare:   { width: 52, justifyContent: "flex-end" }, // fixed 52px

  featureIconWrap: { width: 26, height: 26, borderRadius: 7, justifyContent: "center", alignItems: "center", flexShrink: 0 },
  tableCellText:   { fontSize: 12, fontWeight: "700" },
  tableCellNum:    { fontSize: 15, fontWeight: "900" },
  miniTrack:       { height: 4, borderRadius: 3, marginTop: 4, overflow: "hidden" },
  miniFill:        { height: "100%", borderRadius: 3 },
  shareBadge:      { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 20 },
  shareBadgeText:  { fontSize: 11, fontWeight: "900" },

  totalRow:   { flexDirection: "row", alignItems: "center", paddingVertical: 12, paddingHorizontal: 4, borderTopWidth: 1.5, marginTop: 4, borderRadius: 10 },
  totalLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1 },
  totalValue: { fontSize: 14, fontWeight: "900" },

  // ── Panel ──────────────────────────────────────────────────────────────────
  panelRoot:   { flex: 1 },
  panelHeader: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 12 : 20,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  panelTitle:  { fontSize: 16, fontWeight: "900" },
  panelSub:    { fontSize: 11, marginTop: 1 },
  saveBtn:     { paddingHorizontal: 18, paddingVertical: 9, borderRadius: 12 },
  saveBtnText: { fontSize: 14, fontWeight: "800" },

  // Hero identity banner (NEW)
  formHero: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingVertical: 22,
    borderBottomWidth: 1,
  },
  formAvatarRing: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 2.5, borderStyle: "dashed",
    justifyContent: "center", alignItems: "center",
    padding: 3,
  },
  formAvatarPlaceholder: {
    width: 64, height: 64, borderRadius: 32,
    borderWidth: 1,
    justifyContent: "center", alignItems: "center",
  },
  formAvatarInitials: { fontSize: 22, fontWeight: "900", color: "#fff" },
  formHeroName:       { fontSize: 17, fontWeight: "900" },
  formHeroEmail:      { fontSize: 12, marginTop: 2 },

  panelScroll: { paddingHorizontal: 16, paddingTop: 24 },

  fieldGroupLabel: { fontSize: 11, fontWeight: "800", letterSpacing: 1.2, marginBottom: 8, marginLeft: 4 },
  fieldGroup:      { borderRadius: 16, borderWidth: 1, overflow: "hidden", marginBottom: 24 },
  fieldRow:        { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 6, minHeight: 62 },
  fieldIconBox:    { width: 34, height: 34, borderRadius: 9, justifyContent: "center", alignItems: "center", marginRight: 12 },
  fieldContent:    { flex: 1, justifyContent: "center" },
  fieldLabel:      { fontSize: 11, fontWeight: "600", marginBottom: 2 },
  fieldInput:      { fontSize: 15, paddingVertical: 0 },
  fieldDivider:    { height: 1, marginLeft: 60 },

  // Password hint card (NEW)
  pwHint:    { borderRadius: 12, borderWidth: 1, padding: 12, marginTop: -16, marginBottom: 24, gap: 6 },
  pwHintRow: { flexDirection: "row", alignItems: "center", gap: 7 },
  pwHintText:{ fontSize: 12, fontWeight: "600" },

  cancelBtn:  { borderWidth: 1.5, borderRadius: 14, paddingVertical: 15, alignItems: "center", marginTop: 8 },
  cancelText: { fontSize: 14, fontWeight: "700" },
});