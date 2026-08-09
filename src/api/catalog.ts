import { api } from "./client";
import type { components } from "./generated/schema";

export type CatalogTemplate = components["schemas"]["CatalogTemplateOut"];
export type CatalogTemplateIn = components["schemas"]["CatalogTemplateIn"];
export type CatalogTemplatePatchIn = components["schemas"]["CatalogTemplatePatchIn"];
export type CatalogPreviewIn = components["schemas"]["CatalogPreviewIn"];
export type DesignOut = components["schemas"]["DesignOut"];

/** Staff-only (is_staff) — every call 403s for regular owners; the UI gate
 * (RequireStaff) is convenience, the API check is the security boundary. */

export function listCatalog() {
  return api.get<CatalogTemplate[]>("/api/admin/catalog");
}

export function getCatalogEntry(catalogId: string) {
  return api.get<CatalogTemplate>(`/api/admin/catalog/${catalogId}`);
}

export function createCatalogEntry(input: CatalogTemplateIn) {
  return api.post<CatalogTemplate>("/api/admin/catalog", input);
}

export function patchCatalogEntry(catalogId: string, input: CatalogTemplatePatchIn) {
  return api.patch<CatalogTemplate>(`/api/admin/catalog/${catalogId}`, input);
}

export function deleteCatalogEntry(catalogId: string) {
  return api.delete<void>(`/api/admin/catalog/${catalogId}`);
}

export function reorderCatalog(ids: string[]) {
  return api.post<CatalogTemplate[]>("/api/admin/catalog/reorder", { ids });
}

/** Stateless designer preview for catalog authoring — same DesignOut shape
 * (incl. lint) as the owner-template preview, no template required. */
export function previewCatalogDesign(input: CatalogPreviewIn) {
  return api.post<DesignOut>("/api/admin/catalog/preview", input);
}
