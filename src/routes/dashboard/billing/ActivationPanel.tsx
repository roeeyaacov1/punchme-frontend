import { useId, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Button, Figure, LitPanel } from "../../../components/kit";
import { PUNCHME_MONTHLY_PRICE } from "../../../components/marketing/calculator";

/** The four things activating turns on, in the order the Overview names them. */
const UNLOCKS = ["join", "messages", "standee", "referrals"] as const;

/** The price as a figure, for `billing.price`'s `<ltr>` part. */
function PriceFigure({ children }: { children?: ReactNode }) {
  return <Figure value={children} size="stat" />;
}

/**
 * The decision, on the dashboard's one loud surface, as the Overview's Free
 * lead stands: where the business is, what it costs, what that turns on,
 * and the screen's one coral button, with where paying happens and how to
 * stop right under it.
 *
 * Its own panel rather than the Overview's `FreeLead`, which says the same
 * in one sentence with a link here: sharing it would change what the
 * Overview draws. "Activate" carries the tour's `billing-activate`.
 */
export function ActivationPanel({
  heading,
  unfinished,
  busy,
  onActivate,
  problem,
}: {
  heading: string;
  /** The last checkout never finished, said first. */
  unfinished?: boolean;
  busy: boolean;
  onActivate: () => void;
  /** Why the last press didn't reach Stripe, under the button. */
  problem?: ReactNode;
}) {
  const { t } = useTranslation();
  const headingId = useId();
  return (
    <LitPanel light="band" as="section" aria-labelledby={headingId} className="flex flex-col gap-5 p-5 sm:p-6">
      <div className="flex flex-col gap-2">
        <h2 id={headingId} className="type-card-title text-ink">
          {heading}
        </h2>
        {unfinished && <p className="type-body text-ink">{t("billing.unfinished")}</p>}
      </div>

      <p className="type-body flex flex-wrap items-baseline gap-x-2 text-ink-muted">
        <Trans
          i18nKey="billing.price"
          values={{ price: PUNCHME_MONTHLY_PRICE }}
          components={{ ltr: <PriceFigure /> }}
        />
      </p>

      <div className="flex flex-col gap-2">
        <h3 className="type-label text-ink">{t("billing.unlocks.title")}</h3>
        <ul className="flex flex-col gap-1.5">
          {UNLOCKS.map((unlock) => (
            <li key={unlock} className="type-body flex items-start gap-2 text-ink">
              <Check aria-hidden strokeWidth={2.5} className="mt-0.5 size-5 shrink-0" />
              {t(`billing.unlocks.${unlock}`)}
            </li>
          ))}
        </ul>
      </div>

      <div className="flex flex-col items-start gap-2">
        <Button
          size="lg"
          data-tour="billing-activate"
          busy={busy}
          onClick={onActivate}
          className="max-w-full !whitespace-normal text-center"
        >
          {t("billing.activateCta")}
        </Button>
        {/* Danger's red on the band: 5.96:1 at its light end, 5.50:1 at
            its warm one, and the band keeps its light at night. */}
        {problem}
        <p className="text-sm leading-snug text-ink-muted">{t("billing.free.how")}</p>
      </div>
    </LitPanel>
  );
}
