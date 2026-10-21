import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Wallet } from "lucide-react";
import { AppleCardPreview, GoogleCardPreview } from "../../../components/card-studio/CardPreviews";
import { Button, LinkButton, LitPanel, SegmentedControl, Skeleton, WallpaperStage } from "../../../components/kit";
import type { CardTemplate } from "../../../api/businesses";
import { designImageUrls, type DesignDoc, type DesignOut } from "../../../api/designs";
import type { EnrollOut } from "../../../api/loyalty";
import { useWalletPass } from "../../../hooks/useWalletPass";

type WalletKind = "apple" | "google";

/**
 * The owner's own pass, standing on a wallpaper made from its colours, as the
 * customer's phone shows it. No notification over it: this page reads no
 * messages. Before activation it is the trial pass, the one card that can be
 * scanned at Scan to watch a stamp land.
 *
 * Its add link and waiting notes come straight from `useWalletPass`, rather
 * than from the shared `WalletAddButtons`, whose waiting note sets Hebrew in
 * Plex Mono and which the join and status pages still wear.
 */
export function OwnPass({
  businessName,
  template,
  design,
  preview,
  trial,
  className,
}: {
  businessName: string;
  template: CardTemplate;
  design: DesignOut | undefined;
  preview: EnrollOut | null;
  /** Free: the pass is the trial one. */
  trial: boolean;
  className?: string;
}) {
  const { t } = useTranslation();
  const [wallet, setWallet] = useState<WalletKind>(() =>
    typeof navigator !== "undefined" && /iPhone|iPad|Macintosh/.test(navigator.userAgent) ? "apple" : "google",
  );
  const pass = useWalletPass(preview);
  const images = designImageUrls(design);
  const Preview = wallet === "apple" ? AppleCardPreview : GoogleCardPreview;
  const filled = preview?.stamp_count ?? 0;

  return (
    <LitPanel as="section" aria-labelledby="own-pass-title" className={className}>
      <div className="flex h-full flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-1">
          <h2 id="own-pass-title" className="type-card-title text-ink">
            {t(trial ? "dashboard.preview.title" : "dashboard.overview.ownPass")}
          </h2>
          <p className="type-body text-ink-muted">
            {t(trial ? "dashboard.overview.trialScan" : "dashboard.overview.ownPassBody")}
          </p>
        </div>
        <SegmentedControl<WalletKind>
          label={t("onboarding.preview.wallets")}
          hideLabel
          value={wallet}
          onChange={setWallet}
          options={[
            { value: "apple", label: t("studio.preview.apple") },
            { value: "google", label: t("studio.preview.google") },
          ]}
        />
        {/* The stage wants 340px; on a narrower phone it runs to the panel's
            edges and clips the pass's sides rather than squeeze it. */}
        <div className="-mx-4 flex justify-center sm:mx-0">
          {design ? (
            <WallpaperStage
              cardColor={template.background_color}
              stampColor={(design.design as DesignDoc).stamp?.color || template.foreground_color}
              foregroundColor={template.foreground_color}
              summary={t("dashboard.overview.passSummary", { filled, total: template.stamps_required })}
            >
              <Preview
                businessName={businessName}
                cardName={template.name}
                stampsRequired={template.stamps_required}
                currentStamps={filled}
                rewardDescription={template.reward_description}
                backgroundColor={template.background_color}
                foregroundColor={template.foreground_color}
                labelColor={template.label_color}
                design={design.design}
                logoUrl={images.logo ?? template.logo_url ?? undefined}
                appleLogoUrl={images.apple_logo}
                stripBaseUrl={images.strip_base}
                serial={preview?.card_serial}
              />
            </WallpaperStage>
          ) : (
            <Skeleton className="h-96 w-[300px] rounded-card" />
          )}
        </div>
        <div className="flex min-h-11 flex-col items-center justify-center gap-2 text-center">
          {pass.passUrl ? (
            <LinkButton href={pass.passUrl} variant="ink" icon={<Wallet aria-hidden />}>
              {t("wallet.addToWallet")}
            </LinkButton>
          ) : pass.slow ? (
            <>
              <p className="type-body text-ink-muted">{t("wallet.pendingSlow")}</p>
              <Button variant="quiet" onClick={pass.retry}>
                {t("wallet.retry")}
              </Button>
            </>
          ) : pass.pending ? (
            <p className="type-body text-ink-muted">{t("wallet.pending")}</p>
          ) : null}
        </div>
      </div>
    </LitPanel>
  );
}
