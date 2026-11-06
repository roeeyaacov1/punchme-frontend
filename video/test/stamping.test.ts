import assert from "node:assert/strict";
import { test } from "node:test";
import { HERO_STAMPS, STAMPS_FROM, stampTimes } from "../src/stamping.ts";
import { beatStart } from "../src/timeline.ts";

test("ten stamps, each later than the last", () => {
  const times = stampTimes(0, 10);
  assert.equal(times.length, 10);
  assert.equal(times[0], 0);
  assert.ok(times.every((frame, i) => i === 0 || frame > times[i - 1]));
});

test("the gaps shrink from 300ms to about 90ms", () => {
  const times = stampTimes(0, 10);
  assert.equal(times[1] - times[0], 9);
  assert.ok(times[9] - times[8] <= 3);
  const gaps = times.slice(1).map((frame, i) => frame - times[i]);
  assert.ok(gaps.every((gap, i) => i === 0 || gap <= gaps[i - 1]));
});

test("the hero's stamps all land inside the stamps beat", () => {
  assert.equal(STAMPS_FROM, beatStart("stamps") + 30);
  assert.equal(HERO_STAMPS[0], STAMPS_FROM);
  assert.ok(HERO_STAMPS[9] < beatStart("reward") - 10);
});
