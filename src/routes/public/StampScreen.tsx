import { useCallback, useEffect, useRef, useState } from "react";
import type { TFunction } from "i18next";
import { Trans, useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Gift } from "lucide-react";
import { redeemCard, scanCode } from "../../api/loyalty";
import type { PublicCardPage, PublicCardStamp } from "../../api/referrals";
import { Button, Figure, LitPanel, SnapFlash, StampRow, linkText } from "../../components/kit";
import { cn } from "../../lib/cn";
import { classifyScanError } from "../../lib/scan";
import { ScanAnswer } from "../dashboard/scan/ScanAnswer";
import { CAUSE_KEYS, CHIMES, failureCause, type Answer, type AnswerState } from "../dashboard/scan/answer";
import { buzz, chime, primeAudio } from "../dashboard/scan/feedback";
import { PublicPage } from "./PublicPage";

/**
 * The team's stamp screen, on `/p/:token` when the server knows the visitor
 * as a member of the card's shop (any role): Scan's answer without the
 * camera. One thing to do, and the answer the loudest thing on the screen.
 *
 * The card as it stands (the count at 64px and its stamps), then "Add a
 * stamp"; on a full card the gold light, the reward and "Give the reward".
 * The answer is Scan's own `ScanAnswer`, its words, lights, hold and sounds
 * included: it takes the card's place under the snap's flash, holds for its
 * own time (paused while a pointer or focus is in it) and gives the card
 * back as it now stands.
 */
export function StampScreen({
  token,
  page,
  stamp,
  onChanged,
}: {
  token: string;
  page: PublicCardPage;
  stamp: PublicCardStamp;
  /** The card changed: read the page again. */
  onChanged: () => void;
}) {
  const { t } = useTranslation();
  const [answer, setAnswer] = useState<Answer | null>(null);
  const [busy, setBusy] = useState(false);
  const [redeeming, setRedeeming] = useState(false);
  const ids = useRef(0);
  const frame = useRef<HTMLDivElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);
  const refocus = useRef(false);

  /** A new answer, or none. Focus that was in the frame goes to the heading,
   * as on Scan: the button it was on is gone, and focus left in the answer
   * would hold it open. */
  const replace = useCallback((next: Answer | null) => {
    refocus.current = !!frame.current?.contains(document.activeElement);
    setAnswer(next);
  }, []);

  useEffect(() => {
    if (!refocus.current) return;
    refocus.current = false;
    heading.current?.focus({ preventScroll: true });
  }, [answer]);

  const show = useCallback(
    (state: AnswerState) => {
      replace({ id: (ids.current += 1), state });
      const sound = CHIMES[state.kind] ?? "reject";
      chime(sound);
      buzz(sound);
    },
    [replace],
  );
  const dismiss = useCallback(() => replace(null), [replace]);

  async function addStamp() {
    primeAudio();
    setBusy(true);
    try {
      const out = await scanCode(token);
      show({
        kind: out.status === "reward_ready" ? "rewardReady" : "stamped",
        code: token,
        count: out.stamp_count,
        total: out.stamps_required,
      });
    } catch (error) {
      show(refusal(error, stamp, token));
    } finally {
      setBusy(false);
      onChanged();
    }
  }

  async function redeem(code: string) {
    primeAudio();
    setRedeeming(true);
    try {
      await redeemCard(code);
      show({ kind: "redeemed", code });
    } catch (error) {
      show({ kind: "failed", during: "redeem", cause: failureCause(error) });
    } finally {
      setRedeeming(false);
      onChanged();
    }
  }

  const name = stamp.customer_display_name.trim();
  const full = stamp.status === "reward_ready";
  const count = `${stamp.stamp_count}/${stamp.stamps_required}`;

  return (
    <PublicPage
      variant="team"
      title={t("publicCard.stamp.pageTitle", { name: name || t("publicCard.stamp.noName") })}
      className="items-stretch pb-10 pt-2 sm:items-center sm:pt-6"
    >
      <div className="flex w-full flex-col gap-5 sm:max-w-[26rem]">
        <div className="flex flex-col gap-1">
          <p className="type-label text-ink-muted [overflow-wrap:anywhere]">
            <bdi>{page.business_name}</bdi> · <bdi>{page.template_name}</bdi>
          </p>
          <h1 ref={heading} tabIndex={-1} className="type-title text-balance outline-none">
            {stamp.is_preview ? (
              <Trans
                i18nKey="publicCard.stamp.demoTitle"
                values={{ business: page.business_name }}
                components={{ shop: <bdi className="[overflow-wrap:anywhere]" /> }}
              />
            ) : name ? (
              <bdi className="[overflow-wrap:anywhere]">{name}</bdi>
            ) : (
              t("publicCard.stamp.noName")
            )}
          </h1>
        </div>

        <div ref={frame}>
          <LitPanel light={full ? "full" : "lit"} className="relative overflow-hidden">
            {answer ? (
              <ScanAnswer
                key={answer.id}
                answer={answer}
                inset={false}
                rewardDescription={page.reward_description}
                redeeming={redeeming}
                onRedeem={(code) => void redeem(code)}
                onDismiss={dismiss}
              />
            ) : full ? (
              <div className="flex flex-col items-center gap-3 p-5 text-center">
                <Gift aria-hidden strokeWidth={2.5} className="size-12" />
                <p className="type-answer">{t("dashboard.scan.result.rewardReady")}</p>
                <Figure size="count" value={count} />
                <StampRow total={stamp.stamps_required} filled={stamp.stamp_count} className="w-full max-w-[18rem]" />
                <p dir="auto" className="line-clamp-2 font-body text-lg font-semibold">
                  {page.reward_description}
                </p>
                <Button variant="ink" size="lg" busy={redeeming} onClick={() => void redeem(token)} className="w-full !whitespace-normal text-center">
                  {t("dashboard.scan.result.redeem")}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-4 p-5 text-center">
                <Figure size="count" value={count} />
                <StampRow total={stamp.stamps_required} filled={stamp.stamp_count} className="w-full max-w-[18rem]" />
                <Button size="lg" busy={busy} onClick={() => void addStamp()} className="w-full !whitespace-normal text-center">
                  {t("publicCard.stamp.add")}
                </Button>
              </div>
            )}
            <SnapFlash snap={answer ? answer.id : null} />
          </LitPanel>
        </div>

        <p aria-live="polite" className="sr-only">
          {answer ? speak(answer.state, page.reward_description, t) : ""}
        </p>

        <Link to="/dashboard/scan" className={cn(linkText, "type-body inline-flex min-h-11 items-center self-center")}>
          {t("publicCard.stamp.toScanner")}
        </Link>
      </div>
    </PublicPage>
  );
}

/**
 * A refused stamp, read as Scan reads it. Where Scan looks a 409's card up
 * to tell full from cancelled, this page already knows the card: the
 * scanner's lookup takes a serial, and the code here is the public token.
 */
function refusal(error: unknown, stamp: PublicCardStamp, code: string): AnswerState {
  const failure = classifyScanError(error);
  if (failure === "unknownCard" || failure === "tooSoon") return { kind: failure, code };
  if (failure === "conflict") {
    return stamp.status === "void"
      ? { kind: "voided", code }
      : { kind: "alreadyFull", code, count: stamp.stamps_required, total: stamp.stamps_required };
  }
  return { kind: "failed", during: "stamp", cause: failureCause(error) };
}

/**
 * The answer in words, once, in Scan's own words: never "4/8", which a
 * screen reader can read as a date. Scan's page says it the same way; its
 * `speak` is private to ScanPage, which this phase leaves alone (shared in
 * Phase 10).
 */
function speak(state: AnswerState, reward: string | undefined, t: TFunction): string {
  const said = (word: string, reason: string) => t("dashboard.scan.announce.said", { word, reason });
  switch (state.kind) {
    case "working":
      return "";
    case "stamped":
      return t("dashboard.scan.announce.stamped", {
        filled: state.count,
        total: state.total,
        toGo: t("dashboard.scan.result.toGo", { count: Math.max(0, state.total - state.count) }),
      });
    case "rewardReady":
    case "alreadyFull":
      return reward
        ? t(`dashboard.scan.announce.${state.kind}`, { reward })
        : t(`dashboard.scan.result.${state.kind}`);
    case "failed":
      return said(
        t(state.during === "redeem" ? "dashboard.scan.result.redeemFailed" : "dashboard.scan.result.failed"),
        t(CAUSE_KEYS[state.cause]),
      );
    default:
      return said(t(`dashboard.scan.result.${state.kind}`), t(`dashboard.scan.result.${state.kind}Hint`));
  }
}
