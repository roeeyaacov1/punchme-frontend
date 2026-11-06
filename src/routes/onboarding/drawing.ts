import type { LookDraw } from "../../api/presets";
import { ApiError } from "../../api/errors";
import type { PreviewPlatform } from "../../components/card-studio/CardPreviews";
import { STAMP_GLYPH_NAMES } from "../../lib/stampGlyphs";
import { sampleStamps, type ResolvedDraft } from "./draft";

/**
 * The map's card drawn by the wallet, through the backend's public drawing
 * (card looks, brief §4.2 item 3, §7.4): what it is asked, and how a failure
 * is said. It takes enumerated values only, never the card's words or its
 * pictures: the text rows are the frozen preview's own, so the name lands as
 * typed. Pure, so it can be tested.
 */

/**
 * What the drawing is asked for a card from a look, for the wallet the stage
 * shows (Apple's strip at 2x, or Google's hero), at the count the stage
 * shows. Nothing for a card from before the looks, which the stand-in draws
 * as before, or for a stamp that is a picture, which the public drawing
 * can't take: the stand-in draws its circles.
 */
export function drawBody(resolved: ResolvedDraft, wallet: PreviewPlatform): LookDraw | null {
  const options = resolved.options;
  if (!options || resolved.stamp.kind === "image") return null;
  const glyph = STAMP_GLYPH_NAMES.includes(resolved.stamp.glyph) ? resolved.stamp.glyph : "check";
  return {
    background: resolved.background,
    foreground: resolved.foreground,
    label: resolved.label,
    stamp: resolved.accent,
    panel: resolved.panel,
    style: options.style,
    sticker: options.sticker || null,
    glyph: glyph as LookDraw["glyph"],
    tint: options.tint,
    wallpaper: options.wallpaper || null,
    pattern: resolved.pattern,
    stamps_required: resolved.stampsRequired,
    stamps: sampleStamps(resolved.stampsRequired),
    role: wallet === "google" ? "hero" : "strip@2x",
  };
}

/** One drawing told from another: its body, its keys in one order. */
export function drawKey(body: LookDraw): string {
  return JSON.stringify(Object.fromEntries(Object.entries(body).sort(([a], [b]) => a.localeCompare(b))));
}

/** Why a drawing didn't come: too many in a short time (the throttle's 429,
 * said plainly), or anything else, said as a drawing that failed. */
export type DrawFailure = "tooMany" | "failed";

export function drawFailure(err: unknown): DrawFailure {
  return err instanceof ApiError && err.status === 429 ? "tooMany" : "failed";
}

/** What a failure says, as one key: why, and what stands in the drawing's
 * place, the look's own picture (`own`) or, where the catalog has none for
 * the card, the circles. */
export function failureKey(failure: DrawFailure, own: boolean): string {
  if (failure === "tooMany") return own ? "onboarding.look.tooMany" : "onboarding.look.tooManyCircles";
  return own ? "onboarding.look.drawFailed" : "onboarding.look.drawFailedCircles";
}
