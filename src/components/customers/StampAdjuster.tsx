import { useTranslation } from "react-i18next";
import { Minus, Plus } from "lucide-react";
import { Button } from "../kit/Button";

/**
 * One stamp more or one fewer, for a correction at the counter: a double
 * scan taken back, a stamp the camera missed. 48px each and 16px apart, so a
 * thumb in a hurry hits the one it meant; the page says what each press did
 * and offers to undo it.
 */
export function StampAdjuster({
  stampCount,
  stampsRequired,
  pending,
  disabled,
  onAdjust,
}: {
  stampCount: number;
  stampsRequired: number;
  /** A change for this card is on its way: both wait, so a double press
   * can't send a second change against a count that is already stale. */
  pending: boolean;
  /** A cancelled card takes no stamps either way. */
  disabled?: boolean;
  onAdjust: (delta: number) => void;
}) {
  const { t } = useTranslation();
  const atZero = stampCount <= 0;
  // A full card is redeemed, not stamped further: there is nothing an extra
  // stamp could mean, so it stops at the card's own number.
  const atMax = stampsRequired > 0 && stampCount >= stampsRequired;

  return (
    <div className="flex items-center gap-4">
      <Button
        variant="secondary"
        size="icon"
        className="h-12 w-12"
        icon={<Minus aria-hidden />}
        aria-label={t("dashboard.customers.stamps.remove")}
        title={atZero ? t("dashboard.customers.stamps.atZero") : undefined}
        disabled={disabled || pending || atZero}
        onClick={() => onAdjust(-1)}
      />
      <Button
        variant="secondary"
        size="icon"
        className="h-12 w-12"
        icon={<Plus aria-hidden />}
        aria-label={t("dashboard.customers.stamps.add")}
        title={atMax ? t("dashboard.customers.stamps.atMax") : undefined}
        disabled={disabled || pending || atMax}
        onClick={() => onAdjust(1)}
      />
    </div>
  );
}
