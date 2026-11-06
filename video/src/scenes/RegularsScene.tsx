import { Trans, useTranslation } from "react-i18next";
import { useCurrentFrame } from "remotion";
import type { ProofStat } from "../../../src/components/marketing/SourceLabel";
import { light } from "../motion";
import { Lines, Ltr, SafeArea, useHebrew } from "../pieces";

/**
 * The one sourced figure the video prints (Roee's choice at the first
 * checkpoint), by its `id` in `landing.proof.stats` and in
 * `src/components/marketing/sources.ts`, where its link is.
 */
const FIGURE_ID = "square";

/**
 * 5. Why regulars. One sourced figure, as the landing page prints it, in its
 * own words and with its source under it the whole time it's on screen. It
 * comes on with the beat and then holds still: printed, never counted up.
 * It is about regulars in general, so nothing on this screen names PunchMe.
 */
export function RegularsScene() {
  const { t } = useTranslation();
  const frame = useCurrentFrame();
  const hebrew = useHebrew();
  const stats = t("landing.proof.stats", { returnObjects: true }) as ProofStat[];
  const index = stats.findIndex((stat) => stat.id === FIGURE_ID);
  const stat = stats[index];

  return (
    <SafeArea className="justify-center" style={{ paddingBottom: 380 }}>
      <figure className="flex w-full flex-col items-center text-center" style={light(frame, 0)}>
        <span
          dir="auto"
          className="type-figure text-ink"
          style={{ fontSize: 280, lineHeight: 1, letterSpacing: hebrew ? 0 : "-0.02em" }}
        >
          <Trans i18nKey={`landing.proof.stats.${index}.value`} components={{ ltr: <Ltr /> }} />
        </span>
        <figcaption className="mt-[56px] flex flex-col items-center">
          <span
            className="text-balance font-heading font-medium text-ink"
            style={{ fontSize: 62, lineHeight: hebrew ? 1.3 : 1.2 }}
          >
            {stat.claim}
          </span>
          <span className="mt-[56px] h-[3px] w-[160px] rounded-full bg-border-strong" aria-hidden />
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
