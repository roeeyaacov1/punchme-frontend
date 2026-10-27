import { useId, type ReactNode } from "react";
import { cn } from "../../../lib/cn";
import { noTapFlash } from "../../kit/classes";

export interface Tile<T extends string> {
  value: T;
  /** The tile's name, said to a screen reader; shown only on a pill. */
  label: string;
  /** What the tile looks like, chosen or not. */
  render: (chosen: boolean) => ReactNode;
}

export type TileShape = "circle" | "rounded" | "pill";

const SHAPES: Record<TileShape, string> = {
  circle: "rounded-full",
  rounded: "rounded-field",
  pill: "rounded-full",
};

/**
 * One of several, drawn as what they choose: a swatch, a glyph, a scrap of
 * the card. Native radios in a fieldset, so the group is one Tab stop, the
 * arrow keys move the choice and a screen reader says "3 of 10".
 *
 * Chosen is a 2px ink ring outside a 2px gap of the panel (Lightbox's
 * "chosen is ink"); not chosen, the Field Edge, 3.68:1 on a panel, so a light
 * swatch on a light panel still reads as a control. Focus is the kit's ink
 * outline, two pixels further out, so it never sits on the chosen ring.
 *
 * `value` may be null, when none of these is what the card has (a picture
 * stamp, a colour of one's own): then no tile is chosen.
 */
export function ChoiceTiles<T extends string>({
  legend,
  hideLegend,
  tiles,
  value,
  onChange,
  shape = "circle",
  className,
  listClassName,
  disabled,
  describedBy,
}: {
  legend: string;
  hideLegend?: boolean;
  tiles: readonly Tile<T>[];
  value: T | null;
  onChange: (next: T) => void;
  shape?: TileShape;
  className?: string;
  /** The tiles' own layout: a wrapping row unless a grid is asked for. */
  listClassName?: string;
  /** None of them can be chosen now; the page says why. */
  disabled?: boolean;
  /** The id of what says why. */
  describedBy?: string;
}) {
  const name = useId();
  return (
    <fieldset disabled={disabled} aria-describedby={describedBy} className={cn("group min-w-0", className)}>
      <legend className={hideLegend ? "sr-only" : "type-label mb-2 text-ink"}>{legend}</legend>
      {/* Faded as a group when disabled, the legend left at full strength. */}
      <div className={cn("flex flex-wrap gap-3 group-disabled:opacity-50", listClassName)}>
        {tiles.map((tile) => {
          const chosen = tile.value === value;
          return (
            <label
              key={tile.value}
              className={cn(
                "relative flex min-h-11 min-w-11 cursor-pointer touch-manipulation has-[:disabled]:cursor-not-allowed select-none items-center justify-center",
                SHAPES[shape],
                "ring-offset-surface transition-shadow duration-gentle ease-out",
                chosen ? "ring-2 ring-ink ring-offset-2" : "ring-1 ring-field",
                "has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-4 has-[:focus-visible]:outline-ink",
                noTapFlash,
              )}
            >
              <input
                type="radio"
                name={name}
                value={tile.value}
                checked={chosen}
                onChange={() => onChange(tile.value)}
                className="sr-only"
              />
              {shape !== "pill" && <span className="sr-only">{tile.label}</span>}
              {tile.render(chosen)}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
