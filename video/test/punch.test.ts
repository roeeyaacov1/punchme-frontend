import assert from "node:assert/strict";
import { test } from "node:test";
import { DIE_R, SLOT, discFlight, holeRadius, pressScale, shake, slotCenter, stampsLanded } from "../src/punch.ts";
import { DURATION, FINAL_PUNCHES, PUNCH, PUNCHES } from "../src/timeline.ts";

const first = PUNCHES[0];

test("the strip's first slot is the first in reading order", () => {
  assert.deepEqual(slotCenter(0, false), { x: 153, y: 262 });
  assert.deepEqual(slotCenter(0, true), { x: 927, y: 262 });
  assert.deepEqual(slotCenter(9, false), { x: 927, y: 262 });
  assert.equal(slotCenter(1, false).x - slotCenter(0, false).x, SLOT.size + SLOT.gap);
});

test("the hole: none before the punch, the die's size at it, the whole frame after", () => {
  assert.equal(holeRadius(first.at - 1, first), 0);
  assert.equal(holeRadius(first.at, first), DIE_R);
  assert.equal(holeRadius(first.at + PUNCH.openDelay, first), DIE_R);
  const after = holeRadius(first.at + PUNCH.openDelay + PUNCH.open, first);
  const corners = [
    [0, 0],
    [1080, 0],
    [0, 1920],
    [1080, 1920],
  ].map(([x, y]) => Math.hypot(x - first.cx, y - first.cy));
  assert.ok(after >= Math.max(...corners));
});

test("the scene gives just before the punch, and only then", () => {
  assert.equal(pressScale(first.at - PUNCH.press - 1, first), 1);
  assert.ok(Math.abs(pressScale(first.at - 0.0001, first) - 0.985) < 0.001);
  assert.equal(pressScale(first.at, first), 1);
});

test("the camera shakes for three frames at a punch", () => {
  assert.deepEqual(shake(first.at), { x: 14, y: -8 });
  assert.deepEqual(shake(first.at + 1), { x: -9, y: 6 });
  assert.deepEqual(shake(first.at + 2), { x: 4, y: -2 });
  assert.deepEqual(shake(first.at + 3), { x: 0, y: 0 });
  assert.deepEqual(shake(first.at - 1), { x: 0, y: 0 });
});

test("the disc flies from the punch to its slot, mirrored in Hebrew", () => {
  assert.equal(discFlight(first.at - 1, first, false), null);
  const start = discFlight(first.at, first, false);
  assert.deepEqual(start && { x: start.x, y: start.y, scale: start.scale }, { x: first.cx, y: first.cy, scale: 1 });
  const late = discFlight(first.at + PUNCH.flight - 0.001, first, true);
  assert.ok(late && Math.abs(late.x - slotCenter(0, true).x) < 1 && Math.abs(late.y - 262) < 1);
  assert.ok(late && late.rotate < 0);
  assert.equal(discFlight(first.at + PUNCH.flight, first, false), null);
});

test("stamps land one per punch, the last two on the end card", () => {
  assert.equal(stampsLanded(0), 0);
  assert.equal(stampsLanded(first.at + PUNCH.flight - 1), 0);
  assert.equal(stampsLanded(first.at + PUNCH.flight), 1);
  assert.equal(stampsLanded(FINAL_PUNCHES[1].at + PUNCH.flight - 1), 9);
  assert.equal(stampsLanded(DURATION - 1), 10);
});
