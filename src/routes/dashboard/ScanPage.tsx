import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { Link } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Flashlight, Keyboard, Volume2, VolumeX } from "lucide-react";
import { Button, Input, linkText } from "../../components/kit";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers, canManage, isOwner } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { getPublicCard, redeemCard, scanCode } from "../../api/loyalty";
import { classifyScanError, readScannedPayload, shouldAcceptCode } from "../../lib/scan";
import { cn } from "../../lib/cn";
import { useLightboxPage } from "../../theme/lightboxPage";
import { useQrScanner } from "./scan/useQrScanner";
import { ScannerViewport } from "./scan/ScannerViewport";
import { ScanAnswer } from "./scan/ScanAnswer";
import { CAUSE_KEYS, CHIMES, failureCause, type Answer, type AnswerState } from "./scan/answer";
import { useFinePointer } from "./scan/useFinePointer";
import { buzz, chime, primeAudio, setSoundEnabled, soundEnabled } from "./scan/feedback";

/**
 * The counter.
 *
 * Everything on this page is arranged around one number: the seconds between
 * a customer holding up their pass and being free to go. So the camera opens
 * on arrival and stays open, a read costs exactly one request, the answer
 * lands on the viewfinder instead of under it, and the next card is taken
 * while the last one's answer is still on screen. Nothing has to be tapped
 * to stamp a card; the tap that exists hands over a reward, which is a
 * decision and should not be automatic.
 *
 * Typing a code is a second scanner, not a fallback hidden under a toggle.
 * Whenever the camera isn't running the field is open and has focus, and on
 * a desk it is always open and keeps focus after each answer, so a USB or
 * Bluetooth scanner that types a code and Enter works like a second camera.
 *
 * It never guesses at an outcome, because a beep that says "stamped" when
 * nothing was stamped is worse than no beep, and it never adds a stamp of
 * its own accord. The cooldown that stops a double scan lives on the
 * server, which owns the clock, and its refusal is reported as what it is.
 */

/** A request that never comes back must not wedge the scanner shut. */
const IN_FLIGHT_GUARD_MS = 8_000;

/** How long the camera may take to start before the typed field steps in. */
const SLOW_START_MS = 5_000;

export function ScanPage() {
  useLightboxPage();
  const { t } = useTranslation();
  const { business, role } = useBusiness();
  const queryClient = useQueryClient();
  const canEnroll = canEnrollRealCustomers(business);
  const owns = isOwner(role);
  const desk = useFinePointer();

  // Same query key as the layout, the overview and the studio: on any route
  // but a hard refresh this is a cache read, so the reward's wording is on
  // screen the moment a card fills without costing the scan a round trip.
  const { data: templates } = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const reward = templates?.[0]?.reward_description;

  const [answer, setAnswer] = useState<Answer | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [soundOn, setSoundOn] = useState(soundEnabled);
  const [typing, setTyping] = useState(false);
  const [code, setCode] = useState("");
  const [tally, setTally] = useState({ stamps: 0, rewards: 0 });

  const answerRef = useRef<Answer | null>(null);
  answerRef.current = answer;
  const lastRef = useRef<{ code: string; at: number } | null>(null);
  /** When the in-flight request started; 0 when idle. */
  const inFlightRef = useRef(0);
  const idRef = useRef(0);
  const frameRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  /** Focus was inside the answer that is going, so it needs somewhere to land. */
  const refocus = useRef(false);
  /** The field was just opened by hand and wants focus once it is drawn. */
  const focusField = useRef(false);

  const replace = useCallback((next: Answer | null) => {
    refocus.current = !!frameRef.current?.contains(document.activeElement);
    answerRef.current = next;
    setAnswer(next);
  }, []);

  const show = useCallback(
    (state: AnswerState) => {
      replace({ id: (idRef.current += 1), state });
      const sound = CHIMES[state.kind] ?? (state.kind === "working" ? null : "reject");
      if (sound) {
        chime(sound);
        buzz(sound);
      }
    },
    [replace],
  );

  const dismiss = useCallback(() => replace(null), [replace]);

  /** One code, one request. The dedupe and the parsing happen before this;
   * a typed code goes straight in, because typing it is the intent. */
  const runScan = useCallback(
    async (scanned: string) => {
      inFlightRef.current = Date.now();
      show({ kind: "working" });
      try {
        const out = await scanCode(scanned);
        show({
          kind: out.status === "reward_ready" ? "rewardReady" : "stamped",
          code: scanned,
          count: out.stamp_count,
          total: out.stamps_required,
        });
        setTally((n) => ({ ...n, stamps: n.stamps + 1 }));
      } catch (error) {
        const failure = classifyScanError(error);
        if (failure === "failed") {
          show({ kind: "failed", during: "stamp", cause: failureCause(error) });
        } else if (failure !== "conflict") {
          show({ kind: failure, code: scanned });
        } else {
          // 409 is the one answer the endpoint leaves ambiguous: a full card
          // and a cancelled one are the same status with different prose.
          // Ask the card itself rather than reading the sentence.
          try {
            const card = await getPublicCard(scanned);
            show(
              card.status === "void"
                ? { kind: "voided", code: scanned }
                : { kind: "alreadyFull", code: scanned, count: card.stamp_count, total: card.stamps_required },
            );
          } catch {
            // Nothing sets a card void today, so a 409 the lookup can't
            // explain is a full card. Said without a count rather than an
            // invented one.
            show({ kind: "alreadyFull", code: scanned, count: 0, total: 0 });
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
    [queryClient, show],
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

      const { code: scanned } = payload;
      // The answer to this exact card is already on screen. Asking again
      // would restart its clock and, for a full card, pull the reward
      // buttons out from under the thumb reaching for them.
      const current = answerRef.current?.state;
      if (current && "code" in current && current.code === scanned) return;
      if (!shouldAcceptCode(scanned, lastRef.current, now)) return;
      if (inFlightRef.current && now - inFlightRef.current < IN_FLIGHT_GUARD_MS) return;

      lastRef.current = { code: scanned, at: now };
      void runScan(scanned);
    },
    [runScan, show],
  );

  const { videoRef, status, torchOn, torchSupported, toggleTorch, retry } = useQrScanner(handleCode);

  const slow = useSlowStart(status === "starting");
  const down =
    slow || status === "denied" || status === "noCamera" || status === "unsupported" || status === "failed";
  // Open whenever the camera can't be used, always on a desk, and from 768px
  // (by CSS, below); on a phone with the camera running, when asked for.
  const fieldOpen = typing || down || desk;

  // The camera just became unusable: the field is the way in now, so it
  // opens and takes focus by itself.
  useEffect(() => {
    if (!down) return;
    setTyping(true);
    inputRef.current?.focus();
  }, [down]);

  // After the answer changes: focus that was inside the old answer lands on
  // the field when it is open, or else on the page's heading; a field just
  // opened by hand takes focus once it is drawn.
  useEffect(() => {
    if (focusField.current) {
      focusField.current = false;
      inputRef.current?.focus();
    }
    if (!refocus.current) return;
    refocus.current = false;
    if (frameRef.current?.contains(document.activeElement)) return;
    (fieldOpen ? inputRef.current : headingRef.current)?.focus();
  }, [answer, typing, fieldOpen]);

  const onRedeem = useCallback(
    async (scanned: string) => {
      setRedeeming(true);
      try {
        await redeemCard(scanned);
        // The card it belonged to is spent; let it be scanned again for the
        // first stamp of the next round without waiting out the window.
        lastRef.current = null;
        show({ kind: "redeemed", code: scanned });
        setTally((n) => ({ ...n, rewards: n.rewards + 1 }));
      } catch (error) {
        show({ kind: "failed", during: "redeem", cause: failureCause(error) });
      } finally {
        setRedeeming(false);
        void queryClient.invalidateQueries({ queryKey: ["activity"] });
        void queryClient.invalidateQueries({ queryKey: ["customers"] });
      }
    },
    [queryClient, show],
  );

  // iOS keeps an audio context suspended until a gesture resumes it, and the
  // first beep is the one that teaches the counter what the sound means. The
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
      // Turning it back on is the one moment the counter asks to hear it.
      primeAudio();
      chime("punch");
    }
  };

  const openField = () => {
    focusField.current = true;
    setTyping(true);
  };

  const submitTyped = (event: FormEvent) => {
    event.preventDefault();
    const payload = readScannedPayload(code);
    if (payload.kind !== "code") {
      show({ kind: payload.kind === "enrollLink" ? "enrollLink" : "foreign" });
      return;
    }
    setCode("");
    lastRef.current = { code: payload.code, at: Date.now() };
    // On a desk, or with the camera down, the field keeps focus for the next
    // code. On a phone with the camera running it lets go, so the keyboard
    // closes and the answer is in view.
    if (desk || down) inputRef.current?.focus();
    else inputRef.current?.blur();
    void runScan(payload.code);
  };

  const state = answer?.state;
  const spoken = state ? speak(state, reward, t) : "";

  return (
    <div className="mx-auto flex w-full max-w-[35rem] flex-col gap-4">
      {/* One sign row: the page's name, and the light and the sound beside it. */}
      <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
        <h1 ref={headingRef} tabIndex={-1} className="type-sign text-ink outline-none">
          {t("dashboard.scan.title")}
        </h1>
        <div className="flex items-center gap-2">
          {torchSupported && (
            <Toggle on={torchOn} onToggle={toggleTorch} icon={<Flashlight aria-hidden />}>
              {t("dashboard.scan.torch")}
            </Toggle>
          )}
          <Toggle on={soundOn} onToggle={onToggleSound} icon={soundOn ? <Volume2 aria-hidden /> : <VolumeX aria-hidden />}>
            {t("dashboard.scan.sound")}
          </Toggle>
        </div>
      </div>

      {!canEnroll && (
        // What there is to stamp before the card is live: the owner's own
        // card, and any card a shop that dropped back to Free handed out.
        // Nothing here can tell which shop this is, so the line is true of
        // both, and it is a line, not a warning.
        <p className="type-body text-ink-muted">
          {t(canManage(role) ? "dashboard.scan.freePlan" : "dashboard.scan.freePlanHire")}{" "}
          {owns && (
            <Link to="/dashboard/billing" className={cn(linkText, "inline-flex min-h-11 items-center align-middle font-semibold")}>
              {t("billing.activateCta")}
            </Link>
          )}
        </p>
      )}

      <div ref={frameRef}>
        <ScannerViewport
          videoRef={videoRef}
          status={status}
          folded={down}
          answering={!!answer}
          snap={answer && answer.state.kind !== "working" ? answer.id : null}
          onRetry={retry}
        >
          {answer && (
            <ScanAnswer
              key={answer.id}
              answer={answer}
              inset={!down}
              rewardDescription={reward}
              redeeming={redeeming}
              onRedeem={onRedeem}
              onDismiss={dismiss}
            />
          )}
        </ScannerViewport>
      </div>

      {/* The light and the number are for the eye; this is the same news in
          words, said once, for anyone listening to the page. */}
      <p aria-live="polite" className="sr-only">
        {spoken}
      </p>

      {(tally.stamps > 0 || tally.rewards > 0) && (
        <p className="type-body text-center text-ink-muted">
          {t("dashboard.scan.tally.punches", { count: tally.stamps })}
          {tally.rewards > 0 && <> · {t("dashboard.scan.tally.rewards", { count: tally.rewards })}</>}
          {" · "}
          <Link to="/dashboard/activity" className={cn(linkText, "inline-flex min-h-11 items-center align-middle")}>
            {t("dashboard.scan.tally.seeAll")}
          </Link>
        </p>
      )}

      {!fieldOpen && (
        <Button variant="secondary" icon={<Keyboard aria-hidden />} onClick={openField} className="self-center md:hidden">
          {t("dashboard.scan.manual.toggle")}
        </Button>
      )}

      <div className={cn("flex-col gap-2", fieldOpen ? "flex" : "hidden md:flex")}>
        <form onSubmit={submitTyped} className="flex items-end gap-2">
          <Input
            ref={inputRef}
            label={t("dashboard.scan.manual.label")}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            // The code is Latin and case-sensitive in both languages: the
            // one place on this page Plex Mono sets.
            dir="ltr"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            enterKeyHint="go"
            className="min-w-0 flex-1 [&_input]:font-mono"
          />
          <Button type="submit" variant="ink" disabled={!code.trim()} className="min-h-12">
            {t("dashboard.scan.manual.submit")}
          </Button>
        </form>
        <p className="text-sm text-ink-muted">{t("dashboard.scan.manual.hint")}</p>
      </div>
    </div>
  );
}

/** Light and Sound: a 44px pill each, on in ink. `aria-pressed` says on or
 * off to a screen reader and the fill says it on screen; a label that
 * changed too would be a third thing saying the same. */
function Toggle({ on, onToggle, icon, children }: { on: boolean; onToggle: () => void; icon: ReactNode; children: ReactNode }) {
  return (
    <Button variant={on ? "ink" : "secondary"} aria-pressed={on} onClick={onToggle} icon={icon}>
      {children}
    </Button>
  );
}

/** True once the camera has been starting for longer than a counter waits. */
function useSlowStart(starting: boolean): boolean {
  const [slow, setSlow] = useState(false);
  useEffect(() => {
    setSlow(false);
    if (!starting) return;
    const timer = window.setTimeout(() => setSlow(true), SLOW_START_MS);
    return () => window.clearTimeout(timer);
  }, [starting]);
  return slow;
}

/** The answer in words, once: never "4/8", which a screen reader can read
 * as a date. */
function speak(state: AnswerState, reward: string | undefined, t: TFunction): string {
  const said = (word: string, reason: string) => t("dashboard.scan.announce.said", { word, reason });
  switch (state.kind) {
    case "working":
      return "";
    case "stamped":
      return t("dashboard.scan.announce.stamped", {
        count: state.count,
        total: state.total,
        left: Math.max(0, state.total - state.count),
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
