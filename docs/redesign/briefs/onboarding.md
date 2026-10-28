# Onboarding

Phase 4, step A of `docs/redesign/guide.md`: the wizard on `/onboarding/*`,
its eight routes from the business to billing. Diagnosed and written on 27
and 28 Oct 2026 with `/impeccable onboard`, `/impeccable critique`,
`/impeccable audit`, `/break-ui` and `/impeccable shape` (mode: Operate; it
is also where an owner decides whether PunchMe is worth it). No code
changed. Step B builds it on Lightbox (DESIGN.md) and `src/components/kit`,
in Plan mode, once Phase 8 has merged (§9).

The inputs:
- CLAUDE.md, PRODUCT.md, DESIGN.md, `docs/onboarding-flow.md` (the
  contract, and the gaps and findings it lists, which this brief treats as
  requirements) and `docs/card-studio.md`;
- in `docs/redesign/briefs`: `visual-world.md`, and `card-studio.md`, whose
  §8.9 built the card controls for onboarding too and whose §14 left the
  reward field's height to this phase;
- on `redesign/public` (Phase 8, unmerged): `public.md` §7.9 and the
  sign-in parts as committed there, `AuthFields`, `AuthAlternatives`,
  `useEmailPasswordAuth` and the Google button, which the account step takes
  as they are;
- the wizard's code, the shared controls in `card-studio/controls`, and the
  backend's limits (§5);
- the wizard itself, walked the way a new owner would.

How it was walked:
- **Signed out, Hebrew, 375×812**, from `/onboarding` to the account step,
  choosing a colour of its own so the stamp colour and stamp steps showed.
- **One test account** made at the account step on the local backend
  (`phase4-walk@punchme.test`, its password kept in the session's
  scratchpad, not here). That click saved the card, and the walk went on
  through the wallet step and billing, then "Not now" into the dashboard.
- **English, 1280×900**, as a new owner again on a fresh draft: a ready-made
  look this time, then signing in to that account, which raised "You
  already have a card"; Replace saved it as a PATCH, as the contract says.
- Locally the fake wallet provider never finishes a sync, so a real owner
  here waits three minutes on "preparing" and then gets "slow". The ready,
  failed and issuing states were seen through a fetch wrapper that answered
  the page's reads itself, built from the account's real responses.
- **Two reviewers** ran the critique apart and at the same time, each in its
  own headless Chrome with its own profile and ports, with every API call
  answered inside their page, so neither spent the shared backend's
  anonymous budget or could sign anyone out: **A**, the design review; **B**,
  the detector. The audit and the worst cases ran in a third browser the
  same way.

Three questions went to Roee, after he saw the three structures Impeccable's
roll dealt drawn at 375 in Hebrew on Lightbox, around a crop of the real
pass: https://claude.ai/artifact/DDwKugV4C4vfXpzvMqTiW6 (private). His
answers are in §6.

Read "In short" first. Sections 7 to 9 are what step B builds; §10 holds
what is still open.

1. In short
2. The wizard today
3. Onboard and critique
4. Audit
5. The worst cases
6. Decisions made in this step
7. The new onboarding
8. Copy
9. What step B keeps, touches and checks
10. Open questions for Roee
11. Left for other phases, and outside the redesign
- Appendix A: the worst-case toggle

---

## 1. In short

- **One job: a finished card in the owner's own wallet, quickly, and an
  honest answer to "is it worth ₪99 a month?".** The wizard moves to
  Lightbox by day, on the kit. It is the last violet surface between the
  landing page and the dashboard: today an owner pressing "Not now" crosses
  from a lavender page with a violet button into the warm Lightbox
  dashboard. The drawn phone bezel goes too; the card stands on its own
  wallpaper in its 300px slot, as it does everywhere else.
- **Your card, ready** (Roee, from Impeccable's roll, §6). The name and the
  trade, then the finished card for that trade at full size, the reward said
  as a sentence under it, and one coral "save". Colours, the stamp colour
  and the stamp open in trays over the card, Card Studio's own grammar;
  their routes become the trays' addresses. A saved card takes a name, two
  taps and a save, where today the fastest path is about ten taps and two
  scrolls (§2).
- **The card stops saying what isn't so:**
  - every trade's default reward carries a number nothing updates
    ("התספורת העשירית חינם"), so a card ships with 8 stamps promising the
    10th: the defaults lose their numbers (Roee) and the count is said
    beside them, "תספורת חינם אחרי 10 חותמות";
  - the reward is never drawn anywhere on the screen: the card screen says
    it, as the studio does;
  - with Google's preview chosen, the reward step crops away the very
    stamps its slider changes;
  - the sample customer "דנה לוי" stands in English pages too.
- **Going live makes the case** on the band's light, as the dashboard's
  billing does: ₪99 a month including VAT (nothing says VAT today), the four
  things activating turns on, what stays free, the calculator for anyone
  unsure, and "Not now" beside Activate. The wallet's Skip leads there now,
  instead of jumping past it to the dashboard (Roee).
- **The account step takes Phase 8's sign-in parts as they are,** inside the
  wizard's own Lightbox frame. Phase 8 stopped using `StepShell` and
  `TopBar`, so this phase rebuilds both for the wizard alone.
- **The card controls move in** (Card Studio §8.9). Onboarding decides the
  one thing Phase 3 left open: the reward field gets two lines, in the
  studio too.
- **Eight more things say nothing, or the wrong thing, and this phase fixes
  them:**
  - every trade's first ready-made look is named in English inside the
    Hebrew page ("Haircut Punch Card"), cut at its start;
  - the road changes length: a look jumps from step 2 to 5, and after
    sign-up 6 dots become 8;
  - a disabled Next never says why: Enter on the name with no trade does
    nothing, an empty reward greys the button;
  - a business name over 120 characters is accepted all the way to sign-up
    and then refused, in English ("Unprocessable Entity");
  - with the phone's storage full, every edit after it filled is lost on a
    reload without a word, the picture reverts to the old symbol, and the
    page comes back in the browser's language;
  - "Keep my current card" throws away the new design without saying so;
  - a failed Activate drops focus to the page and says "something went
    wrong" with no reason;
  - the wallet status still pulses under reduced motion.
- **Two things are out of reach or out of contrast:** a colour of one's own
  opens its picker inside the panel's clip, so on both colour steps most of
  it is cut off where no scroll can reach (the detector's one serious find);
  and field edges, chip borders and swatch rings measure 1.25 to 1.57:1,
  where a control's edge needs 3:1. The shared controls' inline picker and
  the kit's Field Edge (3.35:1) answer both.
- **Not this phase's to fix,** each in §10 or §11: the frozen previews
  printing an English name backwards in a Hebrew card, the language lost
  with full storage (`src/i18n`), catalog looks with one name in one
  language (the backend), and a stamp picture that can't be taken back
  (backend PR #6).

## 2. The wizard today

### What each step shows (Hebrew, 375×812, signed out)

| Step | What it asks | Choices on screen | Next | The phone above it |
|---|---|---|---|---|
| business | the name, and "איזה סוג עסק זה?" | 5 trades | in view (717–773) | 370px of bezel; the pass prints "—" for the name, stars before a trade |
| color | "בחרו את מראה הכרטיס" | 3 looks, 10 swatches, a custom colour folded | 109px below the fold | the same 370px |
| accent | "ועכשיו צבע החותמת" | 8 swatches; "מתקדם" folds text colour (4) and a custom stamp colour | in view | the same |
| stamp | "בחרו את החותמת" | 2 tabs (40px), 16 glyphs or a picture, 4 textures | 125px below the fold | the same |
| reward | "כמה חותמות, ומה ההטבה?" | a slider, a one-line field | in view | cut to 267px |
| account | "שמרו את הכרטיסייה" | email, password, the mode toggle, Google | in view | a 129px peek |
| wallet | "הוסיפו אותה לארנק שלכם" | preparing → issuing → ready, slow, failed | – | cut to 267px |
| billing | "יוצאים לדרך כשתהיו מוכנים" | Activate, "Not now" | in view | a 129px peek |

The whole wizard wears the old scope (`theme-purple theme-raised`,
`OnboardingLayout.tsx:155`) and three old primitive sets: `marketing/
primitives`' `ctaClasses` and `focusRing`, `ui/ColorField` and
`ui/PlacesAutocomplete`, and onboarding's own `ChoiceGrid`.

### The new owner's minute

Reviewer A's keystroke-level estimate, at 375×812 (not timed users):
- **The fastest path,** every default accepted: about 10 taps, 2 scrolls and
  42 characters, 45–80 seconds to "שומרים את הכרטיסייה…". Then the wallet
  wait ("about a minute"; the code calls it slow after 180 s), then about 4
  taps to the end: 2 to 4.5 minutes in all.
- **"Make it mine"** (a colour of one's own, a stamp colour, a glyph and a
  texture or a picture, the slider, the reward retyped): 17 to 26 taps, 3
  or 4 scrolls and about 60 characters, 2 to 3 minutes before the wait.
- **A ready-made look** skips the stamp colour and stamp steps: 9 taps and
  1 scroll.
- **The landing page promises** "חינם לעיצוב · לא נדרש כרטיס אשראי · פעיל
  תוך דקות". The first two hold; the third holds only when the wallet sync
  is quick.

### Measured

- **Next below the first screen:**
  - at 375×812 on color (109px) and stamp (125px), more with Google chosen
    (+86px) or a fold open (+183px);
  - at 1280×900 on every step, 67 to 225px down: the 546px phone stands
    above every question in a 512px column, with about 385px of wall on
    each side.
- **The pass is never 300px:** the bezel hands it 248px and scales with the
  screen's height, so it is 213px wide at 812, 136px at 667 (its 11px labels
  render 7.6px tall) and 248px at 1280×900.
- **The wallet switch lives in the drawn phone's island:** 61×38 at 812 and
  24px tall at 667, and every step's first two Tab stops after the top bar.
- **The keyboard path to the question** crosses the skip link, the mark, the
  language, sign-in, the two wallet buttons and one 28×28 link per finished
  step: 12 stops before the email field on the account step.
- **Focus:** each step's `h1` takes focus as it mounts; a failed Activate
  drops it to `<body>`; the account step's own changes (saving, "already
  has a card") move nothing. Every Tab stop draws a visible ring, the theme's
  at 5.7–6.14:1, except the two old `components/ui` fields: the name
  (`PlacesAutocomplete.tsx:164`, 1.99:1) and the colour well
  (`ColorField.tsx:189`, 1.98:1).
- **A colour of one's own is out of reach:** the `ColorField` popover opens
  inside the stage's `overflow-hidden` (`OnboardingLayout.tsx:185`) and the
  document ends where the panel does. On the stamp colour step at 375×812,
  240 of its 334px are cut; on the card colour step 257px at 375 and 241px
  at 1280×900. Only the top of the saturation square shows; the hue rail,
  the hex field, the eyedropper and the swatches can't be reached by touch,
  and moving focus into it scrolls the panel and the phone out of view.
- **Contrast:** no enabled text fails on the purple and lavender grounds.
  The name field's placeholder is 2.56:1 (`PlacesAutocomplete.tsx:163`), the
  emptied reward's 3.52:1, and the wallet's pulsing status drops to 2.58:1 at
  the bottom of each pulse. Non-text (WCAG 1.4.11): field edges 1.57:1 (the
  name field 1.38:1), chip borders 1.57:1, swatch rings 1.36:1, look tiles
  1.25:1, the upcoming dots 1.57:1.
- **Under 44px:** the island's buttons (38px, 24px at 667), the stamp tabs
  (40px), "לדלג בינתיים" (67×20), "להתחבר עם חשבון אחר", and the progress
  dots' 28px width (their 44px hit area is height only).
- **200% text:** the progress pill drifts off its dots (it travels in fixed
  28px steps over slots that grew to 56px), the island's labels shrink to
  "A…" and "Go…", the pass is cut at both sides, and "Sign in" wraps.
- **Plex Mono, which has no Hebrew:** the slider's figure. **Under 13px:**
  the texture labels (11px) and the look names (12px).
- **Reduced motion:** the wallet status keeps pulsing
  (`WalletStep.tsx:225`, missing from `index.css`'s list at 1335–1349); the
  choice cells and progress dots still grow on hover; the folds' chevrons
  still turn; the old buttons still nudge on a press
  (`marketing/primitives.tsx:220`). The phone's height, the pill, the wake
  layer and smooth scrolling do stop.
- **The crop:** on the reward and wallet steps the "short" cut runs 5.8px
  into the barcode's white plate, where `index.css:1039-1045` says it should
  stop above it.
- **English runs longer:** at 375×812 the business and billing questions wrap
  to two lines in English and their pages scroll 26px and 11px; in Hebrew
  both fit.
- **The Google button on main** reverses its Hebrew label ("Google הרשמה
  באמצעות") inside a forced `dir="ltr"` box, runs 320px wide in a 309px
  column, and speaks Google's language rather than the page's (no `locale`,
  `GoogleAuthButton.tsx:83`): the English wizard showed a Hebrew button.
  Phase 8 fixed all three on `redesign/public`.
- **The console** is clean apart from the known lines: the two 401s of a
  cold boot, React Router's future-flag warning, and a GSI warning that
  Google's library was initialised twice.

## 3. Onboard and critique

Method: dual-agent (A: design review, B: detector), each in its own
browser. A finished before B's findings entered this synthesis.

### 3.1 The aha moment

The aha is the owner holding their own card in their own wallet, on their
own lock screen: the product's whole promise, "this is what lands on their
phone", true in their hand. Everything before it is a toll; everything after
it is the decision.

Today the toll is five design screens that every default already answers,
and the aha sits behind a grey pulsing line with nothing to do. The decision
then gets a price without VAT, three bullets and no case. The new wizard
moves the finished card to the second screen, keeps the wallet moment, and
gives the decision the dashboard's honest panel (§7).

### 3.2 Design specificity

A: **mostly a generic SaaS wizard, built around one idea that belongs to
this product.** The shell would fit any sign-up: a cool lavender page with a
white panel, a violet pill, a row of 6px dots, a grid of swatches, an
"Advanced" fold, a template gallery, a big-number price. What is PunchMe's:
the live Apple and Google pass, the card's labels following the trade
(תספורות, כוסות קפה, אימונים), Hebrew-first mirroring, and "free until real
customers". Missing: Lightbox itself, a moment for the finished card, and
the brand's candour exactly where the owner decides whether to pay.

### 3.3 Nielsen's heuristics

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | The live preview is excellent, but the reward never shows on the card, the dots grow from 6 to 8, and a disabled Next never says why |
| 2 | Match with the real world | 3 | Trade labels and the plural voice are right; English look names, "מתקדם", "טקסטורה", "אייקונים", "אפל ווליט" and hex codes read to screen readers ("צבע חותמת 1: #D7BBAC") are not |
| 3 | User control and freedom | 3 | Back, the draft surviving reloads and the jump-back dots are good; a look overwrites earlier choices with no undo, "Keep my current card" discards the new design silently, and Skip skips billing too |
| 4 | Consistency | 2 | A violet wizard hands off to the Lightbox dashboard; כרטיס and כרטיסייה are mixed; a look and a swatch are chosen at once; look tiles always draw 4 stamps whatever the look's count |
| 5 | Error prevention | 2 | The product's own defaults produce a reward that contradicts the count; the password rule is hidden; a name the API will refuse is accepted |
| 6 | Recognition rather than recall | 3 | Choices are visual and live, but the reward has to be remembered (it is never drawn) and billing hides the card |
| 7 | Flexibility and efficiency | 3 | The look shortcut, Enter, arrow keys in radio groups and Google sign-in; no "take the defaults, I'll change it in the studio" |
| 8 | Aesthetic and minimalist design | 3 | One question per panel, but the stamp step offers 21 options plus tabs, color 14, and the phone is oversized for a text field |
| 9 | Error recovery | 3 | Upload and sign-in errors are specific (a 409 keeps the email); the wallet's failure doesn't say the card is saved, and a disabled Next is silent |
| 10 | Help and documentation | 2 | A few reassurances; nothing says what a look decides, what a stamp colour or a texture is, or how to reach a person |
| **Total** | | **27/40** | **Acceptable, at the top of the band** |

### 3.4 Cognitive load

Four of the eight checks fail, which the rubric rates high; swatch grids are
scanned rather than held in memory, so the colour steps bear it less than
the count says, and the stamp step doesn't get that excuse.
- **Chunking:** groups of 10, 8 and 16.
- **One thing at a time:** the stamp and the texture on one screen, and a
  look quietly changing the road.
- **More than four choices at a decision:** business 5, color 14, accent 8
  (and 5 more under "מתקדם"), stamp 21.
- **Working memory:** the slider's count against the number written into the
  reward, which is never shown.

Single focus, grouping, hierarchy and progressive disclosure pass.

### 3.5 The emotional journey

- **Arrival:** no orientation (how long, free, the account comes last), and
  "כניסה" in the top bar suggests signing in first.
- **The first peak:** the business name appearing on a real pass as it is
  typed.
- **The valleys:** two pickers on the color step and an English tile; the
  generated stamp tints (two near-identical greens); 21 options on the stamp
  step; the jump after a look.
- **Commitment (the account):** "חינם — בלי פרטי אשראי" reassures; then the
  road grows to 8 dots.
- **The deepest valley** is the payoff itself: the owner's own pass behind a
  pulsing grey line, nothing to do, "about a minute" against a three-minute
  threshold.
- **The end:** for payers, a price block with no case; for "Not now", a
  cleared draft and a jump into a dashboard that looks like another product.
  Neither ending gives the finished card a moment.

### 3.6 What's working

1. **The live, spec-matched pass.** Every choice repaints the real Apple or
   Google layout; the frame holds still while the slider is dragged
   (measured, 6 to 12 stamps).
2. **Design first, account last, every step pre-answered.** One name, one
   trade and five Nexts reach the account step, and the draft survives
   reloads and other tabs. Billing puts the price on the button and keeps
   the free way out on the same screen.
3. **Hebrew-first mechanics done properly:** mirrored arrows, a slider that
   fills from the right, arrow keys that run the way Hebrew reads in the
   radio groups, the card's labels in the card's language, honesty when the
   wallet is slow.

### 3.7 Priority issues

**[P1] The card can ship contradicting its own reward.**
- With the defaults and a look: barber "נועז" has 8 stamps and "התספורת
  העשירית חינם"; café "בהיר" 10 and "קפה שמיני חינם"; trainer "לילה" 12 and
  "אימון חינם אחרי 10 אימונים"; therapist "רענן" 8 and "טיפול שישי חינם".
  Moving the slider from 10 to 8 keeps "העשירית", and the draft saves both.
- Cause: the numbers are written into `onboarding.card.reward.*`, read at
  `draft.ts:248`; a look sets the count and not the reward (`looks.ts:164`);
  the preview never draws the reward. English and Hebrew already differ for
  the trainer ("1 free training session").
- Fix: defaults without numbers (Roee, §6), the count said beside the reward
  as a sentence, and the reward written down with the count. → §7.7, §8.

**[P1] Billing doesn't make the case, doesn't say VAT, and both the card and
the free way out drop out of sight.**
- "₪99 / לחודש, ביטול בכל עת" with no "כולל מע״מ"; three bullets, one
  repeating the price line; nothing on messages, rules or referrals, which
  are what activating turns on; no calculator.
- The card is a peek; at 375×667 Activate needs a scroll and "לא עכשיו" is
  below the fold; at 1280×900 the whole block starts 211px down. The
  wallet's Skip jumps past billing to the dashboard (`WalletStep.tsx:182`).
- Fix: the dashboard's activation panel, word for word where it can be,
  "Not now" beside Activate, Skip to billing (Roee). → §7.10.

**[P1] The color step: two competing pickers, and a road that changes length
without saying so.**
- On arrival no look is chosen though the card shows the first one, while a
  swatch is ticked; the first look is in English in every trade; a look
  decides the stamp colour, the stamp, the texture and the count, then moves
  the owner from step 2 to step 5; Back from the reward lands on a stamp
  step never seen; after sign-up the dots grow from 6 to 8
  (`OnboardingLayout.tsx:144`).
- Fix: the trade's first look is the card the owner starts from, chosen;
  looks and colours live in one tray; the road is five stops from the start
  and never changes length. → §7.3, §7.7.

**[P2] The stacked phone hides Next and pushes the card off screen.**
- Next below the fold on every desktop step and on two phone steps; at 667
  and at 200% the choices are made with the card mostly or wholly out of
  view; the pass is squeezed to 136–248px against the 300px rule.
- Fix: the card on its wallpaper in its 300px slot, the primary action docked
  at the thumb on a phone, and two columns from 1024px with the card sticky.
  → §7.5, §7.11.

**[P2] The wallet wait is dead time with three unclear ways out.**
- Nothing to do while waiting; "ready" offers Add to wallet, Continue and
  Skip without saying where each goes; on a computer the pass link is the
  primary though the QR is what works there; the failure doesn't say the
  card is saved.
- Fix: honest timing, one way on at a time with its destination named, the
  QR first on a computer, the button named by the phone's wallet, and a
  failure that says the card is safe. → §7.9.

### 3.8 Persona red flags

**Jordan, the first-timer.** "—" and "דנה לוי" before anything is typed; an
English look name; a look jumps the road from 2 to 5 and Back lands on a
screen never seen; "מתקדם" and "טקסטורה"; 10 stamps beside "העשירית"; no
password rule shown; 6 dots become 8; three ways out of the wallet; "₪99 —
plus VAT? What does Activate do?" (nothing says it opens Stripe's checkout).

**Casey, one-handed and interrupted.** Next sits in the thumb zone and the
draft and the wallet's polling survive an app switch. But color and stamp
need a scroll, Google adds 86px, the wallet switch sits at the top at 38px
(24px at 667), the stamp tabs are 40px, and the two quiet links have no
minimum height.

**Sam, screen reader, keyboard, 200%.** Works: focus to each step's `h1`,
native radio groups, Enter, the skip link and the debounced summary. Fails:
hex codes as swatch names; a reward heard but never shown; the pulse under
reduced motion; a disabled Next with no reason; at 200% the first screen is
only the phone, and color's Next is 366px down with no card in view.

**A Hebrew-speaking barber on an iPhone, between customers** (375×667 with
Safari's bars). Types the name, presses Go, and nothing happens because the
trade isn't chosen yet. Switches keyboards for the email and password; the
Google button that would spare that reads "Google הרשמה באמצעות". Takes
"נועז", and a client in the chair asks why the card promises the tenth free
on eight boxes. A customer walks in during the wallet wait. At billing,
Activate is cut off and "Not now" is below the fold, with no word on VAT.

### 3.9 The detector

Reviewer B, in its own headless Chrome with every call answered in the page.
No overlay was shown to anyone: the scans ran headless.

**The file scan** (the bundled engine, 0.1.12) exits 0 on
`src/routes/onboarding` and `src/components/onboarding`, with 27 advisories:
- 22 card colours in `looks.ts`, 2 in `draft.test.ts` and the server's
  default card colour at `draft.ts:217`: customer card data with measured
  ratios, not interface colour. False positives.
- `PhoneFrame.tsx:48`, the bezel's `#0b0d16`: real, low impact, and gone
  with the bezel.
- `StampStep.tsx:106`, `text-[11px]`: real, the texture labels.
- Without the project's config, two bounce-easing advisories return
  (`OnboardingLayout.tsx:231`, `StepProgress.tsx:71`), which
  `.impeccable/config.json` waives on purpose for the stamp's overshoot.

`src/components/auth` exits 0 with nothing, with or without config.

**The live scans** (engine 4.7.0, `detect --cdp`, 22 states: every step in
Hebrew at 375, three in English at 1280, the wallet ready and preparing, a
picker open) all report something:
- **nested cards in every state:** the frozen pass inside the phone's slot.
  False positive. The ones that are real: the "מתקדם" box
  (`AccentStep.tsx:96`) and the wallet's "preparing" box
  (`WalletStep.tsx:213`).
- **a radial spotlight glow:** the bezel's wallpaper, the lock screen's
  recipe on purpose; no text sits on it. It goes with the bezel.
- **low contrast:** the name's placeholder, 2.56:1. Real.
- **a straggler:** "שתרצו." alone on the free note's last line, in Hebrew at
  375. Real.
- **repeating stripes:** the textures the owner picks. False positive.
- **a clipped overflow container:** the colour picker cut off inside the
  stage (§2). Real, and the most serious finding of the critique's
  technical half.

Where the detector and A agree: the old scope and primitives, the 11px and
12px labels, the island's size, the pulse. What the detector caught that A
didn't: the clipped picker, the placeholder's contrast, the straggler. What
it can't see: every truth problem in §3.7.

### 3.10 Minor observations

- **Hebrew type:** the step titles are Rubik 700 at 28px with 1.15 leading,
  where DESIGN.md asks for 500 and 1.3 in Hebrew; "בחרו את / מראה הכרטיס"
  breaks after "את".
- **Copy:** "חשבון שומר אותה שלכם" is a calque of the English; "נסו בדיוק
  כמו שהלקוחות שלכם יראו" is awkward; "ביטול בכל עת" appears twice on
  billing; the wallet copy mixes הכרטיס and הכרטיסייה in adjacent lines;
  "ל-Apple Wallet ול-Google Wallet" breaks "Google Wallet" across lines.
- **The trade's change message** says "עודכנו הביקורים שלך" on a card whose
  counter is labelled "תספורות" (`onboarding.card.fields.pointsChange`, one
  string for every trade).
- **States:** neither the first step nor billing says the card is free until
  activation.

### 3.11 The critique's questions, and where §7 answers them

- **Could design be three screens: the business, "here's your card, tap to
  change anything", the reward?** Two: the business, then the card with the
  reward as its question (Roee, §6; §7.7).
- **Should the reward, the one question with money in it, come before the
  look?** It leads the card screen, said as a sentence under the card
  (§7.5, §7.7).
- **Is a drawn phone the right stage at 375, given the 300px rule?** No: the
  card's own wallpaper, the pass in its slot (§7.5).
- **What if "Not now" were designed as carefully as Activate?** It stands
  beside Activate, in the same panel, inside the first screen (§7.10).
- **Should billing hand the owner to the calculator?** Under the panel, as
  the dashboard's Billing does (§7.10).

## 4. Audit

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | A colour picker out of reach; field edges, chips and swatch rings at 1.25–1.57:1; the keyboard path crosses up to 12 stops before the question; focus falls to `<body>` after a failed Activate and doesn't follow the account step's states; a disabled Next with no reason; 38px and 24px wallet buttons, 40px tabs, a 67×20 link; the pulse under reduced motion |
| 2 | Performance | 3 | Light: one chunk on Phase 8's branch, Places loaded on the first keystroke, the pill on a transform. The phone's height is a layout animation, once per step |
| 3 | Theming | 1 | The old purple scope, three old primitive sets, and hard-coded colours (`bg-navy-deep`, `text-red-700`, `bg-red-50`, the bezel's `#0b0d16`, a black and white island) |
| 4 | Responsive | 2 | Works on a phone; Next below the fold on every desktop step; the pass scales with the screen's height and is never 300px; 200% breaks the progress row and the island |
| 5 | Implementation integrity | 2 | The defaults contradict themselves (§3.7); English catalog names in Hebrew; draft writes that fail without a word; errors read from `err.message` |
| **Total** | | **10/20** | **Acceptable: significant work needed** |

**Verdict: fail.** The wizard isn't on the product's system: it is the last
page group on the old scope, and its truth problems (the reward, the silent
storage) are implementation, not taste.

### Findings by severity

**P1**
- **A colour of one's own can't be finished:** the picker opens inside the
  stage's `overflow-hidden` and is cut off on both colour steps, past any
  scroll (§2, §3.9). `OnboardingLayout.tsx:185`, `ColorField.tsx:213-223`.
  The shared controls' `ColourPickerPanel` sits inline, never in a popover.
  → adapt.
- **Controls' edges under 3:1:** field edges 1.57:1 (the name 1.38:1), chip
  borders 1.57:1, swatch rings 1.36:1, look tiles 1.25:1. WCAG 1.4.11. The
  kit's Field Edge is 3.35:1. → colorize.
- **The reward contradicts the count** (§3.7). `common.json`
  `onboarding.card.reward.*`, `draft.ts:248`, `looks.ts:164`.
  → harden, clarify.
- **A business name over 120 characters** is accepted by the field (no
  `maxLength`, `BusinessStep.tsx:42`) and refused by the API after sign-up
  (`BusinessIn.name`, 1–120), and the account step prints the 422's
  `err.message`, which for a validation error is the status text, in English
  (`AccountStep.tsx:64`, `errors.ts:22`). → harden.
- **Full storage loses edits silently** (§5). `draft.ts:401-409` returns
  false, `saveDraft` ignores it, `DraftContext.tsx:79` never knows.
  → harden.
- **Focus drops to `<body>`** when Activate fails (the button disables
  under it), and the error is "משהו השתבש. נסו שוב בעוד רגע." whatever the
  cause (`BillingStep.tsx:73`). WCAG 2.4.3. → harden.
- **The wallet status pulses under reduced motion** (`WalletStep.tsx:225`,
  `animate-pulse` without `motion-reduce:`), and at the bottom of each pulse
  its words drop to 2.58:1. WCAG 2.3.3 and 1.4.3. → animate.
- **Touch targets under 44px:** the island (38px, 24px at 667), the stamp
  tabs (40px), "לדלג בינתיים" (67×20), "להתחבר עם חשבון אחר".
  WCAG 2.5.8 and the product's 44px rule. → adapt.

**P2**
- **Next below the first screen** at 1280×900 on every step, at 375×812 on
  two (§2). → layout.
- **The keyboard path** crosses the wallet switch and every finished step's
  dot before the question. → layout.
- **The account step's states move no focus:** saving, "already has a
  card", a sign-in error. → harden.
- **A disabled Next with no reason:** an empty name, no trade, an empty
  reward, a lost picture; Enter in the field does nothing. → clarify.
- **The sample name** `SAMPLE_NAME = "דנה לוי"` in English pages: the wizard
  passes no `holderName`; the studio passes `t("studio.sampleName")`.
  → polish.
- **200% text:** the progress pill's fixed-pixel travel, the island's
  labels, the cut pass. → adapt.
- **Hex codes as accessible names** for the stamp colours
  (`onboarding.accent.swatchLabel`). → clarify.
- **The name's placeholder at 2.56:1,** and two focus rings at 1.98–1.99:1,
  all from the old `components/ui` fields. → colorize.

**P3**
- Plex Mono on the slider's figure; texture labels at 11px and look names at
  12px; hover scales, the folds' chevrons and the old buttons' press nudge
  under reduced motion; a violet focus ring (`ring-primary-text`) on the
  trade chips instead of the kit's ink outline; "שתרצו." alone on the free
  note's last line. → typeset, polish.

### Patterns

- **Old primitives everywhere:** `ctaClasses`, the marketing `focusRing`,
  `ui/ColorField`, `ui/PlacesAutocomplete`, `ChoiceGrid`. The kit and the
  card controls replace all of them.
- **Silence where something failed or is missing:** a disabled button, a
  storage write, a status code as an error. The product's rule is "say no
  out loud".

### Positive findings

Native radio groups for every set of choices; a skip link; the step's `h1`
taking focus; a visible ring on every Tab stop; outside the pass, Hebrew set
in Assistant and Rubik throughout (read from the fonts as rendered); a
debounced live summary of the card; `dir="auto"` on the reward; the draft's
careful parsing; a save that looks before it creates. Keep all of it.

## 5. The worst cases

`/break-ui` on the steps. The worst case entered where the demo data does:
the draft in `localStorage`, told to the open wizard through a `storage`
event as another tab would tell it, and the page's reads answered by a fetch
wrapper. Nothing in the repo changed; the toggle is Appendix A. It was
checked in Hebrew at 375, at 320, at 375 with 200% text, and in English at
1280.

### What each field takes

| Field | Where it comes from | Limit | Optional |
|---|---|---|---|
| business name | the name field (Places suggestions when a key is set) | **none in the field**; the API 1–120 | no |
| trade | 5 chips | the API's closed set | no |
| card, stamp, text colour | swatches, looks, one's own | hex | stamp and text default |
| stamp | 16 glyphs, or a picture cropped square to 512px | png, jpeg, webp, gif, bmp, 8 MB | default |
| texture | 4 | – | default |
| stamps | slider | 2–12 (`draft.ts`, `controlRules.ts`) | default |
| reward | one-line field | 200 (field and API) | no |
| catalog look name | `/admin`, one field | 80, any language | – |
| email, password | the sign-in parts | the API's rules (8+ characters) | no |

### What broke

| # | Severity | Field | Worst case | What happens | Fix |
|---|---|---|---|---|---|
| 1 | Broken | reward | defaults with a look or the slider | "התספורת העשירית חינם" on a card of 8 or 12 stamps (§3.7) | defaults without numbers, the count beside them (`common.json`, §8) |
| 2 | Broken | business name | 121+ characters | accepted on every step; at the save, after sign-up, the API's 422 and "Unprocessable Entity" in a Hebrew page | `maxLength` 120 with a count from 100 (`BusinessStep.tsx:42`); a failed save said by cause (§7.8) |
| 3 | Broken | the draft | full storage | edits made after the storage filled live in memory: a reload brings back the old name and the old symbol in place of the picture, with no message; only the picture said anything ("…רק עד סגירת הלשונית", and a reload loses it too); the page reopened in the browser's language | the wizard checks its storage and says what a reload would lose (§7.13); the language is `src/i18n`'s (§11) |
| 4 | Broken | stamps, Google | any count with Google chosen | the reward step's crop shows Google's header and barcode; its stamps, under the barcode, are cut away while the slider changes them | the new staging: the whole card on the card screen, trays below it (§7.5) |
| 5 | Ugly | business name | "Danny’s Barbershop & Beard Co." in the Hebrew page | Apple's preview prints ".Danny’s Barbershop & Beard Co", Google's "…y’s Barbershop & Beard Co": the name inherits the page's right-to-left, inside the frozen previews | a correction in a frozen file, Roee's call (§10) |
| 6 | Ugly | look name | every trade's first look | "Haircut Punch Card" in a Hebrew page, cut at its start ("…ircut Punch Card") | the colours tray names looks only to screen readers; catalog names by number until the catalog has one per language (§7.7, §10) |
| 7 | Ugly | reward | 200 characters | a 1,353px line in a 307px field, scrolled sideways, with no count; the card shows none of it | two lines with a count from 160 (the shared control, §7.12); the sentence under the card cut at a word |
| 8 | Ugly | everything | 200% text | the progress pill drifts off its dots; the island reads "A…" and "Go…"; the pass is cut at both sides; "Sign in" wraps | the progress line in words, the wallet switch outside the stage, the stage's own clipping below 340px (§7.3, §7.5) |
| 9 | Fragile | stamp picture | lost (another device, a cleared or full storage) | caught: the guard sends the owner back to the stamp step, "התמונה לא שרדה את הרענון — הוסיפו אותה שוב.", Next disabled; but it blames a reload whatever the cause, in red words with no icon | the message by cause, with its icon, in the stamp tray (§7.7) |
| 10 | Fragile | stamps | 2 | the card draws 1 of 2 punched and holds; the reward still names the tenth (row 1) | row 1 |

### Decisions

- **The reward on the card screen:** the sentence wraps to two lines and is
  then cut at a word, as the studio's reward row is; the tray holds the full
  text.
- **A long name on the pass:** the wallets truncate it, and the frozen
  previews already do the same; nothing to change.
- **The name field:** `dir="auto"` once there is text, so an English name
  types left to right in a Hebrew page.

### What held up

- The frozen previews truncate a 60-character Hebrew name with an ellipsis,
  in both wallets, as the wallets do.
- Nothing moved sideways at 320 in any case.
- The phone didn't change height while the slider ran from 2 to 12.
- 2 and 12 stamps both draw; 12 sits in two rows of six.
- The forward guard catches the lost picture.
- The reward's 200 holds in the field and the API.
- The spoken summary reads the whole name and reward, once, after the owner
  stops.

## 6. Decisions made in this step

| # | Question | Roee's answer (28 Oct) |
|---|---|---|
| 1 | Which structure | **3, "Your card, ready."** Impeccable's roll (`concept-seed --scope surface --mode operate`, seed `0a71fc50`) dealt positions 4, 3 and 1 of the seven ranked structures below: one question per screen (the dealt lead), looks first, and your card, ready. Roee saw them drawn at 375 in Hebrew on Lightbox around a crop of the real pass (https://claude.ai/artifact/DDwKugV4C4vfXpzvMqTiW6), with the account and going-live screens the three share |
| 2 | Defaults that carry a number | **No number:** "תספורת חינם", "קפה חינם"…, the count said beside it |
| 3 | Where the wallet's Skip goes | **To going live,** the draft still cleared at Skip |

The seven structures, ranked in writing before the roll:
1. **Your card, ready:** the name, then the finished card at full size with
   the reward said; every other choice a change away;
2. **The card is the map:** Card Studio's chips and trays from the first
   design screen;
3. **Looks first:** a shelf of finished passes for the trade, then the
   reward;
4. **One question per screen, rebuilt:** today's road, the card cropped to
   what each question changes;
5. **The setup list:** a hub with the defaults ticked;
6. **The reward sentence:** one sentence to complete, the card writing
   itself;
7. **The customer's phone:** the wizard staged as the customer's lock screen
   over time.

The decision page would have closed unseen in a hidden pane, so the hand
went through the question tool with the canvas beside it. The six
challengers the roll dealt were catalog worlds (a split-flap board, a
streaming wall, an orienteering map, an airport's yellow signs, a jet-age
ticket wallet, a Crouwel specimen) and were declined: Lightbox is settled,
and in Operate a world lends type, palette, density and one move, never the
layout. One discipline is kept, from the airport's signs: **each screen says
only where the owner is and what comes next, and the road re-signs itself
rather than changing length** (§7.3).

**Decided in this brief,** for the review to overturn:
- **The business's Next writes the trade's first look** into whatever the
  owner hasn't chosen (the card, stamp and text colours, the stamp, the
  texture, the count), so the card screen opens on a card that is a real
  look, chosen in its tray. A choice is never overwritten (§7.6).
- **The road is five stops from the start,** signed in or out: העסק,
  הכרטיסייה, שמירה, בארנק, הפעלה. The trays aren't stops (§7.3).
- **The reward field gets two lines,** in the shared control, so the studio's
  reward tray gets them too (§7.12).
- **Nothing is disabled to say "not yet":** pressing on with something
  missing says what, where it is missing (§7.4).
- **"Keep my current card" says its cost,** and the current card is shown in
  words and colour from the template the save already read; no new call
  (§7.8).
- **The wizard checks its own storage** with a key of its own, since
  `DraftContext` (fixed) doesn't report a failed write (§7.13).
- **Going live borrows the dashboard billing's words** (`billing.price`,
  `billing.unlocks.*`, `billing.free.*`) rather than its component, whose
  "cancel from this page" is wrong in the wizard (§7.10).
- **A hire never resumes a draft:** the index sends anyone but the owner to
  `/dashboard`, as the contract already says should happen (§7.1).

## 7. The new onboarding

### 7.1 What is fixed

- **The eight routes,** public up to the account and gated after it, with
  the index's redirects, the forward guard and `OnboardingGate` sending a
  signed-out visitor to the account step. One change to the index, which the
  contract asks for in its findings: a signed-in visitor with a business and
  a draft in progress resumes it only if their role is owner; anyone else
  goes to `/dashboard` (`OnboardingIndex.tsx:45`, `useBusiness().role`).
- **Design first, account last.**
- **The draft:** `draft.ts`'s model, `DraftContext`, the keys
  `punchme.onboardingDraft` and `punchme.onboardingDraft.art`, and
  `draft.test.ts` unchanged.
- **`commit.ts` and its calls,** from a click only, one at a time, looking
  before it creates, PATCHing after Back-and-change.
- **The four points that clear the draft:** "Keep my current card"; the
  wallet's Skip (which now goes to billing, Roee); Activate, before the
  redirect; "Not now".
- **Every call in `docs/onboarding-flow.md`,** and no new one.
- **The pass:** `AppleCardPreview`, `GoogleCardPreview`, `StampGrid` and
  `PassBarcode` in their 300px slot, staged, never redrawn.
- **Phase 8's sign-in parts** as they are on `redesign/public`.

### 7.2 Lightbox outside the shell, by day only

The wizard stands outside the dashboard's frame, so no claim reaches it
(`lightboxPage.ts`), and the guide's D8 keeps it light.
- **Its root wears `theme-lightbox`,** never `theme-night`, on the wall, at
  least the small viewport's height, with the 16px gutter.
- **While it is mounted,** `<html>` wears `theme-lightbox` and the wall's
  `theme-color`, as Phase 8's `PublicPage` does for the public pages (its
  `usePublicGround`; step B shares it rather than copying it), and
  `index.html`'s pre-paint script gives `/onboarding` paths the same before
  the first paint.
- **The wizard's loading frame** in Phase 8's `RouteLoading.tsx` (the
  router's fallback while the wizard's chunk arrives) still draws the old
  purple frame with the old `TopBar`; it follows the new frame.
- **Nothing in the wizard uses the old sets:** `ctaClasses`, the marketing
  `focusRing`, `ui/ColorField`, `ui/PlacesAutocomplete`, `ChoiceGrid`,
  `LookGallery`, the old type classes (`t-h3`, `t-figure`).

### 7.3 The road and the progress line

The road is five stops, the same from the first screen to the last, signed
in or out:

| Stop | Route(s) | Name |
|---|---|---|
| 1 | `business` | העסק |
| 2 | `reward`, with `color`, `accent` and `stamp` as its trays | הכרטיסייה |
| 3 | `account` | שמירה |
| 4 | `wallet` | בארנק שלכם |
| 5 | `billing` | הפעלה |

- **One line under the top bar** says where the owner is and what comes
  next: "שלב 2 מתוך 5 · אחר כך: שמירה", over a hairline rule of five parts,
  ink up to here. On the last stop: "שלב 5 מתוך 5 · אפשר גם אחר כך".
- **It is not a control.** Back is the screen's own back button, and the
  phone's back gesture; the rule draws nothing to tap, so the Tab path goes
  from the top bar to the question.
- **It never changes length:** a look decides nothing about the road, the
  trays aren't stops, and signing up doesn't add any.
- A screen reader hears "שלב 2 מתוך 5: הכרטיסייה" once, as the screen
  changes, as today.
- The rule (`roadOf(step)`) is pure and tested.

### 7.4 The frame: top bar, the question, the action

`StepShell` and `TopBar` are rebuilt for the wizard alone on the kit: on
`redesign/public`, `/login` and `/invite` no longer use either.
- **The top bar:** the mark home at the start; at the end "כניסה" while
  signed out (a quiet 44px link to `/login`) and the language switch,
  Phase 8's `LanguageSwitch` (the other language named in itself, `lang` on
  it).
- **The question:** `type-title` (28px, 1.3 in Hebrew), taking focus as the
  screen appears, with a 44px back button at its start where there is a way
  back; a line under it only where the screen can't say it by itself.
- **The action:** the screen's one coral `Button` (lg, 52px), docked at the
  foot on a phone above the safe area, on a wall-coloured bar with a hairline
  over it; at the foot of the step's column from 1024px (§7.11). Busy keeps
  its width and focus (the kit's `Button`).
- **Never disabled to mean "not yet":** pressed with something missing, it
  says what under the field that misses it, in words and an icon
  (`aria-describedby`), and focus goes there; Enter does the same.
- **Errors** that belong to the screen, not a field, are a kit `Notice`
  (danger) over the action, `role="alert"`, by cause, never `err.message`.

### 7.5 The card on its stage

- **The kit's `WallpaperStage`** with the pass in its 300px slot, without a
  notification, replaces `PhoneFrame`: no bezel, no island, no wake flash,
  no height animation. Below 340px the stage clips the pass's sides rather
  than squeeze it (DESIGN.md).
- **The wallet switch** is the kit's `SegmentedControl` ("אפל ווליט · גוגל
  ווליט", 44px) above the stage, opening on the phone's own wallet as the
  Overview's `OwnPass` does, Apple elsewhere.
- **How much card each screen shows:**
  - business: the pass's top (its name row and stamps), so the name lands
    as it is typed;
  - the card screen: the whole pass; a tray rising over the lower half
    scrolls the page so the stamps stay above its edge, as the studio does;
  - account and going live: the pass's top on a phone; the whole pass in
    the sticky column from 1024px;
  - wallet: the whole pass, the moment.
- **What the pass prints:**
  - `holderName` from `t("studio.sampleName")` ("דנה לוי", "Dana Levi");
  - the business name as typed; until there is one, the trade's own name
    ("מספרה"), and before a trade "העסק שלכם", never "—";
  - the sample punched to `sampleStamps`, said under the stage with
    `studio.sample` ("מוצג עם 4 חותמות מתוך 10"), read only.
- **The reward said:** under the stage on the card screen, the studio's
  reward row shape: a gift icon, `studio.rewardSentence` ("**תספורת חינם**
  אחרי **10** חותמות"), a pencil. It opens the reward tray.

### 7.6 The business

At 375, top to bottom: the top bar; "שלב 1 מתוך 5 · אחר כך: הכרטיסייה";
the pass's top on its wallpaper; "איך קוראים לעסק?"; the name; the trade;
the docked "המשך". The canvas's first artboard.
- **The name:** the kit's `Field` and `Input`, its label the question, 48px,
  `maxLength` 120 (the API's) with a count from 100 (`cardControls.
  charactersLeft`), `dir="auto"` once there is text, Google Places
  suggestions as today (`src/lib/googlePlaces.ts` as it is) in a listbox
  built on the kit, with the arrow keys, Enter and Escape it has now.
- **The trade:** "איזה סוג עסק זה?" over the five trades as pills
  (`ChoiceTiles`, shape `pill`), chosen in ink; the trades with no preset
  hidden once presets load, as today.
- **The card** takes the trade's first look the moment a trade is chosen and
  prints the name as it is typed.
- **"המשך"** with no name or no trade says which; with both, it writes the
  trade's first look (`looksFor(niche, presets)[0]`) into every field still
  empty, with the count, and goes to the card screen. A pure helper beside
  `looks.ts` (`withTradeLook`), tested: a chosen field is never overwritten.

### 7.7 Your card, ready, and its trays

`/onboarding/reward`. The canvas's row 3.

At 375, top to bottom:
1. the top bar; "שלב 2 מתוך 5 · אחר כך: שמירה";
2. "הכרטיסייה שלכם מוכנה", and under it "התחלנו ממראה שמתאים לעסק שלכם.
   כל דבר אפשר לשנות, עכשיו או אחר כך בסטודיו הכרטיסיות.";
3. the wallet switch, the whole pass on its wallpaper, the sample line;
4. the reward row (§7.5): the screen's question, "is this what you give?";
5. the chips: "ההטבה", "צבעים", "החותמת" (`studio.chips.*`), 44px pills
   that wrap, each opening its tray;
6. the docked "שמירת הכרטיסייה": it writes the count and the reward, trimmed,
   and goes to the account step. With an empty reward it opens the reward
   tray and says "כתבו מה הלקוחות מקבלים." under the field.

**The trays** are Card Studio's `StudioTray`, used as it is: not a modal, no
scrim over the card, its heading taking focus as it opens and focus going
back to the chip that opened it; Escape, the close button, a drag down or
another chip closes it; content-sized up to half the screen, scrolling
inside past that. While one is open the docked save sits at its foot, as the
studio's bar does.
- **"צבעים"** (`/onboarding/color`; `/onboarding/accent` opens it at the
  stamp colour): `CardColourPicker` with the trade's looks, the ten
  backgrounds and a colour of one's own; `StampColourPicker`; folded under
  "עוד צבעים", `TextColourPicker`. A card colour that leaves the chosen stamp
  colour under 3:1 drops it to the first that fits, as onboarding does
  today (`accentFits`); one's own may be fainter, with the control's own
  warning.
- **"החותמת"** (`/onboarding/stamp`): `StampPicker` (the trade's glyph first;
  a picture cropped in the browser and kept in the art store, as today) and
  `TexturePicker`. Before a picture is chosen, `studio.picture.stays` says
  it can't be taken back once saved. A lost picture is said here, by cause,
  with its icon (§7.13), and the guard sends the owner here as it does now.
- **"ההטבה"** (no route of its own): `RewardField` (two lines, §7.12) with
  "זה גם מה שכתוב בגב הכרטיס." under it (`studio.back.follows`; true, the
  wizard writes the reward to the back's field), and `StampCountControl`.

**The trays' addresses:** opening one from the card screen pushes its route;
closing it goes back to `/onboarding/reward`, so the phone's back gesture
closes a tray and closing never stacks history. Arriving at `/color`,
`/accent` or `/stamp` directly (a reload, the guard) opens the card screen
with that tray open. The forward guard is unchanged: once the business's
Next has written the look, the first incomplete step is the reward, and all
four are reachable.

### 7.8 Saving the card

`/onboarding/account`. The canvas's "All three · saving the card".
- "שלב 3 מתוך 5 · אחר כך: הכרטיס בארנק שלכם"; the pass's top; then one
  lit panel (Phase 8's sign-in pattern) holding the form.
- **Signed out:** "שמרו את הכרטיסייה", "החשבון שומר את מה שעיצבתם. חינם,
  בלי כרטיס אשראי."; `AuthFields` (the password's rule shown in sign-up
  mode); the coral "יצירת חשבון ושמירה" or "כניסה ושמירה"; `AuthAlternatives`
  (the mode toggle, "או", Google's button in a box that follows the page).
  Errors come from `useEmailPasswordAuth` in the page's words, as a `Notice`
  over the button.
- **Signed in:** "מחוברים בתור {email}." (the address isolated left to
  right), the coral "שמירת הכרטיסייה", and "להתחבר עם חשבון אחר", quiet,
  44px.
- **Saving** is the button, busy, in place: focus stays on it, and the next
  screen's heading takes it after.
- **This account already has a card:** the heading "לחשבון הזה כבר יש
  כרטיסייה" takes focus. The card the account has is said from the template
  the save already read (`existing.template`): its name, its reward sentence
  and a swatch of its colour, beside "הכרטיסייה שעיצבתם עכשיו". Then the
  coral "להחליף בעיצוב החדש" and the secondary "לשמור את הקיימת", with what
  it costs under it: "העיצוב החדש לא יישמר."
- **A save that fails,** by cause, never `err.message`: offline; the
  server; too many tries; a 422 the page can place (the name, which the
  field's limit should already prevent); anything else. Today a 422 prints
  the response's status text.

### 7.9 The card in your wallet

`/onboarding/wallet`.
- "שלב 4 מתוך 5 · אחר כך: הפעלה"; "הכרטיסייה בארנק שלכם", and "ככה היא
  תיראה אצל הלקוחות. הוסיפו אותה לטלפון שלכם ונסו."; the whole pass, the
  published one once it has synced and its images load
  (`usePublishedPreview`, as today), the draft's until then.
- **While it is made,** one line in words with the kit's busy mark, which
  holds still under reduced motion:
  - preparing: "מכינים את הכרטיס לארנק. זה לוקח בדרך כלל כדקה.";
  - issuing: "כמעט מוכן: מנפיקים את הכרטיס שלכם.";
  - slow: "זה לוקח יותר מהרגיל. הכרטיסייה שמורה, ותחכה לכם גם בלוח הבקרה.",
    with "לבדוק שוב";
  - failed: "הכרטיסייה שמורה, אבל הכנת הכרטיס לארנק לא הצליחה.", with
    "לנסות שוב".
- **Ready, on a phone:** Phase 8's `WalletButton`, coral, named by the
  phone's wallet ("הוספה ל-Apple Wallet", "הוספה ל-Google Wallet"). **On a
  computer:** the QR leads, "סרקו עם הטלפון כדי להוסיף אותה שם", with the
  link as a secondary.
- **One way on at a time:** "המשך" (secondary) once the pass is ready;
  "לדלג בינתיים" (quiet, 44px) while it isn't, which clears the draft as
  today and now goes to billing (Roee).
- The calls are today's: the design read every 3 s until it has synced since
  the save, then the owner's pass every 3 s until it has a link, and the
  empty PATCH on "לנסות שוב".

### 7.10 Going live

`/onboarding/billing`. The canvas's "All three · the decision".
- "שלב 5 מתוך 5 · אפשר גם אחר כך"; the pass's top with "עדיין לא פעיל"
  (`dashboard.plan.notLive`) on it as a tag.
- **One panel on the band's light,** as the dashboard's activation panel
  stands, with its words:
  - "הפעלה, כשתהיו מוכנים";
  - the price: "₪99 לחודש, כולל מע״מ" (`billing.price`, the figure in
    Rubik's tabular figures, isolated);
  - "מה ההפעלה פותחת" and its four lines (`billing.unlocks.*`);
  - the coral "הפעלה", then the secondary "לא עכשיו, ללוח הבקרה" right under
    it, both inside the first screen at 375×812;
  - "התשלום בעמוד של Stripe. אפשר לבטל בכל רגע, מלוח הבקרה."
- **Under the panel:** "מה נשאר בחינם" (`billing.free.staysTitle`, `stays`)
  and "לא בטוחים שזה משתלם? חשבו עם המספרים שלכם." (`billing.free.
  calculator`) to `/#calculator`, as Billing links it.
- **Activate** clears the draft and goes to Stripe, as today. **A failure**
  stays under the button by cause, focus kept on it.
- The calls are today's: the templates and the design for the card, and the
  checkout.

### 7.11 From 1024px

Two columns, as the studio and the rule editor stand: the step's column on
the start side, with its action at its foot (not docked to the window), and
the card on its wallpaper in a sticky 22rem column on the end side, with the
sample line and the reward row under it. On the card screen the trays become
the kit's `Tabs` in the step's column ("ההטבה · צבעים · החותמת"), the open
tab its route. At 1280×900 every step's action is inside the first screen.
Between 768 and 1023 the phone's layout holds.

### 7.12 What onboarding needs from the card controls

All of them, as Phase 3 built them, controlled and blind to the draft:

| Control | Onboarding uses it for | Needs |
|---|---|---|
| `CardColourPicker` | the trade's looks, the ten backgrounds, one's own | nothing new. Onboarding maps its looks (`CardLook`) to `ReadyLook` (the stamp colour as `stamp`, `readableInk` as `text`, `derivedLabelColor` as `label`, so `matchingLook` finds the default) and back by `key` to write the glyph, texture and count a look carries |
| `StampColourPicker` | the stamp colour | nothing |
| `TextColourPicker` | the text colour, folded | nothing: `null` is automatic, as the draft keeps it |
| `StampPicker` | glyphs or a picture | nothing: onboarding turns the cropped data URL into its art store's hash, and passes `note` |
| `TexturePicker` | the texture | nothing |
| `StampCountControl` | the count | nothing |
| `RewardField` | the reward | **two lines** (below) |

**The reward field gets two lines** (Phase 3's §14 left it here): the kit's
`Textarea`, two rows, growing to three, for a paragraph and never a line
break (Enter does what the screen's action does, a pasted break becomes a
space), `maxLength` 200 with the count from 160, `dir="auto"` once there is
text. The studio's reward tray changes with it; step B checks the studio
after.

Two things stay onboarding's own, outside the controls: a look's accessible
name (§7.13) and the art store.

### 7.13 Colour, type and states

- **Coral, once per screen:** the docked action, or a tray's foot while it is
  open. Chips, the wallet switch and choices are ink and acrylic; chosen is
  ink.
- **No violet anywhere,** and no `primary-text`: a link is ink, underlined.
- **Warnings and errors** are words and an icon on a plain panel or under
  the field, never a red wash: the lost picture, full storage, a failed
  save, a failed checkout.
- **Type:** `type-title` for the question, `type-card-title` for a tray's
  heading, `type-label` for labels, `type-body`; every figure (the count,
  the price, the sample) in Rubik's tabular figures, isolated; nothing under
  13px outside the pass, no Plex Mono.
- **Look names:** a built-in look is named in the page's language
  (`onboarding.looks.names.*`); a catalog look by its place ("מראה 1"),
  until the catalog carries a name per language (§10). The colours tray
  shows look names to screen readers only, so nothing visible changes
  language.
- **Storage:** the wizard tries a write of its own key
  (`punchme.onboardingStorageCheck`, never the draft's) as it mounts and
  whenever the picture reports it couldn't be kept. When storage refuses, a
  notice above the card: "הטלפון לא שומר כרגע את מה שתבחרו, כי האחסון שלו
  מלא. מה שתשנו מעכשיו יישאר רק עד שתסגרו את הדף; כדי לא לאבד אותו, שמרו
  את הכרטיסייה עכשיו."
- **The lost picture,** by cause: "התמונה לא נשמרה בטלפון הזה, אז צריך
  לבחור אותה שוב." (a different device or cleared storage) or the storage
  notice above (full).
- **States to draw:** signed out and in; no trade, no name; a 120-character
  name; an English name in a Hebrew page; the card screen with each tray
  open; an empty reward; a 200-character reward; 2 and 12 stamps; a picture
  stamp, a lost one; full storage; the account's five states (§7.8) and
  each failure; the wallet's five states, on a phone and on a computer;
  going live and a failed checkout. Each in Hebrew and English; 320, 375,
  768, 1024 and 1280px; 100% and 200% text; full and reduced motion.

### 7.14 Motion (for step C)

The wizard is used once per owner, so it can carry a little more than the
counter, never on choosing a colour or typing:
- **The finished card arriving** on the card screen: lights on, its light up
  in 240ms while it moves 8px at most.
- **A stamp landing** when the count goes up: the kit's `stamp-land`, 340ms
  on the overshoot.
- **A tray** rising on the drawer curve in 300ms and leaving in 180ms.
- **The wallet's ready moment:** the published pass lights on once.
- **Gone:** the pill's travel and lean, the dot's stamp, the wake flash, the
  phone's height animation, the hover scales.
- **Reduced motion:** every one of these a 150ms fade; the busy mark holds
  still.

## 8. Copy

Every string goes through `t()`, in `en` and `he` together, in the
product's voice (plural to the reader, slash forms for people, חותמת and
הטבה). These are drafts; step D's `/impeccable clarify` settles them.

**The defaults lose their numbers** (Roee):

| Key | English | Hebrew |
|---|---|---|
| `onboarding.card.reward.barber` | A free haircut | תספורת חינם |
| `onboarding.card.reward.cafe` | A free coffee | קפה חינם |
| `onboarding.card.reward.trainer` | A free session | אימון חינם |
| `onboarding.card.reward.therapist` | A free treatment | טיפול חינם |
| `onboarding.card.reward.other` | A treat on us | פינוק מאיתנו |
| `onboarding.reward.rewardPlaceholder` | e.g. A free haircut | למשל: תספורת חינם |

**Keys that change:**

| Key | English | Hebrew |
|---|---|---|
| `onboarding.steps.business` | Your business | העסק |
| `onboarding.steps.reward` | Your card | הכרטיסייה |
| `onboarding.steps.account` | Saving | שמירה |
| `onboarding.steps.wallet` | In your wallet | בארנק שלכם |
| `onboarding.steps.billing` | Going live | הפעלה |
| `onboarding.steps.color` | Colours | צבעים |
| `onboarding.steps.accent` | Stamp colour | צבע החותמת |
| `onboarding.steps.stamp` | The stamp | החותמת |
| `onboarding.account.subtitle` | Your account keeps what you designed. Free, no credit card. | החשבון שומר את מה שעיצבתם. חינם, בלי כרטיס אשראי. |
| `onboarding.account.createCta` | Create account and save | יצירת חשבון ושמירה |
| `onboarding.account.signedInAs` | Signed in as <ltr>{{email}}</ltr>. | מחוברים בתור <ltr>{{email}}</ltr>. |
| `onboarding.account.existingTitle` | This account already has a card | לחשבון הזה כבר יש כרטיסייה |
| `onboarding.account.keep` | Keep the one I have | לשמור את הקיימת |
| `onboarding.wallet.title` | Your card in your own wallet | הכרטיסייה בארנק שלכם |
| `onboarding.wallet.subtitle` | This is how customers will see it. Add it to your phone and try it. | ככה היא תיראה אצל הלקוחות. הוסיפו אותה לטלפון שלכם ונסו. |
| `onboarding.wallet.preparing` | Making the wallet card. It usually takes about a minute. | מכינים את הכרטיס לארנק. זה לוקח בדרך כלל כדקה. |
| `onboarding.wallet.slow` | This is taking longer than usual. Your card is saved, and it will wait for you on the dashboard too. | זה לוקח יותר מהרגיל. הכרטיסייה שמורה, ותחכה לכם גם בלוח הבקרה. |
| `onboarding.wallet.failed` | Your card is saved, but making it for the wallet didn't work. | הכרטיסייה שמורה, אבל הכנת הכרטיס לארנק לא הצליחה. |
| `onboarding.billing.title` | Go live when you're ready | הפעלה, כשתהיו מוכנים |
| `onboarding.billing.notNow` | Not now, to the dashboard | לא עכשיו, ללוח הבקרה |

**New keys:**

| Key | English | Hebrew |
|---|---|---|
| `onboarding.next` | Next: {{step}} | אחר כך: {{step}} |
| `onboarding.lastStop` | You can do this later too | אפשר גם אחר כך |
| `onboarding.card.title` | Your card is ready | הכרטיסייה שלכם מוכנה |
| `onboarding.card.lead` | We started from a look made for your trade. Change anything, now or later in Card Studio. | התחלנו ממראה שמתאים לעסק שלכם. כל דבר אפשר לשנות, עכשיו או אחר כך בסטודיו הכרטיסיות. |
| `onboarding.card.save` | Save the card | שמירת הכרטיסייה |
| `onboarding.missing.name` | Write your business's name. | כתבו את שם העסק. |
| `onboarding.missing.trade` | Choose what kind of business it is. | בחרו איזה סוג עסק זה. |
| `onboarding.missing.reward` | Write what customers get. | כתבו מה הלקוחות מקבלים. |
| `onboarding.account.signInCta` | Sign in and save | כניסה ושמירה |
| `onboarding.account.newDesign` | The card you just designed | הכרטיסייה שעיצבתם עכשיו |
| `onboarding.account.keepCost` | The new design won't be saved. | העיצוב החדש לא יישמר. |
| `onboarding.account.problem.*` | a failed save by cause (§7.8) | as English |
| `onboarding.wallet.scanHint` | Scan this with your phone to add it there. | סרקו עם הטלפון כדי להוסיף אותה שם. |
| `onboarding.billing.how` | You pay on Stripe's page. You can cancel any time, from the dashboard. | התשלום בעמוד של Stripe. אפשר לבטל בכל רגע, מלוח הבקרה. |
| `onboarding.billing.problem.*` | a failed checkout by cause | as English |
| `onboarding.storage.full` | Your phone isn't saving your choices right now: its storage is full. What you change from here lasts only until you close the page; save the card now to keep it. | הטלפון לא שומר כרגע את מה שתבחרו, כי האחסון שלו מלא. מה שתשנו מעכשיו יישאר רק עד שתסגרו את הדף; כדי לא לאבד אותו, שמרו את הכרטיסייה עכשיו. |
| `onboarding.stamp.notOnDevice` | Your picture isn't saved on this phone, so it needs choosing again. | התמונה לא נשמרה בטלפון הזה, אז צריך לבחור אותה שוב. |
| `onboarding.looks.numbered` | Look {{n}} | מראה {{n}} |

**Read from other pages, kept as they are:** `billing.price`,
`billing.unlocks.*`, `billing.free.*`, `dashboard.plan.notLive`,
`studio.sampleName`, `studio.sample`, `studio.rewardSentence`,
`studio.chips.*`, `studio.back.follows`, `studio.picture.stays`,
`studio.moreColours`, `wallet.add*`, `cardControls.*`.

**Onboarding keys other pages read, kept** in both languages:
`onboarding.business.niches.*` (`/admin`), `onboarding.stamp.glyphs.*`,
`onboarding.color.names.*`, `onboarding.accent.*` and
`onboarding.reward.stampsValue` (the card controls), `onboarding.stamp.
upload*` (the controls and the studio), `onboarding.preview.summary`
(`PassStage`), `onboarding.preview.wallets` (`OwnPass`),
`onboarding.card.fields.pointsChange` (`/style-guide`),
`onboarding.account.alreadyRegistered` and `.throttled`
(`useEmailPasswordAuth`). The placeholder above reaches the studio through
`RewardField`, which is the point.

**Go** once nothing reads them: `onboarding.billing.bullets`, `.priceNote`,
`.freeNote`, `.activateCta`; `onboarding.wallet.ready`;
`onboarding.preview.ariaLabel`; `onboarding.color.custom` and
`.customLabel`; `onboarding.looks.legend` and `.orColor`;
`onboarding.stamp.tabs.*`, `.gridLabel`, `.textureLabel`, `.artMissing`.
The `onboarding.design.*` set belongs to `ui/BackgroundPicker`,
`ui/IconPicker` and `/style-guide`, not the wizard, and stays.

## 9. What step B keeps, touches and checks

**When:** after Phase 8 merges. The account step takes Phase 8's parts as
they are on main then; `RouteLoading.tsx`, `PublicPage`'s ground and
`LanguageSwitch` are Phase 8's; and its `main.tsx` loads the wizard as one
chunk (`src/routes/lazy/onboarding.ts`), which lists every step component
and gains or loses an export with them.

**Keeps** everything in §7.1, and `npm test` passing with `draft.test.ts`
unchanged.

**Touches** these, and nothing else:
- `src/routes/onboarding/`: `OnboardingLayout.tsx` and every step rebuilt,
  the color, accent and stamp steps becoming the card screen's trays;
  `OnboardingIndex.tsx` (the hire); `OnboardingGate.tsx` (its comment, which
  says it requires a business, and its loading line); `looks.ts`
  (`withTradeLook`, looks as `ReadyLook`); new pure helpers beside them, each
  with a test: the road (`roadOf`), the look written into empty fields, and
  the storage check's verdict;
- `src/components/onboarding/`: `StepShell` and `TopBar` rebuilt on the kit;
  `PhoneFrame`, `StepProgress`, `useWakeOnChange`, `ChoiceGrid` and
  `LookGallery` deleted once nothing reads them; `LookTile` stays for
  `/admin` until Phase 10;
- `src/components/card-studio/controls/RewardField.tsx`: two lines (§7.12);
- `src/routes/RouteLoading.tsx`'s wizard branch, and `index.html`'s
  pre-paint script (§7.2);
- the keys in §8, in `en` and `he`;
- `docs/onboarding-flow.md`: the road and the progress line, the trays'
  routes, the wallet's Skip going to billing, the card screen's states, the
  hire, and its "Known gaps" and "Found while writing this" marked as fixed
  (its note on billing's raw price key is already stale: `b8bc369` fixed
  it);
  `docs/card-studio.md`'s controls table (the reward field's two lines).
  CLAUDE.md's count of test files is Roee's to change.

**Doesn't touch:** `src/api`, `src/auth`, `src/hooks`, `src/config`,
`src/lib` (`googlePlaces.ts`, `stampArt.ts`, `accentPalette.ts` as they
are); the frozen previews; the kit (ask first if it needs to change);
Phase 8's `AuthFields`, `AuthAlternatives`, `useEmailPasswordAuth` and
`GoogleAuthButton`; the dashboard, Billing included.

**Checks,** in step D, through the browser:
- **Roles and sessions:** signed out; signed in with no business; signed in
  with a business and a draft, as the owner and as a hire (who goes to the
  dashboard).
- **The saves:** Back-and-change after sign-up PATCHes and never creates;
  "Replace" and "Keep" on an account that already has a card; a save that
  fails (offline, 422, 500, 429).
- **The minute:** at 375 in Hebrew, a name, a trade and a save; time it.
- **Appendix A's states,** and the stage at 2 and 12 stamps in both wallets.
- **The wallet:** preparing, issuing, ready, slow, failed; on a phone and on
  a computer; Skip to billing with the draft cleared.
- **Going live:** "Not now" and Activate (to Stripe's test mode), and a
  checkout that fails.
- **The studio after the reward field's change,** at 375 and 1280.
- **`/login` and `/invite`** still work (they no longer share `StepShell` or
  `TopBar`, but share the sign-in parts and the language switch).
- **Rendering:** Hebrew and English; 320, 375, 768, 1024 and 1280px; 100% and
  200% text; full and reduced motion.
- **The keyboard path:** from the top bar to the question; a tray's heading
  and back to its chip; the action keeping focus while busy; nothing ever on
  `<body>`.
- **The console:** clean apart from the known lines.
- **On a real phone,** in Hebrew: the trays over the card with the stamps in
  view; the docked action above the keyboard; a picture from the camera
  roll; the owner's pass added to the wallet from the wallet step.

## 10. Open questions for Roee

1. **Fewer screens than routes.** In "Your card, ready", `/color`, `/accent`
   and `/stamp` stop being stops on the road: each opens its tray over the
   card at `/reward`, and the business's Next goes straight to the card. All
   eight routes stay, each still renders, and the forward guard holds; but
   the road shows five screens where there are eight routes. Is that your
   yes?
2. **Catalog look names.** A catalog look has one name, typed in `/admin`,
   and today every trade's is English. Ask the backend for a name per
   language? Until then the wizard names catalog looks by their place.
3. **An English name in a Hebrew card,** inside the frozen previews: Apple
   prints ".Danny’s Barbershop & Beard Co", Google truncates the name's
   start, because its text inherits the page's direction. The wallets set
   each string by its own first letter. A one-attribute correction
   (`dir="auto"` on the name's text) in `CardPreviews.tsx`, like StampGrid's
   ink fix in Phase 3? It needs your yes, being a frozen file.
4. **Full storage and the language** (`src/i18n`, outside the phases): the
   language detector proves storage works by writing a test key, so with
   storage full it skips the saved language and opens in the browser's. A
   small fix of its own, outside the redesign?

## 11. Left for other phases, and outside the redesign

**For other phases:**
- **Phase 8,** if it merges after this brief is reviewed: `RouteLoading`'s
  wizard branch and the pre-paint script are touched by this phase's step B,
  not by Phase 8.
- **Phase 9:** the landing page's seven ways into `/onboarding` and its
  "פעיל תוך דקות", which holds when the wallet sync is quick.
- **Phase 10:** `ui/PlacesAutocomplete`, `ui/ColorField`, the marketing
  primitives' `ctaClasses` and `focusRing` once nothing reads them,
  `LookTile` with `/admin`.

**Outside the redesign:**
- the catalog's names per language (§10, 2), and the remove call for a stamp
  picture (backend PR #6), which `studio.picture.stays` covers until then;
- the language with full storage (§10, 4);
- `commit.ts`'s lost-response path, which the contract records: a template
  created whose response is lost is offered back as "already has a card".
  `commit.ts` is fixed, so it stays known;
- the trade's change message, "עודכנו הביקורים שלך", which is one string for
  every trade; the pass carries it, and the studio edits it.

---

## Appendix A: the worst-case toggle

Paste it into the console of a dev-server tab on `/onboarding/*` (or serve
it and add it as a script). It writes the wizard's own draft
(`punchme.onboardingDraft`, `.art`) and tells the open wizard through a
`storage` event, the way another tab would, then walks to the step that
shows the case. Nothing is sent anywhere. A reload removes the toggle; the
draft it wrote stays, as a real one would. "✕ ניקוי" empties the filled
storage and removes it. Signed-out walks need nothing else; a page that
must not touch the backend wraps `fetch` first.

Positions: Demo, a 60-character Hebrew name, an English name in the Hebrew
page, a two-letter name, a 200-character reward, 2 stamps, 12 stamps, a lost
picture, full storage.

```js
/* Onboarding worst cases (Phase 4, step A). Dev only, never shipped.
 *
 * Paste into the console of a dev-server tab on /onboarding/* (or load it as
 * a script). It changes the data, not the component: each position writes
 * the wizard's own draft (`punchme.onboardingDraft`, `.art`) and tells the
 * open wizard through a `storage` event, the way another tab would, then
 * walks to the step that shows the case. Nothing is sent anywhere; a reload
 * removes the toggle (the draft it wrote stays, as a real one would).
 */
(() => {
  const DRAFT = "punchme.onboardingDraft";
  const ART = "punchme.onboardingDraft.art";
  const BASE = {
    v: 1, name: "מספרה לבדיקה", niche: "barber", phone: "",
    background: "#1F2937", accent: "#ACBED7", foreground: null,
    stamp: { kind: "glyph", glyph: "scissors" }, pattern: "none",
    stampsRequired: 10, reward: "התספורת העשירית חינם", committed: null,
    updatedAt: 1,
  };
  // Realistic and at the limits the API holds: a business name to 120
  // (the field itself has none), a reward to 200, 2 to 12 stamps.
  const NAME_60 = "המספרה של אבי ובניו - תספורות גברים, ילדים וזקן, קרית מוצקין";
  const NAME_EN = "Danny’s Barbershop & Beard Co.";
  const REWARD_200 =
    "תספורת חינם בביקור העשירי, כולל חפיפה, עיצוב זקן ומוצר טיפוח לבחירתכם מהמדף. ההטבה אישית, תקפה שלושה חודשים מיום מילוי הכרטיסייה, ואינה ניתנת להמרה בכסף או לשילוב עם מבצע אחר של המספרה שבקריית מוצקין.";
  const MODES = {
    demo: { label: "Demo", draft: {}, to: "/onboarding/reward" },
    name60: { label: "שם 60", draft: { name: NAME_60 }, to: "/onboarding/business" },
    nameEn: { label: "שם באנגלית", draft: { name: NAME_EN }, to: "/onboarding/color" },
    short: { label: "שם קצר", draft: { name: "דן" }, to: "/onboarding/color" },
    reward200: { label: "הטבה 200", draft: { reward: REWARD_200 }, to: "/onboarding/reward" },
    stamps2: { label: "2 חותמות", draft: { stampsRequired: 2 }, to: "/onboarding/reward" },
    stamps12: { label: "12 חותמות", draft: { stampsRequired: 12 }, to: "/onboarding/reward" },
    lost: { label: "תמונה אבדה", draft: { stamp: { kind: "image", hash: "lost-picture" } }, to: "/onboarding/reward", art: null },
    full: { label: "אחסון מלא", draft: {}, to: "/onboarding/business", fill: true },
  };

  function unfill() {
    for (const key of Object.keys(localStorage)) if (key.startsWith("__fill_")) localStorage.removeItem(key);
  }
  /** Fills this origin's storage to the last byte, as a phone full of other
   * sites' data would. Returns how much it took. */
  function fill() {
    unfill();
    let i = 0;
    let size = 1 << 20;
    let total = 0;
    while (size >= 16) {
      try {
        localStorage.setItem(`__fill_${i++}`, "x".repeat(size));
        total += size;
      } catch {
        size >>= 1;
      }
    }
    return total;
  }
  function tell(key) {
    window.dispatchEvent(new StorageEvent("storage", { key }));
  }
  function go(path) {
    history.pushState({}, "", path);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }

  function apply(id) {
    const mode = MODES[id];
    unfill();
    localStorage.setItem(DRAFT, JSON.stringify({ ...BASE, ...mode.draft, updatedAt: Date.now() }));
    if (mode.art === null) localStorage.removeItem(ART);
    tell(DRAFT);
    tell(ART);
    let note = "";
    if (mode.fill) note = ` · ${Math.round(fill() / 1024)} KB filled`;
    go(mode.to);
    bar.dataset.mode = id;
    status.textContent = `${mode.label}${note}`;
    paint();
  }

  const bar = document.createElement("div");
  bar.setAttribute("data-worst-toggle", "");
  bar.style.cssText =
    "position:fixed;bottom:8px;left:50%;transform:translateX(-50%);z-index:2147483647;max-width:calc(100vw - 16px);" +
    "display:flex;flex-wrap:wrap;gap:2px;padding:3px;border-radius:12px;background:#e5e5e5;" +
    "font:11px/1.2 system-ui,sans-serif;direction:ltr;box-shadow:0 1px 4px rgb(0 0 0/.2)";
  const status = document.createElement("span");
  status.style.cssText = "width:100%;text-align:center;color:#555;padding:2px 0";
  function paint() {
    for (const b of bar.querySelectorAll("button")) {
      const on = b.dataset.mode === bar.dataset.mode;
      b.style.background = on ? "#fff" : "transparent";
      b.style.boxShadow = on ? "0 1px 2px rgb(0 0 0/.2)" : "none";
    }
  }
  for (const [id, mode] of Object.entries(MODES)) {
    const b = document.createElement("button");
    b.type = "button";
    b.dataset.mode = id;
    b.textContent = mode.label;
    b.style.cssText = "border:0;border-radius:9px;padding:5px 7px;color:#222;cursor:pointer;font:inherit";
    b.onclick = () => apply(id);
    bar.appendChild(b);
  }
  const off = document.createElement("button");
  off.type = "button";
  off.textContent = "✕ ניקוי";
  off.title = "Empty the filled storage and remove the toggle";
  off.style.cssText = "border:0;border-radius:9px;padding:5px 7px;color:#a00;cursor:pointer;font:inherit";
  off.onclick = () => { unfill(); bar.remove(); };
  bar.appendChild(off);
  bar.appendChild(status);
  document.body.appendChild(bar);
  window.__worst = { apply, fill, unfill, MODES };
  return "worst cases: " + Object.keys(MODES).join(" / ");
})();
```
