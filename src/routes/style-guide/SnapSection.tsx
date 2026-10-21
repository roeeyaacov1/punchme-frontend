import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CircleAlert, Clock } from "lucide-react";
import { Button } from "../../components/kit/Button";
import { Figure } from "../../components/kit/Figure";
import { LitPanel, type Light } from "../../components/kit/LitPanel";
import { SnapFlash } from "../../components/kit/Snap";
import { StampRow } from "../../components/kit/StampRow";
import { HERO_TEMPLATES } from "../../components/marketing/heroTemplates";
import { STAMP_GLYPHS } from "../../lib/stampGlyphs";
import { GuideSection } from "./GuideSection";

type Answer = "punched" | "full" | "refusal" | "failed";

/** The café preset: 8 stamps, its own glyph and its own reward. */
const CAFE = HERO_TEMPLATES.find((template) => template.key === "cafe") ?? HERO_TEMPLATES[0];
const GLYPH = STAMP_GLYPHS[CAFE.glyph];

const TRIGGERS: { answer: Answer; copy: string }[] = [
  { answer: "punched", copy: "dashboard.scan.result.stamped" },
  { answer: "full", copy: "dashboard.scan.result.rewardReady" },
  { answer: "refusal", copy: "dashboard.scan.result.tooSoon" },
  { answer: "failed", copy: "dashboard.scan.result.failed" },
];

/**
 * Scan's answer at 375px, as the brief draws it: a 343px viewfinder of dark
 * glass, the answer an inset panel 12px inside it so the camera keeps
 * showing round it, and a photo snap of the panels' own light. Everything in
 * it is the Scan screen's real copy. Each press is a new answer.
 */
export function SnapSection() {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState<{ id: number; kind: Answer }>({ id: 0, kind: "punched" });
  const [shown, setShown] = useState(false);
  const fire = (kind: Answer) => {
    setAnswer((previous) => ({ id: previous.id + 1, kind }));
    setShown(true);
  };
  const filled = answer.kind === "full" ? CAFE.stampsRequired : CAFE.currentStamps;
  const word = TRIGGERS.find((trigger) => trigger.answer === answer.kind)?.copy ?? TRIGGERS[0].copy;

  return (
    <GuideSection id="snap" title={t("styleGuide.snap.title")} lead={t("styleGuide.snap.lead")}>
      <div className="flex flex-col items-center gap-6">
        <div className="relative aspect-square w-full max-w-[343px] overflow-hidden rounded-glass bg-glass">
          <Reticle />
          {shown && (
            <LitPanel
              key={answer.id}
              light={answer.kind as Light}
              snap
              className="absolute inset-3 flex flex-col items-center justify-center gap-3 px-5 py-6 text-center"
            >
              <Body kind={answer.kind} word={t(word)} filled={filled} />
            </LitPanel>
          )}
          <SnapFlash snap={shown ? answer.id : null} />
        </div>
        <p className="sr-only" aria-live="polite">
          {shown ? t(word) : ""}
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          {TRIGGERS.map((trigger) => (
            <Button key={trigger.answer} variant="secondary" onClick={() => fire(trigger.answer)}>
              {t(trigger.copy)}
            </Button>
          ))}
        </div>
      </div>
    </GuideSection>
  );
}

function Body({ kind, word, filled }: { kind: Answer; word: string; filled: number }) {
  const { t } = useTranslation();
  if (kind === "refusal") {
    return (
      <>
        <Clock aria-hidden className="size-8 text-warn" />
        <p className="type-answer text-warn">{word}</p>
        <p className="type-body max-w-[16rem] text-ink-muted">{t("dashboard.scan.result.tooSoonHint")}</p>
      </>
    );
  }
  if (kind === "failed") {
    return (
      <>
        <CircleAlert aria-hidden className="size-8 text-ink" />
        <p className="type-answer text-ink">{word}</p>
        <p className="type-body max-w-[16rem] font-semibold text-answer-failed-ink">{t("dashboard.scan.result.offline")}</p>
      </>
    );
  }
  const full = kind === "full";
  return (
    <>
      <p className="type-answer text-ink">{word}</p>
      <Figure size="count" value={`${filled}/${CAFE.stampsRequired}`} />
      <StampRow total={CAFE.stampsRequired} filled={filled} land="snap" glyph={GLYPH} className="max-w-[16rem]" />
      {full ? (
        <>
          <p className="text-lg font-semibold text-ink">{t(`landing.templates.items.${CAFE.key}.reward`)}</p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="ink">{t("dashboard.scan.result.redeem")}</Button>
            <Button variant="quiet">{t("dashboard.scan.result.notNow")}</Button>
          </div>
        </>
      ) : (
        <p className="type-body font-semibold text-answer-punched-ink">
          {t("dashboard.scan.result.toGo", { count: CAFE.stampsRequired - filled })}
        </p>
      )}
    </>
  );
}

/** Warm-white corners on the glass: where to hold the card. */
function Reticle() {
  const corner = "absolute size-10 border-light";
  return (
    <span aria-hidden className="absolute inset-[18%]">
      <span className={`${corner} start-0 top-0 rounded-ss-xl border-s-[3px] border-t-[3px]`} />
      <span className={`${corner} end-0 top-0 rounded-se-xl border-e-[3px] border-t-[3px]`} />
      <span className={`${corner} bottom-0 start-0 rounded-es-xl border-b-[3px] border-s-[3px]`} />
      <span className={`${corner} bottom-0 end-0 rounded-ee-xl border-b-[3px] border-e-[3px]`} />
    </span>
  );
}
