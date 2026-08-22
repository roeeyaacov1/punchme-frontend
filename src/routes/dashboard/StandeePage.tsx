import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Printer } from "lucide-react";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import {
  GroupLabel,
  LitStage,
  Notice,
  Panel,
  PanelHeader,
  SegmentedControl,
} from "../../components/dashboard/primitives";
import {
  PRINT_FORMATS,
  SHEET_SPECS,
  STANDEE_DESIGNS,
  StandeeSheet,
  type PrintFormat,
  type StandeeArt,
  type StandeeDesign,
} from "../../components/dashboard/Standee";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { getTemplateDesign, type DesignDoc } from "../../api/designs";
import { buildEnrollUrl } from "../../lib/enrollUrl";
import { cn } from "../../lib/cn";

/**
 * The one page whose output is not a screen.
 *
 * Two choices, in the order an owner makes them: which sign, then what paper.
 * Both are shown rather than described — the four design cards are the real
 * sheet at thumbnail size, carrying the owner's own colours and their own
 * live code, so nothing here is a mock of what will print.
 *
 * The sheet itself and everything the printer does with it live in
 * `components/dashboard/Standee`; this page is the chooser around them.
 */
export function StandeePage() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  const [design, setDesign] = useState<StandeeDesign>("poster");
  const [format, setFormat] = useState<PrintFormat>("a4");

  const { data: templates } = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates?.[0];

  const { data: design_ } = useQuery({
    queryKey: ["design", template?.id],
    queryFn: () => getTemplateDesign(business!.id!, template!.id!),
    enabled: !!business?.id && !!template?.id,
  });

  // The print stylesheet hides every child of <body> that is not the sheet,
  // which is only safe while a sheet exists — so the flag that turns it on
  // lives and dies with this page. See `index.css`.
  const ready = !!template;
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.add("standee-print-mode");
    return () => root.classList.remove("standee-print-mode");
  }, [ready]);

  if (!template) {
    return <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>;
  }

  const images = (design_?.images ?? {}) as Record<string, unknown>;
  const doc = (design_?.design ?? {}) as DesignDoc;

  const art: StandeeArt = {
    businessName: business?.name ?? "",
    reward: template.reward_description,
    stampsRequired: template.stamps_required,
    background: template.background_color ?? "#FFFFFF",
    foreground: template.foreground_color ?? "#000000",
    label: template.label_color ?? template.foreground_color ?? "#000000",
    glyph: typeof doc.stamp?.glyph === "string" ? doc.stamp.glyph : undefined,
    logoUrl: typeof images.logo === "string" ? (images.logo as string) : undefined,
    enrollUrl: buildEnrollUrl(template.id!),
  };

  const spec = SHEET_SPECS[format];

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {/* The only thing about the paper that cannot be a class: the page box
          changes with the format, and `@page` takes no variables. */}
      <style>{`@page { size: ${spec.page}; margin: 0; }`}</style>

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="t-h3 text-ink">{t("standee.title")}</h1>
          <p className="mt-2 max-w-2xl text-ink-muted">{t("standee.subtitle")}</p>
        </div>
        <button
          type="button"
          onClick={() => window.print()}
          className={ctaClasses("primary", "sm")}
        >
          <Printer size={16} aria-hidden />
          {t("standee.print")}
        </button>
      </div>

      {!canEnroll && (
        <Notice tone="warn">
          {t("standee.activateFirst")}{" "}
          <Link
            to="/dashboard/billing"
            className={cn("font-semibold underline hover:no-underline", focusRing)}
          >
            {t("dashboard.qr.activateCta")}
          </Link>
        </Notice>
      )}

      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4 sm:gap-5">
          <Panel className="p-5 sm:p-6">
            <PanelHeader
              title={t("standee.designLabel")}
              hint={t("standee.designHint")}
            />
            <div
              role="group"
              aria-label={t("standee.designLabel")}
              className="mt-4 grid grid-cols-2 gap-3"
            >
              {STANDEE_DESIGNS.map((key) => {
                const active = key === design;
                return (
                  <button
                    key={key}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setDesign(key)}
                    className={cn(
                      "group flex flex-col gap-2 rounded-xl border p-2 text-start transition-colors",
                      active
                        ? "border-primary bg-primary-text/10"
                        : "border-border hover:border-border-strong",
                      focusRing,
                    )}
                  >
                    {/* The chooser shows the thing itself, at 1/12 scale —
                        and hides it from the accessibility tree, or the
                        button announces the whole poster before its name. */}
                    <span aria-hidden="true" className="block w-full">
                      <StandeeSheet
                        design={key}
                        art={art}
                        format={format}
                        single
                        className="rounded-lg shadow-card ring-1 ring-black/10"
                      />
                    </span>
                    <span className="px-1 pb-1">
                      <span
                        className={cn(
                          "block text-sm font-semibold",
                          active ? "text-primary-text" : "text-ink",
                        )}
                      >
                        {t(`standee.designs.${key}.name`)}
                      </span>
                      <span className="mt-0.5 block text-xs leading-snug text-ink-muted">
                        {t(`standee.designs.${key}.hint`)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <PanelHeader title={t("standee.paperLabel")} />
            <SegmentedControl
              className="mt-4 flex w-full"
              label={t("standee.paperLabel")}
              value={format}
              onChange={setFormat}
              options={PRINT_FORMATS.map((key) => ({
                value: key,
                label: t(`standee.formats.${key}`),
              }))}
            />
            <p className="mt-3 text-sm text-ink-muted">
              {t(`standee.formatHints.${format}`)}
            </p>
            <p className="mt-1 text-sm text-ink-subtle">
              {t("standee.downloadHint")}
            </p>
          </Panel>
        </div>

        <div className="flex flex-col gap-3 lg:sticky lg:top-8">
          <GroupLabel>{t("standee.previewTitle")}</GroupLabel>
          {/* Paper does not have a dark mode. On a dark page the sheet is not
              repainted, it is staged: an object set down under a lamp. */}
          <LitStage className="mx-auto w-full p-3 sm:p-4">
            <StandeeSheet
              design={design}
              art={art}
              format={format}
              className="mx-auto max-w-[27rem] rounded-lg shadow-panel-lift ring-1 ring-black/10"
            />
          </LitStage>
          <p className="text-sm text-ink-subtle">{t("standee.previewNote")}</p>
        </div>
      </div>

      {/* What the printer gets: the sheet at its real size in millimetres,
          hoisted to the end of <body> so the app around it can be switched
          off wholesale rather than hidden class by class. See `index.css`. */}
      {createPortal(
        <div className="standee-print" aria-hidden="true">
          <div
            className="standee-page"
            style={{ width: `${spec.width}mm`, height: `${spec.height}mm` }}
          >
            <StandeeSheet design={design} art={art} format={format} />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}
