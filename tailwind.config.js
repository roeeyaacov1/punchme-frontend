/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: "#0e1120",
        lavender: "#a7adc9",
        slate: "#5c6478",
        gold: {
          DEFAULT: "#f0b429",
          light: "#ffd875",
          dark: "#c88a11",
        },
        // ── Marketing / onboarding tokens ──────────────────────
        // These resolve through CSS variables so a page can be re-themed by
        // scoping one class, rather than by rewriting every component that
        // spends them. The default values in `:root` are the original oat
        // card stock — a warm ground, white paper objects, navy text plus one
        // dark band, gold as the single accent — so onboarding and every
        // shared primitive render exactly as before.
        //
        // `.theme-purple` (src/index.css) is the redesigned public landing.
        // Both value sets are measured in that file, against both of their
        // own grounds, and both meet AA.
        background: "rgb(var(--c-background) / <alpha-value>)",
        surface: "rgb(var(--c-surface) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--c-ink) / <alpha-value>)",
          muted: "rgb(var(--c-ink-muted) / <alpha-value>)",
          subtle: "rgb(var(--c-ink-subtle) / <alpha-value>)",
        },
        primary: {
          // Fill colour. It never carries white text by assumption — the text
          // colour is its own token, because the two themes disagree: gold
          // takes navy (white on gold is 2.96:1 and fails), violet takes
          // white (6.28:1). Anything sitting on `primary` uses `primary.on`.
          DEFAULT: "rgb(var(--c-primary) / <alpha-value>)",
          hover: "rgb(var(--c-primary-hover) / <alpha-value>)",
          // The accent as *text* on a light ground. Never use `primary`
          // itself for text on light in either theme.
          text: "rgb(var(--c-primary-text) / <alpha-value>)",
          on: "rgb(var(--c-primary-on) / <alpha-value>)",
          // The 2px seated edge under a CTA — a darker cut of the fill.
          shadow: "rgb(var(--c-primary-shadow) / <alpha-value>)",
        },
        // Hairline, and a second heavier rule for totals and section edges.
        border: "rgb(var(--c-border) / <alpha-value>)",
        "border-strong": "rgb(var(--c-border-strong) / <alpha-value>)",
        "navy-deep": "rgb(var(--c-navy-deep) / <alpha-value>)",

        // The three things the dashboard has to say out loud. Each is a
        // text colour and the fill it is measured on, in both themes — see
        // the ratios in src/index.css. Hand-picked Tailwind pairs like
        // `bg-amber-50 text-amber-800` cannot survive a dark ground.
        ok: {
          DEFAULT: "rgb(var(--c-ok) / <alpha-value>)",
          bg: "rgb(var(--c-ok-bg) / <alpha-value>)",
        },
        warn: {
          DEFAULT: "rgb(var(--c-warn) / <alpha-value>)",
          bg: "rgb(var(--c-warn-bg) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--c-danger) / <alpha-value>)",
          bg: "rgb(var(--c-danger-bg) / <alpha-value>)",
        },

        // ── Landing redesign, fixed values ─────────────────────
        // Sampled from the Figma frame, then corrected where the drawing
        // failed AA (noted per token). These only ever appear inside
        // `.theme-purple`, so unlike the tokens above they don't vary.
        brand: {
          // Bands and fills. All four carry white text.
          violet: "#683de8", // white 6.14:1
          indigo: "#5b41e6", // white 6.28:1
          royal: "#404ee6", // white 6.09:1
          blue: "#2562ea", // white 5.23:1
          bright: "#7a3aec", // white 5.76:1 — the violet end of a gradient

          // Light grounds. Both carry ink #111.
          tint: "#f0f1fc", // ink 16.81:1
          wash: "#f5f6fe", // ink 17.53:1
          pill: "#dfd5fa", // ink 13.52:1

          // Body copy on a violet band. Drawn at roughly white/70, which
          // measures 3.53:1 and fails at 15px; lightened to clear AA.
          "on-band": "#e3ddfb", // on violet 4.68:1

          // The dashboard mock's dark surfaces.
          night: "#0f0f23", // white 18.87:1
          slate: "#1d1d35", // white 16.41:1
          bezel: "#1e1e2f", // frame only, carries no text

          // The pricing CTA, drawn #f4415c → #fa903c. White on that run
          // measures 3.65:1 falling to 2.30:1 and fails outright, so both
          // stops are darkened to the nearest AA-clean pair in the same hues.
          warm: "#e11d48", // white 4.70:1
          ember: "#c2410c", // white 5.18:1

          // The dashboard's stat card, drawn #7f3ae9 → #e6479c. The end stop
          // carries a 14px label at 3.65:1, so it too is darkened.
          magenta: "#ce2f82", // white 4.82:1
        },
      },
      // Rubik and Assistant both ship Hebrew and Latin in one family at
      // matching weights, which is the point: the Hebrew site is set rather
      // than falling back to an OS face. Rubik's geometric, round-bowled
      // Latin is also the closest webfont match to the logo wordmark.
      // `mono` is digits and pass field labels only — it has no Hebrew.
      fontFamily: {
        heading: ['"Rubik"', "system-ui", "sans-serif"],
        body: ['"Assistant"', "system-ui", "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.92) rotate(-4deg)" },
          "100%": { opacity: "1", transform: "scale(1) rotate(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        // A stamp landing on the card: overshoot and settle, like ink
        // pressed down and lifted. Fires once, never loops.
        "stamp-in": {
          "0%": { opacity: "0", transform: "scale(1.7)" },
          "60%": { opacity: "1", transform: "scale(0.94)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        // A bottom sheet coming up under the thumb. Its own keyframe rather
        // than `fade-up`, which is a scroll reveal at 0.7s — three times too
        // slow for a control the owner just tapped.
        "sheet-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        // The scanner's one moving part: a line travelling down the
        // reticle. A camera preview of a still counter looks identical to a
        // frozen one, and the owner has no other way to tell that the page
        // is still reading — so this is status, not decoration.
        "scan-sweep": {
          "0%": { transform: "translateY(0)", opacity: "0" },
          "12%, 88%": { opacity: "1" },
          "100%": { transform: "translateY(100%)", opacity: "0" },
        },
        // Popovers: quick enough not to sit between the click and the panel.
        "pop-in": {
          "0%": { opacity: "0", transform: "translateY(-4px) scale(0.96)" },
          "100%": { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.7s ease-out both",
        "scale-in": "scale-in 0.8s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 5s ease-in-out infinite",
        "sheet-up": "sheet-up 0.22s cubic-bezier(0.16,1,0.3,1) both",
        "pop-in": "pop-in 0.16s cubic-bezier(0.16,1,0.3,1) both",
        "stamp-in": "stamp-in 0.34s cubic-bezier(0.34,1.4,0.64,1) both",
        "scan-sweep": "scan-sweep 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
      },
      boxShadow: {
        // Two levels only. Cards pair the resting shadow with a hairline
        // border; `lift` is the hover/elevated state.
        card: "0 1px 2px rgb(14 17 32 / 0.04), 0 1px 3px rgb(14 17 32 / 0.06)",
        lift: "0 8px 24px rgb(14 17 32 / 0.08)",
        // The dashboard's panel, as a variable: a navy-tinted shadow reads
        // as depth on a light page and as nothing at all on a dark one, so
        // the dark theme swaps it for a real black and leans on the border.
        panel: "var(--shadow-panel)",
        "panel-lift": "var(--shadow-panel-lift)",
      },
    },
  },
  plugins: [],
};
