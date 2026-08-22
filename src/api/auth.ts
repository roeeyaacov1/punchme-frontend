import { api } from "./client";
import type { components } from "./generated/schema";

export type User = components["schemas"]["UserOut"];
export type TokenPair = components["schemas"]["TokenPairOut"];

export function signInWithGoogle(idToken: string) {
  return api.post<TokenPair>(
    "/api/auth/google",
    { id_token: idToken },
    { auth: false },
  );
}

export function signUpWithPassword(email: string, password: string) {
  return api.post<TokenPair>(
    "/api/auth/signup",
    { email, password },
    { auth: false },
  );
}

export function signInWithPassword(email: string, password: string) {
  return api.post<TokenPair>(
    "/api/auth/login",
    { email, password },
    { auth: false },
  );
}

export function getCurrentUser() {
  return api.get<User>("/api/auth/me");
}

/** Blacklists the refresh token server-side.
 *
 * `auth: false` because the refresh token in the body *is* the credential —
 * signing out has to work after the access token has already expired, which
 * is the common case on a counter device left alone for an hour.
 *
 * Without this call, clearing localStorage only hides the credential: the
 * refresh token stays valid for its full 14 days, so a sign-out on a shared
 * device doesn't actually end the session. */
export function revokeRefreshToken(refresh: string) {
  return api.post<void>("/api/auth/logout", { refresh }, { auth: false });
}
