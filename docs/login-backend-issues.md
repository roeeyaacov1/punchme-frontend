# Login backend issues — needs backend engineer

Frontend context (investigated 2026-08-07, updated 2026-08-08): the login screen ([src/routes/auth/LoginPage.tsx](../src/routes/auth/LoginPage.tsx)) originally offered Google sign-in only. Two issues were reported; #1 is now done, #2 still needs backend attention.

## 1. Email/password login — DONE (2026-08-08)

Implemented end-to-end and verified in the browser (signup, duplicate-email rejection, wrong-password rejection, correct login all tested manually against the local backend):

- Backend (`punchme-backend`, `apps/accounts/`): added `POST /api/auth/signup` and `POST /api/auth/login`, reusing the existing `User` model (already `AbstractUser`-based with working `set_password`/`check_password`) and the existing `issue_token_pair` helper. New domain exceptions `EmailAlreadyRegistered` (409), `InvalidCredentials` (401), `InvalidPassword` (422, weak password per `AUTH_PASSWORD_VALIDATORS`), wired centrally in `config/api.py` matching the existing pattern. 40/40 accounts tests pass, 140/140 full suite passes, ruff clean.
- **Design decision made**: signup rejects if the email already has a `User` row, even one created via Google/Apple (`EmailAlreadyRegistered`). Unlike OAuth, password signup has no third-party proof of email ownership, so silently attaching a password to an existing account would let anyone claim it. A user who signs up with a password and *later* signs in with Google under the same email links correctly to the same account (verified by `test_password_signup_then_google_sign_in_links_same_user` in `apps/accounts/tests/test_services.py`) — that direction was already supported by the existing `get_or_create_user_from_identity` logic and needed no changes.
- Login on an OAuth-only account (no usable password) returns a distinct message ("This account signs in with Google or Apple...") rather than a generic invalid-credentials error.
- Frontend: `src/routes/auth/LoginPage.tsx` now has an email/password form with a sign-in/sign-up toggle, sitting above the existing Google button; `src/api/auth.ts` has `signUpWithPassword`/`signInWithPassword`; new i18n strings added in `en`/`he`.
- **Not done / explicitly out of scope**: no email verification (matches the app's existing trust model — Google/Apple also aren't independently re-verified beyond the provider's id_token — but for password signup this means anyone can register with an email they don't own; flag if that needs to change before this ships to real users), no "forgot password" flow, no in-app "add a password to my Google account" flow.

## 2. Google sign-in fails after picking an account ("Something went wrong signing in. Please try again.")

**Update 2026-08-08 — likely not a backend issue at all.** While working on item #1, I found an uncommitted change already sitting in `vite.config.ts` (not made by me — looks like it came from another session working on this same question) that pins the dev server to port 5173 with `strictPort: true`, with this comment:

> Pinned, and strict so we fail loudly instead of drifting to 5174 when 5173 is busy: `http://localhost:5173` is the origin registered as an Authorized JavaScript origin on the Google OAuth client, and Google blocks the sign-in button on any origin that isn't registered.

This lines up with what I saw independently: with multiple dev-server instances running against this repo (each `npm run dev` picks the next free port when 5173 is taken — I personally got bounced to 5174/5175/5176 a few times this session), it's very plausible the user's own dev server was, at some point, running on something other than 5173 — which would make the Google picker still appear (it's not gated at that point) but fail right after account selection, matching the exact symptom reported. That fix (pin to 5173, fail loudly instead of silently drifting) is already in place, uncommitted.

**Recommendation:** before assuming this needs backend work, verify: make sure only one `npm run dev` is running for this repo, confirm it's actually bound to `http://localhost:5173`, and retry Google sign-in. If it now works, the original bug was a dev-environment port collision, not a backend problem — no backend changes needed for this one. If it still fails on port 5173, the investigation below still applies.

**Frontend bug fixed:** `LoginPage.tsx`'s catch block was swallowing the real error and always showing the generic message, with nothing logged to the console. Fixed in this branch to log the caught error via `console.error` and to surface the backend's actual `detail` message when the failure is an `ApiError` (see `src/api/errors.ts`). This alone won't fix the underlying failure, but it means the real error will now be visible (browser console + on-screen message) next time it's reproduced.

**What we confirmed locally against the backend at `http://127.0.0.1:8000` (dev):**

- `OPTIONS /api/auth/google` (CORS preflight) — succeeds, `access-control-allow-origin: *`. CORS is not the problem.
- `POST /api/auth/google` with a syntactically invalid token — correctly returns `401` with a JSON body: `{"detail": "Invalid Google id_token: ..."}`. So the endpoint itself, and the frontend's error-parsing (`ApiError.fromResponse`), both work correctly for a token it can identify as bad.

**What we could not confirm:** the failure the user hits happens with a real, valid Google ID token (they get through Google's account picker successfully — so the Google Identity Services / client ID setup on the frontend is working). We couldn't reproduce that path from the frontend side since it requires a real Google account round-trip. Since the endpoint clearly returns structured 401s for bad tokens rather than crashing, this smells like a **token verification failure specific to real tokens** rather than a broken endpoint.

**Ask for the backend engineer:**

1. Check server logs for actual `POST /api/auth/google` requests around the time of a failed login — what status code and `detail` do they show?
2. Verify the backend's configured Google OAuth client ID (used to validate the token's `audience`) matches the frontend's `VITE_GOOGLE_CLIENT_ID` (`.env`). A mismatch here is the most common cause of "picker works, exchange fails."
3. Confirm the Google token verification library/method being used (e.g. `google-auth`'s `verify_oauth2_token`) and that it isn't rejecting on issuer, audience, or clock-skew grounds.
4. Double check this isn't environment-specific — i.e. that the client ID used in the currently deployed/tested frontend build matches whichever client ID the backend expects, especially if there are separate dev/staging/prod Google OAuth clients.
