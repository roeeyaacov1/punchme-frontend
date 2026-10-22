import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { CircleAlert, Inbox, PenLine, Plus, Send } from "lucide-react";
import {
  Button,
  EmptyState,
  LinkButton,
  List,
  LitPanel,
  Notice,
  Skeleton,
  SkeletonRows,
  Tab,
  TabList,
  TabPanel,
  Tabs,
} from "../../components/kit";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
import { PUNCHME_MONTHLY_PRICE } from "../../components/marketing/calculator";
import { messagingErrorMessage, relativeWhen } from "../../components/messaging/describe";
import { useBusiness } from "../../business/useBusiness";
import { isOwner } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { getTemplateDesign } from "../../api/designs";
import { ApiError } from "../../api/errors";
import {
  activateAutomation,
  getMessagingSummary,
  listAutomations,
  listBroadcasts,
  listRecipes,
  pauseAutomation,
  type AutomationOut,
  type BroadcastOut,
  type MessagingSummary,
} from "../../api/messaging";
import { useCardLanguage } from "../../hooks/useCardLanguage";
import { useLightboxPage } from "../../theme/lightboxPage";
import { formatCount } from "./format";
import { problemKey } from "./problem";
import { BroadcastRow, BroadcastSheet } from "./messages/Broadcasts";
import { RecipeList, RecipeSheet } from "./messages/RecipeSheet";
import { RuleRow } from "./messages/RuleRow";
import { isLate, messagesNotice, orderRules, ruleName, ruleReach, ruleState, type MessagesNotice } from "./messages/rules";

type TabKey = "rules" | "broadcast" | "sent";
const TABS: readonly TabKey[] = ["rules", "broadcast", "sent"];
const BROADCAST_PAGE = 10;

/** A number inside a sentence, in tabular figures with its own direction. */
const figure = <span dir="ltr" className="type-figure" />;

/**
 * Messages: what reaches customers after they leave. Three tabs on one
 * route, `?tab=rules` (the default), `?tab=broadcast` and `?tab=sent`, the
 * way Customers reads `?filter=`: the composer comes back to Sent and the
 * editor to Rules.
 *
 * Above the tabs, whichever is open: the one notice that matters most, a
 * broadcast's progress while one is sending, and the result a composer or
 * an editor handed back. While anything is sending the history is polled
 * every 3 seconds, whatever tab is open.
 */
export function MessagesPage() {
  useLightboxPage();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";
  const { business, role, isPro } = useBusiness();
  const owns = isOwner(role);
  const businessId = business?.id ?? undefined;
  const businessName = business?.name ?? "";
  const queryClient = useQueryClient();
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const asked = params.get("tab") as TabKey | null;
  const tab: TabKey = asked && TABS.includes(asked) ? asked : "rules";

  // The result a composer or an editor hands over on navigate, taken once
  // and cleared from history so a refresh doesn't say it again; clearing
  // alone would un-render it before anyone read it.
  const [flash] = useState<string | null>(() => (location.state as { flash?: string } | null)?.flash ?? null);
  useEffect(() => {
    if (flash) navigate({ pathname: location.pathname, search: location.search }, { replace: true, state: null });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const summary = useQuery({
    queryKey: ["messaging", "summary", businessId],
    queryFn: () => getMessagingSummary(businessId!),
    enabled: !!businessId,
    staleTime: 10_000,
  });
  const automations = useQuery({
    queryKey: ["automations", businessId],
    queryFn: () => listAutomations(businessId!),
    enabled: !!businessId,
  });
  const broadcasts = useInfiniteQuery({
    queryKey: ["broadcasts", businessId],
    queryFn: ({ pageParam }) => listBroadcasts(businessId!, pageParam, BROADCAST_PAGE),
    initialPageParam: 1,
    getNextPageParam: (last, pages) =>
      pages.reduce((sum, page) => sum + page.items.length, 0) < last.count ? pages.length + 1 : undefined,
    enabled: !!businessId,
    // A broadcast in flight reports its progress: poll until it settles.
    refetchInterval: (query) =>
      query.state.data?.pages.some((page) => page.items.some((b) => b.status === "sending")) ? 3_000 : false,
  });
  const templates = useQuery({
    queryKey: ["templates", businessId],
    queryFn: () => listTemplates(businessId!),
    enabled: !!businessId,
  });
  const template = templates.data?.[0];
  const templateId = template?.id ?? undefined;
  const language = useCardLanguage(businessId, templateId);
  // The design `useCardLanguage` reads, under its own key: the pass a sent
  // message is shown over.
  const design = useQuery({
    queryKey: ["design", templateId],
    queryFn: () => getTemplateDesign(businessId!, templateId!),
    enabled: !!businessId && !!templateId,
    staleTime: 60_000,
  });
  const recipes = useQuery({
    queryKey: ["recipes", businessId, language],
    queryFn: () => listRecipes(businessId!, language),
    enabled: !!businessId,
    staleTime: Infinity,
  });

  const rules = useMemo(() => automations.data ?? [], [automations.data]);
  const facts = summary.data;
  // Unknown reads as fine: a summary that hasn't loaded mustn't put every
  // rule on hold.
  const canReachOne = facts?.can_reach_one_customer ?? true;
  const notice = messagesNotice({ isPro, owns, summary: facts, rules });
  const sent = useMemo(() => broadcasts.data?.pages.flatMap((page) => page.items) ?? [], [broadcasts.data]);

  // One polite voice for what changed out of sight: a switched rule, and a
  // broadcast that has finished.
  const [said, setSaid] = useState("");
  const sending = sent.find((b) => b.status === "sending");
  const sendingId = useRef<string | null>(null);
  useEffect(() => {
    const was = sendingId.current;
    sendingId.current = sending?.id ?? null;
    if (!was || sending) return;
    const done = sent.find((b) => b.id === was);
    if (done) setSaid(t("messaging.broadcast.settled", { count: done.sent_count, value: formatCount(done.sent_count, lang) }));
    // The week's quota and the month's figures moved with it.
    void queryClient.invalidateQueries({ queryKey: ["messaging", "summary", businessId] });
  }, [sending, sent, t, lang, queryClient, businessId]);

  // A switch shows the owner's choice at once and saves behind it; a
  // refusal puts it back and is said under that rule.
  const [optimistic, setOptimistic] = useState<Record<string, boolean>>({});
  const [refusals, setRefusals] = useState<Record<string, unknown>>({});
  const toggle = useMutation({
    mutationFn: ({ rule, on }: { rule: AutomationOut; on: boolean }) =>
      on ? activateAutomation(businessId!, rule.id) : pauseAutomation(businessId!, rule.id),
    onMutate: ({ rule, on }) => {
      setOptimistic((all) => ({ ...all, [rule.id]: on }));
      setRefusals((all) => ({ ...all, [rule.id]: undefined }));
    },
    onSuccess: (saved, { rule, on }) => {
      queryClient.setQueryData<AutomationOut[]>(["automations", businessId], (list) =>
        list?.map((item) => (item.id === saved.id ? saved : item)),
      );
      const name = ruleName(rule, t);
      setSaid(
        on
          ? saved.next_run_at
            ? t("messaging.rules.switchedOn", { name, when: relativeWhen(saved.next_run_at, t, lang) })
            : t("messaging.rules.switchedOnNoRun", { name })
          : t("messaging.rules.switchedOff", { name }),
      );
    },
    onError: (error, { rule }) => setRefusals((all) => ({ ...all, [rule.id]: error })),
    onSettled: (_data, _error, { rule }) => {
      setOptimistic((all) => {
        const next = { ...all };
        delete next[rule.id];
        return next;
      });
      void queryClient.invalidateQueries({ queryKey: ["automations", businessId] });
      void queryClient.invalidateQueries({ queryKey: ["messaging", "summary", businessId] });
    },
  });

  const [picking, setPicking] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const openBroadcast = sent.find((b) => b.id === openId) ?? null;
  const openSheet = (id: string) => {
    setOpenId(id);
    setSheetOpen(true);
  };

  const activate = (
    <LinkButton to="/dashboard/billing" variant="primary">
      {t("billing.activateCta")}
    </LinkButton>
  );

  function refusal(error: unknown): ReactNode {
    if (error instanceof ApiError && error.code === "upgrade_required") {
      return (
        <div role="alert" className="flex flex-col items-start gap-2">
          <p className="text-sm leading-snug text-ink">
            {t(owns ? "messaging.rules.upgradeOwner" : "messaging.rules.upgradeHire")}
          </p>
          {owns && (
            <LinkButton to="/dashboard/billing" variant="secondary">
              {t("billing.activateCta")}
            </LinkButton>
          )}
        </div>
      );
    }
    const words = error instanceof ApiError && error.code ? messagingErrorMessage(error, t, lang) : t(problemKey(error));
    return (
      <p role="alert" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
        <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
        <span>{words}</span>
      </p>
    );
  }

  const ordered = orderRules(rules, canReachOne);
  const rulesPanel = (() => {
    if (!automations.data && (automations.isError || automations.fetchStatus === "paused")) {
      return (
        <ReadProblem
          title={t("messaging.loadFailed.rules")}
          error={automations.error}
          paused={!automations.isError}
          onRetry={() => void automations.refetch()}
        />
      );
    }
    if (!automations.data) {
      return (
        <LitPanel className="overflow-hidden">
          <SkeletonRows rows={3} />
        </LitPanel>
      );
    }
    const recipeList = {
      recipes: recipes.data,
      rules,
      loading: recipes.isLoading,
      failed: recipes.isError,
      onRetry: () => void recipes.refetch(),
    };
    if (rules.length === 0) {
      // Only on a read that answered "none": a read that failed never
      // offers the starters, which would invite a duplicate.
      return (
        <LitPanel className="overflow-hidden">
          <EmptyState framed={false} title={t("messaging.rules.emptyTitle")} body={t("messaging.rules.emptyBody")} className="pb-4" />
          <div className="border-t border-border">
            <RecipeList {...recipeList} />
          </div>
        </LitPanel>
      );
    }
    return (
      <div className="flex flex-col gap-3">
        <LitPanel>
          <List>
            {ordered.map((rule) => {
              const state = ruleState(rule, canReachOne);
              const checked = optimistic[rule.id] ?? rule.is_active;
              // Switching off is never gated. Switching on: not before the
              // card is active, not before sending opens for this business
              // (the API checks both, `assert_can_send`), and not while the
              // wallet can't address one card; each would only earn a refusal.
              let disabledReason: string | undefined;
              if (!checked && !isPro) disabledReason = t("messaging.rules.opensWithActivation");
              else if (!checked && facts && !facts.can_send) disabledReason = t("messaging.rules.opensWhenOpen");
              else if (!checked && !canReachOne) disabledReason = t("messaging.rules.heldSwitch");
              return (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  state={state}
                  late={isLate(rule, canReachOne)}
                  reach={ruleReach(rule, facts)}
                  checked={checked}
                  disabledReason={disabledReason}
                  onToggle={(on) => {
                    if (rule.id in optimistic) return;
                    toggle.mutate({ rule, on });
                  }}
                  problem={refusals[rule.id] ? refusal(refusals[rule.id]) : undefined}
                />
              );
            })}
          </List>
        </LitPanel>
        <Button variant="secondary" icon={<Plus aria-hidden />} onClick={() => setPicking(true)} className="self-start">
          {t("messaging.automations.new")}
        </Button>
        <RecipeSheet open={picking} onClose={() => setPicking(false)} {...recipeList} />
      </div>
    );
  })();

  const sentPanel = (() => {
    if (!broadcasts.data && (broadcasts.isError || broadcasts.fetchStatus === "paused")) {
      return (
        <ReadProblem
          title={t("messaging.loadFailed.sent")}
          error={broadcasts.error}
          paused={!broadcasts.isError}
          onRetry={() => void broadcasts.refetch()}
        />
      );
    }
    if (!broadcasts.data) {
      return (
        <LitPanel className="overflow-hidden">
          <SkeletonRows rows={4} />
        </LitPanel>
      );
    }
    if (sent.length === 0) {
      return <EmptyState icon={<Inbox />} title={t("messaging.history.empty")} />;
    }
    const total = broadcasts.data.pages[0]?.count ?? sent.length;
    const more = Math.min(BROADCAST_PAGE, total - sent.length);
    return (
      <div className="flex flex-col gap-3">
        <LitPanel className="overflow-hidden">
          <List>
            {sent.map((broadcast) => (
              <BroadcastRow
                key={broadcast.id}
                broadcast={broadcast}
                businessName={businessName}
                onOpen={() => openSheet(broadcast.id)}
              />
            ))}
          </List>
        </LitPanel>
        {broadcasts.hasNextPage && (
          <Button
            variant="secondary"
            busy={broadcasts.isFetchingNextPage}
            onClick={() => void broadcasts.fetchNextPage()}
            className="self-start"
          >
            {t("messaging.history.more", { count: more })}
          </Button>
        )}
      </div>
    );
  })();

  return (
    <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-5">
      <header className="flex flex-col gap-1">
        <h1 className="type-title text-ink">{t("messaging.title")}</h1>
        {isPro && <ReachLine summary={facts} loading={summary.isLoading} />}
      </header>

      {isPro && !facts && (summary.isError || summary.fetchStatus === "paused") ? (
        <ReadProblem
          title={t("messaging.loadFailed.figures")}
          error={summary.error}
          paused={!summary.isError}
          onRetry={() => void summary.refetch()}
        />
      ) : (
        notice && <PageNotice notice={notice} action={notice === "freeOwner" ? activate : undefined} />
      )}

      {sending && (
        // The count updates in place every 3 seconds and isn't read out
        // each time; the end is said once, below.
        <LitPanel light="lit" className="flex items-center gap-3 p-4">
          <Send aria-hidden className="size-5 shrink-0 text-ink-muted rtl:-scale-x-100" />
          <p className="type-body text-ink">
            <Trans
              i18nKey="messaging.broadcast.sending"
              values={{ sent: formatCount(sending.sent_count, lang), total: formatCount(sending.audience_count, lang) }}
              components={{ n: figure }}
            />
          </p>
        </LitPanel>
      )}

      {flash && (
        <Notice tone="ok" lit role="status">
          {flash}
        </Notice>
      )}

      <p role="status" className="sr-only">
        {said}
      </p>

      <Tabs value={tab} onChange={(next) => setParams({ tab: next }, { replace: true })}>
        <TabList label={t("messaging.tabs.label")}>
          {TABS.map((key) => (
            <Tab key={key} value={key}>
              {t(`messaging.tabs.${key}`)}
            </Tab>
          ))}
        </TabList>
        <TabPanel value="rules" className="pt-4">
          {rulesPanel}
        </TabPanel>
        <TabPanel value="broadcast" className="pt-4">
          <BroadcastTab
            isPro={isPro}
            summary={facts}
            summaryLoading={summary.isLoading}
            latest={sent[0]}
            businessName={businessName}
            onOpen={openSheet}
          />
        </TabPanel>
        <TabPanel value="sent" className="pt-4">
          {sentPanel}
        </TabPanel>
      </Tabs>

      <BroadcastSheet
        broadcast={openBroadcast}
        open={sheetOpen && !!openBroadcast}
        onClose={() => setSheetOpen(false)}
        businessName={businessName}
        template={template}
        design={design.data}
      />
    </div>
  );
}

/** How many hold the card, the figure isolated and grouped; nobody, in words. */
function ReachLine({ summary, loading }: { summary: MessagingSummary | undefined; loading: boolean }) {
  const { t, i18n } = useTranslation();
  if (loading) return <Skeleton className="h-5 w-56" />;
  if (!summary) return null;
  const count = summary.customers_with_card;
  return (
    <p className="type-body text-ink-muted">
      {count === 0 ? (
        t("messaging.summary.audienceNone")
      ) : (
        <Trans
          i18nKey="messaging.reach"
          count={count}
          values={{ value: formatCount(count, i18n.resolvedLanguage) }}
          components={{ n: figure }}
        />
      )}
    </p>
  );
}

/** The one notice: words and an icon, the owner's Activate where it is theirs. */
function PageNotice({ notice, action }: { notice: MessagesNotice; action?: ReactNode }) {
  const { t } = useTranslation();
  let words: ReactNode;
  if (notice === "freeOwner") {
    words = (
      <Trans
        i18nKey="messaging.free.owner"
        values={{ price: PUNCHME_MONTHLY_PRICE }}
        components={{ ltr: <bdi dir="ltr" className="type-figure" /> }}
      />
    );
  } else if (notice === "freeHire") words = t("messaging.free.hire");
  else if (notice === "notOpen") words = t("messaging.guard.notEnabled");
  else if (notice === "paused") words = t("messaging.guard.dispatchOff");
  else if (notice === "onHold") words = t("messaging.guard.personalOnHold");
  else words = t("messaging.guard.schedulerStale");
  return (
    <Notice tone="warn" action={action}>
      {words}
    </Notice>
  );
}

/**
 * Message everyone: the week's quota first, what a broadcast is in one
 * line, the latest one, and the door to the composer. Coral where it can
 * go; disabled with its reason where the week is spent or sending isn't
 * open. On Free the owner's Activate is already in the notice above, so
 * this tab only offers a sample to the shop's own card, which works on
 * every plan.
 */
function BroadcastTab({
  isPro,
  summary,
  summaryLoading,
  latest,
  businessName,
  onOpen,
}: {
  isPro: boolean;
  summary: MessagingSummary | undefined;
  summaryLoading: boolean;
  latest: BroadcastOut | undefined;
  businessName: string;
  onOpen: (id: string) => void;
}) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";

  if (!isPro) {
    return (
      <LitPanel className="flex flex-col items-start gap-4 p-5 sm:p-6">
        <p className="type-body text-ink">{t("messaging.broadcast.freeLine")}</p>
        <LinkButton to="/dashboard/messages/new" variant="secondary" icon={<PenLine aria-hidden />}>
          {t("messaging.broadcast.writeSample")}
        </LinkButton>
      </LitPanel>
    );
  }
  if (summaryLoading || !summary) {
    return (
      <LitPanel className="flex flex-col gap-3 p-5 sm:p-6">
        <Skeleton className="h-6 w-2/3" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-11 w-40 rounded-full" />
      </LitPanel>
    );
  }

  const open = summary.can_send;
  const left = Math.max(0, summary.broadcasts_limit_7d - summary.broadcasts_used_7d);
  const spent = !!summary.next_broadcast_allowed_at || left === 0;
  const nobody = summary.customers_with_card === 0;
  const quota = summary.next_broadcast_allowed_at
    ? t("messaging.broadcast.nextAllowed", { when: relativeWhen(summary.next_broadcast_allowed_at, t, lang) })
    : left === 0
      ? t("messaging.broadcast.leftNone")
      : t("messaging.broadcast.left", { count: left });

  return (
    <div className="flex flex-col gap-4">
      <LitPanel className="flex flex-col items-start gap-3 p-5 sm:p-6">
        {/* No quota where sending is closed: the notice above says why. */}
        {open && (
          <h2 id="broadcast-quota" className="type-card-title text-ink">
            {quota}
          </h2>
        )}
        <p className="type-body text-ink-muted">
          {nobody ? (
            t("messaging.broadcast.nobody")
          ) : (
            <Trans
              i18nKey="messaging.broadcast.what"
              count={summary.customers_with_card}
              values={{ value: formatCount(summary.customers_with_card, lang), limit: summary.broadcasts_limit_7d }}
              components={{ n: figure }}
            />
          )}
        </p>
        {nobody ? (
          <LinkButton to="/dashboard/standee" variant="secondary">
            {t("messaging.broadcast.toStandee")}
          </LinkButton>
        ) : open && !spent ? (
          <LinkButton to="/dashboard/messages/new" variant="primary" icon={<PenLine aria-hidden />}>
            {t("messaging.broadcast.write")}
          </LinkButton>
        ) : (
          <Button variant="primary" icon={<PenLine aria-hidden />} disabled aria-describedby={open ? "broadcast-quota" : undefined}>
            {t("messaging.broadcast.write")}
          </Button>
        )}
      </LitPanel>

      {latest && (
        <section aria-labelledby="broadcast-latest" className="flex flex-col gap-2">
          <h2 id="broadcast-latest" className="type-label text-ink">
            {t("messaging.broadcast.latest")}
          </h2>
          <LitPanel className="overflow-hidden">
            <List>
              <BroadcastRow broadcast={latest} businessName={businessName} onOpen={() => onOpen(latest.id)} />
            </List>
          </LitPanel>
        </section>
      )}
    </div>
  );
}
