import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../../components/ui";
import { useBusiness } from "../../business/useBusiness";
import { listTemplates } from "../../api/businesses";
import { buildEnrollUrl } from "../../lib/enrollUrl";

export function StandeePage() {
  const { t } = useTranslation();
  const { business } = useBusiness();

  const { data: templates } = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates?.[0];

  if (!template) return null;

  return (
    <div className="flex flex-col items-center gap-6">
      <Button variant="secondary" size="sm" onClick={() => window.print()} className="print:hidden">
        {t("dashboard.standee.print")}
      </Button>

      <div
        dir="ltr"
        className="flex flex-col items-center gap-6 rounded-3xl border border-navy/10 p-12 print:border-0"
      >
        <h1 className="text-2xl font-heading text-navy text-center">{business?.name}</h1>
        <QRCodeSVG value={buildEnrollUrl(template.id!)} size={280} />
        <p className="text-sm text-slate font-body text-center max-w-xs">
          {template.reward_description}
        </p>
      </div>
    </div>
  );
}
