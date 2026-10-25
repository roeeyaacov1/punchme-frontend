/**
 * That this device came back from Stripe's checkout, and when.
 *
 * The webhook is the only word on whether a payment went through, and it
 * can be slow. `/billing/success` keeps the time it opened, per business,
 * and clears it once the business reads Pro. Billing reads it for a day, so
 * an owner who paid while Stripe's word is late is warned before pressing
 * Activate a second time. Only this device knows; the server can't refuse a
 * second checkout yet.
 */
const KEY = "punchme.checkoutReturned";
const DAY_MS = 24 * 60 * 60 * 1000;

/** Pure: the kept time, while it is less than a day old. */
export function recentReturn(raw: string | null, now: number): number | null {
  if (!raw) return null;
  const at = Number(raw);
  if (!Number.isFinite(at) || at > now || now - at >= DAY_MS) return null;
  return at;
}

export function checkoutReturnedAt(businessId: string, now = Date.now()): number | null {
  try {
    return recentReturn(localStorage.getItem(`${KEY}.${businessId}`), now);
  } catch {
    return null;
  }
}

export function markCheckoutReturn(businessId: string, at = Date.now()): void {
  try {
    localStorage.setItem(`${KEY}.${businessId}`, String(at));
  } catch {
    /* no warning on this device, then; the payment is unaffected */
  }
}

export function clearCheckoutReturn(businessId: string): void {
  try {
    localStorage.removeItem(`${KEY}.${businessId}`);
  } catch {
    /* nothing kept to clear */
  }
}
