// ThemeContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { THEMES } from "./theme";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [themeKey, setThemeKey] = useState("icy");

  useEffect(() => {
    (async () => {
      const saved = await AsyncStorage.getItem("app-theme");
      if (saved && THEMES[saved]) setThemeKey(saved);
    })();
  }, []);

  const changeTheme = async (key) => {
    if (!THEMES[key]) return;
    setThemeKey(key);
    await AsyncStorage.setItem("app-theme", key);
  };

  const value = { theme: THEMES[themeKey], themeKey, changeTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => useContext(ThemeContext);
