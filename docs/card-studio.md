# Card studio: the spec line and the editor

Where the card studio's spec match ends and its editor begins, where each
piece is used, and the rules the editor has to keep. Written 8 Oct 2026 from
`src/components/card-studio/`, `src/components/wallet-card/` and the pages
that use them, as the input for the redesign.

The code draws the line itself, in `CardStudio.tsx`:

> What is a spec match is the card, and it is untouched: its layout, its
> colours and the white quiet zone under the barcode all belong to the two
> wallets. The frame around it belongs to us.

CLAUDE.md currently protects both folders as a whole. Redesigning the editor
means narrowing that rule to the files in the first table below. That is a
decision for the owner, and the redesign guide asks for it first.

## The spec match: stage it, never redraw it

| File | What it draws |
|---|---|
| `card-studio/CardPreviews.tsx`: `AppleCardPreview`, `GoogleCardPreview` (and the internal `StripArt`) | The pass as Apple Wallet's store card and Google Wallet's loyalty card draw it. Measured off Apple's and Google's own renders; the comments record each measurement. |
| `card-studio/StampGrid.tsx` | The CSS stand-in for the server's strip renderer (`apps/wallet/strips.py`). It shows only while there are unsaved edits or before the first sync. Otherwise the published PNG shows. |
| `wallet-card/PassBarcode.tsx` | The barcode, drawn for real in all four formats |
| `src/lib/passBarcode.ts`, `cardPatterns.ts`, `stampGlyphs.ts`; `designImageUrls` in `src/api/designs.ts` | The logic those files rely on (already protected as `src/lib` and `src/api`) |

Five corrections have been made to this table's files, each with Roee's
yes: the first two on 27 Oct 2026 (Phase 3, `docs/redesign/briefs/card-studio.md`
§7 and §13, and step D), the third on 30 Oct 2026 (Phase 4,
`docs/redesign/briefs/onboarding.md` §10), the fourth and fifth on 4 Nov 2026
(the card looks, `docs/redesign/briefs/card-looks.md` §5, row 8). In each,
nothing else in the file changed.

- `StampGrid` drew a filled stamp's glyph in white whatever the stamp's
  colour, so a white stamp was a blank disc. The server knocks the glyph out
  in white or near-black (`#202024`), whichever contrasts more with the fill
  (`strips.py`, `_glyph_ink`). The stand-in now uses the same rule.
- `fieldLabel` in `CardPreviews.tsx` printed the default label ("שם",
  "ביקורים") whenever a field's label was empty. The pass prints a field's
  label as it is given (`apps/wallet/design.py`, `_build_data_field`), so a
  cleared label shows nothing on the real card. The previews now fall back
  to the default only when the card has no such field.
- The business name took the page's direction, so on a Hebrew page an
  English name printed backwards (".Danny’s Barbershop & Beard Co" on
  Apple's pass, its start cut off on Google's). The wallets set each string
  by its own first letter. Apple's name row, Google's issuer line and its
  program line ("{business} - {card}") now carry `dir="auto"`.

- The fourth (PR #40, passbox-api v0.1.1's card design options):
  `AppleCardPreview` shows the stamp count where the pass puts it with
  `design.stamps_place` "header" (Apple's header field, at the logo row's
  end), writes it "6/8" with `design.stamps_format` "fraction", and prints
  the business name beside a logo of the owner's own with `design.logo_text`
  (the `logoText` prop). Google's card is unchanged: its count stays a
  number. `StampGrid` and `StripArt` are untouched.
- The fifth: `AppleCardPreview`'s logo row is laid out left to right
  whatever the page's direction (`dir="ltr"` on the row), as iOS lays it.
  On a Hebrew iPhone the logo is at the left and the header count at the
  right, and only the name between them reads right to left, by its own
  `dir="auto"` (the input's §4, `docs/redesign/card-design-options.md`). It
  shows on every Hebrew page that draws Apple's pass: the studio, the
  Overview, onboarding, the public pages and the landing page's hero.

A card built from the options the stand-in can't draw
(`designOptions.isStyled`: stamps on their own, a sticker, a panel, a
wallpaper) is the server's picture, handed to the previews as their
published one by `StudioStage` (`stagePictures`), and outside the studio by
`OwnPass` and `MessageStage`.

Staging around the card is ours to change: the frame, the well, the shadow
and the motion. One constraint applies. The previews are built for a 300px
slot, because Apple's type is scaled by 300/343. At other widths the px-sized
type drifts, while the barcode plates hold at any width.

## The editor: open for the redesign

| File | What it is |
|---|---|
| `card-studio/CardStudio.tsx` | The studio (Phase 3). The card is the map: on a phone the stage, the sample, the reward as a sentence and a row of chips, each opening a tray over the lower half; from 1024px the trays are tabs beside a sticky card. That line is 64rem (`useStudioWide.ts`, which the loading skeleton follows too), so a larger text size keeps the phone's layout until the screen is as much wider: 2048px at 200%, where the card's 22rem column would otherwise be wider than the page's |
| `card-studio/StudioStage.tsx` | The kit's `WallpaperStage` with the pass in its 300px slot, the Apple/Google switch, and the tap regions over the pass (pointer shortcuts, measured from the pass's own rows). A card the server draws (`isStyled`) keeps what the stage showed last, a picture or the stand-in, while the next is drawn (`stageShown`), never another picture in between, with a lit tag under the stage from 500ms; a picture counts once the wallet's own one, Apple's strip or Google's hero, has loaded and decoded. When a drawing fails it shows the saved card, which is what customers have, with "כך הכרטיס אצל הלקוחות עכשיו" and "לצייר שוב" (`stageOnFailure`), never a picture of a card that is neither the draft nor the saved one. On a phone, where an open tray covers that, the save bar says it too, and so it does a drawing still on its way after 2s (card looks, step D), so a choice never looks ignored. The motion (card looks, step C): a new drawing, or the saved card standing in, crosses over the last, which stays over the slot as a layer and goes out in the exit's 180ms on the ease-out (`crossfade-out`; the 150ms fade with reduced motion), so the pass itself is never touched; a drawing that comes while the last is still going goes under it, so the one going carries on rather than starting again (three at most); a swap that changes the card's height, between the stand-in grid and a drawn strip, cuts. The tag fades in, with reduced motion too; the failure's panel and the bar's line for a failure light on, and the bar's line for a slow drawing only fades up, since it comes back with every one; a bar that opens with either line says it at once (step D's `/review-animations`) |
| `card-studio/StudioTray.tsx`, `StudioBar.tsx`, `UploadTile.tsx`, `trays/` | The non-modal tray, the save bar, the picture tile, and the seven trays: colours, the stamp, the background, the reward, the names, the logo, Wallet details. With the design options the colours are `BrandColoursTray` and the background is "מאחורי החותמות" (`BehindTray`: a ground by name, and one faint pattern, a texture or a sticker); without them, `ColoursTray` and "הרקע" with the texture, as before. A tray stops at half the screen, or at 18rem where half would hold little past its heading and foot (large text, a short screen, a phone on its side), never past 85% (onboarding's step D, 31 Oct 2026). Where the wallet draws the options, the bar at a tray's foot is one row (the count as a badge, then Save) once it is narrower than 16rem or the screen shorter than 36rem, so a wide window at 200% text keeps room to scroll too (card looks, step D). "עוד מדבקות"'s search says a word that finds nothing under the field, inside the box that holds it in view, and a search typed while the field is held at the top brings the panel's start back |
| `card-studio/controls/` | The card controls the studio and (from Phase 4) onboarding share: card, stamp and text colour, the stamp, the texture, the stamp count, the reward, and a colour of one's own. The reward is a paragraph of two lines that grows to three (Phase 4): Enter does the screen's own action, if it passes one, and a pasted line break becomes a space. With large text on a phone, the glyphs and the textures take as many to a row as fit, and four at 100% (Phase 4) |
| `card-studio/studioDraft.ts`, `lintProblems.ts`, `studioProblems.ts`, `studioSession.ts` | The draft's rules (tested), the server's check read by kind (tested), a failed save or upload as a sentence (tested), and the draft kept in the tab |
| `wallet-card/WalletCardPreview.tsx` | A legacy mock that nothing uses since `/style-guide` was rebuilt on the kit (Phase 1, step 1.4). Its English strings are hard-coded; Phase 10 deletes it |

## Where they are used

| | `/dashboard/design` | `/admin/catalog/:id` | `/dashboard` | `/onboarding/*` | Public pages (`/join`, `/c/:serial`, `/p/:token`) | `/` |
|---|---|---|---|---|---|---|
| `CardStudio` and its editors | yes | yes | – | – | – | – |
| `AppleCardPreview` / `GoogleCardPreview` | yes | yes | yes | yes, in `CardStage` on the kit's `WallpaperStage` | yes, in `PassStage` | Apple only, in the hero |

**Onboarding does not use `CardStudio`**, but its map (`/onboarding/reward`
and its trays) is built on the same controls and the same `StudioTray`
(Phase 4). Like the studio's stage, its card is the map: `CardStage` lays
places of its own over the pass's rows (the name opens the business, the
stamps the stamp, the count the reward) and outlines the open part, measured
from the frozen previews and never drawn on them.

| Concern | Onboarding | Studio |
|---|---|---|
| Card colour | `CardColourPicker`: the trade's looks (colours only), the same 10 backgrounds, one's own | `CardColourPicker`: the 6 palettes as ready looks, the 10 backgrounds, one's own. With the design options (`BrandColoursTray`): no palettes; the business colour (the 10 backgrounds, one's own), then the colours that follow it, each with "שינוי" (`brandColours.ts`) |
| Stamp colour | `StampColourPicker` | `StampColourPicker`: the swatches that clear 3:1, and one's own with a warning under it |
| Glyph and texture | `StampPicker` and `TexturePicker` | `StampPicker` (the trade's glyph first) and `TexturePicker`. With the design options: the trade's stickers first with their names (`StampStickerPicker`, `stickerGroups.ts`), then "עוד מדבקות" (groups and a search), "סמל פשוט" (`GlyphPicker`) and "תמונה משלכם" (`StampPictureField`), each opened in place; the tint, "בצבע הכרטיס", under them; then "בתוך עיגול / לבד" |
| Stamp picture | Cropped in the browser, kept on the device, uploaded at save | Cropped in the browser, held until Save |
| Stamp count | `StampCountControl` | `StampCountControl`: the kit's slider and the strip. With the design options, "המספר על הכרטיס" under it in the reward tray: under the stamps or at the top by the logo, "6" or "6/8" at the count the stage shows, tagged "רק באייפון". Names keeps the words only, and says what Google shows of a name past 20 characters; the logo tray offers the name beside a logo only for a mark of one's own narrower than 2:1 |
| Reward | `RewardField`, two lines; Enter goes on, as the tray's button does: the next part, or saving | `RewardField`, two lines; Enter does nothing |
| Saving | Draft in `localStorage`, then `commit.ts` | Explicit Save: the held pictures, then one PATCH. The draft is kept in the tab |

Roee chose one shared set (Phase 3): the studio is built on
`card-studio/controls`, and onboarding moved onto it in Phase 4.

## Rules the editor has to keep

These come from the wallet renderer, not from taste:

- **Stamps:** 2–12. The limit is defined twice, in `draft.ts` and
  `controls/controlRules.ts`.
- **Stamp art:** one of the 16 glyphs in `src/lib/stampGlyphs.ts`, one of
  the wallet's built-in stickers (`GET .../stickers`, passbox-api), or an
  uploaded picture. The renderer's order: a picture, then a sticker, then
  the glyph. A sticker a newer server adds, with no name in the locale files,
  is read out by its own name with spaces for dashes ("teapot"), in English
  on a Hebrew page too (`stickerLabel`), and found under "מתנות וכללי" until
  it is named in both files and given a group in `stickerGroups.ts`.
- **The tint** shades a sticker or a picture in the stamp colour, and the
  wallet draws it only on stamps on their own: switching it on stands the
  stamps on their own, gives them the business colour, and brings the
  rule's ground to a card with none (Roee, 6 Nov), since stamps in the
  card's own colour on the card itself all but vanish.
- **Textures:** none, waves, dots, stripes. A sticker wallpaper takes the
  texture's place; a panel holds either. With the design options the two
  are one choice, "דוגמה עדינה מאחור" (`PatternPicker`), and a sticker is
  stored with no texture beside it (`withPatternChoice`). A strip picture
  covers any pattern, so under one the choice gives way to a line.
- **Design options** (passbox-api v0.1.1): stamps in a circle or on their
  own, a check and a tint on stamps on their own, a panel, a wallpaper, the
  count at the top and as "6/8", the name beside the logo. Offered only
  while the sticker list says the wallet draws them (`available`); a server
  before v0.1.1 refuses any of them.
- **The stamps' alert message:** an iPhone alerts on a new stamp only for a
  field with a change message, so every design keeps one (Roee, 4 Nov; the
  backend's `stamps_change_message`). Where the wallet draws the design
  options, the stamps field's message can't be emptied: cleared, it takes
  the card language's default as the field is left, and one without its
  `%@` gets " %@" (`stampsChangeMessage`).
- **While the sticker list can't be read** on a card that uses the options
  (`studioMode` "outage"), the stamp tray and "מאחורי החותמות" say so and
  what the card has, and offer nothing that would drop it unasked: the
  glyphs wait behind "סמל פשוט", which says a symbol takes the sticker's
  place.
- **Where the wallet draws none of the options** (the list says
  `available: false`, as a server before v0.1.1 does) and the card still
  uses one (`usesOptions`: a sticker, stamps on their own, a check, a tint,
  a ground, a sticker pattern, the count at the top or as "6/8", the name
  beside the logo), `studioMode` is "off" (card looks, step D): the wallet
  refuses every drawing and every save of that card, and a refused design
  isn't tried again. The page says so once, in place of the refusals it
  causes, with "להוריד אותם מהכרטיס", which takes every option off
  (`withoutOptions`: stamps in circles with their glyph, the count back
  where the saved card had it); the stamp tray and "מאחורי החותמות" say what
  they hold and offer the same, where their part uses an option. Taken off,
  the card is today's studio again.
- **A sync the wallet refused** (`studioProblems.syncProblem`, by the
  backend's `design_sync_error`): where the options are drawn, the page
  says the design wasn't accepted and customers' cards stayed as they were,
  with the server's words folded under it, never "we'll try again by
  ourselves", which holds only for a wallet that couldn't be reached.
  Without the options, today's words.
- **The name on the pass:** the card's own, "שם העסק על הכרטיס"
  (`design.organization_name`), where its design sets one, else the
  business's (backend PR #20, item 5). Apple writes it in the logo row and
  Google in its issuer line; Google's program line stays "{business} -
  {card}" with the business's own name. A logo the server drew from the
  name says the saved one, so while the draft renames the card the stage
  prints the new name in its place.
- **Barcode formats:** the four that `PassBarcode` draws.
- **Fields:** 1 to 10, using PassKit's 5 sections and 4 alignments and five
  kinds of binding (`studioDraft.ts`). Each free-text field has a binding of
  its own (`meta.custom`, `meta.custom_2` …), since PassKit refuses two
  fields with one `uniqueName`.
- **Text:** the API's limits, as `maxLength` (`TEXT_LIMITS` in
  `studioDraft.ts`): card name 80, reward 200, a field's label 60, its change
  message 120, its value 500, the organisation name 120.
- **Palettes** write four colours at once: background, stamp, text and label.
- **Picture uses** are `logo`, `icon`, `strip_base`, `stamp_art`,
  `stamped_art` and `unstamped_art`. Apple shows the wide logo and Google
  circle-crops the square one.
- **Unsaved edits** switch the preview to the CSS stand-in. Once saved, it
  shows the published PNGs, which are what the phone gets.

## `/dashboard/design`

- Manager and up (`RequireRole`). The tour points at
  `data-tour="design-studio"`, which sits on the stage, so keep it there.
- The calls are listed in `docs/dashboard-routes.md`:
  - load the template and design;
  - issue the owner's own pass;
  - a lint check 400 ms after each edit;
  - Save: each picture held since the last save, then the card read
    again with the owner's edits put on it, then one PATCH, then the card
    read once more. Pictures are held for Save (Phase 3), so a new
    logo or stamp reaches customers with the rest of the edit.
- The draft is seeded once per template, so a refetch never overwrites an
  edit.
- The draft is kept in the tab, so leaving the studio loses nothing.
  Closing the tab with changes asks first from the studio only: from
  another page, kept edits go without a question (Phase 3, step D, in the
  brief's §14).
- `/admin/catalog/:id` uses the same `CardStudio` for PunchMe staff, with
  its own calls (see `docs/dashboard-routes.md`). Each look is its own
  editor, keyed by its id, so a new look opened from another starts empty.

## Found while writing this

Fixed in Phase 3, except where it says otherwise.

- **A saved picture stamp disappears from the editor.** After a reload, the
  studio shows a glyph as selected and draws the glyph, while the real pass
  uses the uploaded picture. `designImageUrls` leaves stamp art out and the
  page ignores `DesignOut.assets`. Onboarding handles this correctly. Fixed:
  the studio reads `assets`, shows the picture as the stamp, and says when
  this device can't draw it.
- **No unsaved-changes guard.** Nothing warns before leaving the page with
  unsaved edits. Fixed: the draft is kept in the tab, and closing the tab
  with changes asks first.
- **Lint and save errors are English only.** Lint messages are the server's
  English, and a save error shows the raw message. Fixed: the check is read
  by kind, and a failed save or upload is a sentence in the page's language.
- **Comments disagree about the ground under a pass.** `CardStudio.tsx` and
  `index.css` say the wallets don't draw a pass on white. `PassStage.tsx` and
  `dashboard/primitives.tsx` say they do. Not fixed: the studio now stands
  the pass on its wallpaper, so this is the public pages' question (Phase 8).
- **The Apple/Google switch labels are set in IBM Plex Mono**, which has no
  Hebrew. Fixed: the studio's switch is the kit's `SegmentedControl`.
- **The sample name is a literal.** `SAMPLE_NAME = "דנה לוי"` is a Hebrew
  string in code and shows in both languages. Fixed in the studio, which
  passes `holderName` from `t()`; the literal stays as the frozen previews'
  fallback.
- **A redraw flashed the saved card** (card looks, step C, 6 Nov). While a
  drawing of a styled card was on its way, the stage stood the first
  picture it found in for it, and the design read's comes first: croissant
  to cupcake showed the saved card for half a second, longer on a slow
  passbox. Fixed: the stage keeps what it showed. In the same pass, a
  picture whose hero had loaded under Google went to Apple's pass before its
  strip had, and the grid showed for a frame. Fixed: the wallet's own.
- **What step D found, hardening the studio** (card looks, 6 Nov), all
  fixed:
  - on a v0.1.0 wallet a styled card had today's trays, which can't take
    the options off, and the page said "we'll try again by ourselves" of a
    refusal that is never retried (the "off" mode above);
  - a slow drawing was said only under the stage, behind an open tray on a
    phone;
  - a sticker search that found nothing said so under the sticky field,
    out of sight once the field was held at the top of a scrolled tray;
  - the stamps strip in the reward tray drew tinted stamps in the card's
    own colour on the card, so they vanished: it shows the sticker, on the
    stamps' ground where there is one;
  - at 200% text the wide picture tile in Wallet details squeezed its words
    off the screen: it is 3rem tall, at most 45% of its row (the same box
    at 100%);
  - the check's hint said "this card ticks every stamp" after it was
    switched off.
- **The stand-in grid and a drawn strip are different heights.** The grid
  is 54px for six stamps or fewer and 92px for more; Apple's strip is 115px
  and Google's hero 98px. So a card that goes from a sticker to a plain
  symbol, or back, moves by 23px on Apple with eight stamps (6px on Google).
  Not fixed in step C: the previews are frozen, and transform and opacity
  can't ease a change of height, so the swap cuts. Asking the server to draw
  a plain card too, while the wallet draws the options, would end it, at the
  cost of a drawing for every change of a plain card. Left as it is for now
  (Roee, 6 Nov).
