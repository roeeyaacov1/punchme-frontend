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
}

/** Public — no auth. Idempotent per (customer, template): re-submitting the
 * same phone for the same template returns the existing card, with
 * wallet_apple_url/wallet_google_url as null (the pass was already issued
 * on first enroll) — callers must handle that case explicitly. */
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
