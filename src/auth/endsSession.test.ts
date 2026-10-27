import { describe, expect, it } from "vitest";
import { ApiError } from "../api/errors";
import { endsSession } from "./endsSession";

describe("endsSession", () => {
  it("ends the session on a 401: a refused refresh token, or one the refresh couldn't cure", () => {
    expect(endsSession(new ApiError(401, "Token is blacklisted"))).toBe(true);
  });

  it.each([403, 404, 429, 500, 502, 503])("keeps it through a %i", (status) => {
    expect(endsSession(new ApiError(status, "Not now"))).toBe(false);
  });

  it("keeps it through no answer at all", () => {
    expect(endsSession(new TypeError("Failed to fetch"))).toBe(false);
  });

  it("keeps it through a request cut off by a navigation", () => {
    expect(endsSession(new DOMException("The user aborted a request.", "AbortError"))).toBe(false);
  });

  it("keeps it through anything that isn't the server's answer", () => {
    expect(endsSession(undefined)).toBe(false);
    expect(endsSession(new SyntaxError("Unexpected token"))).toBe(false);
  });
});
