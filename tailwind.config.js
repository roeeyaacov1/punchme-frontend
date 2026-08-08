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
        // ── Marketing landing-page tokens ──────────────────────────────
        // The public page is light: navy is text plus two deliberate dark
        // moments, gold is the single accent. Added rather than replacing
        // the names above so the dashboard and card designer are untouched.
        background: "#f1f5f9",
        surface: "#ffffff",
        ink: {
          DEFAULT: "#0e1120",
          muted: "#5c6478",
          // #a7adc9 (the `lavender` above) is only 2.2:1 on white — fine on
          // navy, unreadable on a light band. This is the light-band tone,
          // measured at 4.98:1 on white and 4.55:1 on the slate background.
          subtle: "#6b6f81",
        },
        primary: {
          // Fill colour only, and it always carries navy text: white on this
          // gold is 2.96:1 and fails AA, navy on it is 6.34:1.
          DEFAULT: "#c88a11",
          hover: "#b87f10",
          // Gold as *text* on a light band. 4.95:1 on white, 4.52:1 on the
          // slate background. Never use `primary` itself for text on light.
          text: "#96670d",
        },
        border: "#e2e8f0",
        "navy-deep": "#0e1120",
      },
      fontFamily: {
        heading: ['"Plus Jakarta Sans"', "sans-serif"],
        body: ['"Inter"', "sans-serif"],
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
        "float-slow": {
          "0%, 100%": { transform: "translateY(-8px)" },
          "50%": { transform: "translateY(8px)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.7s ease-out both",
        "scale-in": "scale-in 0.8s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 5s ease-in-out infinite",
        "float-slow": "float-slow 6s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
      },
      boxShadow: {
        // Two levels only. Cards pair the resting shadow with a hairline
        // border; `lift` is the hover/elevated state.
        card: "0 1px 2px rgb(14 17 32 / 0.04), 0 1px 3px rgb(14 17 32 / 0.06)",
        lift: "0 8px 24px rgb(14 17 32 / 0.08)",
      },
    },
  },
  plugins: [],
};
