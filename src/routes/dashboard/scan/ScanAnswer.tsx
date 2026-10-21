import { useEffect, useRef, useState, type FocusEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Check, CircleAlert, Clock, Gift, QrCode, TriangleAlert } from "lucide-react";
import { Button } from "../../../components/kit/Button";
import { Figure } from "../../../components/kit/Figure";
import { LitPanel, type Light } from "../../../components/kit/LitPanel";
import { StampRow } from "../../../components/kit/StampRow";
import { cn } from "../../../lib/cn";
import { CAUSE_KEYS, HOLD_DEFAULT_MS, HOLD_MS, type Answer, type AnswerState } from "./answer";

/**
 * What just happened, in the frame the counter is already looking at.
 *
 * Read from across the counter, so in the order it can be read from far
 * away: the light, which is the whole panel; a 48px glyph; the word; the
 * count at 64px; the card's stamps; and one line in the light's own deep
 * tint. Punched and already punched differ in every one of those: mint
 * against warm white, a check against an amber clock, a count or none, and
 * the sound `feedback.ts` makes.
 *
 * Over a running camera it is an inset panel 12px inside the frame, so the
 * next card shows round it as it comes in. When the camera isn't running it
 * lights in the folded glass band instead, right above the typed field,
 * where an open keyboard doesn't reach. Each answer clears itself, and the
 * clock stops while a pointer or focus is inside, so a "Close" a keyboard
 * reached never vanishes from under it.
 */
export function ScanAnswer({
  answer,
  inset,
  rewardDescription,
  redeeming,
  onRedeem,
  onDismiss,
}: {
  answer: Answer;
  /** Over the running camera; otherwise in the folded band. */
  inset: boolean;
  rewardDescription?: string;
  redeeming: boolean;
  onRedeem: (code: string) => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const { state } = answer;
  const [pointerInside, setPointerInside] = useState(false);
  const [focusInside, setFocusInside] = useState(false);
  const held = pointerInside || focusInside;
  // What is left of this answer's hold. A new answer is a new component
  // (the page keys it on the answer's id), so this starts full each time.
  const remaining = useRef(HOLD_MS[state.kind] ?? HOLD_DEFAULT_MS);

  useEffect(() => {
    if (state.kind === "working" || held) return;
    const started = performance.now();
    const timer = window.setTimeout(onDismiss, remaining.current);
    return () => {
      window.clearTimeout(timer);
      remaining.current = Math.max(0, remaining.current - (performance.now() - started));
    };
  }, [state.kind, held, onDismiss]);

  if (state.kind === "working") {
    // Read and on its way: no light and no flash, which belong to the answer.
    return (
      <div className={cn("pointer-events-none flex items-center justify-center", inset ? "absolute inset-0 z-10" : "py-6")}>
        <p className="rounded-full bg-glass/80 px-5 py-2 font-heading text-lg font-medium text-light">
          {t("dashboard.scan.working")}
        </p>
      </div>
    );
  }

  const onBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusInside(false);
  };

  return (
    <LitPanel
      light={lightOf(state)}
      snap
      onPointerEnter={() => setPointerInside(true)}
      onPointerLeave={() => setPointerInside(false)}
      onFocus={() => setFocusInside(true)}
      onBlur={onBlur}
      className="relative z-10 m-3 flex flex-col items-center justify-center gap-2.5 px-4 py-4 text-center sm:px-5"
    >
      <Body state={state} rewardDescription={rewardDescription} redeeming={redeeming} onRedeem={onRedeem} onDismiss={onDismiss} />
    </LitPanel>
  );
}

function lightOf(state: AnswerState): Light {
  switch (state.kind) {
    case "stamped":
    case "redeemed":
      return "punched";
    case "rewardReady":
    case "alreadyFull":
      return "full";
    case "voided":
    case "failed":
      return "failed";
    default:
      return "refusal";
  }
}

/** The glyph beside the word, so the tallest answer, a full card with its
 * reward and two buttons, still fits a 320px screen's frame. */
function Head({ glyph, word, warn }: { glyph: ReactNode; word: string; warn?: boolean }) {
  return (
    <div className={cn("flex items-center justify-center gap-3 [&_svg]:size-12 [&_svg]:shrink-0", warn ? "text-warn" : "text-ink")}>
      {glyph}
      <p className="type-answer">{word}</p>
    </div>
  );
}

const STROKE = 2.5;

function Body({
  state,
  rewardDescription,
  redeeming,
  onRedeem,
  onDismiss,
}: {
  state: Exclude<AnswerState, { kind: "working" }>;
  rewardDescription?: string;
  redeeming: boolean;
  onRedeem: (code: string) => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const close = (
    <Button variant="quiet" onClick={onDismiss}>
      {t("dashboard.scan.result.dismiss")}
    </Button>
  );

  switch (state.kind) {
    case "stamped":
      return (
        <>
          <Head glyph={<Check aria-hidden strokeWidth={STROKE} />} word={t("dashboard.scan.result.stamped")} />
          <Figure size="count" value={`${state.count}/${state.total}`} />
          <StampRow total={state.total} filled={state.count} land="snap" className="max-w-[18rem]" />
          <p className="type-body font-semibold text-answer-punched-ink">
            {t("dashboard.scan.result.toGo", { count: Math.max(0, state.total - state.count) })}
          </p>
        </>
      );

    case "rewardReady":
    case "alreadyFull":
      return (
        <>
          <Head glyph={<Gift aria-hidden strokeWidth={STROKE} />} word={t(`dashboard.scan.result.${state.kind}`)} />
          {/* A 409 whose lookup failed too knows the card is full and
              nothing else: better no figure than "0/0". */}
          {state.total > 0 && (
            <>
              <Figure size="count" value={`${state.count}/${state.total}`} />
              <StampRow
                total={state.total}
                filled={state.count}
                land={state.kind === "rewardReady" ? "snap" : undefined}
                className="max-w-[18rem]"
              />
            </>
          )}
          {rewardDescription && (
            // Up to 200 characters by the wallet's rules: two lines here,
            // the whole of it in the spoken line.
            <p dir="auto" className="line-clamp-2 max-w-full text-lg font-semibold leading-snug text-ink [overflow-wrap:anywhere]">
              {rewardDescription}
            </p>
          )}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button variant="ink" busy={redeeming} onClick={() => onRedeem(state.code)}>
              {t("dashboard.scan.result.redeem")}
            </Button>
            <Button variant="quiet" onClick={onDismiss}>
              {t("dashboard.scan.result.notNow")}
            </Button>
          </div>
        </>
      );

    case "redeemed":
      return (
        <>
          <Head glyph={<Check aria-hidden strokeWidth={STROKE} />} word={t("dashboard.scan.result.redeemed")} />
          <p className="type-body max-w-[18rem] font-semibold text-answer-punched-ink">
            {t("dashboard.scan.result.redeemedHint")}
          </p>
        </>
      );

    case "tooSoon":
    case "unknownCard":
    case "enrollLink":
    case "foreign": {
      const glyph =
        state.kind === "tooSoon" ? <Clock aria-hidden strokeWidth={STROKE} /> : state.kind === "enrollLink" ? <QrCode aria-hidden strokeWidth={STROKE} /> : <TriangleAlert aria-hidden strokeWidth={STROKE} />;
      return (
        <>
          <Head glyph={glyph} word={t(`dashboard.scan.result.${state.kind}`)} warn />
          <p className="type-body max-w-[18rem] text-ink-muted">{t(`dashboard.scan.result.${state.kind}Hint`)}</p>
          {close}
        </>
      );
    }

    case "voided":
      return (
        <>
          <Head glyph={<CircleAlert aria-hidden strokeWidth={STROKE} />} word={t("dashboard.scan.result.voided")} />
          <p className="type-body max-w-[18rem] font-semibold text-answer-failed-ink">{t("dashboard.scan.result.voidedHint")}</p>
          {close}
        </>
      );

    case "failed":
      return (
        <>
          <Head
            glyph={<CircleAlert aria-hidden strokeWidth={STROKE} />}
            word={t(state.during === "redeem" ? "dashboard.scan.result.redeemFailed" : "dashboard.scan.result.failed")}
          />
          <p className="type-body max-w-[18rem] font-semibold text-answer-failed-ink">{t(CAUSE_KEYS[state.cause])}</p>
          {close}
        </>
      );
  }
}
