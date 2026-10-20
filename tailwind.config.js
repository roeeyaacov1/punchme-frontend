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

        // The edge on an object whose own colours are not ours to touch — a
        // pass, a printed sheet. Black on a light ground, white on a dark
        // one, so the same hairline reads whatever the owner painted the
        // thing: white paper used to vanish into the light panel and a
        // night-blue poster vanishes into the dark one. Always spent at /10,
        // which is a real step on Tailwind's opacity scale (/12 compiles to
        // nothing and leaves the default blue ring showing).
        rim: "rgb(var(--c-rim) / <alpha-value>)",

        // The three things the dashboard has to say out loud. Each is a
        // text colour and the fill it is measured on, in both themes — see
        // the ratios in src/index.css. Hand-picked Tailwind pairs like
        // `bg-amber-50 text-amber-800` cannot survive a dark ground.
        ok: {
          DEFAULT: "rgb(var(--c-ok) / <alpha-value>)",
          bg: "rgb(var(--c-ok-bg) / <alpha-value>)",
          // The ok tag's text on its own 15% wash. Only the Lightbox scope
          // defines it: #065f46 by day (6.11:1), the ok value at night.
          tag: "rgb(var(--c-ok-tag) / <alpha-value>)",
        },
        warn: {
          DEFAULT: "rgb(var(--c-warn) / <alpha-value>)",
          bg: "rgb(var(--c-warn-bg) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "rgb(var(--c-danger) / <alpha-value>)",
          bg: "rgb(var(--c-danger-bg) / <alpha-value>)",
        },
        // Not a state of the software — the thing being collected towards.
        // Gold, because that is what a reward is on the landing page and on
        // the card, and because the dashboard was saying it in the same
        // violet it uses for the plan badge. Ratios in src/index.css.
        reward: {
          DEFAULT: "rgb(var(--c-reward) / <alpha-value>)",
          bg: "rgb(var(--c-reward-bg) / <alpha-value>)",
        },

        // ── Lightbox ──────────────────────────────────────────
        // The redesign's scope, `.theme-lightbox` in src/index.css, where
        // every value is measured. These two are themed:
        //
        // The edge that identifies a field, a checkbox, a switch's track and
        // a slider's rail — 3.35:1 on the wall by day, 3.87:1 at night.
        // border-strong never reached the 3:1 WCAG 1.4.11 asks.
        field: "rgb(var(--c-field) / <alpha-value>)",
        // Behind a dialog or a sheet: ink at 0.4 by day, black at 0.6 at
        // night. The strength is part of the token, so no opacity modifier.
        scrim: "rgb(var(--c-scrim) / var(--scrim-alpha))",
        //
        // And these are fixed, because lit things keep their light at
        // night. Their text is ink, so they are only ever painted inside a
        // `.theme-lit` subtree, where ink is the day ink.
        //
        // The panels' warm light: the scan's flash, a lit panel at night,
        // the brief band (DEFAULT → deep) and the Persuade field (bright →
        // deep → edge). Ink 13.91 / 12.85 / 14.22 / 11.69:1.
        light: {
          DEFAULT: "#fff4e6",
          deep: "#ffe9d4",
          bright: "#fff7ec",
          edge: "#fddcc8",
        },
        // The light a scan answer switches on in. Ink 12.19 / 10.63 /
        // 10.35:1; ink-muted 5.56:1 or more. A refusal answers on the plain
        // light above, its amber kept to its word and icon.
        answer: {
          punched: "#c9f0d9",
          full: "#ffd36b",
          failed: "#ffc9c2",
        },
        // The camera's dark glass, a hole in the wall that is never lit.
        // What sits on it is `light` (17.97:1); ink would be 1.29:1.
        glass: "#0e0c0a",

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
        // The wizard's pill, mid-journey. Squash-and-stretch: a thing that
        // sets off leans into the direction it is going and settles when it
        // arrives. Scale only — the *travel* is a transform transition on the
        // element above it, so the two compose and neither fights the other.
        "pill-travel": {
          "0%, 100%": { transform: "scaleX(1)" },
          "45%": { transform: "scaleX(1.3)" },
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
        // The accent bar under a section heading, drawing itself in. The
        // origin is set at the call site (`origin-left rtl:origin-right`) —
        // there is no logical `transform-origin` utility, and the rule has
        // to grow away from the first word in both directions.
        "draw-rule": {
          "0%": { transform: "scaleX(0)" },
          "100%": { transform: "scaleX(1)" },
        },
        // The hero's light, breathing. Slow enough to read as atmosphere
        // rather than as a pulse — anything under about ten seconds starts
        // competing with the pass for attention.
        "bloom-drift": {
          "0%, 100%": { transform: "scale(1)", opacity: "0.8" },
          "50%": { transform: "scale(1.09)", opacity: "1" },
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
        // Matches the travel transition in `StepProgress` exactly — the
        // stretch has to be over by the time the pill stops moving.
        "pill-travel": "pill-travel 0.34s cubic-bezier(0.34,1.4,0.64,1)",
        "scan-sweep": "scan-sweep 2.4s cubic-bezier(0.4,0,0.6,1) infinite",
        // Two curves carry the whole landing page, and which one an element
        // gets is a statement about what it is. Words *rise*:
        // (0.16,1,0.3,1), a long decelerating settle with no overshoot —
        // that is `fade-up` and `draw-rule`. Objects *land*:
        // (0.34,1.4,0.64,1), which overshoots and comes back, the way a
        // rubber stamp presses down and lifts — that is `stamp-in`, and it
        // is the product's one gesture. Nothing on the page uses a third.
        "draw-rule": "draw-rule 0.55s cubic-bezier(0.16,1,0.3,1) both",
        "bloom-drift": "bloom-drift 14s ease-in-out infinite",

        // ── Lightbox ──────────────────────────────────────────
        // The keyframes are plain CSS in src/index.css, so they exist whether
        // or not a class names them, and the timings are the :root motion
        // tokens there. The name comes first in each: Tailwind takes the
        // first word it can't read as a time or a curve to be the name.
        "lights-on": "lights-on var(--duration-lights) var(--ease-out-strong) both",
        "gentle-in": "gentle-in var(--duration-gentle) ease-out both",
        "gentle-out": "gentle-out var(--duration-gentle) ease-out both",
        "exit-fade": "gentle-out var(--duration-exit) ease-out both",
        "snap-flash": "snap-flash var(--duration-flash) var(--ease-out-strong) both",
        "snap-glow": "snap-glow var(--duration-gentle) ease-out both",
        "snap-settle": "snap-settle var(--duration-settle) var(--ease-out-strong) both",
        "stamp-snap":
          "stamp-land var(--duration-stamp-snap) var(--ease-overshoot) var(--delay-stamp-snap) both",
        "stamp-land": "stamp-land var(--duration-stamp) var(--ease-overshoot) both",
        "sheet-rise": "sheet-rise var(--duration-sheet) var(--ease-drawer) both",
        "sheet-fall": "sheet-fall var(--duration-exit) var(--ease-drawer) both",
        "drawer-in": "drawer-in var(--duration-sheet) var(--ease-drawer) both",
        "drawer-out": "drawer-out var(--duration-exit) var(--ease-drawer) both",
        "dialog-in": "dialog-in var(--duration-lights) var(--ease-out-strong) both",
        "dialog-out": "dialog-out var(--duration-exit) var(--ease-out-strong) both",
        // The shop's sign, the day it switches on: unlit for a beat, then a
        // tube catching over the ceremony's 600ms, or the gentle fade.
        "sign-catch": "sign-catch var(--duration-ceremony) linear var(--delay-switch-on) both",
        "sign-on": "sign-on var(--duration-gentle) ease-out var(--delay-switch-on) both",
        skeleton: "skeleton 1.6s ease-in-out infinite",
      },
      // Lightbox's curves and durations, as the :root tokens in
      // src/index.css. Tailwind's own `ease-out` is left as it is: the pages
      // still waiting for their phase use it.
      transitionTimingFunction: {
        "out-strong": "var(--ease-out-strong)",
        overshoot: "var(--ease-overshoot)",
        drawer: "var(--ease-drawer)",
        "in-out-strong": "var(--ease-in-out-strong)",
      },
      transitionDuration: {
        press: "var(--duration-press)",
        move: "var(--duration-move)",
        lights: "var(--duration-lights)",
        stamp: "var(--duration-stamp)",
        sheet: "var(--duration-sheet)",
        exit: "var(--duration-exit)",
        crossfade: "var(--duration-crossfade)",
        ceremony: "var(--duration-ceremony)",
        gentle: "var(--duration-gentle)",
      },
      // Lightbox's shapes: generous and soft. Fields 16px, Operate panels and
      // a scan's answer 24px, the viewfinder 28px, Persuade's tall cards
      // 32px and the lit hero panel 40px. Buttons, chips and stamps are
      // `rounded-full`.
      borderRadius: {
        field: "1rem",
        panel: "1.5rem",
        glass: "1.75rem",
        card: "2rem",
        hero: "2.5rem",
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
  plugins: [
    // Hover only where a pointer can hover. Tailwind's own `hover:` also
    // fires on a tap and sticks on touch screens, and switching it over
    // globally would change the pages still waiting for their phase. This
    // variant sorts after `active:`, `disabled:` and `aria-*:`, so the kit
    // never lets it set a property a state also sets.
    function ({ addVariant }) {
      addVariant("hover-fine", "@media (hover: hover) and (pointer: fine) { &:hover }");
    },
  ],
};
