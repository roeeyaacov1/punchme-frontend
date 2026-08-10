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

## 3. `POST /api/auth/login` appears to accept any password (reported 2026-08-10)

**Reported symptom:** sign up, sign out from the dashboard, then sign in again — "it works for every user and password, and it signs me in as the user I logged out from."

That symptom turned out to be two separate bugs. The second half was ours and is fixed; the first half is server-side.

**Fixed on the frontend (this change):** the React Query cache was never cleared on sign-out or sign-in, so a new session started holding the previous owner's cached data. Reproduced end-to-end: owner A signs in, signs out, then owner D — a *different, valid* account that owns no Business at all — signs in and lands on **A's dashboard**. `["business","me"]` was still inside its 30s `staleTime`, so it was served straight from cache with no refetch, `RequireBusiness` accepted it, and `DashboardOverview` then requested `/api/businesses/{A's id}/templates` using D's bearer token. Both `login()` and `logout()` in `src/auth/AuthProvider.tsx` now call `queryClient.clear()`. Also fixed alongside it: a token refresh in flight during sign-out could land afterwards and put a live access token for the old user back into the store (`src/api/client.ts`). Regression tests in `src/api/client.test.ts`.

**Still needs the backend:** the "any password is accepted" half could not be reproduced against a correct server. Running the real frontend against a mock backend that rejects bad credentials with `401`, a wrong password and an unknown email both correctly show "Invalid email or password." and leave the user signed out. The frontend cannot manufacture a session on its own here — `signInWithPassword` posts the typed email/password to `/api/auth/login` with `{ auth: false }`, which means no `Authorization` header and no 401-refresh-retry (`src/api/client.ts`), and the request is cross-origin with fetch's default `credentials: "same-origin"`, so no Django session cookie is sent either. If the app signs in, the backend returned `200` with a token pair.

**Decisive test** (backend running, no frontend involved) — sign up a user, then log in with a deliberately wrong password:

```bash
curl -s -X POST http://127.0.0.1:8000/api/auth/login -H 'Content-Type: application/json' -d '{"email":"<a real account>","password":"definitely-not-the-password"}' -w '\nHTTP %{http_code}\n'
```

`401` means the backend is fine and the reported symptom was entirely the cache bug above. Anything `2xx` is the bug — a token pair is being issued for a wrong password.

**Where to look in `apps/accounts/`:** the classic shape is a `check_password` whose return value is never branched on (`user.check_password(data.password)` on its own line, then `issue_token_pair(user)` unconditionally), or an `authenticate()` result that is only checked for `None` after a fallback lookup has already selected the user. Note this contradicts the wrong-password rejection recorded as tested under item #1 above, so it is worth checking whether that behaviour regressed after that work landed.
