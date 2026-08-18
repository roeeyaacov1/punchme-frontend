import { useTranslation } from "react-i18next";
import { cn } from "../../lib/cn";
import { Section } from "./primitives";
import { PunchMark } from "./PunchMark";

/**
 * The trades, set as one line rather than a scatter of tags.
 *
 * A punch between each name — the same mark the rest of the page uses for
 * one visit — so the list reads the way a hand-painted board over a counter
 * lists what a shop does.
 */
export function Industries() {
  const { t } = useTranslation();
  const niches = t("landing.niches.items", { returnObjects: true }) as string[];

  return (
    <Section id="industries">
      <h2 className="t-h2 mx-auto max-w-3xl text-balance text-center text-ink">
        {t("landing.niches.title")}
      </h2>

      <ul className="mx-auto mt-10 flex max-w-4xl flex-wrap items-center justify-center gap-x-4 gap-y-3">
        {niches.map((niche, i) => {
          // The last entry ("And you") is the one aimed at the reader, so it
          // gets the gold.
          const isLast = i === niches.length - 1;
          return (
            <li key={niche} className="flex items-center gap-4">
              {/* The separator belongs to the item that follows it, so a wrap
                  never strands a lone mark at the end of a line. */}
              {i > 0 && <PunchMark state="empty" size={12} />}
              <span
                className={cn(
                  "font-heading text-xl font-bold tracking-tight sm:text-2xl",
                  isLast ? "text-primary-text" : "text-ink",
                )}
              >
                {niche}
              </span>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}
