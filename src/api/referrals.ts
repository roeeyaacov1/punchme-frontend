import { api } from "./client";
import type { components } from "./generated/schema";

export type PublicCardPage = components["schemas"]["PublicCardPageOut"];
export type PublicCardStamp = components["schemas"]["PublicCardStampOut"];

/** The page behind the wallet QR: `/p/:token` (punchme-backend
 * `apps/referrals`, the referral build's phase 3).
 *
 * Optional JWT — the one endpoint that reads a bearer token when there is
 * one and still answers when there is none. Signed in as the shop's own
 * staff, the answer is the stamp screen (`view: "stamp"`, `stamp` filled
 * in, and the serial `scanCode` needs); anyone else gets `view: "card"`,
 * the shop's name and design and nothing about the holder. So this is NOT
 * `auth: false`: attaching the token is the whole point when there is one.
 * A stale token is a 401 the client refreshes through like any other call.
 *
 * 404 for a token no live card carries — the same 404, and the same
 * timing, whether the token is unknown, the card was removed or the shop
 * is inactive. Throttled 60/m per address and 60/m per token. */
export function getPublicCardPage(token: string) {
  return api.get<PublicCardPage>(`/api/p/${encodeURIComponent(token)}`);
}
