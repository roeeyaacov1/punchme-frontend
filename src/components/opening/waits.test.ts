import { describe, expect, it } from "vitest";
import { appearAt, createOpeningStore, leaveAt, OPENING, shows } from "./waits";

describe("when the stamps show", () => {
  it("shows nothing on an open faster than the threshold", () => {
    // A warm desk open, measured: the shell at 0.25 s, or 0.75 s with a
    // 150 ms round trip to the API.
    expect(shows(0, 250)).toBe(false);
    expect(shows(0, 750)).toBe(false);
    expect(shows(0, OPENING.appearAfter)).toBe(false);
  });

  it("shows them on a slower one, and while the waits are not over", () => {
    expect(shows(0, 1000)).toBe(true);
    expect(shows(0, 3900)).toBe(true);
    expect(shows(0, null)).toBe(true);
  });

  it("counts the threshold from the opening's own start", () => {
    // After a sign-in the opening begins when the first wait takes hold.
    expect(appearAt(5000)).toBe(5900);
    expect(shows(5000, 5750)).toBe(false);
  });
});

describe("when the layer gives way", () => {
  it("gives way as soon as the waits are over when nothing showed", () => {
    expect(leaveAt(250, null)).toBe(250);
  });

  it("holds an open that lands just after the stamps appeared", () => {
    // Shown at 0.9 s, the shell there at 1 s: it waits out the 0.4 s.
    expect(leaveAt(1000, 900)).toBe(1300);
  });

  it("never holds a long open back", () => {
    expect(leaveAt(3900, 900)).toBe(3900);
  });
});

/** A store on a clock and a frame the test moves by hand. */
function store() {
  let time = 0;
  let frames: (() => void)[] = [];
  const opening = createOpeningStore({
    now: () => time,
    nextFrame: (callback) => {
      frames.push(callback);
      return () => {
        frames = frames.filter((frame) => frame !== callback);
      };
    },
  });
  const frame = () => {
    const due = frames;
    frames = [];
    due.forEach((callback) => callback());
  };
  return {
    opening,
    frame,
    at: (ms: number) => {
      time = ms;
    },
  };
}

describe("the opening's store", () => {
  it("counts a cold open from the tap", () => {
    const { opening, at } = store();
    at(1370);
    opening.hold({ fromLoad: true });
    expect(opening.state()).toEqual({ run: 1, origin: 0, overAt: null });
  });

  it("is not over while one wait hands over to the next", () => {
    const { opening, frame, at } = store();
    const route = opening.hold({ fromLoad: true });
    at(2000);
    // The router's stand-in lets go and the start-up check takes hold, in
    // one commit.
    route();
    const check = opening.hold({ fromLoad: true });
    frame();
    expect(opening.state().overAt).toBeNull();
    at(2500);
    check();
    const business = opening.hold();
    frame();
    expect(opening.state()).toEqual({ run: 1, origin: 0, overAt: null });
    at(3900);
    business();
    expect(opening.state().overAt).toBeNull();
    frame();
    expect(opening.state()).toEqual({ run: 1, origin: 0, overAt: 3900 });
  });

  it("is not over when a wait lets go twice", () => {
    const { opening, frame } = store();
    const one = opening.hold();
    const two = opening.hold();
    one();
    one();
    frame();
    expect(opening.state().overAt).toBeNull();
    two();
    frame();
    expect(opening.state().overAt).not.toBeNull();
  });

  it("counts a later opening from its first wait", () => {
    const { opening, frame, at } = store();
    const first = opening.hold({ fromLoad: true });
    first();
    frame();
    opening.end(opening.state().run);
    // Signed out, then in again: the business is read once more.
    at(60_000);
    opening.hold({ fromLoad: true });
    expect(opening.state()).toEqual({ run: 2, origin: 60_000, overAt: null });
  });

  it("goes on when a wait takes hold again before the layer has gone", () => {
    const { opening, frame, at } = store();
    const first = opening.hold();
    at(1000);
    first();
    frame();
    expect(opening.state().overAt).toBe(1000);
    opening.hold();
    expect(opening.state()).toEqual({ run: 1, origin: 0, overAt: null });
  });

  it("starts the next opening at once if a wait holds as the layer ends", () => {
    const { opening, frame, at } = store();
    const first = opening.hold();
    first();
    frame();
    // Giving way, and a new wait comes before the fade has ended.
    at(1500);
    opening.hold();
    opening.end(opening.state().run);
    expect(opening.state()).toEqual({ run: 2, origin: 1500, overAt: null });
  });

  it("ends each opening once", () => {
    const { opening, frame, at } = store();
    const first = opening.hold();
    first();
    frame();
    at(1500);
    opening.hold();
    // The fade's end and the timer behind it both report.
    opening.end(1);
    opening.end(1);
    expect(opening.state()).toEqual({ run: 2, origin: 1500, overAt: null });
  });

  it("tells its listeners", () => {
    const { opening, frame } = store();
    let heard = 0;
    const stop = opening.subscribe(() => heard++);
    const wait = opening.hold();
    wait();
    frame();
    opening.end(opening.state().run);
    stop();
    opening.hold();
    expect(heard).toBe(3);
  });
});
