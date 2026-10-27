import { describe, expect, it } from "vitest";
import { fitSize } from "./pictureFiles";

describe("fitSize", () => {
  it("brings a phone photo's logo down to twice the renderer's floor on its short side", () => {
    expect(fitSize("logo", 4032, 3024)).toEqual({ width: 1760, height: 1320 });
  });

  it("leaves a logo that is small enough as it is", () => {
    expect(fitSize("logo", 1200, 900)).toBeNull();
    // A wide logo's short side is what the renderer scales by.
    expect(fitSize("logo", 4000, 500)).toBeNull();
  });

  it("brings a strip down to just what still covers 1125×432", () => {
    expect(fitSize("strip_base", 4032, 3024)).toEqual({ width: 1125, height: 844 });
    expect(fitSize("strip_base", 6000, 1000)).toEqual({ width: 2592, height: 432 });
  });

  it("brings the before and after art down to the 512px the renderer keeps", () => {
    expect(fitSize("stamped_art", 3024, 4032)).toEqual({ width: 384, height: 512 });
    expect(fitSize("unstamped_art", 400, 300)).toBeNull();
  });

  it("never takes a strip under the floor", () => {
    expect(fitSize("strip_base", 1125, 432)).toBeNull();
    const fit = fitSize("strip_base", 3375, 1297);
    expect(fit!.width).toBeGreaterThanOrEqual(1125);
    expect(fit!.height).toBeGreaterThanOrEqual(432);
  });
});
