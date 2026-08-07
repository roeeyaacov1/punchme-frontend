import { api } from "./client";
import type { components } from "./generated/schema";

export type Business = components["schemas"]["BusinessOut"];
export type CardTemplate = components["schemas"]["CardTemplateOut"];
export type BusinessIn = components["schemas"]["BusinessIn"];
export type BusinessPatchIn = components["schemas"]["BusinessPatchIn"];
export type CardTemplateIn = components["schemas"]["CardTemplateIn"];
export type CardTemplatePatchIn = components["schemas"]["CardTemplatePatchIn"];

/** 404s (via ApiError) if the caller has no Business yet. */
export function getMyBusiness() {
  return api.get<Business>("/api/businesses/me");
}

export function createBusiness(input: BusinessIn) {
  return api.post<Business>("/api/businesses", input);
}

export function patchBusiness(businessId: string, input: BusinessPatchIn) {
  return api.patch<Business>(`/api/businesses/${businessId}`, input);
}

export function createTemplate(businessId: string, input: CardTemplateIn) {
  return api.post<CardTemplate>(
    `/api/businesses/${businessId}/templates`,
    input,
  );
}

export function listTemplates(businessId: string) {
  return api.get<CardTemplate[]>(`/api/businesses/${businessId}/templates`);
}

export function patchTemplate(
  businessId: string,
  templateId: string,
  input: CardTemplatePatchIn,
) {
  return api.patch<CardTemplate>(
    `/api/businesses/${businessId}/templates/${templateId}`,
    input,
  );
}
