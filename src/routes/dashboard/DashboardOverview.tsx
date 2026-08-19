import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, Copy } from "lucide-react";
import { CardPreview } from "../../components/card-studio/CardPreviews";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { PunchMark } from "../../components/marketing/PunchMark";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import {
  LitStage,
  Notice,
  Panel,
  PanelHeader,
  Tag,
} from "../../components/dashboard/primitives";
import { CardPunches } from "../../components/dashboard/CardPunches";
import { WeekPunches } from "../../components/dashboard/WeekPunches";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { designImageUrls, getTemplateDesign } from "../../api/designs";
import {
  listActivity,
  listAllCustomers,
  previewCard,
  type CustomerListItem,
  type EnrollOut,
} from "../../api/loyalty";
import { buildEnrollUrl } from "../../lib/enrollUrl";
import { useWalletPass } from "../../hooks/useWalletPass";
import { cn } from "../../lib/cn";

const WEEK_DAYS = 7;
/** One request deep enough to cover a week for any shop this product is
 * priced for. If a week's stamps ever fill it, the count is shown with a `+`
 * rather than quietly under-reporting — see `capped` below. */
const WEEK_SAMPLE = 200;
/** How many people the counter panel names. More than this and it stops
 * being "who should I look out for" and becomes the customers table. */
const NEAR_LIMIT = 5;
/** A card longer than this is a progress figure, not a row of marks. */
const PUNCHABLE_CARD = 10;

function remainingOf(c: CustomerListItem): number {
  return Math.max(0, c.stamps_required - c.stamp_count);
}

export function DashboardOverview() {
  const { t } = useTranslation();
  const { business } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  const [searchParams] = useSearchParams();
  const justActivated = searchParams.get("activated") === "1";

  const { data: templates, isLoading: isLoadingTemplates } = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates?.[0];

  // The effective design doc — what the wallet actually renders, so the
  // preview here matches the Card Studio and the customer's real pass.
  const { data: design } = useQuery({
    queryKey: ["design", template?.id],
    queryFn: () => getTemplateDesign(business!.id!, template!.id!),
    enabled: !!business?.id && !!template?.id,
  });

  // The two reads behind "is it working". Both are off on the free plan,
  // where there are no real customers to count and the page is a setup
  // checklist instead.
  const { data: customers } = useQuery({
    queryKey: ["customers", "all", business?.id],
    queryFn: () => listAllCustomers(business!.id!),
    enabled: !!business?.id && canEnroll,
    staleTime: 5_000,
  });

  // Its own key rather than the activity page's `["activity", id, page]`:
  // same endpoint, different page size, and sharing a cache entry between
  // the two would hand that page 200 rows and break its paging.
  const { data: recent } = useQuery({
    queryKey: ["activity", business?.id, "recent", WEEK_SAMPLE],
    queryFn: () => listActivity(business!.id!, 1, WEEK_SAMPLE),
    enabled: !!business?.id && canEnroll,
    staleTime: 5_000,
  });

  const [previewResult, setPreviewResult] = useState<EnrollOut | null>(null);
  useEffect(() => {
    if (business?.id && template?.id) {
      previewCard(business.id, template.id).then(setPreviewResult);
    }
  }, [business?.id, template?.id]);

  // Issued asynchronously — poll until the pass URL lands.
  const ownerPass = useWalletPass(previewResult);

  const [copied, setCopied] = useState(false);
  async function handleCopyLink() {
    if (!template?.id) return;
    await navigator.clipboard.writeText(buildEnrollUrl(template.id));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const week = useMemo(() => {
    const items = recent?.items ?? [];
    const cutoff = Date.now() - WEEK_DAYS * 24 * 60 * 60 * 1000;
    const inWindow = items.filter((e) => Date.parse(e.created_at) >= cutoff);
    return {
      stamps: inWindow.reduce((sum, e) => sum + e.stamps, 0),
      // Every row we asked for came back and the oldest of them is still
      // inside the week, so there is more we did not see.
      capped: items.length >= WEEK_SAMPLE && inWindow.length === items.length,
    };
  }, [recent]);

  const all = useMemo(() => customers?.items ?? [], [customers]);

  const readyCount = useMemo(
    () =>
      all.filter(
        (c) => c.status !== "void" && c.stamps_required > 0 && remainingOf(c) === 0,
      ).length,
    [all],
  );

  const near = useMemo(
    () =>
      all
        .filter((c) => c.status !== "void" && c.stamp_count > 0)
        .sort((a, b) => remainingOf(a) - remainingOf(b) || b.stamp_count - a.stamp_count)
        .slice(0, NEAR_LIMIT),
    [all],
  );

  const images = designImageUrls(design);

  if (!template) {
    return isLoadingTemplates ? (
      <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>
    ) : null;
  }

  const enrollUrl = buildEnrollUrl(template.id!);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <h1 className="t-h3 text-ink">{t("dashboard.nav.overview")}</h1>

      {justActivated && canEnroll && (
        <Notice tone="ok">{t("billing.success.done")}</Notice>
      )}

      {canEnroll ? (
        <>
          <Panel className="p-5 sm:p-6">
            <PanelHeader title={t("dashboard.week.title")} />
            <div className="mt-4">
              <WeekPunches
                stamps={week.stamps}
                capped={week.capped}
                cardLength={template.stamps_required}
              />
            </div>

            {/* The two standing counts, kept small: the week above is the
                thing that changes, and these are the context for it. */}
            <dl className="mt-6 flex flex-wrap gap-x-8 gap-y-3 border-t border-border pt-4">
              <div>
                <dt className="text-xs text-ink-subtle">
                  {t("dashboard.customers.stats.total")}
                </dt>
                <dd className="font-heading text-xl font-bold tabular-nums text-ink">
                  {all.length}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-ink-subtle">
                  {t("dashboard.customers.stats.ready")}
                </dt>
                <dd
                  className={cn(
                    "font-heading text-xl font-bold tabular-nums",
                    readyCount > 0 ? "text-primary-text" : "text-ink",
                  )}
                >
                  {readyCount}
                </dd>
              </div>
            </dl>
          </Panel>

          <Panel className="p-5 sm:p-6">
            <PanelHeader
              title={t("dashboard.near.title")}
              action={
                <Link
                  to="/dashboard/customers"
                  className={cn(
                    "inline-flex min-h-[44px] items-center gap-1 rounded-lg text-sm font-semibold text-primary-text hover:underline",
                    focusRing,
                  )}
                >
                  {t("dashboard.near.all")}
                  <ArrowRight size={15} aria-hidden className="rtl:-scale-x-100" />
                </Link>
              }
            />

            {near.length === 0 ? (
              <p className="mt-3 text-sm text-ink-muted">
                {t("dashboard.near.empty")}
              </p>
            ) : (
              <ul className="mt-4 flex flex-col divide-y divide-border">
                {near.map((c) => {
                  const left = remainingOf(c);
                  return (
                    // On a phone the name gets its own line. Sharing one row
                    // with eight punch marks and a status left it about two
                    // characters wide, which is worse than no name at all —
                    // and the name is the whole point of this panel.
                    <li
                      key={c.card_id}
                      className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4"
                    >
                      <span className="truncate font-medium text-ink sm:min-w-0 sm:flex-1">
                        {c.customer_display_name || "—"}
                      </span>

                      <div className="flex items-center justify-between gap-3 sm:justify-end">
                        <CardPunches
                          filled={c.stamp_count}
                          total={c.stamps_required}
                          size={12}
                          maxMarks={PUNCHABLE_CARD}
                        />

                        <Tag tone={left === 0 ? "accent" : "neutral"}>
                          {left === 0
                            ? t("dashboard.customers.status.ready")
                            : t("dashboard.near.toGo", { count: left })}
                        </Tag>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>
        </>
      ) : (
        <Panel className="p-5 sm:p-6">
          <PanelHeader title={t("dashboard.start.title")} />
          {/* Numbered, because this genuinely is an order: there is nothing
              to print until the card exists, and nothing for a printed code
              to do until the subscription is live. The numerals sit in the
              same punch the wizard counts steps with. */}
          <ol className="mt-5 flex flex-col gap-4">
            {(
              [
                { n: 1, body: "designed", to: "/dashboard/design", nav: "design" },
                { n: 2, body: "print", to: "/dashboard/standee", nav: "standee" },
                { n: 3, body: "activate", to: "/dashboard/billing", nav: "billing" },
              ] as const
            ).map((step) => (
              <li key={step.n} className="flex items-start gap-3">
                <PunchMark state="stamped" size={22} className="mt-0.5">
                  {step.n}
                </PunchMark>
                <div className="min-w-0">
                  <p className="text-ink">{t(`dashboard.start.${step.body}`)}</p>
                  <Link
                    to={step.to}
                    className={cn(
                      "mt-1 inline-flex min-h-[36px] items-center gap-1 rounded-lg text-sm font-semibold text-primary-text hover:underline",
                      focusRing,
                    )}
                  >
                    {t(`dashboard.nav.${step.nav}`)}
                    <ArrowRight size={15} aria-hidden className="rtl:-scale-x-100" />
                  </Link>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      {/* The counter kit: the three objects that leave the screen. All of
          them stay lit at night — a QR code has to be dark-on-light to scan,
          and the pass is drawn on white by both wallets. */}
      <div className="grid items-start gap-4 sm:gap-5 lg:grid-cols-2">
        <Panel className="flex min-w-0 flex-col gap-4 p-4 sm:p-6">
          <PanelHeader
            title={t("dashboard.preview.title")}
            hint={t("dashboard.preview.body")}
          />
          {/* The pass is a fixed 300px by the wallets' own spec, and at 375px
              that leaves no room for a lit border either side — so on a phone
              the surface runs to the panel's edges instead of the pass being
              cropped or scaled. */}
          {design && (
            <LitStage
              className="px-0 py-5 sm:px-6"
              innerClassName="flex flex-col items-center"
            >
              <CardPreview
                businessName={business?.name ?? ""}
                stampsRequired={template.stamps_required}
                currentStamps={previewResult?.stamp_count ?? 0}
                rewardDescription={template.reward_description}
                backgroundColor={template.background_color}
                foregroundColor={template.foreground_color}
                labelColor={template.label_color}
                design={design.design}
                logoUrl={images.logo ?? template.logo_url ?? undefined}
                appleLogoUrl={images.apple_logo}
                stripBaseUrl={images.strip_base}
              />
              <div className="mt-5 flex justify-center">
                <WalletAddButtons
                  passUrl={ownerPass.passUrl}
                  pending={ownerPass.pending}
                  slow={ownerPass.slow}
                  onRetry={ownerPass.retry}
                />
              </div>
            </LitStage>
          )}
        </Panel>

        <Panel className="flex min-w-0 flex-col gap-4 p-5 sm:p-6">
          <PanelHeader title={t("dashboard.qr.title")} />
          {canEnroll ? (
            <>
              <LitStage innerClassName="flex justify-center">
                <div dir="ltr">
                  <QRCodeSVG value={enrollUrl} size={160} />
                </div>
              </LitStage>
              <button
                type="button"
                onClick={handleCopyLink}
                className={ctaClasses("secondary", "sm", "self-center")}
              >
                <Copy size={15} aria-hidden />
                {copied ? t("common.copied") : t("common.copyLink")}
              </button>
            </>
          ) : (
            <Link
              to="/dashboard/billing"
              className={ctaClasses("primary", "sm", "self-start")}
            >
              {t("dashboard.qr.activateCta")}
            </Link>
          )}
        </Panel>
      </div>
    </div>
  );
}
