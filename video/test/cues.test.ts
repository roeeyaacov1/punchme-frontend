import assert from "node:assert/strict";
import { test } from "node:test";
import { SLAMS, cues } from "../src/cues.ts";
import { HERO_STAMPS } from "../src/stamping.ts";
import { BEATS, DURATION, FINAL_STAMP, PUNCH, PUNCHES, beatLength, type BeatId } from "../src/timeline.ts";

const all = cues();

test("no two sounds start on the same frame", () => {
  assert.equal(new Set(all.map((cue) => cue.frame)).size, all.length);
});

test("every sound starts inside the video, in order", () => {
  assert.ok(all.every((cue) => cue.frame >= 0 && cue.frame < DURATION));
  assert.ok(all.every((cue, i) => i === 0 || cue.frame > all[i - 1].frame));
});

test("a punch at every boundary and on the tenth stamp", () => {
  const punches = all.filter((cue) => cue.sound === "punch").map((cue) => cue.frame);
  assert.deepEqual(punches, [...PUNCHES.map((p) => p.at), FINAL_STAMP]);
});

test("the hole opening out sounds as it opens", () => {
  const whooshes = all.filter((cue) => cue.sound === "whoosh").map((cue) => cue.frame);
  for (const p of PUNCHES) assert.ok(whooshes.includes(p.at + PUNCH.openDelay));
});

test("each stamp has its own rising tock, on its frame", () => {
  for (let n = 1; n <= 10; n++) {
    const cue = all.find((c) => c.sound === `stamp-${n}`);
    assert.ok(cue, `stamp-${n}`);
    assert.equal(cue.frame, HERO_STAMPS[n - 1]);
  }
});

test("volumes stay between silence and full", () => {
  assert.ok(all.every((cue) => cue.volume > 0 && cue.volume <= 1));
});

test("every word lands inside its own beat, clear of the punch and the whoosh", () => {
  for (const [id, frames] of Object.entries(SLAMS) as [BeatId, number[]][]) {
    assert.ok(BEATS.some((beat) => beat.id === id));
    for (const frame of frames) assert.ok(frame > PUNCH.openDelay && frame < beatLength(id), `${id} ${frame}`);
  }
});
