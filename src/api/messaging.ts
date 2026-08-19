import { api } from "./client";
import type { components } from "./generated/schema";

/** Customer messaging: owner-written automations (win-back, birthday,
 * reward-waiting), one-off broadcasts, test-sends to the owner's own
 * preview card, and the summary/history behind the Messages page.
 * Mirrors apps/messaging/api.py — every call is owner-scoped by business. */

export type AutomationOut = components["schemas"]["AutomationOut"];
export type AutomationIn = components["schemas"]["AutomationIn"];
export type AutomationPatchIn = components["schemas"]["AutomationPatchIn"];
export type RecipeOut = components["schemas"]["RecipeOut"];
export type AudienceOut = components["schemas"]["AudienceOut"];
export type TestSendIn = components["schemas"]["TestSendIn"];
export type TestSendOut = components["schemas"]["TestSendOut"];
export type BroadcastIn = components["schemas"]["BroadcastIn"];
export type BroadcastOut = components["schemas"]["BroadcastOut"];
export type PagedBroadcasts = components["schemas"]["PagedBroadcastOut"];
export type DeliveryOut = components["schemas"]["DeliveryOut"];
export type PagedDeliveries = components["schemas"]["PagedDeliveryOut"];
export type MessagingSummary = components["schemas"]["MessagingSummaryOut"];

export type AutomationKind = "inactive" | "birthday" | "reward_waiting";
export type MessageKind = AutomationKind | "broadcast";
export type MessageLanguage = "HE" | "EN";

export interface AudienceQuery {
  kind: MessageKind;
  inactive_days?: number;
  reward_waiting_days?: number;
  birthday_days_before?: number;
  opt_in_only?: boolean;
  template_id?: string;
}

function base(businessId: string) {
  return `/api/businesses/${businessId}`;
}

export function getMessagingSummary(businessId: string) {
  return api.get<MessagingSummary>(`${base(businessId)}/messaging/summary`);
}

/** Starter rules in the card's language — suggestions, every field editable. */
export function listRecipes(businessId: string, language: MessageLanguage) {
  return api.get<RecipeOut[]>(`${base(businessId)}/messaging/recipes`, {
    query: { language },
  });
}

/** The live "will reach ~N customers" number while a rule is being edited.
 * 422 (automation_invalid) for an out-of-range parameter. */
export function getAudienceCount(businessId: string, query: AudienceQuery) {
  return api.get<AudienceOut>(`${base(businessId)}/messaging/audience`, {
    query: {
      kind: query.kind,
      inactive_days: query.inactive_days,
      reward_waiting_days: query.reward_waiting_days,
      birthday_days_before: query.birthday_days_before,
      opt_in_only: query.opt_in_only ? "true" : "false",
      template_id: query.template_id,
    },
  });
}

export function listAutomations(businessId: string) {
  return api.get<AutomationOut[]>(`${base(businessId)}/automations`);
}

export function getAutomation(businessId: string, automationId: string) {
  return api.get<AutomationOut>(`${base(businessId)}/automations/${automationId}`);
}

/** Creates paused unless `is_active` (which needs Pro → 403 upgrade_required). */
export function createAutomation(businessId: string, input: AutomationIn) {
  return api.post<AutomationOut>(`${base(businessId)}/automations`, input);
}

/** Partial: only the keys present change. */
export function patchAutomation(
  businessId: string,
  automationId: string,
  input: AutomationPatchIn,
) {
  return api.patch<AutomationOut>(
    `${base(businessId)}/automations/${automationId}`,
    input,
  );
}

export function deleteAutomation(businessId: string, automationId: string) {
  return api.delete<void>(`${base(businessId)}/automations/${automationId}`);
}

export function activateAutomation(businessId: string, automationId: string) {
  return api.post<AutomationOut>(
    `${base(businessId)}/automations/${automationId}/activate`,
  );
}

export function pauseAutomation(businessId: string, automationId: string) {
  return api.post<AutomationOut>(
    `${base(businessId)}/automations/${automationId}/pause`,
  );
}

/** Sends an existing rule, as configured, to the owner's own preview card. */
export function testAutomation(businessId: string, automationId: string) {
  return api.post<TestSendOut>(
    `${base(businessId)}/automations/${automationId}/test`,
  );
}

/** Ad-hoc test of text still being composed — same destination. */
export function sendTestMessage(businessId: string, input: TestSendIn) {
  return api.post<TestSendOut>(`${base(businessId)}/messaging/test`, input);
}

/** Create-and-send. 429 (messaging_quota, body.next_allowed_at) when the
 * weekly cap or the minimum gap is hit. */
export function createBroadcast(businessId: string, input: BroadcastIn) {
  return api.post<BroadcastOut>(`${base(businessId)}/broadcasts`, input);
}

export function listBroadcasts(businessId: string, page = 1, pageSize = 20) {
  return api.get<PagedBroadcasts>(`${base(businessId)}/broadcasts`, {
    query: { page, page_size: pageSize },
  });
}

export function getBroadcast(businessId: string, broadcastId: string) {
  return api.get<BroadcastOut>(`${base(businessId)}/broadcasts/${broadcastId}`);
}

export function listDeliveries(
  businessId: string,
  automationId?: string,
  page = 1,
  pageSize = 20,
) {
  return api.get<PagedDeliveries>(`${base(businessId)}/messaging/deliveries`, {
    query: { automation_id: automationId, page, page_size: pageSize },
  });
}
