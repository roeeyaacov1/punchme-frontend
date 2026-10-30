import { ApiError } from "../../api/errors";
import { redirectProblem } from "../dashboard/billing/billingState";
import { problemKey } from "../dashboard/problem";

/**
 * A save of the card that didn't go through, as the key of one sentence in
 * the page's language, by its cause, never `err.message` (for a refused
 * value that is the status text, in English). A 422 is placed on the
 * business's name: the field holds it to the API's 120 characters now, but
 * a draft from before could carry a longer one, and the card's own values
 * are held to their limits where they are chosen.
 */
export function saveProblemKey(error: unknown): string {
  if (error instanceof ApiError && error.status === 422) return "onboarding.account.problem.name";
  return problemKey(error);
}

/** Activate that didn't reach Stripe's page, by its cause: Stripe itself
 * unreachable (nothing was charged), or the dashboard's own causes. */
export function checkoutProblemKey(error: unknown): string {
  if (redirectProblem(error, "checkout") === "unavailable") return "billing.problem.unavailable";
  return problemKey(error);
}
