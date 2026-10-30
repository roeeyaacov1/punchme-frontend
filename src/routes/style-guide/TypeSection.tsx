import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { GuideSection, TokenName } from "./GuideSection";

/**
 * Each class set in real copy from the product, in the language on screen.
 * Every key here already exists for a page; none is written for the guide.
 */
const STYLES: { name: string; className: string; copy: string; figure?: boolean }[] = [
  { name: "type-display", className: "type-display", copy: "landing.hero.headline" },
  { name: "type-headline", className: "type-headline", copy: "landing.pricing.title" },
  { name: "type-lead", className: "type-lead", copy: "landing.after.lead" },
  { name: "type-title", className: "type-title", copy: "dashboard.customers.title" },
  { name: "type-card-title", className: "type-card-title", copy: "dashboard.nav.messages" },
  { name: "type-sign", className: "type-sign", copy: "dashboard.scan.title" },
  { name: "type-answer", className: "type-answer", copy: "dashboard.scan.result.stamped" },
  { name: "type-body", className: "type-body", copy: "dashboard.scan.lead" },
  { name: "type-prose", className: "type-prose", copy: "landing.pricing.body" },
  { name: "type-label", className: "type-label", copy: "messaging.editor.name" },
  { name: "type-tag", className: "type-tag", copy: "dashboard.plan.pro" },
  { name: "type-figure", className: "type-figure text-2xl", copy: "landing.pricing.pro.price", figure: true },
];

export function TypeSection({ version }: { version: string }) {
  const { t } = useTranslation();
  return (
    <GuideSection id="type" title={t("styleGuide.type.title")} lead={t("styleGuide.type.lead")}>
      <ul className="flex flex-col divide-y divide-border">
        {STYLES.map((style) => (
          <li key={style.name} className="flex flex-col gap-2 py-6 first:pt-0">
            <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <TokenName>{style.name}</TokenName>
              <Spec of={style.name} version={version} />
            </span>
            <Sample className={cn("text-ink", style.className)} dir={style.figure ? "auto" : undefined} id={style.name}>
              {t(style.copy)}
            </Sample>
          </li>
        ))}
        <li className="flex flex-col gap-2 py-6">
          <span className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <TokenName>type-count</TokenName>
            <Spec of="type-count" version={version} />
          </span>
          <Sample className="type-count text-ink" dir="ltr" id="type-count">
            {`${3}/${8}`}
          </Sample>
        </li>
      </ul>
    </GuideSection>
  );
}

function Sample({
  id,
  className,
  dir,
  children,
}: {
  id: string;
  className: string;
  dir?: "ltr" | "auto";
  children: string;
}) {
  return (
    <p data-specimen={id} dir={dir} className={cn("self-start", className)}>
      {children}
    </p>
  );
}

/**
 * The face, weight, size, leading and tracking the browser actually set the
 * sample in, read back off it — so a Hebrew page shows its own leading.
 */
function Spec({ of, version }: { of: string; version: string }) {
  const [spec, setSpec] = useState<string | null>(null);
  const holder = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      const item = holder.current?.closest("li");
      const sample = item?.querySelector<HTMLElement>(`[data-specimen="${of}"]`);
      if (!sample) return;
      const style = getComputedStyle(sample);
      const size = parseFloat(style.fontSize);
      const family = style.fontFamily.split(",")[0].replace(/["']/g, "").trim();
      const leading = style.lineHeight === "normal" ? "normal" : (parseFloat(style.lineHeight) / size).toFixed(2);
      const tracking = parseFloat(style.letterSpacing);
      const em = Number.isNaN(tracking) || tracking === 0 ? "0" : `${(tracking / size).toFixed(3)}em`;
      setSpec(`${family} ${style.fontWeight} · ${Math.round(size * 10) / 10}px / ${leading} · ${em}`);
    });
    return () => cancelAnimationFrame(frame);
  }, [of, version]);
  return (
    <span ref={holder} dir="ltr" className="font-mono text-[0.8125rem] text-ink-subtle">
      {spec}
    </span>
  );
}
