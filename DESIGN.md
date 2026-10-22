---
name: PunchMe
description: "Lightbox, the redesign's visual system: a lit sign on a warm wall. Chosen in Phase 1 (docs/redesign/briefs/visual-world.md); its tokens live in the .theme-lightbox scope in src/index.css and tailwind.config.js, its primitives in src/components/kit, and /style-guide shows both."
colors:
  # ── By day ──
  sign-coral: "#f67748"
  sign-coral-hover: "#f2683a"
  warm-wall: "#f6f2eb"
  lit-acrylic: "#fffdfa"
  soft-ink: "#2b2521"
  ink-muted: "#574e47"
  ink-subtle: "#6b625a"
  hairline: "#e9e1d5"
  hairline-strong: "#d8ccbb"
  field-edge: "#8e8277"
  # ── At night ──
  street: "#16120f"
  unlit-panel: "#211b17"
  night-ink: "#f6efe7"
  night-ink-muted: "#cbbfb3"
  night-ink-subtle: "#a99c90"
  night-coral: "#ff8a5c"
  night-coral-hover: "#ff9e78"
  night-coral-ink: "#1a120d"
  night-hairline: "#2f2722"
  night-hairline-strong: "#3f352e"
  night-field-edge: "#7d7064"
  camera-glass: "#0e0c0a"
  # ── The light itself, the same by day and at night ──
  panel-light: "#fff4e6"
  light-deep: "#ffe9d4"
  light-bright: "#fff7ec"
  light-edge: "#fddcc8"
  answer-punched: "#c9f0d9"
  answer-full: "#ffd36b"
  answer-failed: "#ffc9c2"
  answer-punched-ink: "#224c37"
  answer-full-ink: "#504019"
  answer-failed-ink: "#66302a"
  reward-gold: "#f0b429"
  # ── States ──
  ok: "#047857"
  ok-tag: "#065f46"
  ok-wash: "#ecfdf5"
  warn: "#92400e"
  danger: "#b91c1c"
  reward: "#845209"
  night-ok: "#6ee7b7"
  night-ok-wash: "#10261f"
  night-warn: "#fcd34d"
  night-danger: "#fca5a5"
  night-reward: "#ffd875"
typography:
  display:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 4.5rem)"
    fontWeight: 500
    lineHeight: 1.06
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "clamp(2rem, 3.6vw, 3rem)"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "-0.015em"
  lead:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 0.95rem + 0.5vw, 1.25rem)"
    fontWeight: 400
    lineHeight: 1.6
  title:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 500
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  card-title:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 500
    lineHeight: 1.3
  sign:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 500
    lineHeight: 1.3
  answer:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 500
    lineHeight: 1.2
  control:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: 1.25
  body:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  prose:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  prose-hebrew:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.7
  label:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  tag:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 600
    lineHeight: 1.3
  figure:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontWeight: 500
    fontFeature: "tnum"
  count:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "4rem"
    fontWeight: 700
    lineHeight: 1
    fontFeature: "tnum"
  card-code:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
rounded:
  check: "6px"
  field: "16px"
  panel: "24px"
  glass: "28px"
  card: "32px"
  hero: "40px"
  pill: "9999px"
spacing:
  gutter: "16px"
  panel-inset: "20px"
  panel-inset-wide: "24px"
  answer-inset: "12px"
  target: "44px"
  field-height: "48px"
  button-large: "52px"
  row: "56px"
  pass-slot: "300px"
  viewfinder: "343px"
components:
  button-primary:
    backgroundColor: "{colors.sign-coral}"
    textColor: "{colors.soft-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "{spacing.target}"
  button-primary-hover:
    backgroundColor: "{colors.sign-coral-hover}"
  button-primary-large:
    backgroundColor: "{colors.sign-coral}"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.pill}"
    padding: "0 28px"
    height: "{spacing.button-large}"
  button-secondary:
    backgroundColor: "{colors.lit-acrylic}"
    textColor: "{colors.soft-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "{spacing.target}"
  button-ink:
    backgroundColor: "{colors.soft-ink}"
    textColor: "{colors.lit-acrylic}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "{spacing.target}"
  button-quiet:
    textColor: "{colors.soft-ink}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "{spacing.target}"
  button-danger:
    backgroundColor: "{colors.lit-acrylic}"
    textColor: "{colors.danger}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    padding: "0 20px"
    height: "{spacing.target}"
  input:
    backgroundColor: "{colors.lit-acrylic}"
    textColor: "{colors.soft-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.field}"
    padding: "0 16px"
    height: "{spacing.field-height}"
  segment-chosen:
    backgroundColor: "{colors.soft-ink}"
    textColor: "{colors.lit-acrylic}"
    typography: "{typography.control}"
    rounded: "{rounded.pill}"
    height: "{spacing.target}"
  badge-brand:
    backgroundColor: "{colors.sign-coral}"
    textColor: "{colors.soft-ink}"
    typography: "{typography.tag}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  badge-reward:
    backgroundColor: "{colors.reward-gold}"
    textColor: "{colors.soft-ink}"
    typography: "{typography.tag}"
    rounded: "{rounded.pill}"
    padding: "0 10px"
    height: "24px"
  panel:
    backgroundColor: "{colors.lit-acrylic}"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-inset}"
  panel-night:
    backgroundColor: "{colors.unlit-panel}"
    textColor: "{colors.night-ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-inset}"
  panel-lit-night:
    backgroundColor: "{colors.panel-light}"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.panel}"
    padding: "{spacing.panel-inset}"
  answer-punched:
    backgroundColor: "{colors.answer-punched}"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.panel}"
  answer-full:
    backgroundColor: "{colors.answer-full}"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.panel}"
  answer-refusal:
    backgroundColor: "{colors.panel-light}"
    textColor: "{colors.warn}"
    rounded: "{rounded.panel}"
  answer-failed:
    backgroundColor: "{colors.answer-failed}"
    textColor: "{colors.soft-ink}"
    rounded: "{rounded.panel}"
  viewfinder:
    backgroundColor: "{colors.camera-glass}"
    rounded: "{rounded.glass}"
    size: "{spacing.viewfinder}"
---

# Design System: PunchMe

> **Lightbox**, chosen in Phase 1, step 1.3, and built in step 1.4 (`docs/redesign/briefs/visual-world.md`, "The choice" and §4). Its tokens are the `.theme-lightbox` scope in `src/index.css` with its night variant (`.theme-lightbox.theme-night`) and the Lightbox keys in `tailwind.config.js`; its primitives are `src/components/kit`; `/style-guide` shows every one of them, by day and at night, in Hebrew and English, and measures their contrast live. The old scopes (`:root` oat, `.theme-purple`, `.theme-raised` and the purple `.theme-night`) and the four old primitive sets stay for the pages not yet moved, until Phase 10 deletes them.

## Overview

**Creative North Star: "The Lit Sign"**

The page is a lit sign. Panels are lightboxes on a warm wall: white acrylic with light behind it, soft dark letters on the front, and one warm colour on the thing to press. A wallet pass is a lit screen, so the world and the pass are made of the same stuff, light through a panel. It is the owner's own world, the lightbox over the door, the letter board in the café, the standee on the counter. At night the dashboard is the street after closing: the wall goes dark, and only what matters stays lit, which is the pass, the QR code, the Overview's verdict and the scan's answer.

The voice is warm, calm and candid. Friendly without being cute, plain like the product's copy, never loud, because candour is the brand and the look must not oversell. It is the airiest of the directions that were tried: generous corners, comfortable density in the dashboard, and long, open spacing on the landing page. The signature move is lights on: things arrive by light, not by travel.

Lightbox sits close to the warm cream look AI tools reach for first, and it stays out of it on purpose: no serif, no paper texture, light instead of paper, and coral only ever as a fill. The metaphor stays in the light, so there are no neon tubes, no brick and no drawn shopfronts, and light comes from lit panels, never from glass, glows or gradient text.

**Key Characteristics:**
- A warm wall (#f6f2eb) with lit panels (#fffdfa) on it; at night a street (#16120f) of unlit panels (#211b17), with a few things that keep their light (#fff4e6).
- One warm colour, Sign Coral, as a fill only, always carrying its label in Soft Ink.
- Ink, not coral, marks "on" and "selected".
- Rubik 500 for display and the interface, Assistant for running text, Rubik's tabular figures for every number.
- Full pills and generous corners; stamps are circles.
- Depth from light, not shadow; flat at night.
- Hebrew first: logical properties, mirrored motion, opened leading.

## Colors

A warm wall, lit acrylic and soft ink, with one coral fill and a set of lights that keep their glow after dark.

### Primary
- **Sign Coral** (#f67748, hover #f2683a; at night #ff8a5c, hover #ff9e78): the sign's one warm colour. It fills the main action (one per screen), a brand tag, the raised Scan button in the phone bar and the Scan circle at the head of the tablet's rail, and nothing else. It carries Soft Ink: 5.50:1, 4.90:1 on hover; at night it carries #1a120d at 7.95:1 and 9.16:1. As an edge it measures 2.45:1 on the wall and 2.70:1 on a panel, which a control's own label makes up for.

### Neutral
- **Warm Wall** (#f6f2eb): the page. Never pure white; the warmth is the room the sign hangs in.
- **Lit Acrylic** (#fffdfa): a lit panel by day, a field's ground, the cream label on an ink pill.
- **Soft Ink** (#2b2521): text, icons, the focus ring, and every "on" and "selected" state. 13.54:1 on the wall, 14.88:1 on a panel.
- **Ink Muted** (#574e47): secondary text, 7.27:1 on the wall and 7.99:1 on a panel. Never on gold or coral.
- **Ink Subtle** (#6b625a): quiet text, 5.34:1 and 5.87:1. Never on gold, coral or the full and failed answers.
- **Field Edge** (#8e8277): the edge that identifies a control: a field, a checkbox, a switch's track, a slider's rail. 3.35:1 on the wall, 3.68:1 on a panel.
- **Hairline** (#e9e1d5) and **Strong Hairline** (#d8ccbb): dividers and soft edges, 1.16–1.55:1, decoration only.
- **Street** (#16120f), **Unlit Panel** (#211b17), **Night Ink** (#f6efe7, 16.33:1 and 14.92:1), **Night Ink Muted** (#cbbfb3), **Night Ink Subtle** (#a99c90), **Night Field Edge** (#7d7064, 3.87:1 and 3.54:1) and the night hairlines (#2f2722, #3f352e): the same roles after dark.
- **Camera Glass** (#0e0c0a): the viewfinder, a hole in the wall that is never lit. What sits on it is Panel Light (17.97:1).

### The light
- **Panel Light** (#fff4e6): the panels' own warm light. A panel that keeps its light at night, the scan's flash, the band's top, and a refusal's answer. Day ink on it: 13.91:1, ink-muted 7.47:1, ink-subtle 5.49:1.
- **Deep Light** (#ffe9d4), **Bright Light** (#fff7ec) and **Edge Light** (#fddcc8): the band (Panel Light to Deep Light, top to bottom), which lights the Overview's verdict tile and the lead of a shop not live yet and the landing page's field (Bright Light at the centre to Edge Light at the edges). Ink 12.85, 14.22 and 11.69:1.
- **The answers**: Punched (#c9f0d9, ink 12.19:1), Full (#ffd36b, 10.63:1) and Failed (#ffc9c2, 10.35:1). A refusal answers on Panel Light, its word and icon in warn (6.53:1) and its reason in ink-muted (7.47:1). Answers carry ink, and each light's secondary line its own deep tint: its hue darkened in OKLCH to L 0.38, Punched Ink (#224c37, 7.86:1), Full Ink (#504019, 7.08:1) and Failed Ink (#66302a, 7.12:1). Ink-muted, ink-subtle and the state colours stay off the three lights.
- **Reward Gold** (#f0b429): the reward's one fill, carrying Soft Ink at 8.10:1. Coral beside it is 1.47:1.

### States
- **Ok** (#047857, 4.91:1 on the wall; at night #6ee7b7) with its tag text **Ok Tag** (#065f46, 6.11:1 on ok's 15% wash over a panel), **Warn** (#92400e, 6.35:1; at night #fcd34d), **Danger** (#b91c1c, 5.79:1; at night #fca5a5) and **Reward** text (#845209; at night #ffd875). A state is said in words and an icon; its colour is the second signal.

### Named Rules
**The One Warm Thing Rule.** Coral is the only warm fill on a screen, and it is a fill, never text: as text it lands 10° of hue from danger at the same lightness. A warning and an error are their words and their icon on a plain panel, and gold is the reward's one fill. In the scope, `warn-bg`, `danger-bg` and `reward-bg` are the panel itself.

**The Ink Label Rule.** A coral control always carries its label or icon in Soft Ink, and "on", "selected" and a slider's value are drawn in ink, because coral at 2.45:1 can't show a state on its own. On gold, the action is an ink pill.

**The Lit Things Rule.** At night only what matters keeps its light: the pass, the QR code, the Overview's verdict and the scan's answer, on Panel Light under day ink. Everything else goes unlit. The `.theme-lit` class does it, and it restores every day value.

## Typography

**Display Font:** Rubik (with system-ui, sans-serif)
**Body Font:** Assistant (with system-ui, sans-serif)
**Label/Mono Font:** IBM Plex Mono, for card codes only

**Character:** Rubik at 500 has the friendly medium weight of a sign's lettering, its soft corners echoing the panels; today's heavy, tight 700 is gone. Assistant sets running text plainly. Both carry Hebrew and Latin in one family, so the Hebrew site is set, never left to an OS face.

### Hierarchy
- **Display** (500, clamp(2.75rem, 6vw, 4.5rem), 1.06; 1.14 in Hebrew): the landing page's headline.
- **Headline** (500, clamp(2rem, 3.6vw, 3rem), 1.1; 1.2 in Hebrew): a section on the landing page.
- **Lead** (Assistant 400, 18–20px, 1.6; 1.7 in Hebrew): the sentence under a headline.
- **Title** (500, 28px, 1.2; 1.3 in Hebrew): a dashboard page's title.
- **Card title** (500, 19px, 1.3): a panel's heading.
- **Sign** (500, 20px, 1.3): Scan's title, set as a small sign line beside its toggles.
- **Answer** (500, 24px, 1.2): the word a scan answers with.
- **Body** (Assistant 400, 16px, 1.5; 1.6 in Hebrew): interface text.
- **Prose** (Assistant 400, 16px at 1.6; 17px at 1.7 in Hebrew; about 68ch): anything longer than a couple of lines.
- **Label** (Assistant 600, 14px, 1.4): a field's label.
- **Tag** (Assistant 600, 13px, 1.3): a badge.
- **Figure** (Rubik 500, tabular, at the size of its context) and **Count** (Rubik 700, 64px, 1, tabular): numbers. Scan's count is the loudest number in the product.
- Controls set their labels in Rubik 500 at 16px.

### Named Rules
**The Hebrew Leading Rule.** Judge type in Hebrew first. Display sizes drop their tracking to 0 and open their leading under `[dir="rtl"]`, and long Hebrew passages step up to 17px, because Assistant runs small.

**The Tabular Number Rule.** Every number is Rubik with tabular figures, in an element with its own direction (`dir`), so "12 / 8", "₪99" and a phone number read left to right inside Hebrew. Assistant has no tabular figures. Sourced numbers are printed, never counted up.

## Layout

Operate pages are comfortable: a 16px gutter on a phone, 20–24px inside panels, 56px list rows, and every target at least 44px however small its mark. Fields are 48px tall; buttons 44px, or 52px for the landing page's call to action. The landing page is the airiest: sections 128–160px apart on a desktop and 80–96px on a phone, one product piece per card.

The wallet pass always stands in a slot of exactly 300px. A stage around it wants 340px, so on a screen narrower than that the stage clips the pass's edges rather than squeeze it. Scan's viewfinder is 343px square at 375px, its answer inset 12px so the camera keeps showing round it. A sheet comes up from the bottom on a phone and in from the end edge from 768px.

Everything is laid out with logical properties: start and end, never left and right, so Hebrew mirrors without a second layout.

### Named Rules
**The 44px Rule.** Every target a thumb reaches is at least 44px, including a checkbox's or a switch's label, a tab, a segment, a close button and "Not now".

## Elevation & Depth

Lit, not lifted. By day a panel's depth is light: a 1px highlight inside its top edge, white at 70%, and a soft warm drop. At night panels lose both and keep only their own edge, and a lit panel needs no glow, because its own ground against the street (17.14:1) is the light. Only overlays lift: a dialog, a sheet and a toast float on a deeper shadow over a scrim of ink at 40% by day and black at 60% at night.

### Shadow Vocabulary
- **Lit panel** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.7), 0 1px 2px rgb(43 37 33 / 0.05), 0 8px 24px rgb(43 37 33 / 0.06)`): every panel by day.
- **Lifted** (`box-shadow: inset 0 1px 0 rgb(255 255 255 / 0.7), 0 2px 6px rgb(43 37 33 / 0.06), 0 24px 48px rgb(43 37 33 / 0.14)`; at night `0 16px 40px rgb(0 0 0 / 0.5)`): overlays only. Same three layers as the panel, so a lift animates rather than jumps.
- **Unlit** (`box-shadow: 0 0 #0000, 0 0 #0000, 0 0 #0000`): every panel at night.

### Named Rules
**The Lit, Not Lifted Rule.** Depth is light. A panel is never raised to say it matters; it is lit. Only an overlay casts a real shadow.

**The Transparent Shadow Rule.** A theme switches a shadow off with transparent layers, never `none`: Tailwind folds `shadow-*` and `ring-*` into one box-shadow list, and a `none` in it voids the whole declaration, a ring included.

## Shapes

Generous and soft. Buttons, chips, segments and tags are full pills; stamps are circles. Fields have 16px corners, dashboard panels and a scan's answer 24px, the viewfinder 28px, the landing page's tall cards 32px and its lit hero panel 40px. A checkbox is a 24px box with 6px corners. A hairline is 1px and decoration only; Field Edge marks an edge that identifies a control, 1px round a field and 2px round a checkbox, a radio and a switch's track.

## Components

### Buttons
- **Shape:** full pills (9999px), 44px tall (52px large), 20px of inline padding; an icon button is a 44px square that always carries a label for screen readers.
- **Primary:** Sign Coral with a Soft Ink label, one per screen. Hover darkens to #f2683a, only where a pointer hovers and never on a disabled button.
- **Ink:** Soft Ink with a Lit Acrylic label (14.88:1): the action on a gold surface, and "Reward given" on a full card.
- **Secondary, quiet and danger:** a lit panel with a soft edge; a text button; red words with a red edge and no fill.
- **Press, busy, disabled:** a press sinks to 0.97. With reduced motion it tints where it stands instead, so a finger still sees it land: coral takes its hover, ink comes up to 90%, and the rest take the rows' 6% ink well over their own fill. Busy keeps the width and the focus, sets `aria-busy`, swaps the icon for a spinner and swallows presses. Disabled is at half strength.
- **Focus:** the kit's `focusRing`: 2px of ink at a 2px offset, drawn as an outline, so a panel's shadow can't switch it off, its gap stays clear, and it survives Windows' high-contrast mode. Rows draw it inside the edge.

### Chips
- **Badges** say one word about something and are never controls. Neutral is ink-muted with a soft edge; brand is solid coral with ink; reward is ink on gold; ok is Ok Tag on ok's 15% wash; warn and danger are their words and an icon with a soft edge and no fill.
- **Segmented control:** native radios in a pill track on the wall; the chosen one is an ink pill with a cream label that slides between segments on the in-out, mirrored in Hebrew.

### Cards / Containers
- **Corner Style:** 24px in the dashboard, 32px for the landing page's tall cards, 40px for its hero.
- **Background:** Lit Acrylic by day, Unlit Panel at night; a panel that keeps its light is Panel Light at night.
- **Shadow Strategy:** the lit panel by day, unlit at night (Elevation & Depth).
- **Border:** a 1px hairline.
- **Internal Padding:** 20px, 24px from 640px.
- **The lights:** a panel can be lit (keeps its light), the band (Panel Light to Deep Light), the landing page's field (Bright Light to Edge Light), or a scan's answer light.

### Inputs / Fields
- **Style:** a 1px Field Edge stroke (3:1 or more), a Lit Acrylic ground, 16px corners, 48px tall, 16px text so iOS doesn't zoom. The label is always shown above, in Assistant 600 at 14px.
- **Focus:** the focus ring, outside the edge.
- **Error / Disabled:** an error turns the edge red (5.79:1) and is said under the field in red words with an icon, wired to the field with `aria-describedby`; never a pink fill. Disabled is at half strength.
- **Choices:** a checkbox is a Field Edge box that turns into an ink box with a cream check; a radio, a Field Edge ring that turns into an ink ring around an ink dot; a switch, a Field Edge track that turns into an ink track with a cream knob. The slider's rail is Field Edge with the value in ink and a cream thumb inside an ink ring, its fill turned round in Hebrew.

### Navigation
- **Tabs:** one tab stop, the arrows running the way the language reads (in Hebrew the left arrow is "next"); the open tab is ink with a 2px ink rule that lights up under it instead of sliding across.
- **List rows:** 56px, with a leading mark, a title and its meta, and a trailing figure or tag; a row that goes somewhere is one whole link or button, with a chevron that points toward the reading end.

### The lit panel and the scan's photo snap
Scan answers like a photo snap. A flash of Panel Light covers the whole viewfinder and clears from 0.85 to nothing in 220ms (from 0.6 at night); the answer, an inset lit panel, is there at once under it and settles from 1.04 in 180ms on the ease-out; the newest stamp lands in 240ms after 60ms, from 1.45 on the overshoot. The answer is complete at 300ms. With reduced motion it is a 150ms fade, the flash a 0.3 glow, no settle, and the stamp at its final size. A second answer within 400ms gets no second flash, so the frame can never flash three times a second. Inside: the word (Answer), the count (Count), the stamps as one unbroken row that never wraps and marks the next stamp as "now", and on a full card the reward, "Reward given" as an ink pill and "Not now".

### The wallpaper stage
The owner's card on the customer's phone: a wallpaper made from the card's own colour, a tone of it 30% of the way to white and a hint 28% of the way to its stamp colour, blurred 44px, with no saturation boost, under the message the pass brings as a lock-screen notification, and "Roughly how it looks on the lock screen" beneath. The blur is written into gradient stops, so nothing blurs at runtime. It is the customer's phone, so it looks the same at night.

### Charts
One series in ink, never coral: a 2px line with round joins over an 8% area of itself, on a 1px baseline one step off the panel; bars at most 24px wide with 4px tops, square at the base, 2px apart. Time runs like the numbers in both languages, oldest at the left and today at the right, so a plot and its axis sit in a `dir="ltr"` box while the title, the readout and the panel around them follow the page. Only two values are printed on the line, the peak once and today at its end, in ink-muted and ink at 13px, Rubik's tabular figures; nothing under 13px and no Plex Mono. One hit surface snaps to the nearest day, and the readout above the plot leads with the value. A day that wasn't loaded is drawn as not loaded, never as zero, and every chart has a twin for a screen reader: a one-line summary and the days as a list.

### Dialogs, sheets and toasts
A dialog asks a question that must be answered first and rises from 0.96; a sheet holds work beside the page, rising on the drawer curve or coming in from the end edge. Both are the native `<dialog>`, a real focus trap, and crossfade with reduced motion. A toast confirms what the owner just did, arrives by light, and stays 4 seconds counted only while it can be read; an error stays until dismissed.

### Motion
Four curves: the ease-out (cubic-bezier(0.23, 1, 0.32, 1)) for anything arriving, the overshoot (cubic-bezier(0.34, 1.4, 0.64, 1)) for the stamp, the drawer (cubic-bezier(0.32, 0.72, 0, 1)) for the sheet, and the in-out (cubic-bezier(0.77, 0, 0.175, 1)) for a knob or a pill already on screen moving across it. Interface motion stays under 300ms: a press 120ms, a knob 200ms, lights on 240ms, a sheet 300ms, an exit 180ms. The stamp lands in 340ms. Activation, the card's panel switching from unlit to lit, takes 600ms, once. Every reduced-motion stand-in is a 150ms fade.

### Named Rules
**The 300px Slot Rule.** `AppleCardPreview`, `GoogleCardPreview`, `StampGrid` and `PassBarcode` stand in a slot of exactly 300px. They are framed, staged and animated, never redrawn and never squeezed.

**The Nothing Disappears Rule.** A toast confirms the owner's own action. A scan's result, a refusal or a loss is never a toast: it stays where it happened.

**The Lights On Rule.** Things arrive by light, not by travel: a panel's light fades up while it moves 8px at most. What a hand can interrupt mid-move uses a transition; what happens once per event is a keyframe keyed to it.

## Do's and Don'ts

### Do:
- **Do** measure every text colour against every ground it can sit on and write the ratio beside it, quoting the tighter one. All text meets AA; a field's edge, a focus ring and a state's mark meet 3:1.
- **Do** use logical properties only (`ms-` `me-` `ps-` `pe-` `start-` `end-` `text-start` `text-end`), and mirror anything that moves sideways in Hebrew.
- **Do** keep every target a thumb reaches at least 44px.
- **Do** put the kit's `focusRing` on every control: 2px of ink, 2px out, as an outline.
- **Do** set running text in a face that has Hebrew: Rubik and Assistant. Plex Mono sets card codes only, and Roboto only the Google Wallet preview.
- **Do** stage the pass previews in their 300px slot; frame and animate them, never redraw them.
- **Do** keep coral for the one thing to press, with its label in Soft Ink, and draw "on" and "selected" in ink.
- **Do** say a warning or an error in its words and its icon on a plain panel, and give the reward the one gold fill.
- **Do** put what keeps its light at night inside `.theme-lit`: the pass's stage, the QR code, the Overview's verdict and the scan's answer.
- **Do** make reduced motion gentler, not none: light at full strength in 150ms with no travel, the stamp at its final size, the flash a 0.3 glow, a press a tint instead of a sink.
- **Do** judge every screen in Hebrew at 375px first.

### Don't:
- **Don't** set coral as text, as a wash or as a state; and don't add a second warm fill beside it.
- **Don't** put ink-muted or ink-subtle on gold or coral, or anything but ink or its light's own tint on a scan's answer light.
- **Don't** switch a shadow off with `none`; use transparent layers.
- **Don't** let a hover style set a property a state also sets: hover is held back from disabled, selected and invalid controls.
- **Don't** use Tailwind's `dark:` variant; night is `.theme-night`, not the device's setting.
- **Don't** reach for the warm cream look AI tools default to: no serif, no paper texture, no grain. Lightbox is light, not paper.
- **Don't** draw the metaphor literally: no neon tubes, no brick, no illustrated shopfronts.
- **Don't** fake light with effects: no frosted glass, no glowing halos, no gradient text. Light comes from lit panels.
- **Don't** count a sourced number up, invent a figure, or stage a sample card under an invented business name; a sample carries its trade.
- **Don't** use `ml-` `mr-` `pl-` `pr-` `text-left` or `text-right`.
- **Don't** redraw or squeeze the pass previews.
- **Don't** build new pages on the old scopes or the four old primitive sets; they stay only until their pages move.
