// screens/SplashScreen.js
import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  StyleSheet,
  Text,
  StatusBar,
  Dimensions,
  Easing,
} from "react-native";
import { useTheme } from "../ThemeContext";

const { width, height } = Dimensions.get("window");

export default function SplashScreen({ navigation }) {
  const { theme } = useTheme();
  const primary = theme.colors.primary;
  const bg = theme.colors.background;
  const textColor = theme.colors.text;

  // Orb anims
  const orb1Scale = useRef(new Animated.Value(0)).current;
  const orb1Opacity = useRef(new Animated.Value(0)).current;
  const orb2Scale = useRef(new Animated.Value(0)).current;
  const orb2Opacity = useRef(new Animated.Value(0)).current;

  // Ring anims
  const ring1Scale = useRef(new Animated.Value(0.4)).current;
  const ring1Opacity = useRef(new Animated.Value(0)).current;
  const ring2Scale = useRef(new Animated.Value(0.4)).current;
  const ring2Opacity = useRef(new Animated.Value(0)).current;
  const ring3Scale = useRef(new Animated.Value(0.4)).current;
  const ring3Opacity = useRef(new Animated.Value(0)).current;

  // Center logo
  const logoScale = useRef(new Animated.Value(0)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoRotate = useRef(new Animated.Value(0)).current;
  const logoPulse = useRef(new Animated.Value(1)).current;

  // Text
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const taglineY = useRef(new Animated.Value(14)).current;

  // Sparkles
  const sparkleAnims = useRef(
    Array.from({ length: 6 }, () => ({
      opacity: new Animated.Value(0),
      scale: new Animated.Value(0),
      y: new Animated.Value(0),
    }))
  ).current;

  useEffect(() => {
    // Phase 1: Orbs bloom in
    Animated.parallel([
      Animated.timing(orb1Scale, { toValue: 1, duration: 900, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(orb1Opacity, { toValue: 1, duration: 900, useNativeDriver: true }),
      Animated.timing(orb2Scale, { toValue: 1, duration: 1100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(orb2Opacity, { toValue: 1, duration: 1100, useNativeDriver: true }),
    ]).start();

    // Phase 2: Rings expand sequentially
    const ringDelay = (anim, scaleAnim, delay) =>
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(anim, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(scaleAnim, { toValue: 1, duration: 600, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
      ]);

    Animated.parallel([
      ringDelay(ring1Opacity, ring1Scale, 200),
      ringDelay(ring2Opacity, ring2Scale, 380),
      ringDelay(ring3Opacity, ring3Scale, 540),
    ]).start();

    // Phase 3: Logo pops in
    Animated.sequence([
      Animated.delay(480),
      Animated.parallel([
        Animated.spring(logoScale, { toValue: 1, tension: 80, friction: 7, useNativeDriver: true }),
        Animated.timing(logoOpacity, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(logoRotate, { toValue: 1, duration: 700, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
    ]).start(() => {
      // Pulse loop after appearing
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoPulse, { toValue: 1.08, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
          Animated.timing(logoPulse, { toValue: 1, duration: 1000, easing: Easing.inOut(Easing.sin), useNativeDriver: true }),
        ])
      ).start();
    });

    // Phase 4: Text fades in
    Animated.sequence([
      Animated.delay(700),
      Animated.parallel([
        Animated.timing(titleOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(titleY, { toValue: 0, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();

    Animated.sequence([
      Animated.delay(900),
      Animated.parallel([
        Animated.timing(taglineOpacity, { toValue: 1, duration: 450, useNativeDriver: true }),
        Animated.timing(taglineY, { toValue: 0, duration: 450, easing: Easing.out(Easing.quad), useNativeDriver: true }),
      ]),
    ]).start();

    // Phase 5: Sparkles shoot out
    sparkleAnims.forEach((s, i) => {
      Animated.sequence([
        Animated.delay(600 + i * 80),
        Animated.parallel([
          Animated.timing(s.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(s.scale, { toValue: 1, duration: 200, useNativeDriver: true }),
          Animated.timing(s.y, { toValue: -1, duration: 700, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.timing(s.opacity, { toValue: 0, duration: 300, useNativeDriver: true }),
      ]).start();
    });

    const timer = setTimeout(() => navigation.replace("Onboarding"), 2600);
    return () => clearTimeout(timer);
  }, []);

  const logoSpin = logoRotate.interpolate({ inputRange: [0, 1], outputRange: ["-25deg", "0deg"] });

  // Sparkle positions around center
  const sparklePositions = [
    { x: -55, baseY: -55 },
    { x: 55, baseY: -55 },
    { x: -70, baseY: 0 },
    { x: 70, baseY: 0 },
    { x: -45, baseY: 55 },
    { x: 45, baseY: 55 },
  ];

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle="light-content" backgroundColor={bg} />

      {/* Background orbs */}
      <Animated.View
        style={[
          styles.orb1,
          {
            backgroundColor: primary + "30",
            opacity: orb1Opacity,
            transform: [{ scale: orb1Scale }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.orb2,
          {
            backgroundColor: primary + "1A",
            opacity: orb2Opacity,
            transform: [{ scale: orb2Scale }],
          },
        ]}
      />

      {/* Center everything */}
      <View style={styles.center}>

        {/* Expanding rings */}
        {[
          { opacity: ring1Opacity, scale: ring1Scale, size: 180 },
          { opacity: ring2Opacity, scale: ring2Scale, size: 130 },
          { opacity: ring3Opacity, scale: ring3Scale, size: 90 },
        ].map((r, i) => (
          <Animated.View
            key={i}
            style={[
              styles.ring,
              {
                width: r.size,
                height: r.size,
                borderRadius: r.size / 2,
                borderColor: primary + (i === 0 ? "20" : i === 1 ? "35" : "50"),
                opacity: r.opacity,
                transform: [{ scale: r.scale }],
              },
            ]}
          />
        ))}

        {/* Sparkles */}
        {sparkleAnims.map((s, i) => {
          const pos = sparklePositions[i];
          const translateY = s.y.interpolate({
            inputRange: [-1, 0],
            outputRange: [pos.baseY - 30, pos.baseY],
          });
          return (
            <Animated.Text
              key={i}
              style={[
                styles.sparkle,
                {
                  color: primary,
                  opacity: s.opacity,
                  transform: [
                    { translateX: pos.x },
                    { translateY },
                    { scale: s.scale },
                  ],
                },
              ]}
            >
              {i % 2 === 0 ? "✦" : "·"}
            </Animated.Text>
          );
        })}

        {/* Main logo */}
        <Animated.View
          style={[
            styles.logoWrap,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }, { scale: logoPulse }, { rotate: logoSpin }],
            },
          ]}
        >
          <View style={[styles.logoOuter, { borderColor: primary + "60" }]}>
            <View style={[styles.logoMid, { borderColor: primary + "99", backgroundColor: primary + "15" }]}>
              <View style={[styles.logoInner, { backgroundColor: primary }]}>
                <Text style={styles.logoEmoji}>✦</Text>
              </View>
            </View>
          </View>
        </Animated.View>

      </View>

      {/* Text block below */}
      <View style={styles.textBlock}>
        <Animated.Text
          style={[
            styles.appName,
            { color: textColor, opacity: titleOpacity, transform: [{ translateY: titleY }] },
          ]}
        >
          Shepard{" "}
          <Text style={[styles.appNameAccent, { color: primary }]}>Learn</Text>
        </Animated.Text>

        <Animated.Text
          style={[
            styles.tagline,
            { color: theme.colors.mutedText, opacity: taglineOpacity, transform: [{ translateY: taglineY }] },
          ]}
        >
          studying made simple
        </Animated.Text>
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
  orb1: {
    position: "absolute",
    width: width * 1.1,
    height: width * 1.1,
    borderRadius: width * 0.55,
    top: -width * 0.35,
    right: -width * 0.3,
  },
  orb2: {
    position: "absolute",
    width: width * 0.9,
    height: width * 0.9,
    borderRadius: width * 0.45,
    bottom: -width * 0.3,
    left: -width * 0.25,
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
    width: 200,
    height: 200,
  },
  ring: {
    position: "absolute",
    borderWidth: 1,
  },
  sparkle: {
    position: "absolute",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  logoOuter: {
    width: 82,
    height: 82,
    borderRadius: 41,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoMid: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  logoInner: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
  },
  logoEmoji: {
    fontSize: 20,
    color: "#fff",
    fontWeight: "bold",
  },
  textBlock: {
    position: "absolute",
    bottom: height * 0.18,
    alignItems: "center",
  },
  appName: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  appNameAccent: {
    fontWeight: "800",
  },
  tagline: {
    fontSize: 17,
    letterSpacing: 1.5,
    fontWeight: "500",
  },
});