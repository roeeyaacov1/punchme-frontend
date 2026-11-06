import { Trans, useTranslation } from "react-i18next";
import type { ProofStat } from "../../../src/components/marketing/SourceLabel";
import { IN_OUT, progress, sec, useBeat } from "../motion";
import { Lines, Ltr, SafeArea, Say, useHebrew } from "../pieces";

/**
 * The one sourced figure the video prints (Roee's choice at the first
 * checkpoint), by its `id` in `landing.proof.stats` and in
 * `src/components/marketing/sources.ts`, where its link is.
 */
const FIGURE_ID = "square";

/** When the claim lights, and the rule under it draws across. */
const CLAIM = sec(0.35);
const RULE = sec(0.7);

/**
 * 5. Why regulars. One sourced figure, as the landing page prints it, in its
 * own words. The sweep brings the figure and its source in together, so the
 * source is on screen the whole time the figure is; the claim lights line by
 * line, and a hairline draws between it and the source. Then it all holds
 * still: printed, never counted up. It is about regulars in general, so
 * nothing on this screen names PunchMe.
 */
export function RegularsScene() {
  const { t } = useTranslation();
  const { t: f } = useBeat();
  const hebrew = useHebrew();
  const stats = t("landing.proof.stats", { returnObjects: true }) as ProofStat[];
  const index = stats.findIndex((stat) => stat.id === FIGURE_ID);
  const stat = stats[index];

  return (
    <SafeArea className="justify-center" style={{ paddingBottom: 380 }}>
      <figure className="flex w-full flex-col items-center text-center">
        <span
          dir="auto"
          className="type-figure text-ink"
          style={{ fontSize: 280, lineHeight: 1, letterSpacing: hebrew ? 0 : "-0.02em" }}
        >
          <Trans i18nKey={`landing.proof.stats.${index}.value`} components={{ ltr: <Ltr /> }} />
        </span>
        <figcaption className="mt-[56px] flex flex-col items-center">
          <Say text={stat.claim} on={CLAIM} size={62} style={{ lineHeight: hebrew ? 1.3 : 1.2 }} />
          <span
            aria-hidden
            className="mt-[56px] h-[3px] w-[160px] rounded-full bg-border-strong"
            style={{ transform: `scaleX(${progress(f, RULE, 500, IN_OUT)})` }}
          />
          <span
            className="mt-[40px] text-balance font-body font-semibold text-ink-muted"
            style={{ fontSize: 42, lineHeight: 1.35 }}
          >
            <Lines text={stat.source} atComma />
          </span>
        </figcaption>
      </figure>
    </SafeArea>
  );
}
