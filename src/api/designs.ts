import { api } from "./client";
import type { components } from "./generated/schema";

export type DesignOut = components["schemas"]["DesignOut"];
export type DesignPreviewIn = components["schemas"]["DesignPreviewIn"];
export type TemplateImageOut = components["schemas"]["TemplateImageOut"];

/** The canonical design doc (CardTemplate.design). The backend fills
 * defaults for any missing key — see apps/wallet/design.py. The index
 * signature keeps it assignable to the generated schema's plain-dict
 * `design` fields. */
export interface DesignDoc {
  organization_name?: string;
  description?: string;
  default_language?: "HE" | "EN";
  fields?: DesignField[];
  barcode?: DesignBarcode;
  stamp?: { glyph?: string; color?: string };
  pattern?: "none" | "waves" | "dots" | "stripes";
  [key: string]: unknown;
}

export interface DesignField {
  binding: string;
  label?: string;
  section?:
    | "HEADER_FIELDS"
    | "PRIMARY_FIELDS"
    | "SECONDARY_FIELDS"
    | "AUXILIARY_FIELDS"
    | "BACK_FIELDS";
  alignment?: "NATURAL" | "LEFT" | "CENTER" | "RIGHT";
  default_value?: string;
  change_message?: string;
}

export interface DesignBarcode {
  format?: "QR" | "PDF417" | "AZTEC" | "CODE128";
  payload?: string;
  alt_text?: string;
}

/** The hosted image URLs out of a DesignOut (`images` is a plain dict).
 * Stamp art isn't in there — it's echoed back as a data URL by the upload
 * call, so callers merge that in themselves. */
export function designImageUrls(design: DesignOut | undefined) {
  const images = (design?.images ?? {}) as Record<string, unknown>;
  const url = (key: string) =>
    typeof images[key] === "string" ? (images[key] as string) : undefined;
  return { logo: url("logo"), strip_base: url("strip_base") };
}

/** Image upload uses the backend accepts (POST .../images). */
export type ImageUse =
  | "logo"
  | "icon"
  | "strip_base"
  | "stamp_art"
  | "stamped_art"
  | "unstamped_art";

export function getTemplateDesign(
  businessId: string,
  templateId: string,
  stampState?: number,
) {
  return api.get<DesignOut>(
    `/api/businesses/${businessId}/templates/${templateId}/design`,
    { query: { stamp_state: stampState } },
  );
}

/** Stateless live preview — applies candidate changes in memory only;
 * nothing is saved and no wallet provider is called. This is the editor's
 * debounced live-edit loop. */
export function previewTemplateDesign(
  businessId: string,
  templateId: string,
  body: DesignPreviewIn,
) {
  return api.post<DesignOut>(
    `/api/businesses/${businessId}/templates/${templateId}/design/preview`,
    body,
  );
}

/** Multipart upload straight to the backend (which hosts card art on the
 * wallet provider's CDN / the template row — Cloudinary is not involved). */
export function uploadTemplateImage(
  businessId: string,
  templateId: string,
  use: ImageUse,
  file: File,
) {
  const form = new FormData();
  form.append("use", use);
  form.append("file", file);
  return api.postForm<TemplateImageOut>(
    `/api/businesses/${businessId}/templates/${templateId}/images`,
    form,
  );
}
