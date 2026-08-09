import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "../../components/ui";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listTemplates, type CardTemplate } from "../../api/businesses";
import { getTemplateDesign } from "../../api/designs";
import { buildEnrollUrl } from "../../lib/enrollUrl";

type PrintFormat = "a4" | "a5" | "tent";

/** A real printable carrying the business's own design: card colors +
 * logo, the reward line, Hebrew join instructions, and the QR to
 * /join/{templateId}. Print via the browser (Ctrl+P → save as PDF is the
 * downloadable file); @page CSS sets the paper size per format, and the
 * table-tent format prints two mirrored halves to fold. */
export function StandeePage() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  const [format, setFormat] = useState<PrintFormat>("a4");

  const { data: templates } = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates?.[0];

  const { data: design } = useQuery({
    queryKey: ["design", template?.id],
    queryFn: () => getTemplateDesign(business!.id!, template!.id!),
    enabled: !!business?.id && !!template?.id,
  });

  if (!template) {
    return <p className="text-slate font-mono text-sm">{t("common.loading")}</p>;
  }

  const images = (design?.images ?? {}) as Record<string, unknown>;
  const logoUrl =
    typeof images.logo === "string" ? (images.logo as string) : undefined;

  return (
    <div className="flex flex-col gap-6">
      <style>{printCss(format)}</style>

      <div className="print:hidden flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-heading text-navy flex-1">
          {t("standee.title")}
        </h1>
        <div className="flex gap-1 rounded-full border border-slate/25 p-1">
          {(["a4", "a5", "tent"] as PrintFormat[]).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => setFormat(key)}
              className={
                format === key
                  ? "rounded-full bg-navy text-white px-3 py-1 text-sm"
                  : "rounded-full px-3 py-1 text-sm text-navy hover:bg-navy/5"
              }
            >
              {t(`standee.formats.${key}`)}
            </button>
          ))}
        </div>
        <Button onClick={() => window.print()}>{t("standee.print")}</Button>
      </div>

      {!canEnroll && (
        <p className="print:hidden rounded-xl bg-amber-50 text-amber-800 px-4 py-3 text-sm font-body">
          {t("standee.activateFirst")}{" "}
          <Link to="/dashboard/billing" className="underline">
            {t("dashboard.qr.activateCta")}
          </Link>
        </p>
      )}
      <p className="print:hidden text-sm text-slate font-body">
        {t("standee.downloadHint")}
      </p>

      <div id="standee-sheet" className="mx-auto w-full">
        <StandeePanel template={template} businessName={business?.name ?? ""} logoUrl={logoUrl} />
        {format === "tent" && (
          <div className="tent-flip">
            <StandeePanel
              template={template}
              businessName={business?.name ?? ""}
              logoUrl={logoUrl}
            />
          </div>
        )}
      </div>
    </div>
  );
}

function StandeePanel({
  template,
  businessName,
  logoUrl,
}: {
  template: CardTemplate;
  businessName: string;
  logoUrl?: string;
}) {
  const { t } = useTranslation();
  return (
    <div
      className="standee-panel flex flex-col items-center text-center gap-6 rounded-3xl px-10 py-12"
      style={{
        backgroundColor: template.background_color ?? "#FFFFFF",
        color: template.foreground_color ?? "#000000",
      }}
    >
      {logoUrl ? (
        <img src={logoUrl} alt="" className="h-16 max-w-[220px] object-contain" />
      ) : null}
      <h2 className="text-3xl font-heading leading-tight">{businessName}</h2>
      <p className="text-xl font-body" style={{ color: template.label_color ?? undefined }}>
        {template.reward_description}
      </p>

      <ol className="text-base font-body leading-relaxed space-y-1">
        <li>{t("standee.step1")}</li>
        <li>{t("standee.step2")}</li>
        <li>{t("standee.step3")}</li>
      </ol>

      <div dir="ltr" className="bg-white rounded-2xl p-4">
        <QRCodeSVG value={buildEnrollUrl(template.id!)} size={200} />
      </div>

      <p className="text-sm font-body opacity-80">{t("standee.scanCta")}</p>
      <p className="text-[10px] font-mono opacity-60" dir="ltr">
        powered by PunchMe
      </p>
    </div>
  );
}

/** Per-format print CSS. The screen shows the same panel scaled; print
 * hides the app chrome (Tailwind print:hidden) and sizes the paper. */
function printCss(format: PrintFormat): string {
  const page =
    format === "a5" ? "A5 portrait" : format === "tent" ? "A4 landscape" : "A4 portrait";
  return `
@page { size: ${page}; margin: 12mm; }
@media print {
  body { background: white !important; }
  header, nav { display: none !important; }
  main { padding: 0 !important; }
  #standee-sheet { width: 100%; max-width: none; }
  .standee-panel { border-radius: 0; min-height: ${format === "tent" ? "auto" : "80vh"}; justify-content: center; page-break-inside: avoid; }
  .tent-flip { transform: rotate(180deg); margin-top: 10mm; }
}
@media screen {
  #standee-sheet { max-width: ${format === "a5" ? "420px" : "560px"}; }
  .tent-flip { transform: rotate(180deg); margin-top: 16px; }
}
`;
}
