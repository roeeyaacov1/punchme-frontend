import { describe, expect, it } from "vitest";
import { ApiError } from "../../api/errors";
import { saveProblem, uploadProblem } from "./studioProblems";

describe("saveProblem", () => {
  it("places a design refusal on its field", () => {
    const error = new ApiError(422, "design.fields.3.label: String should have at most 60 characters", "design_constraint");
    expect(saveProblem(error)).toEqual({ key: "studio.problem.field", fieldIndex: 3, values: { n: 4 } });
  });

  it("says a refusal it can't place in general words, never the server's", () => {
    // A schema refusal reaches the page as its status text, or as nothing.
    expect(saveProblem(new ApiError(422, "Unprocessable Entity"))).toEqual({ key: "studio.problem.invalid" });
    expect(saveProblem(new ApiError(422, "design.fields: List should have at least 1 item", "design_constraint"))).toEqual({
      key: "studio.problem.invalid",
    });
  });

  it("says why by cause otherwise", () => {
    expect(saveProblem(new TypeError("Failed to fetch")).key).toBe("dashboard.problem.offline");
    expect(saveProblem(new ApiError(500, "")).key).toBe("dashboard.problem.server");
    expect(saveProblem(new ApiError(429, "")).key).toBe("dashboard.problem.busy");
    expect(saveProblem(new ApiError(403, "", "insufficient_role")).key).toBe("dashboard.problem.refused");
  });
});

describe("uploadProblem", () => {
  it("reads the strip's sizes from the server's refusal", () => {
    const error = new ApiError(422, "strip image must be at least 1125x432px; got 900x300");
    expect(uploadProblem("strip_base", error)).toEqual({
      key: "studio.problem.small",
      picture: "strip_base",
      values: { width: 900, height: 300 },
    });
  });

  it("names a picture the server couldn't open", () => {
    const error = new ApiError(422, "file can't be decoded as an image");
    expect(uploadProblem("logo", error)).toEqual({ key: "studio.problem.unreadable", picture: "logo" });
  });

  it("says the wallet didn't take it, or that there was no connection", () => {
    expect(uploadProblem("stamp_art", new ApiError(503, "", "wallet_unavailable")).key).toBe("studio.problem.wallet");
    expect(uploadProblem("stamp_art", new TypeError("Failed to fetch")).key).toBe("studio.problem.offline");
  });

  it("falls back to the cause, still naming the picture", () => {
    expect(uploadProblem("logo", new ApiError(500, ""))).toEqual({ key: "dashboard.problem.server", picture: "logo" });
  });
});
