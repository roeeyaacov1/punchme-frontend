import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { Input } from "../../components/ui";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { Eyebrow, ctaClasses, focusRing } from "../../components/marketing/primitives";
import { cn } from "../../lib/cn";
import { PassStage } from "./PassStage";
import {
  enroll,
  getPublicCard,
  requestJoinOtp,
  type CardPublic,
  type EnrollOut,
} from "../../api/loyalty";
import { isLikelyIlPhone } from "../../lib/phone";
import { ApiError } from "../../api/errors";
import { env } from "../../lib/env";

type Step =
  | { kind: "details" }
  | { kind: "code" }
  | { kind: "success"; enrollResult: EnrollOut; card: CardPublic }
  | { kind: "notFound" }
  | { kind: "upgradeRequired" };

const RESEND_SECONDS = 60;

/** The public join flow — a stranger standing at a counter with one hand
 * free: name + phone (+ optional birthday), SMS code, done. Carries the
 * s.11 privacy notice and a separate unticked marketing checkbox (Spam
 * Law), per the G3 research.
 *
 * When env.otpRequired is false the code step is skipped entirely and the
 * details form enrolls directly — see the note in submitDetails. */
export function JoinPage() {
  const { t } = useTranslation();
  const { templateId } = useParams<{ templateId: string }>();

  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>({ kind: "details" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  // Resend countdown ticker
  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  // While the wallet push is in flight, poll the public card until the
  // pass URL appears (the backend issues asynchronously on failure).
  const pollRef = useRef<number | null>(null);
  useEffect(() => {
    if (step.kind !== "success" || !step.enrollResult.wallet_issue_pending) return;
    pollRef.current = window.setInterval(async () => {
      try {
        const card = await getPublicCard(step.enrollResult.card_serial);
        if (card.wallet_pass_url) {
          setStep({
            kind: "success",
            enrollResult: {
              ...step.enrollResult,
              wallet_pass_url: card.wallet_pass_url,
              wallet_issue_pending: false,
            },
            card,
          });
        }
      } catch {
        /* keep polling */
      }
    }, 3000);
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current);
    };
  }, [step]);

  async function submitDetails() {
    if (!templateId) return;
    if (!isLikelyIlPhone(phone)) {
      setError(t("enroll.phoneInvalid"));
      return;
    }
    // With OTP off there is no code to wait for, and asking for one anyway
    // would still burn the backend's per-phone send limit — three taps and
    // the customer is locked out of a step that isn't even required.
    if (!env.otpRequired) {
      await completeEnrollment();
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await requestJoinOtp(templateId, phone.trim());
      setStep({ kind: "code" });
      setCode("");
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setStep({ kind: "notFound" });
      else if (err instanceof ApiError && err.code === "otp_throttled")
        setError(t("enroll.otpThrottled"));
      else if (err instanceof ApiError && err.code === "invalid_phone")
        setError(t("enroll.phoneInvalid"));
      else setError(t("enroll.genericError"));
    } finally {
      setBusy(false);
    }
  }

  /** Shared by both paths: with a code when OTP is on, without one when it
   * isn't (the API ignores otp_code entirely in that mode). */
  async function completeEnrollment(otpCode?: string) {
    if (!templateId) return;
    setError(null);
    setBusy(true);
    try {
      const enrollResult = await enroll(templateId, {
        phone: phone.trim(),
        display_name: displayName.trim() || undefined,
        birthday: birthday || undefined,
        marketing_opt_in: marketingOptIn,
        otp_code: otpCode,
      });
      const card = await getPublicCard(enrollResult.card_serial);
      setStep({ kind: "success", enrollResult, card });
    } catch (err) {
      if (err instanceof ApiError && err.code === "otp_invalid")
        setError(t("enroll.otpInvalid"));
      else if (err instanceof ApiError && err.code === "upgrade_required")
        setStep({ kind: "upgradeRequired" });
      else if (err instanceof ApiError && err.status === 404) setStep({ kind: "notFound" });
      else setError(t("enroll.genericError"));
    } finally {
      setBusy(false);
    }
  }

  if (step.kind === "notFound") {
    return <CenteredMessage>{t("enroll.notFound")}</CenteredMessage>;
  }
  if (step.kind === "upgradeRequired") {
    return <CenteredMessage>{t("enroll.upgradeRequired")}</CenteredMessage>;
  }

  if (step.kind === "success") {
    const { enrollResult, card } = step;
    return (
      <JoinShell>
        <div className="flex flex-col items-center gap-2 text-center">
          {/* `Eyebrow`, not a hand-rolled mono line: this is running text
              carrying a business name, and Plex Mono has no Hebrew.
              `.t-eyebrow` is the body face and already re-tracks itself in
              RTL, where the Latin spacing only smears. */}
          <Eyebrow>
            {t("enroll.successEyebrow", { businessName: card.business_name })}
          </Eyebrow>
          <h1 className="text-2xl font-heading font-bold text-ink">
            {t("enroll.successTitle")}
          </h1>
        </div>

        {/* The card the customer is actually getting — the studio's own
            renderer, which prefers the published PNG PassKit serves to the
            phone. The barcode is real too: `/api/scan` matches the serial,
            so this screen is a working pass for a customer who never taps
            "add to wallet", or whose wallet push is still in flight. */}
        <PassStage
          card={card}
          serial={enrollResult.card_serial}
          holderName={displayName}
        />

        <div className="flex w-full flex-col items-center gap-4">
          <WalletAddButtons
            passUrl={enrollResult.wallet_pass_url}
            pending={enrollResult.wallet_issue_pending}
            linkClassName={ctaClasses("gradient", "lg", "w-full max-w-[300px]")}
          />
          {/* Only worth saying while there is no button to press. Once the
              pass is ready the card above already shows a scannable code. */}
          {!enrollResult.wallet_pass_url && (
            <p className="max-w-[300px] text-center text-sm font-body text-ink-muted">
              {t("enroll.scanMeanwhile")}
            </p>
          )}
          <Link
            to={`/c/${enrollResult.card_serial}`}
            className={cn(
              // min-h-[44px] rather than the bare text link it was: 44px is the
              // floor for anything a thumb has to find on a phone.
              "inline-flex min-h-[44px] items-center rounded-lg px-2 text-sm font-body text-ink-subtle underline hover:no-underline",
              focusRing,
            )}
          >
            {t("enroll.statusTitle")}
          </Link>
        </div>
      </JoinShell>
    );
  }

  if (step.kind === "code") {
    return (
      <JoinShell>
        <h1 className="text-center text-2xl font-heading font-bold text-ink">
          {t("enroll.codeTitle")}
        </h1>
        <p className="max-w-xs text-center text-sm font-body text-ink-muted">
          {t("enroll.codeSentTo", { phone })}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void completeEnrollment(code.trim());
          }}
          className="flex flex-col gap-4 w-full max-w-xs"
        >
          <Input
            label={t("enroll.codeLabel")}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            className="text-center tracking-[0.5em] font-mono text-lg"
          />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy || code.length !== 6}
            className={ctaClasses("gradient", "lg")}
          >
            {busy ? t("common.loading") : t("enroll.verifyCta")}
          </button>
          <div className="flex items-center justify-between gap-3 text-sm font-body">
            <button
              type="button"
              onClick={() => {
                setStep({ kind: "details" });
                setError(null);
              }}
              className={cn(
                "inline-flex min-h-[44px] items-center rounded-lg px-2 text-ink-subtle underline hover:no-underline",
                focusRing,
              )}
            >
              {t("enroll.editPhone")}
            </button>
            <button
              type="button"
              disabled={resendIn > 0 || busy}
              onClick={() => void submitDetails()}
              className={cn(
                "inline-flex min-h-[44px] items-center rounded-lg px-2 text-primary-text underline hover:no-underline",
                // The disabled label is a countdown, i.e. the only thing on
                // screen saying when the next code can be sent — dimming it
                // to 40% made the one useful sentence the faintest text on
                // the page. Muted ink instead, at full opacity.
                "disabled:text-ink-subtle disabled:no-underline disabled:opacity-100",
                focusRing,
              )}
            >
              {resendIn > 0
                ? t("enroll.resendIn", { seconds: resendIn })
                : t("enroll.resend")}
            </button>
          </div>
        </form>
      </JoinShell>
    );
  }

  return (
    <JoinShell>
      <h1 className="text-center text-2xl font-heading font-bold text-ink">
        {t("enroll.genericTitle")}
      </h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitDetails();
        }}
        className="flex flex-col gap-5 w-full max-w-sm"
      >
        <Input
          label={t("enroll.nameLabel")}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          autoComplete="name"
        />
        <Input
          label={t("enroll.phoneRequiredLabel")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          dir="ltr"
          inputMode="tel"
          autoComplete="tel"
          required
        />
        <Input
          label={t("enroll.birthdayLabel")}
          hint={t("enroll.birthdayHint")}
          type="date"
          value={birthday}
          onChange={(e) => setBirthday(e.target.value)}
          dir="ltr"
        />

        <label className="flex items-start gap-2 text-sm font-body text-ink">
          <input
            type="checkbox"
            className="mt-1"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
          />
          <span>{t("enroll.marketingOptIn")}</span>
        </label>

        {/* s.11 privacy notice (Amendment 13) — short line + expandable full text */}
        <details className="font-body text-xs leading-relaxed text-ink-subtle">
          <summary className={cn("cursor-pointer rounded px-1 py-0.5 underline hover:no-underline", focusRing)}>
            {t("enroll.privacySummary")}
          </summary>
          <p className="mt-2 whitespace-pre-line">{t("enroll.privacyNotice")}</p>
        </details>

        {error && <p className="text-sm font-body text-danger">{error}</p>}
        <button type="submit" disabled={busy} className={ctaClasses("gradient", "lg")}>
          {busy
            ? t("common.loading")
            : t(env.otpRequired ? "enroll.sendCodeCta" : "enroll.submit")}
        </button>
      </form>
    </JoinShell>
  );
}

/** One panel on the wash ground, the way the wizard and the sign-in page
 * are built — this is the same public product, and the customer's half of
 * it should not look like a different one. `theme-raised` is what stops the
 * panel being white on white. */
function JoinShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="theme-purple theme-raised min-h-screen bg-background px-5 py-10 text-ink sm:py-16">
      <div className="mx-auto flex w-full max-w-sm flex-col items-center gap-7 rounded-2xl border border-border bg-surface px-5 py-8 shadow-card sm:px-8">
        {children}
      </div>
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <JoinShell>
      <p className="text-center font-body text-ink">{children}</p>
    </JoinShell>
  );
}
