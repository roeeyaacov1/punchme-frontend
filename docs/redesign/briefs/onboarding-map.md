# Onboarding as a map

Phase 4, step B, revised on 31 Oct 2026. Roee didn't like the feel of the
build: he asked for onboarding to be "more like the card studio, the card
will act as a map and the owner will have to go through all the
customization options before saving". This spec replaces the business
screen and the card screen of `onboarding.md` (§7.6 and §7.7) and the
road's five stops (§7.3). Everything else in that brief stands. It is
built on `redesign/onboarding` as more of step B, which isn't merged.

## 1. Roee's answers

- **The walk:** guided, free to jump. The first part opens by itself, each
  part's Next opens the following one, and the owner can open any part at
  any time. Save appears once every part has been opened.
- **The business:** on the map, as its first part, not a screen before it.
- **The look:** drawing א, "as in the studio", on the canvas
  [Onboarding as a map](https://claude.ai/artifact/6BEvjekb6q7n4BYWCx9MT1):
  chips under the card, the reward as a sentence, the open part outlined on
  the card. Drawings ב (pins on the card) and ג (a strip of parts at the
  top) were not chosen.
- **Where the walk is kept:** in the draft, one new field (§4). Roee
  approved the change to `draft.ts`.
- **How it is built:** grown from step B's card screen. The studio
  (`CardStudio`, `StudioStage`) is not touched.

## 2. The screen on a phone

One screen holds the whole design, at `/onboarding/reward` and the four
addresses of its trays (§5). Top to bottom: the top bar, the progress line,
the heading "עצבו את הכרטיסייה" and its lead, the card on its stage (whole,
not the 176px crop), the reward as a sentence, the chips, and a docked bar.

**The four parts, in this order:**

| Part | Opened from | What it holds |
|---|---|---|
| The business | its chip; the pass's name row | `BusinessNameField` (name, Places), the trade's tiles; the labels "שם העסק" and "איזה סוג עסק זה?" shown, not hidden |
| Colours | its chip | `CardColourPicker` (the trade's looks, the backgrounds, one's own), `StampColourPicker`, and "More colours" folded with `TextColourPicker`, as today |
| The stamp | its chip; the pass's stamps | `StampPicker` (glyph or picture), `TexturePicker`, as today |
| The reward | the reward sentence; the pass's count row | `RewardField` and `StampCountControl`, as today |

Each part opens in the studio's `StudioTray` over the lower half, the card
brought into view above it as today. The part that is open is outlined on
the card: two rings, surface then ink, so the line shows on a dark card and
a light one. Colours outlines the whole pass.

**The walk:**

- A first visit opens the business tray by itself.
- Each tray's foot holds "הבא: X", which opens the next part in the order
  above that hasn't been opened yet, wrapping round. When every part has
  been opened, the foot holds "שמירת הכרטיסייה" instead.
- The tray's heading says which part it is and "חלק 2 מתוך 4".
- The business comes first and can't be skipped. Its Next checks the name
  and the trade the way Continue does today, says what's missing and puts
  focus in that field. Pressing another chip, or a place on the card,
  before both are set does the same: the business tray stays open.
- Picking a trade shows its look on the card at once. Next writes the name
  and the look into the draft, as Continue does today (`withTradeLook`,
  with step B's rules: an untouched look and its default reward follow a
  trade change).
- A part counts as opened as soon as its tray (or tab, §3) is shown,
  however it was opened. Opening it ticks it: on its chip, and on the
  reward sentence for the reward.

**At rest** (no tray open): the docked bar holds "הבא: X" while any part is
unopened, and "שמירת הכרטיסייה" once all four are. Save writes the resolved
values and goes to `/onboarding/account`, as today.

**The places on the card** are pointer shortcuts, hidden from screen readers
and out of the Tab order, like the studio's: the chips, the sentence and the
tray's Next are the controls. They are measured from the pass's own rows,
never drawn on it. The pass previews stay frozen.

**Focus:** opening a part, by any way, puts focus on its tray's heading;
closing it returns focus to whatever opened it, as today. When the walk is
done, a polite announcement says so once: "כל החלקים נפתחו. אפשר לשמור את
הכרטיסייה."

## 3. From 1024px

As in the studio: the four parts are tabs in a working column, beside the
card in a sticky column. The tabs carry the same ticks; each panel ends in
"הבא: X". Under the card, the same button as the phone's docked bar: "הבא:
X" until the walk is done, then "שמירת הכרטיסייה". Crossing 1024px keeps the
part that's open.

**31 Oct 2026, step D: the button moved.** The build put one walk button at
the foot of the working column, right under the open panel, rather than two
(the panel's and the card's) one above the other. Shown both in Hebrew at
1280, Roee chose the foot of the working column, held on screen as Card
Studio's Save bar is: while the part above it is longer than the screen,
it holds at the screen's foot on the phone's bar (the wall's colour, a
hairline over it), and the part scrolls under it. Measured at 1280×900 it
stands where it did on every tab (524px on the business, 741px on the
colours); at 1280×720 it holds in view on the colours and the stamp, where
it had fallen below the first screen. Nothing reached by Tab stops under
it. The button under the card is not built.

## 4. The draft and the guard

- **`seen`**: the parts opened, any order, each once: `"business"`,
  `"colours"`, `"stamp"`, `"reward"`. Optional in the type. Parsing keeps
  known parts only, once each; a draft without it, from the old wizard or
  from step B, reads as none opened, so its owner walks the four parts with
  their choices in place. The draft stays `v: 1`, under the same keys.
  `commit.ts` never reads it: it never reaches the server, and the save's
  fingerprint doesn't change.
- **`firstIncompleteStep` stays as it is**, and so do its tests: nothing but
  the business opens before a name and a trade.
- **One new rule:** `/onboarding/account` is shut until all four parts have
  been opened, and sends the owner to the first one that hasn't.
- **Two pure helpers**, in a new `walk.ts` with its own tests: the next
  unopened part after a given one, and whether the walk is done.

## 5. The addresses

All eight stay, and each keeps the forward guard.

| Address | Shows |
|---|---|
| `/onboarding` | Sends to the first unopened part's address, or `/reward` once all are opened |
| `/onboarding/business` | The map, the business tray open |
| `/onboarding/color` | The map, the colours tray open |
| `/onboarding/accent` | The map, the colours tray open at the stamp colour |
| `/onboarding/stamp` | The map, the stamp tray open |
| `/onboarding/reward` | The map at rest; the reward tray opens from the sentence, in its own history entry, as today |
| `/account`, `/wallet`, `/billing` | Unchanged, apart from the road |

Back and Forward close and reopen trays as today. A Back from the account
step lands on the map with every part ticked and Save showing.

**The road** has four stops: הכרטיסייה (`steps.reward`), שמירה, בארנק שלכם,
הפעלה. The map is "שלב 1 מתוך 4".

## 6. Copy

New keys, in `en` and `he` together, under `onboarding.map`:

| Key | he | en |
|---|---|---|
| `title` | עצבו את הכרטיסייה | Design your card |
| `lead` | עברו על כל החלקים, ואז שמרו. | Go through each part, then save. |
| `part` | חלק {{n}} מתוך {{total}} | Part {{n}} of {{total}} |
| `next` | הבא: {{part}} | Next: {{part}} |
| `opened` | נפתח | opened |
| `done` | כל החלקים נפתחו. אפשר לשמור את הכרטיסייה. | Every part is open. You can save the card. |

The parts are named by `onboarding.steps.business`, `studio.chips.colours`,
`studio.chips.stamp` and `studio.chips.reward`. Save is
`onboarding.card.save`. Keys nothing reads any more are removed (step B's
card heading and lead, the business screen's heading, among them), after a
search shows nothing else reads them.

## 7. What is not touched

The studio and the frozen pass previews; `commit.ts`, `DraftContext` and the
storage keys; `AuthFields`, `AuthAlternatives`, `useEmailPasswordAuth`; the
account, wallet and going-live steps, apart from the road; every route and
every API call in `docs/onboarding-flow.md`; the four points where the draft
is cleared.

## 8. Checks

- **Tests first** for `seen` in `draft.test.ts` (new cases; the existing
  ones unchanged), `walk.test.ts`, and `road.test.ts` at four stops.
- **In the browser**, in Hebrew and English, at 375, 1280 and 320, and at
  200% text; signed out and signed in; reduced motion; the keyboard path; a
  clean console.
- **The walk's edges:** each address typed in by hand, `/account` before
  the walk is done, a refresh mid-walk, a Back from the account step, a
  draft from step B with no `seen`, a lost picture, storage full, a hire and
  an account that already has a card.
- **One real sign-up** on the local backend, then a Back-and-change that
  updates rather than creates.
- `npm run build`, `npm run lint`, `npm test`; then one fresh reviewer over
  the whole change.

The docs that follow the build: `docs/onboarding-flow.md` (the contract)
and `docs/card-studio.md`'s "where used". `onboarding.md` already carries a
dated note pointing here.

## 9. What only a real phone can confirm

Step D (31 Oct 2026) checked the map in headless Chrome at 320, 375 and
1280, in both languages, at 100% and 200% text and with reduced motion,
with touch emulated. Three things that emulation can't settle are left for
a phone in Hebrew, before the branch merges:

- **The Places list with a Maps key and the keyboard up.** No Maps key
  runs locally: the list was checked with a stand-in of five two-line
  suggestions, in the flow under the name, the business tray growing to
  its cap to hold them, and a held mouse press on a trade landing on the
  trade. Still open: with iOS and Android keyboards up, whether the tray
  (fixed to the foot of the layout viewport) and the list stay above the
  keyboard or slide under it, whether a tap on a suggestion lands before
  the field's blur closes the list, and whether the real suggestions'
  lengths fit as the stand-in's did.
- **The taps answering at once.** The frame and every tray body say
  `touch-action: manipulation`, and the frame turns the tap flash off.
  Headless Chrome reports the tap highlight transparent whatever the page
  says, and its emulated taps carry no delay to remove, so neither the
  300ms wait nor a flash under the finger can be seen there: a chip, a
  swatch, the walk's button and the sentence each want a quick tap, and a
  double tap on a swatch must not zoom.
- **The stamp landing and the step-ins at full speed.** Both were read
  frame by frame from headless Chrome's screencast (about 18ms apart) and
  through `getAnimations()`: the stamp lands in 340ms on the overshoot, a
  tray's body steps in from the walk's side, mirrored in Hebrew, and both
  fade under reduced motion. Whether they hold their frames on a phone's
  own GPU, at 60 and 120Hz, under a finger, is a phone's to say.
