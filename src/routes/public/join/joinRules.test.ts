import { describe, expect, it } from "vitest";
import { ApiError } from "../../../api/errors";
import { birthdayProblem, cardLine, isReturning, joinAnswer, localDay, phoneProblem, stepDirection } from "./joinRules";

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
    expect(joinAnswer(new ApiError(422, "Implausible birthday: 2030-01-01", "invalid_birthday"))).toEqual({
      kind: "field",
      field: "birthday",
      key: "enroll.birthdayInvalid",
    });
  });

  it("says the rest over the button, never in the server's words", () => {
    expect(joinAnswer(new ApiError(429, "Too many", "otp_throttled"))).toEqual({ kind: "form", key: "enroll.otpThrottled" });
    expect(joinAnswer(new TypeError("Failed to fetch"))).toEqual({ kind: "form", key: "enroll.offline" });
    expect(joinAnswer(new ApiError(500, "Internal server error"))).toEqual({ kind: "form", key: "enroll.genericError" });
    expect(joinAnswer(new Error("boom"))).toEqual({ kind: "form", key: "enroll.genericError" });
  });

  it("says the address's own throttle and a down SMS service as what they are", () => {
    expect(joinAnswer(new ApiError(429, "Too many requests"))).toEqual({ kind: "form", key: "onboarding.account.throttled" });
    expect(joinAnswer(new ApiError(503, "SMS delivery is temporarily unavailable", "sms_unavailable"))).toEqual({
      kind: "form",
      key: "enroll.smsUnavailable",
    });
  });
});

describe("phoneProblem", () => {
  it("tells an empty phone from one that isn't an Israeli mobile", () => {
    expect(phoneProblem("  ")).toBe("enroll.phoneMissing");
    expect(phoneProblem("12345")).toBe("enroll.phoneInvalid");
    expect(phoneProblem("050-123-4567")).toBeNull();
  });
});

describe("birthdayProblem", () => {
  const today = "2026-10-29";

  it("lets an empty birthday through: it is optional", () => {
    expect(birthdayProblem("", today)).toBeNull();
  });

  it("takes a past birthday back to 1900, as the API does", () => {
    expect(birthdayProblem("1990-05-17", today)).toBeNull();
    expect(birthdayProblem("1900-01-01", today)).toBeNull();
    expect(birthdayProblem("2026-10-28", today)).toBeNull();
  });

  it("refuses today, a future date, a date before 1900 and a year past four digits", () => {
    expect(birthdayProblem(today, today)).toBe("enroll.birthdayInvalid");
    expect(birthdayProblem("2062-05-17", today)).toBe("enroll.birthdayInvalid");
    expect(birthdayProblem("1899-12-31", today)).toBe("enroll.birthdayInvalid");
    expect(birthdayProblem("20000-01-01", today)).toBe("enroll.birthdayInvalid");
  });
});

describe("localDay", () => {
  it("writes the phone's own day as the date field does", () => {
    expect(localDay(new Date(2026, 0, 5, 23, 30))).toBe("2026-01-05");
    expect(localDay(new Date(2026, 11, 31, 0, 5))).toBe("2026-12-31");
  });
});

describe("isReturning", () => {
  it("knows a card that comes back with stamps, or that the friend's join says is theirs", () => {
    expect(isReturning({ stampCount: 0 })).toBe(false);
    expect(isReturning({ stampCount: 3 })).toBe(true);
    expect(isReturning({ stampCount: 0, alreadyMember: true })).toBe(true);
  });
});

describe("stepDirection", () => {
  it("goes forward from the sign to the form, the code and the card", () => {
    expect(stepDirection("sign", "form")).toBe("forward");
    expect(stepDirection("form", "code")).toBe("forward");
    expect(stepDirection("code", "card")).toBe("forward");
    expect(stepDirection("form", "card")).toBe("forward");
  });

  it("goes back on 'Edit number', a refused phone, and the sign holding an answer", () => {
    expect(stepDirection("code", "form")).toBe("back");
    expect(stepDirection("form", "held")).toBe("back");
    expect(stepDirection("code", "held")).toBe("back");
  });

  it("doesn't move between the sign and the sign holding an answer", () => {
    expect(stepDirection("sign", "held")).toBeNull();
    expect(stepDirection("form", "form")).toBeNull();
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
