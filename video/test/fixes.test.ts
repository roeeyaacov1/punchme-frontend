import assert from "node:assert/strict";
import { test } from "node:test";
import { HOOK_LEAD, SLAMS, MOMENTS } from "../src/cues.ts";
import { LOCK, LOCK_STAGE } from "../src/layout.ts";
import { slam } from "../src/motion.ts";
import { STRIP_HANDOFF, panelGold, slotGold } from "../src/strip.ts";

test("the video opens on its first words, so the first frame is never an empty wall", () => {
  assert.equal(SLAMS.hook![0], 0);
  assert.equal(slam(0, 0).opacity, 1);
  assert.equal(slam(-1, 0).opacity, 0);
  // Already into its landing on frame 0, so the first picture fits the frame.
  const first = slam(0, SLAMS.hook![0] - HOOK_LEAD);
  assert.equal(first.opacity, 1);
  assert.ok(first.scale <= 1.05, String(first.scale));
});

test("the lock screen's own label stays above the bottom 320px", () => {
  assert.ok(LOCK.top + LOCK_STAGE.labelBottom * LOCK.s <= 1920 - 320);
  assert.ok(LOCK.top + LOCK_STAGE.h * LOCK.s <= 1920 - 320 + 1);
});

test("the strip is wholly gold, panel and every slot, by the time the end beat takes it", () => {
  for (let i = 0; i < 10; i++) assert.equal(slotGold(STRIP_HANDOFF - 1, i), 1, `slot ${i}`);
  assert.equal(panelGold(STRIP_HANDOFF - 1), 1);
  assert.equal(panelGold(MOMENTS.full - 1), 0);
  assert.equal(slotGold(MOMENTS.full - 1, 0), 0);
});
