// screens/HomeScreen.js
import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Image,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { FIREBASE_AUTH, FIREBASE_DB } from "../FirebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import { useTheme } from "../ThemeContext";

export default function HomeScreen({ navigation, route }) {
  const [profileImageUrl, setProfileImageUrl] = useState(null);
  const [name, setName] = useState("USERNAME");
  const { theme } = useTheme();

  useFocusEffect(
    useCallback(() => {
      if (route?.params?.fromAuth) {
        Alert.alert("Success", "You’re logged in.");
      }
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
    }, [])
  );

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <Text style={[styles.homeText, { color: theme.colors.text }]}>HOME</Text>

      <View
        style={[
          styles.profileCircle,
          {
            backgroundColor: theme.colors.card,
            borderColor: theme.colors.primary,
          },
        ]}
      >
        {profileImageUrl ? (
          <Image
            key={profileImageUrl}
            source={{ uri: profileImageUrl }}
            style={styles.profileImage}
          />
        ) : (
          <MaterialIcons
            name="person-outline"
            size={80}
            color={theme.colors.primary}
          />
        )}
      </View>

      <Text style={[styles.username, { color: theme.colors.text }]}>
        {name}
      </Text>

      <View style={styles.featuresGrid}>
        <TouchableOpacity
          style={[
            styles.featureBox,
            { backgroundColor: theme.colors.card },
          ]}
          onPress={() => navigation.navigate("Transcription")}
        >
          <FontAwesome5
            name="microphone"
            size={32}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.featureText,
              { color: theme.colors.primary },
            ]}
          >
            TRANSCRIPTIONS
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.featureBox,
            { backgroundColor: theme.colors.card },
          ]}
          onPress={() => navigation.navigate("Pomodoro")}
        >
          <FontAwesome5
            name="stopwatch"
            size={32}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.featureText,
              { color: theme.colors.primary },
            ]}
          >
            POMODORO TIMER
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.featuresGrid}>
        <TouchableOpacity
          style={[
            styles.featureBox,
            { backgroundColor: theme.colors.card },
          ]}
          onPress={() => navigation.navigate("Notes")}
        >
          <FontAwesome5
            name="file-alt"
            size={32}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.featureText,
              { color: theme.colors.primary },
            ]}
          >
            NOTES
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.featureBox,
            { backgroundColor: theme.colors.card },
          ]}
          onPress={() => navigation.navigate("Settings")}
        >
          <FontAwesome5
            name="cog"
            size={32}
            color={theme.colors.primary}
          />
          <Text
            style={[
              styles.featureText,
              { color: theme.colors.primary },
            ]}
          >
            SETTINGS
          </Text>
        </TouchableOpacity>
      </View>

      <View
        style={[
          styles.bottomBar,
          { backgroundColor: theme.colors.primary },
        ]}
      >
        <Text
          style={[
            styles.bottomBarText,
            { color: theme.colors.primaryText },
          ]}
        >
          Today: 3 Sessions | 2 Recordings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 0,
  },
  homeText: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    letterSpacing: 2,
  },
  profileCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 10,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 10,
    overflow: "hidden",
  },
  profileImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  username: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 60,
    marginTop: 10,
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10,
  },
  featureBox: {
    borderRadius: 18,
    width: 125,
    height: 120,
    marginHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowOffset: { width: 2, height: 2 },
  },
  featureText: {
    marginTop: 15,
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 13,
  },
  bottomBar: {
    width: "100%",
    position: "absolute",
    bottom: 0,
    paddingVertical: 14,
    alignItems: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
  },
  bottomBarText: {
    fontWeight: "bold",
    fontSize: 14,
  },
});
