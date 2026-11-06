import { StampGrid } from "../../components/card-studio/StampGrid";
import { cn } from "../../lib/cn";
import { sampleStamps } from "../onboarding/draft";
import type { Picture } from "./shelf";

/** On a row, by the row's own width: 96px, 72px where it is under 20rem so
 * the names keep their room (96px again under 16rem, where the names have
 * gone under it), and 160px from 42rem, as on a desktop. In the
 * delete's question: 160px. In px, not rem: a picture doesn't grow with
 * the text, and `StampGrid`'s scale has to match its box. */
type Size = "row" | "large";

const WIDTH: Record<Size, string> = {
  row: "w-[72px] [@container(max-width:16rem)]:w-[96px] [@container(min-width:20rem)]:w-[96px] [@container(min-width:42rem)]:w-[160px]",
  large: "w-[160px]",
};

/** `StampGrid`'s 300px slot, scaled to each width above. */
const SCALE: Record<Size, string> = {
  row: "scale-[0.24] [@container(max-width:16rem)]:scale-[0.32] [@container(min-width:20rem)]:scale-[0.32] [@container(min-width:42rem)]:scale-[0.5333]",
  large: "scale-[0.5333]",
};

/**
 * A look on its row, as the wizard shows it: Apple's strip for a drawn look,
 * or a plain look as the frozen `StampGrid` draws it, every one in the same
 * box at the strip's own shape.
 *
 * `StampGrid` is a pass preview: it stands in its 300px slot and is scaled
 * down whole, never squeezed or redrawn (DESIGN.md, the 300px Slot Rule). A
 * draft has no picture yet, so it shows only its card colour: a sketch
 * could pass for the look. With no colour at all, an empty dashed box, and
 * the row says why.
 *
 * The picture is decoration: the row's words name the look.
 */
export function LookPicture({ picture, size = "row" }: { picture: Picture; size?: Size }) {
  const box = cn("relative block aspect-[1125/432] shrink-0 overflow-hidden rounded-lg", WIDTH[size]);
  switch (picture.kind) {
    case "strip":
      return (
        <img
          src={picture.src}
          alt=""
          draggable={false}
          className={cn(box, "bg-ink/5 object-cover ring-1 ring-inset ring-border")}
        />
      );
    case "classic": {
      const { look } = picture;
      return (
        <span aria-hidden className={cn(box, "flex items-center justify-center")}>
          <span className={cn("w-[300px] shrink-0", SCALE[size])}>
            <StampGrid
              stampsRequired={look.stamps}
              currentStamps={sampleStamps(look.stamps)}
              stampColor={look.accent}
              backgroundColor={look.background}
              glyph={look.glyph}
              pattern={look.pattern}
            />
          </span>
        </span>
      );
    }
    case "swatch":
      return <span aria-hidden className={cn(box, "ring-1 ring-inset ring-border")} style={{ backgroundColor: picture.colour }} />;
    case "none":
      return <span aria-hidden className={cn(box, "border border-dashed border-field")} />;
  }
}
