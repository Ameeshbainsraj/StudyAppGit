// screens/NotesScreen.js
import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { Ionicons, MaterialIcons, Entypo } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useTheme } from "../ThemeContext";
import { loadNotes, deleteNote, createNote } from "../notesConfig";

export default function NotesScreen({ navigation }) {
  const { theme } = useTheme();
  const [notes, setNotes] = useState([]);

  const C = {
    bg:          theme.colors.background,
    card:        theme.colors.card,
    primary:     theme.colors.primary,
    primaryText: theme.colors.primaryText,
    text:        theme.colors.text,
    muted:       theme.colors.mutedText,
    danger:      theme.colors.danger,
  };

  // Reload notes every time screen is focused
  useFocusEffect(
    useCallback(() => {
      loadNotes().then(setNotes);
    }, [])
  );

  const handleNewNote = () => {
    const note = createNote();
    navigation.navigate("NoteEditor", { note, isNew: true });
  };

  const handleOpenNote = (note) => {
    navigation.navigate("NoteEditor", { note, isNew: false });
  };

  const handleDelete = (id, title) => {
    Alert.alert("Delete Note", `Delete "${title || "Untitled"}"?`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete", style: "destructive",
        onPress: async () => {
          const updated = await deleteNote(id);
          if (updated !== null) setNotes(updated);
        },
      },
    ]);
  };

  const formatDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <View style={[s.container, { backgroundColor: C.bg }]}>

      {/* ── Top Bar ──────────────────────────────────────────────────────── */}
      <View style={s.topBar}>
        <TouchableOpacity onPress={() => navigation.navigate("Home")}>
          <Ionicons name="arrow-back" size={28} color={C.text} />
        </TouchableOpacity>
        <Text style={[s.topBarTitle, { color: C.text }]}>NOTES</Text>
        <TouchableOpacity onPress={() => navigation.navigate("Settings")}>
          <Entypo name="cog" size={30} color={C.text} />
        </TouchableOpacity>
      </View>

      {/* ── New Note button ───────────────────────────────────────────────── */}
      <TouchableOpacity
        style={[s.newNoteBtn, { backgroundColor: C.primary }]}
        onPress={handleNewNote}
      >
        <Ionicons name="add" size={22} color={C.primaryText} />
        <Text style={[s.newNoteTxt, { color: C.primaryText }]}>New Note</Text>
      </TouchableOpacity>

      {/* ── Notes List ───────────────────────────────────────────────────── */}
      <ScrollView
        style={s.list}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        {notes.length === 0 ? (
          <View style={[s.emptyCard, { backgroundColor: C.card }]}>
            <MaterialIcons name="note-alt" size={44} color={C.muted} />
            <Text style={[s.emptyTitle, { color: C.text }]}>No notes yet</Text>
            <Text style={[s.emptySubtitle, { color: C.muted }]}>
              Tap "New Note" or import from a transcription
            </Text>
          </View>
        ) : (
          notes.map((note) => (
            <TouchableOpacity
              key={note.id}
              style={[s.noteCard, { backgroundColor: C.card }]}
              onPress={() => handleOpenNote(note)}
              activeOpacity={0.8}
            >
              <View style={s.noteCardLeft}>
                <View style={[s.noteDot, { backgroundColor: C.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.noteTitle, { color: C.text }]} numberOfLines={1}>
                    {note.title || "Untitled"}
                  </Text>
                  <Text style={[s.notePreview, { color: C.muted }]} numberOfLines={2}>
                    {note.content || "No content"}
                  </Text>
                  <Text style={[s.noteDate, { color: C.muted }]}>
                    {formatDate(note.updatedAt)}
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                onPress={() => handleDelete(note.id, note.title)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <MaterialIcons name="delete-outline" size={20} color={C.danger} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },

  topBar: {
    width: "90%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: "15%",
    marginBottom: 20,
    alignSelf: "center",
  },
  topBarTitle: { fontWeight: "bold", fontSize: 18 },

  newNoteBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    marginBottom: 20,
  },
  newNoteTxt: { fontSize: 16, fontWeight: "700" },

  list: { flex: 1, paddingHorizontal: 16 },

  emptyCard: {
    borderRadius: 20,
    paddingVertical: 60,
    alignItems: "center",
    gap: 10,
  },
  emptyTitle:    { fontSize: 17, fontWeight: "700" },
  emptySubtitle: { fontSize: 13, textAlign: "center", paddingHorizontal: 30 },

  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    padding: 16,
    marginBottom: 10,
  },
  noteCardLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
  },
  noteDot:    { width: 8, height: 8, borderRadius: 4, marginTop: 6 },
  noteTitle:  { fontSize: 15, fontWeight: "700", marginBottom: 4 },
  notePreview:{ fontSize: 13, lineHeight: 18, marginBottom: 4 },
  noteDate:   { fontSize: 11 },
});