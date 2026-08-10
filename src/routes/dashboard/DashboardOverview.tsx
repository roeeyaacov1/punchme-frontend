import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button, Card } from "../../components/ui";
import { CardPreview } from "../../components/card-studio/CardPreviews";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { designImageUrls, getTemplateDesign } from "../../api/designs";
import { previewCard, type EnrollOut } from "../../api/loyalty";
import { buildEnrollUrl } from "../../lib/enrollUrl";
import { useWalletPass } from "../../hooks/useWalletPass";

export function DashboardOverview() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  const [searchParams] = useSearchParams();
  const justActivated = searchParams.get("activated") === "1";

  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates?.[0];

  // The effective design doc — what the wallet actually renders, so the
  // preview here matches the Card Studio and the customer's real pass.
  const { data: design } = useQuery({
    queryKey: ["design", template?.id],
    queryFn: () => getTemplateDesign(business!.id!, template!.id!),
    enabled: !!business?.id && !!template?.id,
  });

  const [previewResult, setPreviewResult] = useState<EnrollOut | null>(null);
  useEffect(() => {
    if (business?.id && template?.id) {
      previewCard(business.id, template.id).then(setPreviewResult);
    }
  }, [business?.id, template?.id]);

  // Issued asynchronously — poll until the pass URL lands.
  const ownerPass = useWalletPass(previewResult);

  const [copied, setCopied] = useState(false);
  async function handleCopyLink() {
    if (!template?.id) return;
    await navigator.clipboard.writeText(buildEnrollUrl(template.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const images = designImageUrls(design);

  if (!template) {
    return isLoadingTemplates ? (
      <p className="text-slate font-mono text-sm">{t("common.loading")}</p>
    ) : null;
  }

  return (
    <div className="flex flex-col gap-6">
      {justActivated && canEnroll && (
        <p className="rounded-xl bg-emerald-50 text-emerald-800 px-4 py-3 text-sm font-body">
          {t("billing.success.done")}
        </p>
      )}
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <div className="flex justify-center w-full lg:w-auto">
          {design && (
            <CardPreview
              businessName={business?.name ?? ""}
              stampsRequired={template.stamps_required}
              currentStamps={previewResult?.stamp_count ?? 0}
              rewardDescription={template.reward_description}
              backgroundColor={template.background_color}
              foregroundColor={template.foreground_color}
              labelColor={template.label_color}
              design={design.design}
              logoUrl={images.logo ?? template.logo_url ?? undefined}
              appleLogoUrl={images.apple_logo}
              stripBaseUrl={images.strip_base}
            />
          )}
        </div>

        <div className="flex flex-col gap-6 w-full max-w-sm">
          <Card>
            <h2 className="text-lg font-heading mb-3">{t("dashboard.qr.title")}</h2>
            {canEnroll ? (
              <div dir="ltr" className="flex flex-col items-center gap-4">
                <QRCodeSVG value={buildEnrollUrl(template.id!)} size={160} />
                <Button variant="secondary" size="sm" onClick={handleCopyLink}>
                  {copied ? t("common.copied") : t("common.copyLink")}
                </Button>
              </div>
            ) : (
              <Link to="/dashboard/billing" className="text-sm text-navy underline">
                {t("dashboard.qr.activateCta")}
              </Link>
            )}
          </Card>

          <Card>
            <h2 className="text-lg font-heading mb-1">{t("dashboard.preview.title")}</h2>
            <p className="text-sm text-slate font-body mb-3">{t("dashboard.preview.body")}</p>
            <WalletAddButtons
              passUrl={ownerPass.passUrl}
              pending={ownerPass.pending}
              slow={ownerPass.slow}
              onRetry={ownerPass.retry}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
