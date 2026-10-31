import { describe, expect, it } from "vitest";
import { MAP, openMove, TRAY_ROUTE } from "./mapHistory";

describe("openMove", () => {
  it("opens a tray from the map at rest as an entry of its own", () => {
    expect(openMove(null, false, "colours")).toEqual({ to: TRAY_ROUTE.colours, replace: false, state: { fromCard: true } });
  });
  it("lets a tray opened from the map take another's place, so Back still lands on the map", () => {
    expect(openMove("colours", true, "stamp")).toEqual({ to: TRAY_ROUTE.stamp, replace: true, state: { fromCard: true } });
  });
  it("puts the map under a tray arrived at by its address, and the next one on top", () => {
    expect(openMove("business", false, "colours")).toEqual({
      under: MAP,
      to: TRAY_ROUTE.colours,
      replace: false,
      state: { fromCard: true },
    });
  });
  it("marks the reward's tray, which has no address of its own", () => {
    expect(openMove(null, false, "reward")).toEqual({ to: MAP, replace: false, state: { fromCard: true, tray: "reward" } });
    expect(openMove("stamp", false, "reward")).toEqual({
      under: MAP,
      to: MAP,
      replace: false,
      state: { fromCard: true, tray: "reward" },
    });
  });
});
