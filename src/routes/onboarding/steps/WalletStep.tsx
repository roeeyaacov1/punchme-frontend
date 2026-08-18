import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { QRCodeSVG } from "qrcode.react";
import { listTemplates, patchTemplate, type CardTemplate } from "../../../api/businesses";
import { getTemplateDesign, type DesignOut } from "../../../api/designs";
import { previewCard } from "../../../api/loyalty";
import { useBusiness } from "../../../business/useBusiness";
import { StepShell } from "../../../components/onboarding/StepShell";
import { ctaClasses, focusRing } from "../../../components/marketing/primitives";
import { cn } from "../../../lib/cn";
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
 * The card exists on the server now. This step waits for the wallet
 * provider to finish building it (asynchronous, slow), then issues the
 * owner's own pass and hands them the add-to-wallet link — and, on a
 * computer, a QR code so the phone can take it from here.
 *
 * "Synced" means synced *since we saved*: after Back-and-change the row still
 * carries last time's timestamp, and trusting it would show last time's PNGs.
 */
export function WalletStep() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { business, isLoading: businessLoading } = useBusiness();
  const { draft, update, clear, setPreviewOverride, artUrl } = useOnboardingDraft();

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

  // Once the real design exists (synced since we saved), the phone shows it.
  // Cleared on unmount so a walk back to the colour steps sees the live
  // draft again.
  const published = usePublishedPreview(
    syncedSinceSave(design) ? design : undefined,
    business,
    artUrl,
  );
  useEffect(() => {
    if (published) setPreviewOverride(published);
  }, [published, setPreviewOverride]);
  useEffect(() => () => setPreviewOverride(null), [setPreviewOverride]);

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

  function finish(to: string) {
    if (to === "/dashboard") clear();
    navigate(to);
  }

  const status =
    phase === "ready"
      ? t("onboarding.wallet.ready")
      : phase === "issuing"
        ? t("onboarding.wallet.issuing")
        : phase === "failed"
          ? t("onboarding.wallet.failed")
          : phase === "slow"
            ? t("onboarding.wallet.slow")
            : t("onboarding.wallet.preparing");

  return (
    <StepShell
      title={t("onboarding.wallet.title")}
      subtitle={t("onboarding.wallet.subtitle")}
      hideNext
      footer={
        <button
          type="button"
          onClick={() => finish("/dashboard")}
          className={cn("self-center text-sm text-ink-muted underline underline-offset-2 hover:text-ink", focusRing)}
        >
          {t("onboarding.wallet.skip")}
        </button>
      }
    >
      <div
        role="status"
        aria-live="polite"
        className={cn(
          "rounded-xl border px-4 py-3 text-sm",
          phase === "failed"
            ? "border-red-200 bg-red-50 text-red-800"
            : phase === "ready"
              ? "border-primary/40 bg-primary/10 text-ink"
              : "border-border bg-background/60 text-ink-muted",
        )}
      >
        <p className={cn("font-medium", phase !== "ready" && phase !== "failed" && "animate-pulse")}>{status}</p>
        {(phase === "syncing" || phase === "resolving") && (
          <p className="mt-1 text-ink-subtle">{t("onboarding.wallet.preparingHint")}</p>
        )}
      </div>

      {phase === "failed" && (
        <button type="button" onClick={retrySync} className={ctaClasses("secondary", "lg", "w-full")}>
          {t("onboarding.wallet.retry")}
        </button>
      )}

      {phase === "slow" && (
        <button type="button" onClick={checkAgain} className={ctaClasses("secondary", "lg", "w-full")}>
          {t("onboarding.wallet.checkAgain")}
        </button>
      )}

      {passUrl && (
        <div className="flex flex-col gap-4">
          <a href={passUrl} className={ctaClasses("primary", "lg", "w-full")}>
            {t("wallet.addToWallet")}
          </a>
          <div className="hidden items-center gap-4 rounded-xl border border-border bg-surface p-3 sm:flex">
            <span className="shrink-0 rounded-lg bg-white p-1.5">
              <QRCodeSVG value={passUrl} size={112} level="M" />
            </span>
            <p className="text-sm text-ink-muted">{t("onboarding.wallet.scanHint")}</p>
          </div>
        </div>
      )}

      {(phase === "ready" || phase === "slow") && (
        <button
          type="button"
          onClick={() => finish("/onboarding/billing")}
          className={ctaClasses(passUrl ? "secondary" : "primary", "lg", "w-full")}
        >
          {t("onboarding.wallet.continue")}
        </button>
      )}
    </StepShell>
  );
}
