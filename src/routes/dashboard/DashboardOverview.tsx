import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearchParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { ArrowRight, Cake, Copy, ScanLine, Send, UserRoundX } from "lucide-react";
import { CardPreview } from "../../components/card-studio/CardPreviews";
import { WalletAddButtons } from "../../components/wallet-actions/WalletAddButtons";
import { PunchMark } from "../../components/marketing/PunchMark";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import {
  GroupLabel,
  LitStage,
  Notice,
  Panel,
  PanelHeader,
  Tag,
} from "../../components/dashboard/primitives";
import { BriefBand, WorthDoing, type TodoRow } from "../../components/dashboard/Brief";
import { CardPunches } from "../../components/dashboard/CardPunches";
import { InstallApp } from "../../components/dashboard/InstallApp";
import { WeekLedger } from "../../components/dashboard/WeekLedger";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers, canManage, isOwner } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { designImageUrls, getTemplateDesign } from "../../api/designs";
import {
  listAllCustomers,
  previewCard,
  type CustomerListItem,
  type EnrollOut,
} from "../../api/loyalty";
import { getMessagingSummary, listAutomations } from "../../api/messaging";
import { fetchActivityWindow } from "./activityWindow";
import { BRIEF_DAYS, QUIET_DAYS, buildBrief } from "./overviewBrief";
import { buildEnrollUrl } from "../../lib/enrollUrl";
import { useWalletPass } from "../../hooks/useWalletPass";
import { cn } from "../../lib/cn";

const WEEK_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;
/** How far back the page reads. Two brief windows, so the last thirty days
 * have the thirty before them to be measured against — one walk serves the
 * verdict, its comparison, and the week ledger underneath it. */
const WINDOW_DAYS = BRIEF_DAYS * 2;
/** Which of `inactive_counts`' buckets the "worth doing" row reads. 30 is the
 * bucket the Messages page surfaces and the win-back rule's own default. */
const INACTIVE_BUCKET = "30";
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
  const { business, role } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  // A hire sees the counter and nothing else on this page: the week, the two
  // counts, and who is close to a reward. Everything below that is a setup
  // job whose endpoint would answer them 403 anyway.
  const manages = canManage(role);
  const owns = isOwner(role);
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

  // Its own key rather than the activity page's `["activity", id, "window",
  // period]`: same endpoint and the same walk, but a different window, and
  // sharing a cache entry would hand that page a month it did not ask for.
  //
  // This used to be a single 200-row request. `page_size` is silently capped
  // at 100, so "did I see the whole week" was answered by `100 < 200` — true
  // for every shop, however busy — and any shop past about seven stamps a
  // day was shown an under-reported week with no `+` on it and a delta
  // measured against a previous week that was half missing.
  const { data: activity } = useQuery({
    queryKey: ["activity", business?.id, "brief", WINDOW_DAYS],
    queryFn: () => {
      const midnight = new Date();
      midnight.setHours(0, 0, 0, 0);
      return fetchActivityWindow(
        business!.id!,
        midnight.getTime() - (WINDOW_DAYS - 1) * DAY_MS,
      );
    },
    enabled: !!business?.id && canEnroll,
    staleTime: 5_000,
  });

  const [previewResult, setPreviewResult] = useState<EnrollOut | null>(null);
  useEffect(() => {
    // Manager and up: the preview card is the business's own demo pass, and
    // minting one is a setup action the API scopes to the people who do
    // setup.
    if (business?.id && template?.id && manages) {
      previewCard(business.id, template.id).then(setPreviewResult);
    }
  }, [business?.id, template?.id, manages]);

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
    const items = activity?.items ?? [];
    // Calendar days, not a rolling 168 hours: the ledger draws one row per
    // day and the total above it has to be the sum of what it draws. It is
    // also the question an owner actually asks — "was Tuesday quiet?".
    const midnight = new Date();
    midnight.setHours(0, 0, 0, 0);
    const startOfToday = midnight.getTime();
    const windowStart = startOfToday - (WEEK_DAYS - 1) * DAY_MS;
    const prevStart = windowStart - WEEK_DAYS * DAY_MS;

    // A stamp gifted by a messaging rule is not a visit — keep it out of
    // the week, which is the owner's read on how busy the shop was.
    const visits = items.filter((e) => e.source !== "automation");

    const buckets = new Array<number>(WEEK_DAYS).fill(0);
    let prevWeek = 0;
    for (const event of visits) {
      const at = Date.parse(event.created_at);
      if (at >= windowStart) {
        const index = Math.floor((at - windowStart) / DAY_MS);
        if (index < WEEK_DAYS) buckets[index] += event.stamps;
      } else if (at >= prevStart) {
        prevWeek += event.stamps;
      }
    }

    // The walk reaches back a whole two brief windows — far past both of
    // these weeks — unless it hit its page guard. So there is exactly one
    // question left, and `truncated` is it. Saying so beats printing a
    // number we cannot stand behind.
    const capped = activity?.truncated ?? false;
    const prevKnown = !capped;

    const total = buckets.reduce((sum, n) => sum + n, 0);
    return {
      total,
      capped,
      // Nothing this week against nothing last week is not a comparison, it
      // is a shop that has not started yet — "same as last week" would be
      // true and useless. The empty rows already say it.
      delta: prevKnown && (total > 0 || prevWeek > 0) ? total - prevWeek : null,
      // Oldest first, so the bars run in the reading direction and today is
      // the one at the end. The same order `ActivityChart` and `buildBrief`
      // take — three charts on this page, one direction between them.
      days: buckets.map((stamps, i) => ({
        date: new Date(windowStart + i * DAY_MS),
        stamps,
      })),
    };
  }, [activity]);

  const all = useMemo(() => customers?.items ?? [], [customers]);

  // The owner's messaging rules + the month's sent count, for the one-line
  // state on the panel below (same keys the Messages page uses, so these are
  // cache reads after it). The count comes from the summary — the rules list
  // alone would miss broadcasts and disagree with the Messages page.
  const automationsQuery = useQuery({
    queryKey: ["automations", business?.id],
    queryFn: () => listAutomations(business!.id!),
    enabled: !!business?.id && canEnroll && manages,
    staleTime: 30_000,
  });
  const { data: messagingSummary } = useQuery({
    queryKey: ["messaging", "summary", business?.id],
    queryFn: () => getMessagingSummary(business!.id!),
    enabled: !!business?.id && canEnroll && manages,
    staleTime: 30_000,
  });
  const automations = automationsQuery.data;
  const activeRules = (automations ?? []).filter((a) => a.is_active).length;
  const sentThisMonth = messagingSummary?.sent_this_month ?? 0;

  const near = useMemo(
    () =>
      all
        .filter((c) => c.status !== "void" && c.stamp_count > 0)
        .sort((a, b) => remainingOf(a) - remainingOf(b) || b.stamp_count - a.stamp_count)
        .slice(0, NEAR_LIMIT),
    [all],
  );

  // The verdict and everything under it, off the two reads above. Nothing
  // here costs a request the page was not already making.
  const brief = useMemo(
    () =>
      buildBrief({
        activity: activity?.items ?? [],
        customers: all,
        now: Date.now(),
        truncated: activity?.truncated ?? false,
      }),
    [activity, all],
  );

  // What is worth the owner's morning: only rows with something in them, and
  // only rows this person can act on. A hire gets the quiet-till warning —
  // they are the one holding the scanner — and neither of the messaging
  // rows, whose endpoints would answer them 403.
  const todos = useMemo<TodoRow[]>(() => {
    const rows: TodoRow[] = [];

    // First, because it is the only row here that is closer to a fault than
    // to an opportunity — and a shop with no customers yet is not quiet, it
    // has not started.
    if (brief.quietDays !== null && brief.quietDays >= QUIET_DAYS && all.length > 0) {
      rows.push({
        key: "quiet",
        tone: "quiet",
        icon: <ScanLine size={17} />,
        body: t("dashboard.today.quiet", { count: brief.quietDays }),
        to: "/dashboard/scan",
        cta: t("dashboard.today.quietCta"),
      });
    }

    const inactive = messagingSummary?.inactive_counts?.[INACTIVE_BUCKET] ?? 0;
    if (manages && inactive > 0) {
      rows.push({
        key: "inactive",
        tone: "winback",
        icon: <UserRoundX size={17} />,
        body: t("dashboard.today.inactive", {
          count: inactive,
          days: Number(INACTIVE_BUCKET),
        }),
        // The same slug the Messages page's own recipe cards use, so this
        // opens the win-back rule already seeded rather than a blank one.
        to: "/dashboard/messages/automations/new?recipe=winback",
        cta: t("dashboard.today.inactiveCta"),
      });
    }

    const birthdays = messagingSummary?.birthdays_this_month ?? 0;
    if (manages && birthdays > 0) {
      rows.push({
        key: "birthday",
        tone: "birthday",
        icon: <Cake size={17} />,
        body: t("dashboard.today.birthday", { count: birthdays }),
        to: "/dashboard/messages/automations/new?recipe=birthday",
        cta: t("dashboard.today.birthdayCta"),
      });
    }

    return rows;
  }, [brief, all.length, messagingSummary, manages, t]);

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
          {/* The verdict first. Not stamps: a stamp counts a first-timer and
              a tenth-visit regular the same, and the thing this product was
              sold on — and the thing `calculator.ts` prices a year of it in —
              is people coming back. */}
          <BriefBand
            days={BRIEF_DAYS}
            returned={brief.returned}
            delta={brief.returnedDelta}
            capped={brief.capped}
            series={brief.days}
            readouts={[
              {
                label: t("dashboard.customers.stats.total"),
                value: brief.customers,
                hue: "roster",
              },
              {
                label: t("dashboard.brief.stats.joined"),
                value: brief.joined,
                hue: "growth",
              },
              {
                label: t("dashboard.brief.stats.visits"),
                value: brief.visits,
                hue: "activity",
                capped: brief.capped,
              },
              {
                label: t("dashboard.customers.stats.ready"),
                value: brief.ready,
                hue: "reward",
              },
            ]}
          />

          <WorthDoing rows={todos} />

          {/* The month says whether it is working; the week says how the
              shop is running. Both, in that order. */}
          <Panel className="p-5 sm:p-6">
            <PanelHeader title={t("dashboard.week.title")} />
            <div className="mt-4">
              <WeekLedger
                days={week.days}
                total={week.total}
                capped={week.capped}
                delta={week.delta}
                cardLength={template.stamps_required}
              />
            </div>
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

                        <Tag tone={left === 0 ? "reward" : "neutral"}>
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

          {/* Messages to customers: the one line of state and the two
              things you'd come here to do — send everyone a message on a
              slow day, or go and change the rules. One tap from the phone's
              first screen, which the More sheet is not. */}
          {manages && (
          <Panel className="p-5 sm:p-6">
            <PanelHeader
              title={t("messaging.overview.title")}
              action={
                <Link
                  to="/dashboard/messages"
                  className={cn(
                    "inline-flex min-h-[44px] items-center gap-1 rounded-lg text-sm font-semibold text-primary-text hover:underline",
                    focusRing,
                  )}
                >
                  {t("messaging.overview.all")}
                  <ArrowRight size={15} aria-hidden className="rtl:-scale-x-100" />
                </Link>
              }
            />
            <p className="mt-3 text-sm text-ink-muted">
              {automationsQuery.isPending
                ? t("common.loading")
                : automationsQuery.isError || activeRules === 0
                  ? t("messaging.overview.none")
                  : `${t("messaging.overview.active", { count: activeRules })} · ${t("messaging.overview.sentMonth", { count: sentThisMonth })}`}
            </p>
            <div className="mt-4">
              <Link to="/dashboard/messages/new" className={ctaClasses("secondary", "sm")}>
                <Send size={15} aria-hidden className="rtl:-scale-x-100" />
                {t("messaging.broadcast.cta")}
              </Link>
            </div>
          </Panel>
          )}
        </>
      ) : manages ? (
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
      ) : (
        // A hire on a business that hasn't activated yet: there is nothing
        // for them to do, and every step of the checklist above is a door
        // the API would close on them.
        <Panel className="p-5 sm:p-6">
          <PanelHeader title={t("dashboard.start.title")} hint={t("team.notReady")} />
        </Panel>
      )}

      {/* The counter kit: the objects that leave the screen. The QR stays lit
          at night because it has to be dark-on-light to scan. The pass does
          not — neither wallet draws it on white, and its colours are the
          owner's — so it is staged in a well, the way the studio stages it.

          Labelled, and after everything above it, because these are not more
          of the same: the panels above are today, these are the things set up
          once. The label is the nav's own word for them, so the page and the
          rail agree on what counts as setup.

          The QR leads. It is the one an owner reaches for at the counter with
          somebody standing there, where "try your card yourself" is a thing
          they do once and never again — and on a phone the pass panel is tall
          enough to bury whatever follows it. */}
      {/* A hire is not setting anything up — the QR below is the only thing
          in this section they can use, so the heading would name a group
          that, for them, does not exist. */}
      {manages && (
        <GroupLabel className="mt-2">{t("dashboard.groups.setup")}</GroupLabel>
      )}

      {/* Putting the app on the phone is setup by the nav's own definition:
          done once, then never thought about again. It renders nothing at
          all where it cannot be done, so it costs a desktop owner no room. */}
      <InstallApp />

      <div
        className={cn(
          "grid items-start gap-4 sm:gap-5",
          // Two columns only when there is a second panel to put in one.
          manages ? "lg:grid-cols-2" : "lg:max-w-md",
        )}
      >
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
            owns && (
              <Link
                to="/dashboard/billing"
                className={ctaClasses("primary", "sm", "self-start")}
              >
                {t("dashboard.qr.activateCta")}
              </Link>
            )
          )}
        </Panel>

        {manages && (
        <Panel className="flex min-w-0 flex-col gap-4 p-4 sm:p-6">
          <PanelHeader
            title={t("dashboard.preview.title")}
            hint={t("dashboard.preview.body")}
          />
          {design && (
            <>
              {/* The well the pass sits in — the studio's, so the same card
                  is staged the same way on both screens. The pass is a fixed
                  300px by the wallets' own spec, and at 375px that leaves no
                  room for a margin either side, so on a phone the well runs
                  to the panel's edges rather than the pass being cropped or
                  scaled; it shows above and below instead. */}
              <div className="flex flex-col items-center rounded-xl bg-background px-0 py-5 sm:px-6">
                <CardPreview
                  businessName={business?.name ?? ""}
                  cardName={template.name}
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
              </div>
              {/* Getting the pass onto your own phone is ours to offer, not
                  part of the card — so it sits on the panel rather than in
                  the well. The navy pill carries its own edge for the night
                  ground; see WalletAddButtons. */}
              <div className="flex justify-center">
                <WalletAddButtons
                  passUrl={ownerPass.passUrl}
                  pending={ownerPass.pending}
                  slow={ownerPass.slow}
                  onRetry={ownerPass.retry}
                />
              </div>
            </>
          )}
        </Panel>
        )}
      </div>
    </div>
  );
}
