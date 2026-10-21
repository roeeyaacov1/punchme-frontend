import { describe, expect, it } from "vitest";
import { ApiError } from "../../../api/errors";
import { failureCause } from "./answer";

describe("failureCause", () => {
  it("reads a request that never got an answer as no connection", () => {
    expect(failureCause(new TypeError("Failed to fetch"))).toBe("offline");
  });

  it("reads every 5xx as the server not answering", () => {
    for (const status of [500, 502, 503, 504]) {
      expect(failureCause(new ApiError(status, "Bad Gateway"))).toBe("server");
    }
  });

  it("reads a 403 as this account being turned away", () => {
    expect(failureCause(new ApiError(403, "Insufficient role", "insufficient_role"))).toBe("refused");
  });

  it("never carries the server's own sentence: anything else is a plain failure", () => {
    expect(failureCause(new ApiError(400, "Invalid serial"))).toBe("other");
    expect(failureCause(new ApiError(422, "Unprocessable Entity"))).toBe("other");
  });

  it("does not blame the network for a mistake of the page's own", () => {
    expect(failureCause(new Error("boom"))).toBe("other");
    expect(failureCause(undefined)).toBe("other");
  });
});
