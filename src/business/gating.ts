import type { Business } from "../api/businesses";

/** Free plan can't enroll real customers — PassKit bills per card. The owner
 * can still design and preview their own card for free either way. */
export function canEnrollRealCustomers(business: Business | null): boolean {
  return business?.plan === "pro";
}
