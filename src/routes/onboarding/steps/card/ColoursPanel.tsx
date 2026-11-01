import { forwardRef, useId, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChevronDown } from "lucide-react";
import { CardColourPicker, StampColourPicker, TextColourPicker } from "../../../../components/card-studio/controls";
import { focusRing } from "../../../../components/kit";
import { accentFits, relatedAccents } from "../../../../lib/accentPalette";
import { cn } from "../../../../lib/cn";
import { readableInk } from "../../../../lib/color";
import { looksFor, readyLooks } from "../../looks";
import { useOnboardingDraft } from "../../useOnboardingDraft";

/**
 * The card's colours: the trade's looks and the ten backgrounds, the stamp
 * colour, and folded under "More colours", the colour of the words. A look
 * here paints the colours only: the stamp, the texture and the count stay as
 * the owner has them. The ref is the stamp colour's section, where
 * `/onboarding/accent` opens.
 */
export const ColoursPanel = forwardRef<
  HTMLDivElement,
  {
    /** The stamp colour changed: the stamp lands on the card. */
    onStampColour?: () => void;
  }
>(function ColoursPanel({ onStampColour }, stampColour) {
  const { t } = useTranslation();
  const moreId = useId();
  const { draft, resolved, update, presets } = useOnboardingDraft();
  const [more, setMore] = useState(() => draft.foreground !== null);
  const looks = useMemo(() => readyLooks(looksFor(resolved.niche, presets), t), [resolved.niche, presets, t]);
  const glyph = resolved.stamp.kind === "glyph" ? resolved.stamp.glyph : "check";

  /** A card colour that leaves the stamp colour under 3:1 takes the first
   * stamp colour that fits it, as the stamp colour's own swatches do. */
  function onBackground(background: string) {
    const accent = accentFits(resolved.accent, background)
      ? resolved.accent
      : (relatedAccents(background)[0] ?? readableInk(background));
    update({ background, accent });
  }

  return (
    <div className="flex flex-col gap-6">
      <CardColourPicker
        colours={{ background: resolved.background, stamp: resolved.accent, text: resolved.foreground, label: resolved.label }}
        looks={looks}
        glyph={glyph}
        onLook={(look) => update({ background: look.background, accent: look.stamp, foreground: null })}
        onBackground={onBackground}
      />
      <div ref={stampColour} tabIndex={-1} className="scroll-mt-4 outline-none">
        <StampColourPicker
          background={resolved.background}
          value={resolved.accent}
          onChange={(accent) => {
            update({ accent });
            onStampColour?.();
          }}
        />
      </div>
      <div className="flex flex-col gap-4">
        <button
          type="button"
          aria-expanded={more}
          aria-controls={moreId}
          onClick={() => setMore((open) => !open)}
          className={cn(
            "-ms-3 flex min-h-11 w-fit touch-manipulation select-none items-center gap-1.5 rounded-full px-3 type-label text-ink",
            "transition-colors duration-gentle ease-out active:bg-ink/[0.06] hover-fine:bg-ink/5",
            focusRing,
          )}
        >
          {t("studio.moreColours")}
          <ChevronDown aria-hidden className={cn("size-4 transition-transform duration-gentle", more && "rotate-180")} />
        </button>
        {more && (
          <div id={moreId}>
            <TextColourPicker
              background={resolved.background}
              value={draft.foreground}
              onChange={(foreground) => update({ foreground })}
            />
          </div>
        )}
      </div>
    </div>
  );
});
