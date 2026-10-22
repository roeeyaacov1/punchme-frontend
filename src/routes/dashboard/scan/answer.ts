import { ApiError } from "../../../api/errors";
import type { Chime } from "./feedback";

/**
 * Why a stamp or a reward didn't go through, as far as the page can tell,
 * so each cause gets a sentence in the page's own language. The server's own
 * `detail` is English and written for developers; it never reaches the
 * counter.
 */
export type FailureCause = "offline" | "server" | "busy" | "refused" | "other";

/** The sentence each cause gets, under `dashboard.scan.result`. */
export const CAUSE_KEYS: Record<FailureCause, string> = {
  offline: "dashboard.scan.result.offline",
  server: "dashboard.scan.result.failedServer",
  busy: "dashboard.scan.result.failedBusy",
  refused: "dashboard.scan.result.failedRefused",
  other: "dashboard.scan.result.failedOther",
};

export type AnswerState =
  /** The common case, and the only one that is over in two seconds. */
  | { kind: "stamped"; code: string; count: number; total: number }
  /** This scan filled the card. */
  | { kind: "rewardReady"; code: string; count: number; total: number }
  /** It was already full when it was scanned: a 409, resolved by a lookup.
   * `total` is 0 when the lookup failed too, and then no count is drawn. */
  | { kind: "alreadyFull"; code: string; count: number; total: number }
  | { kind: "redeemed"; code: string }
  | { kind: "voided"; code: string }
  /** Stamped moments ago. Nobody's mistake. */
  | { kind: "tooSoon"; code: string }
  | { kind: "unknownCard"; code: string }
  /** The shop's own sign-up poster. */
  | { kind: "enrollLink" }
  | { kind: "foreign" }
  /** Nothing was recorded: the stamp, or the reward being handed over. */
  | { kind: "failed"; during: "stamp" | "redeem"; cause: FailureCause }
  /** Read, and waiting on the server. Held for as long as that takes. */
  | { kind: "working" };

export interface Answer {
  /** Monotonic, so a repeat of the same outcome still restarts the clock,
   * the snap and the stamp landing. */
  id: number;
  state: AnswerState;
}

/** How long each answer holds the frame. A stamp is read at a glance and
 * clears itself; a refusal is read twice, so it stays longer. A full card is
 * a question and waits, but not forever, or a queue stalls behind somebody
 * who wandered off. The clock stops while a pointer or focus is inside. */
export const HOLD_MS: Partial<Record<AnswerState["kind"], number>> = {
  stamped: 2_200,
  redeemed: 2_600,
  rewardReady: 15_000,
  alreadyFull: 15_000,
};
export const HOLD_DEFAULT_MS = 3_800;

/** The sound and the buzz each answer makes; every other answer rejects. */
export const CHIMES: Partial<Record<AnswerState["kind"], Chime>> = {
  stamped: "punch",
  redeemed: "punch",
  rewardReady: "reward",
  alreadyFull: "reward",
};

export function failureCause(error: unknown): FailureCause {
  if (error instanceof ApiError) {
    if (error.status >= 500) return "server";
    // The API's per-person throttle: every request in a minute counts, so
    // a fast walk through the pages can meet it. Waiting is the whole fix.
    if (error.status === 429) return "busy";
    if (error.status === 403) return "refused";
    return "other";
  }
  // fetch rejects with a TypeError when the request never got an answer:
  // no network, or the server unreachable.
  if (error instanceof TypeError) return "offline";
  return "other";
}
