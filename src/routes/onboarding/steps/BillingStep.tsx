import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Check, CircleAlert } from "lucide-react";
import { createCheckoutSession } from "../../../api/billing";
import { listTemplates } from "../../../api/businesses";
import { getTemplateDesign } from "../../../api/designs";
import { useBusiness } from "../../../business/useBusiness";
import { Badge, Button, Figure, linkText, LitPanel, Skeleton } from "../../../components/kit";
import { noTapFlash } from "../../../components/kit/classes";
import { PUNCHME_MONTHLY_PRICE } from "../../../components/marketing/calculator";
import { StepHeading, StepShell } from "../../../components/onboarding/StepShell";
import { cn } from "../../../lib/cn";
import { CardStage } from "../CardStage";
import { checkoutProblemKey } from "../problems";
import { useOnboardingDraft } from "../useOnboardingDraft";
import { usePublishedPreview } from "../usePublishedPreview";

/** The four things activating turns on, in the order Billing names them. */
const UNLOCKS = ["join", "messages", "standee", "referrals"] as const;

/** The price as a figure, for `billing.price`'s `<ltr>` part. */
function PriceFigure({ children }: { children?: ReactNode }) {
  return <Figure value={children} size="stat" />;
}

/**
 * Going live: the last stop, and the only one that asks for money. It makes
 * the case on the band's light, in the dashboard Billing's own words: the
 * price with VAT in it, the four things activating turns on, Activate, and
 * "Not now" right under it, both in the first screen, then where paying
 * happens and how to stop. Under the panel, what stays free and the
 * calculator for anyone unsure. The landing page promised "free to design",
 * and this is where that promise is kept or broken.
 *
 * Activate clears the draft and leaves for Stripe's page; a press that
 * doesn't get there is said under the button by its cause, focus kept on it.
 * "Not now" clears the draft and goes to the dashboard.
 */
export function BillingStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { business, isLoading: businessLoading } = useBusiness();
  const { draft, clear, artUrl } = useOnboardingDraft();
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const businessId = business?.id ?? null;

  useEffect(() => {
    if (!businessLoading && !businessId) navigate("/onboarding/account", { replace: true });
  }, [businessLoading, businessId, navigate]);

  // The card is the saved one, read again: a Skip on the wallet step has
  // already cleared the draft.
  const templatesQuery = useQuery({
    queryKey: ["templates", businessId],
    queryFn: () => listTemplates(businessId!),
    enabled: !!businessId,
  });
  const template = useMemo(() => {
    const list = templatesQuery.data;
    if (!list?.length) return null;
    return list.find((candidate) => candidate.id === draft.committed?.templateId) ?? list[0];
  }, [templatesQuery.data, draft.committed?.templateId]);
  const templateId = template?.id ?? null;
  const designQuery = useQuery({
    queryKey: ["design", templateId],
    queryFn: () => getTemplateDesign(businessId!, templateId!),
    enabled: !!businessId && !!templateId,
  });
  const published = usePublishedPreview(designQuery.data, business, artUrl, template?.name);

  async function activate() {
    if (!businessId || busy) return;
    setBusy(true);
    setProblem(null);
    try {
      const { checkout_url } = await createCheckoutSession(businessId);
      // The draft has done its job; the success page takes over from here.
      clear();
      window.location.href = checkout_url;
    } catch (error) {
      setProblem(checkoutProblemKey(error));
      setBusy(false);
    }
  }

  function notNow() {
    // Held while Activate is on its way to Stripe, which would take the
    // owner there anyway, from the dashboard.
    if (busy) return;
    clear();
    navigate("/dashboard");
  }

  // Not live yet, said on the card itself. With the draft cleared and the
  // saved card still on its way, its place is held rather than drawn empty.
  const card =
    published || draft.name.trim() ? (
      <CardStage
        crop="top"
        preview={published ?? undefined}
        tag={<Badge className="bg-surface">{t("dashboard.plan.notLive")}</Badge>}
      />
    ) : (
      <Skeleton className="mx-auto h-44 w-[340px] max-w-full !rounded-glass lg:h-[27rem]" />
    );

  return (
    <StepShell cardFirst card={card}>
      <LitPanel light="band" as="section" className="flex flex-col gap-5 p-5 sm:p-6">
        <StepHeading title={t("onboarding.billing.title")} />
        <p className="type-body flex flex-wrap items-baseline gap-x-2 text-ink-muted">
          <Trans i18nKey="billing.price" values={{ price: PUNCHME_MONTHLY_PRICE }} components={{ ltr: <PriceFigure /> }} />
        </p>
        <div className="flex flex-col gap-2">
          <h2 className="type-label text-ink">{t("billing.unlocks.title")}</h2>
          <ul className="flex flex-col gap-1.5">
            {UNLOCKS.map((unlock) => (
              <li key={unlock} className="type-body flex items-start gap-2 text-ink">
                <Check aria-hidden strokeWidth={2.5} className="mt-0.5 size-5 shrink-0" />
                {t(`billing.unlocks.${unlock}`)}
              </li>
            ))}
          </ul>
        </div>
        <div className="flex flex-col gap-3">
          <Button size="lg" busy={busy} onClick={() => void activate()} className="w-full !whitespace-normal text-center">
            {t("billing.activateCta")}
          </Button>
          {/* Danger's red on the band: 5.96:1 at its light end, 5.50:1 at
              its warm one. */}
          {problem && (
            <p role="alert" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
              <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
              <span>{t(problem)}</span>
            </p>
          )}
          <Button variant="secondary" size="lg" onClick={notNow} className="w-full !whitespace-normal text-center">
            {t("onboarding.billing.notNow")}
          </Button>
          <p className="text-sm leading-snug text-ink-muted">{t("onboarding.billing.how")}</p>
        </div>
      </LitPanel>
      <section aria-labelledby="billing-free-title" className="flex flex-col gap-2">
        <h2 id="billing-free-title" className="type-card-title text-ink">
          {t("billing.free.staysTitle")}
        </h2>
        <p className="type-body text-pretty text-ink-muted">{t("billing.free.stays")}</p>
        {/* The calculator runs on the owner's own numbers, and can say no. */}
        <p className="type-body">
          <a href="/#calculator" className={cn(linkText, noTapFlash, "inline-flex min-h-11 items-center")}>
            {t("billing.free.calculator")}
          </a>
        </p>
      </section>
    </StepShell>
  );
}
