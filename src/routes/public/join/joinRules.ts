import { ApiError } from "../../../api/errors";
import { isLikelyIlPhone } from "../../../lib/phone";
import type { JoinStep } from "./useJoinFlow";

/**
 * What a join's failure says, and where. Both joins (`/join` and the
 * friend's join on `/p`) read their API's refusals the same way:
 * - 404: the link leads nowhere any more, said on the sign;
 * - `upgrade_required`, from the code request as much as from the join: a
 *   Free shop that isn't taking new customers, said on the sign too
 *   (the code request's was "something went wrong" before);
 * - `invalid_phone` under the phone, `otp_invalid` under the code,
 *   `invalid_birthday` under the birthday;
 * - `otp_throttled`, the address's own throttle (a bare 429, which a
 *   counter's shared Wi-Fi reaches sooner), the SMS service being down
 *   (`sms_unavailable`), an unreachable API and anything else over the
 *   button.
 */
export type JoinAnswer =
  | { kind: "dead" }
  | { kind: "notTaking" }
  | { kind: "field"; field: "phone" | "code" | "birthday"; key: string }
  | { kind: "form"; key: string };

export function joinAnswer(err: unknown): JoinAnswer {
  // fetch rejects with a TypeError when the API can't be reached at all.
  if (err instanceof TypeError) return { kind: "form", key: "enroll.offline" };
  if (!(err instanceof ApiError)) return { kind: "form", key: "enroll.genericError" };
  if (err.code === "upgrade_required") return { kind: "notTaking" };
  if (err.code === "otp_throttled") return { kind: "form", key: "enroll.otpThrottled" };
  if (err.code === "invalid_phone") return { kind: "field", field: "phone", key: "enroll.phoneInvalid" };
  if (err.code === "otp_invalid") return { kind: "field", field: "code", key: "enroll.otpInvalid" };
  if (err.code === "invalid_birthday") return { kind: "field", field: "birthday", key: "enroll.birthdayInvalid" };
  if (err.code === "sms_unavailable") return { kind: "form", key: "enroll.smsUnavailable" };
  if (err.status === 429) return { kind: "form", key: "onboarding.account.throttled" };
  if (err.status === 404) return { kind: "dead" };
  return { kind: "form", key: "enroll.genericError" };
}

/** The phone checked in the browser before any request: the API is the real
 * check, but a code request spends the number's hourly allowance. */
export function phoneProblem(phone: string): "enroll.phoneMissing" | "enroll.phoneInvalid" | null {
  if (!phone.trim()) return "enroll.phoneMissing";
  return isLikelyIlPhone(phone) ? null : "enroll.phoneInvalid";
}

/** The earliest birthday the API takes. */
export const BIRTHDAY_MIN = "1900-01-01";

/** A date as the date field writes it (YYYY-MM-DD), in this phone's own
 * day, which is the shop's. */
export function localDay(date: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The birthday checked as the API checks it: optional, but never today or
 * later, and never before 1900. Caught here, a slipped year is said under
 * its field before anything is sent, rather than as "something went wrong"
 * after a code has been spent on it. A year typed past four digits is
 * refused too: the dates only compare as text while they are all YYYY. */
export function birthdayProblem(birthday: string, today: string): "enroll.birthdayInvalid" | null {
  if (!birthday) return null;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(birthday)) return "enroll.birthdayInvalid";
  return birthday >= today || birthday < BIRTHDAY_MIN ? "enroll.birthdayInvalid" : null;
}

/** A card that comes back with stamps on it, or that the friend's join says
 * is already theirs, is a returning one: "your card at…", not "you're in". */
export function isReturning(joined: { stampCount: number; alreadyMember?: boolean }): boolean {
  return Boolean(joined.alreadyMember) || joined.stampCount > 0;
}

/** Where each of the join's places stands in its order: the sign holding an
 * answer is the sign again. */
const STEP_ORDER: Record<JoinStep["kind"], number> = { sign: 0, held: 0, form: 1, code: 2, card: 3 };

/** Which way the join moved, so the next place comes in from that side: on
 * to the next one, or back to an earlier one ("Edit number", a refused
 * phone, the sign coming back holding an answer). Null when it didn't move. */
export function stepDirection(from: JoinStep["kind"], to: JoinStep["kind"]): "forward" | "back" | null {
  const delta = STEP_ORDER[to] - STEP_ORDER[from];
  if (delta === 0) return null;
  return delta > 0 ? "forward" : "back";
}

/** Which sentence goes under the card's heading. */
export function cardLine(card: { stamp_count: number; stamps_required: number; status: string }): "new" | "have" | "full" {
  if (card.status === "reward_ready" || card.stamp_count >= card.stamps_required) return "full";
  return card.stamp_count > 0 ? "have" : "new";
}
