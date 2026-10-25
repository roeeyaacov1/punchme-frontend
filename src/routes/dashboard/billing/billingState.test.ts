import { describe, expect, it } from "vitest";
import { ApiError } from "../../../api/errors";
import { billingState, redirectProblem } from "./billingState";

const free = (status: string) => billingState({ plan: "free", status });
const pro = (status: string) => billingState({ plan: "pro", status });

describe("billingState", () => {
  it("reads a business that never paid as not live", () => {
    expect(free("none")).toBe("notLive");
  });

  it("reads a checkout that never finished as a last try unfinished", () => {
    expect(free("incomplete")).toBe("unfinished");
    expect(free("incomplete_expired")).toBe("unfinished");
  });

  it("reads a subscription that was cancelled as ended", () => {
    expect(free("canceled")).toBe("ended");
  });

  it("sends every other status on Free to the portal, never a second checkout", () => {
    expect(free("past_due")).toBe("paymentFailed");
    expect(free("unpaid")).toBe("paymentFailed");
    expect(free("paused")).toBe("paymentFailed");
    // A word Stripe adds after this was written is still bound on the
    // server, so it is still not safe to pay again.
    expect(free("some_word_from_next_year")).toBe("paymentFailed");
  });

  it("reads Pro with a subscription as live, whatever Stripe calls it", () => {
    expect(pro("active")).toBe("live");
    expect(pro("trialing")).toBe("live");
    expect(pro("past_due")).toBe("live");
  });

  it("reads Pro with no subscription as live with nothing to manage", () => {
    expect(pro("none")).toBe("unbilled");
  });
});

describe("redirectProblem", () => {
  it("says Stripe can't be reached, and nothing was charged, on a 503", () => {
    const error = new ApiError(503, "Billing is temporarily unavailable", "billing_unavailable");
    expect(redirectProblem(error, "checkout")).toBe("unavailable");
    expect(redirectProblem(error, "portal")).toBe("unavailable");
  });

  it("reads the portal's 400 as no billing to manage yet", () => {
    const error = new ApiError(400, "No billing has been started for this business yet");
    expect(redirectProblem(error, "portal")).toBe("noCustomer");
  });

  it("never says a checkout has nothing to manage", () => {
    expect(redirectProblem(new ApiError(400, "Bad request"), "checkout")).toBe("unreachable");
  });

  it("calls no connection, or anything else, unreachable", () => {
    expect(redirectProblem(new TypeError("Failed to fetch"), "checkout")).toBe("unreachable");
    expect(redirectProblem(new ApiError(500, "Server error"), "portal")).toBe("unreachable");
  });
});
