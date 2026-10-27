import { ApiError } from "../../api/errors";
import type { AuthMode } from "./useEmailPasswordAuth";

/** How the account was asked for: the email-and-password form, or Google's
 * button. Both fail with the same bare 401, and it means different things. */
export type AuthMethod = "password" | "google";

/**
 * The page's own sentence for a failed sign-in or sign-up, as an i18n key.
 *
 * The API refuses in English (`detail`), and only some refusals carry a
 * `code`, so the server's words never reach the screen:
 * - 409 `email_already_registered`: the address has an account, and the
 *   hook turns the form to sign-in with the address kept;
 * - a password's 401 has no code: a wrong password, an unknown address and
 *   an account that only signs in with Google all answer the same, by
 *   design, so one sentence names both ways out;
 * - 422 `weak_password`: Django's rules, said in the page's words. Any other
 *   422 is the request's shape, nothing the person can fix;
 * - Google's 401 is a token that didn't verify, nothing anyone typed, so it
 *   gets the generic line rather than "wrong password".
 */
export function authErrorKey(
  err: unknown,
  { mode, method }: { mode: AuthMode; method: AuthMethod },
): string {
  const generic = mode === "signup" ? "auth.signUpError" : "auth.error";
  // fetch rejects with a TypeError when the API can't be reached at all —
  // a stopped local backend, no network — which is worth saying plainly.
  if (err instanceof TypeError) return "auth.offline";
  if (!(err instanceof ApiError)) return generic;
  if (err.status === 409) return "onboarding.account.alreadyRegistered";
  if (err.status === 429) return "onboarding.account.throttled";
  if (method === "password" && mode === "signin" && err.status === 401) {
    return "auth.wrongDetails";
  }
  if (method === "password" && mode === "signup" && err.code === "weak_password") {
    return "auth.weakPassword";
  }
  return generic;
}
