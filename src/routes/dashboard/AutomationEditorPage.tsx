import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import {
  GroupLabel,
  Notice,
  Panel,
  SegmentedControl,
  Tag,
  Toggle,
  fieldClasses,
} from "../../components/dashboard/primitives";
import { MessageForm, type MessageDraft } from "../../components/messaging/MessageForm";
import { formatHour, messagingErrorMessage, uiDays } from "../../components/messaging/describe";
import { useBusiness } from "../../business/useBusiness";
import { listTemplates } from "../../api/businesses";
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
import { useDebounce } from "../../hooks/useDebounce";
import { recipeBody } from "../../lib/messageTemplate";
import { cn } from "../../lib/cn";
import { useCardLanguage } from "../../hooks/useCardLanguage";

const INACTIVE_PRESETS = [14, 30, 60, 90];
const REWARD_PRESETS = [3, 7, 14];
const BIRTHDAY_PRESETS = [0, 1, 3, 7];
const SEND_HOURS = Array.from({ length: 14 }, (_, i) => 8 + i); // 08:00 … 21:00
const RECIPE_KEYS: Record<string, AutomationKind> = {
  winback: "inactive",
  birthday: "birthday",
  reward_waiting: "reward_waiting",
};

interface Draft extends MessageDraft {
  name: string;
  kind: AutomationKind;
  inactive_days: number;
  repeat_days: number | null;
  birthday_days_before: number;
  reward_waiting_days: number;
  send_hour_local: number;
}

function fromRecipe(recipe: RecipeOut): Draft {
  const hasGift = recipe.gift_stamps > 0 || recipe.gift_complete_card;
  return {
    name: recipe.name,
    kind: recipe.kind as AutomationKind,
    title: recipe.title,
    body: recipeBody(recipe, hasGift),
    gift_stamps: recipe.gift_stamps,
    gift_complete_card: recipe.gift_complete_card,
    inactive_days: recipe.inactive_days ?? 30,
    repeat_days: recipe.repeat_days ?? null,
    birthday_days_before: recipe.birthday_days_before,
    reward_waiting_days: recipe.reward_waiting_days ?? 7,
    send_hour_local: recipe.send_hour_local,
    opt_in_only: false,
    template_id: null,
  };
}

function fromAutomation(a: AutomationOut): Draft {
  return {
    name: a.name,
    kind: a.kind as AutomationKind,
    title: a.title,
    body: a.body,
    gift_stamps: a.gift_stamps,
    gift_complete_card: a.gift_complete_card,
    inactive_days: a.inactive_days ?? 30,
    repeat_days: a.repeat_days ?? null,
    birthday_days_before: a.birthday_days_before,
    reward_waiting_days: a.reward_waiting_days ?? 7,
    send_hour_local: a.send_hour_local,
    opt_in_only: a.opt_in_only,
    template_id: a.template_id ?? null,
  };
}

function toPayload(d: Draft): AutomationIn {
  const clean = (n: number | null) => (n !== null && Number.isFinite(n) ? n : null);
  return {
    name: d.name.trim(),
    kind: d.kind,
    title: d.title.trim(),
    body: d.body.trim(),
    gift_stamps: d.gift_stamps,
    gift_complete_card: d.gift_complete_card,
    inactive_days: d.kind === "inactive" ? clean(d.inactive_days) : null,
    repeat_days: d.kind === "inactive" ? clean(d.repeat_days) : null,
    birthday_days_before: d.kind === "birthday" ? d.birthday_days_before : 0,
    reward_waiting_days: d.kind === "reward_waiting" ? clean(d.reward_waiting_days) : null,
    send_hour_local: d.send_hour_local,
    opt_in_only: d.opt_in_only,
    template_id: d.template_id,
    is_active: false,
  };
}

function daysOf(d: Draft): number | null {
  if (d.kind === "inactive") return d.inactive_days;
  if (d.kind === "reward_waiting") return d.reward_waiting_days;
  return null;
}

function inRange(n: number, low: number, high: number): boolean {
  return Number.isFinite(n) && n >= low && n <= high;
}

function triggerValid(d: Draft): boolean {
  if (d.kind === "inactive") {
    return (
      inRange(d.inactive_days, 7, 365) &&
      (d.repeat_days === null || inRange(d.repeat_days, 7, 365))
    );
  }
  if (d.kind === "reward_waiting") return inRange(d.reward_waiting_days, 1, 90);
  return inRange(d.birthday_days_before, 0, 14);
}

/** Controlled <input type=number> helpers: an empty field is NaN in state
 * (renders as ""), never a phantom 0 the owner can't delete. */
function numberValue(n: number): number | "" {
  return Number.isFinite(n) ? n : "";
}

function parseDays(raw: string): number {
  return raw === "" ? Number.NaN : Number(raw);
}

/**
 * One rule, new or existing: WHEN (trigger + send hour) → WHAT (text, with
 * the live preview) → GIFT → WHO, then one primary button. The recipe only
 * seeds the form; after that every field is the owner's.
 */
export function AutomationEditorPage() {
  const { t, i18n } = useTranslation();
  const { business } = useBusiness();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { automationId } = useParams();
  const [searchParams] = useSearchParams();
  const businessId = business?.id ?? undefined;
  const lang = i18n.resolvedLanguage ?? "he";
  const isNew = !automationId;
  const recipeKey = searchParams.get("recipe") ?? "winback";

  const [draft, setDraft] = useState<Draft | null>(null);
  const [dirty, setDirty] = useState(false);
  const [bodyTouched, setBodyTouched] = useState(false);
  const [customDays, setCustomDays] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tested, setTested] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const seededFor = useRef<string | null>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

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
  const canSend = summary.data?.can_send ?? false;

  // Seed from the recipe (new) or the saved rule (edit). The card-language
  // query may resolve after the first paint and swap the recipe copy — but
  // only while the owner hasn't typed anything: a reseed must never clobber
  // their edits.
  useEffect(() => {
    if (dirty) return;
    if (isNew) {
      const wantedKind = RECIPE_KEYS[recipeKey] ?? "inactive"; // unknown slug -> win-back
      const recipe =
        recipes.data?.find((r) => r.key === recipeKey && r.kind !== "broadcast") ??
        recipes.data?.find((r) => r.kind === wantedKind);
      if (recipe && seededFor.current !== `recipe:${recipe.key}:${language}`) {
        seededFor.current = `recipe:${recipe.key}:${language}`;
        setDraft(fromRecipe(recipe));
        setBodyTouched(false);
      }
    } else if (existing.data && seededFor.current !== `automation:${existing.data.id}`) {
      seededFor.current = `automation:${existing.data.id}`;
      const next = fromAutomation(existing.data);
      setDraft(next);
      setBodyTouched(true);
      setCustomDays(
        (next.kind === "inactive" && !INACTIVE_PRESETS.includes(next.inactive_days)) ||
          (next.kind === "reward_waiting" && !REWARD_PRESETS.includes(next.reward_waiting_days)),
      );
    }
  }, [dirty, isNew, recipes.data, recipeKey, language, existing.data]);

  const recipe = useMemo(
    () => recipes.data?.find((r) => r.key === recipeKey || r.kind === RECIPE_KEYS[recipeKey]),
    [recipes.data, recipeKey],
  );

  function update(patch: Partial<Draft>) {
    setDraft((current) => {
      if (!current) return current;
      let next = { ...current, ...patch };
      // While the starter text is untouched, flipping the gift swaps to the
      // matching starter body so the message never promises a gift the rule
      // doesn't give.
      if (
        !bodyTouched &&
        recipe &&
        ("gift_stamps" in patch || "gift_complete_card" in patch)
      ) {
        const hasGift = next.gift_stamps > 0 || next.gift_complete_card;
        next = { ...next, body: recipeBody(recipe, hasGift) };
      }
      return next;
    });
    if ("body" in patch) setBodyTouched(true);
    setDirty(true);
    setError(null);
    setTested(false);
  }

  // Live audience count, debounced, only for a valid trigger.
  const debouncedDraft = useDebounce(draft, 350);
  const audienceKey = debouncedDraft
    ? [
        debouncedDraft.kind,
        debouncedDraft.inactive_days,
        debouncedDraft.reward_waiting_days,
        debouncedDraft.birthday_days_before,
        debouncedDraft.opt_in_only,
        debouncedDraft.template_id,
      ]
    : [];
  const audience = useQuery({
    queryKey: ["messaging", "audience", businessId, ...audienceKey],
    queryFn: () =>
      getAudienceCount(businessId!, {
        kind: debouncedDraft!.kind,
        inactive_days: debouncedDraft!.kind === "inactive" ? debouncedDraft!.inactive_days : undefined,
        reward_waiting_days:
          debouncedDraft!.kind === "reward_waiting" ? debouncedDraft!.reward_waiting_days : undefined,
        birthday_days_before:
          debouncedDraft!.kind === "birthday" ? debouncedDraft!.birthday_days_before : undefined,
        opt_in_only: debouncedDraft!.opt_in_only,
        template_id: debouncedDraft!.template_id ?? undefined,
      }),
    enabled: !!businessId && !!debouncedDraft && triggerValid(debouncedDraft),
    staleTime: 10_000,
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ["automations", businessId] });
    queryClient.invalidateQueries({ queryKey: ["automation", businessId] });
    queryClient.invalidateQueries({ queryKey: ["messaging", "summary", businessId] });
  };

  const save = useMutation({
    // activate: true turns the rule on, false saves it off, undefined leaves
    // the on/off state exactly as it is (the header switch owns it).
    mutationFn: async ({ activate }: { activate?: boolean }) => {
      const payload = toPayload(draft!);
      if (isNew) {
        return createAutomation(businessId!, { ...payload, is_active: activate ?? false });
      }
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
    onSuccess: () => {
      invalidate();
      navigate("/dashboard/messages", { state: { flash: t("messaging.editor.saved") } });
    },
    onError: (e) => setError(messagingErrorMessage(e, t, lang)),
  });

  const test = useMutation({
    mutationFn: () => {
      const d = draft!;
      return sendTestMessage(businessId!, {
        kind: d.kind,
        title: d.title.trim(),
        body: d.body.trim(),
        gift_stamps: d.gift_stamps,
        gift_complete_card: d.gift_complete_card,
        inactive_days: d.kind === "inactive" ? d.inactive_days : null,
        reward_waiting_days: d.kind === "reward_waiting" ? d.reward_waiting_days : null,
        template_id: d.template_id,
      });
    },
    onSuccess: () => {
      setTested(true);
      queryClient.invalidateQueries({ queryKey: ["activity"] });
    },
    onError: (e) => setError(messagingErrorMessage(e, t, lang)),
  });

  const toggleExisting = useMutation({
    mutationFn: (on: boolean) => patchAutomation(businessId!, automationId!, { is_active: on }),
    onSuccess: invalidate,
    onError: (e) => setError(messagingErrorMessage(e, t, lang)),
  });

  const remove = useMutation({
    mutationFn: () => deleteAutomation(businessId!, automationId!),
    onSuccess: () => {
      invalidate();
      navigate("/dashboard/messages", { state: { flash: t("messaging.automations.deleted") } });
    },
    onError: (e) => setError(messagingErrorMessage(e, t, lang)),
  });

  if (!draft) {
    // A rule that failed to load (or was deleted) must not look like an
    // eternal spinner.
    if (recipes.isError || existing.isError) {
      return (
        <div className="flex flex-col items-start gap-4">
          <Notice tone="danger">{t("messaging.errors.generic")}</Notice>
          <Link to="/dashboard/messages" className={ctaClasses("secondary", "sm")}>
            {t("messaging.editor.back")}
          </Link>
        </div>
      );
    }
    return <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>;
  }

  const isActive = existing.data?.is_active ?? false;
  const busy = save.isPending || test.isPending || remove.isPending;
  const ready = draft.name.trim().length > 0 && draft.body.trim().length > 0 && triggerValid(draft);
  const days = daysOf(draft);

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link
            to="/dashboard/messages"
            className={cn(
              "inline-flex min-h-[44px] items-center gap-1 text-sm font-semibold text-ink-muted hover:text-ink",
              focusRing,
            )}
          >
            <ArrowLeft size={15} aria-hidden className="rtl:-scale-x-100" />
            {t("messaging.editor.back")}
          </Link>
          <h1 className="t-h3 text-ink">
            {isNew ? t("messaging.editor.newTitle") : t("messaging.editor.editTitle")}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">{t(`messaging.kinds.${draft.kind}`)}</p>
        </div>
        {!isNew && existing.data && (
          <div className="flex items-center gap-3">
            <Tag tone={isActive ? "ok" : "neutral"}>
              {t(isActive ? "messaging.automations.on" : "messaging.automations.off")}
            </Tag>
            <Toggle
              checked={isActive}
              disabled={toggleExisting.isPending}
              label={t("messaging.automations.switchLabel")}
              onChange={(on) => toggleExisting.mutate(on)}
            />
          </div>
        )}
      </div>

      {!canSend && summary.data && (
        <Notice tone="warn">
          {summary.data.is_pro ? t("messaging.guard.notEnabled") : t("messaging.guard.pro")}{" "}
          {!summary.data.is_pro && (
            <Link
              to="/dashboard/billing"
              className={cn("font-semibold underline hover:no-underline", focusRing)}
            >
              {t("messaging.guard.proLink")}
            </Link>
          )}
        </Notice>
      )}

      {/* WHEN */}
      <Panel className="flex flex-col gap-5 p-5 sm:p-6">
        <label className="flex max-w-xl flex-col gap-1.5">
          <span className="text-sm font-medium text-ink">{t("messaging.editor.name")}</span>
          <input
            type="text"
            dir="auto"
            className={fieldClasses}
            value={draft.name}
            maxLength={60}
            placeholder={t("messaging.editor.namePlaceholder")}
            onChange={(e) => update({ name: e.target.value })}
          />
        </label>

        <div className="flex flex-col gap-3">
          <GroupLabel>{t("messaging.editor.when")}</GroupLabel>

          {draft.kind === "inactive" && (
            <div className="flex flex-col gap-3">
              <span className="text-sm font-medium text-ink">{t("messaging.editor.inactiveDays")}</span>
              <div className="flex flex-wrap items-center gap-3">
                <SegmentedControl
                  label={t("messaging.editor.inactiveDays")}
                  value={customDays ? -1 : draft.inactive_days}
                  options={[
                    ...INACTIVE_PRESETS.map((n) => ({
                      value: n,
                      label: uiDays(n, lang),
                    })),
                    { value: -1, label: t("messaging.editor.customDays") },
                  ]}
                  onChange={(n) => {
                    if (n === -1) setCustomDays(true);
                    else {
                      setCustomDays(false);
                      update({ inactive_days: n });
                    }
                  }}
                />
                {customDays && (
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <span className="sr-only">{t("messaging.editor.customDaysLabel")}</span>
                    <input
                      type="number"
                      min={7}
                      max={365}
                      className={cn(fieldClasses, "w-24")}
                      value={numberValue(draft.inactive_days)}
                      onChange={(e) => update({ inactive_days: parseDays(e.target.value) })}
                    />
                    <span>
                      {inRange(draft.inactive_days, 7, 365)
                        ? uiDays(draft.inactive_days, lang)
                        : t("messaging.errors.inactive_days_range")}
                    </span>
                  </label>
                )}
              </div>
              <Toggle
                checked={draft.repeat_days !== null}
                label={t("messaging.editor.repeat")}
                onChange={(on) => update({ repeat_days: on ? 30 : null })}
              />
              {draft.repeat_days !== null && (
                <label className="flex items-center gap-2 ps-14 text-sm text-ink">
                  <span>{t("messaging.editor.repeatEvery")}</span>
                  <input
                    type="number"
                    min={7}
                    max={365}
                    className={cn(fieldClasses, "w-24")}
                    value={numberValue(draft.repeat_days ?? Number.NaN)}
                    onChange={(e) => update({ repeat_days: parseDays(e.target.value) })}
                  />
                  {draft.repeat_days !== null && !inRange(draft.repeat_days, 7, 365) && (
                    <span className="text-warn">{t("messaging.errors.repeat_days_range")}</span>
                  )}
                </label>
              )}
            </div>
          )}

          {draft.kind === "birthday" && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">{t("messaging.editor.birthdayWhen")}</span>
              <SegmentedControl
                label={t("messaging.editor.birthdayWhen")}
                value={draft.birthday_days_before}
                options={BIRTHDAY_PRESETS.map((n) => ({
                  value: n,
                  label:
                    n === 0
                      ? t("messaging.editor.onTheDay")
                      : t("messaging.editor.daysBefore", { days: uiDays(n, lang) }),
                }))}
                onChange={(n) => update({ birthday_days_before: n })}
              />
            </div>
          )}

          {draft.kind === "reward_waiting" && (
            <div className="flex flex-col gap-2">
              <span className="text-sm font-medium text-ink">
                {t("messaging.editor.rewardWaitingDays")}
              </span>
              <div className="flex flex-wrap items-center gap-3">
                <SegmentedControl
                  label={t("messaging.editor.rewardWaitingDays")}
                  value={customDays ? -1 : draft.reward_waiting_days}
                  options={[
                    ...REWARD_PRESETS.map((n) => ({
                      value: n,
                      label: uiDays(n, lang),
                    })),
                    { value: -1, label: t("messaging.editor.customDays") },
                  ]}
                  onChange={(n) => {
                    if (n === -1) setCustomDays(true);
                    else {
                      setCustomDays(false);
                      update({ reward_waiting_days: n });
                    }
                  }}
                />
                {customDays && (
                  <label className="flex items-center gap-2 text-sm text-ink">
                    <span className="sr-only">{t("messaging.editor.customDaysLabel")}</span>
                    <input
                      type="number"
                      min={1}
                      max={90}
                      className={cn(fieldClasses, "w-24")}
                      value={numberValue(draft.reward_waiting_days)}
                      onChange={(e) => update({ reward_waiting_days: parseDays(e.target.value) })}
                    />
                    <span>
                      {inRange(draft.reward_waiting_days, 1, 90)
                        ? uiDays(draft.reward_waiting_days, lang)
                        : t("messaging.errors.reward_waiting_days_range")}
                    </span>
                  </label>
                )}
              </div>
            </div>
          )}

          <label className="flex max-w-xs flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">{t("messaging.editor.sendHour")}</span>
            <select
              className={fieldClasses}
              value={draft.send_hour_local}
              onChange={(e) => update({ send_hour_local: Number(e.target.value) })}
            >
              {SEND_HOURS.map((h) => (
                <option key={h} value={h}>
                  {formatHour(h)}
                </option>
              ))}
            </select>
          </label>
        </div>
      </Panel>

      {/* WHAT + GIFT + WHO */}
      <Panel className="p-5 sm:p-6">
        <MessageForm
          value={draft}
          onChange={update}
          kind={draft.kind}
          language={language}
          businessName={business?.name ?? ""}
          rewardText={template?.reward_description ?? ""}
          days={days}
          cardColors={{
            background: template?.background_color,
            foreground: template?.foreground_color,
          }}
          templates={templates?.map((tpl) => ({ id: tpl.id!, name: tpl.name }))}
          audience={{
            count: audience.data?.count ?? null,
            loading: audience.isFetching && !audience.data,
          }}
          disabled={busy}
          bodyRef={bodyRef}
        />
      </Panel>

      {/* Actions */}
      <Panel className="flex flex-col gap-4 p-5 sm:p-6">
        {error && <Notice tone="danger">{error}</Notice>}
        {tested && <Notice tone="ok">{t("messaging.editor.tested")}</Notice>}

        <div className="flex flex-wrap items-center gap-3">
          {/* One primary action. For a rule that is already on, saving keeps
              it on (the header switch is where it turns off); for a new or
              paused rule the primary is save-and-turn-on, with save-as-off
              beside it. On Free, save-as-off is the only (primary) action. */}
          {/* Active rule: one save button that never touches on/off — the
              header switch owns that. New or paused: save-and-turn-on (Pro +
              allowlist) next to save-without-turning-on. */}
          {!isNew && isActive ? (
            <button
              type="button"
              disabled={!ready || busy}
              onClick={() => save.mutate({})}
              className={ctaClasses("primary", "sm")}
            >
              {t("messaging.editor.saveChanges")}
            </button>
          ) : (
            <>
              {(canSend || !summary.data) && (
                <button
                  type="button"
                  disabled={!ready || busy}
                  onClick={() => save.mutate({ activate: true })}
                  className={ctaClasses("primary", "sm")}
                >
                  {t("messaging.editor.saveOn")}
                </button>
              )}
              <button
                type="button"
                disabled={!ready || busy}
                onClick={() => save.mutate({ activate: false })}
                className={ctaClasses(canSend || !summary.data ? "secondary" : "primary", "sm")}
              >
                {t("messaging.editor.saveOff")}
              </button>
            </>
          )}
          <button
            type="button"
            disabled={!ready || busy}
            onClick={() => test.mutate()}
            className={ctaClasses("secondary", "sm")}
          >
            {t("messaging.editor.test")}
          </button>
          {!isNew && (
            <span className="ms-auto">
              {confirmDelete ? (
                <span className="inline-flex flex-wrap items-center gap-2 text-sm text-ink-muted">
                  <span>{t("messaging.editor.deleteConfirm")}</span>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => remove.mutate()}
                    className={cn("font-semibold text-danger underline hover:no-underline", focusRing)}
                  >
                    {t("messaging.editor.deleteYes")}
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmDelete(false)}
                    className={cn("font-semibold underline hover:no-underline", focusRing)}
                  >
                    {t("messaging.editor.cancel")}
                  </button>
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmDelete(true)}
                  className={cn(
                    "inline-flex min-h-[44px] items-center text-sm font-semibold text-ink-muted underline hover:no-underline",
                    focusRing,
                  )}
                >
                  {t("messaging.editor.delete")}
                </button>
              )}
            </span>
          )}
        </div>
      </Panel>
    </div>
  );
}
