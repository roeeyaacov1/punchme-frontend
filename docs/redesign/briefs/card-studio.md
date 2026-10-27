# The card studio

Phase 3, step A of `docs/redesign/guide.md`: the Card Studio on
`/dashboard/design`, and the same `CardStudio` on `/admin/catalog/:catalogId`
for PunchMe staff. Diagnosed and written on 26 and 27 Oct 2026 with
`/impeccable critique`, `/impeccable audit`, `/break-ui` and
`/impeccable shape` (mode: Operate). No code changed. Step B builds it on
Lightbox (DESIGN.md) and `src/components/kit`, in Plan mode.

The inputs:
- CLAUDE.md, PRODUCT.md, DESIGN.md, `docs/card-studio.md` (the line between
  the frozen pass and the open editor, and the problems it lists, which this
  brief treats as requirements) and `docs/dashboard-routes.md`
  (`/dashboard/design` and `/admin/catalog/:id`);
- in `docs/redesign/briefs`: `visual-world.md`, `dashboard-shell.md` (§8, how
  a page claims Lightbox), and the three dashboard briefs before this one,
  whose patterns the studio shares: `dashboard-counter.md` (the Overview's
  own pass on the kit's `WallpaperStage`, a read that fails saying so),
  `dashboard-manager.md` (the rule editor's sticky stage and docked action,
  the draft kept in the tab) and `dashboard-owner.md` (focus never on
  `<body>`, failures said where they happen);
- the studio's code, and the backend's design, lint, image and strip
  modules (§6);
- the studio itself on the local backend's demo data: Demo Coffee on Pro
  (its owner and manager) and Demo Barbershop on Free (its owner), and
  `/admin/catalog/cafe-classic` as a PunchMe staff account made for this step
  (`studio-review@punchme.test`, its password kept in the session's
  scratchpad, not here).

It was walked Hebrew first at 375px, by day and at night, then in English at
1280px. Locally the published card images live on `fake-wallet.local` and
never load, so a saved card shows without its strip and logo; an edit
switches the preview to the live stand-in. Every write in the worst cases
(Save, uploads) was answered by a fetch wrapper in the reviewer's own tab.
The only real writes were four PATCHes the API refused at its schema, which
save nothing (§5).

Two reviewers ran apart for the critique, at the same time, each in its own
headless Chrome so neither could sign the other out:
- **A, design review:** read the code and walked the studio as the barber;
- **B, detector:** ran Impeccable's detector over the studio's files and
  over the live page, and injected its overlay.

The audit and break-ui ran in a third browser. Five questions went to Roee
on the way, one of them twice, after he asked to see the three layouts
drawn; his answers are in §7.

Read "In short" first. Sections 8 to 10 are what step B builds; §11 holds
what is still open.

1. In short
2. The studio today
3. Critique
4. Audit
5. The worst cases
6. What the backend says
7. Decisions made in this step
8. The new studio
9. Copy
10. What step B keeps, touches and checks
11. Open questions for Roee
12. Left for other phases, and outside the redesign
- Appendix A: the worst-case data

---

## 1. In short

- **One route, one job: change what the customer's pass looks like and
  promises, and see it change.** The studio claims Lightbox with
  `useLightboxPage()` and is rebuilt on the kit, so the seam (lavender by
  day, navy at night, under the warm frame) closes for it. The pass stays
  exactly as it is in its 300px slot; everything around it is new.
- **The card is the map** (Roee, from Impeccable's roll, §7). On a phone the
  card stands on its own wallpaper at the top and never leaves the screen
  while it is edited:
  - its stamps, its name row and its logo open what they show;
  - a row of chips under it does the same for anyone who doesn't tap the
    card;
  - the reward is said as a sentence under the card ("קפה חינם אחרי 8
    חותמות");
  - each choice opens in a tray over the lower half, so every swatch, glyph
    and number lands on the card in view.

  From 1024px the card stands in a sticky column beside the trays, which
  become tabs, as the rule editor's stage does.
- **Save is one coral button that is always in reach and says what it
  does:** "2 שינויים · עוד לא בכרטיסים של הלקוחות". It docks above the
  phone bar from the first change, sits at the foot of an open tray, and
  after saving the toast says that every pass already in a wallet updates
  itself. The draft is kept in the tab, so leaving loses nothing, and
  closing the tab asks first.
- **Uploads wait for Save** (Roee, §7). A picture is cropped and shown on
  the card in the browser, and goes to customers with everything else, in
  one moment. Today an upload reaches every installed pass at once while the
  rest of the edit waits.
- **One set of card controls for the studio and onboarding** (Roee, §7):
  - card colour, stamp colour, stamp, texture, stamp count and reward,
    built once in this phase under `card-studio/controls`;
  - controlled and blind to whose draft they edit;
  - the studio uses them now and onboarding in Phase 4;
  - the studio gains onboarding's guard (a stamp colour that clears 3:1
    on the card), and onboarding gains the studio's palettes.
- **Eleven things say what isn't so, and this phase fixes them:**
  - the reward the studio edits never reaches the pass: its back keeps the
    words onboarding wrote ("קפה שמיני חינם" against "קפה חינם" on the
    demo);
  - the preview never shows the stamp colour, because the sample opens at
    0 stamps;
  - moving the stamps to 12 makes the check say "עוד לא מוכן לפרסום:
    missing Apple strip images for states: 9, 10, 11, 12", about an edit the
    next save completes by itself;
  - "מוכן לפרסום" on a card that is already live, and on a Free card that
    publishes nothing;
  - a saved picture stamp shows as a glyph after a reload, and a glyph
    tapped after an upload changes the draft and lights Save while the
    picture still wins, with nothing said;
  - a white stamp is drawn as a blank disc in the stand-in, while the phone
    draws its glyph dark (the stand-in is a frozen file; §11);
  - a save that fails says "Failed to fetch", "Unprocessable Entity", raw
    server English, or nothing at all, and with no message the fallback is
    "משהו השתבש בכניסה";
  - an upload that fails says "נסו תמונה אחרת" for a dropped connection,
    837px below the control;
  - "נשמר ✓" for 2.5 s at the top of the page, unannounced;
  - "Add field" deals `meta.custom` six times over, a card the backend's
    own notes say the provider refuses;
  - the studio says ניקוב and פרס where the glossary, onboarding, the
    Overview and the tour say חותמת and הטבה.
- **Four things for the backend** (§11): a call to remove a template's
  picture (Roee: ask for it), the picture itself in the design read, a
  refusal of duplicate bindings, and lint as codes rather than English.

## 2. The studio today

### What each role and plan sees

| | `/dashboard/design` |
|---|---|
| Pro owner and Pro manager | The same page. "סטודיו הכרטיסיות", a three-line subtitle, "הוספה לארנק" (a navy pill) and "שמירת עיצוב" (lilac until an edit). The stage: an Apple/Google switch, the pass in a lavender well, "ניקובים בתצוגה" (a slider at 0 over eight dots). A green "מוכן לפרסום — הכרטיס מוצג במלואו בשני הארנקים.". Four panels: "העסקה" (card name, "הפרס", "ניקובים עד הפרס" with a 12-dot strip), "הניקוב" (16 glyphs, "העלאת תמונת ניקוב משלכם"), "צבע ומרקם" (6 palettes, 4 colour wells, 4 textures), "הלוגו שלכם". "פרטי הארנק" closed |
| Free owner | The same page; its "הוספה לארנק" adds the trial pass. Nothing on it is gated by plan. Only the masthead's "עדיין לא פעיל · הפעלה" differs |
| Pro staff | The shell's role panel (`RequireRole minimum="manager"`, `main.tsx:159-161`), with no call behind it |
| PunchMe staff, `/admin/catalog/cafe-classic` | `AdminLayout` (white, navy, a gold "Staff" badge in Plex Mono at 2.70:1). A back link, the look's name, its id in Plex Mono, Save. The shelf panel (trade, description, published) and the art panel (four slots), then the same `CardStudio` without the logo panel, the business shown as "PunchMe" or the design's organisation name. At 375 the card starts at y 1,582 |

### The barber's minute

The prompt's question: can a barber on a phone change the reward, the
colours and the stamp in under a minute without reading anything? **No.**
A's walk at 375 in Hebrew, by day, as the Pro manager:

| Step | Moves | Distance | What the card does |
|---|---|---|---|
| 1. The reward | one swipe, tap the field, select all, type, close the keyboard | 766px down | It is off-screen, and wouldn't change anyway: the reward is never drawn |
| 2. Card colour | one swipe, tap the well, tap a 25×25 swatch, tap outside | 773px further | It repaints, 1,164px above the screen |
| 3. Stamp colour | tap the well, a swatch, outside | 68px further | Nothing: the sample is at 0 stamps |
| 4. The glyph | one swipe up, tap | 548px back | The grey stamps show the new glyph |
| 5. Save | one or two swipes, tap a 103×40 button | 1,035px back up | "נשמר ✓" for 2.5 s |

About twelve taps and the typing, five scrolls and 3,190px of travel; 50 to
70 seconds for someone who knows the page, more for anyone hunting for why
the stamp colour doesn't show. It fails "without reading": the four colour
wells look the same but for their labels. At 1280 the colours work, because
the stage is sticky beside the panels; the reward and the stamp colour still
show nothing.

### Measured

- **Page height at 375 in Hebrew:** 2,663px; 4,619 with "פרטי הארנק" open;
  7,289 with ten pass fields. At 1280: 1,476 in Hebrew and 1,496 in English.
- **Distance from the card:** at 375 the reward field is 422px below the
  card's bottom edge, the glyphs 687–973, the card colour 1,188, the stamp
  colour 1,256. Save is at y 202.
- **No AA failure** in text outside the pass, by day or at night.
- **Field edges** measure 1.18–1.27:1 by day and 1.22–1.40:1 at night, where
  a control's edge needs 3:1 (WCAG 1.4.11).
- **Under 44px:** Save 103×40; the Apple/Google switch 79×28 and 80×28;
  "הוספת שדה" 99×42; the popover's swatches 25×25; the punch strip's dots
  about 22px (pointer shortcuts, `aria-hidden`).
- **Under 13px outside the pass:** the switch (12px), the hex values (12px),
  the texture labels (11px), the popover's "גוונים" (11px), and every hint
  (12px `text-xs`).
- **Plex Mono, which has no Hebrew:** the Apple/Google switch ("אפל ווליט"),
  the hex values, and the sliders' figures.
- **Focus:** pressing Save from the keyboard drops focus to `<body>` (the
  button disables under it). The reward is 7 Tab stops from the top and the
  stamp colour 13.
- **Live regions:** only the two sliders' debounced values. "נשמר ✓", the
  check and a save's failure aren't announced where they happen.
- **The seam:** `<html>` wears `theme-purple theme-raised`, a lavender page
  (`#f5f6fe`) under the warm masthead by day, navy (`#0f0f23`) beside the
  brown street at night. Save is `#5b41e6`. `AdminLayout` wears no theme at
  all.
- **320px:** the page moves 30px sideways; the stage's panel is 334px and
  doesn't clip. **200% text at 375:** 424px wide.
- **A published image that fails to load** (here every one, on the fake
  host) shows a broken-image icon; nothing falls back to the stand-in.
- **The console:** clean apart from the known lines, the two 401s at a cold
  boot, React Router's future-flag warning, and the fake wallet's host.

## 3. Critique

20/40, Acceptable, at the bottom of the band. The scores are A's. B's
detector agreed with A on the popover's 11px heading and on the field
editor's boxes nested in a panel, and added the texture tiles' 11px labels
and two stragglers. The snapshot is in
`.impeccable/critique/`, uncommitted, for step D's `/impeccable polish`.

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | The card repaints for the card colour and the glyph, but not the stamp colour (sample at 0) or the reward (never drawn); the only sign of an unsaved edit is Save turning violet, 1,313px off-screen; "נשמר ✓" for 2.5 s, unannounced |
| 2 | Match with the real world | 2 | ניקוב and פרס against the glossary's חותמת and הטבה; Wallet details speaks PassKit ("%@ יוחלף בערך החדש", "מיקום (אפל)", "נלווה", bindings); the check in developer English |
| 3 | User control and freedom | 2 | No undo; leaving loses edits without a word; a picture stamp can't be taken back; one tap removes a pass field |
| 4 | Consistency and standards | 2 | Two visual systems on one screen; admin has an "unsaved" pill the owner's page lacks; two editors for the same two labels |
| 5 | Error prevention | 1 | No `maxLength` against the API's 80, 200, 60 and 120; no contrast guard on the stamp colour (onboarding has one); "Add field" deals duplicate bindings; nothing warns before an upload that goes to every customer at once |
| 6 | Recognition rather than recall | 3 | Choices drawn as the card itself; but at 375 the card is 1,164–1,256px from the colour wells |
| 7 | Flexibility and efficiency | 3 | Palettes set four colours at once; hex, eyedropper and the strip as shortcuts; native radios |
| 8 | Aesthetic and minimalist design | 2 | About 58 targets before Wallet details; four identical wells; two dot strips that look alike and mean different things; the navy "הוספה לארנק" outweighs Save |
| 9 | Error recovery | 1 | "Failed to fetch"; "Unprocessable Entity" or nothing; "try another image" for a dropped connection, far from the control |
| 10 | Help and documentation | 2 | The subtitle says saving reaches every installed pass, the one thing worth saying; nothing says why the stamp colour doesn't show, or what "מוכן לפרסום" means on a live card |
| | **Total** | **20/40** | |

**Specificity.** Half-authored. The choices inside are this product's: a
palette chip is a scrap of the owner's own card drawn with the glyph they
chose, a texture tile is their card colour with the pattern in their stamp
colour, "stamps to reward" is a strip the length of the card. Everything
around them could be any SaaS settings page: stacked white panels under h2s,
a Figma-style colour popover with "Surprise me", and "Wallet details" laying
PassKit's own model out as a form. The lit sign doesn't reach it, and the
pass's stage doesn't keep its light at night (the Lit Things Rule).

**The detector** (B):
- **CLI:** exit 0 and 9 advisories over `card-studio/`, `DesignPage.tsx`,
  `AdminCatalogEditPage.tsx` and `CatalogArtPanel.tsx`. Two are real: the
  texture tiles' 11px labels (`CardStudio.tsx:223`) and the popover's 11px
  "גוונים" (`ColorWell.tsx:226`). Seven are inside the frozen previews
  (`CardPreviews.tsx`, `StampGrid.tsx`) and stay.
- **Over CDP**, at 375 in Hebrew by day and at night, with Wallet details
  open, in English at 1280 and on the admin page:
  - stragglers: "המותקנים." alone on the subtitle's third line
    (`DesignPage.tsx:147`), "המחדל." on the labels hint (`LabelsEditor.tsx:56`).
    Real;
  - `nested-cards` ×3 on the field editor's boxes inside the Wallet details
    panel (`FieldsEditor.tsx:58`). Real, and A reached the same complaint;
  - `nested-cards` on the 300px slot, and `repeating-stripes-gradient` on the
    texture tiles: false positives, the frozen pass and the strip's own
    patterns;
  - the admin "Staff" badge at 2.70:1 (`AdminLayout.tsx:17`). Real, in the
    admin shell, which isn't this phase's (§12).
- **Missed by the detector:** every 12px `text-xs` hint (the rule catches only
  arbitrary sizes), the Hebrew switch in Plex Mono, and every semantic failure
  in §1.
- **Overlay:** injected into B's headless tab, "[impeccable] 2 anti-patterns
  found", the two false positives. No one could see it.

**Priority issues**
1. **[P1] The card can't be watched while it's edited, and two of the four
   edits never show on it.** At 375 every control is 422–1,256px below the
   card; the sample opens at 0 stamps (`CardStudio.tsx:103-106`), the one
   state in which a stamp's colour can't be seen; `rewardDescription` is
   passed in and never drawn. Fixed in §8.3 and §8.4.
2. **[P1] The reward on the pass never changes.** It reaches the pass only as
   the back field `universal.info`'s `default_value`, written once by
   onboarding (`draft.ts:296-300`) or the preset, and no studio control edits
   it (`FieldsEditor.tsx:55-128` has no value input). Fixed in §8.6.
3. **[P1] Saving is far, small and silent, and its failures are English or
   nothing.** Save 103×40 at y 202 (`DesignPage.tsx:162-169`); "נשמר ✓" on a
   2.5 s timer (`:119`, `:150`); focus to `<body>`; `err.message` as it comes
   (`:123`), with `auth.error` as the fallback; leaving loses edits. Fixed in
   §8.5.
4. **[P1] The check tells a barber his ordinary edit broke the card, in
   developer English** (`CardStudio.tsx:295-315`; the backend's
   `lint_template_design`, §6), on a warm fill. Fixed in §8.7.
5. **[P2] The studio speaks PassKit, not the barber.** Wallet details asks for
   bindings, sections, `%@` and left or right on a right-to-left card
   (`FieldsEditor.tsx:10-26`); the same two labels have two editors
   (`LabelsEditor.tsx`); "Add field" deals `meta.custom` again and again
   (`:44-51`). Fixed in §8.8 and §9.

**Personas**
- **Avi, the barber owner (PRODUCT.md):** about 58 targets where "nothing
  needs reading first"; a reward that never reaches his customers' pass; an
  upload he can't undo; a save that reaches everyone with no word on what
  changes; words that differ from the dashboard he uses every day.
- **Casey (one hand, interrupted):** Save at the top, 103×40; edits lost on a
  tap of the phone bar; 25px swatches; the popover running under the phone
  bar (its edge at 777px, the bar at 747).
- **Jordan (first time):** two sliders over two identical dot strips, and
  only one changes the card; the stamp colour shows nothing; "מוכן לפרסום"
  beside "שמירת עיצוב" reads like a second step.
- **Sam (screen reader, keyboard):** native radios and a short Tab path, but
  "נשמר ✓", the check and an upload's failure aren't announced where they
  happen; Save drops focus; three "הסרה" buttons say the same; field edges
  under 3:1; reduced motion switches the stamp's landing off instead of
  making it gentler (`studio-primitives.tsx:309-310`, `ColorWell.tsx:161`).

**Strengths, kept:**
- **Choices drawn as the card itself** (`CardStudio.tsx:161-231`): a palette
  chip in the owner's colours with the owner's glyph, a texture tile as a
  piece of the strip.
- **The length strip as the control,** with the slider as the one accessible
  control behind it (`studio-primitives.tsx:189-333`).
- **An honest stage:** the stand-in while edits are unsaved and the published
  PNG once saved, the server's own check, the owner's own pass in their
  wallet, and a popover whose keys are right.

## 4. Audit

9/20, Poor.

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | Save drops focus to `<body>`; saves, failures and the check unannounced; field edges at 1.2:1; targets of 28, 40 and 42px; Hebrew in Plex Mono at 12px; hints at 12px; reduced motion as none; three identical "הסרה" |
| 2 | Performance | 3 | One read, a lint check debounced at 400 ms, art capped at 512px by the server. A dragged colour re-renders the whole studio on every move, which is cheap enough; a published PNG that fails has no fallback |
| 3 | Theming | 1 | The old violet scope and the four old primitive sets (`studio-primitives`, `dashboard/primitives`' `Notice` and `Tag`, `marketing`'s `ctaClasses`, `onboarding`'s `ChoiceGrid`); fixed `navy-deep` and white on a chosen glyph; navy at night; the admin page on no scope |
| 4 | Responsive | 2 | 30px sideways at 320; 49px at 200% text; two columns only from 1280, so the tablet gets the phone's long page beside the rail; 7,289px with ten fields |
| 5 | Implementation integrity | 1 | The reward never reaches the pass; the check's false alarm; the picture forgotten; the stand-in's white glyph against the server's ink rule; no limits against the API's; raw `err.message`; duplicate bindings; two editors for one value; a Hebrew literal (`SAMPLE_NAME`) in both languages; uploads live at once while edits wait |

**Detailed findings**
- **[P1] Focus to `<body>` on Save** (`DesignPage.tsx:165`, `disabled={saving
  || !dirty}`): the button disables under the keyboard. WCAG 2.4.3.
- **[P1] Nothing a save or an upload does is announced** where it happens:
  "נשמר ✓" isn't a live region, the upload's `role="alert"` is 837px below its
  control. WCAG 4.1.3.
- **[P1] Control edges at 1.18–1.40:1** (`studio-primitives.tsx:75-78`, the
  wells and the upload buttons). WCAG 1.4.11 asks 3:1; Lightbox's Field Edge
  is 3.35:1.
- **[P1] Limits the server keeps and the page doesn't:** card name 1–80,
  reward 200, a field's label 60, its change message 120, the organisation
  name 120 (§6). Over the limit, Save answers 422 and the page says
  "Unprocessable Entity" in English, or nothing where the status text is
  empty (HTTP/2).
- **[P1] The reward, the check, the picture, the stand-in's ink** (§3, §5).
- **[P2] Targets:** the switch 28px tall, Save 40, "הוספת שדה" 42, swatches 25.
- **[P2] Type:** 11px and 12px outside the pass; Plex Mono for Hebrew and for
  hex values.
- **[P2] Reduced motion is none:** `motion-reduce:animate-none` on the strip's
  dots and the popover. The house rule is gentler, not none.
- **[P2] Overflow at 320 and at 200% text.**
- **[P3] Facts fetched and never shown:** `DesignOut.assets` (which pictures
  the template holds) and `sync.stale` (a card behind today's builder, which
  the backend says "needs saying out loud").

**Positive, and kept:**
- native radios for every grid, one Tab stop each, arrows inside;
- the slider's debounced announcement and `aria-valuetext`;
- `dir="auto"` on the owner's own words;
- the popover's Escape back to its trigger and Enter in the hex field;
- only a valid hex is ever written to the draft.

## 5. The worst cases

`/break-ui` fed the studio its worst realistic data at the boundary the real
data crosses: the inputs (an editor's own boundary) and the API, through a
fetch wrapper in the reviewer's tab. Nothing in the repo changed; Appendix A
is the wrapper, with a toggle, for step D to rerun. Values are the API's own
limits where it has them.

| Field | Source | Limit (API) | Limit (page) |
|---|---|---|---|
| Card name | `template.name` | 1–80 | none |
| Reward | `template.reward_description` | 200 | none (onboarding: 200) |
| Stamps | `template.stamps_required` | 1–32,767 at the API; the renderer 12 | 2–12 |
| Colours | four `#RRGGBB` | checked | the hex field commits only valid hex |
| Glyph, texture, barcode, language | `design.*` | the server's lists | the same lists |
| Stamp picture | `stamp_art` upload | any image the server can decode; normalised to ≤512px | none |
| Fields | `design.fields` | 1–10; label 60, change message 120, value 500; a binding matching `^(person\|members\|universal\|meta)\.…$` | up to 10, five bindings dealt |
| Organisation name | `design.organization_name` | 120 | none |
| The check | `DesignOut.lint` | English strings | shown as they come |

**What broke, worst first**

| # | Severity | Field | Worst-case value | What happens | Fix |
|---|---|---|---|---|---|
| 1 | Broken | reward | any change after onboarding | The pass's back keeps the old reward; nothing shows or edits it | The reward writes through to the back field (§8.6) |
| 2 | Broken | stamp picture | uploaded, then the page reloaded | The glyph grid shows a glyph chosen, the stand-in draws the glyph; the pass carries the picture | Read `assets`; the picture's tile chosen; the stage says what it can't draw (§8.4) |
| 3 | Broken | stamp picture | a glyph tapped after an upload | The palette chips switch to that glyph and Save lights up; no glyph shows as chosen, and the picture still wins; there is no way back | Say it before uploading; the remove call (§11) |
| 4 | Broken | stamps | 12, on a card saved at 8 | "עוד לא מוכן לפרסום: missing Apple strip images for states: 9, 10, 11, 12" and the Google twin, on a warm fill | Read the check by kind (§8.7) |
| 5 | Broken | reward, name | 201 and 81 characters | Save answers 422; the page shows "Unprocessable Entity" (verified against the real API, nothing saved), or nothing | `maxLength` at the API's limits, with a counter near the end (§8.4) |
| 6 | Broken | a field's label | 61 characters | "design.fields.0.label: String should have at most 60 characters" (real API) | The same, in Wallet details |
| 7 | Broken | save | offline, a design 422 | "Failed to fetch"; "design.fields: List should have at least 1 item after validation, not 0"; with no message, "משהו השתבש בכניסה" | Failures by cause, in the page's language (§8.5) |
| 8 | Broken | upload | 422, 503, offline | "ההעלאה נכשלה — נסו תמונה אחרת." for all three, 837px below the stamp's upload, focus to `<body>` | At the control, by cause (§8.5) |
| 9 | Broken | unsaved edits | leave the page | Lost without a word (verified) | The draft kept in the tab (§8.5) |
| 10 | Broken | stamp colour | white (`#FFFFFF`, the espresso palette and an offered accent) | The stand-in draws a blank white disc; the server knocks the glyph out in near-black (`strips.py`, `_glyph_ink`) | A frozen file; §11 |
| 11 | Fragile | fields | ten, through "Add field" | The fifth to the tenth all bind `meta.custom`; the backend's own comment says PassKit rejects a duplicate `uniqueName`, so the sync would fail after Save (inferred, not seen: the local provider is fake) | Each free-text field its own binding (§8.8) |
| 12 | Ugly | fields | ten, each label 57 characters | 7,289px at 375; each field a card of five controls | One row per field (§8.8) |
| 13 | Ugly | width | 320px | 30px sideways | The stage clips (§8.3) |
| 14 | Ugly | text | 200% at 375 | 49px sideways | The same, and the trays reflow (§8.3) |
| 15 | Fragile | published image | the CDN fails | A broken-image icon in the pass | The stand-in until the image has loaded (§8.3) |
| 16 | Ugly | sample name | English page | "דנה לוי" in English too (`CardPreviews.tsx:127`) | `holderName` from `t()` (§8.3) |

**Decisions, taken in §8:** truncate or wrap the card name? It is the
owner's; the field shows it whole as it grows, and the Google line it
builds ("{business} - {card}") truncates inside the frozen pass, which is the
wallet's own behaviour. Ten fields: rows, not cards.

**What held up:**
- twelve stamps draw two rows of six in the stand-in, as the server does;
- a 75-character Hebrew name and a 200-character reward truncate inside the
  frozen pass, as the wallets do, and nothing outside it overflows at 375;
- the sliders fill from the right in Hebrew;
- only a valid hex reaches the draft;
- the punch strip holds twelve dots on one line at 375 (22px each).

## 6. What the backend says

Read from `../punchme-backend` (`tooling/seed-demo`, `87ee16f`).

- **The reward reaches the pass in one place.** `default_design`
  (`apps/wallet/design.py:268-306`) puts it in the back field
  `universal.info` as its `default_value`, but only when the template has no
  `fields` of its own: `effective_design` is a shallow merge, so a stored
  `fields` list replaces the defaults whole. Onboarding writes the reward
  there once (`draft.ts:296-300`); the presets write their own words
  ("קפה שמיני חינם"). Nothing ever updates it.
- **The check** (`apps/wallet/lint.py`) returns English strings of three
  kinds:
  - **pictures not made yet:** "missing {Apple logo | Google logo | icon}
    image (uploaded or generated at first sync)", and "missing {Apple strip |
    Google hero} images for states: …" for every state up to
    `stamps_required`. A save's sync makes them, so an edit to the stamps
    always raises this until the next save;
  - **fields the layout can't place:** "field X: missing usage flags",
    "missing googlePayFieldRenderOptions", "classTemplateInfo never references
    … (renders nowhere on Google)", "classTemplateInfo references … with no
    matching field", "design.fields.N has no binding";
  - **anything else** a later version adds.
- **The limits** (`apps/businesses/schemas.py:87-107`,
  `apps/wallet/design.py:336-372`): card name 1–80, reward 200, a field's
  label 60, change message 120, value 500, organisation name 120, 1 to 10
  fields. Over a schema limit the API answers 422 with a `detail` list, which
  the page's `ApiError` turns into the response's status text; over a design
  limit, 422 `design_constraint` with a string `detail`.
- **A binding** may be any `person.*`, `members.*`, `universal.*` or `meta.*`
  name (`_BINDING_RE`, `design.py:139`), and becomes the field's
  `uniqueName`. Nothing refuses two fields with one binding.
- **Uploads** (`apps/wallet/services.py:438-512`) save at once and queue a
  design sync, so a picture reaches every installed pass while the rest of
  the edit waits for Save. A stamp picture is stored on the template
  (`design_assets`) and echoed back once, as a data URL, by the upload; the
  design read lists only its name in `assets`. A provider failure answers 503
  `wallet_unavailable`; an unreadable file 422 "file can't be decoded as an
  image"; a strip under 1125×432, 422 with its size.
- **There is no call to remove a template's picture.** The catalog has one
  (`DELETE /api/admin/catalog/{id}/images/{use}`); an owner's template
  doesn't. A picture stamp, once uploaded, wins over every glyph for good.
- **The strip renderer** knocks a stamp's glyph out "in whichever of white or
  near-black contrasts with that fill" (`strips.py:16`, `_glyph_ink`). The
  frozen stand-in, `StampGrid`, always uses white.
- **The sync's state** (`DesignSyncOut`): `synced_at`, `error`, `revision`,
  `current_revision` and `stale`, which the backend says "needs saying out
  loud": a card nobody has saved since the builder learned something new is
  missing it. The studio reads `error` and nothing else.
- **Who may call:** every template call goes through
  `get_managed_business_or_404`, so staff get 403 `insufficient_role`.

## 7. Decisions made in this step

| # | Question | Roee's answer (26–27 Oct) |
|---|---|---|
| 1 | How the studio is laid out on a phone | **Tap the card** (C). Impeccable's roll (`concept-seed --scope surface --mode operate`, seed `cb81c004`) dealt positions 5, 7 and 2 of seven ranked structures: stage then panels (the dealt lead), one decision per screen, and tap the card. Roee asked to see them first; the three were drawn at 375 in Hebrew around the real pass, each as it opens and while the colours are chosen, and he took C |
| 2 | Should onboarding and the studio share one set of controls? | **One set, built now** (§8.9) |
| 3 | When uploads reach customers | **Held for Save:** cropped and shown in the browser, uploaded when Save is pressed, before the PATCH. The admin catalog keeps uploading at once |
| 4 | A picture stamp that can't be taken back | **Ask the backend for a remove call,** mirroring the catalog's; step B wires "back to a symbol" once it exists, which needs Roee's yes as a new call. Until then the studio says before uploading that the picture stays (§11) |
| 5 | `StampGrid`'s white glyph on a white stamp (§11, at the manager's review, 27 Oct) | **Fix it,** in a commit of its own: the glyph takes white or near-black by the server's own rule (`_glyph_ink`), so the stand-in matches the pass again. The one sanctioned change to a frozen file (§13) |
| 6 | Wallet details on the owner's page (§11) | **Keep it,** folded and in plain words (§8.8) |

The seven structures, ranked in writing before the roll:
1. the card and its tray: the card pinned at the top, a row of tabs swapping
   one short tray under it;
2. tap the card: the card is the map, a sheet over the lower half;
3. a list of what the card says, each row opening a sheet;
4. looks first: whole looks for the trade, then fine-tuning;
5. stage, then stacked panels, today's order with Save docked;
6. before and after: the saved card beside the edited one;
7. one decision per screen, like onboarding.

The decision page closes unseen in a hidden pane, so the hand went through
the question tool, and then as a drawn sheet (kept uncommitted at
`.impeccable/mocks/decision/card-studio-layouts.png`). The six challengers
the roll dealt were catalog worlds, and were declined: Lightbox is settled,
and in Operate a world lends type, palette, density and one signature move,
never the layout. They were a jet-age ticket wallet, a streaming catalog
wall, a design annual's plate section, a Crouwel grid specimen, a
centre-rail reference page and a variable-font specimen. One discipline is
kept, from the variable-font specimen: **the thing being changed stays in
view under the finger**, so no control in the studio is ever further from
the card than the tray it sits in.

**Decided in this brief,** for the review to overturn:
- **The reward writes through to the pass's back** in the same PATCH, and
  says so when the back says something else (§8.6).
- **The sample opens at half the card,** labelled as a sample, and punches to
  half whenever the stamp tray opens on 0, so a stamp's colour is always seen
  (§8.3).
- **The draft is kept in the tab,** as the message editors keep theirs, with
  a question only when the tab itself closes (§8.5). No in-app blocker:
  leaving loses nothing.
- **The check is read by kind:** pictures not made yet are no problem before
  a save; a field problem is named on its field; anything unknown is said
  plainly, with the server's words folded under it (§8.7).
- **Each free-text field gets its own binding** (`meta.custom`,
  `meta.custom_2` …), which the server accepts (§8.8).
- **`data-tour="design-studio"` moves onto the stage,** so the tour's lit gap
  fits a phone; the anchor's name and `steps.ts` don't change (§8.1).
- **The design is read again once, after the last write** of a save (the
  uploads, then the PATCH), rather than after each (§8.1).
- **The tap regions over the pass are pointer shortcuts,** like the punch
  strip's dots; the chips are the controls a keyboard and a screen reader
  use (§8.3).

## 8. The new studio

### 8.1 What is fixed

- **The two routes and their gating:**
  - `/dashboard/design` inside the `RequireRole minimum="manager"` group
    (`main.tsx:159-161`), so staff get the shell's panel;
  - `/admin/catalog/:catalogId` behind `RequireStaff` (`main.tsx:115-123`).
- **Every call in `docs/dashboard-routes.md`,** the same as today and no
  others:

  | Page | Calls |
  |---|---|
  | `/dashboard/design` | `listTemplates` and `getTemplateDesign` on load; `previewCard`, then `useWalletPass` every 3 s until the owner's pass is ready; `previewTemplateDesign` 400 ms after each edit; `patchTemplate` on Save; `uploadTemplateImage` per held picture, on Save, before the PATCH; the design read again after the last write |
  | `/admin/catalog/:id` | `getCatalogEntry` on load; `previewCatalogDesign` on load and 400 ms after each edit; `createCatalogEntry` when new, `patchCatalogEntry` after; `uploadCatalogImage` and `deleteCatalogImage`, at once |

  Uploads move from "at once" to "on Save" (Roee, §7), and the design is read
  once after the last write rather than after each upload: the same calls,
  in a different order and one fewer read.
- **The 400 ms check,** on every edit, through the same debounce.
- **The renderer's limits** (`docs/card-studio.md`): 2–12 stamps; one of the
  16 glyphs or a picture, the picture winning; four textures; the four
  barcode formats; 1–10 fields, PassKit's sections and alignments; a palette
  writes four colours; the six picture uses; unsaved edits show the stand-in.
  And the API's text limits (§6).
- **The draft seeded once per template,** so a refetch never overwrites an
  edit.
- **`data-tour="design-studio"`,** on the stage (§7).
- **Untouched:**
  - `AppleCardPreview`, `GoogleCardPreview` (and `StripArt`), `StampGrid`
    and `PassBarcode`, which render in their 300px slot exactly as now;
  - `src/api`, `src/auth`, `src/hooks`, `src/config` and `src/lib` (the
    studio uses `stampArt.ts`, `accentPalette.ts`, `cardPalettes.ts`,
    `cardPatterns.ts` and `stampGlyphs.ts` as they are);
  - the shell, the tour's steps, the kit, onboarding, and the other phases'
    pages.

### 8.2 Lightbox, page by page

- **`/dashboard/design`** calls `useLightboxPage()` at its top (shell brief
  §8). While it is mounted, `<html>` wears `theme-lightbox` (and
  `theme-night` at night) instead of the old pair. Nothing on it uses the old
  primitive sets: `studio-primitives.tsx`, `dashboard/primitives`' `Notice`
  and `Tag`, `marketing/primitives`' `ctaClasses` and `focusRing`,
  `onboarding/ChoiceGrid`, `ui/ColorField`, or the old type classes (`t-h3`,
  `t-card-title`, `t-figure`).
- **`/admin/catalog/:catalogId`** sits outside the dashboard, under
  `AdminLayout`, which this phase doesn't move (§12). The edit page wraps its
  own content in `theme-lightbox`, by day only (the admin area has no night),
  so the studio's pieces find the variables they read. The seam is the
  admin header's white against the wall, until Phase 10.
- **The stage keeps its light at night:** it is the kit's `WallpaperStage`,
  a nested day scope, as the Overview's pass is. The trays and panels go
  unlit with the page.
- **`WalletAddButtons` goes from this page.** The owner's pass is added with
  the kit's `LinkButton` and `useWalletPass`, as the Overview's `OwnPass`
  does (its waiting note sets Hebrew in Plex Mono, and the public pages still
  wear it).

### 8.3 The card is the map

**At 375px, top to bottom:**
1. **The title,** "סטודיו הכרטיסיות", in `type-title`. No subtitle: what
   saving does is said where it happens (the bar and the toast).
2. **The wallet switch:** the kit's `SegmentedControl`, "אפל ווליט · גוגל
   ווליט", opening on the device's own wallet, as `OwnPass` does. Rubik, 44px.
3. **The card on its wallpaper:** the kit's `WallpaperStage` with the pass in
   its 300px slot, no notification. The stage wants 340px; below that it
   clips the pass's sides rather than move the page (DESIGN.md), so 320px
   stops scrolling sideways. While a published image hasn't loaded (or
   fails), the stage shows the stand-in, by giving the preview the published
   state only once the image has loaded: staging, not redrawing.
   `holderName` comes from `t()` ("דנה לוי", "Dana Levi") through the open
   `CardPreview` wrapper's prop, so the frozen literal never shows.
4. **Three places on the card open what they show:**
   - the stamps (the strip, or Google's hero): the stamp tray;
   - the name row (the two labels and their values): the names tray;
   - the logo row: the logo tray.

   They are transparent buttons laid over the slot, positioned from the
   rendered pass's own boxes for each wallet, never drawn into it. A press
   lights the region with the focus ring's ink outline for 120ms. They are
   pointer shortcuts: `aria-hidden`, out of the Tab order, as the punch
   strip's dots are today. The chips are the accessible controls.
5. **The sample, under the stage:** "מוצג עם 4 חותמות מתוך 8", with − and +
   (44px). It opens at half the card, rounded down and at least 1, so the
   stamp colour shows from the first look. When the stamp tray opens on 0, it
   punches to half. It changes nothing the customer gets, and says so by
   living on the stage, not among the controls.
6. **The reward, said:** a lit row (`ListRow` shape) with a gift icon, "**קפה
   חינם** אחרי **8** חותמות" and a pencil. It opens the reward tray. Under it,
   only when the pass's back says something else: "בגב הכרטיס כתוב: 'קפה שמיני
   חינם'" and "לכתוב שם את ההטבה" (§8.6).
7. **The chips:** "צבעים", "החותמת", "השמות", "הלוגו", "פרטי הארנק". 44px
   pills on the wall, wrapping to a second line rather than scrolling out of
   sight. Each opens its tray.
8. **The bar** (§8.5), from the first change.

**A tray** rises over the lower half:
- the page scrolls so the stage's top sits under the masthead, and the
  pass's logo and stamps stay above the tray;
- it is content-sized up to half the dynamic viewport, and scrolls inside
  past that;
- it is not a modal: no scrim over the card, which is the point of it.
  It is a labelled region (`role="region"`, its heading as its name);
- focus moves to its heading as it opens and back to what opened it as it
  closes. Escape, the close button, a drag down or another chip close it;
- while it is open, the bar sits at its foot, so Save is in it.

The kit's `Sheet` is a modal dialog with a scrim, so the tray is built
beside the studio (`StudioTray`), on the kit's motion tokens and its
`useSheetDrag`. If step B finds the kit's `Sheet` should learn a
non-modal mode instead, it asks first, as the earlier phases did.

**From 1024px:** the kit's `Tabs` ("צבעים · החותמת · ההטבה · השמות · הלוגו
· פרטי הארנק") run across the whole studio, and under them two columns, as
the rule editor's. The open tab's panel is the working column on the start
side, with the bar at its foot, sticky to the bottom of the screen while a
long tab scrolls under it, so Save never leaves the screen. The card stands
in a sticky 22rem column on the end side with the sample and the reward
sentence under it, held clear of the masthead until 1280px. A tap on the
card switches the tab. Between 768 and 1023 the phone's layout holds, its
trays coming up from the bottom. (Step D moved the tabs and the bar: in the
working column the tabs wrapped onto two lines, and under the card the bar
pushed the reward row down 121px as it arrived; §14.)

### 8.4 The trays

Each tray answers one question, and every choice in it lands on the card
above as it is made. The controls are §8.9's shared set.

**צבעים (colours)**
- **מראות מוכנים:** the six palettes as chips drawn with the owner's own
  glyph, as today. One writes four colours, and stays chosen only while all
  four still match.
- **צבע הכרטיס:** onboarding's ten backgrounds, 44px swatches in rows of five,
  then "צבע משלכם".
- **צבע החותמת:** the accents that clear 3:1 on the chosen card colour
  (`relatedAccents`), then "צבע משלכם". A colour of one's own under 3:1 is
  allowed, and says so under the swatches in words and an icon: "החותמת כמעט
  לא תיראה על הכרטיס הזה."
- **עוד צבעים,** folded: the text colour ("אוטומטי" by the card's luminance,
  white, black, or one's own, as onboarding's accent step offers) and the
  label colour, which Apple alone shows.
- **"צבע משלכם"** opens the colour picker, rebuilt on the kit: the
  saturation pane and hue rail, a hex field in the page's face (left to right,
  isolated), and the eyedropper where the browser has one. On a phone it
  sits inside the tray, not over the phone bar. "Surprise me" goes.

**החותמת (the stamp)**
- **The symbol:** the sixteen glyphs as 44px tiles, four to a row, chosen in
  ink. The trade's own glyph leads (onboarding's `NICHE_GLYPH`,
  `draft.ts:205`, read from the business's trade), and the rest keep their
  order.
- **"תמונה משלכם במקום סמל":** a picture, cropped square in the browser
  (`fileToStampDataUrl`, as onboarding does) and shown on the card at once
  through the stand-in. It is held for Save. Before the file is chosen, one
  line says what is true: "התמונה תחליף את הסמל בכרטיס. אחרי השמירה אי אפשר
  לחזור לסמל." That line goes once the remove call exists (§11).
- **A picture in use:**
  - its tile is chosen, and the glyphs above it show none;
  - the template holds one when `DesignOut.assets` lists `stamp_art`;
  - if this device has the picture (held, or kept from its upload), the
    stand-in draws it. If not, the stage says: "התמונה שלכם על הכרטיס. כאן
    מוצג סמל במקומה עד השמירה";
  - after a save the published card shows it.
- **דוגמת רקע:** the four textures as tiles cut from the strip (the card
  colour with the pattern in the stamp colour), labelled at 13px and over.

**ההטבה (the reward)**
- **"מה הלקוחות מקבלים":** the kit's `Input`, `maxLength` 200. A counter
  shows from 160 characters ("12 תווים נשארו"), so it says nothing until it
  matters.
- **"אחרי כמה חותמות":** the kit's `Slider`, 2–12, its value said in words
  ("8 חותמות"), with the strip under it as today's pointer shortcut.
- **The back of the card,** in one line under them (§8.6).

**השמות (the names)**
- **"שם הכרטיסייה":** `maxLength` 80. Under it, how Google prints it:
  "בגוגל ווליט: Demo Coffee - כרטיסיית קפה" (the business name isolated).
- **The two labels on the card:** "מה כתוב מעל שם הלקוח/ה" and "מה כתוב מעל
  מספר החותמות". `maxLength` 60, with today's defaults as placeholders. These
  are the only editors of those two labels.
- **"שם העסק על הכרטיס"** (`organization_name`), optional, `maxLength` 120,
  with the business's name as its placeholder.

**הלוגו (the logo)**
- One upload tile, showing the logo in use (or the business's name, which is
  what the server prints without one). Its hint says it becomes the wide
  Apple logo and Google's round badge. Held for Save.

**פרטי הארנק (wallet details):** §8.8.

### 8.5 Saving, uploads and the draft

**The bar.** One line and one coral button, docked above the phone bar on a
phone (and at the foot of an open tray, and of the open tab from 1024px):
- **its words:** "2 שינויים · עוד לא בכרטיסים של הלקוחות", counted by what
  changed (the reward, the stamps, the colours, the stamp, the texture, the
  names, the logo, a field, the language, the barcode), with Hebrew plurals;
- **its buttons:** "שמירה" (coral, 44px), and "ביטול השינויים" (quiet),
  which asks nothing, since the saved card is still there to return to;
- **when it shows:** from the first change until the save lands, or a
  failure is cleared;
- **the toasts** stand 8px above the bar while it is docked: the shell's
  toast region takes a page's `--toast-above`, which the studio sets from
  the bar's own height (step D; the rule editor never did this, as this
  line used to say).

**A save, in order:**
1. "שמירה" goes busy (the kit's `Button`: same width, focus kept,
   `aria-busy`).
2. Each held picture uploads: the logo, the stamp picture, the strip
   background, the before and after art.
3. `patchTemplate`, with the reward written through to the back field
   (§8.6).
4. The design is read again, and the draft reseeded from it.
5. The bar leaves. A toast: "נשמר. כל כרטיס שכבר בארנק יתעדכן מעצמו.". Focus
   moves to the page's title (`tabIndex={-1}`), never to `<body>`.

**A save that fails** stays where it happened, under "שמירה", as words and an
icon on the bar (`role="alert"`), and focus stays on the button:
- **by cause,** through the dashboard's `problemKey`: offline, the server, too
  many requests, refused (403), anything else;
- **a 422 the page can place** (a `design_constraint` naming a field, or a
  schema `loc`) opens the tray that holds the field and says it there. The
  limits in §8.4 keep a typed one from ever reaching the API;
- **an upload that fails** stops the save before the PATCH, names the picture
  and says why: "את הקובץ הזה אי אפשר לפתוח כתמונה. נסו PNG או JPG." (422),
  "התמונה קטנה מדי לפס החותמות: צריך לפחות 1125×432, וזו 900×300." (the
  strip's 422, its sizes read from the message), "הארנק לא קיבל את התמונה
  כרגע. נסו שוב בעוד רגע." (503), and offline. Nothing else was sent;
- **a PATCH that fails after an upload succeeded** says so plainly, since
  that picture is already on customers' cards: "התמונה כבר עלתה לכרטיסים.
  שאר השינויים לא נשמרו.";
- **never** `err.message`, never `auth.error`.

**The draft is kept in the tab,** as the message editors keep theirs
(`src/components/messaging/sessionDraft.ts`):
- keyed by the template, held pictures included as data URLs (at most 512px
  each);
- on return, the studio opens on the kept draft with the bar and one line
  above it: "יש כאן שינויים מהביקור הקודם שעוד לא נשמרו.";
- closing the tab or the app with changes asks first (`beforeunload`);
- a save or "ביטול השינויים" drops it.

**The admin catalog** keeps uploading at once (an entry needs its id first,
and only staff see it), but says it: "התמונה נשמרת בכרטיס המוכן מיד.". Its
"unsaved" pill becomes the same bar.

**When the last sync failed** (`sync.error`), a notice under the stage, in
words and an icon on a plain panel: "העדכון האחרון לכרטיסים בארנקים לא
הצליח. ננסה שוב מעצמנו, ושמירה תנסה מיד.". **When the card is behind**
(`sync.stale`): "הכרטיסים בארנקים נבנו בגרסה קודמת. שמירה אחת תעדכן אותם.",
with the bar offering "עדכון הכרטיסים" even with no edits (the same PATCH,
of the card as it is).

### 8.6 The reward on the pass

The pass's back carries one line of text, `universal.info`'s
`default_value`, and it is the only place the reward reaches the pass (§6).
The studio keeps the two together:
- **When the back says the reward** (or nothing), the back follows it: a
  new reward is written into the field's `default_value` too, in the draft,
  as it is typed (step D: not at Save, so Wallet details shows what will be
  sent). The reward tray says so under the field: "זה גם מה שכתוב בגב
  הכרטיס." A back that says nothing is said as well: "בגב הכרטיס עוד לא כתוב
  כלום."
- **When the back says something else** (the presets' "קפה שמיני חינם", or
  words an owner wrote), the studio never overwrites it silently. The reward
  row and the tray say: "בגב הכרטיס כתוב: 'קפה שמיני חינם'", with "לכתוב שם
  את ההטבה", which puts the reward there in the draft, so the back follows
  from then on, until words are typed there by hand.
- **When the card has no `universal.info` field,** nothing is added: the
  server's defaults fill it from the reward by themselves.
- The rule is pure and tested (`studioDraft.ts`, §8.9). The back's own words
  can also be edited in Wallet details (§8.8), at most 500 characters.

### 8.7 The check, in the owner's words

`previewTemplateDesign` answers every edit with the server's check (§6).
The studio reads it by kind (`lintProblems.ts`, pure and tested) and never
prints it as it comes:
- **Pictures not made yet** (logos, the icon, strip and hero states) are not
  a problem before a save; the save makes them. They show nothing. On a card
  with no edits they mean the last sync hasn't finished, which the notice in
  §8.5 already covers.
- **A field the layout can't place** is named on its row in Wallet details,
  in words: "השדה 'טקסט חופשי' לא יופיע בגוגל ווליט." The bar adds "בעיה אחת
  בפרטי הארנק", which opens that tray.
- **Anything else** is said once, under the stage: "השרת מצא בעיה בעיצוב,
  והכרטיסים לא יתעדכנו עד שתתוקן." The server's own words fold under it
  ("הפרטים", `lang="en"`, left to right), for a support conversation.
- **No green "ready" line.** A card that is fine says nothing, and the toast
  after a save says what happened.

### 8.8 Wallet details

The tray an owner rarely opens, folded into plain words. Its order:
1. **The pass's fields,** one row each (56px, the kit's `ListRow`): what it
   shows (name, stamp count, level, a line of text) and where ("בחזית", "בגב
   הכרטיס"), opening its editor in the tray. Today's
   `FieldsEditor.tsx:58` cards of five controls go.
2. **A field's editor:**
   - what it shows (the five kinds, named as today's
     `studio.fields.binding.*` name them);
   - its label (60);
   - where it sits, Apple's five sections in words, and Google's placement
     said beside it;
   - its alignment as "לפי השפה", "התחלה", "מרכז", "סוף", with the physical
     side shown as an icon, since a pass aligns by left and right;
   - for the back's text field, its words (500, §8.6);
   - the message on a change, with an example line under it in place of
     "%@": "ייראה כך: עודכנו הניקובים שלך: 5", the placeholder isolated left
     to right where it is typed;
   - "הסרת השדה" in danger words, asking first, and refused for the last
     field, which the API requires. Each remove button is named for its
     field.
3. **"הוספת שדה"** while there are fewer than ten. A free-text field gets a
   binding no other field has (`meta.custom`, `meta.custom_2` …); each of
   the other four kinds at most once.
4. **The card's language** and **the barcode** ("QR, מומלץ", PDF417, Aztec,
   Code 128), as kit `Select`s.
5. **Custom art:** the strip background (with its 1125×432 floor said before
   the file is chosen) and the before and after art, as upload tiles held for
   Save. The admin page shows these in its art panel instead.

### 8.9 One set of card controls

Roee chose one set (§7). It is built in this phase, in
`src/components/card-studio/controls/`, and onboarding moves onto it in
Phase 4. Each control is controlled (`value`, `onChange`), knows nothing of
the draft that holds it, makes no call, and is drawn on the kit:

| Control | What it offers | Studio today | Onboarding today |
|---|---|---|---|
| `CardColourPicker` | ready looks (passed in as data), the ten backgrounds, one's own | six palettes and a colour well | ten swatches, the trade's looks, `ui/ColorField` |
| `StampColourPicker` | accents that clear 3:1 on the card, one's own with its warning | a colour well, no guard | related swatches, each 3:1 |
| `StampPicker` | sixteen glyphs (the trade's first) and a picture, cropped in the browser | glyphs, a raw upload at once | glyphs and a cropped picture held |
| `TexturePicker` | four strip tiles | `ChoiceGrid` | `ChoiceGrid` (the same tiles, copied) |
| `StampCountControl` | slider and strip, 2–12 | `StudioSlider` and `PunchStrip` | its own slider |
| `RewardField` | the reward, 200 | `StudioText`, no limit | its own input, 200 |
| `ColourPickerPanel` | saturation, hue, hex, eyedropper | `ColorWell`'s popover | `ui/ColorField` |

The studio passes `CARD_PALETTES` as its ready looks; onboarding will pass
the trade's catalog looks it already reads. Neither page's draft model
changes: `draft.ts` stays as it is and keeps its tests.

**Pure, beside the studio, each with a test:**
- `studioDraft.ts`: what changed and how many; whether a palette still
  matches; the reward and back-field rule (§8.6); unique bindings; the text
  limits;
- `lintProblems.ts`: the check's three kinds (§8.7), against the backend's
  real strings;
- `studioProblems.ts`: a failed save or upload to its sentence (§8.5).

**Nothing new in the kit.** The tray is the studio's own (§8.3). If step B
finds it needs the kit to change, it asks first.

### 8.10 The admin catalog editor

The same studio, with what only a catalog look has:
- **at 375** the card comes first, as for an owner. The shelf (trade,
  description, published) and the art (four slots) become two more chips,
  "מדף" and "גרפיקה", opening their trays; at 1024 they are two more tabs;
- **uploads and removals happen at once,** as the API requires, and say so
  (§8.5). The art panel's four slots keep their aspect-true previews and
  their named removes;
- **a new look** has no id until its first save, so its art tray says so and
  waits, as today;
- **no logo tray:** a catalog look never carries a business's mark;
- **the same bar,** "שמירה" with what is unsaved. The look's id stays under
  its title, isolated left to right, in the page's face rather than Plex
  Mono.

### 8.11 Colour, type and states

- **Coral, one per screen:** "שמירה" in the bar. Nothing else is coral: the
  chips and the wallet switch are ink and acrylic, "הוספה לארנק" is the kit's
  ink `LinkButton` in the stage's foot.
- **Chosen is ink:** a chosen swatch, glyph, look or texture carries a 2px
  ink ring outside a 2px panel gap; a chosen glyph tile is an ink disc with
  a cream glyph. A swatch's tick takes whichever ink reads on it
  (`readableInk`).
- **Warnings and errors** are words and an icon on a plain panel, never a
  warm fill: the stamp colour under 3:1, a field the layout can't place, a
  failed sync, a failed save.
- **No new colour.** Every pair is measured in DESIGN.md and on
  `/style-guide`. A control's edge is Field Edge (3.35:1).
- **Type:**
  - `type-title` for the page, `type-card-title` for a tray's heading,
    `type-label` for labels;
  - figures (the stamp count, the counter, the sample) in Rubik's tabular
    figures, isolated;
  - nothing under 13px outside the pass, and no Plex Mono: a hex value is a
    colour, not a card code, set in the page's face, left to right.
- **States each page draws:**
  - `/dashboard/design`:
    - loading (the stage's `Skeleton` in the slot's shape);
    - the template or design read failed ("נסו שוב");
    - no edits; one change; many;
    - a tray open; the kept draft restored;
    - each save failure (§8.5);
    - a held picture; a picture the device can't draw;
    - a white stamp;
    - the check's three kinds; a failed sync; a stale card;
    - the owner's pass pending, slow, and ready;
  - `/admin/catalog/:id`: new (no art yet); existing; each upload or removal
    failing;
  - both: Hebrew and English; day and night (admin by day only); 320, 375,
    768, 1024 and 1280px; reduced motion; 200% text.

### 8.12 Motion (for step C)

Animate by frequency. The studio is opened a few times a year, so it can
carry a little more than the counter, and none of it on colour picking or
typing:
- **A stamp lands on the card** when the sample goes up: the kit's
  `stamp-land` (340ms on the overshoot), on the stand-in's newest stamp or
  on the strip under the reward. With reduced motion it is there at its final
  size, after a 150ms fade.
- **A tray rises** on the drawer curve in 300ms and leaves in 180ms; with
  reduced motion it crossfades in 150ms.
- **A tap on the card** lights its region for 120ms.
- **The bar** arrives by light (240ms, 8px at most); the toast after a save
  arrives as the kit's toasts do.
- **Nothing counts up.**

## 9. Copy

Every string goes through `t()`, in `en` and `he` together. These are drafts
in the product's voice (plural to the reader, slash forms for people, the
glossary's terms); step D's `/impeccable clarify` settles them.

**The glossary pass:**
- **ניקוב becomes חותמת:** "ניקובים עד הפרס" → "חותמות עד ההטבה", "הניקוב" →
  "החותמת", "אייקון הניקוב" → "הסמל של החותמת", "העלאת תמונת ניקוב משלכם" →
  "תמונה משלכם במקום סמל". The tour already says "צבע, חותמת והטבה".
- **פרס becomes הטבה:** "הפרס" → "ההטבה" (the tray's question "מה הלקוחות
  מקבלים").
- **"מוכן לפרסום" goes:** there is nothing to publish; the card is live, or
  it is the owner's trial.
- **"שמירת עיצוב" becomes "שמירה"**, with the bar saying what isn't saved yet.

**Keys that change** (`studio.*`):

| Key | English | Hebrew |
|---|---|---|
| `studio.rewardLabel` | What customers get | מה הלקוחות מקבלים |
| `studio.stampsLabel` | After how many stamps | אחרי כמה חותמות |
| `studio.stampsHint` | {{count}} stamps (plurals) | {{count}} חותמות (`_one`: חותמת אחת) |
| `studio.groups.stamp` | The stamp | החותמת |
| `studio.groups.look` | Colours | צבעים |
| `studio.glyphLabel` | The stamp's symbol | הסמל של החותמת |
| `studio.uploadStampArt` | Your own picture instead | תמונה משלכם במקום סמל |
| `studio.save` | Save | שמירה |

**New keys** (drafts):

| Key | English | Hebrew |
|---|---|---|
| `studio.sample` | Shown with {{count}} of {{total}} stamps | מוצג עם {{count}} חותמות מתוך {{total}} |
| `studio.sampleName` | Dana Levi | דנה לוי |
| `studio.rewardSentence` | <b>{{reward}}</b> after {{count}} stamps | <b>{{reward}}</b> אחרי {{count}} חותמות |
| `studio.chips.*` | Colours · The stamp · The names · The logo · Wallet details | צבעים · החותמת · השמות · הלוגו · פרטי הארנק |
| `studio.bar.changes` | {{count}} changes · not on customers' cards yet | {{count}} שינויים · עוד לא בכרטיסים של הלקוחות (`_one`: שינוי אחד) |
| `studio.bar.discard` | Discard changes | ביטול השינויים |
| `studio.saved` | Saved. Every pass already in a wallet updates itself. | נשמר. כל כרטיס שכבר בארנק יתעדכן מעצמו. |
| `studio.kept` | You have changes from your last visit that aren't saved yet. | יש כאן שינויים מהביקור הקודם שעוד לא נשמרו. |
| `studio.leave` | (the browser's own question, on `beforeunload`) | (as English) |
| `studio.back.follows` | This is also what the back of the card says. | זה גם מה שכתוב בגב הכרטיס. |
| `studio.back.differs` | The back of the card says: "{{text}}" | בגב הכרטיס כתוב: "{{text}}" |
| `studio.back.follow` | Put the reward there | לכתוב שם את ההטבה |
| `studio.stampColour.faint` | The stamp will barely show on this card. | החותמת כמעט לא תיראה על הכרטיס הזה. |
| `studio.picture.stays` | The picture replaces the symbol on the card. Once saved, there is no going back to a symbol. | התמונה תחליף את הסמל בכרטיס. אחרי השמירה אי אפשר לחזור לסמל. |
| `studio.picture.notHere` | Your picture is on the card. Until you save, a symbol stands in for it here. | התמונה שלכם על הכרטיס. כאן מוצג סמל במקומה עד השמירה. |
| `studio.problem.*` | the save and upload failures in §8.5 | as in §8.5 |
| `studio.check.field` | The "{{label}}" field won't show on Google Wallet. | השדה '{{label}}' לא יופיע בגוגל ווליט. |
| `studio.check.other` | The server found a problem with the design, and passes won't update until it's fixed. | השרת מצא בעיה בעיצוב, והכרטיסים לא יתעדכנו עד שתתוקן. |
| `studio.sync.failed` | The last update to passes in wallets didn't go through. We'll retry by ourselves; saving tries at once. | העדכון האחרון לכרטיסים בארנקים לא הצליח. ננסה שוב מעצמנו, ושמירה תנסה מיד. |
| `studio.sync.stale` | Passes in wallets were built with an older version. One save brings them up to date. | הכרטיסים בארנקים נבנו בגרסה קודמת. שמירה אחת תעדכן אותם. |
| `studio.fields.example` | Looks like: {{text}} | ייראה כך: {{text}} |

**Keys other pages read, kept as they are** in both languages:
`studio.preview.apple` and `.google` (the Overview and the public pages),
`studio.patterns.*` (onboarding's stamp step), `studio.uploadError`
(`CatalogArtPanel` until it moves), `studio.title`, and the
`onboarding.stamp.glyphs.*` names the studio reads. `studio.subtitle`,
`studio.lintClean` and `studio.lintTitle` go once nothing reads them.

## 10. What step B keeps, touches and checks

**Keeps** everything in §8.1.

**Touches** these, and nothing else:
- `src/routes/dashboard/DesignPage.tsx`, rebuilt;
- in `src/components/card-studio/`: `CardStudio.tsx` rebuilt; `CardPreview`
  (the switch wrapper) in `CardPreviews.tsx` moved onto the kit's
  `SegmentedControl` with `holderName` from `t()`, the four frozen functions
  untouched; `ColorWell.tsx`, `FieldsEditor.tsx`, `LabelsEditor.tsx` and
  `studio-primitives.tsx` replaced;
- new: `card-studio/controls/` (§8.9), the tray, `studioDraft.ts`,
  `lintProblems.ts` and `studioProblems.ts` with their tests;
- `src/routes/admin/AdminCatalogEditPage.tsx` and `CatalogArtPanel.tsx`;
- the keys in §9, in `en` and `he`;
- `docs/card-studio.md`: its tables and its "Found while writing this" list,
  as fixed; `docs/dashboard-routes.md` if the call order (§8.1) needs a line;
  CLAUDE.md's count of test files and what they cover.

One commit per piece (the controls, the studio, the admin page, the copy),
as in the earlier phases.

**Doesn't touch:**
- `AppleCardPreview`, `GoogleCardPreview`, `StripArt`, `StampGrid`,
  `PassBarcode`, `WalletCardPreview.tsx` (Phase 10 deletes it);
- `src/api`, `src/auth`, `src/hooks`, `src/config`, `src/lib`;
- the shell, the kit, the tour's steps, `AdminLayout`, the admin list page,
  onboarding and its `ChoiceGrid`, `ui/ColorField` and `WalletAddButtons`,
  which other pages still wear.

**Checks,** in step D, through the browser:
- **Roles and plans:**
  - the owner and the manager on Pro, the owner on Free;
  - staff refused out loud, with no call;
  - `/admin/catalog/cafe-classic` and `/admin/catalog/new` as PunchMe staff.
- **The minute:** at 375 in Hebrew, change the reward, the card colour, the
  stamp colour and the glyph, and save, without scrolling the card out of
  sight; time it.
- **Appendix A's states:** worst case, picture stamp, uploads failing (422,
  503, offline), saves failing (the schema 422, the design 422, offline).
  Also:
  - a 75-character name, a 200-character reward, ten fields with 57-character
    labels;
  - 2 and 12 stamps;
  - a white stamp;
  - the check's three kinds, with the real API's strings;
  - a failed sync and a stale card;
  - a published image that fails to load.
- **The reward:** on a card whose back says the reward (onboarding's) and
  one whose back says the preset's words. The PATCH's `design` carries the
  right back text in each case.
- **The draft:** leave and come back; close the tab; discard; a held picture
  restored with the draft.
- **Rendering:**
  - Hebrew and English; day and night;
  - 320, 375, 768, 1024 and 1280px, at 100% and 200% text;
  - full and reduced motion;
  - the stage clipping, never squeezing, under 340px.
- **The keyboard path:**
  - every chip and tray reachable;
  - focus to a tray's heading and back to its chip;
  - Save keeping focus while busy, and the title after;
  - the colour picker's keys;
  - nothing ever on `<body>`.
- **The console:** clean apart from the known lines.
- **On a real phone, installed, in Hebrew:**
  - the tray over the lower half with the stamps in view;
  - a tap on the card's stamps;
  - a picture from the camera roll, cropped and saved;
  - the pass in the wallet updating after a save.

## 11. Open questions for Roee

**Answered at the manager's review (§7, rows 5 and 6):** 3, fix it; 6, keep
it. Items 1, 2, 4 and 5 are the backend's, gathered into one backend task
(§13).

1. **The remove call** (Roee: ask for it, §7). Proposed for the backend:
   `DELETE {biz}/templates/{template_id}/images/{use}`, manager and up, as the
   catalog's `delete_catalog_image` does, clearing `design_assets[use]` (or
   the provider image record) and queueing a sync. When it exists, step B (or
   a later phase) wires "חזרה לסמל" in the stamp tray and drops the warning
   line. It is a new call on `/dashboard/design`, so it needs Roee's yes
   when it lands, and `docs/dashboard-routes.md` gains it then.
2. **The picture in the design read.** `DesignOut.assets` names the stamp
   picture but doesn't carry it, so a device that didn't upload it can't draw
   it while editing (§8.4). The design read could carry it as the catalog's
   detail does (a data URL, at most 512px). The same call, a richer answer: a
   backend change, outside the redesign.
3. **`StampGrid` draws a white stamp's glyph in white;** the server draws it
   near-black (`strips.py`, `_glyph_ink`). The stand-in is a frozen spec
   match, and here it no longer matches. Fixing it is a one-line change in a
   frozen file (the glyph's colour chosen by the same luminance rule), a spec
   correction rather than a redesign. Should step B make it, or leave the
   file frozen and the white stamp misdrawn until someone else does?
4. **Duplicate bindings, refused by the API.** The studio stops dealing them
   (§8.8); `validate_design_doc` could refuse two fields with one binding at
   PATCH time, before PassKit does at sync time, as it already refuses an
   empty field list. A backend change.
5. **The check as codes.** The studio reads the lint's English by pattern
   (§8.7). A `code` beside each problem (`images_pending`,
   `field_unplaced`) would make that reading safe from a reworded message.
   A backend change.
6. **Should the field editor stay on the owner's page?** A asked whether most
   of Wallet details belongs on `/admin` only. The brief keeps it, folded and
   in plain words (§8.8), because an owner may want a line on the back of
   their card (hours, a phone number). Say if it should go.

## 12. Left for other phases, and outside the redesign

**For other phases:**
- **Phase 4, onboarding,** moves its colour, accent, stamp and reward steps
  onto §8.9's controls, and gains the palettes as ready looks. Its draft and
  `commit.ts` stay as they are. Its stamp step's picture is already cropped
  and held, as the studio's now is.
- **Phase 2, the shell:** the studio is two taps away on a phone, under
  "עוד". The tour's design stop now lights the stage (§7).
- **Phase 8, the public pages,** still wear `WalletAddButtons`, whose
  waiting note sets Hebrew in Plex Mono.
- **Phase 10:** `AdminLayout` (white, navy, and the "Staff" badge at 2.70:1),
  the admin list page, `ui/ColorField`, `onboarding/ChoiceGrid` once Phase 4
  has moved, `studio-primitives.tsx` if anything still reads it, and
  `WalletCardPreview.tsx`.

**Outside the redesign:**
- §11's backend items: the remove call, the picture in the read, duplicate
  bindings refused, the check as codes.
- **`docs/card-studio.md`'s note on the ground under a pass** ("the wallets
  don't draw a pass on white" against `PassStage.tsx`): the studio now
  stands the pass on its wallpaper, as the Overview and the messages do, so
  the question is the public pages' (Phase 8).

---

## Appendix A: the worst-case data

Load it into a signed-in dashboard tab on the dev server, on
`/dashboard/design`: paste it into the console, or serve the file and add it
as a script tag. It wraps `fetch` for the studio's reads, answers every write
itself (so nothing reaches the backend, and no picture lands on a demo card
for good), and puts a toggle above the phone bar: Demo, Worst case, Picture
stamp, Upload fails, Save fails. Each switch remounts the page through the
router, so the studio seeds its draft again from the new data. A reload
removes it. Nothing in the repo changes.

The business's name can't be changed this way after the shell has read it;
the worst case for it (a 44-character Hebrew name) was checked with the
wrapper installed before boot, and truncates inside the frozen pass and in
the masthead.

```js
// break-ui-studio.js: Phase 3, step A. Worst-case data for the Card Studio
// (/dashboard/design), in the browser only. Paste it into the console of a
// signed-in dashboard tab on the dev server, on /dashboard/design. Nothing
// in the repo changes, and a reload removes it.
//
// It wraps window.fetch at the boundary the real data crosses:
//   GET  {biz}/templates                    (card name, reward, stamps)
//   GET  {biz}/templates/{id}/design        (fields, assets, sync, lint)
//   POST {biz}/templates/{id}/design/preview (the 400 ms check's lint)
// and answers every WRITE itself, so nothing reaches the backend:
//   POST {biz}/templates/{id}/images        -> per mode: the picture, 422, 503, offline
//   PATCH {biz}/templates/{id}              -> per mode: accepted (not saved), 422, offline
// A toggle above the phone bar switches the modes. Each switch remounts the
// page through the router, so the studio seeds its draft from the new data.
(() => {
  if (window.__studioWorst) return "already loaded";
  const realFetch = window.fetch.bind(window);
  const MODES = ["demo", "worst", "picture", "uploadFails", "saveFails"];
  const LABELS = { demo: "Demo", worst: "Worst case", picture: "Picture stamp", uploadFails: "Upload fails", saveFails: "Save fails" };
  let mode = "worst";

  const WORST = {
    // 75 characters; the API takes 80.
    name: "כרטיסיית תספורות וטיפוח זקן של המספרה של אבי ובניו ברחוב סוקולוב ברמת השרון",
    // 200 characters exactly, the API's limit.
    reward:
      "תספורת גברים מלאה כולל חפיפה עיצוב זקן במכונה ובתער וטיפול פנים קצר עם מגבת חמה, לבחירתכם בכל ביקור בתיאום מראש בטלפון. לא כולל ימי שישי וערבי חג, ולא ניתן למימוש יחד עם הטבה אחרת או עם כרטיסייה נוספת",
    stamps: 12,
    // 57 characters (the API takes 60), and a change message under 120.
    label: "מספר התספורות שנאספו בכרטיסייה עד לתספורת החינם הבאה שלכם",
    change: "עודכן מספר התספורות בכרטיסייה שלכם: %@. עוד קצת ותגיעו לתספורת חינם, נתראה במספרה בפעם הבאה!",
    // The stamp colour is white, as the espresso palette's is: the server
    // knocks the glyph out in near-black there, the stand-in in white.
    colours: { background_color: "#4B2E1E", foreground_color: "#FFFFFF", label_color: "#D2B48C", stamp: "#FFFFFF" },
  };
  // Ten fields: the API's maximum. "Add field" deals meta.custom from the
  // fifth on, so the last six share one binding, as the editor makes them.
  const BINDINGS = ["person.displayName", "members.member.points", "universal.info", "members.tier.name", "meta.custom", "meta.custom", "meta.custom", "meta.custom", "meta.custom", "meta.custom"];
  const FIELDS = BINDINGS.map((binding, i) => ({
    binding,
    label: WORST.label,
    section: ["SECONDARY_FIELDS", "SECONDARY_FIELDS", "BACK_FIELDS", "AUXILIARY_FIELDS"][i] ?? "BACK_FIELDS",
    alignment: "NATURAL",
    default_value: binding === "universal.info" ? "קפה שמיני חינם" : "",
    change_message: i === 1 ? WORST.change : "",
  }));
  const LINT = [
    "missing Apple strip images for states: 9, 10, 11, 12",
    "missing Google hero images for states: 9, 10, 11, 12",
    "field meta.custom: classTemplateInfo never references class.textModulesData['meta-custom'] (renders nowhere on Google)",
  ];

  // A 64px picture stamp: a red disc with a white bar.
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = 64;
  const g = canvas.getContext("2d");
  g.fillStyle = "#c0392b"; g.beginPath(); g.arc(32, 32, 30, 0, 7); g.fill();
  g.fillStyle = "#fff"; g.fillRect(14, 28, 36, 8);
  const PICTURE = canvas.toDataURL("image/png");

  const json = (body, status = 200) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });
  const methodOf = (input, init) => ((init && init.method) || (typeof input !== "string" && input.method) || "GET").toUpperCase();
  const urlOf = (input) => (typeof input === "string" ? input : input.url);

  window.fetch = async (input, init) => {
    const url = urlOf(input);
    const method = methodOf(input, init);
    if (mode === "demo" || !url.includes("/api/")) return realFetch(input, init);
    const path = new URL(url, location.origin).pathname;

    // Writes never reach the server.
    if (method === "POST" && /\/templates\/[^/]+\/images$/.test(path)) {
      if (mode === "uploadFails") {
        const n = (window.__studioUploads = (window.__studioUploads || 0) + 1) % 3;
        if (n === 1) return json({ detail: "file can't be decoded as an image" }, 422);
        if (n === 2) return json({ detail: "The wallet provider could not accept this image", code: "wallet_unavailable" }, 503);
        throw new TypeError("Failed to fetch");
      }
      return json({ use: "stamp_art", image_id: "stamp_art", url: PICTURE });
    }
    if (method === "PATCH" && /\/templates\/[^/]+$/.test(path)) {
      if (mode === "saveFails") {
        const n = (window.__studioSaves = (window.__studioSaves || 0) + 1) % 3;
        // The API's own answers to an over-long reward and to an empty
        // field list; the first reaches the page as "Unprocessable Entity".
        if (n === 1) return json({ detail: [{ type: "string_too_long", loc: ["body", "payload", "reward_description"], msg: "String should have at most 200 characters" }] }, 422);
        if (n === 2) return json({ detail: "design.fields: List should have at least 1 item after validation, not 0", code: "design_constraint" }, 422);
        throw new TypeError("Failed to fetch");
      }
      return json(JSON.parse(init.body));
    }

    const res = await realFetch(input, init);
    if (!res.ok) return res;
    if (method === "GET" && /\/templates$/.test(path)) {
      const list = await res.json();
      list[0] = { ...list[0], name: WORST.name, reward_description: WORST.reward, stamps_required: WORST.stamps, ...WORST.colours };
      return json(list);
    }
    if (/\/templates\/[^/]+\/design(\/preview)?$/.test(path)) {
      const body = await res.json();
      const design = { ...body.design, fields: FIELDS, stamp: { glyph: "check", color: WORST.colours.stamp } };
      return json({
        ...body,
        ...WORST.colours,
        stamps_required: WORST.stamps,
        reward_description: WORST.reward,
        design,
        // The picture stamp: the template holds one, and the read says
        // only that (no picture), as the API does today.
        assets: mode === "picture" ? ["stamp_art"] : body.assets,
        lint: LINT,
        sync: { ...body.sync, stale: true, error: mode === "worst" ? "PassKit 500" : body.sync.error },
      });
    }
    return res;
  };

  // The toggle: plain chrome, fixed above the phone bar.
  const bar = document.createElement("div");
  bar.setAttribute("dir", "ltr");
  bar.style.cssText = "position:fixed;left:50%;bottom:calc(96px + env(safe-area-inset-bottom));transform:translateX(-50%);z-index:2147483647;display:flex;gap:2px;padding:3px;border-radius:999px;background:#d4d4d4;font:500 12px system-ui;box-shadow:0 2px 8px rgb(0 0 0/.2);max-width:calc(100vw - 16px);overflow-x:auto";
  const paint = () => {
    for (const b of bar.children) b.style.background = b.dataset.mode === mode ? "#fff" : "transparent";
  };
  for (const m of MODES) {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = LABELS[m];
    b.dataset.mode = m;
    b.style.cssText = "border:0;border-radius:999px;padding:6px 10px;color:#111;white-space:nowrap;cursor:pointer";
    b.onclick = () => {
      mode = m;
      window.__studioUploads = 0;
      window.__studioSaves = 0;
      paint();
      // Away and back through the router, so the page remounts and the
      // studio seeds its draft again from what the wrapper now answers.
      import(new URL("/src/lib/queryClient.ts", location.origin).href).then(({ queryClient }) => {
        queryClient.removeQueries();
        history.pushState({}, "", "/dashboard");
        dispatchEvent(new PopStateEvent("popstate"));
        setTimeout(() => {
          history.pushState({}, "", "/dashboard/design");
          dispatchEvent(new PopStateEvent("popstate"));
        }, 300);
      });
    };
    bar.appendChild(b);
  }
  paint();
  document.body.appendChild(bar);
  window.__studioWorst = { setMode: (m) => bar.querySelector(`[data-mode=${m}]`).click() };
  bar.querySelector('[data-mode="worst"]').click();
  return "loaded: " + MODES.join(" / ");
})();
```

## 13. Review notes for step B

Checked against the code, the contracts and the backend on 27 Oct. The calls
in §8.1 match `docs/dashboard-routes.md`. `holderName` already reaches the
frozen previews through `CardPreviewValue` (`CardPreviews.tsx:51`, the
literal only its fallback), so passing it from the open wrapper is staging,
not a change to them. These notes win where they differ from §8 to §10.

- **`StampGrid`'s glyph ink** (§7, row 5): the one change to a frozen file,
  in its own commit, and nothing else in that file. A stamp's glyph takes
  white or near-black by the same rule as the server's `_glyph_ink`
  (`strips.py`), so a white stamp shows its glyph as the pass does.
  `docs/card-studio.md` says so beside the frozen table, with the date and
  Roee's yes.
- **The contracts follow the new order** in the commit that makes it:
  `docs/dashboard-routes.md` for `/dashboard/design` (uploads on Save, before
  the PATCH, and the design read once after the last write), and
  `docs/card-studio.md` ("uploads save straight away" becomes "held for
  Save", and its "Found while writing this" list marked as fixed).
- **The tray** is built beside the studio on the kit's motion tokens and
  `useSheetDrag`, imported as it is. If the kit itself would need to change,
  step B asks first.
- **The backend's four** (§11, items 1, 2, 4 and 5) are one backend task,
  outside the redesign. The remove call, once it lands, is a new call on
  `/dashboard/design` and needs Roee's yes before step B or a later phase
  wires it.
- **The critique snapshot** and the drawn layouts Roee chose from
  (`.impeccable/mocks/decision/card-studio-layouts.png`) are committed with
  these notes.

## 14. Step D

Hardened, polished and checked on 27 Oct on the local backend's demo data:
Demo Coffee as its owner, its manager and its staff, Demo Barbershop on
Free, and `/admin/catalog/cafe-classic` as PunchMe staff. It ran in a
headless Chrome at 320, 375, 1024, 1280 and 1440px, in Hebrew and English,
at 100% and 200% text, with and without reduced motion. The worst cases ran
through a wrapper in that tab that answered every write itself, so nothing
reached the demo card or the catalog.

**The items carried over from parts 1 and 1b:**
- **The cleared label** (Roee's yes): `fieldLabel` falls back to the
  default only when the card has no such field, as the pass does.
  `docs/card-studio.md` records it beside the `StampGrid` correction.
- **The bar from 1024px** stands at the foot of the open tab and pushes
  nothing; **the tabs** run across the studio and hold one line from
  1024px in either language, the catalog's seven too (§8.3).
- **A tray that grows** (the bar arriving in its foot) brings the card's
  part back above its edge, if it was in view.
- **The leaving bar** is `inert`, wherever it stands.
- **The toasts** stand above the docked bar: made so, not dropped from the
  brief (§8.5). It took one class in the shell's toast region,
  `--toast-above`, which no other page sets, so theirs are unchanged.
- **`/admin/catalog/new`** reached from an existing look starts empty: the
  editor is keyed by the look's id.
- **Closing the tab from another page: decided not to ask.** The draft
  stays in the tab when the owner leaves the studio, and the leave prompt
  lives on the studio alone. Asked from Scan or Customers, it would be the
  browser's own wordless "Leave site?", about edits the page in front of
  the owner doesn't show, at the counter, where a tab is closed often. On a
  phone, where the dashboard runs installed, closing it raises no prompt
  anyway. So closing the tab elsewhere loses kept edits without asking;
  coming back while the tab lives says they're there.
- **A field's alignment across a card language switch:** the pass keeps
  the side (LEFT, RIGHT, CENTER or NATURAL), and switching the card's
  language changes nothing stored. The choice is renamed: a left field is
  "סוף" on a Hebrew card and "התחלה" on an English one, and its icon keeps
  the side, so it still matches the pass. A line under the choice now says
  which side start is on this card.
- **StudioTray's doc comment** wraps again.

**Also fixed:**
- the reward row cuts a long reward at a word (a 200-character one ran to
  seven lines), and the counter says "לא נשארו תווים" at zero;
- a field the wallet refuses is named as Wallet details names it, not by
  its place ("שדה 4");
- a field of the owner's own words follows the page's direction while
  empty: `dir="auto"` reads an empty field as left to right, so in Hebrew
  its placeholder and caret started at the left edge;
- a cleared face label says nothing will show above it;
- Discard, Save and "לכתוב שם את ההטבה" wrap at 200% text;
- the loading skeleton takes the studio's shape from 1024px;
- the catalog says when a saved look is unpublished, which no owner sees,
  and keeps its id under its title.

**Checked and holding:**
- the plurals: "חותמת אחת", "שתי חותמות", "בלי חותמות", "שינוי אחד", "שני
  שינויים";
- every save failure (offline, the schema's 422, the design's 422, 500,
  429) and upload failure (422, 503, offline) said under Save, with focus
  kept there, and the design's 422 opening its field;
- a read that fails or is made offline, and the loading state;
- nothing sideways at 320px; the keyboard path; reduced motion; the
  console;
- the manager and the owner on Pro, the owner on Free, staff on the role
  panel, and the catalog as PunchMe staff.

**The detector:** the file scan finds no anti-patterns, and its seven
advisories are inside the frozen previews. The live scan names Lightbox's
Warm Wall as a cream page and the kit's `WallpaperStage` as a radial halo,
both chosen in DESIGN.md, and on the catalog `AdminLayout`'s "Staff" badge
at 2.7:1 (Phase 10, §12).

**Found and left:**
- **The phone bar at 200% text** is wider than a 375px screen (433px in
  English), so every dashboard page scrolls sideways there: the shell's,
  Phase 2.
- **The rule editor's and the composer's card columns** stick at 32px,
  under the 56px masthead, between 1024 and 1279px: Phase 6's pages, the
  same fix as the studio's.
- **The masthead's `Identity`** reads the templates on every dashboard
  page, so staff on the role panel still make that one call; the studio
  itself makes none.
- **The reward field is one line,** so a long reward scrolls sideways as
  it's typed. A field of two lines is for Phase 4 to decide, since
  onboarding will share it.
- From parts 1 and 1b, still known: a save that stops before its PATCH
  still waits from the design read, and a sync already running when a save
  lands can finish without that save's edits.

**On a real phone,** installed, in Hebrew, beside §10's list:
1. **A long press on the card:** no words selected, no picture callout, and
   a tap on the stamps, the names or the logo still opens its tray.
2. **The keyboard over a tray:** open Names and tap the card's name. The
   field stays above the keyboard, the tray doesn't jump, and closing the
   keyboard brings the tray back to its height with Save at its foot.
3. **Quick double taps on +:** each tap lands one stamp, the page never
   zooms, and no stamp is left mid-landing.
4. **The tray's edge in iOS Safari** (in the browser, not installed): open
   the reward tray, change the reward so the bar arrives at its foot, and
   scroll a little. The stamps stay above the edge, and Safari's toolbar
   coming and going leaves no gap under the tray.
