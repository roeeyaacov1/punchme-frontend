import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { GuideSection, Specimen, TokenName } from "./GuideSection";

const RADII = [
  { name: "rounded-field", className: "rounded-field" },
  { name: "rounded-panel", className: "rounded-panel" },
  { name: "rounded-glass", className: "rounded-glass" },
  { name: "rounded-card", className: "rounded-card" },
  { name: "rounded-hero", className: "rounded-hero" },
  { name: "rounded-full", className: "rounded-full" },
];

export function ShapeSection({ version }: { version: string }) {
  const { t } = useTranslation();
  return (
    <GuideSection id="shape" title={t("styleGuide.shape.title")} lead={t("styleGuide.shape.lead")}>
      <Specimen title={t("styleGuide.shape.radii")}>
        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {RADII.map((radius) => (
            <Radius key={radius.name} {...radius} version={version} />
          ))}
        </ul>
      </Specimen>

      <Specimen title={t("styleGuide.shape.depth")} lead={t("styleGuide.shape.depthLead")}>
        <div className="grid gap-6 sm:grid-cols-2">
          <figure className="flex flex-col gap-3">
            <div className="h-32 rounded-panel border border-border bg-surface shadow-panel" />
            <figcaption className="flex flex-col gap-0.5">
              <span className="type-label text-ink">{t("styleGuide.shape.panel")}</span>
              <TokenName>shadow-panel</TokenName>
            </figcaption>
          </figure>
          <figure className="flex flex-col gap-3">
            <div className="h-32 rounded-panel border border-border bg-surface shadow-panel-lift" />
            <figcaption className="flex flex-col gap-0.5">
              <span className="type-label text-ink">{t("styleGuide.shape.lift")}</span>
              <TokenName>shadow-panel-lift</TokenName>
            </figcaption>
          </figure>
        </div>
      </Specimen>

      <Specimen title={t("styleGuide.shape.light")}>
        <div className="grid gap-6 sm:grid-cols-2">
          <figure className="flex flex-col gap-3">
            <div className="theme-lit lit-band flex h-32 items-end rounded-panel p-5">
              <span className="type-card-title text-ink">{t("dashboard.nav.overview")}</span>
            </div>
            <figcaption className="flex flex-col gap-0.5">
              <span className="type-label text-ink">{t("styleGuide.shape.band")}</span>
              <TokenName>lit-band</TokenName>
            </figcaption>
          </figure>
          <figure className="flex flex-col gap-3">
            <div className="theme-lit lit-field flex h-32 items-end rounded-card p-5">
              <span className="type-card-title text-ink">{t("landing.hero.cta")}</span>
            </div>
            <figcaption className="flex flex-col gap-0.5">
              <span className="type-label text-ink">{t("styleGuide.shape.field")}</span>
              <TokenName>lit-field</TokenName>
            </figcaption>
          </figure>
        </div>
      </Specimen>
    </GuideSection>
  );
}

function Radius({ name, className, version }: { name: string; className: string; version: string }) {
  const box = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState<string | null>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (!box.current) return;
      const value = parseFloat(getComputedStyle(box.current).borderTopLeftRadius);
      setRadius(value > 999 ? "9999px" : `${Math.round(value)}px`);
    });
    return () => cancelAnimationFrame(frame);
  }, [version]);
  return (
    <li className="flex flex-col gap-2">
      <div ref={box} className={cn("aspect-square border-2 border-field bg-surface", className)} />
      <TokenName>{name}</TokenName>
      <span dir="ltr" className="type-figure self-start text-sm text-ink-muted">
        {radius}
      </span>
    </li>
  );
}
