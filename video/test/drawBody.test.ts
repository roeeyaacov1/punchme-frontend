import assert from "node:assert/strict";
import { test } from "node:test";
import { drawBodyFor, type CatalogPreset } from "../scripts/drawBody.ts";

/** `GET /api/presets`' barber-gold-scissors, as the local looks stack served it on 7 Nov 2026. */
const GOLD: CatalogPreset = {
  id: "barber-gold-scissors",
  niche: "barber",
  stamps_required: 10,
  background_color: "#0E1120",
  foreground_color: "#FFFFFF",
  label_color: "#C88A11",
  options: { style: "badge", sticker: "scissors", tint: false, panel_color: "#1A1F38", wallpaper: "sparkles" },
  design: { stamp: { color: "#C88A11", glyph: "scissors" }, pattern: "none" },
};

/** cafe-count-on-top: no sticker, no wallpaper, a panel. */
const COUNT_ON_TOP: CatalogPreset = {
  id: "cafe-count-on-top",
  niche: "cafe",
  stamps_required: 8,
  background_color: "#4B2E1E",
  foreground_color: "#FFFFFF",
  label_color: "#D2B48C",
  options: { style: "icon", sticker: "", tint: false, panel_color: "#F5EFE6", wallpaper: "" },
  design: { stamp: { color: "#4B2E1E", glyph: "coffee" } },
};

test("the gold scissors look asks the wallet for what the wizard asks", () => {
  assert.deepEqual(drawBodyFor(GOLD, 3, "strip@2x"), {
    background: "#0E1120",
    foreground: "#FFFFFF",
    label: "#C88A11",
    stamp: "#C88A11",
    panel: "#1A1F38",
    style: "badge",
    sticker: "scissors",
    glyph: "scissors",
    tint: false,
    wallpaper: "sparkles",
    pattern: "none",
    stamps_required: 10,
    stamps: 3,
    role: "strip@2x",
  });
});

test("an empty sticker or wallpaper is none, and a missing pattern is none", () => {
  const body = drawBodyFor(COUNT_ON_TOP, 0, "hero");
  assert.equal(body.sticker, null);
  assert.equal(body.wallpaper, null);
  assert.equal(body.pattern, "none");
  assert.equal(body.panel, "#F5EFE6");
  assert.equal(body.role, "hero");
});

test("a look without a glyph draws the check", () => {
  const body = drawBodyFor({ ...GOLD, design: { stamp: { color: "#C88A11" } } }, 1, "strip@2x");
  assert.equal(body.glyph, "check");
});
