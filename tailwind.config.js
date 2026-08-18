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
        // ── Marketing landing-page tokens ──────────────────────
        // The public page is card stock: a warm oat ground with white paper
        // objects on it, navy for text plus one dark band, gold as the single
        // accent. Added rather than replacing the names above so the dashboard
        // and card designer are untouched.
        //
        // Every ratio below is measured against BOTH grounds — white
        // (`surface`) and oat (`background`) — because the same token is used
        // on both. The oat figure is always the tighter of the two.
        background: "#efe9dc",
        surface: "#ffffff",
        ink: {
          // 15.5:1 on oat, 17.6:1 on white.
          DEFAULT: "#0e1120",
          // Warm mid-grey. The old cool #5c6478 read broken against oat.
          // 5.89:1 on oat, 7.12:1 on white.
          muted: "#5e5750",
          // Captions, eyebrows, citations. The old #6b6f81 measures only
          // 4.11:1 on oat and fails AA outright — this is its warm
          // replacement at 4.83:1 on oat, 5.85:1 on white.
          subtle: "#6b6459",
        },
        primary: {
          // Fill colour only, and it always carries navy text: white on this
          // gold is 2.96:1 and fails AA, navy on it is 6.30:1.
          DEFAULT: "#c88a11",
          hover: "#b87f10",
          // Gold as *text* on a light band. The old #96670d is 4.09:1 on oat
          // and fails; this is 4.80:1 on oat, 5.80:1 on white. Never use
          // `primary` itself for text on light.
          text: "#8a5d0b",
        },
        // Hairline. Warm, so it belongs to the oat ground rather than
        // sitting on it — the old slate #e2e8f0 read as a seam.
        border: "#ded5c2",
        // A second, heavier rule for receipt totals and section edges.
        "border-strong": "#c8bca3",
        "navy-deep": "#0e1120",
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
        "pop-in": "pop-in 0.16s cubic-bezier(0.16,1,0.3,1) both",
        "stamp-in": "stamp-in 0.34s cubic-bezier(0.34,1.4,0.64,1) both",
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
