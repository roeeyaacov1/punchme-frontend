import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export function BillingCancelPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6 text-navy">
      <h1 className="text-2xl font-heading">{t("billing.cancel.title")}</h1>
      <p className="text-slate font-body">{t("billing.cancel.body")}</p>
      <Link to="/dashboard/billing" className="text-sm underline">
        {t("billing.cancel.backCta")}
      </Link>
    </div>
  );
}
