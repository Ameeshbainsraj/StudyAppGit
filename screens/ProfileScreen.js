import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  FlatList,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "../ThemeContext";
import { getLevelFromXP, LEVELS } from "../xpConfig";
import { getBadgeForLevel, getUnlockedBadges, BADGES } from "../badgeConfig";

function BadgeCard({ badge, unlocked, isCurrent, C }) {
  return (
    <View
      style={[
        styles.badgeCard,
        {
          backgroundColor: unlocked ? C.card : C.bg,
          borderColor: isCurrent ? badge.ring : unlocked ? badge.color + "55" : C.card,
          borderWidth: isCurrent ? 2 : 1,
          opacity: unlocked ? 1 : 0.3,
        },
      ]}
    >
      <View style={[styles.badgeEmojiWrap, { backgroundColor: badge.color + "22" }]}>
        <Text style={{ fontSize: 26 }}>{badge.emoji}</Text>
      </View>
      <Text style={[styles.badgeCardLabel, { color: unlocked ? C.text : C.muted }]} numberOfLines={1}>
        {badge.label}
      </Text>
      <Text style={[styles.badgeCardLevels, { color: C.muted }]}>
        {"Lvl " + badge.minLevel + (badge.minLevel !== badge.maxLevel ? "-" + badge.maxLevel : "")}
      </Text>
      {isCurrent ? <View style={[styles.currentPip, { backgroundColor: badge.color }]} /> : null}
    </View>
  );
}

export default function ProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const [userData, setUserData] = useState(null);
  const [levelInfo, setLevelInfo] = useState(null);
  const [showLevels, setShowLevels] = useState(false);
  const [showBadges, setShowBadges] = useState(false);

  const C = {
    bg: theme.colors.background,
    card: theme.colors.card,
    primary: theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text: theme.colors.text,
    muted: theme.colors.mutedText,
  };

  useFocusEffect(useCallback(() => { loadProfile(); }, []));

  const loadProfile = async () => {
    try {
      const uid = FIREBASE_AUTH.currentUser?.uid;
      const snap = await getDoc(doc(FIREBASE_DB, "users", uid));
      const data = snap.data();
      setUserData(data);
      setLevelInfo(getLevelFromXP(data?.xp ?? 0));
    } catch (e) {
      console.log("loadProfile error:", e);
    }
  };

  if (!userData || !levelInfo) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, justifyContent: "center", alignItems: "center" }]}>
        <Text style={{ color: theme.colors.mutedText }}>Loading...</Text>
      </View>
    );
  }

  const progressPct = Math.round(levelInfo.progress * 100);
  const xpForNext = levelInfo.nextLevel?.xpRequired ?? levelInfo.xpRequired;
  const badge = getBadgeForLevel(levelInfo.level);
  const unlockedBadges = getUnlockedBadges(levelInfo.level);

  return (
    <View style={[styles.container, { backgroundColor: C.bg }]}>

      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={C.text} />
        </TouchableOpacity>
        <Text style={[styles.topBarTitle, { color: C.text }]}>PROFILE</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

        {/* ── Badge avatar ── */}
        <View style={[styles.badgeAvatar, { borderColor: badge.ring, shadowColor: badge.ring, backgroundColor: badge.color + "18" }]}>
          <Text style={styles.badgeAvatarEmoji}>{badge.emoji}</Text>
        </View>

        <View style={[styles.badgeChip, { backgroundColor: badge.color }]}>
          <Text style={styles.badgeChipLabel}>{badge.label}</Text>
        </View>

        <Text style={[styles.name, { color: C.text }]}>{userData.name}</Text>
        <Text style={[styles.email, { color: C.muted }]}>{userData.email}</Text>

        {/* ── Level card ── */}
        <TouchableOpacity
          style={[styles.card, { backgroundColor: C.card }]}
          onPress={() => setShowLevels(true)}
          activeOpacity={0.85}
        >
          <View style={styles.levelTop}>
            <View>
              <Text style={[styles.sectionLabel, { color: C.muted }]}>CURRENT LEVEL</Text>
              <Text style={[styles.levelTitle, { color: C.primary }]}>
                {levelInfo.level + ". " + levelInfo.title}
              </Text>
            </View>
            <View style={[styles.pill, { backgroundColor: C.primary }]}>
              <Text style={[styles.pillText, { color: C.primaryText }]}>{"LVL " + levelInfo.level}</Text>
            </View>
          </View>
          <View style={styles.xpRow}>
            <Text style={[styles.xpNum, { color: C.muted }]}>{levelInfo.xp + " XP"}</Text>
            <Text style={[styles.xpNum, { color: C.muted }]}>
              {levelInfo.nextLevel ? xpForNext + " XP" : "MAX"}
            </Text>
          </View>
          <View style={[styles.xpBarBg, { backgroundColor: C.bg }]}>
            <View style={[styles.xpBarFill, { backgroundColor: C.primary, width: progressPct + "%" }]} />
          </View>
          <Text style={[styles.xpHint, { color: C.muted }]}>
            {levelInfo.nextLevel
              ? (xpForNext - levelInfo.xp) + " XP to " + levelInfo.nextLevel.title
              : "🏆 Max level reached!"}
          </Text>
          <Text style={[styles.tapHint, { color: C.primary }]}>Tap to see all levels →</Text>
        </TouchableOpacity>

        {/* ── Stats ── */}
        <View style={[styles.statsRow, { backgroundColor: C.card }]}>
          {[["Total XP", levelInfo.xp], ["Level", levelInfo.level], ["Left", 20 - levelInfo.level]].map(
            function(item, i) {
              return (
                <React.Fragment key={item[0]}>
                  {i > 0 ? <View style={[styles.statDivider, { backgroundColor: C.bg }]} /> : null}
                  <View style={styles.statItem}>
                    <Text style={[styles.statNum, { color: C.primary }]}>{item[1]}</Text>
                    <Text style={[styles.statLabel, { color: C.muted }]}>{item[0]}</Text>
                  </View>
                </React.Fragment>
              );
            }
          )}
        </View>

        {/* ── Badges section ── */}
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: C.text }]}>Badges</Text>
          <TouchableOpacity onPress={() => setShowBadges(true)}>
            <Text style={[styles.seeAll, { color: C.primary }]}>See all →</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.badgeScroll}>
          {BADGES.map(function(b) {
            const unlocked = levelInfo.level >= b.minLevel;
            const isCurrent = levelInfo.level >= b.minLevel && levelInfo.level <= b.maxLevel;
            return (
              <BadgeCard key={b.id} badge={b} unlocked={unlocked} isCurrent={isCurrent} C={C} />
            );
          })}
        </ScrollView>

        {/* Current badge description */}
        <View style={[styles.card, styles.badgeDescCard, { backgroundColor: C.card, borderColor: badge.ring }]}>
          <Text style={{ fontSize: 30, marginBottom: 6 }}>{badge.emoji}</Text>
          <Text style={[styles.badgeDescTitle, { color: C.text }]}>{badge.label + " Badge"}</Text>
          <Text style={[styles.badgeDescText, { color: C.muted }]}>{badge.description}</Text>
          <Text style={[styles.badgeProgress, { color: badge.color }]}>
            {unlockedBadges.length + " / " + BADGES.length + " badges unlocked"}
          </Text>
        </View>

      </ScrollView>

      {/* ── Levels modal ── */}
      <Modal visible={showLevels} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: C.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.text }]}>All Levels</Text>
              <TouchableOpacity onPress={() => setShowLevels(false)}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={LEVELS}
              keyExtractor={(item) => item.level.toString()}
              renderItem={({ item }) => {
                const unlocked = levelInfo.xp >= item.xpRequired;
                const isCurrent = item.level === levelInfo.level;
                const b = getBadgeForLevel(item.level);
                return (
                  <View style={[
                    styles.listRow,
                    { backgroundColor: isCurrent ? C.primary + "18" : "transparent" },
                    isCurrent ? { borderLeftWidth: 3, borderLeftColor: C.primary } : null,
                  ]}>
                    <View style={[styles.levelDot, { backgroundColor: unlocked ? C.primary : "transparent", borderColor: C.primary }]}>
                      {unlocked ? <Ionicons name="checkmark" size={11} color={C.primaryText} /> : null}
                    </View>
                    <Text style={{ fontSize: 18 }}>{b.emoji}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.listRowTitle, { color: unlocked ? C.text : C.muted }]}>
                        {"Level " + item.level + " — " + item.title}
                      </Text>
                      <Text style={[styles.listRowSub, { color: C.muted }]}>
                        {item.xpRequired.toLocaleString() + " XP"}
                      </Text>
                    </View>
                    {isCurrent ? (
                      <View style={[styles.pill, { backgroundColor: C.primary }]}>
                        <Text style={[styles.pillText, { color: C.primaryText }]}>YOU</Text>
                      </View>
                    ) : null}
                  </View>
                );
              }}
            />
          </View>
        </View>
      </Modal>

      {/* ── Badges modal ── */}
      <Modal visible={showBadges} animationType="slide" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalSheet, { backgroundColor: C.card }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: C.text }]}>All Badges</Text>
              <TouchableOpacity onPress={() => setShowBadges(false)}>
                <Ionicons name="close" size={24} color={C.text} />
              </TouchableOpacity>
            </View>
            <Text style={[styles.listRowSub, { color: C.muted, marginBottom: 12 }]}>
              {unlockedBadges.length + " of " + BADGES.length + " unlocked"}
            </Text>
            <FlatList
              data={BADGES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => {
                const unlocked = levelInfo.level >= item.minLevel;
                const isCurrent = levelInfo.level >= item.minLevel && levelInfo.level <= item.maxLevel;
                return (
                  <View style={[
                    styles.listRow,
                    {
                      backgroundColor: isCurrent ? item.color + "18" : "transparent",
                      borderLeftWidth: isCurrent ? 3 : 0,
                      borderLeftColor: item.ring,
                      opacity: unlocked ? 1 : 0.35,
                    },
                  ]}>
                    <View style={[styles.badgeModalIcon, { backgroundColor: item.color + "22" }]}>
                      <Text style={{ fontSize: 22 }}>{item.emoji}</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                        <Text style={[styles.listRowTitle, { color: unlocked ? C.text : C.muted }]}>{item.label}</Text>
                        {isCurrent ? (
                          <View style={[styles.pill, { backgroundColor: item.color }]}>
                            <Text style={[styles.pillText, { color: "#fff" }]}>NOW</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={[styles.listRowSub, { color: C.muted }]}>{item.description}</Text>
                      <Text style={[styles.badgeModalLevels, { color: item.color }]}>
                        {"Levels " + item.minLevel + (item.minLevel !== item.maxLevel ? "-" + item.maxLevel : "")}
                      </Text>
                    </View>
                    {unlocked ? <Ionicons name="checkmark-circle" size={20} color={item.color} /> : null}
                  </View>
                );
              }}
              ItemSeparatorComponent={() => <View style={{ height: 1, backgroundColor: C.bg }} />}
            />
          </View>
        </View>
      </Modal>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    width: "90%", flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginTop: "15%", marginBottom: 20, alignSelf: "center",
  },
  topBarTitle: { fontWeight: "bold", fontSize: 18 },
  content: { alignItems: "center", paddingHorizontal: 20, paddingBottom: 40 },
  badgeAvatar: {
    width: 110, height: 110, borderRadius: 55, borderWidth: 3,
    justifyContent: "center", alignItems: "center", marginBottom: 10,
    shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.55, shadowRadius: 12, elevation: 10,
  },
  badgeAvatarEmoji: { fontSize: 52 },
  badgeChip: {
    paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20, marginBottom: 12,
  },
  badgeChipLabel: { fontSize: 12, fontWeight: "700", color: "#fff", letterSpacing: 0.4 },
  name: { fontSize: 22, fontWeight: "bold", marginBottom: 3 },
  email: { fontSize: 13, marginBottom: 24 },
  card: { width: "100%", borderRadius: 18, padding: 18, marginBottom: 14 },
  levelTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 },
  sectionLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.5, marginBottom: 3 },
  levelTitle: { fontSize: 20, fontWeight: "bold" },
  xpRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  xpNum: { fontSize: 12 },
  xpBarBg: { height: 7, borderRadius: 4, overflow: "hidden", marginBottom: 7 },
  xpBarFill: { height: "100%", borderRadius: 4 },
  xpHint: { fontSize: 12, marginBottom: 10 },
  tapHint: { fontSize: 13, fontWeight: "600" },
  statsRow: {
    flexDirection: "row", width: "100%", borderRadius: 16,
    padding: 16, justifyContent: "space-around", marginBottom: 24,
  },
  statItem: { alignItems: "center", gap: 3 },
  statNum: { fontSize: 22, fontWeight: "bold" },
  statLabel: { fontSize: 11 },
  statDivider: { width: 1, marginVertical: 4 },
  pill: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  pillText: { fontSize: 11, fontWeight: "bold" },
  sectionHeader: {
    width: "100%", flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", marginBottom: 12,
  },
  sectionTitle: { fontSize: 15, fontWeight: "700" },
  seeAll: { fontSize: 13, fontWeight: "600" },
  badgeScroll: { gap: 10, paddingBottom: 10 },
  badgeCard: {
    width: 78, borderRadius: 14, padding: 10,
    alignItems: "center", gap: 4, position: "relative",
  },
  badgeEmojiWrap: {
    width: 46, height: 46, borderRadius: 23,
    justifyContent: "center", alignItems: "center", marginBottom: 2,
  },
  badgeCardLabel: { fontSize: 11, fontWeight: "700", textAlign: "center" },
  badgeCardLevels: { fontSize: 10, textAlign: "center" },
  currentPip: { position: "absolute", top: 6, right: 6, width: 7, height: 7, borderRadius: 4 },
  badgeDescCard: { alignItems: "center", borderWidth: 2 },
  badgeDescTitle: { fontSize: 15, fontWeight: "700", marginBottom: 5 },
  badgeDescText: { fontSize: 13, textAlign: "center", lineHeight: 19, marginBottom: 8 },
  badgeProgress: { fontSize: 12, fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "#00000088", justifyContent: "flex-end" },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, maxHeight: "82%" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: "bold" },
  listRow: {
    flexDirection: "row", alignItems: "center", gap: 12,
    paddingVertical: 11, paddingHorizontal: 8, borderRadius: 10, marginBottom: 2,
  },
  listRowTitle: { fontSize: 14, fontWeight: "600", marginBottom: 1 },
  listRowSub: { fontSize: 12 },
  levelDot: {
    width: 22, height: 22, borderRadius: 11, borderWidth: 2,
    justifyContent: "center", alignItems: "center",
  },
  badgeModalIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: "center", alignItems: "center" },
  badgeModalLevels: { fontSize: 11, fontWeight: "600", marginTop: 2 },
});