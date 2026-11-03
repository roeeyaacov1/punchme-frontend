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
  stamp?: DesignStamp;
  pattern?: "none" | "waves" | "dots" | "stripes";
  /** A rounded panel inside the strip, with the stamps on it; "" is none
   * (passbox-api v0.1.1, like everything below). */
  panel_color?: string;
  /** A built-in sticker scattered faintly behind the stamps, in place of the
   * pattern; "" is none. */
  wallpaper?: string;
  /** Where Apple Wallet shows the stamp count: under the strip, or at the top
   * beside the logo. */
  stamps_place?: "secondary" | "header";
  /** "6", or "6/8". */
  stamps_format?: "count" | "fraction";
  /** The business's name beside an uploaded logo, on Apple Wallet. */
  logo_text?: boolean;
  [key: string]: unknown;
}

/** How each stamp is drawn. Absent keys are at their defaults: a glyph in a
 * filled circle, as every card was before the options. */
export interface DesignStamp {
  glyph?: string;
  color?: string;
  /** In a filled circle, or the art on its own. */
  style?: "badge" | "icon";
  /** A check on each stamp, on a stamp on its own. */
  mark?: "none" | "check";
  /** A built-in sticker in place of the glyph; "" is none. */
  sticker?: string;
  /** The sticker or picture in shades of the stamp colour, on a stamp on its
   * own. */
  tint?: boolean;
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
  // apple_logo and logo are DIFFERENT assets, not two names for one: Apple
  // renders the wide one, Google circle-crops the square one. Previewing the
  // square badge as Apple's logo is how the app came to disagree with the
  // installed pass.
  const stateMap = (key: string): Record<string, string> | undefined => {
    const value = images[key];
    return value && typeof value === "object" ? (value as Record<string, string>) : undefined;
  };
  return {
    logo: url("logo"),
    apple_logo: url("apple_logo"),
    strip_base: url("strip_base"),
    // The literal PNGs PassKit serves, keyed by stamp state. Showing these
    // beats any client-side redraw: it IS the card.
    strip_states: stateMap("strip_states"),
    hero_states: stateMap("hero_states"),
  };
}

/** The wallet's built-in stickers (passbox-api), each with a small picture
 * as a data URL: about 750 KB in all and the same for every card, so it is
 * read once a session. Empty when the wallet can't say. */
export type StickersOut = components["schemas"]["StickersOut"];

export function getStickers(businessId: string) {
  return api.get<StickersOut>(`/api/businesses/${businessId}/stickers`);
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
