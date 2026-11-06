import { ApiError } from "../../api/errors";
import { redirectProblem } from "../dashboard/billing/billingState";
import { problemKey } from "../dashboard/problem";
import { NAME_MAX } from "./draft";

/** A save of the card that didn't go through, as one sentence, and where
 * the owner can put it right when the cause is on the card. */
export interface SaveProblem {
  /** The sentence's key. */
  key: string;
  /** The part of the card the server refused: the name, the stamp's
   * picture, or the logo. */
  fix?: "name" | "stamp" | "logo";
}

/** A picture of the card's that didn't upload, said as that picture's: the
 * stamp's or the logo (`commit.ts`). `cause` is why. */
export class PictureNotTaken extends Error {
  readonly use: "logo" | "stamp_art";
  readonly cause: unknown;

  constructor(use: "logo" | "stamp_art", cause: unknown) {
    super(cause instanceof Error ? cause.message : String(cause));
    this.name = "PictureNotTaken";
    this.use = use;
    this.cause = cause;
  }
}

/**
 * A save of the card that didn't go through, in the page's language, by its
 * cause, never `err.message` (for a refused value that is the status text,
 * in English). A refusal is placed on what was refused when that can be
 * told: a picture, which the server's image check names (`invalid_image`),
 * the stamp's or the logo by the upload it came from; or the name, when it
 * is over the API's 120 characters, which the field holds it to now but a
 * draft from before could carry. The card's other values are held to their
 * limits where they are chosen, so any other refusal can't be placed, and
 * says so plainly.
 */
export function saveProblem(error: unknown, card: { name: string }): SaveProblem {
  const picture = error instanceof PictureNotTaken ? error.use : null;
  if (error instanceof PictureNotTaken) error = error.cause;
  if (error instanceof ApiError && error.status === 422) {
    if (error.code === "invalid_image") {
      return picture === "logo"
        ? { key: "onboarding.account.problem.logo", fix: "logo" }
        : { key: "onboarding.account.problem.picture", fix: "stamp" };
    }
    if (card.name.trim().length > NAME_MAX) return { key: "onboarding.account.problem.name", fix: "name" };
    return { key: "onboarding.account.problem.invalid" };
  }
  return { key: problemKey(error) };
}

/** Activate that didn't reach Stripe's page, by its cause: Stripe itself
 * unreachable (nothing was charged), or the dashboard's own causes. */
export function checkoutProblemKey(error: unknown): string {
  if (redirectProblem(error, "checkout") === "unavailable") return "billing.problem.unavailable";
  return problemKey(error);
}
