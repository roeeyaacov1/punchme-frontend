/**
 * Whether a business's sign has already switched on in this browser.
 *
 * `/billing/success` brings the owner to `/dashboard?activated=1` once the
 * plan has turned Pro, and the Overview keeps that parameter in the URL. So
 * the sign remembers having switched on, per business, and a reload of that
 * same address doesn't play the moment again.
 */
const KEY = "punchme.signSwitchedOn";

export function hasSwitchedOn(businessId: string | null | undefined): boolean {
  if (!businessId) return true;
  try {
    return localStorage.getItem(`${KEY}.${businessId}`) === "1";
  } catch {
    // No storage, no memory: the moment plays on that arrival only.
    return false;
  }
}

export function rememberSwitchedOn(businessId: string | null | undefined): void {
  if (!businessId) return;
  try {
    localStorage.setItem(`${KEY}.${businessId}`, "1");
  } catch {
    /* it played once; that is all this was for */
  }
}
