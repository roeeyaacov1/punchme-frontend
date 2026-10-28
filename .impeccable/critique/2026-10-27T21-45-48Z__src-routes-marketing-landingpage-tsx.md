---
target: the landing page /, Persuade
total_score: 23
max_score: 36
na_heuristics: 7
p0_count: 0
p1_count: 4
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\.claude\\worktrees\\suspicious-lalande-bd85af\\src\\routes\\marketing\\LandingPage.tsx"
target_fingerprint: "sha256:57b35d1088949d8292e3da73117c7f82dd89b6eb2551c593fa319c0d893742da"
target_path: "C:\\Users\\roeey\\Projects\\punchme-frontend\\.claude\\worktrees\\suspicious-lalande-bd85af\\src\\routes\\marketing\\LandingPage.tsx"
timestamp: 2026-10-27T21-45-48Z
slug: src-routes-marketing-landingpage-tsx
---
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
   in §9.6 and §10, with the model and the negative result as they are.
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


Method: dual-agent (A: design review, B: detector), each in its own headless Chrome. Full brief: docs/redesign/briefs/landing.md (Phase 9, step A).
