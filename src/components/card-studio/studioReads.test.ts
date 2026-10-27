import { describe, expect, it } from "vitest";
import { newerRead } from "./studioReads";

describe("newerRead", () => {
  const was = { templates: 1000, design: 1000 };

  it("is newer when either read landed since and neither went back", () => {
    expect(newerRead(was, { templates: 1000, design: 2000 })).toBe(true);
    expect(newerRead(was, { templates: 2000, design: 2000 })).toBe(true);
  });

  it("isn't newer for the same reads", () => {
    expect(newerRead(was, { ...was })).toBe(false);
  });

  it("isn't newer while one read is older than the card the studio stands on", () => {
    // Started from what Save sent, after a re-read that failed: both reads
    // have to land again before either takes over.
    expect(newerRead({ templates: 5000, design: 5000 }, { templates: 6000, design: 1000 })).toBe(false);
  });
});
