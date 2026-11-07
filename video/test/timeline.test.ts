import assert from "node:assert/strict";
import { test } from "node:test";
import { BEATS, DURATION, FINAL_PUNCHES, PUNCHES, beatAt, beatStart } from "../src/timeline.ts";

test("nine beats fill twenty-three seconds", () => {
  assert.equal(BEATS.length, 9);
  assert.equal(BEATS.reduce((sum, beat) => sum + beat.length, 0), 690);
  assert.equal(DURATION, 690);
  assert.ok(!BEATS.some((beat) => (beat.id as string) === "proof"));
});

test("each beat starts on the beat, where the last ends", () => {
  assert.equal(beatStart("hook"), 0);
  assert.equal(beatStart("join"), 120);
  assert.equal(beatStart("stamps"), 300);
  assert.equal(beatStart("end"), 570);
  for (const beat of BEATS) assert.equal(beatStart(beat.id) % 15, 0, beat.id);
});

test("a frame belongs to the beat it falls in", () => {
  assert.equal(beatAt(0), "hook");
  assert.equal(beatAt(119), "promise");
  assert.equal(beatAt(120), "join");
  assert.equal(beatAt(689), "end");
});

test("a punch at every boundary, filling the strip's first eight slots in order", () => {
  assert.equal(PUNCHES.length, 8);
  assert.deepEqual(PUNCHES.map((punch) => punch.slot), [0, 1, 2, 3, 4, 5, 6, 7]);
  assert.deepEqual(PUNCHES.map((punch) => punch.at), BEATS.slice(1).map((beat) => beatStart(beat.id)));
});

test("the last two stamps are punched on the end card, on beats three and four", () => {
  assert.deepEqual(FINAL_PUNCHES.map((p) => p.slot), [8, 9]);
  assert.deepEqual(FINAL_PUNCHES.map((p) => p.at - beatStart("end")), [30, 45]);
});
