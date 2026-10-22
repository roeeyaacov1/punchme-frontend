import { useEffect, useId, useState } from "react";
import { createPortal } from "react-dom";
import { Trans, useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Check, Printer } from "lucide-react";
import {
  Button,
  LinkButton,
  LitPanel,
  Loading,
  Notice,
  RadioGroup,
  SegmentedControl,
  Skeleton,
  linkText,
} from "../../components/kit";
import {
  FIT_FLOOR,
  PRINT_FORMATS,
  SHEET_SPECS,
  STANDEE_DESIGNS,
  StandeeSheet,
  type PrintFormat,
  type SignLanguage,
  type StandeeArt,
  type StandeeDesign,
} from "../../components/dashboard/Standee";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
import { PUNCHME_MONTHLY_PRICE } from "../../components/marketing/calculator";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers, isOwner } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { getTemplateDesign, type DesignDoc } from "../../api/designs";
import { buildEnrollUrl } from "../../lib/enrollUrl";
import { cn } from "../../lib/cn";
import { useLightboxPage } from "../../theme/lightboxPage";

/**
 * The one page whose output is not a screen.
 *
 * Three choices, in the order an owner makes them: which sign, in which
 * language, on what paper. The four designs are the real sheet at thumbnail
 * size, in the owner's own colours with their own live code, so nothing
 * here is a mock of what will print. The sheet stands on a lit panel, which
 * keeps its light at night like the code on it, with Print right under the
 * sheet it prints.
 *
 * The sheet itself and everything the printer does with it live in
 * `components/dashboard/Standee`; this page is the chooser around them.
 */
export function StandeePage() {
  useLightboxPage();
  const { t } = useTranslation();
  const { business, role } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  const owns = isOwner(role);
  const [design, setDesign] = useState<StandeeDesign>("poster");
  const [format, setFormat] = useState<PrintFormat>("a4");
  const [chosenLanguage, setChosenLanguage] = useState<SignLanguage | null>(null);
  // The on-screen sheet's own fit, which the print copy takes.
  const [fit, setFit] = useState(1);

  const templates = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates.data?.[0];

  // The same query key as the card's language everywhere else
  // (`useCardLanguage`), so this is usually a cache read.
  const cardDesign = useQuery({
    queryKey: ["design", template?.id],
    queryFn: () => getTemplateDesign(business!.id!, template!.id!),
    enabled: !!business?.id && !!template?.id,
  });

  // The print stylesheet hides every child of <body> that is not the sheet,
  // which is only safe while a sheet exists — so the flag that turns it on
  // lives and dies with this page, Free included: ctrl+P prints the sheet
  // with its honest empty slot, never the dashboard. See `index.css`.
  const ready = !!template && !!cardDesign.data;
  useEffect(() => {
    if (!ready) return;
    const root = document.documentElement;
    root.classList.add("standee-print-mode");
    return () => root.classList.remove("standee-print-mode");
  }, [ready]);

  const header = (
    <header className="flex flex-col gap-1">
      <h1 className="type-title text-ink">{t("standee.title")}</h1>
      <p className="type-body max-w-prose text-ink-muted">{t("standee.subtitle")}</p>
    </header>
  );

  const failed = templates.isError ? templates : cardDesign.isError ? cardDesign : null;
  const paused =
    (!templates.data && templates.fetchStatus === "paused") ||
    (!!template && !cardDesign.data && cardDesign.fetchStatus === "paused");
  if (failed || paused) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        {header}
        <ReadProblem
          data-tour="standee-sheet"
          title={t("standee.loadFailed")}
          error={failed?.error}
          paused={!failed}
          onRetry={() => void (templates.isError ? templates.refetch() : cardDesign.refetch())}
        />
      </div>
    );
  }

  if (!template || !cardDesign.data) {
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        {header}
        <Loading className="grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-8">
          <div className="grid grid-cols-2 gap-3">
            {STANDEE_DESIGNS.map((key) => (
              <Skeleton key={key} className="aspect-[3/5] rounded-panel" />
            ))}
          </div>
          <div data-tour="standee-sheet">
            <Skeleton className="aspect-[210/297] w-full rounded-panel" />
          </div>
        </Loading>
      </div>
    );
  }

  const images = (cardDesign.data.images ?? {}) as Record<string, unknown>;
  const doc = (cardDesign.data.design ?? {}) as DesignDoc;
  const language: SignLanguage = chosenLanguage ?? (doc.default_language === "EN" ? "en" : "he");

  const art: StandeeArt = {
    businessName: business?.name ?? "",
    reward: template.reward_description,
    stampsRequired: template.stamps_required,
    background: template.background_color ?? "#FFFFFF",
    foreground: template.foreground_color ?? "#000000",
    label: template.label_color ?? template.foreground_color ?? "#000000",
    glyph: typeof doc.stamp?.glyph === "string" ? doc.stamp.glyph : undefined,
    logoUrl: typeof images.logo === "string" ? (images.logo as string) : undefined,
    // Not just undrawn — not built. Free plan enrols nobody (the API 403s
    // `upgrade_required`), so there is no live code to put on screen for
    // someone to photograph off it, let alone onto paper.
    enrollUrl: canEnroll ? buildEnrollUrl(template.id!) : "",
    active: canEnroll,
  };

  const spec = SHEET_SPECS[format];

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
      {/* The only thing about the paper that cannot be a class: the page box
          changes with the format, and `@page` takes no variables. */}
      <style>{`@page { size: ${spec.page}; margin: 0; }`}</style>

      {header}

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] lg:gap-8">
        <div className="flex min-w-0 flex-col gap-6">
          <DesignChoice value={design} onChange={setDesign} art={art} format={format} language={language} />

          <SegmentedControl<SignLanguage>
            label={t("standee.languageLabel")}
            value={language}
            onChange={setChosenLanguage}
            // Each named in its own language, so whoever reads either finds theirs.
            options={[
              { value: "he", label: <span lang="he">{t("language.he")}</span> },
              { value: "en", label: <span lang="en">{t("language.en")}</span> },
            ]}
          />

          {/* A list rather than segments: "Table tent" doesn't fit a third of
              a phone, and each paper's hint belongs beside it. */}
          <RadioGroup<PrintFormat>
            legend={t("standee.paperLabel")}
            value={format}
            onChange={setFormat}
            options={PRINT_FORMATS.map((key) => ({
              value: key,
              label: t(`standee.formats.${key}`),
              description: t(`standee.formatHints.${key}`),
            }))}
          />
        </div>

        <section
          aria-labelledby="standee-sheet-title"
          className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-8 lg:max-w-[31rem]"
        >
          <h2 id="standee-sheet-title" className="type-label text-ink">
            {t("standee.previewTitle")}
          </h2>
          {/* Paper has no night, and the sheet's colours are the owner's,
              the ones the printer will lay down; the panel it lies on keeps
              its light at night, as the code on it does. */}
          <LitPanel light="lit" data-tour="standee-sheet" className="p-4 sm:p-6">
            <StandeeSheet
              design={design}
              art={art}
              format={format}
              language={language}
              onFit={setFit}
              measureAtPaper
              // Beside the choices the column holds still, so on a short
              // screen the sheet narrows until Print under it is in view.
              // Every paper is about 1.41 tall to 1 wide.
              className="mx-auto max-w-[27rem] rounded-md shadow-panel-lift ring-1 ring-rim/10 lg:max-w-[min(27rem,calc((100dvh_-_17rem)*0.707))]"
            />
          </LitPanel>

          {fit < FIT_FLOOR && (
            // The sheet still fits, at a size that's hard to read from the
            // door: said under the sheet, with where the reward is changed.
            // The A5 is the A4 drawn smaller, so only the tent has a bigger
            // paper to go to.
            <Notice tone="warn">
              <Trans
                i18nKey={format === "tent" ? "standee.tooLong.tent" : "standee.tooLong.sheet"}
                components={{ studio: <Link to="/dashboard/design" className={linkText} /> }}
              />
            </Notice>
          )}

          {canEnroll ? (
            <>
              <Button size="lg" icon={<Printer aria-hidden />} onClick={() => window.print()} className="w-full">
                {t("standee.print")}
              </Button>
              <div className="flex flex-col gap-1 text-sm leading-snug text-ink-muted">
                <p>{t("standee.previewNote")}</p>
                <p>{t("standee.downloadHint")}</p>
              </div>
            </>
          ) : owns ? (
            <LitPanel className="flex flex-col gap-3 p-4 sm:p-5">
              <p className="type-body text-ink">
                <Trans
                  i18nKey="standee.free.owner"
                  values={{ price: PUNCHME_MONTHLY_PRICE }}
                  components={{ ltr: <bdi dir="ltr" className="type-figure" /> }}
                />
              </p>
              <LinkButton to="/dashboard/billing" variant="primary" size="lg" className="w-full">
                {t("billing.activateCta")}
              </LinkButton>
            </LitPanel>
          ) : (
            // A hire is told who opens it, never sent to a Billing page that
            // would refuse them.
            <p className="type-body text-ink-muted">{t("standee.free.hire")}</p>
          )}
        </section>
      </div>

      {/* What the printer gets: the sheet at its real size in millimetres,
          hoisted to the end of <body> so the app around it can be switched
          off wholesale rather than hidden class by class. See `index.css`. */}
      {createPortal(
        <div className="standee-print" aria-hidden="true">
          <div className="standee-page" style={{ width: `${spec.width}mm`, height: `${spec.height}mm` }}>
            <StandeeSheet design={design} art={art} format={format} language={language} fit={fit} />
          </div>
        </div>,
        document.body,
      )}
    </div>
  );
}

/**
 * The four designs as one radio group: native radios, so the arrow keys
 * move the choice and a screen reader says "2 of 4", each drawn as the real
 * sheet at thumbnail size. The thumbnail is hidden from the accessibility
 * tree, or each option would read out a whole poster before its name.
 *
 * Chosen is drawn in ink, a 2px ring and a check, never in coral.
 */
function DesignChoice({
  value,
  onChange,
  art,
  format,
  language,
}: {
  value: StandeeDesign;
  onChange: (next: StandeeDesign) => void;
  art: StandeeArt;
  format: PrintFormat;
  language: SignLanguage;
}) {
  const { t } = useTranslation();
  const name = useId();
  const hintId = useId();
  return (
    <fieldset className="min-w-0" aria-describedby={hintId}>
      <legend className="type-label text-ink">{t("standee.designLabel")}</legend>
      <p id={hintId} className="mb-3 mt-0.5 text-sm leading-snug text-ink-muted">
        {t("standee.designHint")}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {STANDEE_DESIGNS.map((key) => {
          const chosen = key === value;
          return (
            <label
              key={key}
              className={cn(
                "relative flex cursor-pointer touch-manipulation select-none flex-col gap-2 rounded-panel border bg-surface p-2 transition-[border-color,box-shadow] duration-gentle ease-out [-webkit-tap-highlight-color:transparent] has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink",
                chosen ? "border-ink shadow-[0_0_0_1px_rgb(var(--c-ink))]" : "border-border-strong hover-fine:border-field",
              )}
            >
              <input
                type="radio"
                name={name}
                value={key}
                checked={chosen}
                onChange={() => onChange(key)}
                className="sr-only"
              />
              <span aria-hidden="true" className="block w-full">
                <StandeeSheet
                  design={key}
                  art={art}
                  format={format}
                  language={language}
                  single
                  className="rounded-md ring-1 ring-rim/10"
                />
              </span>
              <span className="flex flex-col gap-0.5 px-1 pb-1">
                <span className="type-body font-semibold text-ink">{t(`standee.designs.${key}.name`)}</span>
                <span className="text-sm leading-snug text-ink-muted">{t(`standee.designs.${key}.hint`)}</span>
              </span>
              {chosen && (
                <span
                  aria-hidden="true"
                  className="absolute end-3 top-3 flex size-7 items-center justify-center rounded-full bg-ink text-surface shadow-panel"
                >
                  <Check className="size-4" strokeWidth={2.5} />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
