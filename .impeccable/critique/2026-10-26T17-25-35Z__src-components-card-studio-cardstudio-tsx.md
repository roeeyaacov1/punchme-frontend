---
target: "the Card Studio on /dashboard/design and /admin/catalog/:id"
total_score: 20
max_score: 40
na_heuristics: 
p0_count: 0
p1_count: 4
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\components\\card-studio\\CardStudio.tsx"
target_fingerprint: "sha256:0d921ad82970d33cc38e0d519738d8a6af3ad7a533fc36d56a49f13f85ea0150"
target_path: "C:\\Users\\roeey\\Projects\\punchme-frontend\\src\\components\\card-studio\\CardStudio.tsx"
timestamp: 2026-10-26T17-25-35Z
slug: src-components-card-studio-cardstudio-tsx
---
Method: dual-agent (A: design review in its own headless Chrome · B: detector in another), run at the same time and apart.

Target: the Card Studio, `src/components/card-studio/CardStudio.tsx` with `DesignPage.tsx` on `/dashboard/design`, and the same component on `/admin/catalog/:catalogId`. The question: can a barber on a phone change the reward, the colours and the stamp in under a minute without reading anything? Hebrew first, 375px first, by day and at night.

## Design Health Score

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | The card repaints for the card colour and the glyph, but not for the stamp colour (the sample starts at 0 stamps) or the reward (never drawn). The only sign of an unsaved edit is Save turning from lilac to violet, 1,313px off-screen at 375. "נשמר ✓" lasts 2.5 s, unannounced |
| 2 | Match with the real world | 2 | ניקוב and פרס where the glossary, onboarding, the Overview and the tour say חותמת and הטבה. Wallet details speaks PassKit: "%@ יוחלף בערך החדש", "מיקום (אפל)", "נלווה", bindings. The lint is developer English |
| 3 | User control and freedom | 2 | No undo; leaving loses edits without a word; a picture stamp can't be taken back; one tap removes a pass field |
| 4 | Consistency and standards | 2 | Two visual systems on one screen (violet page in the Lightbox frame); admin has an "unsaved" pill the owner's page lacks; two editors for the same two labels inside one disclosure |
| 5 | Error prevention | 1 | No `maxLength` against the API's 80/200/60/120; no contrast guard on the stamp colour (onboarding has one at 3:1); "Add field" hands out `meta.custom` six times; nothing warns before an upload that goes to every customer at once |
| 6 | Recognition rather than recall | 3 | Choices are drawn as the card itself; but at 375 the card is 1,164–1,256px from the colour wells, so the barber has to remember it |
| 7 | Flexibility and efficiency | 3 | Palettes set four colours at once; hex, eyedropper and the punch strip as shortcuts; native radios with arrow keys |
| 8 | Aesthetic and minimalist design | 2 | About 58 targets before Wallet details; four identical colour wells; two dot strips that look alike and mean different things; the black "הוספה לארנק" outweighs Save |
| 9 | Error recovery | 1 | An offline save says "Failed to fetch"; a schema 422 says "Unprocessable Entity", or nothing where the status text is empty; an upload failure says "try another image" for a dropped connection, 837px below the control |
| 10 | Help and documentation | 2 | The subtitle says saving reaches every installed pass, which is the one thing worth saying; nothing says why the stamp colour doesn't show, or what "מוכן לפרסום" means on a card that is already live |
| **Total** | | **20/40** | **Acceptable, at the bottom of the band** |

## Design Specificity Verdict

**LLM assessment (A, before the detector):** half-authored. The choices inside are this product's: a palette chip is a scrap of the owner's own card drawn with the glyph they chose, a texture tile is their card colour with the pattern in their stamp colour, and "stamps to reward" is a strip the length of the card. Everything around them could be any SaaS settings page: stacked white panels under h2s, a Figma-style colour popover, and "Wallet details" laying PassKit's own model out as a form. It still wears the old violet scope inside the Lightbox frame (`html.theme-purple.theme-raised`): a lavender page under the warm masthead by day, navy beside the brown street at night. The lit sign doesn't reach it, and the pass's stage doesn't keep its light at night.

**Deterministic scan (B):** the file scan is clean (exit 0) with 9 advisories. Two are real: the texture tiles' 11px labels (`CardStudio.tsx:223`) and the colour popover's 11px "גוונים" heading (`ColorWell.tsx:226`). Seven are inside the frozen previews (`CardPreviews.tsx`, `StampGrid.tsx`) and stay as they are. Over CDP:
- two stragglers: "המותקנים." alone on the subtitle's third line (`DesignPage.tsx:147`), "המחדל." on the labels hint (`LabelsEditor.tsx:56`);
- `nested-cards` on the field editor's three boxes inside the Wallet details panel (`FieldsEditor.tsx:58`). Real, and A reached the same complaint by another road;
- `nested-cards` on the 300px slot, and `repeating-stripes-gradient`: false positives. The first is the frozen pass, the second the texture tiles, which are the strip's own patterns;
- on `/admin/catalog/cafe-classic`, the "Staff" badge at 2.70:1 (`AdminLayout.tsx:17`, the old gold `Badge`). Real, and in the admin shell, which isn't this phase's.

The detector missed what A and the audit measured: every 12px `text-xs` hint (the rule catches only arbitrary sizes), the Hebrew Apple/Google switch set in Plex Mono, and none of the semantic failures (the reward, the lint, the picture stamp) can be seen by a pattern scan at all.

**Overlay:** injected into reviewer B's headless tab at 375 in Hebrew ("[impeccable] 2 anti-patterns found", the two false positives). The tab was headless, so no one saw it.

## Overall impression

The bones are good and the details inside the panels are the most product-specific in the dashboard. The page fails the question anyway: on a phone the card is out of sight for every edit, two of the four edits never show on it, Save is a small button 1,300px away, and when anything goes wrong the studio speaks English or nothing. The biggest opportunity is to keep the card in view and let every control answer on it.

## What's working

1. **Choices drawn as the card itself** (`CardStudio.tsx:161-231`): the barber recognises his card in six colourways instead of reading palette names.
2. **The length strip as the control** (`studio-primitives.tsx:189-333`): "how long is my card" answered by a strip, with the slider kept as the one accessible control (dots `aria-hidden`, `aria-valuetext`, a debounced announcement).
3. **An honest stage:** the card first on a phone, sticky beside the bench from 1280; the live stand-in while edits are unsaved and the published PNG once saved; the server's own check; and "הוספה לארנק" to see the card on one's own phone. The popover's keys are right: Escape returns focus to the trigger, Enter in the hex field closes it.

## Priority issues

1. **[P1] The card can't be watched while it is edited, and two of the four edits never show on it.**
   - Why it matters: the barber can't tell whether the stamp colour or the reward took; he edits blind.
   - Evidence: at 375 the reward field is 422px below the card's bottom, the glyphs 687–973px, the card colour 1,188px and the stamp colour 1,256px. The sample starts at 0 stamps (`CardStudio.tsx:103-106`), the one state where a stamp's colour is invisible. `rewardDescription` is passed in and never drawn (`CardPreviews.tsx:14`).
   - Fix: keep the card in view on a phone, punch the sample when a stamp's colour or glyph changes, and stage the reward beside the card (§8).
   - Suggested command: `/impeccable shape`, then `/impeccable adapt`.
2. **[P1] The reward on the pass never changes.**
   - Why it matters: the card customers carry promises one thing and the join page, the standee and Scan another; the product's brand is candour.
   - Evidence: the reward reaches the pass only as the back field `universal.info`'s `default_value`, written once by onboarding (`draft.ts:296-300`) or the preset. No studio control edits it (`FieldsEditor.tsx:55-128` has no value input). On the demo the field reads "קפה חינם" and the pass's back "קפה שמיני חינם".
   - Fix: the reward writes through to the back field in the same PATCH, and says so when the back says something else (§8.6).
   - Suggested command: `/impeccable harden`.
3. **[P1] Saving is far, small and silent, and its failures are English or nothing.**
   - Why it matters: Save reaches every customer's pass; an interrupted barber loses his work without knowing, and a failed push says nothing he can act on.
   - Evidence: Save 103×40 at y 202 (`DesignPage.tsx:162-169`); "נשמר ✓" for 2.5 s with no live region (`:119`, `:150`); focus drops to `<body>` on Save; leaving loses edits (verified); `err.message` raw (`:123`): "Failed to fetch", "Unprocessable Entity", "design.fields: List should have at least 1 item…", and with no message at all the fallback is `auth.error`, "משהו השתבש בכניסה".
   - Fix: a docked save bar that says what isn't saved yet and who it reaches; the draft kept in the tab and a guard on leaving; failures by cause, in the page's language; limits enforced in the fields.
   - Suggested command: `/impeccable harden`.
4. **[P1] The check tells a barber his ordinary edit broke the card, in developer English.**
   - Why it matters: moving the stamps slider to 12 turns a green "מוכן לפרסום" into "עוד לא מוכן לפרסום: missing Apple strip images for states: 9, 10, 11, 12", on a warm fill, for something the next save fixes by itself.
   - Evidence: `CardStudio.tsx:295-315`; the backend's `lint_template_design` (§6).
   - Fix: read the lint into three kinds and say each in the owner's words, or not at all (§8.7).
   - Suggested command: `/impeccable clarify`.
5. **[P2] The studio speaks PassKit, not the barber.**
   - Why it matters: Wallet details asks a barber to understand bindings, sections, `%@` and left/right alignment on a right-to-left card; the same two labels have two editors; "Add field" builds a card the provider refuses.
   - Evidence: `FieldsEditor.tsx:10-26`, `:44-51`; `LabelsEditor.tsx`; `he/common.json` `studio.fields.*`.
   - Fix: the glossary's words throughout; Wallet details as rows that say what each field shows, one editor per value, and unique bindings (§8.8).
   - Suggested command: `/impeccable clarify`, then `/impeccable distill`.

## Persona red flags

- **Casey (one hand, interrupted):** Save at the top, 103×40; edits lost on a nav tap; the popover's swatches 25×25 and its edge running under the phone bar; the punch-strip dots about 22px; the Apple/Google switch 79×28.
- **Jordan (first time):** "ניקובים בתצוגה" and "ניקובים עד הפרס" are two sliders over two identical dot strips, and only one changes the card; the stamp colour shows nothing; "מוכן לפרסום" beside "שמירת עיצוב" reads like a second step.
- **Sam (screen reader, keyboard):** the reward is 7 Tab stops in and the stamp colour 13, and the grids are native radios (good); but "נשמר ✓", the lint and an upload's failure aren't announced where they happen, Save drops focus to `<body>`, three "הסרה" buttons say the same, field edges are 1.18–1.40:1 against the 3:1 a control's edge needs, and reduced motion switches the stamp's landing off rather than making it gentler.
- **Avi, the barber owner (PRODUCT.md):** about 58 targets where "nothing needs reading first"; a reward that never reaches his customers' pass; an upload he can't undo; a save that reaches everyone with no word on what changes; words that differ from the dashboard he uses every day.

## Minor observations

- The Apple/Google switch sets Hebrew in Plex Mono at 12px, uppercase tracking; the hex values are Plex Mono at 12px.
- Every hint is 12px; the texture labels and the popover's heading 11px.
- The lint's warning is a warm fill (`#fffbeb`), against DESIGN.md's "words and an icon on a plain panel".
- A published image that fails to load shows a broken-image icon; nothing falls back to the stand-in.
- At 375 the three-line subtitle pushes the card about 150px down.
- "מוכן לפרסום" shows for the Free owner, whose card publishes nothing to customers yet.
- On `/admin/catalog/:id` at 375 the card starts at y 1,582, under the shelf and art panels.
- The sample name "דנה לוי" is a literal and shows in English too.

## Questions to consider

- What if the card never left the phone's screen, and the controls came to it?
- Why does a design tool open on 0 stamps, the one state where the stamp's design can't be seen?
- Is the reward a design field or a business term? Customers read it on the pass's back, so why can't the barber see that line?
- Does an owner need text and label colours as wells of their own, or would one contrast-checked choice cover nearly everyone?
- Should most of Wallet details live on `/admin` only?
