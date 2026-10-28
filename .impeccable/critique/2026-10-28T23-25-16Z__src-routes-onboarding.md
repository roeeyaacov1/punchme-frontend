---
target: the onboarding wizard
total_score: 27
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 3
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\.claude\\worktrees\\eager-cannon-aada65\\src\\routes\\onboarding"
timestamp: 2026-10-28T23-25-16Z
slug: src-routes-onboarding
---
# Critique: the onboarding wizard (Phase 4, step A)

Taken from docs/redesign/briefs/onboarding.md section 3, 28 Oct 2026.

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
