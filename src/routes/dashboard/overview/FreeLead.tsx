import { Trans, useTranslation } from "react-i18next";
import { LinkButton, LitPanel } from "../../../components/kit";
import { PUNCHME_MONTHLY_PRICE } from "../../../components/marketing/calculator";

/**
 * The Free Overview's lead, true for whoever is looking.
 *
 * The owner gets one activation panel: what activating costs, what it turns
 * on, and the screen's one coral button. A manager reads the same, with who
 * activates instead of a button Billing would refuse them. A hire gets one
 * line, because nothing here is theirs to do yet. Each carries the tour's
 * `overview-lead`, so the tour's stop lights it instead of centring.
 */
export function FreeLead({ role }: { role: "owner" | "manager" | "staff" }) {
  const { t } = useTranslation();

  if (role === "staff") {
    return (
      <LitPanel data-tour="overview-lead" className="p-4 sm:p-5">
        <p className="type-body text-ink">{t("dashboard.overview.hireFree")}</p>
      </LitPanel>
    );
  }

  return (
    <LitPanel light="band" as="section" aria-labelledby="free-lead-title" data-tour="overview-lead" className="flex flex-col gap-3 p-5 sm:p-6">
      <h2 id="free-lead-title" className="type-card-title text-ink">
        {t("dashboard.plan.notLive")}
      </h2>
      <p className="type-body max-w-prose text-ink">
        <Trans
          i18nKey="dashboard.overview.activate.body"
          values={{ price: PUNCHME_MONTHLY_PRICE }}
          components={{ ltr: <bdi dir="ltr" className="type-figure" /> }}
        />
      </p>
      {role === "owner" ? (
        <LinkButton to="/dashboard/billing" variant="primary" className="self-start">
          {t("billing.activateCta")}
        </LinkButton>
      ) : (
        <p className="type-body text-ink-muted">{t("dashboard.overview.activate.ownerActivates")}</p>
      )}
    </LitPanel>
  );
}
