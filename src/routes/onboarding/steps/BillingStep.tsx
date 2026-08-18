import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { createCheckoutSession } from "../../../api/billing";
import { listTemplates } from "../../../api/businesses";
import { designImageUrls, getTemplateDesign } from "../../../api/designs";
import { useBusiness } from "../../../business/useBusiness";
import type { CardPreviewValue } from "../../../components/card-studio/CardPreviews";
import { PunchMark } from "../../../components/marketing/PunchMark";
import { StepShell } from "../../../components/onboarding/StepShell";
import { focusRing } from "../../../components/marketing/primitives";
import { cn } from "../../../lib/cn";
import { useOnboardingDraft } from "../useOnboardingDraft";
import { sampleStamps } from "../draft";

/**
 * The last step, and the only one that asks for money. It says exactly what
 * activation unlocks, what stays free, and lets the owner walk to the
 * dashboard without paying — the landing page promised "free to design", and
 * this is where that promise is kept or broken.
 */
export function BillingStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { business, isLoading: businessLoading } = useBusiness();
  const { draft, clear, setPreviewOverride, artUrl } = useOnboardingDraft();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const businessId = business?.id ?? null;
  const bullets = t("onboarding.billing.bullets", { returnObjects: true }) as string[];

  useEffect(() => {
    if (!businessLoading && !businessId) navigate("/onboarding/account", { replace: true });
  }, [businessLoading, businessId, navigate]);

  // Keep the phone on the real card while we are here.
  const templatesQuery = useQuery({
    queryKey: ["templates", businessId],
    queryFn: () => listTemplates(businessId!),
    enabled: !!businessId,
  });
  const templateId = useMemo(() => {
    const list = templatesQuery.data;
    if (!list?.length) return null;
    return (list.find((c) => c.id === draft.committed?.templateId) ?? list[0]).id ?? null;
  }, [templatesQuery.data, draft.committed?.templateId]);
  const designQuery = useQuery({
    queryKey: ["design", templateId],
    queryFn: () => getTemplateDesign(businessId!, templateId!),
    enabled: !!businessId && !!templateId,
  });
  const design = designQuery.data;
  useEffect(() => {
    if (!design || !business || !design.sync.synced_at) return;
    const images = designImageUrls(design);
    const value: CardPreviewValue = {
      businessName: business.name,
      stampsRequired: design.stamps_required,
      currentStamps: sampleStamps(design.stamps_required),
      rewardDescription: design.reward_description,
      backgroundColor: design.background_color,
      foregroundColor: design.foreground_color,
      labelColor: design.label_color,
      design: design.design,
      logoUrl: images.logo,
      appleLogoUrl: images.apple_logo,
      stripBaseUrl: images.strip_base,
      stripStates: images.strip_states,
      heroStates: images.hero_states,
      stampArtUrl: design.assets.includes("stamp_art") ? artUrl : undefined,
      unsaved: false,
    };
    setPreviewOverride(value);
  }, [design, business, artUrl, setPreviewOverride]);
  useEffect(() => () => setPreviewOverride(null), [setPreviewOverride]);

  async function activate() {
    if (!businessId || busy) return;
    setBusy(true);
    setError(null);
    try {
      const { checkout_url } = await createCheckoutSession(businessId);
      // The draft has done its job; the success page takes over from here.
      clear();
      window.location.href = checkout_url;
    } catch {
      setError(t("billing.error"));
      setBusy(false);
    }
  }

  function notNow() {
    clear();
    navigate("/dashboard");
  }

  return (
    <StepShell
      title={t("onboarding.billing.title")}
      subtitle={t("onboarding.billing.subtitle")}
      onNext={activate}
      nextLabel={t("onboarding.billing.activateCta")}
      nextBusy={busy}
      nextDisabled={!businessId}
      error={error}
      footer={
        <button
          type="button"
          onClick={notNow}
          className={cn(
            "inline-flex min-h-[44px] items-center justify-center self-center rounded-lg px-3 text-sm font-semibold text-ink-muted underline underline-offset-2 hover:text-ink",
            focusRing,
          )}
        >
          {t("onboarding.billing.notNow")}
        </button>
      }
    >
      {/* The price, ruled off — a figure on a board, as on the landing page. */}
      <div className="border-y border-border-strong py-5">
        <p className="flex items-baseline gap-1.5">
          <span className="t-figure font-heading text-5xl font-bold tracking-tight text-ink">
            {t("landing.pricing.price")}
          </span>
          <span className="text-sm text-ink-muted">{t("onboarding.billing.priceNote")}</span>
        </p>
      </div>

      <ul className="flex flex-col gap-2.5">
        {bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2.5 text-ink">
            <span className="mt-0.5 shrink-0">
              <PunchMark state="stamped" size={16} />
            </span>
            <span className="text-pretty">{bullet}</span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-ink-muted">{t("onboarding.billing.freeNote")}</p>
    </StepShell>
  );
}
