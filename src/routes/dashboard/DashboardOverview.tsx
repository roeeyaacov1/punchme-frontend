import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { TrendingUp } from "lucide-react";
import { LinkButton, LitPanel, Notice, Skeleton } from "../../components/kit";
import { DayChart } from "../../components/dashboard/DayChart";
import { InstallApp } from "../../components/dashboard/InstallApp";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
import { StatTile, TileLink } from "../../components/dashboard/StatTile";
import { WeekLedger } from "../../components/dashboard/WeekLedger";
import { useBusiness } from "../../business/useBusiness";
import { canEnrollRealCustomers, canManage } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { getTemplateDesign } from "../../api/designs";
import { listAllCustomers, previewCard, type EnrollOut } from "../../api/loyalty";
import { buildEnrollUrl } from "../../lib/enrollUrl";
import { cn } from "../../lib/cn";
import { useLightboxPage } from "../../theme/lightboxPage";
import { fetchActivityWindow } from "./activityWindow";
import { startOfDay } from "./activityFilters";
import { formatCount, relativeDay, shortDate, weekdayDate } from "./format";
import { BRIEF_DAYS, QUIET_DAYS, buildBrief } from "./overviewBrief";
import { FreeLead } from "./overview/FreeLead";
import { JoinQr, QrCode } from "./overview/JoinQr";
import { OwnPass } from "./overview/OwnPass";

/** How far back the page reads: two windows, so the last thirty days have the
 * thirty before them to be measured against. One walk serves the tiles, the
 * month, the week and its comparison. */
const WINDOW_DAYS = BRIEF_DAYS * 2;

/**
 * The page the installed app opens on: is it working, and what happened.
 *
 * Stat tiles over a chart (Roee's pick, from Impeccable's roll): who came
 * back in 30 days, on the band's light, then the customers, the new ones and
 * the rewards waiting, each a door into Customers. Then the month's people a
 * day, the week, and what customers see. Every figure is printed only once
 * the reads that make it have settled, a floor says "at least" in words, and
 * a comparison that can't be made says so.
 *
 * On Free none of the Pro reads runs: the lead is the activation panel, or
 * one true line for a hire.
 */
export function DashboardOverview() {
  useLightboxPage();
  const { t, i18n } = useTranslation();
  const language = i18n.resolvedLanguage;
  const { business, role } = useBusiness();
  const canEnroll = canEnrollRealCustomers(business);
  // A hire sees the counter: the figures, the week and the join QR. The
  // owner's pass is a setup object whose call answers staff 403.
  const manages = canManage(role);
  const [params] = useSearchParams();
  const justActivated = params.get("activated") === "1";

  const templates = useQuery({
    queryKey: ["templates", business?.id],
    queryFn: () => listTemplates(business!.id!),
    enabled: !!business?.id,
  });
  const template = templates.data?.[0];

  // What the wallet actually renders, so the pass here matches the studio.
  const { data: design } = useQuery({
    queryKey: ["design", template?.id],
    queryFn: () => getTemplateDesign(business!.id!, template!.id!),
    enabled: !!business?.id && !!template?.id,
  });

  const roster = useQuery({
    queryKey: ["customers", "all", business?.id],
    queryFn: () => listAllCustomers(business!.id!),
    enabled: !!business?.id && canEnroll,
    staleTime: 5_000,
  });

  // Its own key rather than Activity's: the same walk over a different
  // window, which sharing a cache entry would hand that page by mistake.
  const activity = useQuery({
    queryKey: ["activity", business?.id, "brief", WINDOW_DAYS],
    queryFn: () => {
      const since = new Date(startOfDay(Date.now()));
      since.setDate(since.getDate() - (WINDOW_DAYS - 1));
      return fetchActivityWindow(business!.id!, since.getTime());
    },
    enabled: !!business?.id && canEnroll,
    staleTime: 5_000,
  });

  // Manager and up: the business's own pass, minted once, then polled until
  // the wallet has it (`useWalletPass`, inside `OwnPass`).
  const [preview, setPreview] = useState<EnrollOut | null>(null);
  useEffect(() => {
    if (!business?.id || !template?.id || !manages) return;
    let live = true;
    previewCard(business.id, template.id)
      .then((out) => live && setPreview(out))
      .catch(() => {
        // The stage still shows the card; only the add link waits.
      });
    return () => {
      live = false;
    };
  }, [business?.id, template?.id, manages]);

  const brief = useMemo(
    () =>
      buildBrief({
        activity: activity.data?.items ?? [],
        customers: roster.data?.items ?? [],
        now: Date.now(),
        truncated: activity.data?.truncated ?? false,
        rosterTruncated: roster.data?.truncated ?? false,
      }),
    [activity.data, roster.data],
  );

  const settled = roster.data && activity.data;
  // The tiles arrive by light when they replace the placeholders the owner
  // was watching: once, as the reads land. Figures already in the cache, a
  // refetch and a return to the page show them as they are.
  const [watched, setWatched] = useState(false);
  if (!settled && !watched) setWatched(true);

  const title = (
    <h1 className="type-title text-ink">{t("dashboard.nav.overview")}</h1>
  );

  if (!template) {
    // Every part of the page hangs off the card, so a card that didn't
    // load is said in its place rather than left as a bare title.
    const held = templates.fetchStatus === "paused";
    return (
      <div className="flex flex-col gap-5">
        {title}
        {templates.isError || held ? (
          <ReadProblem
            title={t("dashboard.overview.loadFailed")}
            error={templates.error}
            paused={held}
            onRetry={() => void templates.refetch()}
          />
        ) : (
          templates.isPending && <Skeleton className="h-40 w-full rounded-panel" />
        )}
      </div>
    );
  }

  const n = (value: number) => formatCount(value, language);
  const facing = manages && (
    <h2 id="facing-title" className="type-card-title text-ink">
      {t("dashboard.groups.facing")}
    </h2>
  );

  if (!canEnroll) {
    return (
      <div className="flex flex-col gap-5">
        {title}
        <FreeLead role={role ?? "owner"} />
        {manages && design !== undefined && (
          <OwnPass businessName={business?.name ?? ""} template={template} design={design} preview={preview} trial className="max-w-xl" />
        )}
        <InstallApp />
      </div>
    );
  }

  const failed = !settled && (roster.isError || activity.isError);
  // Offline before the reads landed: they wait for the connection rather
  // than fail, so the page says so instead of standing on placeholders.
  const held = !settled && !failed && (roster.fetchStatus === "paused" || activity.fetchStatus === "paused");
  const empty = roster.data && roster.data.items.length === 0;

  // The label stands over the placeholders as well as the tiles, so the
  // tiles light up where the placeholders stood rather than a line lower.
  const tiles = (content: ReactNode) => (
    <section aria-labelledby="tiles-title" className="flex flex-col gap-3">
      <h2 id="tiles-title" className="type-label text-ink-muted">
        {t("dashboard.brief.title", { days: BRIEF_DAYS })}
      </h2>
      <div data-tour="overview-lead" className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {content}
      </div>
    </section>
  );

  let lead;
  if (failed || held) {
    lead = (
      <ReadProblem
        data-tour="overview-lead"
        title={t("dashboard.overview.loadFailed")}
        error={roster.error ?? activity.error}
        paused={held}
        onRetry={() => {
          // Only what failed: a read that landed stays landed.
          if (roster.isError) void roster.refetch();
          if (activity.isError) void activity.refetch();
        }}
      />
    );
  } else if (!settled) {
    // Never a 0 or "nobody came back" before the reads that make them land.
    // Each placeholder is a tile line for line, its label, its figure and
    // the line under it, and the verdict's already wears the band's light,
    // so when the reads land only the figures arrive.
    lead = tiles(
      [0, 1, 2, 3].map((i) => (
        <LitPanel key={i} light={i === 0 ? "band" : "panel"} className="flex flex-col gap-2 p-4 sm:p-5">
          <span className="flex h-5 items-center">
            <Skeleton className="h-3.5 w-20 rounded-full" />
          </span>
          <Skeleton className="h-11 w-16 rounded-field" />
          <span className="flex h-10 items-start pt-1">
            <Skeleton className="h-3.5 w-28 rounded-full" />
          </span>
        </LitPanel>
      )),
    );
  } else if (empty) {
    // The day of activation, and every day until the first join: the QR
    // itself is the lead, large, with the way to print it.
    lead = (
      <LitPanel light="band" as="section" aria-labelledby="empty-lead" data-tour="overview-lead" className="flex flex-col items-center gap-4 p-5 text-center sm:p-6">
        <p id="empty-lead" className="type-body max-w-md text-ink">
          {t("dashboard.overview.emptyPro")}
        </p>
        <QrCode url={buildEnrollUrl(template.id!)} size={208} />
        {manages && (
          <LinkButton to="/dashboard/standee" variant="secondary">
            {t("dashboard.nav.standee")}
          </LinkButton>
        )}
      </LitPanel>
    );
  } else {
    lead = tiles(
      <>
        <StatTile
          lit
          arrive={watched}
          label={t("dashboard.overview.tiles.returned")}
          value={n(brief.returned)}
          floor={brief.capped}
          line={<Comparison delta={brief.returnedDelta} unknown={!brief.previousLoaded} />}
        />
        <StatTile
          arrive={watched}
          label={t("dashboard.overview.tiles.customers")}
          value={n(brief.customers)}
          floor={brief.rosterCapped}
          to="/dashboard/customers"
        />
        <StatTile
          arrive={watched}
          label={t("dashboard.overview.tiles.joined")}
          value={n(brief.joined)}
          floor={brief.joinedCapped}
          to="/dashboard/customers?sort=recent"
          line={<Comparison delta={brief.joinedDelta} />}
        />
        <StatTile
          arrive={watched}
          label={t("dashboard.overview.tiles.ready")}
          value={n(brief.ready)}
          floor={brief.rosterCapped}
          to="/dashboard/customers?filter=ready"
          line={
            brief.oneAway > 0 && (
              <TileLink to="/dashboard/customers?filter=oneAway">
                {t("dashboard.overview.oneAway", { count: brief.oneAway })}
              </TileLink>
            )
          }
        />
      </>,
    );
  }

  const quiet =
    settled && !empty && brief.quietDays !== null && brief.quietDays >= QUIET_DAYS && brief.lastVisit !== null;
  const rosterStopped = settled && !empty && roster.data?.truncated;
  const words = { today: t("dashboard.activity.today"), yesterday: t("dashboard.activity.yesterday") };
  const busiest = brief.days.reduce<{ date: Date; visits: number } | null>(
    (best, d) => (d.loaded && (!best || d.visits > best.visits) ? d : best),
    null,
  );

  return (
    <div className="flex flex-col gap-5">
      {title}

      {justActivated && (
        <Notice tone="ok" lit>
          {t("billing.success.done")}
        </Notice>
      )}

      {lead}

      {rosterStopped && (
        <Notice tone="warn">
          {t("dashboard.overview.rosterStopped", { shown: n(roster.data?.items.length ?? 0) })}
        </Notice>
      )}

      {quiet && brief.lastVisit !== null && (
        <Notice tone="warn">
          {t("dashboard.overview.quiet", {
            // A weekday only within the week; past that, the date.
            day:
              (brief.quietDays ?? 0) <= 6
                ? new Date(brief.lastVisit).toLocaleDateString(language, { weekday: "long" })
                : shortDate(brief.lastVisit, language),
          })}
        </Notice>
      )}

      {/* While the reads load, the two panels stand with their titles and a
          placeholder of the chart's and the week's own height, so nothing
          below moves when the figures land. */}
      {!failed && !held && !empty && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          <LitPanel as="section" aria-labelledby="month-title" className="flex flex-col gap-1 p-4 sm:p-5 lg:col-span-2">
            <h2 id="month-title" className="type-card-title text-ink">
              {t("dashboard.overview.chartTitle")}
            </h2>
            {settled ? (
              <DayChart
                className="mt-2"
                label={t("dashboard.overview.chartTitle")}
                days={brief.days.map((d) => ({ day: d.date.getTime(), value: d.loaded ? d.visits : null }))}
                summary={t("dashboard.overview.chartSummary", {
                  count: BRIEF_DAYS,
                  total: n(brief.visits),
                  peakDay: busiest ? weekdayDate(busiest.date.getTime(), language) : "",
                  peak: busiest ? n(busiest.visits) : "",
                })}
                valueLabel={(value) => t("dashboard.overview.people", { count: value })}
                dayLabel={(day) => relativeDay(day, language, words)}
                axisLabel={(day) => shortDate(day, language)}
              />
            ) : (
              <Skeleton className="mt-2 h-48 rounded-field" />
            )}
            <LinkButton to="/dashboard/activity" variant="quiet" className="mt-2 self-start">
              {t("dashboard.scan.tally.seeAll")}
            </LinkButton>
          </LitPanel>

          <LitPanel as="section" aria-labelledby="week-title" className="flex flex-col gap-4 p-4 sm:p-5">
            <h2 id="week-title" className="type-card-title text-ink">
              {t("dashboard.week.title")}
            </h2>
            {settled ? (
              <WeekLedger week={brief.week} cardLength={template.stamps_required} />
            ) : (
              <div className="flex flex-col gap-5">
                <Skeleton className="h-11 w-24 rounded-field" />
                <Skeleton className="h-[9.375rem] rounded-field" />
              </div>
            )}
          </LitPanel>
        </div>
      )}

      {/* What customers see, for whoever looks after it. A hire sees the
          join QR alone, with no group heading: it is the one thing here they
          use, to show a customer who wants to join. When there are no
          customers yet the QR is the lead already, so it isn't repeated. */}
      {manages ? (
        <section aria-labelledby="facing-title" className="flex flex-col gap-3">
          {facing}
          <div className={cn("grid grid-cols-1 items-start gap-5", !empty && "lg:grid-cols-2")}>
            {!empty && <JoinQr templateId={template.id!} />}
            <OwnPass businessName={business?.name ?? ""} template={template} design={design} preview={preview} trial={false} className={cn(empty && "max-w-xl")} />
          </div>
        </section>
      ) : (
        !empty && <JoinQr templateId={template.id!} className="max-w-md" />
      )}

      <InstallApp />
    </div>
  );
}

/** A rise said out loud, a fall or no change said quietly, and a comparison
 * that can't be made said plainly. A slow month is never red. */
function Comparison({ delta, unknown }: { delta: number | null; unknown?: boolean }) {
  const { t } = useTranslation();
  if (delta === null) {
    return unknown ? <span className="text-ink-muted">{t("dashboard.overview.noComparison")}</span> : null;
  }
  if (delta > 0) {
    return (
      <span className="inline-flex items-start gap-1.5 rounded-xl bg-ok/15 px-2.5 py-1 font-semibold text-ok-tag">
        <TrendingUp aria-hidden className="mt-0.5 size-4 shrink-0" />
        {t("dashboard.brief.moreThanBefore", { count: delta, days: BRIEF_DAYS })}
      </span>
    );
  }
  return (
    <span className="text-ink-muted">
      {delta < 0
        ? t("dashboard.brief.fewerThanBefore", { count: -delta, days: BRIEF_DAYS })
        : t("dashboard.brief.sameAsBefore", { days: BRIEF_DAYS })}
    </span>
  );
}
