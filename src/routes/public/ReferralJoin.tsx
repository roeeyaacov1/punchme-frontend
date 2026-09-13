import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { ApiError } from "../../api/errors";
import { getPublicCard, type CardPublic } from "../../api/loyalty";
import {
  referralJoin,
  requestReferralOtp,
  type PublicCardPage,
  type ReferralJoinOut,
} from "../../api/referrals";
import { Eyebrow, ctaClasses, focusRing } from "../../components/marketing/primitives";
import { Input } from "../../components/ui";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { cn } from "../../lib/cn";
import { toNameCase } from "../../lib/name";
import { isLikelyIlPhone } from "../../lib/phone";
import { PassStage } from "./PassStage";

/**
 * The friend's join, on the page behind a member's wallet QR.
 *
 * The same three steps as the poster's join page — details, SMS code, the
 * card — with two differences the friend never sees: the requests go to the
 * member's token rather than a design id, so the join is attributed to the
 * member; and the code is never skipped, whatever the deployment's OTP
 * setting, because every fraud rule behind the attribution rests on the
 * phone being real. Same legal text (the s.11 notice, the separate
 * marketing checkbox) by way of the same strings.
 *
 * `referral_status` comes back with the card but is not shown: "rejected"
 * and "flagged" are the shop's business, and the friend's card is theirs
 * either way.
 */

type Step =
  | { kind: "details" }
  | { kind: "code" }
  | { kind: "success"; result: ReferralJoinOut; card: CardPublic }
  | { kind: "gone" }
  | { kind: "upgradeRequired" };

const RESEND_SECONDS = 60;

export function ReferralJoin({
  token,
  page,
  deviceId,
}: {
  token: string;
  page: PublicCardPage;
  deviceId: string | null;
}) {
  const { t } = useTranslation();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [birthday, setBirthday] = useState("");
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [code, setCode] = useState("");
  const [step, setStep] = useState<Step>({ kind: "details" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  // While the wallet push is in flight, poll the public card until the pass
  // URL appears — the backend issues asynchronously on failure.
  const pollRef = useRef<number | null>(null);
  useEffect(() => {
    if (step.kind !== "success" || !step.result.wallet_issue_pending) return;
    pollRef.current = window.setInterval(async () => {
      try {
        const card = await getPublicCard(step.result.card_serial);
        if (card.wallet_pass_url) {
          setStep({
            kind: "success",
            result: {
              ...step.result,
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
    if (!isLikelyIlPhone(phone)) {
      setError(t("enroll.phoneInvalid"));
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await requestReferralOtp(token, phone.trim());
      setStep({ kind: "code" });
      setCode("");
      setResendIn(RESEND_SECONDS);
    } catch (err) {
      if (err instanceof ApiError && err.status === 404) setStep({ kind: "gone" });
      else if (err instanceof ApiError && err.code === "otp_throttled")
        setError(t("enroll.otpThrottled"));
      else if (err instanceof ApiError && err.code === "invalid_phone")
        setError(t("enroll.phoneInvalid"));
      else if (err instanceof ApiError && err.code === "upgrade_required")
        setStep({ kind: "upgradeRequired" });
      else setError(t("enroll.genericError"));
    } finally {
      setBusy(false);
    }
  }

  async function join(otpCode: string) {
    setError(null);
    setBusy(true);
    try {
      const result = await referralJoin(token, {
        phone: phone.trim(),
        otp_code: otpCode,
        display_name: toNameCase(displayName),
        birthday: birthday || undefined,
        marketing_opt_in: marketingOptIn,
        device_id: deviceId ?? undefined,
      });
      const card = await getPublicCard(result.card_serial);
      setStep({ kind: "success", result, card });
    } catch (err) {
      if (err instanceof ApiError && err.code === "otp_invalid") setError(t("enroll.otpInvalid"));
      else if (err instanceof ApiError && err.code === "upgrade_required")
        setStep({ kind: "upgradeRequired" });
      else if (err instanceof ApiError && err.status === 404) setStep({ kind: "gone" });
      else setError(t("enroll.genericError"));
    } finally {
      setBusy(false);
    }
  }

  if (step.kind === "gone") {
    return <p className="text-center font-body text-ink">{t("publicCard.notFound")}</p>;
  }
  if (step.kind === "upgradeRequired") {
    return <p className="text-center font-body text-ink">{t("enroll.upgradeRequired")}</p>;
  }

  if (step.kind === "success") {
    const { result, card } = step;
    return (
      <>
        <div className="flex flex-col items-center gap-2 text-center">
          <Eyebrow>{t("enroll.successEyebrow", { businessName: card.business_name })}</Eyebrow>
          <h1 className="text-2xl font-heading font-bold text-ink">
            {t("enroll.successTitle")}
          </h1>
        </div>
        <PassStage card={card} serial={result.card_serial} holderName={toNameCase(displayName)} />
        <div className="flex w-full flex-col items-center gap-4">
          <WalletAddButtons
            passUrl={result.wallet_pass_url}
            pending={result.wallet_issue_pending}
            linkClassName={ctaClasses("gradient", "lg", "w-full max-w-[300px]")}
          />
          {!result.wallet_pass_url && (
            <p className="max-w-[300px] text-center text-sm font-body text-ink-muted">
              {t("enroll.scanMeanwhile")}
            </p>
          )}
          <Link
            to={`/c/${result.card_serial}`}
            className={cn(
              "inline-flex min-h-[44px] items-center rounded-lg px-2 text-sm font-body text-ink-subtle underline hover:no-underline",
              focusRing,
            )}
          >
            {t("enroll.statusTitle")}
          </Link>
        </div>
      </>
    );
  }

  if (step.kind === "code") {
    return (
      <>
        <h1 className="text-center text-2xl font-heading font-bold text-ink">
          {t("enroll.codeTitle")}
        </h1>
        <p className="max-w-xs text-center text-sm font-body text-ink-muted">
          {t("enroll.codeSentTo", { phone })}
        </p>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void join(code.trim());
          }}
          className="flex w-full max-w-xs flex-col gap-4"
        >
          <Input
            label={t("enroll.codeLabel")}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
            dir="ltr"
            inputMode="numeric"
            autoComplete="one-time-code"
            autoFocus
            className="text-center font-mono text-lg tracking-[0.5em]"
          />
          {error && <p className="text-sm font-body text-danger">{error}</p>}
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
              onClick={() => void sendCode()}
              className={cn(
                "inline-flex min-h-[44px] items-center rounded-lg px-2 text-primary-text underline hover:no-underline",
                "disabled:text-ink-subtle disabled:no-underline disabled:opacity-100",
                focusRing,
              )}
            >
              {resendIn > 0 ? t("enroll.resendIn", { seconds: resendIn }) : t("enroll.resend")}
            </button>
          </div>
        </form>
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col items-center gap-2 text-center">
        <Eyebrow>{page.business_name}</Eyebrow>
        <h1 className="text-2xl font-heading font-bold text-ink">
          {page.referrer_display
            ? t("publicCard.join.invitedBy", { name: page.referrer_display })
            : t("publicCard.join.invited")}
        </h1>
        <p className="text-sm font-body text-ink-muted">
          {t("publicCard.card.reward", {
            stamps: page.stamps_required,
            reward: page.reward_description,
          })}
        </p>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void sendCode();
        }}
        className="flex w-full max-w-sm flex-col gap-5"
      >
        <Input
          label={t("enroll.nameLabel")}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          onBlur={() => setDisplayName((n) => toNameCase(n))}
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
        <details className="font-body text-xs leading-relaxed text-ink-subtle">
          <summary
            className={cn("cursor-pointer rounded px-1 py-0.5 underline hover:no-underline", focusRing)}
          >
            {t("enroll.privacySummary")}
          </summary>
          <p className="mt-2 whitespace-pre-line">{t("enroll.privacyNotice")}</p>
        </details>
        {error && <p className="text-sm font-body text-danger">{error}</p>}
        <button type="submit" disabled={busy} className={ctaClasses("gradient", "lg")}>
          {busy ? t("common.loading") : t("enroll.sendCodeCta")}
        </button>
      </form>
    </>
  );
}
