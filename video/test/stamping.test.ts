import assert from "node:assert/strict";
import { test } from "node:test";
import { HERO_STAMPS } from "../src/stamping.ts";
import { beatStart } from "../src/timeline.ts";

const SIXTEENTH = 3.75;

test("ten stamps, each later than the last", () => {
  assert.equal(HERO_STAMPS.length, 10);
  assert.ok(HERO_STAMPS.every((frame, i) => i === 0 || frame > HERO_STAMPS[i - 1]));
});

test("every stamp lands on the beat's sixteenth-note grid, eighths first, then sixteenths", () => {
  for (const frame of HERO_STAMPS) assert.ok(Math.abs(frame / SIXTEENTH - Math.round(frame / SIXTEENTH)) * SIXTEENTH <= 0.5 + 1e-9, String(frame));
  const gaps = HERO_STAMPS.slice(1).map((frame, i) => frame - HERO_STAMPS[i]);
  assert.ok(gaps.every((gap, i) => i === 0 || gap <= gaps[i - 1] + 1));
  assert.ok(gaps[0] >= 7 && gaps[gaps.length - 1] <= 4);
});

test("the run starts after the scan's flash and ends before the next punch", () => {
  assert.ok(HERO_STAMPS[0] > beatStart("stamps") + 30);
  assert.ok(HERO_STAMPS[9] < beatStart("reward") - 5);
});
