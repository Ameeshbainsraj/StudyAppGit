// screens/TranscriptionScreen.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  Animated,
  Dimensions,
} from "react-native";
import { Ionicons, Entypo } from "@expo/vector-icons";
import { Audio } from "expo-av";
import * as Speech from "expo-speech";
import { useTheme } from "../ThemeContext";
import {
  loadTranscriptionSettings,
  loadTranscriptionHistory,
  addTranscriptionToHistory,
} from "../transcriptionConfig";

const SCREEN_HEIGHT = Dimensions.get("window").height;

export default function TranscriptionScreen({ navigation }) {
  const { theme } = useTheme();

  const [status, setStatus] = useState("ready"); // "ready" | "recording" | "processing"
  const [recording, setRecording] = useState(null);
  const [currentText, setCurrentText] = useState("");
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [settings, setSettings] = useState(null);

  const recordingRef = useRef(null);
  const historyAnim = useRef(new Animated.Value(0)).current; // 0 = collapsed, 1 = expanded

  useEffect(() => {
    const init = async () => {
      const setts = await loadTranscriptionSettings();
      setSettings(setts);
      const hist = await loadTranscriptionHistory();
      setHistory(hist);
    };
    init();
  }, []);

  // ---- RECORDING ----

  const startRecording = async () => {
    try {
      const perm = await Audio.requestPermissionsAsync();
      if (perm.status !== "granted") {
        Alert.alert("Permission needed", "Microphone access is required.");
        return;
      }

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      const { recording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      recordingRef.current = recording;
      setRecording(recording);
      setStatus("recording");
    } catch (e) {
      console.log("startRecording error:", e);
      Alert.alert("Error", "Could not start recording.");
    }
  };

  const pauseRecording = async () => {
    try {
      if (recordingRef.current) {
        await recordingRef.current.pauseAsync();
        setStatus("ready"); // paused
      }
    } catch (e) {
      console.log("pauseRecording error:", e);
    }
  };

  const stopRecording = async () => {
    try {
      if (!recordingRef.current) return;
      setStatus("processing");
      await recordingRef.current.stopAndUnloadAsync();
      const uri = recordingRef.current.getURI();
      recordingRef.current = null;
      setRecording(null);

      // FAKE transcription for now
      await fakeTranscribe(uri);
    } catch (e) {
      console.log("stopRecording error:", e);
      Alert.alert("Error", "Could not stop recording.");
      setStatus("ready");
    }
  };

  // ---- FAKE TRANSCRIPTION (replace with real API later) ----

  const fakeTranscribe = async (uri) => {
    console.log("audio file at:", uri);
    // simulate processing delay
    await new Promise((res) => setTimeout(res, 1500));

    const dummy =
      "Hi, this is a test, this feature will be completed soon. The purpose of this is to transcribe and then have AI involved in the export part where it will be used to make sense of the notes that was being heard through audio. Thanks for listening to Ameesh waffle about his presentation";
    setCurrentText(dummy);
    setStatus("ready");

    const entry = {
      id: Date.now().toString(),
      title: "Transcript " + new Date().toLocaleTimeString(),
      text: dummy,
      createdAt: new Date().toISOString(),
    };
    const updated = await addTranscriptionToHistory(entry);
    if (updated) setHistory(updated || []);
  };

  // ---- TTS READING ----

  const speakCurrent = () => {
    if (!currentText) {
      Alert.alert("No text", "There is no transcription to read.");
      return;
    }
    Speech.stop();
    const voiceId = settings?.voice ?? "voiceA";

    let options = {};
    if (voiceId === "voiceB") {
      options = { pitch: 1.2, rate: 1.0 };
    } else if (voiceId === "voiceC") {
      options = { pitch: 0.9, rate: 0.9 };
    } else {
      options = { pitch: 1.0, rate: 1.0 };
    }

    Speech.speak(currentText, options);
  };

  // ---- Export stubs ----

  const exportAsPDF = () => {
    if (!currentText) {
      Alert.alert("No text", "Nothing to export.");
      return;
    }
    Alert.alert("Export", "PDF export will be implemented later.");
  };

  const exportAsDOCX = () => {
    if (!currentText) {
      Alert.alert("No text", "Nothing to export.");
      return;
    }
    Alert.alert("Export", "Word/DOCX export will be implemented later.");
  };

  // ---- UI helpers ----

  const statusColor = (key) =>
    status === key ? theme.colors.primary : theme.colors.mutedText;

  const statusBg = (key) =>
    status === key ? theme.colors.card : "transparent";

  const handleNew = () => {
    Speech.stop();
    setCurrentText("");
    setStatus("ready");
  };

  const loadFromHistory = (item) => {
    Speech.stop();
    setCurrentText(item.text);
    setStatus("ready");
  };

  const toggleHistory = () => {
    const toValue = showHistory ? 0 : 1;
    Animated.timing(historyAnim, {
      toValue,
      duration: 250,
      useNativeDriver: false,
    }).start(() => {
      setShowHistory(!showHistory);
    });
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={28} color="#111111" />
        </TouchableOpacity>
        <Text style={{ fontWeight: "bold", fontSize: 18, color: "#111111" }}>
          TRANSCRIPTIONS
        </Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Entypo name="cog" size={28} color="#111111" />
        </TouchableOpacity>
      </View>

      {/* Status pills */}
      <View style={styles.statusRow}>
        <View
          style={[
            styles.statusPill,
            {
              borderColor: statusColor("recording"),
              backgroundColor: statusBg("recording"),
            },
          ]}
        >
          <Text
            style={{
              color: statusColor("recording"),
              fontWeight: "bold",
              fontSize: 12,
            }}
          >
            Recording
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            {
              borderColor: statusColor("processing"),
              backgroundColor: statusBg("processing"),
            },
          ]}
        >
          <Text
            style={{
              color: statusColor("processing"),
              fontWeight: "bold",
              fontSize: 12,
            }}
          >
            Processing
          </Text>
        </View>
        <View
          style={[
            styles.statusPill,
            {
              borderColor: statusColor("ready"),
              backgroundColor: statusBg("ready"),
            },
          ]}
        >
          <Text
            style={{
              color: statusColor("ready"),
              fontWeight: "bold",
              fontSize: 12,
            }}
          >
            Ready
          </Text>
        </View>
      </View>

      {/* Big transcription box */}
      <View
        style={[
          styles.transcriptBox,
          { backgroundColor: theme.colors.card },
        ]}
      >
        <ScrollView>
          <Text
            style={{
              color: theme.colors.text,
              fontSize: 15,
              lineHeight: 22,
            }}
          >
            {currentText ||
              "Your transcription will appear here after you stop recording."}
          </Text>
        </ScrollView>

        {/* Actions inside box */}
        <View style={styles.boxActions}>
          <TouchableOpacity onPress={speakCurrent}>
            <Text
              style={{
                color: theme.colors.primary,
                fontWeight: "bold",
              }}
            >
              Play Text
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleNew}>
            <Text
              style={{
                color: theme.colors.mutedText,
                fontWeight: "bold",
              }}
            >
              New
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Record controls */}
      <View style={styles.controlsRow}>
        <TouchableOpacity
          style={[
            styles.iconBtn,
            { backgroundColor: theme.colors.card },
          ]}
          onPress={startRecording}
        >
          <Ionicons name="mic" size={30} color={theme.colors.primary} />
          <Text style={[styles.ctlTxt, { color: theme.colors.primary }]}>
            PLAY
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.iconBtn,
            { backgroundColor: theme.colors.card },
          ]}
          onPress={pauseRecording}
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
          onPress={stopRecording}
        >
          <Ionicons name="stop" size={30} color={theme.colors.primary} />
          <Text style={[styles.ctlTxt, { color: theme.colors.primary }]}>
            STOP
          </Text>
        </TouchableOpacity>
      </View>

      {/* Export buttons */}
      <View style={styles.exportRow}>
        <TouchableOpacity
          style={[
            styles.exportBtn,
            { backgroundColor: theme.colors.card },
          ]}
          onPress={exportAsPDF}
        >
          <Text
            style={{ color: theme.colors.primary, fontWeight: "bold" }}
          >
            Export PDF
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.exportBtn,
            { backgroundColor: theme.colors.card },
          ]}
          onPress={exportAsDOCX}
        >
          <Text
            style={{ color: theme.colors.primary, fontWeight: "bold" }}
          >
            Export Word
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom history handle */}
      <TouchableOpacity
        style={[
          styles.bottomBar,
          { backgroundColor: theme.colors.primary },
        ]}
        onPress={toggleHistory}
      >
        <Text
          style={[
            styles.bottomBarTxt,
            { color: theme.colors.primaryText },
          ]}
        >
          {showHistory ? "Tap to collapse history" : "Tap to view history"}
        </Text>
      </TouchableOpacity>

      {/* Animated history panel */}
      <Animated.View
        style={[
          styles.historyPanel,
          {
            backgroundColor: theme.colors.card,
            height: historyAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, SCREEN_HEIGHT * 0.3],
            }),
            opacity: historyAnim,
            paddingVertical: historyAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [0, 10],
            }),
          },
        ]}
      >
        <ScrollView>
          {history.length === 0 ? (
            <Text
              style={{
                color: theme.colors.mutedText,
                fontSize: 13,
              }}
            >
              No previous transcriptions yet.
            </Text>
          ) : (
            history.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.historyItem}
                onPress={() => loadFromHistory(item)}
              >
                <Text
                  style={{
                    color: theme.colors.text,
                    fontWeight: "bold",
                  }}
                >
                  {item.title}
                </Text>
                <Text
                  numberOfLines={1}
                  style={{
                    color: theme.colors.mutedText,
                    fontSize: 12,
                    marginTop: 2,
                  }}
                >
                  {item.text}
                </Text>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topBar: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: "12%",
    marginBottom: 20,
    alignSelf: "center",
    alignItems: "center",
  },
  statusRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  statusPill: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginHorizontal: 4,
  },
  transcriptBox: {
    flex: 1,
    marginHorizontal: 20,
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    marginBottom: 10,
  },
  boxActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  controlsRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  iconBtn: {
    borderRadius: 20,
    marginHorizontal: 10,
    width: 80,
    height: 80,
    justifyContent: "center",
    alignItems: "center",
  },
  ctlTxt: { marginTop: 6, fontWeight: "bold", fontSize: 12 },
  exportRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 8,
  },
  exportBtn: {
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 8,
    marginHorizontal: 8,
  },
  bottomBar: {
    width: "100%",
    height: "13%",
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginBottom: 0,
  },
  bottomBarTxt: { fontWeight: "bold", fontSize: 14 },
historyPanel: {
  position: "absolute",
  bottom: 60 + 48,         // 48 was your old offset; adjust if needed
  left: 0,
  right: 0,
  paddingHorizontal: 20,
  borderTopLeftRadius: 16,
  borderTopRightRadius: 16,
  overflow: "hidden",
}
,
  historyItem: {
    paddingVertical: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: "#ccc",
  },
});
