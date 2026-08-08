# Login backend issues — needs backend engineer

Frontend context (investigated 2026-08-07): the login screen ([src/routes/auth/LoginPage.tsx](../src/routes/auth/LoginPage.tsx)) currently offers Google sign-in only. Two issues reported by the user; both need backend changes.

## 1. Email/password login doesn't exist yet (backend gap)

There is no password-based login. Confirmed by the generated OpenAPI schema (`src/api/generated/schema.d.ts`, regenerated from `http://127.0.0.1:8000/api/openapi.json`) — the only auth endpoints exposed are:

- `POST /api/auth/google`
- `POST /api/auth/apple`
- `POST /api/auth/refresh`
- `GET /api/auth/me`

There's no `/api/auth/register`, `/api/auth/login`, or any password field on the user model as far as the API surface shows. To support "email + password as an alternative to Google", the backend needs:

- A registration endpoint (email + password → create account, presumably with email verification).
- A login endpoint (email + password → token pair, matching the shape of `TokenPairOut` used by `/api/auth/google`).
- A decision on how this interacts with existing Google-only accounts: can a user who signed up via Google also set a password later? Can an email collide between a Google account and a manually-registered one? This needs a product/backend decision, not just an endpoint.

Once the backend exposes this, the frontend work is small: add a form to `LoginPage.tsx`, a `signInWithPassword`/`register` function in `src/api/auth.ts`, regenerate `src/api/generated/schema.d.ts` via `npm run gen:api`, and add new i18n strings.

## 2. Google sign-in fails after picking an account ("Something went wrong signing in. Please try again.")

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
