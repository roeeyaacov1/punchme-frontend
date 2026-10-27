# The landing page

Phase 9, step A of `docs/redesign/guide.md`: `/`. Diagnosed and written on
27 Oct 2026 with Taste's `redesign-existing-projects` (as an auditor only),
`/improve-animations` (plan only), `/impeccable critique` and
`/impeccable audit`, Taste's `design-taste-frontend` (the Design Read) and
`/impeccable shape` (mode: Persuade). No code changed. Step B builds it on
Lightbox (DESIGN.md) and `src/components/kit`, in Plan mode, after Phase 4.

The inputs:
- CLAUDE.md, PRODUCT.md, DESIGN.md, `docs/landing-page.md` (what the page
  must keep), `docs/redesign/briefs/visual-world.md` and Roee's answer to D2
  in the guide's §3 (the invented testimonials, the unsourced stats band,
  "Most popular" and "already earning more" stay off until real ones exist);
- the page's code: `src/routes/marketing/LandingPage.tsx`,
  `src/components/marketing/*`, `src/components/motion/useReveal.ts`, and
  `landing.*` in both locale files;
- the kit's pieces a landing page can stage instead of drawing
  (`WallpaperStage`, `StampRow`, `SnapFlash`), the standee
  (`dashboard/Standee.tsx`) and the messages' own copy (`messaging.*`);
- Phase 8's brief on `redesign/public` (`docs/redesign/briefs/public.md`),
  for the sign over the counter and the public frame.

The page was walked signed out, Hebrew first at 375px, then English, and at
1280px, in a headless Chrome of this session's own (debug port 9711, its own
profile), on the dev server on 5201. Windows' animation setting is off on
this PC, so Chrome reports reduced motion; the motion run emulated
`no-preference`. Four sessions share one local API and its throttle of 30
anonymous requests a minute, so every browser here kept to one full load of
`/` every 20 seconds or slower, and switched language, size and scroll in
place.

Two reviewers ran apart for the critique, at the same time, each in its own
headless Chrome and profile:
- **A, design review:** read the code and the copy, and walked the page as
  the barber;
- **B, detector:** ran Impeccable's detector over the page's files and over
  the live page in both languages at both widths.

Four questions went to Roee at the end, with the three dealt structures
drawn on a canvas; his answers are in §8, and §12 keeps the questions as
they were put.

Read "In short" first. Sections 9 to 11 are what step B builds.

1. In short
2. The page today
3. Generic patterns and weak points
4. Motion today, and the plan for step C
5. Critique
6. Audit
7. The Design Read and the dials
8. Decisions made in this step
9. The new page
10. Copy
11. What step B keeps, touches and checks
12. The questions put to Roee
13. Left for other phases, and outside the redesign

---

## 1. In short

- **The page still wears the old world, top to bottom:** `.theme-purple`,
  violet-to-blue gradients on every button that matters, two halos, six
  grounds including three saturated bands and a navy close, Rubik 700, money
  in Plex Mono. It ships three of the five parts of the category's rut and
  most of DESIGN.md's Don'ts (§3). It moves onto Lightbox by day, on the
  kit, with one coral fill and the pass as the only picture.
- **The argument is out of order, and its weakest beats overclaim** (§5,
  8/18). Beat 3 promises "they come back" and shows messages the product
  can't send; the automations list isn't the product's; the Pro list claims
  what's free or doesn't exist; setup skips activation and the SMS code;
  ₪99 first appears twelve phone screens down, without VAT. The calculator,
  the page's best section, never says no, and in Hebrew prints a loss as
  "₪819−".
- **The hero hides the one thing only PunchMe can show.** On a phone the
  pass is under the fold and its stamp lands there unseen; inside the phone
  mock-up it is squeezed to about 216px, against the 300px rule; the English
  pass reads "דנה לוי" (§4, §5).
- **The structure is the counter** (Roee, from Impeccable's roll, §8): the
  first screen is the sign, the customer's pass at 300px and the owner's
  scan, each labelled in the product's own word, and the stamp lands once
  where a phone sees it. Then the sign, the card and the scan in turn, what
  brings them back as the mechanism (each phone, the three real rules, with
  6x and 5–25x beside it), the price as the sign switching on (Free unlit,
  Pro lit, ₪99 including VAT, what stopping does), the owner's own
  arithmetic, allowed to say "don't activate it", and an FAQ that answers
  true. Drawn with the other two dealt structures on a canvas.
- **What's fixed stays fixed:** every figure with its source, the
  calculator's model, tests, link and live region, the anchors (Billing's
  `#calculator` included), every destination, the real `AppleCardPreview`
  from `heroTemplates.ts`, ₪99 with the keys onboarding reads, no tracking.
- **Dials 5 / 4 / 3** (Roee), density one lower than first asked, because
  DESIGN.md's landing rhythm is Taste's 1–3 (§7). Motion is lights on, four
  named moments, one loop (§4).
- **Roee's other two answers** (§8): the FAQ answers a new phone with what
  the product already does, so no "message us" and no contact line until
  there is a WhatsApp number; and no section shows onboarding.

## 2. The page today

### What it shows

Twelve blocks under one sticky header, on the old `.theme-purple` scope
(`LandingPage.tsx:68`): hero, `#paper-cards`, `#proof`, `#push`,
`#how-it-works`, `#dashboard` (the app showcase), `#calculator`,
`#automation`, `#pricing`, `#faq`, the closing call and the footer.
`docs/landing-page.md` lists what each says. The order is the argument the
page's own comment gives (`LandingPage.tsx:29-32`): paper is dead, the
evidence, what brings them back, setup, what you get, your own arithmetic.

| | 375px | 1280px |
|---|---|---|
| Page height, Hebrew / English | 11,716 / 12,169px | 8,958 / 9,038px |
| First screen | The "הדור הבא" pill, the headline, a 27-word lead (31 in English), two buttons, three bullets; the "עובד עם" strip at the fold | A split hero: copy at the start, the phone at the end, the pass inside it |
| Where the pass is | Its phone starts at y≈780 of an 812px screen and the pass at 931: under the fold | In the first screen |
| Grounds, top to bottom | White, lavender wash twice, violet, white, indigo, white twice, a royal-blue gradient, wash, navy twice | The same |

Measured on the dev server: the hero's largest paint is the logo, at 380ms,
because the headline fades in from nothing. The production build ships the
whole app to `/`: one 1,079 kB script (331 kB gzipped) and 112 kB of CSS (20
kB gzipped), the dashboard, the wizard and admin included. Phase 8's step B
splits the bundle by route group (its brief, decision 4), which this phase
inherits.

### What other pages take from it

Changing the landing page's files or keys touches these, so step B keeps
them working or moves them along:
- **Keys:** `landing.nav.skipToContent` (`DashboardLayout`,
  `OnboardingLayout`, `/style-guide`), `landing.nav.signIn` (onboarding's
  `TopBar`), `landing.pricing.pro.price` (onboarding's `BillingStep`, and
  `/style-guide`), and on `/style-guide` also `landing.proof.title`,
  `landing.proof.stats.0.*`, `landing.pricing.pro.name`,
  `landing.pricing.body`, `landing.hero.cta`, `landing.hero.headline`,
  `landing.hero.subheadline`, `landing.nav.designCta` and
  `landing.templates.*`. `docs/landing-page.md` still says Billing reads
  `landing.pricing.pro.price` and `.per`; since Phase 7 it doesn't (it
  imports `PUNCHME_MONTHLY_PRICE`), so `.per` is the landing page's alone.
- **Code:** `PUNCHME_MONTHLY_PRICE` in `calculator.ts` (eight dashboard
  files, the tour, `prices.test.ts`); `HERO_TEMPLATES` and `heroDesignDoc`
  (`/style-guide`'s stage and snap sections); `PunchMark` and `PunchRow`
  (the standee and onboarding's billing step); `marketing/primitives`
  (nineteen files: sign-in, onboarding, the public pages, the old dashboard
  primitives).
- **The anchor:** Billing links to `/#calculator`, and the page scrolls to a
  hash's section once it and its fonts are in (`LandingPage.tsx:47-63`,
  added in Phase 7's step D).

## 3. Generic patterns and weak points

Taste's `redesign-existing-projects`, used as an auditor only. Its own fixes
are not proposed where CLAUDE.md overrides them: Geist or Satoshi (no
Hebrew), Phosphor (lucide-react stays), grain and glass (DESIGN.md forbids
both), picsum photos and "organic" numbers (fabrication here), dark mode on
every page (D8). Checked at 375 and 1280, in Hebrew and English.

**The look is the category's, in AI's favourite colours**
- **T1. A violet-to-blue gradient wherever something matters:** the main
  call to action, with a violet glow under it (`grad-cta`,
  `primitives.tsx:232-233`); the hero's pill (`Hero.tsx:71`); both paper
  cards (`PaperCards.tsx:23`, `:30`); the mock dashboard's tile
  (`AppShowcase.tsx:121`). Then a red-to-orange pair for the pricing buttons
  and the Pro pill (`grad-warm`, `PricingBand.tsx:136`, `:167`), and a
  violet bloom behind the phone and behind the closing call (`hero-bloom`,
  `index.css:1427`). Five accents (violet, blue, magenta, red-orange, gold),
  where Lightbox has one fill.
- **T2. Six grounds down one page** (white, a lavender wash, violet,
  indigo, a royal-blue gradient, navy; the table above). The page marks a
  change of subject by inverting the section (`primitives.tsx:33-38` says
  so); Taste calls that a theme flip, and Lightbox has one wall with lit
  panels on it, its night kept for the dashboard.
- **T3. The hero is the category's template:** a split hero, a "next
  generation" pill over the headline, a filled button beside a ghost one, a
  row of trust bullets, a "works with" strip, a phone with floating icon
  chips and a glow. `visual-world.md` §11 names the category's rut (a
  gradient hero with a phone, a logo wall, a testimonial carousel, three
  feature cards, pricing tiers); the page still ships three of the five.
- **T4. The hero holds six text groups** where Taste allows four (the pill,
  the headline, the lead, the buttons; the bullets and the wallet strip are
  its named bans), and the lead runs 31 words in English and 27 in Hebrew
  against a budget of 20.
- **T5. Three equal cards, numbered 1-2-3** (`HowItWorks.tsx:42`), that lift
  on hover and go nowhere (`cardHover`, `primitives.tsx:201-202`).
- **T6. Heading beside an object, four times** (paper cards, push, the app
  showcase, automation), the copy at the start and the object at the end
  every time, plus a list, three cards, a centred pair and an accordion.
- **T7. A short accent bar under nine headings** (`primitives.tsx:150-160`,
  `AppShowcase.tsx:79`, `PricingBand.tsx:45`), drawing itself in: a template
  ornament.
- **T8. Uppercase, tracked micro-labels** (`.t-eyebrow`, `index.css:1125`):
  "WORKS WITH", "YOUR CARD", "WHAT ONE REGULAR IS WORTH", "LEFT OVER", the
  paper cards' "BARBER SHOP", the notifications' senders, the footer's
  headings. Hebrew has no case, so the same labels are 12px bold with 0.04em
  tracking there: a different voice per language.
- **T9. A phone mock-up around the pass** (`LockScreen.tsx`: bezel, island,
  clock, home bar) with two icon chips drifting beside it forever, a coffee
  cup and a star (`Hero.tsx:170-181`). The star means nothing here.
- **T10. A dashboard built from divs** (`AppShowcase.tsx:91-251`): "142"
  active cards, a rising line, "Hi, Ori", Noa Levi and Idan Cohen with masked
  numbers. Taste bans the div-built screenshot and CLAUDE.md the invented
  name and the "realistic" figure. It also draws the violet dashboard Phases
  2, 5, 6 and 7 replaced, so the owner who signs up meets another product.
- **T11. The accordion FAQ** of bordered, shadowed rows with plus icons
  (`Faq.tsx`).

**Type**
- **T12. Rubik 700 at 72px, tracked −0.035em** (`.t-h1`, `index.css:1084`),
  and every h2 at 700 and 44px: the heavy, tight setting Lightbox retired
  for Rubik 500, open. Hebrew drops the tracking and opens the leading
  (`index.css:1155-1169`), but keeps the weight.
- **T13. Money in IBM Plex Mono** (`.t-figure`, `index.css:1148`): every
  figure in the tally, the typed inputs, the net. DESIGN.md: numbers are
  Rubik's tabular figures, Plex Mono sets card codes only.
- **T14. Lines broken at a maqaf:** "קופץ ל-" / "Wallet" in How it works at
  375, "כדי ש-" / "PunchMe" in the calculator's heading at 1280.
- **T15. The HBR figure breaks at 1280:** "פי / ‎–5 / 25" in three lines in
  Hebrew, the dash hanging left of the 5, and "5–" / "25x" in English. Its
  column is 9rem (`ProofBand.tsx:69`) and the figure 64px; at 375 it fits.

**Content**
- **T16. Invented names, against DESIGN.md's "a sample carries its
  trade":** the hero's cards are "Danny's Barbershop / המספרה של דני",
  "Rothschild Coffee / קפה רוטשילד" and "Studio Nine / סטודיו תשע"; then
  "NAILS BY DANA", Hila, Dana and Oren in the notifications, Ori, Noa Levi
  and Idan Cohen in the mock. And the English pass reads "CUSTOMER דנה לוי":
  the hero passes no `holderName` (`HeroCardCarousel.tsx:134-147`), so the
  frozen preview falls back to its Hebrew sample (`CardPreviews.tsx:126`).
  `studio.sampleName` already exists in both languages.
- **T17. Lines in the AI register:** "The next generation of customer
  clubs / הדור הבא של מועדוני הלקוחות" (Next-Gen is on Taste's list), "Here
  is how it works. Simple. / ככה זה עובד. פשוט.", "Simple, fair plans",
  "Automations that work while you do", "Your whole club. From your phone.",
  "Ready to turn one-off customers into regulars?", "Digital loyalty for
  today's small businesses".
- **T18. Eleven em dashes in English and twelve in Hebrew** in `landing.*`,
  and the footer's "© 2026 PunchMe —" in code. The guide took Taste's ban on
  them (§2).
- **T19. Emoji and exclamation marks in the sample notifications** (💪 💅 ✂️,
  "one stamp away!", "in a month!"), and "STUDIO PILATIS", a typo, in the
  Hebrew one.
- **T20. One intent, five labels:** "Start free", "Design your card",
  "התחילו בחינם" and "התחל בחינם", "Go Pro / הצטרפו ל-Pro" and "Create your
  customer club — free" all open `/onboarding`. "Go Pro" lands on the free
  design flow.

**Interaction**
- **T21. Hover isn't kept to pointers that hover:** Tailwind's
  `hoverOnlyWhenSupported` is off (`tailwind.config.js`), so on a phone a tap
  leaves a card lifted and the paper fan spread.
- **T22. Cards that lift on hover and go nowhere** (`#how-it-works`,
  `#pricing`). Lightbox is lit, not lifted: a panel never rises to say it
  matters.
- **T23. `transition-all` on every call to action** (`primitives.tsx:220`)
  and a press of one pixel down, where the kit presses to 0.97.
- **T24. The header frosts the page under it** (`backdrop-blur-md`,
  `SiteHeader.tsx:93`): glass, which DESIGN.md forbids.

**What the skill's "strategic omissions" find**
- No meta description, no Open Graph and an English-only `<title>`
  (`index.html:29`), on a product whose links travel by WhatsApp: a shared
  link to `/` shows no card.
- No Terms, Privacy or Contact. The pages don't exist, and the footer is
  right not to link to 404s (§13).
- In place: the skip link, landmarks, one `h1` and ordered `h2`s, a favicon,
  no cookie banner because nothing is tracked.

## 4. Motion today, and the plan for step C

`/improve-animations`, read-only. The skill writes its plans into `plans/`;
here they live in this section instead, so step C reads one file.

**Recon.** CSS only: keyframes in `tailwind.config.js:187-255` and
`index.css`, one rAF loop (`useAnimatedNumber`,
`RevenueCalculator.tsx:56-83`), timers for the hero's stamp and the
carousel. The page runs on its own two curves, a rise (0.16, 1, 0.3, 1) and
the stamp's overshoot (0.34, 1.4, 0.64, 1), with its own durations, beside
Lightbox's tokens on `:root` (`index.css:439-472`), which it never uses.
Frequency: a landing page is seen a few times by each visitor, so it may
carry the most motion in the product; the calculator's sliders are the one
thing touched dozens of times in a visit.

Seen with motion on, Hebrew at 375 (frames at 0.5, 0.6, 0.7, 1.0, 1.4, 1.7
and 2.6 s after the request): the pill and the headline arrive half-faded at
0.5 s; the lead at 0.6 s; the buttons and bullets by 1.4 s; the bullets'
three marks press in from 1.2 s. The pass takes its stamp at 1.2 s below the
fold, so a phone never sees it.

| # | Severity | Location | Finding | Plan |
|---|---|---|---|---|
| M1 | High | `HeroCardCarousel.tsx:21`, `:56-70`; `Hero.tsx:149` | The page's one orchestrated moment, the pass taking a stamp, fires 1.2 s after load whether or not the pass is on screen: under the fold at 375. Inside the frozen `StampGrid` the new stamp simply appears; the only cue is a 9% white "wake" over the phone (`LockScreen.tsx:115-121`) | The pass in the first screen at 375 (§9.4). The stamp lands when the counter is in view (an IntersectionObserver at 60% visible), once per visit. Since the frozen grid can't animate, the landing is staged beside it, in the scan's answer: its photo snap (`SnapFlash`: the flash clears from 0.85 in 220ms) and the newest stamp landing in its `StampRow` (`land="snap"`: 240ms after 60ms, from 1.45 on `--ease-overshoot`), in the same frame as the pass's count goes up. Reduced motion: the answer already lit (the 0.3 glow over 150ms), the stamp at its final size |
| M2 | High | `Hero.tsx:163-227`; `FinalCta.tsx:23-28`; `tailwind.config.js:200-203`, `:251-254` | Four loops run for as long as the page is open: two floating chips (5 s) and two blooms (14 s), one of them at the foot of the page, off screen. DESIGN.md allows the site one loop, the hero's light breathing every 14 s | Delete the chips and the closing bloom. Keep one breath: the hero's lit panel, opacity 0.85 to 1 over `--duration-breathe` (14 s), ease-in-out, paused when the hero is out of view (IntersectionObserver) and still under reduced motion |
| M3 | High | `useReveal.ts:84`; `tailwind.config.js:188-191`, `:257` | Everything rises 24px over 700ms (`fade-up`): headings, rows, cards, FAQ rows, plans, the hero's six groups in a 430ms cascade. Lightbox arrives by light, not by travel: 240ms, 8px at most | Each section's panel arrives as `LitPanel`'s `arrive` does (`animate-lights-on`: 240ms, translateY 8px to none, `--ease-out-strong`), triggered by `useReveal`'s observer. One reveal per section's panel, not per row; a stagger of 40ms over at most four items. The hero's headline and its button arrive together, with no stagger (its largest paint should be the headline, not the logo) |
| M4 | Medium | `PaperCards.tsx:127`; `PushBand.tsx:110` | The stamp's overshoot deals the paper cards and drops the notifications: the curve DESIGN.md keeps for a stamp | A notification arrives as one does: from 8px above, lights on in 240ms on `--ease-out-strong`. The overshoot only ever on a stamp |
| M5 | Medium | `index.css:1335-1349`; `HeroCardCarousel.tsx:129`; `LockScreen.tsx:106` | Reduced motion means none: the blanket `animation: none` and `motion-reduce:transition-none` turn the carousel's crossfade and the wallpaper's into cuts | The kit's `useReducedMotion` (`kit/motion.ts`) decides in JS, and every stand-in is the 150ms `gentle` fade |
| M6 | Medium | `HeroCardCarousel.tsx:129`; `LockScreen.tsx:106` | The trades crossfade over 500ms, two passes double-exposed for half a second | `duration-crossfade` (300ms), ease-in-out (`--ease-in-out-strong`) |
| M7 | Medium | `primitives.tsx:220` | `transition-all duration-150` on every call to action | The kit's `Button` and `LinkButton`: transform and colour only, a press to 0.97 in 120ms (`--duration-press`), a tint instead under reduced motion |
| M8 | Medium | `tailwind.config.js`; `primitives.tsx:190`, `:202`; `PaperCards.tsx:25`, `:36` | Hover motion fires on touch and sticks | No hover motion on cards at all (lit, not lifted). The CTA's arrow nudge only under `@media (hover: hover) and (pointer: fine)` |
| M9 | Low | `RevenueCalculator.tsx:280-286`, `:539-556` | Seven figures each ease over 400ms on their own rAF loop while a slider is dragged; the phone's drag bar shows the target, so mid-drag the two disagree | Keep the 400ms ease (the contract's), and let the drag bar read the same eased values |
| M10 | Low | `RevenueCalculator.tsx:374-378` | The "Fine-tune" chevron turns under reduced motion (a known gap in `docs/landing-page.md`) | It flips with no turn under reduced motion |
| M11 | Low | `primitives.tsx:150-160` | The accent bar draws itself under nine headings | Goes with the bar (T7) |

**Missed moments, each once, in view:**
- **A message arrives** on the lock screen in the "what brings them back"
  section: the kit's `WallpaperStage` notification lights on from 8px above
  (240ms), then holds. Reduced motion: `gentle-in`.
- **The sign switches on** where the page says what Pro does: Free is the
  sign designed but unlit, Pro lights it (`visual-world.md` §4, "Pro switches
  the sign on"). DESIGN.md's one ceremony, `sign-catch` over 600ms after
  400ms unlit, once; `sign-on` (150ms) under reduced motion.
- **The verdict turns** when the calculator crosses zero: the "you would need
  N regulars" panel lights on in 240ms, and the live region says it. Today
  the total only turns red.
- **The phone's drag bar** rises on the drawer curve (`sheet-rise`, 300ms)
  and leaves in 180ms (`sheet-fall`), instead of appearing.
- **The phone menu** comes in from the end edge as the kit's sheet does
  (`drawer-in`, 300ms, mirrored in Hebrew), with a real focus trap.

Nothing here counts a sourced number up, and the stamp lands once.

## 5. Critique

23/36, Acceptable (64%). Heuristic 7, flexibility and efficiency, doesn't
apply to a page read once, so the total is out of 36. The scores
are A's. The detector agreed with A on the look and added three things A
hadn't measured (§6); A found the two worst things on the page, neither of
which a detector can see: what the copy claims, and what the calculator
won't say. The snapshot is in `.impeccable/critique/`, left untracked to be
committed with the review, as Phases 7 and 8 did, for step D's
`/impeccable polish`. It is the first run for this target.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | The tally updates live and pins a bar while a slider is held; the presets never show which one is on (no `aria-pressed`, the same classes); the hero's stamp lands off screen on a phone |
| 2 | Match with the real world | 2 | The receipt and "מועדון לקוחות" are the owner's language; the reward is פרס, תגמול, בונוס and מתנה but never הטבה, the stamp mostly ניקוב; "Push", "Win-Back", "Dashboard", "אנליטיקס" in Latin |
| 3 | User control and freedom | 3 | A tab stops the carousel, Escape closes the menu; focus falls to `<body>` after Escape; the reward's reasoning can't be opened by touch or keyboard |
| 4 | Consistency and standards | 2 | One destination, five labels, three button styles (a violet gradient, solid violet, red to orange) |
| 5 | Error prevention | 3 | Inputs clamp and settle on blur, unexplained; "Go Pro" can't charge anyone, because it only opens the design flow |
| 6 | Recognition rather than recall | 3 | Labelled sliders and anchors; the price has to be hunted, 11.7 phone screens down |
| 7 | Flexibility and efficiency | n/a | A page read once; its one accelerator, the calculator's shareable link, works |
| 8 | Aesthetic and minimalist design | 2 | Three saturated bands, two gradients, a halo, floating chips, tilted cards and an invented dashboard; the loudest thing after the hero is the dashboard, the very thing this reader fears paying for |
| 9 | Error recovery | 3 | A loss is stated in place, but its next step is "drag the slider up" |
| 10 | Help and documentation | 2 | The FAQ misses cancelling, Android, what a customer gives, and how to reach anyone; "message us" leads nowhere |
| | **Total** | **23/36** | |

**Specificity.** The look and the structure belong to the category: the
gradient badge, the halo behind a phone, a split hero over a badge row,
three equal steps, three saturated bands, two tiers and a dark close with a
second halo (§3). Swap the pass and the copy and any SaaS could ship it.
Four things are PunchMe's alone, and the rebuild keeps them:
1. **the real pass** from real presets, taking one stamp, with the trades
   named so an owner can answer "is this for my kind of shop?";
2. **the calculator as a till receipt**, which prints a negative number;
3. **the evidence as a reference list**, each figure printed with its
   caveat and its source;
4. **the punch as the page's one mark**, always one visit.

**The detector** agrees on the look (violet gradients ×8, both halos, a
violet glow on navy) and adds what A didn't measure: 3.9:1 on the mock's
small label, 4.43:1 for the pricing lead at the band's lower stop, and 9–11px
type in the mock. Its stripes, wallpaper glow, nested cards and occlusion
are false (§6).

### The argument, beat by beat

8/18 (A). The page's own comment gives the right order
(`LandingPage.tsx:29-32`); the page doesn't follow it. Beat 3 is split
around the calculator, and the arithmetic (6) comes before the price (5):

hero → ① `#paper-cards` → ② `#proof` → ③ `#push` → ④ `#how-it-works` → the
dashboard → ⑥ `#calculator` → ③ `#automation` → ⑤ `#pricing` → FAQ → close.

| Beat | Score | What's wrong |
|---|---|---|
| ① Paper cards are over | 1/3 | It asserts and doesn't show: the one fact behind it, Harris's 79% "no physical card", sits in beat 2. The body promises a result ("it is time every customer who walks in becomes a regular") and puts the card "in front of their eyes" where a pass sits in Wallet. The "paper" cards are glossy gradients that look like digital gift cards, one under an invented name; "תספורת 10 חינם" is broken Hebrew. The real pain, a lapsed customer you can't reach, is the hinge into beat 3 and goes unused |
| ② The evidence | 2/3 | Strong form: printed, cited, caveated. But HBR's context line invents a product claim ("a card that earns the next ten"); Square's US data is said to be "like yours"; Harris is half-quoted (its own headline, in the cited URL, pairs app downloads with collecting personal data, and PunchMe asks for a mobile number); "5–25x" breaks at 1280. And all three prove the prize, none the mechanism |
| ③ What brings them back | 1/3 | "Send a message. They come back." promises a result. The samples show what the product can't do: a "one stamp away" trigger (the rules are `inactive`, `birthday`, `reward_waiting`, `messaging.ts:24`), a broadcast greeting by name (refused, `messaging.editor.unsupportedPlaceholder`), percent-off coupons (a gift is a stamp or a full card). All three are iPhone banners, unlabelled, and the FAQ says both phones "update the same way". The automations list a broadcast as an automation, the win-back rule twice, and misses birthday and reward waiting. Nothing says offers reach only those who ticked the marketing box. "They keep running whether or not you open the dashboard", the best answer to this reader's fear, sits in section 8 |
| ④ Setup | 1/3 | Three generic steps that skip the two real ones: activation, and the customer's mobile number and SMS code. "Ready in a minute" and "Live in minutes" have no source. "צור / בחר / סרוק" breaks the plural voice. The two true reassurances, seeing the card on your own phone before paying and a printed sign for the counter, are absent. Then a band sells an invented dashboard under "all in one simple app", on a page whose promise is "no app" |
| ⑤ The price | 1/3 | Stated correctly but late: "₪99" first appears about 9,500px down on a phone, with no "including VAT". The Pro list claims "Unlimited customers" (a word the brand avoids), "Analytics and performance reports" (no such feature) and "Full custom branding" (free), and omits what Pro really opens: customers can join, the sign prints, referrals. Nothing on stopping, or on what happens to the cards if you do |
| ⑥ Your own arithmetic | 2/3 | The best section on the page: a price turned into a count of people, a receipt, a result never clamped, a shareable link. But it never says "don't buy": a loss coaches ("drag the last slider up"), the worst case still reads "75 regulars cover a whole year" over "−₪819", and the lead answers in advance ("Fewer than you would think"). The headline doesn't say *new* regulars. The reward's reasoning is a hover. In Hebrew every negative prints its minus on the wrong side, "₪819−", because `.t-figure` isolates without a direction (`index.css:1148-1153`); and "₪1188" in the sentence beside "₪1,188" in the tally |

### Priority issues

1. **[P1] Claims the product doesn't back, in beats 3, 4 and 5.** "They
   come back"; two of three sample messages showing a trigger or a
   greeting the product refuses; iPhone-only banners and "both update the
   same way"; a wrong automation list; a padded Pro list; setup-time lines;
   a product claim hung on a cited figure; the SMS step never mentioned.
   This is the beat the burned barber tests, and one false detail costs the
   whole page. Fixed in §9 and §10: the mechanism instead of the result,
   the three real rules, what each phone does, the Pro list from PRODUCT.md.
2. **[P1] The arithmetic never says no, and in Hebrew misprints its no.**
   The page's own thesis is that this section is "allowed to talk you out
   of it" (`LandingPage.tsx:31-32`); today it talks the owner back in. Fixed
   in §9.8 and §10, with the model and the negative result as they are.
3. **[P1] The argument runs out of order and hides the price:** six beats
   out of sequence, ₪99 twelve screens down without VAT, and "it runs
   without you" buried. Fixed by the structure (§8, §9.3) and the hero's
   lead (§9.4).
4. **[P1] The hero wears the category's kit and hides the one thing only
   PunchMe can show.** At 375 the pass starts 119px under the fold, its
   stamp lands there unseen, and inside the phone mock-up it is squeezed to
   about 216px, against the 300px slot rule (DESIGN.md). The English pass
   shows "דנה לוי". Fixed in §9.4.
5. **[P2] The Hebrew reads as translated:** singular masculine in four
   places ("צור", "כל המועדון שלך", "התחל בחינם", "איך אני מוסיף ניקוב?"),
   people without slash forms, the reward and the stamp under five and two
   names, "Dashboard" in Latin, a prefix torn from its word at a line break.
   Fixed in §10.

**Personas** (A walked four):
- **Jordan, first visit:** nothing shows the customer's side, scan, number,
  code, Add to Wallet; placeholder wallet glyphs; "Push", "Win-Back",
  "Gross margin"; "Go Pro" opens a design wizard; the ⓘ does nothing on a
  tap; "message us", with no way to.
- **Riley, stress test:** 1000 becomes 500 in silence; "4 regulars cover a
  whole year" over "−₪819"; Android raises no alert; "Hi {name}" is refused
  by the composer the page advertised; "₪819−"; "142 active cards", whose?
- **Casey, one hand:** the first screen has no product; 11,716px of page,
  the arithmetic eight screens down and the price twelve; the cost's
  reasoning needs a hover; the stamp row in "your card" wraps 7 + 3. Good:
  44px targets, a numeric keypad, the pinned result bar.
- **The burned barber** (from PRODUCT.md's Users): "Start free" three times
  and no number for twelve screens; "they come back", the line that burned
  him; a band selling the dashboard he fears; nothing on cancelling or on
  his customers' cards if he stops; no contact anywhere; a calculator that
  credits PunchMe with regulars he already has; a free cut that costs him a
  chair slot, not "one item"; and the SMS step discovered at the counter
  with a customer waiting.

**Strengths, kept:**
- the arithmetic's honest core: the reward at cost of goods, a net never
  clamped, one debounced announcement, "nothing leaves your browser" true
  because nothing is tracked, the pricing echo only after a real, positive
  result;
- the evidence set as citations: printed, caveated, 44px links;
- the product as its own proof: a real pass from real presets, named by
  trade.

**Minor** (A): "גם לך" is singular where the rest says "שלכם"; self-praise
("Simple, fair plans", "Simple.", "The next generation"); English without
contractions, so it reads translated; PRODUCT.md's terms ("הודעות
ללקוחות", "כללים אוטומטיים", "שילוט") never used; "פאנץ' מי" in the footer
and "PunchMe" everywhere else; "How many regulars does PunchMe need" (the
owner needs them, not PunchMe); two 401s in the console for every signed-out
visit, from `src/auth`'s boot check (§13).

## 6. Audit

9/20, Poor: the page is sound underneath (no overflow, 44px targets,
headings, focus rings, the calculator's live region), and the rest is the
old system and the copy.

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | The phone menu is a dialog with no name, no trap and no way back; the trade tabs have no panel and no arrow keys; the reward's explanation lives in a `title`, which a phone and a keyboard never show; new tabs open unannounced |
| 2 | Performance | 2 | The whole app on `/`: 331 kB of script gzipped; four font families where the page needs two; four loops forever; a frosted sticky header |
| 3 | Theming | 1 | The old violet scope, gradient and glow literals, the raw red palette for the calculator's loss, hard-coded hexes in the mocks |
| 4 | Responsive | 3 | No overflow and no overflowing text at 375 or 1280 in either language (B); the HBR figure breaks at 1280; the pass under the fold at 375; hover sticks on touch |
| 5 | Implementation integrity | 1 | A system DESIGN.md has replaced, invented names and figures, and lines the product doesn't back (§5) |

**The detector** (B, kept apart until A was in):
- **CLI**, over `routes/marketing`, `components/marketing` and
  `components/motion`: no anti-patterns, eight advisories, all real. Seven
  are 9–11px type in the dashboard mock (`AppShowcase.tsx:139`, `:192`,
  `:203`, `:214`, `:224`, `:231`, `:243`), under DESIGN.md's smallest step
  of 13px. One is `#0b0d16`, the phone's wallpaper floor
  (`LockScreen.tsx:45`), a colour DESIGN.md doesn't have.
- **Live, over CDP**, four scans (Hebrew and English, 375 and 1280):
  15–18 findings each, the same in every language and width.
  - Real: `ai-color-palette` ×8 (the hero's pill and button, both paper
    cards, the mock's tile, both blooms, the closing button);
    `radial-spotlight-glow` on both blooms; `dark-glow` on the closing
    button, a violet glow on navy.
  - Real, contrast: 3.9:1 for the 12px "active cards" label on the mock's
    magenta (`AppShowcase.tsx:126`), aria-hidden but under CLAUDE.md's "all
    text meets AA"; 4.43–4.64:1 for the pricing lead on the band's two
    stops, a hair under the line at the bottom one (`PricingBand.tsx:52`).
  - False: `repeating-stripes-gradient` (the pass's own stripes,
    `cardPatterns.ts`), the lock screen's wallpaper "glow", `nested-cards`
    on the frozen pass in its frame, and a `text-occlusion` caught in the
    middle of a crossfade (gone with the rotation stopped).
- **No overlay:** the pane was hidden, so nothing was injected into a tab
  anyone could see.

**Detailed findings**
- **[P1] The phone menu** (`SiteHeader.tsx:204-291`, a known gap): a
  `role="dialog"` with no name, Tab walks out of it eight presses later onto
  the hero's link behind it (seen, signed in), and Escape leaves focus where
  it fell instead of on the menu button. WCAG 2.4.3, 4.1.2.
- **[P1] The reward's explanation is unreachable on a phone:** "a reward is
  costed at what the free item costs you to provide" is only a `title` and
  an `aria-label` on a 14px info icon (`RevenueCalculator.tsx:466-483`). A
  tap shows nothing, nor does keyboard focus; a screen reader hears it.
  This is the sentence that makes the calculator honest.
  `landing.calculator.result.rewardCostWhy` ("Why the rewards cost so
  little") was written for it and is used nowhere.
- **[P2] The trade tabs** (`HeroCardCarousel.tsx:157-183`, a known gap):
  `role="tab"` with no `aria-controls`, no tabpanel and no arrow keys. The
  kit's `Tabs` has the roving pattern.
- **[P2] Citations open a new tab without saying so** (`ProofBand.tsx:78-95`,
  a known gap). WCAG 3.2.5 (advisory), and a surprise on a phone.
- **[P2] The pass says nothing useful to a screen reader:** the active slide
  is read as its parts ("Danny's Barbershop", "CUSTOMER", "דנה לוי",
  "VISITS", "8"). The kit's `WallpaperStage` takes a one-line `summary` for
  exactly this.
- **[P2] The loss is a red stripe on a pink wash**
  (`RevenueCalculator.tsx:514-520`): a 4px coloured side border, which
  Impeccable's floor bans, in the raw palette (`text-red-800`, `bg-red-50`,
  `border-red-800`, `text-red-900`, also `:503`, `:550`). DESIGN.md: an
  error is its words and its icon on a plain panel.
- **[P2] The whole app ships to `/`** (§2), and `index.html` loads IBM Plex
  Mono and Roboto for every page: the landing page needs neither once
  figures are Rubik and no Google pass is shown. Phase 8 splits the bundle;
  the fonts stay shared (§13).
- **[P2] Four loops for as long as the page is open**, two of them blooms
  of up to 34rem, one off screen (§4, M2), and a `backdrop-blur-md` header
  repainting on every scroll.
- **[P3] Emoji in the sample notifications are read aloud** ("flexed
  biceps"), and the banners aren't hidden from assistive tech.
- **[P3] The tab's title stays English** in Hebrew ("PunchMe — Digital
  Loyalty Cards"), and there is no description or Open Graph (§3).
- **[P3] The drag bar opens for a typed number too:** it starts on any
  pointerdown on an `INPUT` (`RevenueCalculator.tsx:307-309`), number
  fields included, and rises with the phone's keyboard.
- **[P3] Dead keys:** `landing.example.*` and
  `landing.calculator.result.rewardCostWhy` are used nowhere.

**The known gaps in `docs/landing-page.md`**, each confirmed:
- the phone menu's name, trap and focus return (above, P1);
- the carousel tabs' `aria-controls` and arrow keys (above, P2);
- citation links opening a new tab unannounced (above, P2);
- the "Fine-tune" chevron turning under reduced motion (§4, M10).

And two lines in the contract that are no longer true, for step B to
correct with it: Billing doesn't read `landing.pricing.pro.price` or `.per`
any more (§2), and `landing.pricing.price` is no longer used by the
onboarding billing step, which reads `landing.pricing.pro.price` since
`b8bc369`.

**Positive, and kept:**
- the skip link, one `h1` and ordered `h2`s, landmarks, `focusRing` on every
  control, 44px targets including the sliders;
- the calculator's debounced live region, each slider's `aria-valuetext`,
  and figures isolated in Hebrew;
- no horizontal overflow and no clipped text anywhere (B's probe);
- reduced motion answered in JavaScript: everything visible at once, the
  stamp already landed, numbers that jump;
- the header waits for the session instead of flickering, and the hash
  scroll that lands Billing's link on `#calculator`.

## 7. The Design Read and the dials

Taste's `design-taste-frontend`, inside DESIGN.md's system.

> **Reading this as:** an overhaul of a Hebrew-first, phone-first landing
> page for sceptical Israeli solo shop owners, in a calm, candid,
> show-don't-tell language, leaning toward the project's own Lightbox system
> (a lit sign on a warm wall; Rubik 500 and Assistant; one coral fill) on
> Tailwind 3.4 and CSS motion, with the real wallet pass and the product's
> own components as the only pictures.

**Redesign mode:** an overhaul. A new visual language, Lightbox, over the
same truths: the evidence, the calculator, the anchors and the destinations
stay; structure, order, sections, visuals, motion and copy are open.

**The page today reads as** variance 4 (a split hero, then the same split
four times and a centred pair), motion 6 (everything rises, four loops,
dealt cards and dropped banners, a staged hero), density 4.

Roee took these on 27 Oct (§8).

| Dial | Asked | Set | Why |
|---|---|---|---|
| DESIGN_VARIANCE | 5 | **5** | The page is an argument read in order. Offsets, one asymmetric composition per section and a start-aligned hero are enough, and each one has to mirror in Hebrew and fold to one column at 375 anyway. Above 5 the layout spends the reader's attention the claim needs. At 5 Taste's anti-centre rule binds: the hero is not centred |
| MOTION_INTENSITY | 4 | **4** | Today's page runs at about 6, and its motion is half of what makes it read as a template. Lightbox's lights-on is a 4. But at 4 a builder may leave the product's verbs as stills, so four moments are named and must happen, each once and in view: the stamp landing, a message arriving, the sign switching on, the hero's one breath (§4) |
| VISUAL_DENSITY | 4 | **3** | Taste's 4 is 64–96px between sections. DESIGN.md sets the landing page's rhythm at 128–160px on a desktop and 80–96px on a phone, "one product piece per card", which is Taste's 1–3, and DESIGN.md outranks the skill (CLAUDE.md, "Design skills"). Inside the calculator, a working tool, density stays the kit's: 48px fields, 20–24px insets |

**Taste's defaults that don't apply here** (CLAUDE.md wins): Geist,
Satoshi, Outfit and Cabinet Grotesk (no Hebrew; Rubik and Assistant stay, on
Google Fonts); Phosphor (lucide-react); Motion and GSAP (CSS, the kit's
tokens); Tailwind 4 (3.4); `next/font` (a `<link>` in `index.html`); dark
mode on every page (the landing page is light, D8); generated or picsum
photography, "organic" numbers, invented brand names and SVG logo walls
(fabrication; the pass and the product's own components are the pictures).

**Taste's checks that bind step B:**
- no em dash anywhere on the page, in either language;
- one theme, light, and one accent, the coral fill, on every section;
- one shape system, DESIGN.md's (pills; 24, 32 and 40px panels);
- every call to action on one line at 1280, and one label per intent;
- a hero of at most four text elements, its lead at most 20 words, its
  button visible without scrolling at 375;
- no eyebrows (Impeccable's floor is stricter than Taste's one in three);
- no three equal cards, no third split in a row, at least four layout
  families across the page;
- no div-built screenshot: what the page shows of the product is the
  product's own component, or nothing;
- no decorative dots, scroll cues, section numbers or version labels;
- every visible string read again before it ships (the copy self-audit).

## 8. Decisions made in this step

| # | Question | Roee's answer (27 Oct) |
|---|---|---|
| 1 | How `/` is laid out | **The counter.** Impeccable's roll (`concept-seed --scope surface --mode persuade`, seed `1ac49613`) dealt positions 7, 4 and 6 of seven ranked structures: the owner's first month (the dealt lead), the counter, and paper against the pass. They were drawn at 375 in Hebrew, in Lightbox, with the real pass, on a canvas ([Landing page structures](https://claude.ai/artifact/BW8v2zeZUvseMYHprDjmwV), private), and he took the counter, the one this brief recommended. §9 builds it; §9.3 keeps a note of the other two |
| 2 | The FAQ's "message us", with no WhatsApp number on any page | **Answer with what the product does today:** on a new phone, scan the sign and join with the same mobile number, and the card comes back with its stamps (`enroll_customer` returns the existing card). No contact line until there is a number (§13) |
| 3 | Whether any section shows onboarding, which Phase 4 is redesigning | **No.** The setup section shows the sign and the card, and "Start free" opens `/onboarding` as today. Nothing on the page depends on Phase 4's screens |
| 4 | The dials | **5 / 4 / 3**, density one step under the 4 first asked, to match DESIGN.md's landing rhythm (§7) |

The seven structures for `/`, ranked in writing before the roll:
1. a card's life: one sample card, named by its trade, followed from the
   counter to the reward beside a stage where the same pass changes, then
   the owner's side;
2. the barber's questions: the owner's objections as the headings, each
   answered by one real piece and, where one exists, a sourced figure;
3. your numbers first: the calculator opens the page, the rest explains its
   number;
4. **the counter:** the opening is the counter itself as three real
   objects, the sign with its code, the customer's phone with the pass, the
   owner's phone with the scan's answer; the page then takes each in turn;
5. one phone, one scroll: one lock screen holds still while the page
   scrolls past it, each section changing what it shows;
6. **paper against the pass:** a running comparison, the paper card on one
   side and the pass on the other, then the price and the arithmetic;
7. **the owner's first month:** the owner's side as a sequence of firsts,
   design today, the sign on the counter, the first stamp, the first
   message, the first reward, ending in the price and the arithmetic.

The rut, kept off the list: a gradient hero with a phone, a logo wall, a
testimonial carousel, three feature cards and pricing tiers (the page keeps
three of the five today), and its predictable opposite, a brutalist
receipt-paper "honest" page.

**Why the counter.** Its first screen is the mechanism itself, at the
owner's own counter, and the pass stands in it at 300px where a phone sees
it, so its stamp lands in view: §5's fourth P1 and §4's M1 are fixed by
construction. It is Lightbox at home ("the lightbox over the door, the
letter board in the café, the standee on the counter that PunchMe already
prints", `visual-world.md` §4), and it meets the customer's side where Phase
8 put it: a customer who scans that sign lands on `/join`, which is that
sign (Phase 8's brief, decision 1). The argument's order and the price, its
two weak points, are fixed inside it (§9.3, §9.4). **The owner's first
month** is the strongest long read: the price second, before any customer,
and every first in order, ending on the owner's own arithmetic. But its
first screen shows a card being designed, not used, and the stamp waits
four sections. **Paper against the pass** makes beat one the whole page and
has the most honest price row ("a paper card costs almost nothing; that is
its advantage"), but it is the category's "us against them" table, and it
says least about setup and the counter.

**The challengers** the roll dealt are catalog worlds (a torn billboard, a
Busytown cross-section, a sneaker-box wall, an alphabet storm, a teletext
magazine, an algorave floor). The world is settled, so all six are
declined, and two disciplines are kept:
- **from the Busytown cross-section, every object wears its printed
  label:** on the counter, the sign, the pass and the scan each carry the
  product's own word in one tag size (שילוט, הכרטיסייה בארנק, סריקה), so the
  first screen teaches the glossary;
- **from the algorave floor, a change is visible before it lands:** each
  automatic rule is shown with the product's own sentence for who gets it
  and when (`messaging.sentence.birthday`: "בשעה 10:00, ביום ההולדת: כל
  לקוח/ה שמסר/ה תאריך לידה."), never as a promise that someone comes back.

The torn billboard is paper, which Lightbox isn't; the teletext page's
"the row is sacred, small screens scale the cell" is already the 300px slot
rule.

**Decided in this brief, for the review to overturn:**
- **No auto-rotation.** The hero shows one trade and the visitor switches;
  the moment plays once, in view (§9.4).
- **No dashboard band.** The owner's side appears as what the owner does at
  the counter, the scan's answer, built from the kit, and as "it runs
  without you". The invented "142" goes with the mock.
- **The evidence stands beside what it proves,** each figure still a
  citation with its caveat and its link (§9.5, §9.6), and the Harris line
  gains its other half (§10).
- **The price is in the hero's lead,** with VAT.
- **The calculator says no** in plain words when the year is a loss, and
  counts *new* regulars.
- **Samples carry their trade, never a name,** and every sample message or
  card is labelled as a sample.
- **One theme, light, to the footer:** no saturated bands, no navy close.
- **No wallet badges** until the official files exist (`WalletMarks.tsx`'s
  placeholders go); "Apple Wallet" and "Google Wallet" are said in words.

## 9. The new page

### 9.1 What is fixed

From the prompt, `docs/landing-page.md` and CLAUDE.md:
- **Every number keeps its visible, clickable source** (`sources.ts`), its
  caveat, and is printed, never counted up.
- **The calculator's model, tests, URL contract, live region and negative
  result:** `calculator.ts` and `calculator.test.ts` unchanged;
  `?ticket=&stamps=&regulars=&margin=` restores a result on load and is
  rewritten only after a real interaction; one announcement 500ms after the last
  change; a loss shown as a loss; the 400ms ease on the figures, a jump
  under reduced motion; the phone's bar while a slider is held; the "based
  on your numbers" line only after a real, positive result.
- **The anchors** `#how-it-works`, `#calculator`, `#pricing`, `#faq` and
  `#main`, and a link from another page landing on its section: Billing's
  `/#calculator` lands 96px from the top under the header, at 375 and 1280,
  in both languages and both motion settings, as Phase 7 left it.
- **Every call to action's destination:** `/onboarding` for starting,
  `/login`, `/dashboard` when signed in, the anchors.
- **The hero's pass is the real `AppleCardPreview`, unchanged,** fed by
  `heroTemplates.ts`, in a 300px slot, never squeezed or redrawn.
- **The price is ₪99 a month including VAT** (`PUNCHME_MONTHLY_PRICE`), and
  `landing.pricing.pro.price` stays where onboarding's billing step reads it,
  or moves in both languages together with `BillingStep.tsx:110` (§11).
- **No tracking.**
- **The header's session behaviour:** neither pair of buttons until the
  session is known; the language toggle storing `i18nextLng`.
- **The Hebrew right-to-left marks** in the strings that keep figures in
  place stay in the strings that keep them.

### 9.2 Lightbox on `/`

The page leaves `.theme-purple` for `.theme-lightbox`, by day only (D8). It
stands outside the dashboard, so no shell claims it: it uses Phase 8's
public frame (`PublicPage`, its brief §7.2) if that has merged, or does the
same thing itself: its root and `<html>` wear `theme-lightbox` while it is
mounted, a `theme-color` meta of the wall goes ahead of `index.html`'s two,
the page sets `document.title` in its language, and it keeps its one
`<main id="main">` and the skip link. Built on the kit only (`Button`,
`LinkButton`, `LitPanel`, `SegmentedControl`, `Tabs`, `Slider`, `StampRow`,
`SnapFlash`, `WallpaperStage`, `Figure`, `Badge`, `Sheet`), never on
`marketing/primitives.tsx`'s `ctaClasses`, `Section`, `SectionHeader`,
`Eyebrow` or `cardHover`, nor on the `t-h1`, `t-h2`, `t-stat`, `t-eyebrow`
or `t-figure` classes.

- **Type:** display (Rubik 500, `clamp(2.75rem, 6vw, 4.5rem)`, 1.14 in
  Hebrew), headline for sections, lead, prose at 17px in Hebrew; every
  number Rubik with tabular figures, in its own `dir="ltr"` element.
- **Colour:** the wall, lit panels, the landing's field light (`LitPanel
  light="field"`) for the hero; coral on the main action only, carrying
  ink; links in ink, underlined; the reward's gold once, on the full card.
- **Rhythm:** 128–160px between sections at 1280, 80–96px at 375 (§7); one
  product piece per panel; 32px corners for tall panels, 40px for the hero.
- **No ornament but the stamp:** no accent bars, no pills over headings, no
  floating chips, no halos.

### 9.3 The structure: the counter

| Order | Section | Anchor | The beat it makes |
|---|---|---|---|
| 1 | The counter (the hero) | – | The offer, the mechanism and the price in one screen; paper is over, said in the headline |
| 2 | How it works: the sign, the card, the scan | `#how-it-works` | Setup, then the customer's side with the 58% and 79%, then the counter |
| 3 | After they leave | – | What brings them back, with 6x and 5–25x |
| 4 | The price: the sign switches on | `#pricing` | Free and Pro, with VAT, and what stopping does |
| 5 | Your own arithmetic | `#calculator` | The owner's numbers, allowed to say no |
| 6 | Before you start | `#faq` | The questions a sceptic asks, answered true |
| 7 | The close and the footer | – | One action, the price beside it |

The header's "What regulars are worth" link moves to `#calculator` as
today. **Under the owner's first month** the same pieces run as chapters:
the hero holds the first day (the pass, unstamped, in the field light),
then activation (§9.7, moved up), the first customers (§9.5's card), the
first stamp (§9.5's scan), the first message (§9.6), the first reward (the
full card, 6x), and the arithmetic last; at 1280 the pass stands in a
sticky column and changes per chapter with a 300ms crossfade, Lightbox's
"pinned chapter panel". **Under paper against the pass** the hero is an
unlit paper card beside the lit pass, then the comparison rows (where it
is, who counts, when someone stops coming, the birthday, what it costs),
the evidence as one list, the arithmetic and the FAQ; setup and the counter
are each one row and a line.

### 9.4 The counter, the first screen

**At 375, Hebrew first,** top to bottom:
- the header (§9.9);
- the headline, at most two lines, start-aligned (§10 has drafts);
- the lead, at most 20 words, carrying the promise and the price: no app,
  no account, no password; free to design; ₪99 a month including VAT, only
  once customers can join;
- the coral "התחילו בחינם" (52px, the full width) and, under it, an ink
  text link to `#calculator`;
- the counter: one lit panel (`LitPanel light="field" radius="hero"`) with
  three real objects, each wearing its label in one tag size:
  - **the pass**, `AppleCardPreview` at 300px, unscaled, its holder
    `studio.sampleName` in the page's language and its name the trade
    ("מספרה"), centred;
  - **the sign**, the standee's own `StandeeSheet` (`single`, the table
    tent or the A4) at thumbnail size, standing at the start edge,
    overlapping the pass's lower corner; its code never leads to a join
    page that doesn't exist (render it `active: false`, or point it at
    `/`);
  - **the scan's answer**, built from the kit as the Scan page builds it
    (`LitPanel light="punched"` with "נוספה חותמת", the count and a
    `StampRow`, at the size the overlap allows), at the end edge,
    overlapping the pass's upper corner;
- under the panel, the trade switch (`SegmentedControl`: מספרה, בית קפה,
  סטודיו), which repaints all three objects with that trade's card;
- **the moment,** once per visit when the panel is 60% in view: the answer
  lights with the scan's photo snap (`SnapFlash`), the newest stamp lands
  in its `StampRow` (`land="snap"`), and in the same frame the pass's count
  goes up by one, as Wallet updates it. Reduced motion: the answer already
  lit, the stamp already landed, a 150ms fade.

The pass's stamp row has to sit above the fold at 375×812 in Hebrew;
step B measures it. A screen reader hears the panel as one summary ("A
barbershop's card in Apple Wallet with 8 of 10 stamps; the sign by the till;
the owner's phone showing 'stamp added'"), the objects inside it hidden.

**At 1280:** the headline, lead and actions at the start, the counter panel
under them across the container, its three objects at their own scales side
by side: the sign standing at the start, the pass raised in the middle, the
answer at the end. Not a split hero, not centred. In English the objects
mirror.

### 9.5 How it works: the sign, the card, the scan (`#how-it-works`)

Three subsections in the order a customer meets the objects, each a tall
lit panel (32px) with one real piece, and each a different composition so
none is a row of equal cards:
- **The sign** (setup): the card is designed on a phone in a few choices,
  free, and seen on the owner's own phone before anything is paid; then a
  sign is printed for the window, the counter or a table. The piece: two
  `StandeeSheet` formats side by side (the A4 and the table tent), with a
  line saying printing opens with Pro. It shows the sign and the card, never
  the wizard's screens (Roee, §8).
- **The card** (the customer's side): the customer scans the sign, gives a
  mobile number and the code from an SMS, and the card goes into Apple
  Wallet or Google Wallet; name and birthday are optional, offers only to
  those who tick a separate box. The evidence beside it: 58% with its
  source (and the survey's other half, §10), and 79% "more likely to join
  with no physical card", which is beat one's proof.
- **The scan** (the counter): the owner points the phone's camera at the
  card at the till, the stamp lands at once, and a full card answers
  "הכרטיסייה מלאה!" with the reward and "מסירת ההטבה" (an ink pill on gold).
  Nothing to press for a stamp. The piece: the answer panel in its punched
  and full lights, in the Scan page's own words
  (`dashboard.scan.result.*`).

### 9.6 After they leave

What brings them back, said as the mechanism and never as a result:
- **the piece:** `WallpaperStage` with the barber's card and one sample
  message, labelled as a sample ("דוגמה"), with its own line, "בערך כך זה
  ייראה על מסך הנעילה";
- **what each phone does,** in the dashboard's own words
  (`messaging.phones`): on iPhone the lock screen, on Android the card,
  with an alert only when a stamp comes with it;
- **the three rules that run without anyone opening anything,** under the
  dashboard's own names (`messaging.kinds`: החזרת לקוחות, יום הולדת, ההטבה
  מחכה): win-back after the days the owner sets, the birthday, a reward
  waiting; each with its own sentence of who gets it and when
  (`messaging.sentence.*`, the algorave discipline, §8);
- **broadcasts** ("הודעה לכולם"), up to two a week, and like every offer
  only to customers who agreed to receive them
  (`messaging.sentence.optIn`); a gift is a free stamp or a full card,
  nothing else;
- **the evidence beside it:** 6x (regulars against one-time customers,
  Square, US data) and 5–25x (keeping against winning, HBR, 2014), each a
  citation with its caveat.

The section never says "they come back"; the arithmetic, two sections
down, is where the owner judges whether enough of them would.

### 9.7 The price: the sign switches on (`#pricing`)

Two panels, not tiers: **Free** is the sign designed but unlit (designing,
seeing it on your own phone, the whole dashboard; customers can't join
yet), **Pro** is the sign lit: ₪99 a month including VAT, and from then
customers join, messages go out (up to two broadcasts a week, the automatic
rules), the sign prints, and refer-a-friend can be turned on. Under them,
how to stop and what stopping does, in Billing's own words: it can be
cancelled at any moment from Billing (`billing.free.how`), and then "the
cards your customers hold keep working and collecting stamps; new customers
who scan the code on your counter can't join, messages stop going out, and
Refer a friend closes, until you activate again" (`billing.pro.ifCancel`).
When Pro's panel first comes into view, its light
catches once (`sign-catch`, 600ms after 400ms unlit; `sign-on` under
reduced motion). The "based on your numbers" line sits in Pro's panel, as
today. One action: the same "התחילו בחינם".

### 9.8 Your own arithmetic (`#calculator`)

The model stays; the section is rebuilt on the kit:
- **presets** as a `SegmentedControl` that shows which one is on, cleared
  the moment a slider moves away from it;
- **the sliders** as the kit's `Slider` (rail in Field Edge, the value in
  ink, the fill turned round in Hebrew), each with its typed number, still
  clamped on blur;
- **"your card"** as a `StampRow` of that many stamps: one line that never
  wraps, where today's row wraps 7 + 3;
- **the result:** "N new regulars cover a year of PunchMe" (the count at 64px,
  Rubik, tabular), its working line under it, then the tally with leader
  rules and the double rule before the total, every figure Rubik tabular in
  its own `dir="ltr"` element, so "−₪819" reads the same in Hebrew;
- **the reward's reasoning** as a visible disclosure, "למה ההטבות עולות כל
  כך מעט" (`rewardCostWhy`, finally used), saying a reward costs what the
  free one costs to give, an item or the time in the chair;
- **a loss** answered on a plain lit panel with its words and an icon, no
  red wash and no side stripe: the year's number, the regulars it would
  take, and a plain verdict that at these numbers PunchMe doesn't pay for
  itself, so don't buy it yet (§10);
- **the phone's bar** while a slider is held rises on the drawer curve and
  reads the same eased values as the tally (§4, M9);
- one announcement after the numbers settle, as today.

### 9.9 Before you start, the close, the header and the footer

- **`#faq`:** native `<details>` as ruled rows on the wall, not shadowed
  cards; at 1280 the heading in its own column so the list doesn't leave
  half the width empty. Eight questions at most: the six today, corrected
  (§10), plus "What do my customers have to give?" and "How do I stop?".
- **The close:** one lit panel on the wall, one line, the same "התחילו
  בחינם", and the price in small print beside it. Not a dark band.
- **The header:** the wordmark, the four anchors, the language, "כניסה"
  and the coral action signed out, "לוח הבקרה" and the account menu signed
  in. No frost: the wall, with a hairline once the page scrolls. On a phone
  the menu is the kit's `Sheet` from the end edge: a name, a real focus
  trap, focus back on the menu button when it closes.
- **The footer:** on the wall, not navy: the wordmark, the anchors, sign
  in, the language, "© 2026 PunchMe". No contact line until there is a
  WhatsApp number (Roee, §8).

### 9.10 Motion, for step C

§4 is the plan: lights on (240ms, 8px) once per section; the stamp landing
in view in the counter (M1); the message arriving in §9.6; the sign
catching in §9.7; one breath, the counter's field light over 14s, paused
out of view and still under reduced motion; the trade switch as a 300ms
crossfade. Nothing counts a sourced number up; nothing loops but the breath.

### 9.11 Responsive, states and accessibility

- **375 is the design width**, then 1280; the counter's objects overlap at
  375 and stand apart from 1024; nothing scrolls sideways at 320.
- **200% text:** the headline and lead wrap, the counter panel grows, the
  pass's slot stays 300px and the stage clips its edges rather than squeeze
  it (DESIGN.md).
- **Signed out and signed in** (the header's two pairs); **a calculator link
  with a query string**; **a loss**; **Billing's `/#calculator`**.
- **Keyboard:** the skip link, the anchors, the trade switch (arrow keys),
  the calculator in order, each disclosure, the menu's trap and return.
- **Screen reader:** one `h1`, an `h2` per section, the counter as one
  summary, each figure with its source as a link that says it opens a new
  tab, the calculator's announcement.
- **Reduced motion:** everything in its final state at once; fades of
  150ms where something changes.

## 10. Copy

Every string through `t()`, in `en` and `he` together.

**Rules for every line:**
- **Hebrew voice:** the reader in the plural (התחילו, סרקו, עצבו), people in
  slash forms (לקוח/ה, בעל/ת העסק), and PRODUCT.md's terms only:
  כרטיסייה (never כרטיס נאמנות or כרטיס), חותמת (never ניקוב), הטבה (never
  פרס, תגמול, בונוס or מתנה), לקוחות קבועים, שילוט, הודעות ללקוחות,
  כללים אוטומטיים. The dashboard's own names for its parts (`messaging.kinds`,
  `dashboard.scan.result.*`), never "Push", "Win-Back", "Dashboard" or
  "אנליטיקס". "PunchMe" in Latin in running copy (the logo's accessible name
  stays `app.name`).
- **English:** plain, with the contractions speech has.
- **No em dash, in either language**, the footer's "©" line included. No
  emoji. No exclamation mark but the product's own "הכרטיסייה מלאה!".
- **Figures** in their own left-to-right element; the right-to-left marks
  that keep a figure in place stay.
- **Nothing the product or a source doesn't back:** no "they come back", no
  setup time ("in minutes", "in a minute"), no "unlimited", no outcome. A
  sample is labelled and carries a trade, never a name.
- **One label per intent:** "התחילו בחינם / Start free" on every link to
  `/onboarding`, the header's included; "כניסה / Sign in"; "לוח הבקרה /
  Dashboard".

**Drafts,** to set the register; step B fits them to the layout and step
D's `clarify` reads them again:

| Where | Hebrew | English |
|---|---|---|
| Headline | כרטיסיית החותמות עוברת לטלפון | Your punch card moves to their phone |
| Lead | בלי אפליקציה, בלי חשבון, בלי סיסמה. חינם לעצב, ₪99 לחודש כולל מע״מ, רק כשלקוחות מצטרפים. | No app, no account, no password. Free to design; ₪99 a month including VAT, only once customers can join. |
| Second link | כמה לקוחות קבועים צריך? | How many regulars would it take? |
| The counter's labels | שילוט · הכרטיסייה בארנק · סריקה | The sign · The card in their wallet · The scan |
| The sign | מעצבים בטלפון, בחינם, ורואים את הכרטיסייה בטלפון שלכם לפני שמשלמים. אחר כך מדפיסים שילוט לחלון, לדלפק או לשולחן. | Design it on your phone, free, and see the card on your own phone before you pay. Then print a sign for the window, the counter or a table. |
| The card | הלקוחות סורקים את השילוט, נותנים מספר נייד וקוד מ-SMS, והכרטיסייה נכנסת לארנק של אייפון או של אנדרואיד. שם ותאריך לידה רק אם רוצים. | Customers scan the sign, give a mobile number and the code from a text, and the card goes into Apple Wallet or Google Wallet. A name and a birthday only if they want. |
| The scan | מכוונים את המצלמה של הטלפון לכרטיסייה בקופה. החותמת נוספת מיד, וכשהכרטיסייה מלאה מוסרים את ההטבה. | Point your phone's camera at their card at the till. The stamp lands at once, and when the card is full you hand over the reward. |
| After they leave | הכרטיסייה נשארת בטלפון שלהם, וההודעות שלכם מגיעות אליה. שלושה כללים אוטומטיים שולחים לבד, גם כשלא פותחים את לוח הבקרה. | The card stays on their phone, and your messages reach it. Three automatic rules send on their own, whether or not you open the dashboard. |
| The price | השילוט נדלק כשמפעילים | The sign switches on when you activate |
| Free | מעצבים, רואים בטלפון שלכם, ולוח הבקרה פתוח. לקוחות עוד לא מצטרפים. | Design it, see it on your phone, use the whole dashboard. Customers can't join yet. |
| Pro | ₪99 לחודש, כולל מע״מ. לקוחות מצטרפים, ההודעות יוצאות (עד שתי הודעות לכולם בשבוע, והכללים האוטומטיים), השילוט מודפס, ואפשר להפעיל חבר מביא חבר. | ₪99 a month, including VAT. Customers join, messages go out (up to two broadcasts a week, plus the automatic rules), the sign prints, and Refer a friend can be turned on. |
| Calculator | כמה לקוחות קבועים חדשים יכסו שנה של PunchMe? | How many new regulars would cover a year of PunchMe? |
| Its lead | המספרים של העסק שלכם. מה שתקלידו כאן לא יוצא מהדפדפן, והתשובה יכולה להיות לא. | Your shop's numbers. Nothing you type leaves your browser, and the answer can be no. |
| The result | ‏{{count}} לקוחות קבועים חדשים מכסים שנה של PunchMe | {{count}} new regulars cover a year of PunchMe |
| A loss | במספרים האלה PunchMe לא מחזירה את עצמה: צריך {{count}} לקוחות קבועים חדשים, והזנתם {{regulars}}. אם זה החשבון, אל תפעילו אותה. העיצוב נשאר בחינם, ואפשר לחזור כשהמספרים משתנים. | At these numbers, PunchMe doesn't pay for itself: it takes {{count}} new regulars, and you've put in {{regulars}}. If that's the arithmetic, don't activate it. Designing stays free, and you can come back when the numbers change. |
| The reward's reasoning | הטבה עולה לכם מה שעולה לתת אותה, המוצר או הזמן בכיסא, ולא המחיר שלה: כאן ₪{{amount}}. ונותנים אותה למי שכבר שילם/ה לכם {{stamps}} פעמים. | A reward costs you what it costs to give, the item or the time in the chair, not its price: ₪{{amount}} here. And it goes to someone who has already paid you {{stamps}} times. |
| The close | מתחילים בכרטיסייה. משלמים רק כשמצטרפים לקוחות. | Start with the card. Pay only once customers join. |

**The evidence's lines,** with their figures, claims and sources unchanged:
- **Square:** the context drops "like yours": "‏Square הגדירה לקוח קבוע כמי
  שמגיע לפחות ארבע פעמים בשנה, וניתחה שבע שנות עסקאות של עסקים קטנים
  בארה״ב." / "Square counted a regular as someone who visits at least four
  times a year, across seven years of US small-business transactions."
- **HBR:** the context drops the product claim and says why it is a range:
  "הערכה כללית, לא מחקר מבוקר, ולכן טווח." / "A broad estimate, not a
  controlled study, which is why it's a range."
- **Harris:** the context keeps the 79% and adds the survey's other half,
  which its own headline carries: "באותו סקר רבים נרתעו גם ממועדון שאוסף
  מידע אישי. כאן מבקשים מספר נייד בלבד; שם ותאריך לידה רק אם רוצים." / "The
  same survey found people wary of programs that collect personal data.
  Here it's a mobile number; a name and a birthday only if they want." No
  new figure is printed for it.

**The FAQ,** six corrected and two new:
- **No app:** as today, and "they give a mobile number and a code from a
  text" said once.
- **Changing phones** (Roee, §8): "הכרטיסייה שמורה אצלנו, לא בטלפון.
  בטלפון החדש סורקים שוב את השילוט בקופה ומצטרפים עם אותו מספר נייד,
  והכרטיסייה חוזרת עם כל החותמות." / "The card is kept with us, not on the
  phone. On the new phone, scan the sign at the counter again and join with
  the same mobile number: the card comes back with all its stamps." It is
  what the join does (`enroll_customer`), and "message us" goes.
- **Cost and when:** "₪99 a month, including VAT, only once you activate".
- **Changing the design:** as today.
- **iPhone and Android:** both scanned the same way; the messages differ,
  in `messaging.phones`' words.
- **Adding a stamp:** as today, in the plural.
- **New: what customers give:** a mobile number and the code; a name and a
  birthday optional; offers a separate box, unticked.
- **New: how to stop:** from Billing, whenever; then `billing.pro.ifCancel`.

**Keys:**
- **Stay where they are, values in both languages free to change:**
  `landing.nav.skipToContent`, `landing.nav.signIn`,
  `landing.pricing.pro.price` (read by onboarding and `/style-guide`), and
  the ones `/style-guide` reads (`landing.hero.headline`, `.subheadline`,
  `.cta`, `landing.nav.designCta`, `landing.proof.title`,
  `landing.proof.stats.*`, `landing.pricing.body`, `landing.pricing.pro.name`,
  `landing.templates.*`). A key that moves takes its readers with it, in the
  same commit.
- **Change meaning:** `landing.templates.items.*.business` become the
  trades ("מספרה" / "Barbershop"), and the captions lose their em dash.
- **Used at last:** `landing.calculator.result.rewardCostWhy`.
- **Go, with their components:** `landing.app.*`, `landing.paperCards.*`
  (beat one moves into the headline and the 79%), `landing.push.*`,
  `landing.automation.*`, `landing.howItWorks.steps`,
  `landing.hero.eyebrow`, `landing.hero.trustBullets`,
  `landing.hero.worksWith`, `landing.example.*`.
- **Reused from other namespaces, not copied:** `messaging.phones`,
  `messaging.kinds.*`, `messaging.sentence.*`, `dashboard.scan.result.*`,
  `billing.pro.ifCancel`, `studio.sampleName`.

## 11. What step B keeps, touches and checks

**Keeps, untouched:** `calculator.ts` and `calculator.test.ts`;
`sources.ts`; `heroTemplates.ts`'s exports (`/style-guide` reads them);
`PunchMark.tsx` (the standee and onboarding's billing step);
`marketing/primitives.tsx` (nineteen files outside the page import it;
Phase 10 deletes what nothing uses); the frozen previews; `StandeeSheet`
and `ScanAnswer` themselves; `src/api`, `src/auth`, `src/hooks`,
`src/config`, `src/lib`. The page adds no API call: in the network panel `/`
still makes only the session's.

**Touches:** `LandingPage.tsx` and `src/components/marketing/*` (rebuilt,
and the landing-only files that go: `AppShowcase`, `PaperCards`,
`PushBand`, `NotificationBanner`, `AutomationRows`, `LockScreen`,
`WalletMarks`, `ProofBand`, `HowItWorks`, `PricingBand`, `FinalCta`,
`Faq`, `Hero`, `HeroCardCarousel`, as their sections are replaced);
`landing.*` in both locale files; `/style-guide`'s readers of any key that
moves; `docs/landing-page.md` (the new blocks, and the two stale lines in
§6). If the kit lacks a piece the page needs (a summary for a staged group,
say), step B asks before adding it.

**Builds in this order,** one section per commit, each checked in Hebrew and
English at 375 and 1280 before the next: the frame and header; the
counter; how it works; after they leave; the price; the calculator; the
FAQ, the close and the footer; then the removals.

**Checks** (CLAUDE.md's six, and the guide's step D list):
- build, lint and tests, with `calculator.test.ts` unchanged and passing;
- Hebrew and English, 375 and 1280, and 320 for the pass's slot;
- signed out and signed in (the demo Free owner shows "לוח הבקרה" and the
  account menu);
- `/?ticket=70&stamps=8&regulars=1&margin=70` restoring a result, and a
  loss read in Hebrew ("−₪…" with its minus where English puts it);
- Billing's `/#calculator` landing under the header;
- the counter's moment once, in view, and not at all under reduced motion;
- the phone menu's name, trap and focus return; the trade switch's arrow
  keys; every new tab announced;
- no em dash (`grep "—"` over `landing.*` in both files), no "unlimited",
  no ניקוב or פרס in `landing.*`;
- a clean console but for the session's two 401s (§13);
- `impeccable detect` over the page's files and the live page;
- Lighthouse on a phone profile.

## 12. The questions put to Roee

Asked on 27 Oct with the recommendation first; he took all four
recommendations (§8). Nothing in this brief is still open; what waits on
other work is in §13.

1. **Which structure?** The canvas has all three at 375 in Hebrew:
   [Landing page structures](https://claude.ai/artifact/BW8v2zeZUvseMYHprDjmwV).
   - **The counter** (recommended, and what §9 builds): the mechanism in
     the first screen, the stamp landing in view, `/join`'s sign continued.
   - **The owner's first month** (the roll's lead): the price second and
     every first in order; the stamp waits four sections.
   - **Paper against the pass:** beat one as the page, the most honest price
     row; the category's comparison table.
2. **The FAQ's "message us",** with no WhatsApp number on any page yet.
   - **Answer it with what the product does today** (recommended): scan the
     sign on the new phone and join with the same number, and the card
     comes back with its stamps. No contact line until there is a number.
   - **Give the WhatsApp number now,** in that answer and as a contact line
     in the footer.
   - **Both:** the self-serve answer now, and a WhatsApp line in the footer
     the day the number exists.
3. **Should any section show onboarding?** Phase 4 is redesigning it now.
   - **No** (recommended): the setup section shows the sign and the card,
     and "Start free" opens `/onboarding`, as today.
   - **A still of the new wizard,** in the setup section, once Phase 4 has
     merged (step B waits for it anyway).
   - **The first step, working, in the hero:** the business's name and
     trade, carried into onboarding's draft. It needs Phase 4 to expose the
     step and `docs/onboarding-flow.md` to let the landing page write its
     draft.
4. **The dials:** 5 / 4 / 3 (recommended, DESIGN.md's spacing), or 5 / 4 / 4
   as asked.

## 13. Left for other phases, and outside the redesign

- **Two 401s on every signed-out visit,** from `src/auth`'s boot check
  (`/api/auth/me`), which CLAUDE.md's "console clean" will flag on every
  public page. Outside the redesign; the session fixing the sign-in check
  in `src/auth` may take it.
- **The official Apple and Google Wallet badges:** trademark files nobody
  has yet (`WalletMarks.tsx`'s TODO). Until then the page says the names in
  words.
- **The WhatsApp number,** the product's. Until it exists the FAQ answers a
  new phone with the join (§8, decision 2), and the day it does, a contact
  line in the footer is a small change of its own.
- **Terms, Privacy and Contact pages:** none exist; the footer links them
  the day they do.
- **Open Graph and a meta description** for a link shared on WhatsApp:
  `index.html` serves every route, crawlers don't run scripts, and it needs
  an image. A site-wide decision, for Phase 10 or a task of its own; step B
  sets the title per language.
- **IBM Plex Mono and Roboto in `index.html`:** still needed by the
  dashboard's codes and the Google preview; Phase 10 decides.
- **What the landing page stops using,** for Phase 10 to delete:
  `Section`, `SectionHeader`, `cardHover` and `Eyebrow` in
  `marketing/primitives.tsx`, the `.t-*` type classes, the `grad-*` and
  `hero-bloom` classes, and the old `fade-up`, `float`, `bloom-drift` and
  `draw-rule` keyframes.
- **The backend's own ניקוב and פרס** in its message recipes and presets,
  being renamed in its own session.
- **The bundle split** is Phase 8's; this phase checks the landing's chunk
  after it.
