import { useTranslation } from "react-i18next";
import {
  Check,
  Clock,
  Gift,
  QrCode,
  ScanLine,
  TriangleAlert,
} from "lucide-react";
import { ctaClasses, focusRing } from "../../../components/marketing/primitives";
import { PunchMark } from "../../../components/marketing/PunchMark";
import { cn } from "../../../lib/cn";

/**
 * What just happened, said in the frame the owner is already looking at.
 *
 * It covers the camera rather than sitting below it, because the eye is on
 * the viewfinder and a result printed underneath would be read a beat late —
 * and a beat, times a queue, is the cost this feature exists to avoid. The
 * stream keeps running behind it, so the next card is read the instant it
 * appears; nothing here has to be dismissed first.
 */

export type ScanResultState =
  /** The common case, and the only one that is over in two seconds. */
  | { kind: "stamped"; code: string; count: number; total: number }
  /** This scan filled the card. */
  | { kind: "rewardReady"; code: string; count: number; total: number }
  /** It was already full when it was scanned — a 409, resolved by a lookup. */
  | { kind: "alreadyFull"; code: string; count: number; total: number }
  | { kind: "redeemed"; code: string }
  | { kind: "voided"; code: string }
  /** Stamped in the last 45 seconds. Nobody's mistake. */
  | { kind: "tooSoon"; code: string }
  | { kind: "unknownCard"; code: string }
  /** The shop's own sign-up poster. */
  | { kind: "enrollLink" }
  | { kind: "foreign" }
  | { kind: "failed"; message: string }
  /** Read, and waiting on the server. Held for as long as that takes. */
  | { kind: "working" };

export interface ScanResult {
  /** Monotonic, so a repeat of the same outcome still restarts the timer and
   * the animation. */
  id: number;
  state: ScanResultState;
}

type Tone = "ok" | "reward" | "warn" | "danger" | "quiet";

const GROUNDS: Record<Tone, string> = {
  ok: "bg-ok-bg text-ok ring-ok/30",
  // The one surface in the product that is allowed to be the accent itself.
  // `primary-on` is the measured partner for it in both themes — navy on
  // gold, white on violet — so the text is never picked by hand here.
  reward: "bg-primary text-primary-on ring-primary/40",
  warn: "bg-warn-bg text-warn ring-warn/30",
  danger: "bg-danger-bg text-danger ring-danger/30",
  quiet: "bg-navy-deep/80 text-white ring-white/10",
};

function toneOf(state: ScanResultState): Tone {
  switch (state.kind) {
    case "stamped":
    case "redeemed":
      return "ok";
    case "rewardReady":
    case "alreadyFull":
      return "reward";
    case "voided":
    case "failed":
      return "danger";
    case "working":
      return "quiet";
    default:
      return "warn";
  }
}

/** A row of marks, drawn in the overlay's own ink rather than the page's —
 * `CardPunches` paints with `fill-primary` and page-ink text, which is right
 * on a panel and wrong on a tinted flash. */
function Marks({ filled, total }: { filled: number; total: number }) {
  if (total > 12) return null;
  return (
    <span className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: total }).map((_, i) => (
        <PunchMark
          key={i}
          size={13}
          state={i < filled ? "stamped" : "empty"}
          className={i < filled ? "[&_path]:fill-current" : "opacity-45"}
        />
      ))}
    </span>
  );
}

function Count({ filled, total }: { filled: number; total: number }) {
  // A 409 whose follow-up lookup also failed knows the card is full and
  // nothing else. Better a panel with no figure than "0 / 0".
  if (total <= 0) return null;
  return (
    // "3 / 8" is two numbers with neutrals between them: inside a Hebrew
    // page the bidi algorithm reads it as "8 / 3" and the card looks fuller
    // than it is.
    <span dir="ltr" className="t-stat tabular-nums">
      {filled} <span className="opacity-40">/</span> {total}
    </span>
  );
}

export function ScanResultOverlay({
  result,
  rewardDescription,
  redeeming,
  onRedeem,
  onDismiss,
}: {
  result: ScanResult;
  rewardDescription?: string;
  redeeming: boolean;
  onRedeem: (code: string) => void;
  onDismiss: () => void;
}) {
  const { t } = useTranslation();
  const { state } = result;
  const tone = toneOf(state);

  return (
    <div
      key={result.id}
      className={cn(
        "absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 overflow-y-auto px-5 py-4 text-center ring-2 ring-inset",
        GROUNDS[tone],
        state.kind !== "working" && "animate-stamp-in",
      )}
    >
      {state.kind === "working" && (
        <>
          <ScanLine size={26} aria-hidden />
          <p className="text-sm font-semibold">{t("dashboard.scan.working")}</p>
        </>
      )}

      {state.kind === "stamped" && (
        <>
          <p className="flex items-center gap-1.5 t-card-title">
            <Check size={20} aria-hidden strokeWidth={3} />
            {t("dashboard.scan.result.stamped")}
          </p>
          <Count filled={state.count} total={state.total} />
          <Marks filled={state.count} total={state.total} />
          <p className="text-sm font-semibold opacity-85">
            {t("dashboard.scan.result.toGo", {
              count: Math.max(0, state.total - state.count),
            })}
          </p>
        </>
      )}

      {(state.kind === "rewardReady" || state.kind === "alreadyFull") && (
        <>
          <p className="flex items-center gap-1.5 t-card-title">
            <Gift size={20} aria-hidden />
            {t(`dashboard.scan.result.${state.kind}`)}
          </p>
          <Count filled={state.count} total={state.total} />
          {rewardDescription && (
            <p className="max-w-xs text-base font-bold">{rewardDescription}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              disabled={redeeming}
              onClick={() => onRedeem(state.code)}
              className={cn(
                "inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-primary-on px-5 text-sm font-bold text-primary transition-opacity hover:opacity-90 disabled:opacity-50",
                focusRing,
              )}
            >
              {t(
                redeeming
                  ? "dashboard.scan.result.redeeming"
                  : "dashboard.scan.result.redeem",
              )}
            </button>
            <button
              type="button"
              onClick={onDismiss}
              className={cn(
                "inline-flex min-h-[44px] items-center rounded-lg px-4 text-sm font-semibold underline underline-offset-4 hover:no-underline",
                focusRing,
              )}
            >
              {t("dashboard.scan.result.notNow")}
            </button>
          </div>
        </>
      )}

      {state.kind === "redeemed" && (
        <>
          <p className="flex items-center gap-1.5 t-card-title">
            <Check size={20} aria-hidden strokeWidth={3} />
            {t("dashboard.scan.result.redeemed")}
          </p>
          <p className="max-w-xs text-sm font-semibold opacity-85">
            {t("dashboard.scan.result.redeemedHint")}
          </p>
        </>
      )}

      {(state.kind === "tooSoon" ||
        state.kind === "unknownCard" ||
        state.kind === "enrollLink" ||
        state.kind === "foreign" ||
        state.kind === "voided" ||
        state.kind === "failed") && (
        <>
          {state.kind === "tooSoon" ? (
            <Clock size={24} aria-hidden />
          ) : state.kind === "enrollLink" || state.kind === "foreign" ? (
            <QrCode size={24} aria-hidden />
          ) : (
            <TriangleAlert size={24} aria-hidden />
          )}
          <p className="t-card-title">
            {t(`dashboard.scan.result.${state.kind}`)}
          </p>
          <p className="max-w-xs text-sm font-semibold opacity-85">
            {state.kind === "failed"
              ? state.message
              : t(`dashboard.scan.result.${state.kind}Hint`)}
          </p>
          <button
            type="button"
            onClick={onDismiss}
            className={ctaClasses(
              "secondary",
              "sm",
              "mt-1 border-current bg-transparent text-current hover:bg-black/5",
            )}
          >
            {t("dashboard.scan.result.dismiss")}
          </button>
        </>
      )}
    </div>
  );
}
