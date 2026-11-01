import { describe, expect, it } from "vitest";
import { afterLetGo } from "./useSheetDrag";

describe("afterLetGo", () => {
  it("carries a sheet that closes the rest of the way down", () => {
    expect(afterLetGo(undefined, false)).toBe("out");
    expect(afterLetGo(true, false)).toBe("out");
  });
  it("leaves a sheet that closes with reduced motion to fade where it stands", () => {
    expect(afterLetGo(undefined, true)).toBe("fade");
  });
  it("brings back a sheet whose close was refused, with or without reduced motion", () => {
    expect(afterLetGo(false, false)).toBe("back");
    expect(afterLetGo(false, true)).toBe("back");
  });
});
