// ─────────────────────────────────────────────────────────────────────────────
// realTranscribe.js
// Drop this into your TranscriptionScreen.js
// ─────────────────────────────────────────────────────────────────────────────

// 1. ADD this import at the top of TranscriptionScreen.js:
import * as FileSystem from "expo-file-system";

// 2. SET your PC's local IP here (find it with ipconfig / ifconfig).
//    Your phone and PC must be on the SAME Wi-Fi network.
//    Example: "http://192.168.1.42:5001"
const WHISPER_SERVER_URL = "http://10.169.242.118:5001";

// 3. REPLACE fakeTranscribe with this function:
const realTranscribe = async (uri) => {
  try {
    // ── Step A: read the recorded audio as base64 ──────────────────────────
    const base64Audio = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    // ── Step B: build a multipart form with the audio file ─────────────────
    // We reconstruct the file from base64 so we can attach it as FormData.
    // The filename extension tells Whisper what format to expect.
    const fileName = "recording.m4a"; // expo-av default on iOS; Android may be .3gp
    const mimeType = "audio/m4a";

    const formData = new FormData();
    formData.append("audio", {
      uri,          // React Native FormData accepts a local file URI directly
      name: fileName,
      type: mimeType,
    });

    // ── Step C: POST to your local Whisper server ──────────────────────────
    const response = await fetch(`${WHISPER_SERVER_URL}/transcribe`, {
      method: "POST",
      body: formData,
      // Do NOT set Content-Type manually — React Native sets it with the boundary
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Server error:", errText);
      Alert.alert("Server error", `Status ${response.status}. Is whisper_server.py running?`);
      setStatus("ready");
      return;
    }

    const data = await response.json();

    // ── Step D: handle the response ────────────────────────────────────────
    if (data.error) {
      Alert.alert("Transcription failed", data.error);
      setStatus("ready");
      return;
    }

    const transcript = data.transcript?.trim();

    if (!transcript) {
      Alert.alert(
        "No speech detected",
        "Whisper couldn't find any speech. Try speaking closer to the mic."
      );
      setStatus("ready");
      return;
    }

    // ── Step E: save to state + history (same as original) ─────────────────
    setCurrentText(transcript);
    setStatus("ready");

    const entry = {
      id: Date.now().toString(),
      title: "Transcript · " + new Date().toLocaleTimeString(),
      text: transcript,
      createdAt: new Date().toISOString(),
    };
    const updated = await addTranscriptionToHistory(entry);
    if (updated) setHistory(updated);

  } catch (e) {
    console.error("realTranscribe error:", e);
    Alert.alert(
      "Connection failed",
      `Could not reach Whisper server at ${WHISPER_SERVER_URL}.\n\nCheck:\n• whisper_server.py is running\n• Phone & PC on same Wi-Fi\n• Correct IP address`
    );
    setStatus("ready");
  }
};

// 4. In stopRecording(), change:
//      await fakeTranscribe(uri);
//    to:
//      await realTranscribe(uri);
