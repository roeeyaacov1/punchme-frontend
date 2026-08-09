import { api } from "./client";
import type { components } from "./generated/schema";

export type EnrollOut = components["schemas"]["EnrollOut"];
export type CardPublic = components["schemas"]["CardPublicOut"];
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

export function listActivity(
  businessId: string,
  page?: number,
  pageSize?: number,
) {
  return api.get<PagedActivity>(`/api/businesses/${businessId}/activity`, {
    query: { page, page_size: pageSize },
  });
}
