import { describe, expect, it } from "vitest";
import type { DesignDoc } from "../api/designs";
import {
  DEFAULT_BARCODE_FORMAT,
  SAMPLE_SERIAL,
  barcodeFormat,
  resolveBarcodePayload,
} from "./passBarcode";

const design = (barcode: DesignDoc["barcode"]): DesignDoc => ({ barcode });

describe("barcodeFormat", () => {
  it("defaults to QR when the design says nothing", () => {
    expect(barcodeFormat(undefined)).toBe(DEFAULT_BARCODE_FORMAT);
    expect(barcodeFormat({})).toBe(DEFAULT_BARCODE_FORMAT);
    expect(barcodeFormat(design({}))).toBe(DEFAULT_BARCODE_FORMAT);
  });

  it("honours an explicit symbology", () => {
    expect(barcodeFormat(design({ format: "PDF417" }))).toBe("PDF417");
  });
});

describe("resolveBarcodePayload", () => {
  it("substitutes the serial for the ${pid} placeholder", () => {
    expect(resolveBarcodePayload(design({ payload: "${pid}" }), "ABC123")).toBe(
      "ABC123",
    );
  });

  it("substitutes inside a larger template, every occurrence", () => {
    expect(
      resolveBarcodePayload(
        design({ payload: "punchme://card/${pid}?v=${pid}" }),
        "ABC123",
      ),
    ).toBe("punchme://card/ABC123?v=ABC123");
  });

  it("falls back to the sample serial when no card exists yet", () => {
    expect(resolveBarcodePayload(design({ payload: "${pid}" }))).toBe(
      SAMPLE_SERIAL,
    );
  });

  it("encodes the bare serial when the design has no payload template", () => {
    expect(resolveBarcodePayload(undefined, "ABC123")).toBe("ABC123");
    expect(resolveBarcodePayload(design({}), "ABC123")).toBe("ABC123");
    expect(resolveBarcodePayload(design({ payload: "   " }), "ABC123")).toBe(
      "ABC123",
    );
  });

  it("leaves a template with no placeholder alone", () => {
    expect(resolveBarcodePayload(design({ payload: "STATIC" }), "ABC123")).toBe(
      "STATIC",
    );
  });

  it("never returns an empty string, which no symbology can encode", () => {
    expect(resolveBarcodePayload(undefined, "")).toBe(SAMPLE_SERIAL);
  });
});
