import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Handshake } from "lucide-react";
import { listTemplates } from "../../api/businesses";
import { ApiError } from "../../api/errors";
import {
  getReferralProgram,
  listReferralRules,
  listReferrals,
  patchReferralProgram,
  putReferralRule,
  reviewReferral,
  type Referral,
  type ReferralProgram,
  type ReferralProgramPatch,
  type ReferralRule,
  type ReferralRulePatch,
} from "../../api/referrals";
import { useBusiness } from "../../business/useBusiness";
import {
  GroupLabel,
  LitStage,
  Notice,
  Panel,
  PanelHeader,
  SegmentedControl,
  Tag,
  Toggle,
  fieldClasses,
  type Tone,
} from "../../components/dashboard/primitives";
import { ctaClasses, focusRing } from "../../components/marketing/primitives";
import { NotificationPreview } from "../../components/messaging/NotificationPreview";
import { cn } from "../../lib/cn";
import { insertAtCaret } from "../../lib/messageTemplate";
import {
  FULL_CARD,
  GIFT_CHOICES,
  REFERRAL_MESSAGE_LIMITS,
  RULE_SLOTS,
  SAMPLE_NAMES,
  giftChoice,
  giftPatch,
  hasGift,
  renderPreview,
  rowIsEmpty,
  slotKey,
  unknownPlaceholders,
  type RuleSlot,
} from "../../lib/referralRules";

/**
 * Refer a friend — one screen, a sentence per row.
 *
 * The owner is a barber on a phone. So: a switch at the top, four rows
 * that read "when X, [ ] do Y" with a picker and a text behind each, one
 * line for the cap, one for what the friend is told about who invited
 * them, a preview of both sides, and the list of who brought whom with the
 * ones that need a decision on top. Nothing here says event, action,
 * recipient or rule; those are the API's words (lib/referralRules maps the
 * rows to them).
 *
 * Every change saves as it is made — a switch, a picker, a select — except
 * the message text, which saves on its own button so a half-typed sentence
 * never goes out. The API is the real validator; its field slugs are what
 * the error line repeats.
 */

const STATUS_TONE: Record<Referral["status"], Tone> = {
  joined: "accent",
  qualified: "ok",
  completed: "reward",
  rejected: "neutral",
  flagged: "warn",
};

const CAP_PERIODS = ["month", "quarter", "year", "lifetime"] as const;
const DISPLAY_MODES = ["none", "first_name", "first_name_initial"] as const;

export function ReferralsPage() {
  const { t, i18n } = useTranslation();
  const { business } = useBusiness();
  const businessId = business?.id ?? undefined;
  const queryClient = useQueryClient();
  const [error, setError] = useState<string | null>(null);

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
  const referrals = useQuery({
    queryKey: ["referrals", businessId],
    queryFn: () => listReferrals(businessId!),
    enabled: !!businessId,
  });
  // Same query key as the layout and the studio: a cache read on any route
  // but a hard refresh. The first design's reward and colours feed the
  // preview.
  const templates = useQuery({
    queryKey: ["templates", businessId],
    queryFn: () => listTemplates(businessId!),
    enabled: !!businessId,
  });
  const template = templates.data?.[0];

  function explain(err: unknown): string {
    if (err instanceof ApiError) {
      if (err.code === "upgrade_required") return t("referrals.blocked.upgrade_required");
      if (err.code === "referrals_not_enabled") return t("referrals.blocked.not_enabled_for_pilot");
      if (err.code === "referral_rule_invalid" || err.code === "referral_program_invalid") {
        return t("referrals.errors.invalid", { detail: err.message });
      }
    }
    return t("referrals.errors.generic");
  }

  const patchProgram = useMutation({
    mutationFn: (patch: ReferralProgramPatch) => patchReferralProgram(businessId!, patch),
    onSuccess: (data) => {
      setError(null);
      queryClient.setQueryData(["referralProgram", businessId], data);
    },
    onError: (err) => setError(explain(err)),
  });
  const saveRule = useMutation({
    mutationFn: ({ slot, patch }: { slot: RuleSlot; patch: ReferralRulePatch }) =>
      putReferralRule(businessId!, slot.event, slot.recipient, patch),
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["referralRules", businessId] });
    },
    onError: (err) => setError(explain(err)),
  });
  const review = useMutation({
    mutationFn: ({ id, decision }: { id: string; decision: "approve" | "reject" }) =>
      reviewReferral(businessId!, id, decision),
    onSuccess: () => {
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ["referrals", businessId] });
    },
    onError: (err) => setError(explain(err)),
  });

  const settings = program.data;
  const language = rules.data?.language === "EN" ? "EN" : "HE";
  const rulesBySlot = new Map((rules.data?.rules ?? []).map((rule) => [slotKey(rule), rule]));
  const items = referrals.data?.items ?? [];
  const queue = items.filter((row) => row.status === "flagged");
  const rest = items.filter((row) => row.status !== "flagged");
  const busy = patchProgram.isPending || saveRule.isPending;

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 sm:gap-5">
      <div>
        <h1 className="t-h3 text-ink">{t("referrals.title")}</h1>
        <p className="mt-1 text-sm text-ink-muted">{t("referrals.lead")}</p>
      </div>

      {error && <Notice tone="danger">{error}</Notice>}

      {/* The switch */}
      <Panel className="p-4 sm:p-5">
        {settings ? (
          <>
            <Toggle
              checked={settings.enabled}
              disabled={busy || (!settings.enabled && !settings.can_enable)}
              label={t("referrals.master.label")}
              description={t("referrals.master.hint")}
              onChange={(on) => patchProgram.mutate({ enabled: on })}
            />
            {!settings.enabled && !settings.can_enable && (
              <Notice tone="warn" className="mt-3">
                {t(`referrals.blocked.${settings.enable_blocker}`)}{" "}
                {settings.enable_blocker === "upgrade_required" && (
                  <Link
                    to="/dashboard/billing"
                    className={cn(
                      "inline-flex min-h-[44px] items-center align-middle font-semibold underline hover:no-underline",
                      focusRing,
                    )}
                  >
                    {t("referrals.blocked.upgradeCta")}
                  </Link>
                )}
              </Notice>
            )}
          </>
        ) : (
          <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>
        )}
      </Panel>

      {/* The sentences */}
      <Panel className="p-4 sm:p-5">
        <PanelHeader title={t("referrals.rows.title")} hint={t("referrals.rows.hint")} />
        <ul className="divide-y divide-border">
          {RULE_SLOTS.map((slot) => {
            const rule = rulesBySlot.get(slotKey(slot));
            return rule ? (
              <RuleRow
                key={slotKey(slot)}
                slot={slot}
                rule={rule}
                placeholders={rules.data?.placeholders ?? []}
                saving={saveRule.isPending}
                onPatch={(patch) => saveRule.mutate({ slot, patch })}
              />
            ) : null;
          })}
        </ul>
      </Panel>

      {/* The cap, and what the friend is told */}
      {settings && (
        <Panel className="flex flex-col gap-5 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-2 text-sm text-ink">
            <span>{t("referrals.cap.before")}</span>
            <CapInput
              value={settings.max_rewarded_per_referrer}
              disabled={busy}
              onCommit={(n) => patchProgram.mutate({ max_rewarded_per_referrer: n })}
            />
            <span>{t("referrals.cap.between")}</span>
            <select
              aria-label={t("referrals.cap.periodLabel")}
              className={cn(fieldClasses, "w-auto")}
              value={settings.cap_period}
              disabled={busy}
              onChange={(e) =>
                patchProgram.mutate({
                  cap_period: e.target.value as ReferralProgram["cap_period"],
                })
              }
            >
              {CAP_PERIODS.map((period) => (
                <option key={period} value={period}>
                  {t(`referrals.cap.period.${period}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-2">
            <GroupLabel>{t("referrals.display.label")}</GroupLabel>
            <SegmentedControl
              label={t("referrals.display.label")}
              value={settings.referrer_display_mode}
              options={DISPLAY_MODES.map((mode) => ({
                value: mode,
                label: t(`referrals.display.${mode}`),
              }))}
              onChange={(mode) => patchProgram.mutate({ referrer_display_mode: mode })}
            />
          </div>
        </Panel>
      )}

      {/* The preview: both sides */}
      {settings && (
        <Panel className="p-4 sm:p-5">
          <PanelHeader title={t("referrals.preview.title")} hint={t("referrals.preview.hint")} />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <GroupLabel>{t("referrals.preview.friendTitle")}</GroupLabel>
              <FriendPreview
                businessName={business?.name ?? ""}
                templateName={template?.name ?? ""}
                reward={template?.reward_description ?? ""}
                stamps={template?.stamps_required ?? 0}
                colors={{
                  background: template?.background_color,
                  foreground: template?.foreground_color,
                }}
                displayMode={settings.referrer_display_mode}
                language={language}
              />
            </div>
            <div className="flex flex-col gap-2">
              <GroupLabel>{t("referrals.preview.memberTitle")}</GroupLabel>
              <MemberPreview
                rules={[...rulesBySlot.values()]}
                businessName={business?.name ?? ""}
                reward={template?.reward_description ?? ""}
                colors={{
                  background: template?.background_color,
                  foreground: template?.foreground_color,
                }}
                language={language}
              />
            </div>
          </div>
        </Panel>
      )}

      {/* Who brought whom */}
      <Panel className="p-4 sm:p-5">
        <PanelHeader title={t("referrals.list.title")} />
        {queue.length > 0 && (
          <div className="mb-5 flex flex-col gap-3 rounded-xl border border-warn/30 bg-warn-bg p-3 sm:p-4">
            <p className="text-sm font-semibold text-warn">{t("referrals.list.review.title")}</p>
            <ul className="flex flex-col gap-3">
              {queue.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                >
                  <ReferralLine row={row} lang={i18n.resolvedLanguage ?? "he"} />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ id: row.id, decision: "approve" })}
                      className={ctaClasses("primary", "sm")}
                    >
                      {t("referrals.list.review.approve")}
                    </button>
                    <button
                      type="button"
                      disabled={review.isPending}
                      onClick={() => review.mutate({ id: row.id, decision: "reject" })}
                      className={ctaClasses("secondary", "sm")}
                    >
                      {t("referrals.list.review.reject")}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
        {referrals.isLoading ? (
          <p className="font-mono text-sm text-ink-subtle">{t("common.loading")}</p>
        ) : rest.length === 0 && queue.length === 0 ? (
          <p className="text-sm text-ink-muted">{t("referrals.list.empty")}</p>
        ) : (
          <ul className="divide-y divide-border">
            {rest.map((row) => (
              <li key={row.id} className="py-3 first:pt-0 last:pb-0">
                <ReferralLine row={row} lang={i18n.resolvedLanguage ?? "he"} />
              </li>
            ))}
          </ul>
        )}
      </Panel>
    </div>
  );
}

/** "when X, [ ] do Y", with the picker and the text behind the switch. */
function RuleRow({
  slot,
  rule,
  placeholders,
  saving,
  onPatch,
}: {
  slot: RuleSlot;
  rule: ReferralRule;
  placeholders: { key: string; token: string }[];
  saving: boolean;
  onPatch: (patch: ReferralRulePatch) => void;
}) {
  const { t } = useTranslation();
  const key = slotKey(slot);
  const [title, setTitle] = useState(rule.title);
  const [body, setBody] = useState(rule.body);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const lastFocused = useRef<"title" | "body">("body");

  // A saved rule is the source of truth; a refetch resets the draft.
  useEffect(() => {
    setTitle(rule.title);
    setBody(rule.body);
  }, [rule.title, rule.body]);

  const dirty = title !== rule.title || body !== rule.body;
  const unknown = [...unknownPlaceholders(title), ...unknownPlaceholders(body)];
  const empty = rowIsEmpty({ ...rule, body });
  const hint = t(`referrals.rows.${key}.hint`, { defaultValue: "" });

  function insert(token: string) {
    const field = lastFocused.current;
    const target = field === "title" ? titleRef.current : bodyRef.current;
    const current = field === "title" ? title : body;
    const max = field === "title" ? REFERRAL_MESSAGE_LIMITS.title : REFERRAL_MESSAGE_LIMITS.body;
    const { text, caret } = insertAtCaret(
      current,
      token,
      target?.selectionStart ?? null,
      target?.selectionEnd ?? null,
    );
    if (text.length > max) {
      target?.focus();
      return;
    }
    if (field === "title") setTitle(text);
    else setBody(text);
    requestAnimationFrame(() => {
      target?.focus();
      target?.setSelectionRange(caret, caret);
    });
  }

  return (
    <li className="flex flex-col gap-3 py-5 first:pt-0 last:pb-0">
      <p className="t-eyebrow text-ink-subtle">{t(`referrals.rows.${key}.when`)}</p>
      <Toggle
        checked={rule.enabled}
        disabled={saving || (!rule.enabled && empty)}
        label={t(`referrals.rows.${key}.action`)}
        description={hint || undefined}
        onChange={(on) => onPatch({ enabled: on })}
      />
      {rule.enabled && (
        <div className="flex flex-col gap-4 ps-14">
          {slot.gifts && (
            <SegmentedControl
              label={t("referrals.gift.picker")}
              value={giftChoice(rule)}
              options={[
                ...GIFT_CHOICES.map((n) => ({
                  value: n as number,
                  label: t("referrals.gift.stamps", { count: n }),
                })),
                { value: FULL_CARD, label: t("referrals.gift.full") },
              ]}
              onChange={(choice) => onPatch(giftPatch(choice))}
            />
          )}
          <div className="grid gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
                <span>{t("referrals.message.titleLabel")}</span>
                <span className="font-mono text-xs tabular-nums text-ink-subtle">
                  {t("referrals.message.chars", {
                    used: title.length,
                    max: REFERRAL_MESSAGE_LIMITS.title,
                  })}
                </span>
              </span>
              <input
                ref={titleRef}
                type="text"
                dir="auto"
                className={fieldClasses}
                value={title}
                maxLength={REFERRAL_MESSAGE_LIMITS.title}
                onFocus={() => (lastFocused.current = "title")}
                onChange={(e) => setTitle(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
                <span>{t("referrals.message.bodyLabel")}</span>
                <span className="font-mono text-xs tabular-nums text-ink-subtle">
                  {t("referrals.message.chars", {
                    used: body.length,
                    max: REFERRAL_MESSAGE_LIMITS.body,
                  })}
                </span>
              </span>
              <textarea
                ref={bodyRef}
                dir="auto"
                rows={3}
                className={cn(fieldClasses, "resize-y leading-relaxed")}
                value={body}
                maxLength={REFERRAL_MESSAGE_LIMITS.body}
                onFocus={() => (lastFocused.current = "body")}
                onChange={(e) => setBody(e.target.value)}
              />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink-subtle">{t("referrals.message.insert")}</span>
              {placeholders.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  onClick={() => insert(chip.token)}
                  className={cn(
                    "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-ink hover:border-ink-subtle hover:bg-background",
                    focusRing,
                  )}
                >
                  <span>{t(`referrals.message.chip.${chip.key}`)}</span>
                  <span className="font-mono text-ink-subtle" dir="ltr">
                    {chip.token}
                  </span>
                </button>
              ))}
            </div>
            {unknown.length > 0 && (
              <Notice tone="warn">
                {t("referrals.message.unknown", { token: unknown.join(" ") })}
              </Notice>
            )}
            <p className="text-xs text-ink-subtle">
              {t(slot.gifts ? "referrals.message.hintGift" : "referrals.message.hintOnly")}
            </p>
            {dirty && (
              <div>
                <button
                  type="button"
                  disabled={saving || unknown.length > 0 || (!slot.gifts && !body.trim())}
                  onClick={() => onPatch({ title, body })}
                  className={ctaClasses("primary", "sm")}
                >
                  {t("referrals.message.save")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </li>
  );
}

/** The cap number: typed, then committed on blur or Enter, so every
 * keystroke of "12" is not a request that saves "1". */
function CapInput({
  value,
  disabled,
  onCommit,
}: {
  value: number;
  disabled: boolean;
  onCommit: (n: number) => void;
}) {
  const { t } = useTranslation();
  const [draft, setDraft] = useState(String(value));
  useEffect(() => setDraft(String(value)), [value]);

  function commit() {
    const n = Number.parseInt(draft, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 20 && n !== value) onCommit(n);
    else setDraft(String(value));
  }

  return (
    <input
      type="number"
      inputMode="numeric"
      min={1}
      max={20}
      aria-label={t("referrals.cap.countLabel")}
      className={cn(fieldClasses, "w-20 text-center")}
      value={draft}
      disabled={disabled}
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      onKeyDown={(e) => {
        if (e.key === "Enter") (e.target as HTMLInputElement).blur();
      }}
    />
  );
}

/** The friend's landing page in miniature, for a sample member. */
function FriendPreview({
  businessName,
  templateName,
  reward,
  stamps,
  colors,
  displayMode,
  language,
}: {
  businessName: string;
  templateName: string;
  reward: string;
  stamps: number;
  colors: { background?: string | null; foreground?: string | null };
  displayMode: ReferralProgram["referrer_display_mode"];
  language: "HE" | "EN";
}) {
  const { t } = useTranslation();
  const sample = SAMPLE_NAMES[language].name;
  const shown =
    displayMode === "first_name" ? sample : displayMode === "first_name_initial" ? `${sample[0]}.` : "";
  return (
    <LitStage className="p-3 sm:p-4" innerClassName="flex flex-col items-center gap-3 text-center">
      <div
        className="w-full rounded-2xl px-4 py-4 shadow-card"
        style={{ backgroundColor: colors.background ?? undefined, color: colors.foreground ?? undefined }}
      >
        <p className="text-lg font-heading font-bold">{businessName}</p>
        <p className="text-xs font-semibold opacity-80">{templateName}</p>
      </div>
      <p className="text-base font-heading font-bold text-ink">
        {shown ? t("publicCard.join.invitedBy", { name: shown }) : t("publicCard.join.invited")}
      </p>
      <p className="text-xs text-ink-muted">{t("publicCard.card.reward", { stamps, reward })}</p>
      <span className={ctaClasses("gradient", "sm", "pointer-events-none w-full")} aria-hidden>
        {t("enroll.sendCodeCta")}
      </span>
    </LitStage>
  );
}

/** Every message a member could receive, as it would land, with sample
 * names — one banner per switched-on row that carries a text. */
function MemberPreview({
  rules,
  businessName,
  reward,
  colors,
  language,
}: {
  rules: ReferralRule[];
  businessName: string;
  reward: string;
  colors: { background?: string | null; foreground?: string | null };
  language: "HE" | "EN";
}) {
  const { t } = useTranslation();
  const names = SAMPLE_NAMES[language];
  const context = { name: names.name, friend: names.friend, business: businessName, reward };
  const live = rules.filter((rule) => rule.enabled && rule.body.trim());
  if (live.length === 0) {
    return <p className="text-sm text-ink-muted">{t("referrals.preview.nothing")}</p>;
  }
  return (
    <div className="flex flex-col gap-3">
      {live.map((rule) => (
        <div key={slotKey(rule)} className="flex flex-col gap-1">
          <p className="text-xs text-ink-subtle">
            {t(`referrals.rows.${slotKey(rule)}.when`)}
            {hasGift(rule) && (
              <>
                {" · "}
                {rule.gift_complete_card
                  ? t("referrals.gift.full")
                  : t("referrals.gift.stamps", { count: rule.gift_stamps })}
              </>
            )}
          </p>
          <NotificationPreview
            appName={businessName}
            title={renderPreview(rule.title.trim() || businessName, context)}
            body={renderPreview(rule.body, context)}
            backgroundColor={colors.background}
            foregroundColor={colors.foreground}
          />
        </div>
      ))}
    </div>
  );
}

function ReferralLine({ row, lang }: { row: Referral; lang: string }) {
  const { t } = useTranslation();
  const when = new Intl.DateTimeFormat(lang, { dateStyle: "medium" }).format(
    new Date(row.joined_at),
  );
  return (
    <div className="flex min-w-0 items-start gap-3">
      <span
        aria-hidden
        className="mt-0.5 inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary-text"
      >
        <Handshake size={17} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-ink">
          <span>
            {t("referrals.list.line", {
              friend: row.friend_display_name || t("referrals.list.someone"),
              member: row.referrer_display_name || t("referrals.list.someone"),
            })}
          </span>
          <Tag tone={STATUS_TONE[row.status]}>{t(`referrals.list.status.${row.status}`)}</Tag>
        </p>
        <p className="mt-0.5 text-xs text-ink-subtle">
          {when}
          {row.fraud_reason && (
            <>
              {" · "}
              {t(`referrals.list.reason.${row.fraud_reason}`)}
            </>
          )}
        </p>
      </div>
    </div>
  );
}
