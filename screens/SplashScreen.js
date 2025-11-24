import React, { useEffect, useRef } from "react";
import { View, Animated, StyleSheet, Text } from "react-native";

export default function SplashScreen({ navigation }) {
  // Animations
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.6)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const textFadeAnim = useRef(new Animated.Value(0)).current;
  const textSlideAnim = useRef(new Animated.Value(40)).current;

  useEffect(() => {
    // Animate logo: fade + scale + rotate
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 3, useNativeDriver: true }),
      Animated.timing(rotateAnim, { toValue: 1, duration: 1200, useNativeDriver: true })
    ]).start();

    // Animate text after logo
    setTimeout(() => {
      Animated.parallel([
        Animated.timing(textFadeAnim, { toValue: 1, duration: 800, useNativeDriver: true }),
        Animated.timing(textSlideAnim, { toValue: 0, duration: 800, useNativeDriver: true })
      ]).start();
    }, 950);

    // Move to next screen after delay
    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 2400);

    return () => clearTimeout(timer);
  }, [fadeAnim, scaleAnim, rotateAnim, textFadeAnim, textSlideAnim, navigation]);

  // Rotation interpolation
  const rotate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"]
  });

  return (
    <View style={styles.container}>
      <Animated.View
        style={[
          styles.logoCircle,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { rotate }
            ]
          }
        ]}
      >
        {/* Swap 🧙‍♂️ for your logo if needed */}
        <Text style={styles.logo}>🧙‍♂️</Text>
      </Animated.View>
      <Animated.Text
        style={[
          styles.title,
          {
            opacity: textFadeAnim,
            transform: [{ translateY: textSlideAnim }]
          }
        ]}
      >
        STUDY APP
      </Animated.Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1c3122",
    justifyContent: "center",
    alignItems: "center",
  },
  logoCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#B1B95C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 4 },
    elevation: 7
  },
  logo: {
    fontSize: 82,
    color: "#203728",
    textAlign: "center"
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    letterSpacing: 2,
    marginTop: 4
  }
});
