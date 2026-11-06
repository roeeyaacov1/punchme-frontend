import { describe, expect, it } from "vitest";
import { LOOK_PICTURES_POLL_MS, LOOK_PICTURES_WAIT_MS, lookAgainIn, lookPicturesState } from "./lookPictures";

const pictures = { strip: "https://api/presets/x/picture/strip?v=1", hero: "https://api/presets/x/picture/hero?v=1" };

describe("a look's pictures on its shelf", () => {
  it("says nothing is drawn for a look owners don't see yet", () => {
    expect(lookPicturesState({ published: false, styled: true, pictures, savedAt: 0, now: 0 })).toEqual({ kind: "unpublished" });
  });

  it("leaves a plain look to the wizard's own colours", () => {
    expect(lookPicturesState({ published: true, styled: false, pictures: null, savedAt: 0, now: 0 })).toEqual({ kind: "plain" });
  });

  it("shows the pictures once they are drawn", () => {
    expect(lookPicturesState({ published: true, styled: true, pictures, savedAt: 0, now: 0 })).toEqual({ kind: "drawn", pictures });
  });

  it("waits two minutes after a save for the task to draw them, then says they failed", () => {
    const at = (now: number) => lookPicturesState({ published: true, styled: true, pictures: null, savedAt: 1_000, now });
    expect(at(1_000).kind).toBe("drawing");
    expect(at(1_000 + LOOK_PICTURES_WAIT_MS - 1).kind).toBe("drawing");
    expect(at(1_000 + LOOK_PICTURES_WAIT_MS).kind).toBe("failed");
  });

  it("looks again every 5 s only while they are being drawn", () => {
    expect(lookAgainIn({ kind: "drawing" })).toBe(LOOK_PICTURES_POLL_MS);
    expect(lookAgainIn({ kind: "drawn", pictures })).toBe(false);
    expect(lookAgainIn({ kind: "failed" })).toBe(false);
    expect(lookAgainIn({ kind: "unpublished" })).toBe(false);
  });
});
