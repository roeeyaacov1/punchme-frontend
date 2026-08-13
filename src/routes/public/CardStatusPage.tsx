import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { WalletCardPreview } from "../../components/wallet-card/WalletCardPreview";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { getPublicCard } from "../../api/loyalty";

export function CardStatusPage() {
  const { t } = useTranslation();
  const { serial } = useParams<{ serial: string }>();
  const { data: card, isLoading, isError } = useQuery({
    queryKey: ["card", serial],
    queryFn: () => getPublicCard(serial!),
    enabled: !!serial,
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-slate font-mono text-sm">
        {t("common.loading")}
      </div>
    );
  }

  if (isError || !card) {
    return (
      <div className="min-h-screen flex items-center justify-center text-navy font-body px-6 text-center">
        {t("enroll.notFound")}
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center gap-8 bg-white text-navy px-6 py-16 text-center">
      <h1 className="text-2xl">{t("enroll.statusTitle")}</h1>
      <WalletCardPreview
        businessName={card.business_name}
        stampsRequired={card.stamps_required}
        currentStamps={card.stamp_count}
        rewardDescription={card.reward_description}
        backgroundColor={card.background_color}
        foregroundColor={card.foreground_color}
        labelColor={card.label_color}
        logoUrl={card.logo_url ?? undefined}
        // The installed pass encodes its PassKit member id, but the scan
        // lookup matches `serial OR passkit_pass_id` — the serial being the
        // printed-QR path — so a code built from the URL resolves to this
        // same card even though the two payloads differ.
        serial={serial}
      />
      {/* Lost the pass? The universal link re-adds this same card. */}
      <WalletAddButtons
        passUrl={card.wallet_pass_url}
        pending={card.wallet_issue_pending}
      />
    </div>
  );
}
