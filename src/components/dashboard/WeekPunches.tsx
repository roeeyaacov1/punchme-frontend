import { useTranslation } from "react-i18next";
import { PunchMark } from "../marketing/PunchMark";
import { Figure } from "./primitives";

/**
 * The week, punched.
 *
 * This is the answer to the only question the dashboard has to answer — is
 * the card working — and it is drawn in the product's own material rather
 * than in a chart. Every stamp the shop gave in the last seven days is one
 * mark, the same mark the landing page uses for a visit and the wizard uses
 * for a step done. A row that fills the panel means a good week; four marks
 * means four visits, and no axis or percentage says it faster.
 *
 * It is honest at both ends. Nothing yet is not a flat line pretending to be
 * data — it is an unfilled card, one guide circle per stamp the owner's own
 * reward asks for, which is exactly what a new paper card looks like. And a
 * shop busy enough to run past the row gets the count with a `+`, because
 * drawing four hundred circles would be decoration, not information.
 */

/** Four rows of marks at 375px, which is where the panel stops being read
 * and starts being wallpaper. */
const MAX_MARKS = 56;

export function WeekPunches({
  stamps,
  /** The sample could not see far enough back to be sure of the total. */
  capped,
  /** The owner's own reward length — how long an empty card is drawn. */
  cardLength,
}: {
  stamps: number;
  capped?: boolean;
  cardLength: number;
}) {
  const { t } = useTranslation();
  const marks = Math.min(stamps, MAX_MARKS);
  const overflow = stamps - marks;
  const empty = Math.max(3, Math.min(cardLength, 12));

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <Figure className="t-stat text-ink">
          {stamps}
          {capped ? "+" : ""}
        </Figure>
        <p className="text-ink-muted">
          {t("dashboard.week.stamps", { count: stamps })}
        </p>
      </div>

      {stamps > 0 ? (
        <div
          className="flex flex-wrap gap-1.5"
          // The count above already says it, and 56 identical marks read
          // aloud one at a time is the worst version of this panel.
          aria-hidden="true"
        >
          {Array.from({ length: marks }).map((_, i) => (
            <PunchMark key={i} state="stamped" size={16} />
          ))}
          {overflow > 0 && (
            <span className="self-center ps-1 font-mono text-xs text-ink-subtle">
              +{overflow}
            </span>
          )}
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: empty }).map((_, i) => (
            <PunchMark
              key={i}
              state={i === empty - 1 ? "reward" : "empty"}
              size={16}
            />
          ))}
        </div>
      )}
    </div>
  );
}
