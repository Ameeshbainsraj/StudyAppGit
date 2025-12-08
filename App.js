import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";

import SplashScreen from "./screens/SplashScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import TranscriptionScreen from "./screens/TranscriptionScreen";
import PomodoroScreen from "./screens/PomodoroScreen";
import SettingsScreen from "./screens/SettingsScreen";

import { ThemeProvider } from "./ThemeContext";   // <-- add this

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    RNStatusBar.setHidden(true, "slide");

    // You can keep this for now; later we can change it when theme changes
    NavigationBar.setVisibilityAsync("hidden");
    //NavigationBar.setBackgroundColorAsync("#000000");

    return () => {
      RNStatusBar.setHidden(false, "slide");
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);

  return (
    <ThemeProvider>
      <>
        <StatusBar hidden />
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
    </ThemeProvider>
  );
}
