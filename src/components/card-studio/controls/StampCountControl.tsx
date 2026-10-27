import { useTranslation } from "react-i18next";
import { cn } from "../../../lib/cn";
import { STAMP_GLYPHS } from "../../../lib/stampGlyphs";
import { Slider } from "../../kit/Slider";
import { MAX_STAMPS, MIN_STAMPS } from "./controlRules";

/**
 * How many stamps to the reward. The kit's slider is the control: it has
 * the label, the keyboard, the value in words and the fill turned round in
 * Hebrew. Under it, the strip at full length, so the choice is "how long is
 * my card"; it is a pointer shortcut to the same number and nothing more,
 * hidden from screen readers and out of the Tab order, and a press on it
 * never takes focus off the slider.
 */
export function StampCountControl({
  value,
  onChange,
  glyph,
  stampColour,
  background,
  pictureUrl,
}: {
  value: number;
  onChange: (next: number) => void;
  glyph: string;
  stampColour: string;
  background: string;
  /** A picture stamp, drawn in the strip instead of the glyph. */
  pictureUrl?: string | null;
}) {
  const { t } = useTranslation();
  const Glyph = STAMP_GLYPHS[glyph] ?? STAMP_GLYPHS.check;
  const words = t("onboarding.reward.stampsValue", { count: value });

  return (
    <div className="flex flex-col gap-3">
      <Slider
        label={t("cardControls.stampCount")}
        value={value}
        min={MIN_STAMPS}
        max={MAX_STAMPS}
        onChange={onChange}
        valueText={words}
      />
      <div aria-hidden className="flex gap-1">
        {Array.from({ length: MAX_STAMPS }, (_, index) => {
          const count = index + 1;
          const on = count <= value;
          return (
            <button
              key={count}
              type="button"
              tabIndex={-1}
              onMouseDown={(event) => event.preventDefault()}
              // A one-stamp card isn't one the renderer draws: the first dot
              // clamps up to the shortest card.
              onClick={() => onChange(Math.max(MIN_STAMPS, count))}
              className={cn(
                "flex aspect-square min-w-0 max-w-9 flex-1 touch-manipulation items-center justify-center overflow-hidden rounded-full",
                "ring-1 ring-inset ring-field",
              )}
              style={on ? { backgroundColor: background, color: stampColour } : undefined}
            >
              {on ? (
                pictureUrl ? (
                  <img src={pictureUrl} alt="" className="size-2/3 rounded-full object-cover" />
                ) : (
                  <Glyph className="size-1/2" strokeWidth={2.4} />
                )
              ) : (
                <span className="size-1.5 rounded-full bg-ink-subtle" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
