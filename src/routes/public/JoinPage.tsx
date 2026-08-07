import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useParams, Link } from "react-router-dom";
import { Button, Input } from "../../components/ui";
import { WalletCardPreview } from "../../components/wallet-card/WalletCardPreview";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { enroll, getPublicCard, type CardPublic, type EnrollOut } from "../../api/loyalty";
import { isLikelyIlPhone } from "../../lib/phone";
import { ApiError } from "../../api/errors";

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; enrollResult: EnrollOut; card: CardPublic }
  | { kind: "notFound" }
  | { kind: "upgradeRequired" }
  | { kind: "error" };

export function JoinPage() {
  const { t } = useTranslation();
  const { templateId } = useParams<{ templateId: string }>();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneError, setPhoneError] = useState<string | null>(null);
  const [state, setState] = useState<SubmitState>({ kind: "idle" });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!templateId) return;

    if (phone.trim() && !isLikelyIlPhone(phone)) {
      setPhoneError(t("enroll.phoneInvalid"));
      return;
    }
    setPhoneError(null);
    setState({ kind: "submitting" });

    try {
      const enrollResult = await enroll(templateId, {
        phone: phone.trim() || undefined,
        display_name: displayName.trim() || undefined,
      });
      const card = await getPublicCard(enrollResult.card_serial);
      setState({ kind: "success", enrollResult, card });
    } catch (err) {
      if (err instanceof ApiError && err.code === "upgrade_required") {
        setState({ kind: "upgradeRequired" });
      } else if (err instanceof ApiError && err.status === 404) {
        setState({ kind: "notFound" });
      } else {
        setState({ kind: "error" });
      }
    }
  }

  if (state.kind === "notFound") {
    return <CenteredMessage>{t("enroll.notFound")}</CenteredMessage>;
  }
  if (state.kind === "upgradeRequired") {
    return <CenteredMessage>{t("enroll.upgradeRequired")}</CenteredMessage>;
  }

  if (state.kind === "success") {
    const { enrollResult, card } = state;

    return (
      <div className="min-h-screen flex flex-col items-center gap-8 bg-white text-navy px-6 py-16 text-center">
        <h1 className="text-2xl">{t("enroll.statusTitle")}</h1>
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
          appleUrl={enrollResult.wallet_apple_url}
          googleUrl={enrollResult.wallet_google_url}
          pending={enrollResult.wallet_issue_pending}
        />
        <Link to={`/c/${enrollResult.card_serial}`} className="text-sm text-slate underline">
          {t("enroll.statusTitle")}
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-8 bg-white text-navy px-6 py-16">
      <h1 className="text-2xl text-center">{t("enroll.genericTitle")}</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full max-w-sm">
        <Input
          label={t("enroll.nameLabel")}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
        <Input
          label={t("enroll.phoneLabel")}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          dir="ltr"
          error={phoneError ?? undefined}
        />
        {state.kind === "error" && (
          <p className="text-sm text-red-600">{t("enroll.genericError")}</p>
        )}
        <Button type="submit" disabled={state.kind === "submitting"}>
          {t("enroll.submit")}
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
