import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Button } from "../../components/ui";
import { WalletCardPreview } from "../../components/wallet-card/WalletCardPreview";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { previewCard, type EnrollOut } from "../../api/loyalty";
import type { Business, CardTemplate } from "../../api/businesses";

interface FinishStepProps {
  business: Business;
  template: CardTemplate;
}

export function FinishStep({ business, template }: FinishStepProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [card, setCard] = useState<EnrollOut | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    previewCard(business.id!, template.id!)
      .then(setCard)
      .catch(() => setError(t("auth.error")));
  }, [business.id, template.id, t]);

  return (
    <div className="flex flex-col items-center gap-8 w-full max-w-sm text-center">
      <h1 className="text-2xl text-navy">{t("onboarding.finish.title")}</h1>
      <p className="text-slate font-body">{t("onboarding.finish.body")}</p>

      <WalletCardPreview
        businessName={business.name}
        stampsRequired={template.stamps_required}
        currentStamps={card?.stamp_count ?? 0}
        rewardDescription={template.reward_description}
        backgroundColor={template.background_color}
        foregroundColor={template.foreground_color}
        labelColor={template.label_color}
        logoUrl={template.logo_url ?? undefined}
      />

      {error && <p className="text-sm text-red-600">{error}</p>}
      {card && (
        <WalletAddButtons
          passUrl={card.wallet_pass_url}
          pending={card.wallet_issue_pending}
        />
      )}

      <Button onClick={() => navigate("/dashboard")}>
        {t("onboarding.finish.cta")}
      </Button>
    </div>
  );
}
