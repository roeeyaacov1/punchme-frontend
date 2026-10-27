import { describe, expect, it } from "vitest";
import { bothLandedSince, newerRead, syncMovedPast } from "./studioReads";

describe("bothLandedSince", () => {
  it("is true only when both reads landed after they were asked for", () => {
    expect(bothLandedSince(1000, { templates: 1200, design: 1100 })).toBe(true);
    // A failed or offline read keeps the time of the one before the save.
    expect(bothLandedSince(1000, { templates: 1200, design: 400 })).toBe(false);
    expect(bothLandedSince(1000, { templates: 400, design: 1100 })).toBe(false);
  });
});

describe("syncMovedPast", () => {
  it("waits while the sync is where it was before the save", () => {
    expect(syncMovedPast("2026-10-27T10:00:00Z", "2026-10-27T10:00:00Z")).toBe(false);
  });

  it("is past once the sync has run since", () => {
    expect(syncMovedPast("2026-10-27T10:00:00Z", "2026-10-27T10:00:04.5Z")).toBe(true);
  });

  it("is past for a card's first sync", () => {
    expect(syncMovedPast(null, "2026-10-27T10:00:04Z")).toBe(true);
  });

  it("waits for a card that has never synced", () => {
    expect(syncMovedPast(null, null)).toBe(false);
  });

  it("reads the time, not the text", () => {
    expect(syncMovedPast("2026-10-27T10:00:00+00:00", "2026-10-27T12:00:00+02:00")).toBe(false);
  });
});

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
