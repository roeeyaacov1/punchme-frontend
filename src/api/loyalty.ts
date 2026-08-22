import { api } from "./client";
import type { DesignDoc } from "./designs";
import type { components } from "./generated/schema";

export type EnrollOut = components["schemas"]["EnrollOut"];

/** The card art `/api/cards/{serial}` serves alongside the colours.
 *
 * Optional, and hand-written rather than generated, because they are newer
 * than `schema.d.ts`: a frontend that ships ahead of the backend gets
 * `undefined` and falls back to drawing the card from the colours alone,
 * instead of rendering a broken image. Fold these into the generated type
 * and delete this block the next time `npm run gen:api` runs against a
 * deploy that has them.
 *
 * None of it is private — every value here is already printed on the pass
 * in the customer's own wallet. */
export interface CardPublicArt {
  /** The wide logo Apple renders. Google circle-crops the square `logo_url`;
   * they are two assets, not two names for one. */
  apple_logo_url?: string | null;
  /** Glyph, pattern, field labels, barcode format — defaults filled in. */
  design?: DesignDoc;
  /** The published Apple strip / Google hero PNG for this card's stamp
   * state: the literal file the phone is showing. Null before the design's
   * first sync. */
  strip_url?: string | null;
  hero_url?: string | null;
}

export type CardPublic = components["schemas"]["CardPublicOut"] & CardPublicArt;
export type CustomerListItem = components["schemas"]["CustomerListItemOut"];
export type ActivityItem = components["schemas"]["ActivityItemOut"];
export type PagedCustomers = components["schemas"]["PagedCustomerListItemOut"];
export type PagedActivity = components["schemas"]["PagedActivityItemOut"];

export interface EnrollIn {
  phone?: string;
  display_name?: string;
  /** ISO date (YYYY-MM-DD); optional — birthday rewards only. */
  birthday?: string;
  /** Spam-Law marketing consent — a separate, unticked checkbox. */
  marketing_opt_in?: boolean;
  /** The SMS code from requestJoinOtp — required in production. */
  otp_code?: string;
}

/** Public — no auth. Step 1 of the join flow: sends an SMS verification
 * code. Always resolves (204) whether or not the phone is known — no user
 * enumeration; rate limits surface as ApiError 429 (code otp_throttled). */
export function requestJoinOtp(templateId: string, phone: string) {
  return api.post<void>(
    `/api/join/${templateId}/otp`,
    { phone },
    { auth: false },
  );
}

/** Public — no auth. Idempotent per (customer, template): re-submitting the
 * same phone for the same template returns the existing card with its
 * stored wallet_pass_url. Requires a fresh otp_code from requestJoinOtp. */
export function enroll(templateId: string, body: EnrollIn) {
  return api.post<EnrollOut>(`/api/enroll/${templateId}`, body, {
    auth: false,
  });
}

/** JWTAuth, owner-only. Mints/fetches the OWNER's own card — not a real
 * customer, never gated on plan. Safe to call repeatedly (idempotent). */
export function previewCard(businessId: string, templateId: string) {
  return api.post<EnrollOut>(
    `/api/businesses/${businessId}/templates/${templateId}/preview`,
  );
}

/** Public — no auth. Deliberately excludes any customer PII. */
export function getPublicCard(serial: string) {
  return api.get<CardPublic>(`/api/cards/${serial}`, { auth: false });
}

export function listCustomers(
  businessId: string,
  page?: number,
  pageSize?: number,
) {
  return api.get<PagedCustomers>(`/api/businesses/${businessId}/customers`, {
    query: { page, page_size: pageSize },
  });
}

const CUSTOMERS_FETCH_PAGE_SIZE = 200;
/** Safety stop so a business with an unexpectedly huge roster can't turn one
 * screen into hundreds of sequential requests. Hitting it sets `truncated`,
 * which the page surfaces rather than silently searching a partial list. */
const CUSTOMERS_MAX_PAGES = 25;

/** The list endpoint has no search parameter (see
 * docs/customers-backend-issues.md), so the dashboard filters, sorts and
 * exports client-side — which means it needs the whole roster, not one page.
 *
 * Pages until the accumulated length reaches the server's own `count`, so a
 * backend that caps `page_size` below what we asked for still terminates on
 * the right row instead of stopping after the first short page. */
export async function listAllCustomers(businessId: string): Promise<{
  items: CustomerListItem[];
  count: number;
  truncated: boolean;
}> {
  const items: CustomerListItem[] = [];
  let count = 0;
  let truncated = false;
  let page = 1;

  for (;;) {
    const res = await listCustomers(businessId, page, CUSTOMERS_FETCH_PAGE_SIZE);
    count = res.count;
    items.push(...res.items);
    if (res.items.length === 0 || items.length >= res.count) break;
    if (page >= CUSTOMERS_MAX_PAGES) {
      truncated = true;
      break;
    }
    page += 1;
  }

  return { items, count, truncated };
}

export type StampAdjustOut = components["schemas"]["StampAdjustOut"];

/** Shipped in punchme-backend 32a1743 — docs/customers-backend-issues.md has
 * the contract and the reasoning. Still gated behind `env.stampAdjustEnabled`,
 * which fails closed, so a build pointed at an older deploy renders the control
 * visibly disabled instead of 404-ing.
 *
 * Signed `delta`: +1 stamps, -1 takes one back. Removal is the whole point —
 * /api/scan can only ever add, so a staff member who double-scans currently
 * has no way to undo it. Business-scoped so ownership is enforced from the
 * path like every other dashboard endpoint, and keyed by `card_id` because
 * that is what the customers list returns; the dashboard never handles a card
 * serial, and shouldn't have to start.
 *
 * `expectedStampCount` is the count the clicking user was *looking at*, which
 * the server compares under a row lock before applying the delta — two staff
 * on two devices clicking `-1` against the same displayed 3 would otherwise
 * land on 1. Required rather than optional: the guard is only worth having if
 * no call site can quietly skip it, and 409 `stamp_adjust_conflict` is much
 * easier to handle than a silently doubled correction. */
export function adjustCardStamps(
  businessId: string,
  cardId: string,
  delta: number,
  expectedStampCount: number,
) {
  return api.post<StampAdjustOut>(
    `/api/businesses/${businessId}/cards/${cardId}/stamps`,
    { delta, expected_stamp_count: expectedStampCount },
  );
}

export function listActivity(
  businessId: string,
  page?: number,
  pageSize?: number,
) {
  return api.get<PagedActivity>(`/api/businesses/${businessId}/activity`, {
    query: { page, page_size: pageSize },
  });
}

export type ScanOut = components["schemas"]["ScanOut"];
export type RedeemOut = components["schemas"]["RedeemOut"];

/** JWTAuth, owner-only, and the only endpoint the counter actually needs.
 *
 * `code` is whatever the barcode carried. An issued wallet pass renders the
 * PassKit member id; a QR this frontend draws carries the card serial. The
 * backend's `_code_lookup` matches either column, so the scanner never has
 * to know which one it just read.
 *
 * Its failures carry a bare status and an English `detail` — no
 * machine-readable `code`, unlike `adjustCardStamps` — so `src/lib/scan.ts`
 * reads the status and nothing else. Throttled 60/min per user, on top of
 * the per-card `STAMP_COOLDOWN_SECONDS` (45) that makes a double-scan a 429
 * instead of a second punch. */
export function scanCode(code: string) {
  return api.post<ScanOut>("/api/scan", { serial: code });
}

/** JWTAuth, owner-only. Spends a full card: writes the redemption row and
 * resets the count to zero. Takes the same either-id code as `scanCode`, so
 * the scanner can redeem the card it just read without a second lookup.
 * 409 if the card isn't actually full. */
export function redeemCard(code: string) {
  return api.post<RedeemOut>(`/api/cards/${encodeURIComponent(code)}/redeem`);
}
