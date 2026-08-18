/** Client-side stamp artwork for the onboarding wizard.
 *
 * The wallet renderer knows sixteen named glyphs and, beyond those, exactly
 * one escape hatch: an uploaded `stamp_art` picture that it circle-masks into
 * each tile (apps/wallet/strips.py). So an emoji stamp is not a glyph the
 * server draws — it is a picture we draw here, once, the way the owner's own
 * device draws that emoji, and upload after sign-up. The same helpers turn an
 * owner's photo into the small square the tile wants.
 *
 * Browser-only (canvas, Image, FileReader) — nothing here is unit-tested. */

/** The tile is ~150 px on the pass and the server caps art at 512 px, so
 * there is nothing to gain from a bigger picture and a lot to lose in
 * localStorage. */
export const STAMP_ART_SIZE = 512;

/** Refuse anything the browser would struggle to decode into a 512² tile. */
export const STAMP_ART_MAX_BYTES = 8 * 1024 * 1024;

/** A first shelf of emoji that map onto the trades this product is built
 * for. Anything else can be typed into the field beside the grid. */
export const EMOJI_STAMPS = [
  "☕", "✂️", "💪", "🧘", "💅", "💇", "🧖", "🍕",
  "🍔", "🥗", "🍰", "🍦", "🍺", "🍷", "🌸", "🐾",
  "🐶", "🐱", "⭐", "❤️", "🎁", "🔥", "🚗", "📚",
];

const EMOJI_FONT =
  "'Apple Color Emoji', 'Segoe UI Emoji', 'Noto Color Emoji', 'Twemoji Mozilla', 'EmojiOne Color', sans-serif";

/** Exactly one user-perceived character (so "👨‍👩‍👧" and "👍🏽" count as one),
 * or null. `Intl.Segmenter` is in every browser this app targets; the
 * fallback only handles simple cases. */
export function singleGrapheme(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const Segmenter = (
    Intl as unknown as {
      Segmenter?: new (locale?: string, opts?: { granularity: "grapheme" }) => {
        segment: (s: string) => Iterable<{ segment: string }>;
      };
    }
  ).Segmenter;
  if (Segmenter) {
    const parts = Array.from(new Segmenter(undefined, { granularity: "grapheme" }).segment(trimmed));
    return parts.length === 1 ? parts[0].segment : null;
  }
  const chars = Array.from(trimmed);
  return chars.length <= 2 ? trimmed : null;
}

function makeCanvas(size: number): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  return [canvas, ctx];
}

/** Draw one emoji onto a transparent square, filling about 80% of it. The
 * result is a PNG data URL: it keeps the transparent corners the circle
 * mask needs, and it is what the wizard shows in the phone before the
 * upload exists. */
export function emojiToPngDataUrl(emoji: string, size = STAMP_ART_SIZE): string {
  const [canvas, ctx] = makeCanvas(size);
  let fontSize = Math.round(size * 0.78);
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  // Colour emoji ignore fillStyle, but a monochrome fallback face wouldn't.
  ctx.fillStyle = "#0E1120";
  // Shrink until the glyph fits inside the tile with a little air.
  for (let attempt = 0; attempt < 6; attempt += 1) {
    ctx.font = `${fontSize}px ${EMOJI_FONT}`;
    const width = ctx.measureText(emoji).width;
    if (width <= size * 0.86) break;
    fontSize = Math.round(fontSize * ((size * 0.86) / width));
  }
  ctx.font = `${fontSize}px ${EMOJI_FONT}`;
  // Emoji sit a touch high at "middle" in most faces; nudge down slightly.
  ctx.fillText(emoji, size / 2, size / 2 + fontSize * 0.06);
  return canvas.toDataURL("image/png");
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
