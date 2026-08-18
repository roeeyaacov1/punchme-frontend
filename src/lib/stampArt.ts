/** Client-side stamp artwork for the onboarding wizard.
 *
 * The wallet renderer knows sixteen named glyphs and, beyond those, exactly
 * one escape hatch: an uploaded `stamp_art` picture that it circle-masks into
 * each tile (apps/wallet/strips.py). These helpers turn an owner's photo or
 * logo into the small square the tile wants, here in the browser, so it can
 * be shown on the phone before the account exists and uploaded after.
 *
 * Browser-only (canvas, Image) — nothing here is unit-tested. */

/** The tile is ~150 px on the pass and the server caps art at 512 px, so
 * there is nothing to gain from a bigger picture and a lot to lose in
 * localStorage. */
export const STAMP_ART_SIZE = 512;

/** Refuse anything the browser would struggle to decode into a 512² tile. */
export const STAMP_ART_MAX_BYTES = 8 * 1024 * 1024;

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  return [canvas, ctx];
}

function decodeImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("undecodable image"));
    };
    img.src = url;
  });
}

/** True when any pixel of the drawn canvas is not fully opaque — a logo on
 * a transparent ground should stay PNG; a photo can be a smaller JPEG. */
function hasTransparency(ctx: CanvasRenderingContext2D, size: number): boolean {
  const { data } = ctx.getImageData(0, 0, size, size);
  // Sample every 16th pixel: plenty to catch a transparent corner.
  for (let i = 3; i < data.length; i += 4 * 16) {
    if (data[i] < 250) return true;
  }
  return false;
}

/** An owner's own picture → a square, cover-cropped, ≤512 px data URL.
 * Decoding through an `<img>` applies EXIF orientation the way the browser
 * does for any photo; the server then only ever sees a small upright square. */
export async function fileToStampDataUrl(file: File, size = STAMP_ART_SIZE): Promise<string> {
  if (file.size > STAMP_ART_MAX_BYTES) throw new Error("too large");
  const img = await decodeImage(file);
  const side = Math.min(img.naturalWidth, img.naturalHeight);
  if (!side) throw new Error("undecodable image");
  const target = Math.min(size, side);
  const [canvas, ctx] = makeCanvas(target);
  const sx = (img.naturalWidth - side) / 2;
  const sy = (img.naturalHeight - side) / 2;
  ctx.drawImage(img, sx, sy, side, side, 0, 0, target, target);
  return hasTransparency(ctx, target)
    ? canvas.toDataURL("image/png")
    : canvas.toDataURL("image/jpeg", 0.85);
}

/** The upload call wants a File; the draft holds a data URL. */
export function dataUrlToFile(dataUrl: string, name = "stamp"): File {
  const [head, body] = dataUrl.split(",", 2);
  const mime = /data:([^;]+)/.exec(head)?.[1] ?? "image/png";
  const binary = atob(body);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
  const ext = mime === "image/jpeg" ? "jpg" : "png";
  return new File([bytes], `${name}.${ext}`, { type: mime });
}

/** A short, stable identity for a data URL — enough to tell "the picture
 * changed" from "the same picture again" without hashing megabytes each
 * keystroke. Length plus a sampled FNV-1a over the payload. */
export function hashDataUrl(dataUrl: string): string {
  let hash = 0x811c9dc5;
  const stride = Math.max(1, Math.floor(dataUrl.length / 4096));
  for (let i = 0; i < dataUrl.length; i += stride) {
    hash ^= dataUrl.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `${dataUrl.length.toString(36)}-${hash.toString(36)}`;
}
