import { useRef, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { focusRing } from "../marketing/primitives";
import {
  GroupLabel,
  Notice,
  SegmentedControl,
  Toggle,
  fieldClasses,
} from "../dashboard/primitives";
import { NotificationPreview } from "./NotificationPreview";
import {
  findUnknownPlaceholders,
  insertAtCaret,
  mentionsGift,
  placeholdersFor,
  renderMessage,
  sampleContext,
  type MessageKind,
  type MessageLanguage,
  type PlaceholderKey,
} from "../../lib/messageTemplate";
import { cn } from "../../lib/cn";

/** Product limits, mirrored from the backend's MESSAGING_* defaults. The
 * API is the real gate (422 automation_invalid); these keep the counters
 * honest while typing. */
export const MESSAGE_LIMITS = { title: 40, body: 160, gift: 12 } as const;
const GIFT_CHOICES = [1, 2, 3] as const;

export interface MessageDraft {
  title: string;
  body: string;
  gift_stamps: number;
  gift_complete_card: boolean;
  opt_in_only: boolean;
  template_id: string | null;
}

export interface AudienceState {
  count: number | null;
  loading: boolean;
}

/**
 * WHAT + GIFT + WHO — the three sections a rule and a broadcast share.
 * Controlled: the page owns the draft and persistence; this only renders and
 * patches. The live preview renders for a sample customer in the card's
 * language, exactly as the backend's test-send does, so what the owner sees
 * on screen and on their phone agree.
 */
export function MessageForm({
  value,
  onChange,
  kind,
  language,
  businessName,
  rewardText,
  days,
  cardColors,
  templates,
  audience,
  disabled,
  bodyRef,
}: {
  value: MessageDraft;
  onChange: (patch: Partial<MessageDraft>) => void;
  kind: MessageKind;
  language: MessageLanguage;
  businessName: string;
  rewardText: string;
  /** The rule's N days, for the sample `{ימים}`. */
  days?: number | null;
  cardColors?: { background?: string | null; foreground?: string | null };
  /** More than one card design → a scope picker appears. */
  templates?: { id: string; name: string }[];
  audience?: AudienceState;
  disabled?: boolean;
  bodyRef?: RefObject<HTMLTextAreaElement>;
}) {
  const { t } = useTranslation();
  const ownBodyRef = useRef<HTMLTextAreaElement>(null);
  const textarea = bodyRef ?? ownBodyRef;
  const titleRef = useRef<HTMLInputElement>(null);
  const lastFocused = useRef<"title" | "body">("body");

  const context = sampleContext(language, {
    business: businessName,
    reward: rewardText,
    kind,
    days,
  });
  const previewTitle = renderMessage(value.title.trim() || businessName, context);
  const previewBody = renderMessage(value.body, context);
  const unknown = [
    ...findUnknownPlaceholders(value.title, kind),
    ...findUnknownPlaceholders(value.body, kind),
  ];
  const hasGift = value.gift_stamps > 0 || value.gift_complete_card;
  const giftMismatch = !hasGift && mentionsGift(value.body);

  // A chip that cannot fit in the focused field is disabled, not silently
  // ignored (worst case: a space + token + space on top of the current text).
  function chipFits(token: string): boolean {
    const field = lastFocused.current;
    const current = field === "title" ? value.title : value.body;
    const max = field === "title" ? MESSAGE_LIMITS.title : MESSAGE_LIMITS.body;
    return current.length + token.length + 2 <= max;
  }

  function insert(token: string) {
    const target = lastFocused.current === "title" ? titleRef.current : textarea.current;
    const field: "title" | "body" = lastFocused.current;
    const current = field === "title" ? value.title : value.body;
    const { text, caret } = insertAtCaret(
      current,
      token,
      target?.selectionStart ?? null,
      target?.selectionEnd ?? null,
    );
    const max = field === "title" ? MESSAGE_LIMITS.title : MESSAGE_LIMITS.body;
    if (text.length > max) {
      target?.focus();
      return;
    }
    onChange({ [field]: text } as Partial<MessageDraft>);
    // Put the caret after the token once React has re-rendered the value.
    requestAnimationFrame(() => {
      target?.focus();
      target?.setSelectionRange(caret, caret);
    });
  }

  const chips = placeholdersFor(kind, language);
  const languageName = t(language === "EN" ? "messaging.editor.languageEN" : "messaging.editor.languageHE");

  return (
    <div className="flex flex-col gap-6">
      {/* WHAT */}
      <section className="flex flex-col gap-3">
        <GroupLabel>{t("messaging.editor.what")}</GroupLabel>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)] lg:items-start">
          <div className="flex flex-col gap-3">
            <label className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
                <span>{t("messaging.editor.titleLabel")}</span>
                <span className="font-mono text-xs tabular-nums text-ink-subtle">
                  {t("messaging.editor.chars", {
                    used: value.title.length,
                    max: MESSAGE_LIMITS.title,
                  })}
                </span>
              </span>
              <input
                ref={titleRef}
                type="text"
                dir="auto"
                className={fieldClasses}
                value={value.title}
                maxLength={MESSAGE_LIMITS.title}
                placeholder={t("messaging.editor.titlePlaceholder")}
                disabled={disabled}
                onFocus={() => (lastFocused.current = "title")}
                onChange={(e) => onChange({ title: e.target.value })}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between gap-3 text-sm font-medium text-ink">
                <span>{t("messaging.editor.body")}</span>
                <span
                  className={cn(
                    "font-mono text-xs tabular-nums",
                    value.body.length >= MESSAGE_LIMITS.body ? "text-warn" : "text-ink-subtle",
                  )}
                >
                  {t("messaging.editor.chars", {
                    used: value.body.length,
                    max: MESSAGE_LIMITS.body,
                  })}
                </span>
              </span>
              <textarea
                ref={textarea}
                dir="auto"
                rows={4}
                className={cn(fieldClasses, "resize-y leading-relaxed")}
                value={value.body}
                maxLength={MESSAGE_LIMITS.body}
                placeholder={t("messaging.editor.bodyPlaceholder")}
                disabled={disabled}
                onFocus={() => (lastFocused.current = "body")}
                onChange={(e) => onChange({ body: e.target.value })}
              />
            </label>

            {/* Placeholder chips: the only realistic way to type a brace
                token on a phone keyboard. They insert the spelling of the
                card's language at the caret of whichever field was last
                focused. */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs text-ink-subtle">{t("messaging.editor.insert")}</span>
              {chips.map((chip) => (
                <button
                  key={chip.key}
                  type="button"
                  disabled={disabled || !chipFits(chip.token)}
                  onClick={() => insert(chip.token)}
                  className={cn(
                    "inline-flex min-h-[44px] items-center gap-1.5 rounded-full border border-border bg-surface px-3 text-xs font-medium text-ink hover:border-ink-subtle hover:bg-background",
                    focusRing,
                  )}
                >
                  <span>{t(`messaging.editor.chip.${chip.key satisfies PlaceholderKey}`)}</span>
                  <span className="font-mono text-ink-subtle" dir="ltr">
                    {chip.token}
                  </span>
                </button>
              ))}
            </div>

            {unknown.length > 0 && (
              <Notice tone="warn">
                {t("messaging.editor.unknownPlaceholder", { token: unknown.join(" ") })}
              </Notice>
            )}
            <p className="text-xs text-ink-subtle">
              {t("messaging.editor.languageHint", { language: languageName })}
            </p>
          </div>

          <NotificationPreview
            appName={businessName}
            title={value.title.trim() ? previewTitle : ""}
            body={previewBody}
            backgroundColor={cardColors?.background}
            foregroundColor={cardColors?.foreground}
          />
        </div>
      </section>

      {/* GIFT */}
      <section className="flex flex-col gap-3">
        <GroupLabel>{t("messaging.editor.gift")}</GroupLabel>
        <Toggle
          checked={hasGift}
          disabled={disabled}
          label={t("messaging.editor.giftToggle")}
          description={t("messaging.editor.giftExplain")}
          onChange={(on) =>
            onChange(on ? { gift_stamps: 1 } : { gift_stamps: 0, gift_complete_card: false })
          }
        />
        {hasGift && (
          <div className="flex flex-col gap-3 ps-14">
            <SegmentedControl
              label={t("messaging.editor.giftCount")}
              value={value.gift_complete_card ? 0 : value.gift_stamps}
              options={[
                ...GIFT_CHOICES.map((n) => ({
                  value: n as number,
                  label: t("messaging.describe.gift", { count: n }),
                })),
                { value: 0, label: t("messaging.editor.giftFull") },
              ]}
              onChange={(n) =>
                onChange(
                  n === 0
                    ? { gift_stamps: 0, gift_complete_card: true }
                    : { gift_stamps: n, gift_complete_card: false },
                )
              }
            />
          </div>
        )}
        {giftMismatch && <Notice tone="warn">{t("messaging.editor.giftMismatch")}</Notice>}
      </section>

      {/* WHO */}
      <section className="flex flex-col gap-3">
        <GroupLabel>{t("messaging.editor.who")}</GroupLabel>
        <p className="text-sm text-ink-muted">
          {audience?.loading ? (
            <span className="font-mono text-ink-subtle">{t("common.loading")}</span>
          ) : audience?.count === 0 ? (
            kind === "broadcast"
              ? t("messaging.editor.audienceZeroNow")
              : t("messaging.editor.audienceZero")
          ) : audience?.count != null ? (
            kind === "broadcast" ? (
              t("messaging.editor.audience", { count: audience.count })
            ) : (
              t("messaging.editor.audienceToday", { matching: audience.count })
            )
          ) : (
            t("messaging.editor.audienceNote")
          )}
        </p>
        <Toggle
          checked={value.opt_in_only}
          disabled={disabled}
          label={t("messaging.editor.optInOnly")}
          onChange={(on) => onChange({ opt_in_only: on })}
        />
        {templates && templates.length > 1 && (
          <label className="flex max-w-xs flex-col gap-1.5">
            <span className="text-sm font-medium text-ink">{t("messaging.editor.scopeLabel")}</span>
            <select
              className={fieldClasses}
              value={value.template_id ?? ""}
              disabled={disabled}
              onChange={(e) => onChange({ template_id: e.target.value || null })}
            >
              <option value="">{t("messaging.editor.scopeAll")}</option>
              {templates.map((tpl) => (
                <option key={tpl.id} value={tpl.id}>
                  {tpl.name}
                </option>
              ))}
            </select>
          </label>
        )}
      </section>
    </div>
  );
}
