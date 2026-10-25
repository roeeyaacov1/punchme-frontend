import { useTranslation } from "react-i18next";
import { isOwner } from "../../business/gating";
import { useBusiness } from "../../business/useBusiness";
import { LinkButton } from "../../components/kit";
import { ReturnPage, ReturnRefusal } from "./ReturnPanel";

/**
 * Back from a checkout the owner left before paying. It answers the first
 * question first, whether they were charged, then where the card stands,
 * from the business the app already holds, then what next. No calls, and
 * no coral: this page doesn't push.
 */
export function BillingCancelPage() {
  const { t } = useTranslation();
  const { role, isPro } = useBusiness();

  if (!isOwner(role)) {
    return (
      <ReturnPage>
        <ReturnRefusal />
      </ReturnPage>
    );
  }

  return (
    <ReturnPage>
      <h1 id="return-title" className="type-title text-ink">
        {t("billing.cancel.title")}
      </h1>
      <p className="type-body text-ink-muted">{t(isPro ? "billing.cancel.bodyPro" : "billing.cancel.body")}</p>
      {/* Activating is still to come only on Free. */}
      {!isPro && <p className="type-body text-ink-muted">{t("billing.cancel.next")}</p>}
      <div className="mt-2 flex flex-wrap justify-center gap-3">
        <LinkButton to="/dashboard/billing" variant="secondary" className="max-w-full !whitespace-normal text-center">
          {t("billing.cancel.backCta")}
        </LinkButton>
        <LinkButton to="/dashboard" variant="quiet" className="max-w-full !whitespace-normal text-center">
          {t("dashboard.toOverview")}
        </LinkButton>
      </div>
    </ReturnPage>
  );
}
