import { useMemo, useRef, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Handshake, Settings2 } from "lucide-react";
import {
  Badge,
  Button,
  Dialog,
  EmptyState,
  FilterChips,
  LinkButton,
  List,
  ListRow,
  LitPanel,
  Sheet,
  Skeleton,
  SkeletonRows,
  Switch,
  type BadgeTone,
} from "../../components/kit";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
import { PUNCHME_MONTHLY_PRICE } from "../../components/marketing/calculator";
import { useBusiness } from "../../business/useBusiness";
import { isOwner } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { ApiError } from "../../api/errors";
import {
  getReferralProgram,
  listReferralGrants,
  listReferralRules,
  listReferrals,
  patchReferralProgram,
  reviewReferral,
  type Referral,
  type ReferralGrant,
  type ReferralRule,
} from "../../api/referrals";
import { cn } from "../../lib/cn";
import { useLightboxPage } from "../../theme/lightboxPage";
import { useArrivals } from "./arrival";
import { formatCount, listDay } from "./format";
import { isolate } from "./problem";
import { DecisionCard, type Decision, type DecisionResult } from "./referrals/DecisionCard";
import { ReferralLine } from "./referrals/ReferralLine";
import { ReferralSettings } from "./referrals/ReferralSettings";
import {
  GRANT_PAGES,
  countSentenceKey,
  decisionEffects,
  giftRulesOn,
  giftsOf,
  grantsHorizon,
  monthGifts,
  referralProblemKey,
  walkReached,
} from "./referrals/referralFacts";
import { PEOPLE, useReferralPeople } from "./referrals/referralPeople";

type Filter = "all" | "joined" | "qualified" | "completed" | "rejected";
const FILTERS: readonly Filter[] = ["all", "joined", "qualified", "completed", "rejected"];
const PAGE = 100;
/** Decisions shown before "more". */
const FIRST_DECISIONS = 3;

const STATUS_TONE: Record<Referral["status"], BadgeTone> = {
  joined: "neutral",
  qualified: "ok",
  completed: "reward",
  rejected: "neutral",
  flagged: "warn",
};

const NOT_COUNTED = ["self_referral", "already_customer", "prior_customer", "window_expired", "shared_device", "burst", "manual"];
const SKIPS = ["cap_reached", "program_off", "not_pro", "no_room", "no_route"];

/** Every gift a referral's rules gave, from newest back to `horizon`, at
 * most `GRANT_PAGES` pages; `complete` is false where it stopped short. */
async function walkGrants(businessId: string, horizon: number) {
  const grants: ReferralGrant[] = [];
  for (let page = 1; page <= GRANT_PAGES; page += 1) {
    const { items, count } = await listReferralGrants(businessId, undefined, page);
    grants.push(...items);
    if (walkReached(items, horizon) || grants.length >= count) return { grants, complete: true };
  }
  return { grants, complete: false };
}

/**
 * Refer a friend: decisions first. A flagged referral is a card that says
 * what happened and what each answer does; the program is one line with its
 * switch and what it costs, its settings in a sheet; then who brought whom,
 * filtered by where each referral got to. No coral here: the decisions are
 * two equal answers, confirmed in a dialog, and only the Free owner's
 * Activate is the one warm thing.
 */
export function ReferralsPage() {
  useLightboxPage();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";
  const { business, role } = useBusiness();
  const owns = isOwner(role);
  const businessId = business?.id ?? undefined;
  const businessName = business?.name ?? "";
  const queryClient = useQueryClient();

  const program = useQuery({
    queryKey: ["referralProgram", businessId],
    queryFn: () => getReferralProgram(businessId!),
    enabled: !!businessId,
  });
  const rules = useQuery({
    queryKey: ["referralRules", businessId],
    queryFn: () => listReferralRules(businessId!),
    enabled: !!businessId,
  });
  // The decisions read on their own, so a flag is never lost behind the
  // newest hundred however old it is.
  const flagged = useQuery({
    queryKey: ["referrals", businessId, "flagged"],
    queryFn: () => listReferrals(businessId!, "flagged"),
    enabled: !!businessId,
  });
  const referrals = useInfiniteQuery({
    queryKey: ["referrals", businessId, "all"],
    queryFn: ({ pageParam }) => listReferrals(businessId!, undefined, pageParam),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      pages.reduce((sum, page) => sum + page.items.length, 0) < last.count ? pages.length + 1 : undefined,
    enabled: !!businessId,
  });
  const templates = useQuery({
    queryKey: ["templates", businessId],
    queryFn: () => listTemplates(businessId!),
    enabled: !!businessId,
  });
  const template = templates.data?.[0];

  const all = useMemo(() => referrals.data?.pages.flatMap((page) => page.items) ?? [], [referrals.data]);
  const total = referrals.data?.pages[0]?.count ?? 0;
  const horizon = grantsHorizon(all, new Date());
  const grants = useQuery({
    queryKey: ["referralGrants", businessId, horizon],
    queryFn: () => walkGrants(businessId!, horizon),
    enabled: !!businessId && !!referrals.data,
  });

  const ruleList = rules.data?.rules ?? [];
  const [filter, setFilter] = useState<Filter>("all");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [allDecisions, setAllDecisions] = useState(false);
  const [decided, setDecided] = useState<Record<string, { referral: Referral; result: DecisionResult }>>({});
  const [refused, setRefused] = useState<Record<string, unknown>>({});
  const [asking, setAsking] = useState<{ referral: Referral; decision: Decision } | null>(null);
  const [programState, setProgramState] = useState<unknown>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const decisionsHeading = useRef<HTMLHeadingElement>(null);
  // Where focus goes once a decision is made, its card's buttons gone; on
  // Cancel it is empty, and focus goes back to the button that asked.
  const afterDecision = useRef<HTMLElement | null>(null);

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: ["referrals", businessId] });
    void queryClient.invalidateQueries({ queryKey: ["referralGrants", businessId] });
  };

  const review = useMutation({
    mutationFn: ({ referral, decision }: { referral: Referral; decision: Decision }) =>
      reviewReferral(businessId!, referral.id, decision),
    onMutate: () => {
      afterDecision.current = null;
    },
    onSuccess: (_saved, { referral, decision }) => {
      afterDecision.current = decisionsHeading.current;
      setDecided((all) => ({ ...all, [referral.id]: { referral, result: decision === "approve" ? "approved" : "rejected" } }));
      setAsking(null);
      refresh();
    },
    onError: (error, { referral }) => {
      setAsking(null);
      if (error instanceof ApiError && error.code === "referral_not_reviewable") {
        // Decided meanwhile, by another manager: said on the card, and the
        // lists read again.
        afterDecision.current = decisionsHeading.current;
        setDecided((all) => ({ ...all, [referral.id]: { referral, result: "decided" } }));
        refresh();
      } else {
        setRefused((all) => ({ ...all, [referral.id]: error }));
      }
    },
  });

  const switchProgram = useMutation({
    mutationFn: (enabled: boolean) => patchReferralProgram(businessId!, { enabled }),
    onMutate: () => setProgramState(null),
    onSuccess: (saved) => {
      queryClient.setQueryData(["referralProgram", businessId], saved);
      setProgramState("saved");
    },
    onError: (error) => setProgramState({ error }),
  });

  // The decisions: those waiting, and those answered here, which stay and
  // say what happened.
  const waiting = (flagged.data?.items ?? []).filter((referral) => !decided[referral.id]);
  const answered = Object.values(decided);
  const decisionCount = waiting.length + answered.length;
  const shownWaiting = allDecisions ? waiting : waiting.slice(0, Math.max(0, FIRST_DECISIONS - answered.length));
  const hiddenWaiting = waiting.length - shownWaiting.length;

  const counts = useMemo(() => {
    const out: Record<Filter, number> = { all: all.length, joined: 0, qualified: 0, completed: 0, rejected: 0 };
    for (const referral of all) if (referral.status in out) out[referral.status as Filter] += 1;
    return out;
  }, [all]);
  const rows = filter === "all" ? all : all.filter((referral) => referral.status === filter);
  // A referral decided here, once its new status has landed: the status
  // lights on in its row, where the decision went, while its card's light
  // goes out. Only the badge, in opacity (the kit's 150ms fade): the row is
  // already in the list.
  const arrive = useArrivals(
    rows.filter((referral) => decided[referral.id] && referral.status !== "flagged").map((referral) => referral.id),
    "animate-gentle-in",
  );

  const settings = program.data;
  const blocker = settings && !settings.enabled && !settings.can_enable ? settings.enable_blocker : null;

  const decisions =
    decisionCount > 0 ? (
      <section aria-labelledby="decisions-title" className="flex flex-col gap-3">
        <h2 id="decisions-title" ref={decisionsHeading} tabIndex={-1} className="type-card-title text-ink outline-none">
          {t("referrals.decision.title")}
        </h2>
        <ul className="flex flex-col gap-3">
          {answered.map(({ referral, result }) => (
            <DecisionCard key={referral.id} referral={referral} rules={ruleList} result={result} problem={null} onAsk={() => {}} />
          ))}
          {shownWaiting.map((referral) => (
            <DecisionCard
              key={referral.id}
              referral={referral}
              rules={ruleList}
              result={null}
              problem={
                refused[referral.id] ? (
                  <p role="alert" className="text-sm font-semibold leading-snug text-danger">
                    {t(referralProblemKey(refused[referral.id]))}
                  </p>
                ) : null
              }
              onAsk={(decision) => {
                setRefused((all) => ({ ...all, [referral.id]: undefined }));
                setAsking({ referral, decision });
              }}
            />
          ))}
        </ul>
        {hiddenWaiting > 0 && (
          <Button variant="secondary" onClick={() => setAllDecisions(true)} className="self-start">
            {t("referrals.decision.more", { count: hiddenWaiting })}
          </Button>
        )}
      </section>
    ) : null;

  let programPanel: ReactNode;
  if (!settings || !rules.data) {
    programPanel =
      program.isError || rules.isError || program.fetchStatus === "paused" ? (
        <ReadProblem
          title={t("referrals.loadFailed.program")}
          error={program.error ?? rules.error}
          paused={!program.isError && !rules.isError}
          onRetry={() => {
            void program.refetch();
            void rules.refetch();
          }}
        />
      ) : (
        <LitPanel className="flex flex-col gap-3 p-5 sm:p-6">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </LitPanel>
      );
  } else {
    programPanel = (
      <LitPanel as="section" aria-label={t("referrals.master.label")} className="flex flex-col gap-3 p-5 sm:p-6">
        <Switch
          checked={switchProgram.isPending ? !!switchProgram.variables : settings.enabled}
          disabled={!!blocker}
          label={<span className="type-card-title">{t("referrals.master.label")}</span>}
          description={
            <ProgramCost
              rules={ruleList}
              cap={settings.max_rewarded_per_referrer}
              period={settings.cap_period}
              grants={grants.data?.grants}
              complete={grants.data?.complete ?? true}
            />
          }
          onChange={(on) => {
            if (!switchProgram.isPending) switchProgram.mutate(on);
          }}
        />
        {blocker === "upgrade_required" ? (
          owns ? (
            <div className="flex flex-col items-start gap-3">
              <p className="type-body text-ink">
                <Trans
                  i18nKey="referrals.free.owner"
                  values={{ price: PUNCHME_MONTHLY_PRICE }}
                  components={{ ltr: <bdi dir="ltr" className="type-figure" /> }}
                />
              </p>
              <LinkButton to="/dashboard/billing" variant="primary">
                {t("billing.activateCta")}
              </LinkButton>
            </div>
          ) : (
            <p className="type-body text-ink-muted">{t("referrals.free.hire")}</p>
          )
        ) : blocker ? (
          <p className="type-body text-ink-muted">
            {t(blocker === "not_enabled_for_pilot" ? "referrals.blocked.not_enabled_for_pilot" : "referrals.errors.generic")}
          </p>
        ) : null}
        {programState === "saved" ? (
          <p role="status" className="text-sm text-ink-muted">
            {t(settings.enabled ? "referrals.program.on" : "referrals.program.off")}
          </p>
        ) : programState ? (
          <p role="alert" className="text-sm font-semibold leading-snug text-danger">
            {t(referralProblemKey((programState as { error: unknown }).error))}
          </p>
        ) : (
          <p role="status" className="sr-only" />
        )}
        <Button variant="secondary" icon={<Settings2 aria-hidden />} onClick={() => setSettingsOpen(true)} className="self-start">
          {t("referrals.settings.open")}
        </Button>
      </LitPanel>
    );
  }

  let list: ReactNode;
  if (!referrals.data && (referrals.isError || referrals.fetchStatus === "paused")) {
    list = (
      <ReadProblem
        title={t("referrals.loadFailed.list")}
        error={referrals.error}
        paused={!referrals.isError}
        onRetry={() => void referrals.refetch()}
      />
    );
  } else if (!referrals.data) {
    list = (
      <LitPanel className="overflow-hidden">
        <SkeletonRows rows={4} />
      </LitPanel>
    );
  } else if (all.length === 0) {
    list = <EmptyState icon={<Handshake />} title={t("referrals.list.emptyTitle")} body={t("referrals.list.empty")} />;
  } else {
    const more = Math.min(PAGE, total - all.length);
    list = (
      <div className="flex flex-col gap-3">
        <FilterChips
          label={t("referrals.list.filter")}
          hideLabel
          value={filter}
          onChange={setFilter}
          options={FILTERS.map((key) => ({ value: key, label: t(`referrals.list.filters.${key}`), count: counts[key] }))}
        />
        <LitPanel className="overflow-hidden">
          {rows.length === 0 ? (
            <p className="type-body px-5 py-4 text-ink-muted">{t("referrals.list.noMatches")}</p>
          ) : (
            <List>
              {rows.map((referral) => (
                <ReferralRow
                  key={referral.id}
                  referral={referral}
                  grants={grants.data?.grants ?? []}
                  lang={lang}
                  statusMotion={arrive(referral.id)}
                />
              ))}
            </List>
          )}
        </LitPanel>
        {referrals.hasNextPage && (
          <div className="flex flex-col items-start gap-1">
            <p className="text-sm text-ink-muted">
              {t("referrals.list.showing", { shown: formatCount(all.length, lang), total: formatCount(total, lang) })}
            </p>
            <Button
              variant="secondary"
              busy={referrals.isFetchingNextPage}
              onClick={() => void referrals.fetchNextPage()}
            >
              {t("referrals.list.more", { count: more, value: formatCount(more, lang) })}
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="type-title text-ink">{t("referrals.title")}</h1>
        <p className="type-body max-w-prose text-ink-muted">{t("referrals.lead")}</p>
      </header>

      {flagged.isError && !flagged.data ? (
        <ReadProblem
          title={t("referrals.loadFailed.decisions")}
          error={flagged.error}
          onRetry={() => void flagged.refetch()}
        />
      ) : (
        decisions
      )}

      {programPanel}

      <section aria-labelledby="referrals-list-title" className="flex flex-col gap-3">
        <h2 id="referrals-list-title" className="type-card-title text-ink">
          {t("referrals.list.title")}
        </h2>
        {list}
      </section>

      <Dialog
        open={!!asking}
        onClose={() => setAsking(null)}
        title={t(asking?.decision === "reject" ? "referrals.decision.askSkip" : "referrals.decision.askCount")}
        description={asking ? <Consequence referral={asking.referral} decision={asking.decision} rules={ruleList} /> : null}
        initialFocus={cancelRef}
        returnFocus={afterDecision}
        footer={
          <>
            <Button ref={cancelRef} variant="secondary" onClick={() => setAsking(null)}>
              {t("referrals.decision.cancel")}
            </Button>
            <Button variant="ink" busy={review.isPending} onClick={() => asking && review.mutate(asking)}>
              {t(asking?.decision === "reject" ? "referrals.list.review.reject" : "referrals.list.review.approve")}
            </Button>
          </>
        }
      />

      {settings && rules.data && businessId && (
        <Sheet open={settingsOpen} onClose={() => setSettingsOpen(false)} title={t("referrals.settings.title")}>
          <ReferralSettings
            businessId={businessId}
            businessName={businessName}
            program={settings}
            rules={rules.data}
            template={template}
          />
        </Sheet>
      )}
    </div>
  );
}

/** What an answer does, repeated in its dialog, and that it can't be undone. */
function Consequence({ referral, decision, rules }: { referral: Referral; decision: Decision; rules: readonly ReferralRule[] }) {
  const { t } = useTranslation();
  const people = useReferralPeople(referral);
  return (
    <>
      <Trans
        i18nKey={decision === "approve" ? countSentenceKey(decisionEffects(rules)) : "referrals.decision.skip"}
        values={people}
        components={PEOPLE}
      />{" "}
      {t("referrals.decision.final")}
    </>
  );
}

/**
 * What the program costs, from the rules that are on, in the order things
 * happen to a friend; the cap; and what it actually gave this month, from
 * the gifts read back to the month's start ("at least" where the read
 * stopped short).
 */
function ProgramCost({
  rules,
  cap,
  period,
  grants,
  complete,
}: {
  rules: readonly ReferralRule[];
  cap: number;
  period: string;
  grants: ReferralGrant[] | undefined;
  complete: boolean;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";
  const gifts = giftRulesOn(rules);
  const giftWords = (rule: ReferralRule) =>
    rule.gift_complete_card ? t("referrals.program.giftFull") : t("referrals.program.gift", { count: rule.gift_stamps });
  let month: string | null = null;
  if (grants) {
    const given = monthGifts(grants, new Date());
    const parts = [
      given.stamps > 0 && t("referrals.program.stamps", { count: given.stamps, value: formatCount(given.stamps, lang) }),
      given.cards > 0 && t("referrals.program.cards", { count: given.cards, value: formatCount(given.cards, lang) }),
    ].filter(Boolean);
    month =
      parts.length === 0
        ? t(complete ? "referrals.program.monthNone" : "referrals.program.monthNoneSoFar")
        : t(complete ? "referrals.program.month" : "referrals.program.monthAtLeast", { gifts: parts.join(" · ") });
  }
  return (
    <span className="flex flex-col gap-1">
      {gifts.length === 0 ? (
        <span>{t("referrals.program.noGifts")}</span>
      ) : (
        gifts.map((rule) => (
          <span key={`${rule.event}_${rule.recipient}`}>
            {t(`referrals.program.gives.${rule.event}`, { gift: giftWords(rule) })}
          </span>
        ))
      )}
      <span>{t("referrals.cap.summary", { count: cap, period: t(`referrals.cap.per.${period}`) })}</span>
      {month && <span className="font-semibold text-ink">{month}</span>}
    </span>
  );
}

/**
 * Who brought whom: the line, where it got to as a badge (gold only for a
 * finished card, the reward), the day with the year when it isn't this
 * one, why it wasn't counted, and the gifts it gave, granted or not.
 */
function ReferralRow({
  referral,
  grants,
  lang,
  statusMotion,
}: {
  referral: Referral;
  grants: readonly ReferralGrant[];
  lang: string;
  /** What the status plays as a decision made here lands. */
  statusMotion?: string;
}) {
  const { t } = useTranslation();
  const gifts = giftsOf(referral.id, grants);
  const facts: string[] = [listDay(referral.created_at, lang)];
  if (referral.status === "rejected") {
    facts.push(t(`referrals.list.reason.${NOT_COUNTED.includes(referral.fraud_reason) ? referral.fraud_reason : "other"}`));
  }
  const giftLine =
    gifts.length > 0
      ? t("referrals.gifts.line", {
          gifts: gifts
            .map((grant) =>
              t("referrals.gifts.item", {
                gift: grant.gift_complete_card ? t("referrals.program.giftFull") : t("referrals.program.gift", { count: grant.gift_stamps }),
                who: isolate(grant.recipient_display_name.trim() || t("referrals.list.noName")),
                state:
                  grant.status === "skipped"
                    ? t("referrals.gifts.skipped", {
                        reason: t(`referrals.gifts.skip.${SKIPS.includes(grant.skip_reason) ? grant.skip_reason : "other"}`),
                      })
                    : t(`referrals.gifts.state.${grant.status === "sending" ? "pending" : grant.status}`),
              }),
            )
            .join(" · "),
        })
      : null;
  return (
    <ListRow
      title={
        <span className="block whitespace-normal font-normal [overflow-wrap:anywhere]">
          <ReferralLine referral={referral} />
        </span>
      }
      meta={
        <span className="flex flex-col gap-0.5 whitespace-normal">
          <span>{facts.join(" · ")}</span>
          {giftLine && <span>{giftLine}</span>}
        </span>
      }
      trailing={
        <Badge tone={STATUS_TONE[referral.status]} className={cn("whitespace-normal text-center", statusMotion)}>
          {t(`referrals.list.status.${referral.status}`)}
        </Badge>
      }
    />
  );
}
