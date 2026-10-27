import { describe, expect, it } from "vitest";
import { bothLandedSince, laterSync, newerRead, publishedArt, syncMovedPast } from "./studioReads";

describe("publishedArt", () => {
  it("draws this device's copy of each picture the design read says is on the card", () => {
    const uploaded = { stamp_art: "data:stamp", stamped_art: "data:full", unstamped_art: "data:empty" };
    expect(publishedArt(["stamp_art", "stamped_art", "unstamped_art"], uploaded)).toEqual(uploaded);
  });

  it("drops a copy whose picture is no longer on the card", () => {
    expect(publishedArt(["stamped_art"], { stamp_art: "data:stamp", stamped_art: "data:full" })).toEqual({
      stamped_art: "data:full",
    });
  });

  it("has nothing to draw for a picture sent from another device", () => {
    expect(publishedArt(["unstamped_art"], {})).toEqual({});
  });
});

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

describe("laterSync", () => {
  it("takes the PATCH's answer over a read made before an earlier save's sync ran", () => {
    // The read is from before the first save; its sync ran at 10:00:04, and
    // the second save's PATCH answers with that.
    const before = laterSync("2026-10-27T10:00:00Z", "2026-10-27T10:00:04Z");
    expect(before).toBe("2026-10-27T10:00:04Z");
    // So the first save's sync no longer counts as the second's.
    expect(syncMovedPast(before, "2026-10-27T10:00:04Z")).toBe(false);
  });

  it("keeps the read when it is the later, or the only one", () => {
    expect(laterSync("2026-10-27T10:00:04Z", "2026-10-27T10:00:00Z")).toBe("2026-10-27T10:00:04Z");
    expect(laterSync("2026-10-27T10:00:00Z", null)).toBe("2026-10-27T10:00:00Z");
    expect(laterSync(null, "2026-10-27T10:00:00Z")).toBe("2026-10-27T10:00:00Z");
    expect(laterSync(null, undefined)).toBeNull();
  });

  it("reads the time, not the text", () => {
    expect(laterSync("2026-10-27T12:00:00+02:00", "2026-10-27T10:00:01Z")).toBe("2026-10-27T10:00:01Z");
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
