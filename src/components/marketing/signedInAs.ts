import type { TFunction } from "i18next";

/**
 * "Signed in as …", for the header's account menu and the phone menu, with
 * the address first-strong isolated, as `<bdi>` would isolate it in markup,
 * so one that starts with a digit or holds a hyphen keeps its order inside
 * the Hebrew sentence.
 */
export function signedInAs(t: TFunction, email: string): string {
  return t("onboarding.account.signedInAs", { email: `⁨${email}⁩` });
}
