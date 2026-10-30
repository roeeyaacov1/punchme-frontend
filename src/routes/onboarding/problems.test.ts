import { describe, expect, it } from "vitest";
import { ApiError } from "../../api/errors";
import { checkoutProblemKey, saveProblemKey } from "./problems";

describe("saveProblemKey", () => {
  it("places a refused save on the business's name", () => {
    expect(saveProblemKey(new ApiError(422, "Unprocessable Entity"))).toBe("onboarding.account.problem.name");
  });

  it("says no connection, a server down and too many tries by their cause", () => {
    expect(saveProblemKey(new TypeError("Failed to fetch"))).toBe("dashboard.problem.offline");
    expect(saveProblemKey(new ApiError(500, "Internal Server Error"))).toBe("dashboard.problem.server");
    expect(saveProblemKey(new ApiError(429, "Too Many Requests"))).toBe("dashboard.problem.busy");
  });

  it("never reads the error's own words", () => {
    expect(saveProblemKey(new Error("Unprocessable Entity"))).toBe("dashboard.problem.other");
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
