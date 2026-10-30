# Onboarding: routes, draft and API calls

What the onboarding wizard has: every step, who can open it, what it
stores, and the API calls it makes. Written 8 Oct 2026 from `src/main.tsx`,
`src/routes/onboarding/` and `src/components/onboarding/`, as the input for
the redesign, and brought up to date by Phase 4's build (30 Oct 2026,
`docs/redesign/briefs/onboarding.md`). Like `docs/dashboard-routes.md`, it
says nothing about design on purpose.

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
  send an owner without one back to `account`.
- `/onboarding` itself shows nothing and redirects:
  - signed out, or signed in with no business → the first incomplete step;
  - signed in to a business they are not the owner of → `/dashboard` (a
    hire never resumes a draft left on the device);
  - the owner, with a saved card → `wallet`;
  - the owner, with a draft in progress → the first incomplete step;
  - the owner, with no draft → `/dashboard`.
- A step URL past the first incomplete step redirects back to it, so a link
  can't skip ahead. A picture stamp whose pixels are gone sends the owner
  back to `stamp`.
- Other ways in:
  - any signed-in user whose `GET /api/businesses/me` answers 404
    (`RequireBusiness`);
  - `/login` after sign-up, or after sign-in when a draft is in progress;
  - seven buttons on the landing page.

## The road and the steps

Eight routes, five stops. The road is the same five stops from the first
screen to the last, signed in or out (`road.ts`, `roadOf`): a look decides
nothing about it, and signing up adds no stops. A line under the top bar
says where the owner is and what comes next ("Step 2 of 5 · Next:
Saving") over a five-part rule. It is not a control: Back is each screen's
own.

| # | Route | Stop | Public | What it collects | Limits | Pressed on with it missing |
|---|---|---|---|---|---|---|
| 1 | `/onboarding/business` | 1, Your business | yes | Business name (Google Places suggestions when `VITE_GOOGLE_MAPS_API_KEY` is set, which also fills the phone) and trade: barber, café, personal trainer, therapist, other | Name at most 120 (the field holds it). Trades without a preset are hidden once presets load | Says which is missing, there, and takes focus to it |
| 2 | `/onboarding/color` | 2, a tray of the card | yes | Card colour: the trade's looks (colours only), 10 swatches, or one's own; the stamp colour; folded, the text colour | A card colour that leaves the stamp colour under 3:1 takes the first stamp colour that fits | – |
| 3 | `/onboarding/accent` | 2, the same tray, opened at the stamp colour | yes | As `color` | As `color` | – |
| 4 | `/onboarding/stamp` | 2, a tray of the card | yes | The stamp, either one of the 16 glyphs the wallet renderer knows (the trade's first) or a picture; plus a texture behind the stamps (none, waves, dots, stripes) | Picture: png, jpeg, webp, gif or bmp, up to 8 MB, cropped square in the browser to at most 512px | A lost picture is said here, by its cause |
| 5 | `/onboarding/reward` | 2, Your card | yes | Stamps to a reward and the reward text | 2–12 stamps; reward up to 200 characters, two lines that grow to three, never a line break | An empty reward opens the reward and says so under the field |
| 6 | `/onboarding/account` | 3, Saving | yes | Sign up or sign in, then save the card | See below | An empty email or password is said over the button |
| 7 | `/onboarding/wallet` | 4, In your wallet | gated | The owner adds their own pass to their wallet | – | – |
| 8 | `/onboarding/billing` | 5, Going live | gated | Activate (checkout) or "Not now" | – | – |

- **The card screen** is `/onboarding/reward`: the finished card, the
  reward said as a sentence under it, and "Save the card". Colours, the
  stamp and the reward open as trays over the card on a phone (Card
  Studio's `StudioTray`), and as tabs beside it from 1024px.
- **The trays' addresses:**
  - Opening a tray from the card screen pushes its address, and closing goes
    back, so the phone's back gesture closes a tray and closing never stacks
    history. Switching from one tray to another takes the open one's place.
  - The reward tray has no route of its own: it is the card screen's history
    entry with `state.tray = "reward"`.
  - Arriving at `color`, `accent` or `stamp` directly (a reload, the forward
    guard) opens the card screen with that tray open.
  - From 1024px a tab replaces its address and never adds one.
  - All four addresses render the same `CardStep`, so the screen stays
    mounted across them.
- **Answered in advance.** The business's Next writes the trade's first
  look into every field the owner hasn't chosen (`withTradeLook` in
  `looks.ts`), so the card screen opens on a finished card. A choice is
  never overwritten. A card still wearing some trade's untouched first look
  follows a change of trade, and so does a reward that is still a trade's
  own default.
- **The card screen's Save** writes down the card as shown (the colours,
  the stamp, the texture, the count, the reward trimmed). Nothing is
  disabled to mean "not yet".
- **The card** shows the draft until it is saved, then the published pass
  (wallet, billing) once it has synced and its pictures load.

## The draft

- It lives in `localStorage` under `punchme.onboardingDraft`, written on
  every change. A picture lives separately under
  `punchme.onboardingDraft.art`, written only when the picture changes.
- If storage fails, an in-memory copy stands in, and the wizard says so:
  - it writes and removes a key of its own, `punchme.onboardingStorageCheck`,
    as each screen opens and whenever a picture couldn't be kept;
  - after every change, it reads the draft back against what was just
    written (`storageCheck.ts`).

  While storage refuses, the business, card and saving screens say what a
  reload would lose. Another tab's changes are picked up. The draft belongs
  to the device, not the account, and `/login` reads it too.
- The shape is `v: 1` in `src/routes/onboarding/draft.ts`:
  - `name`, `niche`, `phone`;
  - `background`, `accent`, `foreground`;
  - `stamp`, which is a glyph or an image hash;
  - `pattern`, `stampsRequired`, `reward`;
  - `committed`, the save record;
  - `updatedAt`.
- Anything that isn't `v: 1` is discarded. A bad field is dropped on its own,
  without throwing away the rest of the draft.
- It is cleared at exactly four points:
  1. "Keep the one I have", when the account already has a card
  2. Wallet "Skip for now", which then goes on to `billing`
  3. Billing "Activate", before the redirect
  4. Billing "Not now"
- `src/routes/onboarding/draft.test.ts` covers the model. Keep it passing.

## Account step

The step shows one of four states, in this order of priority:

1. **This account already has a card.** Its name, reward and colour, from
   the template the save read, beside the card just designed; "Replace with
   my new design" or "Keep the one I have", with what keeping costs.
2. **Session loading.**
3. **Signed out**, and still this form while a new account saves its card:
   email and password, the sign-up/sign-in toggle, and the Google button.
4. **Signed in.** "Save the card", plus "Use a different account".

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
  the server, too many tries, or a refused name, with a way back to it.
  Never the server's own words.
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
| Picture stamp, after create | `POST {biz}/templates/{template_id}/images` multipart `use=stamp_art` | `uploadTemplateImage` |
| Card exists, name or trade changed | `PATCH {biz}` `{name, niche}` | `patchBusiness` |
| Card exists, design changed | `PATCH {biz}/templates/{template_id}` | `patchTemplate` |
| Card exists, a different picture | `POST {biz}/templates/{template_id}/images` `stamp_art` | `uploadTemplateImage` |

- It looks before it creates. A second business is a 500, not a 409.
- When nothing changed (same card, same fingerprint, same picture hash), it
  writes nothing.
- After Back-and-change it PATCHes instead of creating.
- It asks before overwriting a card the wizard didn't make.
- Progress is recorded in `draft.committed` after every write.

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

There is one way on at a time: "Skip for now" while the pass isn't ready,
which clears the draft and goes to `billing`, and "Continue" once it is.

## Billing step

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/templates`, then `GET {biz}/templates/{template_id}/design`, for the card | `listTemplates`, `getTemplateDesign` |
| Activate | `POST /api/billing/checkout` `{business_id}`, then the browser goes to `checkout_url` | `createCheckoutSession` |

- The price is Billing's own sentence, `billing.price`, with
  `PUNCHME_MONTHLY_PRICE`: ₪99 a month, VAT included.
- "Not now" goes to `/dashboard`, and the free way out stays on the same
  screen as Activate, right under it.
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
  when the screen appears, and the page title changes per step, a tray by
  its own name.
- A tray's heading takes focus as it opens, and however it closes, focus
  goes back to what opened it.
- The account step moves focus with its states: the heading of "already
  has a card", the button that tries again after a failed save, the email
  after "Use a different account".
- Screen readers hear these announcements:
  - a card summary, debounced 1.2 s;
  - "Step n of 5: {stop}", as the stop changes;
  - the stamp count, through the kit's slider;
  - the wallet status (`role=status`) and errors (`role=alert`).
- Enter submits a step, and in the reward field it saves the card. Every set
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
  card". Not fixed: `commit.ts` is fixed during the redesign.
- **`OnboardingGate`'s comment was wrong.** It now says the gate asks for an
  account only.
- **A hire could land in the wizard** (found in Phase 2's check, 20 Oct).
  `/onboarding` now resumes a draft for the owner only; anyone else goes to
  `/dashboard`.
