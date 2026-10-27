/**
 * Reading a picked file in the browser, before anything is sent: as a data
 * URL to hold until Save and show on the card at once, brought down to what
 * the renderer keeps so it fits the tab's storage, and its size, so a strip
 * under the renderer's floor is refused at the tile rather than at Save.
 * Browser-only (FileReader, Image, canvas), but `fitSize` is pure.
 */

/** Anything bigger is refused before it is read: the server normalises art
 * to 512px, so there is nothing to gain from it, and the tab would carry it. */
export const PICTURE_MAX_BYTES = 8 * 1024 * 1024;

/** The strip renderer's floor (apps/wallet/images.py, STRIP_MIN_*). */
export const STRIP_MIN = { width: 1125, height: 432 } as const;

export function readPicture(file: File): Promise<string> {
  if (file.size > PICTURE_MAX_BYTES) return Promise.reject(new Error("too large"));
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => (typeof reader.result === "string" ? resolve(reader.result) : reject(new Error("undecodable image")));
    reader.onerror = () => reject(new Error("undecodable image"));
    reader.readAsDataURL(file);
  });
}

/** Twice the logo renderer's floor (apps/wallet/images.py, LOGO_MIN_SIDE):
 * Apple draws the logo at 480×150 at most and Google's badge is 660px, so
 * nothing past this on its short side ever shows. */
const LOGO_KEEP_SIDE = 1320;

/** The renderer keeps the before and after art at 512px at most
 * (apps/wallet/images.py, ART_MAX_SIDE). */
const ART_MAX_SIDE = 512;

type Size = { width: number; height: number };

/** The pictures held for Save that can come straight from a camera. */
export type FittedUse = "logo" | "strip_base" | "stamped_art" | "unstamped_art";

function scaleFor(use: FittedUse, width: number, height: number): number {
  if (use === "logo") return LOGO_KEEP_SIDE / Math.min(width, height);
  if (use === "strip_base") return Math.max(STRIP_MIN.width / width, STRIP_MIN.height / height);
  return ART_MAX_SIDE / Math.max(width, height);
}

/**
 * The size a held picture is brought down to before it is kept, so a phone
 * photo fits the tab's storage, and no smaller than the renderer keeps: the
 * logo to 1320px on its short side, the strip to just what still covers
 * 1125×432 (which the renderer centre-crops and scales to), the art to 512px.
 * Null when it is small enough as it is.
 */
export function fitSize(use: FittedUse, width: number, height: number): Size | null {
  const scale = scaleFor(use, width, height);
  if (scale >= 1) return null;
  return { width: Math.ceil(width * scale), height: Math.ceil(height * scale) };
}

/** A held picture at `fitSize`, a JPEG staying a JPEG and anything else,
 * which may be transparent, a PNG. */
export async function fitPicture(dataUrl: string, use: FittedUse): Promise<string> {
  const image = await loadImage(dataUrl);
  const size = fitSize(use, image.naturalWidth, image.naturalHeight);
  if (!size) return dataUrl;
  const canvas = document.createElement("canvas");
  canvas.width = size.width;
  canvas.height = size.height;
  const context = canvas.getContext("2d");
  if (!context) return dataUrl;
  context.imageSmoothingQuality = "high";
  context.drawImage(image, 0, 0, size.width, size.height);
  return dataUrl.startsWith("data:image/jpeg") ? canvas.toDataURL("image/jpeg", 0.92) : canvas.toDataURL("image/png");
}

function loadImage(dataUrl: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("undecodable image"));
    image.src = dataUrl;
  });
}

export function pictureSize(dataUrl: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve({ width: image.naturalWidth, height: image.naturalHeight });
    image.onerror = () => reject(new Error("undecodable image"));
    image.src = dataUrl;
  });
}
