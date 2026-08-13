import { useEffect, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { SAMPLE_SERIAL } from "../../lib/passBarcode";

/** bwip-js symbology ids for the formats qrcode.react cannot draw. */
const BCID_BY_FORMAT: Record<string, string> = {
  PDF417: "pdf417",
  AZTEC: "azteccode",
  CODE128: "code128",
};

export interface PassBarcodeProps {
  format: string;
  /** What the code encodes. A real card serial makes it genuinely
   * scannable; design previews fall back to the sample serial. */
  payload?: string;
  className?: string;
}

/**
 * The pass barcode, drawn for real in every format the design doc allows,
 * so what we render and what the wallet renders cannot disagree.
 *
 * Fills its container (`objectFit: contain`), so callers size the box.
 *
 * QR — the default, and what nearly every card uses — goes through
 * qrcode.react: a few KB, already a dependency, and crisp SVG at any size.
 * The other three symbologies need bwip-js, which is ~1MB, so it stays
 * behind a lazy import that only a card actually configured for PDF417,
 * Aztec or Code128 ever pays for. That matters most on the public pages,
 * where the customer is on a phone and the code is the whole point.
 */
export function PassBarcode({
  format,
  payload = SAMPLE_SERIAL,
  className,
}: PassBarcodeProps) {
  // Unknown formats degrade to QR rather than rendering nothing.
  if (!(format in BCID_BY_FORMAT)) {
    return (
      <QRCodeSVG
        value={payload}
        // Level M over the default L: this gets scanned off a phone screen,
        // through glare and fingerprints, and the extra redundancy costs a
        // barely denser code.
        level="M"
        title={payload}
        className={className}
        style={{ width: "100%", height: "100%" }}
      />
    );
  }
  return <BwipBarcode format={format} payload={payload} className={className} />;
}

/** The heavy path: bwip-js, loaded on demand. */
function BwipBarcode({
  format,
  payload,
  className,
}: {
  format: string;
  payload: string;
  className?: string;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("bwip-js/browser").then(({ toCanvas }) => {
      if (cancelled || !canvasRef.current) return;
      try {
        toCanvas(canvasRef.current, {
          bcid: BCID_BY_FORMAT[format],
          text: payload,
          scale: 2,
          includetext: false,
          // Aztec is 2D and sizes itself; the linear symbologies need a bar
          // height or they render as a hairline. The key has to be absent,
          // not undefined — bwip-js type-checks every option it is handed and
          // throws `invalidOptionType` on an explicit undefined, which the
          // catch below then swallowed into a silently blank canvas.
          ...(format === "AZTEC" ? {} : { height: 12 }),
        });
      } catch {
        // Unsupported input for the chosen symbology — leave the canvas
        // blank rather than crashing the preview loop.
      }
    });
    return () => {
      cancelled = true;
    };
  }, [format, payload]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
    />
  );
}
