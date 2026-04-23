// screens/AdminScreen.js
import React, { useState, useCallback } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, Image
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { FIREBASE_DB } from "../FirebaseConfig";
import { collection, getDocs } from "firebase/firestore";
import { useTheme } from "../ThemeContext";

// Returns up to 2 initials from a name string, falls back to "?"
function getInitials(name) {
  if (!name || typeof name !== "string") return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

const AVATAR_COLORS = [
  "#7C3AED", "#3B82F6", "#10B981", "#F59E0B",
  "#EF4444", "#EC4899", "#06B6D4", "#84CC16",
];
function avatarColor(seed = "") {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export default function AdminScreen({ navigation }) {
  const { theme } = useTheme();
  const [activeTab, setActiveTab] = useState("users");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, totalTranscriptions: 0, totalSessions: 0 });
  const [featureUsage, setFeatureUsage] = useState({ transcriptions: 0, notes: 0, flashcardDecks: 0, sessions: 0, tasks: 0 });

  const C = {
    bg: theme.colors.background,
    card: theme.colors.card,
    primary: theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text: theme.colors.text,
    muted: theme.colors.mutedText,
  };

  useFocusEffect(useCallback(() => { loadAdminData(); }, []));

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const usersSnap = await getDocs(collection(FIREBASE_DB, "users"));
      const userList = usersSnap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setUsers(userList);

      let totalTranscriptions = 0, totalSessions = 0,
          totalNotes = 0, totalDecks = 0, totalTasks = 0;

      await Promise.all(
        userList.map(async (user) => {
          const [t, s, n, f, tk] = await Promise.all([
            getDocs(collection(FIREBASE_DB, "users", user.id, "transcriptions")),
            getDocs(collection(FIREBASE_DB, "users", user.id, "sessions")),
            getDocs(collection(FIREBASE_DB, "users", user.id, "notes")),
            getDocs(collection(FIREBASE_DB, "users", user.id, "flashcardDecks")),
            getDocs(collection(FIREBASE_DB, "users", user.id, "tasks")),
          ]);
          totalTranscriptions += t.size;
          totalSessions += s.size;
          totalNotes += n.size;
          totalDecks += f.size;
          totalTasks += tk.size;
        })
      );

      setStats({ totalUsers: userList.length, totalTranscriptions, totalSessions });
      setFeatureUsage({ transcriptions: totalTranscriptions, notes: totalNotes, flashcardDecks: totalDecks, sessions: totalSessions, tasks: totalTasks });
    } catch (e) { console.log("loadAdminData error:", e); }
    finally { setLoading(false); }
  };

  const maxUsage = Math.max(...Object.values(featureUsage), 1);
  const contentBars = [
    { label: "Transcriptions",   value: featureUsage.transcriptions, color: "#7C3AED" },
    { label: "Notes",            value: featureUsage.notes,          color: "#3B82F6" },
    { label: "Flashcard Decks",  value: featureUsage.flashcardDecks, color: "#10B981" },
    { label: "Planner Sessions", value: featureUsage.sessions,       color: "#F59E0B" },
    { label: "Tasks",            value: featureUsage.tasks,          color: "#EF4444" },
  ];

  // ── Avatar: supports base64 string, remote URL, or initials fallback ──────
  const UserAvatar = ({ user }) => {
    // profileImageBase64 is the new field; fall back to old localProfileUri for any existing data
    const imageData = user.profileImageBase64 || user.localProfileUri || null;
    const initials = getInitials(user.name || user.email);
    const bgColor = avatarColor(user.id || user.name || "");

    if (imageData) {
      // base64 strings start with "data:" or are raw base64; local URIs start with "file:"
      const uri = imageData.startsWith("data:") || imageData.startsWith("file:") || imageData.startsWith("http")
        ? imageData
        : `data:image/jpeg;base64,${imageData}`;
      return <Image source={{ uri }} style={styles.userAvatarImg} />;
    }

    return (
      <View style={[styles.userAvatar, { backgroundColor: bgColor }]}>
        <Text style={styles.userAvatarText}>{initials}</Text>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.text }]}>ADMIN</Text>
        <TouchableOpacity onPress={loadAdminData}>
          <Ionicons name="refresh-outline" size={22} color={C.primary} />
        </TouchableOpacity>
      </View>

      <View style={[styles.tabBar, { backgroundColor: C.card }]}>
        {["users", "data", "content"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && { borderBottomWidth: 2, borderBottomColor: C.primary }]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, { color: activeTab === tab ? C.primary : C.muted }]}>
              {tab.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={C.primary} />
        </View>
      ) : (
        <ScrollView style={styles.content}>

          {/* ── USERS TAB ── */}
          {activeTab === "users" && (
            <View>
              <Text style={[styles.sectionTitle, { color: C.text }]}>
                All Users ({users.length})
              </Text>
              {users.map((user) => (
                <View key={user.id} style={[styles.userCard, { backgroundColor: C.card }]}>
                  <UserAvatar user={user} />
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.userName, { color: C.text }]}>
                      {user.name || "Unnamed User"}
                    </Text>
                    <Text style={[styles.userEmail, { color: C.muted }]}>
                      {user.email || "No email"}
                    </Text>
                    <Text style={[styles.userJoined, { color: C.muted }]}>
                      Joined {user.createdAt?.toDate
                        ? user.createdAt.toDate().toLocaleDateString()
                        : "—"}
                    </Text>
                  </View>
                  <View style={{ alignItems: "flex-end", gap: 4 }}>
                    <Text style={[styles.userXP, { color: C.primary }]}>
                      {user.xp ?? 0} XP
                    </Text>
                    {user.isAdmin && (
                      <View style={[styles.adminBadge, { backgroundColor: C.primary }]}>
                        <Text style={[styles.adminBadgeText, { color: C.primaryText }]}>
                          ADMIN
                        </Text>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── DATA TAB ── */}
          {activeTab === "data" && (
            <View>
              <Text style={[styles.sectionTitle, { color: C.text }]}>App Statistics</Text>
              {[
                { label: "Total Users",          value: stats.totalUsers,          icon: "people-outline"   },
                { label: "Total Transcriptions",  value: stats.totalTranscriptions, icon: "mic-outline"      },
                { label: "Total Study Sessions",  value: stats.totalSessions,       icon: "calendar-outline" },
              ].map((stat) => (
                <View key={stat.label} style={[styles.statCard, { backgroundColor: C.card }]}>
                  <View style={[styles.statIcon, { backgroundColor: C.primary + "22" }]}>
                    <Ionicons name={stat.icon} size={24} color={C.primary} />
                  </View>
                  <View>
                    <Text style={[styles.statValue, { color: C.text }]}>{stat.value}</Text>
                    <Text style={[styles.statLabel, { color: C.muted }]}>{stat.label}</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          {/* ── CONTENT TAB ── */}
          {activeTab === "content" && (
            <View>
              <Text style={[styles.sectionTitle, { color: C.text }]}>Feature Usage</Text>
              {contentBars.map((bar) => (
                <View key={bar.label} style={[styles.barCard, { backgroundColor: C.card }]}>
                  <View style={styles.barLabelRow}>
                    <Text style={[styles.barLabel, { color: C.text }]}>{bar.label}</Text>
                    <Text style={[styles.barValue, { color: C.muted }]}>{bar.value}</Text>
                  </View>
                  <View style={[styles.barBg, { backgroundColor: C.bg }]}>
                    <View style={[styles.barFill, { backgroundColor: bar.color, width: `${(bar.value / maxUsage) * 100}%` }]} />
                  </View>
                </View>
              ))}
            </View>
          )}

        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    width: "90%", flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: "15%", marginBottom: 16, alignSelf: "center",
  },
  topBarTitle: { fontWeight: "bold", fontSize: 18 },
  tabBar: { flexDirection: "row", marginHorizontal: 16, borderRadius: 12, marginBottom: 16 },
  tab: { flex: 1, paddingVertical: 12, alignItems: "center" },
  tabText: { fontWeight: "700", fontSize: 12, letterSpacing: 1 },
  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },
  content: { flex: 1, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 17, fontWeight: "bold", marginBottom: 12 },

  userCard: {
    flexDirection: "row", alignItems: "center", gap: 12,
    borderRadius: 16, padding: 14, marginBottom: 10,
  },
  userAvatar: {
    width: 50, height: 50, borderRadius: 25,
    justifyContent: "center", alignItems: "center",
  },
  userAvatarImg: { width: 50, height: 50, borderRadius: 25 },
  userAvatarText: { fontSize: 18, fontWeight: "bold", color: "#FFFFFF" },
  userName:  { fontSize: 15, fontWeight: "700", marginBottom: 2 },
  userEmail: { fontSize: 12, marginBottom: 2 },
  userJoined: { fontSize: 11 },
  userXP: { fontSize: 13, fontWeight: "bold" },
  adminBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  adminBadgeText: { fontSize: 9, fontWeight: "bold" },

  statCard: {
    flexDirection: "row", alignItems: "center", gap: 16,
    borderRadius: 14, padding: 16, marginBottom: 10,
  },
  statIcon: { width: 48, height: 48, borderRadius: 14, justifyContent: "center", alignItems: "center" },
  statValue: { fontSize: 26, fontWeight: "bold" },
  statLabel: { fontSize: 13 },

  barCard: { borderRadius: 14, padding: 14, marginBottom: 10 },
  barLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  barLabel: { fontSize: 14, fontWeight: "600" },
  barValue: { fontSize: 14, fontWeight: "600" },
  barBg: { height: 10, borderRadius: 5, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 5 },
});