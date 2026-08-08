import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { Section } from "./primitives";

export function Industries() {
  const { t } = useTranslation();
  const niches = t("landing.niches.items", { returnObjects: true }) as string[];

  return (
    <Section id="industries">
      <h2 className="t-h2 mx-auto mb-10 max-w-2xl text-balance text-center text-ink">
        {t("landing.niches.title")}
      </h2>

      <ul className="flex flex-wrap justify-center gap-3">
        {niches.map((niche, i) => {
          // The last entry ("And you") is the one aimed at the reader, so it
          // gets the gold treatment.
          const isLast = i === niches.length - 1;
          return (
            <li
              key={niche}
              className={cn(
                "rounded-full border px-5 py-2.5 text-sm font-semibold",
                isLast
                  ? "border-primary/30 bg-primary/10 text-primary-text"
                  : "border-border bg-surface text-ink",
              )}
            >
              {niche}
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
