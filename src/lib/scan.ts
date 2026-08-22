import { ApiError } from "../api/errors";

/**
 * What the camera read, and what the server said about it.
 *
 * Everything here is pure so the counter's two judgement calls — "is this
 * even one of our codes" and "what does this status actually mean" — can be
 * tested without a camera or a backend, which is the only kind of test this
 * repo keeps.
 */

/** A card serial is `secrets.token_urlsafe(24)`: 32 characters of
 * `[A-Za-z0-9_-]`. A PassKit member id is the same shape of thing, and the
 * columns cap at 64 and 128 characters respectively. Nothing else a phone
 * camera catches at a counter looks like this, which is what lets the
 * scanner turn down a poster without spending a request — or a slot in the
 * endpoint's 60/min — on it. */
const CODE = /^[A-Za-z0-9_-]{6,128}$/;

export type ScannedPayload =
  /** A card code: our serial, or the member id an issued pass renders. */
  | { kind: "code"; code: string }
  /** Our own sign-up poster. The standee's QR is `/join/:templateId`, and
   * pointing the scanner at it is an easy mistake to make on day one — it is
   * the only other PunchMe code in the room. Worth naming rather than
   * reporting as "not found". */
  | { kind: "enrollLink" }
  /** A QR, but somebody else's. */
  | { kind: "foreign" };

/** The public card page — a QR drawn from a serial resolves to the same card
 * as the pass's own barcode, so a code that arrives wrapped in that URL is
 * still a scan. */
const CARD_PATH = /^\/c\/([A-Za-z0-9_-]{6,128})\/?$/;
const JOIN_PATH = /^\/join\/[^/]+\/?$/;

export function readScannedPayload(raw: string): ScannedPayload {
  const value = raw.trim();
  if (!value) return { kind: "foreign" };
  if (CODE.test(value)) return { kind: "code", code: value };

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return { kind: "foreign" };
  }
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { kind: "foreign" };
  }
  if (JOIN_PATH.test(url.pathname)) return { kind: "enrollLink" };
  const card = CARD_PATH.exec(url.pathname);
  if (card) return { kind: "code", code: card[1] };
  return { kind: "foreign" };
}

/**
 * How long the same code is ignored after it has been acted on.
 *
 * A phone held at a pass decodes it twenty times a second, so without this
 * every customer would be a burst of requests against a 45-second server
 * cooldown — sixty of them in a minute and the endpoint throttles the whole
 * shop.
 *
 * Well short of that cooldown on purpose. This is only the "you are still
 * pointing at it" window; the duplicate-punch guard belongs to the server,
 * which owns the clock. A phone left face-down on a pass goes quiet, and a
 * genuine second look past the window gets a truthful "already stamped a
 * moment ago" rather than silence.
 */
export const REPEAT_WINDOW_MS = 10_000;

/**
 * The throughput rule: a *different* code is always accepted immediately.
 *
 * The next customer must not have to wait for the last one's result to clear
 * — at a counter that is the whole cost of the feature. So only a repeat of
 * the code just handled is held off, and only for a moment.
 */
export function shouldAcceptCode(
  code: string,
  last: { code: string; at: number } | null,
  now: number,
  windowMs: number = REPEAT_WINDOW_MS,
): boolean {
  if (!last) return true;
  if (last.code !== code) return true;
  return now - last.at >= windowMs;
}

/**
 * What a failed scan meant.
 *
 * `/api/scan` answers failures with a status and an English `detail` and
 * nothing else — no `code` key, unlike the stamp-adjust endpoint (see
 * punchme-backend `config/api.py`). So the status is all there is to read,
 * and reading the prose instead would break the moment somebody rewords it.
 *
 * That leaves 409 genuinely ambiguous — a card that is already full and a
 * card that has been voided answer identically — which the page resolves by
 * looking the card up rather than by guessing. 429 is ambiguous too (the
 * per-card cooldown and the 60/min throttle share it), but both mean the
 * same thing to the person holding the phone: wait a moment.
 */
export type ScanFailure = "unknownCard" | "tooSoon" | "conflict" | "failed";

export function classifyScanError(error: unknown): ScanFailure {
  if (!(error instanceof ApiError)) return "failed";
  if (error.status === 404) return "unknownCard";
  if (error.status === 429) return "tooSoon";
  if (error.status === 409) return "conflict";
  return "failed";
}
