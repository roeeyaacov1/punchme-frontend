import { ApiError } from "../../../api/errors";
import { isLikelyIlPhone } from "../../../lib/phone";

/**
 * What a join's failure says, and where. Both joins (`/join` and the
 * friend's join on `/p`) read their API's refusals the same way:
 * - 404: the link leads nowhere any more, said on the sign;
 * - `upgrade_required`, from the code request as much as from the join: a
 *   Free shop that isn't taking new customers, said on the sign too
 *   (the code request's was "something went wrong" before);
 * - `invalid_phone` under the phone, `otp_invalid` under the code;
 * - `otp_throttled`, an unreachable API and anything else over the button.
 */
export type JoinAnswer =
  | { kind: "dead" }
  | { kind: "notTaking" }
  | { kind: "field"; field: "phone" | "code"; key: string }
  | { kind: "form"; key: string };

export function joinAnswer(err: unknown): JoinAnswer {
  // fetch rejects with a TypeError when the API can't be reached at all.
  if (err instanceof TypeError) return { kind: "form", key: "enroll.offline" };
  if (!(err instanceof ApiError)) return { kind: "form", key: "enroll.genericError" };
  if (err.code === "upgrade_required") return { kind: "notTaking" };
  if (err.code === "otp_throttled") return { kind: "form", key: "enroll.otpThrottled" };
  if (err.code === "invalid_phone") return { kind: "field", field: "phone", key: "enroll.phoneInvalid" };
  if (err.code === "otp_invalid") return { kind: "field", field: "code", key: "enroll.otpInvalid" };
  if (err.status === 404) return { kind: "dead" };
  return { kind: "form", key: "enroll.genericError" };
}

/** The phone checked in the browser before any request: the API is the real
 * check, but a code request spends the number's hourly allowance. */
export function phoneProblem(phone: string): "enroll.phoneMissing" | "enroll.phoneInvalid" | null {
  if (!phone.trim()) return "enroll.phoneMissing";
  return isLikelyIlPhone(phone) ? null : "enroll.phoneInvalid";
}

/** A card that comes back with stamps on it, or that the friend's join says
 * is already theirs, is a returning one: "your card at…", not "you're in". */
export function isReturning(joined: { stampCount: number; alreadyMember?: boolean }): boolean {
  return Boolean(joined.alreadyMember) || joined.stampCount > 0;
}

/** Which sentence goes under the card's heading. */
export function cardLine(card: { stamp_count: number; stamps_required: number; status: string }): "new" | "have" | "full" {
  if (card.status === "reward_ready" || card.stamp_count >= card.stamps_required) return "full";
  return card.stamp_count > 0 ? "have" : "new";
}
