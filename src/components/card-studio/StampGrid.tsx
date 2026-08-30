import { STAMP_GLYPHS } from "../../lib/stampGlyphs";
import { patternStyle, type CardPattern } from "../../lib/cardPatterns";

export interface StampGridProps {
  stampsRequired: number;
  currentStamps: number;
  stampColor: string;
  backgroundColor: string;
  glyph: string;
  pattern: CardPattern;
  /** Data-URL / CDN URL of uploaded stamp art (circle-masked in tiles). */
  stampArtUrl?: string;
  /** Whole-tile overrides. Beat `stampArtUrl` and the glyph, and drop the
   * circle entirely — the server uses them verbatim, contain-fitted. */
  stampedArtUrl?: string;
  unstampedArtUrl?: string;
  /** Uploaded strip background image — suppresses the pattern, like the server. */
  stripBaseUrl?: string;
  /** Tile size in px. */
  size?: number;
}

/** Client-side mirror of the server strip renderer (apps/wallet/strips.py),
 * including its order of precedence for a tile — most specific wins:
 * before/after artwork used verbatim with no circle chrome; then an
 * uploaded stamp photo, circle-masked and grayscaled when unstamped; then
 * the named glyph, knocked out of a filled circle in the stamp color with
 * muted greys when unstamped. 1 row up to 6 stamps, balanced 2 rows
 * beyond. */
export function StampGrid({
  stampsRequired,
  currentStamps,
  stampColor,
  backgroundColor,
  glyph,
  pattern,
  stampArtUrl,
  stampedArtUrl,
  unstampedArtUrl,
  stripBaseUrl,
  size = 30,
}: StampGridProps) {
  const count = Math.max(stampsRequired, 1);
  const perRow = count <= 6 ? count : Math.ceil(count / 2);
  const rows = count <= 6 ? [count] : [perRow, count - perRow];
  const Glyph = STAMP_GLYPHS[glyph] ?? STAMP_GLYPHS.check;

  const background: React.CSSProperties = stripBaseUrl
    ? {
        backgroundImage: `url(${stripBaseUrl})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }
    : { backgroundColor, ...patternStyle(pattern, stampColor) };

  let index = 0;
  return (
    <div className="rounded-xl px-3 py-3 flex flex-col items-center gap-2" style={background}>
      {rows.map((rowCount, row) => (
        <div key={row} className="flex justify-center gap-2">
          {Array.from({ length: rowCount }).map(() => {
            const stamped = index < currentStamps;
            index += 1;
            const override = stamped ? stampedArtUrl : unstampedArtUrl;
            // An override IS the tile: no circle, no fill, no ring. Drawing
            // one behind it is how a preview starts disagreeing with the
            // card the customer is holding.
            if (override) {
              return (
                <span
                  key={index}
                  className="flex shrink-0 items-center justify-center"
                  style={{ width: size, height: size }}
                >
                  <img
                    src={override}
                    alt=""
                    className="h-full w-full object-contain"
                  />
                </span>
              );
            }
            return (
              <span
                key={index}
                className="rounded-full flex items-center justify-center overflow-hidden shrink-0"
                style={{
                  width: size,
                  height: size,
                  backgroundColor: stamped ? stampColor : "#EEEEF1",
                  border: stamped ? undefined : "2px solid #B0B0B6",
                }}
              >
                {stampArtUrl ? (
                  <img
                    src={stampArtUrl}
                    alt=""
                    className="rounded-full object-cover"
                    style={{
                      width: size * 0.62,
                      height: size * 0.62,
                      filter: stamped ? undefined : "grayscale(1) opacity(0.4)",
                    }}
                  />
                ) : (
                  <Glyph
                    size={size * 0.55}
                    strokeWidth={2.4}
                    color={stamped ? "#FFFFFF" : "#AAAAAF"}
                  />
                )}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
}
