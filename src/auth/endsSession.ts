import { ApiError } from "../api/errors";

/**
 * Whether a failure means the session is over.
 *
 * Only the server can say so, and it says it with a 401: from
 * `/api/auth/refresh`, which refuses a token that has expired, is malformed
 * or was revoked by a sign-out, or from a request that a fresh access token
 * still didn't get through, as for an account deleted since. Nothing else
 * says anything about the session — no answer at all, a request cut off by
 * a navigation, the API's throttle, a 5xx — so the tokens stay, and an
 * owner at the counter isn't asked to sign in again because the Wi-Fi
 * blinked.
 */
export function endsSession(failure: unknown): boolean {
  return failure instanceof ApiError && failure.status === 401;
}
