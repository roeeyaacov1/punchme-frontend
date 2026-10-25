import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getSubscription } from "../../api/billing";
import { isOwner } from "../../business/gating";
import { useBusiness } from "../../business/useBusiness";
import { Button, LinkButton, Loading, Skeleton } from "../../components/kit";
import { clearCheckoutReturn, markCheckoutReturn } from "./checkoutReturn";
import { pollForPro } from "./pollForPro";
import { ReturnPage, ReturnRefusal } from "./ReturnPanel";

/**
 * Back from Stripe's checkout. One job: wait for Stripe's word, then hand
 * the owner to the Overview on the day the card goes live.
 *
 * Stripe's webhook is the only proof a payment went through, so the
 * redirect back here proves nothing. The page asks for the subscription
 * every 2 s for up to 30 s, on the clock (`pollForPro`): a try that fails
 * counts as one, and a request that hangs can't hold the page. Once it
 * reads Pro, the business is read too, and only when that also says Pro
 * does the page hand over, replacing itself: the shell then mounts on Pro,
 * so its sign switches on and the Overview opens on "you're live" with no
 * Free frame first.
 *
 * Thirty seconds without Pro says so, and that there is no need to pay
 * again, with "Check again" (another 30 s) and the way to the Overview.
 * Opening the page leaves a mark on this device for a day, cleared once
 * the business reads Pro, so Billing can warn against paying twice while
 * Stripe's word is late. A hire gets the refusal, and no call is made.
 */
export function BillingSuccessPage() {
  const { role } = useBusiness();
  return <ReturnPage>{isOwner(role) ? <Activating /> : <ReturnRefusal />}</ReturnPage>;
}

function Activating() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { business, refetch } = useBusiness();
  const businessId = business?.id ?? "";
  const heading = useRef<HTMLHeadingElement>(null);
  /** Each "Check again" is a new 30 s. */
  const [round, setRound] = useState(0);
  /** Null while waiting; after 30 s without Pro, whether the last tries failed. */
  const [gaveUp, setGaveUp] = useState<{ unreachable: boolean } | null>(null);

  useEffect(() => {
    if (businessId) markCheckoutReturn(businessId);
  }, [businessId]);

  useEffect(() => {
    if (!businessId) return;
    return pollForPro({
      read: () => getSubscription(businessId),
      confirm: refetch,
      onPro: () => {
        clearCheckoutReturn(businessId);
        navigate("/dashboard?activated=1", { replace: true });
      },
      onGiveUp: setGaveUp,
    });
  }, [businessId, round, refetch, navigate]);

  // The heading changes with the page's state, and focus goes to it, so
  // the next Tab reaches the way on. Never as the page opens.
  const waiting = gaveUp === null;
  const shown = useRef(waiting);
  useEffect(() => {
    if (shown.current === waiting) return;
    shown.current = waiting;
    heading.current?.focus();
  }, [waiting]);

  return (
    <>
      <h1 id="return-title" ref={heading} tabIndex={-1} className="type-title text-ink outline-none">
        {t(waiting ? "billing.success.title" : "billing.success.waitingTitle")}
      </h1>
      <div aria-live="polite" className="flex flex-col gap-2">
        <p className="type-body text-ink-muted">{t(waiting ? "billing.success.finalizing" : "billing.success.timeout")}</p>
        {gaveUp?.unreachable && <p className="type-body text-ink-muted">{t("billing.success.unreachable")}</p>}
      </div>
      {waiting ? (
        // A line of light that breathes while it waits, and holds still
        // under reduced motion: the words carry the state.
        <Loading className="mt-3 w-full max-w-xs">
          <Skeleton className="h-2 w-full rounded-full" />
        </Loading>
      ) : (
        <div className="mt-2 flex flex-wrap justify-center gap-3">
          <Button
            onClick={() => {
              setGaveUp(null);
              setRound((n) => n + 1);
            }}
            className="max-w-full !whitespace-normal text-center"
          >
            {t("billing.success.check")}
          </Button>
          <LinkButton to="/dashboard" variant="quiet" className="max-w-full !whitespace-normal text-center">
            {t("dashboard.toOverview")}
          </LinkButton>
        </div>
      )}
    </>
  );
}
