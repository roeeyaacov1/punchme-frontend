import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import { LitStage, Notice } from "../../components/dashboard/primitives";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listTemplates, type CardTemplate } from "../../api/businesses";
import { getTemplateDesign } from "../../api/designs";
import { buildEnrollUrl } from "../../lib/enrollUrl";
import { cn } from "../../lib/cn";

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
    return <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>;
  }

  const images = (design?.images ?? {}) as Record<string, unknown>;
  const logoUrl =
    typeof images.logo === "string" ? (images.logo as string) : undefined;

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <style>{printCss(format)}</style>

      <div className="flex flex-wrap items-center gap-3 print:hidden">
        <h1 className="t-h3 flex-1 text-ink">{t("standee.title")}</h1>
        {/* Paper sizes, so the control is set in the same mono the pass sets
            its field labels in — this is a spec, not a preference. */}
        <div
          role="group"
          aria-label={t("standee.title")}
          className="flex gap-1 rounded-xl border border-border bg-surface p-1"
        >
          {(["a4", "a5", "tent"] as PrintFormat[]).map((key) => (
            <button
              key={key}
              type="button"
              aria-pressed={format === key}
              onClick={() => setFormat(key)}
              className={cn(
                "inline-flex min-h-[44px] items-center rounded-lg px-3 text-sm font-medium transition-colors",
                format === key
                  ? "bg-primary text-primary-on"
                  : "text-ink-muted hover:text-ink",
                focusRing,
              )}
            >
              {t(`standee.formats.${key}`)}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className={ctaClasses("primary", "sm")}
        >
          {t("standee.print")}
        </button>
      </div>

      {!canEnroll && (
        <Notice tone="warn" className="print:hidden">
          {t("standee.activateFirst")}{" "}
          <Link
            to="/dashboard/billing"
            className={cn("font-semibold underline hover:no-underline", focusRing)}
          >
            {t("dashboard.qr.activateCta")}
          </Link>
        </Notice>
      )}
      <p className="text-sm text-ink-muted print:hidden">
        {t("standee.downloadHint")}
      </p>

      {/* Paper does not have a dark mode. On a dark page the sheet is staged
          on a lit surface rather than repainted — and in print the staging
          disappears entirely, because there is nothing behind a sheet of A4. */}
      <LitStage className="mx-auto w-full print:bg-transparent print:p-0 print:shadow-none print:ring-0">
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
      </LitStage>
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
  /* The desktop rail is an aside, which the redesign added — without it
     here the nav column prints down the side of the sheet. */
  header, nav, aside { display: none !important; }
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
