import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Trans, useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, CircleAlert, CircleCheck, Send, Trash2 } from "lucide-react";
import {
  Button,
  Dialog,
  Input,
  LinkButton,
  LitPanel,
  Loading,
  Notice,
  Skeleton,
  Switch,
} from "../../components/kit";
import { ReadProblem } from "../../components/dashboard/ReadProblem";
import { usePageTitle } from "../../components/dashboard/shell/pageTitle";
import { PUNCHME_MONTHLY_PRICE } from "../../components/marketing/calculator";
import { FieldSection, MessageFields } from "../../components/messaging/MessageFields";
import { MessageStage } from "../../components/messaging/MessageStage";
import { formatHour, messagingErrorMessage, relativeWhen, uiDays } from "../../components/messaging/describe";
import { EMPTY_MESSAGE, hasGift, messageReady, previewOf } from "../../components/messaging/messageDraft";
import { dropDraft, readDraft, writeDraft } from "../../components/messaging/sessionDraft";
import { useBusiness } from "../../business/useBusiness";
import { isOwner } from "../../business/gating";
import { listTemplates } from "../../api/businesses";
import { getTemplateDesign } from "../../api/designs";
import { ApiError } from "../../api/errors";
import {
  createAutomation,
  deleteAutomation,
  getAudienceCount,
  getAutomation,
  getMessagingSummary,
  listRecipes,
  patchAutomation,
  sendTestMessage,
  type AutomationIn,
  type AutomationKind,
  type AutomationOut,
  type RecipeOut,
} from "../../api/messaging";
import { useCardLanguage } from "../../hooks/useCardLanguage";
import { useDebounce } from "../../hooks/useDebounce";
import { recipeBody } from "../../lib/messageTemplate";
import { useLightboxPage } from "../../theme/lightboxPage";
import { formatCount } from "./format";
import { problemKey } from "./problem";
import { KIND_ICONS } from "./messages/RuleRow";
import { RuleSends } from "./messages/RuleSends";
import { RuleWhen } from "./messages/RuleWhen";
import { nextRunAt, ruleSentence, triggerValid, type RuleDraft } from "./messages/ruleSentence";
import { ruleName } from "./messages/rules";

const RECIPE_KINDS: Record<string, AutomationKind> = {
  winback: "inactive",
  birthday: "birthday",
  reward_waiting: "reward_waiting",
};

/** A number inside a sentence, in tabular figures with its own direction. */
const figure = <span dir="ltr" className="type-figure" />;

function fromRecipe(recipe: RecipeOut): RuleDraft {
  const gift = recipe.gift_stamps > 0 || recipe.gift_complete_card;
  return {
    ...EMPTY_MESSAGE,
    name: recipe.name,
    kind: recipe.kind as AutomationKind,
    title: recipe.title,
    body: recipeBody(recipe, gift),
    gift_stamps: recipe.gift_stamps,
    gift_complete_card: recipe.gift_complete_card,
    inactive_days: recipe.inactive_days ?? 30,
    repeat_days: recipe.repeat_days ?? null,
    birthday_days_before: recipe.birthday_days_before,
    reward_waiting_days: recipe.reward_waiting_days ?? 7,
    send_hour_local: recipe.send_hour_local,
  };
}

function fromAutomation(rule: AutomationOut): RuleDraft {
  return {
    name: rule.name,
    kind: rule.kind as AutomationKind,
    title: rule.title,
    body: rule.body,
    gift_stamps: rule.gift_stamps,
    gift_complete_card: rule.gift_complete_card,
    inactive_days: rule.inactive_days ?? 30,
    repeat_days: rule.repeat_days ?? null,
    birthday_days_before: rule.birthday_days_before,
    reward_waiting_days: rule.reward_waiting_days ?? 7,
    send_hour_local: rule.send_hour_local,
    opt_in_only: rule.opt_in_only,
    template_id: rule.template_id ?? null,
  };
}

/** A draft back from the session: a number that wasn't one comes back null. */
function fromSession(saved: RuleDraft): RuleDraft {
  const number = (value: unknown) => (typeof value === "number" ? value : Number.NaN);
  return {
    ...saved,
    inactive_days: number(saved.inactive_days),
    reward_waiting_days: number(saved.reward_waiting_days),
    repeat_days: saved.repeat_days === null ? null : number(saved.repeat_days),
  };
}

function toPayload(draft: RuleDraft, fallbackName: string): AutomationIn {
  return {
    name: draft.name.trim() || fallbackName,
    kind: draft.kind,
    title: draft.title.trim(),
    body: draft.body.trim(),
    gift_stamps: draft.kind === "reward_waiting" ? 0 : draft.gift_stamps,
    gift_complete_card: draft.kind === "reward_waiting" ? false : draft.gift_complete_card,
    inactive_days: draft.kind === "inactive" ? draft.inactive_days : null,
    repeat_days: draft.kind === "inactive" ? draft.repeat_days : null,
    birthday_days_before: draft.kind === "birthday" ? draft.birthday_days_before : 0,
    reward_waiting_days: draft.kind === "reward_waiting" ? draft.reward_waiting_days : null,
    send_hour_local: draft.send_hour_local,
    opt_in_only: draft.opt_in_only,
    template_id: draft.template_id,
    is_active: false,
  };
}

/**
 * One rule, new or existing. It says the rule before it asks anything: the
 * rule in one sentence on a lit panel, live with the 350ms count, and the
 * message on the owner's pass as it lands, with the one action under them;
 * then the fields, each a panel under its own heading, the name last.
 *
 * The win-back in three taps stays three taps: a starter fills everything,
 * and "Save and turn on" is in reach, docked above the phone bar on a phone
 * and beside the fields from 1024px. Where switching on can't happen (Free,
 * sending not open, rules on hold) the action says "Save as off" instead.
 * The draft is kept in the tab while the owner steps away.
 *
 * Keyed by the rule: a new rule and each saved one are separate screens, so
 * going from one to another without the list in between (back and forward)
 * starts the draft over instead of showing the last one under the new
 * address.
 */
export function AutomationEditorPage() {
  const { automationId } = useParams();
  const [searchParams] = useSearchParams();
  return <AutomationEditor key={automationId ?? `new-${searchParams.get("recipe") ?? "winback"}`} />;
}

function AutomationEditor() {
  useLightboxPage();
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";
  const { business, role, isPro } = useBusiness();
  const owns = isOwner(role);
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { automationId } = useParams();
  const [searchParams] = useSearchParams();
  const businessId = business?.id ?? undefined;
  const businessName = business?.name ?? "";
  const isNew = !automationId;
  const recipeKey = searchParams.get("recipe") ?? "winback";

  // Kept per business and per rule, so nothing crosses an account or a rule.
  const draftKey = `${businessId}/messages/rule/${automationId ?? `new-${recipeKey}`}`;
  const [restored] = useState(() => {
    const saved = businessId ? readDraft<RuleDraft>(draftKey) : null;
    return saved ? fromSession(saved) : null;
  });
  const [draft, setDraft] = useState<RuleDraft | null>(restored);
  const [touched, setTouched] = useState(!!restored);
  const [bodyTouched, setBodyTouched] = useState(!!restored);
  const seededFor = useRef<string | null>(restored ? "session" : null);
  const [problem, setProblem] = useState<unknown>(null);
  const [switchProblem, setSwitchProblem] = useState<unknown>(null);
  const [sample, setSample] = useState<"idle" | "sent" | { error: unknown }>("idle");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [said, setSaid] = useState("");
  // Bumped whenever the draft starts over, so the "When" section's own
  // state (an "Other" number being typed) starts over with it.
  const [generation, setGeneration] = useState(0);
  const cancelDelete = useRef<HTMLButtonElement>(null);
  const titleInput = useRef<HTMLInputElement>(null);

  const templates = useQuery({
    queryKey: ["templates", businessId],
    queryFn: () => listTemplates(businessId!),
    enabled: !!businessId,
  });
  const template = templates.data?.[0];
  const templateId = template?.id ?? undefined;
  const language = useCardLanguage(businessId, templateId);
  const design = useQuery({
    queryKey: ["design", templateId],
    queryFn: () => getTemplateDesign(businessId!, templateId!),
    enabled: !!businessId && !!templateId,
    staleTime: 60_000,
  });
  const recipes = useQuery({
    queryKey: ["recipes", businessId, language],
    queryFn: () => listRecipes(businessId!, language),
    enabled: !!businessId && isNew,
    staleTime: Infinity,
  });
  const existing = useQuery({
    queryKey: ["automation", businessId, automationId],
    queryFn: () => getAutomation(businessId!, automationId!),
    enabled: !!businessId && !isNew,
  });
  const summary = useQuery({
    queryKey: ["messaging", "summary", businessId],
    queryFn: () => getMessagingSummary(businessId!),
    enabled: !!businessId,
    staleTime: 10_000,
  });
  const facts = summary.data;
  // Unknown reads as fine, the way Messages reads it.
  const canReachOne = facts?.can_reach_one_customer ?? true;

  const recipe = useMemo(
    () =>
      recipes.data?.find((r) => r.key === recipeKey && r.kind !== "broadcast") ??
      recipes.data?.find((r) => r.kind === (RECIPE_KINDS[recipeKey] ?? "inactive")),
    [recipes.data, recipeKey],
  );

  // Seeded from the starter (new) or the saved rule (existing), and again
  // if the card's language swaps the starter's copy, but never over what
  // the owner has typed.
  useEffect(() => {
    if (touched) return;
    if (isNew && recipe) {
      const key = `recipe:${recipe.key}:${language}`;
      if (seededFor.current !== key) {
        seededFor.current = key;
        setDraft(fromRecipe(recipe));
        setBodyTouched(false);
        setGeneration((n) => n + 1);
      }
    } else if (!isNew && existing.data && seededFor.current !== `rule:${existing.data.id}`) {
      seededFor.current = `rule:${existing.data.id}`;
      setDraft(fromAutomation(existing.data));
      setBodyTouched(true);
      setGeneration((n) => n + 1);
    }
  }, [touched, isNew, recipe, language, existing.data]);

  useEffect(() => {
    if (touched && draft && businessId) writeDraft(draftKey, draft);
  }, [touched, draft, draftKey, businessId]);

  function update(patch: Partial<RuleDraft>) {
    setDraft((current) => {
      if (!current) return current;
      let next = { ...current, ...patch };
      // While the starter's text is untouched, the gift swaps it for the
      // starter's other body, so the text never promises a gift it lacks.
      if (!bodyTouched && recipe && ("gift_stamps" in patch || "gift_complete_card" in patch)) {
        next = { ...next, body: recipeBody(recipe, hasGift(next)) };
      }
      return next;
    });
    if ("body" in patch) setBodyTouched(true);
    setTouched(true);
    setProblem(null);
    setSample("idle");
  }

  function discard() {
    dropDraft(draftKey);
    setTouched(false);
    seededFor.current = null;
    setProblem(null);
    setSample("idle");
    if (isNew && recipe) setDraft(fromRecipe(recipe));
    else if (existing.data) setDraft(fromAutomation(existing.data));
    setBodyTouched(!isNew);
    setGeneration((n) => n + 1);
    titleInput.current?.focus();
  }

  // The live count, 350ms after the trigger settles, and only for one the
  // API would take.
  const settled = useDebounce(draft, 350);
  const audience = useQuery({
    queryKey: [
      "messaging",
      "audience",
      businessId,
      settled?.kind,
      settled?.inactive_days,
      settled?.reward_waiting_days,
      settled?.birthday_days_before,
      settled?.opt_in_only,
      settled?.template_id,
    ],
    queryFn: () =>
      getAudienceCount(businessId!, {
        kind: settled!.kind,
        inactive_days: settled!.kind === "inactive" ? settled!.inactive_days : undefined,
        reward_waiting_days: settled!.kind === "reward_waiting" ? settled!.reward_waiting_days : undefined,
        birthday_days_before: settled!.kind === "birthday" ? settled!.birthday_days_before : undefined,
        opt_in_only: settled!.opt_in_only,
        template_id: settled!.template_id ?? undefined,
      }),
    enabled: !!businessId && !!settled && triggerValid(settled),
    staleTime: 10_000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["automations", businessId] });
    void queryClient.invalidateQueries({ queryKey: ["automation", businessId] });
    void queryClient.invalidateQueries({ queryKey: ["messaging", "summary", businessId] });
  };

  const kindName = draft ? t(`messaging.kinds.${draft.kind}`) : "";
  const save = useMutation({
    // `activate` true turns the rule on, false saves it off, and undefined
    // leaves on or off as it is: the header switch owns that.
    mutationFn: async ({ activate }: { activate?: boolean }) => {
      const payload = toPayload(draft!, kindName);
      if (isNew) return createAutomation(businessId!, { ...payload, is_active: activate ?? false });
      return patchAutomation(businessId!, automationId!, {
        name: payload.name,
        title: payload.title,
        body: payload.body,
        gift_stamps: payload.gift_stamps,
        gift_complete_card: payload.gift_complete_card,
        inactive_days: payload.inactive_days,
        repeat_days: payload.repeat_days,
        birthday_days_before: payload.birthday_days_before,
        reward_waiting_days: payload.reward_waiting_days,
        send_hour_local: payload.send_hour_local,
        opt_in_only: payload.opt_in_only,
        template_id: payload.template_id,
        ...(activate === undefined ? {} : { is_active: activate }),
      });
    },
    onSuccess: (saved, { activate }) => {
      dropDraft(draftKey);
      invalidate();
      let flash: string;
      if (!saved.is_active) flash = t("messaging.editor.savedOff");
      else if (!saved.next_run_at) flash = t("messaging.editor.savedOnNoRun");
      else {
        const when = relativeWhen(saved.next_run_at, t, lang);
        flash = t(isNew || activate ? "messaging.editor.savedOn" : "messaging.editor.savedOnNext", { when });
      }
      // Rules lights the row of the rule just saved.
      navigate("/dashboard/messages?tab=rules", { state: { flash, arrived: saved.id } });
    },
    onError: (error) => setProblem(error),
  });

  const toggle = useMutation({
    mutationFn: (on: boolean) => patchAutomation(businessId!, automationId!, { is_active: on }),
    onMutate: () => setSwitchProblem(null),
    onSuccess: (saved) => {
      queryClient.setQueryData(["automation", businessId, automationId], saved);
      invalidate();
      const name = ruleName(saved, t);
      setSaid(
        saved.is_active
          ? saved.next_run_at
            ? t("messaging.rules.switchedOn", { name, when: relativeWhen(saved.next_run_at, t, lang) })
            : t("messaging.rules.switchedOnNoRun", { name })
          : t("messaging.rules.switchedOff", { name }),
      );
    },
    onError: (error) => setSwitchProblem(error),
  });

  const test = useMutation({
    mutationFn: () =>
      sendTestMessage(businessId!, {
        kind: draft!.kind,
        title: draft!.title.trim(),
        body: draft!.body.trim(),
        gift_stamps: draft!.kind === "reward_waiting" ? 0 : draft!.gift_stamps,
        gift_complete_card: draft!.kind === "reward_waiting" ? false : draft!.gift_complete_card,
        inactive_days: draft!.kind === "inactive" ? draft!.inactive_days : null,
        reward_waiting_days: draft!.kind === "reward_waiting" ? draft!.reward_waiting_days : null,
        template_id: draft!.template_id,
      }),
    onSuccess: () => {
      setSample("sent");
      void queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
    onError: (error) => setSample({ error }),
  });

  const remove = useMutation({
    mutationFn: () => deleteAutomation(businessId!, automationId!),
    onSuccess: () => {
      dropDraft(draftKey);
      invalidate();
      navigate("/dashboard/messages?tab=rules", { state: { flash: t("messaging.automations.deleted") } });
    },
    onError: (error) => {
      setConfirmDelete(false);
      setProblem(error);
    },
  });

  const words = (error: unknown) =>
    error instanceof ApiError && error.code ? messagingErrorMessage(error, t, lang) : t(problemKey(error));

  /** A refusal under the control that caused it: the plan's own with the
   * owner's Activate or the hire's line, anything else in its sentence. */
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
    return (
      <div role="alert" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
        <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
        <span>{words(error)}</span>
      </div>
    );
  }

  // Its sides hold at 20px on a phone as the text grows, so "messages" fits
  // beside the arrow at 200% on a 320px screen.
  const back = (
    <LinkButton
      to="/dashboard/messages?tab=rules"
      variant="quiet"
      icon={<ArrowLeft aria-hidden className="rtl:-scale-x-100" />}
      className="-ms-3 self-start max-w-full !whitespace-normal text-center max-sm:-ms-[min(0.75rem,12px)] max-sm:px-[min(1.25rem,20px)]"
    >
      {t("messaging.editor.back")}
    </LinkButton>
  );

  // The tab and the route announcement name the rule, as its heading does,
  // rather than the list it was opened from.
  usePageTitle(draft ? (isNew ? kindName : ruleName(existing.data ?? draft, t)) : t("messaging.title"));

  // A rule that is gone says so with the way back; a read that failed
  // offers to try again.
  if (!draft) {
    const failed = isNew ? recipes : existing;
    const gone = failed.error instanceof ApiError && failed.error.status === 404;
    if (gone) {
      return (
        <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-5">
          {back}
          <Notice tone="warn" title={t("messaging.editor.notFound")} />
        </div>
      );
    }
    if (failed.isError || failed.fetchStatus === "paused") {
      return (
        <div className="mx-auto flex w-full max-w-[45rem] flex-col gap-5">
          {back}
          <ReadProblem
            title={t("messaging.editor.loadFailed")}
            error={failed.error}
            paused={!failed.isError}
            onRetry={() => void failed.refetch()}
          />
        </div>
      );
    }
    return (
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 [container-type:inline-size]">
        {back}
        <Loading className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-8 [@container(max-width:52rem)]:lg:grid-cols-1 [@container(max-width:52rem)]:lg:gap-5">
          <div className="flex flex-col gap-5">
            <Skeleton className="h-9 w-48" />
            <Skeleton className="h-64 w-full rounded-panel" />
            <Skeleton className="h-80 w-full rounded-panel" />
          </div>
          <Skeleton className="h-[28rem] w-full rounded-glass" />
        </Loading>
      </div>
    );
  }

  const Icon = KIND_ICONS[draft.kind as keyof typeof KIND_ICONS] ?? Send;
  const rule = existing.data;
  const isActive = rule?.is_active ?? false;
  const canSend = facts?.can_send ?? true;
  // Switching on, now or on saving: Pro, sending open for this business,
  // and a wallet that can address one card. Unknown reads as possible; the
  // API refuses otherwise, and the refusal is said under the action.
  const canActivate = isPro && canSend && canReachOne;
  const count = audience.data?.count ?? null;
  const ready = messageReady(draft, draft.kind) && triggerValid(draft);
  const busy = save.isPending || remove.isPending;
  const phrase = { days: (n: number) => uiDays(n, lang), hour: formatHour };
  const pieces = triggerValid(draft) ? ruleSentence(draft, count, phrase) : [];
  const preview = previewOf(draft, {
    kind: draft.kind,
    language,
    businessName,
    rewardText: template?.reward_description ?? "",
    days: draft.kind === "inactive" ? draft.inactive_days : draft.kind === "reward_waiting" ? draft.reward_waiting_days : null,
  });
  const firstRun = relativeWhen(nextRunAt(draft.send_hour_local, new Date()).toISOString(), t, lang);

  // One notice, the first that holds.
  let notice: ReactNode = null;
  if (!isPro) {
    notice = (
      <Notice
        tone="warn"
        action={
          owns ? (
            <LinkButton to="/dashboard/billing" variant="secondary" className="max-w-full !whitespace-normal text-center">
              {t("billing.activateCta")}
            </LinkButton>
          ) : undefined
        }
      >
        {owns ? (
          <Trans
            i18nKey="messaging.free.owner"
            values={{ price: PUNCHME_MONTHLY_PRICE }}
            components={{ ltr: <bdi dir="ltr" className="type-figure" /> }}
          />
        ) : (
          t("messaging.free.hire")
        )}
      </Notice>
    );
  } else if (facts && !facts.can_send) notice = <Notice tone="warn">{t("messaging.guard.notEnabled")}</Notice>;
  else if (facts && !facts.can_reach_one_customer) {
    notice = <Notice tone="warn">{t("messaging.guard.personalOnHold")}</Notice>;
  }

  // The one action, and what the secondary save says where switching on is
  // possible but the owner wants the rule saved off.
  let primary: { label: string; activate?: boolean };
  if (!isNew && isActive) primary = { label: t("messaging.editor.saveChanges") };
  else if (canActivate) primary = { label: t("messaging.editor.saveOn"), activate: true };
  else primary = { label: t("messaging.editor.saveOff"), activate: false };
  const offeredOff = (isNew || !isActive) && canActivate;

  const shortForm =
    (draft.kind === "inactive" || draft.kind === "reward_waiting") && count !== null && count > 0
      ? t("messaging.sentence.short", { when: firstRun, count, value: formatCount(count, lang) })
      : firstRun;

  return (
    // The page's column is a container, for the two columns below.
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 [container-type:inline-size]">
      <header className="flex flex-col gap-1">
        {back}
        {/* With large text on a phone, where the name can't keep a word's
            room beside the icon and the switch, the switch goes under it, at
            the end: at 200% on a 375px screen it left the name 16px. The
            heading grows from nothing to its own width, never below its
            longest word, so only that sends the switch under. */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <h1 className="type-title flex min-w-min max-w-max flex-1 items-center gap-3 text-ink">
            <span aria-hidden className="flex size-11 shrink-0 items-center justify-center rounded-full bg-background text-ink-muted [&_svg]:size-6">
              <Icon />
            </span>
            <span dir="auto" className="min-w-0 [overflow-wrap:anywhere] [text-align:-webkit-match-parent] [text-align:match-parent]">
              {isNew ? kindName : ruleName(rule ?? draft, t)}
            </span>
          </h1>
          {rule && (
            <Switch
              // Ahead of the server while it saves, and never disabled for
              // it, which would drop the keyboard's focus.
              checked={toggle.isPending ? !!toggle.variables : isActive}
              disabled={!isActive && !canActivate}
              onChange={(on) => {
                if (!toggle.isPending) toggle.mutate(on);
              }}
              label={
                <>
                  <span className="sr-only">{ruleName(rule, t)}</span>
                  <span aria-hidden>{t(isActive ? "messaging.automations.on" : "messaging.automations.off")}</span>
                </>
              }
              className="ms-auto shrink-0 pt-1"
            />
          )}
        </div>
        {switchProblem !== null && <div className="mt-2">{refusal(switchProblem)}</div>}
        <p role="status" className="sr-only">
          {said}
        </p>
      </header>

      {notice}

      {/* Two columns from 1024px while the page's column is at least 52rem,
          as it always is at the default text size (54.5rem at 1024, less a
          scrollbar). Large text narrows it in rem: at 200% on a 1280px
          screen it is 19rem, and the 22rem phone would leave the rule no
          column at all. Then the phone stands first and scrolls with the
          page, as on a tablet. */}
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:gap-8 [@container(max-width:52rem)]:lg:grid-cols-1 [@container(max-width:52rem)]:lg:gap-5">
        {/* Held clear of the masthead, which stands over the page until
            1280px, as the page's own scroll margin is. */}
        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-[calc(5.5rem+env(safe-area-inset-top))] lg:order-last xl:top-8 [@container(max-width:52rem)]:lg:static [@container(max-width:52rem)]:lg:order-none">
          <LitPanel light="lit" className="flex flex-col gap-3 p-5">
            <p role="status" className="type-body text-ink">
              {pieces.length === 0 ? (
                <span className="text-ink-muted">{t("messaging.sentence.invalid")}</span>
              ) : (
                pieces.map((piece, index) => (
                  <span key={piece.key}>
                    {index > 0 && " "}
                    {piece.count === undefined ? (
                      t(piece.key, piece.values)
                    ) : (
                      <Trans
                        i18nKey={piece.key}
                        count={piece.count}
                        values={{ ...piece.values, value: formatCount(piece.count, lang) }}
                        components={{ n: figure }}
                      />
                    )}
                  </span>
                ))
              )}
            </p>
            <p className="text-sm leading-snug text-ink-muted">{t("messaging.phones")}</p>
          </LitPanel>

          {template && design.data ? (
            <div className="-mx-4 flex justify-center sm:mx-0">
              <MessageStage
                businessName={businessName}
                template={template}
                design={design.data}
                notification={preview}
                summary={t("messaging.sheet.stageSummary")}
              />
            </div>
          ) : (
            <Skeleton className="mx-auto h-[28rem] w-[340px] max-w-full rounded-glass" />
          )}

          {problem !== null && refusal(problem)}

          {/* On a phone the action waits above the phone bar, with the
              sentence's short form; its padding runs under the raised Scan. */}
          <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-20 flex flex-col gap-2 border-t border-border bg-surface px-4 pb-7 pt-3 md:static md:z-auto md:border-0 md:bg-transparent md:p-0">
            <p className="text-sm leading-snug text-ink-muted md:hidden">{shortForm}</p>
            <Button
              size="lg"
              busy={save.isPending && save.variables?.activate === primary.activate}
              disabled={!ready || remove.isPending}
              onClick={() => save.mutate({ activate: primary.activate })}
              className="w-full max-w-full !whitespace-normal text-center"
            >
              {primary.label}
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-5">
          <MessageFields
            value={draft}
            onChange={update}
            kind={draft.kind}
            language={language}
            rewardText={template?.reward_description ?? ""}
            templates={templates.data?.map((tpl) => ({ id: tpl.id!, name: tpl.name }))}
            optInAvailable={canReachOne}
            disabled={busy}
            titleInputRef={titleInput}
            before={<RuleWhen key={generation} draft={draft} onChange={update} />}
          />

          <FieldSection title={t("messaging.editor.name")}>
            <Input
              label={t("messaging.editor.nameLabel")}
              dir="auto"
              value={draft.name}
              maxLength={60}
              placeholder={t("messaging.editor.namePlaceholder")}
              hint={draft.name.trim() ? undefined : t("messaging.editor.nameFallback", { name: kindName })}
              onChange={(event) => update({ name: event.target.value })}
            />
          </FieldSection>

          {rule && businessId && <RuleSends businessId={businessId} automationId={rule.id} />}

          {/* The secondary actions, then the one that removes, at the foot. */}
          <div className="flex flex-col items-start gap-3">
            <div className="flex flex-wrap gap-3">
              <Button variant="secondary" busy={test.isPending} disabled={!messageReady(draft, draft.kind) || busy} onClick={() => test.mutate()} className="max-w-full !whitespace-normal text-center">
                {t("messaging.editor.test")}
              </Button>
              {offeredOff && (
                <Button
                  variant="secondary"
                  busy={save.isPending && save.variables?.activate === false}
                  disabled={!ready || remove.isPending}
                  onClick={() => save.mutate({ activate: false })}
                  className="max-w-full !whitespace-normal text-center"
                >
                  {t("messaging.editor.saveOff")}
                </Button>
              )}
            </div>
            <p role="status" className="text-sm leading-snug">
              {sample === "sent" ? (
                <span className="flex items-start gap-1.5 text-ink">
                  <CircleCheck aria-hidden className="mt-px size-4 shrink-0 text-ok" />
                  <span>{t("messaging.editor.tested")}</span>
                </span>
              ) : sample !== "idle" ? (
                <span className="flex items-start gap-1.5 font-semibold text-danger">
                  <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
                  <span>{words(sample.error)}</span>
                </span>
              ) : null}
            </p>
            {touched && (
              <Button variant="quiet" onClick={discard} className="-ms-3 max-w-full !whitespace-normal text-center">
                {t("messaging.editor.discard")}
              </Button>
            )}
            {rule && (
              <Button variant="danger" icon={<Trash2 aria-hidden />} onClick={() => setConfirmDelete(true)} disabled={busy} className="max-w-full !whitespace-normal text-center max-sm:px-[min(1.25rem,20px)]">
                {t("messaging.editor.delete")}
              </Button>
            )}
          </div>
          {/* Room under the docked action, so the foot scrolls clear of it. */}
          <div aria-hidden className="h-28 md:hidden" />
        </div>
      </div>

      <Dialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        title={t("messaging.editor.deleteTitle")}
        description={t("messaging.editor.deleteKept")}
        initialFocus={cancelDelete}
        footer={
          <>
            <Button ref={cancelDelete} variant="secondary" onClick={() => setConfirmDelete(false)} className="max-w-full !whitespace-normal text-center">
              {t("messaging.editor.cancel")}
            </Button>
            <Button variant="danger" busy={remove.isPending} onClick={() => remove.mutate()} className="max-w-full !whitespace-normal text-center">
              {t("messaging.editor.deleteYes")}
            </Button>
          </>
        }
      />
    </div>
  );
}
