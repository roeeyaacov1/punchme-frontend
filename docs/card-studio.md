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

Staging around the card is ours to change: the frame, the well, the shadow
and the motion. One constraint applies. The previews are built for a 300px
slot, because Apple's type is scaled by 300/343. At other widths the px-sized
type drifts, while the barcode plates hold at any width.

## The editor: open for the redesign

| File | What it is |
|---|---|
| `card-studio/CardStudio.tsx` | The studio. A stage (the preview, a sample-stamps slider, the server's lint) and a bench of panels: the deal, the stamp, colour and texture, the logo, and "Wallet details" |
| `card-studio/CardPreviews.tsx`: `CardPreview` only | The wrapper with the Apple/Google switch and the rim. Its own comment says "The switch is ours, not the wallets'" |
| `card-studio/studio-primitives.tsx` | Panel, labels, text, select, upload button, slider, punch strip, disclosure |
| `card-studio/ColorWell.tsx` | The colour popover: picker, hex, eyedropper, random, swatches |
| `card-studio/FieldsEditor.tsx` | Up to 10 pass fields: binding, label, section, alignment, change message |
| `card-studio/LabelsEditor.tsx` | Renames the two labels on the face of the card |
| `wallet-card/WalletCardPreview.tsx` | A legacy mock that only `/style-guide` uses. Its English strings are hard-coded |

## Where they are used

| | `/dashboard/design` | `/admin/catalog/:id` | `/dashboard` | `/onboarding/*` | Public pages (`/join`, `/c/:serial`, `/p/:token`) | `/` |
|---|---|---|---|---|---|---|
| `CardStudio` and its editors | yes | yes | – | – | – | – |
| `CardPreview` (switch wrapper) | yes | yes | yes (manager+) | – | – | – |
| `AppleCardPreview` / `GoogleCardPreview` | yes | yes | yes | yes, in `PhoneFrame` | yes, in `PassStage` | Apple only, in the hero |

**Onboarding does not use `CardStudio`.** Its steps have their own
controls, which are second copies of what the studio offers:

| Concern | Onboarding | Studio |
|---|---|---|
| Card colour | 10 swatches, the trade's looks, `ui/ColorField` | 6 four-colour palettes, `ColorWell` |
| Stamp colour | Related swatches, each at least 3:1 | `ColorWell`, no contrast guard |
| Glyph and texture | `ChoiceGrid` | `ChoiceGrid` (same data, tile markup duplicated) |
| Stamp picture | Cropped in the browser, uploaded at save | Uploaded straight away |
| Stamp count | Its own slider | `StudioSlider` and `PunchStrip` |
| Saving | Draft in `localStorage`, then `commit.ts` | Explicit Save, uploads straight away |

Whether to give both places one shared set of controls is a design question
for the card-studio phase.

## Rules the editor has to keep

These come from the wallet renderer, not from taste:

- **Stamps:** 2–12. The limit is defined twice, in `draft.ts` and
  `CardStudio.tsx`.
- **Stamp art:** one of the 16 glyphs in `src/lib/stampGlyphs.ts`, or an
  uploaded picture. An uploaded picture wins over the glyph.
- **Textures:** none, waves, dots, stripes.
- **Barcode formats:** the four that `PassBarcode` draws.
- **Fields:** at most 10, using PassKit's 5 bindings, 5 sections and 4
  alignments (`FieldsEditor.tsx`).
- **Palettes** write four colours at once: background, stamp, text and label.
- **Picture uses** are `logo`, `icon`, `strip_base`, `stamp_art`,
  `stamped_art` and `unstamped_art`. Apple shows the wide logo and Google
  circle-crops the square one.
- **Unsaved edits** switch the preview to the CSS stand-in. Once saved, it
  shows the published PNGs, which are what the phone gets.

## `/dashboard/design`

- Manager and up (`RequireRole`). The tour points at
  `data-tour="design-studio"`, so keep that attribute.
- The calls are listed in `docs/dashboard-routes.md`:
  - load the template and design;
  - issue the owner's own pass;
  - a lint check 400 ms after each edit;
  - Save as one PATCH;
  - uploads save straight away.
- The draft is seeded once per template, so a refetch never overwrites an
  edit.
- `/admin/catalog/:id` uses the same `CardStudio` for PunchMe staff, with
  its own calls (see `docs/dashboard-routes.md`).

## Found while writing this (not fixed)

- **A saved picture stamp disappears from the editor.** After a reload, the
  studio shows a glyph as selected and draws the glyph, while the real pass
  uses the uploaded picture. `designImageUrls` leaves stamp art out and the
  page ignores `DesignOut.assets`. Onboarding handles this correctly.
- **No unsaved-changes guard.** Nothing warns before leaving the page with
  unsaved edits.
- **Lint and save errors are English only.** Lint messages are the server's
  English, and a save error shows the raw message.
- **Comments disagree about the ground under a pass.** `CardStudio.tsx` and
  `index.css` say the wallets don't draw a pass on white. `PassStage.tsx` and
  `dashboard/primitives.tsx` say they do.
- **The Apple/Google switch labels are set in IBM Plex Mono**, which has no
  Hebrew.
- **The sample name is a literal.** `SAMPLE_NAME = "דנה לוי"` is a Hebrew
  string in code and shows in both languages.
