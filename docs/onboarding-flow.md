# Onboarding: routes, draft and API calls

What the onboarding wizard has: every step, who can open it, what it
stores, and the API calls it makes. Written 8 Oct 2026 from `src/main.tsx`,
`src/routes/onboarding/` and `src/components/onboarding/`, as the input for
the redesign, and brought up to date by Phase 4's build (30 Oct 2026,
`docs/redesign/briefs/onboarding.md`), by the map (31 Oct 2026,
`docs/redesign/briefs/onboarding-map.md`) and by step D's hardening (31 Oct
2026). Like `docs/dashboard-routes.md`, it says nothing about design on
purpose.

- `{biz}` stands for `/api/businesses/{business_id}`.
- The last column is the wrapper in `src/api/` (or the hook that calls it).
- **Load** means the call fires when the step opens. Any other row fires on
  the action it names.

## Access

- The owner designs the card first and makes an account last. Every step up
  to and including `account` is public.
- `wallet` and `billing` sit behind `OnboardingGate`, which sends a
  signed-out visitor to `/onboarding/account`, never to `/login`. The gate
  asks for an account only; the two steps read the business themselves and
  send an owner without one (a 404) back to `account`, and a hire to
  `/dashboard`. A business that couldn't be read (a 500, no connection) is
  never taken for none: the step says so, with Try again.
- `/onboarding` itself shows nothing and redirects:
  - signed out, or signed in with no business → where the walk stands;
  - signed in, the business couldn't be read → `/dashboard`, whose own page
    asks again;
  - signed in to a business they are not the owner of → `/dashboard` (a
    hire never resumes a draft left on the device);
  - the owner, with a saved card → `wallet`;
  - the owner, with a draft in progress → where the walk stands;
  - the owner, with no draft → `/dashboard`.

  Where the walk stands (`whereToStart` in `walk.ts`): the field the card
  still needs, or a lost picture's stamp; otherwise the first part of the
  map not yet opened; and once every part has been, the map at rest, where
  Save is.
- A step URL past the first incomplete step redirects back to it, so a link
  can't skip ahead. A picture stamp whose pixels are gone sends the owner
  back to `stamp`.
- `account` also waits for the walk: until every part of the map has been
  opened, it sends the owner to where the walk stands.
- Other ways in:
  - any signed-in user whose `GET /api/businesses/me` answers 404
    (`RequireBusiness`);
  - `/login` after sign-up, or after sign-in when a draft is in progress;
  - seven buttons on the landing page.

## The road and the steps

Nine routes, four stops, or five while the wizard offers the card looks
(below). The road is the same stops from the first screen to the last,
signed in or out (`road.ts`, `roadOf`): the map is the first, after the
look where there is one, and walking its parts decides nothing about the
road; signing up adds no stops. A line under the top bar says where the
owner is and what comes next ("Step 1 of 4 · Next: Saving") over a rule of
as many parts. It is not a control: Back is each screen's own.

**The card looks** (`docs/redesign/briefs/card-looks.md` §7). The wizard
opens on them when the public sticker list says the wallet draws the design
options (`available`) and the catalog has at least one look drawn for them
(`looksOffered` in `looks.ts`). Otherwise it is the wizard as it was before
them, exactly: `/onboarding/look` goes to `/onboarding/business`, where the
business holds the trade, and the road is four stops. It is decided once
per tab, as soon as the list has answered (and the catalog, where the list
said yes), or after 4 s with what is known by then; until then no screen is
shown. A draft that already has a look keeps the fifth stop.

Every screen stands in one column or two (`StepShell`). One on a phone and
a tablet: the card under the heading, or above it, and the action docked at
the screen's foot. Two from 1024px: the card in a sticky column of its own
at the end, the action at the foot of the step's column. Two only while the
screen is at least 58rem (`useWide.ts`): the step's 30rem, the card's 22rem,
the gap and the page's sides, so two columns never leave the step less room
than one gives it. At the default text size that is always from 1024px.
Larger text keeps the tablet's one column until the screen is as much
wider: 1160px at 125%, 1856px at 200%. The top bar, the page's column, the
cropped card on the saving and going-live steps and the map's tabs or trays
all follow that one decision.

| # | Route | Stop | Public | What it collects | Limits | Pressed on with it missing |
|---|---|---|---|---|---|---|
| 0 | `/onboarding/look` | 1 of 5, only while the wizard offers the looks | yes | The trade, as pills, and the look the card starts from: the trade's drawn looks, each its own picture (Apple's strip, or Google's hero on an Android), the draft's look or the trade's first chosen. A trade with none drawn shows its classic look | Trades without a look are hidden once the catalog loads, as on the business | "Continue" with no trade says so under the pills and takes focus there |
| 1 | `/onboarding/business` | 1, the map, its business tray | yes | Business name (Google Places suggestions when `VITE_GOOGLE_MAPS_API_KEY` is set, which also fills the phone) and trade: barber, café, personal trainer, therapist, other | Name at most 120 (the field holds it; a longer one from a draft made before is held like a missing name, saying how many characters are too many). Trades without a preset are hidden once presets load, unless the catalog lists none; the trade chosen always shows | Every way out of it holds, Save included: says which is missing, there, and takes focus to it |
| 2 | `/onboarding/color` | 1, the map, its colours tray | yes | Card colour: the trade's looks (colours only), 10 swatches, or one's own; the stamp colour; folded, the text colour | A card colour that leaves the stamp colour under 3:1 takes the first stamp colour that fits | – |
| 3 | `/onboarding/accent` | 1, the same tray, opened at the stamp colour | yes | As `color` | As `color` | – |
| 4 | `/onboarding/stamp` | 1, the map, its stamp tray | yes | The stamp, either one of the 16 glyphs the wallet renderer knows (the trade's first) or a picture; plus a texture behind the stamps (none, waves, dots, stripes) | Picture: png, jpeg, webp, gif or bmp, up to 8 MB, cropped square in the browser to at most 512px | A lost picture is said here, by its cause |
| 5 | `/onboarding/reward` | 1, the map at rest; the reward tray is its history state | yes | Stamps to a reward and the reward text | 2–12 stamps; reward up to 200 characters, two lines that grow to three, never a line break | An empty reward opens the reward and says so under the field |
| 6 | `/onboarding/account` | 2, Saving, once every part of the map has been opened | yes | Sign up or sign in, then save the card | See below | An empty email or password is said over the button |
| 7 | `/onboarding/wallet` | 3, In your wallet | gated | The owner adds their own pass to their wallet | – | – |
| 8 | `/onboarding/billing` | 4, Going live | gated | Activate (checkout) or "Not now" | – | – |

- **The look** (`LookStep`): "What kind of business is it?" over the trades,
  then "Pick a look for your card" with a lead per trade, and the looks as
  one radio group, one to a row on a phone and two from 1024px, where the
  chosen one stands as the whole pass in the card's column. A look is named
  by what is on its stamps, its sticker or its glyph, from the locale files
  (Roee, 6 Nov 2026: the catalog has one name per look, in one language);
  two that would share a name are told apart by their place ("Croissant
  2"). Nothing is written until "Continue with {look}", which writes the
  trade and the look (`lookChoicePatch`: the colours, the stamp, the ground,
  the pattern, the count's place and format, and the count while it is
  still the last look's) and opens the map at its business. A look never
  takes what is the owner's: the name, the logo, a picture stamp, a reward
  they wrote (one still a trade's default goes, to read the new trade's) or
  a count they set. The same look again changes nothing.
- **A card from a look** (the draft has `look`) walks the same map with the
  same four parts, holding the studio's own trays over the draft
  (`studioValue.ts`, brief §7.4):
  - the business: the name; the trade as a line, "Café · Change", which goes
    back to the looks; and "Logo (optional)", the studio's upload tile,
    scaled down and kept on the device until the save. A mark narrower than
    2:1 turns the name beside it on by itself, and a wide one doesn't. A
    logo the draft has and the device doesn't is said there, and holds
    nothing up: the card is saved without it;
  - the colours: `BrandColoursTray`, the business colour and what follows
    it, the look's own colours among them while the card is still its
    colour (`lookBase`);
  - the stamp: `StampTray`, the trade's stickers first, more with a search, a
    plain symbol and a picture of one's own, the tint, and in a circle or on
    its own, with "Ground and pattern" (`BehindTray`) folded at its foot.
    With a picture, a line says the card shows it in circles here;
  - the reward: as before, and "The count on the card" (`CountOnCard`).

  The trade's classic look is never written over a card from a look. A
  draft from before the looks walks the map as before.
- **The map** is `/onboarding/reward`: the card at full size, the reward
  said as a sentence under it, chips for the other parts, and one coral
  button. Its four parts, in the walk's order, are the business, the
  colours, the stamp and the reward. They open as trays over the card on a
  phone (Card Studio's `StudioTray`), each saying which part it is ("Part 2
  of 4"), and as tabs beside it in two columns. The card's own rows open what
  they show (the name the business, the stamps the stamp, the count the
  reward), and the open part is outlined on the card (`CardStage`). In two
  columns the walk's one button stands at the foot of the working column,
  held at the screen's foot while a long part scrolls under it, as Card
  Studio's Save bar is (Roee, 31 Oct 2026).
- **The walk** (`walk.ts`), guided and free to jump:
  - a first visit opens the business;
  - each part's "Next: …" opens the next part in order not yet opened,
    wrapping round, and any part opens at any time;
  - a part counts as opened as soon as it is on screen, however it got
    there, and is ticked on its chip, its tab or the reward sentence;
  - Save takes Next's place once all four have been opened, and a polite
    line says so, once.
- **The trays' addresses:**
  - Opening a tray from the map pushes its address, and closing goes back,
    so the phone's back gesture closes a tray and closing never stacks
    history. Switching from one tray to another (a chip, a place on the
    card, Next) takes the open one's place. A tray arrived at by its
    address has no map under it, so as it's left its entry becomes the
    map's and the next tray goes on top (`mapHistory.ts`): Back on a first
    walk closes a tray onto the map, never out of the wizard.
  - The reward tray has no route of its own: it is the map's history entry
    with `state.tray = "reward"`.
  - Arriving at `business`, `color`, `accent` or `stamp` directly (a first
    visit, a reload, the forward guard) opens the map with that tray open.
  - In two columns a tab replaces its address and never adds one.
  - All five addresses render the same `CardStep`, so the screen stays
    mounted across them.
- **The business** can't be left unfinished, by any way out (its Next, a
  chip, a place, a tab, closing, Escape, a drag, Save): it says which is
  missing, there, and takes focus to it. Back after emptying the name comes
  back to it saying so. While it is on screen the card wears the trade's
  first look the moment one is picked, and leaving it writes the name and
  that look into every field the owner hasn't chosen (`withTradeLook` in
  `looks.ts`), once, however it is left. A choice is never overwritten. A
  card still wearing some trade's untouched first look follows a change of
  trade, and so does a reward that is still a trade's own default. The
  defaults from before 29 Oct, with a number in them ("the tenth haircut
  free"), count as defaults too, and the map replaces one with the trade's
  own as the card first stands.
- **Save** writes down the card as shown (the colours, the stamp, the
  texture, the count, the reward trimmed). Nothing is disabled to mean "not
  yet". It checks the business first: a name over 120 characters opens the
  business on it.
- **The card** shows the draft until it is saved, then the published pass
  (wallet, billing) once it has synced and its pictures load.
- **A card from a look on the stage** (`CardStage`, brief §7.4) is the
  wallet's drawing of the draft, through the backend (`drawing.ts`): the
  strip, or Google's hero, staged as the pass's picture, with the frozen
  preview's own rows, so the name lands as typed. The last picture stays
  while the next is drawn, shown once decoded, and from 500 ms a tag under
  the stage says one is coming. When it can't be drawn, the stage shows the
  look as itself, in its own colours with the owner's name and reward, and
  says so ("too many in a short time" for a 429); the save goes on, since
  it sends the draft. A stamp that is a picture, which the drawing can't
  take, stands in the circles. The motion is step C's.

## The draft

- It lives in `localStorage` under `punchme.onboardingDraft`, written on
  every change. A picture lives separately under
  `punchme.onboardingDraft.art`, written only when the picture changes, and
  the logo under `punchme.onboardingDraft.logo`, the same way (card looks,
  brief §11).
- If storage fails, an in-memory copy stands in, and the wizard says so:
  - it writes and removes a key of its own, `punchme.onboardingStorageCheck`,
    as each screen opens, whenever a picture couldn't be kept, and with
    every change, so the warning goes with the first change kept once there
    is room again;
  - after every change, it reads the draft back against what was just
    written (`storageCheck.ts`).

  While storage refuses, the map and the saving screen say what a reload
  would lose. Another tab's changes are picked up. The draft belongs
  to the device, not the account, and `/login` reads it too.
- The shape is `v: 1` in `src/routes/onboarding/draft.ts`:
  - `name`, `niche`, `phone`;
  - `background`, `accent`, `foreground`;
  - `stamp`, which is a glyph or an image hash;
  - `pattern`, `stampsRequired`, `reward`;
  - `committed`, the save record;
  - `updatedAt`;
  - `seen`, the parts of the map opened so far, each once. Optional: a
    draft from before the map has none and reads as none opened, so its
    owner walks the four parts with their choices in place. Only the walk
    reads it; `commit.ts` never does, so it never reaches the server and
    the save's fingerprint doesn't change.
  - The card looks' fields (`docs/redesign/briefs/card-looks.md` §7.5),
    each optional and absent on a draft from before them, which reads as a
    classic card:
    - `look`, the catalog look the card started from;
    - `options`, the look's design options as the owner has them: `style`,
      `sticker`, `tint`, `wallpaper`, `stamps_place`, `stamps_format`,
      `logo_text`, each kept by its known values;
    - `panel`, the ground behind the stamps, and `label`, the label colour;
    - `logo`, the logo's hash.

    A card from a look writes them into its design; the fields stay the
    wizard's own, in the card's language (Roee, 6 Nov 2026). A classic card
    writes none of them, so its design and its save's fingerprint are as
    before.
- Anything that isn't `v: 1` is discarded. A bad field is dropped on its own,
  without throwing away the rest of the draft.
- It is cleared at exactly four points:
  1. "Keep the one I have", when the account already has a card, as the
     step is left for the dashboard
  2. Wallet "Skip for now", which then goes on to `billing`
  3. Billing "Activate", before the redirect
  4. Billing "Not now"
  Clearing takes the picture and the logo with the draft.
- `src/routes/onboarding/draft.test.ts` covers the model, and `walk.test.ts`
  the walk. Keep them passing. `draftLooks.test.ts`, beside them, covers the
  looks' fields.

## Calls before the account

| When | Call | Wrapper |
|---|---|---|
| Load, once per tab | `GET /api/presets` (public): the catalog's looks, a drawn one with its options and `pictures` | `getPresets` |
| Load, once per tab, given up after 4 s | `GET /api/stickers` (public): `{available, stickers: [{name, url}]}` | `getPublicStickers` |
| The look screen and the stage show a drawn look | `GET /api/presets/{id}/picture/{strip\|hero}?v=…`, as `<img>`, cached a day | – |
| The card from a look stands on the stage, and 400 ms after a change that alters its strip | `POST /api/presets/draw` (public): enumerated values only, for the wallet shown; a PNG. Each drawing once per tab; a 429 is said, never tried again by itself | `drawLook`, via `useLookDrawing` |

## Account step

The step shows one of five states, in this order of priority:

1. **This account is on another business's team** (the save found a
   business the account doesn't own). Said by the business's name, with
   "Use a different account" and "To the dashboard". Nothing is replaced,
   and the design stays on the device.
2. **This account already has a card.** Its name, reward and colour, from
   the template the save read, beside the card just designed; "Replace with
   my new design" or "Keep the one I have", with what keeping costs.
3. **Session loading.**
4. **Signed out**, and still this form while a new account saves its card:
   email and password, the sign-up/sign-in toggle, and the Google button.
5. **Signed in.** "Save the card", plus "Use a different account".

Saving is the pressed button, busy, in place, in whichever state started
it.

| When | Call | Wrapper |
|---|---|---|
| Sign up | `POST /api/auth/signup` | `signUpWithPassword` |
| Sign in | `POST /api/auth/login` | `signInWithPassword` |
| Google | `POST /api/auth/google` `{id_token}` | `signInWithGoogle` |
| Use a different account | `POST /api/auth/logout` `{refresh}` | via `AuthProvider.logout` |

- A 409 on sign-up switches to sign-in and keeps the email.
- A save that fails is said by its cause (`problems.ts`): no connection,
  the server, or too many tries; a refusal is placed on what was refused,
  the stamp's picture (`invalid_image`) or a name over 120 characters, with
  a way back to it, and any other refusal says the card wasn't accepted and
  the design is still here. Never the server's own words.
- There is no Apple button: `AppleAuthButton` returns nothing.

## Saving the card (`commit.ts`)

The save runs from a click only, never from an effect, and one at a time.

| When | Call | Wrapper |
|---|---|---|
| Always first | `GET /api/businesses/me` (only a 404 means "no business") | `getMyBusiness` |
| No business | `POST /api/businesses` `{name, niche, phone, timezone}` | `createBusiness` |
| That create failed | `GET /api/businesses/me` again, to adopt a business that was created anyway | `getMyBusiness` |
| Always | `GET {biz}/templates` | `listTemplates` |
| No matching card | `POST {biz}/templates` (the full template) | `createTemplate` |
| A card from a look with a logo on the device, after create | `POST {biz}/templates/{template_id}/images` multipart `use=logo` | `uploadTemplateImage` |
| Picture stamp, after create (and after the logo) | `POST {biz}/templates/{template_id}/images` multipart `use=stamp_art` | `uploadTemplateImage` |
| Card exists, name or trade changed | `PATCH {biz}` `{name, niche}` | `patchBusiness` |
| Card exists, design changed | `PATCH {biz}/templates/{template_id}` | `patchTemplate` |
| Card exists, a different logo | `POST {biz}/templates/{template_id}/images` `logo` | `uploadTemplateImage` |
| Card exists, a different picture | `POST {biz}/templates/{template_id}/images` `stamp_art` | `uploadTemplateImage` |

- It looks before it creates. A second business is a 500, not a 409.
- When nothing changed (same card, same fingerprint, same picture and logo
  hashes), it writes nothing.
- After Back-and-change it PATCHes instead of creating.
- It asks before overwriting a card the wizard didn't make.
- Progress is recorded in `draft.committed` after every write: the card as
  soon as it is created, then each picture as it uploads (the logo,
  `logoHash`, then the stamp's). A picture that didn't go is said as that
  picture's, and the next save uploads only what is left, onto the same
  card, with no PATCH when the card itself is as saved (card looks, step B).
- A logo the device no longer has is left out, and the card is saved
  without it. A refused logo (`invalid_image` on its upload) is placed on
  the logo, with a way back to the business.

## Wallet step

| When | Call | Wrapper |
|---|---|---|
| Load | `GET /api/businesses/me` (already cached by the save) | via `BusinessProvider` |
| Load | `GET {biz}/templates` | `listTemplates` |
| Every 3 s, also in a background tab, until the card has synced after the save | `GET {biz}/templates/{template_id}/design` | `getTemplateDesign` |
| Then, every 3 s until a pass URL appears | `POST {biz}/templates/{template_id}/preview`: the owner's own pass | `previewCard` |
| "Try again" after a failure | `PATCH {biz}/templates/{template_id}` `{}` | `patchTemplate` |

The step moves through these states, each said in one line:

- **Preparing.** "It usually takes about a minute".
- **Issuing.**
- **Ready.** On a phone, the button named by the phone's wallet; on a
  computer, the QR code first, with the link as a secondary.
- **Slow.** Sync over 3 minutes or issuing over 1 minute; the card is saved
  and waits on the dashboard too; offers "Check again".
- **Failed.** The card is saved; offers "Try again".
- **No connection.** The reads wait; the card is saved, and the step
  carries on by itself once the connection is back.
- **Couldn't read** the business or its card (a 500, no connection at
  load): said, with "Try again", which asks again.

There is one way on at a time: "Skip for now" while the pass isn't ready,
which clears the draft and goes to `billing`, and "Continue" once it is.

## Billing step

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/templates`, then `GET {biz}/templates/{template_id}/design`, for the card | `listTemplates`, `getTemplateDesign` |
| Activate | `POST /api/billing/checkout` `{business_id}`, then the browser goes to `checkout_url` | `createCheckoutSession` |

- The price is Billing's own sentence, `billing.price`, with
  `PUNCHME_MONTHLY_PRICE`: ₪99 a month, VAT included, the figure isolated
  left to right.
- What stays free is said in the wizard's own words
  (`onboarding.billing.stays`): Billing's English says "this dashboard".
- "Not now" goes to `/dashboard`, and the free way out stays on the same
  screen as Activate, right under it.
- A business that couldn't be read is said in place of the case, with "Try
  again".
- A checkout that doesn't start is said under Activate by its cause, focus
  kept on it.
- Coming back from checkout lands on `/billing/success` or `/billing/cancel`
  (see `docs/dashboard-routes.md`).

## Code other pages share

- `/login` and `/invite/:token` also use these:
  - `AuthFields` and `AuthAlternatives`
  - `useEmailPasswordAuth`
  - `LanguageSwitch`, in the wizard's own `TopBar`
- The public pages and the wizard stand on the same ground,
  `src/theme/usePublicGround.ts`, which `index.html`'s pre-paint script
  matches before the first paint.
- The card studio and the wizard share the card controls in
  `card-studio/controls` and its `StudioTray`. The reward field's two lines
  are the studio's too.
- The `/admin` catalog pages use `LookTile`, `presetLook`, `MAX_LOOKS` and
  `NICHES`.
- The wizard stands the card-studio Apple and Google previews on the kit's
  `WallpaperStage` (`CardStage.tsx`). Those previews are a spec match; see
  `docs/card-studio.md`.
- `src/routes/public/PassStage.tsx` uses `onboarding.preview.summary`, and
  the studio and the Overview's own pass use `onboarding.preview.wallets`.

## Accessibility in place

- The skip link goes to `#onboarding-step`. Each screen's `h1` takes focus
  when the screen appears, unless the map opens with a tray open, whose
  heading takes it instead; the page title changes per step, a tray by its
  own name.
- A tray's heading takes focus as it opens, however it was opened, and
  however it closes (a mouse drag included), focus goes back to what opened
  it. Its name is the part, then "Part 2 of 4", after a pause. In two
  columns, a field that goes with its panel (Enter in the name) hands focus
  to the tab now shown.
- The places on the card are pointer shortcuts, out of the Tab order and
  hidden from screen readers: the chips, the tabs, the reward sentence and
  each tray's Next are the controls. A tick is said after its part's name
  and a pause, in the word that agrees with it (in Hebrew נפתח, נפתחו,
  נפתחה; in English "opened").
- The account step moves focus with its states: the heading of "already
  has a card" and of a hire's account, the button that tries again after a
  failed save, the email after "Use a different account".
- Screen readers hear these announcements:
  - a card summary, debounced 1.2 s;
  - "Step n of 4: {stop}", as the stop changes;
  - "Every part is open. You can save the card.", once, as the walk ends;
  - the stamp count, through the kit's slider;
  - the wallet status (`role=status`) and errors (`role=alert`).
- Enter submits a step. In the business's name and in the reward field it
  goes on, as the tray's button does: to the next part, or saving. Every set
  of choices is a native radio group (one Tab stop, arrow keys). Places
  suggestions support the arrow keys, Enter and Escape.
- Every target is at least 44px, the wallet switch, "Use a different
  account" and "Skip for now" included.
- Reduced motion: the wallet's busy mark holds still, and the kit's own
  motion takes its gentler form.
- Email and password fields are forced left-to-right. The business name and
  the reward are `dir="auto"` once there is text.

Known gaps listed here on 8 Oct were all fixed in Phase 4: the stamp tabs
are gone, every target is 44px, the wallet switch is the kit's segmented
control, focus follows the account step's states, and nothing pulses or
grows on hover under reduced motion.

## Found while writing this

Fixed, except where it says otherwise.

- **Broken price on the billing step.** It showed a key that no longer
  existed. Fixed before Phase 4 (`b8bc369`); the step now reads Billing's
  `billing.price`.
- **A picture stamp can't be removed.** Once a picture is uploaded, saving
  again with a glyph leaves the picture on the card. Not fixed: there is no
  wrapper for deleting template images (backend PR #6). The stamp tray says
  so before a picture is chosen.
- **One failure path shows the wrong screen.** If `createTemplate` succeeds
  but its response is lost, the retry shows "This account already has a
  card". Not fixed: `commit.ts` is fixed during the redesign. Its sibling,
  a picture whose upload failed after the create, reached the same screen;
  since the card looks' step B the card is recorded as soon as it is
  created, and the retry uploads only the picture.
- **A saved logo can't be removed either** (card looks, step B), for the
  same reason as the picture stamp: taking the logo away after the save
  leaves the uploaded one on the card.
- **`OnboardingGate`'s comment was wrong.** It now says the gate asks for an
  account only.
- **A hire could land in the wizard** (found in Phase 2's check, 20 Oct).
  `/onboarding` now resumes a draft for the owner only; anyone else goes to
  `/dashboard`.
- **Places' suggestions in a tray** (found building the map, 31 Oct). Laid
  over the trades, they were cut off by the tray's own scroll box; they sit
  in the flow now, and the tray grows to hold them, up to half the screen.
  Checked with a stand-in list: no Maps key runs locally. A mouse press
  that takes focus from the name closes the list only once it lands.
- **"Keep the one I have" landed on the business** (found in step D's real
  checks, 31 Oct). It cleared the draft while the saving step stood, and
  the forward guard moved first. It clears the draft as the step is left.
- **A hire was offered "Replace"** over their employer's card on the saving
  step (step D). The step now says the account is on that business's team.
- **A business that couldn't be read was taken for none** on the wallet and
  going-live steps, which sent the owner back to save a saved card (step D).
- **Every refused save blamed the name** (step D): a refused picture read as
  a name problem. A refusal is placed by what was refused.
- **An empty catalog hid every trade** (step D), and the business could
  never be finished. All five show then.
- **Large text ran past a phone's screen** (found after step D, 31 Oct).
  Step D's check compared the page with a viewport the phone's zoom-out had
  already widened to fit it. At 200% text the English chips, "Use a
  different account", the email, the stamp tray's grids and the notices'
  buttons ran past a 320px screen; they wrap now, or keep their 100% sides
  (`src/components/onboarding/largeText.ts`), and nothing changes at 100%.
  "Skip for now" reached 4px past a phone's edge at 100%; its box now stops
  at the screen's. The reward sentence's words ran up to 37px out of their
  box at 200%: where its longest word can't stand between the gift and the
  pencil (or the tick), that mark goes under it, at the end, as in Card
  Studio.
- **Two columns left the step no room at 200% text** (found checking the
  buttons' words, 1 Nov). From 1024px the card's 22rem column grew with the
  text and took 704px, leaving the step 160px at 1024 and 236px at 1100;
  the billing step's words ran out of their boxes and its buttons crossed
  their outlines. Two columns now wait until the step has 30rem beside the
  card (above), and nothing moves at 100%.
