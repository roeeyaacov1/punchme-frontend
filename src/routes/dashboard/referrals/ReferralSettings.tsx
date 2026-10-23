import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CircleAlert, CircleCheck, Plus } from "lucide-react";
import {
  Button,
  Field,
  Input,
  LitPanel,
  RadioGroup,
  Select,
  Switch,
  WallpaperStage,
  useReducedMotion,
} from "../../../components/kit";
import { fieldBox } from "../../../components/kit/classes";
import type { CardTemplate } from "../../../api/businesses";
import {
  patchReferralProgram,
  putReferralRule,
  type ReferralProgram,
  type ReferralProgramPatch,
  type ReferralRule,
  type ReferralRulePatch,
  type ReferralRules,
} from "../../../api/referrals";
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
} from "../../../lib/referralRules";
import { insertAtCaret } from "../../../lib/messageTemplate";
import { cn } from "../../../lib/cn";
import { referralProblemKey } from "./referralFacts";

const CAP_PERIODS = ["month", "quarter", "year", "lifetime"] as const;
const DISPLAY_MODES = ["none", "first_name", "first_name_initial"] as const;

type Saved = "saved" | { error: unknown } | null;

/** "Saved" in a polite status beside a control, or its refusal under it in
 * a sentence: never at the top of the page, never the API's slug. */
function SaveState({ state }: { state: Saved }) {
  const { t } = useTranslation();
  if (state === "saved") {
    return (
      <p role="status" className="flex items-center gap-1.5 text-sm text-ink-muted">
        <CircleCheck aria-hidden className="size-4 shrink-0 text-ok" />
        {t("referrals.saved")}
      </p>
    );
  }
  if (state) {
    return (
      <p role="alert" className="flex items-start gap-1.5 text-sm font-semibold leading-snug text-danger">
        <CircleAlert aria-hidden className="mt-px size-4 shrink-0" />
        <span>{t(referralProblemKey(state.error))}</span>
      </p>
    );
  }
  return <p role="status" className="sr-only" />;
}

/** A section of the sheet under its own heading. */
function SettingsSection({ title, children }: { title: ReactNode; children: ReactNode }) {
  const id = useId();
  return (
    <section aria-labelledby={id} className="flex flex-col gap-4 border-t border-border pt-5 first:border-t-0 first:pt-0">
      <h2 id={id} className="type-card-title text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}

/**
 * The program's settings, in the sheet "Settings" opens: what each person
 * gets, in the order things happen to a friend; the cap; what the friend
 * is told about who invited them; and both sides as they'll look, in the
 * card's language. Every change saves where it is made and says so beside
 * it. On Free the rows can still be prepared, as messages can.
 */
export function ReferralSettings({
  businessId,
  businessName,
  program,
  rules,
  template,
}: {
  businessId: string;
  businessName: string;
  program: ReferralProgram;
  rules: ReferralRules;
  template: CardTemplate | undefined;
}) {
  const { t } = useTranslation();
  const bySlot = new Map(rules.rules.map((rule) => [slotKey(rule), rule]));
  const reward = template?.reward_description ?? "";

  return (
    <div className="flex flex-col gap-6">
      <SettingsSection title={t("referrals.settings.gets")}>
        <ul className="flex flex-col divide-y divide-border">
          {RULE_SLOTS.map((slot) => {
            const rule = bySlot.get(slotKey(slot));
            return rule ? (
              <RuleSlotRow
                key={slotKey(slot)}
                slot={slot}
                rule={rule}
                placeholders={rules.placeholders}
                reward={reward}
                businessId={businessId}
              />
            ) : null;
          })}
        </ul>
      </SettingsSection>

      <SettingsSection title={t("referrals.settings.cap")}>
        <CapFields program={program} businessId={businessId} />
      </SettingsSection>

      <SettingsSection title={t("referrals.display.label")}>
        <DisplayChoice program={program} businessId={businessId} />
      </SettingsSection>

      <SettingsSection title={t("referrals.preview.title")}>
        <Previews
          program={program}
          rules={rules}
          template={template}
          businessName={businessName}
        />
      </SettingsSection>
    </div>
  );
}

function useSaveRule(businessId: string, slot: RuleSlot) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: ReferralRulePatch) => putReferralRule(businessId, slot.event, slot.recipient, patch),
    onSuccess: (saved) =>
      queryClient.setQueryData<ReferralRules>(["referralRules", businessId], (data) =>
        data ? { ...data, rules: data.rules.map((rule) => (slotKey(rule) === slotKey(saved) ? saved : rule)) } : data,
      ),
  });
}

function useSaveProgram(businessId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (patch: ReferralProgramPatch) => patchReferralProgram(businessId, patch),
    onSuccess: (saved) => queryClient.setQueryData(["referralProgram", businessId], saved),
  });
}

/**
 * One row: its condition, a switch named with the condition and the action
 * together, and when it's on, its gift and its message. The switch and the
 * gift save at once; the text saves on its own button, so a half-typed
 * sentence never goes out, and a refetch never wipes a text still being
 * typed.
 */
function RuleSlotRow({
  slot,
  rule,
  placeholders,
  reward,
  businessId,
}: {
  slot: RuleSlot;
  rule: ReferralRule;
  placeholders: { key: string; token: string }[];
  reward: string;
  businessId: string;
}) {
  const { t } = useTranslation();
  const reduced = useReducedMotion();
  const key = slotKey(slot);
  const save = useSaveRule(businessId, slot);
  const [title, setTitle] = useState(rule.title);
  const [body, setBody] = useState(rule.body);
  const [editing, setEditing] = useState(false);
  // The gift and the message light on when the owner switches the row on,
  // as the saved answer brings them, never when the sheet opens.
  const [opened, setOpened] = useState(false);
  const [switchState, setSwitchState] = useState<Saved>(null);
  const [giftState, setGiftState] = useState<Saved>(null);
  const [textState, setTextState] = useState<Saved>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);
  const lastFocused = useRef<"title" | "body">("body");

  // The saved rule is the source of truth, except over a text being typed.
  useEffect(() => {
    if (editing) return;
    setTitle(rule.title);
    setBody(rule.body);
  }, [rule.title, rule.body, editing]);

  const run = (patch: ReferralRulePatch, report: (state: Saved) => void, after?: () => void) => {
    report(null);
    save.mutate(patch, {
      onSuccess: () => {
        report("saved");
        after?.();
      },
      onError: (error) => report({ error }),
    });
  };

  const unknown = [...unknownPlaceholders(title), ...unknownPlaceholders(body)];
  const dirty = title !== rule.title || body !== rule.body;
  const hint = t(`referrals.rows.${key}.hint`, { defaultValue: "" });
  const when = t(`referrals.rows.${key}.when`);

  function insert(token: string) {
    const field = lastFocused.current;
    const target = field === "title" ? titleRef.current : bodyRef.current;
    const current = field === "title" ? title : body;
    const max = field === "title" ? REFERRAL_MESSAGE_LIMITS.title : REFERRAL_MESSAGE_LIMITS.body;
    const { text, caret } = insertAtCaret(current, token, target?.selectionStart ?? null, target?.selectionEnd ?? null);
    if (text.length > max) {
      target?.focus();
      return;
    }
    setEditing(true);
    if (field === "title") setTitle(text);
    else setBody(text);
    requestAnimationFrame(() => {
      target?.focus();
      target?.setSelectionRange(caret, caret);
    });
  }

  return (
    <li className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0">
      <h3 className="type-label text-ink-muted">{when}</h3>
      <div className="flex flex-col gap-1">
        <Switch
          checked={rule.enabled}
          // An empty row can't go on: the API refuses a line with neither a
          // gift nor a text.
          disabled={!rule.enabled && rowIsEmpty({ ...rule, body })}
          label={
            <>
              <span className="sr-only">{when}: </span>
              {t(`referrals.rows.${key}.action`)}
            </>
          }
          description={hint || undefined}
          onChange={(enabled) => {
            setOpened(enabled);
            run({ enabled }, setSwitchState);
          }}
        />
        <SaveState state={switchState} />
      </div>

      {rule.enabled && (
        <div
          className={cn(
            "flex flex-col gap-4 ps-[3.75rem]",
            opened && (reduced ? "animate-gentle-in" : "animate-lights-on"),
          )}
        >
          {slot.gifts && (
            <div className="flex flex-col gap-1">
              <RadioGroup
                legend={t("referrals.gift.picker")}
                value={String(giftChoice(rule))}
                onChange={(choice) => run(giftPatch(Number(choice)), setGiftState)}
                options={[
                  ...GIFT_CHOICES.map((n) => ({ value: String(n), label: t("referrals.gift.stamps", { count: n }) })),
                  {
                    value: String(FULL_CARD),
                    label: (
                      <>
                        {t("referrals.gift.full")} (<bdi>{reward}</bdi>)
                      </>
                    ),
                  },
                ]}
              />
              <SaveState state={giftState} />
            </div>
          )}

          <Field
            label={t("referrals.message.titleLabel")}
            aside={
              <span aria-hidden dir="ltr" className="type-figure text-sm text-ink-muted">
                {t("referrals.message.chars", { used: title.length, max: REFERRAL_MESSAGE_LIMITS.title })}
              </span>
            }
          >
            {({ id, describedBy, invalid }) => (
              <input
                ref={titleRef}
                id={id}
                dir="auto"
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                className={cn(fieldBox, "min-h-12")}
                value={title}
                maxLength={REFERRAL_MESSAGE_LIMITS.title}
                onFocus={() => (lastFocused.current = "title")}
                onChange={(event) => {
                  setEditing(true);
                  setTitle(event.target.value);
                }}
              />
            )}
          </Field>
          <Field
            label={t("referrals.message.bodyLabel")}
            hint={t(slot.gifts ? "referrals.message.hintGift" : "referrals.message.hintOnly")}
            error={unknown.length > 0 ? t("referrals.message.unknown", { token: unknown.join(" ") }) : undefined}
            aside={
              <span aria-hidden dir="ltr" className="type-figure text-sm text-ink-muted">
                {t("referrals.message.chars", { used: body.length, max: REFERRAL_MESSAGE_LIMITS.body })}
              </span>
            }
          >
            {({ id, describedBy, invalid }) => (
              <textarea
                ref={bodyRef}
                id={id}
                dir="auto"
                rows={3}
                aria-describedby={describedBy}
                aria-invalid={invalid || undefined}
                className={cn(fieldBox, "min-h-24 resize-y py-3 leading-relaxed")}
                value={body}
                maxLength={REFERRAL_MESSAGE_LIMITS.body}
                onFocus={() => (lastFocused.current = "body")}
                onChange={(event) => {
                  setEditing(true);
                  setBody(event.target.value);
                }}
              />
            )}
          </Field>
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("referrals.message.insert")}>
            {placeholders.map((chip) => (
              <Button
                key={chip.key}
                variant="secondary"
                icon={<Plus aria-hidden />}
                onMouseDown={(event) => event.preventDefault()}
                onClick={() => insert(chip.token)}
              >
                {t(`referrals.message.chip.${chip.key}`)}
                <span dir="auto" className="font-body font-normal text-ink-muted">
                  {chip.token}
                </span>
              </Button>
            ))}
          </div>
          {(dirty || textState) && (
            <div className="flex flex-col items-start gap-1">
              {dirty && (
                <Button
                  variant="secondary"
                  busy={save.isPending}
                  disabled={unknown.length > 0 || (!slot.gifts && !body.trim())}
                  onClick={() => run({ title, body }, setTextState, () => setEditing(false))}
                >
                  {t("referrals.message.save")}
                </Button>
              )}
              <SaveState state={textState} />
            </div>
          )}
        </div>
      )}
    </li>
  );
}

/**
 * The cap: two narrow labelled fields, as wide as what they hold, with the
 * sentence they make under them. A number out of 1 to 20 says so under its
 * field instead of quietly reverting.
 */
function CapFields({ program, businessId }: { program: ReferralProgram; businessId: string }) {
  const { t } = useTranslation();
  const save = useSaveProgram(businessId);
  const [text, setText] = useState(String(program.max_rewarded_per_referrer));
  const [state, setState] = useState<Saved>(null);
  useEffect(() => setText(String(program.max_rewarded_per_referrer)), [program.max_rewarded_per_referrer]);
  const value = /^\d+$/.test(text.trim()) ? Number(text.trim()) : Number.NaN;
  const valid = Number.isInteger(value) && value >= 1 && value <= 20;

  const commit = (patch: ReferralProgramPatch) => {
    setState(null);
    save.mutate(patch, { onSuccess: () => setState("saved"), onError: (error) => setState({ error }) });
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-start gap-3">
        <Input
          label={t("referrals.cap.countLabel")}
          inputMode="numeric"
          dir="ltr"
          value={text}
          error={valid ? undefined : t("referrals.errors.max_rewarded_per_referrer")}
          onChange={(event) => setText(event.target.value)}
          onBlur={() => {
            if (valid && value !== program.max_rewarded_per_referrer) commit({ max_rewarded_per_referrer: value });
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") (event.target as HTMLInputElement).blur();
          }}
          // The return key saves the cap, so on a phone it says so.
          enterKeyHint="done"
          className="w-[9rem]"
        />
        <Select
          label={t("referrals.cap.periodLabel")}
          value={program.cap_period}
          onChange={(event) => commit({ cap_period: event.target.value as ReferralProgram["cap_period"] })}
          className="w-[11rem]"
        >
          {CAP_PERIODS.map((period) => (
            <option key={period} value={period}>
              {t(`referrals.cap.period.${period}`)}
            </option>
          ))}
        </Select>
      </div>
      <p className="type-body text-ink">
        {t("referrals.cap.summary", {
          count: valid ? value : program.max_rewarded_per_referrer,
          period: t(`referrals.cap.per.${program.cap_period}`),
        })}
      </p>
      <SaveState state={state} />
    </div>
  );
}

/** What the friend is told about who invited them, saved as it is chosen. */
function DisplayChoice({ program, businessId }: { program: ReferralProgram; businessId: string }) {
  const { t } = useTranslation();
  const save = useSaveProgram(businessId);
  const [state, setState] = useState<Saved>(null);
  return (
    <div className="flex flex-col gap-1">
      <RadioGroup
        legend={t("referrals.display.label")}
        hideLegend
        value={program.referrer_display_mode}
        onChange={(mode) => {
          setState(null);
          save.mutate(
            { referrer_display_mode: mode },
            { onSuccess: () => setState("saved"), onError: (error) => setState({ error }) },
          );
        }}
        options={DISPLAY_MODES.map((mode) => ({ value: mode, label: t(`referrals.display.${mode}`) }))}
      />
      <SaveState state={state} />
    </div>
  );
}

/**
 * Both sides, roughly, in the card's language: the friend's join page in
 * miniature, a picture of the real one (which Phase 8 owns, and which this
 * follows), and a member's message on their lock screen, one at a time.
 */
function Previews({
  program,
  rules,
  template,
  businessName,
}: {
  program: ReferralProgram;
  rules: ReferralRules;
  template: CardTemplate | undefined;
  businessName: string;
}) {
  const { t } = useTranslation();
  const language = rules.language === "EN" ? "EN" : "HE";
  const lng = language === "EN" ? "en" : "he";
  const card = useTranslation(undefined, { lng }).t;
  const names = SAMPLE_NAMES[language];
  const live = rules.rules.filter((rule) => rule.enabled && rule.body.trim());
  const [chosen, setChosen] = useState<string | null>(null);
  const shown = live.find((rule) => slotKey(rule) === chosen) ?? live[0];
  const reward = template?.reward_description ?? "";
  const context = { name: names.name, friend: names.friend, business: businessName, reward };
  const invitedBy =
    program.referrer_display_mode === "first_name"
      ? names.name
      : program.referrer_display_mode === "first_name_initial"
        ? `${names.name[0]}.`
        : "";

  return (
    <div className="flex flex-col gap-5">
      <figure className="flex flex-col gap-2">
        <figcaption className="type-label text-ink">{t("referrals.preview.friendTitle")}</figcaption>
        {/* A picture of the join page: hidden from the accessibility tree,
            which reads the caption and the sentence under it instead. */}
        <LitPanel light="lit" className="flex flex-col items-center gap-3 p-4 text-center" aria-hidden>
          <div lang={lng} dir={language === "EN" ? "ltr" : "rtl"} className="flex w-full flex-col items-center gap-3">
            <div
              className="w-full rounded-2xl px-4 py-4 shadow-panel"
              style={{ backgroundColor: template?.background_color, color: template?.foreground_color }}
            >
              <p className="font-heading text-lg font-medium" dir="auto">
                {businessName}
              </p>
              <p className="text-sm opacity-80" dir="auto">
                {template?.name}
              </p>
            </div>
            <p className="font-heading text-base font-medium text-ink">
              {invitedBy ? card("publicCard.join.invitedBy", { name: invitedBy }) : card("publicCard.join.invited")}
            </p>
            <p className="text-sm text-ink-muted">
              {card("publicCard.card.reward", { stamps: template?.stamps_required ?? 0, reward })}
            </p>
            {/* The join page's own button, drawn as that page draws it. */}
            <span className="grad-cta flex min-h-11 w-full items-center justify-center rounded-full px-5 font-heading text-base font-medium text-white">
              {card("enroll.sendCodeCta")}
            </span>
          </div>
        </LitPanel>
        <p className="text-sm leading-snug text-ink-muted">{t("referrals.preview.roughly")}</p>
      </figure>

      <figure className="flex flex-col gap-3">
        <figcaption className="type-label text-ink">{t("referrals.preview.memberTitle")}</figcaption>
        {shown ? (
          <>
            {live.length > 1 && (
              <Select
                label={t("referrals.preview.which")}
                value={slotKey(shown)}
                onChange={(event) => setChosen(event.target.value)}
              >
                {live.map((rule) => (
                  <option key={slotKey(rule)} value={slotKey(rule)}>
                    {t(`referrals.rows.${slotKey(rule)}.when`)}
                  </option>
                ))}
              </Select>
            )}
            {/* The lock screen without the pass: the page reads no card
                design, and a message needs only the wallpaper it lands on. */}
            <div className="-mx-6 flex justify-center">
              <WallpaperStage
                cardColor={template?.background_color ?? "#2B2521"}
                stampColor={template?.label_color ?? template?.foreground_color ?? "#f67748"}
                foregroundColor={template?.foreground_color}
                notification={{
                  sender: businessName,
                  title: renderPreview(shown.title.trim() || businessName, context),
                  body: renderPreview(shown.body, context),
                }}
                summary={t("referrals.preview.memberSummary", {
                  when: t(`referrals.rows.${slotKey(shown)}.when`),
                })}
              >
                {null}
              </WallpaperStage>
            </div>
            {hasGift(shown) && (
              <p className="text-sm leading-snug text-ink-muted">
                {shown.gift_complete_card
                  ? t("referrals.preview.withFull")
                  : t("referrals.preview.withStamps", { count: shown.gift_stamps })}
              </p>
            )}
          </>
        ) : (
          <p className="type-body text-ink-muted">{t("referrals.preview.nothing")}</p>
        )}
      </figure>
    </div>
  );
}
