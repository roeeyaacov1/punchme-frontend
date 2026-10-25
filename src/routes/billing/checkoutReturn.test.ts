import { describe, expect, it } from "vitest";
import { recentReturn } from "./checkoutReturn";

const now = Date.parse("2026-10-25T12:00:00Z");
const hour = 60 * 60 * 1000;

describe("recentReturn", () => {
  it("keeps a return from Stripe an hour ago", () => {
    const at = now - hour;
    expect(recentReturn(String(at), now)).toBe(at);
  });

  it("lets a return go once a day has passed", () => {
    expect(recentReturn(String(now - 24 * hour), now)).toBeNull();
    expect(recentReturn(String(now - 25 * hour), now)).toBeNull();
  });

  it("ignores nothing kept, or something that isn't a time", () => {
    expect(recentReturn(null, now)).toBeNull();
    expect(recentReturn("", now)).toBeNull();
    expect(recentReturn("yesterday", now)).toBeNull();
  });

  it("ignores a time still to come, from a clock that moved", () => {
    expect(recentReturn(String(now + hour), now)).toBeNull();
  });
});
