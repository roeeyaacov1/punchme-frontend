# Onboarding: routes, draft and API calls

What the onboarding wizard has today: every step, who can open it, what it
stores, and the API calls it makes. Written 8 Oct 2026 from `src/main.tsx`,
`src/routes/onboarding/` and `src/components/onboarding/`, as the input for
the redesign. Like `docs/dashboard-routes.md`, it says nothing about design
on purpose.

- `{biz}` stands for `/api/businesses/{business_id}`.
- The last column is the wrapper in `src/api/` (or the hook that calls it).
- **Load** means the call fires when the step opens. Any other row fires on
  the action it names.

## Access

- The owner designs the card first and makes an account last. Every step up
  to and including `account` is public.
- `wallet` and `billing` sit behind `OnboardingGate`, which sends a
  signed-out visitor to `/onboarding/account`, never to `/login`.
- `/onboarding` itself shows nothing and redirects:
  - signed out, or signed in with no business → the first incomplete step;
  - has a business and a saved card → `wallet`;
  - has a business and a draft in progress → the first incomplete step;
  - has a business and no draft → `/dashboard`.
- A step URL past the first incomplete step redirects back to it, so a link
  can't skip ahead. A picture stamp whose pixels are gone sends the owner
  back to `stamp`.
- Other ways in:
  - any signed-in user whose `GET /api/businesses/me` answers 404
    (`RequireBusiness`);
  - `/login` after sign-up, or after sign-in when a draft is in progress;
  - seven buttons on the landing page.

## The steps

| # | Route | Public | What it collects | Limits | Can block Next |
|---|---|---|---|---|---|
| 1 | `/onboarding/business` | yes | Business name (Google Places suggestions when `VITE_GOOGLE_MAPS_API_KEY` is set, which also fills the phone) and trade: barber, café, personal trainer, therapist, other | Trades without a preset are hidden once presets load | Empty name, no trade |
| 2 | `/onboarding/color` | yes | Card colour: up to 3 ready-made looks for the trade, 10 swatches, or a custom colour | A tapped look sets colours, glyph, texture and stamp count, never the reward, and skips to `reward` on this visit | No |
| 3 | `/onboarding/accent` | yes | Stamp colour (swatches related to the card colour, each at least 3:1). Under "Advanced": text colour (auto, white, black, custom) and a custom stamp colour | A stamp colour under 3:1 is dropped when the card colour changes | No |
| 4 | `/onboarding/stamp` | yes | The stamp, either one of the 16 glyphs the wallet renderer knows or a picture; plus a texture behind the stamps (none, waves, dots, stripes) | Picture: png, jpeg, webp, gif or bmp, up to 8 MB, cropped square in the browser to at most 512px | Picture lost after a reload |
| 5 | `/onboarding/reward` | yes | Stamps to a reward and the reward text | 2–12 stamps; reward up to 200 characters | Empty reward |
| 6 | `/onboarding/account` | yes | Sign up or sign in, then save the card | See below | – |
| 7 | `/onboarding/wallet` | gated | The owner adds their own pass to their wallet | – | – |
| 8 | `/onboarding/billing` | gated | Activate (checkout) or "Not now" | – | – |

- Every step after `business` arrives already answered with a default for
  the trade.
- Each step's Next stores the value on screen. A default never overwrites a
  choice.
- The progress row shows 6 dots while signed out on the design steps and 8
  otherwise. Only steps already passed can be jumped back to.
- The phone preview shows the card on every step. It shows the draft until
  the card is saved, then the published pass.

## The draft

- It lives in `localStorage` under `punchme.onboardingDraft`, written on
  every change. A picture lives separately under
  `punchme.onboardingDraft.art`, written only when the picture changes.
- If storage fails, an in-memory copy stands in. Another tab's changes are
  picked up. The draft belongs to the device, not the account, and `/login`
  reads it too.
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
  1. "Keep my current card"
  2. Wallet "Skip for now"
  3. Billing "Activate", before the redirect
  4. Billing "Not now"
- `src/routes/onboarding/draft.test.ts` covers the model. Keep it passing.

## Account step

The step shows one of five states, in this order of priority:

1. **Saving.** "Saving your card…".
2. **This account already has a card.** "Replace with my new design" or
   "Keep my current card".
3. **Session loading.**
4. **Signed in.** "Save my card", plus "Use a different account".
5. **Signed out.** Email and password, the sign-up/sign-in toggle, and the
   Google button.

| When | Call | Wrapper |
|---|---|---|
| Sign up | `POST /api/auth/signup` | `signUpWithPassword` |
| Sign in | `POST /api/auth/login` | `signInWithPassword` |
| Google | `POST /api/auth/google` `{id_token}` | `signInWithGoogle` |
| Use a different account | `POST /api/auth/logout` `{refresh}` | via `AuthProvider.logout` |

- A 409 on sign-up switches to sign-in and keeps the email.
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

The step moves through these states:

- **Preparing.** Shows "takes about a minute".
- **Issuing.**
- **Ready.** "Add to wallet", plus a QR code on desktop, "Continue", and
  "Skip for now".
- **Slow.** Sync over 3 minutes or issuing over 1 minute; offers "Check
  again" and "Continue".
- **Failed.** Offers "Try again".

## Billing step

| When | Call | Wrapper |
|---|---|---|
| Load | `GET {biz}/templates`, then `GET {biz}/templates/{template_id}/design`, for the phone | `listTemplates`, `getTemplateDesign` |
| Activate | `POST /api/billing/checkout` `{business_id}`, then the browser goes to `checkout_url` | `createCheckoutSession` |

- "Not now" goes to `/dashboard`, and the free way out stays on the same
  screen as Activate.
- Coming back from checkout lands on `/billing/success` or `/billing/cancel`
  (see `docs/dashboard-routes.md`).

## Code other pages share

- `/login` and `/invite/:token` also use these:
  - `StepShell` and `TopBar`
  - `AuthFields` and `AuthAlternatives`
  - `useEmailPasswordAuth`
- The card-studio `CardStudio` (the `/dashboard/design` editor) uses
  `ChoiceGrid`.
- The `/admin` catalog pages use `LookTile`, `presetLook`, `MAX_LOOKS` and
  `NICHES`.
- `PhoneFrame` stages the card-studio Apple and Google previews. Those
  previews are a spec match; see `docs/card-studio.md`.
- `src/routes/public/PassStage.tsx` uses `onboarding.preview.summary`.

## Accessibility in place

- The skip link goes to `#onboarding-step`. Each step's `h1` takes focus when
  the step appears, and the page title changes per step.
- Screen readers hear these announcements:
  - a card summary, debounced 1.2 s;
  - "Step n of total";
  - the reward slider value, debounced 0.5 s;
  - the wallet status (`role=status`) and errors (`role=alert`).
- Enter submits a step. Every set of choices is a native radio group (one
  Tab stop, arrow keys). Places suggestions support the arrow keys, Enter and
  Escape.
- Touch targets are 44px. The progress dots get theirs from an invisible hit
  area.
- Reduced motion turns off the progress pill, the phone height animation and
  the screen "wake".
- Email and password fields and the Google button are forced left-to-right.
  The reward field is `dir="auto"`.

Known gaps, for the rework to fix:

- The stamp tabs are 40px and have no arrow keys.
- "Use a different account" and "Skip for now" have no minimum height.
- The phone's wallet switch shrinks to 24px on short screens.
- Focus doesn't move when the account step changes state.
- Some things still animate under reduced motion: the wallet status pulse,
  and the hover zoom on choice cells and progress dots.

## Found while writing this (not fixed)

- **Broken price on the billing step.** `BillingStep.tsx:110` shows
  `t("landing.pricing.price")`, a key that no longer exists in either
  language, so the price reads as the raw key.
- **A picture stamp can't be removed.** Once a picture is uploaded, saving
  again with a glyph leaves the picture on the card. There is no wrapper for
  deleting template images.
- **One failure path shows the wrong screen.** If `createTemplate` succeeds
  but its response is lost, the retry shows "You already have a card".
- **`OnboardingGate`'s comment is wrong.** It says the gate requires a
  business, but it only checks for an account. The wallet and billing steps
  check for the business themselves.
