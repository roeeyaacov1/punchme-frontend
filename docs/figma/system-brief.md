# PunchMe dashboard — internal design-system reference (NOT for the designer)

> **Internal only.** Roee decided (24 Aug 2026) the redesign carries no design direction —
> the designer owns all visual decisions. The designer receives `product-brief.md` (facts
> only) instead of this file. This document remains as the record of the SHIPPED design
> system — its measured tokens and rules — needed on the implementation side when the new
> design's values are minted into the existing token mechanism.

## Product context (paste-ready, opens Prompt 0)

PunchMe is a digital loyalty punch card for small Israeli businesses — a barber, a café owner,
a personal trainer. The customer scans a QR code once and a punch card lands in their Apple or
Google Wallet; it stamps itself on every visit. The dashboard is where the owner scans customer
codes, sees who came back, and sends messages. Owners are not technical and have been burned by
software that promised customers and delivered a monthly charge. The brand voice is **candour**:
plain language, honest numbers, real sources, nothing inflated. ₪59/month, free until activated.

## Tokens (the design system's memory)

All colors are CSS variables in RGB-channel form (`--c-x: R G B`) so alpha keeps working.
Two full sets: light and night. Dark mode is a token flip, never a redesign.

### Light (the dashboard's "raised" light theme: wash ground, white panels)

| Token | Value | Hex | Measured |
|---|---|---|---|
| `--c-background` | 245 246 254 | `#f5f6fe` | wash ground |
| `--c-surface` | 255 255 255 | `#ffffff` | panel |
| `--c-ink` | 17 17 17 | `#111111` | 17.5:1 on wash |
| `--c-ink-muted` | 65 65 65 | `#414141` | 9.48:1 |
| `--c-ink-subtle` | 85 85 95 | `#55555f` | 6.84:1 |
| `--c-primary` | 91 65 230 | `#5b41e6` | indigo fill; carries **white** 6.28:1 |
| `--c-primary-hover` | 79 56 209 | `#4f38d1` | white 7.45:1 |
| `--c-primary-text` | 104 61 232 | `#683de8` | accent as text: 5.70:1 on wash |
| `--c-primary-on` | 255 255 255 | `#ffffff` | label on primary fill |
| `--c-border` | 226 227 246 | `#e2e3f6` | |
| `--c-border-strong` | 202 204 238 | `#caccee` | |
| `--c-navy-deep` | 15 15 35 | `#0f0f23` | the dark band ground |
| `--c-rim` | 0 0 0 | | always spent at /10 |

### Night (`.theme-night` — the dashboard after dark)

| Token | Value | Hex | Measured |
|---|---|---|---|
| `--c-background` | 15 15 35 | `#0f0f23` | night ground |
| `--c-surface` | 29 29 53 | `#1d1d35` | panel |
| `--c-ink` | 242 241 251 | `#f2f1fb` | 16.85:1 on night |
| `--c-ink-muted` | 185 183 212 | `#b9b7d4` | 9.69:1 |
| `--c-ink-subtle` | 154 152 186 | `#9a98ba` | 6.81:1 |
| `--c-primary` | 109 77 242 | `#6d4df2` | violet fill; white 5.26:1 |
| `--c-primary-hover` | 122 92 244 | `#7a5cf4` | white 4.50:1 — the floor, and it holds |
| `--c-primary-text` | 167 139 250 | `#a78bfa` | 6.93:1 on night |
| `--c-primary-on` | 255 255 255 | | |
| `--c-border` | 44 44 72 | `#2c2c48` | |
| `--c-border-strong` | 61 61 97 | `#3d3d61` | |
| `--c-navy-deep` | 8 8 26 | `#08081a` | one step under the ground, for inset wells |
| `--c-rim` | 255 255 255 | | |

### State + reward hues (both themes)

| Token | Light | Night | Meaning |
|---|---|---|---|
| `ok` / `ok-bg` | `#047857` / `#ecfdf5` | `#6ee7b7` / `#10261f` | success, confirmations |
| `warn` / `warn-bg` | `#92400e` / `#fffbeb` | `#fcd34d` / `#2b2113` | attention, never alarm |
| `danger` / `danger-bg` | `#b91c1c` / `#fef2f2` | `#fca5a5` / `#2b1418` | failed requests ONLY |
| `reward` / `reward-bg` | `#845209` / `#fefaec` | `#ffd875` / `#2d2412` | the thing being collected toward |

**Gold `#f0b429` is the reward fill** — the product's ONE filled pill — and always carries navy
`#0e1120` text (10.06:1 both themes). Never white on gold (2.96:1, fails).

### The five semantic hues (mean the same thing on every screen)

roster = neutral ink · growth = emerald · activity = violet · reward = gold · risk = amber.
Category on a readout is a 3px rule above the label, not a colored background.

## Type

- **Rubik** — headings/display. **Assistant** — body. Both Google Fonts, Hebrew + Latin in one
  family: the Hebrew site is *set*, not falling back to an OS face.
- **IBM Plex Mono** — digits, serials, timestamps, readout labels. **No Hebrew glyphs — never
  running text.**
- RTL typography: no letter-spacing on Hebrew (negative tracking → 0, eyebrow tracking drops
  .14em → .04em), leading loosens, `uppercase` is a no-op (Hebrew has no case) — small-mono-caps
  treatments must earn their look another way in Hebrew.
- Figures/money need bidi isolation ("₪600" reorders against a Hebrew label otherwise).

## Shell geometry

- Desktop: rail 17rem (on the **right** in Hebrew) + content max-w ~64rem, padding 16→24→32px.
- Mobile: slim masthead (identity only — every page owns its `<h1>`), fixed bottom bar with
  **exactly five items** (4 counter tabs + More; five is a hard ceiling — thumb reach), tabs
  min 56px, safe-area padding; More opens a bottom sheet (rounded-top, drag handle, ≤85vh).
- Identity chip (owner's real card colors + initial) + account block rendered once, placed
  twice (rail head+foot / masthead+sheet).
- Roles: staff sees only the Counter group (no empty headings); manager adds Marketing+Setup
  minus Team/Billing; owner sees all. Nav item minimum-roles must survive any restructuring.

## Design rules with teeth

1. **One loud surface per screen, maximum.** The dark gradient band — only the Overview brief
   and the Messages audience have earned it. A second loud thing is no loud thing.
2. **A slow week is never red.** Danger is for failed requests, not a quiet Tuesday.
3. **Two easing curves only.** Words rise: `cubic-bezier(0.16,1,0.3,1)`. Objects land (the
   rubber-stamp gesture): `cubic-bezier(0.34,1.4,0.64,1)`. Nothing uses a third.
4. **What the owner reads turns dark; what they hand to someone stays lit.** QR codes, standee
   paper, the wallet pass keep their true colors in dark mode, staged like objects under a lamp.
5. **Charts mirror in Hebrew** — time flows right-to-left, matching reading direction. (The
   shipped `ActivityChart` already does this; it is the considered decision, keep it.)
6. **No invented data.** Realistic small-shop numbers (40 customers, not 4,000), Israeli names,
   empty states designed as carefully as full ones.

## Accessibility floor (pre-existing; must survive)

Skip link · visible focus rings (2px, offset, accent) · 44px minimum touch targets ·
heading hierarchy · full keyboard paths (incl. chart series as one tab stop with arrows) ·
`aria-live` announcements debounced · reduced-motion path for every animation · WCAG AA
for all text, measured against both grounds of both themes.

## Locked objects (design the stage, never the object)

Embedded from code, screenshots in `locked-objects/`:
- The wallet pass preview (Apple + Google layouts) — 300px wide, owner's own colors.
- The card-studio stage (same pass + punch strip).
- The standee sheets (4 designs × 3 paper formats) — printed paper, always light.

## Per-page acceptance checklist (judge every converged page)

- [ ] Hebrew RTL is the primary state; rail right, text right-aligned, directional icons mirrored
- [ ] Numbers / phones / URLs / serials stay LTR inside RTL text
- [ ] Night variant holds: same layout, tokens flipped, AA everywhere, lit objects stay lit
- [ ] 375px works one-handed; touch targets ≥44px; tables collapse to cards
- [ ] All states present: loading · empty-new-business · Free-plan-locked (with billing path) ·
      error · no-results (where applicable)
- [ ] Only `var(--*)` colors (check the generated code — no stray hexes outside tokens.css)
- [ ] One loud surface max; five hues used semantically; reward gold is the only filled pill
- [ ] No invented data, metrics, or features that don't exist in the brief

## Template pick (verified on Figma Community, 24 Aug 2026)

**Primary: Untitled UI — FREE Figma UI kit and design system v2.0**
<https://www.figma.com/community/file/1020079203222518115/untitled-ui-free-figma-ui-kit-and-design-system-v2-0>
Licensed **CC BY 4.0** (derivative commercial use allowed — add an attribution line to this
repo's README when adopted). 346k users, updated ~3 months ago. 420+ desktop **and mobile**
page examples including dashboard and settings pages; neutral, re-tokenizable styling.

**Companion for the anchor pages: Untitled UI data tables kit**
<https://www.figma.com/community/file/1332203037536263387/figma-data-tables-ui-kit-untitled-ui>
Also CC BY 4.0. Use one of its table frames as the third curated attachment (our product is
tables and forms).

**Fallback if RTL fidelity becomes the bottleneck: Material 3 Design Kit** (Google)
<https://www.figma.com/community/file/1035203688168086460/material-3-design-kit>
The only major kit whose design spec formally addresses RTL mirroring; more opinionated look.

**Curated frames to attach to the seed file (duplicate the kit, then pick):** one dashboard/
stat page, one settings/form page, one data-table page. Do not attach the whole kit — Make
imitates a small curated set far better, and strip any stock photography.
