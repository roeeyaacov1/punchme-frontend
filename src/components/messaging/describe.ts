import type { TFunction } from "i18next";
import { ApiError } from "../../api/errors";
import type { AutomationOut } from "../../api/messaging";
import { daysPhrase, type MessageLanguage } from "../../lib/messageTemplate";
import { MESSAGE_LIMITS } from "./MessageForm";

/** Day counts are phrased in code, not via plural keys: Hebrew needs
 * "3 ימים" but "30 יום", and Intl's Hebrew plural rules (one/two/other)
 * can't tell those apart. */
export function uiDays(n: number, lang: string): string {
  const language: MessageLanguage = lang.startsWith("he") ? "HE" : "EN";
  return daysPhrase(n, language);
}

/** "10:00" — send hours are whole local hours. */
export function formatHour(hour: number): string {
  return `${String(hour).padStart(2, "0")}:00`;
}

/** A date-time in the UI's locale, short. */
export function formatWhen(iso: string | null | undefined, lang: string): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString(lang, {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** The rule in one breath — "לקוח שלא ביקר 30 יום · ניקוב במתנה · בשעה 10:00". */
export function describeAutomation(a: AutomationOut, t: TFunction, lang: string): string[] {
  const parts: string[] = [];
  if (a.kind === "inactive") {
    parts.push(t("messaging.describe.inactive", { days: uiDays(a.inactive_days ?? 0, lang) }));
    if (a.repeat_days) {
      parts.push(t("messaging.describe.repeat", { days: uiDays(a.repeat_days, lang) }));
    }
  } else if (a.kind === "birthday") {
    parts.push(
      a.birthday_days_before > 0
        ? t("messaging.describe.birthdayBefore", { days: uiDays(a.birthday_days_before, lang) })
        : t("messaging.describe.birthdayToday"),
    );
  } else if (a.kind === "reward_waiting") {
    parts.push(
      t("messaging.describe.rewardWaiting", { days: uiDays(a.reward_waiting_days ?? 0, lang) }),
    );
  }
  if (a.gift_complete_card) parts.push(t("messaging.describe.giftFull"));
  else if (a.gift_stamps > 0) parts.push(t("messaging.describe.gift", { count: a.gift_stamps }));
  parts.push(t("messaging.describe.at", { hour: formatHour(a.send_hour_local) }));
  if (a.opt_in_only) parts.push(t("messaging.describe.optIn"));
  return parts;
}

/** Turns the API's error into the sentence the owner should read. The
 * backend answers with machine slugs (`automation_invalid` + a detail like
 * `unknown_placeholder:{x}`); everything else is a status/code pair. */
export function messagingErrorMessage(error: unknown, t: TFunction, lang: string): string {
  if (!(error instanceof ApiError)) return t("messaging.errors.generic");
  switch (error.code) {
    case "automation_invalid": {
      const detail = error.message;
      if (detail.startsWith("unknown_placeholder:")) {
        return t("messaging.errors.unknown_placeholder", {
          token: detail.slice("unknown_placeholder:".length),
        });
      }
      if (detail.startsWith("missing_param:")) return t("messaging.errors.missing_param");
      // What the wallet provider cannot address. A message is published to a
      // whole card design, so anything promising a narrower or personalised
      // audience is refused — name which, instead of falling through to
      // "something went wrong" and reading like an outage.
      if (detail.startsWith("placeholder_unsupported:")) {
        return t("messaging.errors.placeholder_unsupported", {
          token: t(`messaging.editor.chip.${detail.slice("placeholder_unsupported:".length)}`),
        });
      }
      if (detail.startsWith("kind_unsupported:")) return t("messaging.errors.kind_unsupported");
      const known = [
        "opt_in_only_unsupported",
        "test_send_would_reach_customers",
        "name_required",
        "name_too_long",
        "title_too_long",
        "body_required",
        "body_too_long",
        "gift_range",
        "inactive_days_range",
        "repeat_days_range",
        "send_hour_range",
        "birthday_days_before_range",
        "reward_waiting_days_range",
        "too_many_automations",
      ];
      if (known.includes(detail)) {
        return t(`messaging.errors.${detail}`, {
          max: detail === "title_too_long" ? MESSAGE_LIMITS.title : MESSAGE_LIMITS.body,
        });
      }
      return t("messaging.errors.generic");
    }
    case "upgrade_required":
      return t("messaging.errors.upgrade");
    case "messaging_not_enabled":
      return t("messaging.errors.notEnabled");
    case "preview_pass_missing":
      return t("messaging.errors.previewMissing");
    case "messaging_unavailable":
      return t("messaging.errors.unavailable");
    case "messaging_quota": {
      const next = error.extra.next_allowed_at ? String(error.extra.next_allowed_at) : "";
      return t("messaging.errors.quota", {
        next: next ? t("messaging.broadcast.nextAllowed", { when: formatWhen(next, lang) }) : "",
      }).trim();
    }
    default:
      return t("messaging.errors.generic");
  }
}
