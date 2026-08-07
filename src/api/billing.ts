import { api } from "./client";
import type { components } from "./generated/schema";

export type Subscription = components["schemas"]["SubscriptionOut"];

export function createCheckoutSession(businessId: string) {
  return api.post<components["schemas"]["CheckoutOut"]>("/api/billing/checkout", {
    business_id: businessId,
  });
}

export function createPortalSession(businessId: string) {
  return api.post<components["schemas"]["PortalOut"]>("/api/billing/portal", {
    business_id: businessId,
  });
}

export function getSubscription(businessId: string) {
  return api.get<Subscription>("/api/billing/subscription", {
    query: { business_id: businessId },
  });
}
