import { ApiError } from "../../../api/errors";

/**
 * Where a business stands with PunchMe, read from the subscription the page
 * already holds: its `plan` and Stripe's own `status`.
 *
 * Mirrors the backend's two sets (`apps/billing/services.py`). A business is
 * Pro while its subscription is `active` or `trialing`. And only `none`,
 * `canceled`, `incomplete` and `incomplete_expired` can take a new checkout
 * safely: every other status keeps the subscription bound to the business,
 * so a second checkout would make a second subscription that Stripe bills
 * and the backend ignores. Those statuses belong in the portal, a word this
 * frontend doesn't know yet among them.
 */
export type BillingState =
  /** Free, never paid: activate. */
  | "notLive"
  /** Free, the last checkout never finished: activate. */
  | "unfinished"
  /** Free, the subscription was cancelled: activate again. */
  | "ended"
  /** Free while Stripe still holds a subscription, a failed renewal: fix the card in the portal. */
  | "paymentFailed"
  /** Pro: what it costs, until when, and where to change or stop it. */
  | "live"
  /** Pro with no subscription behind it, nothing to manage. */
  | "unbilled";

export function billingState({ plan, status }: { plan: string; status: string }): BillingState {
  if (plan === "pro") return status === "none" ? "unbilled" : "live";
  if (status === "none") return "notLive";
  if (status === "incomplete" || status === "incomplete_expired") return "unfinished";
  if (status === "canceled") return "ended";
  return "paymentFailed";
}

/**
 * Why leaving for Stripe didn't happen, said under the button that tried:
 * - `unavailable`: Stripe is down or misconfigured (503), and nothing was
 *   charged;
 * - `noCustomer`: the portal's 400, a business that never started a checkout;
 * - `unreachable`: no connection, or anything else.
 */
export type RedirectProblem = "unavailable" | "noCustomer" | "unreachable";

export function redirectProblem(error: unknown, to: "checkout" | "portal"): RedirectProblem {
  if (error instanceof ApiError) {
    if (error.status === 503) return "unavailable";
    if (error.status === 400 && to === "portal") return "noCustomer";
  }
  return "unreachable";
}
