import { useEffect, useRef, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { createCheckoutSession, createPortalSession, getSubscription } from "../../api/billing";
import { useBusiness } from "../../business/useBusiness";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
import { Badge, Button, LitPanel, Loading, Notice, Skeleton, linkText } from "../../components/kit";
import { noTapFlash } from "../../components/kit/classes";
import { PUNCHME_MONTHLY_PRICE } from "../../components/marketing/calculator";
import { cn } from "../../lib/cn";
import { useLightboxPage } from "../../theme/lightboxPage";
import { checkoutReturnedAt } from "../billing/checkoutReturn";
import { ActivationPanel } from "./billing/ActivationPanel";
import { billingState, redirectProblem, type RedirectProblem } from "./billing/billingState";
import { listDay } from "./format";

type Leaving = "checkout" | "portal";

/** "14:05" today, "Sat 23:40" before: on the 24-hour clock, as Messages prints times. */
function returnClock(at: number, language: string): string {
  const today = new Date(at).toDateString() === new Date().toDateString();
  return new Intl.DateTimeFormat(language, {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    ...(!today && { weekday: "short" }),
  }).format(at);
}

/**
 * Where the business stands with PunchMe, then the one thing to do.
 *
 * The state comes from the subscription's own plan and Stripe's status
 * (`billingState`), never the plan alone: a renewal that failed leaves the
 * business on Free while Stripe still holds its subscription, and a second
 * checkout then would be billed and ignored. So Free offers Activate only
 * where a new checkout is safe, and sends a failed renewal to the portal
 * to fix the card. No action shows until the state is known.
 *
 * It answers the payer's questions before the button: what it costs, VAT
 * included, what activating turns on, what stays free, where paying
 * happens and how to stop. On Pro: what it costs, paid until when, where
 * to change or cancel it, and what cancelling does to customers' cards,
 * said before anyone does it.
 */
export function BillingSettingsPage() {
  const { t, i18n } = useTranslation();
  const language = i18n.language;
  const { business, refetch } = useBusiness();
  useLightboxPage();
  const businessId = business?.id ?? "";

  const subscription = useQuery({
    queryKey: ["subscription", businessId],
    queryFn: () => getSubscription(businessId),
    enabled: !!businessId,
  });

  // Busy while Stripe's session is made, then said out loud only once the
  // browser is really on its way there.
  const [leaving, setLeaving] = useState<Leaving | null>(null);
  const [opening, setOpening] = useState(false);
  const [problem, setProblem] = useState<{ to: Leaving; why: RedirectProblem } | null>(null);

  // Back from Stripe by the browser's Back, the page can be restored from
  // the back-forward cache as it was left: busy. It is idle again.
  useEffect(() => {
    const onShow = (event: PageTransitionEvent) => {
      if (!event.persisted) return;
      setLeaving(null);
      setOpening(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  // A webhook that landed between the business's read and this one: the
  // subscription is the newer word, so the business is read again (the
  // shell's own call), once, and the sign agrees with the page.
  const plan = subscription.data?.plan;
  const askedFor = useRef<string | null>(null);
  useEffect(() => {
    const mismatch = plan && business?.plan && plan !== business.plan ? `${plan}/${business.plan}` : null;
    if (!mismatch || askedFor.current === mismatch) return;
    askedFor.current = mismatch;
    void refetch();
  }, [plan, business?.plan, refetch]);

  async function leaveFor(to: Leaving) {
    if (!businessId || leaving) return;
    setProblem(null);
    setLeaving(to);
    try {
      const url =
        to === "checkout"
          ? (await createCheckoutSession(businessId)).checkout_url
          : (await createPortalSession(businessId)).portal_url;
      setOpening(true);
      window.location.href = url;
    } catch (error) {
      setLeaving(null);
      setProblem({ to, why: redirectProblem(error, to) });
    }
  }

  /** Under the button that tried, said as an alert; pressing again clears it. */
  function problemUnder(to: Leaving): ReactNode {
    if (problem?.to !== to) return null;
    return (
      <div role="alert" className="flex flex-col gap-0.5 text-sm font-semibold leading-snug text-danger">
        {problem.why === "unreachable" ? (
          <>
            <p>{t("dashboard.loadFailed.title")}</p>
            <p>{t("dashboard.loadFailed.body")}</p>
          </>
        ) : (
          <p>{t(`billing.problem.${problem.why}`)}</p>
        )}
      </div>
    );
  }

  const state = subscription.data ? billingState(subscription.data) : null;
  const activates = state === "notLive" || state === "unfinished" || state === "ended";
  // Wherever Activate shows, an unfinished checkout included: a payment
  // still completing there can turn active, and a second checkout would
  // then charge twice.
  const returnedAt = activates && businessId ? checkoutReturnedAt(businessId) : null;

  let body: ReactNode;
  if (!subscription.data && (subscription.isError || subscription.fetchStatus === "paused")) {
    body = (
      <ReadProblem
        title={t("billing.loadFailed")}
        error={subscription.error}
        paused={!subscription.isError}
        onRetry={() => void subscription.refetch()}
      />
    );
  } else if (!subscription.data || !state) {
    body = (
      <Loading>
        <LitPanel className="flex flex-col gap-4 p-5 sm:p-6">
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
          <Skeleton className="h-[3.25rem] w-36 rounded-full" />
        </LitPanel>
      </Loading>
    );
  } else if (activates) {
    body = (
      <>
        {state === "ended" && (
          <Notice tone="warn" title={t("billing.ended.title")}>
            {t("billing.ended.body")}
          </Notice>
        )}
        {returnedAt && (
          <Notice tone="warn">{t("billing.recent", { time: returnClock(returnedAt, language) })}</Notice>
        )}
        <ActivationPanel
          heading={t(state === "ended" ? "billing.ended.activateTitle" : "dashboard.plan.notLive")}
          unfinished={state === "unfinished"}
          busy={leaving === "checkout"}
          onActivate={() => void leaveFor("checkout")}
          problem={problemUnder("checkout")}
        />
        <LitPanel as="section" aria-labelledby="billing-free-title" className="flex flex-col gap-2 p-5 sm:p-6">
          <h2 id="billing-free-title" className="type-card-title text-ink">
            {t("billing.free.staysTitle")}
          </h2>
          <p className="type-body text-ink-muted">{t("billing.free.stays")}</p>
        </LitPanel>
        {/* The calculator runs on the owner's own numbers, costs the reward
            at cost, and can say no. Its underline thickens under a finger,
            so the phone's grey flash stays off. */}
        <p className="type-body">
          <a href="/#calculator" className={cn(linkText, noTapFlash, "inline-flex min-h-11 items-center")}>
            {t("billing.free.calculator")}
          </a>
        </p>
      </>
    );
  } else if (state === "paymentFailed") {
    body = (
      <Notice
        tone="warn"
        title={t("billing.failed.title")}
        action={
          <div className="flex flex-col items-start gap-2">
            <Button
              busy={leaving === "portal"}
              onClick={() => void leaveFor("portal")}
              className="max-w-full !whitespace-normal text-center"
            >
              {t("billing.failed.cta")}
            </Button>
            {problemUnder("portal")}
          </div>
        }
      >
        {t("billing.failed.body")}
      </Notice>
    );
  } else {
    const live = state === "live";
    const periodEnd = subscription.data.current_period_end;
    body = (
      <>
        <LitPanel as="section" aria-labelledby="billing-live-title" className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <h2 id="billing-live-title" className="type-card-title text-ink">
              {t("billing.plan.proTitle")}
            </h2>
            <Badge tone="ok">{t("billing.pro.badge")}</Badge>
          </div>
          {live ? (
            <>
              <p className="type-body text-ink">
                <Trans
                  i18nKey="billing.price"
                  values={{ price: PUNCHME_MONTHLY_PRICE }}
                  components={{ ltr: <bdi dir="ltr" className="type-figure" /> }}
                />
                {periodEnd && (
                  <>
                    {" · "}
                    {t(subscription.data.status === "trialing" ? "billing.pro.trialUntil" : "billing.pro.paidUntil", {
                      date: listDay(periodEnd, language),
                    })}
                  </>
                )}
              </p>
              <p className="type-body text-ink-muted">{t("billing.pro.manage")}</p>
              <div className="flex flex-col items-start gap-2">
                <Button
                  variant="secondary"
                  busy={leaving === "portal"}
                  onClick={() => void leaveFor("portal")}
                  className="max-w-full !whitespace-normal text-center"
                >
                  {t("billing.managePortalCta")}
                </Button>
                {problemUnder("portal")}
              </div>
            </>
          ) : (
            <p className="type-body text-ink-muted">{t("billing.unbilled")}</p>
          )}
        </LitPanel>
        {live && (
          <LitPanel as="section" aria-labelledby="billing-cancel-title" className="flex flex-col gap-2 p-5 sm:p-6">
            <h2 id="billing-cancel-title" className="type-card-title text-ink">
              {t("billing.pro.ifCancelTitle")}
            </h2>
            <p className="type-body text-ink-muted">{t("billing.pro.ifCancel")}</p>
          </LitPanel>
        )}
      </>
    );
  }

  return (
    <div className="flex max-w-[40rem] flex-col gap-6">
      <h1 className="type-title text-ink">{t("billing.title")}</h1>
      <p aria-live="polite" className="sr-only">
        {opening ? t("billing.leaving") : ""}
      </p>
      {body}
    </div>
  );
}
