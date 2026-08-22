/**
 * Reading a QR out of a live video frame, as cheaply as the browser allows.
 *
 * Two paths, because no single one covers the phones this product is sold
 * to. Chrome on Android has `BarcodeDetector` — a native, off-thread decoder
 * that takes the `<video>` element directly and costs the page nothing.
 * Safari does not, and an iPhone behind the counter is the common case, so
 * the fallback is `jsqr` over a downscaled frame.
 *
 * The fallback is a dynamic import: a landing-page visitor never downloads a
 * decoder, and the counter starts fetching it the moment the page mounts, in
 * parallel with the camera permission prompt — by the time there is a frame
 * to read, it has arrived.
 */

export interface QrDecoder {
  /** The decoded text, or null if this frame held no readable code. */
  decode(video: HTMLVideoElement): Promise<string | null>;
  /** Which path is running — surfaced only for diagnostics. */
  readonly kind: "native" | "jsqr";
}

interface BarcodeDetectorLike {
  detect(source: CanvasImageSource): Promise<{ rawValue: string }[]>;
}

interface BarcodeDetectorCtor {
  new (options?: { formats?: string[] }): BarcodeDetectorLike;
  getSupportedFormats?(): Promise<string[]>;
}

/**
 * The longest edge we hand the JS decoder.
 *
 * A 1280×720 stream comes down to 640×360 here, which still leaves roughly
 * four pixels per module for a pass barcode held at arm's length — well
 * inside what jsQR needs — while cutting the work by a factor of four. Above
 * this the decode starts costing more than the frame is worth.
 */
const MAX_EDGE = 640;

async function nativeDecoder(): Promise<QrDecoder | null> {
  const Ctor = (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
    .BarcodeDetector;
  if (!Ctor) return null;
  try {
    // Chrome ships the constructor on platforms where no decoding backend is
    // actually installed, and only says so when asked what it supports.
    const formats = (await Ctor.getSupportedFormats?.()) ?? ["qr_code"];
    if (!formats.includes("qr_code")) return null;
    const detector = new Ctor({ formats: ["qr_code"] });
    return {
      kind: "native",
      async decode(video) {
        const found = await detector.detect(video);
        return found[0]?.rawValue?.trim() || null;
      },
    };
  } catch {
    return null;
  }
}

async function jsqrDecoder(): Promise<QrDecoder> {
  const { default: jsQR } = await import("jsqr");
  const canvas = document.createElement("canvas");
  // Without this the canvas lives on the GPU and every getImageData is a
  // readback stall — the one line that decides whether this path keeps up.
  const ctx = canvas.getContext("2d", { willReadFrequently: true });

  return {
    kind: "jsqr",
    async decode(video) {
      if (!ctx) return null;
      const vw = video.videoWidth;
      const vh = video.videoHeight;
      if (!vw || !vh) return null;

      const scale = Math.min(1, MAX_EDGE / Math.max(vw, vh));
      const w = Math.max(1, Math.round(vw * scale));
      const h = Math.max(1, Math.round(vh * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.drawImage(video, 0, 0, w, h);
      const frame = ctx.getImageData(0, 0, w, h);
      // Both wallets draw the barcode dark-on-light, so the inverted pass
      // would double the work to find something that cannot be there.
      const found = jsQR(frame.data, w, h, { inversionAttempts: "dontInvert" });
      return found?.data.trim() || null;
    },
  };
}

/**
 * Picks a decoder once, up front.
 *
 * Native is tried first and can still fail on its first real frame — some
 * builds expose the constructor and then throw from `detect` — so
 * `createQrDecoder` is called again by the scanner with `preferNative: false`
 * if that happens, which lands on the fallback for the rest of the session.
 */
export async function createQrDecoder(preferNative = true): Promise<QrDecoder> {
  if (preferNative) {
    const native = await nativeDecoder();
    if (native) return native;
  }
  return jsqrDecoder();
}
