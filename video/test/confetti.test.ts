import assert from "node:assert/strict";
import { test } from "node:test";
import { confetti } from "../src/confetti.ts";

const origin = { x: 540, y: 1000 };

test("nothing before the burst, everything at its origin on its first frame", () => {
  assert.equal(confetti(99, 100, origin).length, 0);
  const first = confetti(100, 100, origin);
  assert.equal(first.length, 32);
  assert.ok(first.every((bit) => Math.hypot(bit.x - origin.x, bit.y - origin.y) < 1));
});

test("the same burst every render", () => {
  assert.deepEqual(confetti(110, 100, origin), confetti(110, 100, origin));
});

test("the bits fly out, then fall, then are gone", () => {
  const out = confetti(106, 100, origin);
  assert.ok(out.some((bit) => Math.hypot(bit.x - origin.x, bit.y - origin.y) > 150));
  const late = confetti(125, 100, origin);
  const mid = confetti(115, 100, origin);
  assert.ok(late.reduce((s, b) => s + b.y, 0) > mid.reduce((s, b) => s + b.y, 0));
  assert.equal(confetti(140, 100, origin).length, 0);
});
