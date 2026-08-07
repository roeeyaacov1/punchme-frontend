import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useBusiness } from "../../business/useBusiness";
import { getSubscription } from "../../api/billing";

const POLL_INTERVAL_MS = 2_000;
const TIMEOUT_MS = 30_000;

/** The Stripe webhook is the async source of truth for plan flipping to
 * pro — this can't assume success just because Stripe redirected back
 * here. Polls until the subscription reflects pro, or gives up after
 * TIMEOUT_MS without erroring (the webhook may just be slow, not failed). */
export function BillingSuccessPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { business, refetch: refetchBusiness } = useBusiness();
  const [timedOut, setTimedOut] = useState(false);
  const startedAt = useRef<number | null>(null);
  if (startedAt.current === null) startedAt.current = Date.now();

  useEffect(() => {
    if (!business?.id) return;
    let cancelled = false;

    async function poll() {
      const status = await getSubscription(business!.id!);
      if (cancelled) return;

      if (status.plan === "pro") {
        refetchBusiness();
        navigate("/dashboard?activated=1", { replace: true });
        return;
      }

      if (Date.now() - startedAt.current! >= TIMEOUT_MS) {
        setTimedOut(true);
        return;
      }

      setTimeout(poll, POLL_INTERVAL_MS);
    }

    poll();
    return () => {
      cancelled = true;
    };
  }, [business?.id, navigate, refetchBusiness]);

  return (
    <div className="min-h-screen flex items-center justify-center text-center px-6 text-navy font-body">
      {timedOut ? t("billing.success.timeout") : t("billing.success.finalizing")}
    </div>
  );
}
