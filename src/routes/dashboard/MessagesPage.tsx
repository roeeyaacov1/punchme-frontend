import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowRight, Cake, Gift, Plus, Send, UserRoundX } from "lucide-react";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import {
  Figure,
  Notice,
  Panel,
  PanelHeader,
  Tag,
  Toggle,
} from "../../components/dashboard/primitives";
import {
  describeAutomation,
  formatWhen,
  messagingErrorMessage,
} from "../../components/messaging/describe";
import { useBusiness } from "../../business/useBusiness";
import { listTemplates } from "../../api/businesses";
import {
  activateAutomation,
  getMessagingSummary,
  listAutomations,
  listBroadcasts,
  listRecipes,
  pauseAutomation,
  type AutomationOut,
  type BroadcastOut,
  type RecipeOut,
} from "../../api/messaging";
import { useCardLanguage } from "../../hooks/useCardLanguage";
import { cn } from "../../lib/cn";

const BROADCAST_PAGE = 10;
const STALE_TICK_MS = 60 * 60 * 1000;

const KIND_ICONS = {
  inactive: UserRoundX,
  birthday: Cake,
  reward_waiting: Gift,
  broadcast: Send,
} as const;

export function MessagesPage() {
  const { t, i18n } = useTranslation();
  const { business, isPro } = useBusiness();
  const location = useLocation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const businessId = business?.id ?? undefined;
  const lang = i18n.resolvedLanguage ?? "he";

  const [picking, setPicking] = useState(false);
  const [page, setPage] = useState(1);
  const [toggleError, setToggleError] = useState<string | null>(null);
  // The one-shot notice a composer/editor hands over on navigate. Captured
  // into state once, then cleared from history so a refresh doesn't replay
  // it — clearing alone would un-render it before anyone read it.
  const [flash] = useState<string | null>(
    () => (location.state as { flash?: string } | null)?.flash ?? null,
  );
  useEffect(() => {
    if (flash) navigate(location.pathname, { replace: true, state: null });
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
  const broadcasts = useQuery({
    queryKey: ["broadcasts", businessId, page],
    queryFn: () => listBroadcasts(businessId!, page, BROADCAST_PAGE),
    enabled: !!businessId,
    // A broadcast in flight reports progress: poll until it settles.
    refetchInterval: (query) =>
      query.state.data?.items.some((b) => b.status === "sending") ? 3_000 : false,
  });
  const { data: templates } = useQuery({
    queryKey: ["templates", businessId],
    queryFn: () => listTemplates(businessId!),
    enabled: !!businessId,
  });
  const template = templates?.[0];
  const language = useCardLanguage(businessId, template?.id ?? undefined);
  const recipes = useQuery({
    queryKey: ["recipes", businessId, language],
    queryFn: () => listRecipes(businessId!, language),
    enabled: !!businessId,
    staleTime: Infinity,
  });

  const toggle = useMutation({
    mutationFn: ({ automation, on }: { automation: AutomationOut; on: boolean }) =>
      on ? activateAutomation(businessId!, automation.id) : pauseAutomation(businessId!, automation.id),
    onMutate: () => setToggleError(null),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["automations", businessId] });
      queryClient.invalidateQueries({ queryKey: ["messaging", "summary", businessId] });
    },
    onError: (error) => setToggleError(messagingErrorMessage(error, t, lang)),
  });

  // When a broadcast in flight settles, the month's figure and the quota
  // line change too — refresh them once it does.
  const anySending = broadcasts.data?.items.some((b) => b.status === "sending") ?? false;
  const wasSending = useRef(false);
  useEffect(() => {
    if (wasSending.current && !anySending) {
      queryClient.invalidateQueries({ queryKey: ["messaging", "summary", businessId] });
    }
    wasSending.current = anySending;
  }, [anySending, businessId, queryClient]);

  const rules = useMemo(() => automations.data ?? [], [automations.data]);
  const canSend = summary.data?.can_send ?? false;
  const activeRules = rules.filter((a) => a.is_active).length;
  const lastTick = summary.data?.scheduler_last_tick_at;
  const schedulerStale =
    activeRules > 0 && (!lastTick || Date.now() - new Date(lastTick).getTime() > STALE_TICK_MS);
  const broadcastsLeft = summary.data
    ? Math.max(0, summary.data.broadcasts_limit_7d - summary.data.broadcasts_used_7d)
    : null;

  const recipeRules = (recipes.data ?? []).filter((r) => r.kind !== "broadcast");

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div>
        <h1 className="t-h3 text-ink">{t("messaging.title")}</h1>
        <p className="mt-1 max-w-2xl text-sm text-ink-muted">{t("messaging.lead")}</p>
      </div>

      {flash && <Notice tone="ok">{flash}</Notice>}

      {!isPro && (
        <Notice tone="warn">
          <span>{t("messaging.guard.pro")} </span>
          <Link
            to="/dashboard/billing"
            className={cn("font-semibold underline hover:no-underline", focusRing)}
          >
            {t("messaging.guard.proLink")}
          </Link>
        </Notice>
      )}
      {isPro && summary.data && !canSend && (
        <Notice tone="warn">{t("messaging.guard.notEnabled")}</Notice>
      )}
      {summary.data && summary.data.dispatch_enabled === false && (
        <Notice tone="warn">{t("messaging.guard.dispatchOff")}</Notice>
      )}
      {summary.data && canSend && schedulerStale && (
        <Notice tone="warn">{t("messaging.guard.schedulerStale")}</Notice>
      )}

      {/* Four figures, small: context for the two panels below. */}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {(
          [
            ["withCard", summary.data?.customers_with_card],
            ["inactive30", summary.data?.inactive_counts?.["30"]],
            ["rewardWaiting", summary.data?.reward_waiting_count],
            ["sentMonth", summary.data?.sent_this_month],
          ] as const
        ).map(([key, value]) => (
          <Panel key={key} className="px-4 py-3">
            <dd className="font-heading text-2xl font-bold tabular-nums text-ink">
              {value ?? "—"}
            </dd>
            <dt className="mt-0.5 text-xs text-ink-subtle">{t(`messaging.summary.${key}`)}</dt>
          </Panel>
        ))}
      </dl>

      {/* Broadcast */}
      <Panel className="p-5 sm:p-6">
        <PanelHeader
          title={t("messaging.broadcast.title")}
          hint={t("messaging.broadcast.hint")}
          action={
            <Link to="/dashboard/messages/new" className={ctaClasses("primary", "sm")}>
              <Send size={15} aria-hidden className="rtl:-scale-x-100" />
              {t("messaging.broadcast.cta")}
            </Link>
          }
        />
        {summary.data && (
          <p className="mt-3 text-xs text-ink-subtle">
            {summary.data.next_broadcast_allowed_at
              ? t("messaging.broadcast.nextAllowed", {
                  when: formatWhen(summary.data.next_broadcast_allowed_at, lang),
                })
              : t("messaging.broadcast.left", { count: broadcastsLeft ?? 0 })}
          </p>
        )}
      </Panel>

      {/* Automations */}
      <Panel className="p-5 sm:p-6">
        <PanelHeader
          title={t("messaging.automations.title")}
          hint={t("messaging.automations.hint")}
          action={
            rules.length > 0 && !picking ? (
              <button
                type="button"
                onClick={() => setPicking(true)}
                className={ctaClasses("secondary", "sm")}
              >
                <Plus size={15} aria-hidden />
                {t("messaging.automations.new")}
              </button>
            ) : undefined
          }
        />

        {toggleError && (
          <Notice tone="danger" className="mt-4">
            {toggleError}
          </Notice>
        )}

        {automations.isLoading ? (
          <p className="mt-4 font-mono text-sm text-ink-subtle">{t("common.loading")}</p>
        ) : (
          <>
            {rules.length > 0 && (
              <ul className="mt-4 flex flex-col divide-y divide-border">
                {rules.map((a) => (
                  <AutomationRow
                    key={a.id}
                    automation={a}
                    lang={lang}
                    pending={toggle.isPending && toggle.variables?.automation.id === a.id}
                    onToggle={(on) => toggle.mutate({ automation: a, on })}
                  />
                ))}
              </ul>
            )}

            {(rules.length === 0 || picking) && (
              <div className="mt-4 flex flex-col gap-3">
                <p className="text-sm text-ink-muted">
                  {rules.length === 0
                    ? t("messaging.automations.empty")
                    : t("messaging.automations.pickRecipe")}
                </p>
                <ul className="grid gap-3 sm:grid-cols-3">
                  {recipeRules.map((recipe) => (
                    <RecipeCard key={recipe.key} recipe={recipe} />
                  ))}
                </ul>
                {picking && (
                  <button
                    type="button"
                    onClick={() => setPicking(false)}
                    className={cn(
                      "self-start text-sm font-semibold text-ink-muted underline hover:no-underline",
                      focusRing,
                    )}
                  >
                    {t("messaging.editor.cancel")}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </Panel>

      {/* History */}
      <Panel className="p-5 sm:p-6">
        <PanelHeader title={t("messaging.history.title")} />
        {broadcasts.isLoading ? (
          <p className="mt-4 font-mono text-sm text-ink-subtle">{t("common.loading")}</p>
        ) : !broadcasts.data || broadcasts.data.items.length === 0 ? (
          <p className="mt-3 text-sm text-ink-muted">{t("messaging.history.empty")}</p>
        ) : (
          <>
            <ul className="mt-4 flex flex-col divide-y divide-border">
              {broadcasts.data.items.map((b) => (
                <BroadcastRow key={b.id} broadcast={b} lang={lang} businessName={business?.name ?? ""} />
              ))}
            </ul>
            {broadcasts.data.count > BROADCAST_PAGE && (
              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  className={ctaClasses("secondary", "sm")}
                  disabled={page <= 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  {t("common.back")}
                </button>
                <Figure className="text-sm text-ink-subtle">
                  {page} / {Math.ceil(broadcasts.data.count / BROADCAST_PAGE)}
                </Figure>
                <button
                  type="button"
                  className={ctaClasses("secondary", "sm")}
                  disabled={page * BROADCAST_PAGE >= broadcasts.data.count}
                  onClick={() => setPage((p) => p + 1)}
                >
                  {t("common.next")}
                </button>
              </div>
            )}
          </>
        )}
      </Panel>
    </div>
  );
}

function AutomationRow({
  automation: a,
  lang,
  pending,
  onToggle,
}: {
  automation: AutomationOut;
  lang: string;
  pending: boolean;
  onToggle: (on: boolean) => void;
}) {
  const { t } = useTranslation();
  const Icon = KIND_ICONS[a.kind as keyof typeof KIND_ICONS] ?? Send;
  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex min-w-0 flex-1 items-start gap-3">
        <span
          aria-hidden
          className={cn(
            "mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
            a.is_active ? "bg-primary/10 text-primary-text" : "bg-ink/[0.06] text-ink-subtle",
          )}
        >
          <Icon size={17} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/dashboard/messages/automations/${a.id}`}
              className={cn("font-semibold text-ink hover:underline", focusRing)}
            >
              {a.name}
            </Link>
            <Tag tone={a.is_active ? "ok" : "neutral"}>
              {t(a.is_active ? "messaging.automations.on" : "messaging.automations.off")}
            </Tag>
          </div>
          <p className="mt-0.5 text-sm text-ink-muted">
            {describeAutomation(a, t, lang).join(" · ")}
          </p>
          <p className="mt-0.5 text-xs text-ink-subtle">
            {t("messaging.automations.sentMonth", { count: a.sent_this_month })}
            {a.is_active && a.next_run_at && (
              <> · {t("messaging.automations.nextRun", { when: formatWhen(a.next_run_at, lang) })}</>
            )}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 sm:justify-end">
        <Toggle
          checked={a.is_active}
          disabled={pending}
          label={t("messaging.automations.switchLabel")}
          onChange={onToggle}
        />
        <Link
          to={`/dashboard/messages/automations/${a.id}`}
          className={cn(
            "inline-flex min-h-[44px] items-center gap-1 rounded-lg px-2 text-sm font-semibold text-primary-text hover:underline",
            focusRing,
          )}
        >
          {t("common.edit")}
          <ArrowRight size={15} aria-hidden className="rtl:-scale-x-100" />
        </Link>
      </div>
    </li>
  );
}

function RecipeCard({ recipe }: { recipe: RecipeOut }) {
  const { t } = useTranslation();
  const Icon = KIND_ICONS[recipe.kind as keyof typeof KIND_ICONS] ?? Send;
  const days = recipe.inactive_days ?? recipe.reward_waiting_days ?? 0;
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-border bg-background p-4">
      <div className="flex items-center gap-2">
        <span
          aria-hidden
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary-text"
        >
          <Icon size={17} />
        </span>
        <span className="font-semibold text-ink">{recipe.name}</span>
      </div>
      <p className="flex-1 text-sm text-ink-muted">
        {recipe.summary.replace("{days}", String(days))}
      </p>
      <Link
        to={`/dashboard/messages/automations/new?recipe=${recipe.key}`}
        className={ctaClasses("secondary", "sm")}
      >
        {t("messaging.automations.start")}
      </Link>
    </li>
  );
}

function BroadcastRow({
  broadcast: b,
  lang,
  businessName,
}: {
  broadcast: BroadcastOut;
  lang: string;
  businessName: string;
}) {
  const { t } = useTranslation();
  const sending = b.status === "sending";
  return (
    <li className="flex flex-col gap-2 py-3 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:gap-4">
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-ink" dir="auto">
          {b.title || businessName}
        </p>
        <p className="truncate text-sm text-ink-muted" dir="auto">
          {b.body}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3 text-xs text-ink-subtle sm:justify-end">
        <time dateTime={b.created_at} className="font-mono tabular-nums">
          {formatWhen(b.created_at, lang)}
        </time>
        <Figure>
          {t("messaging.history.sentOf", { sent: b.sent_count, total: b.audience_count })}
        </Figure>
        {b.failed_count > 0 && (
          <span className="text-warn">{t("messaging.history.failed", { count: b.failed_count })}</span>
        )}
        <Tag tone={sending ? "accent" : "neutral"}>
          {t(`messaging.history.status.${sending ? "sending" : "sent"}`)}
        </Tag>
      </div>
    </li>
  );
}
