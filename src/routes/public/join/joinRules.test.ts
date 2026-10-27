import { describe, expect, it } from "vitest";
import { ApiError } from "../../../api/errors";
import { cardLine, isReturning, joinAnswer, phoneProblem } from "./joinRules";

describe("joinAnswer", () => {
  it("says a Free shop isn't taking customers, from the code request too", () => {
    expect(joinAnswer(new ApiError(403, "This business can't accept new members right now", "upgrade_required"))).toEqual({
      kind: "notTaking",
    });
  });

  it("says a link that leads nowhere on the sign", () => {
    expect(joinAnswer(new ApiError(404, "Not Found"))).toEqual({ kind: "dead" });
  });

  it("puts the phone's and the code's refusals under their fields", () => {
    expect(joinAnswer(new ApiError(400, "Invalid phone", "invalid_phone"))).toEqual({
      kind: "field",
      field: "phone",
      key: "enroll.phoneInvalid",
    });
    expect(joinAnswer(new ApiError(400, "Invalid code", "otp_invalid"))).toEqual({
      kind: "field",
      field: "code",
      key: "enroll.otpInvalid",
    });
  });

  it("says the rest over the button, never in the server's words", () => {
    expect(joinAnswer(new ApiError(429, "Too many", "otp_throttled"))).toEqual({ kind: "form", key: "enroll.otpThrottled" });
    expect(joinAnswer(new TypeError("Failed to fetch"))).toEqual({ kind: "form", key: "enroll.offline" });
    expect(joinAnswer(new ApiError(500, "Internal server error"))).toEqual({ kind: "form", key: "enroll.genericError" });
    expect(joinAnswer(new Error("boom"))).toEqual({ kind: "form", key: "enroll.genericError" });
  });
});

describe("phoneProblem", () => {
  it("tells an empty phone from one that isn't an Israeli mobile", () => {
    expect(phoneProblem("  ")).toBe("enroll.phoneMissing");
    expect(phoneProblem("12345")).toBe("enroll.phoneInvalid");
    expect(phoneProblem("050-123-4567")).toBeNull();
  });
});

describe("isReturning", () => {
  it("knows a card that comes back with stamps, or that the friend's join says is theirs", () => {
    expect(isReturning({ stampCount: 0 })).toBe(false);
    expect(isReturning({ stampCount: 3 })).toBe(true);
    expect(isReturning({ stampCount: 0, alreadyMember: true })).toBe(true);
  });
});

describe("cardLine", () => {
  it("picks the sentence under the card's heading", () => {
    expect(cardLine({ stamp_count: 0, stamps_required: 8, status: "active" })).toBe("new");
    expect(cardLine({ stamp_count: 3, stamps_required: 8, status: "active" })).toBe("have");
    expect(cardLine({ stamp_count: 8, stamps_required: 8, status: "reward_ready" })).toBe("full");
    expect(cardLine({ stamp_count: 9, stamps_required: 8, status: "active" })).toBe("full");
  });
});
