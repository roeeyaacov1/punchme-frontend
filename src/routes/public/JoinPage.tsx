import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { WalletCardPreview } from "../../components/wallet-card/WalletCardPreview";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import {
  enroll,
  getPublicCard,
  requestJoinOtp,
  type CardPublic,
  type EnrollOut,
} from "../../api/loyalty";
import { isLikelyIlPhone } from "../../lib/phone";
import { ApiError } from "../../api/errors";

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
 * Law), per the G3 research. */
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

  async function sendCode() {
    if (!templateId) return;
    if (!isLikelyIlPhone(phone)) {
      setError(t("enroll.phoneInvalid"));
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

  async function submitCode() {
    if (!templateId) return;
    setError(null);
    setBusy(true);
    try {
      const enrollResult = await enroll(templateId, {
        phone: phone.trim(),
        display_name: displayName.trim() || undefined,
        birthday: birthday || undefined,
        marketing_opt_in: marketingOptIn,
        otp_code: code.trim(),
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
      <div className="min-h-screen flex flex-col items-center gap-8 bg-white text-navy px-6 py-16 text-center">
        <h1 className="text-2xl">{t("enroll.successTitle")}</h1>
        <WalletCardPreview
          businessName={card.business_name}
          stampsRequired={card.stamps_required}
          currentStamps={card.stamp_count}
          rewardDescription={card.reward_description}
          backgroundColor={card.background_color}
          foregroundColor={card.foreground_color}
          labelColor={card.label_color}
          logoUrl={card.logo_url ?? undefined}
        />
        <WalletAddButtons
          passUrl={enrollResult.wallet_pass_url}
          pending={enrollResult.wallet_issue_pending}
        />
        <Link to={`/c/${enrollResult.card_serial}`} className="text-sm text-slate underline">
          {t("enroll.statusTitle")}
        </Link>
      </div>
    );
  }

  if (step.kind === "code") {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-white text-navy px-6 py-16">
        <h1 className="text-2xl text-center">{t("enroll.codeTitle")}</h1>
        <p className="text-sm text-slate font-body text-center max-w-xs">
          {t("enroll.codeSentTo", { phone })}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitCode();
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
          <Button type="submit" disabled={busy || code.length !== 6}>
            {busy ? t("common.loading") : t("enroll.verifyCta")}
          </Button>
          <div className="flex items-center justify-between text-sm">
            <button
              type="button"
              onClick={() => {
                setStep({ kind: "details" });
                setError(null);
              }}
              className="text-slate underline hover:no-underline"
            >
              {t("enroll.editPhone")}
            </button>
            <button
              type="button"
              disabled={resendIn > 0 || busy}
              onClick={() => void sendCode()}
              className="text-navy underline hover:no-underline disabled:opacity-40 disabled:no-underline"
            >
              {resendIn > 0
                ? t("enroll.resendIn", { seconds: resendIn })
                : t("enroll.resend")}
            </button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-white text-navy px-6 py-12">
      <h1 className="text-2xl text-center">{t("enroll.genericTitle")}</h1>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendCode();
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

        <label className="flex items-start gap-2 text-sm font-body text-navy">
          <input
            type="checkbox"
            className="mt-1"
            checked={marketingOptIn}
            onChange={(e) => setMarketingOptIn(e.target.checked)}
          />
          <span>{t("enroll.marketingOptIn")}</span>
        </label>

        {/* s.11 privacy notice (Amendment 13) — short line + expandable full text */}
        <details className="text-xs text-slate font-body leading-relaxed">
          <summary className="cursor-pointer underline hover:no-underline">
            {t("enroll.privacySummary")}
          </summary>
          <p className="mt-2 whitespace-pre-line">{t("enroll.privacyNotice")}</p>
        </details>

        {error && <p className="text-sm text-red-600">{error}</p>}
        <Button type="submit" disabled={busy}>
          {busy ? t("common.loading") : t("enroll.sendCodeCta")}
        </Button>
      </form>
    </div>
  );
}

function CenteredMessage({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center text-center px-6 text-navy font-body">
      {children}
    </div>
  );
}
