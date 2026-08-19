import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { ctaClasses } from "../../components/marketing/primitives";
import {
  Figure,
  Notice,
  Panel,
  PanelHeader,
  Tag,
} from "../../components/dashboard/primitives";
import { useBusiness } from "../../business/useBusiness";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
} from "../../api/billing";

/**
 * The page that decides whether ₪99 a month feels earned, so it says what
 * the money buys before it shows a button.
 *
 * The price is read from the landing page's own pricing block rather than
 * written again here — an owner who is about to be charged should not be the
 * one to find the two numbers disagreeing.
 */
export function BillingSettingsPage() {
  const { t } = useTranslation();
  const { business, isPro } = useBusiness();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: subscription } = useQuery({
    queryKey: ["subscription", business?.id],
    queryFn: () => getSubscription(business!.id!),
    enabled: !!business?.id,
  });

  async function handleActivate() {
    if (!business?.id) return;
    setError(null);
    setIsRedirecting(true);
    try {
      const { checkout_url } = await createCheckoutSession(business.id);
      window.location.href = checkout_url;
    } catch {
      setError(t("billing.error"));
      setIsRedirecting(false);
    }
  }

  async function handleManage() {
    if (!business?.id) return;
    setError(null);
    setIsRedirecting(true);
    try {
      const { portal_url } = await createPortalSession(business.id);
      window.location.href = portal_url;
    } catch {
      setError(t("billing.error"));
      setIsRedirecting(false);
    }
  }

  return (
    <div className="flex max-w-xl flex-col gap-4 sm:gap-5">
      <h1 className="t-h3 text-ink">{t("billing.title")}</h1>

      <Panel className="flex flex-col gap-5 p-5 sm:p-6">
        <PanelHeader
          title={t(isPro ? "billing.plan.proTitle" : "billing.plan.freeTitle")}
          hint={t(isPro ? "billing.plan.proBody" : "billing.plan.freeBody")}
          action={
            <Tag tone={isPro ? "accent" : "neutral"}>
              {isPro ? t("dashboard.plan.pro") : t("dashboard.plan.free")}
            </Tag>
          }
        />

        {!isPro && (
          <p className="flex items-baseline gap-1.5 border-t border-border pt-4">
            <Figure className="font-heading text-3xl font-bold text-ink">
              {t("landing.pricing.pro.price")}
            </Figure>
            <span className="text-ink-muted">
              {t("landing.pricing.pro.per")}
            </span>
          </p>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={isPro ? handleManage : handleActivate}
            disabled={isRedirecting}
            className={ctaClasses("primary", "lg")}
          >
            {isPro ? t("billing.managePortalCta") : t("billing.activateCta")}
          </button>

          {/* The subscription's own word for its state, unchanged. It is what
              the payment processor says, and paraphrasing it here would only
              disagree with the receipt in the owner's inbox. */}
          {subscription && (
            <span className="text-sm text-ink-subtle">
              {t("billing.status")}:{" "}
              <Figure className="text-ink-muted">{subscription.status}</Figure>
            </span>
          )}
        </div>

        {error && <Notice tone="danger">{error}</Notice>}
      </Panel>
    </div>
  );
}
