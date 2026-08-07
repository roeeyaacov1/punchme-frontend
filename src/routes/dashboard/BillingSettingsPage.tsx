import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button, Card } from "../../components/ui";
import { useBusiness } from "../../business/useBusiness";
import {
  createCheckoutSession,
  createPortalSession,
  getSubscription,
} from "../../api/billing";

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
    <div className="flex flex-col gap-4 max-w-sm">
      <h1 className="text-2xl font-heading">{t("billing.title")}</h1>

      <Card className="flex flex-col gap-4">
        {subscription && (
          <p className="text-sm text-slate font-body">
            {t("billing.status")}: {subscription.status}
          </p>
        )}

        {isPro ? (
          <Button onClick={handleManage} disabled={isRedirecting}>
            {t("billing.managePortalCta")}
          </Button>
        ) : (
          <Button onClick={handleActivate} disabled={isRedirecting}>
            {t("billing.activateCta")}
          </Button>
        )}

        {error && <p className="text-sm text-red-600">{error}</p>}
      </Card>
    </div>
  );
}
