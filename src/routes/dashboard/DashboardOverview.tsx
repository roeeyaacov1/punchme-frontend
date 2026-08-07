import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button, Card } from "../../components/ui";
import { WalletCardPreview } from "../../components/wallet-card/WalletCardPreview";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { previewCard, type EnrollOut } from "../../api/loyalty";
import { buildEnrollUrl } from "../../lib/enrollUrl";

export function DashboardOverview() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);

  const { data: templates } = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates?.[0];

  const [previewResult, setPreviewResult] = useState<EnrollOut | null>(null);
  useEffect(() => {
    if (business?.id && template?.id) {
      previewCard(business.id, template.id).then(setPreviewResult);
    }
  }, [business?.id, template?.id]);

  const [copied, setCopied] = useState(false);
  async function handleCopyLink() {
    if (!template?.id) return;
    await navigator.clipboard.writeText(buildEnrollUrl(template.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (!template) return null;

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      <div className="flex justify-center w-full lg:w-auto">
        <WalletCardPreview
          businessName={business?.name ?? ""}
          stampsRequired={template.stamps_required}
          rewardDescription={template.reward_description}
          backgroundColor={template.background_color}
          foregroundColor={template.foreground_color}
          labelColor={template.label_color}
          logoUrl={template.logo_url ?? undefined}
        />
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
          {previewResult && (
            <WalletAddButtons
              appleUrl={previewResult.wallet_apple_url}
              googleUrl={previewResult.wallet_google_url}
              pending={previewResult.wallet_issue_pending}
            />
          )}
        </Card>
      </div>
    </div>
  );
}
