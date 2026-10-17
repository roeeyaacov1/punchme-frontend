# The visual world: three directions

Step 1.2 of `docs/redesign/guide.md`, written 17 Oct 2026 with
`/impeccable shape`. No code changed. Step 1.3 builds one specimen screen per
direction, and nothing here is chosen yet.

The inputs: PRODUCT.md and CLAUDE.md; `docs/redesign/research.md`, whose three
directions are the starting point; the decisions in the guide's §3; four sites
Roee likes (Calendly, CleanShot, WorkOS Atlas, Slite), each opened in the
browser and measured; a live check of which Google Fonts set Hebrew; today's
Scan screen, read in code; and Impeccable's direction roll. Two questions went
to Roee on the way (§9).

Read "In short" first. The rest is the detail.

1. In short
2. What the four sites share, measured
3. The family: what every direction holds
4. Direction 1: Lightbox
5. Direction 2: Lock screen
6. Direction 3: Ink
7. Side by side
8. The Scan screen at 375px, compared
9. Decisions made in this step
10. Type: the Hebrew faces
11. How the three were made
12. What step 1.3 has to check
13. Appendix: the measurements

---

## 1. In short

- **Three directions, one family.** All three are light and airy with dark
  text, keep one colour for the main action, set big headlines that are
  confident but not heavy, use generous rounded shapes, and show the real
  product working instead of illustrations. They differ in where the colour
  comes from.
  - **1, Lightbox.** The page is a lit sign: warm white panels with light
    behind them, soft dark text, a coral pill. Rubik and Assistant. Airy,
    soft, very round. At night the dashboard is the street after closing,
    and only what matters stays lit. From Slite and Calendly, and from the
    roll.
  - **2, Lock screen.** The world is the customer's phone: crisp white and
    near-black, Google Sans everywhere, today's violet for the main action,
    the pass on a wallpaper made from its own colours. Medium density,
    system springs. From CleanShot. It is D4's violet candidate.
  - **3, Ink.** PunchMe has no colour of its own: black and white, Heebo, a
    black pill, and the pass alone as the only coloured object. At the
    counter, Scan answers like a bus validator, in one flat colour. From
    WorkOS Atlas.
- **Scan at 375px, three ways** (§4–§6, compared in §8). Lightbox lights an
  inset panel inside the viewfinder, Lock screen raises a sheet the way Apple
  Pay does, and Ink turns the whole frame one colour.
- **Every text pair passes AA, by day and at night,** and every field edge
  and focus ring passes 3:1 (§13). One non-text pair sits under 3:1 on
  purpose: Lightbox's coral fill against its wall, 2.45:1, which is why a
  coral control always carries its label in ink (5.50:1).
- **Coral is never text.** As text it lands 10° of hue from the danger red,
  at the same lightness.
- **Fonts.** Google Sans, the sibling of CleanShot's face, is now on Google
  Fonts with a Hebrew subset; Google Sans Flex and Wix Madefor have none
  there. Roee allowed Google Sans, knowing it changes what the frozen Google
  Wallet preview renders (§9). Plex Mono shrinks to card codes in every
  direction, so tags and readouts finally get a face with Hebrew.
- **The logo is open** (Roee, §9). The winning direction may reset the
  wordmark and redraw the icon.
- **From the research.** Corner shop became Lightbox (the warm ground kept,
  brick swapped for a coral fill, Fredoka dropped). Quiet violet became Lock
  screen (violet kept, stone swapped for white, the serif dropped). Counter
  green became Ink (its best idea kept, the emerald dropped because it was
  the ok colour).

## 2. What the four sites share, measured

Read off the live pages on 17 Oct 2026, from the browser's computed styles.

| | Calendly | CleanShot | WorkOS Atlas | Slite |
|---|---|---|---|---|
| Ground | Warm off-white `#fcfbf8`; sections on `#f5f3ee` inside 64px-corner sheets | White, with a faint cool wash at the top | Pure white | Near-white `#fdfdfd`; cream `#fdf9f4` cards |
| Text | Navy `#071a31` (16.89:1); lead `#5f6d77` (5.15:1) | Near-black `#161618` (18.07:1) | Black | Soft dark grey `#3f434a` (9.77:1) |
| Main action | Navy with an off-white label, 16px corners | Blue `#0d44e8` with a white label (6.97:1), 14px corners, an inset glow | A black pill | A coral pill `#f67748` with a **white label at 2.74:1**, which fails AA |
| Headline | Calendly Sans 500, 72px, −2px | Google Sans Flex 600, 60px, −2% | Inter Display 600, 84px, −0.02em, line-height 1.02 | Garnett 500, 64px, line-height 1.2 |
| Faces | Two: a display face and Geist, plus a serif for some section heads | One, everywhere | Two: Inter Display and Inter | Two: Garnett and Universal Sans |
| Cards | 48–64px sheets; 20px product plates on pastel gradient fields | 20px bento tiles on soft tints | A 42px frame on a vivid gradient, a 24px window inside it | 32px tall cards (about 380×650) holding product snippets in white 14px cards |
| The product | Real interface pieces (a calendar, an availability form), animated | Screen recordings of the app working: nine videos on the page | A demo conversation that plays itself; the robot comes back section after section | Real snippets of the docs interface |
| Motion | A pinned scroll carousel with icon tabs; a heading that fills in from grey as it scrolls into view | Looping videos and small interface moves | The hero object rises in; the demo plays | Gentle; hand-drawn doodles |

What they share is what Roee wrote: light and airy, dark text, one accent
kept for the main action, headlines at 500–600 rather than 700 and up,
generous corners, and the real product working. Three of the four pair a
display face with a text face; CleanShot uses one face for everything.

What they do that PunchMe can't: CleanShot and Slite run logo walls,
CleanShot a testimonial, Calendly a "world's #1" claim, and Slite a white
label on coral that fails AA. None of that crosses over.

## 3. The family: what every direction holds

So that step 1.3 compares worlds, not rules:

- **The pass.** `AppleCardPreview`, `GoogleCardPreview`, `StampGrid` and
  `PassBarcode` stay as they are, in their 300px slot: staged, framed and
  animated, never redrawn. Handing the hero's real presets a new stamp count
  shows the pass working; it doesn't redraw it. If a landing hero wants the
  pass bigger than 300px, it scales the whole slot uniformly with a transform
  and never widens it, because Apple's px-sized type is scaled for 300px, and
  only if 1.3 shows it stays crisp.
- **Gold is the reward:** a fill carrying the direction's ink (8.10–10.55:1),
  never a state.
- **The states keep today's values** (research §3), with the ok tag's text at
  `#065f46` (6.11–6.21:1). §13 measures them on each direction's surfaces.
- **A field-edge token at 3:1 or more** in every direction, because
  border-strong measures 1.39–1.73:1 everywhere.
- **Night is the dashboard's only**, Card Studio included. The landing page,
  onboarding and the public pages stay light. What the owner hands to someone
  (a QR code, a message preview) keeps its own light at night, as today.
- **Two registers.**
  - **Persuade** (the landing page, the public pages): the world at full
    strength. Big type, product pieces staged in fields, and scroll
    choreography that leaves the page complete without it. Under reduced
    motion everything is visible from the start. Sourced figures are printed,
    never counted up, and every one links to its source.
  - **Operate** (onboarding, Card Studio, the dashboard): the world lends
    four things only, type, palette, density and one signature move, named in
    each direction. Navigation and controls stay the ordinary ones. Colour
    does jobs: the main action, selection, states, the owner's own card,
    chart series.
- **Hebrew first.** Display sizes drop their tracking to 0 and open their
  leading in Hebrew; figures, phone numbers and codes stay isolated left to
  right; horizontal motion mirrors; logical properties only.
- **Accessibility.** AA everywhere, 44px targets, a focus ring at 3:1 or
  more, the skip link, live regions debounced.
- **Motion rules,** Emil's and CLAUDE.md's: CSS first; transform and opacity;
  interface motion under 300ms; a press at scale(0.97); hover only where a
  pointer hovers; reduced motion gentler, not none. The stamp landing on the
  overshoot curve, cubic-bezier(0.34, 1.4, 0.64, 1), stays the product's one
  gesture in all three, except on Ink's Scan screen (§6).
- **No invented content.** No logos, testimonials, unsourced figures or
  popularity claims. A sample notification or a sample card is an
  illustration and is labelled as one. A sample card carries a trade
  ("מספרה", "Café"), never an invented business name.

## 4. Direction 1: Lightbox

**Where it comes from.** The roll's assignment: candidate 5 of 7, the Israeli
shopfront and its signs (§11). From Slite: the cream, the soft dark text, the
coral pill and the tall rounded cards. From Calendly: the warm off-white, the
very round soft cards and the soft fields around the product. Research B,
Corner shop, is its ancestor.

**The idea.** The page is a lit sign. Panels are lightboxes on a warm wall:
white acrylic with light behind it, dark letters on the front, one warm
colour on the thing to press. A pass is a lit screen, so the world and the
pass are made of the same stuff: light through a panel. Calendly's pastel
gradients become the light itself, warm at the centre of a panel and falling
off toward its edges. In the dashboard at night it is the street after
closing: the wall goes dark and only what matters stays lit, which is the
pass, the QR code, the brief and the scan's answer.

It is the owner's own world: the lightbox over the door, the letter board in
the café, the standee on the counter that PunchMe already prints. Activation
maps onto it plainly. On Free the card is designed but nobody can join; Pro
switches the sign on.

**Palette by day.**

| Token | Value | Measured |
|---|---|---|
| background, the wall | `#f6f2eb` | |
| surface, a lit panel | `#fffdfa` | |
| ink | `#2b2521` | 13.54 on the wall, 14.88 on a panel |
| ink-muted | `#574e47` | 7.27 / 7.99 |
| ink-subtle | `#6b625a` | 5.34 / 5.87 |
| primary, coral, a fill only | `#f67748`, hover `#f2683a` | carries ink at 5.50, on hover 4.90 |
| accent text | None: a link or an accent word is ink, underlined | |
| focus ring | ink | 13.54 / 14.88 |
| field edge | `#8e8277` | 3.35 / 3.68 |
| hairline, border-strong | `#e9e1d5`, `#d8ccbb` | 1.16–1.55, decoration only |
| warm light, the Persuade fields | `#fff7ec` to `#ffe9d4` to `#fddcc8` | ink 11.69 on the deepest stop, ink-muted 6.28 |
| reward tag | ink on gold | 8.10 |

**Palette at night, in the dashboard.**

| Token | Value | Measured |
|---|---|---|
| background, the street | `#16120f` | |
| surface, an unlit panel | `#211b17` | |
| ink | `#f6efe7` | 16.33 / 14.92 |
| ink-muted | `#cbbfb3` | 10.32 / 9.43 |
| ink-subtle | `#a99c90` | 6.95 / 6.35 |
| primary | `#ff8a5c`, hover `#ff9e78` | carries `#1a120d` at 7.95, on hover 9.16 |
| focus ring | ink | 16.33 / 14.92 |
| field edge | `#7d7064` | 3.87 / 3.54 |
| hairline, border-strong | `#2f2722`, `#3f352e` | |
| a lit panel, which keeps its light | `#fff4e6` | ink 13.91, ink-muted 7.47 |

**Coral's four rules.**

1. Coral is a fill, never text. As text (`#ad3f19`, hue 38°, lightness 0.52)
   it sits 10° from danger (`#b91c1c`, 28°, 0.51) and would read as an error.
2. The fill measures 2.45:1 on the wall and 2.70:1 on a panel, under the 3:1
   a control's edge would need on its own. That is allowed for a control its
   label identifies, so a coral control always carries its label or its icon
   in ink (5.50:1). The raised Scan button is an ink icon on coral.
3. On a gold surface the action is an ink pill, because coral beside gold is
   1.47:1.
4. A brand tag is a solid coral fill with ink text, never a 15% wash that
   could pass for warn.

**Type.** Rubik for display and the interface (500 for headlines, 400 and 500
for controls), Assistant for running text (400 and 600). No family to add:
both are loaded today. Figures are set in Rubik with `tnum`, because
Assistant has no tabular figures (measured, §10). Plex Mono sets card codes
only.

- Persuade: display clamp(2.75rem, 6vw, 4.5rem) at 500, line-height 1.06
  (1.14 in Hebrew), tracking −0.02em (0 in Hebrew); headline clamp(2rem,
  3.6vw, 3rem) at 500; lead 18–20px Assistant at 1.6.
- Operate: page title 28px Rubik 500, card title 19px, body 16px Assistant
  (17px for long Hebrew passages, because Assistant runs small), labels 14px
  Assistant 600, tags 13px Assistant 600.
- Character: the friendly medium weight of Slite's headline, with Rubik's
  soft corners as a sign's lettering. Today's Rubik is 700 and tight; here it
  is 500 and open.

**Shapes.** Generous and soft. Persuade: tall cards at 32px, the lit hero
panel at 40px. Operate: panels at 24px, fields at 16px, buttons and chips as
full pills, the viewfinder at 28px, stamps as circles. Depth comes from light
rather than shadow: a lit panel carries a 1px highlight inside its top edge
(white at 70%) and a soft warm drop, `0 1px 2px rgb(43 37 33 / 0.05), 0 8px
24px rgb(43 37 33 / 0.06)`. At night panels lose the drop, and a lit panel
needs no glow: its own ground against the dark street (17.14:1) is the light.

**Density.** The airiest of the three. Persuade sections sit 128–160px apart
on a desktop and 80–96px apart on a phone, with one product piece per card.
Operate is comfortable: a 16px gutter on a phone, 20–24px inside panels,
56px list rows.

**Motion: lights on.** Things arrive by light, not by travel. A panel's light
layer fades up (opacity, 240ms, ease-out cubic-bezier(0.23, 1, 0.32, 1)) while
the panel moves 8px at most. The stamp lands on the overshoot in 340ms. In
Persuade, a pinned chapter panel after Calendly's carousel swaps its product
piece per chapter with a 300ms crossfade, and the hero's warm light breathes
once every 14 seconds: the only loop on the site. Activation is the one
ceremony, the owner's card panel going from unlit to lit in 600ms, once. At
night nothing breathes. Under reduced motion light arrives at full strength in
150ms with no travel, the stamp appears at its final size, and the hero's
light holds still.

**How it frames a pass.** In a warm lit panel. Warm light flatters warm cards
and cools a blue one a little (research B's caveat). In the owner's own
dashboard, the panel that stages their pass is lit in their card's colour at
low strength (a raise from the roll, §11).

**Persuade.** The hero is one big lit panel, with the headline on the wall
above it and the coral "Start free" under the headline. The real pass stands
in the panel's light, taking a stamp. Below it come Slite's tall cards, each
with a lit area at its foot holding one working piece: the stamp grid
filling, the standee's QR code, a message arriving on the pass.

**Operate.** The shell is the ordinary one. The world lends Rubik, the warm
wall, comfortable density and the signature move, **lights on**. The
dashboard's one loud surface, today's violet brief band, becomes a lightbox:
`#fff4e6` to `#ffe9d4` with ink text, lit in both themes, and at night the
brightest thing on the street. A stamp at the counter, a new customer joining
or a reward given lights its panel once (a raise, §11).

**The logo.** The wordmark reset in Rubik 500, lowercase, and the mark in
ink. The icon: ink cards on coral (5.50:1).

**Scan at 375px.**

- **Above the frame, one row:** the page title as a small sign line
  ("סריקת כרטיסייה", Rubik 500 at 20px), with the torch and sound as pill
  toggles beside it. Folding them into the title row saves the 44px row they
  take under the frame today.
- **The viewfinder:** 343×343, 28px corners, the camera's dark glass
  (`#0e0c0a`): a hole in the wall, never lit. The reticle is warm white.
- **The answer lights an inset panel:** 24px corners, inset 12px from the
  frame, so the camera keeps showing around it and the next card is visible
  as it comes in. It switches on in its state's light: punched `#c9f0d9`
  (ink at 12.19:1), card full in gold `#ffd36b` (10.63), the refusals in
  amber `#ffe2b8` (12.10), cancelled or failed `#ffc9c2` (10.35). Inside: the
  word (Rubik 500 at 24px), the count in Rubik 700 at 64px with tabular
  figures ("3/8", isolated left to right), and the stamp row. On a full card,
  the reward in Assistant 600 at 18px, "Reward given" as an ink pill with a
  cream label (14.88:1), and "Not now" as a text button.
- **Motion:** the panel's light comes up in 120ms, and the newest stamp lands
  on the overshoot.
- **Below the frame:** the tally as one line, and "Type the code instead" as
  a pill.
- **At night** the page is the dark street and the viewfinder dark glass, so
  the answer is the only lit thing on the screen.
- **In the phone bar** the raised Scan button is a coral circle with an ink
  icon.
- **Its risk at the counter:** the inset leaves a margin of camera, so the
  answer is about a fifth smaller than today's full cover. It has to read at
  arm's length.

**Honest risk.** Cream and coral is close to the look AI tools reach for
first, a warm cream ground with a warm accent. What keeps it out of that
cluster is no serif, no paper texture, light instead of paper, and coral only
ever as a fill. Coral also shares a band of hue with warn (46°) and danger
(28°), kept apart only by lightness and by always being a solid fill. And the
metaphor has to stay in the light: no neon tubes, no brick, no drawn
shopfronts.

## 5. Direction 2: Lock screen

**Where it comes from.** Impeccable's own pick: candidate 1 of 7, the Wallet
and the lock screen (§11). It is D4's violet candidate. From CleanShot: crisp
white and near-black, one strong colour kept for the main action, one face
everywhere, and feature tiles that each show the product working. Research C,
Quiet violet, is its ancestor.

**The idea.** The world is the customer's phone. The pass lives in Apple
Wallet and Google Wallet and its messages arrive on the lock screen, so the
page speaks the phone's language: a wallpaper made from the card's own
colours, crisp system type, notification cards stacked over it, sheets that
rise from the bottom. Today's violet is the one colour for the main action,
on clean white and near-black, without today's lavender greys and gradients.
It puts D4's question to the test: is the violet the problem, or what
surrounded it?

**Palette by day.**

| Token | Value | Measured |
|---|---|---|
| background | `#f5f5f7` in Operate; Persuade pages are `#ffffff` | |
| surface | `#ffffff` | |
| ink | `#141416` | 16.89 / 18.39 |
| ink-muted | `#45454d` | 8.72 / 9.49 |
| ink-subtle | `#5f5f68` | 5.80 / 6.31 |
| primary, violet | `#5b41e6`, hover `#4f38d1` | carries white at 6.28, on hover 7.44 |
| accent text, focus ring | `#683de8` | 5.63 / 6.13 |
| accent tag | `#683de8` on its 15% wash | 4.88 |
| field edge | `#8a8a94` | 3.13 / 3.41 |
| hairline, border-strong | `#e5e5ea`, `#d1d1d6` | |
| tile tints, Persuade | sky `#e9f0ff`, peach `#fff1e8`, mint `#e8f7ef`, stone `#f2f2f4` | ink 16.09 or more, ink-muted 8.30 or more |
| reward tag | ink on gold | 9.87 |

**Palette at night.**

| Token | Value | Measured |
|---|---|---|
| background | `#0c0c10` | |
| surface | `#1b1b21` | |
| ink | `#f5f5f7` | 17.92 / 15.73 |
| ink-muted | `#c2c2cc` | 11.04 / 9.69 |
| ink-subtle | `#9d9da8` | 7.27 / 6.38 |
| primary | `#6d4df2`, hover `#7a5cf4` | carries white at 5.25, on hover 4.50, which is the floor, and it holds |
| accent text, focus ring | `#a78bfa` | 7.17 / 6.29 |
| accent tag | `#a78bfa` on its 15% wash | 4.93 |
| field edge | `#6e6e7a` | 3.88 / 3.40 |
| hairline, border-strong | `#2a2a32`, `#3a3a44` | |
| a lit stage, for the QR code and previews | `#ffffff` | |

**Violet's rules.** The main action and selection, nothing else. Never in a
gradient, never glowing, and the greys are neutral, with no lavender in them.
The wallpaper behind a pass is made from that card's own background and stamp
colours, blurred like a lock-screen wallpaper, and no text sits on it except
inside a solid card.

**Type.** Google Sans everywhere. Its optical-size axis (17–18) switches
between the text and display cuts by itself, its weight runs 400–700, and it
sets Hebrew. Figures in Google Sans with `tnum` (measured, §10); Plex Mono for
card codes only. Load `family=Google+Sans:opsz,wght@17..18,400..700`. Roboto
stays for the Google preview, and Rubik and Assistant leave in Phase 10.

- Persuade: display clamp(2.75rem, 5.5vw, 4.25rem) at 550, because 600 looked
  heavy in Hebrew in the specimen; line-height 1.08 (1.15 in Hebrew),
  tracking −0.02em (0 in Hebrew); headline clamp(2rem, 3.4vw, 2.75rem) at
  550; lead 18px at 400, 1.6.
- Operate, on the phone's own scale: a 30px large title at 600 that collapses
  on scroll, 20px titles at 600, 16px body at 400, 13px footnotes at 500,
  12px tags at 600.
- **What it does to a frozen file** (approved, §9). The Google preview's font
  stack names "Google Sans" first, so the Google Wallet preview starts
  rendering in it, Latin and Hebrew. Its comment ("Google Sans is not public")
  goes stale, and the file stays untouched.

**Shapes.** Rounded rectangles with the phone's continuous corners: cards and
sheets at 24–28px, grouped lists at 16px, buttons at 14px (CleanShot's) and
50px tall for the main action, fields at 12px, tags as pills, stamps as
circles. `corner-shape: squircle` where the browser supports it, the radius
alone everywhere else. Depth: CleanShot's soft layered shadow for floating
pieces, `0 7px 20px -8px rgb(20 20 22 / 0.02), 0 29px 33px -4px rgb(20 20 22
/ 0.02), 0 22px 30px -10px rgb(20 20 22 / 0.05)`, and hairlines for lists. At
night, steps between surfaces and hairlines only.

**Density.** Medium. Persuade: CleanShot's bento grid with 24px gaps, sections
96–128px apart on a desktop and 64–80px apart on a phone. Operate: the phone's
inset grouped lists, 52px rows, 16px insets.

**Motion: system springs.** Sheets rise on the drawer curve, cubic-bezier(0.32,
0.72, 0, 1), in 280–340ms; banners drop from the top edge in 250ms on
ease-out; things leave faster than they arrive, in 180ms. The stamp lands on
the overshoot. Persuade's signature is the pass dropping into a wallet stack,
one 700ms sequence on load and the only long one. Bento tiles loop the real
product: screen recordings if Roee records them, and until then the live
components animated in code, such as the stamp grid taking a stamp. Under
reduced motion sheets and banners crossfade in place in 150ms, the stack
sequence becomes one crossfade, and loops hold their last frame.

**How it frames a pass.** By construction: the wallpaper is made from the
card's own colours, so every card looks at home. The violet is small, one
button, and a red or orange card beside it is the case to check.

**Persuade.** The hero is the pass alone on its own wallpaper, with one
lock-screen notification stacked above it (an illustration, labelled), the
headline above, and the violet "Start free". Below it, a bento of working
pieces: the pass taking a stamp, a message arriving on the lock screen, the
standee's QR code, and the calculator itself, live. Each source sits under
its figure like a footnote.

**Operate.** The shell is the ordinary one, with the phone's accent: large
titles that collapse on scroll, grouped lists, sheets. The signature move is
**the lock-screen stack**: anything a customer will see (a message, a reward,
a broadcast) is previewed as the notification card it becomes, on the pass's
own wallpaper. The one loud surface is a solid violet card with white text
(6.28:1), like a widget, with no gradient.

**The logo.** The wordmark reset in Google Sans 600. The icon stays white
cards on violet, the icon owners already have on their phones.

**Scan at 375px.**

- **Above the frame:** a large title ("סריקה", 30px) that collapses into the
  bar on scroll, with the torch and sound as two icon-and-word buttons in its
  row.
- **The viewfinder:** 343×343, 28px continuous corners, black glass.
- **The answer rises as a sheet inside the viewfinder,** in Apple Pay's
  grammar: a white sheet (`#1b1b21` at night) over the lower 70% of the
  frame, rising in 300ms on the drawer curve. At its top, a 72px round badge
  in the state's colour with a white glyph (ok `#047857` at 5.48:1, warn
  `#92400e` at 7.09, danger `#b91c1c` at 6.47) and the word in Google Sans
  600 at 24px; under them the count at 56px with tabular figures, and the
  stamp row. A full card is the one answer that takes colour across the
  sheet: its top 40% turns gold (ink at 9.87:1), because a full card is an
  event rather than a state. "Reward given" sits below the band as a
  full-width 50px violet button, with "Not now" as a text button.
- **The camera keeps running above the sheet.** The next card swaps the
  sheet's contents in place, with no second rise.
- **Below the frame:** the tally and manual entry as one grouped list.
- **At night:** black glass, a `#1b1b21` sheet, night badges (`#34d399`,
  `#fcd34d`, `#fca5a5`, each carrying an ink glyph at 10.15–13.53:1) and the
  gold band (10.47).
- **In the phone bar** Scan is a violet capsule in the middle of the bar, not
  raised, the way the phone's own bars do it.
- **Its risk at the counter:** a white sheet with a coloured badge is calmer
  than a full-colour flash, so peripheral vision catches less of it. The
  chime and the buzz carry more of the news.

**Honest risk.** It is the incumbent colour and the most familiar look of the
three: crisp white, system type, violet. That familiarity is the reason to
show it and the reason to doubt it. Google Sans makes it read as
Google-adjacent, and it changes what a frozen file renders (approved, checked
in 1.3).

## 6. Direction 3: Ink

**Where it comes from.** Candidates 3 and 2 of 7: single-object product
photography in Apple's tradition, and the Rav-Kav validator's tap, beep and
green light (§11). From WorkOS Atlas: black and white, a huge confident
headline, a black pill, one object alone as the hero. Research A, Counter
green, is its ancestor, and its best line survives: the scan result is the
loudest thing on the screen because nothing else has colour.

**The idea.** PunchMe has no colour of its own. Every business's card brings
its own, so the world steps back to black and white and lets the pass be the
only coloured object on the page. It is shown alone, the way WorkOS shows its
robot, and it comes back section after section with one real snippet beside
it. At the counter, Scan answers like a bus validator: the whole frame turns
one flat colour, readable from a metre away.

**Palette by day.**

| Token | Value | Measured |
|---|---|---|
| background | `#f6f6f6` in Operate; Persuade pages are `#ffffff` | |
| surface | `#ffffff` | |
| ink | `#0b0b0b` | 18.21 / 19.68 |
| ink-muted | `#3d3d3d` | 10.05 / 10.86 |
| ink-subtle | `#5c5c5c` | 6.18 / 6.68 |
| primary, ink | `#0b0b0b`, hover `#2e2e2e` | carries white at 19.68, on hover 13.57 |
| accent text, focus ring | ink; links are underlined | 18.21 / 19.68 |
| field edge | `#8a8a8a` | 3.19 / 3.45 |
| hairline, border-strong | `#e6e6e6`, `#d0d0d0` | |
| reward tag | ink on gold | 10.55 |

**Palette at night: inverted.**

| Token | Value | Measured |
|---|---|---|
| background | `#0b0b0b` | |
| surface | `#161616` | |
| ink | `#f4f4f4` | 17.89 / 16.45 |
| ink-muted | `#c4c4c4` | 11.28 / 10.37 |
| ink-subtle | `#a0a0a0` | 7.52 / 6.92 |
| primary | `#f4f4f4`, hover `#d9d9d9` | carries `#0b0b0b` at 17.89 |
| field edge | `#707070` | 3.97 / 3.65 |
| hairline, border-strong | `#262626`, `#363636` | |
| a lit stage | `#ffffff` | |

**Where colour lives.** Operate asks colour to do jobs. Here it does three,
and nothing else:

1. **The owner's card.** The business chip, the stage around their pass and
   the dashboard's one loud surface take the card's own background colour,
   carrying black or white text, whichever is further. That pair is never
   under 4.58:1, whatever the colour (on a grey ramp the worst case measures
   4.60:1, at `#757575`), so it can be worked out at runtime without a check.
2. **The states and the gold reward.**
3. **Chart series.**

Scan has signal fills of its own: punched `#22c55e` with ink (8.63:1); card
full in gold with ink (10.55); a calm refusal (too soon, the sign-up poster,
not one of yours) `#ededed` with ink (16.81); a stop (cancelled, failed)
`#dc2626` with white (4.82). At night: `#4ade80` with ink (11.29), gold,
`#d4d4d4` with ink (13.27), and `#f87171` with ink (7.11).

**Type.** Heebo everywhere, at 400–800 of its 100–900. Its digits are tabular
without asking (measured, §10). Its Latin is Roboto's design, the face the
Google Wallet preview already uses, so the page and the Google pass share a
family. Load `family=Heebo:wght@400..800`. Neither frozen preview names
Heebo, so nothing frozen changes.

- Persuade: display clamp(3rem, 7vw, 5.25rem) at 600 (WorkOS sets 84px at
  600), line-height 1.02 (1.1 in Hebrew), tracking −0.035em (0 in Hebrew);
  section heads 48px at 600; lead 18px at 400 in ink-muted (10.86:1).
- Operate: 24px titles at 600, 15–16px body at 400, big numbers at 700 with
  tabular figures.

**Shapes.** A pill for every control (the black pill, a segmented control as
a pill track), 24px for product frames, 16px panels, circles for stamps,
hairlines between rows. No shadow by day except the pass's own, because it is
the object, and none at night.

**Density.** Extremes. Persuade: one idea per viewport, 160–200px between
sections on a desktop and 96px on a phone. Operate: dense and quiet, hairline
rows 48px tall (the targets stay 44px), 12–16px padding, numbers aligned to
the end edge.

**Motion: still, then exact.** One entrance per page: the hero object rises
24px and fades in over 600ms on cubic-bezier(0.16, 1, 0.3, 1), as WorkOS's
hero does. After that nothing moves unless it means something: state changes
in 120ms or less, opacity only; no hover lifts; no loops except the scanner's
sweep, which is status. In Persuade the pass comes back in each section with
a fade, never with parallax. Under reduced motion there is no rise, and
opacity changes in 120ms.

**How it frames a pass.** By neutrality: on white or on black, every card
looks at home. The weak case is the opposite one, a white or pale card on
white, which needs the rim at 10% to have an edge.

**Persuade.** WorkOS's composition: a huge two-line headline, one line of
lead, the black pill, and under them the pass alone, rising. Each section
after it pairs the same pass with one working snippet: a stamp landing, the
lock-screen message, the standee, the calculator.

**Operate.** The shell in black and white. The signature move is **the
validator**: an outcome is one flat field of colour with one glyph and one
word, whether it is Scan's answer, a redemption or a failed send. The
Overview leads with the owner's own card and one huge number in tabular
figures.

**The logo.** The wordmark reset in Heebo 700. The icon: white cards on black.

**Scan at 375px.**

- **Above the frame:** nothing visible. The `h1` stays for screen readers,
  visually hidden, so the heading order survives, and the viewfinder starts
  under the header.
- **The viewfinder:** the full width less 8px gutters, 359×359, 24px corners,
  black glass.
- **The answer is the whole frame in one flat signal colour,** in 120ms, with
  no overshoot and no travel. This is Emil's frequency rule: the screen runs
  dozens of times a day. One 64px glyph (a check, a gift, a clock, a cross),
  the word in Heebo 700 at 28px, and the count at 88px with tabular figures.
  On a full card: the gold frame, the reward in Heebo 600 at 20px, "Reward
  given" as a black pill (a white label at 19.68:1), and "Not now"
  underlined.
- **Below the frame:** the torch, the sound and "Type the code instead" as
  three pills in one row, and the tally under them.
- **At night:** a black page and black glass, so the signal colour is the
  only light.
- **In the phone bar** Scan is a raised black circle, white at night.
- **Its risk at the counter:** the strongest signal of the three, and the
  bluntest. Calm refusals are grey so they don't alarm, but a full green
  frame at night is bright.

**Honest risk.** Black and white can read as cold, or as a tech company's
page, to a barber afraid of paying for a dashboard. The warmth has to come
from the owner's card and from Heebo at friendly sizes, and if the sample
cards are dull the page is dull. It also asks the most of the landing page:
one object and a headline carry the whole first viewport.

## 7. Side by side

| | 1, Lightbox | 2, Lock screen | 3, Ink |
|---|---|---|---|
| From | Slite and Calendly; the roll | CleanShot; Impeccable's pick | WorkOS Atlas |
| Research ancestor | B, Corner shop | C, Quiet violet | A, Counter green |
| Ground by day | A warm wall `#f6f2eb`, lit panels `#fffdfa` | `#f5f5f7` and white | `#f6f6f6` and white |
| Main action | A coral fill `#f67748` with an ink label | Violet `#5b41e6` with a white label | A black pill |
| Night | The street after closing, warm `#16120f` | The phone's dark, `#0c0c10` | Inverted, `#0b0b0b`, a white pill |
| Type | Rubik 500 and Assistant | Google Sans | Heebo |
| Families to add | None | 1 | 1 |
| Corners | 24–40px, pills | 12–28px continuous, 14px buttons | Pills, 16–24px |
| Depth | Light: an inner highlight, a warm drop | Soft layered shadows | None but the pass's own |
| Density | The airiest | Medium | Extremes: sparse pages, dense tools |
| Motion | Lights on | System springs | Still, then exact |
| Signature move in Operate | Lights on | The lock-screen stack | The validator |
| Frames the pass with | Warm light | Its own wallpaper | Neutrality |
| Scan's answer | An inset lit panel | A sheet with a badge | The whole frame, one colour |
| Strongest at | Onboarding, the landing page, warmth | Familiarity; every card at home | Scan; the pass as hero; candour |
| Weakest at | The AI-cream cluster; coral beside warn | Familiarity; Google-adjacent | Coldness |

## 8. The Scan screen at 375px, compared

Today: a title and a lead, a square viewfinder whose answer covers it in a
state's wash, the torch and sound under it, a tally, manual entry in a panel,
and the raised round Scan button in the phone bar. The camera opens on
arrival and stays open, a read costs one request, nothing has to be tapped to
punch, and the one tap that exists hands over a reward. All three keep all of
that, every call in `docs/dashboard-routes.md` included, and the answer stays
on the viewfinder rather than under it.

| | 1, Lightbox | 2, Lock screen | 3, Ink |
|---|---|---|---|
| Above the frame | The title, torch and sound in one row | A large title that collapses; torch and sound in its row | Nothing visible; the `h1` is visually hidden |
| Frame | 343px, 28px corners | 343px, 28px continuous corners | 359px, 24px corners |
| The answer | An inset panel lights up, the camera visible around it | A sheet rises over the lower 70% | The whole frame turns one flat colour |
| What carries the signal | The panel's light | A 72px badge, and a gold band for a full card | The fill itself, with a 64px glyph |
| The count | 64px Rubik | 56px Google Sans | 88px Heebo |
| Motion | Light in 120ms; the stamp overshoots | A 300ms rise on the drawer curve | 120ms; nothing travels |
| "Reward given" | An ink pill on gold | A violet button under the gold band | A black pill on gold |
| Scan in the phone bar | A raised coral circle, an ink icon | A violet capsule, not raised | A raised black circle |
| At night | The answer is the only lit thing | A dark sheet, night badges | The signal is the only light |
| Its risk | A fifth smaller than today's answer | Calmer; less peripheral | Bright at night; blunt |

## 9. Decisions made in this step

- **Google Sans may be used** (Roee, 17 Oct). Lock screen sets everything in
  it. Loading it makes the frozen Google Wallet preview render in Google
  Sans, Latin and Hebrew, because its stack names it first. Its comment saying
  Google Sans is not public goes stale, and the file stays untouched. Step
  1.3 compares the preview's Hebrew with a real Android pass.
- **The logo is open** (Roee, 17 Oct). The winning direction may reset the
  wordmark in its own face and redraw the icon. Each direction says what it
  would do.
- **Plex Mono shrinks to card codes** in every direction. Tags, readouts and
  the Apple/Google switch move to a face that sets Hebrew, which closes the
  gap DESIGN.md and `docs/card-studio.md` record.
- **Dropped from the research:** the emerald, which was the ok colour hex for
  hex; the brick, 9° from danger and from warn at the same lightness; Fredoka,
  filed under children's apps; and Frank Ruhl Libre with IBM Plex Sans
  Hebrew, because all four sites are set in sans serifs and Google Sans is
  nearer CleanShot than Plex.
- **Not decided here:** which direction wins (step 1.3), the dashboard
  shell's layout (Phase 2), and any copy. Lightbox's "switch the sign on" is
  a picture for activation, not new wording; any new string goes through
  `t()` in both languages, in its own phase.

## 10. Type: the Hebrew faces

Checked on 17 Oct 2026 against the Google Fonts CSS API, which lists a
family's subsets, and rendered side by side in Hebrew and English at 44px and
64px. Tabular figures were measured by setting "1111" and "0000" with and
without `tnum` and comparing their widths.

| Face | Hebrew on Google Fonts | Axes and weights | Tabular figures | Used in |
|---|---|---|---|---|
| Google Sans | Yes | Optical size 17–18, weight 400–700, italic, grade | With `tnum` | 2 |
| Rubik | Yes | Weight 300–900 | With `tnum` | 1 |
| Assistant | Yes | Weight 200–800 | **None** | 1, running text |
| Heebo | Yes | Weight 100–900 | Always | 3 |
| Noto Sans Hebrew | Yes | Weight 100–900, width 62.5–100 | | None: the Google preview names it as its Hebrew fallback, so loading it changes a frozen file (research item 17) |
| Google Sans Flex, CleanShot's face | **No** | | | |
| Wix Madefor Display and Text | **No** | | | |

Seen in the specimen: Rubik 500 reads friendly and medium, like Slite's
Garnett. Google Sans is clean and open in Hebrew and reads heavy at 600, so
direction 2 sets display at 550. Heebo 600 is crisp and neutral, the nearest
to Inter Display. Assistant runs small, so long Hebrew passages in direction
1 step up to 17px.

## 11. How the three were made

Impeccable's route for a replacement world: say what is unique, list the
visual systems the audience already knows, roll which one to build, and weigh
it against challengers from its catalog. Roee's brief pinned three directions
in one family, with violet in one of them, and a pinned brief beats the roll.
So the roll's assignment became one of the three, and the other two came from
the top of the list.

**What is unique.** A customer scans a QR code once and a stamp card lands in
Apple or Google Wallet. It stamps itself at every visit and updates on the
lock screen, with no app, no account and no password. The scene: a solo owner
in Israel at the counter, a phone in one hand, between customers, in Hebrew.
The rut this category ships: a gradient hero with a phone mock-up, a logo
wall, a testimonial carousel, three feature cards and pricing tiers. Its
predictable opposite: a brutalist, receipt-paper "honest" page.

**The seven, ranked by resonance** before the roll:

1. The Wallet and the lock screen: the pass's own home.
2. The Rav-Kav validator: tap, beep, green, a ritual every Israeli knows.
3. Single-object product photography, Apple's tradition and the one Roee's
   references come from.
4. The supermarket club card and its receipt: the category's Israeli root.
5. The shopfront: the lightbox over the door, the café's letter board, the
   standee.
6. The paper punch card itself, the brief's literal reading, given one place
   only.
7. WhatsApp, where every link travels: the one tool on the list.

**The roll.** Seed `7845be48` (Persuade, direction scope) assigned candidate
5, which is **Lightbox**. Candidate 1, the top of the list, is **Lock
screen**, Impeccable's pick, and it carries D4's violet. Candidates 3 and 2
make **Ink**, the third direction the brief asked for. An earlier mistyped
call rolled a surface-scope seed, `01bd482a`, which was not used.

**The challengers.** Each was fused with the product and weighed against
Lightbox on two axes, whether the audience would recognise it and how clearly
it explains the product.

| Challenger | Verdict | What Lightbox kept |
|---|---|---|
| A jet-age airline ticket wallet: validated, used and void coupons | Competitive: clearer about the mechanism, further from the owner | Nothing disappears, it cancels. A redemption or a refusal is stamped on the record and stays there, never a toast that vanishes |
| An early-80s drum machine's step row | Competitive: the stamp row is a step row, but nobody at a counter owns one | The stamp row is the one unbroken line on any screen that shows a card. It never wraps, it scales, and the next stamp is marked as "now" |
| An endurance-racing garage and its liveries | Declined | Identity reads before words: the panel that stages an owner's pass is lit in their card's colour |
| A dial-up bulletin board at 2 a.m. | Declined | Presence is precious: a join, a stamp or a reward lights its panel once, never a number that changes silently |
| A coiled earthen tower | Declined | Growth on request: a customer's history is something you open, not a show that plays |
| An ikebana arrangement in a tokonoma | Declined | Active emptiness: a lit panel holds the pass and one line, and the rest of the light is left empty |

The two competitive challengers stay available as full alternatives on
request. So does the category standard played straight, which is not one of
the three.

## 12. What step 1.3 has to check

The guide's specimen (a header and a customer row, two buttons, an input with
an error, the staged `AppleCardPreview`, a landing headline) in Hebrew and
English, light and night, at 375px and 1280px. And for each direction, what
this brief could not settle without seeing it:

- **Lightbox:** a blue card and a neon card in warm light; coral beside a
  warn notice on one screen; the inset answer read at arm's length; whether
  the cream reads as light or as paper.
- **Lock screen:** the Google preview's Hebrew in Google Sans against a real
  Android pass; whether violet without gradients still reads as AI-made; the
  sheet answer in peripheral vision; a red card on a violet screen.
- **Ink:** warmth, with the trades' real presets as the sample cards; a white
  card on white; the full green frame at night.
- **All three:** Hebrew display weights at real size; the pass in each hero
  at 300px, and scaled if a hero wants it bigger; whether the pass looks at
  home.

## 13. Appendix: the measurements

Every ratio in this file came from this script, by the method of research.md
§12: WCAG 2 luminance, every ratio truncated to two decimals so that a
printed 4.50 is at least 4.50, a wash at 15% over its ground, and OKLCH for
hue. To check one, save it as `visual-world-contrast.mjs` anywhere outside
`src/` and run `node visual-world-contrast.mjs`;
`node visual-world-contrast.mjs --check` lists only the pairs under the line.
Today `--check` lists exactly two, both deliberate: Lightbox's coral fill
against its wall and against a panel (2.45 and 2.70, where a control's edge
alone would need 3:1), which a coral control's ink label makes up for
(5.50:1).

```js
// visual-world-contrast.mjs: the measurements in docs/redesign/briefs/visual-world.md.
// `node visual-world-contrast.mjs` prints every table; `--check` prints only
// the pairs under the line (text 4.5:1, non-text 3:1).
//
// The method of docs/redesign/research.md §12: WCAG 2 relative luminance,
// ratios truncated to two decimals (never rounded up), a "wash" is a colour at
// 15% over its ground, and OKLCH comes from Ottosson's matrices.

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

const fails = [];
const out = [];
const say = (line) => out.push(line);
/** A pair that must pass: 4.5:1 for text, 3:1 for a ring, an edge or a glyph's ground. */
const need = (fg, bg, where, min = 4.5) => {
  const r = ratio(fg, bg);
  if (r < min) fails.push(`${where}: ${fg} on ${bg} = ${two(r)} (needs ${min})`);
  return two(r);
};
/** A pair measured for information only (decoration, or a fill beside a fill). */
const info = (fg, bg) => two(ratio(fg, bg));

// ── Held constant (research §3) ──────────────────────────────────────────
const STATES = {
  day: { ok: ['#047857', '#ecfdf5'], warn: ['#92400e', '#fffbeb'], danger: ['#b91c1c', '#fef2f2'], reward: ['#845209', '#fefaec'] },
  night: { ok: ['#6ee7b7', '#10261f'], warn: ['#fcd34d', '#2b2113'], danger: ['#fca5a5', '#2b1418'], reward: ['#ffd875', '#2d2412'] },
};
const OK_TAG = '#065f46';
const GOLD = '#f0b429';

// ── The three directions, in the app's token names ───────────────────────
// primaryText is accent-coloured text and the focus ring. Lightbox has no
// coral text, so its primaryText is ink; Ink's is ink by design.
const D = {
  '1 Lightbox': {
    day: { background: '#f6f2eb', surface: '#fffdfa', ink: '#2b2521', inkMuted: '#574e47', inkSubtle: '#6b625a', primary: '#f67748', primaryHover: '#f2683a', primaryOn: '#2b2521', primaryText: '#2b2521', border: '#e9e1d5', borderStrong: '#d8ccbb', field: '#8e8277' },
    night: { background: '#16120f', surface: '#211b17', ink: '#f6efe7', inkMuted: '#cbbfb3', inkSubtle: '#a99c90', primary: '#ff8a5c', primaryHover: '#ff9e78', primaryOn: '#1a120d', primaryText: '#f6efe7', border: '#2f2722', borderStrong: '#3f352e', field: '#7d7064' },
    solidTag: true, // a brand tag is a solid coral fill, never a wash
  },
  '2 Lock screen': {
    day: { background: '#f5f5f7', surface: '#ffffff', ink: '#141416', inkMuted: '#45454d', inkSubtle: '#5f5f68', primary: '#5b41e6', primaryHover: '#4f38d1', primaryOn: '#ffffff', primaryText: '#683de8', border: '#e5e5ea', borderStrong: '#d1d1d6', field: '#8a8a94' },
    night: { background: '#0c0c10', surface: '#1b1b21', ink: '#f5f5f7', inkMuted: '#c2c2cc', inkSubtle: '#9d9da8', primary: '#6d4df2', primaryHover: '#7a5cf4', primaryOn: '#ffffff', primaryText: '#a78bfa', border: '#2a2a32', borderStrong: '#3a3a44', field: '#6e6e7a' },
  },
  '3 Ink': {
    day: { background: '#f6f6f6', surface: '#ffffff', ink: '#0b0b0b', inkMuted: '#3d3d3d', inkSubtle: '#5c5c5c', primary: '#0b0b0b', primaryHover: '#2e2e2e', primaryOn: '#ffffff', primaryText: '#0b0b0b', border: '#e6e6e6', borderStrong: '#d0d0d0', field: '#8a8a8a' },
    night: { background: '#0b0b0b', surface: '#161616', ink: '#f4f4f4', inkMuted: '#c4c4c4', inkSubtle: '#a0a0a0', primary: '#f4f4f4', primaryHover: '#d9d9d9', primaryOn: '#0b0b0b', primaryText: '#f4f4f4', border: '#262626', borderStrong: '#363636', field: '#707070' },
  },
};

for (const [id, d] of Object.entries(D)) {
  say(`\n## ${id}`);
  for (const t of ['day', 'night']) {
    const p = d[t];
    say(`\n${t}`);
    for (const k of ['ink', 'inkMuted', 'inkSubtle', 'primaryText']) {
      say(`  ${k} ${p[k]}: background ${need(p[k], p.background, `${id} ${t} ${k}`)} · surface ${need(p[k], p.surface, `${id} ${t} ${k}`)}`);
    }
    say(`  primaryOn ${p.primaryOn} on primary ${p.primary}: ${need(p.primaryOn, p.primary, `${id} ${t} primaryOn`)} · on hover ${p.primaryHover}: ${need(p.primaryOn, p.primaryHover, `${id} ${t} primaryOn/hover`)}`);
    say(`  primary fill as a control's edge: background ${need(p.primary, p.background, `${id} ${t} primary fill/background`, 3)} · surface ${need(p.primary, p.surface, `${id} ${t} primary fill/surface`, 3)}`);
    if (d.solidTag) say(`  brand tag, solid: ${need(p.primaryOn, p.primary, `${id} ${t} brand tag`)}`);
    else {
      const w = wash(p.primaryText, p.surface);
      say(`  accent tag ${p.primaryText} on its wash ${w}: ${need(p.primaryText, w, `${id} ${t} accent tag`)}`);
    }
    say(`  reward tag on gold: ${need(t === 'day' ? p.ink : p.background, GOLD, `${id} ${t} reward tag`)}`);
    say(`  focus ring: background ${need(p.primaryText, p.background, `${id} ${t} ring`, 3)} · surface ${need(p.primaryText, p.surface, `${id} ${t} ring`, 3)}`);
    say(`  field edge ${p.field}: background ${need(p.field, p.background, `${id} ${t} field edge`, 3)} · surface ${need(p.field, p.surface, `${id} ${t} field edge`, 3)}`);
    say(`  border-strong ${p.borderStrong}: ${info(p.borderStrong, p.background)} / ${info(p.borderStrong, p.surface)} · hairline ${p.border}: ${info(p.border, p.background)} / ${info(p.border, p.surface)} (decoration)`);
    for (const [s, [tx, fill]] of Object.entries(STATES[t])) {
      const tag = t === 'day' && s === 'ok' ? OK_TAG : tx;
      say(`  ${s} ${tx}: surface ${need(tx, p.surface, `${id} ${t} ${s}`)} · its fill ${need(tx, fill, `${id} ${t} ${s} fill`)} · tag ${need(tag, wash(tx, p.surface), `${id} ${t} ${s} tag`)}`);
    }
  }
}

// ── Direction-specific surfaces ───────────────────────────────────────────
say('\n## 1 Lightbox, more');
const A = D['1 Lightbox'];
for (const g of ['#fff7ec', '#ffe9d4', '#fddcc8']) say(`  warm light ${g}: ink ${need(A.day.ink, g, `1 glow ${g}`)} · ink-muted ${need(A.day.inkMuted, g, `1 glow ${g}`)}`);
say(`  a lit panel at night #fff4e6: ink ${need(A.day.ink, '#fff4e6', '1 lit night')} · ink-muted ${need(A.day.inkMuted, '#fff4e6', '1 lit night')} · against the street ${info('#fff4e6', A.night.background)}`);
say(`  ink icon on coral (the Scan button, the icon): ${need(A.day.ink, A.day.primary, '1 Scan button')}`);
say(`  coral beside gold: ${info(A.day.primary, GOLD)} · coral beside the lit reward #ffd36b: ${info(A.day.primary, '#ffd36b')}`);
for (const [n, bg] of [['punched', '#c9f0d9'], ['card full', '#ffd36b'], ['refusal', '#ffe2b8'], ['cancelled or failed', '#ffc9c2']]) say(`  Scan answer, ${n} ${bg}: ink ${need(A.day.ink, bg, `1 Scan ${n}`)}`);
say(`  Scan "Reward given", ink pill with a cream label: ${need(A.day.surface, A.day.ink, '1 reward pill')}`);

say('\n## 2 Lock screen, more');
const B = D['2 Lock screen'];
for (const g of ['#e9f0ff', '#fff1e8', '#e8f7ef', '#f2f2f4']) say(`  tile tint ${g}: ink ${need(B.day.ink, g, `2 tint ${g}`)} · ink-muted ${need(B.day.inkMuted, g, `2 tint ${g}`)}`);
for (const [n, c] of [['ok', '#047857'], ['warn', '#92400e'], ['danger', '#b91c1c']]) say(`  Scan badge, ${n} ${c}: on the white sheet ${need(c, '#ffffff', `2 badge ${n}`, 3)} · its white glyph ${need('#ffffff', c, `2 glyph ${n}`, 3)}`);
say(`  Scan, a full card's gold band: ink ${need(B.day.ink, GOLD, '2 gold band')} · at night ${need(B.night.background, GOLD, '2 gold band night')} · a gold badge on white would be ${info(GOLD, '#ffffff')}`);
for (const [n, c] of [['ok', '#34d399'], ['warn', '#fcd34d'], ['danger', '#fca5a5']]) say(`  Scan badge at night, ${n} ${c}: on the sheet ${need(c, B.night.surface, `2 night badge ${n}`, 3)} · its ink glyph ${need(B.night.background, c, `2 night glyph ${n}`, 3)}`);

say('\n## 3 Ink, more');
for (const [n, fg, bg] of [
  ['punched', '#0b0b0b', '#22c55e'], ['card full', '#0b0b0b', GOLD], ['calm refusal', '#0b0b0b', '#ededed'], ['stop', '#ffffff', '#dc2626'],
  ['punched, night', '#0b0b0b', '#4ade80'], ['calm refusal, night', '#0b0b0b', '#d4d4d4'], ['stop, night', '#0b0b0b', '#f87171'],
]) say(`  Scan signal, ${n}: ${need(fg, bg, `3 signal ${n}`)}`);
// A surface in the owner's own card colour carries black or white, whichever
// is further. Over every grey, the worse of the two best answers:
let worst = 99, at = '';
for (let v = 0; v < 256; v++) {
  const h = '#' + [v, v, v].map((x) => x.toString(16).padStart(2, '0')).join('');
  const r = Math.max(ratio('#000000', h), ratio('#ffffff', h));
  if (r < worst) [worst, at] = [r, h];
}
say(`  black or white on any card colour, worst case: ${two(worst)} at ${at}`);

// ── The four sites, as measured on 17 Oct 2026 ────────────────────────────
say('\n## The references');
for (const [n, fg, bg] of [
  ['Calendly navy on its page', '#071a31', '#fcfbf8'], ['Calendly lead', '#5f6d77', '#fcfbf8'],
  ['CleanShot white on blue', '#ffffff', '#0d44e8'], ['CleanShot ink on white', '#161618', '#ffffff'],
  ['Slite ink', '#3f434a', '#fdfdfd'], ['Slite white on coral', '#ffffff', '#f67748'],
]) say(`  ${n}: ${info(fg, bg)}`);

// ── Hue: can a brand colour be mistaken for a state? ──────────────────────
say('\n## OKLCH');
for (const [n, h] of [
  ['ok', '#047857'], ['warn', '#92400e'], ['danger', '#b91c1c'], ['reward text', '#845209'], ['gold', GOLD],
  ['1 coral', '#f67748'], ['1 coral as text (not used)', '#ad3f19'], ['1 coral, night', '#ff8a5c'], ['2 violet', '#5b41e6'],
]) {
  const [L, C, H] = oklch(h);
  say(`  ${n.padEnd(28)} ${h}  L ${L.toFixed(2)}  C ${C.toFixed(3)}  h ${H.toFixed(0)}°`);
}

if (process.argv.includes('--check')) console.log(fails.join('\n') || 'none');
else console.log(out.join('\n'));
```
