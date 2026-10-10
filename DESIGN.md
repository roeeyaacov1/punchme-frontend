---
name: PunchMe
description: "The design system before the redesign, read from the code at the redesign-start tag on 10 October 2026. Phase 1 of docs/redesign/guide.md replaces it."
colors:
  # ── Fixed (tailwind.config.js). Every scope sees these unchanged. ──
  white: "#ffffff"
  black: "#000000"
  navy: "#0e1120"
  slate: "#5c6478"
  lavender: "#a7adc9"
  gold: "#f0b429"
  gold-light: "#ffd875"
  gold-dark: "#c88a11"
  # ── The landing's fixed values (brand.*). Only inside .theme-purple. ──
  brand-violet: "#683de8"
  brand-indigo: "#5b41e6"
  brand-royal: "#404ee6"
  brand-blue: "#2562ea"
  brand-bright: "#7a3aec"
  brand-tint: "#f0f1fc"
  brand-wash: "#f5f6fe"
  brand-pill: "#dfd5fa"
  brand-on-band: "#e3ddfb"
  brand-night: "#0f0f23"
  brand-slate: "#1d1d35"
  brand-bezel: "#1e1e2f"
  brand-warm: "#e11d48"
  brand-ember: "#c2410c"
  brand-magenta: "#ce2f82"
  # The brief band's two stops (.grad-brief, src/index.css).
  brief-violet: "#662eba"
  brief-plum: "#a52668"
  # ── :root, the oat card stock. Worn today only inside /admin. ──
  oat-background: "#efe9dc"
  oat-surface: "#ffffff"
  oat-ink: "#0e1120"
  oat-ink-muted: "#5e5750"
  oat-ink-subtle: "#6b6459"
  oat-primary: "#c88a11"
  oat-primary-hover: "#b87f10"
  oat-primary-text: "#8a5d0b"
  oat-primary-on: "#0e1120"
  oat-primary-shadow: "#8a5d0b"
  oat-border: "#ded5c2"
  oat-border-strong: "#c8bca3"
  oat-navy-deep: "#0e1120"
  oat-rim: "#000000"
  # ── .theme-purple, the landing. rim stays #000000. ──
  purple-background: "#ffffff"
  purple-surface: "#f5f6fe"
  purple-ink: "#111111"
  purple-ink-muted: "#414141"
  purple-ink-subtle: "#55555f"
  purple-primary: "#5b41e6"
  purple-primary-hover: "#4f38d1"
  purple-primary-text: "#683de8"
  purple-primary-on: "#ffffff"
  purple-primary-shadow: "#3f2da5"
  purple-border: "#e2e3f6"
  purple-border-strong: "#caccee"
  purple-navy-deep: "#0f0f23"
  # ── .theme-purple.theme-raised: the two lightest values trade places. ──
  raised-background: "#f5f6fe"
  raised-surface: "#ffffff"
  # ── .theme-purple.theme-night, the dashboard after dark. ──
  night-background: "#0f0f23"
  night-surface: "#1d1d35"
  night-ink: "#f2f1fb"
  night-ink-muted: "#b9b7d4"
  night-ink-subtle: "#9a98ba"
  night-primary: "#6d4df2"
  night-primary-hover: "#7a5cf4"
  night-primary-text: "#a78bfa"
  night-primary-on: "#ffffff"
  night-primary-shadow: "#4a2fd0"
  night-border: "#2c2c48"
  night-border-strong: "#3d3d61"
  night-navy-deep: "#08081a"
  night-rim: "#ffffff"
  # ── States, by day (:root; every light scope, and .theme-lit). ──
  ok: "#047857"
  ok-bg: "#ecfdf5"
  warn: "#92400e"
  warn-bg: "#fffbeb"
  danger: "#b91c1c"
  danger-bg: "#fef2f2"
  reward: "#845209"
  reward-bg: "#fefaec"
  # ── States at night. ──
  night-ok: "#6ee7b7"
  night-ok-bg: "#10261f"
  night-warn: "#fcd34d"
  night-warn-bg: "#2b2113"
  night-danger: "#fca5a5"
  night-danger-bg: "#2b1418"
  night-reward: "#ffd875"
  night-reward-bg: "#2d2412"
typography:
  display:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 6vw, 4.5rem)"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "clamp(1.875rem, 3.6vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.03em"
  title:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.025em"
  title-card:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1.1875rem"
    fontWeight: 700
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  stat:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 5.5vw, 4rem)"
    fontWeight: 700
    lineHeight: 0.95
    letterSpacing: "-0.04em"
    fontFeature: "tnum"
  lead:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.6
  body:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: "1.25rem"
  control:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: "1.25rem"
  cta:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: "1.5rem"
  cta-small:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
    lineHeight: "1.25rem"
  ui-button:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 500
    lineHeight: "1.5rem"
  island:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 600
    lineHeight: "1rem"
  label:
    fontFamily: "Assistant, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.4
    letterSpacing: "0.14em"
  figure:
    fontFamily: "IBM Plex Mono, monospace"
    fontWeight: 500
    fontFeature: "tnum"
  tag:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.6875rem"
    fontWeight: 400
    letterSpacing: "0.025em"
  readout-label:
    fontFamily: "IBM Plex Mono, monospace"
    fontSize: "0.625rem"
    fontWeight: 400
    letterSpacing: "0.12em"
  readout-value:
    fontFamily: "Rubik, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: "2rem"
    fontFeature: "tnum"
rounded:
  lg: "8px"
  xl: "12px"
  2xl: "16px"
  full: "9999px"
  phone: "2.6rem"
  phone-screen: "2.1rem"
spacing:
  "1": "4px"
  "1.5": "6px"
  "2": "8px"
  "2.5": "10px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "7": "28px"
  "16": "64px"
  "20": "80px"
  "28": "112px"
  target: "44px"
components:
  cta-primary:
    backgroundColor: "{colors.purple-primary}"
    textColor: "{colors.purple-primary-on}"
    typography: "{typography.cta}"
    rounded: "{rounded.lg}"
    padding: "16px 28px"
  cta-primary-hover:
    backgroundColor: "{colors.purple-primary-hover}"
  cta-primary-night:
    backgroundColor: "{colors.night-primary}"
    textColor: "{colors.night-primary-on}"
  cta-primary-oat:
    backgroundColor: "{colors.oat-primary}"
    textColor: "{colors.oat-primary-on}"
  cta-secondary:
    backgroundColor: "{colors.purple-surface}"
    textColor: "{colors.purple-ink}"
    typography: "{typography.cta}"
    rounded: "{rounded.lg}"
    padding: "16px 28px"
  cta-small:
    typography: "{typography.cta-small}"
    rounded: "{rounded.lg}"
    padding: "10px 16px"
  ui-button-primary:
    backgroundColor: "{colors.navy}"
    textColor: "{colors.white}"
    typography: "{typography.ui-button}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  ui-button-secondary:
    textColor: "{colors.navy}"
    typography: "{typography.ui-button}"
    rounded: "{rounded.full}"
    padding: "10px 20px"
  field:
    backgroundColor: "{colors.raised-background}"
    textColor: "{colors.purple-ink}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "10px 16px"
  field-night:
    backgroundColor: "{colors.night-background}"
    textColor: "{colors.night-ink}"
  ui-input:
    backgroundColor: "{colors.white}"
    textColor: "{colors.navy}"
    typography: "{typography.body}"
    rounded: "{rounded.xl}"
    padding: "10px 16px"
  panel:
    backgroundColor: "{colors.raised-surface}"
    rounded: "{rounded.2xl}"
    padding: "16px"
  panel-night:
    backgroundColor: "{colors.night-surface}"
    rounded: "{rounded.2xl}"
  tag-neutral:
    backgroundColor: "rgba(17, 17, 17, 0.07)"
    textColor: "{colors.purple-ink-muted}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  tag-accent:
    backgroundColor: "rgba(104, 61, 232, 0.15)"
    textColor: "{colors.purple-primary-text}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  tag-reward:
    backgroundColor: "{colors.gold}"
    textColor: "{colors.navy}"
    typography: "{typography.tag}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  notice-ok:
    backgroundColor: "{colors.ok-bg}"
    textColor: "{colors.ok}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  notice-warn:
    backgroundColor: "{colors.warn-bg}"
    textColor: "{colors.warn}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  notice-danger:
    backgroundColor: "{colors.danger-bg}"
    textColor: "{colors.danger}"
    typography: "{typography.body-sm}"
    rounded: "{rounded.xl}"
    padding: "12px 16px"
  chip:
    backgroundColor: "{colors.raised-surface}"
    textColor: "{colors.purple-ink-muted}"
    typography: "{typography.control}"
    rounded: "{rounded.full}"
    height: "44px"
    padding: "0 16px"
  chip-active:
    backgroundColor: "{colors.purple-primary}"
    textColor: "{colors.purple-primary-on}"
  segmented-option-active:
    backgroundColor: "{colors.purple-primary}"
    textColor: "{colors.purple-primary-on}"
    typography: "{typography.control}"
    rounded: "{rounded.lg}"
    height: "44px"
    padding: "0 12px"
  switch-on:
    backgroundColor: "{colors.purple-primary}"
    rounded: "{rounded.full}"
    width: "44px"
    height: "24px"
  switch-off:
    backgroundColor: "rgba(17, 17, 17, 0.2)"
    rounded: "{rounded.full}"
    width: "44px"
    height: "24px"
  island-switch-selected:
    backgroundColor: "{colors.white}"
    textColor: "{colors.black}"
    typography: "{typography.island}"
    rounded: "{rounded.full}"
    height: "44px"
    padding: "0 14px"
---

# Design System: PunchMe

> **This is the design system before the redesign, and Phase 1 replaces it.**
> It records what the code does at the `redesign-start` tag (`7f709bd`):
> `tailwind.config.js`; the oat `:root` values and the `theme-purple`,
> `theme-raised`, `theme-night` and `theme-lit` scopes in `src/index.css`;
> the four primitive sets (`src/components/ui`,
> `src/components/dashboard/primitives.tsx`,
> `src/components/card-studio/studio-primitives.tsx`,
> `src/components/onboarding`); and the button and focus ring they borrow
> from `src/components/marketing/primitives.tsx`. Nothing in `src/`,
> `tailwind.config.js` or `index.html` has changed since the tag.
>
> Phase 1, step 1.4 of `docs/redesign/guide.md` builds a new theme scope and
> primitive set beside these, then reruns `/impeccable document` to overwrite
> this file. Phase 10 deletes the old scopes and sets. Until then this file is
> a record, not a brief. The brand colour and the fonts are open (guide D4, and
> CLAUDE.md "Design skills"). Only the rules CLAUDE.md requires carry over;
> "Do's and Don'ts" marks them.
>
> **Ratios.** All 77 ratios quoted in the comments were re-measured with the
> WCAG 2 formula. Each agrees to within 0.05:1 and is quoted as the comment
> gives it. In four places, colours that no comment covers fail AA. They are
> listed under "Known failures".

## Overview

**Creative North Star: "Objects under a lamp"**

The strongest idea in today's system is not a colour, and it lives in the
comments rather than in any token. A page is paper or a room, and the things
the product is about are objects set down on it. Words rise into place on a
long settle, and objects land with the overshoot of a rubber stamp. At night
the room goes dark and what the owner reads goes dark with it. What the owner
hands to someone else keeps its own light. A QR code is staged under a lamp
rather than repainted, and a printed standee keeps the owner's colours down to
the last hairline while the desk under it turns. The pass is the exception
that proves the rule. It is a screen, not paper, so it turns with the room,
and only its colours are a spec match, because they are the owner's.

The surface around that idea is layered. One set of token names covers the
ground, the panel, three inks, the accent, two borders and four states. It is
painted in four scopes: the original oat card stock with a gold accent, the
landing page's violet on white, a raised variant for the single-panel pages, and
night for the dashboard. Underneath sits an older set, `components/ui`, which
paints navy on white directly and ignores all four. The two disagree about
corners, focus rings and what the accent is.

Public pages are spacious, banded and bright. The dashboard is quieter:
hairline panels on a shallow shadow, one loud surface at most, and state said
in a word and a small mono tag, never in colour alone. Every colour that
carries text has its ratio written beside it. The violet is under review. The
design skills installed for the redesign treat purple-blue gradients as a
common sign of AI-made design (guide D4), so Phase 1 keeps violet as one of
three candidates, not as a given.

**Key Characteristics:**
- One token vocabulary, four scopes, switched by a class (on `<html>` for the dashboard and its night mode).
- A measured contrast ratio beside every text colour, quoted against the tighter of its grounds.
- Two motion curves with meanings: words rise, objects land.
- Corners just taken off (8, 12 and 16px), and pills only for states and switches.
- A hairline plus a shallow shadow, in two levels, cast in real black at night.
- Rubik 700 for display, Assistant for reading, Plex Mono for figures and labels. Hebrew is set in the same families as the Latin.
- The wallet pass previews are staged in a 300px slot and never redrawn.

## Colors

A tokenised palette that is repainted per scope, beside a set of fixed colours
that never change.

### How the scopes stack

The tokens are CSS variables holding bare RGB channels (`--c-ink: 17 17 17`),
so Tailwind's alpha modifiers still work (`bg-surface/60`). A scope is a class
that redefines them.

| Scope | Worn by | Grounds |
|---|---|---|
| `:root` (oat) | Nothing public. `/admin` and `/style-guide` set no theme, and paint `bg-white text-navy` directly, so only the token-built pieces inside `/admin` render in oat: the Card Studio in the catalog editor, and `LookTile` | Oat ground, white panel |
| `.theme-purple` | The landing page | White ground, wash panel |
| `.theme-purple.theme-raised` | The wizard, sign-in, `/invite`, `JoinPage`, `CardStatusPage`, `PublicCardPage`, and the dashboard by day (`useDashboardTheme` puts both classes on `<html>`) | Wash ground, white panel |
| `+ .theme-night` | The dashboard after dark, Card Studio included. It follows the device unless the owner picks light or dark | Night ground, night panel |
| `.theme-lit` | Any subtree that must stay light at night: `LitStage` (the Overview's QR code, the message preview, the referral preview) and `PassStage` on the public pages | The purple day values, with `color-scheme: light` |

The night ground lives on `<html>`, not on a wrapper, so it survives iOS
overscroll. `color-scheme: dark` there makes the native selects, scrollbars and
caret agree. The logo is navy line art, and at night it is knocked out to
white with a filter.

### Primary

The accent is a fill with its own text colour, because the scopes disagree
about what reads on it.

- **Oat Gold** (oat-primary, #c88a11): the oat fill. It carries navy at
  6.30:1. White on it is 2.96:1, so it never carries white. Hover #b87f10. Accent text in oat is #8a5d0b: 4.80:1
  on oat, 5.80:1 on white. The seated edge under a CTA is the same #8a5d0b.
- **Indigo** (purple-primary, #5b41e6): the landing's and the day dashboard's
  fill. It carries white at 6.28:1. Hover #4f38d1 carries white at 7.45:1.
  The seated edge is #3f2da5, which carries no text.
- **Violet Text** (purple-primary-text, #683de8): accent-coloured text by day.
  5.70:1 on the wash, 6.14:1 on white.
- **Night Violet** (night-primary, #6d4df2): the night fill. It carries white
  at 5.26:1. Hover #7a5cf4 carries white at 4.50:1, which is the floor, and
  it holds. The seated edge is #4a2fd0.
- **Plot Violet** (night-primary-text, #a78bfa): accent text at night, the
  landing's own plot violet. 6.93:1 on the night ground, 6.03:1 on the panel.

### Secondary

Gold is the reward: the thing a customer collects towards, on the landing page,
on the card and in the dashboard. It is never a state of the software.

- **Reward Gold** (gold, #f0b429): a fill only, and it carries navy at
  10.06:1 (the reward tag). On white it measures 1.86:1, so it fails AA as
  text. (The 2.96:1 that `tailwind.config.js`, `marketing/primitives.tsx` and
  `PunchMark.tsx` give for gold is white on the oat fill, Deep Gold.)
- **Deep Gold** (gold-dark, #c88a11): the oat fill above. As text on white it
  is 2.96:1. The old `ui` Badge still sets text in it.
- **Pale Gold** (gold-light, #ffd875): the reward at night, as text and as the
  band's reward rule.
- **Reward text** (reward, #845209): gold as text by day. 6.58:1 on white,
  6.30:1 on its fill #fefaec, 5.27:1 on its own 15% wash. At night it is Pale
  Gold: 11.98:1 on the panel, 11.17:1 on its fill #2d2412, 8.21:1 on its own
  15% wash.

### Tertiary

The landing's fixed values (`brand.*`). They were sampled from the Figma and
corrected where the drawing failed AA. They appear only inside `.theme-purple`.

- **Bands and fills**, which all carry white: Band Violet #683de8 (6.14:1),
  Indigo #5b41e6 (6.28:1), Royal #404ee6 (6.09:1), Gradient Blue #2562ea
  (5.23:1), Bright Violet #7a3aec (5.76:1, the violet end of a gradient).
- **Light grounds**, which carry ink #111: Tint #f0f1fc (16.81:1), Wash
  #f5f6fe (17.53:1), Pill Lilac #dfd5fa (13.52:1).
- **On-Band Lilac** (#e3ddfb): body copy on a violet band, 4.68:1 on violet.
  It was drawn at roughly white/70, which measured 3.53:1 and failed at 15px.
- **The dashboard mock**: Night #0f0f23 (white 18.87:1), Night Panel #1d1d35
  (white 16.41:1), Bezel #1e1e2f (frame only, no text).
- **Pricing**: Rose #e11d48 (white 4.70:1) and Ember #c2410c (white 5.18:1).
  They were drawn as #f4415c to #fa903c, where white measured 3.65:1 falling
  to 2.30:1.
- **Magenta** (#ce2f82, white 4.82:1): the mock's stat-card end stop, darkened
  because it carries a 14px label.

**Gradients** (`src/index.css`). Each one is written for Hebrew, where the
Figma draws the accent at the left edge, the end of the line. The LTR rule
mirrors it, so in English the accent keeps its place relative to the reader.

- `.grad-cta`, Bright Violet to Gradient Blue: the landing's headline control,
  with a white label.
- `.grad-warm`, Rose to Ember: the pricing CTA, white at 4.70 to 5.18:1.
- `.grad-magenta`, #7f3ae9 to Magenta: the stat card inside the dashboard
  mock, which carries only large white text.
- `.grad-brief`, Brief Violet #662eba to Brief Plum #a52668: the dashboard's
  brief band, eight tenths of the way to black. Measured against both stops:
  white 7.88 / 6.82:1, On-Band Lilac 6.00 / 5.20:1, white on white/20 4.99 /
  4.62:1 (at /25 it drops to 4.15:1), and On-Band Lilac on black/15 7.31 /
  6.47:1.
- `.grad-band`, Royal to #3655e7, top to bottom: the pricing band's ground.
  It is vertical, so it needs no flip.
- `.hero-bloom`: a radial violet light behind the hero phone, from
  rgb(122 58 236 / 0.42) through rgb(96 84 240 / 0.22) to transparent.

### Neutral

| Token | Oat (`:root`) | Purple | Raised | Night |
|---|---|---|---|---|
| background | Oat #efe9dc | White #ffffff | Wash #f5f6fe | Night #0f0f23 |
| surface | White #ffffff | Wash #f5f6fe | White #ffffff | Night Panel #1d1d35 |
| ink | #0e1120: 15.5:1 on oat, 18.75:1 on white | #111111: 17.5:1 on wash, 18.9:1 on white | 17.53 / 18.88:1 | #f2f1fb: 16.85:1 on night, 14.66:1 on panel |
| ink-muted | #5e5750: 5.89 / 7.12:1 | #414141: 9.48 / 10.2:1 | | #b9b7d4: 9.69 / 8.43:1 |
| ink-subtle | #6b6459: 4.83 / 5.85:1 | #55555f: 6.84 / 7.37:1 | | #9a98ba: 6.81 / 5.92:1 |
| border | #ded5c2 | #e2e3f6 | | #2c2c48 |
| border-strong | #c8bca3 | #caccee | | #3d3d61 |
| navy-deep | #0e1120 | #0f0f23, the dark band and the footer | | #08081a, one step under the ground for inset wells |
| rim | #000000 | #000000 | | #ffffff |

`border` is the hairline. `border-strong` is a second, heavier rule for totals,
section edges and hover. `rim` edges an object whose colours are not ours (a
pass, a printed sheet). It is black on a light ground and white on a dark one,
and always spent at /10, because /12 compiles to nothing and leaves Tailwind's
blue ring showing.

The fixed neutrals belong to the old `ui` set. **Wordmark Navy** (navy,
#0e1120) is its text and its button, 18.75:1 on white. **Old Slate** (slate,
#5c6478) is its secondary text, 5.92:1 on white and 4.89:1 on oat, measured
here because no comment gives it. **Lavender** (#a7adc9) is defined and used
nowhere.

### States

Three things the dashboard has to say out loud, plus the reward (see
Secondary). Each is a text colour and the fill it is measured on, in both
themes. They replaced hand-picked Tailwind pairs that went invisible on the
night ground.

| | By day: every light scope, and `theme-lit` | At night |
|---|---|---|
| ok | #047857 on #ecfdf5: 5.21:1 on its fill, 5.48:1 on white | #6ee7b7 on #10261f: 10.44:1 on its fill, 10.77:1 on the panel |
| warn | #92400e on #fffbeb: 6.84:1 on its fill, 7.09:1 on white | #fcd34d on #2b2113: 10.95:1 on its fill, 11.38:1 on the panel |
| danger | #b91c1c on #fef2f2: 5.91:1 on its fill, 6.47:1 on white | #fca5a5 on #2b1418: 9.10:1 on its fill |

### Known failures

Measured for this record. No comment claims these pairs.

| Where | Pair | Ratio | Seen in |
|---|---|---|---|
| Dashboard `Tag`, `ok` tone, by day | ok on a 15% wash of itself | **4.43:1** on a white panel, **4.13:1** on the wash (11px text) | "Saved" in the Card Studio (`DesignPage`) |
| `ui` `Badge`, `gold` tone | Deep Gold on a 15% gold wash | **2.70:1** | The admin badge (`AdminLayout`) |
| `ui` `ColorField` | Section labels: slate at 70% on white, 11px. Hex placeholder: slate at 40% | **3.08:1** and **1.80:1** | The wizard's colour steps |
| `ui` `Input` placeholder | slate at 60% on white | **2.56:1** | `/join` and the referral join form |

### Named Rules

**The Fill-and-Its-Ink Rule.** A fill never assumes the colour of its own label. Whatever sits on `primary` uses `primary.on`, and accent-coloured text uses `primary.text`, measured per scope. `primary` itself is never text on a light ground.

**The Measured Rule.** Every colour that carries text has its ratio written beside it, against every ground it can sit on, and the tighter one is quoted. Nothing on a gradient is set in white-with-an-alpha, because alpha composites differently at each end and cannot be measured once.

**The Reward-Is-Gold Rule.** Gold means the thing being collected towards and is never a state. As a fill it carries navy; as text it is `reward`.

## Typography

**Display Font:** Rubik (with system-ui, sans-serif)
**Body Font:** Assistant (with system-ui, sans-serif)
**Label/Mono Font:** IBM Plex Mono (with monospace), for digits, pass field labels and tags

**Character:** Rubik's round-bowled geometric Latin is the closest webfont to
the logo wordmark, and it is set heavy and tight. Assistant is a quiet
reading face beside it. Both carry Hebrew and Latin in one family at matching
weights, so the Hebrew site is set rather than falling back to an OS face.

All four faces come from Google Fonts in `index.html`: Rubik 400–700,
Assistant 400–700, Plex Mono 400 and 500, and Roboto 400 and 500. Roboto is
there only for the Google Wallet preview and never sets running text. Every
`h1`–`h4` is Rubik 700 by default (`src/index.css`), and `body` is Assistant.

### Hierarchy
- **Display** (`.t-h1`; 700, clamp(2.75rem, 6vw, 4.5rem), 1.02, −0.035em): the landing hero.
- **Headline** (`.t-h2`; 700, clamp(1.875rem, 3.6vw, 2.75rem), 1.05, −0.03em): section openers.
- **Title** (`.t-h3`; 700, 1.75rem, 1.15, −0.025em): the wizard's step titles.
- **Card title** (`.t-card-title`; 700, 1.1875rem, 1.3, −0.015em): panel, studio panel and disclosure titles. Semantically an `h2` or `h3`, visually a step down.
- **Stat** (`.t-stat`; 700, clamp(2.75rem, 5.5vw, 4rem), 0.95, −0.04em, tabular): the landing's sourced figures. They are printed, never counted up.
- **Lead** (`.t-lead`; 400, 1.125rem, 1.6): the paragraph under a section opener.
- **Body** (400, 16px, 1.5): running text. Hints and secondary lines step down to 14px, and field hints to 12px.
- **Control** (500, 14px): labels, legends, toggles, chips and quiet buttons.
- **Label** (`.t-eyebrow`; 700, 0.75rem, 1.4, 0.14em, uppercase): eyebrows and the dashboard's group labels.
- **Figure** (`.t-figure`; Plex Mono 500, tabular, `unicode-bidi: isolate`): money and counts, so "₪600" inside a Hebrew row stays one left-to-right run.
- **Tag and readout labels** (Plex Mono 11px and 10px, uppercase, tracked 0.025em and 0.12em), and **readout values** (Rubik 700, 24px, tabular).

**In Hebrew** (`[dir="rtl"]`): display, headline, title, card title and stat
drop their tracking to 0. Display opens to a 1.12 line height and headline to
1.18, the lead to 1.7, and the eyebrow's tracking falls to 0.04em, because
`uppercase` does nothing to Hebrew.

**Known gap.** The dashboard's `Tag`, the readout labels and the `ui` `Badge`
set words in Plex Mono, which has no Hebrew. In Hebrew those words fall back
to the device's own face.

### Named Rules

**The Hebrew-First Rule.** Type is judged in Hebrew. Tracking that makes Latin read as signage smears Hebrew, so every display class drops it and opens its leading under `[dir="rtl"]`.

**The Mono-Is-for-Digits Rule.** Plex Mono has no Hebrew. It sets figures, pass field labels and tags, isolated left to right, and never running text. Roboto has none either and appears only in the Google Wallet preview.

## Layout

Phone first, one column until there is room. Tailwind's breakpoints are
unchanged: `sm` 640px, `md` 768px, `lg` 1024px, `xl` 1280px.

- **Landing.** `Container` caps at 1152px with 20, 24 and 32px gutters.
  `Section` pads 64px, then 80px from `sm` and 112px from `lg`. Sections
  alternate white and the wash, and a saturated band (violet, royal or night)
  drops in wherever the page changes subject. On a phone, where one section is
  in view at a time, that banding is most of the rhythm. Anchored headings
  clear the 80px sticky header.
- **The wizard and the single-panel pages.** One panel, 448px wide and 512px
  from `sm`, under a thin top bar. In the wizard the phone sits above the step
  and gives up height as the screen gets shorter. `--phone-scale` steps from 1
  to 0.86 at 860px tall, 0.74 at 800px, 0.62 at 750px, and a floor of 0.55 at
  700px, where the island's 44px buttons come to 24.2px, the smallest target
  still allowed. On a screen 860px tall or less, the crop follows the step:
  530px whole (546px from `sm`), 430px for Apple on a full step, 310px on a
  short step and 150px on a peek. A crop lands where the card has nothing to
  say, and the slider never changes it mid-drag.
- **Dashboard.** Content up to 1024px, with the rail from `lg`. On a phone the
  page pads 16px, and horizontal scrollers bleed to the screen edge so a
  half-cut chip says there are more.
- **Spacing.** Tailwind's 4px scale. The steps that recur: 6px from a label to
  its control, 8 and 12px between siblings, 16 to 24px inside panels, 20px
  between a panel's controls, and a 20 to 28px inset on the brief band.
- **Direction.** Logical properties throughout (`ms-` `me-` `ps-` `pe-`
  `start-` `end-`). A transform cannot be logical, so it carries a sign flip:
  the Toggle knob, the wizard's progress pill, the arrows
  (`rtl:-scale-x-100`), and rules that grow from the start edge
  (`origin-left rtl:origin-right`). Gradients flip too.

### Named Rules

**The Thumb Floor Rule.** 44px is the target even when the mark is 6px. Keep the box and shrink the drawing.

## Elevation & Depth

A hybrid. At rest the 1px hairline does most of the work and a shallow,
navy-tinted shadow only seats it. On a near-black ground a tinted shadow
reads as nothing, so the night theme casts real black, further, and leans on
the border. Depth also comes from tone: a field is a well, drawn in the ground
colour inside a panel.

### Shadow Vocabulary
- **card / panel at rest** (`box-shadow: 0 1px 2px rgb(14 17 32 / 0.04), 0 1px 3px rgb(14 17 32 / 0.06)`): every panel, always with a hairline. At night `panel` becomes `0 1px 2px rgb(0 0 0 / 0.5), 0 2px 8px rgb(0 0 0 / 0.35)`.
- **lift / panel-lift** (`box-shadow: 0 8px 24px rgb(14 17 32 / 0.08)`): hover, popovers, the brief band and the lit stage. At night `panel-lift` becomes `0 12px 32px rgb(0 0 0 / 0.5)`.
- **The seated edge** (`box-shadow: 0 2px 0 0 primary.shadow`, pressed to `0 1px 0 0` with a 1px drop): under the primary CTA, which is a control pressed into the page, not floating over it.
- **The glow** (`box-shadow: 0 6px 20px -6px rgb(91 65 230 / 0.7)`, hover `0 10px 28px -8px rgb(91 65 230 / 0.85)`): the gradient CTA, which lifts instead of darkening because a gradient has no single colour to darken. The warm CTA uses rgb(194 65 12).
- **Halos**: the progress pill's 3px spread at `primary`/16%, and the old `ui` Button's 6px gold ring on hover.
- **The old `ui` Card** (`box-shadow: 0 1px 2px rgba(14,17,32,0.06), 0 8px 24px rgba(14,17,32,0.08)`, deepening on hover): hard-coded, outside the token levels.

### Named Rules

**The Two Levels Rule.** A surface is at rest or lifted, and nothing sits in between. At rest the hairline does most of the work.

**The Lamp Rule.** At night, what the owner reads turns dark and what the owner hands to someone keeps its own light. A QR code sits inside `theme-lit` on a lit stage, staged rather than repainted. A printed sheet keeps the owner's colours, and `rim` gives it an edge on either ground. The pass is a screen, so it turns with the page.

## Shapes

Everything is a rectangle with the corner just taken off. Controls take 8px:
the CTA was squared off from a pill on purpose, because the pass, the card and
the receipt are rectangles and this audience reads a well-made physical
control. Fields, notices, choice cells and look tiles take 12px. Panels, the
brief band and staged objects take 16px. Pills are kept for things that are a
state or a switch: tags, filter chips, the toggle, the progress capsule, the
phone's island.

The old `ui` set breaks this. Its Button and Badge are full pills.

Circles are the stamps: round dots in the card's own colours, and the 6px
progress marks. The phone is the one drawn device, with a 2.6rem bezel and a
2.1rem screen, and it is always cropped by its container, never drawn whole.

Lines carry the ornament. The section opener's 4px × 40px accent bar draws
itself out from the first word. A readout's 3px × 28px rule names its
category. The calculator's receipt runs a dotted leader from label to figure,
like a till receipt: structure only, with no torn edge or paper texture. The
standee's fold is a dashed line.

### Named Rules

**The Corner-Off Rule.** Controls and containers are rectangles with the corner just taken off, at 8, 12 or 16px. The pill is reserved for states and switches.

## Components

### The four sets

| Set | Holds | Paints with | Worn by |
|---|---|---|---|
| `src/components/ui` | `Button` and `buttonClasses`, `Input`, `Card`, `Badge`, `ColorField`, `PlacesAutocomplete`, `Slider`, `IconPicker`, `BackgroundPicker` | Hard-coded navy, slate, gold and white. No tokens and no night | `/admin`; `/style-guide`; `Input` on `/join` and the referral form; `ColorField` and `PlacesAutocomplete` in the wizard; `buttonClasses` in `RequireStaff` and `WalletAddButtons`. `Card` appears only on `/style-guide`. `Slider`, `IconPicker` and `BackgroundPicker` are imported nowhere |
| `src/components/dashboard/primitives.tsx` | `Panel`, `PanelHeader`, `GroupLabel`, `Band` with `BAND_INSET` and `BAND_RULE`, `Readouts`, `Tag`, `Notice`, `LitStage`, `fieldClasses`, `Figure`, `Toggle`, `SegmentedControl`, `FilterChips` | Tokens | The dashboard, by day and at night |
| `src/components/card-studio/studio-primitives.tsx` | `StudioPanel`, `StudioLabel`, `StudioGroupLabel`, `StudioText`, `StudioSelect`, `UploadButton`, `StudioSlider`, `PunchStrip`, `StudioDisclosure` | Tokens | The Card Studio in the dashboard, and in `/admin`'s catalog editor, where it renders in oat |
| `src/components/onboarding` | `StepShell`, `TopBar`, `StepProgress`, `ChoiceGrid`, `LookGallery`, `LookTile`, `PhoneFrame` with `IslandSwitch`, `useWakeOnChange` | Tokens, plus fixed black and white inside the phone | The wizard. `TopBar` is on sign-in too, and `LookTile` in `/admin` |

The three token-built sets take their button and focus ring from
`src/components/marketing/primitives.tsx`: `ctaClasses` and `focusRing`. The
dashboard never redeclares a button, so an owner meets one button on the
landing page, in the wizard, on sign-in and in the dashboard.

### Buttons
- **Shape:** 8px for the CTA (gently squared, not a pill). The old `ui` Button is a full pill.
- **Primary** (`ctaClasses("primary")`): the `primary` fill with a `primary.on` label in Assistant 700. Large is 16px × 28px at 16px; small is 10px × 16px at 14px. It sits on a 2px seated edge in `primary.shadow`. In oat that is navy on gold, by day white on indigo, and at night white on night violet.
- **Hover / Focus:** hover moves to `primary.hover`, and pressing drops it 1px onto a 1px edge. 150ms on all properties. Focus is `focusRing`: a 2px `primary.text` ring offset 2px in the ground colour. Disabled is 50% opacity.
- **Secondary:** the `surface` ground, a `border-strong` hairline and an `ink` label. Hover firms the hairline to `ink-subtle` and the ground to `background`.
- **On dark, gradient and warm:** `onDark` is the primary fill with a white ring offset on `navy-deep`. `gradient` is `.grad-cta` with a white label and a violet glow that grows on hover. `warm` is the same on `.grad-warm`, for pricing. The trailing arrow mirrors in Hebrew, and on the landing page alone it slides 4px forward on hover (`ctaArrow`).
- **Quiet buttons:** the top bar's language switch and sign-in link, and the wizard's back arrow. No fill, `ink-muted` turning `ink` on hover, 44px tall, 8px corner, `focusRing`.
- **The old pill** (`ui` `Button`): navy with a white label in Assistant 500, at 6px × 12px, 10px × 20px or 14px × 28px. Hover is navy at 90% with a 6px gold halo, and pressing scales it to 95%. Secondary is a navy outline that fills on hover; ghost is a 5% navy wash. It has no `focus-visible` style of its own, so it shows the browser's default outline.

### Chips
- **Tag** (dashboard): a state in one word. Plex Mono 11px, uppercase and tracked, a pill at 4px × 10px. Every tone is a 15% wash of its own colour except `reward`, the one filled tag: gold carrying navy at 10.06:1. A full card is an event, not a state, and the fill keeps REWARD READY apart from VOID, two yellows that meant opposite things at night. Measured here, day on a white panel and night on the panel: neutral 8.80 / 6.97:1, accent 4.89 / 4.67:1, warn 5.59 / 7.96:1, danger 5.01 / 6.39:1, and ok **4.43** / 7.59:1, which fails by day.
- **FilterChips:** 44px pills that show their count in mono. Active is the `primary` fill with a full-opacity `primary.on` count (6.28 / 5.26:1; at 75% the count measured 4.25 / 3.67:1 and was dropped). A bucket that would come back empty is disabled at 40%, except the active one, so a search can never trap you in it. One scrolling row below `sm`, wrapping from `sm`.
- **SegmentedControl:** a `background` well with a 4px inset. Options are 44px with an 8px corner, and the active one takes the `primary` fill. Each option carries `aria-pressed`.
- **IslandSwitch:** the wallet switch, inside the phone's Dynamic Island, on the device you are looking at. A black pill: the selected option is white with black text (21:1), the others white at 60% (7.37:1). The focus ring is white, offset on black, because the shared ring's page-coloured offset would put a halo on the screen.
- **Old `ui` Badge:** Plex Mono 12px, uppercase, a pill. Neutral is slate on a 5% navy wash (5.34:1), warning amber-800 on amber-100 (6.37:1), success emerald-800 on emerald-100 (6.78:1), and gold Deep Gold on a 15% gold wash (**2.70:1**, which fails). These are measured here.

### Cards / Containers
- **Corner Style:** 16px for panels and staged objects, 12px for notices.
- **Background:** `surface` for panels, `background` for the lit stage and for wells inside a panel.
- **Shadow Strategy:** `panel` at rest and `panel-lift` for the band and the lit stage (see Elevation & Depth).
- **Border:** a 1px `border` hairline on every panel. The lit stage takes a 5% black ring instead.
- **Internal Padding:** the caller's, usually 16 to 24px. The studio panel is 16px, then 20px from `sm`; the lit stage is 16px, then 24px.
- **Panel and PanelHeader:** what a panel is, and at the end of the row, the one thing you can do about it. A card title, an optional `ink-muted` hint, and an action. `GroupLabel` is an `ink-subtle` eyebrow above a group of panels, and is deliberately unnumbered: these are places to look, not steps to take.
- **StudioPanel and StudioDisclosure:** a panel that answers one question, with an `h2` in the card-title style and 20px between its controls. The disclosure's header is a 44px button with `aria-expanded`, and its chevron turns 180° in 200ms.
- **LitStage:** a frame built from `theme-lit`'s light tokens, for what must stay light at night. Today it holds the Overview's QR code, the message preview and the referral preview. By day it is simply a white panel.
- **Notice:** something said out loud: 14px text on the state's own fill, with a 16px lucide icon (CircleCheck, Info, TriangleAlert). `warn` carries most of the traffic and is deliberately calm, because a lost race or a card waiting on activation is not the owner's mistake. `danger` is for a request that failed, and it is the only one with `role="alert"`.
- **Old `ui` Card:** white, 16px corner, 24px padding, with a hard-coded navy shadow that deepens on hover.

### Inputs / Fields
- **Style:** `fieldClasses`, and the studio's `controlClasses`, which is the same with 14px sides: a 12px corner, a 1px `border`, the `background` ground (a well on a panel), 10px × 16px, `ink` text and an `ink-subtle` placeholder. Labels are 14px Assistant 500 in `ink`, 6px above. Hints are 12px `ink-subtle`, below.
- **Focus:** hover firms the hairline to `border-strong`. Focus turns the border `primary` and adds a 2px `primary.text` ring offset 2px in the ground colour. At night `color-scheme` on `<html>` makes the native select popup and the caret follow. `StudioText` sets `dir="auto"`, because a business name and a reward are the owner's own words.
- **Error / Disabled:** the token fields carry no error state of their own. The page says it in a `Notice`, and the wizard says it in red-700 (6.47:1) with `role="alert"`. `UploadButton` drops to 60% while busy. The old `ui` Input turns its border red-400 and its message red-600 (4.83:1).
- **Slider** (`.range-accent`, for `StudioSlider` and the wizard): a 44px hit area, a 6px track filled in `primary` up to `--range-progress` (the fill flips in RTL), and a 24px `primary` thumb with a 3px white border and the `lift` shadow. `StudioSlider` shows the value in mono and speaks it through a debounced `aria-live`, so a drag does not read out every tick.
- **Toggle:** a real `role="switch"`. The 44 × 24px track is `primary` when on and ink at 20% when off. A 20px white knob slides toward the end edge in either direction. The label is part of the control, and the row is 44px tall.
- **ChoiceGrid and LookGallery:** native radios, visually hidden, so the group semantics, the arrow keys and the single Tab stop come from the browser. The label is the 44px target, and the focus ring shows through `peer`. `ChoiceGrid` centres one round option per cell (4, 5, 6 or 8 columns) and scales it to 105% on hover. `LookGallery` shows the ready-made looks three across, each a 68px `LookTile` sketch with its name below. Selected is a 2px `ink` ring and a white check disc; unselected is a `rim`/10 hairline.
- **UploadButton:** a real file input inside a 44px label, with a `border-strong` edge, a 32px preview well and a `primary` edge on hover.
- **Old `ui` fields:** `Input` is white with a 15% navy border, navy text, a slate-60% placeholder (**2.56:1**, which fails) and a 30% navy ring on focus, with no offset. `ColorField` is a swatch trigger that opens a 280px popover with `pop-in`. It holds the react-colorful pane restyled by `.pm-colorful` (168px tall, 14px corner, a 14px hue pill and a 22px lens pointer), a hex field, an eyedropper where Chromium has one, a shuffle, a nine-column swatch board and recent colours. Its 11px section labels measure **3.08:1**. `PlacesAutocomplete` drops a white listbox with a 12px corner.

### Navigation
- **TopBar** (the wizard and sign-in): the logo home, the language switch, and a sign-in link when signed out. 56px tall, 64px from `sm`, and as wide as the panel below it. Nothing else competes with the panel.
- **StepProgress:** a fixed row of 28px slots, each holding a 6px dot (`primary` once done, `border-strong` ahead). One 22px `primary` capsule with a 3px halo travels between slots, on a transform, over 300ms, on the land curve, and leans while it moves (`pill-travel`). Going forward, the dot it leaves plays `stamp-in`; going back gets no ceremony. Completed steps are links, with a 44px hit area drawn by an empty pseudo-element, and `aria-live` announces each step.
- **StepShell:** one wizard screen. The back arrow sits beside the title in a 44px box, pulled out so it does not indent the heading. The `.t-h3` title takes focus on mount. Then come the choice, the error, one full-width primary CTA with a trailing arrow, and a footer for secondary links.
- The dashboard's rail (`DashboardNav`) is outside the four sets and is not recorded here.

### Signature components
- **The brief band** (`Band`): the one loud surface. `.grad-brief` with a 16px corner and `panel-lift`, fading in. It is dark in both themes, because a brief is a brief whatever the theme. Only white and On-Band Lilac are set on it, and no alpha text. `BAND_INSET` pads it 20px, then 28px by 24px from `sm`. `BAND_RULE` is a white/15 hairline that keeps the readouts with the headline above them.
- **Readouts:** an instrument strip, not a row of stat cards. Each figure has a 3px × 28px rule in one of five colours, a 10px mono label and a 24px Rubik figure. The colours mean the same thing everywhere: neutral is the roster, emerald is growth, violet is activity, gold is the reward, and amber is something slipping. On the band every figure is white and the rules take fixed lights (white/45, #6ee7b7, #a78bfa, #ffd875, #fcd34d). On a panel a figure takes its colour only when it means "go and do something". By day / at night: ok 5.48 / 10.77:1, `primary.text` 6.14 / 6.03:1, reward 6.58 / 11.98:1, warn 7.09 / 11.38:1.
- **PunchStrip:** the stamp count drawn as the strip on the card, in the card's own colours. It is a pointer shortcut to the slider beneath it: `aria-hidden`, out of the tab order, and it never takes focus. The dots share the width, up to 36px each, and never wrap. A dot that fills plays `stamp-in`, the only motion in the studio.
- **PhoneFrame:** the one drawn device. A `navy-deep` bezel, cropped by its container, over a wallpaper tinted from the card's own colours. When a choice changes the card the screen brightens (white at 9%, 100ms in and 600ms out, held 700ms), the way a phone wakes when a pass updates. It never fires under reduced motion.
- **The pass previews** (`AppleCardPreview`, `GoogleCardPreview`, `StampGrid`, `PassBarcode`) are not part of any set. They mirror what the two wallets render, and they are staged, framed and animated in their 300px slot, never redrawn.

### Motion

Two curves carry meaning. **Words rise** on `cubic-bezier(0.16, 1, 0.3, 1)`,
a long settle with no overshoot. **Objects land** on
`cubic-bezier(0.34, 1.4, 0.64, 1)`, which overshoots and comes back the way a
rubber stamp presses down and lifts. That is the product's one gesture.

| Keyframe | Duration and curve | What it is |
|---|---|---|
| `fade-up` | 0.7s, rise | A scroll reveal: 24px up into place |
| `draw-rule` | 0.55s, rise | The section opener's bar drawing out from the first word |
| `scale-in` | 0.8s, rise | An object arriving: from 92% and −4° |
| `sheet-up` | 0.22s, rise | A bottom sheet under the thumb: 16px |
| `pop-in` | 0.16s, rise | A popover: 4px and 96% |
| `stamp-in` | 0.34s, land | A stamp landing: from 170% down past 94% to 100%. It fires once |
| `pill-travel` | 0.34s, land | The progress pill stretching to 130% mid-journey |
| `fade-in` | 0.7s, ease-out | The brief band and the activity chart appearing |
| `float` | 5s, ease-in-out, looping | A gentle 10px bob, in the landing hero |
| `bloom-drift` | 14s, ease-in-out, looping | The hero's light breathing. Slow enough to read as atmosphere |
| `scan-sweep` | 2.4s, (0.4, 0, 0.6, 1), looping | The scanner's moving line: status, not decoration, because a still counter looks like a frozen camera |

Transitions: the CTA 150ms, the old Button 200ms, a resting card's lift
(`cardHover`, 4px up, firmer hairline, `lift`) 200ms, chevrons 200ms.

**Reduced motion today means none.** Every keyframe utility above is set to
`animation: none` under `prefers-reduced-motion: reduce`. Transitions opt out
at the call site with `motion-reduce:transition-none`. The phone's wake never
fires, and smooth scrolling is on only without the preference. CLAUDE.md now
asks for gentler, not none, which this code does not yet meet.

### Named Rules

**The One Loud Surface Rule.** The brief band is the only saturated surface in the dashboard, and only the Overview's brief and the Messages page stand on it. A second loud thing is no loud thing.

**The Two Curves Rule.** Words rise on (0.16, 1, 0.3, 1). Objects land on (0.34, 1.4, 0.64, 1). An element's curve says which of the two it is.

## Do's and Don'ts

"Carries over" marks a rule CLAUDE.md requires of the redesign as well. The
rest describe today's system and end with it.

### Do:
- **Do** measure every text colour against every ground it can sit on, and write the ratio beside it, quoting the tighter one. All text meets AA. (Carries over.)
- **Do** use logical properties only (`ms-` `me-` `ps-` `pe-` `start-` `end-` `text-start` `text-end`), and give anything that cannot be logical an `rtl:` sign flip. (Carries over.)
- **Do** keep 44px targets everywhere a thumb goes, even under a 6px mark. (Carries over.)
- **Do** put `focusRing` on every control: 2px `primary.text`, offset 2px in the ground colour. (Carries over.)
- **Do** set running text in a face that has Hebrew, and keep Plex Mono to digits, pass field labels and tags, isolated left to right. (Carries over.)
- **Do** stage `AppleCardPreview`, `GoogleCardPreview`, `StampGrid` and `PassBarcode` in their 300px slot. Frame and animate them; never redraw them. (Carries over.)
- **Do** give every fill its own text token: `primary.on` on `primary`, and `primary.text` for accent-coloured text.
- **Do** let what the owner hands to someone keep its own light at night: a QR code inside `theme-lit`, and a printed sheet in the owner's colours with a `rim` edge.
- **Do** say a state in words and a small mono `Tag`, with colour as the second signal, never the only one.
- **Do** spend the two curves for what they mean: words rise on (0.16, 1, 0.3, 1), objects land on (0.34, 1.4, 0.64, 1).

### Don't:
- **Don't** set text in gold #f0b429 (1.86:1 on white) or in Deep Gold #c88a11 (2.96:1). Gold is a fill that carries navy.
- **Don't** put alpha text on a gradient. It composites differently at each end and cannot be measured once.
- **Don't** reach for hand-picked Tailwind pairs like `bg-amber-50 text-amber-800` for a state. They vanish on the night ground; `ok`, `warn`, `danger` and `reward` don't.
- **Don't** add a second loud surface to the dashboard. The brief band is on the Overview and Messages, and nowhere else.
- **Don't** spend `rim` at /12. It compiles to nothing; spend it at /10.
- **Don't** use `ml-` `mr-` `pl-` `pr-` `text-left` or `text-right`. (Carries over.)
- **Don't** redraw the pass previews. (Carries over.)
- **Don't** build on `components/ui`. It is hard-coded navy, ignores the night theme, has no focus style on its Button, and holds three of the four known AA failures. Phase 10 deletes it.
- **Don't** treat today's violet, its gradients or the oat and gold palette as settled. Phase 1 chooses the brand colour, with violet as one of three candidates (guide D4).
- **Don't** take today's reduced-motion handling as the standard. It switches every keyframe off; the rule is gentler, not none. (Carries over as a rule; today's code does not meet it.)
