import { describe, expect, it } from "vitest";
import { ApiError } from "../../api/errors";
import { checkoutProblemKey, saveProblem } from "./problems";

const card = { name: "Rothschild Coffee" };

describe("saveProblem", () => {
  it("places a refused picture on the stamp", () => {
    const error = new ApiError(422, "file can't be decoded as an image", "invalid_image");
    expect(saveProblem(error, card)).toEqual({ key: "onboarding.account.problem.picture", fix: "stamp" });
  });

  it("places a refusal on the name only when the name is over the API's limit", () => {
    // A draft from before the field held 120 characters.
    const long = { name: "מ".repeat(121) };
    expect(saveProblem(new ApiError(422, "Unprocessable Entity"), long)).toEqual({
      key: "onboarding.account.problem.name",
      fix: "name",
    });
    expect(saveProblem(new ApiError(422, "Unprocessable Entity"), card)).toEqual({
      key: "onboarding.account.problem.invalid",
    });
    expect(saveProblem(new ApiError(422, "design.fields: List should have at least 1 item", "design_constraint"), card)).toEqual({
      key: "onboarding.account.problem.invalid",
    });
  });

  it("says no connection, a server down and too many tries by their cause", () => {
    expect(saveProblem(new TypeError("Failed to fetch"), card)).toEqual({ key: "dashboard.problem.offline" });
    expect(saveProblem(new ApiError(500, "Internal Server Error"), card)).toEqual({ key: "dashboard.problem.server" });
    expect(saveProblem(new ApiError(429, "Too Many Requests"), card)).toEqual({ key: "dashboard.problem.busy" });
  });

  it("never reads the error's own words", () => {
    expect(saveProblem(new Error("Unprocessable Entity"), card)).toEqual({ key: "dashboard.problem.other" });
  });
});

describe("checkoutProblemKey", () => {
  it("says Stripe can't be reached, and nothing was charged, on a 503", () => {
    expect(checkoutProblemKey(new ApiError(503, "Service Unavailable"))).toBe("billing.problem.unavailable");
  });

  it("says anything else by its cause", () => {
    expect(checkoutProblemKey(new TypeError("Failed to fetch"))).toBe("dashboard.problem.offline");
    expect(checkoutProblemKey(new ApiError(403, "Forbidden"))).toBe("dashboard.problem.refused");
  });
});
