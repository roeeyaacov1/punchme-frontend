import { useId, useRef, useState, type ReactNode, type RefObject } from "react";
import { useTranslation } from "react-i18next";
import { Plus, TriangleAlert } from "lucide-react";
import { Button, Field, LitPanel, RadioGroup, Select, Switch, Textarea, useReducedMotion } from "../kit";
import { fieldBox } from "../kit/classes";
import {
  insertAtCaret,
  placeholdersFor,
  type MessageKind,
  type MessageLanguage,
  type PlaceholderKey,
} from "../../lib/messageTemplate";
import { cn } from "../../lib/cn";
import { MESSAGE_LIMITS } from "./limits";
import { GIFT_CHOICES, giftChoiceOf, giftPatch, hasGift, messageProblems, type MessageDraft } from "./messageDraft";

/**
 * A panel under its own heading: one part of the message being written. On a
 * phone its sides hold at 20px as the text grows, so large text grows the
 * words rather than the air beside them.
 */
export function FieldSection({ title, children }: { title: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <LitPanel as="section" aria-labelledby={id} className="flex flex-col gap-5 p-5 sm:p-6 max-sm:px-[min(1.25rem,20px)]">
      <h2 id={id} className="type-card-title text-ink">
        {title}
      </h2>
      {children}
    </LitPanel>
  );
}

/**
 * What a broadcast and a rule share: the message, its gift, and who it is
 * kept to, each a section under its own heading. Controlled: the page owns
 * the draft and keeps it; this only draws and patches it.
 *
 * The chips put the card's own spelling of a placeholder at the caret of
 * whichever field was last in focus, because a brace is hard to type on a
 * phone. Whatever the send would refuse (a placeholder nobody knows, one a
 * broadcast can't carry) is said under the field it's in, as an error; a gift
 * the text promises while the gift is off is said as a warning, since it
 * still sends.
 */
export function MessageFields({
  value,
  onChange,
  kind,
  language,
  rewardText,
  templates,
  optInAvailable,
  disabled,
  before,
  titleInputRef,
}: {
  value: MessageDraft;
  onChange: (patch: Partial<MessageDraft>) => void;
  kind: MessageKind;
  language: MessageLanguage;
  /** The card's reward, to say what a full card is. */
  rewardText: string;
  /** More than one card design: a scope picker appears. */
  templates?: { id: string; name: string }[];
  /** False while more than one customer holds the card design: a send is
   * published to the whole design, so it can't keep to those who opted in. */
  optInAvailable: boolean;
  disabled?: boolean;
  /** A section of the page's own to stand first, such as a rule's "When". */
  before?: ReactNode;
  /** The title field, for a page that sends focus back to the start. */
  titleInputRef?: RefObject<HTMLInputElement>;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  // The gift's choices light on when a hand opens them (240ms, or the gentle
  // 150ms fade), never with the page or a draft brought back.
  const [giftOpened, setGiftOpened] = useState(false);
  const ownTitleRef = useRef<HTMLInputElement>(null);
  const titleRef = titleInputRef ?? ownTitleRef;
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const lastFocused = useRef<"title" | "body">("body");
  const problems = messageProblems(value, kind);
  const languageName = t(language === "EN" ? "messaging.editor.languageEN" : "messaging.editor.languageHE");

  const limitOf = (field: "title" | "body") => (field === "title" ? MESSAGE_LIMITS.title : MESSAGE_LIMITS.body);
  // A chip that can't fit in the field is disabled rather than ignored: the
  // worst case is a space, the token and a space on top of what is there.
  const fits = (token: string) => {
    const field = lastFocused.current;
    return value[field].length + token.length + 2 <= limitOf(field);
  };
  function insert(token: string) {
    const field = lastFocused.current;
    const target = field === "title" ? titleRef.current : bodyRef.current;
    const { text, caret } = insertAtCaret(value[field], token, target?.selectionStart ?? null, target?.selectionEnd ?? null);
    if (text.length > limitOf(field)) {
      target?.focus();
      return;
    }
    onChange({ [field]: text } as Partial<MessageDraft>);
    // The caret after the token, once the new text is in the field.
    requestAnimationFrame(() => {
      target?.focus();
      target?.setSelectionRange(caret, caret);
    });
  }

  const refused = (unknown: string[], unsupported: string[]) => {
    if (unknown.length > 0) return t("messaging.editor.unknownPlaceholder", { token: unknown.join(" ") });
    if (unsupported.length > 0) return t("messaging.editor.unsupportedPlaceholder", { token: unsupported.join(" ") });
    return undefined;
  };
  const titleError = refused(problems.titleUnknown, problems.titleUnsupported);
  const bodyError = refused(problems.bodyUnknown, problems.bodyUnsupported);
  const chipsLabel = useId();
  const chips = placeholdersFor(kind, language);

  return (
    <>
      {before}

      <FieldSection title={t("messaging.fields.message")}>
        <Field
          label={t("messaging.editor.titleLabel")}
          error={titleError}
          aside={
            <span aria-hidden dir="ltr" className="type-figure text-sm text-ink-muted">
              {t("messaging.editor.chars", { used: value.title.length, max: MESSAGE_LIMITS.title })}
            </span>
          }
        >
          {({ id, describedBy, invalid }) => (
            <input
              ref={titleRef}
              id={id}
              type="text"
              dir="auto"
              aria-describedby={describedBy}
              aria-invalid={invalid || undefined}
              className={cn(fieldBox, "min-h-12")}
              value={value.title}
              maxLength={MESSAGE_LIMITS.title}
              placeholder={t("messaging.editor.titlePlaceholder")}
              disabled={disabled}
              onFocus={() => (lastFocused.current = "title")}
              onChange={(event) => onChange({ title: event.target.value })}
            />
          )}
        </Field>

        <Textarea
          ref={bodyRef}
          label={t("messaging.editor.body")}
          dir="auto"
          count={t("messaging.editor.chars", { used: value.body.length, max: MESSAGE_LIMITS.body })}
          error={bodyError}
          hint={
            !bodyError && problems.giftMismatch ? (
              <span className="flex items-start gap-1.5 font-semibold text-warn">
                <TriangleAlert aria-hidden className="mt-px size-4 shrink-0" />
                <span>{t("messaging.editor.giftMismatch")}</span>
              </span>
            ) : undefined
          }
          value={value.body}
          maxLength={MESSAGE_LIMITS.body}
          placeholder={t("messaging.editor.bodyPlaceholder")}
          disabled={disabled}
          onFocus={() => (lastFocused.current = "body")}
          onChange={(event) => onChange({ body: event.target.value })}
        />

        <div className="flex flex-col gap-2">
          <p id={chipsLabel} className="type-label text-ink">
            {t("messaging.fields.insert")}
          </p>
          {/* A chip is as wide as its one line wherever that fits. With large
              text on a phone, where it doesn't, its sides hold at 20px and its
              words go under the plus, the placeholder under them: "Customer"
              is 152px at 200%, and beside the plus it had 92px on a 320px
              screen. */}
          <div role="group" aria-labelledby={chipsLabel} className="flex flex-wrap gap-2">
            {chips.map((chip) => (
              <Button
                key={chip.key}
                variant="secondary"
                icon={<Plus aria-hidden />}
                disabled={disabled || !fits(chip.token)}
                // Keep the field's caret: the chip goes where the owner was typing.
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insert(chip.token)}
                className="max-w-full !whitespace-normal text-center max-sm:flex-wrap max-sm:px-[min(1.25rem,20px)]"
              >
                {t(`messaging.editor.chip.${chip.key satisfies PlaceholderKey}`)}
                <span dir="auto" className="font-body font-normal text-ink-muted">
                  {chip.token}
                </span>
              </Button>
            ))}
          </div>
          <p className="text-sm leading-snug text-ink-muted">
            {t("messaging.editor.languageHint", { language: languageName })}
          </p>
        </div>
      </FieldSection>

      {/* No gift on a reward reminder: the cards it goes to are already
          full, so there is nowhere to put one and the send would skip them. */}
      {kind !== "reward_waiting" && (
        <FieldSection title={t("messaging.fields.gift")}>
          <Switch
            checked={hasGift(value)}
            disabled={disabled}
            label={t("messaging.editor.giftToggle")}
            description={t("messaging.editor.giftExplain")}
            onChange={(on) => {
              setGiftOpened(on);
              onChange(giftPatch(on ? "1" : null));
            }}
          />
          {hasGift(value) && (
            <RadioGroup
              className={giftOpened ? (reduced ? "animate-gentle-in" : "animate-lights-on") : undefined}
              legend={t("messaging.editor.giftCount")}
              value={giftChoiceOf(value)}
              onChange={(choice) => onChange(giftPatch(choice))}
              options={GIFT_CHOICES.map((choice) => ({
                value: choice,
                label:
                  choice === "full" ? (
                    <>
                      {t("messaging.fields.giftFull")} (<bdi>{rewardText}</bdi>)
                    </>
                  ) : (
                    t("messaging.fields.giftStamps", { count: Number(choice) })
                  ),
              }))}
            />
          )}
        </FieldSection>
      )}

      <FieldSection title={t("messaging.fields.who")}>
        <Switch
          checked={value.opt_in_only}
          disabled={disabled || !optInAvailable}
          label={t("messaging.editor.optInOnly")}
          description={optInAvailable ? undefined : t("messaging.editor.optInUnavailable")}
          onChange={(on) => onChange({ opt_in_only: on })}
        />
        {templates && templates.length > 1 && (
          <Select
            label={t("messaging.editor.scopeLabel")}
            value={value.template_id ?? ""}
            disabled={disabled}
            onChange={(event) => onChange({ template_id: event.target.value || null })}
            className="sm:max-w-xs"
          >
            <option value="">{t("messaging.editor.scopeAll")}</option>
            {templates.map((template) => (
              <option key={template.id} value={template.id}>
                {template.name}
              </option>
            ))}
          </Select>
        )}
      </FieldSection>
    </>
  );
}
