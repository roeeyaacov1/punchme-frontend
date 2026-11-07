# /admin: PunchMe's staff area

Step A of `/admin`'s rework (`docs/redesign/guide.md` §7, "After the phases:
/admin"): the frame (`AdminLayout`), the catalog list (`/admin`,
`/admin/catalog`), one look's editor (`/admin/catalog/:catalogId`, with
`new`), and the refusal a signed-in account that isn't staff gets.
Diagnosed and written on 6 Nov 2026 with `/impeccable critique`,
`/impeccable audit`, `/break-ui` and `/impeccable shape` (mode: Operate). No
code changed. Step B builds it on Lightbox (DESIGN.md) and
`src/components/kit`, in Plan mode, once the card looks' wizard
(`looks/onboarding`) has merged.

The inputs:
- CLAUDE.md, PRODUCT.md, DESIGN.md, `docs/card-studio.md` and
  `docs/redesign/card-looks-guide.md`;
- the contract, written first in this step: `docs/admin-pages.md`;
- the wizard's rules on `looks/onboarding` (`src/routes/onboarding/looks.ts`
  and `steps/LookStep.tsx`), not main's;
- the backend's catalog service on `origin/main` (`apps/businesses`);
- the pages themselves on the card looks' stack: the backend copy on 8001
  (passbox v0.1.1 on 8002), a Vite of this worktree on 5188, signed in as
  two test accounts made for this step (Appendix).

The pages were walked as staff and as a signed-in account that isn't
staff, Hebrew first at 375px, then 1280px, then English at both. Nothing on
the stack was written: a fetch guard loaded before the app answered every
catalog write in the page (publish, unpublish, reorder, delete, save,
picture), so a write's result could be seen without reaching the copy the
wizard's step D uses. Two reviewers ran apart for the critique, each in its
own headless Chrome:
- **A, design review:** read the code and walked every page live;
- **B, detector:** Impeccable's detector over the source, then live over
  six states (`detect --cdp`), and its overlay injected into the list.

Four questions went to Roee with the three structures drawn on a canvas;
his answers are in §6.

Read "In short" first. Sections 7 and 8 are what step B builds, and §9 what
it keeps and checks.

1. In short
2. The pages today
3. Critique
4. Audit
5. The worst cases
6. Decisions
7. The new pages
8. Copy
9. What step B keeps, touches and checks
10. Open questions for Roee
11. Left for other phases
12. What step B did differently

---

## 1. In short

- **The list is wrong about the one thing it exists to show.** It counts
  every published look of a trade against three ("בית קפה 5/3", "מספרה
  2/3"). On the stack the wizard opens on the looks screen, which shows
  every drawn look of a trade with no cap, never the five classic looks the
  counts include, and hides a trade with nothing published. Café owners see
  4 looks, every other trade 1. The list says café is over and the rest are
  short (§2).
- **A look isn't drawn as owners see it.** `LookTile` sketches the card
  colour and a glyph, so the bakery's croissants are an orange card with
  coffee cups. The real picture is only in the editor's sixth tray.
- **In Hebrew on a phone no look has a name.** The name and its id share
  one cut line 84px wide (21px on a draft): what shows is "…-classic",
  "3.", ".s" (§5).
- **Deleting says nothing at the moment it matters.** The fact that every
  card is a copy sits once in the subtitle; the delete is a native
  `window.confirm` naming the look, and a failed publish, reorder or delete
  is silent.
- **The frame is the old product.** White and navy, a 2.70:1 gold "Staff"
  badge, Hebrew set in Plex Mono, 16–34px targets, and an email that pushes
  the page 13px wider than a 375px screen, which moves the editor's trays
  off screen.
- **Scores:** critique 17/40 (Poor), audit 9/20 (Poor). The editor, already
  on Lightbox, is the best part, and its shelf tray already shows the truth
  the list should lead with.
- **The rework (Roee's picks, §6):** the list becomes the wizard's own
  looks, every trade on one page, each look numbered in the order owners
  meet it, shown as its picture and named as owners read it, with the ones
  the wizard doesn't show set apart and said why (structure A, §7.4). It
  reads `GET /api/presets` and the sticker list to know. The frame moves
  onto Lightbox with the email in an account sheet; a delete is the kit's
  dialog saying that cards are copies; the refusal moves onto Lightbox and
  offers another account.

## 2. The pages today

### What is on the stack

17 catalog entries: five plain classic looks, published (`*-classic`); eight
looks built from the design options, published, each with both pictures
drawn; four of those, unpublished. The sticker list says `available`, so
the wizard on `looks/onboarding` opens on the looks screen
(`looksOffered`).

### What the list says against what owners get

| Trade | The list says | The looks screen shows | The wizard without the options (sticker list down or `available: false`) |
|---|---|---|---|
| מספרה | 2/3, short | 1: Gold Scissors ("מספריים") | barber-classic and two built-ins |
| בית קפה | 5/3, full | 4, in order: Bakery ("קרואסון"), Count on Top ("קפה"), Bubble Tea ("באבל טי"), Latte ("משקה חם") | cafe-classic and two built-ins |
| מאמן/ת אישי/ת | 2/3, short | 1: Trophy ("גביע") | trainer-classic and two built-ins |
| מטפל/ת | 2/3, short | 1: Lotus ("לוטוס") | therapist-classic and two built-ins |
| אחר | 2/3, short | 1: Hearts ("לב") | other-classic and two built-ins |

Why each count is wrong, by the wizard's rules (`looks.ts` on
`looks/onboarding`):
- the looks screen never shows a plain look in a trade that has a drawn one
  (`drawnLooks`), so the classics are counted but never seen;
- it has no cap and fills nothing with built-ins, so neither "/3" nor
  "מראה מובנה משלים את החסר" holds;
- the wizard without the options never shows a styled look
  (`wizardOffers`), so there the counts include looks nobody sees;
- a published styled look whose drawing failed is counted, and the wizard
  leaves it out (`drawnLook`);
- a trade with nothing published is hidden from the looks screen
  (`listedTrades`), which the list says nowhere;
- each trade's first look is preselected for every owner of that trade
  (`LookStep`), which the list doesn't show at all;
- owners read a look by its sticker's name (`lookName`: "קרואסון");
  staff see "Bakery Card".

## 3. Critique

Method: dual-agent (A: design review · B: detector), each in its own
headless Chrome.

### Design health

| # | Heuristic | Score | Key issue |
|---|---|---|---|
| 1 | Visibility of system status | 2 | Counts misstate what is live; publish and reorder say nothing; the editor's saved notices and picture states are good |
| 2 | Match system / real world | 2 | "תבנית", "מראה" and "עיצובים" for one thing; English names where owners read "קרואסון"; "5/3" from a cap that's gone |
| 3 | User control and freedom | 2 | Delete is final behind a native confirm; reorder is one step in a global list |
| 4 | Consistency and standards | 1 | Two design systems on one screen; Plex Mono on Hebrew; browser focus beside the kit's; draft and published rows lay out differently, so "עריכה" moves |
| 5 | Error prevention | 2 | The confirm gives no consequence; unpublishing a live look is one silent tap; the editor's guards are good |
| 6 | Recognition rather than recall | 1 | Staff hold each trade's order across interleaved rows and map names in their head; tiles misdraw styled looks |
| 7 | Flexibility and efficiency | 1 | No grouping by trade, no "make first", focus to `<body>` after each move |
| 8 | Aesthetic and minimalist design | 2 | Five controls per row; the look itself a 40×64 sketch; 600px of each row empty at 1280 |
| 9 | Error recovery | 2 | The editor names save problems in their tray; list writes have no error at all |
| 10 | Help and documentation | 2 | Honest hints in the editor; two now false: "עד שלושה לכל תחום" and "מראה מובנה משלים את החסר" |
| **Total** | | **17/40** | **Poor** |

### Design specificity

The editor is PunchMe's: the owner's studio on Lightbox, the real pass,
and a shelf tray showing the strip and hero the wizard uses. The frame, the
list and the refusal could belong to any product: a white page, bordered
rows, uppercase pills, text arrows, a red underlined "הסרה", a native
confirm. Nothing in the list knows that a look belongs to a trade, that its
place decides every owner's default, or that the wizard is a shelf of
pictures. Its idea was right (the code calls the coverage "the authoring
queue" and the tile "the wizard's own component"); the wizard moved under
it.

The detector agrees on the gold badge (2.70:1, 14 elements on the list) and
found nothing in the source. It has no rule for the overflow, the hidden
names or the bidi gap, which both reviewers measured. Its `radial-halo` (the
kit's wallpaper stage), `bounce-easing` (the stamp's overshoot, already
ignored in `.impeccable/config.json`) and 4.2:1 inside `GoogleCardPreview`
(the bakery's own card colour, a frozen preview) are by design.

### What's working

1. **The editor reuses the product.** The owner's `CardStudio` against the
   staff preview, and the shelf's "כך האשף מציג את המראה" with the real
   strip and hero and honest states: not published yet, being drawn,
   failed. "נשמר. בעלי עסק לא יראו את המראה עד שיפורסם." is candour for
   staff.
2. **The art tray tells the truth about a write that can't wait.** "התמונה
   נשמרת במראה המוכן מיד, בלי שמירה.", pictures locked until the first
   save with the reason, each slot at the renderer's shape.
3. **The refusal says no out loud,** with the signed-in email and a 46px
   way back.

### Priority issues

- **[P0] The counts and the tiles describe a wizard that isn't running.**
  The list's only job. Staff author for the wrong trades and trust a tile
  that isn't what owners tap. Fix: each trade's looks as the wizard offers
  them, from `main`'s `looks.ts` once the wizard merges, each as its
  picture, the first marked as chosen for owners, and the published ones it
  doesn't show set apart with the reason. Needs `GET /api/presets` on the
  list (§6, question 2).
- **[P1] A look can't be named on a phone, and the names collide at
  1280.** Hebrew at 375: "…-classic", ".1". Hebrew at 1280: "Haircut Punch
  Cardbarber-classic", the gap on the far side of one left-to-right run.
  Fix: a name line of its own (`dir="auto"`), the id off the row or in
  `<bdi dir="ltr">`, one row layout for drafts and published.
- **[P1] Order is the weightiest setting and the hardest to work.** One
  global list; 23.6×32 arrows that step past other trades; focus to
  `<body>`; nothing announced. Fix: order within a trade, "להעביר למקום
  הראשון", focus kept on the moved look, a polite announcement ("קפה עבר
  למקום 2 מתוך 4").
- **[P1] Delete and unpublish don't say what happens, and failures are
  silent.** Fix: the kit's dialog stating both facts (cards stay, they're
  copies; this trade's owners stop seeing it, and where it stood), a danger
  button, an unpublish that says so on the row, write errors on the row.
- **[P2] The frame is the old product and breaks the phone layout.** Fix:
  Lightbox by day, the email in an account sheet, kit buttons and badges,
  the editor without its own wrapper; the refusal on Lightbox too, with
  Roee's yes (§6, question 3).

### Persona red flags

- **PunchMe staff curating several times a day, on a phone and a laptop:**
  no readable name on the phone; "בית קפה 5/3" read as "café is covered"
  when one café look is every café owner's default; every picture checked
  one editor and one sixth tray at a time; after each ↑ on the laptop, Tab
  starts again at "חזרה לאפליקציה"; the page pans under the thumb and the
  shelf sheet's edge is cut off.
- **Power user:** no grouping or filter by trade, no "make first", no bulk
  publish; one global place per press.
- **Screen reader and keyboard:** targets of 16–32px, no skip link, moves
  and publish unannounced, focus lost after a move, the badge at 2.70:1,
  Hebrew in a face without Hebrew, and the tab title "PunchMe — Digital
  Loyalty Cards" on every /admin page.

### Minor observations

- A new look defaults silently to café (`NO_SHELF.niche`).
- The `hasArt` corner mark explains itself only as a hover `title`.
- The editor's header shows the name and the id, not whether the look is
  published, its trade or its place. Shelf and Art sit sixth and seventh
  among the studio's chips; Shelf holds publishing.
- The loading state is "טוען..." in Plex Mono with no skeleton.
- On `new`, a screen-reader label starts with a comma (", מוצג עם 4
  חותמות מתוך 8"): the look has no name yet.
- The refusal's email isn't isolated: "כ-" ends one line, the email starts
  the next and its comma jumps to the far end. It offers no other account,
  the real next step for staff who opened /admin signed in as a test owner.

## 4. Audit

| # | Dimension | Score | Key finding |
|---|---|---|---|
| 1 | Accessibility | 2 | Badges at 2.70:1 (AA needs 4.5); "הסרה" 26×16, under WCAG 2.5.8's 24px; browser focus, not `focusRing`; no skip link; nothing announced |
| 2 | Performance | 3 | One read per page; each reorder a round trip plus the whole list again; the list unpaged (fine at today's size) |
| 3 | Theming | 1 | Navy, slate, gold, `red-600` and `bg-white` by hand; the editor fakes Lightbox with its own scope and `-mx-6 -my-8` |
| 4 | Responsive | 1 | 388px at 375 in Hebrew (406 in English); 777px at 200% text; names cut to 21–84px; the editor's sheets 12px off screen |
| 5 | Implementation integrity | 2 | Source clean to the detector; the list's rules a release behind the wizard; Plex Mono on Hebrew; the old primitives |
| **Total** | | **9/20** | **Poor** |

Measured (Hebrew, 375px unless it says otherwise):

- **Contrast:** "צוות" and every "מפורסם" are `#c88a11` on `#fdf4df`,
  2.70:1. Nothing else fails on the list, the editor or the refusal (the
  segment's 1.1:1 is a false reading: its ink pill is a separate element).
- **Targets:** "חזרה לאפליקציה" 88×20, "English" 42×20, "התנתקות" 49×20, ↑
  and ↓ 24×32, "ביטול פרסום" 91×34, "פרסום" 60×34, "עריכה" 58×34, "הסרה"
  26×16. The editor's own controls and the refusal's link pass.
- **Overflow:** `scrollWidth` 388 at 375 (the email, 218px with no break
  after its hyphen); none at 1280. At 200% text, 777px.
- **Faces:** on the list, 41 text nodes in Plex Mono, Hebrew among them:
  the badges, the coverage chips ("בית  קפה" spaced by the mono face), and
  "טוען...". Plex Mono is for card codes only.
- **Focus:** Tab from the top reaches "חזרה לאפליקציה", "English",
  "התנתקות", "תבנית חדשה", then each row's arrows, publish, "עריכה",
  "הסרה": all with the browser's 1px auto outline.
- **Landmarks:** `header` and `main` on the list and the editor; none on
  the refusal; no skip link anywhere; one `h1` per page.
- **The editor:** two `.theme-lightbox` scopes inside a white page; the
  wall starts under the white bar with a hard edge.

## 5. The worst cases

Through the same door as the real data: the fetch wrapper's worst mode
(Appendix) answered `GET /api/admin/catalog` with clones of the real rows,
their real designs and published pictures, within the backend's own limits
(name 1–80, description 200, colours any string of up to 7, ids slugs of
the first name cut at 56).

| Field | Source | Limit | Optional |
|---|---|---|---|
| name | `entry.name` | 1–80 (`CatalogTemplateIn`) | no |
| id | `entry.id` | slug of the first name, 56 + suffix; a Hebrew name gives `template`, `template-2` | no |
| trade | `entry.niche` | five values | no |
| description | `entry.description` | 200 | yes |
| published | `entry.is_published` | | no |
| colour | `entry.background_color` | any string up to 7, unchecked | no |
| stamp, texture | `entry.design` | the studio's | yes |
| pictures | `entry.art_uses` | four slots | yes |
| the list | `GET /api/admin/catalog` | unpaged | |
| the trade's count | worked out in the browser | | |
| the email (frame) | `user.email` | 254 | no |

The dataset, spread across the first rows: a 77-character English name
with a 200-character note and a 56-character id; a Hebrew name holding one
unbroken English word ("כרטיס עמוד מספרה BarbershopPoleClassicRedWhiteBlue",
id `template-3`); a one-letter name "Q" with no colour (`""`); "brown" as a
colour; a plain look with all four pictures; twenty café looks, a third of
them drafts, one published with its drawing failed; and no therapist look
at all. Then, as their own states: an empty catalog, one look, a list
answering after 6 s, and a list answering 500.

What broke, with the fix for each (none applied):

| # | What shows | Cause | Fix |
|---|---|---|---|
| 1 | At 375 no look has a name: "…the-coun", "3.", ".s" | name and id share one `truncate` line, 84px (21px on a draft, whose shorter publish button rises to the first line) | the name on a line of its own, up to two lines with `dir="auto"`; the id under it in `<bdi dir="ltr">`, or only in the editor; actions in a menu, so the row has room |
| 2 | "Qbarber-no-colour", "Haircut Punch Cardbarber-classic" | the `ms-2` gap lands on the far side of one left-to-right run in a Hebrew line | the same split |
| 3 | "BarbershopPoleClassicRedWhiteBluetemplate-3 כרטיס עמוד מספרה" | Hebrew and Latin in one bidi run with the id | the same split; `overflow-wrap: anywhere` on the name |
| 4 | At 1280 the long name loses its start: "… a Midnight Panel with Sparkles, the Count on Top (v2, final)" | an English name cut at its start in a right-to-left box | wrap to two lines, never a start cut; the full name in the editor |
| 5 | The 56-character id runs 140px past the screen | `font-mono text-xs` with no break | the id off the row, or `overflow-wrap: anywhere` |
| 6 | No colour and "brown": a dashed empty box, and no word | `presetLook` gives no look, and the wizard skips it just as silently | the row says why the wizard leaves it out: "אין צבע כרטיס" |
| 7 | A published look whose drawing failed reads "מפורסם" like the rest | the list doesn't read `pictures` | "לא צויר, ולכן לא באשף. שמירה נוספת תנסה שוב.", as the shelf says it |
| 8 | "מטפל/ת 0/3" in amber | the count against three | in looks mode the trade is hidden from the looks screen: "לא מוצג באשף: אין מראה מפורסם" |
| 9 | "בית קפה 15/3" in grey, as if full | the same | the real number, "15 מראות באשף", and the wizard shows all fifteen |
| 10 | Twenty café looks among the rest: the 33rd to first is 32 presses, each a round trip, every arrow disabled while one runs | one global order | order within a trade; "להעביר למקום הראשון" |
| 11 | A plain look with four pictures: a 16px mark with a hover title | the sketch can't show them | a drawn look shows its picture; a plain one says "התמונות שלו לא מוצגות באשף" in words, if the wizard still leaves them out |
| 12 | Empty catalog and a failed read: the same screen to the pixel (every trade 0/3, no rows) | no error state | a failed read says so where the list would be, with "לנסות שוב"; an empty catalog teaches: "עוד אין מראות. בעלי עסק רואים את המראות הקלאסיים." |
| 13 | A slow list: "טוען..." alone, in Plex Mono | no skeleton | the kit's `Loading` and `Skeleton`, in the rows' shape |
| 14 | The email: 13px past 375 in Hebrew, 31px in English; the editor's shelf sheet spans −13 to 375, its close button 6px off screen | one unbreakable run in the header's row | the email in the account sheet, `<bdi>`, `overflow-wrap: anywhere` |
| 15 | 200% text: 777px wide on 375 | fixed rows of five controls | the structure in §7 |
| 16 | The delete: `למחוק את "Barber Pole Card" מהקטלוג?` in the browser's own dialog | `window.confirm` | the kit's dialog, in the page (§7) |

## 6. Decisions

Asked on 6 Nov 2026 with the canvas
(https://claude.ai/artifact/59wNBEuPQRyo9MfrG8rGGC).

| # | Question | Recommendation | Roee's answer |
|---|---|---|---|
| 1 | Which structure for the list (canvas, §7.3)? | A, ranked by trade | **A, ranked by trade** |
| 2 | May the list read `GET /api/presets` (each look's pictures, and which published looks the wizard really shows) and `GET /api/admin/catalog/stickers` (which wizard is live)? Both exist, and the editor already makes both; they are new for the list | Both | **Both** (recorded in `docs/admin-pages.md`) |
| 3 | `RequireStaff`'s refusal is in `src/auth`, which is frozen. May it move onto Lightbox and offer to sign in with another account? Its logic stays | Yes, both | **Lightbox, and another account** |
| 4 | Which name leads a look's row? | The wizard's ("קרואסון"), the staff name under it | **The wizard's name first** |

## 7. The new pages

### 7.1 What is fixed

- The routes and calls in `docs/admin-pages.md`, with the two reads Roee
  added to the list (§6, question 2). Nothing else new.
- The frame is not `DashboardLayout`: staff accounts don't necessarily own
  a business.
- Light only: night is for the dashboard.
- The editor's `CardStudio` and trays are the studio's
  (`docs/card-studio.md`); the editor drops its own `theme-lightbox` and
  negative margins once the frame wears Lightbox.
- Publish, reorder and delete keep their calls. A delete is confirmed in
  the page, never by `window.confirm`.
- The list draws each look as the wizard offers it, from `main`'s
  `looks.ts` after the wizard merges; `LookTile` goes once nothing uses it.
- `RequireStaff`'s logic stays as it is.

### 7.2 The same in every structure

- **The frame:** a bar on the wall, PunchMe and a "צוות" tag at its start
  (a brand badge, coral with ink), and an account button at its end that
  opens the kit's sheet: the email, isolated; the language; "חזרה
  לאפליקציה"; "התנתקות". No email in the bar.
- **The page's head:** "מראות מוכנים", one line on what the page is
  ("מה שבעלי עסק רואים באשף, לפי תחום ובסדר הזה"), a lit line saying which
  wizard is live (§6, question 2), and "מראה חדש", the one coral button.
- **A look:** its picture as the wizard shows it (Apple's strip; a classic
  look as `StampGrid` draws it, frozen, never redrawn), its name (§6,
  question 4), its place, "נבחר מראש" on the first, and a 44px actions
  button. The actions, in the kit's sheet: עריכה, להעביר למקום הראשון,
  מקום אחד למעלה, מקום אחד למטה, להוציא מהפרסום (or לפרסם), למחוק.
- **The ones the wizard doesn't show,** under "לא מוצגים באשף" in their
  trade, each with its reason: טיוטה; "מפורסם, ומוצג רק כשהארנק לא מצייר
  מראות" (a classic look in a trade with a drawn one); "לא צויר"; "אין
  צבע כרטיס".
- **A move:** the look takes its new place and keeps its light (Panel
  Light) with "עבר למקום 2" until the next action, focus stays on it, and a
  polite live region says it. With reduced motion it is there at once.
- **The delete:** the kit's dialog over the page (canvas, fourth
  artboard): the look's picture, "למחוק את "באבל טי"?", then two facts, the
  first with a check: "כרטיסים שכבר נוצרו ממנו לא ישתנו: כל כרטיס הוא עותק
  משלו." and "הוא לא יוצג יותר באשף. עכשיו הוא במקום 3 מתוך 4 בתחום שלו.
  אי אפשר לבטל מחיקה."; "למחוק" as the danger button, "ביטול", and "רק
  להוציא מהפרסום" as the gentler way out. (The trades have no plural forms
  in the locale files, so the copy says "בתחום שלו" rather than "בעלי בתי
  קפה".)
- **States:** loading as the rows' skeleton; a failed read said where the
  list would be, with "לנסות שוב"; an empty catalog that says what owners
  see meanwhile; a failed write said on its row.

### 7.3 The three structures

Canvas, Hebrew at 375 with the stack's catalog and the real pictures:
https://claude.ai/artifact/59wNBEuPQRyo9MfrG8rGGC

Impeccable dealt them (`concept-seed --scope surface --mode operate`, seed
`3f1dbc78`) from a ranked list of seven: by trade on one page; one trade
behind the wizard's pills; a flat list with filters; two lanes per trade;
trade tiles over one trade; a ranked board per trade; five summaries that
open in place. The deal was 6, 7 and 5, the ranked board leading.

- **A, ranked by trade** (the roll's lead). Every trade on one page, each a
  lit panel: its name and how many looks owners get, then its looks
  numbered 1, 2, 3 in the order owners meet them, then "לא מוצגים באשף".
  Everything is answered with no tap. A trade of twenty looks makes a long
  page. Its move is the ranking itself: a moved look keeps its light at its
  new place. The catalog challenger it fused is a gate board, where a
  changed row moves and stays lit until noticed.
- **B, five trades, one open.** One panel of five summaries ("בית קפה · 4
  מראות באשף · 1 לא מוצג", the preselected look's picture small at its end);
  one trade open in place with its looks and "מראה חדש לבתי קפה". The
  quickest read of which trades are short; a trade's looks are one tap
  away.
- **C, one trade as the wizard shows it.** Five trade tiles, each with its
  preselected look's picture and its count; under them the chosen trade's
  looks at the wizard's own size, one to a row as an owner sees them on a
  phone, each with its place, "עריכה" and its actions. The truest mirror
  of the wizard; one trade at a time.

Declined challengers, by their verdict: a full-screen vertical feed, a
dance score, a zoo map, a gridded type specimen and a variable-font
specimen each lose on both axes, audience and clarity.

Roee chose **A** (6 Nov). B's quick read of which trades are short lives on
in A's desktop index (§7.5).

### 7.4 The list at 375: ranked by trade

Top to bottom, as the canvas's first artboard draws it:

1. **The bar** (§7.2).
2. **The head:** "מראות מוכנים" (Title, 28px); "מה שבעלי עסק רואים באשף,
   לפי תחום ובסדר הזה. הראשון בכל תחום נבחר מראש." (Body, ink-muted); the
   lit line saying which wizard is live; "מראה חדש".
3. **Five trade panels**, in `NICHES`' order (מספרה, בית קפה, מאמן/ת
   אישי/ת, מטפל/ת, אחר), lit panels 16px apart. Each holds:
   - **its head:** the trade's name (Card title, an `h2`) and, at the end,
     what owners get, a figure in Rubik's tabular digits: "4 מראות באשף",
     "מראה אחד באשף", "המראה הקלאסי באשף", or, with its warning icon,
     "לא מוצג באשף: אין מראה מפורסם";
   - **its looks in the wizard,** one 56px row each, numbered in the order
     owners meet them: the place (Rubik, tabular), the look's picture (96px
     wide, Apple's strip as the wizard shows it, or the classic look's
     `StampGrid`), the name owners read ("קרואסון", Rubik 500) over the
     staff name ("Bakery Card", ink-muted, `dir="auto"`), "נבחר מראש" as a
     neutral badge on the first, and the 44px actions button;
   - **"לא מוצגים באשף"**, a label over a strong hairline, then the trade's
     other looks the same way, with no place, each saying why (§7.6);
   - in the wizard without the options, the built-in looks that fill a
     trade appear in their place as rows with no actions, "מראה מובנה",
     so the count is the wizard's to the look.
4. Nothing else. No coverage chips: each panel's head is the count.

The name never shares a line with anything that can push it: it wraps to
two lines, and the id is off the row (it stays under the editor's title).
A row is one layout whether published or not.

### 7.5 From 1024px

- The bar runs the window's width; the content stands in one column, at
  most 1120px.
- **An index of the five trades** at the column's start (the right in
  Hebrew), 240px, sticky: each trade's name and its count, a link to its
  panel, the warning icon on a trade the wizard hides. It is B's summary,
  so the short trades read at a glance.
- The panels beside it, at most 760px: the picture 160px wide, "עריכה" as a
  secondary button before the actions button.
- Between 375 and 1024, the phone's layout, the column at most 640px.

### 7.6 What the list works out, and from what

From three reads (`GET /api/admin/catalog`, `GET /api/presets`, `GET
/api/admin/catalog/stickers`), in a tested module beside the pages (for
example `src/routes/admin/shelf.ts`), built on `main`'s `looks.ts` once the
wizard merges, never a second copy of its rules:
- **Which wizard is live:** `looksOffered(available, presets)`, as the
  wizard decides it. A sticker list that fails or doesn't answer reads as
  the wizard reads it: the wizard without the options.
- **Each trade, with the options:** its drawn looks (`drawnLooks`), in
  order; none drawn, its classic look (`looksFor(…)[0]`); nothing published
  at all, hidden (`listedTrades`), unless the catalog lists nothing, when
  every trade shows with its built-ins.
- **Each trade, without them:** `looksFor`: its plain published looks
  first, then built-ins, three in all.
- **The name owners read:** `lookName` for a drawn look; for a classic
  look the name `readyLooks` gives it ("מראה 1", or a built-in's own:
  "קלאסי").
- **Why a look isn't shown:**
  - טיוטה: not published;
  - "מפורסם, ומוצג רק כשהארנק לא מצייר מראות": a plain look in a trade
    with a drawn one;
  - "מפורסם, ומוצג רק כשהארנק מצייר מראות": a styled look while the
    wizard is without the options;
  - "מציירים את המראה…": published, its pictures not there yet, looked for
    again as the editor does (`lookPicturesState`, `lookAgainIn`);
  - "לא צויר, ולכן לא באשף. שמירה נוספת תנסה שוב.": its drawing failed;
  - "אין צבע כרטיס, ולכן לא באשף": a colour that isn't one.
- **A draft's picture:** none exists until it is published, so a draft
  shows its card colour as a 96px swatch, never a sketch that could pass
  for the look.

### 7.7 The actions, and what each says

- **The actions button** opens the kit's `Sheet`, titled with the look's
  name and "בית קפה · מקום 2 מתוך 4": עריכה; להעביר למקום הראשון; מקום אחד
  למעלה; מקום אחד למטה; להוציא מהפרסום or לפרסם; למחוק. A move that can't
  happen isn't offered (the first look has no "up").
- **A move** stays inside the trade: the page sends `reorderCatalog` with
  every id, the trade's own swapped among its own places and every other
  look where it was. The look takes its new place lit (§7.2), focus
  returns to its actions button, and the polite region says "קפה: מקום 2
  מתוך 4".
- **Unpublish** moves the look under "לא מוצגים באשף", lit, with
  "הוצא מהפרסום" and "לפרסם שוב" on its row. **Publish** moves it into the
  ranking at the end of its trade, or says "מציירים את המראה…" until its
  pictures come.
- **Delete** is the dialog (§7.2). For a draft, its second fact is "זו
  טיוטה, ובעלי עסק לא רואים אותה."
- **A write that fails** is said on its row, in the page's language
  (`problemKey`), and the row is as it was. Nothing is a toast: the result
  stays where it happened.
- **"מראה חדש"** from the head opens `/admin/catalog/new`; the panel's own
  "מראה חדש בתחום הזה" (in its foot) opens it with the trade in router state,
  so a new look stops starting as a café.

### 7.8 The editor's page

- The frame wears Lightbox, so the editor drops its own `theme-lightbox`
  and its `-mx-6 -my-8`.
- Its head: the back link "מראות מוכנים"; the title is the name owners
  read, the staff name under it; then one line, "בית קפה · מפורסם · מקום 1
  מתוך 4" (or "טיוטה"), worked out from the list's cached read and the
  presets the shelf already asks for; the id under that, in `<bdi
  dir="ltr">`.
- A new look: "מראה חדש", its trade from router state when it came from a
  panel.
- `CardStudio`, its trays, Shelf and Art: unchanged, per
  `docs/card-studio.md`. The shelf's hint loses "up to three per trade"
  (§8).

### 7.9 The refusal

On the wall, by day: a lit panel, centred, at most 28rem. "אזור צוות" (an
`h1`), then "האזור הזה מיועד לצוות PunchMe." and "אתם מחוברים כ־{email},
ולמשתמש הזה אין הרשאות צוות.", the email in `<bdi dir="ltr">`. Then two
buttons: "להתחבר עם חשבון אחר" (primary: signs out, and `/login` brings
them back here) and "חזרה לאפליקציה" (secondary). A `main` landmark. Its
logic, the `Opening` while the session is checked, and its place in the
tree stay.

### 7.10 Motion

No step C (guide §7). The kit's own: the sheet, the dialog, lights on for a
moved or unpublished look (240ms, the 150ms fade with reduced motion), and
nothing that travels.

## 8. Copy

Both languages. "מראה" everywhere, never "תבנית" or "עיצוב". New keys are
new; changed ones say so. The Hebrew speaks to staff in the plural.

| Where | Hebrew | English |
|---|---|---|
| The page's title (`admin.catalog.title`, changed) | מראות מוכנים | Ready-made looks |
| Its lead (`subtitle`, changed) | מה שבעלי עסק רואים באשף, לפי תחום ובסדר הזה. הראשון בכל תחום נבחר מראש. | What owners see in the wizard, by trade and in this order. Each trade's first look is chosen for them. |
| Live: the looks screen | האשף פותח עכשיו במסך המראות: הארנק מצייר אותם. | The wizard opens on the looks: the wallet draws them. |
| Live: without the options | הארנק לא מצייר מראות עכשיו, אז האשף מציע לכל תחום עד שלושה מראות פשוטים. | The wallet isn't drawing looks right now, so the wizard offers up to three plain looks per trade. |
| Live: the list didn't answer | רשימת המדבקות לא ענתה, אז בעלי עסק מקבלים עכשיו את האשף בלי המראות. | The sticker list didn't answer, so owners get the wizard without the looks right now. |
| New (`create`, changed) | מראה חדש | New look |
| New, in a trade | מראה חדש בתחום הזה | New look for this trade |
| A trade's count | מראה אחד באשף · שני מראות באשף · {{count}} מראות באשף | 1 look in the wizard · {{count}} looks in the wizard |
| A trade's classic | המראה הקלאסי באשף | The classic look in the wizard |
| A hidden trade | לא מוצג באשף: אין מראה מפורסם | Not in the wizard: nothing published |
| The first | נבחר מראש | Chosen for owners |
| A built-in | מראה מובנה | Built-in look |
| The divider | לא מוצגים באשף | Not in the wizard |
| Draft (`draft`) | טיוטה | Draft |
| A classic in a drawn trade | מפורסם, ומוצג רק כשהארנק לא מצייר מראות | Published, and shown only when the wallet isn't drawing looks |
| A styled one without the options | מפורסם, ומוצג רק כשהארנק מצייר מראות | Published, and shown only when the wallet draws looks |
| Being drawn (`pictures.drawing`) | מציירים את המראה… | Drawing the look… |
| Drawing failed | לא צויר, ולכן לא באשף. שמירה נוספת תנסה שוב. | Not drawn, so not in the wizard. Saving again tries once more. |
| No colour | אין צבע כרטיס, ולכן לא באשף | No card colour, so not in the wizard |
| The actions button | פעולות: {{name}} | Actions: {{name}} |
| The sheet's line | {{trade}} · מקום {{n}} מתוך {{total}} | {{trade}} · {{n}} of {{total}} |
| Actions | עריכה · להעביר למקום הראשון · מקום אחד למעלה · מקום אחד למטה · להוציא מהפרסום · לפרסם · למחוק | Edit · Move to first · Up one place · Down one place · Unpublish · Publish · Delete |
| After a move | עבר למקום {{n}} | Moved to {{n}} |
| Said after a move | {{name}}: מקום {{n}} מתוך {{total}} | {{name}}: now {{n}} of {{total}} |
| After unpublish | הוצא מהפרסום · לפרסם שוב | Unpublished · Publish again |
| A failed write | השינוי לא נשמר. {{reason}} | That didn't save. {{reason}} |
| The delete's title | למחוק את "{{name}}"? | Delete "{{name}}"? |
| The delete, first fact | כרטיסים שכבר נוצרו ממנו לא ישתנו: כל כרטיס הוא עותק משלו. | Cards already made from it won't change: each card is its own copy. |
| The delete, published | הוא לא יוצג יותר באשף. עכשיו הוא במקום {{n}} מתוך {{total}} בתחום שלו. אי אפשר לבטל מחיקה. | It won't be offered in the wizard any more. It's {{n}} of {{total}} in its trade now. A delete can't be undone. |
| The delete, a draft | זו טיוטה, ובעלי עסק לא רואים אותה. אי אפשר לבטל מחיקה. | It's a draft, so owners don't see it. A delete can't be undone. |
| The delete's buttons | למחוק · ביטול · רק להוציא מהפרסום | Delete · Cancel · Just unpublish |
| A failed read | לא הצלחנו לקרוא את הקטלוג. · לנסות שוב | We couldn't read the catalog. · Try again |
| An empty catalog | עוד אין מראות בקטלוג. עד שיהיו, בעלי עסק רואים את המראות המובנים. | No looks in the catalog yet. Until there are, owners see the built-in looks. |
| The account button | החשבון | Account |
| The editor, new (`createTitle`, changed) | מראה חדש | New look |
| The editor's fallback title (`editTitle`, changed) | עריכת מראה | Edit look |
| The shelf's hint (`publishedHint`, changed) | רק מראות מפורסמים מוצגים באשף, לפי הסדר שלהם בתחום. | Only published looks appear in the wizard, in their order within the trade. |
| The refusal's body (`staffOnlyBody`, split) | האזור הזה מיועד לצוות PunchMe. · אתם מחוברים כ־{{email}}, ולמשתמש הזה אין הרשאות צוות. | This area is for PunchMe staff. · You're signed in as {{email}}, which doesn't have staff access. |
| The refusal's new button | להתחבר עם חשבון אחר | Sign in with another account |

Gone: `lookCoverage`, `hasArt`, `deleteConfirm`, `moveUp`, `moveDown` (once
nothing reads them). Kept as they are: `admin.title`, `badge`,
`backToApp`, `staffOnly`, `staffHere`, `openAdmin`, and everything under
`admin.catalog.art`, `chips`, `pictures`, `saved`, `savedHidden`,
`drawnWithoutArt` and `changes`.

## 9. What step B keeps, touches and checks

**Keeps:**
- every route and call in `docs/admin-pages.md`, with the list's two new
  reads and nothing more;
- the gate's logic and its place in the tree;
- the editor's studio, its trays, its saving and its notices, per
  `docs/card-studio.md`;
- the shared copy keys the contract lists, and the query keys
  `["admin-catalog"]` and `["presets"]`.

**Touches:**
- `src/routes/admin/*`, and a tested module beside them for §7.6;
- `src/auth/RequireStaff.tsx`, its rendering only (§6, question 3);
- the `admin.*` copy in both locale files, one page per commit;
- CLAUDE.md, where it names `LookTile` as `/admin`'s, and its count of test
  files.
- Not `src/api` (the wrappers exist), `src/lib`, `src/hooks`,
  `src/config`, or the frozen previews; `StampGrid` is staged as it is.

**Checks**, beside CLAUDE.md's list:
- §5's dataset, through the same wrapper, at 320, 375 and 1280 and at 200%
  text, in Hebrew and English: every row of its table fixed;
- each trade's count and order against what `/onboarding/look` shows for
  it, in both wizards (the sticker list answered `available: false` by a
  wrapper);
- a move, a publish, an unpublish and a delete by keyboard, focus and the
  announcement included, with the guard answering the writes;
- the editor's sheets inside 375, now that the email is off the bar;
- the refusal as a signed-in account that isn't staff: said out loud,
  "להתחבר עם חשבון אחר" through `/login` and back to `/admin` as staff.

## 10. Open questions for Roee

- Do the five classic looks need to stay published, now that every trade
  has a drawn look? The list will say they're shown only when the wallet
  doesn't draw; unpublishing them is staff's call, not this rework's.
- A look's name is one English field. The wizard names looks from the
  locale files by sticker; should the catalog get a Hebrew name of its own
  (`name_he` exists only in the backend's seed JSON)? A backend change, so
  outside this rework.

## 11. Left for other phases

- Phase 10 deletes the old primitives; this rework stops using them in
  `/admin` (`LookTile` included) and leaves the files.
- The `["stickers"]` query key shared with the owner's studio (contract,
  "Found while writing this").

## 12. What step B did differently

Built 7 Nov, with Roee's yes to the plan. Where it departs from §7 and §8:

- **Publish doesn't move a look to its trade's end.** That would take a
  reorder after the patch, and publish keeps its one call. The look takes
  the place its order gives it, so one unpublished and published again gets
  its old place back, and its row says the place.
- **A fourth live line,** for a wallet that draws but has no published look
  drawn yet, where "the wallet isn't drawing" would be false
  (`admin.catalog.live.notDrawnYet`).
- **A fifth reason,** a plain published look past the three the wizard
  without the looks offers, shown by neither wizard
  (`admin.catalog.reasons.beyondThree`).
- **A third delete fact,** for a published look the wizard doesn't show
  (`admin.catalog.delete.notShown`); a polite "{name} deleted." after a
  delete; the index's label (`trades`); each row's Edit named with its look
  (`editFor`); and the editor's line under its title (`head.*`).
- **The rows owners don't see lead with the staff name,** their reason under
  it: owners have no name for a look they never meet.
- **The editor's place comes from its own reads,** `["presets", niche]` and
  `["stickers"]`, so it shows for a drawn look while the wizard opens on the
  looks. The list's cached read goes stale after a save.
- **"Just unpublish" stands under the delete's facts,** not in its footer, so
  on a phone Cancel and Delete keep one line.
- **The rows lay themselves out by their own width,** in rem: 72px pictures
  under 20rem, 160px and Edit from 42rem, and under 16rem, which only large
  text reaches, the names go under the picture. The page's two columns
  start at 60rem of the frame (1024px at the default text size). Pictures
  are sized in px, so `StampGrid`'s scale matches its box.
- **Existing copy, reused** rather than added: the account button and sheet
  are `dashboard.groups.account` ("חשבון") and `invite.signedInAs`; "Try
  again" is `common.retry` ("נסו שוב"); a draft and a drawing are
  `admin.catalog.draft` and `admin.catalog.pictures.drawing`.
- **`index.html`** lists `/admin` with the pages painted on Lightbox before
  React mounts.

Step D (7 Nov), harden, adapt, clarify and polish, added:

- **What failing reads and writes say,** by cause, and the list kept on a
  failed read again (`docs/admin-pages.md`, "When a call fails").
- **A look gone meanwhile:** `admin.catalog.gone`, said in its trade.
- **The editor's failed read:** `admin.catalog.notFound` and
  `admin.catalog.lookReadFailed`, with the way back.
- **The sticker list waits no longer than the wizard does** (4 s).
- **At 200% text on a phone, a row stacks** its place and actions, then its
  picture, then its names.
- **Clarified copy:**
  - "Trade", not "Niche";
  - "Moved to place n";
  - the plain looks past a trade's three;
  - the wizard's staff link names the ready-made looks, not "the template
    catalog".
- **`admin.*` joined the copy test** for both languages (`kitCopy.test.ts`).
- **Left as they are, with their reasons:**
  - the kit's dialog padding at 200% text leaves a long title little room
    (the kit's, shared);
  - the studio's hue slider is a 24px target at 1280 (the owner's studio
    component);
  - the detector's one advisory, a card colour in `shelf.test.ts`, is a
    look's own data.

## Appendix: how this step looked at the stack

- **Accounts.** Two test accounts made for this step in the copy
  (`punchme_looks`), so the wizard's step D, running at the same time, kept
  its own: `admin-review-1793993909321@punchme.test` (staff) and
  `admin-refusal-1793993917944@punchme.test` (not staff). Their passwords
  went into git-ignored files, read by the browser driver only, and were
  deleted after. Set new ones the same way (piped into `manage.py shell` in
  `punchme-looks-web`).
- **The frontend.** A worktree at `C:\Users\roeey\Projects\punchme-frontend-admin`,
  `node_modules` joined to the main checkout's, `.env` and `.env.local`
  (`VITE_API_ORIGIN=http://127.0.0.1:8001`) copied from `looks/onboarding`'s.
  Vite on 5188 from a temporary `admin` entry in the main checkout's
  launch.json (`npm --prefix ../punchme-frontend-admin run dev -- --port
  5188 --strictPort`), put back at once.
- **The browsers.** Headless Chrome over CDP (`cdp-server.mjs`, with `API`
  and per-call `creds`), one per reviewer on 19731/19741 and one for the
  audit on 19751.
- **The guard and the worst case.** `guard.js`, loaded before the app,
  answers every catalog write in the page and remembers it, and serves the
  worst-case modes through `localStorage.__adminWorst` ("worst", "empty",
  "one", "slow", "fail"). It and the probe that measured §4 (`probe.js`)
  are in this session's scratchpad `cdp/`.
