import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { CardPreview } from "../../components/card-studio/CardPreviews";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { previewCard, type EnrollOut } from "../../api/loyalty";
import { designImageUrls, getTemplateDesign, type DesignOut } from "../../api/designs";
import { useWalletPass } from "../../hooks/useWalletPass";
import type { Business, CardTemplate } from "../../api/businesses";

interface FinishStepProps {
  business: Business;
  template: CardTemplate;
}

export function FinishStep({ business, template }: FinishStepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [card, setCard] = useState<EnrollOut | null>(null);
  const [design, setDesign] = useState<DesignOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  // The pass is issued asynchronously — this polls until its URL lands.
  const wallet = useWalletPass(card);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      previewCard(business.id!, template.id!),
      // The same effective design the wallet renders, so this preview is the
      // real one (glyph, pattern, barcode, field labels), not a CSS mock.
      getTemplateDesign(business.id!, template.id!),
    ])
      .then(([ownerCard, templateDesign]) => {
        if (cancelled) return;
        setCard(ownerCard);
        setDesign(templateDesign);
      })
      .catch(() => {
        if (!cancelled) setError(t("auth.error"));
      });
    return () => {
      cancelled = true;
    };
  }, [business.id, template.id, t]);

  const images = designImageUrls(design ?? undefined);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm text-center">
      <h1 className="text-2xl text-navy">{t("onboarding.finish.title")}</h1>
      <p className="text-slate font-body">{t("onboarding.finish.body")}</p>

      {design ? (
        <CardPreview
          businessName={business.name}
          stampsRequired={template.stamps_required}
          currentStamps={card?.stamp_count ?? 0}
          rewardDescription={template.reward_description}
          backgroundColor={template.background_color}
          foregroundColor={template.foreground_color}
          labelColor={template.label_color}
          design={design.design}
          logoUrl={images.logo ?? template.logo_url ?? undefined}
          appleLogoUrl={images.apple_logo}
          stripBaseUrl={images.strip_base}
        />
      ) : (
        !error && <p className="text-slate font-mono text-sm">{t("common.loading")}</p>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      <WalletAddButtons
        passUrl={wallet.passUrl}
        pending={wallet.pending}
        slow={wallet.slow}
        onRetry={wallet.retry}
      />

      <Button onClick={() => navigate("/dashboard")}>
        {t("onboarding.finish.cta")}
      </Button>
    </div>
  );
}
