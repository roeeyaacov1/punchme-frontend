import { useEffect, useRef } from "react";

const BCID_BY_FORMAT: Record<string, string> = {
  QR: "qrcode",
  PDF417: "pdf417",
  AZTEC: "azteccode",
  CODE128: "code128",
};

export interface PreviewBarcodeProps {
  format: string;
  /** Sample payload — the real pass substitutes the member id for ${pid}. */
  payload?: string;
  className?: string;
}

/** Real barcode rendering so the preview matches what the wallet shows for
 * every supported format, not just QR. bwip-js is heavy (~1MB), so it's
 * loaded lazily — only pages that render a studio preview pay for it. */
export function PreviewBarcode({ format, payload = "PUNCHME-SAMPLE", className }: PreviewBarcodeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let cancelled = false;
    import("bwip-js/browser").then(({ toCanvas }) => {
      if (cancelled || !canvasRef.current) return;
      const is2d = format === "QR" || format === "AZTEC";
      try {
        toCanvas(canvasRef.current, {
          bcid: BCID_BY_FORMAT[format] ?? "qrcode",
          text: payload,
          scale: 2,
          height: is2d ? undefined : 12,
          includetext: false,
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
