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

Two corrections have been made to this table's files, both on 27 Oct 2026
with Roee's yes (Phase 3, `docs/redesign/briefs/card-studio.md` §7 and §13,
and step D). In each, nothing else in the file changed.

- `StampGrid` drew a filled stamp's glyph in white whatever the stamp's
  colour, so a white stamp was a blank disc. The server knocks the glyph out
  in white or near-black (`#202024`), whichever contrasts more with the fill
  (`strips.py`, `_glyph_ink`). The stand-in now uses the same rule.
- `fieldLabel` in `CardPreviews.tsx` printed the default label ("שם",
  "ביקורים") whenever a field's label was empty. The pass prints a field's
  label as it is given (`apps/wallet/design.py`, `_build_data_field`), so a
  cleared label shows nothing on the real card. The previews now fall back
  to the default only when the card has no such field.

Staging around the card is ours to change: the frame, the well, the shadow
and the motion. One constraint applies. The previews are built for a 300px
slot, because Apple's type is scaled by 300/343. At other widths the px-sized
type drifts, while the barcode plates hold at any width.

## The editor: open for the redesign

| File | What it is |
|---|---|
| `card-studio/CardStudio.tsx` | The studio (Phase 3). The card is the map: on a phone the stage, the sample, the reward as a sentence and a row of chips, each opening a tray over the lower half; from 1024px the trays are tabs beside a sticky card. That line is 64rem (`useStudioWide.ts`, which the loading skeleton follows too), so a larger text size keeps the phone's layout until the screen is as much wider: 2048px at 200%, where the card's 22rem column would otherwise be wider than the page's |
| `card-studio/StudioStage.tsx` | The kit's `WallpaperStage` with the pass in its 300px slot, the Apple/Google switch, and the tap regions over the pass (pointer shortcuts, measured from the pass's own rows) |
| `card-studio/StudioTray.tsx`, `StudioBar.tsx`, `UploadTile.tsx`, `trays/` | The non-modal tray, the save bar, the picture tile, and the six trays: colours, the stamp, the reward, the names, the logo, Wallet details |
| `card-studio/controls/` | The card controls the studio and (from Phase 4) onboarding share: card, stamp and text colour, the stamp, the texture, the stamp count, the reward, and a colour of one's own |
| `card-studio/studioDraft.ts`, `lintProblems.ts`, `studioProblems.ts`, `studioSession.ts` | The draft's rules (tested), the server's check read by kind (tested), a failed save or upload as a sentence (tested), and the draft kept in the tab |
| `wallet-card/WalletCardPreview.tsx` | A legacy mock that nothing uses since `/style-guide` was rebuilt on the kit (Phase 1, step 1.4). Its English strings are hard-coded; Phase 10 deletes it |

## Where they are used

| | `/dashboard/design` | `/admin/catalog/:id` | `/dashboard` | `/onboarding/*` | Public pages (`/join`, `/c/:serial`, `/p/:token`) | `/` |
|---|---|---|---|---|---|---|
| `CardStudio` and its editors | yes | yes | – | – | – | – |
| `AppleCardPreview` / `GoogleCardPreview` | yes | yes | yes | yes, in `PhoneFrame` | yes, in `PassStage` | Apple only, in the hero |

**Onboarding does not use `CardStudio`.** Its steps have their own
controls, which are second copies of what the studio offers:

| Concern | Onboarding | Studio |
|---|---|---|
| Card colour | 10 swatches, the trade's looks, `ui/ColorField` | `CardColourPicker`: the 6 palettes as ready looks, the same 10 backgrounds, one's own |
| Stamp colour | Related swatches, each at least 3:1 | `StampColourPicker`: the same swatches, and one's own with a warning under 3:1 |
| Glyph and texture | `ChoiceGrid` | `StampPicker` (the trade's glyph first) and `TexturePicker` |
| Stamp picture | Cropped in the browser, uploaded at save | Cropped in the browser, held until Save |
| Stamp count | Its own slider | `StampCountControl`: the kit's slider and the strip |
| Saving | Draft in `localStorage`, then `commit.ts` | Explicit Save: the held pictures, then one PATCH. The draft is kept in the tab |

Roee chose one shared set (Phase 3): the studio is built on
`card-studio/controls`, and onboarding moves onto it in Phase 4.

## Rules the editor has to keep

These come from the wallet renderer, not from taste:

- **Stamps:** 2–12. The limit is defined twice, in `draft.ts` and
  `controls/controlRules.ts`.
- **Stamp art:** one of the 16 glyphs in `src/lib/stampGlyphs.ts`, or an
  uploaded picture. An uploaded picture wins over the glyph.
- **Textures:** none, waves, dots, stripes.
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
