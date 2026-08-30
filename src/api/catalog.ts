import { api } from "./client";
import type { components } from "./generated/schema";

export type CatalogTemplate = components["schemas"]["CatalogTemplateOut"];
/** One entry as the editor opens it — the artwork comes with it, as data
 * URLs. The list carries `art_uses` only; the pictures are megabytes. */
export type CatalogTemplateDetail = components["schemas"]["CatalogTemplateDetailOut"];
export type CatalogTemplateIn = components["schemas"]["CatalogTemplateIn"];
export type CatalogTemplatePatchIn = components["schemas"]["CatalogTemplatePatchIn"];
export type CatalogPreviewIn = components["schemas"]["CatalogPreviewIn"];
export type DesignOut = components["schemas"]["DesignOut"];
export type CatalogImageOut = components["schemas"]["CatalogImageOut"];

/** Staff-only (is_staff) — every call 403s for regular owners; the UI gate
 * (RequireStaff) is convenience, the API check is the security boundary. */

export function listCatalog() {
  return api.get<CatalogTemplate[]>("/api/admin/catalog");
}

export function getCatalogEntry(catalogId: string) {
  return api.get<CatalogTemplateDetail>(`/api/admin/catalog/${catalogId}`);
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

/** The pictures a catalog entry may carry.
 *
 * Not `logo` or `icon`, which the owner's studio does offer: those are the
 * business's own mark, and a ready-made look that shipped one would print a
 * stranger's brand on a barber's card. Mirrors `CATALOG_ART_USES` in
 * `businesses/services.py`, which is the check that matters. */
export const CATALOG_ART_USES = [
  "strip_base",
  "stamp_art",
  "stamped_art",
  "unstamped_art",
] as const;

export type CatalogArtUse = (typeof CATALOG_ART_USES)[number];

/** Multipart, like the owner-template upload. Echoes the stored image back
 * as a data URL so the editor can show it without a second round trip. */
export function uploadCatalogImage(catalogId: string, use: CatalogArtUse, file: File) {
  const form = new FormData();
  form.append("use", use);
  form.append("file", file);
  return api.postForm<CatalogImageOut>(`/api/admin/catalog/${catalogId}/images`, form);
}

export function deleteCatalogImage(catalogId: string, use: CatalogArtUse) {
  return api.delete<void>(`/api/admin/catalog/${catalogId}/images/${use}`);
}

/** Stateless designer preview for catalog authoring — same DesignOut shape
 * (incl. lint) as the owner-template preview, no template required. */
export function previewCatalogDesign(input: CatalogPreviewIn) {
  return api.post<DesignOut>("/api/admin/catalog/preview", input);
}
