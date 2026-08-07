import type { AuthProviderButtonProps } from "./types";

/**
 * Not rendered anywhere yet — no Apple Developer account provisioned.
 * Exists only to prove AuthProviderButtonProps is provider-agnostic, so
 * wiring up Sign in with Apple JS later needs no changes to AuthProvider
 * or tokenStore. See task: Apple Sign-In stub self-check.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function AppleAuthButton(_props: AuthProviderButtonProps) {
  return null;
}
