/**
 * What the wallet is asked to draw a catalog look at a count: the body of
 * the backend's public `POST /api/presets/draw`, as the wizard builds it for
 * a card that is the look itself (`drawBody(lookItself(...))` in
 * `src/routes/onboarding`). Plain data in and out, so the script and its test
 * run in Node without the app.
 */

/** A catalog look as `GET /api/presets` serves it, the parts the drawing reads. */
export interface CatalogPreset {
  id: string;
  niche: string;
  stamps_required: number;
  background_color: string;
  foreground_color: string;
  label_color: string;
  options?: { style?: "badge" | "icon"; sticker?: string; tint?: boolean; panel_color?: string; wallpaper?: string };
  design?: { stamp?: { color?: string; glyph?: string }; pattern?: string };
  pictures?: { strip: string; hero: string } | null;
}

export type DrawRole = "strip@2x" | "hero";

export interface LookDraw {
  background: string;
  foreground: string;
  label: string;
  stamp: string | null;
  panel: string | null;
  style: "badge" | "icon";
  sticker: string | null;
  glyph: string;
  tint: boolean;
  wallpaper: string | null;
  pattern: string;
  stamps_required: number;
  stamps: number;
  role: DrawRole;
}

export function drawBodyFor(preset: CatalogPreset, stamps: number, role: DrawRole): LookDraw {
  const options = preset.options ?? {};
  const design = preset.design ?? {};
  return {
    background: preset.background_color,
    foreground: preset.foreground_color,
    label: preset.label_color,
    stamp: design.stamp?.color ?? null,
    panel: options.panel_color || null,
    style: options.style ?? "badge",
    sticker: options.sticker || null,
    glyph: design.stamp?.glyph ?? "check",
    tint: options.tint ?? false,
    wallpaper: options.wallpaper || null,
    pattern: design.pattern ?? "none",
    stamps_required: preset.stamps_required,
    stamps,
    role,
  };
}

/** The count a look's own published pictures are drawn at: the wizard's `pictureStamps`. */
export function pictureStamps(stampsRequired: number): number {
  return Math.min(Math.max(1, Math.floor(stampsRequired / 2)), stampsRequired);
}
