import { patternStyle } from "../../lib/cardPatterns";
import { STAMP_GLYPHS } from "../../lib/stampGlyphs";
import { readableInk } from "../../lib/color";
import { cn } from "../../lib/cn";
import type { CardLook } from "../../routes/onboarding/looks";

/**
 * A look, sketched: the business name as a rule in whatever ink the background
 * carries, the texture drawn behind in the stamp colour, and a row of stamps.
 * Four stamps whatever the real count is — this is showing the palette, not
 * the offer.
 *
 * Deliberately a card and not a swatch: what separates two looks is the stamp
 * colour and the stamp as much as the background, and only a card shows all
 * three at once. Also deliberately a *sketch* — in the wizard the real pass is
 * already on the phone above and repaints the moment one of these is tapped,
 * so the tile is the menu and the phone is the preview.
 *
 * Exported because `/admin` lists the same objects, and staff authoring a look
 * should be looking at the thing an owner will be offered.
 */
export function LookTile({ look, className }: { look: CardLook; className?: string }) {
  const Glyph = STAMP_GLYPHS[look.glyph] ?? STAMP_GLYPHS.star;
  const ink = readableInk(look.background);
  return (
    <span
      aria-hidden="true"
      className={cn("flex flex-col justify-between overflow-hidden rounded-xl p-2", className)}
      // The texture is `patternStyle`'s own, the same call the studio and the
      // card preview make — so a look authored in /admin with a texture shows
      // it here rather than only once the owner has already taken it.
      style={{ backgroundColor: look.background, ...patternStyle(look.pattern, look.accent) }}
    >
      <span className="block h-1 w-7 rounded-full" style={{ backgroundColor: ink, opacity: 0.75 }} />
      <span className="flex items-center gap-1">
        {Array.from({ length: 4 }).map((_, i) => (
          <Glyph key={i} size={13} strokeWidth={2.5} style={{ color: look.accent }} />
        ))}
      </span>
    </span>
  );
}
