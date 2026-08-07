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
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.16,1,0.3,1) both",
        "fade-in": "fade-in 0.7s ease-out both",
        "scale-in": "scale-in 0.8s cubic-bezier(0.16,1,0.3,1) both",
        float: "float 5s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
