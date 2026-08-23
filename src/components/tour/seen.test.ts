import { describe, expect, it } from "vitest";
import { addSeen, parseSeen } from "./seen";

describe("parseSeen", () => {
  it("reads nothing out of nothing", () => {
    expect(parseSeen(null)).toEqual([]);
    expect(parseSeen("")).toEqual([]);
  });

  it("reads one context and both", () => {
    expect(parseSeen("web")).toEqual(["web"]);
    expect(parseSeen("web,app")).toEqual(["web", "app"]);
  });

  it("does not care what order they were written in", () => {
    expect(parseSeen("app,web")).toEqual(["web", "app"]);
  });

  it("drops anything it does not recognise", () => {
    // A hand-edited key should cost at most one extra tour, not a crash.
    expect(parseSeen("web, nonsense ,app")).toEqual(["web", "app"]);
    expect(parseSeen("nonsense")).toEqual([]);
  });
});

describe("addSeen", () => {
  it("records the first context", () => {
    expect(addSeen(null, "web")).toBe("web");
    expect(addSeen(null, "app")).toBe("app");
  });

  it("keeps the one already there", () => {
    expect(addSeen("web", "app")).toBe("web,app");
    expect(addSeen("app", "web")).toBe("web,app");
  });

  it("is idempotent", () => {
    expect(addSeen("web", "web")).toBe("web");
    expect(addSeen("web,app", "app")).toBe("web,app");
  });

  it("cleans up as it writes", () => {
    expect(addSeen("nonsense,web", "app")).toBe("web,app");
  });
});
