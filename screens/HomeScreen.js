// screens/HomeScreen.js
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialIcons, FontAwesome5 } from "@expo/vector-icons"; // For icons

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      
      {/* HOME title */}
      <Text style={styles.homeText}>HOME</Text>

      {/* Profile circle */}
      <View style={styles.profileCircle}>
        <MaterialIcons name="person-outline" size={80} color="#2B5733" />
      </View>
      <Text style={styles.username}>USERNAME</Text>

      {/* Four function buttons arranged 2x2 */}
      <View style={styles.featuresGrid}>
        <TouchableOpacity style={styles.featureBox} onPress={() => navigation.navigate("Transcription")}>
          <FontAwesome5 name="microphone" size={32} color="#2B5733" />
          <Text style={styles.featureText}>TRANSCRIPTIONS</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureBox} onPress={() => navigation.navigate("Pomodoro")}>
          <FontAwesome5 name="stopwatch" size={32} color="#2B5733" />
          <Text style={styles.featureText}>POMODORO TIMER</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.featuresGrid}>
        <TouchableOpacity style={styles.featureBox} onPress={() => navigation.navigate("Notes")}>
          <FontAwesome5 name="file-alt" size={32} color="#2B5733" />
          <Text style={styles.featureText}>NOTES</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.featureBox} onPress={() => navigation.navigate("Settings")}>
          <FontAwesome5 name="cog" size={32} color="#2B5733" />
          <Text style={styles.featureText}>SETTINGS</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom summary bar */}
      <View style={styles.bottomBar}>
        <Text style={styles.bottomBarText}>
          Today: 3 Sessions | 2 Recordings
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#203728",
    alignItems: "center",
    paddingTop: 40,
    paddingBottom: 0
  },
  homeText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    letterSpacing: 2
  },
  profileCircle: {
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "#B1B95C",
    borderWidth: 10,
    borderColor: "#6D7A37",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
    marginTop: 10
  },
  username: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 30,
    marginTop: 4
  },
  featuresGrid: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 10
  },
  featureBox: {
    backgroundColor: "#B1B95C",
    borderRadius: 18,
    width: 125,
    height: 120,
    marginHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.09,
    shadowOffset: { width: 2, height: 2 }
  },
  featureText: {
    marginTop: 15,
    fontWeight: "bold",
    color: "#2B5733",
    textAlign: "center",
    fontSize: 13
  },
  bottomBar: {
    backgroundColor: "#B1B95C",
    width: "100%",
    position: "absolute",
    bottom: 0,
    paddingVertical: 14,
    alignItems: "center",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25
  },
  bottomBarText: {
    color: "#203728",
    fontWeight: "bold",
    fontSize: 15
  }
});
