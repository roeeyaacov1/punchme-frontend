import { useTranslation } from "react-i18next";
import { Check, Gift } from "lucide-react";
import { cn } from "../../lib/cn";
import { Figure, LitPanel, StampRow } from "../kit";
import type { HeroTemplate } from "./heroTemplates";

const STROKE = 2.5;

/** The answer's two buttons, drawn rather than made: nothing here is pressed. */
const INK_PILL =
  "inline-flex min-h-11 items-center rounded-full bg-ink px-5 font-heading text-base font-medium text-surface";
const QUIET_PILL = "inline-flex min-h-11 items-center rounded-full px-5 font-heading text-base font-medium text-ink";

/**
 * The scan's answer as the Scan page draws it (`ScanAnswer`), in its own
 * words and on the kit's own pieces: the light, the glyph and the word, the
 * count, the card's stamps as one row, and on a full card the reward with
 * "Give the reward" as an ink pill. A picture of the product, so it holds
 * still and nothing in it can be pressed; whoever places it says what it
 * shows to a screen reader.
 *
 * `compact` is the answer at the size the counter's overlap allows on a
 * phone: the word, the count and the row.
 */
export function SampleAnswer({
  template,
  kind,
  count,
  compact = false,
  className,
}: {
  template: HeroTemplate;
  kind: "stamped" | "full";
  /** Stamps on the card after this scan; a full card is always full. */
  count: number;
  compact?: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const total = template.stampsRequired;
  const filled = kind === "full" ? total : count;
  return (
    <LitPanel
      light={kind === "full" ? "full" : "punched"}
      className={cn(
        "flex flex-col items-center text-center",
        compact ? "gap-1.5 px-3 pb-3.5 pt-4" : "gap-2.5 px-4 py-5 sm:px-5",
        className,
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center text-ink [&_svg]:shrink-0",
          compact ? "gap-1.5 [&_svg]:size-5" : "gap-3 [&_svg]:size-12",
        )}
      >
        {kind === "full" ? <Gift aria-hidden strokeWidth={STROKE} /> : <Check aria-hidden strokeWidth={STROKE} />}
        <p className={compact ? "font-heading text-[0.9375rem] font-medium leading-tight" : "type-answer"}>
          {t(kind === "full" ? "dashboard.scan.result.rewardReady" : "dashboard.scan.result.stamped")}
        </p>
      </div>
      <Figure size={compact ? "stat" : "count"} value={`${filled}/${total}`} />
      <StampRow total={total} filled={filled} className={compact ? "max-w-[7.5rem]" : "max-w-[18rem]"} />
      {kind === "stamped" && !compact && (
        <p className="type-body font-semibold text-answer-punched-ink">
          {t("dashboard.scan.result.toGo", { count: Math.max(0, total - filled) })}
        </p>
      )}
      {kind === "full" && (
        <>
          <p dir="auto" className="line-clamp-2 max-w-full text-lg font-semibold leading-snug text-ink">
            {t(`landing.templates.items.${template.key}.reward`)}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className={INK_PILL}>{t("dashboard.scan.result.redeem")}</span>
            <span className={QUIET_PILL}>{t("dashboard.scan.result.notNow")}</span>
          </div>
        </>
      )}
    </LitPanel>
  );
}
