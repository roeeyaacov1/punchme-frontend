import type { DesignDoc } from "../api/designs";

/** The placeholder the wallet provider fills in when the pass is issued.
 * Design docs store the payload as a template (`"${pid}"` by default), so
 * anything rendering it client-side has to substitute first. */
export const PID_TOKEN = "${pid}";

export const DEFAULT_BARCODE_FORMAT = "QR";

/** Stand-in for design previews, where no card exists yet. Shaped like a
 * real serial so the code's module count — and therefore how dense it
 * looks — matches what an issued pass will actually carry. */
export const SAMPLE_SERIAL = "PM-SAMPLE-0000-0000";

export function barcodeFormat(design: DesignDoc | undefined): string {
  return design?.barcode?.format || DEFAULT_BARCODE_FORMAT;
}

/**
 * The string the barcode encodes.
 *
 * Pass the card `serial` — the value `/api/scan` consumes — and the result
 * is a genuinely scannable code, not a mock. Without one (the studio, the
 * marketing hero, the style guide) it falls back to the sample serial, so
 * the preview still shows a well-formed code without inventing a card that
 * doesn't exist.
 */
export function resolveBarcodePayload(
  design: DesignDoc | undefined,
  serial?: string,
): string {
  const value = serial || SAMPLE_SERIAL;
  const template = design?.barcode?.payload?.trim();
  if (!template) return value;
  // split/join rather than a regex: `${pid}` is full of characters that
  // would otherwise need escaping.
  return template.split(PID_TOKEN).join(value);
}
