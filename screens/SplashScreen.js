// screens/SplashScreen.js
import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Text,
  StatusBar,
  Dimensions,
} from "react-native";
import { useTheme } from "../ThemeContext";

const { width, height } = Dimensions.get("window");
const SMALL_STARS = 8;
const STAR_SIZE = 40;
const SMALL_STAR_SIZE = 10;

export default function SplashScreen({ navigation }) {
  const smallProgress = useRef(new Animated.Value(0)).current;
  const mainStarOpacity = useRef(new Animated.Value(0)).current;
  const mainStarScale = useRef(new Animated.Value(0.7)).current;

  const textOpacity = useRef(new Animated.Value(0)).current;
  const textTranslateY = useRef(new Animated.Value(16)).current;
  const underlineWidth = useRef(new Animated.Value(0)).current;

  const { theme } = useTheme();

  useEffect(() => {
    Animated.timing(smallProgress, {
      toValue: 1,
      duration: 550,
      useNativeDriver: true,
    }).start(() => {
      Animated.sequence([
        Animated.parallel([
          Animated.timing(mainStarOpacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(mainStarScale, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(mainStarScale, {
            toValue: 1.12,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(mainStarScale, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]),
      ]).start();

      Animated.parallel([
        Animated.timing(textOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(textTranslateY, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(underlineWidth, {
          toValue: 1,
          duration: 550,
          useNativeDriver: false,
        }),
      ]).start();
    });

    const timer = setTimeout(() => {
      navigation.replace("Login");
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    navigation,
    smallProgress,
    mainStarOpacity,
    mainStarScale,
    textOpacity,
    textTranslateY,
    underlineWidth,
  ]);

  const animatedUnderlineWidth = underlineWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "60%"],
  });

  const smallStars = Array.from({ length: SMALL_STARS }, (_, i) => {
    const angle = (2 * Math.PI * i) / SMALL_STARS;
    const radius = Math.max(width, height) * 0.7;

    const startX = Math.cos(angle) * radius;
    const startY = Math.sin(angle) * radius;

    const translateX = smallProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [startX, 0],
    });

    const translateY = smallProgress.interpolate({
      inputRange: [0, 1],
      outputRange: [startY, 0],
    });

    return { key: i, translateX, translateY };
  });

  // derive subtle darker tints from theme colors
  const bg = theme.colors.background;
  const primary = theme.colors.primary;

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={bg} />

      {/* subtle vignette */}
      <View style={[styles.vignette, { backgroundColor: "#000000" }]} />

      {/* soft shapes using darker variants of background */}
      <View
        style={[
          styles.bgShapeTop,
          { backgroundColor: primary, opacity: 0.25 },
        ]}
      />
      <View
        style={[
          styles.bgShapeBottom,
          { backgroundColor: primary, opacity: 0.35 },
        ]}
      />

      {/* small stars */}
      {smallStars.map(({ key, translateX, translateY }) => (
        <Animated.View
          key={key}
          style={[
            styles.smallStar,
            {
              backgroundColor: primary,
              transform: [{ translateX }, { translateY }],
            },
          ]}
        />
      ))}

      <View style={styles.centerBlock}>
        {/* main logo star */}
        <Animated.View
          style={[
            styles.starWrapper,
            {
              opacity: mainStarOpacity,
              transform: [{ scale: mainStarScale }],
            },
          ]}
        >
          <View
            style={[
              styles.starOuter,
              {
                backgroundColor: "#00000033",
                borderColor: theme.colors.primaryText,
              },
            ]}
          >
            <View
              style={[
                styles.starInner,
                { backgroundColor: primary },
              ]}
            />
          </View>
        </Animated.View>

        {/* text */}
        <Animated.View
          style={[
            styles.textBlock,
            {
              opacity: textOpacity,
              transform: [{ translateY: textTranslateY }],
            },
          ]}
        >
          <Text
            style={[
              styles.appName,
              { color: theme.colors.primaryText },
            ]}
          >
            Shepard{" "}
            <Text
              style={[
                styles.appNameAccent,
                { color: primary },
              ]}
            >
              Learn
            </Text>
          </Text>

          <Animated.View
            style={[
              styles.underlineContainer,
              { width: animatedUnderlineWidth },
            ]}
          >
            <View
              style={[
                styles.underline,
                { backgroundColor: primary },
              ]}
            />
          </Animated.View>

          <Text
            style={[
              styles.tagline,
              { color: theme.colors.primaryText },
            ]}
          >
            Studying made simple
          </Text>
        </Animated.View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  vignette: {
    position: "absolute",
    width: "150%",
    height: "150%",
    opacity: 0.18,
  },
  bgShapeTop: {
    position: "absolute",
    top: -140,
    right: -60,
    width: 360,
    height: 320,
    borderRadius: 200,
  },
  bgShapeBottom: {
    position: "absolute",
    bottom: -160,
    left: -80,
    width: 380,
    height: 340,
    borderRadius: 210,
  },

  centerBlock: { alignItems: "center" },
  starWrapper: { marginBottom: 18 },
  starOuter: {
    width: STAR_SIZE,
    height: STAR_SIZE,
    borderRadius: STAR_SIZE / 2,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  starInner: {
    width: STAR_SIZE * 0.6,
    height: STAR_SIZE * 0.6,
    transform: [{ rotate: "45deg" }],
  },
  textBlock: { alignItems: "center" },
  appName: { fontSize: 26, fontWeight: "700", letterSpacing: 0.8 },
  appNameAccent: {},
  underlineContainer: {
    marginTop: 6,
    height: 3,
    borderRadius: 999,
    overflow: "hidden",
    backgroundColor: "transparent",
    alignItems: "flex-start",
  },
  underline: { height: "100%", borderRadius: 999 },
  tagline: { marginTop: 8, fontSize: 13 },
});
