// theme.js

const FONTS = {
  noir: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    bold: "Inter_700Bold",
  },
  shepherdBlue: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    bold: "Inter_700Bold",
  },
  sageFocus: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    bold: "Inter_700Bold",
  },
  wineRed: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    bold: "Inter_700Bold",
  },
  phantomPurple: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    bold: "Inter_700Bold",
  },
};

export const THEMES = {

  // ── Noir (Monochrome, editorial — like Linear/Vercel dark) ──────────────────
  noir: {
    name: "Noir",
    colors: {
      background:      "#0D0D0D",
      card:            "#1A1A1A",
      primary:         "#F5F5F5",
      primaryText:     "#0D0D0D",
      text:            "#EDEDED",
      mutedText:       "#888888",
      inputBackground: "#1A1A1A",
      danger:          "#FF4444",
    },
    fontFamily: FONTS.noir,
  },

  // ── Shepherd Blue (Medium-light, Notion/Duolingo-inspired — calm & academic) ─
  shepherdBlue: {
    name: "Shepherd Blue",
    colors: {
      background:      "#EEF3F9",   // soft blue-grey page
      card:            "#FFFFFF",   // clean white cards
      primary:         "#2563EB",   // bold Notion-style blue
      primaryText:     "#FFFFFF",   // white text on blue
      text:            "#1A2540",   // deep navy body text
      mutedText:       "#5C7099",   // muted slate-blue labels
      inputBackground: "#F4F7FC",   // slightly tinted inputs
      danger:          "#DC2626",   // classic red errors
    },
    fontFamily: FONTS.shepherdBlue,
  },

  // ── Sage Focus (Medium-light, Headspace/Calm-inspired — focused & natural) ───
  sageFocus: {
    name: "Sage Focus",
    colors: {
      background:      "#F0F4F0",   // warm grey-green page
      card:            "#FFFFFF",   // clean white cards
      primary:         "#2D6A4F",   // deep forest sage accent
      primaryText:     "#FFFFFF",   // white text on sage
      text:            "#1C2B22",   // dark forest body text
      mutedText:       "#6B8C75",   // muted sage labels
      inputBackground: "#F5F8F5",   // soft tinted inputs
      danger:          "#C0392B",   // earthy red errors
    },
    fontFamily: FONTS.sageFocus,
  },

  // ── Wine Red (Deep burgundy marble) ─────────────────────────────────────────
  wineRed: {
    name: "Wine Red",
    colors: {
      background:      "#130608",
      card:            "#1F0D10",
      primary:         "#C9A84C",
      primaryText:     "#130608",
      text:            "#F5E0D3",
      mutedText:       "#B08070",
      inputBackground: "#1F0D10",
      danger:          "#FF4545",
    },
    fontFamily: FONTS.wineRed,
  },

  // ── Phantom Purple (Ethereal violet, angel aesthetic) ───────────────────────
  phantomPurple: {
    name: "Phantom Purple",
    colors: {
      background:      "#0D0816",
      card:            "#160D24",
      primary:         "#9B5DE5",
      primaryText:     "#FFFFFF",
      text:            "#EDE0FF",
      mutedText:       "#9880BB",
      inputBackground: "#160D24",
      danger:          "#FF3B6A",
    },
    fontFamily: FONTS.phantomPurple,
  },
};