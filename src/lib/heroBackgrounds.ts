/** Preset hero-background themes rendered as CSS gradients (no external
 * image assets needed). A `heroBackground` value that isn't one of these
 * keys is treated as an uploaded image URL instead — see WalletCardPreview. */
export const HERO_BACKGROUNDS: Record<string, string> = {
  coffee: "linear-gradient(135deg, #6f4e37 0%, #3c2a1e 100%)",
  restaurant: "linear-gradient(135deg, #7a1f1f 0%, #2b0a0a 100%)",
  beauty: "linear-gradient(135deg, #d88bb0 0%, #7a3b57 100%)",
  retail: "linear-gradient(135deg, #2a4d8f 0%, #14213d 100%)",
  fitness: "linear-gradient(135deg, #2f9e6f 0%, #0f3d2b 100%)",
  abstract: "linear-gradient(135deg, #6c5ce7 0%, #2d1b69 100%)",
};

export const HERO_BACKGROUND_KEYS = Object.keys(HERO_BACKGROUNDS);

export function isPresetHeroBackground(value: string): boolean {
  return value in HERO_BACKGROUNDS;
}
