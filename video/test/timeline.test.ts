import assert from "node:assert/strict";
import { test } from "node:test";
import { BEATS, DURATION, FINAL_STAMP, PUNCHES, beatAt, beatStart } from "../src/timeline.ts";

test("the ten beats fill thirty seconds", () => {
  assert.equal(BEATS.length, 10);
  assert.equal(BEATS.reduce((sum, beat) => sum + beat.length, 0), 900);
  assert.equal(DURATION, 900);
});

test("each beat starts where the last ends", () => {
  assert.equal(beatStart("hook"), 0);
  assert.equal(beatStart("join"), 150);
  assert.equal(beatStart("stamps"), 336);
  assert.equal(beatStart("end"), 798);
});

test("a frame belongs to the beat it falls in", () => {
  assert.equal(beatAt(0), "hook");
  assert.equal(beatAt(149), "promise");
  assert.equal(beatAt(150), "join");
  assert.equal(beatAt(899), "end");
});

test("a punch at every boundary, filling the strip's first nine slots in order", () => {
  assert.equal(PUNCHES.length, 9);
  assert.deepEqual(
    PUNCHES.map((punch) => punch.slot),
    [0, 1, 2, 3, 4, 5, 6, 7, 8],
  );
  assert.deepEqual(
    PUNCHES.map((punch) => punch.at),
    BEATS.slice(1).map((beat) => beatStart(beat.id)),
  );
});

test("the tenth stamp lands on the last beat", () => {
  assert.equal(FINAL_STAMP, beatStart("end") + 30);
  assert.ok(FINAL_STAMP < DURATION);
});
