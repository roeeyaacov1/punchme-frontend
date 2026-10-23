import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Input, RadioGroup, SegmentedControl, Select, Switch, useReducedMotion } from "../../../components/kit";
import { cn } from "../../../lib/cn";
import { FieldSection } from "../../../components/messaging/MessageFields";
import { formatHour, uiDays } from "../../../components/messaging/describe";
import { RULE_RANGES, inRange, type RuleDraft } from "./ruleSentence";

const INACTIVE_PRESETS = ["14", "30", "60", "90"] as const;
const REWARD_PRESETS = ["3", "7", "14"] as const;
const BIRTHDAY_PRESETS = ["0", "1", "3", "7"] as const;
const SEND_HOURS = Array.from({ length: 14 }, (_, i) => 8 + i); // 08:00 … 21:00
const OTHER = "other";

/** A field a choice opens lights on as it appears (240ms, or the gentle
 * 150ms fade with reduced motion): only once a hand has opened it, never
 * with the page or a draft brought back. */
function useOpening(): (opened: boolean) => string | undefined {
  const reduced = useReducedMotion();
  return (opened) => (opened ? (reduced ? "animate-gentle-in" : "animate-lights-on") : undefined);
}

/** A typed number, or NaN while it isn't one: an empty field stays empty
 * rather than becoming a 0 the owner can't delete. */
function parseCount(text: string): number {
  return /^\d+$/.test(text.trim()) ? Number(text.trim()) : Number.NaN;
}

/**
 * A number of days: the usual ones as segments, bare numbers so five fit a
 * phone with the unit in the legend, and "Other" opening a field of its
 * own whose range is said under it.
 */
function DaysChoice({
  legend,
  presets,
  value,
  range,
  rangeError,
  onChange,
}: {
  legend: string;
  presets: readonly string[];
  value: number;
  range: readonly [number, number];
  rangeError: string;
  onChange: (days: number) => void;
}) {
  const { t, i18n } = useTranslation();
  const opening = useOpening();
  const preset = presets.includes(String(value));
  const [other, setOther] = useState(!preset);
  const [picked, setPicked] = useState(false);
  const [text, setText] = useState(preset || !Number.isFinite(value) ? "" : String(value));
  const chosen = other ? OTHER : String(value);
  return (
    <div className="flex flex-col gap-3">
      <SegmentedControl
        label={legend}
        value={chosen}
        onChange={(next) => {
          if (next === OTHER) {
            setOther(true);
            setPicked(true);
            onChange(parseCount(text));
          } else {
            setOther(false);
            onChange(Number(next));
          }
        }}
        options={[
          ...presets.map((n) => ({ value: n, label: <span className="type-figure">{n}</span> })),
          { value: OTHER, label: t("messaging.editor.customDays") },
        ]}
      />
      {other && (
        <Input
          label={t("messaging.editor.customDaysLabel")}
          inputMode="numeric"
          dir="ltr"
          value={text}
          error={inRange(parseCount(text), range) ? undefined : rangeError}
          hint={inRange(parseCount(text), range) ? uiDays(parseCount(text), i18n.resolvedLanguage ?? "he") : undefined}
          onChange={(event) => {
            setText(event.target.value);
            onChange(parseCount(event.target.value));
          }}
          className={cn("max-w-[12rem]", opening(picked))}
        />
      )}
    </div>
  );
}

/**
 * When a rule runs: its trigger, said in the kit's controls, and its hour.
 * A win-back's days and its repeat, a birthday's day, a reward's wait.
 */
export function RuleWhen({ draft, onChange }: { draft: RuleDraft; onChange: (patch: Partial<RuleDraft>) => void }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage ?? "he";
  const opening = useOpening();
  const [repeatText, setRepeatText] = useState(draft.repeat_days === null ? "30" : String(draft.repeat_days));
  const [repeatOpened, setRepeatOpened] = useState(false);

  return (
    <FieldSection title={t("messaging.editor.when")}>
      {draft.kind === "inactive" && (
        <>
          <DaysChoice
            legend={t("messaging.ruleWhen.inactiveDays")}
            presets={INACTIVE_PRESETS}
            value={draft.inactive_days}
            range={RULE_RANGES.inactive_days}
            rangeError={t("messaging.errors.inactive_days_range")}
            onChange={(days) => onChange({ inactive_days: days })}
          />
          <Switch
            checked={draft.repeat_days !== null}
            label={t("messaging.editor.repeat")}
            onChange={(on) => {
              setRepeatOpened(on);
              onChange({ repeat_days: on ? parseCount(repeatText) : null });
            }}
          />
          {draft.repeat_days !== null && (
            <Input
              label={t("messaging.editor.repeatEvery")}
              inputMode="numeric"
              dir="ltr"
              value={repeatText}
              error={inRange(draft.repeat_days, RULE_RANGES.repeat_days) ? undefined : t("messaging.errors.repeat_days_range")}
              hint={
                inRange(draft.repeat_days, RULE_RANGES.repeat_days) ? uiDays(draft.repeat_days, lang) : undefined
              }
              onChange={(event) => {
                setRepeatText(event.target.value);
                onChange({ repeat_days: parseCount(event.target.value) });
              }}
              className={cn("max-w-[12rem]", opening(repeatOpened))}
            />
          )}
        </>
      )}

      {draft.kind === "birthday" && (
        // A list, not segments: "3 days before" doesn't fit a quarter of a phone.
        <RadioGroup
          legend={t("messaging.editor.birthdayWhen")}
          value={String(draft.birthday_days_before)}
          onChange={(next) => onChange({ birthday_days_before: Number(next) })}
          options={[
            ...(BIRTHDAY_PRESETS.includes(String(draft.birthday_days_before) as (typeof BIRTHDAY_PRESETS)[number])
              ? []
              : [String(draft.birthday_days_before)]),
            ...BIRTHDAY_PRESETS,
          ].map((n) => ({
            value: n,
            label: n === "0" ? t("messaging.editor.onTheDay") : t("messaging.editor.daysBefore", { days: uiDays(Number(n), lang) }),
          }))}
        />
      )}

      {draft.kind === "reward_waiting" && (
        <DaysChoice
          legend={t("messaging.ruleWhen.rewardDays")}
          presets={REWARD_PRESETS}
          value={draft.reward_waiting_days}
          range={RULE_RANGES.reward_waiting_days}
          rangeError={t("messaging.errors.reward_waiting_days_range")}
          onChange={(days) => onChange({ reward_waiting_days: days })}
        />
      )}

      <Select
        label={t("messaging.editor.sendHour")}
        value={draft.send_hour_local}
        onChange={(event) => onChange({ send_hour_local: Number(event.target.value) })}
        className="max-w-[12rem]"
      >
        {SEND_HOURS.map((hour) => (
          <option key={hour} value={hour}>
            {formatHour(hour)}
          </option>
        ))}
      </Select>
    </FieldSection>
  );
}
