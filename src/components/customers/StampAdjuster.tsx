import { useTranslation } from "react-i18next";
import { Minus, Plus } from "lucide-react";

interface StampAdjusterProps {
  stampCount: number;
  stampsRequired: number;
  /** A write for this card is in flight — freeze both buttons so a double
   * click can't queue a second, unrelated delta against a stale count. */
  pending: boolean;
  /** Set when the feature itself is unavailable; also used as the tooltip. */
  unavailableReason?: string;
  onAdjust: (delta: number) => void;
}

/** Full 44px where a thumb is doing the tapping, and 36 in the desktop table
 * where a pointer is — at 44 the pair is wider than its column. The phone
 * never sees the table: below `lg` each customer is a card with these two as
 * the only controls in the row. */
const BUTTON_CLASSES =
  "inline-flex h-11 w-11 lg:h-9 lg:w-9 items-center justify-center rounded-full border border-border text-ink-muted transition-colors hover:border-border-strong hover:bg-ink/[0.06] hover:text-ink disabled:opacity-40 disabled:hover:bg-transparent disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-text focus-visible:ring-offset-2 focus-visible:ring-offset-surface";

export function StampAdjuster({
  stampCount,
  stampsRequired,
  pending,
  unavailableReason,
  onAdjust,
}: StampAdjusterProps) {
  const { t } = useTranslation();

  const atZero = stampCount <= 0;
  // A full card is redeemed, not over-stamped — there is nothing sensible for
  // the extra stamp to mean, so stop at the template's requirement.
  const atMax = stampsRequired > 0 && stampCount >= stampsRequired;

  const removeTitle =
    unavailableReason ??
    (atZero ? t("dashboard.customers.stamps.atZero") : t("dashboard.customers.stamps.remove"));
  const addTitle =
    unavailableReason ??
    (atMax ? t("dashboard.customers.stamps.atMax") : t("dashboard.customers.stamps.add"));

  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        className={BUTTON_CLASSES}
        disabled={!!unavailableReason || pending || atZero}
        title={removeTitle}
        aria-label={t("dashboard.customers.stamps.remove")}
        onClick={() => onAdjust(-1)}
      >
        <Minus className="h-4 w-4" aria-hidden />
      </button>
      <button
        type="button"
        className={BUTTON_CLASSES}
        disabled={!!unavailableReason || pending || atMax}
        title={addTitle}
        aria-label={t("dashboard.customers.stamps.add")}
        onClick={() => onAdjust(1)}
      >
        <Plus className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}
