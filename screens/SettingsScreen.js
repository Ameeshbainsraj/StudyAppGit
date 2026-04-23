// screens/SettingsScreen.js
import React, { useState, useEffect } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, TextInput, Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { useTheme } from "../ThemeContext";
import { THEMES } from "../theme";
import {
  loadPomodoroSettings, setWorkMinutes,
  setShortBreakMinutes, setLongBreakMinutes,
  setStartSound, setBreakEndSound,
} from "../PomodoroConfig";
import { loadTranscriptionSettings, setVoice } from "../transcriptionConfig";

export default function SettingsScreen({ navigation }) {
  const { theme, themeKey, changeTheme } = useTheme();

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

  const [saving, setSaving]               = useState(false);
  const [userName, setUserName]           = useState("USERNAME");
  const [userEmail, setUserEmail]         = useState("");
  const [profileUri, setProfileUri]       = useState(null);
  const [pomoSettings, setPomoSettings]   = useState(null);
  const [transSettings, setTransSettings] = useState(null);
  const [editingField, setEditingField]   = useState(null);
  const [tempMinutes, setTempMinutes]     = useState("");
  const [showThemePicker, setShowThemePicker] = useState(false);
  const [isAdmin, setIsAdmin]             = useState(false);

  useEffect(() => {
    const load = async () => {
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        setUserEmail(user.email || "");
        const snap = await getDoc(doc(FIREBASE_DB, "users", user.uid));
        if (snap.exists()) {
          const data = snap.data();
          if (data.name) setUserName(data.name);
          // ✅ Read localProfileUri (the field we always write to)
          if (data.localProfileUri) setProfileUri(data.localProfileUri);
          setIsAdmin(data.isAdmin === true);
        }
      }
      const ps = await loadPomodoroSettings();
      setPomoSettings(ps);
      const ts = await loadTranscriptionSettings();
      setTransSettings(ts);
    };
    load();
  }, []);

  const pickAndSave = async (fromCamera) => {
    try {
      const perm = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Permission needed", "Allow access to use this feature.");
        return;
      }
      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, allowsEditing: true, aspect: [1, 1], quality: 0.8 });
      if (result.canceled) return;

      setSaving(true);
      const uri = result.assets[0].uri;
      const user = FIREBASE_AUTH.currentUser;
      if (user) {
        // ✅ Always write to localProfileUri so all screens read the same field
        await updateDoc(doc(FIREBASE_DB, "users", user.uid), { localProfileUri: uri });
        setProfileUri(uri);
      }
      Alert.alert("Profile updated", "Profile picture has been set.");
    } catch (err) {
      Alert.alert("Error", "Could not save image.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetProfileImage = () => {
    if (!FIREBASE_AUTH.currentUser) { Alert.alert("Not logged in"); return; }
    Alert.alert("Profile Picture", "Choose image source", [
      { text: "Camera",  onPress: () => pickAndSave(true)  },
      { text: "Gallery", onPress: () => pickAndSave(false) },
      { text: "Cancel",  style: "cancel"                   },
    ]);
  };

  const openEdit = (field) => {
    setEditingField(field);
    if (!pomoSettings) { setTempMinutes(""); return; }
    if (field === "work")  setTempMinutes(String(pomoSettings.workMinutes));
    if (field === "short") setTempMinutes(String(pomoSettings.shortBreakMinutes));
    if (field === "long")  setTempMinutes(String(pomoSettings.longBreakMinutes));
  };

  const saveEdit = async () => {
    const n = parseInt(tempMinutes, 10);
    if (isNaN(n) || n <= 0) { Alert.alert("Invalid value", "Enter minutes greater than 0."); return; }
    let updated = null;
    if (editingField === "work")  updated = await setWorkMinutes(n);
    if (editingField === "short") updated = await setShortBreakMinutes(n);
    if (editingField === "long")  updated = await setLongBreakMinutes(n);
    if (updated) setPomoSettings(updated);
    setEditingField(null);
    setTempMinutes("");
  };

  const handleLogout = () => navigation.replace("Login");

  const initials = userName ? userName.charAt(0).toUpperCase() : "U";
  const currentThemeName = THEMES[themeKey]?.name || themeKey;

  const Row = ({ iconName, iconColor, label, value, onPress, chevron = true, last = false }) => (
    <TouchableOpacity
      style={[s.row, !last && { borderBottomWidth: 1, borderBottomColor: C.input }]}
      onPress={onPress}
      disabled={!onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <View style={[s.rowIcon, { backgroundColor: iconColor + "25" }]}>
        <Ionicons name={iconName} size={18} color={iconColor} />
      </View>
      <Text style={[s.rowLabel, { color: C.text }]}>{label}</Text>
      <View style={s.rowRight}>
        {value ? <Text style={[s.rowValue, { color: C.muted }]}>{value}</Text> : null}
        {chevron && onPress && (
          <Ionicons name="chevron-forward" size={16} color={C.muted} style={{ marginLeft: 4 }} />
        )}
      </View>
    </TouchableOpacity>
  );

  const Section = ({ label }) => (
    <Text style={[s.sectionLabel, { color: C.muted }]}>{label}</Text>
  );

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <Text style={[s.pageTitle, { color: C.text }]}>Settings</Text>

        {/* ── Profile card ── */}
        <TouchableOpacity
          style={[s.profileCard, { backgroundColor: C.card }]}
          onPress={handleSetProfileImage}
          activeOpacity={0.8}
        >
          <View style={[s.avatar, { backgroundColor: C.primary }]}>
            {profileUri ? (
              <Image source={{ uri: profileUri }} style={s.avatarImg} />
            ) : (
              <Text style={[s.avatarInitial, { color: C.primaryText }]}>{initials}</Text>
            )}
          </View>
          <View style={s.profileInfo}>
            <Text style={[s.profileName, { color: C.text }]}>{userName.toUpperCase()}</Text>
            <Text style={[s.profileEmail, { color: C.muted }]}>{userEmail}</Text>
            <Text style={[s.profileHint, { color: C.muted }]}>Tap to change photo</Text>
          </View>
          {saving && <ActivityIndicator color={C.primary} size="small" />}
        </TouchableOpacity>

        {/* ── ACCOUNT ── */}
        <Section label="ACCOUNT" />
        <View style={[s.card, { backgroundColor: C.card }]}>
          <Row
            iconName="person-outline"
            iconColor={C.primary}
            label="Profile & XP"
            onPress={() => navigation.navigate("Profile")}
            last={!isAdmin}
          />
          {isAdmin && (
            <Row
              iconName="shield-outline"
              iconColor="#EF4444"
              label="Admin Panel"
              onPress={() => navigation.navigate("Admin")}
              last
            />
          )}
        </View>

        {/* ── APPEARANCE ── */}
        <Section label="APPEARANCE" />
        <View style={[s.card, { backgroundColor: C.card }]}>
          <Row
            iconName="color-palette-outline"
            iconColor={C.primary}
            label="Theme"
            value={currentThemeName}
            onPress={() => setShowThemePicker(!showThemePicker)}
          />
          {showThemePicker && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ paddingVertical: 12 }}
              contentContainerStyle={{ paddingHorizontal: 12, gap: 8 }}
            >
              {Object.entries(THEMES).map(([id, t]) => (
                <TouchableOpacity
                  key={id}
                  onPress={async () => { await changeTheme(id); setShowThemePicker(false); }}
                  style={[
                    s.themeChip,
                    {
                      borderColor: themeKey === id ? C.primary : C.input,
                      backgroundColor: themeKey === id ? C.primary + "20" : C.input,
                    },
                  ]}
                >
                  <View style={[s.themeChipDot, { backgroundColor: t.colors.primary }]} />
                  <Text style={[s.themeChipTxt, { color: themeKey === id ? C.primary : C.text }]}>
                    {t.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}
          <Row
            iconName="brush-outline"
            iconColor={C.primary}
            label="Custom Theme"
            onPress={() => Alert.alert("Coming soon", "Custom themes will be available in a future update.")}
            last
          />
        </View>

        {/* ── STUDY PREFERENCES ── */}
        <Section label="STUDY PREFERENCES" />
        <View style={[s.card, { backgroundColor: C.card }]}>
          <Row
            iconName="timer-outline"
            iconColor="#F59E0B"
            label="Focus Duration"
            value={`${pomoSettings?.workMinutes ?? 25} min`}
            onPress={() => openEdit("work")}
          />
          <Row
            iconName="cafe-outline"
            iconColor="#10B981"
            label="Break Duration"
            value={`${pomoSettings?.shortBreakMinutes ?? 5} min`}
            onPress={() => openEdit("short")}
          />
          <Row
            iconName="moon-outline"
            iconColor="#6366F1"
            label="Long Break"
            value={`${pomoSettings?.longBreakMinutes ?? 15} min`}
            onPress={() => openEdit("long")}
          />
          <Row
            iconName="volume-medium-outline"
            iconColor="#EC4899"
            label="Work Start Sound"
            value={pomoSettings?.startSound ?? "HEE"}
            onPress={async () => {
              const next = pomoSettings?.startSound === "HEE" ? "none" : "HEE";
              const updated = await setStartSound(next);
              setPomoSettings(updated);
            }}
          />
          <Row
            iconName="musical-notes-outline"
            iconColor="#EC4899"
            label="Break Over Sound"
            value={pomoSettings?.breakEndSound ?? "CHIME"}
            onPress={async () => {
              const next = pomoSettings?.breakEndSound === "CHIME" ? "none" : "CHIME";
              const updated = await setBreakEndSound(next);
              setPomoSettings(updated);
            }}
            last={!editingField}
          />
          {editingField && (
            <View style={[s.editBox, { borderColor: C.input }]}>
              <Text style={[s.editLabel, { color: C.muted }]}>
                {editingField === "work" ? "Set work minutes" : editingField === "short" ? "Set break minutes" : "Set long break minutes"}
              </Text>
              <TextInput
                style={[s.editInput, { backgroundColor: C.input, color: C.text }]}
                keyboardType="number-pad"
                value={tempMinutes}
                onChangeText={setTempMinutes}
                placeholder="e.g. 25"
                placeholderTextColor={C.muted}
              />
              <View style={s.editBtns}>
                <TouchableOpacity onPress={() => { setEditingField(null); setTempMinutes(""); }}>
                  <Text style={[s.editCancel, { color: C.muted }]}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[s.editSaveBtn, { backgroundColor: C.primary }]} onPress={saveEdit}>
                  <Text style={[s.editSaveTxt, { color: C.primaryText }]}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ── TRANSCRIPTION ── */}
        <Section label="TRANSCRIPTION" />
        <View style={[s.card, { backgroundColor: C.card }]}>
          {[
            { id: "voiceA", label: "Calm Voice"   },
            { id: "voiceB", label: "Bright Voice" },
            { id: "voiceC", label: "Deep Voice"   },
          ].map(({ id, label }, i, arr) => (
            <Row
              key={id}
              iconName={transSettings?.voice === id ? "radio-button-on-outline" : "radio-button-off-outline"}
              iconColor={transSettings?.voice === id ? C.primary : C.muted}
              label={label}
              value={transSettings?.voice === id ? "Active" : ""}
              onPress={async () => {
                const updated = await setVoice(id);
                if (updated) setTransSettings(updated);
              }}
              chevron={false}
              last={i === arr.length - 1}
            />
          ))}
        </View>

        {/* ── ABOUT ── */}
        <Section label="ABOUT" />
        <View style={[s.card, { backgroundColor: C.card }]}>
          <Row
            iconName="information-circle-outline"
            iconColor={C.muted}
            label="Version"
            value="1.0.0"
            chevron={false}
          />
          <Row
            iconName="help-circle-outline"
            iconColor={C.muted}
            label="Help Center"
            onPress={() => Alert.alert("Help Center", "Coming soon.")}
          />
          <Row
            iconName="star-outline"
            iconColor="#F59E0B"
            label="Rate App"
            onPress={() => Alert.alert("Rate App", "Thanks for using Shepard Learn!")}
            last
          />
        </View>

        {/* ── LOGOUT ── */}
        <TouchableOpacity
          style={[s.logoutBtn, { backgroundColor: C.danger + "20", borderColor: C.danger + "50" }]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={22} color={C.danger} />
          <Text style={[s.logoutTxt, { color: C.danger }]}>Logout</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, paddingTop: "14%" },
  pageTitle: { fontSize: 32, fontWeight: "bold", marginBottom: 20 },

  profileCard: {
    flexDirection: "row", alignItems: "center",
    borderRadius: 20, padding: 18, gap: 16, marginBottom: 24,
  },
  avatar: {
    width: 60, height: 60, borderRadius: 30,
    justifyContent: "center", alignItems: "center", overflow: "hidden",
  },
  avatarImg:     { width: "100%", height: "100%", resizeMode: "cover" },
  avatarInitial: { fontSize: 24, fontWeight: "bold" },
  profileInfo:   { flex: 1 },
  profileName:   { fontSize: 16, fontWeight: "800", letterSpacing: 1, marginBottom: 4 },
  profileEmail:  { fontSize: 13, marginBottom: 2 },
  profileHint:   { fontSize: 11 },

  sectionLabel: {
    fontSize: 11, fontWeight: "700", letterSpacing: 1.5,
    marginBottom: 8, marginTop: 4, marginLeft: 2,
  },

  card: { borderRadius: 20, marginBottom: 20, overflow: "hidden" },

  row: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 16, paddingVertical: 14, gap: 12,
  },
  rowIcon:  { width: 34, height: 34, borderRadius: 10, justifyContent: "center", alignItems: "center" },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: "500" },
  rowRight: { flexDirection: "row", alignItems: "center" },
  rowValue: { fontSize: 14 },

  themeChip: {
    flexDirection: "row", alignItems: "center", gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1.5,
  },
  themeChipDot: { width: 12, height: 12, borderRadius: 6 },
  themeChipTxt: { fontSize: 12, fontWeight: "600" },

  editBox:    { margin: 12, marginTop: 4, borderWidth: 1, borderRadius: 14, padding: 14, gap: 10 },
  editLabel:  { fontSize: 13 },
  editInput:  { borderRadius: 10, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15 },
  editBtns:   { flexDirection: "row", justifyContent: "flex-end", gap: 16 },
  editCancel: { fontSize: 14, fontWeight: "600", paddingVertical: 6 },
  editSaveBtn:{ paddingHorizontal: 20, paddingVertical: 8, borderRadius: 10 },
  editSaveTxt:{ fontSize: 14, fontWeight: "700" },

  logoutBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center",
    gap: 10, borderRadius: 20, paddingVertical: 18,
    marginTop: 4, marginBottom: 20, borderWidth: 1,
  },
  logoutTxt: { fontSize: 18, fontWeight: "700" },
});