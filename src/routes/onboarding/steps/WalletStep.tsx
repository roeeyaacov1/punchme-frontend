import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Clock, LoaderCircle } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { listTemplates, patchTemplate, type CardTemplate } from "../../../api/businesses";
import { getTemplateDesign, type DesignOut } from "../../../api/designs";
import { previewCard } from "../../../api/loyalty";
import { useBusiness } from "../../../business/useBusiness";
import { Button, LinkButton, LitPanel, Notice, useReducedMotion } from "../../../components/kit";
import { StepHeading, StepShell } from "../../../components/onboarding/StepShell";
import { deviceWallet } from "../../public/wallet";
import { WalletButton } from "../../public/WalletButton";
import { CardStage } from "../CardStage";
import { useOnboardingDraft } from "../useOnboardingDraft";
import { usePublishedPreview } from "../usePublishedPreview";

type Phase = "resolving" | "syncing" | "issuing" | "ready" | "failed" | "slow";

const POLL_MS = 3000;
/** The design sync is ~75 provider calls for a 10-stamp card; three minutes
 * before we stop promising "about a minute". */
const SYNC_SLOW_MS = 180_000;
/** Issuing the owner's own pass, once the design exists. */
const ISSUE_SLOW_MS = 60_000;

/**
 * The card in the owner's own wallet: the fourth stop, and the moment. The
 * card exists on the server now. This step waits for the wallet provider to
 * finish building it (asynchronous, slow), then issues the owner's own pass:
 * on a phone, the coral button named by its wallet; on a computer, the QR
 * code first, so the phone can take it from there.
 *
 * While it waits, one line in words says what is happening, its busy mark
 * holding still under reduced motion, and there is one way on at a time:
 * "Skip for now" while the pass isn't ready (the draft is cleared, as
 * before, and it leads to going live), "Continue" once it is.
 *
 * "Synced" means synced *since we saved*: after Back-and-change the row still
 * carries last time's timestamp, and trusting it would show last time's PNGs.
 */
export function WalletStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const reduced = useReducedMotion();
  const { business, isLoading: businessLoading } = useBusiness();
  const { draft, update, clear, artUrl } = useOnboardingDraft();

  const businessId = business?.id ?? null;
  const committed = draft.committed;

  const templatesQuery = useQuery({
    queryKey: ["templates", businessId],
    queryFn: () => listTemplates(businessId!),
    enabled: !!businessId,
  });
  const template: CardTemplate | undefined = useMemo(() => {
    const list = templatesQuery.data;
    if (!list) return undefined;
    return list.find((candidate) => candidate.id === committed?.templateId) ?? list[0];
  }, [templatesQuery.data, committed?.templateId]);
  const templateId = template?.id ?? null;

  const [phase, setPhase] = useState<Phase>("resolving");
  const [slowFrom, setSlowFrom] = useState<"syncing" | "issuing">("syncing");
  const phaseStartedAt = useRef(Date.now());
  const [baselines, setBaselines] = useState({
    synced: committed?.syncBaseline ?? null,
    error: committed?.errorBaseline ?? "",
  });

  function enter(next: Phase) {
    phaseStartedAt.current = Date.now();
    setPhase(next);
  }

  // No business at all: the account step never finished. Business but no
  // template: same, one call later. Both go back there rather than to the
  // index, which would only send them here again.
  useEffect(() => {
    if (businessLoading || templatesQuery.isLoading) return;
    if (!businessId || (templatesQuery.data && templatesQuery.data.length === 0)) {
      navigate("/onboarding/account", { replace: true });
    }
  }, [businessLoading, templatesQuery.isLoading, templatesQuery.data, businessId, navigate]);

  useEffect(() => {
    if (phase === "resolving" && templateId) enter("syncing");
  }, [templateId, phase]);

  const syncedSinceSave = (design: DesignOut | undefined) =>
    !!design?.sync.synced_at && design.sync.synced_at !== baselines.synced;
  const failedSinceSave = (design: DesignOut | undefined) =>
    !!design?.sync.error && design.sync.error !== baselines.error;

  const designQuery = useQuery({
    queryKey: ["design", templateId],
    queryFn: () => getTemplateDesign(businessId!, templateId!),
    enabled: !!businessId && !!templateId && phase !== "resolving",
    refetchInterval: (query) => {
      const design = query.state.data;
      if (syncedSinceSave(design) || failedSinceSave(design)) return false;
      return phase === "syncing" || (phase === "slow" && slowFrom === "syncing") ? POLL_MS : false;
    },
    // The owner may well switch tabs while waiting; the card should be
    // ready when they come back, not start waiting then.
    refetchIntervalInBackground: true,
  });
  const design = designQuery.data;

  useEffect(() => {
    if (phase !== "syncing" && !(phase === "slow" && slowFrom === "syncing")) return;
    if (failedSinceSave(design)) enter("failed");
    else if (syncedSinceSave(design)) enter("issuing");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [design, phase, slowFrom, baselines]);

  const passQuery = useQuery({
    queryKey: ["ownerPass", templateId],
    queryFn: () => previewCard(businessId!, templateId!),
    enabled:
      !!businessId &&
      !!templateId &&
      (phase === "issuing" || phase === "ready" || (phase === "slow" && slowFrom === "issuing")),
    refetchInterval: (query) => (query.state.data?.wallet_pass_url ? false : POLL_MS),
    refetchIntervalInBackground: true,
  });
  const passUrl = passQuery.data?.wallet_pass_url ?? null;

  // A cached pass URL from an earlier visit must not skip the wait for the
  // new sync — the URL doesn't change, the card behind it does.
  useEffect(() => {
    const issuing = phase === "issuing" || (phase === "slow" && slowFrom === "issuing");
    if (passUrl && issuing) enter("ready");
  }, [passUrl, phase, slowFrom]);

  // The slow clock — one check a second, announced only when it flips.
  useEffect(() => {
    if (phase !== "syncing" && phase !== "issuing") return;
    const limit = phase === "syncing" ? SYNC_SLOW_MS : ISSUE_SLOW_MS;
    const timer = window.setInterval(() => {
      if (Date.now() - phaseStartedAt.current > limit) {
        setSlowFrom(phase);
        enter("slow");
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [phase]);

  // Once the real design exists (synced since we saved), the card is the
  // published one, as soon as its pictures load; the draft's until then.
  const published = usePublishedPreview(
    syncedSinceSave(design) ? design : undefined,
    business,
    artUrl,
    template?.name,
  );

  async function retrySync() {
    if (!businessId || !templateId) return;
    try {
      const patched = await patchTemplate(businessId, templateId, {});
      const next = {
        synced: patched.design_synced_at ?? baselines.synced,
        error: design?.sync.error ?? "",
      };
      setBaselines(next);
      if (committed) {
        update({ committed: { ...committed, syncBaseline: next.synced, errorBaseline: next.error } });
      }
      await queryClient.invalidateQueries({ queryKey: ["design", templateId] });
      enter("syncing");
    } catch {
      enter("failed");
    }
  }

  function checkAgain() {
    enter(slowFrom);
    void queryClient.invalidateQueries({
      queryKey: slowFrom === "syncing" ? ["design", templateId] : ["ownerPass", templateId],
    });
  }

  /** Skipping while the pass isn't ready: the draft has done its job (the
   * card is saved), and going live is still the next stop. */
  function skip() {
    clear();
    navigate("/onboarding/billing");
  }

  const ready = phase === "ready" && !!passUrl;
  const onPhone = deviceWallet() !== "other";

  let status: ReactNode;
  if (phase === "failed") {
    status = (
      <Notice
        tone="warn"
        role="alert"
        action={
          <Button variant="secondary" onClick={() => void retrySync()}>
            {t("onboarding.wallet.retry")}
          </Button>
        }
      >
        {t("onboarding.wallet.failed")}
      </Notice>
    );
  } else if (phase === "slow") {
    status = (
      <div className="flex flex-col items-start gap-3">
        <p role="status" className="type-body flex items-start gap-2 text-ink">
          <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-ink-muted" />
          <span>{t("onboarding.wallet.slow")}</span>
        </p>
        <Button variant="secondary" onClick={checkAgain}>
          {t("onboarding.wallet.checkAgain")}
        </Button>
      </div>
    );
  } else if (!ready) {
    status = (
      <p role="status" className="type-body flex items-start gap-2 text-ink">
        <LoaderCircle aria-hidden className={reduced ? "mt-0.5 size-5 shrink-0" : "mt-0.5 size-5 shrink-0 animate-spin"} />
        <span>{phase === "issuing" ? t("onboarding.wallet.issuing") : t("onboarding.wallet.preparing")}</span>
      </p>
    );
  }

  return (
    <StepShell
      heading={<StepHeading title={t("onboarding.wallet.title")} lead={t("onboarding.wallet.subtitle")} />}
      card={<CardStage preview={published ?? undefined} />}
    >
      {status}
      {/* The owner's own pass, ready: it lights on as it arrives, once. */}
      {ready &&
        (onPhone ? (
          <div className={reduced ? "animate-gentle-in" : "animate-lights-on"}>
            <WalletButton href={passUrl} />
          </div>
        ) : (
          <LitPanel light="lit" arrive className="flex flex-col items-center gap-4 p-5 sm:flex-row sm:items-center">
            <span className="shrink-0 rounded-field bg-white p-3">
              <QRCodeSVG value={passUrl} size={144} level="M" />
            </span>
            <span className="flex flex-col items-center gap-3 sm:items-start">
              <span className="type-body text-pretty text-center text-ink sm:text-start">
                {t("onboarding.wallet.scanHint")}
              </span>
              <LinkButton href={passUrl} variant="secondary">
                {t("wallet.addToWallet")}
              </LinkButton>
            </span>
          </LitPanel>
        ))}
      <div className="flex flex-col items-start">
        {ready ? (
          <Button
            variant="secondary"
            size="lg"
            onClick={() => navigate("/onboarding/billing")}
            iconEnd={<ArrowRight aria-hidden className="rtl:-scale-x-100" />}
            className="w-full"
          >
            {t("onboarding.wallet.continue")}
          </Button>
        ) : (
          <Button variant="quiet" onClick={skip} className="-ms-5">
            {t("onboarding.wallet.skip")}
          </Button>
        )}
      </div>
    </StepShell>
  );
}
