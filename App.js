import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar as RNStatusBar } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as NavigationBar from "expo-navigation-bar";

import SplashScreen from "./screens/SplashScreen";
import OnboardingScreen from "./screens/OnboardingScreen";
import LoginScreen from "./screens/LoginScreen";
import SignupScreen from "./screens/SignupScreen";
import HomeScreen from "./screens/HomeScreen";
import TranscriptionScreen from "./screens/TranscriptionScreen";
import PomodoroScreen from "./screens/PomodoroScreen";
import SettingsScreen from "./screens/SettingsScreen";
import AITutorScreen from "./screens/AITutorScreen";
import NotesScreen from "./screens/NotesScreen";
import NoteEditorScreen from "./screens/NoteEditorScreen";
import FlashcardsScreen from "./screens/FlashcardsScreen";
import FlashcardStudyScreen from "./screens/FlashcardStudyScreen";
import QuizScreen from "./screens/QuizScreen";
import StudyPlannerScreen from "./screens/StudyPlannerScreen";
import ProfileScreen from "./screens/ProfileScreen";
import AdminScreen from "./screens/AdminScreen";
import { ThemeProvider } from "./ThemeContext";

const Stack = createNativeStackNavigator();

export default function App() {
  useEffect(() => {
    RNStatusBar.setHidden(true, "slide");
    NavigationBar.setVisibilityAsync("hidden");
    return () => {
      RNStatusBar.setHidden(false, "slide");
      NavigationBar.setVisibilityAsync("visible");
    };
  }, []);

  return (
    <ThemeProvider>
      <NavigationContainer>
        <StatusBar hidden />
        <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Splash">
          <Stack.Screen name="Splash" component={SplashScreen} />
          <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Signup" component={SignupScreen} />
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="Transcription" component={TranscriptionScreen} />
          <Stack.Screen name="Pomodoro" component={PomodoroScreen} />
          <Stack.Screen name="Settings" component={SettingsScreen} />
          <Stack.Screen name="AITutor" component={AITutorScreen} />
          <Stack.Screen name="Notes" component={NotesScreen} />
          <Stack.Screen name="NoteEditor" component={NoteEditorScreen} />
          <Stack.Screen name="Flashcards" component={FlashcardsScreen} />
          <Stack.Screen name="FlashcardStudy" component={FlashcardStudyScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="StudyPlanner" component={StudyPlannerScreen} />
          <Stack.Screen name="Profile" component={ProfileScreen} />
          <Stack.Screen name="Admin" component={AdminScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}