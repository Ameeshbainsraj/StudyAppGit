// theme.js

const FONTS = {
  icy: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    bold: "Inter_700Bold",
  },
  peach: {
    regular: "PlayfairDisplay_400Regular",
    medium: "PlayfairDisplay_500Medium",
    bold: "PlayfairDisplay_700Bold",
  },
  lavender: {
    regular: "Poppins_400Regular",
    medium: "Poppins_500Medium",
    bold: "Poppins_700Bold",
  },
  pastelGreen: {
    regular: "Nunito_400Regular",
    medium: "Nunito_600SemiBold",
    bold: "Nunito_700Bold",
  },
  paleHoney: {
    regular: "CormorantGaramond_400Regular",
    medium: "CormorantGaramond_500Medium",
    bold: "CormorantGaramond_700Bold",
  },
  deepOcean: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  softSand: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  midnightIndigo: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  minimalMint: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  charcoalGold: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  phantomPurple: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
};

export const THEMES = {
  icy: {
    name: "Icy Blue",
    colors: {
      background: "#BAD9EB",
      card: "#FFFFFF",
      primary: "#00693E",
      primaryText: "#FFFFFF",
      text: "#103040",
      mutedText: "#4F6B7A",
      inputBackground: "#FFFFFF",
      danger: "#E34B4B",
    },
    fontFamily: FONTS.icy,
  },

  peach: {
    name: "Peach Cream",
    colors: {
      background: "#F8E6D2",
      card: "#FFFFFF",
      primary: "#90222B",
      primaryText: "#F8E6D2",
      text: "#4B1416",
      mutedText: "#8C4A40",
      inputBackground: "#FFFFFF",
      danger: "#E34B4B",
    },
    fontFamily: FONTS.peach,
  },

  lavender: {
    name: "Lavender",
    colors: {
      background: "#F7F7FF",
      card: "#FFFFFF",
      primary: "#9967CA",
      primaryText: "#FFFFFF",
      text: "#4A3A70",
      mutedText: "#9076B5",
      inputBackground: "#FFFFFF",
      danger: "#E34B4B",
    },
    fontFamily: FONTS.lavender,
  },

  pastelGreen: {
    name: "Pastel Green",
    colors: {
      background: "#B4D3B3",
      card: "#FFFFFF",
      primary: "#595E35",
      primaryText: "#F5F8F0",
      text: "#283322",
      mutedText: "#6C7B55",
      inputBackground: "#FFFFFF",
      danger: "#E34B4B",
    },
    fontFamily: FONTS.pastelGreen,
  },

  paleHoney: {
    name: "Pale Honey",
    colors: {
      background: "#ECCE90",
      card: "#FFFFFF",
      primary: "#5C2221",
      primaryText: "#FDF4E3",
      text: "#3A1915",
      mutedText: "#8C5B4E",
      inputBackground: "#FFFFFF",
      danger: "#E34B4B",
    },
    fontFamily: FONTS.paleHoney,
  },

  deepOcean: {
    name: "Deep Ocean",
    colors: {
      background: "#0F172A",
      card: "#111827",
      primary: "#22C55E",
      primaryText: "#F9FAFB",
      text: "#E5E7EB",
      mutedText: "#9CA3AF",
      inputBackground: "#111827",
      danger: "#EF4444",
    },
    fontFamily: FONTS.deepOcean,
  },

  softSand: {
    name: "Soft Sand",
    colors: {
      background: "#F5EFE6",
      card: "#FFFFFF",
      primary: "#C07A3F",
      primaryText: "#FDF7F0",
      text: "#3C2F2F",
      mutedText: "#8B6B53",
      inputBackground: "#FFFFFF",
      danger: "#D14343",
    },
    fontFamily: FONTS.softSand,
  },

  midnightIndigo: {
    name: "Midnight Indigo",
    colors: {
      background: "#050816",
      card: "#0F172A",
      primary: "#6366F1",
      primaryText: "#F9FAFB",
      text: "#E5E7EB",
      mutedText: "#9CA3AF",
      inputBackground: "#111827",
      danger: "#F97373",
    },
    fontFamily: FONTS.midnightIndigo,
  },

  minimalMint: {
    name: "Minimal Mint",
    colors: {
      background: "#ECFDF3",
      card: "#FFFFFF",
      primary: "#10B981",
      primaryText: "#ECFDF3",
      text: "#064E3B",
      mutedText: "#6EE7B7",
      inputBackground: "#FFFFFF",
      danger: "#DC2626",
    },
    fontFamily: FONTS.minimalMint,
  },

  charcoalGold: {
    name: "Charcoal & Gold",
    colors: {
      background: "#111827",
      card: "#1F2933",
      primary: "#FACC15",
      primaryText: "#111827",
      text: "#F9FAFB",
      mutedText: "#9CA3AF",
      inputBackground: "#1F2933",
      danger: "#F97316",
    },
    fontFamily: FONTS.charcoalGold,
  },

  // ── NEW: Phantom Purple ─────────────────────────────────────────────────────
  // The dark purple design from the screenshot — deep blacks, vivid purple accent
  phantomPurple: {
    name: "Phantom Purple",
    colors: {
      background:      "#12121A",   // near-black base
      card:            "#1C1C28",   // dark card surface
      primary:         "#7C3AED",   // vivid purple accent
      primaryText:     "#FFFFFF",   // white text on purple
      text:            "#FFFFFF",   // main body text
      mutedText:       "#8888AA",   // subdued labels / placeholders
      inputBackground: "#1C1C28",   // input fields match card
      danger:          "#FF3B3B",   // red for delete / errors
    },
    fontFamily: FONTS.phantomPurple,
  },
};