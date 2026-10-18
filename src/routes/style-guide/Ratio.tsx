import { useEffect, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Check, CircleAlert } from "lucide-react";
import { cn } from "../../lib/cn";
import { measure, type Measured } from "./measure";

export interface PairSpec {
  /** The token pair as written in code, such as `ink · surface`. */
  name: string;
  /** Classes for the sample: the ground and the colour on it, in full. */
  sample: string;
  kind?: Measured;
  min?: number;
  /** A fill that is allowed under 3:1 because its label carries it (coral). */
  fillOnly?: boolean;
}

/**
 * A token pair, drawn and then measured where it renders. The measurement
 * waits a frame after anything that changes colour (`version`), so it reads
 * the theme the page has just put on.
 */
export function Ratio({ spec, version }: { spec: PairSpec; version: string }) {
  const { t } = useTranslation();
  const sample = useRef<HTMLSpanElement>(null);
  const [ratio, setRatio] = useState<number | null>(null);
  const kind = spec.kind ?? "text";
  const min = spec.min ?? (kind === "text" ? 4.5 : 3);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (sample.current) setRatio(measure(sample.current, kind));
    });
    return () => cancelAnimationFrame(frame);
  }, [version, kind]);

  const passes = ratio !== null && ratio >= min;
  let verdict: ReactNode;
  if (ratio === null) verdict = t("styleGuide.measure.pending");
  else if (spec.fillOnly) verdict = t("styleGuide.measure.fillOnly");
  else verdict = t(passes ? "styleGuide.measure.pass" : "styleGuide.measure.fail", { min });

  return (
    <li className="flex items-center gap-4 py-3">
      {kind === "text" ? (
        <span
          ref={sample}
          aria-hidden
          className={cn(
            "flex h-12 w-16 shrink-0 items-center justify-center rounded-field font-heading text-lg font-medium",
            spec.sample,
          )}
        >
          {t("styleGuide.measure.sample")}
        </span>
      ) : (
        <span aria-hidden className="flex h-12 w-16 shrink-0 items-center justify-center">
          <span ref={sample} className={cn("block size-9 rounded-[0.625rem] border-2", spec.sample)} />
        </span>
      )}
      <span className="flex min-w-0 flex-col gap-0.5">
        <code dir="ltr" className="self-start font-mono text-[0.8125rem] text-ink">
          {spec.name}
        </code>
        <span className="flex flex-wrap items-baseline gap-x-2 text-sm text-ink-muted">
          {ratio !== null && (
            <span dir="ltr" className="type-figure text-ink">
              {ratio.toFixed(2)}:1
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            {ratio !== null && !spec.fillOnly &&
              (passes ? (
                <Check aria-hidden className="size-4 text-ok" />
              ) : (
                <CircleAlert aria-hidden className="size-4 text-danger" />
              ))}
            {verdict}
          </span>
        </span>
      </span>
    </li>
  );
}

export function RatioList({ specs, version }: { specs: PairSpec[]; version: string }) {
  return (
    <ul className="divide-y divide-border">
      {specs.map((spec) => (
        <Ratio key={spec.name} spec={spec} version={version} />
      ))}
    </ul>
  );
}
