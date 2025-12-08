// screens/SettingsScreen.js
import React, { useState, useEffect } from "react";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  TextInput,
} from "react-native";

import {
  loadPomodoroSettings,
  setWorkMinutes,
  setShortBreakMinutes,
  setLongBreakMinutes,
  setStartSound,
  setBreakEndSound,
} from "../PomodoroConfig";


import {
  loadTranscriptionSettings,
  setVoice,
} from "../transcriptionConfig";


import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { doc, updateDoc } from "firebase/firestore";
import { useTheme } from "../ThemeContext";

export default function SettingsScreen({ navigation }) {
  const [saving, setSaving] = useState(false);
  const [showThemes, setShowThemes] = useState(false);
  const { theme, themeKey, changeTheme } = useTheme();

  const handleLogout = () => {
    navigation.replace("Login");
  };

  const pickImage = async (fromCamera = false) => {
    const permissionResult = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.status !== "granted") {
      Alert.alert("Permission needed", "Allow access to use this feature.");
      return null;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        })
      : await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          aspect: [1, 1],
          quality: 0.8,
        });

    if (result.canceled) return null;
    return result.assets[0].uri;
  };

  const pickAndSave = async (fromCamera) => {
    try {
      const user = FIREBASE_AUTH.currentUser;
      if (!user) return;

      const uri = await pickImage(fromCamera);
      if (!uri) return;

      setSaving(true);

      await updateDoc(doc(FIREBASE_DB, "users", user.uid), {
        localProfileUri: uri,
      });

      Alert.alert("Profile updated", "Profile picture has been set.");
    } catch (err) {
      console.log("Save image URI error:", err);
      Alert.alert("Error", "Could not save image.");
    } finally {
      setSaving(false);
    }
  };

  const handleSetProfileImage = async () => {
    const user = FIREBASE_AUTH.currentUser;
    if (!user) {
      Alert.alert("Not logged in", "Please log in first.");
      return;
    }

    Alert.alert(
      "Profile Picture",
      "Choose image source",
      [
        { text: "Camera", onPress: () => pickAndSave(true) },
        { text: "Gallery", onPress: () => pickAndSave(false) },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const ThemeOption = ({ id, label, previewColor }) => (
    <TouchableOpacity
      onPress={async () => {
        await changeTheme(id);
      }}
      style={[
        styles.themeOption,
        {
          borderColor:
            themeKey === id ? theme.colors.primary : theme.colors.mutedText,
        },
      ]}
    >
      <View
        style={[
          styles.themeColorDot,
          { backgroundColor: previewColor },
        ]}
      />
      <Text
        style={[
          styles.themeOptionText,
          {
            color:
              themeKey === id ? theme.colors.primary : theme.colors.text,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );


    const [pomoSettings, setPomoSettings] = useState(null);

    useEffect(() => {
      const load = async () => {
        const s = await loadPomodoroSettings();
        setPomoSettings(s);
      };
      load();
    }, []);


    const [editingField, setEditingField] = useState(null); // "work" | "short" | "long" | null
    const [tempMinutes, setTempMinutes] = useState("");

    const openEdit = (field) => {
  setEditingField(field);
  if (!pomoSettings) {
    setTempMinutes("");
    return;
  }
  if (field === "work") setTempMinutes(String(pomoSettings.workMinutes));
  if (field === "short") setTempMinutes(String(pomoSettings.shortBreakMinutes));
  if (field === "long") setTempMinutes(String(pomoSettings.longBreakMinutes));
};

const saveEdit = async () => {
  const n = parseInt(tempMinutes, 10);
  if (isNaN(n) || n <= 0) {
    Alert.alert("Invalid value", "Enter minutes greater than 0.");
    return;
  }
  let updated = null;
  if (editingField === "work") updated = await setWorkMinutes(n);
  if (editingField === "short") updated = await setShortBreakMinutes(n);
  if (editingField === "long") updated = await setLongBreakMinutes(n);
  if (updated) setPomoSettings(updated);
  setEditingField(null);
  setTempMinutes("");
};




/* TRANSCRIPTION STUFF */

const [transSettings, setTransSettings] = useState(null);

useEffect(() => {
  const load = async () => {
    const s = await loadTranscriptionSettings();
    setTransSettings(s);
  };
  load();
}, []);


  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Top */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#111111" />
        </TouchableOpacity>
      <Text style={[styles.header, { color: "#111111" }]}>
        
      </Text>

      </View>

      <ScrollView
        style={{ width: "100%" }}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {/* Account */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Ionicons
              name="person-circle-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.text },
              ]}
            >
              Account
            </Text>
          </View>

          <TouchableOpacity
            style={styles.rowButton}
            disabled={true}
          >
            <Text
              style={[
                styles.itemLabel,
                { color: theme.colors.text },
              ]}
            >
              Username
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rowButton}
            onPress={handleSetProfileImage}
            disabled={saving}
          >
            <Text
              style={[
                styles.actionText,
                { color: theme.colors.primary },
              ]}
            >
              {saving ? "Saving..." : "Set Profile Picture"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* App Settings */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Ionicons
              name="settings-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.text },
              ]}
            >
              App Settings
            </Text>
          </View>

          <TouchableOpacity style={styles.rowButton}>
            <Text
              style={[
                styles.itemLabel,
                { color: theme.colors.text },
              ]}
            >
              Mode: Dark
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowButton}>
            <Text
              style={[
                styles.itemLabel,
                { color: theme.colors.text },
              ]}
            >
              Language: English
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.rowButton}>
            <Text
              style={[
                styles.itemLabel,
                { color: theme.colors.text },
              ]}
            >
              Font Size: Medium
            </Text>
          </TouchableOpacity>

          {/* Themes opener */}
          <TouchableOpacity
            style={styles.rowButton}
            onPress={() => setShowThemes((v) => !v)}
          >
            <Text
              style={[
                styles.itemLabel,
                { color: theme.colors.text },
              ]}
            >
              Themes
            </Text>
            <Ionicons
              name={showThemes ? "chevron-up" : "chevron-down"}
              size={18}
              color={theme.colors.mutedText}
            />
          </TouchableOpacity>

          {/* Themes card (scrollable horizontally so more can be added) */}
          {showThemes && (
            <View style={styles.themeCard}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ paddingRight: 6 }}
              >
              <ThemeOption id="icy" label="Icy Blue Forest" previewColor="#BAD9EB" />
              <ThemeOption id="peach" label="Peach Deluxe" previewColor="#F8E6D2" />
              <ThemeOption id="pastelGreen" label="Pastel Green" previewColor="#B4D3B3" />
              <ThemeOption id="paleHoney" label="Pale Honey" previewColor="#ECCE90" />
              <ThemeOption id="softSand" label="Soft Sand" previewColor="#F5EFE6"/>

                {/* add more ThemeOption components here later */}
              </ScrollView>
            </View>
          )}
        </View>




{/* Transcriptions */}
<View
  style={[
    styles.card,
    { backgroundColor: theme.colors.card },
  ]}
>
  <View style={styles.cardHeaderRow}>
    <Ionicons
      name="mic-outline"
      size={24}
      color={theme.colors.primary}
    />
    <Text
      style={[
        styles.cardTitle,
        { color: theme.colors.text },
      ]}
    >
      Transcriptions
    </Text>
  </View>

  <TouchableOpacity style={styles.rowButton}>
    <Text
      style={[
        styles.itemLabel,
        { color: theme.colors.text },
      ]}
    >
      Export Format: PDF / DOCX (coming soon)
    </Text>
  </TouchableOpacity>

  <Text
    style={[
      styles.itemLabel,
      { color: theme.colors.text, marginTop: 8, marginBottom: 4 },
    ]}
  >
    Voice Recognition:
  </Text>

  {["voiceA", "voiceB", "voiceC"].map((id) => {
    const label =
      id === "voiceA" ? "Calm Voice" : id === "voiceB" ? "Bright Voice" : "Deep Voice";
    const selected = transSettings?.voice === id;
    return (
      <TouchableOpacity
        key={id}
        style={styles.rowButton}
        onPress={async () => {
          const updated = await setVoice(id);
          if (updated) setTransSettings(updated);
        }}
      >
        <Text
          style={[
            styles.itemLabel,
            {
              color: selected ? theme.colors.primary : theme.colors.text,
              fontWeight: selected ? "bold" : "normal",
            },
          ]}
        >
          {label}
        </Text>
        {selected && (
          <Ionicons
            name="checkmark-circle"
            size={18}
            color={theme.colors.primary}
          />
        )}
      </TouchableOpacity>
    );
  })}
</View>





{/* Pomodoro */}
<View
  style={[
    styles.card,
    { backgroundColor: theme.colors.card },
  ]}
>
  <View style={styles.cardHeaderRow}>
    <Ionicons
      name="timer-outline"
      size={24}
      color={theme.colors.primary}
    />
    <Text
      style={[
        styles.cardTitle,
        { color: theme.colors.text },
      ]}
    >
      Pomodoro Timer
    </Text>
  </View>
{/* Durations */}
<TouchableOpacity
  style={styles.rowButton}
  onPress={() => openEdit("work")}
>
  <Text
    style={[
      styles.itemLabel,
      { color: theme.colors.text },
    ]}
  >
    Work Duration: {pomoSettings?.workMinutes ?? 25} min
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.rowButton}
  onPress={() => openEdit("short")}
>
  <Text
    style={[
      styles.itemLabel,
      { color: theme.colors.text },
    ]}
  >
    Break Duration: {pomoSettings?.shortBreakMinutes ?? 5} min
  </Text>
</TouchableOpacity>

<TouchableOpacity
  style={styles.rowButton}
  onPress={() => openEdit("long")}
>
  <Text
    style={[
      styles.itemLabel,
      { color: theme.colors.text },
    ]}
  >
    Long Break: {pomoSettings?.longBreakMinutes ?? 15} min
  </Text>
</TouchableOpacity>

{/* Inline edit box */}
{editingField && (
  <View style={{ marginTop: 10 }}>
    <Text
      style={[
        styles.itemLabel,
        { color: theme.colors.text, marginBottom: 4 },
      ]}
    >
      {editingField === "work"
        ? "Set work minutes"
        : editingField === "short"
        ? "Set break minutes"
        : "Set long break minutes"}
    </Text>
    <TextInput
      style={{
        borderWidth: 1,
        borderColor: theme.colors.mutedText,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 6,
        color: theme.colors.text,
      }}
      keyboardType="number-pad"
      value={tempMinutes}
      onChangeText={setTempMinutes}
      placeholder="e.g. 25"
      placeholderTextColor={theme.colors.mutedText}
    />
    <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 6 }}>
      <TouchableOpacity onPress={() => { setEditingField(null); setTempMinutes(""); }}>
        <Text style={{ marginRight: 18, color: theme.colors.mutedText, fontWeight: "bold" }}>
          Cancel
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={saveEdit}>
        <Text style={{ color: theme.colors.primary, fontWeight: "bold" }}>
          Save
        </Text>
      </TouchableOpacity>
    </View>
  </View>
)}

  {/* Sounds */}
  <TouchableOpacity
    style={styles.rowButton}
    onPress={async () => {
      const next =
        pomoSettings?.startSound === "HEE" ? "none" : "HEE";
      const updated = await setStartSound(next);
      setPomoSettings(updated);
    }}
  >
    <Text
      style={[
        styles.itemLabel,
        { color: theme.colors.text },
      ]}
    >
      Work Start Sound: {pomoSettings?.startSound ?? "HEE"}
    </Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={styles.rowButton}
    onPress={async () => {
      const next =
        pomoSettings?.breakEndSound === "CHIME" ? "none" : "CHIME";
      const updated = await setBreakEndSound(next);
      setPomoSettings(updated);
    }}
  >
    <Text
      style={[
        styles.itemLabel,
        { color: theme.colors.text },
      ]}
    >
      Break Over Sound: {pomoSettings?.breakEndSound ?? "CHIME"}
    </Text>
  </TouchableOpacity>
</View>


        {/* About */}
        <View
          style={[
            styles.card,
            { backgroundColor: theme.colors.card },
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <Ionicons
              name="information-circle-outline"
              size={24}
              color={theme.colors.primary}
            />
            <Text
              style={[
                styles.cardTitle,
                { color: theme.colors.text },
              ]}
            >
              About & Support
            </Text>
          </View>

          {["Help Center | Rate App", "About App"].map((label) => (
            <TouchableOpacity key={label} style={styles.rowButton}>
              <Text
                style={[
                  styles.itemLabel,
                  { color: theme.colors.text },
                ]}
              >
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={[
            styles.logoutCard,
            { backgroundColor: theme.colors.danger },
          ]}
          onPress={handleLogout}
        >
          {saving ? (
            <ActivityIndicator color={theme.colors.primaryText} />
          ) : (
            <Text
              style={[
                styles.logoutText,
                { color: theme.colors.primaryText },
              ]}
            >
              LOG OUT
            </Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  header: {
    fontWeight: "bold",
    fontSize: 24,
    marginLeft: 15,
    letterSpacing: 1,
  },
  card: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    width: "100%",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 4,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginLeft: 8,
  },
  rowButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 8,
  },
  itemLabel: {
    fontSize: 15,
  },
  actionText: {
    fontWeight: "bold",
    fontSize: 15,
    textDecorationLine: "underline",
  },
  themeCard: {
    marginTop: 10,
    borderRadius: 16,
    paddingVertical: 10,
    paddingLeft: 4,
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 2,
    marginRight: 10,
  },
  themeColorDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
    marginRight: 8,
  },
  themeOptionText: {
    fontWeight: "bold",
    fontSize: 14,
  },
  logoutCard: {
    borderRadius: 20,
    paddingVertical: 18,
    marginVertical: 15,
    alignItems: "center",
    width: "100%",
    alignSelf: "center",
  },
  logoutText: {
    fontWeight: "bold",
    fontSize: 20,
  },
});
