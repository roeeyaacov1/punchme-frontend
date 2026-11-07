import assert from "node:assert/strict";
import { test } from "node:test";
import { BAR, BEAT, KICKS, pulse } from "../src/beat.ts";
import { DURATION, beatStart } from "../src/timeline.ts";

test("120 BPM at 30 fps: a beat is fifteen frames, a bar sixty", () => {
  assert.equal(BEAT, 15);
  assert.equal(BAR, 60);
});

test("every kick is on the beat, inside the video", () => {
  assert.ok(KICKS.length > 20);
  assert.ok(KICKS.every((frame) => frame % BEAT === 0 && frame >= 0 && frame < DURATION));
});

test("the reward is the drop: a kick on its first frame, after a bar without one", () => {
  const drop = beatStart("reward");
  assert.ok(KICKS.includes(drop));
  assert.ok(!KICKS.some((frame) => frame > drop - BAR && frame < drop));
});

test("the picture pulses with each kick and settles before the next beat", () => {
  const kick = KICKS[3];
  assert.equal(pulse(kick), 1);
  assert.ok(pulse(kick + 2) < 1 && pulse(kick + 2) > 0);
  assert.equal(pulse(kick + 8), 0);
  assert.equal(pulse(kick - 1), 0);
});
