# The card's looks

Step A of `docs/redesign/card-looks-guide.md`. It covers passbox-api
v0.1.1's card design options (stickers, stamps on their own, a ground
behind the stamps, a faint pattern, the count at the top as "6/8"), made
native in Card Studio on `/dashboard/design` and in the onboarding wizard.
Diagnosed and written on 4 Nov 2026 with `/impeccable critique`,
`/impeccable audit`, `/break-ui`, `/impeccable onboard`, the ui-ux-pro-max
database and `/impeccable shape` (mode: Operate). No code changed. Step B
builds it in two branches, `looks/studio` and then `looks/onboarding`, and a
punchme-backend session builds what §4.2 lists.

The inputs:
- `docs/redesign/card-design-options.md` (the input, cited as "the input");
- frontend PR #40 (`studio/design-options`) and its code, on this branch;
- backend PR #17 (`wallet/design-options`);
- CLAUDE.md, PRODUCT.md, DESIGN.md, `docs/card-studio.md`,
  `docs/onboarding-flow.md` and `/dashboard/design` in
  `docs/dashboard-routes.md`;
- what the earlier steps settled: `card-studio.md` §7, §8.1, §8.3–8.5, §8.9
  and §8.10; `onboarding.md` §6, §7.1 and §7.5–7.7; `onboarding-map.md`
  §1–§4.

**How it was seen working.** The local backend (`punchme-web`, 8000) ran an
11-day-old image with no passbox client, and no passbox-server was running.
With Roee's OK, step A stood a stack beside it, touching nothing that was
running:
- passbox-server built from passbox-api at `f7eb03a` (v0.1.1), in test mode
  on 8002, with its own database;
- PR #17's backend on 8001, against a copy of the punchme database, so
  migration 0014's twelve draft looks and every save stayed out of the
  shared one;
- a Vite on 5188, from a worktree of `looks/studio`.

The appendix says how to start it again. Every styled card in this brief was
drawn by that passbox.

The walks ran signed in as the demo manager, Hebrew first at 375×812, then at
200% text, by night, at 320px and in English. They ran in a headless Chrome,
because the app's browser pane was hidden and its screenshots timed out. The
critique's two reviewers ran apart, each in its own Chrome:
- **A, design review:** read the code and the walk's screenshots;
- **B, detector:** ran Impeccable's detector over the files and the live page.

The worst cases came in through a fetch wrapper in the reviewer's own tab, so
no code was changed for them.

Read "In short" first. Sections 6 and 7 are what step B builds, §10 holds
what is still open, and §11's review notes win where they differ.

1. In short
2. Today
3. The critique, the audit and the worst cases
4. What the backend says, and what it must add
5. The decisions
6. The new studio
7. The new wizard
8. Copy
9. What each step B keeps, touches and checks
10. Open questions
11. Review notes for step B
- Appendix: the stack step A ran

---

## 1. In short

**What's wrong with PR #40's studio**

PR #40 gets the drawing right and the asking wrong. The stage shows passbox's
own picture, honestly. But the trays are the renderer's API, one control per
key.

From a plain card, the bakery reference took 19 taps, plus typing `B23A1E`, a
hex code no owner knows:
- the card's own colour isn't offered as a stamp colour;
- in between, the croissants went white and nearly vanished on the cream
  ground;
- the tint switch sits under 82 tiles, about 2.5 tray-screens down;
- the wallpaper is the last row of a second, identical grid of 65.

An untouched card shows "השרת מצא בעיה בעיצוב, והכרטיסים לא יתעדכנו עד
שתתוקן." That is false: those are passbox's advice lines (no contact on the
back, a name past Google's 20 characters), and the save goes through.

The words "טפט", "משטח" and "הפס" mean nothing to an owner.

**What Roee chose (4 Nov, on the canvas)**

The canvas is "Card looks: the options",
https://claude.ai/artifact/2bttnUa8kbirYLPbJcGyvT.

- **The studio:** the trays, sorted (Impeccable's roll dealt it among three).
  The card stays the map.
  - The stamp tray leads with the trade's stickers. "בצבע הכרטיס" sits right
    under them, then "בתוך עיגול / לבד".
  - "מאחורי החותמות" takes "הרקע"'s place.
  - The count's place moves to the reward.
  - No tray says טפט, משטח or הפס.
- **No whole looks in the studio, for now.** Roee may hand-make a few
  templates later.
- **One business colour sets the rest:** the stamps, their ground and the
  text, each with "שינוי". A colour changed by hand stays put.
- **The stickers:** the trade's first, with their names, then "עוד מדבקות"
  in groups, with a search.
- **The stage:** while passbox draws, the last picture stays, with a small
  tag. When it can't draw, the stage goes back to the saved card and says it
  is what customers have.
- **The wizard opens on the looks.** The first screen is "איזה סוג עסק זה?"
  over the five trades, then that trade's looks as real pictures. Then comes
  the map, whose business part keeps the name and gains an optional logo.
  This takes a new route, `/onboarding/look`, and a fifth stop on the road.
- **The wizard draws through the backend:**
  - published looks are drawn once, when staff publish them;
  - the owner's own card is drawn live through a public, throttled, cached
    endpoint that takes no free text;
  - passbox's key never reaches the browser.
- **AppleCardPreview:** yes to the count at the top and the name beside the
  logo. One more correction: in Hebrew its logo row is drawn left to right,
  as the iPhone draws it.
- **Our five trades**, not the input's ten.
- **Every design keeps a stamp alert message.** It can be edited, never
  emptied.

**What it costs:**
- two frontend branches;
- a backend part (§4.2) with four new public reads and one public drawing;
- one new route;
- the fifth correction to a spec-match file;
- optional fields in the wizard's draft.

While passbox's sticker list says the options aren't there, both pages stay
as they are today.

## 2. Today

### The studio (PR #40, on `looks/studio`)

Under the stage there are six chips: צבעים, החותמת, הרקע, השמות, הלוגו and
פרטי הארנק, plus the reward row. What PR #40 added:

| Tray | What it holds now |
|---|---|
| החותמת | "איך נראית כל חותמת": בתוך עיגול / בלי עיגול. "מדבקה": 66 tiles (none and the 65 stickers), six to a row, ungrouped, named only for screen readers. "הסמל של החותמת": the 16 glyphs, still shown with nothing chosen once a sticker is. "תמונה משלכם". Then, on stamps on their own, "וי על כל חותמת" and "בצבע החותמת" (the tint) |
| הרקע | "משטח מאחורי החותמות": none, six swatches read out as their hex ("צבע משטח 2: #F6E7CB"), one's own. "טפט": the same 66 tiles again, in full colour, though a wallpaper is drawn as a faint silhouette. "דוגמת רקע" (the texture), hidden under a wallpaper |
| השמות | The card's name, the two labels, then "איפה מספר החותמות מופיע באפל ווליט": מתחת לפס / למעלה, and "איך הוא כתוב": 4 / 4/8, then "שם העסק על הכרטיס" |
| הלוגו | The upload, and "שם העסק ליד הלוגו", shown with or without a logo |
| צבעים | As Phase 3: ready palettes, the card colour, the stamp colour (accents that clear 3:1 on the card, or on the ground once there is one), more colours |

**The stage:**
- A styled card is passbox's picture, staged by `StudioStage`. While a new
  one is on its way, the last stays up with "מציירים את הכרטיס…".
- A failure says "לא הצלחנו לצייר את הכרטיס כרגע. מה שרואים כאן אולי עוד לא
  הכרטיס."
- A picture held for Save isn't in the drawing: "התמונה החדשה תצטרף לכרטיס
  כשתשמרו."

### The owner's minute, measured (Hebrew, 375×812, Apple's preview)

**The bakery reference, from Demo Coffee's plain card: 19 taps, then Save.**

| # | Tap | What happened |
|---|---|---|
| 1–3 | צבעים, טרקוטה, close | The card goes terracotta (`#B23A1E`), with white circles |
| 4–6 | החותמת, בלי עיגול, קרואסון | Full-colour croissants. Croissant sits in the grid's second row |
| 7 | בצבע החותמת | 2.5 tray-screens down, under the 16 glyphs and the picture. The croissants turn **white**, since the stamp colour is still white |
| 8–11 | close, הרקע, cream, שיבולים | The ground goes cream. White croissants on cream (1.22:1) all but vanish, with no warning in that tray. Wheat is the last row of the second grid |
| 12–15 | close, צבעים, צבע משלכם, the hex field | The card's own colour isn't a stamp swatch: the owner must **type `B23A1E`**. The tray does warn "החותמת כמעט לא תיראה על הכרטיס הזה" |
| 16–19 | close, השמות, למעלה, 4/8 | The count moves to the top. Its example reads "4/8" while the stage shows 6 |

**The dark bubble-tea card: 7 taps, then Save.** The taps were צבעים, חצות,
close, החותמת, בלי עיגול, באבל טי, close. On the near-black card the two
empty cups are dark faded cups, as the phones showed (the input's §4).

**Saving** took 751 ms, then the toast "נשמר. כל כרטיס שכבר בארנק יתעדכן
מעצמו.". Nothing says the update is quiet. The false notice stayed after the
save.

### The wizard (signed out, `/onboarding/business` to the map)

- `GET /api/presets` answers the five classic looks only: the twelve styled
  ones are drafts, and the wizard skips styled looks anyway.
- The map's four parts are העסק, צבעים, החותמת, ההטבה. The card is the v0.1
  circles (`StampGrid`) with the trade's glyph.
- Its colours tray holds the trade's look (colours only) and the ten
  backgrounds. Its stamp tray holds the 16 glyphs, a picture, and the four
  textures.
- Nothing in it can make a card like the references.

## 3. The critique, the audit and the worst cases

### 3.1 Critique

Method: dual-agent (A: design review · B: detector), each in its own
headless Chrome.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 3 | The real drawing, "מציירים…" announced politely (`StudioStage.tsx:348`), and a running change count |
| 2 | Match with the real world | 2 | "טפט", "משטח", "הפס", "השרת", and "6/8" under "השמות" |
| 3 | User control and freedom | 3 | Everything waits for Save, and "ביטול השינויים" is always there. A saved stamp picture is one-way, and now it also locks every sticker (`StampTray.tsx:65`) |
| 4 | Consistency and standards | 2 | Card colours have names (טרקוטה), but ground swatches are read out as hex. One 65-tile grid does two jobs |
| 5 | Error prevention | 2 | The tint and the check hide correctly. White-on-cream gets no warning where it happens, and some controls draw nothing (see below) |
| 6 | Recognition over recall | 2 | The reference needs a remembered hex code |
| 7 | Flexibility and efficiency | 1 | 19 taps and a hex code. No shortcut, no look |
| 8 | Aesthetic and minimal design | 2 | Two 66-tile grids, three sources for one stamp, and a permanent warning box between the card and the chips |
| 9 | Recovering from errors | 1 | The notice is false, its details are in English, and it offers no fix (`DesignPage.tsx:637–650`) |
| 10 | Help and documentation | 2 | The hints are honest (Google's caveat sits under "6/8"), but they explain what should be hidden: "תמונת רקע מכסה אותה" |
| **Total** | | **20/40** | **Acceptable, with significant work needed** |

**Design specificity:** the stage is authored for this product; the trays
are generic settings UI. They follow the API's keys (style, sticker, mark,
tint, panel_color, wallpaper, stamps_place, stamps_format, logo_text) in the
renderer's order, spread over four doors. Nothing knows that a bakery card
exists.

**The detector:** `impeccable detect` over PR #40's trays, controls, stage,
studio and page found 0 findings (exit 0; a probe file proved `.tsx` is
scanned). The live overlay, injected on four views, found four page-level
findings, all false positives or by design:
- the warm wall (cream-palette);
- the stamp's overshoot (bounce-easing, already in the project's ignore list);
- the kit's wallpaper stage (radial-halo);
- the texture swatches in the background tray (repeating-stripes). These are
  content, moved there from the stamp tray.

None comes from PR #40's code.

**Priority issues:**
- **[P0] A false "cards won't update" notice on every card.**
  `lintProblems.ts:44` reads only three passbox warnings as advice, so
  `merchant.contact` and the 20-character name fall into "other". Fix both
  as advice (§6.8).
- **[P1] The reference needs a hex code.** The tint depends on a stamp colour
  set in another tray, which defaults to white and never offers the card's
  own. Fixed by one business colour (§6.2) and the tint under the stickers
  (§6.3).
- **[P1] Two grids of 65, ungrouped.** Fixed by the trade first, groups,
  search (§6.3), and a pattern list of a few motifs (§6.4).
- **[P2] Controls that draw nothing are offered.** Each is removed by a rule
  (§6.7):
  - the name beside the logo without a logo (`LogoTray.tsx:59`);
  - a wallpaper under a strip picture;
  - "שם העסק על הכרטיס" under passbox (§4.1).
- **[P2] Wrong doors.** "6/8" sits under "השמות", and panels under "הרקע".
  Moved (§6.1).

**Persona red flags:**
- **The café owner** (Hebrew only, one hand): two and a half screens of
  scrolling to the tint, and typing a hex code one-handed. The notice's
  details are `lang="en"`. Her croissant card still says "כוסות קפה" over the
  count.
- **The barber who wants the card to look like his shop:** scissors and the
  pole are buried among wine glasses. A stamp photo from onboarding locks the
  stickers for good.
- **The screen-reader user:** ground swatches read as hex. The drawn strip is
  `alt=""`, so after "קרואסון" nothing describes the result. The format
  options read "4" and "4/8".

**Questions the critique asked:**
1. The four references are recipes; why rebuild one from nine controls?
2. If the tint meant "in my card's colour", would a separate stamp colour
   still earn its place?
3. Would eight stickers for the trade and "more" lose anyone?

The answers are §5's decisions.

### 3.2 Audit (the new trays: 375px, 200% text, by night, Hebrew)

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | At 200% the stamp tray's scroll box is **108px tall for 6,169px of content**, the Save bar taking 335px of a 575px tray. "בלי עיגול" runs off the screen's left edge, the two style tiles being 142.5px each. Ground swatches are read as hex |
| 2 | Performance | 3 | The sticker list is 760 KB of data URLs, read once a session but rendered twice (132 images). A drawing is ~80 KB, asked 400 ms after a change, only when the strip changes |
| 3 | Theming | 4 | Night holds. Every text pair measured passes in day and night. The night ground swatches keep their edges, and the stage keeps its light |
| 4 | Responsive | 3 | No sideways scroll at 375 or 320 (`scrollWidth` = `clientWidth`). Tiles are 44px, five to a row at 320. The only small target is the notice's "הפרטים" summary (56×20; 111×40 at 200%) |
| 5 | Implementation integrity | 3 | The detector is clean. The rules live in tested `designOptions.ts`. One integrity gap: a stand-in drawing of a different card stays on the stage on a failure (§3.3) |
| **Total** | | **15/20** | **Good: the work is in the trays' structure, not their parts** |

Findings by severity:
- **P1:** the 200% stamp tray, and the style tiles' overflow at 200%.
- **P2:**
  - hex names on the ground swatches;
  - the "הפרטים" summary at 20px tall;
  - the wallpaper picker shows full-colour stickers for a silhouette;
  - the sticker hint sits two screens below its legend;
  - the style tiles' faces show the sticker untinted while the card is
    tinted.
- **P3:** the catalog look "כוסות לאטה" sets its labels `#2E1A10` on
  `#9C6B4E`, 3.64:1, under 4.5:1 for an 11px label. That is data, fixed in
  §4.2.

What works: native radios in fieldsets (one Tab stop, arrows), 44px tiles,
the 65 Hebrew sticker names, "6/8" isolated left to right with `<bdi>`, and
the tray's focus and Escape from Phase 3.

### 3.3 The worst cases

Injected through the tab's fetch wrapper, on the saved bakery card unless
said:

| # | Severity | Case | What happens | Fix |
|---|---|---|---|---|
| 1 | Broken | A drawing that fails (503, or the backend's 200 with no picture) | The stage keeps a picture of a **different card**: croissants, or cookies from an earlier draw, while the draft has a baguette. The only hint is "מה שרואים כאן אולי עוד לא הכרטיס" | On a failure, the stage shows the saved card and says so (§6.6) |
| 2 | Broken | The sticker list fails (500) on a styled card | The stamp tray falls back to today's: the 16 glyphs and a picture, with no word about the card's croissants. One glyph tap silently drops the sticker (`StampTray.tsx:103`) | While the list is out, a styled card's trays say what the card has and offer nothing that would drop it (§6.7) |
| 3 | Broken | "שם העסק על הכרטיס" under passbox | The field changes the preview's Google issuer line, but the backend sends only `business.name` as the merchant's name (`adapters.merchant_in`), so the pass never shows it. The business name can't be edited anywhere in the dashboard | §4.2 asks the backend to send it; until then the field is hidden under passbox |
| 4 | Ugly | A picture held for Save over a sticker | The stage keeps the croissants, with "התמונה החדשה תצטרף לכרטיס כשתשמרו". The owner can't see a photo stamp on a styled card before it reaches every customer | §10, question 1 (a changed call) |
| 5 | Ugly | A 30-character Hebrew name beside a logo ("מאפיית הבוקר של סבתא רחל ובניה") | Apple's preview cuts it "מאפיית הבוקר של סבתא …" and the count's label to "… כוסות". "4/8" stays readable, as on the iPhone | A hint past 20 characters (§6.5) |
| 6 | Ugly | The same name on Google | The issuer line holds all 30. The program line "{business} - {card}" truncates before the card's own name appears at all | The Google line under the card's name says what will show (§6.5) |
| 7 | Ugly | A ground a shade off the card (`#B5401F` on `#B23A1E`, 1.06:1) | "המשטח כמעט לא ייראה" shows, but the tinted stamps on it (1.06:1) aren't warned in that tray | The stamp-on-ground warning appears in "מאחורי החותמות" too (§6.4) |
| 8 | Ugly | A dark card with no ground (bubble tea) | The empty cups are dark on near-black, as the phones showed | The trade's looks put a dark ground or circles under them. Not a control's job |
| 9 | Fragile | A sticker a newer server adds, with no translation | Its name falls back to English ("teapot") for screen readers on a Hebrew page (`controlRules.ts:118`) | Keep the fallback and say it in `docs/card-studio.md`. Names are added in both files when passbox adds one |
| 10 | Fragile | A malformed design read (my mock's `assets`) | The studio's whole page says "נסו שוב" | Not a product case; noted only |

**Decisions this raised** (all settled in §5 and §6):
- a failure shows the saved card;
- a styled card keeps its options while the list is out;
- long names are said, not cut by us;
- "שם העסק על הכרטיס" goes until the backend sends it.

**What held up:**
- **12 stamps:** passbox draws 6+6 on Apple and Google alike.
- **A slow drawing:** with 8 s of delay, the last picture stays and
  "מציירים את הכרטיס…" shows; the new one replaces it cleanly.
- **An English name on a Hebrew card:** "Danny's Barbershop & B…" reads left
  to right (`dir="auto"`).
- **320px:** no sideways scroll; tiles five to a row.
- **Night:** no low-contrast text. The one hit, "שינוי ההטבה", is screen-reader
  text.
- **The sticker list saying the options aren't there:** the trays are
  today's, exactly.
- **The guard:** the "leave with unsaved changes?" dialog fires on a reload
  with a held draft.

**Observed, for passbox rather than PunchMe:** on a Hebrew card the stamps
fill left to right (the second row's first stamp is at the left). It is the
real drawing, so the preview is right. Whether a right-to-left card should
fill from the right is passbox's call (§10).

### 3.4 Onboarding: what a first card would take

**The aha moment** is the owner seeing their own card look like their shop:
croissants, not a coffee glyph in a circle. Today the wizard can't reach it,
because it can offer a look only as its colours.

To get there, a new owner's first card has to start as a whole styled look,
drawn with their colour, chosen before the details. Their name prints through
our own preview, which draws the pass's text rows. The strip carries no text,
so no free text needs to reach passbox at all.

**What the backend would serve, and what each costs per visitor:**

| What | How | Cost per visitor |
|---|---|---|
| Pictures of the published looks | Drawn once by passbox when staff publish or edit a look, stored, served as static images: Apple's strip and Google's hero | 0 passbox calls. 3–4 looks for the trade: about 55–80 KB each, cached by the browser and a CDN |
| The stickers | Names plus a URL each, the pictures served as their own files with a year's cache (a shipped sticker's picture never changes) | 0 passbox calls after the server's cache is warm. The trade's 6–8: about 9 KB each, ~70 KB. All 65 only if the owner opens every group: ~600 KB |
| A drawing of the draft | A public endpoint that takes only enumerated values: colours as hex, a sticker from the list, a glyph, the style, the ground, the pattern, 2–12 stamps, the count shown, and the wallet. Cached by those values, throttled per address | Measured locally (warm, test mode): **~57 ms of passbox work and ~108 KB per answer** (~80 KB of PNG). A visitor changes the card 5–15 times: 5–15 drawings, 0.5–1.2 MB. Popular combinations are drawn once for everyone |

The second renderer in the browser was weighed and declined (§5): it would
be a second spec-match drawing to keep pixel-close to passbox's tint, faded
empties and silhouettes.

### 3.5 The ui-ux-pro-max database

- **"template gallery choose a starting point"** (`--domain ux`): no match.
  The narrower retry, "gallery thumbnails preview", found nothing either. The
  Quick Reference's general guidance stands in: `primary-action` (one primary
  per screen) and `progressive-disclosure`.
- **"picker categories search mobile"**: two rows that hold.
  - *Search · No results*: show "no results" with suggestions, never a blank
    grid. That is the sticker search's empty state (§6.3).
  - *Search · Autocomplete*: show matches as the person types. The search
    filters as typed, with no Enter needed.
- **"progressive disclosure advanced settings"**: the database returned an
  off-topic typography row twice. There is no verified match, so the Quick
  Reference's `progressive-disclosure` stands in: reveal complex options
  progressively and don't overwhelm upfront. That covers "עוד מדבקות", "סמל
  פשוט", "עוד צבעים", and the check shown only to a card that has it.
- Also used:
  - *Content · Essential text truncation*: names that distinguish need a full
    path. That covers the long-name hints.
  - *Interaction · Success feedback*: the saved toast says what reached whom.

## 4. What the backend says, and what it must add

### 4.1 What it says (PR #17 and passbox v0.1.1, read and run)

**The sticker list** (`GET {biz}/stickers`):
- It answers `{stickers: [{name, image}], available}`: 65 stickers, 767,506
  bytes, from passbox's `/v1/stickers`.
- It is cached an hour, and a failure a minute.
- It is for managers and up; staff use `/api/admin/catalog/stickers`.

**Drawing:**
- The design preview asks passbox's `POST /v1/programs/preview` with the
  merchant inline, so no merchant needs to exist first.
- It never raises: a failure comes back as lint and no picture.
- The roles are strips, hero, logos, icons and the program logo; no whole
  pass is drawn.

**Lint:** passbox's preview always adds three lines for the demo business:
- two about `merchant.contact` (no phone, WhatsApp, email, website or address
  for the back of the pass);
- one that Google shows about 20 characters of the program's name ("this one
  has 26").

They are warnings: saves go through.

**The names:**
- Under passbox the organization name on every pass is the merchant's name,
  `business.name` (`adapters.merchant_in`). `design.organization_name` isn't
  sent (it was PassKit's, `design.py:718`).
- `patchBusiness` is called only by onboarding's `commit.ts`, so an owner
  can't rename the business after onboarding.

**The alert:**
- The stamps field's `change_message` becomes passbox's
  `stamps_change_message` only when it isn't empty (`adapters.py:113`).
- Wallet details lets an owner empty it (`WalletDetailsTray.tsx:406`). Then
  an iPhone gets no alert on a stamp.

**The catalog:**
- Twelve styled looks are seeded as drafts by `0014_styled_catalog_looks`.
- Four use the check mark: `cafe-bakery-croissants`, `cafe-count-on-top`,
  `therapist-herbs` and `trainer-running-shoes`.
- "כוסות לאטה" sets 3.64:1 labels.
- `GET /api/presets` serves the published looks only (the five classic ones
  locally).

### 4.2 What it must add (requirements for a punchme-backend session)

On `wallet/design-options` (PR #17), or `main` if it has merged. A public
endpoint gets `/api/presets`'s care: passbox's key never reaches the browser,
answers are cached, and each one is throttled so one visitor can't run up
passbox's work.

1. **Pictures of each published look** (new public read, Roee approved
   through "passbox, through the backend").
   - When a look is published, or a published look is saved, the backend asks
     passbox once for Apple's `strip@2x` and Google's `hero`. It draws them
     at the look's own stamp count halfway full, without the look's own
     pictures, as `CatalogPreviewIn.images` already draws.
   - It stores them and serves them as
     `GET /api/presets/{preset_id}/picture/{strip|hero}`: `image/png`, a
     strong ETag, cacheable for a day.
   - `GET /api/presets` gains, on a styled look, its design options as the
     design doc carries them, plus `pictures: {strip, hero}` (the two URLs).
     A classic look gains nothing, so today's wizard reads it as now.
   - A look whose drawing failed is served without `pictures`, and the
     wizard leaves it out.
2. **The stickers, public** (new public read). `GET /api/stickers` answers
   `{available, stickers: [{name, url}]}`.
   - Each picture is served as `GET /api/stickers/{name}.png`, cacheable for
     a year with `immutable`: names only grow and a picture never changes.
   - `available` follows `services.sticker_catalog()` exactly as the
     manager's route does. It is how the public wizard knows the options are
     there.
3. **A drawing of the draft** (new public call): `POST /api/presets/draw`.
   - **The body** takes only enumerated values:
     - `background`, `foreground`, `label`, `stamp`, `panel`: `#RRGGBB` or
       null;
     - `style`: badge or icon;
     - `sticker`: a name from the list, or null;
     - `glyph`: one of the 16;
     - `tint`: bool;
     - `wallpaper`: a name or null;
     - `pattern`: none, waves, dots or stripes;
     - `stamps_required`: 2–12;
     - `stamps`: 0 to `stamps_required`;
     - `role`: `strip@2x` or `hero`.
   - **No text, no pictures, no merchant fields:** the endpoint uses a fixed
     stand-in merchant.
   - **The answer** is `image/png` bytes, plus the lint as a header or a
     sibling JSON if step B needs it (it doesn't today).
   - **The cache** is keyed by the normalised body: a hit costs no passbox
     call, and a miss is cached a minute.
   - **The throttle** is per address, by the project's throttle classes; a
     starting point is 30 a minute and 300 a day. Past it, a 429 the wizard
     says plainly.
   - A server before v0.1.1, or `available: false`, answers 404 or 503, and
     the wizard falls back to today's stand-in.
4. **Every design keeps a stamp alert message** (Roee).
   - `validate_design_doc` refuses no message. Instead, an empty or missing
     `change_message` on the stamps field reads as the card language's
     default: "עודכנו החותמות שלך: %@" / "Your stamps were updated: %@".
   - A message without `%@` gets " %@" added.
   - `program_in` always sends `stamps_change_message`.
   - A test covers an old design with an empty message.
5. **The name on the pass under passbox** (needs Roee's yes, §10 question 2).
   `merchant_in` takes `design.organization_name` when the card's design sets
   one, else `business.name`. Then the Names tray's "שם העסק על הכרטיס" draws
   what it says.
6. **The seeded looks, before publishing:**
   - `0014`'s four looks drop `mark: "check"` (Roee prefers cards without
     it), by a data migration, since they are unpublished and unedited;
   - "כוסות לאטה" takes labels `#FFFFFF` (4.54:1 on `#9C6B4E`) or a darker
     card.
   - Their stamp alert messages already exist.
7. **Not asked here:** a preview of a picture held for Save (§10 question 1).
   It would change the design preview call.

Write a test for each, then run `ruff check`, `ruff format --check` and
`makemigrations --check`. Open a PR and stop: Roee merges backend PRs
himself.

## 5. The decisions

| # | Question | Roee's answer (4 Nov) |
|---|---|---|
| 1 | How the studio's trays build a look | **Trays, sorted** (artboard ב). Impeccable's roll (`concept-seed --scope surface --mode operate`, seed `3d4b2fcc`) dealt positions 5, 7 and 3 of the seven ranked structures below: the look as a sentence (the dealt lead), the trays sorted, and one colour leading |
| 2 | Whole looks in the studio | **None for now.** "Maybe later I'll create manually a few templates to start from" (§10) |
| 3 | Where the wizard offers the looks | **Before the map** (artboard אשף 2) |
| 4 | Where the trade question goes, then | **On the looks screen**, with a new route `/onboarding/look` and a fifth stop |
| 5 | What the stage does while passbox draws | **The saved card on a failure**, the last picture with a tag while drawing (artboard ציור · הכרטיס השמור) |
| 6 | One business colour sets the rest | **Yes, with overrides** |
| 7 | How the wizard draws | **passbox, through the backend** (§4.2, items 1–3) |
| 8 | L1: AppleCardPreview's count at the top, "6/8", the name beside the logo | **Yes, and the logo row left to right in Hebrew**, as the iPhone draws it: the fifth correction |
| 9 | The sticker picker | **The trade first, the rest grouped, with search** (artboards מדבקות, both) |
| 10 | The input's ten kinds of business, or our five | **Our five** |
| 11 | Does the wizard ask for a logo | **Yes, optional** |
| 12 | Does every design keep a stamp alert message | **Always, with a default** |

The canvas is "Card looks: the options",
https://claude.ai/artifact/2bttnUa8kbirYLPbJcGyvT. It has fourteen
artboards at 375px in Hebrew on Lightbox's tokens, and every card on it is a
real picture: a crop of the studio's stage, or a strip passbox drew. The
decision page would have closed unseen in a hidden pane, so the hand went
through the question tool beside the canvas, as in Phases 3 and 4.

The seven structures, ranked in writing before the roll:
1. a looks tray on the map;
2. looks first: the studio opens on a gallery;
3. one business colour, the rest following;
4. before and after: the saved card beside the draft;
5. the look as a sentence, each word a door;
6. a swipe carousel of looks on the stage;
7. the trays, sorted, in plain words.

**The six challengers declined.** The roll dealt six catalog worlds:
- a vertical media feed;
- a pocket timetable on a light table;
- Metro tiles;
- a Crouwel grid specimen;
- a jet-age ticket wallet;
- a variable-font specimen.

All were declined: Lightbox is settled, and in Operate a world lends details,
never the layout. One discipline is kept, from the vertical feed: **the next
picture is already loaded**. The wizard's looks are static pictures fetched
with the screen, and the studio asks for a drawing the moment the strip
changes, not on Save.

**Decided in this brief,** for the review to overturn:
- **The check mark isn't offered to owners.** A card that has it shows the
  switch, on, so it can be turned off. Once off, the switch goes. The catalog
  editor keeps it for staff.
- **The ready palettes ("מראות מוכנים") go** from the studio's colours tray
  while the options are there: one business colour replaces them. They stay
  in today's studio, shown while the options aren't there.
- **The count's place and format move to the reward tray**, beside the
  number of stamps. "ההטבה" already says "אחרי 8 חותמות"; Names keeps words
  only.
- **"בתוך עיגול / לבד"** replaces "בתוך עיגול / בלי עיגול", and sits under
  the stickers, not above them: what is on the stamp comes before how it is
  framed.
- **The texture and the wallpaper are one choice**, "דוגמה עדינה מאחור",
  since one replaces the other: none, the four textures, and a few sticker
  motifs.
- **In the wizard, a square logo turns the name beside it on by itself**,
  said in one line. A wide one doesn't. The switch lives in the studio.

## 6. The new studio

### 6.1 What is fixed

**Kept:**
- Both routes and their gating.
- Every call in `docs/dashboard-routes.md`, PR #40's included (the sticker
  list, the live check with `images`, the Overview's read at the pass's
  count).
- The 400 ms check, Save on its button (each save reaches every customer's
  phone), and `data-tour="design-studio"` on the stage.
- The draft seeded once per template and kept in the tab.
- `/admin/catalog/:id` on the same studio.

**While the sticker list says the options aren't there** (`available:
false`), the studio is today's, exactly. That includes the ready palettes,
"הרקע" with the texture, and Names without the count.

**The pass previews:**
- `GoogleCardPreview`, `StampGrid` and `PassBarcode` are untouched.
- `AppleCardPreview` takes PR #40's change (the count at the top as "6/8",
  the name beside a logo of one's own) and **one more correction**: its logo
  row is laid out left to right whatever the page's direction, as iOS does,
  so in Hebrew the logo is at the left and the header count at the right
  (the input's §4). The name keeps `dir="auto"` inside it.
- Recorded in `docs/card-studio.md` as the fifth correction, with Roee's yes
  of 4 Nov.
- A styled card stays the server's picture, staged by `StudioStage`.

### 6.2 The colours: one business colour

"צבעים", at 375, top to bottom:
1. **"הצבע של העסק":** the ten backgrounds, 44px swatches in rows of six, and
   "צבע משלכם".
2. **"ממנו נגזרים שאר הצבעים":** three rows of 52px, each with a dot, words
   and "שינוי":
   - "**החותמות** בצבע העסק" (or the accent the rule picked);
   - "**הרקע שלהן** שמנת" (only while there is a ground);
   - "**הטקסט** לבן, כדי שייקרא".

   "שינוי" opens that colour's swatches in place. A colour changed by hand
   says "שיניתם", with "חזרה לצבע של העסק".
3. **"עוד צבעים",** folded: the label colour, which Apple alone shows.

**The rule** goes in a new pure, tested `brandColours.ts` beside
`designOptions.ts`:
- **The card** is the business colour.
- **The text** is white or `#202024`, whichever contrasts more. It is never
  under 4.5:1; the gold `#C98A1B` takes near-black, where passbox's lint found
  white at 2.94:1.
- **The label** follows the text.
- **The stamps** take the business colour when they are tinted or stand on a
  ground they clear by 3:1. Otherwise they take the first accent that clears
  3:1 on the card (`relatedAccents`, as today).
- **The ground** takes cream `#F6E7CB` on a dark card, or the business colour
  mixed 88% toward white when that clears both 1.1:1 against the card and
  3:1 under the stamps. On a light card it takes white, or the colour mixed
  12% toward black.

**How a change shows:**
- A new business colour moves every colour that still follows it. The stage
  asks for one drawing, and the rows' dots change with it.
- **What "follows" means** is worked out with no stored field: a colour
  follows if it equals what the rule gives for the old business colour. A
  colour that differs was set by hand and stays.
- The same rule gives the wizard's colours (§7.4).

### 6.3 The stamp: what's on it, then how it's framed

"החותמת", at 375:
1. **"מה על כל חותמת · לבית קפה"** (the trade's words, §8):
   - the trade's stickers, 6–8 tiles of 48px, six to a row, each with its
     Hebrew name at 12px under it;
   - then three text buttons: "עוד מדבקות", "סמל פשוט", "תמונה משלכם".
2. **"עוד מדבקות"** opens in place:
   - a search field, "חיפוש מדבקה" (placeholder "קרואסון, פרח, כוס…"),
     filtering as typed by the Hebrew and English names;
   - over the other groups under their headings (§8).
   - No match says "אין מדבקה בשם הזה. נסו מילה אחרת, או בחרו מהקבוצות." over
     the groups, never a blank tray.
3. **"סמל פשוט"** opens the 16 glyphs. While a sticker is chosen they stay
   folded.
4. **"תמונה משלכם"**: the picture, cropped square, held for Save, with
   today's "can't go back" line.
5. **"בצבע הכרטיס"** (the tint), right under the picker, while a sticker or a
   picture is chosen:
   - Its line names what it does: "קרואסון בגוונים של הצבע הזה."
   - When the stamp colour was changed by hand away from the card's, the label
     reads "בצבע החותמות".
   - Switching it on while the stamps still take an accent moves them to the
     business colour (§6.2).
6. **"איך נראית כל חותמת":** "בתוך עיגול" and "לבד", two 64px tiles with the
   card's own face (tinted when the card is).
   - At large text they stand one under another, so neither label leaves its
     tile.
   - On "לבד", the check's switch shows only when the card already has one
     (§5).

The groups and their order are a pure, tested `stickerGroups.ts`: the input's
nine groups and its wallpaper motifs. Each trade leads with:

| Trade | Its stickers first |
|---|---|
| Café | `hot-beverage`, `teacup-without-handle`, `bubble-tea`, `cup-with-straw`, `croissant`, `bread`, `cupcake`, `cookie` |
| Barber | `scissors`, `barber-pole`, `nail-polish`, `lipstick`, `lotion-bottle`, `soap`, `sparkles`, `crown` |
| Personal trainer | `running-shoe`, `flexed-biceps`, `boxing-glove`, `soccer-ball`, `trophy`, `glowing-star` |
| Therapist | `lotus`, `herb`, `candle`, `potted-plant`, `seedling`, `leaf-fluttering-in-wind` |
| Other | `star`, `red-heart`, `wrapped-gift`, `party-popper`, `gem-stone`, `crown`, `sparkles`, `shopping-bags` |

A name the list doesn't have is left out of its group. A newer server's
sticker that no group names goes under "מתנות וכללי".

### 6.4 Behind the stamps

"מאחורי החותמות" takes "הרקע"'s place:
1. **"רקע לחותמות":** "בלי", then the six grounds by name (לבן, שמנת, חול,
   מנטה, ורוד, כחול לילה), and one's own.
   - The rule's ground (§6.2) is the first after "בלי" when it isn't one of
     the six.
   - Under the swatches, in words and an icon:
     - "הרקע כמעט לא ייראה על הכרטיס הזה." when the ground is under 1.1:1
       against the card;
     - "החותמות כמעט לא ייראו על הרקע הזה." when the stamps are under 3:1 on
       it.
2. **"דוגמה עדינה מאחור":** "בלי", גלים, נקודות, פסים, then the chosen
   sticker ("כמו החותמת"), שיבולים, עלים ברוח, נצנצים, and "עוד" for the
   rest. Its line is "בצבע החותמות, בעדינות."
   - Under a strip picture the choice is replaced by one line, "תמונת הרקע
     שלכם מכסה כאן כל דוגמה." A wallpaper there draws nothing.

### 6.5 Names, the logo, and the count

**השמות:**
- The card's name and the two labels.
- Under the name, Google's line as today. When "{business} - {card}" passes
  20 characters it adds "גוגל ווליט מציג בערך 20 תווים, ולכן יופיע: …", with
  the first 20 characters isolated.
- "שם העסק על הכרטיס" shows only once the backend sends it (§4.2, item 5),
  with the same 20-character line.

**ההטבה:**
- The reward, the number of stamps.
- Then **"המספר על הכרטיס":**
  - "מתחת לחותמות" / "למעלה, ליד הלוגו", the latter tagged "רק באייפון";
  - "איך הוא כתוב": "6" / "6/8", drawn at the count the stage shows, not 4;
  - Google's line: "בגוגל ווליט המספר מופיע מתחת לשם הכרטיס בכל מקרה."

**הלוגו:**
- The upload.
- **"שם העסק ליד הלוגו"** ("רק באייפון") shows only while a logo of one's own
  is in use, held or saved (`pictures`), and is a mark narrower than 2:1.
  - A wide one says instead "הלוגו הזה רחב, והשם כבר כתוב בו."
  - Past 20 characters: "באייפון שם ארוך נחתך עם שלוש נקודות."

**The "רק באייפון" tag** is a neutral badge, in words. While the stage shows
Google, the control stays, and its Google line says what Google does instead.

### 6.6 The stage while passbox draws

- **The last picture stays while passbox draws.** From 500 ms, a lit tag
  under the stage says "מציירים את הכרטיס…", in the shape of "בערך כך זה
  ייראה על מסך הנעילה".
  - It is announced politely once per drawing, not per change.
  - It never covers the pass.
- **When a drawing fails** (an error, or an answer with no picture):
  - the stage shows **the saved card**: the design read's own picture, which
    is what customers have;
  - under it, the tag says "כך הכרטיס אצל הלקוחות עכשיו";
  - a plain panel says "את השינוי האחרון לא הצלחנו לצייר כרגע. הוא שמור
    בטיוטה, ושמירה תשלח אותו כמו שהוא.", with "לצייר שוב".

  The stage never shows a picture of a card that is neither the draft nor the
  saved one. Save stays available: the check and the save don't depend on the
  drawing.
- **A held picture** keeps today's line until §10 question 1 is answered.
- **Step C** owns how one picture replaces the last: no blank, no flash, no
  jump in height.

### 6.7 What draws nothing gets out of the way

Pure and tested in `designOptions.ts`, one rule each:

| Control | Shown only when |
|---|---|
| "בצבע הכרטיס" | the stamp has a sticker or a picture |
| "וי על כל חותמת" | the stamps are "לבד" and the card already has the check on |
| A sticker | no stamp picture is in use. A saved picture keeps today's "התמונה היא החותמת" line instead of the stickers |
| "דוגמה עדינה מאחור" | no strip picture is in use |
| "שם העסק ליד הלוגו" | a logo of one's own, narrower than 2:1, is in use |
| "שם העסק על הכרטיס" | the backend sends it (§4.2, item 5) |
| Every design option | the sticker list says `available` |

**While the list can't be read** (an outage, `stickersStatus:
"unavailable"`) and the card already uses options:
- the stamp tray says "המדבקות לא נטענו כרגע, ולכן אי אפשר לשנות אותן.
  החותמות בכרטיס נשארות כמו שהן.";
- it names what the card has ("קרואסון, בצבע הכרטיס, לבד");
- it offers the glyphs only behind "סמל פשוט", whose tap says that the
  sticker goes;
- "מאחורי החותמות" says the same of the ground and the pattern.

A card with no options just gets today's trays.

### 6.8 The check, in the owner's words

`lintProblems.ts` adds two advice kinds, from passbox's real strings:
- **`merchant.contact`:** "אין לכרטיס טלפון בגב. כדאי להוסיף, כדי שלקוחות
  יוכלו להתקשר." There is nowhere to add one yet (§10 question 3), so it
  folds under "הצעות" and never raises the warning box.
- **The program's name past Google's 20 characters:** said by the Names
  tray's line (§6.5), not here.

"השרת מצא בעיה בעיצוב, והכרטיסים לא יתעדכנו עד שתתוקן." is kept for lint that
really blocks: none of passbox's warnings do.

The advice line becomes "יש לנו הצעה לכרטיס. הכרטיסים מתעדכנים בכל מקרה.",
since a wallet doesn't give advice.

### 6.9 Saving, and what the owner is told

- **The bar** is unchanged: "שינוי אחד · עוד לא בכרטיסים של הלקוחות".
- **The toast after Save:** "נשמר. הכרטיסים של הלקוחות מתעדכנים בשקט, בלי
  התראה. רק חותמת חדשה מתריעה." The phones showed it (the input's §4): a
  design change updated both phones with no notification.
- **At large text**, a tray's foot holds the bar as one row (the count of
  changes as a badge, then Save). The tray may rise to 85% of the screen, as
  onboarding's step D allows. Step B measures the 200% stamp tray's scroll
  box at 375×812 and keeps it at a third of the screen or more (it is 108px
  today).
- **Wallet details:** the stamps field's "the message on a change" can't be
  emptied.
  - Clearing it puts back the card language's default, and the line under it
    says "בלי ההודעה הזו אייפון לא מתריע על חותמת חדשה, ולכן תמיד נשלחת
    אחת."
  - A message without `%@` is saved with it added, as the backend does
    (§4.2, item 4).

### 6.10 From 1024px, and the catalog editor

**From 1024px:**
- Tabs, as Phase 3: צבעים · החותמת · מאחורי החותמות · ההטבה · השמות ·
  הלוגו · פרטי הארנק.
- "עוד מדבקות" opens in the panel. The search field stays in view while the
  groups scroll.

**`/admin/catalog/:id`:**
- The same trays, plus the check mark's switch, always.
- The look's own colours as a business colour with overrides, so staff
  author looks the way owners will see them change.
- Its art tray and "מדף" stay. A published look's pictures (§4.2, item 1)
  are shown in "מדף" as the wizard will show them.

## 7. The new wizard

### 7.1 What is fixed

**Kept:**
- design first, account last;
- `OnboardingGate`, the forward guard, the walk and its four parts;
- the four points that clear the draft;
- `commit.ts` looking before it creates and PATCHing after Back-and-change;
- every call in `docs/onboarding-flow.md`.

**Added** (Roee, 4 Nov):
- **one route**, `/onboarding/look`, public, the first stop;
- **the calls of §4.2**, items 1–3, and one more use of an existing call:
  `POST {biz}/templates/{template_id}/images` with `use=logo` after the
  create, for the optional logo.

**While the options aren't there:**
- When the public sticker list says `available: false`, or doesn't answer,
  the wizard is today's, exactly. `/onboarding/look` redirects to
  `/onboarding/business`, where the business part holds the trade, and the
  road is four stops.
- A draft from before reads as having no look and no options. It opens the
  map as today, its card the circles.

### 7.2 The road

Five stops, signed in or out: **המראה, הכרטיסייה, שמירה, בארנק, הפעלה**.
- The line under the top bar reads "שלב 1 מתוך 5 · אחר כך: הכרטיסייה".
- `road.ts` grows by one stop only while the options are there.
- The forward guard sends anyone without a trade, or without a look once
  looks are offered, to `/onboarding/look`.
- `firstIncompleteStep` keeps its order and its tests, with the look before
  the business. A draft with a trade but no `look` (from before) is not sent
  back: it is a classic card.

### 7.3 `/onboarding/look`

At 375, top to bottom:
1. the top bar and the road;
2. **"איזה סוג עסק זה?"** over the five trades as pills, chosen in ink (the
   trades with no published look hidden once the presets load, as today);
3. **"בחרו מראה לכרטיסייה"** and its lead: "מראות ל{{trade}}. את הצבע, החותמת
   וההטבה בוחרים אחר כך, וכל דבר אפשר לשנות גם בסטודיו.";
4. **the trade's published looks**, one per row:
   - each a lit panel holding the look's own picture (Apple's strip, or
     Google's hero while the phone is an Android), and its name under it;
   - the trade's first look is preselected, chosen in ink;
5. the docked coral **"המשך עם {{look}}"**, which writes the look and the
   trade into the draft and opens the map, at its business part.

**The tiles:**
- They are static pictures (§4.2, item 1), fetched with the screen. They are
  `<img>` with the look's name as their text, so a screen reader hears "כוסות
  לאטה", not a picture.
- A look with no picture is left out.
- A trade whose looks all failed shows its classic look's colours as today's
  tile, saying nothing is wrong.

From 1024px the looks stand two to a row beside the trade's pills, and the
action docks at the column's foot, as the map's walk button does.

### 7.4 The map

The same screen, at `/onboarding/reward`, with four parts:

| Part | What it holds now |
|---|---|
| העסק | The name, as today; the trade as a line, "בית קפה · שינוי", which goes back to `/onboarding/look`; and **"לוגו (לא חובה)"**, an upload tile kept on the device, uploaded at Save |
| צבעים | "הצבע של העסק" and the rows that follow it, as the studio's (§6.2), from the shared control |
| החותמת | The studio's stamp tray (§6.3): the trade's stickers first, "עוד מדבקות" with search, "סמל פשוט", "תמונה משלכם", "בצבע הכרטיס", "בתוך עיגול / לבד". "מאחורי החותמות" folds in at its foot, as "רקע ודוגמה" |
| ההטבה | The reward, the number of stamps and "המספר על הכרטיס" (§6.5) |

**The logo:**
- Its hint: "לוגו מרובע יופיע באייפון עם שם העסק לידו. לוגו רחב, שהשם כבר
  כתוב בו, יופיע לבד."
- A mark narrower than 2:1 turns `logo_text` on by itself; a wide one
  doesn't. The studio has the switch.
- It is kept under `punchme.onboardingDraft.art` beside the stamp picture,
  like it, with the same causes said when it is lost.

**The card on the stage:**
- The text rows are our frozen preview, so the name lands as typed.
- The strip is the backend's drawing of the draft (§4.2, item 3), asked
  400 ms after a change that alters the strip, for the wallet the switch
  shows.
- **While drawing,** the last picture stays with the studio's tag.
- **When it can't draw,** the stage shows the chosen look's own picture,
  with "לא הצלחנו לצייר את המראה בצבע שלכם כרגע. כך הוא נראה בצבעים שלו.".
  The owner can still save: commit sends the draft, not the picture.
- **A held stamp picture** can't be drawn by the public endpoint. With one
  chosen:
  - the stage shows the circles (`StampGrid`), which draw a picture;
  - the tray says "בכרטיס עצמו התמונה תופיע במראה שבחרתם. כאן היא מוצגת
    בעיגולים.".

### 7.5 The draft and the commit

The draft stays `v: 1` under the same keys. New optional fields; parsing
keeps the known values only:
- `look`: a catalog id;
- `options`: style, sticker, tint, panel_color, wallpaper, stamps_place,
  stamps_format, logo_text, as the design doc names them;
- `colours`: gains `panel`. Which colours were set by hand is worked out as
  in the studio (§6.2), from the card colour, so nothing else is stored.

A draft without them reads as none, a classic card.
- `seen` is unchanged.
- `walk.ts` is unchanged except that the business no longer holds the trade
  while looks are offered.

**`commit.ts`:**
- It builds the template from the chosen look (its design doc, fields and
  change messages from `GET /api/presets`), the draft's colours, options,
  reward and count on top.
- It creates or PATCHes as today. Its fingerprint includes the new fields,
  so Back-and-change after sign-up PATCHes.
- After the create it uploads the logo (`use=logo`), then the stamp
  picture, each once.
- Every design it sends carries a stamp alert message (§4.2, item 4).

`draft.test.ts`, `walk.test.ts` and `looks.test.ts` pass, with new tests
beside them for a draft from before, a look with options, and the logo.

## 8. Copy

New and changed keys, in both files. The exact key names are step B's, under
the namespaces shown. Plural forms follow the bar's change count.

**The studio**

| Key | עברית | English |
|---|---|---|
| `studio.chips.behind` (replaces "הרקע") | מאחורי החותמות | Behind the stamps |
| `studio.colours.brand` | הצבע של העסק | Your business colour |
| `studio.colours.follow` | ממנו נגזרים שאר הצבעים | The other colours follow it |
| `studio.colours.rows.stamps` / `.ground` / `.text` | **החותמות** בצבע העסק · **הרקע שלהן** {{colour}} · **הטקסט** {{colour}}, כדי שייקרא | **The stamps** in your colour · **Their ground** {{colour}} · **The text** {{colour}}, so it reads |
| `studio.colours.change` / `.changed` / `.back` | שינוי · שיניתם · חזרה לצבע של העסק | Change · Changed by you · Back to the business colour |
| `cardControls.sticker.legend` | מה על כל חותמת | What's on each stamp |
| `cardControls.sticker.trade.{barber,cafe,trainer,therapist,other}` | למספרה · לבית קפה · לאימון אישי · לטיפול · לכל עסק | For a barber · For a café · For a trainer · For a therapist · For any business |
| `cardControls.sticker.more` / `.symbol` | עוד מדבקות · סמל פשוט | More stickers · A plain symbol |
| `cardControls.sticker.search` / `.searchHint` | חיפוש מדבקה · קרואסון, פרח, כוס… | Find a sticker · Croissant, flower, cup… |
| `cardControls.sticker.noResults` | אין מדבקה בשם הזה. נסו מילה אחרת, או בחרו מהקבוצות. | No sticker by that name. Try another word, or pick from the groups. |
| `cardControls.sticker.groups.*` | קפה ושתייה · מאפים ומתוקים · אוכל · מספרה ויופי · טיפול ורוגע · כושר וספורט · חיות · פרחים · מתנות וכללי | Coffee and drinks · Bakery and sweets · Food · Barber and beauty · Wellness · Fitness and sport · Pets · Flowers · Gifts and more |
| `cardControls.style.icon` (was "בלי עיגול") | לבד | On its own |
| `cardControls.tint.label` / `.labelStamps` | בצבע הכרטיס · בצבע החותמות | In the card's colour · In the stamps' colour |
| `cardControls.tint.hint` | {{sticker}} בגוונים של הצבע הזה. | The {{sticker}} in shades of that colour. |
| `cardControls.mark.offHint` | הכרטיס הזה מסמן כל חותמת בווי. אפשר לכבות. | This card ticks every stamp. You can switch it off. |
| `cardControls.panel.legend` / `.hint` | רקע לחותמות · צבע מאחורי החותמות, בתוך הכרטיס. | A ground for the stamps · A colour behind the stamps, inside the card. |
| `cardControls.panel.names.*` | לבן · שמנת · חול · מנטה · ורוד · כחול לילה | White · Cream · Sand · Mint · Blush · Navy |
| `cardControls.panel.faint` / `.stampsFaint` | הרקע כמעט לא ייראה על הכרטיס הזה. · החותמות כמעט לא ייראו על הרקע הזה. | This ground will barely show on this card. · The stamps will barely show on this ground. |
| `cardControls.pattern.legend` / `.hint` / `.likeStamp` | דוגמה עדינה מאחור · בצבע החותמות, בעדינות. · כמו החותמת | A faint pattern behind · In the stamps' colour, faintly. · Like the stamp |
| `cardControls.pattern.covered` | תמונת הרקע שלכם מכסה כאן כל דוגמה. | Your background picture covers any pattern here. |
| `studio.count.legend` / `.places.secondary` / `.places.header` | המספר על הכרטיס · מתחת לחותמות · למעלה, ליד הלוגו | The count on the card · Under the stamps · At the top, by the logo |
| `studio.iphoneOnly` | רק באייפון | iPhone only |
| `studio.logoText.wide` / `.long` | הלוגו הזה רחב, והשם כבר כתוב בו. · באייפון שם ארוך נחתך עם שלוש נקודות. | This logo is wide and already carries the name. · On an iPhone a long name is cut short with an ellipsis. |
| `studio.names.googleLong` | גוגל ווליט מציג בערך 20 תווים, ולכן יופיע: {{shown}} | Google Wallet shows about 20 characters, so it will read: {{shown}} |
| `studio.drawn.current` | כך הכרטיס אצל הלקוחות עכשיו | This is the card your customers have now |
| `studio.drawn.failedSaved` | את השינוי האחרון לא הצלחנו לצייר כרגע. הוא שמור בטיוטה, ושמירה תשלח אותו כמו שהוא. | We couldn't draw your last change just now. It's kept in the draft, and Save sends it as it is. |
| `studio.drawn.retry` | לצייר שוב | Draw it again |
| `studio.stickers.outage` | המדבקות לא נטענו כרגע, ולכן אי אפשר לשנות אותן. החותמות בכרטיס נשארות כמו שהן. | The stickers didn't load just now, so they can't be changed. The stamps on the card stay as they are. |
| `studio.check.advice` (rewritten) | יש לנו הצעה לכרטיס. הכרטיסים מתעדכנים בכל מקרה. | We have a suggestion for the card. Cards update either way. |
| `studio.check.contact` | אין לכרטיס טלפון בגב. כדאי להוסיף, כדי שלקוחות יוכלו להתקשר. | The card has no phone on its back. Adding one lets customers call. |
| `studio.saved` (rewritten) | נשמר. הכרטיסים של הלקוחות מתעדכנים בשקט, בלי התראה. רק חותמת חדשה מתריעה. | Saved. Customers' cards update quietly, with no alert. Only a new stamp alerts. |
| `studio.fields.messageAlways` | בלי ההודעה הזו אייפון לא מתריע על חותמת חדשה, ולכן תמיד נשלחת אחת. | Without this message an iPhone doesn't alert on a new stamp, so one is always sent. |

**The wizard**

| Key | עברית | English |
|---|---|---|
| `onboarding.road.look` | המראה | The look |
| `onboarding.look.heading` | בחרו מראה לכרטיסייה | Pick a look for your card |
| `onboarding.look.lead` | מראות ל{{trade}}. את הצבע, החותמת וההטבה בוחרים אחר כך, וכל דבר אפשר לשנות גם בסטודיו. | Looks for a {{trade}}. You choose the colour, the stamp and the reward next, and can change anything later in Card Studio. |
| `onboarding.look.next` | המשך עם {{look}} | Continue with {{look}} |
| `onboarding.look.noTrade` | בחרו סוג עסק כדי לראות מראות. | Pick a kind of business to see its looks. |
| `onboarding.business.tradeLine` | {{trade}} · שינוי | {{trade}} · Change |
| `onboarding.logo.label` / `.hint` | לוגו (לא חובה) · לוגו מרובע יופיע באייפון עם שם העסק לידו. לוגו רחב, שהשם כבר כתוב בו, יופיע לבד. | Logo (optional) · A square logo shows on iPhones with your name beside it. A wide one with the name already in it shows on its own. |
| `onboarding.logo.kept` | הלוגו נשמר במכשיר הזה עד שתשמרו את הכרטיסייה. | The logo stays on this device until you save the card. |
| `onboarding.look.drawFailed` | לא הצלחנו לצייר את המראה בצבע שלכם כרגע. כך הוא נראה בצבעים שלו. | We couldn't draw the look in your colour just now. Here it is in its own colours. |
| `onboarding.look.pictureCircles` | בכרטיס עצמו התמונה תופיע במראה שבחרתם. כאן היא מוצגת בעיגולים. | On the card itself your picture appears in the look you chose. Here it's shown in circles. |
| `onboarding.look.tooMany` | ציירנו הרבה גרסאות בזמן קצר. נסו שוב בעוד דקה. | We've drawn a lot of versions in a short time. Try again in a minute. |

The trades' names reuse `onboarding.niches.*`, and the looks' names come from
the catalog (`name_he`, `name`). Hebrew speaks in the plural, as everywhere.

## 9. What each step B keeps, touches and checks

### The studio (`looks/studio`)

**Keeps:**
- every call `/dashboard/design` makes, PR #40's included;
- the 400 ms check, Save on its button, the draft in the tab, and
  `data-tour="design-studio"`;
- today's studio, exactly, while the sticker list says the options aren't
  there;
- `GoogleCardPreview`, `StampGrid` and `PassBarcode`;
- `src/api` (no call changes on the studio's side), `src/lib`, the kit.

**Touches:**
- **The trays and controls:**
  - `trays/` (`ColoursTray`, `StampTray`, `BackgroundTray` → behind the
    stamps, `NamesTray`, `LogoTray`, `WalletDetailsTray`, and the reward
    tray's count);
  - `controls/` (`StickerPicker` with groups and search, `StampStylePicker`,
    `PanelColourPicker` with names, a pattern picker merging texture and
    wallpaper, a business-colour control);
  - `StudioStage` (the tag, the saved card on a failure), `DesignPage` (the
    list outage on a styled card), `lintProblems.ts` (two advice kinds).
- **New pure modules with tests:** `brandColours.ts` and `stickerGroups.ts`,
  and the rules in `designOptions.ts`.
- **`AppleCardPreview`,** as Roee agreed: PR #40's change and the logo row
  left to right.
- **`/admin/catalog/:id`.**
- **Docs:** `docs/card-studio.md` (the fifth correction, the trays), and both
  locale files.

**Checks:**
- as a manager and an owner; staff get "not for your role";
- Hebrew and English, at 375 and 1280, at 200% text, by night;
- the bakery from a plain card in at most 16 taps with no hex, and bubble
  tea in at most 7;
- the options there and not there, and the list failing on a styled card;
- a slow drawing, a failed one, and a v0.1.0 server's 400 on Save;
- a card made before the options, and one with the check on;
- an English name on a Hebrew card, and a 30-character name beside a logo;
- the message on a change cleared;
- `/admin/catalog/:id` after each change;
- `npm run build`, `npm run lint`, `npm test`, a clean console, the keyboard
  path, reduced motion.

### The backend's part (punchme-backend)

Builds §4.2's items 1–4 and 6, and item 5 if Roee says yes. Tests for each:
- a public endpoint's throttle and cache;
- a drawing request with a text field refused;
- an old design with an empty change message;
- a look published with and without a drawing.

### The wizard (`looks/onboarding`, against the backend's PR)

**Keeps:**
- the eight routes and the ninth, `/onboarding/look`;
- the forward guard, `OnboardingGate`, the walk;
- the four points that clear the draft;
- every call in `docs/onboarding-flow.md`, plus §4.2's three and the logo's
  upload;
- the draft's `v: 1`, its keys and its tests;
- `commit.ts` looking before it creates;
- today's wizard, exactly, while the options aren't there.

**Touches:**
- `src/routes/onboarding/` (the look screen, `road.ts`, the guard, `draft.ts`
  and `commit.ts` by optional fields, `looks.ts`);
- `CardStage` (the drawn strip);
- the shared card controls (and then the studio, checked again);
- `src/api` for the new calls (`presets.ts`, a stickers read, the drawing);
- `docs/onboarding-flow.md`.

**Checks:**
- signed out; signed in with no business; signed in with a business and a
  draft;
- a draft from before the options, and Back-and-change after sign-up, which
  PATCHes;
- "Replace" and "Keep" on an account with a card;
- a lost logo, and a lost picture;
- the drawing slow, failed, and throttled (429);
- Hebrew and English, 375 and 1280, 200% text.

## 10. Open questions

1. **A picture held for Save on a styled card** can't be seen before it
   reaches every customer (§3.3, case 4). The fix is a changed call: the
   design preview takes the held picture (a data URL, at most 512px). The
   backend sends it to passbox as an asset no program uses yet, and draws
   with it. Recommendation: yes, in the backend's part, once Roee approves
   the call. Until then the stage says what it says today.
2. **The name on the pass.** Under passbox "שם העסק על הכרטיס" draws
   nothing, and the business's name can't be changed after onboarding.
   Recommendation: the backend sends `organization_name` when set (§4.2,
   item 5). The other way is to hide the field and add a rename to a
   business settings page later.
3. **The business's phone.** passbox advises a contact on the back of every
   pass, and Apple asks for one (passbox GUIDE §5.1). The wizard fills a
   phone from Google Places when it can, but nothing lets an owner set or
   change it. A small settings page is outside this work.
4. **Templates later.** Roee may hand-make a few looks to start from in the
   studio. The catalog already holds them, and §4.2's pictures would serve a
   studio "start from a look" with no new drawing work. That is a decision
   for when they exist.
5. **Stamps fill left to right on a Hebrew card.** This is passbox's drawing,
   so the preview is right; a right-to-left fill would be passbox's change.
6. **Publishing order.** The wizard's looks need published styled looks.
   Recommendation: publish the café four and one or two per other trade, with
   the check removed and the latte's labels fixed (§4.2, item 6), after
   passbox production runs v0.1.1. Until then the wizard is today's,
   exactly.
7. **Which picture a look's tile shows on a desktop.** Apple's strip unless
   the device is an Android, as `OwnPass` decides the wallet. Recommendation:
   the same rule; no switch on the looks screen.

## 11. Review notes for step B

Checked against the code, the contracts and the input on 4 Nov. Step A kept
to its prompt:
- no code changed;
- every decision in §5 is Roee's, made on the canvas;
- its stack is down: no container, image or database is left, and its launch
  entry is gone.

These notes win where they differ from §4 to §9.

- **The text's ink** (§6.2). White or `#202024` can't always reach 4.5:1:
  - Mid-tones top out near 4.05:1. That includes `#7f7f7f`, a violet like
    `#7a6ff0` (4.14) and an orange like `#d35400` (4.17), all colours an
    owner can type as their own.
  - Between white and pure black, the better one never falls under 4.61:1.
  - So the text takes `#202024` where it clears 4.5:1, then `#000000`, then
    white. `brandColours.test.ts` covers the mid-tones.
- **The ground and the stamps** (§6.2). Settle them in one order, not each
  against the other:
  - the ground first, from the card;
  - then the stamps, against the ground when there is one.

  Name the luminance that makes a card "dark", and test pale yellow, mid
  grey, black and white. The stamp-on-ground warning (§6.4) judges only
  stamps drawn in a colour: a glyph, or a tinted sticker or picture. An
  untinted sticker or photo keeps its own colours (the input's §2).
- **"Only a new stamp alerts"** (§6.9, `studio.saved`). The alert message is
  the iPhone's (the input's §3). The phones showed design changes arriving
  quietly on both, then "the next stamp alerted as usual" (§4). Confirm that
  a stamp alerts on the S25 before the toast says it of every phone. Until
  then, it says the update is quiet and stops there.
- **The contact advice** (§6.8). It asks for a phone that nothing lets an
  owner add (§10, question 3). Leave `merchant.contact` out of what the
  studio shows until there is a place to add one. Read it as advice, never
  as "cards won't update".
- **That false notice isn't PR #40's alone.** `readLint` on `main` reads
  every passbox warning it doesn't know as blocking, so any backend on
  passbox shows it. Fix it in step B's first commit.
- **The look screen's lead** (§7.3, §8). "מראות ל{{trade}}" over
  `onboarding.business.niches.*` gives "מראות לאחר" and "Looks for a Other",
  and the trainer's and the therapist's names are slash forms. It takes a
  phrase of its own per trade, as `cardControls.sticker.trade.*` does:
  "לכל עסק", "for any business".
- **The draft's fields** (§7.5):
  - There is no `colours` object. `background`, `accent` and `foreground`
    are top-level, so the ground is a new top-level `panel`.
  - `punchme.onboardingDraft.art` holds one `StoredArt` (`{hash,
    dataUrl}`), so the logo takes a key of its own,
    `punchme.onboardingDraft.logo`, cleared at the same four points.
  - The logo is scaled down before it is kept, as the stamp's picture is,
    and a logo that can't be kept is said like a lost picture.
- **The public drawing** (§4.2, item 3). Free hex colours make most bodies
  a cache miss, so the throttle is the real guard:
  - it reads the client's address as the host's proxy passes it, not the
    proxy's own;
  - a ceiling for all visitors together sits over the per-address one.
- **The seeded looks' check marks** (§4.2, item 6). While PR #17 is
  unmerged, edit its `preset_data/styled/*.json` instead of adding a data
  migration.

## Appendix: the stack step A ran

Kept for step B. Nothing of it was committed, and it was taken down after this
brief.

**passbox:**
- `git archive f7eb03a` of `../passbox-api` into a folder, `docker build -t
  passbox-server:looks-v0.1.1 .`.
- A database `passbox_looks` in `passbox-api-postgres-1`, then `docker run`
  with `DJANGO_SETTINGS_MODULE=config.settings.dev`, a generated
  `SECRET_KEY` and `PASSBOX_MASTER_KEYS`, and `DATABASE_URL` to
  `host.docker.internal:5433/passbox_looks`, `-p 8002:8000`.
- `manage.py migrate`, `create_account "PunchMe looks check" --mode test`,
  `create_api_key …` (the key into a file, never printed).

**The backend:**
- `docker build -t punchme-backend-looks:pr17 .` in the `design-options`
  worktree.
- `pg_dump punchme | psql punchme_looks` in `punchme-backend-postgres-1`.
- A one-line settings module (`from .dev import *; WALLET_PROVIDER =
  "passbox"`) mounted as `config/settings/looks.py`.
- `docker run` on `punchme-backend_default` with `--add-host
  host.docker.internal:host-gateway`, the backend's `.env`, and
  `DATABASE_URL` to `punchme_looks`. Also `REDIS_URL` to database 7,
  `PASSBOX_API_URL=http://host.docker.internal:8002`, `PASSBOX_API_KEY`,
  `PASSBOX_WEBHOOK_SECRET` and `WALLET_PASS_HOST`.
- `manage.py migrate`, then `runserver` on `-p 8001:8000`.

**The frontend:** a worktree of `looks/studio` outside the repo, with
`node_modules` joined to the main checkout's, `.env` copied, and `.env.local`
`VITE_API_ORIGIN=http://127.0.0.1:8001`. It ran on 5188 from a launch entry
that used `npm --prefix`.

**Headless Chrome:** `cdp-server.mjs` from earlier sessions, now accepting the
studio's "leave with unsaved changes?" dialog by itself (it froze the tab
once). The fetch wrapper's URL regex had to go: a `\/` in a template string
became `//` and killed the script silently.
