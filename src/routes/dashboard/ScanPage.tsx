import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Keyboard } from "lucide-react";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import {
  fieldClasses,
  Notice,
  Panel,
} from "../../components/dashboard/primitives";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { getPublicCard, redeemCard, scanCode } from "../../api/loyalty";
import { ApiError } from "../../api/errors";
import {
  classifyScanError,
  readScannedPayload,
  shouldAcceptCode,
} from "../../lib/scan";
import { cn } from "../../lib/cn";
import { useQrScanner } from "./scan/useQrScanner";
import { ScannerViewport } from "./scan/ScannerViewport";
import {
  ScanResultOverlay,
  type ScanResult,
  type ScanResultState,
} from "./scan/ScanResult";
import {
  buzz,
  chime,
  primeAudio,
  setSoundEnabled,
  soundEnabled,
  type Chime,
} from "./scan/feedback";

/**
 * The counter.
 *
 * Everything on this page is arranged around one number: the seconds between
 * a customer holding up their pass and being free to go. So the camera opens
 * on arrival and stays open, a read costs exactly one request, the result
 * lands on the viewfinder instead of under it, and the next card is taken
 * while the last one's answer is still on screen. Nothing has to be tapped
 * to punch a card — the tap that exists is the one that hands over a reward,
 * which is a decision and should not be automatic.
 *
 * The two things it deliberately does not do: it never guesses at an
 * outcome, because a beep that says "punched" when nothing was punched is
 * worse than no beep; and it never adds a second stamp of its own accord.
 * The 45-second cooldown that stops a double-scan lives on the server, which
 * owns the clock, and this page reports its refusal as what it is rather
 * than hiding it.
 */

/** How long each answer holds the frame. A punch is read at a glance and
 * clears itself; a refusal is read twice, so it stays longer. A full card is
 * a question and waits — but not forever, or a queue stalls behind somebody
 * who wandered off. */
const HOLD_MS: Record<string, number> = {
  stamped: 2_200,
  redeemed: 2_600,
  rewardReady: 15_000,
  alreadyFull: 15_000,
};
const HOLD_DEFAULT_MS = 3_800;

/** A request that never comes back must not wedge the scanner shut. */
const IN_FLIGHT_GUARD_MS = 8_000;

const CHIMES: Record<string, Chime> = {
  stamped: "punch",
  redeemed: "punch",
  rewardReady: "reward",
  alreadyFull: "reward",
};

export function ScanPage() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const queryClient = useQueryClient();
  const canEnroll = canEnrollRealCustomers(business);

  // Same query key as the layout, the overview and the studio: on any route
  // but a hard refresh this is a cache read, so the reward's wording is on
  // screen the moment a card fills without costing the scan a round trip.
  const { data: templates } = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates?.[0];

  const [result, setResult] = useState<ScanResult | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [soundOn, setSoundOn] = useState(soundEnabled);
  const [manualOpen, setManualOpen] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [tally, setTally] = useState({ punches: 0, rewards: 0 });

  const resultRef = useRef<ScanResult | null>(null);
  resultRef.current = result;
  const lastRef = useRef<{ code: string; at: number } | null>(null);
  /** When the in-flight request started; 0 when idle. */
  const inFlightRef = useRef(0);
  const idRef = useRef(0);

  const show = useCallback((state: ScanResultState) => {
    const next = { id: (idRef.current += 1), state };
    resultRef.current = next;
    setResult(next);
    const sound = CHIMES[state.kind] ?? (state.kind === "working" ? null : "reject");
    if (sound) {
      chime(sound);
      buzz(sound);
    }
  }, []);

  /** One code, one request. The dedupe and the parsing happen before this —
   * a manual entry goes straight in, because typing it *is* the intent. */
  const runScan = useCallback(
    async (code: string) => {
      inFlightRef.current = Date.now();
      show({ kind: "working" });
      try {
        const out = await scanCode(code);
        const full = out.status === "reward_ready";
        show({
          kind: full ? "rewardReady" : "stamped",
          code,
          count: out.stamp_count,
          total: out.stamps_required,
        });
        setTally((n) => ({ ...n, punches: n.punches + 1 }));
      } catch (error) {
        const failure = classifyScanError(error);
        if (failure !== "conflict") {
          show(
            failure === "failed"
              ? {
                  kind: "failed",
                  message:
                    error instanceof ApiError
                      ? error.message
                      : t("dashboard.scan.result.offline"),
                }
              : { kind: failure, code },
          );
        } else {
          // 409 is the one answer the endpoint leaves ambiguous — a card
          // that is already full and a card that has been voided are the
          // same status with different prose. Ask the card itself rather
          // than reading the sentence.
          try {
            const card = await getPublicCard(code);
            show(
              card.status === "void"
                ? { kind: "voided", code }
                : {
                    kind: "alreadyFull",
                    code,
                    count: card.stamp_count,
                    total: card.stamps_required,
                  },
            );
          } catch {
            // Nothing sets a card void today, so a 409 the lookup can't
            // explain is a full card. Say so without a count rather than
            // inventing one.
            show({ kind: "alreadyFull", code, count: 0, total: 0 });
          }
        }
      } finally {
        inFlightRef.current = 0;
        // Inactive on this route, so this costs nothing until the owner
        // opens one of them.
        void queryClient.invalidateQueries({ queryKey: ["activity"] });
        void queryClient.invalidateQueries({ queryKey: ["customers"] });
      }
    },
    [queryClient, show, t],
  );

  const handleCode = useCallback(
    (raw: string) => {
      const payload = readScannedPayload(raw);
      const now = Date.now();

      if (payload.kind !== "code") {
        // Held off by the same window as a card, so a poster sitting in
        // frame says its piece once instead of ten times a second.
        if (!shouldAcceptCode(payload.kind, lastRef.current, now)) return;
        lastRef.current = { code: payload.kind, at: now };
        show({ kind: payload.kind });
        return;
      }

      const { code } = payload;
      // The answer to this exact card is already on screen. Re-asking would
      // restart its timer and, for a full card, pull the reward buttons out
      // from under the thumb reaching for them.
      const current = resultRef.current?.state;
      if (current && "code" in current && current.code === code) return;
      if (!shouldAcceptCode(code, lastRef.current, now)) return;
      if (inFlightRef.current && now - inFlightRef.current < IN_FLIGHT_GUARD_MS) {
        return;
      }

      lastRef.current = { code, at: now };
      void runScan(code);
    },
    [runScan, show],
  );

  const { videoRef, status, torchOn, torchSupported, toggleTorch, retry } =
    useQrScanner(handleCode);

  const onRedeem = useCallback(
    async (code: string) => {
      setRedeeming(true);
      try {
        await redeemCard(code);
        // The card it belonged to is spent; let it be scanned again for the
        // first punch of the next round without waiting out the window.
        lastRef.current = null;
        show({ kind: "redeemed", code });
        setTally((n) => ({ ...n, rewards: n.rewards + 1 }));
      } catch (error) {
        show({
          kind: "failed",
          message:
            error instanceof ApiError
              ? error.message
              : t("dashboard.scan.result.offline"),
        });
      } finally {
        setRedeeming(false);
        void queryClient.invalidateQueries({ queryKey: ["activity"] });
        void queryClient.invalidateQueries({ queryKey: ["customers"] });
      }
    },
    [queryClient, show, t],
  );

  const dismiss = useCallback(() => {
    resultRef.current = null;
    setResult(null);
  }, []);

  // Each answer clears itself. Keyed on the id, so a repeat of the same
  // outcome restarts the clock rather than inheriting the last one's.
  useEffect(() => {
    if (!result || result.state.kind === "working") return;
    const ms = HOLD_MS[result.state.kind] ?? HOLD_DEFAULT_MS;
    const timer = window.setTimeout(dismiss, ms);
    return () => window.clearTimeout(timer);
  }, [result, dismiss]);

  // iOS keeps an audio context suspended until a gesture resumes it, and the
  // first beep is the one that teaches the owner what the sound means. The
  // tap that opened this page counts, so ask on the next interaction of any
  // kind and then stop listening.
  useEffect(() => {
    const unlock = () => primeAudio();
    document.addEventListener("pointerdown", unlock, { once: true });
    document.addEventListener("keydown", unlock, { once: true });
    primeAudio();
    return () => {
      document.removeEventListener("pointerdown", unlock);
      document.removeEventListener("keydown", unlock);
    };
  }, []);

  const onToggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    setSoundEnabled(next);
    if (next) {
      // Turning it back on is the one moment the owner is asking to hear it.
      primeAudio();
      chime("punch");
    }
  };

  const submitManual = (event: FormEvent) => {
    event.preventDefault();
    const payload = readScannedPayload(manualCode);
    if (payload.kind !== "code") {
      show({ kind: payload.kind === "enrollLink" ? "enrollLink" : "foreign" });
      return;
    }
    setManualCode("");
    lastRef.current = { code: payload.code, at: Date.now() };
    void runScan(payload.code);
  };

  const state = result?.state;
  const announcement =
    !state || state.kind === "working"
      ? ""
      : state.kind === "stamped" || state.kind === "alreadyFull" || state.kind === "rewardReady"
        ? `${t(`dashboard.scan.result.${state.kind}`)} — ${state.count}/${state.total}`
        : state.kind === "failed"
          ? state.message
          : t(`dashboard.scan.result.${state.kind}`);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-4 sm:gap-5">
      <div>
        <h1 className="t-h3 text-ink">{t("dashboard.scan.title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("dashboard.scan.lead")}</p>
      </div>

      {!canEnroll && (
        <Notice tone="warn">
          {t("dashboard.scan.freePlan")}{" "}
          <Link
            to="/dashboard/billing"
            // inline-flex, not inline: a link in running prose is 18px tall
            // and this one is a thumb target like any other.
            className={cn(
              "inline-flex min-h-[44px] items-center align-middle font-semibold underline hover:no-underline",
              focusRing,
            )}
          >
            {t("dashboard.scan.freePlanCta")}
          </Link>
        </Notice>
      )}

      <ScannerViewport
        videoRef={videoRef}
        status={status}
        torchOn={torchOn}
        torchSupported={torchSupported}
        onToggleTorch={toggleTorch}
        soundOn={soundOn}
        onToggleSound={onToggleSound}
        onRetry={retry}
      >
        {result && (
          <ScanResultOverlay
            result={result}
            rewardDescription={template?.reward_description}
            redeeming={redeeming}
            onRedeem={onRedeem}
            onDismiss={dismiss}
          />
        )}
      </ScannerViewport>

      {/* The overlay is a flash of colour and a number; this is the same
          news in words, for anyone reading the page rather than watching it. */}
      <p aria-live="polite" className="sr-only">
        {announcement}
      </p>

      {(tally.punches > 0 || tally.rewards > 0) && (
        <p className="text-center text-sm text-ink-muted">
          {t("dashboard.scan.tally.punches", { count: tally.punches })}
          {tally.rewards > 0 && (
            <>
              {" · "}
              {t("dashboard.scan.tally.rewards", { count: tally.rewards })}
            </>
          )}
          {" · "}
          <Link
            to="/dashboard/activity"
            className={cn(
              "inline-flex min-h-[44px] items-center align-middle font-semibold text-primary-text underline hover:no-underline",
              focusRing,
            )}
          >
            {t("dashboard.scan.tally.seeAll")}
          </Link>
        </p>
      )}

      <Panel className="p-4 sm:p-5">
        <button
          type="button"
          onClick={() => setManualOpen((open) => !open)}
          aria-expanded={manualOpen}
          className={cn(
            "inline-flex min-h-[44px] w-full items-center gap-2.5 rounded-xl text-start text-sm font-semibold text-ink",
            focusRing,
          )}
        >
          <Keyboard size={17} aria-hidden className="shrink-0 text-ink-subtle" />
          {t("dashboard.scan.manual.toggle")}
        </button>

        {manualOpen && (
          <form onSubmit={submitManual} className="mt-3 flex flex-col gap-2">
            <label htmlFor="scan-manual-code" className="text-sm text-ink-muted">
              {t("dashboard.scan.manual.label")}
            </label>
            <div className="flex flex-wrap gap-2">
              <input
                id="scan-manual-code"
                value={manualCode}
                onChange={(event) => setManualCode(event.target.value)}
                // The code is Latin and case-sensitive in both languages.
                dir="ltr"
                autoComplete="off"
                autoCapitalize="none"
                spellCheck={false}
                className={cn(fieldClasses, "min-w-0 flex-1 font-mono")}
              />
              <button
                type="submit"
                disabled={!manualCode.trim()}
                className={ctaClasses("primary", "sm")}
              >
                {t("dashboard.scan.manual.submit")}
              </button>
            </div>
            <p className="text-sm text-ink-subtle">
              {t("dashboard.scan.manual.hint")}
            </p>
          </form>
        )}
      </Panel>
    </div>
  );
}
