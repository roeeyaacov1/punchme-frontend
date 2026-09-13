import { api } from "./client";
import type { components } from "./generated/schema";

export type PublicCardPage = components["schemas"]["PublicCardPageOut"];
export type PublicCardStamp = components["schemas"]["PublicCardStampOut"];
export type ReferralJoinIn = components["schemas"]["ReferralJoinIn"];
export type ReferralJoinOut = components["schemas"]["ReferralJoinOut"];
export type ReferralProgram = components["schemas"]["ReferralProgramOut"];
export type ReferralProgramPatch = components["schemas"]["ReferralProgramPatchIn"];
export type ReferralRule = components["schemas"]["ReferralRuleOut"];
export type ReferralRules = components["schemas"]["ReferralRulesOut"];
export type ReferralRulePatch = components["schemas"]["ReferralRuleIn"];
export type Referral = components["schemas"]["ReferralOut"];
export type PagedReferrals = components["schemas"]["PagedReferralOut"];
export type ReferralGrant = components["schemas"]["ReferralGrantOut"];
export type PagedReferralGrants = components["schemas"]["PagedReferralGrantOut"];
export type RuleEvent = ReferralRule["event"];
export type RuleRecipient = ReferralRule["recipient"];

/** The page behind the wallet QR: `/p/:token` (punchme-backend
 * `apps/referrals`).
 *
 * Optional JWT — the one endpoint that reads a bearer token when there is
 * one and still answers when there is none. Signed in as the shop's own
 * staff, the answer is the stamp screen (`view: "stamp"`, `stamp` filled
 * in, and the serial `scanCode` needs); with the shop's referral program
 * on, anyone else gets the join page (`view: "join"`, `referrer_display`
 * saying what the owner allowed about who invited them); otherwise `view:
 * "card"`, the shop's name and design and nothing about the holder. So this
 * is NOT `auth: false`: attaching the token is the whole point when there
 * is one. A stale token is a 401 the client refreshes through.
 *
 * `deviceId` is this browser's own random id (see lib/deviceId): with the
 * program on, the visit is recorded against it so a join next week can be
 * attributed to a scan today. 404 for a token no live card carries — the
 * same 404, and the same timing, whether the token is unknown, the card was
 * removed or the shop is inactive. Throttled 60/m per address and per
 * token. */
export function getPublicCardPage(token: string, deviceId?: string | null) {
  return api.get<PublicCardPage>(`/api/p/${encodeURIComponent(token)}`, {
    query: { device: deviceId || undefined },
  });
}

/** Public — no auth. Step 1 of the friend's join: the same SMS code the
 * ordinary join sends, addressed by the member's token. Always 204; rate
 * limits surface as ApiError 429 (`otp_throttled`). */
export function requestReferralOtp(token: string, phone: string) {
  return api.post<void>(
    `/api/p/${encodeURIComponent(token)}/otp`,
    { phone },
    { auth: false },
  );
}

/** Public — no auth. Step 2: the friend's card on the member's design,
 * then the referral. Unlike the ordinary join the code is required whatever
 * the deployment's OTP setting says. Idempotent per phone like the ordinary
 * join; `referral_status` says what became of the referral, and "rejected"
 * or "flagged" is still a successful join. */
export function referralJoin(token: string, body: ReferralJoinIn) {
  return api.post<ReferralJoinOut>(`/api/p/${encodeURIComponent(token)}/join`, body, {
    auth: false,
  });
}

// --- the owner's side (JWTAuth, manager+) ---------------------------------

export function getReferralProgram(businessId: string) {
  return api.get<ReferralProgram>(`/api/businesses/${businessId}/referrals/program`);
}

/** PATCH semantics: only the keys sent change. Switching on can answer 403
 * `upgrade_required` or `referrals_not_enabled`; `can_enable` on the GET
 * says so beforehand. Out-of-range settings are 422 `referral_program_invalid`
 * with a field slug in `detail`. */
export function patchReferralProgram(businessId: string, patch: ReferralProgramPatch) {
  return api.patch<ReferralProgram>(
    `/api/businesses/${businessId}/referrals/program`,
    patch,
  );
}

/** The four sentences on the settings screen, in screen order, with the
 * starter copy in the card's language where a slot was never saved. */
export function listReferralRules(businessId: string) {
  return api.get<ReferralRules>(`/api/businesses/${businessId}/referrals/rules`);
}

/** PATCH on one slot: only the keys sent change; the merged rule is checked
 * as a whole (422 `referral_rule_invalid` with a field slug). The row is
 * created from the starter copy on first write, and the program row with
 * it — switched off, which is its own decision. */
export function putReferralRule(
  businessId: string,
  event: RuleEvent,
  recipient: RuleRecipient,
  patch: ReferralRulePatch,
) {
  return api.patch<ReferralRule>(
    `/api/businesses/${businessId}/referrals/rules/${event}/${recipient}`,
    patch,
  );
}

export function listReferrals(businessId: string, status?: string, page?: number) {
  return api.get<PagedReferrals>(`/api/businesses/${businessId}/referrals`, {
    query: { status, page },
  });
}

/** The owner's verdict on a flagged referral. Approving fires the welcome
 * gift it was holding and puts it back on the path; rejecting keeps the row
 * with the verdict as its reason. 409 `referral_not_reviewable` for anything
 * not flagged. */
export function reviewReferral(
  businessId: string,
  referralId: string,
  decision: "approve" | "reject",
) {
  return api.post<Referral>(`/api/businesses/${businessId}/referrals/${referralId}/review`, {
    decision,
  });
}

export function listReferralGrants(businessId: string, status?: string, page?: number) {
  return api.get<PagedReferralGrants>(`/api/businesses/${businessId}/referrals/grants`, {
    query: { status, page },
  });
}

/** The owner's manual mark on a granted reward. Takes nothing back — no
 * stamp is removed — it records the verdict and stops the row counting
 * toward the member's cap. 409 `grant_not_revocable` unless granted. */
export function revokeReferralGrant(businessId: string, grantId: string) {
  return api.post<ReferralGrant>(
    `/api/businesses/${businessId}/referrals/grants/${grantId}/revoke`,
  );
}
