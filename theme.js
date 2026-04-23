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
  // ── New premium themes ──────────────────────────────────────────────────────
  wineRed: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  galaxy: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  roseGold: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  arctic: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  ember: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
  forestNight: {
    regular: "System",
    medium: "System",
    bold: "System",
  },
};

export const THEMES = {
  // ── Existing themes (unchanged) ─────────────────────────────────────────────
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

  phantomPurple: {
    name: "Phantom Purple",
    colors: {
      background:      "#12121A",
      card:            "#1C1C28",
      primary:         "#7C3AED",
      primaryText:     "#FFFFFF",
      text:            "#FFFFFF",
      mutedText:       "#8888AA",
      inputBackground: "#1C1C28",
      danger:          "#FF3B3B",
    },
    fontFamily: FONTS.phantomPurple,
  },

  // ── New premium themes ──────────────────────────────────────────────────────

  wineRed: {
    name: "Wine Red",
    colors: {
      background:      "#1A0A0D",   // deep burgundy base
      card:            "#2A1118",   // slightly lighter burgundy card surface
      primary:         "#C9A84C",   // warm gold accent
      primaryText:     "#1A0A0D",   // dark text on gold buttons
      text:            "#F5E6D3",   // warm off-white body text
      mutedText:       "#9C7A6A",   // muted rose-brown labels
      inputBackground: "#2A1118",   // input fields match card
      danger:          "#FF4545",   // bright red for errors
    },
    fontFamily: FONTS.wineRed,
  },

  galaxy: {
    name: "Galaxy",
    colors: {
      background:      "#07050F",   // near-black deep space base
      card:            "#110D1F",   // dark purple-tinted card
      primary:         "#A855F7",   // electric violet accent
      primaryText:     "#FFFFFF",   // white text on violet
      text:            "#E8E0FF",   // soft lavender-white body text
      mutedText:       "#6B5F8A",   // muted purple-grey labels
      inputBackground: "#110D1F",   // input fields match card
      danger:          "#F43F5E",   // vivid rose-red for errors
    },
    fontFamily: FONTS.galaxy,
  },

  roseGold: {
    name: "Rose Gold",
    colors: {
      background:      "#FDF0F0",   // warm blush base
      card:            "#FFFFFF",   // clean white cards
      primary:         "#B76E79",   // dusty rose accent
      primaryText:     "#FFFFFF",   // white text on rose buttons
      text:            "#4A2530",   // deep wine body text
      mutedText:       "#C4909A",   // soft rose-grey labels
      inputBackground: "#FFFFFF",   // clean white inputs
      danger:          "#D94040",   // classic red for errors
    },
    fontFamily: FONTS.roseGold,
  },

  arctic: {
    name: "Arctic",
    colors: {
      background:      "#EDF6FB",   // crisp ice-blue base
      card:            "#FFFFFF",   // pure white cards
      primary:         "#0EA5C9",   // cold cyan accent
      primaryText:     "#FFFFFF",   // white text on cyan buttons
      text:            "#0C2D3A",   // deep navy body text
      mutedText:       "#6BAEC6",   // muted sky-blue labels
      inputBackground: "#FFFFFF",   // clean white inputs
      danger:          "#E53E3E",   // red for errors
    },
    fontFamily: FONTS.arctic,
  },

  ember: {
    name: "Ember",
    colors: {
      background:      "#111111",   // near-black charcoal base
      card:            "#1C1C1C",   // dark charcoal card surface
      primary:         "#F97316",   // hot amber-orange accent
      primaryText:     "#111111",   // dark text on amber buttons
      text:            "#F5F0E8",   // warm off-white body text
      mutedText:       "#7A6A5A",   // warm brown-grey labels
      inputBackground: "#1C1C1C",   // input fields match card
      danger:          "#FF3030",   // vivid red for errors
    },
    fontFamily: FONTS.ember,
  },

  forestNight: {
    name: "Forest Night",
    colors: {
      background:      "#0A1A0F",   // deep forest green base
      card:            "#122018",   // dark green card surface
      primary:         "#4ADE80",   // bright mint accent
      primaryText:     "#0A1A0F",   // dark text on mint buttons
      text:            "#D4F0DC",   // pale green-white body text
      mutedText:       "#4A7A5A",   // muted forest-green labels
      inputBackground: "#122018",   // input fields match card
      danger:          "#FF4545",   // red for errors
    },
    fontFamily: FONTS.forestNight,
  },
};