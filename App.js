import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar as RNStatusBar } from "react-native"; // Use core StatusBar for setHidden
import { StatusBar } from "expo-status-bar"; // Keep for JSX
import * as NavigationBar from "expo-navigation-bar";

import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import TranscriptionScreen from "./screens/TranscriptionScreen";
import PomodoroScreen from "./screens/PomodoroScreen";
import SettingsScreen from "./screens/SettingsScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    // Hide top status bar
    RNStatusBar.setHidden(true, "slide");

    // Hide Android bottom navigation bar
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBackgroundColorAsync("#1c3122");

    return () => {
      // Restore on cleanup
      RNStatusBar.setHidden(false, "slide");
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);

  return (
    <>
      <StatusBar hidden /> {/* Optional JSX status bar */}
      <NavigationContainer>
        <Stack.Navigator
          initialRouteName="Splash"
          screenOptions={{ headerShown: false }}
        >
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Transcription" component={TranscriptionScreen} />
          <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </>
  );
}
