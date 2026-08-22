import { describe, expect, it } from "vitest";
import { ApiError } from "../api/errors";
import {
  classifyScanError,
  readScannedPayload,
  REPEAT_WINDOW_MS,
  shouldAcceptCode,
} from "./scan";

/** The real shape: `secrets.token_urlsafe(24)`. */
const SERIAL = "hE2wQ8mLpZ4vT7yRbN1cKdXf";

describe("readScannedPayload", () => {
  it("takes a bare card code", () => {
    expect(readScannedPayload(SERIAL)).toEqual({ kind: "code", code: SERIAL });
  });

  it("keeps the url-safe alphabet a serial is generated from", () => {
    const withBoth = "ab-cd_ef-GH_12";
    expect(readScannedPayload(withBoth)).toEqual({
      kind: "code",
      code: withBoth,
    });
  });

  it("trims the whitespace a manual entry arrives with", () => {
    expect(readScannedPayload(`  ${SERIAL}\n`)).toEqual({
      kind: "code",
      code: SERIAL,
    });
  });

  it("unwraps a card code from the public card page's url", () => {
    expect(readScannedPayload(`https://punchme.co.il/c/${SERIAL}`)).toEqual({
      kind: "code",
      code: SERIAL,
    });
    expect(readScannedPayload(`https://punchme.co.il/c/${SERIAL}/`)).toEqual({
      kind: "code",
      code: SERIAL,
    });
  });

  it("names the shop's own sign-up poster instead of reporting it missing", () => {
    expect(readScannedPayload("https://punchme.co.il/join/abc-123")).toEqual({
      kind: "enrollLink",
    });
  });

  it("turns down anything that isn't a code, without a request", () => {
    for (const raw of [
      "",
      "   ",
      "https://example.com/promo",
      "WIFI:S:cafe;T:WPA;P:hunter2;;",
      "tel:+972501234567",
      "javascript:alert(1)",
      "two words",
      "short",
      "a".repeat(129),
    ]) {
      expect(readScannedPayload(raw)).toEqual({ kind: "foreign" });
    }
  });
});

describe("shouldAcceptCode", () => {
  it("accepts the first code it ever sees", () => {
    expect(shouldAcceptCode(SERIAL, null, 1_000)).toBe(true);
  });

  it("ignores the same code while the phone is still pointed at it", () => {
    const last = { code: SERIAL, at: 1_000 };
    expect(shouldAcceptCode(SERIAL, last, 1_100)).toBe(false);
    expect(shouldAcceptCode(SERIAL, last, 1_000 + REPEAT_WINDOW_MS - 1)).toBe(
      false,
    );
  });

  it("takes the same code again once the window has passed", () => {
    const last = { code: SERIAL, at: 1_000 };
    expect(shouldAcceptCode(SERIAL, last, 1_000 + REPEAT_WINDOW_MS)).toBe(true);
  });

  it("takes the next customer's card immediately — that is the whole point", () => {
    const last = { code: SERIAL, at: 1_000 };
    expect(shouldAcceptCode("someoneElsesCard", last, 1_001)).toBe(true);
  });
});

describe("classifyScanError", () => {
  it("reads the status, because the body carries no code", () => {
    expect(classifyScanError(new ApiError(404, "Card not found"))).toBe(
      "unknownCard",
    );
    expect(
      classifyScanError(new ApiError(429, "This card was stamped too recently")),
    ).toBe("tooSoon");
    expect(
      classifyScanError(
        new ApiError(409, "Card must be redeemed before it can be stamped again"),
      ),
    ).toBe("conflict");
  });

  it("falls back to a plain failure for anything else", () => {
    expect(classifyScanError(new ApiError(500, "Server error"))).toBe("failed");
    expect(classifyScanError(new TypeError("Failed to fetch"))).toBe("failed");
    expect(classifyScanError(undefined)).toBe("failed");
  });
});
