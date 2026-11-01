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
  listDeliveries,
  listRecipes,
  pauseAutomation,
  type AutomationOut,
  type BroadcastOut,
  type MessagingSummary,
} from "../../api/messaging";
import { useCardLanguage } from "../../hooks/useCardLanguage";
import { useLightboxPage } from "../../theme/lightboxPage";
import { useArrivals } from "./arrival";
import { formatCount } from "./format";
import { problemKey } from "./problem";
import { BroadcastRow, BroadcastSheet } from "./messages/Broadcasts";
import { PersonalRow, PersonalSheet } from "./messages/PersonalSends";
import { RecipeList, RecipeSheet } from "./messages/RecipeSheet";
import { RuleRow } from "./messages/RuleRow";
import {
  isLate,
  keepOrder,
  messagesNotice,
  orderRules,
  ruleName,
  ruleReach,
  ruleState,
  type MessagesNotice,
} from "./messages/rules";
import { sendOrigin, sentHistory } from "./messages/sentHistory";

type TabKey = "rules" | "broadcast" | "sent";
const TABS: readonly TabKey[] = ["rules", "broadcast", "sent"];
/** Sent shows ten more at a time, and each of its feeds pages by as many. */
const SENT_PAGE = 10;

/** A sheet open on one of Sent's rows. */
type Opened = { type: "broadcast"; id: string } | { type: "personal"; id: number };

/** What a composer or an editor hands over on navigate: what to say, and
 * the broadcast or the rule it sent or saved. */
type Handover = { flash?: string; arrived?: string } | null;

/** The page after the last, while what is loaded falls short of the count. */
function nextPage<Page extends { items: unknown[]; count: number }>(last: Page, pages: Page[]): number | undefined {
  return pages.reduce((sum, page) => sum + page.items.length, 0) < last.count ? pages.length + 1 : undefined;
}

/** A paged list's count, as its latest page gave it. */
function countOf(data: { pages: { count: number }[] } | undefined): number {
  return data && data.pages.length > 0 ? data.pages[data.pages.length - 1].count : 0;
}

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
 *
 * Sent holds the broadcasts and the personal sends (the rules', and the
 * messages to one customer from Customers) as one history, from two calls
 * merged by `sentHistory`.
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
  const [flash] = useState<string | null>(() => (location.state as Handover)?.flash ?? null);
  const [arrived] = useState<string | null>(() => (location.state as Handover)?.arrived ?? null);
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
    queryFn: ({ pageParam }) => listBroadcasts(businessId!, pageParam, SENT_PAGE),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: !!businessId,
    // A broadcast in flight reports its progress: poll until it settles.
    refetchInterval: (query) =>
      query.state.data?.pages.some((page) => page.items.some((b) => b.status === "sending")) ? 3_000 : false,
  });
  // The rules' sends and the messages to one customer. A broadcast's own
  // rows, one per customer, stay out: the broadcasts above count them.
  const personal = useInfiniteQuery({
    queryKey: ["deliveries", businessId, "personal"],
    queryFn: ({ pageParam }) => listDeliveries(businessId!, undefined, pageParam, SENT_PAGE, "broadcast"),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: !!businessId,
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
  const sends = useMemo(() => personal.data?.pages.flatMap((page) => page.items) ?? [], [personal.data]);

  // One polite voice for what changed out of sight: a switched rule, and a
  // broadcast that has finished.
  const [said, setSaid] = useState("");
  const sending = sent.find((b) => b.status === "sending");
  // The sending line lights on when it appears in a page already drawn
  // without it, as the history read again after a send brings it. One
  // already sending when the page opens is shown as it is.
  const [drewWithout, setDrewWithout] = useState(false);
  if (broadcasts.data && !sending && !drewWithout) setDrewWithout(true);
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
  // From the first switch on, the rules keep the order on screen until the
  // page is opened again, so no row moves out from under the finger.
  const [heldOrder, setHeldOrder] = useState<string[] | null>(null);
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
  const [opened, setOpened] = useState<Opened | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const openBroadcast = opened?.type === "broadcast" ? (sent.find((b) => b.id === opened.id) ?? null) : null;
  const openSend = opened?.type === "personal" ? (sends.find((d) => d.id === opened.id) ?? null) : null;
  const openSheet = (next: Opened) => {
    setOpened(next);
    setSheetOpen(true);
  };

  // "10 more" asks for ten more rows, and the feed that holds the list back
  // pages until they are there or both feeds have run out. A page that
  // fails stops it, and is said where the button was.
  const history = sentHistory(
    { items: sent, count: countOf(broadcasts.data), more: broadcasts.hasNextPage },
    { items: sends, count: countOf(personal.data), more: personal.hasNextPage },
  );
  const [want, setWant] = useState(SENT_PAGE);
  const shown = history.entries.slice(0, want);
  const pager = history.next === "broadcasts" ? broadcasts : history.next === "personal" ? personal : null;
  const read = !!broadcasts.data && !!personal.data;
  const paging = pager?.isFetching ?? false;
  const pageFailed = pager?.isFetchNextPageError ?? false;
  useEffect(() => {
    if (!read || !pager || paging || pageFailed || history.entries.length >= want) return;
    void pager.fetchNextPage();
  }, [read, pager, paging, pageFailed, history.entries.length, want]);

  const activate = (
    <LinkButton to="/dashboard/billing" variant="primary" className="max-w-full !whitespace-normal text-center">
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
            <LinkButton to="/dashboard/billing" variant="secondary" className="max-w-full !whitespace-normal text-center">
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

  const ordered = heldOrder ? keepOrder(rules, heldOrder, canReachOne) : orderRules(rules, canReachOne);
  // What the composer sent or the editor saved lights on once, in the row
  // it landed in: with the page, or a beat after it, when the list kept
  // from before is read again and the row drops in.
  const landed =
    (tab === "sent" && shown.some((entry) => entry.type === "broadcast" && entry.broadcast.id === arrived)) ||
    (tab === "rules" && ordered.some((rule) => rule.id === arrived));
  const arrive = useArrivals(arrived && landed ? [arrived] : []);

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
                    setHeldOrder((held) => held ?? ordered.map((item) => item.id));
                    toggle.mutate({ rule, on });
                  }}
                  problem={refusals[rule.id] ? refusal(refusals[rule.id]) : undefined}
                  className={arrive(rule.id)}
                />
              );
            })}
          </List>
        </LitPanel>
        <Button variant="secondary" icon={<Plus aria-hidden />} onClick={() => setPicking(true)} className="self-start max-w-full !whitespace-normal text-center">
          {t("messaging.automations.new")}
        </Button>
        <RecipeSheet open={picking} onClose={() => setPicking(false)} {...recipeList} />
      </div>
    );
  })();

  const sentPanel = (() => {
    // One read: until both feeds have answered, nothing can be placed.
    const unread = [broadcasts, personal].find((feed) => !feed.data && (feed.isError || feed.fetchStatus === "paused"));
    if (unread) {
      return (
        <ReadProblem
          title={t("messaging.loadFailed.sent")}
          error={unread.error}
          paused={!unread.isError}
          onRetry={() => {
            if (!broadcasts.data) void broadcasts.refetch();
            if (!personal.data) void personal.refetch();
          }}
        />
      );
    }
    if (!read) {
      return (
        <LitPanel className="overflow-hidden">
          <SkeletonRows rows={4} />
        </LitPanel>
      );
    }
    if (shown.length === 0) {
      return <EmptyState icon={<Inbox />} title={t("messaging.history.empty")} />;
    }
    const further = shown.length < history.entries.length || history.next !== null;
    // Rows written while the owner pages can leave the counts a row behind;
    // the button still says at least one.
    const more = Math.max(1, Math.min(SENT_PAGE, history.total - shown.length));
    return (
      <div className="flex flex-col gap-3">
        <LitPanel className="overflow-hidden">
          <List>
            {shown.map((entry) =>
              entry.type === "broadcast" ? (
                <BroadcastRow
                  key={`broadcast-${entry.broadcast.id}`}
                  broadcast={entry.broadcast}
                  businessName={businessName}
                  onOpen={() => openSheet({ type: "broadcast", id: entry.broadcast.id })}
                  className={arrive(entry.broadcast.id)}
                />
              ) : (
                <PersonalRow
                  key={`send-${entry.send.id}`}
                  send={entry.send}
                  origin={sendOrigin(entry.send, rules, t)}
                  onOpen={() => openSheet({ type: "personal", id: entry.send.id })}
                />
              ),
            )}
          </List>
        </LitPanel>
        {pageFailed ? (
          <ReadProblem
            title={t("messaging.loadFailed.older")}
            error={pager?.error}
            onRetry={() => void pager?.fetchNextPage()}
          />
        ) : (
          further && (
            <Button
              variant="secondary"
              busy={shown.length < want}
              onClick={() => setWant(shown.length + SENT_PAGE)}
              className="self-start max-w-full !whitespace-normal text-center"
            >
              {t("messaging.history.more", { count: more })}
            </Button>
          )
        )}
      </div>
    );
  })();

  return (
    <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-5">
      <header className="flex flex-col gap-1">
        {/* "messages" alone is wider than a 320px phone's line at 200% text:
            the word breaks rather than run out of the page. */}
        <h1 className="type-title text-ink [overflow-wrap:anywhere]">{t("messaging.title")}</h1>
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
        // The count updates in place every 3 seconds, with no motion, and
        // isn't read out each time; the end is said once, below.
        <LitPanel light="lit" arrive={drewWithout} className="flex items-center gap-3 p-4">
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
            onOpen={(id) => openSheet({ type: "broadcast", id })}
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
      <PersonalSheet
        send={openSend}
        origin={openSend ? sendOrigin(openSend, rules, t) : ""}
        open={sheetOpen && !!openSend}
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
    // On a phone the panel's sides and the button's hold at 20px as the text
    // grows. The words stand beside the pen while their longest word fits
    // there, never below that word, so at 100% on a 320px screen they still
    // take two lines beside it; with large text, where they don't fit, they
    // go under it: at 200% on that screen "yourself" had 36px beside the pen.
    return (
      <LitPanel className="flex flex-col items-start gap-4 p-5 sm:p-6 max-sm:px-[min(1.25rem,20px)]">
        <p className="type-body text-ink">{t("messaging.broadcast.freeLine")}</p>
        <LinkButton to="/dashboard/messages/new" variant="secondary" icon={<PenLine aria-hidden />} className="max-w-full !whitespace-normal text-center max-sm:flex-wrap max-sm:px-[min(1.25rem,20px)]">
          <span className="min-w-min max-w-max flex-1">{t("messaging.broadcast.writeSample")}</span>
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
      {/* On a phone the panel's sides and its buttons' hold at 20px as the
          text grows, and the pen goes above the words where they can't stand
          beside it: at 200% on a 320px screen "message" alone was wider than
          the 36px left there. */}
      <LitPanel className="flex flex-col items-start gap-3 p-5 sm:p-6 max-sm:px-[min(1.25rem,20px)]">
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
          <LinkButton to="/dashboard/standee" variant="secondary" className="max-w-full !whitespace-normal text-center max-sm:px-[min(1.25rem,20px)]">
            {t("messaging.broadcast.toStandee")}
          </LinkButton>
        ) : open && !spent ? (
          <LinkButton to="/dashboard/messages/new" variant="primary" icon={<PenLine aria-hidden />} className="max-w-full !whitespace-normal text-center max-sm:flex-wrap max-sm:px-[min(1.25rem,20px)]">
            {t("messaging.broadcast.write")}
          </LinkButton>
        ) : (
          <Button variant="primary" icon={<PenLine aria-hidden />} disabled aria-describedby={open ? "broadcast-quota" : undefined} className="max-w-full !whitespace-normal text-center max-sm:flex-wrap max-sm:px-[min(1.25rem,20px)]">
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
