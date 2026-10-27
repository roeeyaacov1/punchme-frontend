# Public pages and sign-in: routes and API calls

What the pages outside the dashboard and the wizard have today: who can open
each one, what it shows, the API calls it makes, and what has to survive the
rework. Written 27 Oct 2026 from `src/main.tsx` and the code it imports, as
the input for Phase 8. Like `docs/dashboard-routes.md`, it says nothing about
design on purpose.

- The last column is the wrapper in `src/api/` (or the code that calls it).
- **Load** means the call fires when the page opens. Any other row fires on
  the action it names.
- `auth: false` means the call never sends the session's token and never
  refreshes it. Every other call sends the token when there is one.

## Access

- All five routes are children of `RootLayout`, outside `ProtectedRoute`,
  `BusinessProvider` and `RequireBusiness`. Anyone can open any of them, and
  none of them sends a signed-out visitor anywhere.
- Three of them read the session: `/login` (a signed-in visitor is sent
  on), `/invite/:token` (it chooses between "Join" and the sign-in form) and
  `/p/:token` (a signed-in member of the card's business gets the stamp
  screen).
- A first visit opens in the browser's language, Hebrew otherwise
  (`languageFromBrowser`). Only `/login` and `/invite/:token` have a language
  switch, in `TopBar`. `/join`, `/c` and `/p` have none.
- None of the five sets `document.title`: every one is "PunchMe — Digital
  Loyalty Cards", from `index.html`.
- All five are light pages (the guide's D8). Today they wear the old
  `.theme-purple .theme-raised` scope, not `.theme-lightbox`.

## Every page

| When | Call | Wrapper |
|---|---|---|
| App start | `GET /api/auth/me` | `getCurrentUser`, in `AuthProvider` |
| A 401 on any call that isn't `auth: false`, when a refresh token is stored | `POST /api/auth/refresh` `{refresh}`, then the call is retried once | `apiFetch` |

- If the start-up check fails for any reason (a 429 included), `AuthProvider`
  clears the stored session. The API allows 30 anonymous requests a minute
  per address, and every cold load spends one or two on this check.

## Sign-in

### `/login`: Sign in and sign up

**Who.** Anyone. A signed-in visitor never sees the form: they go to the page
that sent them (`state.from`) or, with none, to `/onboarding` when this
device holds a card draft in progress (`hasDraftInProgress(loadDraft())`)
and to `/dashboard` otherwise. A cold load with a stored refresh token
shows "Loading..." until the start-up check answers.

**Ways in.** `ProtectedRoute` (with `from`), sign-out in the dashboard, the
landing page's header and footer, the wizard's `TopBar` while signed out,
and "Sign in to add a stamp" on `/p/:token` (with `from` set to that page).

**What it shows.** `TopBar` (the logo home, the language switch), then one
panel holding `StepShell`: the title and subtitle ("Welcome back" or "Create
your account"), `AuthFields` (email and password, both left to right), the
submit button, an error line, and `AuthAlternatives` (the sign-in/sign-up
toggle, "or", the Google button). Under it, "New here? Design your card
first — it's free", a link to `/onboarding`.

| When | Call | Wrapper |
|---|---|---|
| Sign in | `POST /api/auth/login` `{email, password}`, `auth: false` | `signInWithPassword` |
| Sign up | `POST /api/auth/signup` `{email, password}`, `auth: false` | `signUpWithPassword` |
| Google | `POST /api/auth/google` `{id_token}`, `auth: false` | `signInWithGoogle` |

- All three are throttled at 10 a minute per address.
- On success, `login()` clears the query cache and stores the tokens, then
  the page goes to `from`, or to `/onboarding` after a sign-up, or as above
  after a sign-in.
- Errors, read in `useEmailPasswordAuth`:
  - 409 on sign-up switches the form to sign-in, keeps the email and says
    the address is registered;
  - 429 says to wait;
  - 401 and 422 show the server's own message;
  - an unreachable API (a `TypeError`) says so;
  - anything else is the generic line for the mode.
- The Google button is drawn by Google (`src/auth/providers/GoogleAuthButton`):
  the script `https://accounts.google.com/gsi/client`, FedCM, an outline
  pill 320px wide. It renders only when `VITE_GOOGLE_CLIENT_ID` is set, and
  Google accepts only the registered origin (`http://localhost:5173` in
  development). It is mounted again when the language or the mode changes,
  to relabel it. There is no Apple button.

**Must survive.**

- The redirects: `from` first, the draft check, sign-up to `/onboarding`.
- The cold-load wait only when a refresh token is stored, so a stopped
  backend never holds the form back.
- One reading per failure: the 409 switch that keeps the email, the
  throttle, the unreachable API, and wrong details told apart from a weak
  password. Which words say them is open: today 401 and 422 show the
  server's English (below, "Found while writing this").
- Email and password fields left to right, with the right `autoComplete`
  (`current-password`, `new-password`) and `minLength` 8 on sign-up.
- The Google button, re-mounted per language and mode. (Its box is forced
  left to right today, which reverses a Hebrew label; that box is not a
  thing to keep.)
- The link to `/onboarding`: new owners design first.
- The heading takes focus when the form mounts (`StepShell`).

### `/invite/:token`: Accept a team invitation

**Who.** Anyone holding the link. The owner copies it on `/dashboard/team`
(`inviteUrl(accept_path)`) and sends it, usually by WhatsApp; nothing is
emailed. The preview is public, so the page says whose shop and which role
before it asks for anything. Accepting needs an account, and the page signs
the invitee in on the spot rather than at `/login`, so the invitation stays
on screen.

**What it shows**, in this order of priority:

1. **Loading** (the preview or the session): "Loading...".
2. **Unknown link** (any error on the preview): "This link doesn't work" and
   "We don't recognise it".
3. **Not pending** (`status` is `revoked`, `expired` or `accepted`): the
   same title with that status's sentence.
4. **Signed in**: "{business} wants you on the team", "As {role}.", "Signed
   in as {email}.", what the role can do (`team.roleBody.*`), and "Join".
5. **Signed out**: the same title, "As {role}. Sign in, or make an account,
   to join.", the invited address masked (when the invitation names one),
   what the role can do, `AuthFields` starting in sign-up mode, "Create
   account and join" or "Sign in and join", and `AuthAlternatives`.

| When | Call | Wrapper |
|---|---|---|
| Load | `GET /api/invitations/{token}`, `auth: false`: business name, role, status, expiry, masked email | `getInvitationPreview` |
| Join (signed in) | `POST /api/invitations/{token}/accept` | `acceptInvitation` |
| Sign up, sign in or Google (signed out) | The `/login` calls above, then `POST /api/invitations/{token}/accept` | `useEmailPasswordAuth`, then `acceptInvitation` |

- The preview is throttled at 20 a minute, in its own bucket.
- After accepting, the page invalidates `["business","me"]` and goes to
  `/dashboard`, replacing the history entry.
- Accept errors: `invitation_email_mismatch` (signed in with another
  address), `already_a_member`, `invitation_unusable` with its `reason`
  (`invite.dead.{reason}`); any other API error shows its message.

**Must survive.**

- Whose shop and which role, said before any field.
- The masked address, which stops someone signing up with the wrong account.
- Sign-in on the page itself, then accept in the same step.
- The cache invalidation before going to `/dashboard`, without which a
  cached 404 sends the new member into the wizard.
- The dead-link states, each with its own sentence.

## The customer's pages

### `/join/:templateId`: Join a shop's card

**Who.** Anyone. The standee's QR, the Overview's QR and its copy-link
(`enrollUrl`), and "Get your own card" on `/p/:token` (`join_path`) all lead
here. The page knows only the design id from the URL: **it makes no call on
load**, so nothing on it names the shop, the card or the reward until the
customer has joined. No endpoint gives a template's public face by its id.

**Steps.** Details, then a code (only when `VITE_OTP_REQUIRED` isn't
`"false"`), then the card. Or one of two dead ends, "not found" and "not
taking customers".

- **Details.** "Join this loyalty card"; name (optional, cased on the way out
  of the field); mobile number (required, left to right, `inputMode="tel"`);
  birthday (optional, a date field with its hint); the marketing consent, a
  separate box that starts unticked; the privacy notice as a
  `<details>` line that opens the full text; and the submit button, "Send SMS
  verification code", or "Add to my wallet" when there is no code step.
- **Code.** "Enter the verification code", "We sent a 6-digit code to
  {phone}", the code field (digits only, six at most, left to right,
  `autoComplete="one-time-code"`), "Verify & join" (disabled until six
  digits), "Edit number", and "Send a new code" behind a 60-second countdown
  that stays readable while it counts.
- **The card.** "You're in at {business}", "Your card is ready! Add it to
  your wallet", the pass in `PassStage`, the add-to-wallet link
  (`WalletAddButtons`), "No need to wait — staff can scan the code above"
  while there is no link yet, and "Your card", a link to `/c/{serial}`.
- **Not found**: "This loyalty card isn't available anymore". **Not taking
  customers**: "This business isn't accepting new customers right now".

| When | Call | Wrapper |
|---|---|---|
| Submit details, with a code step | `POST /api/join/{templateId}/otp` `{phone}`, `auth: false`; always 204 | `requestJoinOtp` |
| Submit details without a code step, or submit the code | `POST /api/enroll/{templateId}` `{phone, display_name?, birthday?, marketing_opt_in, otp_code?}`, `auth: false` | `enroll` |
| After joining | `GET /api/cards/{serial}`, `auth: false`: the card's public face | `getPublicCard` |
| While `wallet_issue_pending` | `GET /api/cards/{serial}` every 3 s until `wallet_pass_url` appears | `getPublicCard` |
| "Send a new code", after 60 s | `POST /api/join/{templateId}/otp` | `requestJoinOtp` |
| The pass's pictures | `GET /api/cards/{serial}/art/{slot}` and the logo URLs, each probed with an `Image` before use | `usePublicCardPreview` (no wrapper) |

- The phone is checked in the browser first (`isLikelyIlPhone`); the API is
  the real check.
- Error codes: 404 (not found), `otp_throttled`, `invalid_phone`,
  `otp_invalid`, `upgrade_required` (a Free shop), anything else the
  generic line.
- Throttles: the code 10 a minute, the join 5, the card 30, the art 60.
- The join is idempotent per phone and design: a returning customer gets
  their own card back, and a blank optional field never overwrites what the
  shop already has.
- After joining, the page remembers the card in this browser
  (`rememberHeldCard`, `punchme.heldCards` in localStorage), so `/p/:token`
  can greet its holder.

**Must survive.**

- The privacy notice under the Privacy Protection Law (s.11), with its full
  text one tap away, and the marketing consent as its own unticked box
  (Spam Law). Both in both languages, from the same keys.
- The Israeli-number check before any request, and no code requested when
  the code step is off (each request spends the phone's hourly allowance).
- The name cased on the way out of the field, so the customer sees what the
  pass will say.
- Phone, birthday and code left to right inside Hebrew; the code field's
  `one-time-code` and numeric keyboard.
- The resend countdown, readable while disabled.
- The pass staged by `PassStage` and never redrawn; its barcode is real, so
  the screen works as a pass before the wallet has it.
- The polling until the wallet link exists, and the link to `/c/{serial}`.
- `rememberHeldCard` after a join.

### `/c/:serial`: A customer's own card

**Who.** Anyone with the serial: "Your card" under the join screen and
"Open your card" on `/p/:token` lead here. The scanner also accepts this URL
as a card code.

**What it shows.** "Your card", the pass in `PassStage`, and the
add-to-wallet link, or the waiting note while the pass is being issued.
Loading is "Loading..."; any error is "This loyalty card isn't available
anymore".

| When | Call | Wrapper |
|---|---|---|
| Load | `GET /api/cards/{serial}`, `auth: false` | `getPublicCard` |
| Load | The pass's pictures, probed as on `/join` | `usePublicCardPreview` |

- After loading, it remembers the card in this browser (`rememberHeldCard`).
- Unlike `/join`, it does not poll: a pending pass keeps its waiting note
  until the page is opened again.

**Must survive.**

- The real card, never a mock: this is the page for someone who can't find
  their pass.
- The add-to-wallet link that adds this same card again.
- `rememberHeldCard` on load.

### `/p/:token`: The page behind the wallet QR

**Who.** Anyone. With `WALLET_BARCODE_PUBLIC_URL` on, an issued pass's QR
encodes this URL (`barcode_message`), so a phone camera opens it; the
counter's scanner unwraps it to the token. The server decides what the page
is from the session and the shop's referral program, so the request waits
for the start-up check to finish. One more case the server can't see is
decided in the browser: the card's own holder.

| When | Call | Wrapper |
|---|---|---|
| Load, once the session is known | `GET /api/p/{token}?device={id}`, with the session's token when there is one | `getPublicCardPage` |

- `device` is this browser's random id (`currentDeviceId`,
  `punchme.deviceId`), absent where storage is refused.
- Throttled at 60 a minute per address and per token. 404 for a token no
  live card carries.
- The query key holds `isAuthenticated`, so signing in changes the answer.

The page is one of four, in this order:

**1. The stamp screen** (`view: "stamp"`): the visitor is signed in as a
member of the card's business, any role. It shows "{business} · {card}",
"Add a stamp to {name}'s card" ("this customer" with no name), "This is
your own preview card" on the owner's demo pass, the count "n / m" set left
to right, the latest answer, and one button: "Add a stamp", or on a full
card the reward and "Reward handed over — start the card again". Under it,
"Open the scanner instead", a link to `/dashboard/scan`.

| When | Call | Wrapper |
|---|---|---|
| Add a stamp | `POST /api/scan` `{serial: token}` | `scanCode` |
| Hand over the reward | `POST /api/cards/{token}/redeem` | `redeemCard` |
| After either | `GET /api/p/{token}` again (the query is invalidated) | `getPublicCardPage` |

- Answers (`role="status"`): stamped; the last stamp, reward ready;
  redeemed; 429 stamped a moment ago; 409 already full; 404 not yours to
  stamp; anything else the server's message, or "Couldn't reach the server"
  when there was no answer (`classifyScanError`).
- `/api/scan` is throttled at 60 a minute per person, on top of the card's
  45-second cooldown.

**2. Your card** (this browser holds the card, from `heldCardSerial`, and
the view isn't the stamp screen): "{business} · {card}", "This is your
card", "Friends who scan it get a card of their own here" while the program
is on, and "Open your card", a link to `/c/{serial}`. No call beyond the
load.

**3. The friend's join** (`view: "join"`, the shop's referral program on,
`ReferralJoin.tsx`): "{name} invited you" (the first name or its initial,
as the owner chose) or "You've been invited to join", the reward line, then
the same fields, legal text, code step and card as `/join`, from the same
keys. Whether there is a code step comes from the page's own `otp_required`,
not from the build. An existing customer gets "You already have a card
here — here it is". `referral_status` is never shown.

| When | Call | Wrapper |
|---|---|---|
| Submit details, with a code step | `POST /api/p/{token}/otp` `{phone}`, `auth: false` | `requestReferralOtp` |
| Join | `POST /api/p/{token}/join` `{phone, otp_code, display_name, birthday?, marketing_opt_in, device_id?}`, `auth: false` | `referralJoin` |
| After joining | `GET /api/cards/{serial}` | `getPublicCard` |
| While `wallet_issue_pending` | `GET /api/cards/{serial}` every 3 s | `getPublicCard` |

- Opening this view records a click against the member's card and fires the
  program's `scanned` rule, so every load is an event in the shop's data.
- Throttles: the code 10 a minute, the join 5.

**4. The card's face** (`view: "card"`, the program off): "PunchMe loyalty
card", a block in the card's own colours with the business and card names,
"Collect {n} stamps and get: {reward}", "Get your own card" (a link to
`join_path`, `/join/{template_id}`), and then either "Working at {business}?
Sign in to add a stamp" (to `/login`, coming back here) or, signed in to
another shop, "You're signed in, but this card isn't from your shop."

Not found: "This card can't be found. It may have been removed, or the link
is wrong." Any other failure: "Something went wrong loading this card. Try
again."

**Must survive.**

- The server's choice of view, and the request waiting for the session.
- The holder check in the browser, which never overrides the stamp screen.
- The stamp screen's one button, its answers in words, the count left to
  right, and the way to the full scanner.
- The friend's join: the same legal text and consent as `/join`, the code
  step from `otp_required`, the device id sent with the join,
  `rememberHeldCard` after it, and `referral_status` kept off the screen.
- The card's face: nothing about the holder, the sign-in link coming back
  here.

## Calls Phase 8 adds

Approved by Roee on 27 Oct 2026, in Phase 8's step A
(`docs/redesign/briefs/public.md` §6). Every other row above stays as it is.

| Page | When | Call | Wrapper |
|---|---|---|---|
| `/join/:templateId` | Load, once the backend has it | The design's public face, by its id: the shop, the card, stamps, reward, colours, logo, and whether the shop takes new customers (proposed: `GET /api/join/{templateId}`) | New, in `src/api/loyalty.ts`, written with the backend's endpoint |
| `/p/:token` | Load, its existing call | `GET /api/p/{token}` gains the same "takes new customers" flag, once the backend has it | `getPublicCardPage` |
| `/invite/:token` | "לא אתם? כניסה עם חשבון אחר" | `POST /api/auth/logout` `{refresh}`, `auth: false` | `revokeRefreshToken`, through `AuthProvider.logout` |
| `/c/:serial` | While `wallet_issue_pending`, every 3 s for up to three minutes | `GET /api/cards/{serial}` again | `getPublicCard` |

## Code these pages share

| Piece | Where | Also used by |
|---|---|---|
| `StepShell` | `src/components/onboarding/StepShell.tsx` | All eight onboarding steps |
| `TopBar` | `src/components/onboarding/TopBar.tsx` | `OnboardingLayout` (with "Sign in" while signed out) |
| `AuthFields`, `AuthAlternatives` | `src/components/auth/AuthFormParts.tsx` | Onboarding's account step |
| `useEmailPasswordAuth` | `src/components/auth/useEmailPasswordAuth.ts` | Onboarding's account step |
| `GoogleAuthButton` | `src/auth/providers/` (frozen: `src/auth`) | Through `AuthAlternatives` |
| `PassStage`, `publicCard.ts` | `src/routes/public/` | `/join`, `/c`, the friend's join |
| `AppleCardPreview`, `GoogleCardPreview`, `CardPreviewValue` | `src/components/card-studio/CardPreviews.tsx` (frozen pass previews; Phase 3's folder) | Imported by `PassStage` and `publicCard.ts` |
| `WalletAddButtons` | `src/components/wallet-actions/` | `/dashboard/design` (Phase 3's page) |
| `Input` (old) | `src/components/ui` | Much of the old app |
| `ctaClasses`, `Eyebrow`, `focusRing` | `src/components/marketing/primitives.tsx` | The landing page |
| `heldCards`, `deviceId`, `phone`, `name`, `scan`, `env` | `src/lib` (shared; read only) | The dashboard's Scan uses `scan` |

- Copy lives under `auth`, `invite`, `enroll`, `publicCard` and `wallet`,
  plus `team.role.*`, `team.roleBody.*`, `onboarding.account.alreadyRegistered`,
  `onboarding.account.throttled` and `onboarding.preview.summary`.
- `PassStage` picks the preview by device: Google on Android, Apple
  otherwise, with no switch. The pass is hidden from screen readers and
  summarised in one sentence.

## Accessibility in place

- `/login` and `/invite`: `StepShell`'s heading takes focus when it mounts;
  errors are `role="alert"`; the email and password fields are left to
  right; Enter submits.
- `/join` and the friend's join: labelled fields; phone, birthday and code
  left to right; 44px text links ("Edit number", "Send a new code", "Your
  card"); the countdown at full strength while disabled.
- `/p/:token`: the count left to right inside Hebrew; the stamp screen's
  answer is `role="status"`.
- The pass is `aria-hidden` with a sentence for screen readers.

Known gaps:

- The fields' edges and focus rings are under the 3:1 a control needs:
  `components/ui`'s `Input` on the joins (edge 1.38:1, ring 1.99:1) and
  `AuthFields` on `/login` and `/invite` (edge 1.57:1).
- After a submit, a join or a stamp, focus falls to `<body>`: the buttons
  disable while they work.
- None of the five has a skip link, though the wizard and the dashboard do.
- No page title of its own.
- The marketing-consent checkbox is the browser's default box, about 13px.
- The loading lines on `/invite`, `/c` and `/p` and the wallet's waiting
  note are set in IBM Plex Mono, which has no Hebrew, so Hebrew falls back
  to a system face. The waiting note pulses, under reduced motion too.
- Under reduced motion the pass's arrival (`animate-scale-in`) is switched
  off rather than made gentler.
- Errors on `/join` are plain text under the form, not tied to a field and
  not announced.

## Found while writing this (not fixed)

- **A Free shop's `/join` says "Something went wrong" when the code step is
  on.** `POST /api/join/{id}/otp` refuses a Free shop with no cards with
  403 `upgrade_required`, and `JoinPage`'s `submitDetails` maps only 404,
  `otp_throttled` and `invalid_phone`, so it shows the generic error. The
  friend's join maps it. Without a code step (local development today) the
  enroll call maps it correctly, which hides the bug.
- **Someone else's name on the customer's own pass.** The pass previews
  print a sample name, "דנה לוי", whenever they get no holder name.
  `/c/:serial` never has one (the public card carries no personal data),
  and `/join` has one only when the customer typed a name, which is
  optional.
- **`/c/:serial` doesn't poll** a pass still being issued, while `/join`
  does: the waiting note stays until the page is opened again.
- **A signed-in invitee on the wrong account** can only press "Join" and be
  refused; the page has no way to sign out or switch accounts.
- **`/p/:token`'s failure line says "Try again"** with nothing to press.
- **English inside the Hebrew sign-in.** `useEmailPasswordAuth` shows the
  server's own `detail` for 401 and 422, and the backend writes it in
  English ("Invalid email or password", "This account signs in with Google
  or Apple. Use that option instead.", and Django's password rules), so a
  wrong password on the Hebrew `/login`, `/invite` or the wizard's account
  step is answered in English. The stamp screen does the same for any
  failure it doesn't name ("Internal server error").
- **A Free shop's card face offers a join the API refuses.** "Get your own
  card" leads to `/join`, which says "not taking customers" only after the
  customer has typed a number.
- **Staff signed out get no way to the stamp screen.** With the program on,
  a staff member who scans a pass from a browser that isn't signed in (an
  iPhone keeps an installed app's session apart from Safari's) gets the
  friend's join, with no sign-in door, and the load records a referral
  click.
- **The owner's demo card tells every member** "This is your own preview
  card", staff included.
- **The real pass prints "Member", in English,** for a customer who gave no
  name (`punchme-backend` `apps/wallet/providers.py:499`), where the preview
  prints the sample "דנה לוי". Neither is right on a Hebrew card.
