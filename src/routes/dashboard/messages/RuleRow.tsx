import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { Cake, Gift, Send, TriangleAlert, UserRoundX } from "lucide-react";
import { Switch, focusRingInset, useReducedMotion } from "../../../components/kit";
import { describeAutomation, relativeWhen } from "../../../components/messaging/describe";
import type { AutomationOut } from "../../../api/messaging";
import { cn } from "../../../lib/cn";
import { formatCount } from "../format";
import { ruleName, type Reach, type RuleState } from "./rules";

export const KIND_ICONS = {
  inactive: UserRoundX,
  birthday: Cake,
  reward_waiting: Gift,
} as const;

/**
 * One rule: two controls side by side, never a switch inside a link. The
 * rule is a link to its editor, with its kind's icon, its name (its own
 * direction, two lines before an ellipsis), one line of what it does in
 * words, and one line of where it stands. The switch at the end is named
 * after the rule, its state the switch's own, and a refusal is said under
 * the row that caused it.
 *
 * With large text on a phone, where the rule's longest word can't stand
 * beside the icon and the switch, the switch goes under the row, at the end,
 * and then the words under the icon: at 200% on a 375px screen the icon and
 * the switch had left the words 13px.
 */
export function RuleRow({
  rule,
  state,
  late,
  reach,
  checked,
  disabledReason,
  onToggle,
  problem,
  className,
}: {
  rule: AutomationOut;
  state: RuleState;
  late: boolean;
  reach: Reach | null;
  /** On, as the owner last set it: ahead of the server while a switch is saving. */
  checked: boolean;
  /** Why the switch won't move, beside it; it is disabled when there is one. */
  disabledReason?: string;
  onToggle: (on: boolean) => void;
  problem?: ReactNode;
  className?: string;
}) {
  const { t, i18n } = useTranslation();
  const reduced = useReducedMotion();
  const lang = i18n.resolvedLanguage ?? "he";
  const Icon = KIND_ICONS[rule.kind as keyof typeof KIND_ICONS] ?? Send;
  const name = ruleName(rule, t);
  const count = (value: number) => formatCount(value, lang);
  // The rule's own light: its icon's ink disc comes on with the switch, on
  // the knob's own 200ms in-out (the gentle 150ms with reduced motion), and
  // goes back with it when a switch is refused. A held rule stays unlit.
  const lit = checked && state !== "held";
  const fade = reduced
    ? "transition-opacity duration-gentle ease-out"
    : "transition-opacity duration-move ease-in-out-strong";

  const facts: ReactNode[] = [];
  if (state === "held") {
    facts.push(
      <span key="held" className="inline-flex items-start gap-1 font-semibold text-warn">
        <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
        {t("messaging.rules.held")}
      </span>,
    );
  } else {
    if (state === "off") facts.push(t("messaging.automations.off"));
    else if (late && rule.next_run_at) {
      facts.push(
        <span key="late" className="inline-flex items-start gap-1 font-semibold text-warn">
          <TriangleAlert aria-hidden className="mt-0.5 size-4 shrink-0" />
          {t("messaging.rules.late", { when: relativeWhen(rule.next_run_at, t, lang) })}
        </span>,
      );
    } else if (rule.next_run_at) {
      facts.push(t("messaging.rules.next", { when: relativeWhen(rule.next_run_at, t, lang) }));
    }
    facts.push(
      rule.sent_this_month > 0
        ? t("messaging.rules.sentMonth", { count: rule.sent_this_month, value: count(rule.sent_this_month) })
        : t("messaging.rules.sentNone"),
    );
    if (reach) facts.push(t(`messaging.rules.reach.${reach.when}`, { value: count(reach.count) }));
  }

  return (
    <li className={cn("flex flex-col gap-1 py-2 pe-3 ps-1", className)}>
      <div className="flex flex-wrap items-start gap-2">
        <Link
          to={`/dashboard/messages/automations/${rule.id}`}
          className={cn(
            // A control, like the kit's rows: a long press neither selects
            // the rule's words nor opens the link's callout.
            "group flex min-w-min flex-1 touch-manipulation select-none flex-wrap items-start gap-3 rounded-field px-3 py-2 transition-colors duration-gentle ease-out [-webkit-tap-highlight-color:transparent] [-webkit-touch-callout:none] active:bg-ink/[0.06] hover-fine:bg-ink/5",
            focusRingInset,
          )}
        >
          {/* The disc and the icon's two colours are layers that cross over
              in opacity, so nothing but opacity moves. */}
          <span
            aria-hidden
            className="relative mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-background [&_svg]:size-5"
          >
            <span className={cn("absolute inset-0 rounded-full bg-ink", fade, lit ? "opacity-100" : "opacity-0")} />
            <Icon className={cn("absolute inset-0 m-auto text-ink-muted", fade, lit ? "opacity-0" : "opacity-100")} />
            <Icon className={cn("relative text-surface", fade, lit ? "opacity-100" : "opacity-0")} />
          </span>
          {/* Grows from nothing to its own width, never below its longest
              word: only a word that can't fit beside the icon sends it under. */}
          <span className="flex min-w-min max-w-max flex-1 flex-col gap-0.5">
            <span
              dir="auto"
              className="type-body line-clamp-2 font-semibold text-ink [overflow-wrap:anywhere] [text-align:-webkit-match-parent] [text-align:match-parent]"
            >
              {name}
            </span>
            <span className="text-sm leading-snug text-ink-muted">{describeAutomation(rule, t, lang).join(" · ")}</span>
            <span className="text-sm leading-snug text-ink">
              {facts.map((fact, index) => (
                <span key={index}>
                  {index > 0 && " · "}
                  {fact}
                </span>
              ))}
            </span>
          </span>
        </Link>
        <Switch
          checked={checked}
          onChange={onToggle}
          disabled={!!disabledReason}
          label={<span className="sr-only">{name}</span>}
          description={disabledReason}
          // The reason stands under the switch rather than beside it, so a
          // phone keeps its width for the rule's own words.
          className="ms-auto max-w-[6.5rem] shrink-0 flex-col items-end pt-3 [&>span:last-child]:text-end"
        />
      </div>
      {problem && <div className="ps-16">{problem}</div>}
    </li>
  );
}
