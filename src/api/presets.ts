import { api } from "./client";
import type { components } from "./generated/schema";

export type Preset = components["schemas"]["PresetOut"];
export type PresetOptions = components["schemas"]["PresetOptionsOut"];
export type LookDraw = components["schemas"]["LookDrawIn"];
export type PublicStickers = components["schemas"]["PublicStickersOut"];

export function getPresets(niche?: string) {
  return api.get<Preset[]>("/api/presets", { auth: false, query: { niche } });
}

/** The wallet's stickers for the public wizard, each a URL to its picture,
 * and whether the wallet draws the card design options at all
 * (`available`). */
export function getPublicStickers(signal?: AbortSignal) {
  return api.get<PublicStickers>("/api/stickers", { auth: false, signal });
}

/** The wizard's draft drawn by the wallet, through the backend: Apple's
 * strip or Google's hero, as a PNG. It takes enumerated values only, and it
 * is throttled per address: past it, a 429. */
export function drawLook(body: LookDraw, signal?: AbortSignal) {
  return api.post<Blob>("/api/presets/draw", body, { auth: false, as: "blob", signal });
}
