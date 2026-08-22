import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { ctaClasses } from "../../components/marketing/primitives";
import { getPublicCard } from "../../api/loyalty";
import { PassStage } from "./PassStage";

/** Where the QR on a lost pass, and the link under the join screen, both
 * land. Shows the same real card the join page does — this is the page a
 * customer opens *because* they can't find the pass, so a mock of it is
 * exactly the wrong thing to hand them. */
export function CardStatusPage() {
  const { t } = useTranslation();
  const { serial } = useParams<{ serial: string }>();
  const { data: card, isLoading, isError } = useQuery({
    queryKey: ["card", serial],
    queryFn: () => getPublicCard(serial!),
    enabled: !!serial,
    retry: false,
  });

  return (
    <div className="theme-purple theme-raised min-h-screen bg-background px-5 py-10 text-ink sm:py-16">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-7 rounded-2xl border border-border bg-surface px-5 py-8 shadow-card sm:px-8">
        {isLoading ? (
          <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>
        ) : isError || !card || !serial ? (
          <p className="text-center font-body text-ink">{t("enroll.notFound")}</p>
        ) : (
          <>
            <h1 className="text-center text-2xl font-heading font-bold text-ink">
              {t("enroll.statusTitle")}
            </h1>
            {/* The installed pass encodes its PassKit member id, but the scan
                lookup matches `serial OR passkit_pass_id` — the printed-QR
                path — so the code drawn here resolves to this same card even
                though the two payloads differ. */}
            <PassStage card={card} serial={serial} />
            {/* Lost the pass? The universal link re-adds this same card. */}
            <WalletAddButtons
              passUrl={card.wallet_pass_url}
              pending={card.wallet_issue_pending}
              linkClassName={ctaClasses("gradient", "lg", "w-full max-w-[300px]")}
            />
          </>
        )}
      </div>
    </div>
  );
}
