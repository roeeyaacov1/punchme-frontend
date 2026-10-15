# Phase 1 research: three directions

Step 1.1 of `docs/redesign/guide.md`, written 15 Oct 2026 with the
ui-ux-pro-max skill. Its database was generated on 13 Aug 2026. No code
changed. This is raw material for step 1.2, which shapes the visual world, and
step 1.3, which prototypes it. Nothing here is decided, and nothing here was
rendered: the type choices come from the database and from each family's
specification, so 1.3 is where they are first judged in Hebrew.

Read "In short" first. The rest is the evidence.

1. In short
2. How it was made
3. What all three hold constant
4. Direction A: Counter green
5. Direction B: Corner shop
6. Direction C: Quiet violet
7. Side by side
8. Typography
9. Colour
10. UX guidelines worth applying
11. Conflicts
12. Appendix: the contrast script

---

## 1. In short

- **Three directions.**
  - **A, Counter green:** emerald on cool white, one neutral Hebrew sans,
    flat and quick.
  - **B, Corner shop:** brick on warm paper, rounded type, soft and tactile.
  - **C, Quiet violet:** today's violet, unchanged, on warm stone instead of
    lavender, with an editorial Hebrew serif for the pages that persuade and
    IBM Plex for the tool. C is D4's violet candidate.
- **The generator is a weak judge of this product.** Its three runs matched
  Hyperlocal Services, nothing at all (a General fallback), and Luxury/Premium
  Brand. The skill's own rule is to retry once when a result is off-topic, so
  the second and third runs were retried, and matched Bakery/Cafe and Micro
  SaaS. Each direction says what it kept from the generator and what it
  changed.
- **Fonts.** One of the database's 74 pairings sets Hebrew on every face:
  Noto Sans Hebrew with itself. The five runs proposed eight faces, and only
  Varela Round and Fredoka have Hebrew. Every pairing below is rebuilt from the
  61 Google families that carry Hebrew.
- **Colour.** 34 text pairs in the generator's five palettes fail AA, most of
  them fill colours used as text. Asked for a micro SaaS, it reached for
  indigo-500 `#6366f1`, which carries white at only 4.46:1; today's
  `#5b41e6` carries it at 6.28:1. Every text pair in the three directions
  passes, by day and at night.
- **Two failures carry into every direction, today's included,** unless step
  1.4 fixes them. The ok tag measures 4.43:1 (already in DESIGN.md's known
  failures), and border-strong measures 1.42–1.83:1, under the 3:1 a field's
  edge needs. Both have measured fixes below.
- **Hue collisions.** A's brand is the ok colour, hex for hex. B's brand sits
  9° of hue from danger and 9° from warn, at the same lightness. C collides
  with nothing.
- **Conflicts with CLAUDE.md** are listed in section 11. The main ones:
  Latin-only fonts, landing patterns built on logos and testimonials, a map
  and a booking system the product doesn't have, a 24px target where
  CLAUDE.md says 44px, GSAP behind the motion dial, Phosphor as the default
  icons, and advice written for React 19 in a React 18 app.

## 2. How it was made

Every command ran from the repo root as
`py -3 .claude/skills/ui-ux-pro-max/scripts/search.py …`. The script was read
first, as guide §2 asks: it imports only the standard library, makes no
network calls, and writes files only under `--persist`. `--persist` was not
used, nor `--stack shadcn`, nor the `--motion` dial, which attaches GSAP
snippets.

| Run | Query | Matched product | Style | Palette | Type | Landing pattern |
|---|---|---|---|---|---|---|
| G1 | "loyalty punch card small local business barber cafe trainer trust" | Hyperlocal Services | Minimalism & Swiss Style | Location green + action orange | Inter + Inter | Funnel (3-Step Conversion) |
| G2 | "warm neighbourhood shop friendly honest" | None: a General fallback, with its colour from Florist/Plant Shop | Minimalism & Swiss Style | Natural green + floral pink | Varela Round + Nunito Sans | Hero + Features + CTA |
| G3 | "calm premium tool for owners minimal confident" | Luxury/Premium Brand | Liquid Glass | Premium black + gold | Cormorant + Montserrat | Scroll-Triggered Storytelling |
| R2 | Retry of G2: "bakery cafe warm friendly" | Bakery/Cafe | Vibrant & Block-based | Warm brown + cream | Fredoka + Nunito | Funnel (3-Step Conversion) |
| R3 | Retry of G3: "micro saas solo owner calm minimal" | Micro SaaS | Motion-Driven | Indigo primary + emerald CTA | Plus Jakarta Sans + Plus Jakarta Sans | Trust & Authority + Conversion |

All five ran with `--design-system -p "PunchMe" -f markdown`, and again with
`--json` to see which database rows they matched.

The skill says to check the matched category before using a result, and to
retry once with a narrower query when it is empty or off-topic. G2 matched no
product. G3 matched luxury, which is the wrong register for a ₪99 tool sold to
a barber who fears paying for a dashboard. Both were retried. G1 was kept:
"local business" is right, even though its two must-haves, a map and a booking
system, are not this product.

Also run:

- `--domain google-fonts` for each of the eight faces and for "hebrew"; then a
  filter of all 1,934 families by their `hebrew` subset, and of all 74
  pairings in `typography.csv`.
- `--domain style` for "warm tactile friendly paper", "calm minimal
  professional tool" and "accessible high contrast mobile".
- `--domain ux` for the four queries in the prompt. Two answered off-topic and
  were retried once: "mobile dashboard one hand" as "touch target thumb
  reach", and "data table filters" as "search filter list mobile".
- `--domain landing` for "trust sourced evidence transparent", retried as
  "before after transformation pricing" because the first answer leaned on
  logos and reviews.
- `--stack react` for "dialog focus management", "announce dynamic content
  live region", "virtualize long list" and "ref forwardRef component".

Contrast comes from the node script in section 12: WCAG 2 luminance, with
every ratio truncated to two decimals so that a printed 4.50 is at least 4.50.
That is why a few of today's figures read 0.01 below the rounded ones in
DESIGN.md (violet text on white: 6.13 here, 6.14 there). Tags are measured on
a 15% wash of their own colour, the way today's tags are drawn.

## 3. What all three hold constant

So that the prototypes in 1.3 compare one thing at a time:

- **The states.** ok, warn, danger and reward keep today's measured values
  (DESIGN.md, "States"). The one change is the ok tag's text, which moves from
  `#047857` to `#065f46`: 4.43 to 6.21:1 on its wash. Section 9 measures every
  state on every direction's surface.
- **Gold is the reward:** a fill carrying the direction's ink (8.97–9.57:1 by
  day), never a state.
- **The pass previews** stay as they are, in their 300px slot. Each direction
  says how it frames a pass in someone else's colours.
- **Night belongs to the dashboard,** card studio included (CLAUDE.md). The
  night columns below are for the dashboard and nowhere else.
- **Plex Mono** for digits and pass labels and **Roboto** for the Google
  Wallet preview, both as today.
- **What CLAUDE.md requires of every redesign:** logical properties,
  horizontal motion mirrored in Hebrew, reduced motion that is gentler rather
  than off, 44px targets, `focusRing`, the skip link, debounced live regions,
  and every string through `t()`.

Left open for 1.2: each direction's one loud surface. Today it is the brief
band, `.grad-brief`, violet to plum. Whatever replaces it gets measured like
everything else.

## 4. Direction A: Counter green

From G1. Emerald on cool white, a single neutral Hebrew sans, flat hairlines,
quick and exact. The counter as a well-run tool: the scan result is the
loudest thing on the screen because almost nothing else has colour.

**What it kept and changed.**

- Kept: G1's emerald family and its Swiss style.
- The fill moves from `#059669`, which carries white at only 3.76:1 (so G1
  put black on it), to emerald-700 `#047857`, which carries white at 5.48:1.
- G1's mint ground `#ECFDF5` becomes a near-neutral `#f5f7f6`. A whole app on
  mint reads as a health app.
- G1's orange accent `#EA580C` is dropped. It fails as text (3.55:1), and
  beside the reward's gold and the warn amber it would make three warm colours
  with three meanings. The Swiss style itself asks for a single accent.
- G1's must-haves (a map, a booking system) and anti-patterns ("No map",
  "Hidden reviews") don't apply.
- At night the fill turns light, emerald-500 `#10b981`, and its label turns
  dark, `#04130c` (7.50:1), the way oat already puts navy on gold.
- The accent tag sets its text in primary.hover `#065f46` (6.21:1). In
  primary.text it would be today's failing ok tag, 4.43:1.

**Palette.**

| Text | Day | on white | on background `#f5f7f6` | on surface `#ffffff` | Night | on background `#0c1310` | on surface `#151f1a` |
|---|---|---|---|---|---|---|---|
| ink | `#0e1a14` | 17.84 | 16.58 | 17.84 | `#edf3f0` | 16.73 | 15.03 |
| ink-muted | `#3e4c45` | 9.03 | 8.39 | 9.03 | `#aebdb5` | 9.62 | 8.64 |
| ink-subtle | `#56635c` | 6.29 | 5.85 | 6.29 | `#93a39a` | 7.11 | 6.39 |
| primary.text | `#047857` | 5.48 | 5.09 | 5.48 | `#6ee7b7` | 12.34 | 11.08 |

| Fill and label | Day | Ratio | Night | Ratio |
|---|---|---|---|---|
| primary.on on primary | `#ffffff` on `#047857` | 5.48 | `#04130c` on `#10b981` | 7.50 |
| primary.on on primary.hover | `#ffffff` on `#065f46` | 7.68 | `#04130c` on `#34d399` | 9.89 |
| accent tag, on a 15% wash | `#065f46` on `#d9ebe6` | 6.21 | `#6ee7b7` on `#223d32` | 7.73 |
| reward tag, on the gold fill | `#0e1a14` on `#f0b429` | 9.57 | `#0c1310` on `#f0b429` | 10.09 |

| Non-text, 3:1 | Day | on background | on surface | Night | on background | on surface |
|---|---|---|---|---|---|---|
| focus ring (primary.text) | `#047857` | 5.09 | 5.48 | `#6ee7b7` | 12.34 | 11.08 |
| field edge (new token) | `#7f8c85` | 3.25 | 3.50 | `#5d6d64` | 3.43 | 3.08 |
| border-strong (not a field edge) | `#c3ccc7` | 1.52 | 1.64 | `#34433b` | 1.80 | 1.61 |
| border, the hairline | `#dde3e0` | 1.20 | 1.30 | `#24302a` | 1.37 | 1.23 |

**Type.** G1's Inter + Inter has no Hebrew.

- **Noto Sans Hebrew** for everything: the one pairing in the database that
  sets Hebrew on every face, "Hebrew Modern". It is variable in weight
  (100–900) and width (62.5–100), so a headline or a big number can take a
  condensed cut without a second family.
- Load: `family=Noto+Sans+Hebrew:wdth,wght@62.5..100,100..900`.
- Alternative: **Heebo** (Roboto's Latin with Hebrew, 100–900), the more
  expected choice.
- **Watch the frozen Google preview.** Its font stack names Noto Sans Hebrew
  as the Hebrew fallback, and its comment says Hebrew falls through to the
  system face on purpose (`CardPreviews.tsx:120–125`). Loading Noto Sans
  Hebrew for A would change how that preview sets Hebrew on any device that
  doesn't already have the face. That is arguably closer to Android, where
  Noto is the usual Hebrew face, but it changes what a frozen file renders.
  Heebo avoids the question (section 11, item 17).

**Style.** Minimalism & Swiss Style, which G1 and G2 both returned: grid,
white space, one accent, no decoration. Its own defaults (0px corners, no
shadow) are too severe beside a pass with rounded corners, so corners are
6–10px, with a hairline and no shadow at rest.

**Motion: instant and exact.**

- State changes in 120–180ms on ease-out, cubic-bezier(0.23, 1, 0.32, 1).
- No overshoot anywhere except the stamp landing, which is the one gesture.
- On Scan nothing moves except the result arriving and the scanner's sweep
  line, which is status, not decoration.
- Reduced motion: the stamp fades in at its final size, with no travel.

**Anti-patterns.**

- Success that looks like the brand. A's primary is the ok colour exactly
  (`#047857`, hue 166°), and its accent tag is the ok tag. Either success
  becomes the brand's own "yes" (a stamp is a success), with the icon and the
  word carrying the difference, or ok moves.
- The readouts' colour code breaks: emerald means growth today, violet means
  activity, and in A both would be green.
- Mint grounds, and emerald washes on every panel.
- An orange call to action beside the gold reward.
- Swiss severity pushed until a non-technical owner finds it cold: no radius,
  all capitals, no warmth anywhere.

**How it frames a pass.** Neutral greys around a coloured object: almost any
card colour sits well. A green card matches the chrome.

## 5. Direction B: Corner shop

From R2, the retry of the warm-shop angle. Brick on warm paper, rounded
friendly type, soft depth, a little bounce. The neighbourhood shop the owner
already runs.

**What it kept and changed.**

- G2 matched no product and offered a second green, too close to A, so B
  comes from its retry, R2 (Bakery/Cafe): warm brown on cream.
- R2's primary `#92400E` is today's warn colour, hex for hex. B moves to brick
  `#9a3412` (orange-800, white 7.30:1). That only half solves it (see the
  anti-patterns).
- R2's cream `#FEF3C7` is too yellow to live on, and it would swallow the
  reward's gold. The ground becomes paper `#f6f0e6`, close to today's oat
  `#efe9dc`, which only `/admin` wears.
- R2's style, Vibrant & Block-based, wants animated patterns, scroll-snap,
  continuous motion and a "youth-focused" audience. It is replaced by Soft UI
  Evolution from the style database.
- At night the fill is orange-700 `#c2410c` (white 5.17:1). A lighter hover
  would fail with white (`#d4520f`, 4.18:1), so the night hover darkens to
  `#ad3a0a` (6.20:1).

**Palette.**

| Text | Day | on white | on background `#f6f0e6` | on surface `#fffdf9` | Night | on background `#15100c` | on surface `#211a15` |
|---|---|---|---|---|---|---|---|
| ink | `#2a1a12` | 16.73 | 14.76 | 16.47 | `#f6efe8` | 16.58 | 15.06 |
| ink-muted | `#5c4537` | 8.89 | 7.84 | 8.75 | `#c9b9ab` | 9.90 | 9.00 |
| ink-subtle | `#6e584a` | 6.65 | 5.86 | 6.54 | `#ae9d8f` | 7.21 | 6.55 |
| primary.text | `#9a3412` | 7.30 | 6.44 | 7.19 | `#fdba74` | 11.20 | 10.17 |

| Fill and label | Day | Ratio | Night | Ratio |
|---|---|---|---|---|
| primary.on on primary | `#ffffff` on `#9a3412` | 7.30 | `#ffffff` on `#c2410c` | 5.17 |
| primary.on on primary.hover | `#ffffff` on `#7c2d12` | 9.37 | `#ffffff` on `#ad3a0a` | 6.20 |
| accent tag, on a 15% wash | `#9a3412` on `#f0dfd6` | 5.64 | `#fdba74` on `#423223` | 7.27 |
| reward tag, on the gold fill | `#2a1a12` on `#f0b429` | 8.97 | `#15100c` on `#f0b429` | 10.13 |

| Non-text, 3:1 | Day | on background | on surface | Night | on background | on surface |
|---|---|---|---|---|---|---|
| focus ring (primary.text) | `#9a3412` | 6.44 | 7.19 | `#fdba74` | 11.20 | 10.17 |
| field edge (new token) | `#8f7b6b` | 3.55 | 3.96 | `#7a6858` | 3.55 | 3.22 |
| border-strong (not a field edge) | `#d2c4ad` | 1.51 | 1.68 | `#46392c` | 1.69 | 1.53 |
| border, the hairline | `#e6dccb` | 1.19 | 1.33 | `#33291f` | 1.32 | 1.20 |

**Type.** G2 gave Varela Round + Nunito Sans, R2 gave Fredoka + Nunito.
Varela Round and Fredoka have Hebrew; Nunito and Nunito Sans don't.

- **Fredoka** for headings: variable in weight (300–700) and width (75–125),
  so its bold is real.
- **Rubik** for running text (300–900): soft corners that sit beside Fredoka,
  and already loaded today.
- Load: `family=Fredoka:wdth,wght@75..125,300..700&family=Rubik:wght@300..900`.
- Alternative: Varela Round + Rubik, softer still. But Varela Round has one
  weight, 400, so any bold would be synthesised by the browser.
- Watch Fredoka's mood. The database files its pairing under children's
  apps, education and games. Keep it to headings at 500–600, never figures or
  long text.

**Style.** Soft UI Evolution: shadows softer than flat and clearer than
neumorphism, 200–300ms, contrast measured. Its 8–12px corners open to
10–16px, so panels keep today's 16px. On the public pages it borrows
E-Ink/Paper's paper ground, without the grain.

**Motion: tactile, with a little bounce.**

- A pressed button goes to scale(0.97) and comes back on ease-out.
- The stamp lands with today's overshoot, cubic-bezier(0.34, 1.4, 0.64, 1).
- Sheets ride the drawer curve, cubic-bezier(0.32, 0.72, 0, 1), in
  220–260ms.
- Overshoot is spent on objects only, never on text or panels.
- Reduced motion: no overshoot, and a 150ms crossfade.

**Anti-patterns.**

- Brand, danger, warn and reward in one warm band. B's brick (hue 37°) sits 9°
  from danger (28°) and 9° from warn (46°) at the same lightness, with the
  reward at 68–83°. At night its accent text `#fdba74` (66°) sits beside the
  reward's `#ffd875` (88°). If B wins, the states need rethinking. One way:
  warn becomes a neutral notice with its icon (DESIGN.md already calls warn
  "deliberately calm"), and a brand tag is a solid fill, never a wash that
  could pass for warn.
- Cream-yellow grounds (R2's `#FEF3C7`) under a gold reward.
- Paper texture, grain and torn edges. DESIGN.md already keeps them off the
  calculator's receipt.
- A drawn paper punch card competing with the real pass, on a landing page
  whose argument is that paper cards are over.
- Rounded everything, until it reads as a children's app.
- Vibrant & Block-based's animated background patterns and scroll-snap.

**How it frames a pass.** Warm paper flatters warm cards and dulls cool ones,
and a white card on paper looks grey. A black barber's card looks printed,
which may be the point. Check it in 1.3 with a blue card and a neon one.

## 6. Direction C: Quiet violet

From G3 and R3, with D4's violet. Today's violet on warm stone instead of
lavender, an editorial Hebrew serif on the pages that persuade and IBM Plex in
the tool, calm and unhurried. It tests D4's question directly: is the violet
the problem, or the purple-to-blue gradients and the lavender-tinted greys
around it?

**What it kept and changed.**

- Kept: G3's stone neutrals, `#fafaf9` for the ground, `#44403c` for
  ink-muted and `#d6d3d1` for border-strong. Its near-black primary,
  `#1c1917`, becomes the ink.
- G3's gold accent `#A16207` (4.92:1 on white) is today's reward in another
  shade, so the reward stays as it is.
- The primary is today's violet, unchanged: the `#5b41e6` fill (white 6.28:1)
  and `#683de8` text (6.13:1); at night `#6d4df2` and `#a78bfa`.
- G3's Liquid Glass and R3's Motion-Driven are both rejected (anti-patterns).
- R3 matters for another reason. Asked for a micro SaaS, the generator reached
  for indigo-500 `#6366f1`, which fails with white (4.46:1). That is the stock
  look D4 worries about, and today's violet is a different, darker colour.
- Today's own values are measured in section 9, beside these.

**Palette.**

| Text | Day | on white | on background `#fafaf9` | on surface `#ffffff` | Night | on background `#121110` | on surface `#1c1a19` |
|---|---|---|---|---|---|---|---|
| ink | `#1c1917` | 17.48 | 16.74 | 17.48 | `#f5f5f4` | 17.28 | 15.89 |
| ink-muted | `#44403c` | 10.27 | 9.83 | 10.27 | `#c4bfba` | 10.33 | 9.50 |
| ink-subtle | `#57534e` | 7.62 | 7.30 | 7.62 | `#a8a29e` | 7.47 | 6.87 |
| primary.text | `#683de8` | 6.13 | 5.87 | 6.13 | `#a78bfa` | 6.93 | 6.37 |

| Fill and label | Day | Ratio | Night | Ratio |
|---|---|---|---|---|
| primary.on on primary | `#ffffff` on `#5b41e6` | 6.28 | `#ffffff` on `#6d4df2` | 5.25 |
| primary.on on primary.hover | `#ffffff` on `#4f38d1` | 7.44 | `#ffffff` on `#7a5cf4` | 4.50 |
| accent tag, on a 15% wash | `#683de8` on `#e8e2fc` | 4.88 | `#a78bfa` on `#312b3b` | 5.01 |
| reward tag, on the gold fill | `#1c1917` on `#f0b429` | 9.38 | `#121110` on `#f0b429` | 10.11 |

| Non-text, 3:1 | Day | on background | on surface | Night | on background | on surface |
|---|---|---|---|---|---|---|
| focus ring (primary.text) | `#683de8` | 5.87 | 6.13 | `#a78bfa` | 6.93 | 6.37 |
| field edge (new token) | `#8a847f` | 3.53 | 3.69 | `#6e6864` | 3.43 | 3.15 |
| border-strong (not a field edge) | `#d6d3d1` | 1.42 | 1.48 | `#3d3936` | 1.64 | 1.51 |
| border, the hairline | `#e7e5e4` | 1.20 | 1.25 | `#2c2927` | 1.30 | 1.20 |

**Type.** G3 gave Cormorant + Montserrat and R3 gave Plus Jakarta Sans. None
of the three has Hebrew.

- **Frank Ruhl Libre** for display on the landing page and the public pages,
  where the page argues from sources. It is a revival of Frank-Rühl, the
  classic Hebrew text face of books and newspapers, and is variable (300–900).
- **IBM Plex Sans Hebrew** (static, 100–700) for the dashboard, onboarding and
  all running text. It is a sibling of the Plex Mono already used for digits,
  so the figures stop being a guest face.
- It also closes a known gap. In Hebrew, tags and readout labels set in Plex
  Mono fall back to the device's face today (DESIGN.md). In C they can be set
  in Plex Sans Hebrew, with Plex Mono kept for the digits.
- Load: `family=Frank+Ruhl+Libre:wght@500..800&family=IBM+Plex+Sans+Hebrew:wght@400;500;600;700`.
- Alternative: Bellefair, closer to Cormorant's high contrast, but one weight
  only, so display only.
- Watch the register. G3's luxury serif ("fashion brands, luxury e-commerce,
  jewelry") signals "expensive" to an owner afraid of paying for nothing.
  Frank Ruhl Libre reads as print that has been checked, not as luxury. Keep
  it off the dashboard.

**Style.** Two registers.

- **Operate** (dashboard, onboarding, card studio): flat, a hairline and a
  shallow shadow, 8, 12 and 16px corners. Close to today's "objects under a
  lamp", without its gradients.
- **Persuade** (landing, public pages): Editorial Grid, for its type and its
  footnotes, so a source sits with its number like a citation. Not its
  parallax, scroll reveals or page flips. The database keeps it off
  dashboards and apps, which is why it stays on the pages that persuade.

**Motion: calm.**

- Fades and 8px rises on ease-out, 180–240ms.
- Nothing overshoots except the stamp.
- Nothing loops in the dashboard except the scanner's sweep.
- Reduced motion: opacity only.

**Anti-patterns.**

- Purple-to-blue gradients, violet glows, a radial bloom behind the hero: the
  signs of AI-made design that D4 is about. Today's `.grad-cta`, `.grad-band`
  and `.hero-bloom` would go, and the brief band's violet-to-plum would be
  re-made in 1.2.
- Lavender-tinted greys (`#f5f6fe`, `#e2e3f6`) everywhere, until the violet
  tints the whole app.
- Liquid Glass. Lensing and blur cost frames on a cheap phone at a counter;
  the database says it is for Apple's system chrome, not for content; and
  Impeccable bans glass as decoration.
- Motion-Driven: 300–400ms hovers, three to five parallax layers, page
  transitions. The database says not for dashboards or low-power devices.
- Luxury serifs and dark "premium" heroes. G3's own anti-patterns ("Cheap
  visuals", "Fast animations") push the wrong way for a tool used dozens of
  times a day at a counter.

**How it frames a pass.** Warm stone is the most neutral ground of the three.
A violet card matches the chrome.

**The risk.** It is the incumbent, so it may win on familiarity. The test in
1.3 is whether it still reads as AI-made once the gradients and the lavender
are gone.

## 7. Side by side

| | A: Counter green | B: Corner shop | C: Quiet violet |
|---|---|---|---|
| Brand | emerald `#047857` | brick `#9a3412` | violet `#5b41e6`, text `#683de8` |
| Neutrals | cool, near-white | warm paper | warm stone |
| Type | Noto Sans Hebrew | Fredoka + Rubik | Frank Ruhl Libre + IBM Plex Sans Hebrew |
| Corners | 6–10px | 10–16px | 8, 12, 16px |
| Depth | hairline, no shadow | soft shadows | hairline and a shallow shadow |
| Motion | instant, exact | tactile, a little bounce | calm settle |
| Hue collision | brand is ok | brand between danger and warn | none |
| Families to add | 1 | 1 (Rubik stays) | 2 |
| Strongest at | Scan, Customers | onboarding, the landing page | the landing page and its evidence |
| Weakest at | warmth for non-technical owners | the states | proving it isn't the stock SaaS look |

## 8. Typography

### The Hebrew filter

- **61 of the database's 1,934 Google families have a Hebrew subset.** 17 are
  sans serifs, 11 serifs, 4 handwriting, 1 monospace (Cousine; the database
  files Cascadia Code and Cascadia Mono with the sans serifs), and 28 are
  display faces, 26 of them Rubik's novelty cuts.
- **1 of 74 pairings sets Hebrew on every face:** Hebrew Modern, Noto Sans
  Hebrew + Noto Sans Hebrew.
- **6 set Hebrew on one face only:** Poppins + Open Sans, Fredoka + Nunito,
  Varela Round + Nunito Sans, Amatic SC + Cabin, Outfit + Rubik, Rubik +
  Nunito Sans.
- The other 67 have no Hebrew at all.

### Every face the generator proposed

| Face | Run | Hebrew | In the directions |
|---|---|---|---|
| Inter | G1 | No | Noto Sans Hebrew (A) |
| Varela Round | G2 | Yes, 400 only | B's softer alternative |
| Nunito Sans | G2 | No | Rubik (B) |
| Cormorant | G3 | No | Frank Ruhl Libre (C) |
| Montserrat | G3 | No | IBM Plex Sans Hebrew (C) |
| Fredoka | R2 | Yes | Kept (B) |
| Nunito | R2 | No | Rubik (B) |
| Plus Jakarta Sans | R3 | No | IBM Plex Sans Hebrew (C) |

### Hebrew faces worth knowing

From the 61, the ones that can carry an interface or a headline. Weights and
axes are the database's.

| Face | Kind | Weights | Variable | Note |
|---|---|---|---|---|
| Rubik | geometric sans, soft corners | 300–900 | weight | Today's display face |
| Assistant | humanist sans | 200–800 | weight | Today's body face |
| Heebo | neutral sans | 100–900 | weight | Roboto's Latin with Hebrew |
| Noto Sans Hebrew | neutral sans | 100–900 | weight, width 62.5–100 | The database's one full pairing; named in the Google preview's font stack |
| IBM Plex Sans Hebrew | grotesque | 100–700 | no | Plex Mono's sibling |
| Open Sans | humanist sans | 300–800 | weight, width | |
| Arimo | sans, Arial's metrics | 400–700 | weight | |
| Miriam Libre | sans | 400–700 | weight | |
| Alef | sans | 400, 700 | no | |
| Fredoka | rounded | 300–700 | weight, width 75–125 | |
| Varela Round | rounded | 400 | no | One weight |
| Secular One | heavy sans | 400 | no | One weight, display only |
| Frank Ruhl Libre | serif | 300–900 | weight | The classic Hebrew text face, revived |
| Noto Serif Hebrew | serif | 100–900 | weight, width | |
| David Libre | serif | 400, 500, 700 | no | |
| Bellefair | high-contrast serif | 400 | no | One weight, display only |
| Suez One | heavy serif | 400 | no | One weight, display only |
| Karantina | condensed display | 300, 400, 700 | no | Display only |
| Cousine, Cascadia Mono | monospace | 400, 700; 200–700 | no; weight | With Cascadia Code, the only Hebrew monospaces, if a direction wants mono tags in Hebrew too |

### Rules for any pairing

- Plex Mono and Roboto have no Hebrew, so neither sets running text
  (CLAUDE.md). In Hebrew, tags and readout labels need a Hebrew face: A and B
  set them in the body face, C in Plex Sans Hebrew.
- Hebrew has no capitals. `uppercase` does nothing to it and tracking smears
  it, so every direction keeps today's `[dir="rtl"]` reset: tracking to 0,
  looser leading on display sizes.
- A face with one weight (Varela Round, Secular One, Bellefair, Suez One) gets
  a bold synthesised by the browser when asked for 700. Use it at its own
  weight only.
- Figures, phone numbers and emails stay isolated left to right inside Hebrew
  (PRODUCT.md).
- Google Fonts serves each subset behind a `unicode-range`, so a page
  downloads only the subsets its characters need.
- Every URL above adds to today's `IBM+Plex+Mono:wght@400;500` and
  `Roboto:wght@400;500`, with `display=swap`.

## 9. Colour

### The three directions and today, side by side

The three directions' own tables are in sections 4–6. Today's
`.theme-purple.theme-raised` and `+ .theme-night`, measured the same way, for
comparison. Today has no field-edge token; the one in the table is proposed.

| Text | Day | on white | on background `#f5f6fe` | on surface `#ffffff` | Night | on background `#0f0f23` | on surface `#1d1d35` |
|---|---|---|---|---|---|---|---|
| ink | `#111111` | 18.88 | 17.53 | 18.88 | `#f2f1fb` | 16.84 | 14.65 |
| ink-muted | `#414141` | 10.20 | 9.47 | 10.20 | `#b9b7d4` | 9.69 | 8.43 |
| ink-subtle | `#55555f` | 7.36 | 6.83 | 7.36 | `#9a98ba` | 6.80 | 5.92 |
| primary.text | `#683de8` | 6.13 | 5.69 | 6.13 | `#a78bfa` | 6.93 | 6.03 |

| Fill and label | Day | Ratio | Night | Ratio |
|---|---|---|---|---|
| primary.on on primary | `#ffffff` on `#5b41e6` | 6.28 | `#ffffff` on `#6d4df2` | 5.25 |
| primary.on on primary.hover | `#ffffff` on `#4f38d1` | 7.44 | `#ffffff` on `#7a5cf4` | 4.50 |
| accent tag, on a 15% wash | `#683de8` on `#e8e2fc` | 4.88 | `#a78bfa` on `#322e53` | 4.67 |
| reward tag, on the gold fill | `#111111` on `#f0b429` | 10.12 | `#0f0f23` on `#f0b429` | 10.12 |

| Non-text, 3:1 | Day | on background | on surface | Night | on background | on surface |
|---|---|---|---|---|---|---|
| focus ring (primary.text) | `#683de8` | 5.69 | 6.13 | `#a78bfa` | 6.93 | 6.03 |
| field edge (new token) | `#8487ad` | 3.22 | 3.47 | `#6b6b96` | 3.74 | 3.25 |
| border-strong (not a field edge) | `#caccee` | 1.45 | 1.56 | `#3d3d61` | 1.83 | 1.59 |
| border, the hairline | `#e2e3f6` | 1.17 | 1.26 | `#2c2c48` | 1.40 | 1.22 |

### The states on each direction's surface

| By day | Text | On its fill | A surface | B surface | C surface | A tag | B tag | C tag |
|---|---|---|---|---|---|---|---|---|
| ok | `#047857` (tag `#065f46`) | 5.20 on `#ecfdf5` | 5.48 | 5.39 | 5.48 | 6.21 | 6.10 | 6.21 |
| warn | `#92400e` | 6.83 on `#fffbeb` | 7.09 | 6.97 | 7.09 | 5.59 | 5.54 | 5.59 |
| danger | `#b91c1c` | 5.91 on `#fef2f2` | 6.47 | 6.36 | 6.47 | 5.01 | 4.93 | 5.01 |
| reward | `#845209` | 6.29 on `#fefaec` | 6.57 | 6.47 | 6.57 | 5.26 | 5.18 | 5.26 |

| At night | Text | On its fill | A surface | B surface | C surface | A tag | B tag | C tag |
|---|---|---|---|---|---|---|---|---|
| ok | `#6ee7b7` | 10.44 on `#10261f` | 11.08 | 11.26 | 11.37 | 7.73 | 7.94 | 8.01 |
| warn | `#fcd34d` | 10.95 on `#2b2113` | 11.71 | 11.90 | 12.02 | 8.10 | 8.19 | 8.30 |
| danger | `#fca5a5` | 9.09 on `#2b1418` | 8.90 | 9.04 | 9.13 | 6.57 | 6.61 | 6.70 |
| reward | `#ffd875` | 11.16 on `#2d2412` | 12.33 | 12.53 | 12.65 | 8.40 | 8.50 | 8.61 |

Today's ok tag, `#047857` on its 15% wash `#d9ebe6`: 4.43. With `#065f46`: 6.21.

### Field edges

border-strong, today's heavier hairline, measures 1.42–1.83:1 on its grounds
in every direction and in today's scopes. WCAG's non-text contrast criterion
(1.4.11, AA) asks 3:1 when the edge is what identifies a field. So each
direction carries a new **field edge** token, at 3.08–3.96:1, for inputs,
selects and the slider's track, and border-strong stays for section edges and
totals. Today's fields are wells in the background colour with a hairline
round them, so they need the same fix whichever direction wins.

### Hue collisions

A contrast ratio measures the distance between two lightnesses, not two hues,
so it can't say whether a brand colour will be read as a state. OKLCH hue and
lightness can.

| Colour | Hex | OKLCH lightness | Chroma | Hue |
|---|---|---|---|---|
| ok (today, every direction) | `#047857` | 0.51 | 0.105 | 166° |
| A primary | `#047857` | 0.51 | 0.105 | 166° |
| danger (today) | `#b91c1c` | 0.51 | 0.190 | 28° |
| B primary | `#9a3412` | 0.47 | 0.143 | 37° |
| warn (today) | `#92400e` | 0.47 | 0.125 | 46° |
| reward text (today) | `#845209` | 0.48 | 0.102 | 68° |
| reward gold (today) | `#f0b429` | 0.80 | 0.156 | 83° |
| C primary | `#5b41e6` | 0.51 | 0.234 | 281° |
| C primary.text | `#683de8` | 0.52 | 0.239 | 286° |
| R3 primary (indigo-500) | `#6366f1` | 0.59 | 0.204 | 277° |

- **A:** the brand is the ok colour.
- **B:** the brand is 9° from danger and 9° from warn, at the same lightness.
- **C:** the nearest state hue is danger, 107° away.

### What the generator printed, measured

As printed, before any change. Card is `#FFFFFF` in all five runs, so "White"
is also "on the card". G1 and R3 put a black label on their primary because
white fails there: 3.76:1 on `#059669` and 4.46:1 on `#6366F1`. White would
also fail on G1's orange (3.55:1) and G2's pink (3.52:1).

| G1 | Hex | White | Background `#ECFDF5` | Muted `#E8F1F3` |
|---|---|---|---|---|
| Foreground | `#064E3B` | 9.71 | 9.22 | 8.47 |
| Muted foreground | `#475569` | 7.57 | 7.19 | 6.60 |
| Primary as text | `#059669` | **3.76** large only | **3.57** large only | **3.28** large only |
| Secondary as text | `#10B981` | **2.53** ✗ | **2.40** ✗ | **2.21** ✗ |
| Accent as text | `#EA580C` | **3.55** large only | **3.37** large only | **3.10** large only |
| Destructive as text | `#DC2626` | 4.82 | 4.58 | **4.21** large only |
| Focus ring (3:1) | `#059669` | 3.76 | 3.57 | |

Labels on their fills: `#000000` on primary `#059669`, 5.57; `#0F172A` on secondary `#10B981`, 7.03; `#000000` on accent `#EA580C`, 5.89; `#FFFFFF` on destructive `#DC2626`, 4.82.

| G2 | Hex | White | Background `#F0FDF4` | Muted `#E8F0F1` |
|---|---|---|---|---|
| Foreground | `#14532D` | 9.11 | 8.70 | 7.88 |
| Muted foreground | `#475569` | 7.57 | 7.23 | 6.55 |
| Primary as text | `#15803D` | 5.01 | 4.79 | **4.33** large only |
| Secondary as text | `#22C55E` | **2.27** ✗ | **2.17** ✗ | **1.97** ✗ |
| Accent as text | `#EC4899` | **3.52** large only | **3.36** large only | **3.05** large only |
| Destructive as text | `#DC2626` | 4.82 | 4.61 | **4.17** large only |
| Focus ring (3:1) | `#15803D` | 5.01 | 4.79 | |

Labels on their fills: `#FFFFFF` on primary `#15803D`, 5.01; `#0F172A` on secondary `#22C55E`, 7.83; `#000000` on accent `#EC4899`, 5.95; `#FFFFFF` on destructive `#DC2626`, 4.82.

| G3 | Hex | White | Background `#FAFAF9` | Muted `#E8ECF0` |
|---|---|---|---|---|
| Foreground | `#0C0A09` | 19.75 | 18.91 | 16.63 |
| Muted foreground | `#475569` | 7.57 | 7.25 | 6.38 |
| Primary as text | `#1C1917` | 17.48 | 16.74 | 14.72 |
| Secondary as text | `#44403C` | 10.27 | 9.83 | 8.65 |
| Accent as text | `#A16207` | 4.92 | 4.71 | **4.14** large only |
| Destructive as text | `#DC2626` | 4.82 | 4.62 | **4.06** large only |
| Focus ring (3:1) | `#1C1917` | 17.48 | 16.74 | |

Labels on their fills: `#FFFFFF` on primary `#1C1917`, 17.48; `#FFFFFF` on secondary `#44403C`, 10.27; `#FFFFFF` on accent `#A16207`, 4.92; `#FFFFFF` on destructive `#DC2626`, 4.82.

| R2 | Hex | White | Background `#FEF3C7` | Muted `#EDEEF0` |
|---|---|---|---|---|
| Foreground | `#78350F` | 9.07 | 8.14 | 7.81 |
| Muted foreground | `#475569` | 7.57 | 6.80 | 6.52 |
| Primary as text | `#92400E` | 7.09 | 6.36 | 6.10 |
| Secondary as text | `#B45309` | 5.02 | 4.50 | **4.32** large only |
| Accent as text | `#92400E` | 7.09 | 6.36 | 6.10 |
| Destructive as text | `#DC2626` | 4.82 | **4.33** large only | **4.15** large only |
| Focus ring (3:1) | `#92400E` | 7.09 | 6.36 | |

Labels on their fills: `#FFFFFF` on primary `#92400E`, 7.09; `#FFFFFF` on secondary `#B45309`, 5.02; `#FFFFFF` on accent `#92400E`, 7.09; `#FFFFFF` on destructive `#DC2626`, 4.82.

| R3 | Hex | White | Background `#F5F3FF` | Muted `#EBEFF9` |
|---|---|---|---|---|
| Foreground | `#1E1B4B` | 15.98 | 14.57 | 13.89 |
| Muted foreground | `#475569` | 7.57 | 6.90 | 6.58 |
| Primary as text | `#6366F1` | **4.46** large only | **4.07** large only | **3.88** large only |
| Secondary as text | `#818CF8` | **2.98** ✗ | **2.71** ✗ | **2.59** ✗ |
| Accent as text | `#059669` | **3.76** large only | **3.43** large only | **3.27** large only |
| Destructive as text | `#DC2626` | 4.82 | **4.40** large only | **4.19** large only |
| Focus ring (3:1) | `#6366F1` | 4.46 | 4.07 | |

Labels on their fills: `#000000` on primary `#6366F1`, 4.70; `#0F172A` on secondary `#818CF8`, 5.98; `#000000` on accent `#059669`, 5.57; `#FFFFFF` on destructive `#DC2626`, 4.82.

## 10. UX guidelines worth applying

Each row names the database guideline and its severity, says what it means
here, and tags the pages.

Page tags: **Shell** (the layout, the navigation, the phone bar, the tour),
**Scan**, **Overview**, **Customers**, **Activity**, **Studio** (the card
studio), **Onboarding**, **Messages** (with New broadcast and the automation
editor), **Referrals**, **Standee**, **Team**, **Billing** (with the checkout
return pages), **Public** (`/login`, `/invite`, `/join`, `/c`, `/p`) and
**Landing**.

### Touch and reach

From "mobile dashboard one hand" and its retry, "touch target thumb reach".

| # | Guideline | What it means here | Pages |
|---|---|---|---|
| U1 | Touch Target Size, Touch Friendly (High) | 44px for every control, even under a 6px mark. The database's web minimum, 24px (WCAG 2.2), is lower; CLAUDE.md's 44px wins | All |
| U2 | Touch Spacing (Medium) | At least 8px between neighbouring targets: the phone bar, filter chips, the +1/−1 stamp buttons, the scan result's actions, the island switch | Shell, Scan, Customers, Studio, Onboarding |
| U3 | Mobile Keyboards (Medium) | `inputmode="numeric"` for a typed card code and the SMS code, with `autocomplete="one-time-code"` on the code; `type="tel"` for the mobile number; numeric for the calculator's typed figures | Scan, Public, Landing |
| U4 | Pull to Refresh (Low) | `overscroll-behavior-y: contain` where an accidental reload would lose work or the camera | Scan, Studio, Messages |
| U5 | Mobile First, Viewport Meta (High) | Already true. The viewport never disables zoom | All |

### Lists, search and filters

From "data table filters" and its retry, "search filter list mobile", plus the
React stack.

| # | Guideline | What it means here | Pages |
|---|---|---|---|
| U6 | Table Handling (Medium) | No wide tables on a phone; rows become list rows | Customers, Activity, Team, Referrals, Messages |
| U7 | Compact Label Overflow (High) | A tag stays on one line. A long value (a Hebrew name, a reward) shrinks with `min-width: 0` and can be read whole by tap and keyboard, not by a hover title alone | Customers, Activity, Overview, Shell, Referrals |
| U8 | Chip Collection Reflow (High) | Wrap the filter chips, or give the hidden ones an operable "+n". Today's FilterChips does the opposite below 640px: one scrolling row, a half-cut chip as the hint. Phase 5 decides | Customers, Activity |
| U9 | No Results (Medium) | A search or filter that matches nothing says so and offers the way out: clear the search, show everyone | Customers, Activity, Referrals |
| U10 | Autocomplete (Medium); React "Debounce rapid input changes" | The whole list is already in the browser, so results can narrow as the owner types. Debounce the filtering, not the typing | Customers, Activity |
| U11 | Virtualize long lists (High, React) | Up to 5,000 customers (25 pages of 200). The database names react-window or react-virtual, and either is a new dependency, so ask first (CLAUDE.md). Measure on a mid-range phone before reaching for one; paging or a hand-rolled window may do | Customers, Activity |

### Forms and flows

From "multi-step onboarding", with Redundant Entry from the first query.

| # | Guideline | What it means here | Pages |
|---|---|---|---|
| U12 | Progress Indicators (Medium) | Keep the wizard's progress row, and let a screen reader hear the step number and its name | Onboarding |
| U13 | User Freedom (Medium) | Every step can go back. "Skip for now" on the wallet step and "Not now" on billing stay as visible as the main action. The tour can be skipped | Onboarding, Shell |
| U14 | Redundant Entry (Medium, WCAG 2.2 A) | Never ask twice. The draft already holds the business name and phone, and `/login` reads it, so nothing after the design steps asks for them again. `/join` asks only for the mobile number and the code; name and birthday stay optional | Onboarding, Public |
| U15 | Heading Line Balance (Medium) | `text-wrap: balance` on short headings, as an extra the page doesn't depend on. Check the natural wrap in Hebrew; no hard `<br>` and no chains of non-breaking spaces | Onboarding, Landing, Public, Shell |
| U16 | The skill's form rules: `inline-validation`, `error-placement`, `autofill-support`, `focus-management` | Validate on blur. Put the error under its field, tied by `aria-describedby`. `autocomplete` on email, password, phone and the code. After a failed submit, focus the first invalid field | Onboarding, Public, Messages, Team |

### States and feedback

From "empty states", plus the React stack.

| # | Guideline | What it means here | Pages |
|---|---|---|---|
| U17 | Empty States (Medium) | A message and one action, never a blank page: no customers yet (the join QR, the standee), no activity, no broadcasts, no rules, no referrals, a team of one. A free business is a different case and says why: Pro only, and how to activate | Overview, Customers, Activity, Messages, Referrals, Team |
| U18 | Loading States (High) | Skeletons the size of what is coming, so nothing jumps when it lands. No indicator at all for work that finishes almost at once | Overview, Customers, Activity, Messages, Studio, Billing |
| U19 | Active States (Medium) | A visible press within 100ms: scale(0.97), or the hover fill. It matters most on Scan, used dozens of times a day | All |
| U20 | Disabled States (Medium) | Reduced opacity, the attribute, and the reason when it isn't obvious: the stamp buttons when `VITE_STAMP_ADJUST_ENABLED` is off, a broadcast over the cap with its next allowed time, a filter bucket that would come back empty | Customers, Messages, Activity |
| U21 | Hover States (Medium) | Hover feedback only where a pointer hovers, `@media (hover: hover) and (pointer: fine)` (guide §2), so a phone keeps no sticky hover | All |
| U22 | Focus States (High); React "Manage focus properly" (High) | A visible ring on every control, inside dialogs and sheets too. A dialog traps focus and gives it back on close. This is the kit's dialog and sheet in 1.4 | Shell, Customers, Messages, Team, Studio, Landing |
| U23 | Announce dynamic content (Medium, React) | One polite live region per change, debounced as today: the scan result (which must also be impossible to miss on screen), the studio's sliders, the calculator, a broadcast sending, the wait on `/billing/success` | Scan, Studio, Landing, Messages, Billing |

### The landing page

From "trust sourced evidence transparent" and its retry, "before after
transformation pricing". All three patterns are useful for their structure and
their accessibility rules, and each asks for evidence PunchMe doesn't have.

| # | Pattern | Keep | Drop | Pages |
|---|---|---|---|---|
| U24 | Trust & Authority + Conversion | Mission, proof, solution, one clear path. Transparent pricing, a low-friction form. Carousels that stop on focus, hover and reduced motion, with keyboard previous and next | Proof by logos, certifications, case studies and security badges. The proof is the three figures in `sources.ts` | Landing |
| U25 | Before-After Transformation | The page's own argument: a paper card, then a pass in the wallet. If it becomes a slider, arrow buttons and keyboard steps; under reduced motion, the after state with no reveal | "Real results, specific metrics, guarantee offer": no results data exists, and there is no guarantee | Landing |
| U26 | Pricing-Focused Landing | The real monthly price and what is free, the difference between the two plans, the objections answered in the FAQ | "Popular plan highlighted" and three tiers. There are two plans, and "Most popular" went in D2 | Landing, Billing, Onboarding |

### Not applied

- Hero + Testimonials + CTA, and Product Review/Ratings: no testimonials or
  ratings exist (D2).
- Bulk Actions (multi-select and bulk edit): no bulk call exists, and calls
  are fixed.
- Auto-Play Video: there is no video.
- Smooth Scroll, as the database writes it (on `html`, always): only without
  reduced motion, as today.
- Funnel (3-Step Conversion)'s red, orange and green step colours: those
  colours are states here.

### By page

For each phase's step A.

| Page | Guidelines |
|---|---|
| Shell | U1, U2, U5, U7, U13, U15, U19, U21, U22 |
| Scan | U1, U2, U3, U4, U5, U19, U21, U23 |
| Overview | U1, U5, U7, U17, U18, U19, U21 |
| Customers | U1, U2, U5, U6, U7, U8, U9, U10, U11, U17, U18, U19, U20, U21, U22 |
| Activity | U1, U5, U6, U7, U8, U9, U10, U11, U17, U18, U19, U20, U21 |
| Studio | U1, U2, U4, U5, U18, U19, U21, U22, U23 |
| Onboarding | U1, U2, U5, U12, U13, U14, U15, U16, U19, U21, U26 |
| Messages | U1, U4, U5, U6, U16, U17, U18, U19, U20, U21, U22, U23 |
| Referrals | U1, U5, U6, U7, U9, U17, U19, U21 |
| Standee | U1, U5, U19, U21 |
| Team | U1, U5, U6, U16, U17, U19, U21, U22 |
| Billing | U1, U5, U18, U19, U21, U23, U26 |
| Public | U1, U3, U5, U14, U15, U16, U19, U21 |
| Landing | U1, U3, U5, U15, U19, U21, U22, U23, U24, U25, U26 |

## 11. Conflicts

### With CLAUDE.md

| # | What the skill offered | Where | What CLAUDE.md says | Here |
|---|---|---|---|---|
| 1 | Latin-only faces: Inter, Nunito Sans, Nunito, Cormorant, Montserrat, Plus Jakarta Sans | G1, G2, G3, R2, R3 | Fonts change only to faces that set Hebrew | Replaced in every direction (section 8) |
| 2 | Proof by logos, certifications, case studies and security badges; testimonial carousels; ratings | Trust & Authority + Conversion (R3 and the landing search), Hero + Testimonials, Product Review/Ratings | No fake logo walls, invented testimonials or unsourced metrics | Structure and accessibility rules only (U24) |
| 3 | "Popular plan highlighted" | Pricing-Focused Landing, Pricing Page + CTA | No claims of popularity; "Most popular" was removed (D2) | Dropped (U26) |
| 4 | "Real results. Specific metrics. Guarantee offer." | Before-After Transformation | A figure only with a source in `sources.ts` | Dropped (U25) |
| 5 | "Hidden reviews" as an anti-pattern, meaning: show reviews | G1 | A quote only when a real customer said it and agreed | Ignored |
| 6 | A map and a booking system as must-haves | G1 (Hyperlocal Services) | Routes and API calls are fixed | Ignored: not this product |
| 7 | "High-quality imagery" as a must-have | G3 (Luxury/Premium Brand) | No placeholder photos | Ignored: the pass is the image |
| 8 | A 24px minimum target for the web | "touch target thumb reach" | 44px minimum touch targets | 44px (U1) |
| 9 | GSAP snippets through `--motion`; `motion.csv` is all GSAP | The skill's design dials | No GSAP | Never used |
| 10 | Phosphor as the default icon set | SKILL.md, "Icons & Visual Elements" | Icons are lucide-react | lucide-react |
| 11 | react-window or react-virtual for long lists | React stack | No UI dependency without asking | Ask first (U11) |
| 12 | Multi-select and bulk edit | "Bulk Actions" | Routes and API calls are fixed, and no bulk call exists | Not applied |
| 13 | Light and dark for every style ("Light supported, Dark supported") | Every run | Night is for the dashboard only | Night columns are dashboard-only |
| 14 | Parallax in three to five layers, page transitions, animated patterns, fluid morphing | Motion-Driven (R3), Vibrant & Block-based (R2), Liquid Glass (G3) | Animation is CSS first; reduced motion is gentler, not none | Rejected as styles |
| 15 | Smooth scrolling on `html`, always | "Smooth Scroll" (High) | Reduced motion is gentler | Only without the preference, as today |
| 16 | React 19 advice: ref as a prop, no `forwardRef`, Actions, `useEffectEvent`. 59 of the 61 React rows are marked "react 19.2.x" | React stack | The stack is React 18 (`react` 18.3.1 in `package.json`) | The kit in 1.4 uses `forwardRef` |
| 17 | Loading Noto Sans Hebrew, which the frozen Google preview names as its Hebrew fallback | Direction A, from the database's one full pairing | The pass previews are never redrawn | Not a redraw, but it changes what a frozen file renders. Decide in 1.2; Heebo avoids it |

### With the contracts, PRODUCT.md, DESIGN.md and the guide

| What | Where | Why it doesn't fit | Here |
|---|---|---|---|
| Red, orange and green step colours | Funnel (3-Step Conversion), G1 and R2 | Those colours are states here (DESIGN.md): red is a request that failed, green a success | Not used |
| Each chapter its own colour, building intensity, driven by scroll | Scroll-Triggered Storytelling, G3 | `docs/landing-page.md`: reduced motion starts with everything visible; sourced figures never count up | If used at all, the page reads complete with no scroll effects |
| Wrap filter chips instead of one clipped row | Chip Collection Reflow (U8) | Today's FilterChips scroll in one row below 640px (DESIGN.md, a record) | Phase 5 decides |
| Glass as a style | Liquid Glass, G3 | Impeccable's floor bans glass as decoration (guide §2) | Rejected |
| 0px corners, no shadow | Minimalism & Swiss Style, G1 and G2 | DESIGN.md's corner-off rule, though DESIGN.md is a record, not a brief | Softened to 6–10px in A |
| A face filed under children's apps, education and games | Fredoka, R2 | PRODUCT.md: an owner burned before, deciding whether to trust this | Headings only, at 500–600 (B) |
| The luxury register: fashion, luxury e-commerce, jewellery | G3 | PRODUCT.md: an owner afraid of paying for a dashboard they'll never open | C takes G3's neutrals only |

## 12. Appendix: the contrast script

Every ratio in this file came from this script. To check one, save it as
`contrast.mjs` anywhere outside `src/` and run `node contrast.mjs`;
`node contrast.mjs --check` lists only the pairs under the line. It is kept
here, not in the repo, because step 1.1 commits this file alone.

```js
// contrast.mjs: the measurements in docs/redesign/research.md.
// `node contrast.mjs` prints every table; `--check` prints only the pairs
// under the line (text 4.5:1, non-text 3:1); `--json` prints the tables keyed
// by name.
//
// WCAG 2 relative luminance, sRGB channels linearised at 0.04045. Ratios are
// truncated to two decimals, never rounded up, so a printed 4.50 is at least
// 4.50. A "wash" is a colour at 15% over a ground, composited as the browser
// does, which is how today's tags are drawn.

const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const lin = (c) => ((c /= 255) <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const lum = (h) => rgb(h).map(lin).reduce((s, c, i) => s + c * [0.2126, 0.7152, 0.0722][i], 0);
const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};
const wash = (c, g, a = 0.15) =>
  '#' + rgb(c).map((v, i) => Math.round(v * a + rgb(g)[i] * (1 - a)).toString(16).padStart(2, '0')).join('');
const two = (r) => (Math.floor(r * 100) / 100).toFixed(2);
const fails = [];
const cell = (fg, bg, where, ui = false) => {
  const r = ratio(fg, bg);
  const line = ui ? 3 : 4.5;
  if (r >= line) return two(r);
  fails.push(`${where}: ${fg} on ${bg} = ${two(r)}`);
  return !ui && r >= 3 ? `**${two(r)}** large only` : `**${two(r)}** ✗`;
};
const W = '#ffffff';
const code = (h) => '`' + h + '`';

// ── The generator's palettes, exactly as printed ─────────────────────────
const generated = {
  G1: { primary: '#059669', onPrimary: '#000000', secondary: '#10B981', onSecondary: '#0F172A', accent: '#EA580C', onAccent: '#000000', background: '#ECFDF5', foreground: '#064E3B', muted: '#E8F1F3', mutedForeground: '#475569', border: '#A7F3D0', destructive: '#DC2626', onDestructive: '#FFFFFF', ring: '#059669' },
  G2: { primary: '#15803D', onPrimary: '#FFFFFF', secondary: '#22C55E', onSecondary: '#0F172A', accent: '#EC4899', onAccent: '#000000', background: '#F0FDF4', foreground: '#14532D', muted: '#E8F0F1', mutedForeground: '#475569', border: '#BBF7D0', destructive: '#DC2626', onDestructive: '#FFFFFF', ring: '#15803D' },
  G3: { primary: '#1C1917', onPrimary: '#FFFFFF', secondary: '#44403C', onSecondary: '#FFFFFF', accent: '#A16207', onAccent: '#FFFFFF', background: '#FAFAF9', foreground: '#0C0A09', muted: '#E8ECF0', mutedForeground: '#475569', border: '#D6D3D1', destructive: '#DC2626', onDestructive: '#FFFFFF', ring: '#1C1917' },
  R2: { primary: '#92400E', onPrimary: '#FFFFFF', secondary: '#B45309', onSecondary: '#FFFFFF', accent: '#92400E', onAccent: '#FFFFFF', background: '#FEF3C7', foreground: '#78350F', muted: '#EDEEF0', mutedForeground: '#475569', border: '#FDE68A', destructive: '#DC2626', onDestructive: '#FFFFFF', ring: '#92400E' },
  R3: { primary: '#6366F1', onPrimary: '#000000', secondary: '#818CF8', onSecondary: '#0F172A', accent: '#059669', onAccent: '#000000', background: '#F5F3FF', foreground: '#1E1B4B', muted: '#EBEFF9', mutedForeground: '#475569', border: '#E0E7FF', destructive: '#DC2626', onDestructive: '#FFFFFF', ring: '#6366F1' },
};

const generatedTable = (id, p) => {
  const rows = [
    `| ${id} | Hex | White | Background ${code(p.background)} | Muted ${code(p.muted)} |`,
    '|---|---|---|---|---|',
  ];
  for (const [label, key] of [['Foreground', 'foreground'], ['Muted foreground', 'mutedForeground'], ['Primary as text', 'primary'], ['Secondary as text', 'secondary'], ['Accent as text', 'accent'], ['Destructive as text', 'destructive']]) {
    rows.push(`| ${label} | ${code(p[key])} | ${[W, p.background, p.muted].map((g) => cell(p[key], g, `${id} ${label}`)).join(' | ')} |`);
  }
  rows.push(`| Focus ring (3:1) | ${code(p.ring)} | ${cell(p.ring, W, `${id} ring`, true)} | ${cell(p.ring, p.background, `${id} ring`, true)} | |`);
  const fills = [['primary', 'onPrimary'], ['secondary', 'onSecondary'], ['accent', 'onAccent'], ['destructive', 'onDestructive']]
    .map(([f, on]) => `${code(p[on])} on ${f} ${code(p[f])}, ${cell(p[on], p[f], `${id} on ${f}`)}`);
  return `${rows.join('\n')}\n\nLabels on their fills: ${fills.join('; ')}.`;
};

// ── The three directions, in the app's token names ───────────────────────
// States are today's (DESIGN.md "States"), held constant on purpose.
const STATES = {
  day: { ok: ['#047857', '#ecfdf5'], warn: ['#92400e', '#fffbeb'], danger: ['#b91c1c', '#fef2f2'], reward: ['#845209', '#fefaec'] },
  night: { ok: ['#6ee7b7', '#10261f'], warn: ['#fcd34d', '#2b2113'], danger: ['#fca5a5', '#2b1418'], reward: ['#ffd875', '#2d2412'] },
};
const OK_TAG_FIX = '#065f46';
const GOLD = '#f0b429';

const directions = {
  A: {
    day: { background: '#f5f7f6', surface: '#ffffff', ink: '#0e1a14', inkMuted: '#3e4c45', inkSubtle: '#56635c', primary: '#047857', primaryHover: '#065f46', primaryText: '#047857', primaryTag: '#065f46', primaryOn: '#ffffff', border: '#dde3e0', borderStrong: '#c3ccc7', borderField: '#7f8c85' },
    night: { background: '#0c1310', surface: '#151f1a', ink: '#edf3f0', inkMuted: '#aebdb5', inkSubtle: '#93a39a', primary: '#10b981', primaryHover: '#34d399', primaryText: '#6ee7b7', primaryOn: '#04130c', border: '#24302a', borderStrong: '#34433b', borderField: '#5d6d64' },
  },
  B: {
    day: { background: '#f6f0e6', surface: '#fffdf9', ink: '#2a1a12', inkMuted: '#5c4537', inkSubtle: '#6e584a', primary: '#9a3412', primaryHover: '#7c2d12', primaryText: '#9a3412', primaryOn: '#ffffff', border: '#e6dccb', borderStrong: '#d2c4ad', borderField: '#8f7b6b' },
    night: { background: '#15100c', surface: '#211a15', ink: '#f6efe8', inkMuted: '#c9b9ab', inkSubtle: '#ae9d8f', primary: '#c2410c', primaryHover: '#ad3a0a', primaryText: '#fdba74', primaryOn: '#ffffff', border: '#33291f', borderStrong: '#46392c', borderField: '#7a6858' },
  },
  C: {
    day: { background: '#fafaf9', surface: '#ffffff', ink: '#1c1917', inkMuted: '#44403c', inkSubtle: '#57534e', primary: '#5b41e6', primaryHover: '#4f38d1', primaryText: '#683de8', primaryOn: '#ffffff', border: '#e7e5e4', borderStrong: '#d6d3d1', borderField: '#8a847f' },
    night: { background: '#121110', surface: '#1c1a19', ink: '#f5f5f4', inkMuted: '#c4bfba', inkSubtle: '#a8a29e', primary: '#6d4df2', primaryHover: '#7a5cf4', primaryText: '#a78bfa', primaryOn: '#ffffff', border: '#2c2927', borderStrong: '#3d3936', borderField: '#6e6864' },
  },
  // Today's .theme-purple.theme-raised and + .theme-night, measured the same
  // way. borderField is a proposal; today has no such token.
  Today: {
    day: { background: '#f5f6fe', surface: '#ffffff', ink: '#111111', inkMuted: '#414141', inkSubtle: '#55555f', primary: '#5b41e6', primaryHover: '#4f38d1', primaryText: '#683de8', primaryOn: '#ffffff', border: '#e2e3f6', borderStrong: '#caccee', borderField: '#8487ad' },
    night: { background: '#0f0f23', surface: '#1d1d35', ink: '#f2f1fb', inkMuted: '#b9b7d4', inkSubtle: '#9a98ba', primary: '#6d4df2', primaryHover: '#7a5cf4', primaryText: '#a78bfa', primaryOn: '#ffffff', border: '#2c2c48', borderStrong: '#3d3d61', borderField: '#6b6b96' },
  },
};

const directionTable = (id, { day: d, night: n }) => {
  // 1. Text tokens on every ground they can sit on.
  const text = [
    `| Text | Day | on white | on background ${code(d.background)} | on surface ${code(d.surface)} | Night | on background ${code(n.background)} | on surface ${code(n.surface)} |`,
    '|---|---|---|---|---|---|---|---|',
  ];
  for (const [label, key] of [['ink', 'ink'], ['ink-muted', 'inkMuted'], ['ink-subtle', 'inkSubtle'], ['primary.text', 'primaryText']]) {
    text.push(`| ${label} | ${code(d[key])} | ${[W, d.background, d.surface].map((g) => cell(d[key], g, `${id} day ${label}`)).join(' | ')} | ${code(n[key])} | ${[n.background, n.surface].map((g) => cell(n[key], g, `${id} night ${label}`)).join(' | ')} |`);
  }
  // 2. Fills and the label each carries, and the two tags.
  const fills = ['| Fill and label | Day | Ratio | Night | Ratio |', '|---|---|---|---|---|'];
  const pair = (label, fd, bd, fn, bn) =>
    fills.push(`| ${label} | ${code(fd)} on ${code(bd)} | ${cell(fd, bd, `${id} day ${label}`)} | ${code(fn)} on ${code(bn)} | ${cell(fn, bn, `${id} night ${label}`)} |`);
  pair('primary.on on primary', d.primaryOn, d.primary, n.primaryOn, n.primary);
  pair('primary.on on primary.hover', d.primaryOn, d.primaryHover, n.primaryOn, n.primaryHover);
  pair('accent tag, on a 15% wash', d.primaryTag ?? d.primaryText, wash(d.primaryText, d.surface), n.primaryTag ?? n.primaryText, wash(n.primaryText, n.surface));
  pair('reward tag, on the gold fill', d.ink, GOLD, n.background, GOLD);
  // 3. Non-text: 3:1 for the focus ring and a field's edge. The hairline is decoration.
  const ui = ['| Non-text, 3:1 | Day | on background | on surface | Night | on background | on surface |', '|---|---|---|---|---|---|---|'];
  for (const [label, key] of [['focus ring (primary.text)', 'primaryText'], ['field edge (new token)', 'borderField']]) {
    ui.push(`| ${label} | ${code(d[key])} | ${cell(d[key], d.background, `${id} day ${label}`, true)} | ${cell(d[key], d.surface, `${id} day ${label}`, true)} | ${code(n[key])} | ${cell(n[key], n.background, `${id} night ${label}`, true)} | ${cell(n[key], n.surface, `${id} night ${label}`, true)} |`);
  }
  for (const [label, key] of [['border-strong (not a field edge)', 'borderStrong'], ['border, the hairline', 'border']]) {
    ui.push(`| ${label} | ${code(d[key])} | ${two(ratio(d[key], d.background))} | ${two(ratio(d[key], d.surface))} | ${code(n[key])} | ${two(ratio(n[key], n.background))} | ${two(ratio(n[key], n.surface))} |`);
  }
  return [text.join('\n'), fills.join('\n'), ui.join('\n')].join('\n\n');
};

// A contrast ratio says how far apart two lightnesses are, not two hues, so
// it cannot tell whether a brand colour will be mistaken for a state. OKLCH
// hue and lightness (Ottosson's matrices) can.
const oklch = (h) => {
  const [r, g, b] = rgb(h).map(lin);
  const [l, m, s] = [
    0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b,
    0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b,
    0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b,
  ].map(Math.cbrt);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), ((Math.atan2(B, A) * 180) / Math.PI + 360) % 360];
};
const hues = [
  ['ok (today, every direction)', '#047857'], ['A primary', '#047857'],
  ['danger (today)', '#b91c1c'], ['B primary', '#9a3412'], ['warn (today)', '#92400e'],
  ['reward text (today)', '#845209'], ['reward gold (today)', '#f0b429'],
  ['C primary', '#5b41e6'], ['C primary.text', '#683de8'], ['R3 primary (indigo-500)', '#6366f1'],
];

// The states, held at today's values, on each direction's surface. The ok tag
// is measured with its proposed text, #065f46; today's #047857 is 4.43 there.
const statesTable = (time) => {
  const ids = ['A', 'B', 'C'];
  const rows = [
    `| ${time === 'day' ? 'By day' : 'At night'} | Text | On its fill | ${ids.map((i) => `${i} surface`).join(' | ')} | ${ids.map((i) => `${i} tag`).join(' | ')} |`,
    '|---|---|---|---|---|---|---|---|---|',
  ];
  for (const s of ['ok', 'warn', 'danger', 'reward']) {
    const [t, f] = STATES[time][s];
    const tagText = time === 'day' && s === 'ok' ? OK_TAG_FIX : t;
    const surf = ids.map((i) => cell(t, directions[i][time].surface, `${i} ${time} ${s} surface`));
    const tags = ids.map((i) => cell(tagText, wash(t, directions[i][time].surface), `${i} ${time} ${s} tag`));
    rows.push(`| ${s} | ${code(t)}${tagText !== t ? ` (tag ${code(tagText)})` : ''} | ${cell(t, f, `${time} ${s} fill`)} on ${code(f)} | ${surf.join(' | ')} | ${tags.join(' | ')} |`);
  }
  return rows.join('\n');
};

const blocks = {};
for (const [id, p] of Object.entries(generated)) blocks[id] = generatedTable(id, p);
for (const [id, dir] of Object.entries(directions)) blocks[id] = directionTable(id, dir);
blocks.states = [statesTable('day'), statesTable('night')].join('\n\n');
blocks.okTagToday = `Today's ok tag, ${code('#047857')} on its 15% wash ${code(wash('#047857', W))}: ${two(ratio('#047857', wash('#047857', W)))}. With ${code(OK_TAG_FIX)}: ${two(ratio(OK_TAG_FIX, wash('#047857', W)))}.`;
blocks.hues = ['| Colour | Hex | OKLCH lightness | Chroma | Hue |', '|---|---|---|---|---|',
  ...hues.map(([l, h]) => { const [L, C, H] = oklch(h); return `| ${l} | ${code(h)} | ${L.toFixed(2)} | ${C.toFixed(3)} | ${H.toFixed(0)}° |`; })].join('\n');

if (process.argv.includes('--check')) console.log(fails.join('\n') || 'none');
else if (process.argv.includes('--json')) console.log(JSON.stringify(blocks));
else console.log(Object.values(blocks).join('\n\n'));
```
