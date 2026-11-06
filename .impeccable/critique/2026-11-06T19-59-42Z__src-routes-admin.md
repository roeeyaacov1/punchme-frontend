---
target: /admin (list, editor, refusal), Hebrew first at 375px then 1280px
total_score: 17
max_score: 40
na_heuristics: 
p0_count: 1
p1_count: 3
target_identity: "file:C:\\Users\\roeey\\Projects\\punchme-frontend-admin\\src\\routes\\admin"
timestamp: 2026-11-06T19-59-42Z
slug: src-routes-admin
---
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
