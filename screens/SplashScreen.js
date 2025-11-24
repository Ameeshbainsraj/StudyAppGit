import React, { useEffect } from "react";
import { View, StyleSheet } from "react-native";
import { Video } from "expo-av";
import { useNavigation } from "@react-navigation/native";

export default function SplashScreen() {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 3000); // match your video length

    return () => clearTimeout(timer);
  }, [navigation]);
  
  return (
    <View style={styles.container}>
      <Video
        source={require("../assets/SPLASH.mp4")}
        style={styles.video}
        resizeMode="cover"
        shouldPlay
      />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  video: { width: "100%", height: "100%" }
});
